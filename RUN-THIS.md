# Run GuardRail AI locally

This guide runs the current local architecture: Ollama, one Express API on
port `3001`, and the VS Code extension. No AWS credentials, Groq key, cloud
model, EC2 host, or cloud database is required.

## 1. Check prerequisites

Install Node.js/npm, Ollama, and VS Code 1.80 or later. Confirm they are
available:

```bash
node --version
npm --version
ollama --version
code --version
```

## 2. Start Ollama

In Terminal 1:

```bash
ollama serve
```

In another terminal, download the configured model once:

```bash
ollama pull rafw007/qwen35-claude-coder:4b
curl http://127.0.0.1:11434/api/tags
```

The tags response must include
`rafw007/qwen35-claude-coder:4b`.

## 3. Configure and start the API

In Terminal 2, from the repository root:

```bash
cd api
npm install
cp .env.example .env
npm start
```

Edit `api/.env` before starting if needed. The local defaults are:

```dotenv
PORT=3001
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=rafw007/qwen35-claude-coder:4b
OLLAMA_TIMEOUT_MS=120000
GUARDRAIL_MAX_FINDINGS=10
GUARDRAIL_DATA_DIR=./data/local
RATE_LIMIT=50
```

Only one API server may listen on port `3001`. If startup reports
`EADDRINUSE`, inspect and stop the existing listener before retrying:

```bash
lsof -nP -iTCP:3001 -sTCP:LISTEN
kill <numeric-pid>
```

Never use a broad process-kill command. If you intentionally choose another
port, set `PORT` in `api/.env` and change the VS Code `guardrailai.apiUrl`
setting to match.

## 4. Verify the API

In Terminal 3:

```bash
curl http://localhost:3001/health
```

Verify that the response reports `"api":"available"`,
`"ollama":{"reachable":true}`, and `"modelAvailable":true`. If the model is
not available, repeat the `ollama pull` command and restart the API.

## 5. Compile and package the extension

In Terminal 4:

```bash
cd extensions/vscode
npm install
npm run compile
npm run package
```

Install the generated VSIX from VS Code:

1. Open **Extensions**.
2. Select **... → Install from VSIX**.
3. Select the VSIX under `extensions/vscode/`.
4. Reload VS Code if prompted.

The repository also contains
`extensions/vscode/guardrail-ai-1.0.1.vsix`. Repackage after source changes
so the installed VSIX matches the current TypeScript source.

In VS Code settings, confirm:

```json
{
  "guardrailai.apiUrl": "http://localhost:3001",
  "guardrailai.timeout": 120000,
  "guardrailai.fixTimeout": 300000,
  "guardrailai.autoScanOnSave": true,
  "guardrailai.showInlineErrors": true
}
```

Set `guardrailai.timeout` and `guardrailai.fixTimeout` high enough for
`OLLAMA_TIMEOUT_MS` when using a slower model or larger file. Patch generation
uses the separate `fixTimeout` setting because it can outlast a scan.

## 6. Run a scan

Open a supported source file in VS Code and run **GuardRail AI: Scan Current
File**, or press `Cmd+Shift+G` on macOS (`Ctrl+Shift+G` on Windows/Linux).
Supported languages are JavaScript, TypeScript, Python, Java, Go, Ruby, and PHP.

For a known vulnerable manual fixture, open
`demo/vulnerability-test.js` and scan it. Findings should appear in the
Problems panel with severity, description, affected line, and CWE information.
The API response also records the session ID and separate inference/parsing
timings.

## 7. Review and apply a fix

After a finding is selected:

1. Choose the GuardRail AI quick fix or **GuardRail AI: Apply Security Fix**.
2. Wait for the API to generate a patch.
3. Review the VS Code diff preview.
4. Choose **Apply** to approve, or cancel to leave the file unchanged.

The extension checks that the file still matches the scanned source before
applying the patch. If the file changed, scan it again instead of applying a
stale patch. The API stores the original source and generated patch beneath
`GUARDRAIL_DATA_DIR`.

## 8. Run backend tests

In a terminal where the API is not required:

```bash
cd api
npm test -- --runInBand
```

The current backend suite passes 7/7 tests. It covers local persistence and
strict model-response validation. For a live end-to-end check, keep Ollama and
the API running, scan a fixture, then approve the generated patch in VS Code.

The repository root's `npm test` invokes an older `tests/run-tests.js` suite
that is not the current local API test command. It may attempt obsolete
cloud/AWS behavior; use the API command above.

## 9. Optional web frontend

The web application is separate from the VS Code workflow. Inspect
`web/package.json` before starting it, then run:

```bash
cd web
npm install
npm run dev
```

This step is not required to scan or remediate from VS Code. The current
backend/API path is the supported local workflow documented here.

## Common failures

### Ollama timeout

The model is running locally and may need more than two minutes for a large
file. Increase `OLLAMA_TIMEOUT_MS` and the VS Code `guardrailai.timeout`,
restart the API, and retry. Check `/health` and `/api/tags` first.

### HTTP 429 rate limit

Scans and fixes count as API write requests. Wait for the hourly window or
raise `RATE_LIMIT` for local testing and restart the API.

### Invalid model output

The API intentionally rejects malformed or schema-invalid model output. Check
that the configured model is installed, retry with a smaller file, and inspect
the API terminal. Do not disable validation.

### Wrong server or session

Make sure only one process owns port `3001`. A second server can cause the
extension to use a different data directory or model configuration than the
terminal you are watching.
