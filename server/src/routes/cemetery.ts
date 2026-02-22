import { Router, Response, NextFunction } from 'express';
import { query } from '../utils/db';
import { createError } from '../middleware/errorHandler';
import { authenticate, requireRole } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// 获取墓冢列表
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { member_id, branch } = req.query;
    
    let sql = 'SELECT c.*, m.name as member_name, m.generation, m.generation_word, m.branch_name FROM cemeteries c JOIN members m ON c.member_id = m.id WHERE c.is_public = true';
    const params: any[] = [];
    let paramIndex = 1;

    if (member_id) {
      sql += ` AND c.member_id = $${paramIndex++}`;
      params.push(member_id);
    }

    if (branch) {
      sql += ` AND m.branch_name = $${paramIndex++}`;
      params.push(branch);
    }

    sql += ' ORDER BY m.generation';

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

// 获取单个墓冢详情
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT c.*, m.name as member_name, m.generation, m.generation_word, m.birth_date, m.death_date
       FROM cemeteries c 
       JOIN members m ON c.member_id = m.id 
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw createError('墓冢不存在', 404, 'CEMETERY_NOT_FOUND');
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// 创建/更新墓冢信息（需审核）
router.post('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { member_id, lat, lng, address, cemetery_code, photos, panorama } = req.body;

    // 检查成员是否存在
    const memberCheck = await query('SELECT id, is_alive FROM members WHERE id = $1', [member_id]);
    if (memberCheck.rows.length === 0) {
      throw createError('成员不存在', 404, 'MEMBER_NOT_FOUND');
    }

    // 已故成员可直接添加
    if (!memberCheck.rows[0].is_alive) {
      const result = await query(
        `INSERT INTO cemeteries (member_id, lat, lng, address, cemetery_code, photos, panorama, is_public)
         VALUES ($1, $2, $3, $4, $5, $6, $7, false)
         ON CONFLICT (member_id) DO UPDATE SET
           lat = EXCLUDED.lat, lng = EXCLUDED.lng, address = EXCLUDED.address,
           cemetery_code = EXCLUDED.cemetery_code, photos = EXCLUDED.photos, panorama = EXCLUDED.panorama,
           updated_at = NOW()
         RETURNING *`,
        [member_id, lat, lng, address, cemetery_code, JSON.stringify(photos || []), panorama]
      );

      return res.status(201).json({
        success: true,
        data: result.rows[0],
        message: '墓冢信息已提交，需审核后公开',
      });
    }

    // 在世成员需要审核
    const result = await query(
      `INSERT INTO cemeteries (member_id, lat, lng, address, cemetery_code, photos, panorama, is_public, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false, false)
       ON CONFLICT (member_id) DO UPDATE SET
         lat = EXCLUDED.lat, lng = EXCLUDED.lng, address = EXCLUDED.address,
         cemetery_code = EXCLUDED.cemetery_code, photos = EXCLUDED.photos, panorama = EXCLUDED.panorama,
         is_verified = false, updated_at = NOW()
       RETURNING *`,
      [member_id, lat, lng, address, cemetery_code, JSON.stringify(photos || []), panorama]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: '墓冢信息已提交，需审核后公开',
    });
  } catch (error) {
    next(error);
  }
});

// 审核墓冢信息
router.put('/:id/verify', authenticate, requireRole('super_admin', 'family_admin', 'branch_contact'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;

    const result = await query(
      `UPDATE cemeteries 
       SET is_verified = $1, verified_by = $2, verified_at = NOW(), is_public = $1, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [approved, req.user!.id, id]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: approved ? '已审核通过' : '已拒绝',
    });
  } catch (error) {
    next(error);
  }
});

// 删除墓冢信息
router.delete('/:id', authenticate, requireRole('super_admin', 'family_admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM cemeteries WHERE id = $1', [id]);
    res.json({ success: true, message: '墓冢信息已删除' });
  } catch (error) {
    next(error);
  }
});

// 获取地图标记点
router.get('/map/markers', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await query(
      `SELECT c.id, c.lat, c.lng, c.address, c.member_id, m.name as member_name, m.generation, m.generation_word
       FROM cemeteries c
       JOIN members m ON c.member_id = m.id
       WHERE c.lat IS NOT NULL AND c.lng IS NOT NULL AND c.is_public = true`
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

export default router;
