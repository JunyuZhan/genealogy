import { type Member, RelationshipType } from '../types';

export const mockMembers: Member[] = [
  // Generation 1
  {
    id: '1',
    name: '张始祖',
    gender: 'M',
    generation: 1,
    generationWord: '始',
    order: 1,
    isAlive: false,
    birthDate: '1900-01-01',
    deathDate: '1980-01-01',
    parents: [],
    children: [
      { targetId: '2', relationship: RelationshipType.BIOLOGICAL, role: 'son' },
      { targetId: '3', relationship: RelationshipType.BIOLOGICAL, role: 'son' },
    ],
    spouses: [
      {
        id: '1_spouse',
        name: '王氏',
        isAlive: false,
        bio: '勤劳贤惠',
      },
    ],
    cemetery: {
      lat: 30.0,
      lng: 120.0,
      address: '祖坟山',
      photos: [],
    },
    branchName: '主支',
    isFloating: false,
  },
  // Generation 2 - Child 1
  {
    id: '2',
    name: '张大郎',
    gender: 'M',
    generation: 2,
    generationWord: '大',
    order: 1,
    isAlive: false,
    birthDate: '1930-01-01',
    deathDate: '2010-01-01',
    parents: [
      { targetId: '1', relationship: RelationshipType.BIOLOGICAL, role: 'father' },
    ],
    children: [
      { targetId: '4', relationship: RelationshipType.BIOLOGICAL, role: 'son' },
    ],
    spouses: [
      {
        id: '2_spouse',
        name: '李氏',
        isAlive: true,
      },
    ],
    cemetery: {
      lat: 30.01,
      lng: 120.01,
      address: '西山公墓',
      photos: [],
    },
    branchName: '主支',
    isFloating: false,
  },
  // Generation 2 - Child 2
  {
    id: '3',
    name: '张二郎',
    gender: 'M',
    generation: 2,
    generationWord: '大',
    order: 2,
    isAlive: true,
    birthDate: '1932-01-01',
    parents: [
      { targetId: '1', relationship: RelationshipType.BIOLOGICAL, role: 'father' },
    ],
    children: [],
    spouses: [],
    cemetery: null,
    branchName: '二房',
    isFloating: false,
  },
  // Generation 3 - Grandchild
  {
    id: '4',
    name: '张小宝',
    gender: 'M',
    generation: 3,
    generationWord: '小',
    order: 1,
    isAlive: true,
    birthDate: '1960-01-01',
    parents: [
      { targetId: '2', relationship: RelationshipType.BIOLOGICAL, role: 'father' },
    ],
    children: [],
    spouses: [],
    cemetery: null,
    branchName: '主支',
    isFloating: false,
  },
];
