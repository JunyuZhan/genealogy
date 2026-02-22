import { Router, Response, NextFunction } from 'express';
import { query } from '../utils/db';
import { createError } from '../middleware/errorHandler';
import { authenticate, optionalAuth, requireRole } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// 获取成员列表（公开信息）
router.get('/', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { branch, generation, alive, search, page = 1, limit = 20 } = req.query;
    
    let sql = 'SELECT * FROM members WHERE is_verified = true';
    const params: any[] = [];
    let paramIndex = 1;

    if (branch) {
      sql += ` AND branch_id = $${paramIndex++}`;
      params.push(branch);
    }

    if (generation) {
      sql += ` AND generation = $${paramIndex++}`;
      params.push(generation);
    }

    if (alive !== undefined) {
      sql += ` AND is_alive = $${paramIndex++}`;
      params.push(alive === 'true');
    }

    if (search) {
      sql += ` AND name LIKE $${paramIndex++}`;
      params.push(`%${search}%`);
    }

    // 获取总数
    const countResult = await query(sql.replace('SELECT *', 'SELECT COUNT(*)'), params);
    const total = parseInt(countResult.rows[0].count);

    // 分页
    sql += ` ORDER BY generation, order_in_generation LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const result = await query(sql, params);

    // 处理公开字段过滤
    const members = result.rows.map(member => {
      if (member.is_alive && member.public_fields) {
        const publicFields = member.public_fields;
        const filtered: any = {};
        publicFields.forEach((field: string) => {
          if (member[field] !== undefined) {
            filtered[field] = member[field];
          }
        });
        return { ...filtered, id: member.id, name: member.name };
      }
      return member;
    });

    res.json({
      success: true,
      data: {
        members,
        pagination: { total, page: Number(page), limit: Number(limit) },
      },
    });
  } catch (error) {
    next(error);
  }
});

// 获取成员详情
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await query('SELECT * FROM members WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      throw createError('成员不存在', 404, 'MEMBER_NOT_FOUND');
    }

    const member = result.rows[0];

    // 如果是在世成员，过滤非公开字段
    if (member.is_alive && member.public_fields) {
      const publicFields = member.public_fields;
      const filtered: any = { id: member.id };
      publicFields.forEach((field: string) => {
        if (member[field] !== undefined) {
          filtered[field] = member[field];
        }
      });
      return res.json({ success: true, data: filtered });
    }

    res.json({ success: true, data: member });
  } catch (error) {
    next(error);
  }
});

// 创建成员（需审核）
router.post('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, given_name, nickname, gender, generation, generation_word, order_in_generation, branch_id, branch_name, is_floating, is_alive, birth_date, death_date, bio, tags } = req.body;

    const result = await query(
      `INSERT INTO members (name, given_name, nickname, gender, generation, generation_word, order_in_generation, branch_id, branch_name, is_floating, is_alive, birth_date, death_date, bio, tags, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, false)
       RETURNING *`,
      [name, given_name, nickname, gender, generation, generation_word, order_in_generation, branch_id, branch_name, is_floating, is_alive, birth_date, death_date, bio, JSON.stringify(tags || [])]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: '成员信息已提交，待审核后生效',
    });
  } catch (error) {
    next(error);
  }
});

// 更新成员
router.put('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        setClauses.push(`${key} = $${paramIndex++}`);
        values.push(value);
      }
    });

    if (setClauses.length === 0) {
      throw createError('没有要更新的字段', 400, 'NO_UPDATES');
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE members SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// 删除成员
router.delete('/:id', authenticate, requireRole('super_admin', 'family_admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await query('DELETE FROM members WHERE id = $1', [id]);

    res.json({ success: true, message: '成员已删除' });
  } catch (error) {
    next(error);
  }
});

// 获取成员的父母
router.get('/:id/parents', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT m.*, fl.relationship, fl.role, fl.notes
       FROM family_links fl
       JOIN members m ON fl.target_id = m.id
       WHERE fl.member_id = $1 AND fl.role IN ('father', 'mother')`,
      [id]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

// 获取成员的子女
router.get('/:id/children', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT m.*, fl.relationship, fl.role, fl.notes
       FROM family_links fl
       JOIN members m ON fl.target_id = m.id
       WHERE fl.member_id = $1 AND fl.role = 'child'`,
      [id]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

// 获取成员的配偶
router.get('/:id/spouses', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT s.*, m.name as member_name
       FROM spouses s
       LEFT JOIN members m ON s.member_id = m.id
       WHERE s.member_id = $1`,
      [id]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

// 获取成员的祭扫信息
router.get('/:id/memorial', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;

    const memberResult = await query('SELECT is_alive FROM members WHERE id = $1', [id]);
    if (memberResult.rows.length === 0) {
      throw createError('成员不存在', 404, 'MEMBER_NOT_FOUND');
    }

    if (memberResult.rows[0].is_alive) {
      throw createError('在世成员没有祭扫信息', 400, 'MEMBER_ALIVE');
    }

    const result = await query(
      `SELECT * FROM memorial_logs WHERE member_id = $1 ORDER BY visited_at DESC LIMIT $2`,
      [id, limit]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

export default router;
