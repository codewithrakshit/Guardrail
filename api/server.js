/**
 * GuardRail AI - Backend API Server
 * Production-grade SaaS platform
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const scanRoutes = require('./routes/scan');
const resultRoutes = require('./routes/result');
const logsRoutes = require('./routes/logs');
const demoRoutes = require('./routes/demo');
const sessionRoutes = require('./routes/session');
const webhookRoutes = require('./routes/webhook');
const fixRoutes = require('./routes/fix');
const http = require('http');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(compression());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Webhook route needs raw body for signature validation — must be BEFORE express.json()
app.use('/api/webhook', express.raw({ type: 'application/json' }), webhookRoutes);

// Body parsing for all other routes
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: process.env.RATE_LIMIT || 50,
  skip: req => req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS',
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

function checkOllama() {
  const baseUrl = (process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434').replace(/\/+$/, '');
  const model = process.env.OLLAMA_MODEL || 'rafw007/qwen35-claude-coder:4b';
  const url = new URL(`${baseUrl}/api/tags`);
  const transport = url.protocol === 'https:' ? https : http;
  return new Promise(resolve => {
    const request = transport.get(url, { timeout: 3000 }, response => {
      let body = '';
      response.on('data', chunk => { body += chunk; });
      response.on('end', () => {
        try {
          const tags = JSON.parse(body).models || [];
          resolve({
            reachable: response.statusCode >= 200 && response.statusCode < 300,
            modelAvailable: tags.some(item => item.name === model)
          });
        } catch {
          resolve({ reachable: false, modelAvailable: false });
        }
      });
    });
    request.on('timeout', () => request.destroy());
    request.on('error', () => resolve({ reachable: false, modelAvailable: false }));
  });
}

app.get('/health', async (req, res) => {
  const ollama = await checkOllama();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: { api: 'available', ollama }
  });
});

app.use('/api/scan', scanRoutes);
app.use('/api/result', resultRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/demo', demoRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/fix', fixRoutes);

// ---------------------------------------------------------------------------
// Centralized error handler
// - Logs full detail (message + stack) on the SERVER only
// - Sends only a sanitized, client-safe message in the HTTP response
// ---------------------------------------------------------------------------

// Map of known safe, user-facing messages keyed by HTTP status code
const CLIENT_ERROR_MESSAGES = {
  400: 'Bad request.',
  401: 'Authentication required.',
  403: 'Access denied.',
  404: 'Resource not found.',
  409: 'Conflict with current state.',
  410: 'Resource no longer available.',
  422: 'Unprocessable request.',
  429: 'Too many requests. Please try again later.',
};

app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const isDev = process.env.NODE_ENV === 'development';

  // Always log the full error (message + stack) server-side for debugging
  console.error(`[ERROR] ${req.method} ${req.path} — ${err.message}`);
  if (err.stack) {
    console.error(err.stack);
  }

  // Build client-safe response — never expose internal error messages or stack traces
  const clientMessage =
    CLIENT_ERROR_MESSAGES[status] ||
    (status < 500 ? 'Request error.' : 'An unexpected error occurred. Please try again.');

  const response = {
    error: clientMessage,
    status,
    timestamp: new Date().toISOString(),
  };

  // In development only, include the original message for easier local debugging
  if (isDev) {
    response.detail = err.message;
  }

  res.status(status).json(response);
});

// 404 handler — intentionally omits the requested path to avoid reflecting
// unsanitized user input back in the response body
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found.',
    timestamp: new Date().toISOString(),
  });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 GuardRail AI API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Rate limit: ${process.env.RATE_LIMIT || 50} requests/hour`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');

  server.close(() => {
    console.log('✅ Server closed successfully.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');

  server.close(() => {
    console.log('✅ Server closed successfully.');
    process.exit(0);
  });
});

module.exports = app;
