// server.test.js
const request = require('supertest');
const express = require('express');
const app = require('./server'); // <-- we must export this from server.js

describe('GET /', () => {
  it('should respond with NODOO To-Do App', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('NODOO To-Do App');
  });
});
