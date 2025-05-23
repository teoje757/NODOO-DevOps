const express = require('express');
const promClient = require('prom-client');

const app = express();

// ===== Prometheus Metrics Setup =====
// Enable default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({ timeout: 5000 });

// Create custom metrics
const httpRequestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'endpoint', 'status']
});

const activeTasksGauge = new promClient.Gauge({
  name: 'nodoo_active_tasks',
  help: 'Current number of tasks in the list'
});

const completedTasksGauge = new promClient.Gauge({
  name: 'nodoo_completed_tasks',
  help: 'Current number of completed tasks'
});

// Middleware to track requests
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({
      method: req.method,
      endpoint: req.path,
      status: res.statusCode
    });
  });
  next();
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  // Update task metrics
  activeTasksGauge.set(app.locals.tasks.length);
  completedTasksGauge.set(app.locals.tasks.filter(t => t.completed).length);
  
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

// ===== Your Existing App Code =====
// Enable form data and JSON body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// In-memory task list
let tasks = [];
app.locals.tasks = tasks;

// Route: GET /
app.get('/', (req, res) => res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NODOO | To Do List App</title>
  <!-- Inline CSS styles for iOS-style UI -->
  <style>
    :root {
      --system-blue: #007AFF;
      --system-gray: #F2F2F7;
      --system-red: #FF3B30;
      --font-size-large: 24px;
    }
    * {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      background-color: var(--system-gray);
      min-height: 100vh;
      font-size: var(--font-size-large);
    }
    header {
      font-size: 45px !important; /* Huge header */
      font-weight: 700;
      margin: 40px 0 !important;
      margin: 30px 0; 
      color: #000;
    }
    .add-task {
      display: flex;
      margin-bottom: 15px;
    }
    .add-task input {
      flex: 1;
      padding: 20px 25px !important; /* Bigger input field */
      border: none;
      border-radius: 15px;
      font-size: 24px !important; /* Larger text */
      background: white;
    }
    .add-task button {
      background: var(--system-blue);
      color: white;
      border: none;
      border-radius: 15px;
      padding: 0 30px !important;
      margin-left: 15px;
      font-size: 24px !important;
      font-weight: 600;
      height: 70px; /* Fixed height for consistency */
    }
    .task-list {
      background: white;
      border-radius: 10px;
      overflow: hidden;
    }
    .task-item {
      display: flex;
      align-items: center;
      padding: 20px 25px !important; /* Bigger task items */
      border-bottom: 2px solid rgba(0,0,0,0.05);
    }
    .task-item:last-child {
      border-bottom: none;
    }
    .task-checkbox {
      width: 28px !important; /* Bigger checkbox */
      height: 28px !important;
      margin-right: 25px !important;
    }
    .task-text {
      flex: 1;
      font-size: 24px !important; /* Bigger task text */
    }
    .task-text.completed {
      text-decoration: line-through;
      color: #888;
    }
    .delete-btn {
      background: none;
      border: none;
      color: var(--system-red);
      font-size: 24px !important; 
      padding: 10px 20px !important;
    }
    .bulk-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 30px !important;
    }
    .bulk-btn {
      padding: 15px 30px !important; /* Bigger bulk buttons */
      font-size: 24px !important;
      background: var(--system-red);
      color: white;
      border: none;
      border-radius: 10px;
    }
    body {
      max-width: 555px;
      margin: 0 auto;
      padding: 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
    }
  </style>
</head>
<body>
  <header>NODOO - Note and Do</header>


  <!-- Task input form -->
  <form class="add-task" action="/add" method="POST">
    <input type="text" name="task" placeholder="New task" required>
    <button type="submit">Add</button>
  </form>

  <!-- Render task list dynamically -->
  <div class="task-list">
    ${app.locals.tasks.map((task, index) => `
      <div class="task-item">
        <input 
          type="checkbox" 
          class="task-checkbox" 
          onchange="toggleTask(${index})"
          ${task.completed ? 'checked' : ''}
        >
        <span class="task-text ${task.completed ? 'completed' : ''}">
          ${task.text}
        </span>
        <button 
          class="delete-btn"
          onclick="deleteTask(${index})"
        >Delete</button>
      </div>
    `).join('')}
  </div>

  <!-- Bulk action buttons -->
  ${app.locals.tasks.length > 0 ? `
    <div class="bulk-actions">
      <button class="bulk-btn" onclick="clearCompleted()">
        Clear Completed!
      </button>
      <button class="bulk-btn" onclick="deleteAll()">
        Delete All
      </button>
    </div>
  ` : ''}

  <!-- Client-side JavaScript for interacting with API -->
  <script>
    function toggleTask(index) {
      fetch('/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index })
      }).then(() => window.location.reload());
    }

    function deleteTask(index) {
      fetch('/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index })
      }).then(() => window.location.reload());
    }

    function clearCompleted() {
      fetch('/clear-completed', {
        method: 'POST'
      }).then(() => window.location.reload());
    }

    function deleteAll() {
      fetch('/delete-all', {
        method: 'POST'
      }).then(() => window.location.reload());
    }
  </script>
</body>
</html>
`));

// Endpoint: Add a new task
app.post('/add', (req, res) => {
  app.locals.tasks.push({ text: req.body.task, completed: false });
  res.redirect('/');
});

// Endpoint: Toggle task completion
app.post('/toggle', (req, res) => {
  const { index } = req.body;
  if (app.locals.tasks[index]) {
    app.locals.tasks[index].completed = !app.locals.tasks[index].completed;
  }
  res.sendStatus(200);
});

// Endpoint: Delete a task by index
app.post('/delete', (req, res) => {
  app.locals.tasks.splice(req.body.index, 1);
  res.sendStatus(200);
});

// Endpoint: Remove all completed tasks
app.post('/clear-completed', (req, res) => {
  app.locals.tasks = app.locals.tasks.filter(task => !task.completed);
  res.sendStatus(200);
});

// Endpoint: Remove all tasks
app.post('/delete-all', (req, res) => {
  app.locals.tasks = [];
  res.sendStatus(200);
});

// Export app for test scripts
module.exports = app;

// Start the server only when run directly
if (require.main === module) {
  app.listen(3000, () => console.log('NODOO app running on http://localhost:3000'));
}