import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['server/src/**/*.ts'],
      exclude: ['server/**/*.test.ts']
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'server/src')
    }
  }
});
