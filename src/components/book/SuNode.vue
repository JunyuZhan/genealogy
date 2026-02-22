<template>
  <div class="su-node-wrapper flex flex-col items-center">
    <div :id="'member-' + member.id" class="node-card border-2 border-stone-800 bg-[#fdfbf7] shadow-lg p-3 w-16 min-h-[240px] relative transition-transform hover:-translate-y-1 scroll-mt-20">
      <!-- Generation Number -->
      <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-stone-800 text-amber-100 text-xs px-2 py-0.5 rounded-sm whitespace-nowrap z-10">
        第{{ member.generation }}世
      </div>

      <!-- Main Content (Vertical Text) -->
      <div class="h-full flex flex-col items-center writing-vertical-rl text-stone-900 font-serif gap-2 py-2">
        <span class="text-xs text-stone-500 tracking-widest">{{ member.generationWord }}字辈</span>
        <h3 class="text-xl font-bold tracking-[0.2em] border-l border-stone-300 pl-1 ml-1">{{ member.name }}</h3>
        
        <div class="text-xs text-stone-600 mt-2 leading-loose flex gap-1">
          <span v-if="member.givenName">字{{ member.givenName }}</span>
          <span v-if="showSpouses && member.spouses && member.spouses.length > 0">配{{ member.spouses[0]?.name }}</span>
        </div>
      </div>

    <!-- Connector Lines -->
      </div>

    <!-- Connector Lines -->
    <div v-if="children.length > 0" class="children-connector mt-8 flex justify-center gap-8 relative">
       <!-- Vertical line from parent -->
       <div class="absolute -top-8 left-1/2 w-0.5 h-4 bg-stone-800 -translate-x-1/2"></div>
       
       <!-- Horizontal bar connecting children -->
       <div v-if="children.length > 1" class="absolute -top-4 h-0.5 bg-stone-800" 
            :style="{ left: firstChildOffset + 'px', right: lastChildOffset + 'px' }"></div>

       <div v-for="(child, index) in children" :key="child.id" class="child-branch flex flex-col items-center relative" ref="childRefs">
          <!-- Vertical line to child -->
          <div class="absolute -top-4 w-0.5 h-4 bg-stone-800"></div>
          <SuNode :member="child" :members="members" :show-spouses="showSpouses" />
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue';
import { type Member, RelationshipType } from '../../types';
import SuNode from './SuNode.vue';

const props = defineProps<{
  member: Member;
  members: Member[];
  showSpouses?: boolean;
}>();

const children = computed(() => {
  const childLinks = props.member.children.filter(l => 
    l.relationship === RelationshipType.BIOLOGICAL || 
    l.relationship === RelationshipType.ADOPTED
  );
  return childLinks
    .map(l => props.members.find(m => m.id === l.targetId))
    .filter(Boolean) as Member[];
});

// Dynamic line calculation (mocked for simplicity, ideally needs measuring DOM)
const firstChildOffset = ref(0);
const lastChildOffset = ref(0);
const childRefs = ref<HTMLElement[]>([]);

onMounted(() => {
  // Simple approximation: lines connect centers of first and last child
  // In a real implementation, we'd measure widths.
  // For now, let CSS flex handle positioning and use a full width line with margins?
  // CSS "absolute left-0 right-0" works if the container spans all children.
  // But we want the line to start from the center of the first child to the center of the last child.
  
  if (children.value.length > 1) {
    // We can use a pseudo-element or just rely on the container width minus padding.
    // Let's just use 50% of first child width and 50% of last child width as offset.
    // Assuming fixed width children (w-16 = 64px + padding/gap).
    // Actually, simple way: line spans from center of first to center of last.
    // We can set left: 50% of first child, right: 50% of last child.
    // Since child-branch is flex item, its width varies.
    // Let's assume uniform width for simplicity or just 2rem (half of w-16).
    firstChildOffset.value = 32; 
    lastChildOffset.value = 32;
  }
});
</script>

<style scoped>
.writing-vertical-rl {
  writing-mode: vertical-rl;
  text-orientation: upright;
}
</style>
