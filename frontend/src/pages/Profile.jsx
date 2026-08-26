import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Save, ShieldAlert, Key, UserCheck, Trash2 } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile, changePassword, deleteAccount } = useAuth();
  
  // Profile update state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setProfileError('Name and Email are required');
      return;
    }

    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      await updateProfile({ name, email });
      setProfileSuccess('Profile updated successfully');
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdError('All password fields are required');
      return;
    }
    if (newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('Passwords do not match');
      return;
    }

    setPwdLoading(true);
    setPwdError('');
    setPwdSuccess('');
    try {
      await changePassword(currentPassword, newPassword);
      setPwdSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwdError(err.message || 'Failed to change password');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      'WARNING: Are you sure you want to permanently delete your account? This action cannot be undone and all your posts will be lost.'
    );
    if (!confirmation) return;

    try {
      await deleteAccount();
    } catch (err) {
      alert(err.message || 'Failed to delete account');
    }
  };

  return (
    <main className="container" style={{ paddingBottom: '60px' }}>
      <div style={{ marginTop: '40px' }}>
        <h1>Account Settings</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your profile settings and secure your credentials</p>
      </div>

      <div className="profile-grid">
        {/* Profile Card */}
        <section className="glass-card profile-card">
          <h2 className="profile-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={20} style={{ color: 'var(--color-secondary)' }} />
            <span>Profile Details</span>
          </h2>

          {profileSuccess && (
            <div className="alert alert-success">
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="alert alert-danger">
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={profileLoading}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={profileLoading}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ marginTop: '10px' }}
              disabled={profileLoading}
            >
              <Save size={16} />
              <span>{profileLoading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </form>
        </section>

        {/* Change Password Card */}
        <section className="glass-card profile-card">
          <h2 className="profile-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={20} style={{ color: 'var(--color-primary)' }} />
            <span>Change Password</span>
          </h2>

          {pwdSuccess && (
            <div className="alert alert-success">
              <span>{pwdSuccess}</span>
            </div>
          )}

          {pwdError && (
            <div className="alert alert-danger">
              <span>{pwdError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={pwdLoading}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter new password (Min 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={pwdLoading}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={pwdLoading}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ marginTop: '10px' }}
              disabled={pwdLoading}
            >
              <Key size={16} />
              <span>{pwdLoading ? 'Updating...' : 'Update Password'}</span>
            </button>
          </form>
        </section>
      </div>

      {/* Danger Zone */}
      <section className="glass-card" style={{ padding: '32px', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
        <h2 className="profile-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'hsl(0, 100%, 75%)', borderBottomColor: 'rgba(239, 68, 68, 0.2)' }}>
          <ShieldAlert size={20} />
          <span>Danger Zone</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          Once you delete your account, there is no going back. Please be certain that you want to wipe all user account details and posts.
        </p>
        <button onClick={handleDeleteAccount} className="btn btn-danger">
          <Trash2 size={16} />
          <span>Delete Account</span>
        </button>
      </section>
    </main>
  );
}
