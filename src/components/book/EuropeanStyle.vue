<template>
  <div class="european-chart">
    <div v-if="root" class="tree-node">
      <div :id="'member-' + root.id" class="member-card flex gap-4 p-4 border-l-4 border-blue-500 bg-white shadow-sm mb-4 hover:shadow-md transition-shadow scroll-mt-20">
        <div class="w-24 flex flex-col justify-center border-r pr-4">
           <div class="text-xs text-gray-400">第 {{ root.generation }} 世</div>
           <div class="font-bold text-lg text-gray-800">{{ root.name }}</div>
           <div class="text-xs text-blue-500">{{ root.generationWord }}字辈</div>
        </div>
        
        <div class="flex-1 flex flex-col justify-center">
          <div class="text-sm text-gray-600 flex flex-wrap gap-4 mb-1">
            <span v-if="root.givenName" class="bg-gray-100 px-2 rounded">字 {{ root.givenName }}</span>
            <span v-if="root.birthDate">🎂 {{ root.birthDate }}</span>
            <span v-if="!root.isAlive" class="text-gray-500">🪦 {{ root.deathDate || '未知' }}</span>
          </div>
          
          <div v-if="showSpouses && root.spouses && root.spouses.length > 0" class="text-sm text-pink-700 mt-1 flex gap-2 items-center">
            <span>💍 配偶:</span>
            <span v-for="s in root.spouses" :key="s.name" class="bg-pink-50 px-2 py-0.5 rounded border border-pink-100">
              {{ s.name }} <span v-if="s.maidenName">({{ s.maidenName }})</span>
            </span>
          </div>
          
          <div v-if="showBio && root.bio" class="text-xs text-gray-500 italic mt-2 bg-gray-50 p-2 rounded border border-gray-100">
            {{ root.bio }}
          </div>
        </div>
      </div>
      
      <div v-if="children.length > 0" class="children ml-8 pl-8 border-l-2 border-gray-200 relative">
        <!-- Connecting line for visual hierarchy -->
        <EuropeanStyle 
          v-for="child in children" 
          :key="child.id" 
          :members="members" 
          :root-id="child.id" 
          :show-spouses="showSpouses"
          :show-bio="showBio"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'EuropeanStyle'
}
</script>

<script setup lang="ts">
import { computed } from 'vue';
import { type Member, RelationshipType } from '../../types';
import EuropeanStyle from './EuropeanStyle.vue';

const props = defineProps<{
  members: Member[];
  rootId: string;
  showSpouses: boolean;
  showBio: boolean;
}>();

const root = computed(() => props.members.find(m => m.id === props.rootId));

const children = computed(() => {
  if (!root.value) return [];
  // Find children
  const childLinks = root.value.children.filter(l => 
    l.relationship === RelationshipType.BIOLOGICAL || 
    l.relationship === RelationshipType.ADOPTED
  );
  
  // Sort by birth date or order
  const kids = childLinks.map(l => props.members.find(m => m.id === l.targetId)).filter(Boolean) as Member[];
  return kids.sort((a, b) => (a.order || 0) - (b.order || 0));
});
</script>
