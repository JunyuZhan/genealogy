import { describe, it, expect } from 'vitest';
import { transformToD3Tree, buildTreeData } from './treeBuilder';
import { RelationshipType } from '../types';
import type { Member } from '../types';

describe('utils/treeBuilder.ts', () => {
  const createMockMember = (overrides: Partial<Member> = {}): Member => ({
    id: '1',
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

  describe('buildTreeData', () => {
    it('should return root member when found', () => {
      const member = createMockMember({ id: '1', name: 'Root' });
      const result = buildTreeData([member], '1');
      expect(result).not.toBeNull();
      expect(result?.name).toBe('Root');
    });

    it('should return null if root not found', () => {
      const result = buildTreeData([], '1');
      expect(result).toBeNull();
    });

    it('should build parent-child relationships', () => {
      const father = createMockMember({
        id: 'father',
        name: 'Father',
        children: [{ targetId: 'son', relationship: RelationshipType.BIOLOGICAL, role: 'son' }]
      });
      const son = createMockMember({ id: 'son', name: 'Son' });

      const result = buildTreeData([father, son], 'father');
      expect(result).not.toBeNull();
    });
  });

  describe('transformToD3Tree', () => {
    it('should return null if rootId not found', () => {
      const members = [createMockMember({ id: '1' })];
      const result = transformToD3Tree(members, 'non-existent');
      expect(result).toBeNull();
    });

    it('should transform a single member without children', () => {
      const member = createMockMember({ id: 'root', name: 'Root Ancestor', generation: 1 });
      const result = transformToD3Tree([member], 'root');
      
      expect(result).not.toBeNull();
      expect(result?.name).toBe('Root Ancestor');
      expect(result?.children).toBeUndefined();
      expect(result?.originalChildrenLinks).toEqual([]);
    });

    it('should transform members with parent-child relationships', () => {
      const father = createMockMember({
        id: 'father',
        name: 'Father',
        generation: 1,
        children: [{ targetId: 'son', relationship: RelationshipType.BIOLOGICAL, role: 'son' }]
      });
      
      const son = createMockMember({
        id: 'son',
        name: 'Son',
        generation: 2,
        parents: [{ targetId: 'father', relationship: RelationshipType.BIOLOGICAL, role: 'father' }]
      });

      const result = transformToD3Tree([father, son], 'father');
      
      expect(result).not.toBeNull();
      expect(result?.children).toBeDefined();
      expect(result?.children?.length).toBe(1);
      expect(result?.children?.[0]?.name).toBe('Son');
    });

    it('should filter out non-biological/adopted children', () => {
      const father = createMockMember({
        id: 'father',
        name: 'Father',
        generation: 1,
        children: [
          { targetId: 'son1', relationship: RelationshipType.BIOLOGICAL, role: 'son' },
          { targetId: 'stepchild', relationship: RelationshipType.STEP, role: 'son' }
        ]
      });
      
      const son1 = createMockMember({ id: 'son1', name: 'Son1', generation: 2 });
      const stepchild = createMockMember({ id: 'stepchild', name: 'StepChild', generation: 2 });

      const result = transformToD3Tree([father, son1, stepchild], 'father');
      
      expect(result?.children?.length).toBe(1);
      expect(result?.children?.[0]?.name).toBe('Son1');
    });

    it('should preserve spouse information', () => {
      const member = createMockMember({
        id: 'member',
        name: 'Member',
        spouses: [
          { name: 'Spouse1', isAlive: true },
          { name: 'Spouse2', isAlive: false }
        ]
      });

      const result = transformToD3Tree([member], 'member');
      
      expect(result?.spouses?.length).toBe(2);
      expect(result?.spouses?.[0]?.name).toBe('Spouse1');
      expect(result?.spouses?.[1]?.name).toBe('Spouse2');
    });

    it('should handle multiple generations', () => {
      const grandfather = createMockMember({
        id: 'gp',
        name: 'Grandfather',
        generation: 1,
        children: [{ targetId: 'father', relationship: RelationshipType.BIOLOGICAL, role: 'son' }]
      });
      
      const father = createMockMember({
        id: 'father',
        name: 'Father',
        generation: 2,
        parents: [{ targetId: 'gp', relationship: RelationshipType.BIOLOGICAL, role: 'father' }],
        children: [{ targetId: 'son', relationship: RelationshipType.BIOLOGICAL, role: 'son' }]
      });
      
      const son = createMockMember({
        id: 'son',
        name: 'Son',
        generation: 3,
        parents: [{ targetId: 'father', relationship: RelationshipType.BIOLOGICAL, role: 'father' }]
      });

      const result = transformToD3Tree([grandfather, father, son], 'gp');
      
      expect(result?.children?.[0]?.name).toBe('Father');
      expect(result?.children?.[0]?.children?.[0]?.name).toBe('Son');
    });
    it('should handle missing children in list', () => {
      const father = createMockMember({
        id: 'father',
        name: 'Father',
        children: [{ targetId: 'missing-son', relationship: RelationshipType.BIOLOGICAL, role: 'son' }]
      });

      const result = transformToD3Tree([father], 'father');
      
      expect(result?.children).toBeUndefined();
    });
  });
});
