import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../../index';
import { query } from '../../utils/db';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

describe('Auth API Integration Tests', () => {
  let testUser = {
    username: 'test_integration_user',
    password: 'password123',
    email: 'test@integration.com'
  };

  beforeAll(async () => {
    // Cleanup before tests
    await query('DELETE FROM users WHERE username = $1', [testUser.username]);
  });

  afterAll(async () => {
    // Cleanup after tests
    await query('DELETE FROM users WHERE username = $1', [testUser.username]);
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.username).toBe(testUser.username);
    expect(res.body.data.token).toBeDefined();
  });

  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: testUser.username,
        password: testUser.password
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('should fail login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: testUser.username,
        password: 'wrongpassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
