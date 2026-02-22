-- 宗族数字化平台数据库表结构
-- Author: minimax工程师
-- Date: 2026-02-22

-- ============================================
-- 用户与权限表
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100),
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    real_name VARCHAR(50),          -- 真实姓名（可选）
    nickname VARCHAR(50),            -- 网名
    avatar VARCHAR(500),             -- 头像URL
    role VARCHAR(20) NOT NULL DEFAULT 'member' 
        CHECK (role IN ('super_admin', 'family_admin', 'branch_contact', 'member', 'guest')),
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'disabled', 'pending')),
    branch_id UUID,                  -- 负责的支系
    last_login_at TIMESTAMP,
    login_fail_count INT DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 成员表（族谱核心）
-- ============================================
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 基础信息
    name VARCHAR(100) NOT NULL,
    given_name VARCHAR(50),          -- 字/号
    nickname VARCHAR(50),            -- 乳名
    gender CHAR(1) NOT NULL 
        CHECK (gender IN ('M', 'F')),
    
    -- 家族定位
    generation INTEGER NOT NULL,
    generation_word VARCHAR(10),     -- 字辈
    order_in_generation INTEGER DEFAULT 1,
    branch_id UUID,                  -- 所属支系
    branch_name VARCHAR(100),        -- 支系名称（如：三房）
    is_floating BOOLEAN DEFAULT FALSE,  -- 是否为孤立支系
    
    -- 生死状态
    is_alive BOOLEAN DEFAULT TRUE,
    birth_date VARCHAR(50),          -- 支持模糊日期
    death_date VARCHAR(50),         -- 卒年
    bio TEXT,                       -- 生平简介
    
    -- 扩展标记
    tags JSONB,                     -- ['出嗣', '早殇', '迁出']
    
    -- 隐私控制
    public_fields JSONB,             -- 公开的字段列表
    
    -- 祭扫信息
    last_visited_at TIMESTAMP,
    visit_count INT DEFAULT 0,
    
    -- 审核状态
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID,
    verified_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 家族关系表（双向溯源）
-- ============================================
CREATE TABLE family_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    relationship VARCHAR(20) NOT NULL 
        CHECK (relationship IN ('biological', 'adopted', 'step', 'married_in')),
    role VARCHAR(10) NOT NULL 
        CHECK (role IN ('father', 'mother', 'spouse')),
    is_primary BOOLEAN DEFAULT TRUE,    -- 主要关系（如多配偶时）
    notes VARCHAR(500),                 -- 备注（如过继说明）
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(member_id, target_id, role)
);

-- ============================================
-- 配偶表
-- ============================================
CREATE TABLE spouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    maiden_name VARCHAR(50),            -- 娘家姓
    gender CHAR(1) NOT NULL 
        CHECK (gender IN ('M', 'F')),
    is_alive BOOLEAN DEFAULT TRUE,
    birth_date VARCHAR(50),
    death_date VARCHAR(50),
    bio TEXT,
    married_date VARCHAR(50),           -- 结婚日期
    divorced_date VARCHAR(50),          -- 离异日期
    is_primary_spouse BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 墓冢表
-- ============================================
CREATE TABLE cemeteries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE UNIQUE,
    
    -- 位置信息
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    address VARCHAR(500),               -- 文字地址/山头名称
    cemetery_code VARCHAR(50),          -- 墓号/碑文编号
    
    -- 照片与全景
    photos JSONB,                      -- 照片URL数组
    panorama VARCHAR(500),              -- 360度全景URL
    
    -- 审核状态
    is_public BOOLEAN DEFAULT FALSE,   -- 是否公开
    is_verified BOOLEAN DEFAULT FALSE, -- 是否审核通过
    verified_by UUID,
    verified_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 祭扫日志表
-- ============================================
CREATE TABLE memorial_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id), -- 祭扫者（可为匿名）
    visitor_name VARCHAR(50),          -- 匿名祭扫者网名
    
    action VARCHAR(20) NOT NULL 
        CHECK (action IN ('flower', 'candle', 'incense', 'visit', 'message')),
    message TEXT,                      -- 祭扫留言
    
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    visited_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 信息申请表（信息录入审批）
-- ============================================
CREATE TABLE info_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    request_type VARCHAR(20) NOT NULL 
        CHECK (request_type IN ('add', 'update', 'delete', 'status_change', 'photo', 'cemetery')),
    applicant_id UUID NOT NULL REFERENCES users(id),
    target_member_id UUID REFERENCES members(id),
    
    -- 申请数据
    data JSONB NOT NULL,
    reason VARCHAR(500),               -- 申请理由
    
    -- 审批状态
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewer_id UUID,
    review_comment TEXT,
    reviewed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 支系表
-- ============================================
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    founder_name VARCHAR(100),         -- 始祖姓名
    location VARCHAR(200),             -- 迁居地
    population INT DEFAULT 0,          -- 人口统计
    
    contact_user_id UUID REFERENCES users(id),
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 公告表
-- ============================================
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'notice'
        CHECK (type IN ('notice', 'news', 'event')),
    
    author_id UUID REFERENCES users(id),
    published_at TIMESTAMP DEFAULT NOW(),
    expired_at TIMESTAMP,              -- 过期时间
    
    is_pinned BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 捐赠表
-- ============================================
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    donor_name VARCHAR(100) NOT NULL,  -- 捐赠人姓名（必填公开）
    amount DECIMAL(10, 2) NOT NULL,    -- 捐赠金额（必填公开）
    currency VARCHAR(10) DEFAULT 'CNY',
    
    -- 捐赠意愿
    purpose VARCHAR(20) NOT NULL 
        CHECK (purpose IN ('operation', 'mutual_aid', 'scholarship', 'emergency', 'other')),
    
    payment_method VARCHAR(20),        -- 支付方式
    payment_order_id VARCHAR(100),     -- 支付订单号
    
    donor_phone VARCHAR(20),
    donor_message VARCHAR(500),        -- 捐赠留言
    
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'paid', 'refunded', 'failed')),
    
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    paid_at TIMESTAMP
);

-- ============================================
-- 倡议表（宗族互助）
-- ============================================
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(20) NOT NULL
        CHECK (type IN ('difficulty', 'scholarship', 'disaster', 'medical', 'other')),
    
    target_amount DECIMAL(12, 2),     -- 目标金额
    current_amount DECIMAL(12, 2) DEFAULT 0,
    
    beneficiary_name VARCHAR(100),    -- 受助人姓名
    beneficiary_relation VARCHAR(50),  -- 与宗族关系
    
    applicant_id UUID NOT NULL REFERENCES users(id),
    reviewer_id UUID,
    
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'closed')),
    review_comment TEXT,
    
    start_date DATE,
    end_date DATE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 倡议认捐表
-- ============================================
CREATE TABLE campaign_donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    
    donor_name VARCHAR(100) NOT NULL,  -- 认捐人姓名（必填公开）
    amount DECIMAL(10, 2) NOT NULL,    -- 认捐金额（必填公开）
    
    payment_method VARCHAR(20),
    payment_order_id VARCHAR(100),
    
    donor_message VARCHAR(500),
    
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'paid', 'refunded', 'failed')),
    
    created_at TIMESTAMP DEFAULT NOW(),
    paid_at TIMESTAMP
);

-- ============================================
-- 操作日志表
-- ============================================
CREATE TABLE operation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50),         -- 操作资源类型
    resource_id UUID,
    
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 系统配置表
-- ============================================
CREATE TABLE system_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value JSONB NOT NULL,
    description VARCHAR(500),
    
    is_public BOOLEAN DEFAULT FALSE,   -- 是否公开（前端可读）
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 索引优化
-- ============================================

-- 成员索引
CREATE INDEX idx_members_generation ON members(generation);
CREATE INDEX idx_members_branch ON members(branch_id);
CREATE INDEX idx_members_name ON members(name);
CREATE INDEX idx_members_is_alive ON members(is_alive);
CREATE INDEX idx_members_is_floating ON members(is_floating);

-- 关系索引
CREATE INDEX idx_family_links_member ON family_links(member_id);
CREATE INDEX idx_family_links_target ON family_links(target_id);

-- 祭扫日志索引
CREATE INDEX idx_memorial_logs_member ON memorial_logs(member_id);
CREATE INDEX idx_memorial_logs_visited ON memorial_logs(visited_at);

-- 申请索引
CREATE INDEX idx_info_requests_status ON info_requests(status);
CREATE INDEX idx_info_requests_applicant ON info_requests(applicant_id);

-- 捐赠索引
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_created ON donations(created_at);

-- 倡议索引
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_type ON campaigns(type);

-- ============================================
-- 初始配置数据
-- ============================================

-- 默认系统配置
INSERT INTO system_configs (config_key, config_value, description, is_public) VALUES
('system_name', '"XX氏宗族数字化平台"', '系统名称', TRUE),
('system_logo', '""', '系统Logo URL', TRUE),
('system_description', '"传承家族文化，连接族人情感"', '系统描述', TRUE),
('privacy_default_alive', '[]', '在世成员默认公开字段', FALSE),
('privacy_default_deceased', '["name", "generation", "generationWord", "branchName", "isAlive", "cemetery"]', '已故成员默认公开字段', FALSE),
('memorial_enabled', 'true', '祭扫功能开关', TRUE),
('donation_enabled', 'true', '捐赠功能开关', TRUE),
('campaign_enabled', 'true', '倡议功能开关', TRUE);
