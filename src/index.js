/**
 * GuardRail AI - Main Entry Point
 * Autonomous security remediation system
 */

const SecurityAnalyzer = require('./modules/security-analyzer');
const RemediationEngine = require('./modules/remediation-engine');
const SecretManager = require('./modules/secret-manager');
const CodeRefactor = require('./modules/code-refactor');
const EventLogger = require('./modules/event-logger');

class GuardRailAI {
  constructor(config) {
    this.analyzer = new SecurityAnalyzer(config.bedrock);
    this.remediation = new RemediationEngine();
    this.secretManager = new SecretManager(config.aws);
    this.refactor = new CodeRefactor();
    this.logger = new EventLogger(config.aws);
  }

  async processFileSave(fileData) {
    const startTime = Date.now();
    
    try {
      // Step 1: Security Analysis
      const analysis = await this.analyzer.analyze({
        code: fileData.content,
        language: fileData.language,
        filePath: fileData.path,
        modifiedLines: fileData.diff
      });

      if (!analysis.risk_detected) {
        return { status: 'safe', latency: Date.now() - startTime };
      }

      // Step 2: Generate Remediation Strategy
      const strategy = await this.remediation.createStrategy(analysis);

      // Step 3: Provision AWS Resources (if needed)
      let secretRef = null;
      if (strategy.requiresSecretStorage) {
        secretRef = await this.secretManager.createSecret({
          value: strategy.extractedSecret,
          metadata: {
            file: fileData.path,
            type: analysis.risk_type
          }
        });
      }

      // Step 4: Generate Secure Code
      const patch = await this.refactor.generatePatch({
        originalCode: fileData.content,
        analysis: analysis,
        strategy: strategy,
        secretRef: secretRef
      });

      // Step 5: Log Event
      await this.logger.logDetection({
        timestamp: new Date().toISOString(),
        file: fileData.path,
        riskType: analysis.risk_type,
        severity: analysis.severity,
        fixApplied: false,
        secretCreated: !!secretRef
      });

      return {
        status: 'risk_detected',
        analysis: analysis,
        patch: patch,
        latency: Date.now() - startTime
      };

    } catch (error) {
      await this.logger.logError(error);
      return { status: 'error', message: error.message };
    }
  }
}

module.exports = GuardRailAI;
