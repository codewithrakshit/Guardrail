/**
 * Security Orchestrator Service
 * Coordinates the entire security analysis and remediation pipeline
 */

const BedrockClient = require('./bedrock-client');
const RemediationEngine = require('./remediation-engine');
const SecretLifecycleManager = require('./secret-lifecycle-manager');
const PatchGenerator = require('./patch-generator');
const EventLogger = require('./event-logger');
const S3Storage = require('./s3-storage');
const SessionManager = require('./session-manager');

class SecurityOrchestrator {
  constructor() {
    this.bedrock = new BedrockClient();
    this.remediation = new RemediationEngine();
    this.secretManager = new SecretLifecycleManager();
    this.patchGenerator = new PatchGenerator();
    this.logger = new EventLogger();
    this.storage = new S3Storage();
    this.sessionManager = new SessionManager();
  }

  async processCode({ sessionId, code, language, filename }) {
    const startTime = Date.now();

    try {
      // Step 1: Store encrypted code in S3
      await this.storage.storeCode(sessionId, code, filename);

      // Step 2: Analyze with Bedrock
      console.log(`[${sessionId}] Analyzing code with Bedrock...`);
      const analysis = await this.bedrock.analyzeCode({
        code,
        language,
        filename
      });

      if (!analysis.risk_detected) {
        await this.sessionManager.updateSession(sessionId, {
          status: 'completed',
          vulnerabilities_detected: 0
        });

        await this.logger.logScan({
          sessionId,
          status: 'safe',
          language,
          duration: Date.now() - startTime
        });

        return {
          status: 'safe',
          vulnerabilities: [],
          severity: 'none',
          duration: Date.now() - startTime
        };
      }

      // Step 3: Generate remediation strategy
      console.log(`[${sessionId}] Generating remediation strategy...`);
      const strategy = await this.remediation.createStrategy(analysis);

      // Step 4: Create AWS secret if needed
      let secretRef = null;
      if (strategy.requiresSecretStorage) {
        console.log(`[${sessionId}] Creating AWS secret...`);
        secretRef = await this.secretManager.createSecret({
          sessionId,
          value: analysis.extracted_value,
          type: analysis.risk_type,
          filename
        });
      }

      // Step 5: Generate secure patch
      console.log(`[${sessionId}] Generating secure patch...`);
      const patch = await this.patchGenerator.generatePatch({
        originalCode: code,
        analysis,
        strategy,
        secretRef,
        language
      });

      // Step 6: Store patch in S3
      await this.storage.storePatch(sessionId, patch);

      // Step 7: Update session status to completed
      await this.sessionManager.updateSession(sessionId, {
        status: 'completed',
        vulnerabilities_detected: 1,
        secret_created: !!secretRef
      });

      // Step 8: Log event
      await this.logger.logScan({
        sessionId,
        status: 'vulnerable',
        vulnerabilityType: analysis.risk_type,
        severity: analysis.severity,
        language,
        secretCreated: !!secretRef,
        confidence: strategy.confidence,
        duration: Date.now() - startTime
      });

      return {
        status: 'vulnerable',
        vulnerabilities: [{
          type: analysis.risk_type,
          severity: analysis.severity,
          explanation: analysis.explanation,
          affectedLines: analysis.affected_lines,
          cwe: this.getCWE(analysis.risk_type),
          confidence: strategy.confidence
        }],
        severity: analysis.severity,
        patch: {
          available: true,
          secretCreated: !!secretRef
        },
        duration: Date.now() - startTime
      };

    } catch (error) {
      console.error(`[${sessionId}] Orchestration error:`, error);
      
      await this.logger.logError({
        sessionId,
        error: error.message,
        stack: error.stack
      });

      throw error;
    }
  }

  getCWE(riskType) {
    const cweMap = {
      'hardcoded_secret': 'CWE-798',
      'sql_injection': 'CWE-89',
      'insecure_http': 'CWE-319',
      'unsafe_deserialization': 'CWE-502',
      'permissive_config': 'CWE-732'
    };
    return cweMap[riskType] || 'CWE-Unknown';
  }
}

module.exports = SecurityOrchestrator;
