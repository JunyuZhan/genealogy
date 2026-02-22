import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../../index';
import { query } from '../../utils/db';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

describe('Members API Integration Tests', () => {
  let token: string;
  let userId: string;
  let testMemberId: string;

  beforeAll(async () => {
    // Create a test user directly in DB to get a token
    userId = uuidv4();
    const passwordHash = await bcrypt.hash('password123', 10);
    await query(
      `INSERT INTO users (id, username, password_hash, role, status) 
       VALUES ($1, 'member_test_user', $2, 'family_admin', 'active')`,
      [userId, passwordHash]
    );

    token = jwt.sign({ userId, role: 'family_admin' }, JWT_SECRET);
  });

  afterAll(async () => {
    if (testMemberId) {
      await query('DELETE FROM members WHERE id = $1', [testMemberId]);
    }
    await query('DELETE FROM users WHERE id = $1', [userId]);
  });

  it('should create a new member', async () => {
    const newMember = {
      name: 'Integration Test Member',
      gender: 'M',
      generation: 1,
      generation_word: 'Test',
      is_alive: true
    };

    const res = await request(app)
      .post('/api/members')
      .set('Authorization', `Bearer ${token}`)
      .send(newMember);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe(newMember.name);
    
    testMemberId = res.body.data.id;
  });

  it('should get member details', async () => {
    const res = await request(app)
      .get(`/api/members/${testMemberId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(testMemberId);
  });

  it('should update member details', async () => {
    const updates = {
      bio: 'Updated bio via integration test'
    };

    const res = await request(app)
      .put(`/api/members/${testMemberId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updates);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    
    // Verify update
    const getRes = await request(app)
      .get(`/api/members/${testMemberId}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(getRes.body.data.bio).toBe(updates.bio);
  });
});
