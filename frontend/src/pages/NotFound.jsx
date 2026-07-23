import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="page-shell">
      <section className="content-card centered-card">
        <h1>Page not found</h1>
        <p>The page you are looking for doesn't exist.</p>
        <Link to="/" className="btn-secondary">
          Return home
        </Link>
      </section>
    </div>
  );
}

export default NotFoundPage;
