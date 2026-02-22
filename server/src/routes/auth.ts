import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../utils/db';
import { createError } from '../middleware/errorHandler';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

// 注册验证
const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(6),
  real_name: z.string().optional(),
  nickname: z.string().optional(),
});

// 登录验证
const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

// 注册
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body);

    // 检查用户名是否存在
    const existingUser = await query(
      'SELECT id FROM users WHERE username = $1',
      [data.username]
    );
    if (existingUser.rows.length > 0) {
      throw createError('用户名已存在', 400, 'USERNAME_EXISTS');
    }

    // 密码加密
    const password_hash = await bcrypt.hash(data.password, 10);

    // 创建用户
    const result = await query(
      `INSERT INTO users (username, email, phone, password_hash, real_name, nickname, role, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'member', 'active')
       RETURNING id, username, email, role, created_at`,
      [data.username, data.email, data.phone, password_hash, data.real_name, data.nickname]
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(201).json({
      success: true,
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
});

// 登录
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = loginSchema.parse(req.body);

    // 查找用户
    const result = await query(
      'SELECT * FROM users WHERE username = $1',
      [data.username]
    );
    
    if (result.rows.length === 0) {
      throw createError('用户名或密码错误', 401, 'INVALID_CREDENTIALS');
    }

    const user = result.rows[0];

    // 检查账号状态
    if (user.status === 'disabled') {
      throw createError('账号已被禁用', 403, 'ACCOUNT_DISABLED');
    }

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      throw createError('账号已被锁定，请稍后再试', 403, 'ACCOUNT_LOCKED');
    }

    // 验证密码
    const validPassword = await bcrypt.compare(data.password, user.password_hash);
    if (!validPassword) {
      // 增加失败计数
      const failCount = user.login_fail_count + 1;
      const lockedUntil = failCount >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null;
      
      await query(
        'UPDATE users SET login_fail_count = $1, locked_until = $2 WHERE id = $3',
        [failCount, lockedUntil, user.id]
      );
      
      throw createError('用户名或密码错误', 401, 'INVALID_CREDENTIALS');
    }

    // 更新登录信息
    await query(
      'UPDATE users SET last_login_at = NOW(), login_fail_count = 0, locked_until = NULL WHERE id = $1',
      [user.id]
    );

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          real_name: user.real_name,
          nickname: user.nickname,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 获取当前用户信息
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await query(
      `SELECT id, username, email, phone, real_name, nickname, avatar, role, branch_id, created_at
       FROM users WHERE id = $1`,
      [req.user!.id]
    );

    if (result.rows.length === 0) {
      throw createError('用户不存在', 404, 'USER_NOT_FOUND');
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// 更新用户信息
router.put('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, phone, real_name, nickname } = req.body;

    const result = await query(
      `UPDATE users 
       SET email = COALESCE($1, email),
           phone = COALESCE($2, phone),
           real_name = COALESCE($3, real_name),
           nickname = COALESCE($4, nickname),
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, username, email, phone, real_name, nickname`,
      [email, phone, real_name, nickname, req.user!.id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// 修改密码
router.put('/password', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const result = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user!.id]
    );

    const validPassword = await bcrypt.compare(oldPassword, result.rows[0].password_hash);
    if (!validPassword) {
      throw createError('原密码错误', 400, 'INVALID_PASSWORD');
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newHash, req.user!.id]
    );

    res.json({ success: true, message: '密码修改成功' });
  } catch (error) {
    next(error);
  }
});

export default router;
