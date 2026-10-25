/**
 * Shared local persistence for sessions, source, patches, and event logs.
 */

const fs = require('fs');
const path = require('path');

const configuredDataDir = process.env.GUARDRAIL_DATA_DIR;
const DATA_DIR = configuredDataDir
  ? (path.isAbsolute(configuredDataDir)
    ? configuredDataDir
    : path.resolve(__dirname, '..', configuredDataDir))
  : path.resolve(__dirname, '..', 'data', 'local');
const SESSIONS_DIR = path.join(DATA_DIR, 'sessions');
const LOGS_DIR = path.join(DATA_DIR, 'logs');
const EVENTS_FILE = path.join(LOGS_DIR, 'events.jsonl');

function assertIdentifier(value, name = 'identifier') {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(value)) {
    throw new Error(`Invalid ${name}`);
  }
}

function safeFilename(filename) {
  const base = path.basename(typeof filename === 'string' ? filename : 'untitled');
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 128);
  return cleaned || 'untitled';
}

async function ensureDataDirectories() {
  await fs.promises.mkdir(SESSIONS_DIR, { recursive: true, mode: 0o700 });
  await fs.promises.mkdir(LOGS_DIR, { recursive: true, mode: 0o700 });
}

function sessionDirectory(sessionId) {
  assertIdentifier(sessionId, 'session ID');
  return path.join(SESSIONS_DIR, sessionId);
}

function sessionFile(sessionId) {
  return path.join(SESSIONS_DIR, `${sessionId}.json`);
}

async function writeJsonAtomic(filePath, value) {
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true, mode: 0o700 });
  const temporaryPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  try {
    await fs.promises.writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, {
      encoding: 'utf8',
      mode: 0o600
    });
    await fs.promises.rename(temporaryPath, filePath);
  } finally {
    await fs.promises.rm(temporaryPath, { force: true });
  }
}

async function readJson(filePath) {
  try {
    return JSON.parse(await fs.promises.readFile(filePath, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    if (error instanceof SyntaxError) {
      throw new Error(`Malformed local data file: ${path.basename(filePath)}`);
    }
    throw error;
  }
}

async function appendJsonLine(filePath, value) {
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true, mode: 0o700 });
  await fs.promises.appendFile(filePath, `${JSON.stringify(value)}\n`, { encoding: 'utf8', mode: 0o600 });
  await fs.promises.chmod(filePath, 0o600);
}

async function readJsonLines(filePath) {
  try {
    const content = await fs.promises.readFile(filePath, 'utf8');
    return content.split('\n').filter(Boolean).map(line => JSON.parse(line));
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    if (error instanceof SyntaxError) throw new Error('Malformed local event log');
    throw error;
  }
}

module.exports = {
  DATA_DIR,
  SESSIONS_DIR,
  EVENTS_FILE,
  assertIdentifier,
  safeFilename,
  ensureDataDirectories,
  sessionDirectory,
  sessionFile,
  writeJsonAtomic,
  readJson,
  appendJsonLine,
  readJsonLines
};
