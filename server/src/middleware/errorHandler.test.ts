import { describe, it, expect, vi } from 'vitest';
import { errorHandler, createError } from './errorHandler';

describe('server/src/middleware/errorHandler.ts', () => {
  const createMockResponse = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  describe('createError', () => {
    it('should create error with message, statusCode and code', () => {
      const error = createError('Test error', 400, 'TEST_ERROR');

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('TEST_ERROR');
    });

    it('should create error with default values', () => {
      const error = createError('Test error', 500);

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBeUndefined();
    });
  });

  describe('errorHandler', () => {
    it('should return 500 status code by default', () => {
      const error = new Error('Test error');
      const req: any = {};
      const res = createMockResponse();
      const next = vi.fn();

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalled();
    });

    it('should return custom status code from error', () => {
      const error = createError('Not found', 404, 'NOT_FOUND');
      const req: any = {};
      const res = createMockResponse();
      const next = vi.fn();

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return error message in response', () => {
      const error = createError('Custom error message', 400, 'CUSTOM');
      const req: any = {};
      const res = createMockResponse();
      const next = vi.fn();

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'Custom error message',
            code: 'CUSTOM'
          })
        })
      );
    });

    it('should include stack trace in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const error = new Error('Test error');
      const req: any = {};
      const res = createMockResponse();
      const next = vi.fn();

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            stack: expect.any(String)
          })
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should not include stack trace in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const error = new Error('Test error');
      const req: any = {};
      const res = createMockResponse();
      const next = vi.fn();

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.not.objectContaining({
            stack: expect.any(String)
          })
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

  });
});
