import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// 清理过期记录
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 60000);

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const key = `rate_${ip}`;
  const now = Date.now();
  const windowMs = 60000; // 1分钟
  const maxRequests = 100; // 每分钟最多100次

  if (!store[key]) {
    store[key] = { count: 1, resetTime: now + windowMs };
    return next();
  }

  if (now > store[key].resetTime) {
    store[key] = { count: 1, resetTime: now + windowMs };
    return next();
  }

  store[key].count++;

  if (store[key].count > maxRequests) {
    return res.status(429).json({
      success: false,
      error: {
        message: '请求过于频繁，请稍后再试',
        code: 'RATE_LIMIT_EXCEEDED',
      },
    });
  }

  next();
};
