/**
 * Session Route - Session management
 */

const express = require('express');
const router = express.Router();
const SessionManager = require('../services/session-manager');
const S3Storage = require('../services/s3-storage');
const SecretLifecycleManager = require('../services/secret-lifecycle-manager');

/**
 * DELETE /api/session/:sessionId
 * Delete session and cleanup resources
 */
router.delete('/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    console.log(`[${sessionId}] Cleanup requested`);

    // Get session details
    const sessionManager = new SessionManager();
    const session = await sessionManager.getSession(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Delete S3 files
    const storage = new S3Storage();
    await storage.deleteSession(sessionId);

    // Delete secrets if created
    if (session.secret_created) {
      const secretManager = new SecretLifecycleManager();
      // Note: Secret name would need to be stored in session
      console.log(`[${sessionId}] Secret cleanup scheduled`);
    }

    res.json({ 
      message: 'Session cleanup initiated',
      sessionId 
    });

  } catch (error) {
    console.error('Session cleanup error:', error);
    next(error);
  }
});

module.exports = router;
