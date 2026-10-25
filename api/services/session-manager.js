/**
 * Local session lifecycle and persistence.
 */

const {
  ensureDataDirectories,
  sessionFile,
  assertIdentifier,
  writeJsonAtomic,
  readJson
} = require('./local-data');

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

class SessionManager {
  constructor() {
    if (SessionManager.instance) return SessionManager.instance;
    SessionManager.instance = this;
  }

  async createSession({ sessionId, language, filename, clientIp, codeLength }) {
    assertIdentifier(sessionId, 'session ID');
    const now = Date.now();
    const session = {
      session_id: sessionId,
      created_at: new Date(now).toISOString(),
      expires_at: now + SESSION_TTL_MS,
      language,
      filename,
      client_ip: clientIp,
      code_length: codeLength,
      status: 'processing',
      vulnerabilities_detected: 0,
      secret_created: false
    };
    await ensureDataDirectories();
    await writeJsonAtomic(sessionFile(sessionId), session);
    return session;
  }

  async updateSession(sessionId, updates) {
    assertIdentifier(sessionId, 'session ID');
    const existing = await this.getSession(sessionId);
    if (!existing) throw new Error(`Session not found: ${sessionId}`);
    const allowedUpdates = [
      'language', 'filename', 'client_ip', 'code_length', 'status',
      'vulnerabilities_detected', 'secret_created'
    ];
    const safeUpdates = Object.fromEntries(
      Object.entries(updates || {}).filter(([key]) => allowedUpdates.includes(key))
    );
    const updated = { ...existing, ...safeUpdates };
    await writeJsonAtomic(sessionFile(sessionId), updated);
    return updated;
  }

  async getSession(sessionId) {
    assertIdentifier(sessionId, 'session ID');
    const session = await readJson(sessionFile(sessionId));
    if (!session) return null;
    if (typeof session.expires_at !== 'number' || session.expires_at <= Date.now()) {
      return null;
    }
    return session;
  }
}

module.exports = SessionManager;
