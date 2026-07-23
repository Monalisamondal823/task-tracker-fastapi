import { useAuth } from '../contexts/AuthContext';

function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Profile</p>
          <h1>Account details</h1>
          <p className="muted">Your profile information is kept private and secure.</p>
        </div>
      </div>

      <section className="content-card">
        <div className="profile-grid">
          <div>
            <p className="label">Email</p>
            <p>{user?.email || '—'}</p>
          </div>
          <div>
            <p className="label">Joined at</p>
            <p>{user?.created_at ? new Date(user.created_at).toLocaleString() : '—'}</p>
          </div>
          <div>
            <p className="label">User ID</p>
            <p>{user?.id || '—'}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProfilePage;
