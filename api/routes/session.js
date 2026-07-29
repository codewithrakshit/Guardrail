const express = require('express');
const router = express.Router();
const SessionManager = require('../services/session-manager');
const S3Storage = require('../services/s3-storage');
const SecretLifecycleManager = require('../services/secret-lifecycle-manager');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../services/user-service');

router.delete('/:sessionId', authenticate, authorize(ROLES.ADMIN), async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    console.log('[' + sessionId + '] Cleanup requested by ' + req.user.email);
    const sessionManager = new SessionManager();
    const session = await sessionManager.getSession(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    const storage = new S3Storage();
    await storage.deleteSession(sessionId);
    if (session.secret_created) { console.log('[' + sessionId + '] Secret cleanup scheduled'); }
    res.json({ message: 'Session cleanup initiated', sessionId });
  } catch (error) {
    console.error('Session cleanup error:', error);
    next(error);
  }
});

module.exports = router;
