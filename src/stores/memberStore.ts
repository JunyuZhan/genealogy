import { defineStore } from 'pinia';
import { ref } from 'vue';
import { type Member, RelationshipType } from '../types';
import { mockMembers } from '../mock/data';

export const useMemberStore = defineStore('member', () => {
  const members = ref<Member[]>([...mockMembers]);

  // Basic CRUD
  function getMember(id: string) {
    return members.value.find(m => m.id === id);
  }

  function addMember(member: Member) {
    members.value.push(member);
  }

  function updateMember(id: string, updates: Partial<Member>) {
    const index = members.value.findIndex(m => m.id === id);
    if (index !== -1) {
      const current = members.value[index];
      if (!current) return;
      
      members.value[index] = {
        ...current,
        ...updates,
        id: current.id, // Ensure ID is preserved
        name: updates.name ?? current.name,
        generation: updates.generation ?? current.generation,
        // ... exhaustive merge is tedious, let's trust Partial<Member> + spread
      } as Member; // Type assertion needed due to spread of Partial
    }
  }

  function deleteMember(id: string) {
    const index = members.value.findIndex(m => m.id === id);
    if (index !== -1) {
      members.value.splice(index, 1);
    }
  }

  // Complex Operations
  function addChild(parentId: string, childData: Partial<Member>) {
    const parent = members.value.find(m => m.id === parentId);
    if (!parent) return null;

    const newChildId = crypto.randomUUID();
    const newChild: Member = {
      id: newChildId,
      name: childData.name || '新成员',
      gender: childData.gender || 'M',
      generation: parent.generation + 1,
      generationWord: '', 
      order: (parent.children?.length || 0) + 1,
      isAlive: true,
      birthDate: '',
      parents: [{ targetId: parentId, relationship: RelationshipType.BIOLOGICAL, role: 'father' }],
      children: [],
      spouses: [],
      cemetery: null,
      branchName: parent.branchName,
      isFloating: false,
      ...childData
    };

    members.value.push(newChild);

    // Update parent's children list
    if (parent.children) {
      parent.children.push({ 
        targetId: newChildId, 
        relationship: RelationshipType.BIOLOGICAL, 
        role: newChild.gender === 'M' ? 'son' : 'daughter' 
      });
    } else {
      parent.children = [{
        targetId: newChildId, 
        relationship: RelationshipType.BIOLOGICAL, 
        role: newChild.gender === 'M' ? 'son' : 'daughter' 
      }];
    }
    
    return newChild;
  }

  function addSpouse(memberId: string, spouseData: { name: string, isAlive: boolean }) {
    const member = members.value.find(m => m.id === memberId);
    if (!member) return null;

    const newSpouse = {
      id: crypto.randomUUID(),
      name: spouseData.name,
      isAlive: spouseData.isAlive,
      bio: '',
    };

    if (member.spouses) {
      member.spouses.push(newSpouse);
    } else {
      member.spouses = [newSpouse];
    }
    
    return newSpouse;
  }

  return {
    members,
    getMember,
    addMember,
    updateMember,
    deleteMember,
    addChild,
    addSpouse
  };
});
