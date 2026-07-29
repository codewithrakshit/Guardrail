'use client';

import { useState, useEffect } from 'react';
import { Shield, Users, UserPlus, Trash2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import api from '../../../lib/api';
import { useAuth } from '../../../lib/auth-context';
import { useRouter } from 'next/navigation';

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, hasRole, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('viewer');

  useEffect(() => {
    if (!authLoading && (!user || !hasRole('admin'))) {
      router.push('/dashboard');
    }
  }, [user, authLoading, hasRole, router]);

  useEffect(() => { if (user && hasRole('admin')) fetchUsers(); }, [user]);

  const fetchUsers = async () => {
    try { const res = await api.get('/api/auth/users'); setUsers(res.data.users); }
    catch (e) { setError('Failed to load users'); }
    finally { setLoading(false); }
  };

  const createUser = async (e) => {
    e.preventDefault(); setError('');
    try {
      await api.post('/api/auth/register', { email: newEmail, password: newPassword, name: newName, role: newRole });
      setShowCreate(false); setNewEmail(''); setNewPassword(''); setNewName(''); setNewRole('viewer');
      fetchUsers();
    } catch (err) { setError(err.response?.data?.error || 'Failed to create user'); }
  };

  const updateRole = async (userId, role) => {
    try { await api.put('/api/auth/users/' + userId + '/role', { role }); fetchUsers(); }
    catch (e) { setError('Failed to update role'); }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try { await api.delete('/api/auth/users/' + userId); fetchUsers(); }
    catch (err) { setError(err.response?.data?.error || 'Failed to delete user'); }
  };

  if (authLoading) return <div className= min-h-screen bg-black text-white flex items-center justify-center><Loader2 className=w-8 h-8 animate-spin /></div>;
  if (!user || !hasRole('admin')) return null;

  const roleColors = { admin: 'bg-red-900/40 text-red-300 border-red-800/50', editor: 'bg-blue-900/40 text-blue-300 border-blue-800/50', viewer: 'bg-gray-800/40 text-gray-300 border-gray-700/50' };

  return (
    <div className=min-h-screen bg-black text-white>
      <nav className=border-b border-gray-800 px-6 py-4>
        <div className=max-w-7xl mx-auto flex items-center justify-between>
          <div className=flex items-center gap-4>
            <Link href=/dashboard className=text-gray-400 hover:text-white transition><ArrowLeft className=w-5 h-5 /></Link>
            <div className=flex items-center gap-3>
              <Shield className=w-6 h-6 text-indigo-400 />
              <span className=text-xl font-bold>User Management</span>
            </div>
          </div>
          <button onClick={() => setShowCreate(true)} className=px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-semibold flex items-center gap-2 transition><UserPlus className=w-4 h-4 /> Add User</button>
        </div>
      </nav>

      <main className=max-w-5xl mx-auto px-6 py-12>
        {error && <div className=mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-xl flex items-start gap-3><AlertCircle className=w-5 h-5 text-red-400 flex-shrink-0 mt-0.5 /><span className=text-red-300>{error}</span><button onClick={() => setError('')} className=ml-auto text-red-400 hover:text-red-300>?</button></div>}

        {showCreate && (
          <div className=fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm onClick={() => setShowCreate(false)}>
            <div className=bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-md mx-4 onClick={e => e.stopPropagation()}>
              <h2 className=text-2xl font-bold mb-6>Create User</h2>
              <form onSubmit={createUser} className=space-y-4>
                <div><label className=block text-sm text-gray-400 mb-1>Email *</label><input type=email value={newEmail} onChange={e => setNewEmail(e.target.value)} required className=w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-indigo-500/50 /></div>
                <div><label className=block text-sm text-gray-400 mb-1>Password *</label><input type=password value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} className=w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-indigo-500/50 /></div>
                <div><label className=block text-sm text-gray-400 mb-1>Name</label><input type=text value={newName} onChange={e => setNewName(e.target.value)} className=w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-indigo-500/50 /></div>
                <div><label className=block text-sm text-gray-400 mb-1>Role</label><select value={newRole} onChange={e => setNewRole(e.target.value)} className=w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-indigo-500/50><option value=viewer>Viewer</option><option value=editor>Editor</option><option value=admin>Admin</option></select></div>
                <div className=flex gap-3 pt-2><button type=submit className=flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-semibold transition>Create</button><button type=button onClick={() => setShowCreate(false)} className=px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold transition>Cancel</button></div>
              </form>
            </div>
          </div>
        )}

        <div className=border border-gray-800 rounded-xl overflow-hidden>
          <table className=w-full>
            <thead>
              <tr className=border-b border-gray-800 bg-gray-900/50>
                <th className=text-left px-6 py-4 text-sm text-gray-400 font-semibold>User</th>
                <th className=text-left px-6 py-4 text-sm text-gray-400 font-semibold>Email</th>
                <th className=text-left px-6 py-4 text-sm text-gray-400 font-semibold>Role</th>
                <th className=text-left px-6 py-4 text-sm text-gray-400 font-semibold>Created</th>
                <th className=text-right px-6 py-4 text-sm text-gray-400 font-semibold>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className=text-center py-12 text-gray-500><Loader2 className=w-6 h-6 animate-spin mx-auto mb-2 />Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className=text-center py-12 text-gray-500>No users found</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className=border-b border-gray-800/50 hover:bg-gray-900/30 transition>
                  <td className=px-6 py-4><div className=flex items-center gap-3><div className=w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold>{u.name.charAt(0).toUpperCase()}</div><span className=font-semibold>{u.name}</span></div></td>
                  <td className=px-6 py-4 text-gray-400>{u.email}</td>
                  <td className=px-6 py-4>
                    <select value={u.role} onChange={e => updateRole(u.id, e.target.value)} className={'px-3 py-1.5 rounded-lg text-xs font-semibold border ' + (roleColors[u.role] || roleColors.viewer)}>
                      <option value=viewer>Viewer</option>
                      <option value=editor>Editor</option>
                      <option value=admin>Admin</option>
                    </select>
                  </td>
                  <td className=px-6 py-4 text-sm text-gray-500>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className=px-6 py-4 text-right>
                    {u.id !== 'admin-default' && (
                      <button onClick={() => deleteUser(u.id)} className=px-3 py-1.5 bg-red-900/20 border border-red-800/50 rounded-lg text-xs text-red-400 hover:bg-red-900/40 transition><Trash2 className=w-4 h-4 /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
