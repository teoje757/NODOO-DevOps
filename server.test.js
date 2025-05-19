// Import required modules
const request = require('supertest'); // For simulating HTTP requests
const app = require('./server');      // Import the Express app

// Test suite for NODOO application API
describe('NODOO App API', () => {
  // Reset tasks array before each test to ensure test isolation
  beforeEach(() => {
    app.locals.tasks = [];
  });

  // Test: GET /
  it('GET / should return HTML with app header', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('NODOO - Note and Do'); // Check header in HTML
  });

  // Test: POST /add
  it('POST /add should add a task', async () => {
    const res = await request(app)
      .post('/add')
      .type('form')
      .send({ task: 'Test task' });

    expect(res.statusCode).toBe(302); // App redirects to homepage
    expect(app.locals.tasks.length).toBe(1);
    expect(app.locals.tasks[0].text).toBe('Test task');
  });

  // Test: POST /toggle
  it('POST /toggle should mark a task as completed', async () => {
    // Add dummy task
    app.locals.tasks = [{ text: 'Test toggle', completed: false }];

    const res = await request(app)
      .post('/toggle')
      .send({ index: 0 });

    expect(res.statusCode).toBe(200);
    expect(app.locals.tasks[0].completed).toBe(true);
  });

  // Test: POST /delete
  it('POST /delete should remove a task', async () => {
    app.locals.tasks = [{ text: 'Task to delete', completed: false }];

    const res = await request(app)
      .post('/delete')
      .send({ index: 0 });

    expect(res.statusCode).toBe(200);
    expect(app.locals.tasks.length).toBe(0);
  });

  // Test: POST /clear-completed
  it('POST /clear-completed should only keep uncompleted tasks', async () => {
    app.locals.tasks = [
      { text: 'Done', completed: true },
      { text: 'Not Done', completed: false },
    ];

    const res = await request(app).post('/clear-completed');

    expect(res.statusCode).toBe(200);
    expect(app.locals.tasks.length).toBe(1);
    expect(app.locals.tasks[0].text).toBe('Not Done');
  });

  // Test: POST /delete-all
  it('POST /delete-all should clear all tasks', async () => {
    app.locals.tasks = [
      { text: 'Task 1', completed: false },
      { text: 'Task 2', completed: true },
    ];

    const res = await request(app).post('/delete-all');

    expect(res.statusCode).toBe(200);
    expect(app.locals.tasks.length).toBe(0);
  });
});
