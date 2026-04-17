/**
 * Remediation Strategy Engine
 * Determines fix approach and confidence
 */

class RemediationEngine {
  async createStrategy(analysis) {
    const strategy = {
      fixType: this.determineFixType(analysis.risk_type),
      requiresSecretStorage: false,
      approach: '',
      confidence: 0,
      estimatedTime: 0
    };

    switch (analysis.risk_type) {
      case 'hardcoded_secret':
        strategy.requiresSecretStorage = true;
        strategy.approach = 'Extract secret to AWS Secrets Manager and implement secure runtime retrieval';
        strategy.confidence = 95;
        strategy.estimatedTime = 3;
        break;

      case 'sql_injection':
        strategy.approach = 'Replace with parameterized queries or ORM to prevent injection attacks';
        strategy.confidence = 90;
        strategy.estimatedTime = 2;
        break;

      case 'insecure_http':
        strategy.approach = 'Upgrade to HTTPS protocol for secure data transmission';
        strategy.confidence = 85;
        strategy.estimatedTime = 1;
        break;

      case 'unsafe_deserialization':
        strategy.approach = 'Implement safe deserialization with input validation and type checking';
        strategy.confidence = 80;
        strategy.estimatedTime = 3;
        break;

      case 'permissive_config':
        strategy.approach = 'Apply least-privilege access controls and secure configuration';
        strategy.confidence = 75;
        strategy.estimatedTime = 2;
        break;

      default:
        strategy.approach = 'Manual security review recommended';
        strategy.confidence = 50;
        strategy.estimatedTime = 5;
    }

    return strategy;
  }

  determineFixType(riskType) {
    const fixTypes = {
      'hardcoded_secret': 'secret_extraction',
      'sql_injection': 'code_sanitization',
      'insecure_http': 'protocol_upgrade',
      'unsafe_deserialization': 'input_validation',
      'permissive_config': 'access_control'
    };

    return fixTypes[riskType] || 'manual_review';
  }
}

module.exports = RemediationEngine;
