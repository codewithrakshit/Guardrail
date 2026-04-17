/**
 * Logs Route - Analytics and metrics
 */

const express = require('express');
const router = express.Router();
const { DynamoDBClient, ScanCommand, QueryCommand } = require('@aws-sdk/client-dynamodb');

const dynamodb = new DynamoDBClient({ 
  region: process.env.AWS_REGION || 'us-east-1' 
});

/**
 * GET /api/logs/stats
 * Get platform statistics
 */
router.get('/stats', async (req, res, next) => {
  try {
    const tableName = process.env.EVENTS_TABLE || 'GuardRailEvents';

    const command = new ScanCommand({
      TableName: tableName,
      ProjectionExpression: 'vulnerability_type, severity, scan_duration, secret_created'
    });

    const response = await dynamodb.send(command);
    const items = response.Items || [];

    // Calculate statistics
    const stats = {
      totalScans: items.length,
      vulnerabilitiesFound: items.filter(i => i.vulnerability_type).length,
      secretsCreated: items.filter(i => i.secret_created?.BOOL).length,
      averageScanTime: 0,
      severityBreakdown: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      },
      vulnerabilityTypes: {}
    };

    let totalDuration = 0;

    items.forEach(item => {
      // Severity breakdown
      if (item.severity?.S) {
        stats.severityBreakdown[item.severity.S]++;
      }

      // Vulnerability types
      if (item.vulnerability_type?.S) {
        const type = item.vulnerability_type.S;
        stats.vulnerabilityTypes[type] = (stats.vulnerabilityTypes[type] || 0) + 1;
      }

      // Average scan time
      if (item.scan_duration?.N) {
        totalDuration += parseFloat(item.scan_duration.N);
      }
    });

    stats.averageScanTime = items.length > 0 
      ? Math.round(totalDuration / items.length) 
      : 0;

    res.json(stats);

  } catch (error) {
    console.error('Stats retrieval error:', error);
    next(error);
  }
});

/**
 * GET /api/logs/recent
 * Get recent scan events
 */
router.get('/recent', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const tableName = process.env.EVENTS_TABLE || 'GuardRailEvents';

    const command = new ScanCommand({
      TableName: tableName,
      Limit: limit
    });

    const response = await dynamodb.send(command);
    const items = (response.Items || []).map(item => ({
      sessionId: item.session_id?.S,
      timestamp: item.timestamp?.S,
      status: item.status?.S,
      vulnerabilityType: item.vulnerability_type?.S,
      severity: item.severity?.S,
      duration: item.scan_duration?.N ? parseFloat(item.scan_duration.N) : null
    }));

    res.json({ events: items });

  } catch (error) {
    console.error('Recent logs error:', error);
    next(error);
  }
});

module.exports = router;
