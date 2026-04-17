/**
 * AWS Secret Lifecycle Manager
 * Handles secret creation and retrieval from AWS Secrets Manager
 */

const { SecretsManagerClient, CreateSecretCommand, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

class SecretManager {
  constructor(config) {
    this.client = new SecretsManagerClient({ region: config.region || 'us-east-1' });
    this.projectName = config.projectName || 'default';
  }

  async createSecret({ value, metadata }) {
    const timestamp = Date.now();
    const secretName = this.generateSecretName(metadata.file, metadata.type, timestamp);

    try {
      const command = new CreateSecretCommand({
        Name: secretName,
        Description: `GuardRail AI - ${metadata.type} from ${metadata.file}`,
        SecretString: value,
        Tags: [
          { Key: 'ManagedBy', Value: 'GuardRailAI' },
          { Key: 'SourceFile', Value: metadata.file },
          { Key: 'RiskType', Value: metadata.type },
          { Key: 'CreatedAt', Value: new Date().toISOString() }
        ]
      });

      await this.client.send(command);

      return {
        secretName: secretName,
        arn: `arn:aws:secretsmanager:${this.client.config.region}:*:secret:${secretName}`,
        retrievalCode: this.generateRetrievalCode(secretName)
      };
    } catch (error) {
      throw new Error(`Failed to create secret: ${error.message}`);
    }
  }

  generateSecretName(filePath, type, timestamp) {
    const sanitizedPath = filePath.replace(/[^a-zA-Z0-9]/g, '_');
    return `guardrail/${this.projectName}/${sanitizedPath}/${timestamp}/${type}`;
  }

  generateRetrievalCode(secretName) {
    return {
      nodejs: `const secret = await secretsManager.getSecretValue({ SecretId: '${secretName}' });`,
      python: `secret = secrets_client.get_secret_value(SecretId='${secretName}')`,
      java: `GetSecretValueResponse secret = client.getSecretValue(r -> r.secretId("${secretName}"));`
    };
  }

  async getSecret(secretName) {
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const response = await this.client.send(command);
    return response.SecretString;
  }
}

module.exports = SecretManager;
