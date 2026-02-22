import { Router, Response, NextFunction } from 'express';
import { query } from '../utils/db';
import { createError } from '../middleware/errorHandler';
import { optionalAuth } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// 创建捐赠记录
router.post('/', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { donor_name, amount, purpose, donor_phone, donor_message } = req.body;
    const ip_address = req.ip;

    if (!donor_name || !amount || !purpose) {
      throw createError('捐赠人姓名、金额和用途为必填项', 400, 'INVALID_DONATION');
    }

    const result = await query(
      `INSERT INTO donations (donor_name, amount, purpose, donor_phone, donor_message, ip_address, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [donor_name, amount, purpose, donor_phone, donor_message, ip_address]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: '请完成支付',
    });
  } catch (error) {
    next(error);
  }
});

// 回调通知（支付完成后调用）
router.post('/notify', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { order_id, status, paid_at } = req.body;

    await query(
      `UPDATE donations 
       SET status = $1, payment_order_id = $2, paid_at = $3
       WHERE id = $2`,
      [status, order_id, paid_at]
    );

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// 获取捐赠列表（公开）
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { purpose, status = 'paid', limit = 20, offset = 0 } = req.query;

    let sql = 'SELECT * FROM donations WHERE status = $1';
    const params: any[] = [status];
    let paramIndex = 2;

    if (purpose) {
      sql += ` AND purpose = $${paramIndex++}`;
      params.push(purpose);
    }

    sql += ' ORDER BY created_at DESC LIMIT $2 OFFSET $3';
    params.push(Number(limit), Number(offset));

    const result = await query(sql, params);

    // 获取统计
    const statsResult = await query(
      `SELECT 
         COALESCE(SUM(amount), 0) as total_amount,
         COUNT(*) as total_count
       FROM donations WHERE status = 'paid'`
    );

    res.json({
      success: true,
      data: {
        donations: result.rows,
        stats: statsResult.rows[0],
      },
    });
  } catch (error) {
    next(error);
  }
});

// 获取捐赠详情
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await query('SELECT * FROM donations WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      throw createError('捐赠记录不存在', 404, 'DONATION_NOT_FOUND');
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

export default router;
