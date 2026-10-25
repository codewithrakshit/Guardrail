const fs = require('fs');
const os = require('os');
const path = require('path');

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'guardrail-local-'));
process.env.GUARDRAIL_DATA_DIR = dataDir;

const SessionManager = require('../services/session-manager');
const S3Storage = require('../services/s3-storage');
const EventLogger = require('../services/event-logger');
const BedrockClient = require('../services/bedrock-client');

describe('local persistence and Ollama response validation', () => {
  const sessionId = 'session-test-1';

  afterAll(async () => {
    await fs.promises.rm(dataDir, { recursive: true, force: true });
  });

  test('creates, updates, and retrieves sessions', async () => {
    const manager = new SessionManager();
    const created = await manager.createSession({
      sessionId, language: 'javascript', filename: 'test.js',
      clientIp: '127.0.0.1', codeLength: 12
    });
    expect(created.status).toBe('processing');
    await manager.updateSession(sessionId, { status: 'scanned', vulnerabilities_detected: 1 });
    expect((await manager.getSession(sessionId)).vulnerabilities_detected).toBe(1);
  });

  test('stores source and patches inside the session directory', async () => {
    const storage = new S3Storage();
    await storage.storeCode(sessionId, 'const safe = true;', '../unsafe.js');
    await storage.storePatch(sessionId, {
      patchId: 'patch-test-1',
      originalCode: 'const safe = true;',
      secureCode: 'const safe = false;'
    });
    expect(await storage.getCode(sessionId)).toContain('safe');
    expect(await storage.getPatch(sessionId)).toMatchObject({
      patchId: 'patch-test-1',
      originalCode: 'const safe = true;',
      secureCode: 'const safe = false;'
    });
    await expect(storage.deleteSession('../escape')).rejects.toThrow('Invalid session ID');
  });

  test('persists logs without stack traces', async () => {
    const logger = new EventLogger();
    await logger.logError({ sessionId, error: 'analysis failed', stack: 'secret stack', context: 'test' });
    const logs = await logger.getSessionLogs(sessionId);
    expect(logs).toHaveLength(1);
    expect(JSON.stringify(logs)).not.toContain('secret stack');
  });

  test('parses valid findings and rejects invalid analysis', () => {
    const client = new BedrockClient();
    const parsed = client.parseAnalysisResponse(JSON.stringify({
      vulnerabilities: [{
        risk_type: 'eval_usage',
        severity: 'high',
        explanation: 'Dynamic code execution',
        affected_lines: [2],
        extracted_value: null
      }]
    }));
    expect(parsed.risk_detected).toBe(true);
    expect(parsed.all_vulnerabilities).toHaveLength(1);
    expect(parsed.all_vulnerabilities[0]).toEqual({
      risk_type: 'eval_usage',
      severity: 'high',
      explanation: 'Dynamic code execution',
      affected_lines: [2],
      extracted_value: null
    });
    expect(() => client.parseAnalysisResponse('')).toThrow('Invalid security analysis response');
    expect(client.parseAnalysisResponse('{"vulnerabilities":[]}').risk_detected).toBe(false);
  });

  test('normalizes fenced JSON, field aliases, and missing optional fields', () => {
    const client = new BedrockClient();
    const parsed = client.parseAnalysisResponse(`Here is the result:
\`\`\`json
{"findings":[{"type":"SQL Injection","severity":"HIGH","description":"Unsafe query construction","line":"12"}]}
\`\`\``);

    expect(parsed.all_vulnerabilities[0]).toEqual({
      risk_type: 'sql_injection',
      severity: 'high',
      explanation: 'Unsafe query construction',
      affected_lines: [12],
      extracted_value: null
    });
  });

  test('rejects malformed JSON and invalid severity', () => {
    const client = new BedrockClient();
    expect(() => client.parseAnalysisResponse('{"vulnerabilities":['))
      .toThrow('Invalid security analysis response');
    expect(() => client.parseAnalysisResponse(JSON.stringify({
      vulnerabilities: [{
        risk_type: 'xss',
        severity: 'urgent',
        explanation: 'Unsafe output'
      }]
    }))).toThrow('Invalid vulnerability schema');
  });

  test('accepts an empty vulnerability result only when explicitly returned', () => {
    const client = new BedrockClient();
    expect(client.parseAnalysisResponse('```json\n{"vulnerabilities":[]}\n```'))
      .toMatchObject({ risk_detected: false, all_vulnerabilities: [] });
    expect(client.parseAnalysisResponse('{"findings":[]}'))
      .toMatchObject({ risk_detected: false, all_vulnerabilities: [] });
    expect(() => client.parseAnalysisResponse('{"result":"no findings"}'))
      .toThrow('vulnerabilities must be an array');
  });
});
