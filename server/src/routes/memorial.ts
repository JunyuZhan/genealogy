import { Router, Response, NextFunction } from 'express';
import { query } from '../utils/db';
import { createError } from '../middleware/errorHandler';
import { optionalAuth } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// 祭扫（献花/点烛/上香/留言）
router.post('/', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { member_id, action, message } = req.body;
    const userId = req.user?.id;
    const ip_address = req.ip;
    const user_agent = req.get('User-Agent');

    // 检查成员是否存在且已去世
    const memberCheck = await query(
      'SELECT id, is_alive FROM members WHERE id = $1',
      [member_id]
    );

    if (memberCheck.rows.length === 0) {
      throw createError('成员不存在', 404, 'MEMBER_NOT_FOUND');
    }

    if (memberCheck.rows[0].is_alive) {
      throw createError('在世成员不能祭扫', 400, 'MEMBER_ALIVE');
    }

    // 记录祭扫
    const result = await query(
      `INSERT INTO memorial_logs (member_id, user_id, visitor_name, action, message, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        member_id,
        userId || null,
        userId ? null : `访客${Math.floor(Math.random() * 10000)}`, // 匿名访客
        action,
        message,
        ip_address,
        user_agent
      ]
    );

    // 更新成员的最后祭扫时间和祭扫次数
    await query(
      `UPDATE members 
       SET last_visited_at = NOW(), visit_count = visit_count + 1, updated_at = NOW()
       WHERE id = $1`,
      [member_id]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: '祭扫成功',
    });
  } catch (error) {
    next(error);
  }
});

// 获取祭扫记录
router.get('/member/:memberId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { memberId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    // 检查成员是否存在且已去世
    const memberCheck = await query(
      'SELECT id, is_alive FROM members WHERE id = $1',
      [memberId]
    );

    if (memberCheck.rows.length === 0) {
      throw createError('成员不存在', 404, 'MEMBER_NOT_FOUND');
    }

    if (memberCheck.rows[0].is_alive) {
      throw createError('在世成员没有祭扫记录', 400, 'MEMBER_ALIVE');
    }

    const result = await query(
      `SELECT ml.*, u.nickname as user_nickname
       FROM memorial_logs ml
       LEFT JOIN users u ON ml.user_id = u.id
       WHERE ml.member_id = $1
       ORDER BY ml.visited_at DESC
       LIMIT $2 OFFSET $3`,
      [memberId, limit, offset]
    );

    // 获取统计信息
    const statsResult = await query(
      `SELECT 
         COUNT(*) as total_count,
         COUNT(DISTINCT COALESCE(ml.user_id, ml.visitor_name)) as unique_visitors,
         MAX(ml.visited_at) as last_visit
       FROM memorial_logs ml
       WHERE ml.member_id = $1`,
      [memberId]
    );

    res.json({
      success: true,
      data: {
        logs: result.rows,
        stats: statsResult.rows[0],
      },
    });
  } catch (error) {
    next(error);
  }
});

// 获取祭扫统计
router.get('/stats', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { days = 30 } = req.query;

    const result = await query(
      `SELECT 
         DATE(visited_at) as date,
         COUNT(*) as count,
         COUNT(DISTINCT COALESCE(user_id, visitor_name)) as visitors
       FROM memorial_logs
       WHERE visited_at >= NOW() - INTERVAL '${days} days'
       GROUP BY DATE(visited_at)
       ORDER BY date DESC`
    );

    const totalResult = await query(
      `SELECT 
         COUNT(*) as total_count,
         COUNT(DISTINCT COALESCE(user_id, visitor_name)) as total_visitors
       FROM memorial_logs`
    );

    res.json({
      success: true,
      data: {
        daily: result.rows,
        total: totalResult.rows[0],
      },
    });
  } catch (error) {
    next(error);
  }
});

// 获取祭扫排行榜
router.get('/leaderboard', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { limit = 10, type = 'visits' } = req.query;

    let orderBy = 'visit_count DESC';
    if (type === 'recent') {
      orderBy = 'last_visited_at DESC';
    }

    const result = await query(
      `SELECT m.id, m.name, m.generation, m.generation_word, m.visit_count, m.last_visited_at
       FROM members m
       WHERE m.is_alive = false AND m.is_verified = true
       ORDER BY ${orderBy}
       LIMIT $1`,
      [limit]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

export default router;
