/**
 * Event Logger
 * Comprehensive logging to DynamoDB and CloudWatch with timestamps
 */

const { DynamoDBClient, PutItemCommand, QueryCommand } = require('@aws-sdk/client-dynamodb');
const { 
  CloudWatchLogsClient, 
  PutLogEventsCommand, 
  CreateLogStreamCommand,
  DescribeLogStreamsCommand
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
    this.sequenceTokens = new Map(); // Track sequence tokens per stream
  }

  // Log scan start
  async logScanStart({ sessionId, language, filename, fileSize }) {
    const timestamp = new Date().toISOString();
    
    await this.log({
      sessionId,
      level: 'INFO',
      event: 'scan_started',
      message: `Scan started for ${filename}`,
      metadata: { language, filename, fileSize },
      timestamp
    });
  }

  // Log scan progress
  async logScanProgress({ sessionId, step, details }) {
    const timestamp = new Date().toISOString();
    
    await this.log({
      sessionId,
      level: 'INFO',
      event: 'scan_progress',
      message: `Scan progress: ${step}`,
      metadata: { step, details },
      timestamp
    });
  }

  // Log scan completion
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
    const timestamp = new Date().toISOString();
    const eventId = `${sessionId}-${Date.now()}`;

    const item = {
      event_id: { S: eventId },
      session_id: { S: sessionId },
      timestamp: { S: timestamp },
      event_type: { S: 'scan' },
      status: { S: status },
      language: { S: language },
      scan_duration: { N: String(duration || 0) }
    };

    if (vulnerabilityType) {
      item.vulnerability_type = { S: vulnerabilityType };
      item.severity = { S: severity || 'unknown' };
      item.secret_created = { BOOL: secretCreated || false };
      item.confidence = { N: String(confidence || 0) };
    }

    try {
      await this.dynamodb.send(new PutItemCommand({
        TableName: this.tableName,
        Item: item
      }));

      await this.log({
        sessionId,
        level: status === 'vulnerable' ? 'WARN' : 'INFO',
        event: 'scan_complete',
        message: `Scan completed: ${status}`,
        metadata: {
          status,
          vulnerabilityType,
          severity,
          duration,
          secretCreated,
          confidence
        },
        timestamp
      });

    } catch (error) {
      console.error('Event logging failed:', error);
    }
  }

  // Log fix request
  async logFixRequest({ sessionId, vulnerabilityCount }) {
    const timestamp = new Date().toISOString();
    
    await this.log({
      sessionId,
      level: 'INFO',
      event: 'fix_requested',
      message: `Fix requested for ${vulnerabilityCount} vulnerabilities`,
      metadata: { vulnerabilityCount },
      timestamp
    });
  }

  // Log fix generation
  async logFixGeneration({ sessionId, patchSize, secretsCreated }) {
    const timestamp = new Date().toISOString();
    
    await this.log({
      sessionId,
      level: 'INFO',
      event: 'fix_generated',
      message: 'Security patch generated successfully',
      metadata: { patchSize, secretsCreated },
      timestamp
    });
  }

  // Log errors
  async logError({ sessionId, error, stack, context }) {
    const timestamp = new Date().toISOString();
    const eventId = `${sessionId}-error-${Date.now()}`;

    try {
      await this.dynamodb.send(new PutItemCommand({
        TableName: this.tableName,
        Item: {
          event_id: { S: eventId },
          session_id: { S: sessionId },
          timestamp: { S: timestamp },
          event_type: { S: 'error' },
          error_message: { S: error },
          stack_trace: { S: stack || '' },
          context: { S: context || '' }
        }
      }));

      await this.log({
        sessionId,
        level: 'ERROR',
        event: 'error',
        message: error,
        metadata: { stack, context },
        timestamp
      });

    } catch (err) {
      console.error('Error logging failed:', err);
    }
  }

  // Generic log method
  async log({ sessionId, level, event, message, metadata, timestamp }) {
    const logData = {
      timestamp: timestamp || new Date().toISOString(),
      sessionId,
      level,
      event,
      message,
      metadata: metadata || {}
    };

    // Log to console for debugging
    console.log(`[${logData.level}] [${sessionId}] ${message}`);

    // Log to CloudWatch
    await this.logToCloudWatch(logData);
  }

  // Enhanced CloudWatch logging with sequence token handling
  async logToCloudWatch(data) {
    const streamName = `${data.event || 'general'}/${new Date().toISOString().split('T')[0]}`;

    try {
      // Try to create log stream
      try {
        await this.cloudwatch.send(new CreateLogStreamCommand({
          logGroupName: this.logGroup,
          logStreamName: streamName
        }));
      } catch (err) {
        // Stream already exists, that's fine
      }

      // Get sequence token if we don't have it
      if (!this.sequenceTokens.has(streamName)) {
        try {
          const response = await this.cloudwatch.send(new DescribeLogStreamsCommand({
            logGroupName: this.logGroup,
            logStreamNamePrefix: streamName
          }));
          
          if (response.logStreams && response.logStreams.length > 0) {
            this.sequenceTokens.set(streamName, response.logStreams[0].uploadSequenceToken);
          }
        } catch (err) {
          // Continue without sequence token
        }
      }

      // Prepare log event
      const logEvent = {
        logGroupName: this.logGroup,
        logStreamName: streamName,
        logEvents: [{
          message: JSON.stringify(data),
          timestamp: Date.now()
        }]
      };

      // Add sequence token if we have it
      const sequenceToken = this.sequenceTokens.get(streamName);
      if (sequenceToken) {
        logEvent.sequenceToken = sequenceToken;
      }

      // Send log event
      const response = await this.cloudwatch.send(new PutLogEventsCommand(logEvent));
      
      // Update sequence token for next call
      if (response.nextSequenceToken) {
        this.sequenceTokens.set(streamName, response.nextSequenceToken);
      }

    } catch (error) {
      console.error('CloudWatch logging failed:', error.message);
      // Don't throw - logging failures shouldn't break the app
    }
  }

  // Get logs for a session
  async getSessionLogs(sessionId) {
    try {
      const response = await this.dynamodb.send(new QueryCommand({
        TableName: this.tableName,
        IndexName: 'session_id-timestamp-index',
        KeyConditionExpression: 'session_id = :sid',
        ExpressionAttributeValues: {
          ':sid': { S: sessionId }
        },
        ScanIndexForward: true // Sort by timestamp ascending
      }));

      return response.Items || [];
    } catch (error) {
      console.error('Failed to get session logs:', error);
      return [];
    }
  }
}

module.exports = EventLogger;