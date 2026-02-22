import { beforeAll, afterAll, afterEach } from 'vitest';
import pool, { query } from '../utils/db';

// Global setup for integration tests
beforeAll(async () => {
  // Ensure we are connected to the test database
  // Ideally, we should check process.env.NODE_ENV or DB_NAME
  console.log('Starting integration tests...');
});

afterEach(async () => {
  // Optional: Clear tables after each test if isolation is needed
  // For now, we rely on specific test setup/teardown
});

afterAll(async () => {
  await pool.end();
  console.log('Integration tests completed.');
});
