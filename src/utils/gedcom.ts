import type { Member } from '../types';

export function exportGEDCOM(members: Member[]): string {
  let gedcom = "0 HEAD\n1 SOUR GENEALOGY_APP\n1 GEDC\n2 VERS 5.5.1\n2 FORM LINEAGE-LINKED\n1 CHAR UTF-8\n";
  
  // Individuals
  members.forEach(m => {
    gedcom += `0 @${m.id}@ INDI\n`;
    gedcom += `1 NAME ${m.name} /${m.generationWord || ''}/\n`;
    if (m.givenName) gedcom += `2 GIVN ${m.givenName}\n`;
    if (m.gender) gedcom += `1 SEX ${m.gender}\n`;
    if (m.birthDate) {
      gedcom += `1 BIRT\n2 DATE ${m.birthDate}\n`;
    }
    if (!m.isAlive && m.deathDate) {
      gedcom += `1 DEAT\n2 DATE ${m.deathDate}\n`;
    }
    if (m.bio) {
      gedcom += `1 NOTE ${m.bio.replace(/\n/g, ' ')}\n`;
    }
    
    // Families will be linked later? 
    // GEDCOM links via FAM records.
    // For simplicity, we just export INDI for now or reconstruct families.
  });

  gedcom += "0 TRLR\n";
  return gedcom;
}

export function importGEDCOM(gedcom: string): Member[] {
  const lines = gedcom.split('\n');
  const result: Member[] = [];
  let currentMember: Partial<Member> | null = null;
  
  const saveCurrent = () => {
    if (currentMember && currentMember.id && currentMember.name) {
       currentMember.parents = currentMember.parents || [];
       currentMember.children = currentMember.children || [];
       currentMember.spouses = currentMember.spouses || [];
       // Ensure required fields
       if (!currentMember.gender) currentMember.gender = 'M';
       if (!currentMember.generation) currentMember.generation = 1;
       if (!currentMember.branchName) currentMember.branchName = 'Imported';
       if (currentMember.isAlive === undefined) currentMember.isAlive = true;
       if (currentMember.isFloating === undefined) currentMember.isFloating = false;
       if (!currentMember.generationWord) currentMember.generationWord = '';
       if (currentMember.order === undefined) currentMember.order = 1;

       result.push(currentMember as Member);
    }
  };

  lines.forEach(line => {
    const parts = line.trim().split(' ');
    if (parts.length < 2) return;
    
    const level = parts[0];
    const tag = parts[1] || '';
    // value is the rest
    const value = parts.slice(2).join(' ');
    
    if (level === '0') {
      saveCurrent();
      
      if (value === 'INDI') {
        // Start new individual
        // ID is in tag, usually @I1@
        const id = tag.replace(/@/g, '');
        currentMember = {
          id: id,
          isAlive: true,
          gender: 'M',
          generation: 1,
          generationWord: '',
          branchName: 'Main',
          isFloating: false,
          parents: [],
          children: [],
          spouses: []
        };
      } else {
        currentMember = null;
      }
    } else if (currentMember) {
      if (tag === 'NAME') {
        const parts = value.split('/');
        currentMember.name = parts[0]?.trim() || '';
        if (parts.length > 1) {
          currentMember.generationWord = parts[1]?.trim() || '';
        }
      } else if (tag === 'SEX') {
        currentMember.gender = value.trim() === 'F' ? 'F' : 'M';
      } else if (tag === 'BIRT') {
        // Next line might be DATE
      } else if (tag === 'DEAT') {
        currentMember.isAlive = false;
      } else if (tag === 'DATE' && level === '2') {
         // Assuming inside BIRT or DEAT context, simple parsing
         if (!currentMember.birthDate && currentMember.isAlive) { 
            currentMember.birthDate = value; 
         } else if (!currentMember.isAlive) {
            currentMember.deathDate = value;
         }
      }
    }
  });
  
  saveCurrent();

  return result;
}
