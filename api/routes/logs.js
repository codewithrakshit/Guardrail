/**
 * Local session logs and analytics.
 */

const express = require('express');
const router = express.Router();
const EventLogger = require('../services/event-logger');

const eventLogger = new EventLogger();

router.get('/', async (req, res, next) => {
  try {
    const sessionId = req.query.sessionId;
    const logs = sessionId ? await eventLogger.getSessionLogs(sessionId) : await eventLogger.getAllLogs();
    res.json({ logs, totalLogs: logs.length });
  } catch (error) {
    next(error);
  }
});

router.get('/stats', async (req, res, next) => {
  try {
    const logs = await eventLogger.getAllLogs();
    const scans = logs.filter(log => log.event_type === 'scan_complete');
    const stats = {
      totalScans: scans.length,
      vulnerabilitiesFound: scans.filter(log => log.metadata?.vulnerabilityType).length,
      secretsCreated: scans.filter(log => log.metadata?.secretCreated).length,
      averageScanTime: scans.length
        ? Math.round(scans.reduce((sum, log) => sum + Number(log.metadata?.duration || 0), 0) / scans.length)
        : 0,
      severityBreakdown: { critical: 0, high: 0, medium: 0, low: 0 },
      vulnerabilityTypes: {}
    };
    for (const scan of scans) {
      const severity = scan.metadata?.severity;
      if (Object.prototype.hasOwnProperty.call(stats.severityBreakdown, severity)) {
        stats.severityBreakdown[severity]++;
      }
      const types = String(scan.metadata?.vulnerabilityType || '')
        .split(', ').filter(Boolean);
      for (const type of types) {
        stats.vulnerabilityTypes[type] = (stats.vulnerabilityTypes[type] || 0) + 1;
      }
    }
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

router.get('/recent', async (req, res, next) => {
  try {
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 10;
    const logs = await eventLogger.getAllLogs();
    const events = logs.filter(log => log.event_type === 'scan_complete')
      .slice(-limit).reverse().map(log => ({
        sessionId: log.sessionId,
        timestamp: log.timestamp,
        status: log.metadata?.status,
        vulnerabilityType: log.metadata?.vulnerabilityType,
        severity: log.metadata?.severity,
        duration: log.metadata?.duration ?? null
      }));
    res.json({ events });
  } catch (error) {
    next(error);
  }
});

router.get('/:sessionId/errors', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const logs = await eventLogger.getSessionLogs(sessionId);
    const errors = logs.filter(log => log.event_type === 'error').map(log => ({
      timestamp: log.timestamp,
      message: log.message,
      context: log.metadata?.context
    }));
    res.json({ sessionId, errors });
  } catch (error) {
    next(error);
  }
});

router.get('/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const logs = await eventLogger.getSessionLogs(sessionId);
    res.json({ sessionId, logs, totalLogs: logs.length });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
