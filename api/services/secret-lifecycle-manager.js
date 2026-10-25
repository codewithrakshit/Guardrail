/**
 * Explicitly local-only secret provider.
 *
 * This is not equivalent to a managed secrets vault. It is used only by the
 * optional remediation flow and stores restrictive-permission local JSON.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const {
  DATA_DIR,
  ensureDataDirectories,
  assertIdentifier,
  writeJsonAtomic,
  safeFilename
} = require('./local-data');

class SecretLifecycleManager {
  async createSecret({ sessionId, value, type, filename }) {
    assertIdentifier(sessionId, 'session ID');
    await ensureDataDirectories();
    const secretId = `${sessionId}-${crypto.randomBytes(8).toString('hex')}`;
    const secretName = `local/${secretId}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await writeJsonAtomic(path.join(DATA_DIR, 'secrets', `${secretId}.json`), {
      secretName, sessionId, type, filename: safeFilename(filename), value, expiresAt
    });
    return {
      secretName,
      expiresAt,
      retrievalCode: this.generateRetrievalCode(secretName)
    };
  }

  generateRetrievalCode(secretName) {
    return {
      nodejs: `// Local-only GuardRail secret reference: ${secretName}\n// Retrieve through your deployment's local secret provider.`,
      python: `# Local-only GuardRail secret reference: ${secretName}\n# Retrieve through your deployment's local secret provider.`,
      java: `// Local-only GuardRail secret reference: ${secretName}\n// Retrieve through your deployment's local secret provider.`
    };
  }

  async deleteSecret(secretName, sessionId) {
    const filename = path.basename(secretName).replace(/^local\//, '');
    if (!/^[a-zA-Z0-9_-]+$/.test(filename)) throw new Error('Invalid local secret name');
    await fs.promises.rm(path.join(DATA_DIR, 'secrets', `${filename}.json`), { force: true });
  }
}

module.exports = SecretLifecycleManager;
