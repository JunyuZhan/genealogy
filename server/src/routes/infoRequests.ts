import { Router, Response, NextFunction } from 'express';
import { query } from '../utils/db';
import { createError } from '../middleware/errorHandler';
import { authenticate, requireRole } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// 创建信息申请
router.post('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { request_type, target_member_id, data, reason } = req.body;

    if (!request_type || !data) {
      throw createError('申请类型和数据为必填项', 400, 'INVALID_REQUEST');
    }

    const result = await query(
      `INSERT INTO info_requests (request_type, applicant_id, target_member_id, data, reason)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [request_type, req.user!.id, target_member_id, JSON.stringify(data), reason]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: '申请已提交，等待审核',
    });
  } catch (error) {
    next(error);
  }
});

// 获取我的申请列表
router.get('/my', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let sql = 'SELECT ir.*, m.name as target_member_name FROM info_requests ir LEFT JOIN members m ON ir.target_member_id = m.id WHERE ir.applicant_id = $1';
    const params: any[] = [req.user!.id];
    let paramIndex = 2;

    if (status) {
      sql += ` AND ir.status = $${paramIndex++}`;
      params.push(status);
    }

    // 获取总数
    const countResult = await query(sql.replace('SELECT ir.*, m.name as target_member_name', 'SELECT COUNT(*)'), params);
    const total = parseInt(countResult.rows[0].count);

    // 分页
    sql += ` ORDER BY ir.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const result = await query(sql, params);

    res.json({
      success: true,
      data: {
        requests: result.rows,
        pagination: { total, page: Number(page), limit: Number(limit) },
      },
    });
  } catch (error) {
    next(error);
  }
});

// 获取待审核列表（管理员）
router.get('/pending', authenticate, requireRole('super_admin', 'family_admin', 'branch_contact'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;

    let sql = 'SELECT ir.*, u.username as applicant_name, m.name as target_member_name FROM info_requests ir JOIN users u ON ir.applicant_id = u.id LEFT JOIN members m ON ir.target_member_id = m.id WHERE ir.status = $1';
    const params: any[] = ['pending'];
    let paramIndex = 2;

    // 支系联系人只能查看自己支系的申请
    if (req.user!.role === 'branch_contact') {
      sql += ` AND ir.applicant_id IN (SELECT id FROM users WHERE branch_id = $${paramIndex++})`;
      // 这里需要先获取用户的branch_id
    }

    if (type) {
      sql += ` AND ir.request_type = $${paramIndex++}`;
      params.push(type);
    }

    // 获取总数
    const countResult = await query(sql.replace('SELECT ir.*, u.username as applicant_name, m.name as target_member_name', 'SELECT COUNT(*)'), params);
    const total = parseInt(countResult.rows[0].count);

    // 分页
    sql += ` ORDER BY ir.created_at ASC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const result = await query(sql, params);

    res.json({
      success: true,
      data: {
        requests: result.rows,
        pagination: { total, page: Number(page), limit: Number(limit) },
      },
    });
  } catch (error) {
    next(error);
  }
});

// 审核申请
router.put('/:id/review', authenticate, requireRole('super_admin', 'family_admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { approved, review_comment } = req.body;

    // 获取申请详情
    const requestResult = await query('SELECT * FROM info_requests WHERE id = $1', [id]);
    if (requestResult.rows.length === 0) {
      throw createError('申请不存在', 404, 'REQUEST_NOT_FOUND');
    }

    const request = requestResult.rows[0];

    // 开始处理
    await query('BEGIN');

    try {
      if (approved) {
        // 执行数据变更
        const data = request.data;

        switch (request.request_type) {
          case 'add':
          case 'update':
            if (request.target_member_id) {
              // 更新成员
              const setClauses: string[] = [];
              const values: any[] = [];
              let idx = 1;
              Object.entries(data).forEach(([key, value]) => {
                setClauses.push(`${key} = $${idx++}`);
                values.push(value);
              });
              setClauses.push(`updated_at = NOW()`);
              values.push(request.target_member_id);
              
              await query(`UPDATE members SET ${setClauses.join(', ')} WHERE id = $${idx}`, values);
            } else {
              // 创建成员
              await query(
                `INSERT INTO members (name, given_name, gender, generation, generation_word, branch_name, is_alive, birth_date, death_date)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [data.name, data.given_name, data.gender, data.generation, data.generation_word, data.branch_name, data.is_alive, data.birth_date, data.death_date]
              );
            }
            break;

          case 'status_change':
            if (request.target_member_id) {
              // 更新成员状态
              await query(
                `UPDATE members SET is_alive = $1, updated_at = NOW() WHERE id = $2`,
                [data.is_alive, request.target_member_id]
              );
            }
            break;

          case 'photo':
          case 'cemetery':
            // 处理照片/墓冢更新
            if (request.target_member_id) {
              await query(
                `UPDATE cemeteries SET photos = $1, is_verified = false, updated_at = NOW() WHERE member_id = $2`,
                [JSON.stringify(data.photos || []), request.target_member_id]
              );
            }
            break;
        }
      }

      // 更新申请状态
      await query(
        `UPDATE info_requests 
         SET status = $1, reviewer_id = $2, review_comment = $3, reviewed_at = NOW(), updated_at = NOW()
         WHERE id = $4`,
        [approved ? 'approved' : 'rejected', req.user!.id, review_comment, id]
      );

      await query('COMMIT');

      res.json({
        success: true,
        message: approved ? '申请已批准' : '申请已拒绝',
      });
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }
  } catch (error) {
    next(error);
  }
});

export default router;
