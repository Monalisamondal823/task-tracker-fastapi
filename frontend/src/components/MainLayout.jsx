import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function MainLayout({ children }) {
  const { user } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Task Tracker</p>
          <h1>Work faster with a single dashboard.</h1>
          <p className="muted">All of your tasks, files, and account pages are protected and private.</p>
        </div>

        <div className="top-nav">
          <nav>
            <Link to="/">Dashboard</Link>
            <Link to="/tasks">Tasks</Link>
            <Link to="/profile">Profile</Link>
            <Link to="/settings">Settings</Link>
          </nav>
          {user ? <div className="nav-user">Signed in as {user.email}</div> : null}
        </div>
      </header>

      {children}
    </div>
  );
}

export default MainLayout;
