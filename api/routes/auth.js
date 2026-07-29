const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { userService, ROLES } = require('../services/user-service');
const { validateInput } = require('../middleware/validation');
const { generateToken, authenticate, authorize } = require('../middleware/auth');
const registerSchema = Joi.object({ email: Joi.string().email().required(), password: Joi.string().min(6).max(128).required(), name: Joi.string().min(1).max(100).optional(), role: Joi.string().valid('viewer', 'editor', 'admin').optional() });
const loginSchema = Joi.object({ email: Joi.string().email().required(), password: Joi.string().required() });
const updateRoleSchema = Joi.object({ role: Joi.string().valid('viewer', 'editor', 'admin').required() });
router.post('/register', authenticate, authorize(ROLES.ADMIN), validateInput(registerSchema), async (req, res, next) => {
  try { const user = await userService.createUser({ ...req.body, createdBy: req.user.id }); res.status(201).json({ user, message: 'User created successfully' }); }
  catch (err) { next(err); }
});
router.post('/login', validateInput(loginSchema), async (req, res, next) => {
  try { const user = await userService.authenticate(req.body.email, req.body.password); const token = generateToken(user); res.json({ token, user, message: 'Login successful' }); }
  catch (err) { if (err.status === 401) return res.status(401).json({ error: err.message }); next(err); }
});
router.get('/me', authenticate, async (req, res, next) => {
  try { const user = await userService.getUser(req.user.id); if (!user) return res.status(404).json({ error: 'User not found' }); res.json({ user }); }
  catch (err) { next(err); }
});
router.get('/users', authenticate, authorize(ROLES.ADMIN), async (req, res, next) => {
  try { const users = await userService.getUsers(); res.json({ users }); }
  catch (err) { next(err); }
});
router.put('/users/:userId/role', authenticate, authorize(ROLES.ADMIN), validateInput(updateRoleSchema), async (req, res, next) => {
  try { const user = await userService.updateUserRole(req.params.userId, req.body.role); res.json({ user, message: 'Role updated successfully' }); }
  catch (err) { if (err.status === 404) return res.status(404).json({ error: err.message }); next(err); }
});
router.delete('/users/:userId', authenticate, authorize(ROLES.ADMIN), async (req, res, next) => {
  try { const result = await userService.deleteUser(req.params.userId); res.json({ ...result, message: 'User deleted successfully' }); }
  catch (err) { if (err.status === 404) return res.status(404).json({ error: err.message }); if (err.status === 403) return res.status(403).json({ error: err.message }); next(err); }
});
router.get('/roles', authenticate, async (req, res) => { res.json({ roles: userService.getRoles() }); });
module.exports = router;
