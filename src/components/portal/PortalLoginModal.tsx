import React, { useState } from 'react';
import { setSessionCsrf } from '../../services/session';
import type { UserProfile } from '../../types';

export function PortalLoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile, token: string) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [token] = useState(() => {
    const value = new URLSearchParams(location.search).has('activate')
      ? location.hash.slice(1)
      : '';
    if (value)
      history.replaceState(null, '', location.pathname + '?activate=1');
    return value;
  });
  const [activation, setActivation] = useState(!!token);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  if (!isOpen) return null;
  return (
    <div className="campus-modal">
      <section className="campus-panel" style={{ maxWidth: 480 }}>
        <div className="campus-eyebrow">GWOAH’S UNIVERSITY</div>
        <h2
          style={{
            fontFamily: 'Georgia,serif',
            fontSize: 32,
            margin: '18px 0',
          }}
        >
          {activation ? 'Activate your account' : 'Welcome back.'}
        </h2>
        <p className="campus-muted">
          {activation
            ? 'Choose a private password of at least 12 characters. This activation link can only be used once.'
            : 'Sign in with your university account. Your access is determined by your assigned role.'}
        </p>
        <form
          className="campus-form"
          style={{ gridTemplateColumns: '1fr' }}
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setMessage('');
            try {
              if (activation && password !== confirm)
                throw Error('Passwords do not match.');
              const response = await fetch(
                activation ? '/api/auth/activate' : '/api/auth/login',
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(
                    activation ? { token, password } : { email, password },
                  ),
                },
              );
              const data = await response.json();
              if (!response.ok) throw Error(data.error);
              if (activation) {
                setActivation(false);
                setPassword('');
                setConfirm('');
                setMessage(
                  'Account activated. Sign in with your email and new password.',
                );
              } else {
                setSessionCsrf(data.csrf);
                onLoginSuccess(data.user, '');
                setPassword('');
              }
            } catch (e) {
              setMessage(e instanceof Error ? e.message : 'Unable to sign in.');
            } finally {
              setBusy(false);
            }
          }}
        >
          {!activation && (
            <label>
              University email
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
          )}
          <label>
            {activation ? 'Choose password' : 'Password'}
            <input
              type="password"
              autoComplete={activation ? 'new-password' : 'current-password'}
              minLength={activation ? 12 : undefined}
              maxLength={128}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {activation && (
            <label>
              Confirm password
              <input
                type="password"
                autoComplete="new-password"
                minLength={12}
                maxLength={128}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </label>
          )}
          <button className="campus-button" disabled={busy}>
            {busy
              ? 'Please wait…'
              : activation
                ? 'Activate account'
                : 'Sign in'}
          </button>
          <p role="status" className="campus-status">
            {message}
          </p>
        </form>
        {!activation && <button className="campus-button secondary" disabled={busy} onClick={async()=>{
          if(!email.trim()){setMessage('Enter your university email above first.');return;}
          setBusy(true);
          try{const response=await fetch('/api/auth/forgot-password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})});const result=await response.json();if(!response.ok)throw Error(result.error);setMessage('If your account can receive recovery email, a private link will be sent. Otherwise contact the university administrator.');}catch(error){setMessage(error instanceof Error?error.message:'Could not request account recovery.');}finally{setBusy(false);}
        }}>Request password recovery</button>}
        <button className="campus-button secondary" onClick={onClose}>
          Back to university website
        </button>
        <p className="campus-muted" style={{ marginTop: 18 }}>
          Need access or a password reset? Contact the university administrator.
        </p>
      </section>
    </div>
  );
}
