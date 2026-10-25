/**
 * Local filesystem replacement for the historical S3 storage interface.
 */

const fs = require('fs');
const path = require('path');
const {
  ensureDataDirectories,
  sessionDirectory,
  safeFilename,
  assertIdentifier,
  writeJsonAtomic,
  readJson
} = require('./local-data');

class S3Storage {
  async storeCode(sessionId, code, filename) {
    assertIdentifier(sessionId, 'session ID');
    await ensureDataDirectories();
    const directory = sessionDirectory(sessionId);
    await fs.promises.mkdir(directory, { recursive: true, mode: 0o700 });
    const filePath = path.join(directory, `original.${safeFilename(filename).split('.').pop() || 'txt'}`);
    await fs.promises.writeFile(filePath, code, { encoding: 'utf8', mode: 0o600 });
    return filePath;
  }

  async storePatch(sessionId, patch) {
    assertIdentifier(sessionId, 'session ID');
    await ensureDataDirectories();
    const directory = sessionDirectory(sessionId);
    await fs.promises.mkdir(directory, { recursive: true, mode: 0o700 });
    const filePath = path.join(directory, 'patch.json');
    await writeJsonAtomic(filePath, patch);
    return filePath;
  }

  async getCode(sessionId) {
    assertIdentifier(sessionId, 'session ID');
    const directory = sessionDirectory(sessionId);
    try {
      const entries = await fs.promises.readdir(directory);
      const source = entries.find(entry => entry.startsWith('original.'));
      return source ? await fs.promises.readFile(path.join(directory, source), 'utf8') : null;
    } catch (error) {
      if (error.code === 'ENOENT') return null;
      throw new Error(`Failed to retrieve local code: ${error.message}`);
    }
  }

  async getPatch(sessionId) {
    assertIdentifier(sessionId, 'session ID');
    const patch = await readJson(path.join(sessionDirectory(sessionId), 'patch.json'));
    if (!patch) throw new Error('Patch not found');
    return patch;
  }

  async deleteSession(sessionId) {
    assertIdentifier(sessionId, 'session ID');
    await fs.promises.rm(sessionDirectory(sessionId), { recursive: true, force: true });
  }
}

module.exports = S3Storage;
