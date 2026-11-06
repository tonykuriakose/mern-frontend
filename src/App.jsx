import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api/tasks';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState(null);

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setTasks(data);
      setServerError(null);
    } catch (err) {
      setServerError('Could not connect to backend server. Make sure `npm run dev` is running in `backend`.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Add Task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok) throw new Error('Failed to add task');
      const created = await res.json();
      setTasks([created, ...tasks]);
      setTitle('');
      setDescription('');
    } catch (err) {
      alert(err.message);
    }
  };

  // Toggle Complete
  const toggleTask = async (task) => {
    try {
      const res = await fetch(`${API_BASE}/${task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed }),
      });
      if (!res.ok) throw new Error('Failed to update task');
      const updated = await res.json();
      setTasks(tasks.map((t) => (t._id === updated._id ? updated : t)));
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete Task
  const deleteTask = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete task');
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.length - completedCount;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="container">
      <header className="header">
        <div className="badge">MERN Stack Project</div>
        <h1>Git & GitHub Learning Playground</h1>
        <p className="subtitle">
          Practice Git commands from basics to advanced on this live full-stack application!
        </p>
      </header>

      {/* Feature: Task Statistics Dashboard */}
      <section className="stats-dashboard">
        <div className="stat-card">
          <span className="stat-label">Total Tasks</span>
          <span className="stat-value">{tasks.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Completed</span>
          <span className="stat-value text-success">{completedCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending</span>
          <span className="stat-value text-warning">{pendingCount}</span>
        </div>
        <div className="progress-container">
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <span className="progress-text">{progressPercent}% Completed</span>
        </div>
      </section>

      {serverError && (
        <div className="alert-banner">
          ⚠️ {serverError}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleAddTask} className="task-form">
        <input
          type="text"
          placeholder="New milestone or task (e.g. Master git cherry-pick)..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-title"
          required
        />
        <input
          type="text"
          placeholder="Short notes or command (optional)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-desc"
        />
        <button type="submit" className="btn-add">Add Task</button>
      </form>

      {/* Task List */}
      <section className="task-section">
        <h2>Your Tasks ({tasks.length})</h2>
        {loading ? (
          <p className="loading-state">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="empty-state">No tasks yet. Create your first task above!</p>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task._id} className={`task-card ${task.completed ? 'completed' : ''}`}>
                <div className="task-info" onClick={() => toggleTask(task)}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => {}}
                    className="task-checkbox"
                  />
                  <div>
                    <h3 className="task-title">{task.title}</h3>
                    {task.description && <p className="task-desc">{task.description}</p>}
                  </div>
                </div>
                <button
                  onClick={() => deleteTask(task._id)}
                  className="btn-delete"
                  title="Delete task"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

