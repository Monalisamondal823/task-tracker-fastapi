import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastProvider';
import * as authService from '../services/authService';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, user, initialized } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await authService.register(email, password);
      toast({ message: 'Registration successful. Signing you in…', type: 'success' });
      await login(email, password);
      navigate('/');
    } catch (error) {
      toast({ message: error.response?.data?.detail || error.message || 'Unable to register', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (initialized && user) {
    navigate('/');
  }

  return (
    <div className="page-shell">
      <div className="auth-card">
        <div>
          <p className="eyebrow">Create account</p>
          <h1>Sign up for Task Tracker</h1>
          <p className="muted">Start tracking tasks securely with email and password.</p>
        </div>

        <form onSubmit={onSubmit} className="form-grid">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="you@example.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              placeholder="Create a password"
            />
          </label>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>

          <p className="muted">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
