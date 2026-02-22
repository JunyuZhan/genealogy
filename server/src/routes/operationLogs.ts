import { Router, Response, NextFunction } from 'express';
import { query } from '../utils/db';
import { createError } from '../middleware/errorHandler';
import { authenticate, requireRole } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// 记录操作日志（中间件方式，在其他路由中调用）
export const logOperation = async (
  userId: string | undefined,
  action: string,
  resourceType: string,
  resourceId: string | undefined,
  oldData: any,
  newData: any,
  ipAddress: string | undefined,
  userAgent: string | undefined
) => {
  await query(
    `INSERT INTO operation_logs (user_id, action, resource_type, resource_id, old_data, new_data, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [userId, action, resourceType, resourceId, JSON.stringify(oldData), JSON.stringify(newData), ipAddress, userAgent]
  );
};

// 获取操作日志列表
router.get('/', authenticate, requireRole('super_admin', 'family_admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { user_id, action, resource_type, start_date, end_date, page = 1, limit = 50 } = req.query;

    let sql = 'SELECT ol.*, u.username as user_name FROM operation_logs ol LEFT JOIN users u ON ol.user_id = u.id WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (user_id) {
      sql += ` AND ol.user_id = $${paramIndex++}`;
      params.push(user_id);
    }

    if (action) {
      sql += ` AND ol.action = $${paramIndex++}`;
      params.push(action);
    }

    if (resource_type) {
      sql += ` AND ol.resource_type = $${paramIndex++}`;
      params.push(resource_type);
    }

    if (start_date) {
      sql += ` AND ol.created_at >= $${paramIndex++}`;
      params.push(start_date);
    }

    if (end_date) {
      sql += ` AND ol.created_at <= $${paramIndex++}`;
      params.push(end_date);
    }

    // 获取总数
    const countResult = await query(sql.replace('SELECT ol.*, u.username as user_name', 'SELECT COUNT(*)'), params);
    const total = parseInt(countResult.rows[0].count);

    // 分页
    sql += ` ORDER BY ol.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const result = await query(sql, params);

    res.json({
      success: true,
      data: {
        logs: result.rows,
        pagination: { total, page: Number(page), limit: Number(limit) },
      },
    });
  } catch (error) {
    next(error);
  }
});

// 获取操作统计
router.get('/stats', authenticate, requireRole('super_admin', 'family_admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { days = 7 } = req.query;

    // 按操作类型统计
    const byActionResult = await query(
      `SELECT action, COUNT(*) as count 
       FROM operation_logs 
       WHERE created_at >= NOW() - INTERVAL '${days} days'
       GROUP BY action 
       ORDER BY count DESC`
    );

    // 按用户统计
    const byUserResult = await query(
      `SELECT u.username, COUNT(*) as count 
       FROM operation_logs ol 
       JOIN users u ON ol.user_id = u.id
       WHERE ol.created_at >= NOW() - INTERVAL '${days} days'
       GROUP BY u.username 
       ORDER BY count DESC
       LIMIT 10`
    );

    // 按日期统计
    const byDateResult = await query(
      `SELECT DATE(created_at) as date, COUNT(*) as count 
       FROM operation_logs 
       WHERE created_at >= NOW() - INTERVAL '${days} days'
       GROUP BY DATE(created_at) 
       ORDER BY date DESC`
    );

    res.json({
      success: true,
      data: {
        byAction: byActionResult.rows,
        byUser: byUserResult.rows,
        byDate: byDateResult.rows,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
