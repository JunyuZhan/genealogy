import { Router, Response, NextFunction } from 'express';
import { query } from '../utils/db';
import { createError } from '../middleware/errorHandler';
import { authenticate, requireRole } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// 获取公开配置
router.get('/public', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await query(
      `SELECT config_key, config_value FROM system_configs WHERE is_public = true`
    );

    const configs: Record<string, any> = {};
    result.rows.forEach(row => {
      configs[row.config_key] = row.config_value;
    });

    res.json({ success: true, data: configs });
  } catch (error) {
    next(error);
  }
});

// 获取所有配置
router.get('/', authenticate, requireRole('super_admin', 'family_admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await query(
      `SELECT * FROM system_configs ORDER BY config_key`
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

// 获取单个配置
router.get('/:key', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { key } = req.params;

    const result = await query(
      `SELECT * FROM system_configs WHERE config_key = $1`,
      [key]
    );

    if (result.rows.length === 0) {
      throw createError('配置不存在', 404, 'CONFIG_NOT_FOUND');
    }

    // 公开配置无需登录
    if (result.rows[0].is_public) {
      return res.json({ success: true, data: result.rows[0] });
    }

    // 非公开配置需要管理员权限
    if (!req.user || !['super_admin', 'family_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { message: '权限不足', code: 'FORBIDDEN' },
      });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// 更新配置
router.put('/:key', authenticate, requireRole('super_admin', 'family_admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { key } = req.params;
    const { config_value, description, is_public } = req.body;

    const result = await query(
      `UPDATE system_configs 
       SET config_value = $1, description = $2, is_public = COALESCE($3, is_public), updated_at = NOW()
       WHERE config_key = $4
       RETURNING *`,
      [config_value, description, is_public, key]
    );

    if (result.rows.length === 0) {
      throw createError('配置不存在', 404, 'CONFIG_NOT_FOUND');
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// 创建配置
router.post('/', authenticate, requireRole('super_admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { config_key, config_value, description, is_public } = req.body;

    const result = await query(
      `INSERT INTO system_configs (config_key, config_value, description, is_public)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [config_key, config_value, description, is_public || false]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

export default router;
