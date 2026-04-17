/**
 * Remediation Strategy Engine
 * Determines fix type and generates remediation plan
 */

class RemediationEngine {
  async createStrategy(analysis) {
    const strategy = {
      fixType: this.determineFixType(analysis.risk_type),
      requiresSecretStorage: false,
      extractedSecret: null,
      approach: '',
      confidence: 0
    };

    switch (analysis.risk_type) {
      case 'hardcoded_secret':
        strategy.requiresSecretStorage = true;
        strategy.extractedSecret = analysis.extracted_value;
        strategy.approach = 'Extract secret to AWS Secrets Manager and replace with runtime retrieval';
        strategy.confidence = 95;
        break;

      case 'sql_injection':
        strategy.approach = 'Replace with parameterized query or ORM';
        strategy.confidence = 90;
        break;

      case 'insecure_http':
        strategy.approach = 'Replace HTTP with HTTPS for sensitive endpoints';
        strategy.confidence = 85;
        break;

      case 'unsafe_deserialization':
        strategy.approach = 'Use safe deserialization with validation';
        strategy.confidence = 80;
        break;

      case 'permissive_config':
        strategy.approach = 'Apply least-privilege access controls';
        strategy.confidence = 75;
        break;

      default:
        strategy.approach = 'Manual review required';
        strategy.confidence = 50;
    }

    return strategy;
  }

  determineFixType(riskType) {
    const fixTypes = {
      'hardcoded_secret': 'secret_extraction',
      'sql_injection': 'code_sanitization',
      'insecure_http': 'secure_library_replacement',
      'unsafe_deserialization': 'code_sanitization',
      'permissive_config': 'configuration_hardening'
    };

    return fixTypes[riskType] || 'manual_review';
  }
}

module.exports = RemediationEngine;
