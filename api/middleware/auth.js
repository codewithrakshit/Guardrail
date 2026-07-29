const jwt = require('jsonwebtoken');
const { userService, ROLES } = require('../services/user-service');
const JWT_SECRET = process.env.JWT_SECRET || 'guardrail-dev-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required. Please provide a valid token.' });
  const token = authHeader.split(' ')[1];
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(401).json({ error: 'Token expired. Please log in again.' });
    return res.status(401).json({ error: 'Invalid token.' });
  }
}
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) { req.user = null; return next(); }
  try { req.user = jwt.verify(authHeader.split(' ')[1], JWT_SECRET); }
  catch { req.user = null; }
  next();
}
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required.' });
    const hasAccess = allowedRoles.some(role => userService.hasRole(req.user.role, role));
    if (!hasAccess) return res.status(403).json({ error: 'Access denied.', requiredRole: allowedRoles.join(' or '), yourRole: req.user.role });
    next();
  };
}
function selfOrAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required.' });
  if (req.user.role === ROLES.ADMIN) return next();
  if ((req.params.userId && req.user.id === req.params.userId) || (req.params.id && req.user.id === req.params.id)) return next();
  return res.status(403).json({ error: 'Access denied. You can only access your own data.' });
}
module.exports = { generateToken, authenticate, optionalAuth, authorize, selfOrAdmin, ROLES };
