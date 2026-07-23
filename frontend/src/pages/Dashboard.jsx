import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import * as taskService from '../services/taskService';
import { useToast } from '../components/ToastProvider';

function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    async function loadTasks() {
      try {
        const data = await taskService.fetchTasks();
        setTasks(data);
      } catch (error) {
        toast({ message: error.response?.data?.detail || 'Failed to load tasks', type: 'error' });
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, [toast]);

  const summary = useMemo(
    () => ({
      open: tasks.filter((task) => !task.is_done).length,
      completed: tasks.filter((task) => task.is_done).length,
      total: tasks.length,
    }),
    [tasks],
  );

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Your tasks at a glance</h1>
          <p className="muted">Tasks are automatically loaded for your account after login.</p>
        </div>
        <div className="page-actions">
          <Link to="/tasks" className="btn-secondary">
            Manage tasks
          </Link>
        </div>
      </header>

      <section className="summary-grid">
        <div className="summary-card">
          <span>Open</span>
          <strong>{summary.open}</strong>
        </div>
        <div className="summary-card">
          <span>Completed</span>
          <strong>{summary.completed}</strong>
        </div>
        <div className="summary-card">
          <span>Total</span>
          <strong>{summary.total}</strong>
        </div>
      </section>

      <section className="content-card">
        <div className="content-row">
          <h2>Recent tasks</h2>
          <Link to="/tasks" className="link-button">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="loading-block">Loading tasks…</div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">No tasks yet. Create one from the tasks page.</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Attachment</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {tasks.slice(0, 5).map((task) => (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>{task.is_done ? 'Done' : 'Open'}</td>
                    <td>{task.attachment_url ? <a href={task.attachment_url}>view</a> : '—'}</td>
                    <td>{task.created_at ? new Date(task.created_at).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default DashboardPage;
