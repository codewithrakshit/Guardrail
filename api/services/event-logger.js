/**
 * Structured local JSONL event logger.
 */

const {
  ensureDataDirectories,
  EVENTS_FILE,
  assertIdentifier,
  appendJsonLine,
  readJsonLines
} = require('./local-data');

class EventLogger {
  constructor() {
    if (!global.logCache) global.logCache = new Map();
    this.logCache = global.logCache;
  }

  async logScanStart({ sessionId, language, filename, fileSize }) {
    return this.log({
      sessionId, level: 'INFO', event: 'scan_started',
      message: `Scan started for ${filename}`,
      metadata: { language, filename, fileSize }
    });
  }

  async logScanProgress({ sessionId, step, details }) {
    return this.log({
      sessionId, level: 'INFO', event: 'scan_progress',
      message: `Scan progress: ${step}`, metadata: { step, details }
    });
  }

  async logScan({ sessionId, status, vulnerabilityType, severity, language, secretCreated, confidence, duration, inferenceDurationMs, parsingDurationMs }) {
    return this.log({
      sessionId,
      level: status === 'vulnerable' ? 'WARN' : 'INFO',
      event: 'scan_complete',
      message: `Scan completed: ${status}`,
      metadata: {
        status, vulnerabilityType, severity, language,
        secretCreated: Boolean(secretCreated), confidence, duration, inferenceDurationMs, parsingDurationMs
      }
    });
  }

  async logFixRequest({ sessionId, vulnerabilityCount }) {
    return this.log({
      sessionId, level: 'INFO', event: 'fix_requested',
      message: `Fix requested for ${vulnerabilityCount} vulnerabilities`,
      metadata: { vulnerabilityCount }
    });
  }

  async logFixGeneration({ sessionId, patchSize, secretsCreated, step, vulnerabilityCount, details }) {
    return this.log({
      sessionId, level: 'INFO', event: 'fix_generated',
      message: details || 'Security patch generated successfully',
      metadata: { patchSize, secretsCreated, step, vulnerabilityCount }
    });
  }

  async logError({ sessionId, error, context }) {
    return this.log({
      sessionId, level: 'ERROR', event: 'error',
      message: typeof error === 'string' ? error : 'An error occurred',
      metadata: { context }
    });
  }

  async log({ sessionId, level, event, message, metadata, timestamp }) {
    assertIdentifier(sessionId, 'session ID');
    const record = {
      timestamp: timestamp || new Date().toISOString(),
      sessionId,
      level,
      event_type: event,
      message: typeof message === 'string' ? message : 'Event recorded',
      metadata: metadata || {}
    };
    await ensureDataDirectories();
    await appendJsonLine(EVENTS_FILE, record);
    if (!this.logCache.has(sessionId)) this.logCache.set(sessionId, []);
    this.logCache.get(sessionId).push(record);
    console.log(`[${level}] [${sessionId}] ${record.message}`);
    return record;
  }

  async getAllLogs() {
    return readJsonLines(EVENTS_FILE);
  }

  async getSessionLogs(sessionId) {
    assertIdentifier(sessionId, 'session ID');
    const logs = (await this.getAllLogs()).filter(log => log.sessionId === sessionId);
    this.logCache.set(sessionId, logs);
    return logs;
  }
}

module.exports = EventLogger;
