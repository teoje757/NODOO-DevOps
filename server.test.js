const request = require('supertest');
const app = require('./server');

describe('NODOO API Tests', () => {
  beforeEach(() => {
    // Reset tasks before each test
    app.locals.tasks = [];
  });

  describe('GET /', () => {
    it('should return the HTML interface', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('NODOO - Note and Do');
      expect(res.text).toContain('New task');
    });
  });

  describe('POST /add', () => {
    it('should add a new task', async () => {
      const res = await request(app)
        .post('/add')
        .send('task=Test+Task');
      expect(res.statusCode).toBe(302); // Redirect
      expect(app.locals.tasks).toHaveLength(1);
      expect(app.locals.tasks[0].text).toBe('Test Task');
    });
  });

  describe('POST /toggle', () => {
    it('should toggle task completion', async () => {
      app.locals.tasks = [{ text: 'Test Task', completed: false }];
      const res = await request(app)
        .post('/toggle')
        .send({ index: 0 });
      expect(res.statusCode).toBe(200);
      expect(app.locals.tasks[0].completed).toBe(true);
    });
  });

  describe('POST /delete', () => {
    it('should delete a task', async () => {
      app.locals.tasks = [{ text: 'Test Task', completed: false }];
      const res = await request(app)
        .post('/delete')
        .send({ index: 0 });
      expect(res.statusCode).toBe(200);
      expect(app.locals.tasks).toHaveLength(0);
    });
  });
});