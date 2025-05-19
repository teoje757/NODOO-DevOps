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
  <!-- Your existing CSS styles -->
  <style>
    /* ... your existing styles ... */
  </style>
</head>
<body>
  <!-- Your existing HTML template -->
  ${/* ... your existing template code ... */''}
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