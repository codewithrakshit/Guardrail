/**
 * Session Manager
 * Handles session lifecycle and isolation
 */

const { DynamoDBClient, PutItemCommand, GetItemCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');

class SessionManager {
  constructor() {
    this.client = new DynamoDBClient({ 
      region: process.env.AWS_REGION || 'us-east-1' 
    });
    this.tableName = process.env.DYNAMODB_TABLE || 'GuardRailSessions';
  }

  async createSession({ sessionId, language, filename, clientIp, codeLength }) {
    const item = {
      session_id: { S: sessionId },
      created_at: { S: new Date().toISOString() },
      expires_at: { N: String(Date.now() + 24 * 60 * 60 * 1000) },
      language: { S: language },
      filename: { S: filename },
      client_ip: { S: clientIp },
      code_length: { N: String(codeLength) },
      status: { S: 'processing' },
      vulnerabilities_detected: { N: '0' },
      secret_created: { BOOL: false }
    };

    try {
      const command = new PutItemCommand({
        TableName: this.tableName,
        Item: item
      });

      await this.client.send(command);
      console.log(`[${sessionId}] Session created`);

    } catch (error) {
      console.error(`[${sessionId}] Session creation failed:`, error);
      throw new Error(`Failed to create session: ${error.message}`);
    }
  }

  async updateSession(sessionId, updates) {
    try {
      const updateExpression = [];
      const expressionAttributeValues = {};
      const expressionAttributeNames = {};

      Object.entries(updates).forEach(([key, value], index) => {
        const placeholder = `:val${index}`;
        const namePlaceholder = `#attr${index}`;
        updateExpression.push(`${namePlaceholder} = ${placeholder}`);
        expressionAttributeNames[namePlaceholder] = key;
        
        if (typeof value === 'string') {
          expressionAttributeValues[placeholder] = { S: value };
        } else if (typeof value === 'number') {
          expressionAttributeValues[placeholder] = { N: String(value) };
        } else if (typeof value === 'boolean') {
          expressionAttributeValues[placeholder] = { BOOL: value };
        }
      });

      const command = new UpdateItemCommand({
        TableName: this.tableName,
        Key: { session_id: { S: sessionId } },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues
      });

      await this.client.send(command);
      console.log(`[${sessionId}] Session updated`);

    } catch (error) {
      console.error(`[${sessionId}] Session update failed:`, error);
    }
  }

  async getSession(sessionId) {
    try {
      const command = new GetItemCommand({
        TableName: this.tableName,
        Key: { session_id: { S: sessionId } }
      });

      const response = await this.client.send(command);
      
      if (!response.Item) {
        return null;
      }

      return this.unmarshallItem(response.Item);

    } catch (error) {
      console.error(`[${sessionId}] Session retrieval failed:`, error);
      return null;
    }
  }

  unmarshallItem(item) {
    const result = {};
    for (const [key, value] of Object.entries(item)) {
      if (value.S) result[key] = value.S;
      else if (value.N) result[key] = parseFloat(value.N);
      else if (value.BOOL !== undefined) result[key] = value.BOOL;
    }
    return result;
  }
}

module.exports = SessionManager;
