import pool, { query } from '../utils/db';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const seed = async () => {
  try {
    console.log('Starting database seed...');

    // 1. Clear existing data (order matters due to foreign keys)
    console.log('Clearing existing data...');
    await query('DELETE FROM memorial_logs');
    await query('DELETE FROM cemeteries');
    await query('DELETE FROM spouses');
    await query('DELETE FROM family_links');
    await query('DELETE FROM members');
    await query('DELETE FROM announcements');
    await query('DELETE FROM branches');
    await query('DELETE FROM users');

    // 2. Create Users
    console.log('Creating users...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const memberPassword = await bcrypt.hash('member123', 10);

    const adminId = uuidv4();
    const memberId = uuidv4();

    await query(
      `INSERT INTO users (id, username, email, password_hash, role, real_name, status) VALUES 
       ($1, 'admin', 'admin@example.com', $2, 'super_admin', '系统管理员', 'active'),
       ($3, 'member', 'member@example.com', $4, 'member', '普通族员', 'active')`,
      [adminId, adminPassword, memberId, memberPassword]
    );

    // 3. Create Branch
    console.log('Creating branch...');
    const branchId = uuidv4();
    await query(
      `INSERT INTO branches (id, name, description, founder_name, location, contact_user_id) VALUES 
       ($1, '陈氏家族-总支', '陈氏家族总支脉，源远流长。', '陈始祖', '浙江杭州', $2)`,
      [branchId, adminId]
    );

    // 4. Create Members (3 Generations)
    console.log('Creating members...');
    
    // Gen 1: Ancestor
    const g1_root = uuidv4();
    await query(
      `INSERT INTO members (id, name, gender, generation, generation_word, branch_id, branch_name, is_alive, is_verified) VALUES 
       ($1, '陈始祖', 'M', 1, '始', $2, '总支', false, true)`,
      [g1_root, branchId]
    );

    // Gen 1: Spouse (Using spouses table for simpler spouse record)
    await query(
      `INSERT INTO spouses (member_id, name, gender, is_alive, is_primary_spouse) VALUES 
       ($1, '王氏', 'F', false, true)`,
      [g1_root]
    );

    // Gen 2: Son 1
    const g2_son1 = uuidv4();
    await query(
      `INSERT INTO members (id, name, gender, generation, generation_word, branch_id, branch_name, is_alive, is_verified) VALUES 
       ($1, '陈二世', 'M', 2, '二', $2, '总支', false, true)`,
      [g2_son1, branchId]
    );

    // Link Gen 2 to Gen 1
    await query(
      `INSERT INTO family_links (member_id, target_id, relationship, role) VALUES 
       ($1, $2, 'biological', 'father')`,
      [g2_son1, g1_root]
    );

    // Gen 2: Spouse
    await query(
      `INSERT INTO spouses (member_id, name, gender, is_alive, is_primary_spouse) VALUES 
       ($1, '李氏', 'F', false, true)`,
      [g2_son1]
    );

    // Gen 3: Grandson 1
    const g3_grandson1 = uuidv4();
    await query(
      `INSERT INTO members (id, name, gender, generation, generation_word, branch_id, branch_name, is_alive, is_verified) VALUES 
       ($1, '陈大孙', 'M', 3, '大', $2, '总支', true, true)`,
      [g3_grandson1, branchId]
    );

    // Link Gen 3 to Gen 2
    await query(
      `INSERT INTO family_links (member_id, target_id, relationship, role) VALUES 
       ($1, $2, 'biological', 'father')`,
      [g3_grandson1, g2_son1]
    );

    // Gen 3: Grandson 2
    const g3_grandson2 = uuidv4();
    await query(
      `INSERT INTO members (id, name, gender, generation, generation_word, branch_id, branch_name, is_alive, is_verified) VALUES 
       ($1, '陈小孙', 'M', 3, '小', $2, '总支', true, true)`,
      [g3_grandson2, branchId]
    );

    // Link Gen 3 to Gen 2
    await query(
      `INSERT INTO family_links (member_id, target_id, relationship, role) VALUES 
       ($1, $2, 'biological', 'father')`,
      [g3_grandson2, g2_son1]
    );

    // 5. Create Cemetery for Root
    console.log('Creating cemetery...');
    await query(
      `INSERT INTO cemeteries (member_id, lat, lng, address, cemetery_code, is_public, is_verified) VALUES 
       ($1, 30.2741, 120.1551, '杭州半山公墓 A区-001', 'CM-001', true, true)`,
      [g1_root]
    );

    // 6. Create Announcements
    console.log('Creating announcements...');
    await query(
      `INSERT INTO announcements (title, content, type, author_id, is_pinned) VALUES 
       ('家族祭祖大典通知', '兹定于清明节举行全族祭祖大典，请各位宗亲准时参加。', 'notice', $1, true),
       ('修谱工作进度汇报', '经过三个月的努力，家谱修订工作已完成初稿。', 'news', $1, false)`,
      [adminId]
    );

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Seed failed:', error);
  } finally {
    await pool.end();
  }
};

seed();
