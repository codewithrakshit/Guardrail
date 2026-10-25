# GuardRail AI coding-agent instructions

## Current local architecture

- Treat the local Express API in `api/` and the VS Code extension in
  `extensions/vscode/` as the supported development path.
- The extension's default API URL is `http://localhost:3001`.
- The API uses Ollama at `http://127.0.0.1:11434` with
  `rafw007/qwen35-claude-coder:4b`.
- Sessions, scan results, logs, source files, and patches are persisted under
  the configured `GUARDRAIL_DATA_DIR`.
- Analysis responses are schema-validated and bounded by
  `GUARDRAIL_MAX_FINDINGS`; do not weaken validation to accommodate model
  output.
- Analysis exposes separate inference and parsing timing metrics.
- Remediation is user-approved: scan, generate patch, preview the VS Code diff,
  approve or cancel, then apply only if the source has not changed.

## Development and validation

- Do not add AWS, Groq, hosted AI, or cloud-persistence requirements to the
  local workflow unless the task explicitly restores a separate integration.
- Keep `OLLAMA_TIMEOUT_MS`, `RATE_LIMIT`, and `GUARDRAIL_MAX_FINDINGS`
  configurable.
- Do not run two API servers on port `3001` during local testing.
- For backend changes, run:

  ```bash
  cd api
  npm test -- --runInBand
  ```

- For extension changes, run:

  ```bash
  cd extensions/vscode
  npm run compile
  ```

- Package the extension with `npm run package` when a VSIX is required.
- Preserve unrelated worktree changes. Do not change application logic or
  dependencies when the task is documentation-only.

## Documentation source of truth

- Root local setup: `README.md` and `RUN-THIS.md`.
- API-specific configuration and tests: `api/README.md`.
- Extension commands and settings: `extensions/vscode/package.json` and
  `extensions/vscode/src/`.
