# GuardRail AI

GuardRail AI is a local-first code security scanner and remediation workflow.
The VS Code extension sends source code to a local Express API. The API uses
Ollama for inference, validates the model response, stores session data locally,
and can generate a secure replacement patch for user review.

## Current architecture

```text
VS Code extension
        │ HTTP: http://localhost:3001
        ▼
Local Express API (api/)
        │
        ├── Scan route: validate and sanitize source, create session
        ├── Ollama client: http://127.0.0.1:11434
        │                 model: rafw007/qwen35-claude-coder:4b
        ├── Response validation and finding limit
        ├── Local JSON/JSONL session, result, log, and patch storage
        └── Fix route: generate and store a secure replacement patch
```

There is no hosted AI service, AWS dependency, or cloud persistence in the
current local workflow. The API must be the only process listening on port
`3001`.

## Features

- Scan the current file or workspace from VS Code.
- Inline diagnostics with severity and CWE information.
- Schema-validated vulnerability results.
- Configurable maximum findings per analysis request.
- Separate inference and response-parsing timing metrics.
- Scan-only flow that stores the source and results in a local session.
- Remediation flow: generate patch, preview a VS Code diff, approve or cancel,
  then apply only if the file is unchanged.
- Local JSON and JSONL persistence for sessions, source, logs, and patches.
- Supported languages: JavaScript, TypeScript, Python, Java, Go, Ruby, and PHP.

## Prerequisites

- Node.js and npm.
- Ollama installed and running.
- The configured Ollama model downloaded locally.
- VS Code 1.80 or later for the extension.

## Quick start

Use the complete, step-by-step procedure in [RUN-THIS.md](RUN-THIS.md).

The shortest local startup sequence is:

```bash
# Terminal 1
ollama serve
ollama pull rafw007/qwen35-claude-coder:4b

# Terminal 2
cd api
npm install
cp .env.example .env
npm start
```

Check both services before opening VS Code:

```bash
curl http://127.0.0.1:11434/api/tags
curl http://localhost:3001/health
```

The health response reports API availability, Ollama reachability, and whether
the configured model is installed.

## Configuration

Copy `api/.env.example` to `api/.env`. The important local settings are:

| Variable | Default | Purpose |
|---|---:|---|
| `PORT` | `3001` | Express API port. Run only one API server on this port. |
| `OLLAMA_BASE_URL` | `http://127.0.0.1:11434` | Ollama HTTP endpoint. |
| `OLLAMA_MODEL` | `rafw007/qwen35-claude-coder:4b` | Local model name. |
| `OLLAMA_TIMEOUT_MS` | `120000` | Maximum Ollama request duration. |
| `GUARDRAIL_MAX_FINDINGS` | `10` | Maximum validated findings returned per analysis. |
| `GUARDRAIL_DATA_DIR` | `./data/local` | Local sessions, source, patches, and logs directory. |
| `RATE_LIMIT` | `50` | Hourly limit for API write requests. |

Routine analysis disables Ollama thinking output. The model response is still
strictly parsed and invalid vulnerability entries are rejected.

## VS Code extension

The extension defaults to `http://localhost:3001`. To compile and package it:

```bash
cd extensions/vscode
npm install
npm run compile
npm run package
```

This creates a VSIX in `extensions/vscode/`. Install it from VS Code with
**Extensions → ... → Install from VSIX**, or install the tracked
`extensions/vscode/guardrail-ai-1.0.1.vsix` file. Configure
`guardrailai.apiUrl` only if the API is not at the default URL. The extension
Scan requests use `guardrailai.timeout`; remediation requests use
`guardrailai.fixTimeout` and default to five minutes because patch generation
can take longer than analysis. Set both high enough for the configured
`OLLAMA_TIMEOUT_MS`.

Scan the active file with **GuardRail AI: Scan Current File** or
`Cmd+Shift+G` on macOS (`Ctrl+Shift+G` on Windows/Linux). Findings appear in
the Problems panel. Use the quick fix or **GuardRail AI: Apply Security Fix** to
request remediation. The extension previews the generated diff and asks for
approval; cancelling leaves the file unchanged.

## API usage

Scan source:

```bash
curl -X POST http://localhost:3001/api/scan \
  -H 'Content-Type: application/json' \
  --data-binary @- <<'JSON'
{"code":"const query = `SELECT * FROM users WHERE id = ${id}`;","language":"javascript","filename":"example.js"}
JSON
```

The response includes `sessionId`, `status`, `vulnerabilities`,
`scanDuration`, `inferenceDurationMs`, and `parsingDurationMs`. A vulnerable
scan creates a session that can be sent to the fix route:

```bash
curl -X POST http://localhost:3001/api/fix/<sessionId>
```

The fix response contains the original and secure code, diff metadata, and a
patch ID. The VS Code extension is the supported approval surface for applying
the patch.

## Testing

Backend tests:

```bash
cd api
npm test -- --runInBand
```

The current API test suite passes 7/7 tests, including local persistence and
strict analysis-response validation. A live scan and remediation check requires
Ollama and can be run with the API and model started as described above.

The root `package.json` contains an older `npm test` script that runs the
legacy `tests/run-tests.js` suite; it is not the current local API test command
and may require obsolete cloud/AWS behavior. Use the API command above for the
working local backend.

## Troubleshooting

### Port 3001 is already in use

Stop the existing API process before starting another one. Do not run two API
servers on port `3001`; the extension may connect to the wrong process and
sessions may be written to a different data directory. On macOS/Linux:

```bash
lsof -nP -iTCP:3001 -sTCP:LISTEN
kill <numeric-pid>
```

Alternatively set `PORT` and `guardrailai.apiUrl` to the same alternate port.

### Ollama timeout

Confirm Ollama is running and the model is available:

```bash
curl http://127.0.0.1:11434/api/tags
```

Large files and local-model inference can take time. Increase
`OLLAMA_TIMEOUT_MS` in `api/.env` and set the extension's
`guardrailai.timeout` to a larger value, then restart the API. Do not treat a
timeout as a successful scan.

### Rate limit response

The API limits write requests such as scans and fixes. A `429` response means
the hourly `RATE_LIMIT` was reached. Wait for the window to reset or configure a
larger value for local development, then restart the API.

### Invalid model output

The API rejects malformed JSON, unknown vulnerability types, invalid severity
values, missing explanations, and invalid line numbers. Check the API log,
confirm the configured model is installed, and retry with a smaller file or a
known compatible model. Do not disable schema validation to work around this
error.

### Extension cannot connect

Check `curl http://localhost:3001/health`, confirm the extension setting
`guardrailai.apiUrl` matches the API URL, and reload VS Code after changing the
setting. The API and Ollama must both be running.

## Repository layout

| Path | Purpose |
|---|---|
| `api/` | Express API, Ollama client, validation, orchestration, and local persistence. |
| `extensions/vscode/` | VS Code scanner, diagnostics, diff preview, and patch application. |
| `demo/` | Intentionally vulnerable fixtures for manual testing. |
| `web/` | Separate frontend application; not required for the VS Code local workflow. |
| `cli/` | Separate CLI package; inspect its package scripts before using it. |
| `docs/` | Additional architecture and demo documentation. |

## License

MIT
