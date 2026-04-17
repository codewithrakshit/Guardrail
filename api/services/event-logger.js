/**
 * Event Logger
 * Logs all security events to DynamoDB and CloudWatch
 */

const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { 
  CloudWatchLogsClient, 
  PutLogEventsCommand, 
  CreateLogStreamCommand 
} = require('@aws-sdk/client-cloudwatch-logs');

class EventLogger {
  constructor() {
    this.dynamodb = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1'
    });

    this.cloudwatch = new CloudWatchLogsClient({
      region: process.env.AWS_REGION || 'us-east-1'
    });

    this.tableName = process.env.EVENTS_TABLE || 'GuardRailEvents';
    this.logGroup = process.env.LOG_GROUP || '/guardrail-ai/public';
  }

  async logScan({
    sessionId,
    status,
    vulnerabilityType,
    severity,
    language,
    secretCreated,
    confidence,
    duration
  }) {
    const eventId = `${sessionId}-${Date.now()}`;

    const item = {
      event_id: { S: eventId },
      session_id: { S: sessionId },
      timestamp: { S: new Date().toISOString() },
      event_type: { S: 'scan' },
      status: { S: status },
      language: { S: language },
      scan_duration: { N: String(duration) }
    };

    if (vulnerabilityType) {
      item.vulnerability_type = { S: vulnerabilityType };
      item.severity = { S: severity };
      item.secret_created = { BOOL: secretCreated };
      item.confidence = { N: String(confidence) };
    }

    try {
      await this.dynamodb.send(new PutItemCommand({
        TableName: this.tableName,
        Item: item
      }));

      await this.logToCloudWatch({
        level: status === 'vulnerable' ? 'WARN' : 'INFO',
        sessionId,
        event: 'scan_complete',
        status,
        vulnerabilityType,
        severity,
        duration
      });

    } catch (error) {
      console.error('Event logging failed:', error);
    }
  }

  async logError({ sessionId, error, stack }) {
    const eventId = `${sessionId}-error-${Date.now()}`;

    try {
      await this.dynamodb.send(new PutItemCommand({
        TableName: this.tableName,
        Item: {
          event_id: { S: eventId },
          session_id: { S: sessionId },
          timestamp: { S: new Date().toISOString() },
          event_type: { S: 'error' },
          error_message: { S: error },
          stack_trace: { S: stack || '' }
        }
      }));

      await this.logToCloudWatch({
        level: 'ERROR',
        sessionId,
        event: 'error',
        message: error,
        stack
      });

    } catch (err) {
      console.error('Error logging failed:', err);
    }
  }

  async logToCloudWatch(data) {
    const streamName = new Date().toISOString().split('T')[0];

    try {
      // Attempt to create log stream (safe if already exists)
      await this.cloudwatch.send(new CreateLogStreamCommand({
        logGroupName: this.logGroup,
        logStreamName: streamName
      }));
    } catch (err) {
      // Ignore if stream already exists
    }

    try {
      await this.cloudwatch.send(new PutLogEventsCommand({
        logGroupName: this.logGroup,
        logStreamName: streamName,
        logEvents: [{
          message: JSON.stringify(data),
          timestamp: Date.now()
        }]
      }));
    } catch (error) {
      console.error('CloudWatch logging failed:', error);
    }
  }
}

module.exports = EventLogger;