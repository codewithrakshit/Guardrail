const express = require('express');
const router = express.Router();
const S3Storage = require('../services/s3-storage');
const SessionManager = require('../services/session-manager');

router.get('/', async (req, res, next) => {
  try {
    const { sessionId } = req.query;
    const storage = new S3Storage();
    const sessionManager = new SessionManager();

    if (sessionId) {
      const session = await sessionManager.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      const patchData = await storage.getPatch(sessionId);
      if (!patchData) {
        return res.json({ sessionId, patches: [] });
      }
      return res.json({
        sessionId,
        patches: [{
          id: sessionId,
          filename: session.filename,
          language: session.language,
          secureCode: patchData.secureCode,
          originalCode: patchData.originalCode,
          diff: patchData.diff,
          explanation: patchData.explanation,
          securityBenefit: patchData.securityBenefit,
          confidence: patchData.confidence,
          secretRef: patchData.secretRef,
          createdAt: session.created_at,
          status: session.status
        }]
      });
    }

    res.json({ patches: [] });
  } catch (error) {
    console.error('Patch fetch error:', error);
    next(error);
  }
});

module.exports = router;
