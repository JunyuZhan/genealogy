import { describe, it, expect } from 'vitest';
import { exportGEDCOM, importGEDCOM } from './gedcom';
import type { Member } from '../types';

describe('utils/gedcom.ts', () => {
  const createMockMember = (overrides: Partial<Member> = {}): Member => ({
    id: 'test-id',
    name: '张三',
    gender: 'M',
    generation: 5,
    generationWord: '德',
    order: 1,
    isAlive: true,
    birthDate: '1990-01-01',
    parents: [],
    children: [],
    spouses: [],
    branchName: '长房',
    isFloating: false,
    cemetery: null,
    ...overrides
  });

  describe('exportGEDCOM', () => {
    it('should export HEAD and TRLR tags', () => {
      const members = [createMockMember()];
      const result = exportGEDCOM(members);
      
      expect(result).toContain('0 HEAD');
      expect(result).toContain('1 SOUR GENEALOGY_APP');
      expect(result).toContain('1 GEDC');
      expect(result).toContain('2 VERS 5.5.1');
      expect(result).toContain('1 CHAR UTF-8');
      expect(result).toContain('0 TRLR');
    });

    it('should export member name correctly', () => {
      const member = createMockMember({ 
        id: 'member-1', 
        name: '张三',
        generationWord: '德'
      });
      const result = exportGEDCOM([member]);
      
      expect(result).toContain('0 @member-1@ INDI');
      expect(result).toContain('1 NAME 张三 /德/');
    });

    it('should export gender correctly', () => {
      const member = createMockMember({ gender: 'M' });
      const result = exportGEDCOM([member]);
      expect(result).toContain('1 SEX M');
    });

    it('should export female gender correctly', () => {
      const member = createMockMember({ gender: 'F' });
      const result = exportGEDCOM([member]);
      expect(result).toContain('1 SEX F');
    });

    it('should export birth date', () => {
      const member = createMockMember({ birthDate: '1990-01-01' });
      const result = exportGEDCOM([member]);
      
      expect(result).toContain('1 BIRT');
      expect(result).toContain('2 DATE 1990-01-01');
    });

    it('should export death date for deceased members', () => {
      const member = createMockMember({ 
        isAlive: false, 
        deathDate: '2020-01-01' 
      });
      const result = exportGEDCOM([member]);
      
      expect(result).toContain('1 DEAT');
      expect(result).toContain('2 DATE 2020-01-01');
    });

    it('should not export death date for alive members', () => {
      const member = createMockMember({ 
        isAlive: true, 
        deathDate: '2020-01-01' 
      });
      const result = exportGEDCOM([member]);
      
      expect(result).not.toContain('DEAT');
    });

    it('should export givenName as GIVN', () => {
      const member = createMockMember({ givenName: '字: 徳' });
      const result = exportGEDCOM([member]);
      
      expect(result).toContain('2 GIVN 字: 徳');
    });

    it('should export bio as NOTE', () => {
      const member = createMockMember({ bio: '这是简介' });
      const result = exportGEDCOM([member]);
      
      expect(result).toContain('1 NOTE 这是简介');
    });

    it('should handle multi-line bio', () => {
      const member = createMockMember({ bio: '第一行\n第二行' });
      const result = exportGEDCOM([member]);
      
      expect(result).toContain('1 NOTE 第一行 第二行');
    });

    it('should export multiple members', () => {
      const members = [
        createMockMember({ id: '1', name: '父' }),
        createMockMember({ id: '2', name: '子' })
      ];
      const result = exportGEDCOM(members);
      
      expect(result).toContain('@1@ INDI');
      expect(result).toContain('@2@ INDI');
    });
  });

  describe('importGEDCOM', () => {
    it('should parse basic INDI record', () => {
      const gedcom = `0 HEAD
1 SOUR TEST
0 @I1@ INDI
1 NAME 李四
1 SEX M
0 TRLR`;
      
      const result = importGEDCOM(gedcom);
      
      expect(result.length).toBe(1);
      const first = result[0];
      expect(first?.name).toBe('李四');
      expect(first?.gender).toBe('M');
    });

    it('should parse multiple INDI records', () => {
      const gedcom = `0 HEAD
0 @I1@ INDI
1 NAME 王五
1 SEX M
0 @I2@ INDI
1 NAME 王六
1 SEX F
0 TRLR`;
      
      const result = importGEDCOM(gedcom);
      
      expect(result.length).toBe(2);
      expect(result[0]?.name).toBe('王五');
      expect(result[1]?.name).toBe('王六');
    });

    it('should parse birth date', () => {
      const gedcom = `0 @I1@ INDI
1 NAME 张三
1 SEX M
1 BIRT
2 DATE 1990-01-01
0 TRLR`;
      
      const result = importGEDCOM(gedcom);
      
      expect(result[0]?.birthDate).toBe('1990-01-01');
    });

    it('should parse death date', () => {
      const gedcom = `0 @I1@ INDI
1 NAME 张三
1 SEX M
1 DEAT
2 DATE 2020-01-01
0 TRLR`;
      
      const result = importGEDCOM(gedcom);
      
      expect(result[0]?.isAlive).toBe(false);
      expect(result[0]?.deathDate).toBe('2020-01-01');
    });

    it('should set default values for missing fields', () => {
      const gedcom = `0 @I1@ INDI
1 NAME Test
0 TRLR`;
      
      const result = importGEDCOM(gedcom);
      
      expect(result[0]?.gender).toBe('M');
      expect(result[0]?.generation).toBe(1);
      expect(result[0]?.isAlive).toBe(true);
      expect(result[0]?.branchName).toBe('Main');
    });

    it('should parse generationWord from NAME', () => {
      const gedcom = `0 @I1@ INDI
1 NAME 张三 /德/
0 TRLR`;
      
      const result = importGEDCOM(gedcom);
      
      expect(result[0]?.generationWord).toBe('德');
    });

    it('should handle FAM records gracefully', () => {
      const gedcom = `0 HEAD
0 @F1@ FAM
1 HUSB @I1@
1 WIFE @I2@
1 CHIL @I3@
0 TRLR`;
      
      const result = importGEDCOM(gedcom);
      
      expect(result).toHaveLength(0);
    });
  });
});
