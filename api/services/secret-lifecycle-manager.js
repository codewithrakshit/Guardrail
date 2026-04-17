/**
 * Secret Lifecycle Manager
 * Handles AWS Secrets Manager with session isolation and TTL
 */

const { SecretsManagerClient, CreateSecretCommand, DeleteSecretCommand } = require('@aws-sdk/client-secrets-manager');

class SecretLifecycleManager {
  constructor() {
   const https = require('https');

this.client = new SecretsManagerClient({
  region: process.env.AWS_REGION || 'us-east-1',
  requestHandler: new (require("@smithy/node-http-handler").NodeHttpHandler)({
    httpsAgent: new https.Agent({
      keepAlive: true,
      family: 4  // FORCE IPv4
    })
  })
});
  }

  async createSecret({ sessionId, value, type, filename }) {
    const timestamp = Date.now();
    const secretName = this.generateSecretName(sessionId, filename, type, timestamp);

    try {
      console.log("---- SECRET DEBUG ----");
console.log("Secret Name:", secretName);
console.log("Secret Name Length:", secretName.length);
console.log("Secret Size (bytes):", Buffer.byteLength(value, 'utf8'));
console.log("----------------------");
      const command = new CreateSecretCommand({
        Name: secretName,
        Description: `GuardRail AI Public - ${type} from ${filename}`,
        SecretString: value,
        Tags: [
          { Key: 'Platform', Value: 'GuardRailAI' },
          { Key: 'SessionId', Value: sessionId },
          { Key: 'Type', Value: type },
          { Key: 'CreatedAt', Value: new Date().toISOString() },
          { Key: 'TTL', Value: '24h' },
          { Key: 'Environment', Value: 'public' }
        ]
      });

      await this.client.send(command);

      console.log(`[${sessionId}] Secret created: ${secretName}`);

      return {
        secretName,
        arn: `arn:aws:secretsmanager:${process.env.AWS_REGION}:*:secret:${secretName}`,
        retrievalCode: this.generateRetrievalCode(secretName),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

    } catch (error) {
  console.error("========== FULL SECRET ERROR ==========");
  console.error(error);
  console.error("=======================================");
  throw error;
}
  }

  generateSecretName(sessionId, filename, type, timestamp) {
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9]/g, '_');
    return `guardrail/public/${sessionId}/${sanitizedFilename}/${timestamp}/${type}`;
  }

  generateRetrievalCode(secretName) {
    return {
      nodejs: `const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

async function getSecret() {
  const client = new SecretsManagerClient({ region: '${process.env.AWS_REGION}' });
  const response = await client.send(new GetSecretValueCommand({
    SecretId: '${secretName}'
  }));
  return response.SecretString;
}`,
      python: `import boto3
from botocore.exceptions import ClientError

def get_secret():
    client = boto3.client('secretsmanager', region_name='${process.env.AWS_REGION}')
    response = client.get_secret_value(SecretId='${secretName}')
    return response['SecretString']`,
      java: `import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient;
import software.amazon.awssdk.services.secretsmanager.model.GetSecretValueRequest;

public String getSecret() {
    SecretsManagerClient client = SecretsManagerClient.builder()
        .region(Region.${process.env.AWS_REGION.toUpperCase().replace('-', '_')})
        .build();
    GetSecretValueRequest request = GetSecretValueRequest.builder()
        .secretId("${secretName}")
        .build();
    return client.getSecretValue(request).secretString();
}`
    };
  }

  async deleteSecret(secretName, sessionId) {
    try {
      const command = new DeleteSecretCommand({
        SecretId: secretName,
        ForceDeleteWithoutRecovery: true
      });

      await this.client.send(command);
      console.log(`[${sessionId}] Secret deleted: ${secretName}`);

    } catch (error) {
      console.error(`[${sessionId}] Secret deletion failed:`, error);
    }
  }
}

module.exports = SecretLifecycleManager;
