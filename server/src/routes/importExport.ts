import { Router, Response, NextFunction } from 'express';
import { query } from '../utils/db';
import { createError } from '../middleware/errorHandler';
import { authenticate, requireRole } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// 导出成员数据为 JSON
router.get('/json', authenticate, requireRole('super_admin', 'family_admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const membersResult = await query('SELECT * FROM members ORDER BY generation, order_in_generation');
    const familyLinksResult = await query('SELECT * FROM family_links');
    const spousesResult = await query('SELECT * FROM spouses');
    const cemeteriesResult = await query('SELECT * FROM cemeteries');

    const exportData = {
      exportTime: new Date().toISOString(),
      version: '1.0',
      members: membersResult.rows,
      familyLinks: familyLinksResult.rows,
      spouses: spousesResult.rows,
      cemeteries: cemeteriesResult.rows,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=genealogy-${Date.now()}.json`);
    res.json(exportData);
  } catch (error) {
    next(error);
  }
});

// 导出成员数据为 SQL
router.get('/sql', authenticate, requireRole('super_admin', 'family_admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const membersResult = await query('SELECT * FROM members ORDER BY generation, order_in_generation');

    let sql = '-- 宗族数据导出\n-- 生成时间: ' + new Date().toISOString() + '\n\n';

    // 导出 members 表
    membersResult.rows.forEach(member => {
      const fields = Object.keys(member).filter(k => k !== 'id' && k !== 'created_at' && k !== 'updated_at');
      const values = fields.map(f => {
        const v = member[f];
        if (v === null) return 'NULL';
        if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
        if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
        return v;
      });
      sql += `INSERT INTO members (${fields.join(', ')}, id) VALUES (${values.join(', ')}, '${member.id}');\n`;
    });

    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', `attachment; filename=genealogy-${Date.now()}.sql`);
    res.send(sql);
  } catch (error) {
    next(error);
  }
});

// 导入 CSV/Excel 数据
router.post('/import', authenticate, requireRole('super_admin', 'family_admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { members, mode = 'create' } = req.body; // mode: create | update | upsert

    if (!Array.isArray(members) || members.length === 0) {
      throw createError('导入数据不能为空', 400, 'INVALID_DATA');
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const member of members) {
      try {
        const { name, gender, generation, generation_word, order_in_generation, branch_name, is_alive, birth_date, death_date, bio } = member;

        if (!name || !gender || !generation) {
          throw new Error('缺少必填字段: name, gender, generation');
        }

        if (mode === 'upsert') {
          // 检查是否存在
          const existCheck = await query(
            'SELECT id FROM members WHERE name = $1 AND generation = $2',
            [name, generation]
          );

          if (existCheck.rows.length > 0) {
            // 更新
            await query(
              `UPDATE members SET 
                 given_name = $1, gender = $2, generation_word = $3, order_in_generation = $4,
                 branch_name = $5, is_alive = $6, birth_date = $7, death_date = $8, bio = $9,
                 updated_at = NOW()
               WHERE id = $10`,
              [member.given_name, gender, generation_word, order_in_generation, branch_name, is_alive, birth_date, death_date, bio, existCheck.rows[0].id]
            );
          } else {
            // 创建
            await query(
              `INSERT INTO members (name, given_name, gender, generation, generation_word, order_in_generation, branch_name, is_alive, birth_date, death_date, bio)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
              [name, member.given_name, gender, generation, generation_word, order_in_generation, branch_name, is_alive, birth_date, death_date, bio]
            );
          }
        } else {
          // 仅创建
          await query(
            `INSERT INTO members (name, given_name, gender, generation, generation_word, order_in_generation, branch_name, is_alive, birth_date, death_date, bio)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [name, member.given_name, gender, generation, generation_word, order_in_generation, branch_name, is_alive, birth_date, death_date, bio]
          );
        }

        results.success++;
      } catch (err: any) {
        results.failed++;
        results.errors.push(`${member.name}: ${err.message}`);
      }
    }

    res.json({
      success: true,
      data: results,
      message: `成功导入 ${results.success} 条，失败 ${results.failed} 条`,
    });
  } catch (error) {
    next(error);
  }
});

// 获取导入模板
router.get('/template', authenticate, requireRole('super_admin', 'family_admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const template = [
      {
        name: '张三',
        given_name: '字',
        gender: 'M',
        generation: 1,
        generation_word: '祖',
        order_in_generation: 1,
        branch_name: '长房',
        is_alive: false,
        birth_date: '1850',
        death_date: '1920',
        bio: '简介',
      },
    ];

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=import-template.json');
    res.json(template);
  } catch (error) {
    next(error);
  }
});

export default router;
