# GuardRail AI local API

The API runs analysis through Ollama and persists application data under
`GUARDRAIL_DATA_DIR` (relative paths are resolved from the `api` directory).
The default is `api/data/local/`, which is ignored by Git.

## Start

```sh
ollama serve
ollama pull rafw007/qwen35-claude-coder:4b
cd api
npm install
npm start
```

Set `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, `OLLAMA_TIMEOUT_MS`,
`GUARDRAIL_MAX_FINDINGS`, `GUARDRAIL_DATA_DIR`, `PORT`, and `RATE_LIMIT` in
`api/.env` as needed. `GUARDRAIL_MAX_FINDINGS` bounds findings per analysis
request (default `10`), while `OLLAMA_TIMEOUT_MS` controls the model request
timeout. Routine analysis disables Ollama thinking output. The rate limit
applies to API write requests such as scans and fixes; read-only requests used
for result and log polling are not counted. No AWS credentials or hosted AI
API key is required.

`GET /health` reports API availability, Ollama reachability, and whether the
configured model is installed. A scan fails explicitly when Ollama is
unavailable or returns invalid output; it never falls back to a hosted model.

Local JSON and JSONL data is not encrypted. Source and patch files use
restrictive filesystem permissions and are stored per session. Secret
extraction, when explicitly used by the remediation route, uses a local-only
provider and is not equivalent to a managed secrets vault.

## Tests

```sh
cd api
npm test -- --runInBand
```
