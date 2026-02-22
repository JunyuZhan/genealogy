// 关系类型枚举
export const RelationshipType = {
  BIOLOGICAL: 'biological',    // 血缘（亲子）
  ADOPTED: 'adopted',          // 收养/过继
  STEP: 'step',                // 继父母/继子女
  MARRIED_IN: 'married_in',   // 赘婿
} as const;

export type RelationshipType = typeof RelationshipType[keyof typeof RelationshipType];


// 墓冢信息
export interface CemeteryInfo {
  lat: number;              // 纬度
  lng: number;             // 经度
  address: string;          // 文字地址/山头名称
  photos: string[];         // 墓冢图片URL
  panorama?: string;        // 360度全景影像URL
  cemeteryCode?: string;    // 墓号/碑文编号
}

// 家族关系边（支持双向溯源）
export interface FamilyLink {
  targetId: string;            // 关联的成员ID
  relationship: RelationshipType; // 关系类型
  role: 'father' | 'mother' | 'spouse' | 'son' | 'daughter';   // 在当前节点视角中的角色
}

// 配偶信息
export interface Spouse {
  id?: string;               // 配偶的Member ID
  name: string;
  maidenName?: string;       // 娘家姓
  bio?: string;             // 简略生平
  isAlive: boolean;
  marriedDate?: string;     // 结婚日期
  divorcedDate?: string;    // 离异日期
  cemetery?: CemeteryInfo;
}

// 核心成员数据模型
export interface Member {
  id: string;                  // UUID
  
  // 家族定位
  parents: FamilyLink[];        // 父母关系列表
  children: FamilyLink[];      // 子女关系列表
  
  // 基础信息
  name: string;                // 姓名 (讳)
  givenName?: string;          // 字/号
  nickname?: string;           // 乳名
  gender: 'M' | 'F';          
  generation: number;           // 世系序号（第几世）
  generationWord: string;     // 字辈 (派语)
  order: number;               // 排行
  
  // 配偶信息
  spouses: Spouse[];

  // 生死状态
  isAlive: boolean;           
  birthDate: string;          // 出生日期
  deathDate?: string;         // 卒年
  bio?: string;               // 生平简介
  
  // 墓冢信息
  cemetery: CemeteryInfo | null;

  // 扩展标记
  branchName: string;         // 所属支系名称
  isFloating: boolean;        // 是否为尚未厘清辈份的孤立支系
  tags?: string[];           // 标签：['出嗣', '早殇', '迁出', '入赘', '过继']
  
  // 祭扫信息
  lastVisitedAt?: string;     // 最后祭扫时间
  visitCount?: number;        // 祭扫次数
  
  // 联系方式 (可选)
  contact?: string;           // 电话/微信
  photo?: string;             // 头像/照片URL

  // 隐私控制
  publicFields?: string[];    // 公开的字段列表
}
