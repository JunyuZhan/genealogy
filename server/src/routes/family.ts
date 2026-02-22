import { Router, Response, NextFunction } from 'express';
import { query, getClient } from '../utils/db';
import { createError } from '../middleware/errorHandler';
import { authenticate, requireRole } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// 添加家庭关系
router.post('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    
    const { member_id, target_id, relationship, role, is_primary, notes } = req.body;

    // 检查成员是否存在
    const memberCheck = await client.query('SELECT id FROM members WHERE id = $1', [member_id]);
    const targetCheck = await client.query('SELECT id FROM members WHERE id = $1', [target_id]);
    
    if (memberCheck.rows.length === 0 || targetCheck.rows.length === 0) {
      throw createError('成员不存在', 404, 'MEMBER_NOT_FOUND');
    }

    // 检查关系是否已存在
    const existCheck = await client.query(
      'SELECT id FROM family_links WHERE member_id = $1 AND target_id = $2 AND role = $3',
      [member_id, target_id, role]
    );
    
    if (existCheck.rows.length > 0) {
      throw createError('关系已存在', 400, 'RELATIONSHIP_EXISTS');
    }

    const result = await client.query(
      `INSERT INTO family_links (member_id, target_id, relationship, role, is_primary, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [member_id, target_id, relationship, role, is_primary || false, notes]
    );

    // 如果是父子/母子关系，同时建立反向关系
    if (role === 'father' || role === 'mother') {
      const childRole = 'child';
      await client.query(
        `INSERT INTO family_links (member_id, target_id, relationship, role, is_primary)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT DO NOTHING`,
        [target_id, member_id, relationship]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

// 删除家庭关系
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM family_links WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      throw createError('关系不存在', 404, 'RELATIONSHIP_NOT_FOUND');
    }

    res.json({ success: true, message: '关系已删除' });
  } catch (error) {
    next(error);
  }
});

// 获取族谱树数据（用于D3.js）
router.get('/tree/:rootId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { rootId } = req.params;
    const { maxDepth = 5 } = req.query;

    // 递归查询后代
    const result = await query(
      `WITH RECURSIVE descendants AS (
        SELECT m.id, m.name, m.gender, m.generation, m.generation_word, m.order_in_generation,
               m.is_alive, m.birth_date, m.death_date, m.branch_name, m.is_floating,
               0 as depth
        FROM members m
        WHERE m.id = $1
        
        UNION ALL
        
        SELECT m.id, m.name, m.gender, m.generation, m.generation_word, m.order_in_generation,
               m.is_alive, m.birth_date, m.death_date, m.branch_name, m.is_floating,
               d.depth + 1
        FROM members m
        INNER JOIN family_links fl ON fl.member_id = d.id AND fl.role = 'child'
        INNER JOIN members m ON m.id = fl.target_id
        WHERE d.depth < $2
      )
      SELECT * FROM descendants`,
      [rootId, maxDepth]
    );

    // 构建树形结构
    const nodes = result.rows;
    const tree = buildTree(nodes, rootId);

    res.json({ success: true, data: tree });
  } catch (error) {
    next(error);
  }
});

// 辅助函数：构建树形结构
function buildTree(nodes: any[], rootId: string): any {
  const nodeMap = new Map();
  nodes.forEach(n => {
    nodeMap.set(n.id, { ...n, children: [] });
  });

  let root: any = null;
  
  nodes.forEach(n => {
    const node = nodeMap.get(n.id);
    if (n.id === rootId) {
      root = node;
    } else {
      // 查找父节点
      const parentLink = nodes.find(p => p.id === n.id && p.depth < n.depth);
      if (parentLink) {
        const parent = nodeMap.get(parentLink.id);
        if (parent) {
          parent.children.push(node);
        }
      }
    }
  });

  return root;
}

// 更新代际（当添加父辈时）
router.put('/recalculate-generation/:memberId', authenticate, requireRole('super_admin', 'family_admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { memberId } = req.params;
    const { newGeneration } = req.body;

    // 递归更新所有后代的代际
    const result = await query(
      `WITH RECURSIVE update_gen AS (
        SELECT id, generation
        FROM members
        WHERE id = $1
        
        UNION ALL
        
        SELECT m.id, m.generation
        FROM members m
        INNER JOIN family_links fl ON fl.member_id = update_gen.id AND fl.role = 'child'
        INNER JOIN members m ON m.id = fl.target_id
      )
      UPDATE members m
      SET generation = generation + $2,
          updated_at = NOW()
      FROM update_gen ug
      WHERE m.id = ug.id
      RETURNING m.id, m.generation`,
      [memberId, newGeneration]
    );

    res.json({
      success: true,
      data: result.rows,
      message: `已更新 ${result.rows.length} 个成员的代际`,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
