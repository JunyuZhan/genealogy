import { Router, Response, NextFunction } from 'express';
import { query } from '../utils/db';
import { createError } from '../middleware/errorHandler';
import { optionalAuth } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// 全局搜索
router.get('/', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { q, type, page = 1, limit = 20 } = req.query;

    if (!q || (q as string).length < 1) {
      throw createError('请输入搜索关键词', 400, 'INVALID_QUERY');
    }

    const searchTerm = `%${q}%`;
    const results: any = {
      members: [],
      branches: [],
      announcements: [],
    };

    // 搜索成员
    const memberSql = `
      SELECT id, name, given_name, generation, generation_word, branch_name, is_alive
      FROM members 
      WHERE is_verified = true 
        AND (
          name ILIKE $1 
          OR given_name ILIKE $1 
          OR generation_word ILIKE $1 
          OR branch_name ILIKE $1
        )
      ORDER BY generation, order_in_generation
      LIMIT $2
    `;
    const memberResult = await query(memberSql, [searchTerm, limit]);
    results.members = memberResult.rows;

    // 搜索支系
    if (!type || type === 'branches') {
      const branchSql = `
        SELECT id, name, description, founder_name, location
        FROM branches 
        WHERE is_active = true 
          AND (name ILIKE $1 OR description ILIKE $1 OR founder_name ILIKE $1)
        LIMIT $2
      `;
      const branchResult = await query(branchSql, [searchTerm, limit]);
      results.branches = branchResult.rows;
    }

    // 搜索公告
    if (!type || type === 'announcements') {
      const announcementSql = `
        SELECT id, title, content, type, published_at
        FROM announcements 
        WHERE is_active = true 
          AND (title ILIKE $1 OR content ILIKE $1)
        LIMIT $2
      `;
      const announcementResult = await query(announcementSql, [searchTerm, limit]);
      results.announcements = announcementResult.rows;
    }

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
});

// 搜索成员（高级）
router.get('/members', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { q, generation, generation_word, branch, is_alive, gender, page = 1, limit = 20 } = req.query;

    let sql = 'SELECT * FROM members WHERE is_verified = true';
    const params: any[] = [];
    let paramIndex = 1;

    if (q) {
      sql += ` AND (name ILIKE $${paramIndex++} OR given_name ILIKE $${paramIndex++})`;
      params.push(`%${q}%`, `%${q}%`);
    }

    if (generation) {
      sql += ` AND generation = $${paramIndex++}`;
      params.push(generation);
    }

    if (generation_word) {
      sql += ` AND generation_word = $${paramIndex++}`;
      params.push(generation_word);
    }

    if (branch) {
      sql += ` AND branch_name = $${paramIndex++}`;
      params.push(branch);
    }

    if (is_alive !== undefined) {
      sql += ` AND is_alive = $${paramIndex++}`;
      params.push(is_alive === 'true');
    }

    if (gender) {
      sql += ` AND gender = $${paramIndex++}`;
      params.push(gender);
    }

    // 获取总数
    const countResult = await query(sql.replace('SELECT *', 'SELECT COUNT(*)'), params);
    const total = parseInt(countResult.rows[0].count);

    // 分页
    sql += ` ORDER BY generation, order_in_generation LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const result = await query(sql, params);

    res.json({
      success: true,
      data: {
        members: result.rows,
        pagination: { total, page: Number(page), limit: Number(limit) },
      },
    });
  } catch (error) {
    next(error);
  }
});

// 字辈索引搜索
router.get('/generation-word', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await query(`
      SELECT generation_word, COUNT(*) as count
      FROM members 
      WHERE is_verified = true AND generation_word IS NOT NULL AND generation_word != ''
      GROUP BY generation_word
      ORDER BY generation_word
    `);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

// 农历日期模糊搜索（需要解析模糊日期）
router.get('/fuzzy-date', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { q, field = 'birth_date' } = req.query; // field: birth_date | death_date

    if (!q) {
      throw createError('请输入搜索关键词', 400, 'INVALID_QUERY');
    }

    // 支持的模糊日期格式：乾隆XX年、民国XX年、农历XXXX年
    const result = await query(
      `SELECT id, name, generation, generation_word, birth_date, death_date
       FROM members 
       WHERE is_verified = true AND ${field} ILIKE $1
       ORDER BY generation, order_in_generation
       LIMIT 50`,
      [`%${q}%`]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

// 获取祖先路径
router.get('/ancestors/:memberId', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { memberId } = req.params;

    // 递归查询祖先
    const result = await query(
      `WITH RECURSIVE ancestors AS (
        SELECT m.id, m.name, m.generation, m.generation_word, m.gender, 0 as depth
        FROM members m
        WHERE m.id = $1
        
        UNION ALL
        
        SELECT m.id, m.name, m.generation, m.generation_word, m.gender, a.depth + 1
        FROM members m
        INNER JOIN family_links fl ON fl.member_id = a.id AND fl.role IN ('father', 'mother')
        INNER JOIN members m ON m.id = fl.target_id
      )
      SELECT * FROM ancestors ORDER BY depth DESC`,
      [memberId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

// 获取后代路径
router.get('/descendants/:memberId', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { memberId } = req.params;
    const { maxDepth = 10 } = req.query;

    const result = await query(
      `WITH RECURSIVE descendants AS (
        SELECT m.id, m.name, m.generation, m.generation_word, m.gender, 0 as depth
        FROM members m
        WHERE m.id = $1
        
        UNION ALL
        
        SELECT m.id, m.name, m.generation, m.generation_word, m.gender, d.depth + 1
        FROM members m
        INNER JOIN family_links fl ON fl.member_id = d.id AND fl.role = 'child'
        INNER JOIN members m ON m.id = fl.target_id
        WHERE d.depth < $2
      )
      SELECT * FROM descendants ORDER BY depth, generation, order_in_generation`,
      [memberId, maxDepth]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

export default router;
