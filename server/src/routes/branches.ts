import { Router, Response, NextFunction } from 'express';
import { query } from '../utils/db';
import { createError } from '../middleware/errorHandler';
import { authenticate, requireRole } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// 获取支系列表
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await query(
      `SELECT b.*, 
         (SELECT COUNT(*) FROM members WHERE branch_id = b.id) as member_count
       FROM branches b 
       WHERE b.is_active = true 
       ORDER BY b.name`
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

// 获取单个支系详情
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await query('SELECT * FROM branches WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      throw createError('支系不存在', 404, 'BRANCH_NOT_FOUND');
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// 创建支系
router.post('/', authenticate, requireRole('super_admin', 'family_admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, founder_name, location } = req.body;

    const result = await query(
      `INSERT INTO branches (name, description, founder_name, location)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, description, founder_name, location]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// 更新支系
router.put('/:id', authenticate, requireRole('super_admin', 'family_admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description, founder_name, location, contact_user_id, population } = req.body;

    const result = await query(
      `UPDATE branches 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           founder_name = COALESCE($3, founder_name),
           location = COALESCE($4, location),
           contact_user_id = COALESCE($5, contact_user_id),
           population = COALESCE($6, population),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [name, description, founder_name, location, contact_user_id, population, id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// 删除支系
router.delete('/:id', authenticate, requireRole('super_admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // 检查是否有成员关联
    const memberCheck = await query('SELECT COUNT(*) FROM members WHERE branch_id = $1', [id]);
    if (parseInt(memberCheck.rows[0].count) > 0) {
      throw createError('该支系下还有成员，无法删除', 400, 'BRANCH_HAS_MEMBERS');
    }

    await query('DELETE FROM branches WHERE id = $1', [id]);

    res.json({ success: true, message: '支系已删除' });
  } catch (error) {
    next(error);
  }
});

// 获取支系成员
router.get('/:id/members', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT * FROM members 
       WHERE branch_id = $1 
       ORDER BY generation, order_in_generation`,
      [id]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

export default router;
