import { defineStore } from 'pinia';
import { ref } from 'vue';
import { type Member, RelationshipType } from '../types';
import { api } from '../services/api';

export const useMemberStore = defineStore('member', () => {
  const members = ref<Member[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchMembers() {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await api.getMembers();
      // Ensure data conforms to Member type if needed
      members.value = data;
    } catch (err: any) {
      console.error('Failed to fetch members:', err);
      error.value = err.message || 'Failed to load members';
    } finally {
      isLoading.value = false;
    }
  }

  // Basic CRUD
  function getMember(id: string) {
    return members.value.find(m => m.id === id);
  }

  async function addMember(member: Member) {
    isLoading.value = true;
    try {
      const created = await api.createMember(member);
      members.value.push(created);
    } catch (err: any) {
      console.error('Failed to create member:', err);
      error.value = err.message || 'Failed to create member';
    } finally {
      isLoading.value = false;
    }
  }

  async function updateMember(id: string, updates: Partial<Member>) {
    isLoading.value = true;
    try {
      const updated = await api.updateMember(id, updates);
      const index = members.value.findIndex(m => m.id === id);
      if (index !== -1) {
        members.value[index] = updated;
      }
    } catch (err: any) {
      console.error('Failed to update member:', err);
      error.value = err.message || 'Failed to update member';
    } finally {
      isLoading.value = false;
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

  function addSibling(memberId: string, siblingData: Partial<Member>) {
    const member = members.value.find(m => m.id === memberId);
    if (!member) return null;
    
    // Find biological parents
    const parentLink = member.parents.find(p => p.relationship === RelationshipType.BIOLOGICAL || p.relationship === RelationshipType.ADOPTED);
    
    if (parentLink) {
      return addChild(parentLink.targetId, siblingData);
    }
    return null;
  }

  function setMembers(newMembers: Member[]) {
    members.value = newMembers;
  }

  // Validation Logic
  function validateMember(member: Partial<Member>, context?: { parentId?: string, spouseId?: string }): { valid: boolean, errors: string[] } {
    const errors: string[] = [];

    // 1. Basic Fields
    if (!member.name || member.name.trim().length === 0) {
      errors.push('姓名不能为空');
    }

    // 2. Dates
    if (member.birthDate && member.deathDate) {
      const birth = new Date(member.birthDate);
      const death = new Date(member.deathDate);
      if (birth > death) {
        errors.push('出生日期不能晚于去世日期');
      }
    }

    // 3. Parent-Child Generation Check
    if (context?.parentId) {
      const parent = getMember(context.parentId);
      if (parent) {
        if (member.generation && member.generation <= parent.generation) {
          errors.push(`子辈世系(${member.generation})必须大于父辈世系(${parent.generation})`);
        }
        
        // Birth date check vs Parent
        if (member.birthDate && parent.birthDate) {
           const childBirth = new Date(member.birthDate);
           const parentBirth = new Date(parent.birthDate);
           const diffYears = (childBirth.getTime() - parentBirth.getTime()) / (1000 * 60 * 60 * 24 * 365);
           if (diffYears < 10) {
             errors.push('子辈出生日期与父辈过近(小于10岁)，请核实');
           }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Branch Merge Logic
  function detectConflicts(incomingMembers: Member[]): { conflicts: any[], newMembers: Member[] } {
    const conflicts: any[] = [];
    const newMembers: Member[] = [];

    incomingMembers.forEach(incoming => {
      // Simple duplicate detection by Name + Generation
      // In a real app, this should be more sophisticated
      const existing = members.value.find(m => 
        m.name === incoming.name && 
        m.generation === incoming.generation &&
        m.gender === incoming.gender
      );

      if (existing) {
        conflicts.push({
          type: 'duplicate',
          incoming,
          existing,
          description: `发现重名成员：第${incoming.generation}世 ${incoming.name}`
        });
      } else {
        newMembers.push(incoming);
      }
    });

    return { conflicts, newMembers };
  }

  function mergeBranch(incomingMembers: Member[], resolutions: any[]) {
    // 1. Add non-conflicting members
    const { newMembers } = detectConflicts(incomingMembers);
    
    // Filter out members that are explicitly skipped in resolutions
    const toAdd = newMembers.filter(m => {
      const res = resolutions.find(r => r.incomingId === m.id);
      return !res || res.action !== 'skip';
    });

    members.value.push(...toAdd);

    // 2. Handle resolutions
    resolutions.forEach(res => {
      if (res.action === 'replace') {
        // Update existing member with incoming data
        updateMember(res.existingId, res.incomingData);
      } else if (res.action === 'keep_both') {
        // Add incoming as new member (rename might be needed in real app)
        addMember(res.incomingData);
      }
      // 'skip' is handled by not adding
    });
    
    // 3. Log operation (Mock)
    console.log('Merge completed', { added: toAdd.length, resolutions });
  }

  return {
    members,
    getMember,
    addMember,
    updateMember,
    deleteMember,
    addChild,
    addSpouse,
    addSibling,
    setMembers,
    validateMember,
    detectConflicts,
    mergeBranch,
    fetchMembers,
    isLoading,
    error
  };
});
