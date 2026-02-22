export type UserRole = 'super_admin' | 'family_admin' | 'branch_contact' | 'member' | 'guest';
export type UserStatus = 'active' | 'disabled' | 'pending';
export type RelationshipType = 'biological' | 'adopted' | 'step' | 'married_in';
export type FamilyRole = 'father' | 'mother' | 'spouse';
export type RequestType = 'add' | 'update' | 'delete' | 'status_change' | 'photo' | 'cemetery';
export type RequestStatus = 'pending' | 'approved' | 'rejected';
export type DonationPurpose = 'operation' | 'mutual_aid' | 'scholarship' | 'emergency' | 'other';
export type CampaignType = 'difficulty' | 'scholarship' | 'disaster' | 'medical' | 'other';
export type CampaignStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'closed';
export type MemorialAction = 'flower' | 'candle' | 'incense' | 'visit' | 'message';

export interface User {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  password_hash: string;
  real_name?: string;
  nickname?: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  branch_id?: string;
  last_login_at?: Date;
  login_fail_count: number;
  locked_until?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Member {
  id: string;
  name: string;
  given_name?: string;
  nickname?: string;
  gender: 'M' | 'F';
  generation: number;
  generation_word?: string;
  order_in_generation: number;
  branch_id?: string;
  branch_name?: string;
  is_floating: boolean;
  is_alive: boolean;
  birth_date?: string;
  death_date?: string;
  bio?: string;
  tags?: string[];
  public_fields?: string[];
  last_visited_at?: Date;
  visit_count: number;
  is_verified: boolean;
  verified_by?: string;
  verified_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface FamilyLink {
  id: string;
  member_id: string;
  target_id: string;
  relationship: RelationshipType;
  role: FamilyRole;
  is_primary: boolean;
  notes?: string;
  created_at: Date;
}

export interface Cemetery {
  id: string;
  member_id: string;
  lat?: number;
  lng?: number;
  address?: string;
  cemetery_code?: string;
  photos?: string[];
  panorama?: string;
  is_public: boolean;
  is_verified: boolean;
  verified_by?: string;
  verified_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface MemorialLog {
  id: string;
  member_id: string;
  user_id?: string;
  visitor_name?: string;
  action: MemorialAction;
  message?: string;
  ip_address?: string;
  visited_at: Date;
}

export interface InfoRequest {
  id: string;
  request_type: RequestType;
  applicant_id: string;
  target_member_id?: string;
  data: Record<string, any>;
  reason?: string;
  status: RequestStatus;
  reviewer_id?: string;
  review_comment?: string;
  reviewed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Branch {
  id: string;
  name: string;
  description?: string;
  founder_name?: string;
  location?: string;
  population: number;
  contact_user_id?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'notice' | 'news' | 'event';
  author_id?: string;
  published_at: Date;
  expired_at?: Date;
  is_pinned: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Donation {
  id: string;
  donor_name: string;
  amount: number;
  currency: string;
  purpose: DonationPurpose;
  payment_method?: string;
  payment_order_id?: string;
  donor_phone?: string;
  donor_message?: string;
  status: 'pending' | 'paid' | 'refunded' | 'failed';
  ip_address?: string;
  created_at: Date;
  paid_at?: Date;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  type: CampaignType;
  target_amount: number;
  current_amount: number;
  beneficiary_name?: string;
  beneficiary_relation?: string;
  applicant_id: string;
  reviewer_id?: string;
  status: CampaignStatus;
  review_comment?: string;
  start_date?: Date;
  end_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CampaignDonation {
  id: string;
  campaign_id: string;
  donor_name: string;
  amount: number;
  payment_method?: string;
  payment_order_id?: string;
  donor_message?: string;
  status: 'pending' | 'paid' | 'refunded' | 'failed';
  created_at: Date;
  paid_at?: Date;
}
