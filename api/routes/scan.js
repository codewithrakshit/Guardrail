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
 * Submit code for security analysis (scan-only, no remediation)
 */
const processScan = async (req, res, next) => {
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

    // Start security orchestration (SCAN ONLY - no remediation)
    const orchestrator = new SecurityOrchestrator();
    const result = await orchestrator.processCode({
      sessionId,
      code: sanitizedCode,
      language,
      filename: filename || 'untitled',
      scanOnly: true  // Only scan, don't generate patches
    });

    console.log(`[${sessionId}] Scan complete - Status: ${result.status}`);

    res.json({
      sessionId,
      status: result.status,
      vulnerabilities: result.vulnerabilities,
      severity: result.severity,
      scanDuration: result.duration,
      inferenceDurationMs: result.inferenceDurationMs,
      parsingDurationMs: result.parsingDurationMs,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Scan error:', error);
    next(error);
  }
};

/**
 * POST /api/scan
 * Submit code for security analysis (scan-only, no remediation)
 */
router.post('/', validateInput(scanSchema), processScan);

/**
 * POST /api/scan/upload
 * Upload file for analysis
 */
router.post('/upload', upload.single('file'), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    req.body.code = req.file.buffer.toString('utf-8');
    req.body.filename = req.file.originalname;
    
    next();
  } catch (error) {
    console.error('Upload error:', error);
    next(error);
  }
}, validateInput(scanSchema), processScan);

module.exports = router;
