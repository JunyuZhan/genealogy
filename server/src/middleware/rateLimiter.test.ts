import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rateLimiter } from './rateLimiter';

describe('server/src/middleware/rateLimiter.ts', () => {
  const createMockRequest = (ip: string = '127.0.0.1') => ({
    ip,
    socket: { remoteAddress: ip }
  }) as any;

  const createMockResponse = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  const createMockNext = () => vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should allow first request', () => {
    const req = createMockRequest();
    const res = createMockResponse();
    const next = createMockNext();

    rateLimiter(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should allow multiple requests within limit', () => {
    const req = createMockRequest();
    const res = createMockResponse();
    const next = createMockNext();

    for (let i = 0; i < 50; i++) {
      rateLimiter(req, res, next);
    }

    expect(next).toHaveBeenCalledTimes(50);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should block requests exceeding limit', () => {
    const req = createMockRequest();
    const res = createMockResponse();
    const next = createMockNext();

    for (let i = 0; i < 101; i++) {
      rateLimiter(req, res, next);
    }

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'RATE_LIMIT_EXCEEDED'
        })
      })
    );
  });

  it('should track requests by IP', () => {
    const req1 = createMockRequest('192.168.1.1');
    const req2 = createMockRequest('192.168.1.2');
    const res1 = createMockResponse();
    const res2 = createMockResponse();
    const next1 = createMockNext();
    const next2 = createMockNext();

    for (let i = 0; i < 100; i++) {
      rateLimiter(req1, res1, next1);
    }

    rateLimiter(req2, res2, next2);

    expect(next1).toHaveBeenCalledTimes(100);
    expect(next2).toHaveBeenCalledTimes(1);
  });

  it('should return 429 with correct error message', () => {
    const req = createMockRequest();
    const res = createMockResponse();
    const next = createMockNext();

    for (let i = 0; i < 101; i++) {
      rateLimiter(req, res, next);
    }

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          message: '请求过于频繁，请稍后再试'
        })
      })
    );
  });
});
