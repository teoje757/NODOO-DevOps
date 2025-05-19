const express = require('express');
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // For API endpoints

let tasks = [];

// iOS-inspired UI
app.get('/', (req, res) => res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NODOO | To Do List App</title>
  <style>
    :root {
      --system-blue: #007AFF;
      --system-gray: #F2F2F7;
      --system-red: #FF3B30;
    }
    * {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      max-width: 500px;
      margin: 0 auto;
      padding: 20px;
      background-color: var(--system-gray);
    }
    header {
      font-size: 28px;
      font-weight: 600;
      margin: 20px 0;
      color: #000;
    }
    .add-task {
      display: flex;
      margin-bottom: 15px;
    }
    .add-task input {
      flex: 1;
      padding: 12px 15px;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      background: white;
    }
    .add-task button {
      background: var(--system-blue);
      color: white;
      border: none;
      border-radius: 10px;
      padding: 0 20px;
      margin-left: 10px;
      font-size: 16px;
    }
    .task-list {
      background: white;
      border-radius: 10px;
      overflow: hidden;
    }
    .task-item {
      display: flex;
      align-items: center;
      padding: 12px 15px;
      border-bottom: 1px solid rgba(0,0,0,0.05);
    }
    .task-item:last-child {
      border-bottom: none;
    }
    .task-checkbox {
      margin-right: 15px;
      accent-color: var(--system-blue);
    }
    .task-text {
      flex: 1;
    }
    .task-text.completed {
      text-decoration: line-through;
      color: #888;
    }
    .delete-btn {
      background: none;
      border: none;
      color: var(--system-red);
      font-size: 16px;
    }
    .bulk-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 15px;
    }
    .bulk-btn {
      background: var(--system-red);
      color: white;
      border: none;
      border-radius: 10px;
      padding: 10px 15px;
    }
  </style>
</head>
<body>
  <header>NODOO - Note and Do</header>
  
  <form class="add-task" action="/add" method="POST">
    <input type="text" name="task" placeholder="New task" required>
    <button type="submit">Add</button>
  </form>

  <div class="task-list">
    ${tasks.map((task, index) => `
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

  ${tasks.length > 0 ? `
    <div class="bulk-actions">
      <button class="bulk-btn" onclick="clearCompleted()">
        Clear Completed
      </button>
      <button class="bulk-btn" onclick="deleteAll()">
        Delete All
      </button>
    </div>
  ` : ''}

  <script>
    // Client-side functions
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

// API Endpoints
app.post('/add', (req, res) => {
  tasks.push({ text: req.body.task, completed: false });
  res.redirect('/');
});

app.post('/toggle', (req, res) => {
  const { index } = req.body;
  if (tasks[index]) tasks[index].completed = !tasks[index].completed;
  res.sendStatus(200);
});

app.post('/delete', (req, res) => {
  tasks.splice(req.body.index, 1);
  res.sendStatus(200);
});

app.post('/clear-completed', (req, res) => {
  tasks = tasks.filter(task => !task.completed);
  res.sendStatus(200);
});

app.post('/delete-all', (req, res) => {
  tasks = [];
  res.sendStatus(200);
});

app.listen(3000, () => console.log('NODOO app running on http://localhost:3000'));