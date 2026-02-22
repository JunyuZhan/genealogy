import { describe, it, expect, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { authenticate, optionalAuth, requireRole } from './auth';

describe('server/src/middleware/auth.ts', () => {
  const JWT_SECRET = 'your-secret-key';

  const createMockRequest = (headers: Record<string, string> = {}) => ({
    headers,
  }) as any;

  const createMockResponse = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  const createMockNext = () => vi.fn();

  describe('authenticate', () => {
    it('should return 401 if no authorization header', () => {
      const req = createMockRequest({});
      const res = createMockResponse();
      const next = createMockNext();

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'UNAUTHORIZED' }),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header does not start with Bearer', () => {
      const req = createMockRequest({ authorization: 'Basic token' });
      const res = createMockResponse();
      const next = createMockNext();

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', () => {
      const req = createMockRequest({ authorization: 'Bearer invalid-token' });
      const res = createMockResponse();
      const next = createMockNext();

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'TOKEN_EXPIRED' }),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next and set user if token is valid', () => {
      const token = jwt.sign({ userId: '123', role: 'admin' }, JWT_SECRET);
      const req = createMockRequest({ authorization: `Bearer ${token}` });
      const res = createMockResponse();
      const next = createMockNext();

      authenticate(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toEqual({ id: '123', role: 'admin' });
    });
  });

  describe('optionalAuth', () => {
    it('should call next without setting user if no authorization header', () => {
      const req = createMockRequest({});
      const res = createMockResponse();
      const next = createMockNext();

      optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });

    it('should set user if valid token provided', () => {
      const token = jwt.sign({ userId: '456', role: 'member' }, JWT_SECRET);
      const req = createMockRequest({ authorization: `Bearer ${token}` });
      const res = createMockResponse();
      const next = createMockNext();

      optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toEqual({ id: '456', role: 'member' });
    });

    it('should call next even if token is invalid', () => {
      const req = createMockRequest({ authorization: 'Bearer invalid-token' });
      const res = createMockResponse();
      const next = createMockNext();

      optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });
  });

  describe('requireRole', () => {
    it('should return 401 if user not authenticated', () => {
      const req = createMockRequest({});
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = requireRole('admin');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if user role not in allowed roles', () => {
      const req = createMockRequest({});
      req.user = { id: '123', role: 'member' };
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = requireRole('admin', 'super_admin');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'FORBIDDEN' }),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next if user role is allowed', () => {
      const req = createMockRequest({});
      req.user = { id: '123', role: 'admin' };
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = requireRole('admin', 'super_admin');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
