const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const ROLES = { VIEWER: 'viewer', EDITOR: 'editor', ADMIN: 'admin' };
const ROLE_HIERARCHY = { viewer: 1, editor: 2, admin: 3 };
const DEFAULT_ADMIN = { id: 'admin-default', email: 'admin@guardrail.ai', name: 'Default Admin', role: 'admin', createdAt: new Date().toISOString() };
class UserService {
  constructor() { this.users = new Map(); this._seed(); }
  _seed() { const hash = bcrypt.hashSync('admin123', 10); this.users.set(DEFAULT_ADMIN.id, { ...DEFAULT_ADMIN, passwordHash: hash }); }
  async createUser({ email, password, name, role = ROLES.VIEWER, createdBy }) {
    if (!email || !password) throw Object.assign(new Error('Email and password required'), { status: 400 });
    for (const u of this.users.values()) { if (u.email === email) throw Object.assign(new Error('Duplicate email'), { status: 409 }); }
    const hash = await bcrypt.hash(password, 10);
    const id = uuidv4();
    const user = { id, email, name: name || email.split('@')[0], role: Object.values(ROLES).includes(role) ? role : ROLES.VIEWER, passwordHash: hash, createdBy: createdBy || null, createdAt: new Date().toISOString(), lastLoginAt: null };
    this.users.set(id, user);
    const { passwordHash: _, ...safe } = user; return safe;
  }
  async authenticate(email, password) {
    if (!email || !password) throw Object.assign(new Error('Email and password required'), { status: 400 });
    for (const user of this.users.values()) {
      if (user.email === email) {
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) throw Object.assign(new Error('Invalid email or password'), { status: 401 });
        user.lastLoginAt = new Date().toISOString();
        const { passwordHash: _, ...safe } = user; return safe;
    } }
    throw Object.assign(new Error('Invalid email or password'), { status: 401 });
  }
  async getUser(id) { const user = this.users.get(id); if (!user) return null; const { passwordHash: _, ...safe } = user; return safe; }
  async getUsers() { const safe=[]; for(const u of this.users.values()){ const{passwordHash:_,...s}=u; safe.push(s); } return safe.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)); }
  async updateUserRole(userId, newRole) {
    if (!Object.values(ROLES).includes(newRole)) throw Object.assign(new Error('Invalid role'), { status: 400 });
    const user = this.users.get(userId); if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
    user.role = newRole; user.updatedAt = new Date().toISOString();
    const { passwordHash: _, ...safe } = user; return safe;
  }
  async deleteUser(userId) {
    const user = this.users.get(userId); if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
    if (userId === DEFAULT_ADMIN.id) throw Object.assign(new Error('Cannot delete default admin'), { status: 403 });
    this.users.delete(userId); return { deleted: true, id: userId };
  }
  hasRole(userRole, requiredRole) { return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[requiredRole] || 0); }
  getRoles() { return Object.values(ROLES); }
}
module.exports = { userService: new UserService(), ROLES, ROLE_HIERARCHY };
