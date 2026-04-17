/**
 * Scan Route - Code submission and analysis
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');

const SecurityOrchestrator = require('../services/security-orchestrator');
const SessionManager = require('../services/session-manager');
const { validateInput, sanitizeCode } = require('../middleware/validation');

// File upload configuration
const upload = multer({
  limits: { fileSize: 1024 * 1024 }, // 1MB
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.js', '.ts', '.py', '.java', '.go', '.rb', '.php'];
    const ext = file.originalname.substring(file.originalname.lastIndexOf('.'));
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Validation schema
const scanSchema = Joi.object({
  code: Joi.string().required().max(100000),
  language: Joi.string().valid('javascript', 'typescript', 'python', 'java', 'go', 'ruby', 'php').required(),
  filename: Joi.string().optional().max(255)
});

/**
 * POST /api/scan
 * Submit code for security analysis
 */
router.post('/', validateInput(scanSchema), async (req, res, next) => {
  try {
    const { code, language, filename } = req.body;
    const sessionId = uuidv4();
    const clientIp = req.ip || req.connection.remoteAddress;

    console.log(`[${sessionId}] New scan request - Language: ${language}, IP: ${clientIp}`);

    // Sanitize input
    const sanitizedCode = sanitizeCode(code);

    // Initialize session
    const sessionManager = new SessionManager();
    await sessionManager.createSession({
      sessionId,
      language,
      filename: filename || 'untitled',
      clientIp,
      codeLength: sanitizedCode.length
    });

    // Start security orchestration
    const orchestrator = new SecurityOrchestrator();
    const result = await orchestrator.processCode({
      sessionId,
      code: sanitizedCode,
      language,
      filename: filename || 'untitled'
    });

    console.log(`[${sessionId}] Scan complete - Status: ${result.status}`);

    res.json({
      sessionId,
      status: result.status,
      vulnerabilities: result.vulnerabilities,
      severity: result.severity,
      scanDuration: result.duration,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Scan error:', error);
    next(error);
  }
});

/**
 * POST /api/scan/upload
 * Upload file for analysis
 */
router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const code = req.file.buffer.toString('utf-8');
    const language = req.body.language;
    const filename = req.file.originalname;

    // Reuse main scan logic
    req.body = { code, language, filename };
    return router.handle(req, res, next);

  } catch (error) {
    console.error('Upload error:', error);
    next(error);
  }
});

module.exports = router;
