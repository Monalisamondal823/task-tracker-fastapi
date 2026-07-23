import { useEffect, useState } from 'react';
import * as taskService from '../services/taskService';
import { useToast } from '../components/ToastProvider';

function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    async function loadTasks() {
      try {
        const data = await taskService.fetchTasks();
        setTasks(data);
      } catch (error) {
        toast({ message: error.response?.data?.detail || 'Could not load tasks', type: 'error' });
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, [toast]);

  const refreshTasks = async () => {
    try {
      const data = await taskService.fetchTasks();
      setTasks(data);
    } catch (error) {
      toast({ message: error.response?.data?.detail || 'Could not refresh tasks', type: 'error' });
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!title.trim()) {
      toast({ message: 'Task title is required', type: 'warning' });
      return;
    }

    setSaving(true);
    try {
      await taskService.createTask(title.trim(), description.trim());
      setTitle('');
      setDescription('');
      toast({ message: 'Task created successfully', type: 'success' });
      await refreshTasks();
    } catch (error) {
      toast({ message: error.response?.data?.detail || 'Unable to create task', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (task) => {
    try {
      await taskService.updateTask(task.id, { is_done: !task.is_done });
      await refreshTasks();
      toast({ message: 'Task status updated', type: 'success' });
    } catch (error) {
      toast({ message: error.response?.data?.detail || 'Unable to update task', type: 'error' });
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      setTasks((current) => current.filter((item) => item.id !== taskId));
      toast({ message: 'Task deleted', type: 'success' });
    } catch (error) {
      toast({ message: error.response?.data?.detail || 'Unable to delete task', type: 'error' });
    }
  };

  const handleFileChange = async (taskId, file) => {
    if (!file) {
      return;
    }

    try {
      await taskService.uploadAttachment(taskId, file);
      toast({ message: 'Attachment uploaded', type: 'success' });
      await refreshTasks();
    } catch (error) {
      toast({ message: error.response?.data?.detail || 'Upload failed', type: 'error' });
    }
  };

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Tasks</p>
          <h1>Manage your work</h1>
          <p className="muted">Create tasks, update status, upload attachments, and keep your project moving.</p>
        </div>
      </header>

      <section className="content-card">
        <h2>Create a new task</h2>
        <form onSubmit={handleCreate} className="form-grid">
          <label>
            Title
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Task title"
              required
            />
          </label>
          <label>
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional task description"
              rows="4"
            />
          </label>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Create task'}
          </button>
        </form>
      </section>

      <section className="content-card">
        <div className="content-row">
          <h2>Your tasks</h2>
          <button onClick={refreshTasks} className="btn-secondary">
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="loading-block">Loading tasks…</div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">No tasks found. Use the form above to create one.</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Attachment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>{task.is_done ? 'Done' : 'Open'}</td>
                    <td>
                      {task.attachment_url ? (
                        <a href={task.attachment_url} target="_blank" rel="noreferrer">
                          view
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="task-actions">
                      <button onClick={() => handleToggle(task)} className="btn-secondary-sm">
                        {task.is_done ? 'Reopen' : 'Complete'}
                      </button>
                      <button onClick={() => handleDelete(task.id)} className="btn-danger-sm">
                        Delete
                      </button>
                      <label className="file-upload">
                        <input
                          type="file"
                          onChange={(event) => handleFileChange(task.id, event.target.files?.[0])}
                        />
                        Upload
                      </label>
                    </td>
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

export default TasksPage;
