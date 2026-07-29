const { userService, ROLES } = require('../services/user-service');
function adminOnly(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required.' });
  if (req.user.role !== ROLES.ADMIN) return res.status(403).json({ error: 'Only administrators can perform this action.', yourRole: req.user.role });
  next();
}
function editorOrAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required.' });
  if (req.user.role === ROLES.ADMIN || req.user.role === ROLES.EDITOR) return next();
  return res.status(403).json({ error: 'Editor or Admin role required.', yourRole: req.user.role });
}
function anyAuthenticated(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required.' });
  next();
}
module.exports = { adminOnly, editorOrAdmin, anyAuthenticated };
