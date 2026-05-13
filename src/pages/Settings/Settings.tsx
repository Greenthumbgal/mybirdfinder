// ============================================================
// MyBirdFinder — Settings / Data Tools
// Export, Import, Clear, Restore sample data, Account management.
// ============================================================

import { useRef, useState } from 'react';
import { Sighting, User } from '../../types';
import { exportJSON, exportCSV } from '../../utils/helpers';
import { SAMPLE_SIGHTINGS } from '../../data/sampleData';
import './Settings.css';

interface SettingsProps {
  sightings: Sighting[];
  currentUser: User;
  onImport: (sightings: Sighting[]) => void;
  onClear: () => void;
  onRestore: () => void;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
}

export default function Settings({
  sightings, currentUser, onImport, onClear, onRestore, onUpdateUser, onLogout,
}: SettingsProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [restoreConfirm, setRestoreConfirm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Account edit state
  const [editingAccount, setEditingAccount] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [email, setEmail]             = useState(currentUser.email);
  const [newPw, setNewPw]             = useState('');
  const [confirmPw, setConfirmPw]     = useState('');
  const [acctErrors, setAcctErrors]   = useState<Record<string, string>>({});

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string) as Sighting[];
        if (!Array.isArray(data)) throw new Error('Not an array');
        onImport(data);
        showToast(`✅ Imported ${data.length} sightings!`);
      } catch {
        showToast('❌ Invalid file — please use a MyBirdFinder JSON export.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleSaveAccount(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!displayName.trim()) errs.displayName = 'Name cannot be empty';
    if (!email.trim() || !email.includes('@')) errs.email = 'Enter a valid email';
    if (newPw && newPw.length < 6) errs.newPw = 'Password must be at least 6 characters';
    if (newPw && newPw !== confirmPw) errs.confirmPw = 'Passwords do not match';
    if (Object.keys(errs).length) { setAcctErrors(errs); return; }

    const updated: User = {
      ...currentUser,
      displayName: displayName.trim(),
      email: email.trim().toLowerCase(),
      password: newPw || currentUser.password,
    };
    onUpdateUser(updated);
    setEditingAccount(false);
    setNewPw('');
    setConfirmPw('');
    setAcctErrors({});
    showToast('✅ Account updated!');
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">⚙️ Settings & Data</h1>
          <p className="page-subtitle">Manage your MyBirdFinder account and data</p>
        </div>
      </div>

      {toast && <div className="save-toast">{toast}</div>}

      {/* ── Account ─────────────────────────────────────────── */}
      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-acct-avatar">
            {currentUser.displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <h3 style={{ margin: 0 }}>{currentUser.displayName}</h3>
            <p style={{ margin: 0 }}>@{currentUser.username} · {currentUser.email}</p>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            style={{ marginLeft: 'auto' }}
            onClick={() => setEditingAccount(!editingAccount)}
          >
            {editingAccount ? 'Cancel' : '✏️ Edit Account'}
          </button>
        </div>

        {editingAccount && (
          <form className="acct-edit-form" onSubmit={handleSaveAccount} noValidate>
            <div className="form-row">
              <div className="form-field">
                <label className="auth-label" htmlFor="acct-name">Display Name</label>
                <input
                  id="acct-name"
                  className={`auth-input ${acctErrors.displayName ? 'auth-input--error' : ''}`}
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                />
                {acctErrors.displayName && <p className="auth-field-error">{acctErrors.displayName}</p>}
                <p className="field-hint">Used in your greeting — "Good morning, {displayName}!"</p>
              </div>
              <div className="form-field">
                <label className="auth-label" htmlFor="acct-email">Email Address</label>
                <input
                  id="acct-email"
                  type="email"
                  className={`auth-input ${acctErrors.email ? 'auth-input--error' : ''}`}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                {acctErrors.email && <p className="auth-field-error">{acctErrors.email}</p>}
                <p className="field-hint">Used to recover your password</p>
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label className="auth-label" htmlFor="acct-pw">New Password</label>
                <input
                  id="acct-pw"
                  type="password"
                  className={`auth-input ${acctErrors.newPw ? 'auth-input--error' : ''}`}
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  placeholder="Leave blank to keep current"
                />
                {acctErrors.newPw && <p className="auth-field-error">{acctErrors.newPw}</p>}
              </div>
              <div className="form-field">
                <label className="auth-label" htmlFor="acct-cpw">Confirm New Password</label>
                <input
                  id="acct-cpw"
                  type="password"
                  className={`auth-input ${acctErrors.confirmPw ? 'auth-input--error' : ''}`}
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  placeholder="Repeat new password"
                />
                {acctErrors.confirmPw && <p className="auth-field-error">{acctErrors.confirmPw}</p>}
              </div>
            </div>
            <div className="settings-actions">
              <button type="submit" className="btn btn-primary">💾 Save Changes</button>
              <button type="button" className="btn btn-ghost" onClick={() => setEditingAccount(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      {/* ── Data summary ──────────────────────────────────────── */}
      <div className="settings-card settings-card--info">
        <h3>📦 Your Data</h3>
        <p>You have <strong>{sightings.length}</strong> sightings saved locally on this device.</p>
        <p className="field-hint">
          MyBirdFinder stores all data in your browser's localStorage.
          No data leaves your device.
        </p>
      </div>

      {/* ── Export ────────────────────────────────────────────── */}
      <div className="settings-card">
        <h3>⬇️ Export Data</h3>
        <p>Download a backup of all your sightings.</p>
        <div className="settings-actions">
          <button
            className="btn btn-primary"
            onClick={() => { exportJSON(sightings); showToast('✅ JSON file downloaded!'); }}
            disabled={sightings.length === 0}
          >
            📄 Export as JSON
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => { exportCSV(sightings); showToast('✅ CSV file downloaded!'); }}
            disabled={sightings.length === 0}
          >
            📊 Export as CSV
          </button>
        </div>
        {sightings.length === 0 && <p className="field-hint">No sightings to export yet.</p>}
      </div>

      {/* ── Import ────────────────────────────────────────────── */}
      <div className="settings-card">
        <h3>⬆️ Import Data</h3>
        <p>Load sightings from a MyBirdFinder JSON backup file.</p>
        <p className="field-hint">⚠️ This will <strong>replace</strong> your current data. Export a backup first!</p>
        <div className="settings-actions">
          <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
            📂 Choose JSON File
          </button>
        </div>
        <input ref={fileRef} type="file" accept=".json" className="hidden-input" onChange={handleImport} />
      </div>

      {/* ── Restore sample data ───────────────────────────────── */}
      <div className="settings-card">
        <h3>🌿 Restore Sample Data</h3>
        <p>Load {SAMPLE_SIGHTINGS.length} demonstration sightings to explore the app.</p>
        <p className="field-hint">This will replace your current data.</p>
        <div className="settings-actions">
          {restoreConfirm ? (
            <>
              <button
                className="btn btn-primary"
                onClick={() => { onRestore(); setRestoreConfirm(false); showToast('🌿 Sample data restored!'); }}
              >
                Yes, restore sample data
              </button>
              <button className="btn btn-ghost" onClick={() => setRestoreConfirm(false)}>Cancel</button>
            </>
          ) : (
            <button className="btn btn-ghost" onClick={() => setRestoreConfirm(true)}>
              🔄 Restore Sample Data
            </button>
          )}
        </div>
      </div>

      {/* ── Clear data ────────────────────────────────────────── */}
      <div className="settings-card settings-card--danger">
        <h3>🗑️ Clear All Data</h3>
        <p>Permanently delete all your sightings. This cannot be undone.</p>
        <div className="settings-actions">
          {clearConfirm ? (
            <>
              <button
                className="btn btn-danger"
                onClick={() => { onClear(); setClearConfirm(false); showToast('✅ All data cleared.'); }}
              >
                Yes, delete everything
              </button>
              <button className="btn btn-ghost" onClick={() => setClearConfirm(false)}>Cancel</button>
            </>
          ) : (
            <button
              className="btn btn-danger-outline"
              onClick={() => setClearConfirm(true)}
              disabled={sightings.length === 0}
            >
              🗑️ Clear All Data
            </button>
          )}
        </div>
      </div>

      {/* ── Sign out ──────────────────────────────────────────── */}
      <div className="settings-card">
        <h3>🔓 Sign Out</h3>
        <p>Sign out of your account. Your data will still be here when you come back.</p>
        <div className="settings-actions">
          <button className="btn btn-ghost" onClick={onLogout}>
            ↩ Sign Out
          </button>
        </div>
      </div>

      {/* ── About ─────────────────────────────────────────────── */}
      <div className="settings-card settings-about">
        <div className="about-logo">🐦</div>
        <h3>MyBirdFinder</h3>
        <p>A backyard bird journal for bird lovers everywhere.</p>
        <p className="field-hint">Version 1.0 · Built with React + Vite · Data stored locally</p>
      </div>
    </div>
  );
}
