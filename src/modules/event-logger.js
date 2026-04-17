/**
 * Event Logging System
 * Logs to DynamoDB and CloudWatch
 */

const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { CloudWatchLogsClient, PutLogEventsCommand } = require('@aws-sdk/client-cloudwatch-logs');

class EventLogger {
  constructor(config) {
    this.dynamodb = new DynamoDBClient({ region: config.region || 'us-east-1' });
    this.cloudwatch = new CloudWatchLogsClient({ region: config.region || 'us-east-1' });
    this.tableName = config.tableName || 'guardrail-events';
    this.logGroup = config.logGroup || '/guardrail-ai/detections';
  }

  async logDetection(event) {
    await Promise.all([
      this.logToDynamoDB(event),
      this.logToCloudWatch(event)
    ]);
  }

  async logToDynamoDB(event) {
    const item = {
      id: { S: `${event.timestamp}-${Math.random().toString(36).substr(2, 9)}` },
      timestamp: { S: event.timestamp },
      file: { S: event.file },
      riskType: { S: event.riskType },
      severity: { S: event.severity },
      fixApplied: { BOOL: event.fixApplied },
      secretCreated: { BOOL: event.secretCreated },
      userAction: { S: event.userAction || 'pending' }
    };

    try {
      const command = new PutItemCommand({
        TableName: this.tableName,
        Item: item
      });
      await this.dynamodb.send(command);
    } catch (error) {
      console.error('DynamoDB logging failed:', error.message);
    }
  }

  async logToCloudWatch(event) {
    const logMessage = JSON.stringify({
      level: 'INFO',
      event: 'security_detection',
      ...event
    });

    try {
      const command = new PutLogEventsCommand({
        logGroupName: this.logGroup,
        logStreamName: new Date().toISOString().split('T')[0],
        logEvents: [{
          message: logMessage,
          timestamp: Date.now()
        }]
      });
      await this.cloudwatch.send(command);
    } catch (error) {
      console.error('CloudWatch logging failed:', error.message);
    }
  }

  async logError(error) {
    await this.logToCloudWatch({
      level: 'ERROR',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = EventLogger;
