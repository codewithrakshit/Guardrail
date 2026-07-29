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
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(compression());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use('/api/webhook', express.raw({ type: 'application/json' }), webhookRoutes);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: process.env.RATE_LIMIT || 50,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), version: '1.0.0' });
});

app.use('/api/auth', authRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/result', resultRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/demo', demoRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/fix', fixRoutes);

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
  console.error('[ERROR] ' + req.method + ' ' + req.path + ' - ' + err.message);
  if (err.stack) console.error(err.stack);
  const clientMessage = CLIENT_ERROR_MESSAGES[status] || (status < 500 ? 'Request error.' : 'An unexpected error occurred. Please try again.');
  const response = { error: clientMessage, status, timestamp: new Date().toISOString() };
  if (isDev) response.detail = err.message;
  res.status(status).json(response);
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found.', timestamp: new Date().toISOString() });
});

const server = app.listen(PORT, () => {
  console.log('GuardRail AI API running on port ' + PORT);
  console.log('Environment: ' + (process.env.NODE_ENV || 'development'));
  console.log('Rate limit: ' + (process.env.RATE_LIMIT || 50) + ' requests/hour');
});

process.on('SIGTERM', () => { server.close(() => process.exit(0)); });
process.on('SIGINT', () => { server.close(() => process.exit(0)); });

module.exports = app;
