import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastProvider';

function SettingsPage() {
  const { logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast({ message: 'You have been logged out.', type: 'success' });
      navigate('/login');
    } catch (error) {
      toast({ message: 'Unable to log out right now.', type: 'error' });
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Settings</p>
          <h1>Security and session</h1>
          <p className="muted">Logout to clear your session and protect your account.</p>
        </div>
      </div>

      <section className="content-card">
        <div className="content-row">
          <div>
            <p className="label">Authenticated sessions</p>
            <p>Only authenticated users can access the dashboard, tasks, profile, and file uploads.</p>
          </div>
          <button onClick={handleLogout} className="btn-danger">
            Logout
          </button>
        </div>
      </section>
    </div>
  );
}

export default SettingsPage;
