import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useMemberStore } from './memberStore';
import type { Member } from '../types';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    getMembers: vi.fn(),
  }
}));

describe('stores/memberStore.ts', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const createMockMember = (overrides: Partial<Member> = {}): Member => ({
    id: 'test-id',
    name: 'Test',
    gender: 'M',
    generation: 1,
    generationWord: 'Test',
    order: 1,
    isAlive: true,
    birthDate: '1990-01-01',
    parents: [],
    children: [],
    spouses: [],
    branchName: 'Main',
    isFloating: false,
    cemetery: null,
    ...overrides
  });

  describe('Basic CRUD', () => {
    it('should get member by id', () => {
      const store = useMemberStore();
      store.setMembers([createMockMember({ id: 'member-1', name: '张三' })]);
      
      const member = store.getMember('member-1');
      expect(member?.name).toBe('张三');
    });

    it('should return undefined for non-existent member', () => {
      const store = useMemberStore();
      store.setMembers([]);
      
      const member = store.getMember('non-existent');
      expect(member).toBeUndefined();
    });

    it('should add member', () => {
      const store = useMemberStore();
      store.setMembers([]);
      const newMember = createMockMember({ id: 'new-member' });
      
      store.addMember(newMember);
      
      expect(store.members.length).toBe(1);
      expect(store.members[0]?.id).toBe('new-member');
    });

    it('should update member', () => {
      const store = useMemberStore();
      store.setMembers([createMockMember({ id: 'member-1', name: 'Original' })]);
      
      store.updateMember('member-1', { name: 'Updated' });
      
      expect(store.getMember('member-1')?.name).toBe('Updated');
    });

    it('should delete member', () => {
      const store = useMemberStore();
      store.setMembers([
        createMockMember({ id: 'member-1' }),
        createMockMember({ id: 'member-2' })
      ]);
      
      store.deleteMember('member-1');
      
      expect(store.members.length).toBe(1);
      expect(store.members[0]?.id).toBe('member-2');
    });
  });

  describe('addChild', () => {
    it('should add child to member', () => {
      const store = useMemberStore();
      const parent = createMockMember({ 
        id: 'parent-1', 
        generation: 1,
        children: [] 
      });
      store.setMembers([parent]);
      
      const child = store.addChild('parent-1', { name: 'Child', gender: 'M' });
      
      expect(child).not.toBeNull();
      expect(child?.name).toBe('Child');
      expect(child?.generation).toBe(2);
      expect(parent.children?.length).toBe(1);
    });

    it('should return null if parent not found', () => {
      const store = useMemberStore();
      store.setMembers([]);
      
      const child = store.addChild('non-existent', { name: 'Child' });
      
      expect(child).toBeNull();
    });

    it('should set correct child role based on gender', () => {
      const store = useMemberStore();
      const parent = createMockMember({ id: 'parent-1', children: [] });
      store.setMembers([parent]);
      
      const son = store.addChild('parent-1', { name: 'Son', gender: 'M' });
      expect(son?.gender).toBe('M');
      
      const daughter = store.addChild('parent-1', { name: 'Daughter', gender: 'F' });
      expect(daughter?.gender).toBe('F');
    });
  });

  describe('addSpouse', () => {
    it('should add spouse to member', () => {
      const store = useMemberStore();
      const member = createMockMember({ id: 'member-1', spouses: [] });
      store.setMembers([member]);
      
      const spouse = store.addSpouse('member-1', { name: 'Spouse', isAlive: true });
      
      expect(spouse).not.toBeNull();
      expect(spouse?.name).toBe('Spouse');
      expect(member.spouses?.length).toBe(1);
    });

    it('should return null if member not found', () => {
      const store = useMemberStore();
      store.setMembers([]);
      
      const spouse = store.addSpouse('non-existent', { name: 'Spouse', isAlive: true });
      
      expect(spouse).toBeNull();
    });

    it('should handle members without existing spouses array', () => {
      const store = useMemberStore();
      const member = createMockMember({ id: 'member-1', spouses: undefined });
      store.setMembers([member]);
      
      const spouse = store.addSpouse('member-1', { name: 'Spouse', isAlive: true });
      
      expect(spouse).not.toBeNull();
      expect(member.spouses?.length).toBe(1);
    });
  });

  describe('addSibling', () => {
    it('should add sibling via common parent', () => {
      const store = useMemberStore();
      const parent = createMockMember({ id: 'parent-1', children: [] });
      const member = createMockMember({ 
        id: 'member-1', 
        parents: [{ targetId: 'parent-1', relationship: 'biological', role: 'father' }],
        children: [] 
      });
      store.setMembers([parent, member]);
      
      const sibling = store.addSibling('member-1', { name: 'Sibling', gender: 'F' });
      
      expect(sibling).not.toBeNull();
      expect(sibling?.name).toBe('Sibling');
    });

    it('should return null if member has no biological parent', () => {
      const store = useMemberStore();
      const member = createMockMember({ id: 'member-1', parents: [] });
      store.setMembers([member]);
      
      const sibling = store.addSibling('member-1', { name: 'Sibling' });
      
      expect(sibling).toBeNull();
    });

    it('should return null if member not found', () => {
      const store = useMemberStore();
      store.setMembers([]);
      
      const sibling = store.addSibling('non-existent', { name: 'Sibling' });
      
      expect(sibling).toBeNull();
    });
  });

  describe('setMembers', () => {
    it('should replace all members', () => {
      const store = useMemberStore();
      store.setMembers([createMockMember({ id: '1' })]);
      store.setMembers([createMockMember({ id: '2' })]);
      
      expect(store.members.length).toBe(1);
      expect(store.members[0]?.id).toBe('2');
    });
  });

  describe('validateMember', () => {
    it('should validate required name', () => {
      const store = useMemberStore();
      const result = store.validateMember({ name: '' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('姓名不能为空');
    });

    it('should validate birth/death date logic', () => {
      const store = useMemberStore();
      const result = store.validateMember({ 
        name: 'Test',
        birthDate: '2020-01-01',
        deathDate: '2010-01-01'
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('出生日期不能晚于去世日期');
    });

    it('should validate parent-child generation', () => {
      const store = useMemberStore();
      const parent = createMockMember({ id: 'p1', generation: 5, birthDate: '1980-01-01' });
      store.setMembers([parent]);

      // Error: Generation too small
      const result1 = store.validateMember(
        { name: 'Child', generation: 5 }, 
        { parentId: 'p1' }
      );
      expect(result1.valid).toBe(false);
      expect(result1.errors).toBeDefined();
      expect(result1.errors!.some(e => e.includes('子辈世系(5)必须大于父辈世系(5)'))).toBe(true);

      // Error: Age gap too small
      const result2 = store.validateMember(
        { name: 'Child', generation: 6, birthDate: '1985-01-01' }, 
        { parentId: 'p1' }
      );
      expect(result2.valid).toBe(false);
      expect(result2.errors).toBeDefined();
      expect(result2.errors!.some(e => e.includes('子辈出生日期与父辈过近'))).toBe(true);
    });

    it('should pass valid member', () => {
      const store = useMemberStore();
      const result = store.validateMember({ 
        name: 'Valid', 
        birthDate: '1990-01-01', 
        deathDate: '2080-01-01' 
      });
      expect(result.valid).toBe(true);
    });
  });

  describe('detectConflicts', () => {
    it('should detect duplicate members', () => {
      const store = useMemberStore();
      const existing = createMockMember({ name: 'Same', generation: 1, gender: 'M' });
      store.setMembers([existing]);

      const incoming = [
        createMockMember({ id: 'new-1', name: 'Same', generation: 1, gender: 'M' }), // Duplicate
        createMockMember({ id: 'new-2', name: 'Diff', generation: 1, gender: 'M' })  // New
      ];

      const { conflicts, newMembers } = store.detectConflicts(incoming);

      expect(conflicts.length).toBe(1);
      expect(conflicts[0].type).toBe('duplicate');
      expect(newMembers.length).toBe(1);
      expect(newMembers[0]?.id).toBe('new-2');
    });
  });

  describe('mergeBranch', () => {
    it('should merge members based on resolutions', () => {
      const store = useMemberStore();
      const existing = createMockMember({ id: 'ex-1', name: 'Old Name', generation: 1, gender: 'M' });
      store.setMembers([existing]);

      const incoming = [
        createMockMember({ id: 'in-1', name: 'Old Name', generation: 1, gender: 'M' }), // Conflict
        createMockMember({ id: 'in-2', name: 'New Guy' }) // No conflict
      ];

      // Resolution: Replace existing with incoming data
      const resolutions = [
        { 
          existingId: 'ex-1', 
          incomingId: 'in-1', 
          action: 'replace', 
          incomingData: { name: 'New Name' } 
        }
      ];

      store.mergeBranch(incoming, resolutions);

      // Check replacement
      const updated = store.getMember('ex-1');
      expect(updated?.name).toBe('New Name');

      // Check new member added
      const newMember = store.getMember('in-2');
      expect(newMember).toBeDefined();
    });

    it('should keep both members if requested', () => {
      const store = useMemberStore();
      const existing = createMockMember({ id: 'ex-1', name: 'Same', generation: 1, gender: 'M' });
      store.setMembers([existing]);

      const incoming = [
        createMockMember({ id: 'in-1', name: 'Same', generation: 1, gender: 'M' })
      ];

      const resolutions = [
        { 
          existingId: 'ex-1', 
          incomingId: 'in-1', 
          action: 'keep_both', 
          incomingData: incoming[0] 
        }
      ];

      store.mergeBranch(incoming, resolutions);

      expect(store.members.length).toBe(2);
    });
  });

  describe('fetchMembers', () => {
    it('should fetch members successfully', async () => {
      const store = useMemberStore();
      const mockData = [createMockMember({ id: '1' })];
      (api.getMembers as any).mockResolvedValue(mockData);

      await store.fetchMembers();

      expect(store.members.length).toBe(1);
      expect(store.members[0]?.id).toBe('1');
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
    });

    it('should handle fetch error', async () => {
      const store = useMemberStore();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      (api.getMembers as any).mockRejectedValue(new Error('Network Error'));

      await store.fetchMembers();

      expect(store.members.length).toBe(0);
      expect(store.error).toBe('Network Error');
      expect(store.isLoading).toBe(false);
      
      consoleSpy.mockRestore();
    });
  });

  describe('addChild edge cases', () => {
    it('should initialize children array if undefined', () => {
      const store = useMemberStore();
      const parent = createMockMember({ id: 'p1', children: undefined });
      store.setMembers([parent]);
      
      store.addChild('p1', { name: 'Child' });
      
      expect(parent.children).toBeDefined();
      expect(parent.children!.length).toBe(1);
    });
  });
});
