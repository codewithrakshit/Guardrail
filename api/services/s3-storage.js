/**
 * S3 Storage Service
 * Handles temporary encrypted storage with TTL
 */

const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

class S3Storage {
  constructor() {
    this.client = new S3Client({ 
      region: process.env.AWS_REGION || 'us-east-1' 
    });
    this.bucket = process.env.S3_BUCKET || 'guardrail-sessions';
  }

  async storeCode(sessionId, code, filename) {
    const key = `sessions/${sessionId}/original/${filename}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: code,
        ServerSideEncryption: 'AES256',
        Metadata: {
          sessionId,
          filename,
          uploadedAt: new Date().toISOString()
        },
        // Set lifecycle rule for 24h TTL
        Tagging: 'TTL=24h&Type=original'
      });

      await this.client.send(command);
      console.log(`[${sessionId}] Code stored in S3: ${key}`);

    } catch (error) {
      console.error(`[${sessionId}] S3 storage failed:`, error);
      throw new Error(`Failed to store code: ${error.message}`);
    }
  }

  async storePatch(sessionId, patch) {
    const key = `sessions/${sessionId}/patch/secure-code.json`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: JSON.stringify(patch, null, 2),
        ContentType: 'application/json',
        ServerSideEncryption: 'AES256',
        Metadata: {
          sessionId,
          createdAt: new Date().toISOString()
        },
        Tagging: 'TTL=24h&Type=patch'
      });

      await this.client.send(command);
      console.log(`[${sessionId}] Patch stored in S3: ${key}`);

    } catch (error) {
      console.error(`[${sessionId}] Patch storage failed:`, error);
      throw new Error(`Failed to store patch: ${error.message}`);
    }
  }

  async getPatch(sessionId) {
    const key = `sessions/${sessionId}/patch/secure-code.json`;

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      const response = await this.client.send(command);
      const body = await response.Body.transformToString();
      return JSON.parse(body);

    } catch (error) {
      console.error(`[${sessionId}] Patch retrieval failed:`, error);
      throw new Error(`Failed to retrieve patch: ${error.message}`);
    }
  }

  async deleteSession(sessionId) {
    const keys = [
      `sessions/${sessionId}/original/`,
      `sessions/${sessionId}/patch/`
    ];

    try {
      for (const keyPrefix of keys) {
        const command = new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: keyPrefix
        });
        await this.client.send(command);
      }

      console.log(`[${sessionId}] Session files deleted from S3`);

    } catch (error) {
      console.error(`[${sessionId}] S3 deletion failed:`, error);
    }
  }
}

module.exports = S3Storage;
