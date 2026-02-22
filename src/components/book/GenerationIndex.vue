<template>
  <div class="generation-index bg-white border-r w-64 flex flex-col h-full shadow-lg z-20 absolute left-0 top-0 bottom-0">
    <div class="p-4 border-b bg-gray-50 flex justify-between items-center">
      <h3 class="font-bold text-gray-700">字辈索引</h3>
      <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
    </div>
    
    <div class="flex-1 overflow-y-auto">
      <div v-for="gen in groupedGenerations" :key="gen.generation" class="border-b border-gray-100">
        <div 
          @click="toggle(gen.generation)"
          class="p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer flex justify-between items-center transition-colors"
        >
          <div class="font-bold text-sm text-gray-800">
            第{{ gen.generation }}世 
            <span v-if="gen.word" class="text-blue-600 ml-1 font-serif">"{{ gen.word }}"</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-400">{{ gen.members.length }}人</span>
            <span class="text-gray-400 text-xs transform transition-transform" :class="{'rotate-180': expanded.includes(gen.generation)}">▼</span>
          </div>
        </div>
        
        <div v-if="expanded.includes(gen.generation)" class="bg-white py-1 animate-slide-down">
          <div 
            v-for="member in gen.members" 
            :key="member.id"
            class="px-4 py-2 pl-8 text-sm hover:bg-blue-50 cursor-pointer text-gray-600 transition-colors flex justify-between group"
            @click="$emit('select', member.id)"
          >
            <span>{{ member.name }}</span>
            <span class="text-xs text-gray-300 group-hover:text-blue-400">查看</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { type Member } from '../../types';

const props = defineProps<{
  members: Member[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'select', memberId: string): void;
}>();

const expanded = ref<number[]>([]);

function toggle(gen: number) {
  const idx = expanded.value.indexOf(gen);
  if (idx > -1) expanded.value.splice(idx, 1);
  else expanded.value.push(gen);
}

const groupedGenerations = computed(() => {
  const groups = new Map<number, { generation: number, word: string, members: Member[] }>();
  
  props.members.forEach(m => {
    if (!groups.has(m.generation)) {
      groups.set(m.generation, {
        generation: m.generation,
        word: m.generationWord || '',
        members: []
      });
    }
    groups.get(m.generation)?.members.push(m);
  });
  
  // Sort members by order within generation
  for (const group of groups.values()) {
    group.members.sort((a, b) => (a.order || 0) - (b.order || 0));
  }
  
  return Array.from(groups.values()).sort((a, b) => a.generation - b.generation);
});
</script>

<style scoped>
@keyframes slide-down {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-slide-down {
  animation: slide-down 0.2s ease-out;
}
</style>
