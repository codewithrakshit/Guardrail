/**
 * Fix Route - Generate remediation patches
 */

const express = require('express');
const router = express.Router();
const SecurityOrchestrator = require('../services/security-orchestrator');
const SessionManager = require('../services/session-manager');
const S3Storage = require('../services/s3-storage');

/**
 * POST /api/fix/:sessionId
 * Generate remediation patch for a scanned session
 */
router.post('/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    
    console.log(`[${sessionId}] Fix request received`);

    // Get session details
    const sessionManager = new SessionManager();
    const session = await sessionManager.getSession(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.status !== 'scanned') {
      return res.status(400).json({ 
        error: 'Session must be scanned first',
        currentStatus: session.status 
      });
    }

    // Get original code from S3
    const storage = new S3Storage();
    const originalCode = await storage.getCode(sessionId);

    if (!originalCode) {
      return res.status(404).json({ error: 'Original code not found' });
    }

    // Generate full remediation
    const orchestrator = new SecurityOrchestrator();
    const result = await orchestrator.processCode({
      sessionId,
      code: originalCode,
      language: session.language,
      filename: session.filename,
      scanOnly: false  // Full remediation
    });

    console.log(`[${sessionId}] Fix generation complete`);

    res.json({
      sessionId,
      status: 'fixed',
      patch: result.patch,
      vulnerabilities: result.vulnerabilities,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Fix generation error:', error);
    next(error);
  }
});

module.exports = router;
