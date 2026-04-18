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
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), version: '1.0.0' });
});

app.use('/api/scan', scanRoutes);
app.use('/api/result', resultRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/demo', demoRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/fix', fixRoutes);

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 GuardRail AI API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Rate limit: ${process.env.RATE_LIMIT || 50} requests/hour`);
});

module.exports = app;