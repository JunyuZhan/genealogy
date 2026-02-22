import { Router, Response, NextFunction } from 'express';
import { query } from '../utils/db';
import { createError } from '../middleware/errorHandler';
import { authenticate, requireRole } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// 获取公告列表（公开）
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { type, limit = 10, offset = 0 } = req.query;

    let sql = `SELECT a.*, u.username as author_name 
               FROM announcements a 
               LEFT JOIN users u ON a.author_id = u.id
               WHERE a.is_active = true 
                 AND (a.expired_at IS NULL OR a.expired_at > NOW())`;
    const params: any[] = [];
    let paramIndex = 1;

    if (type) {
      sql += ` AND a.type = $${paramIndex++}`;
      params.push(type);
    }

    sql += ' ORDER BY a.is_pinned DESC, a.published_at DESC LIMIT $2 OFFSET $3';
    params.push(Number(limit), Number(offset));

    const result = await query(sql, params);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

// 获取单个公告
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT a.*, u.username as author_name 
       FROM announcements a 
       LEFT JOIN users u ON a.author_id = u.id
       WHERE a.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw createError('公告不存在', 404, 'ANNOUNCEMENT_NOT_FOUND');
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// 创建公告
router.post('/', authenticate, requireRole('super_admin', 'family_admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, content, type, is_pinned, expired_at } = req.body;

    const result = await query(
      `INSERT INTO announcements (title, content, type, author_id, is_pinned, expired_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, content, type || 'notice', req.user!.id, is_pinned || false, expired_at]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// 更新公告
router.put('/:id', authenticate, requireRole('super_admin', 'family_admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, content, type, is_pinned, expired_at, is_active } = req.body;

    const result = await query(
      `UPDATE announcements 
       SET title = COALESCE($1, title),
           content = COALESCE($2, content),
           type = COALESCE($3, type),
           is_pinned = COALESCE($4, is_pinned),
           expired_at = COALESCE($5, expired_at),
           is_active = COALESCE($6, is_active),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [title, content, type, is_pinned, expired_at, is_active, id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// 删除公告
router.delete('/:id', authenticate, requireRole('super_admin', 'family_admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM announcements WHERE id = $1', [id]);
    res.json({ success: true, message: '公告已删除' });
  } catch (error) {
    next(error);
  }
});

export default router;
