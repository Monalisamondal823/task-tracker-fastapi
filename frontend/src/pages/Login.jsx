import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastProvider';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, user, initialized } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialized && user) {
      navigate('/');
    }
  }, [initialized, user, navigate]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      toast({ message: 'Login successful. Redirecting...', type: 'success' });
      navigate('/');
    } catch (error) {
      toast({ message: error.response?.data?.detail || error.message || 'Login failed', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="auth-card">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h1>Sign in to Task Tracker</h1>
          <p className="muted">Secure access to your dashboard, tasks, and settings.</p>
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
              placeholder="Enter your password"
            />
          </label>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="muted">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
