/**
 * Local Ollama HTTP client shared by analysis and patch generation.
 */

const http = require('http');
const https = require('https');

class OllamaClient {
  constructor() {
    this.baseUrl = (process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434').replace(/\/+$/, '');
    this.model = process.env.OLLAMA_MODEL || 'rafw007/qwen35-claude-coder:4b';
    const configuredTimeout = Number.parseInt(process.env.OLLAMA_TIMEOUT_MS || '120000', 10);
    this.timeoutMs = Number.isFinite(configuredTimeout) && configuredTimeout > 0
      ? configuredTimeout
      : 120000;
  }

  async chat(messages, options = {}) {
    const result = await this.chatWithMetrics(messages, options);
    return result.content;
  }

  async chatWithMetrics(messages, options = {}) {
    const url = new URL(`${this.baseUrl}/api/chat`);
    const payload = JSON.stringify({
      model: this.model,
      messages,
      stream: false,
      format: options.format,
      // Analysis and patch generation do not need chain-of-thought output.
      think: options.think ?? false,
      options: {
        temperature: options.temperature ?? 0.1
      }
    });
    const transport = url.protocol === 'https:' ? https : http;
    const inferenceStart = process.hrtime.bigint();

    return new Promise((resolve, reject) => {
      const request = transport.request(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: this.timeoutMs
      }, response => {
        let body = '';
        response.setEncoding('utf8');
        response.on('data', chunk => { body += chunk; });
        response.on('end', () => {
          let parsed;
          try {
            parsed = body ? JSON.parse(body) : null;
          } catch {
            reject(new Error('Ollama returned invalid JSON'));
            return;
          }
          if (response.statusCode < 200 || response.statusCode >= 300) {
            reject(new Error(`Ollama request failed (${response.statusCode}): ${parsed?.error || 'unknown error'}`));
            return;
          }
          const content = parsed?.message?.content;
          if (typeof content !== 'string' || !content.trim()) {
            reject(new Error('Ollama returned an empty response'));
            return;
          }
          resolve({
            content,
            inferenceDurationMs: Number(process.hrtime.bigint() - inferenceStart) / 1e6
          });
        });
      });

      request.on('timeout', () => request.destroy(new Error(`Ollama request timed out after ${this.timeoutMs}ms`)));
      request.on('error', error => reject(new Error(`Ollama is unavailable at ${this.baseUrl}: ${error.message}`)));
      request.write(payload);
      request.end();
    });
  }
}

module.exports = OllamaClient;
