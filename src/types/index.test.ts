import { describe, it, expect } from 'vitest';
import type { Member, FamilyLink, Spouse, CemeteryInfo } from '../types';
import { RelationshipType } from '../types';

describe('types/index.ts', () => {
  describe('RelationshipType', () => {
    it('should have correct biological value', () => {
      expect(RelationshipType.BIOLOGICAL).toBe('biological');
    });

    it('should have correct adopted value', () => {
      expect(RelationshipType.ADOPTED).toBe('adopted');
    });

    it('should have correct step value', () => {
      expect(RelationshipType.STEP).toBe('step');
    });

    it('should have correct married_in value', () => {
      expect(RelationshipType.MARRIED_IN).toBe('married_in');
    });
  });

  describe('Member interface', () => {
    const mockCemetery: CemeteryInfo = {
      lat: 30.123456,
      lng: 120.123456,
      address: '浙江省杭州市某公墓',
      photos: ['photo1.jpg'],
      cemeteryCode: 'A-001'
    };

    const mockSpouse: Spouse = {
      name: '配偶姓名',
      maidenName: '娘家姓',
      isAlive: false,
      marriedDate: '1975-01-01',
      cemetery: mockCemetery
    };

    const mockMember: Member = {
      id: 'test-id-123',
      parents: [],
      children: [],
      name: '张三',
      givenName: '字: 徳',
      nickname: '小名',
      gender: 'M',
      generation: 5,
      generationWord: '德',
      order: 1,
      spouses: [mockSpouse],
      isAlive: true,
      birthDate: '1980-01-01',
      bio: '测试简介',
      cemetery: mockCemetery,
      branchName: '长房',
      isFloating: false,
      tags: ['出嗣'],
      lastVisitedAt: '2024-01-01',
      visitCount: 10,
      publicFields: ['name', 'generation']
    };

    it('should create a valid member object', () => {
      expect(mockMember.id).toBe('test-id-123');
      expect(mockMember.name).toBe('张三');
      expect(mockMember.gender).toBe('M');
      expect(mockMember.generation).toBe(5);
      expect(mockMember.isAlive).toBe(true);
    });

    it('should have correct spouse structure', () => {
      expect(mockMember.spouses.length).toBeGreaterThan(0);
      const spouse = mockMember.spouses[0];
      expect(spouse?.name).toBe('配偶姓名');
      expect(spouse?.isAlive).toBe(false);
    });

    it('should have correct cemetery info', () => {
      expect(mockMember.cemetery).not.toBeNull();
      if (mockMember.cemetery) {
        expect(mockMember.cemetery.lat).toBe(30.123456);
        expect(mockMember.cemetery.lng).toBe(120.123456);
        expect(mockMember.cemetery.address).toBe('浙江省杭州市某公墓');
      }
    });

    it('should support tags', () => {
      expect(mockMember.tags).toContain('出嗣');
    });

    it('should support publicFields', () => {
      expect(mockMember.publicFields).toContain('name');
      expect(mockMember.publicFields).toContain('generation');
    });
  });

  describe('FamilyLink interface', () => {
    const mockFatherLink: FamilyLink = {
      targetId: 'father-id',
      relationship: RelationshipType.BIOLOGICAL,
      role: 'father'
    };

    const mockMotherLink: FamilyLink = {
      targetId: 'mother-id',
      relationship: RelationshipType.BIOLOGICAL,
      role: 'mother'
    };

    const mockSpouseLink: FamilyLink = {
      targetId: 'spouse-id',
      relationship: RelationshipType.BIOLOGICAL,
      role: 'spouse'
    };

    it('should create father link correctly', () => {
      expect(mockFatherLink.role).toBe('father');
      expect(mockFatherLink.relationship).toBe('biological');
    });

    it('should create mother link correctly', () => {
      expect(mockMotherLink.role).toBe('mother');
    });

    it('should create spouse link correctly', () => {
      expect(mockSpouseLink.role).toBe('spouse');
    });
  });
});
