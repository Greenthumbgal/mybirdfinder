// ============================================================
// MyBirdFinder — Auth Page
// Login, Register, and Forgot Password — all localStorage based.
// No backend required for MVP.
// ============================================================

import { useState } from 'react';
import { User } from '../../types';
import { genId } from '../../utils/helpers';
import './Auth.css';

type AuthTab = 'login' | 'register' | 'forgot';

interface AuthPageProps {
  users: User[];
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
}

export default function AuthPage({ users, onLogin, onRegister }: AuthPageProps) {
  const [tab, setTab] = useState<AuthTab>('login');

  return (
    <div className="auth-page">
      {/* Brand hero */}
      <div className="auth-hero">
        <div className="auth-brand-icon">🐦</div>
        <h1 className="auth-brand-name">MyBirdFinder</h1>
        <p className="auth-brand-tagline">Your personal backyard bird journal</p>
      </div>

      <div className="auth-card">
        {tab === 'login'   && <LoginForm   users={users} onLogin={onLogin}   onSwitch={setTab} />}
        {tab === 'register' && <RegisterForm users={users} onRegister={onRegister} onSwitch={setTab} />}
        {tab === 'forgot'  && <ForgotForm  users={users} onSwitch={setTab} />}
      </div>

      <p className="auth-footer">🌿 Your data stays private on your device</p>
    </div>
  );
}

// ── Login ─────────────────────────────────────────────────────

function LoginForm({
  users,
  onLogin,
  onSwitch,
}: {
  users: User[];
  onLogin: (u: User) => void;
  onSwitch: (t: AuthTab) => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const user = users.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase()
    );
    if (!user) {
      setError('No account found with that username.');
      return;
    }
    if (user.password !== password) {
      setError('Incorrect password. Try again or use Forgot Password.');
      return;
    }
    onLogin(user);
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h2 className="auth-form-title">Welcome back! 👋</h2>
      <p className="auth-form-sub">Sign in to your backyard journal</p>

      {error && <div className="auth-error">{error}</div>}

      <div className="auth-field">
        <label className="auth-label" htmlFor="login-username">Username</label>
        <input
          id="login-username"
          className="auth-input"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="your username"
          autoComplete="username"
          autoFocus
        />
      </div>

      <div className="auth-field">
        <label className="auth-label" htmlFor="login-password">Password</label>
        <div className="auth-pw-wrap">
          <input
            id="login-password"
            className="auth-input"
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <button
            type="button"
            className="auth-pw-toggle"
            onClick={() => setShowPw(!showPw)}
            tabIndex={-1}
          >
            {showPw ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      <button type="submit" className="btn btn-primary btn-full">
        Sign In 🐦
      </button>

      <div className="auth-links">
        <button type="button" className="auth-link" onClick={() => onSwitch('forgot')}>
          Forgot password?
        </button>
        <span className="auth-links-sep">·</span>
        <button type="button" className="auth-link" onClick={() => onSwitch('register')}>
          Create an account
        </button>
      </div>
    </form>
  );
}

// ── Register ──────────────────────────────────────────────────

function RegisterForm({
  users,
  onRegister,
  onSwitch,
}: {
  users: User[];
  onRegister: (u: User) => void;
  onSwitch: (t: AuthTab) => void;
}) {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername]       = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirm, setConfirm]         = useState('');
  const [showPw, setShowPw]           = useState(false);
  const [errors, setErrors]           = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!displayName.trim())  e.displayName = 'Please enter your first name';
    if (!username.trim())     e.username    = 'Please choose a username';
    if (username.includes(' ')) e.username  = 'Username cannot contain spaces';
    if (users.some(u => u.username.toLowerCase() === username.trim().toLowerCase()))
      e.username = 'That username is already taken';
    if (!email.trim() || !email.includes('@'))
      e.email = 'Please enter a valid email address';
    if (password.length < 6)  e.password   = 'Password must be at least 6 characters';
    if (password !== confirm)  e.confirm    = 'Passwords do not match';
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const newUser: User = {
      id: genId(),
      username: username.trim().toLowerCase(),
      displayName: displayName.trim(),
      email: email.trim().toLowerCase(),
      password,
      createdAt: new Date().toISOString(),
    };
    onRegister(newUser);
  }

  function f(key: string, val: string, setter: (v: string) => void) {
    setter(val);
    if (errors[key]) setErrors(prev => { const n = {...prev}; delete n[key]; return n; });
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h2 className="auth-form-title">Create your account 🌿</h2>
      <p className="auth-form-sub">Set up your personal bird journal</p>

      <div className="auth-field">
        <label className="auth-label" htmlFor="reg-name">Your First Name</label>
        <input
          id="reg-name"
          className={`auth-input ${errors.displayName ? 'auth-input--error' : ''}`}
          value={displayName}
          onChange={e => f('displayName', e.target.value, setDisplayName)}
          placeholder="e.g. Sophie"
          autoFocus
        />
        {errors.displayName && <p className="auth-field-error">{errors.displayName}</p>}
        <p className="auth-field-hint">This is how we'll greet you — "Good morning, Sophie!"</p>
      </div>

      <div className="auth-field">
        <label className="auth-label" htmlFor="reg-username">Username</label>
        <input
          id="reg-username"
          className={`auth-input ${errors.username ? 'auth-input--error' : ''}`}
          value={username}
          onChange={e => f('username', e.target.value, setUsername)}
          placeholder="e.g. sophie_birds"
          autoComplete="username"
        />
        {errors.username && <p className="auth-field-error">{errors.username}</p>}
        <p className="auth-field-hint">Used to log in — no spaces allowed</p>
      </div>

      <div className="auth-field">
        <label className="auth-label" htmlFor="reg-email">Email Address</label>
        <input
          id="reg-email"
          type="email"
          className={`auth-input ${errors.email ? 'auth-input--error' : ''}`}
          value={email}
          onChange={e => f('email', e.target.value, setEmail)}
          placeholder="you@example.com"
          autoComplete="email"
        />
        {errors.email && <p className="auth-field-error">{errors.email}</p>}
        <p className="auth-field-hint">Used to recover your password if you forget it</p>
      </div>

      <div className="auth-field">
        <label className="auth-label" htmlFor="reg-password">Password</label>
        <div className="auth-pw-wrap">
          <input
            id="reg-password"
            className={`auth-input ${errors.password ? 'auth-input--error' : ''}`}
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={e => f('password', e.target.value, setPassword)}
            placeholder="at least 6 characters"
            autoComplete="new-password"
          />
          <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(!showPw)} tabIndex={-1}>
            {showPw ? '🙈' : '👁️'}
          </button>
        </div>
        {errors.password && <p className="auth-field-error">{errors.password}</p>}
      </div>

      <div className="auth-field">
        <label className="auth-label" htmlFor="reg-confirm">Confirm Password</label>
        <input
          id="reg-confirm"
          className={`auth-input ${errors.confirm ? 'auth-input--error' : ''}`}
          type={showPw ? 'text' : 'password'}
          value={confirm}
          onChange={e => f('confirm', e.target.value, setConfirm)}
          placeholder="repeat your password"
          autoComplete="new-password"
        />
        {errors.confirm && <p className="auth-field-error">{errors.confirm}</p>}
      </div>

      <button type="submit" className="btn btn-primary btn-full">
        Create Account 🎉
      </button>

      <div className="auth-links">
        <span>Already have an account?</span>
        <button type="button" className="auth-link" onClick={() => onSwitch('login')}>
          Sign in
        </button>
      </div>
    </form>
  );
}

// ── Forgot Password ───────────────────────────────────────────

function ForgotForm({
  users,
  onSwitch,
}: {
  users: User[];
  onSwitch: (t: AuthTab) => void;
}) {
  const [email, setEmail]       = useState('');
  const [found, setFound]       = useState<User | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [newPw, setNewPw]       = useState('');
  const [confirm, setConfirm]   = useState('');
  const [pwError, setPwError]   = useState('');
  const [done, setDone]         = useState(false);
  const [showPw, setShowPw]     = useState(false);

  // We can't actually send emails in MVP, so we look up the account by email
  // and let the user reset their password directly (local-only).
  function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (user) { setFound(user); setNotFound(false); }
    else       { setNotFound(true); setFound(null); }
  }

  function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setPwError('');
    if (newPw.length < 6) { setPwError('Password must be at least 6 characters'); return; }
    if (newPw !== confirm) { setPwError('Passwords do not match'); return; }
    // Update password in the users array in localStorage directly
    const allUsers: User[] = JSON.parse(localStorage.getItem('mybirdFinder-users') || '[]');
    const updated = allUsers.map(u =>
      u.id === found!.id ? { ...u, password: newPw } : u
    );
    localStorage.setItem('mybirdFinder-users', JSON.stringify(updated));
    setDone(true);
  }

  if (done) {
    return (
      <div className="auth-form">
        <div className="auth-success-icon">✅</div>
        <h2 className="auth-form-title">Password updated!</h2>
        <p className="auth-form-sub">You can now sign in with your new password.</p>
        <button className="btn btn-primary btn-full" onClick={() => onSwitch('login')}>
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="auth-form">
      <h2 className="auth-form-title">Forgot your password? 🔑</h2>
      <p className="auth-form-sub">
        Enter the email address on your account and we'll look it up.
      </p>

      {!found ? (
        <form onSubmit={handleLookup} noValidate>
          <div className="auth-field">
            <label className="auth-label" htmlFor="forgot-email">Your Email Address</label>
            <input
              id="forgot-email"
              type="email"
              className={`auth-input ${notFound ? 'auth-input--error' : ''}`}
              value={email}
              onChange={e => { setEmail(e.target.value); setNotFound(false); }}
              placeholder="you@example.com"
              autoFocus
            />
            {notFound && (
              <p className="auth-field-error">
                No account found with that email address.
              </p>
            )}
          </div>
          <button type="submit" className="btn btn-primary btn-full">
            Look Up My Account
          </button>
        </form>
      ) : (
        <form onSubmit={handleReset} noValidate>
          <div className="auth-found-banner">
            <span className="auth-found-icon">🐦</span>
            <div>
              <div className="auth-found-name">Found: <strong>{found.displayName}</strong></div>
              <div className="auth-found-user">@{found.username}</div>
            </div>
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="reset-pw">New Password</label>
            <div className="auth-pw-wrap">
              <input
                id="reset-pw"
                className="auth-input"
                type={showPw ? 'text' : 'password'}
                value={newPw}
                onChange={e => { setNewPw(e.target.value); setPwError(''); }}
                placeholder="at least 6 characters"
                autoFocus
              />
              <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(!showPw)} tabIndex={-1}>
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="reset-confirm">Confirm New Password</label>
            <input
              id="reset-confirm"
              className="auth-input"
              type={showPw ? 'text' : 'password'}
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setPwError(''); }}
              placeholder="repeat new password"
            />
            {pwError && <p className="auth-field-error">{pwError}</p>}
          </div>
          <button type="submit" className="btn btn-primary btn-full">
            Reset Password
          </button>
        </form>
      )}

      <div className="auth-links">
        <button type="button" className="auth-link" onClick={() => onSwitch('login')}>
          ← Back to Sign In
        </button>
      </div>
    </div>
  );
}
