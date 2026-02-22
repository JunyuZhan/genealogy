import { Router, Response, NextFunction } from 'express';
import { query } from '../utils/db';
import { createError } from '../middleware/errorHandler';
import { authenticate, optionalAuth, requireRole } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// 获取倡议列表（公开）
router.get('/', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { type, status = 'approved', limit = 20, offset = 0 } = req.query;

    let sql = 'SELECT * FROM campaigns WHERE status IN ($1, $2)';
    const params: any[] = ['approved', 'completed'];
    let paramIndex = 3;

    if (type) {
      sql += ` AND type = $${paramIndex++}`;
      params.push(type);
    }

    sql += ' ORDER BY created_at DESC LIMIT $3 OFFSET $4';
    params.push(Number(limit), Number(offset));

    const result = await query(sql, params);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

// 获取单个倡议详情
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await query('SELECT * FROM campaigns WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      throw createError('倡议不存在', 404, 'CAMPAIGN_NOT_FOUND');
    }

    // 获取认捐记录
    const donationsResult = await query(
      `SELECT * FROM campaign_donations WHERE campaign_id = $1 AND status = 'paid' ORDER BY created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        donations: donationsResult.rows,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 创建倡议（需审核）
router.post('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, type, target_amount, beneficiary_name, beneficiary_relation, start_date, end_date } = req.body;

    const result = await query(
      `INSERT INTO campaigns (title, description, type, target_amount, beneficiary_name, beneficiary_relation, applicant_id, status, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8, $9)
       RETURNING *`,
      [title, description, type, target_amount, beneficiary_name, beneficiary_relation, req.user!.id, start_date, end_date]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: '倡议已提交，待审核后发布',
    });
  } catch (error) {
    next(error);
  }
});

// 审核倡议
router.put('/:id/verify', authenticate, requireRole('super_admin', 'family_admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { approved, review_comment } = req.body;

    const result = await query(
      `UPDATE campaigns 
       SET status = $1, reviewer_id = $2, review_comment = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [approved ? 'approved' : 'rejected', req.user!.id, review_comment, id]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: approved ? '倡议已审核通过' : '倡议已拒绝',
    });
  } catch (error) {
    next(error);
  }
});

// 认捐
router.post('/:id/donate', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { donor_name, amount, donor_message } = req.body;

    if (!donor_name || !amount) {
      throw createError('认捐人姓名和金额为必填项', 400, 'INVALID_DONATION');
    }

    // 检查倡议是否存在
    const campaignCheck = await query('SELECT * FROM campaigns WHERE id = $1', [id]);
    if (campaignCheck.rows.length === 0) {
      throw createError('倡议不存在', 404, 'CAMPAIGN_NOT_FOUND');
    }

    if (campaignCheck.rows[0].status !== 'approved') {
      throw createError('倡议不在进行中', 400, 'CAMPAIGN_NOT_ACTIVE');
    }

    const result = await query(
      `INSERT INTO campaign_donations (campaign_id, donor_name, amount, donor_message, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [id, donor_name, amount, donor_message]
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

// 认捐回调
router.post('/:id/donate/notify', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { order_id, status, paid_at } = req.body;

    await query(
      `UPDATE campaign_donations 
       SET status = $1, payment_order_id = $2, paid_at = $3
       WHERE id = $2`,
      [status, order_id, paid_at]
    );

    // 更新倡议当前金额
    const donationResult = await query(
      'SELECT amount FROM campaign_donations WHERE id = $1',
      [order_id]
    );

    if (donationResult.rows.length > 0) {
      await query(
        `UPDATE campaigns 
         SET current_amount = current_amount + $1, updated_at = NOW()
         WHERE id = $2`,
        [donationResult.rows[0].amount, id]
      );
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
