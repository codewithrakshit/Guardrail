/**
 * Result Route - Retrieve scan results and patches
 */

const express = require('express');
const router = express.Router();
const SessionManager = require('../services/session-manager');
const S3Storage = require('../services/s3-storage');

/**
 * GET /api/result/:sessionId
 * Get scan results and patch
 */
router.get('/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const sessionManager = new SessionManager();
    const session = await sessionManager.getSession(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if session expired
    if (session.expires_at < Date.now()) {
      return res.status(410).json({ error: 'Session expired' });
    }

    // Get patch from S3
    const storage = new S3Storage();
    let patch = null;
    
    try {
      patch = await storage.getPatch(sessionId);
    } catch (error) {
      console.log(`[${sessionId}] No patch available`);
    }

    res.json({
      sessionId,
      status: session.status,
      createdAt: session.created_at,
      expiresAt: new Date(session.expires_at).toISOString(),
      language: session.language,
      filename: session.filename,
      vulnerabilitiesDetected: session.vulnerabilities_detected,
      secretCreated: session.secret_created,
      // Include vulnerability details from patch
      vulnerabilities: patch && patch.vulnerabilities ? patch.vulnerabilities : [],
      patchedCode: patch && patch.secureCode ? patch.secureCode : null,
      patch: patch ? {
        available: true,
        diff: patch.diff,
        explanation: patch.explanation,
        securityBenefit: patch.securityBenefit,
        confidence: patch.confidence,
        secretRef: patch.secretRef
      } : null
    });

  } catch (error) {
    console.error('Result retrieval error:', error);
    next(error);
  }
});

/**
 * GET /api/result/:sessionId/download
 * Download patched code
 */
router.get('/:sessionId/download', async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const storage = new S3Storage();
    const patch = await storage.getPatch(sessionId);

    if (!patch) {
      return res.status(404).json({ error: 'Patch not found' });
    }

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="secure-code.txt"`);
    res.send(patch.secureCode);

  } catch (error) {
    console.error('Download error:', error);
    next(error);
  }
});

module.exports = router;
