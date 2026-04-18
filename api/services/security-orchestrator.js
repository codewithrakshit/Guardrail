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

  async processCode({ sessionId, code, language, filename, scanOnly = false }) {
    const startTime = Date.now();

    try {
      // Step 1: Store encrypted code in S3
      await this.storage.storeCode(sessionId, code, filename);

      // Step 2: Analyze with AI
      console.log(`[${sessionId}] Analyzing code with AI...`);
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

      // Get all vulnerabilities (new format) or single (old format)
      const allVulns = analysis.all_vulnerabilities || [analysis];
      const vulnerabilityResults = [];

      // Process each vulnerability - just collect info, don't remediate yet
      for (const vuln of allVulns) {
        vulnerabilityResults.push({
          type: vuln.risk_type,
          severity: vuln.severity,
          explanation: vuln.explanation,
          affectedLines: vuln.affected_lines,
          cwe: this.getCWE(vuln.risk_type),
          extractedValue: vuln.extracted_value
        });
      }

      // If scan-only mode, return results without generating patches
      if (scanOnly) {
        await this.sessionManager.updateSession(sessionId, {
          status: 'scanned',
          vulnerabilities_detected: vulnerabilityResults.length
        });

        await this.logger.logScan({
          sessionId,
          status: 'scanned',
          vulnerabilityType: vulnerabilityResults.map(v => v.type).join(', '),
          severity: this.getHighestSeverity(vulnerabilityResults),
          language,
          duration: Date.now() - startTime
        });

        return {
          status: 'vulnerable',
          vulnerabilities: vulnerabilityResults,
          severity: this.getHighestSeverity(vulnerabilityResults),
          patch: {
            available: false,
            message: 'Click "Apply Fix" to generate patches'
          },
          duration: Date.now() - startTime
        };
      }

      // Full remediation flow (when user clicks "Apply Fix")
      return await this.generateRemediation(sessionId, code, language, filename, allVulns, vulnerabilityResults, startTime);

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

  async generateRemediation(sessionId, code, language, filename, allVulns, vulnerabilityResults, startTime) {
    try {
      // Generate remediation strategies and secrets
      for (let i = 0; i < allVulns.length; i++) {
        const vuln = allVulns[i];
        console.log(`[${sessionId}] Generating remediation for ${vuln.risk_type}...`);
        const strategy = await this.remediation.createStrategy(vuln);

        // Create AWS secret if needed
        if (strategy.requiresSecretStorage && vuln.extracted_value) {
          console.log(`[${sessionId}] Creating AWS secret...`);
          const secretRef = await this.secretManager.createSecret({
            sessionId,
            value: vuln.extracted_value,
            type: vuln.risk_type,
            filename
          });
          vulnerabilityResults[i].secretRef = {
            name: secretRef.secretName,
            expiresAt: secretRef.expiresAt
          };
          vulnerabilityResults[i].confidence = strategy.confidence;
        }
      }

      // Generate secure patch for the first/primary vulnerability
      console.log(`[${sessionId}] Generating secure patch...`);
      const primaryVuln = allVulns[0];
      const primaryStrategy = await this.remediation.createStrategy(primaryVuln);
      const primarySecretRef = vulnerabilityResults[0].secretRef;
      
      const patch = await this.patchGenerator.generatePatch({
        originalCode: code,
        analysis: primaryVuln,
        strategy: primaryStrategy,
        secretRef: primarySecretRef ? {
          secretName: primarySecretRef.name,
          expiresAt: primarySecretRef.expiresAt,
          retrievalCode: this.secretManager.generateRetrievalCode(primarySecretRef.name)
        } : null,
        language
      });

      // Store patch in S3
      await this.storage.storePatch(sessionId, patch);

      // Update session status to completed
      const hasSecrets = vulnerabilityResults.some(v => v.secretRef);
      await this.sessionManager.updateSession(sessionId, {
        status: 'completed',
        vulnerabilities_detected: vulnerabilityResults.length,
        secret_created: hasSecrets
      });

      // Log event
      await this.logger.logScan({
        sessionId,
        status: 'vulnerable',
        vulnerabilityType: vulnerabilityResults.map(v => v.type).join(', '),
        severity: this.getHighestSeverity(vulnerabilityResults),
        language,
        secretCreated: hasSecrets,
        confidence: vulnerabilityResults[0].confidence,
        duration: Date.now() - startTime
      });

      return {
        status: 'vulnerable',
        vulnerabilities: vulnerabilityResults,
        severity: this.getHighestSeverity(vulnerabilityResults),
        patch: {
          available: true,
          secretCreated: hasSecrets
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      console.error(`[${sessionId}] Remediation error:`, error);
      throw error;
    }
  }

  getHighestSeverity(vulnerabilities) {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return vulnerabilities.reduce((highest, v) => {
      return severityOrder[v.severity] > severityOrder[highest] ? v.severity : highest;
    }, 'low');
  }

  getCWE(riskType) {
    const cweMap = {
      'hardcoded_secret': 'CWE-798',
      'sql_injection': 'CWE-89',
      'command_injection': 'CWE-78',
      'path_traversal': 'CWE-22',
      'xss': 'CWE-79',
      'weak_crypto': 'CWE-327',
      'insecure_random': 'CWE-330',
      'eval_usage': 'CWE-95',
      'insecure_http': 'CWE-319',
      'unsafe_deserialization': 'CWE-502',
      'permissive_config': 'CWE-732'
    };
    return cweMap[riskType] || 'CWE-Unknown';
  }
}

module.exports = SecurityOrchestrator;
