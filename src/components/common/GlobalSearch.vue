<template>
  <div class="relative w-full max-w-md" ref="containerRef">
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span class="text-gray-500">🔍</span>
      </div>
      <input
        v-model="query"
        @focus="isOpen = true"
        type="text"
        class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        placeholder="搜索成员姓名、字辈..."
      />
      <div v-if="query" class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" @click="query = ''">
        <span class="text-gray-400 hover:text-gray-600">✕</span>
      </div>
    </div>

    <div v-if="isOpen && (results.length > 0 || query)" class="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
      <div v-if="results.length === 0" class="px-4 py-2 text-gray-500">
        未找到相关成员
      </div>
      <ul v-else>
        <li
          v-for="member in results"
          :key="member.id"
          class="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50"
          @click="selectMember(member)"
        >
          <div class="flex items-center">
            <span class="font-medium block truncate">
              {{ member.name }}
            </span>
            <span class="ml-2 text-gray-400 text-xs">
              第{{ member.generation }}世
              <span v-if="member.generationWord">({{ member.generationWord }}字辈)</span>
            </span>
            <span v-if="!member.isAlive" class="ml-auto text-xs bg-gray-100 text-gray-500 px-1 rounded">已故</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { type Member } from '../../types';

const props = defineProps<{
  members: Member[];
}>();

const emit = defineEmits<{
  (e: 'select', memberId: string): void;
}>();

const query = ref('');
const isOpen = ref(false);
const containerRef = ref<HTMLElement | null>(null);

const results = computed(() => {
  if (!query.value) return [];
  const q = query.value.toLowerCase();
  return props.members.filter(m => 
    m.name.toLowerCase().includes(q) || 
    (m.generationWord && m.generationWord.toLowerCase().includes(q)) ||
    (m.givenName && m.givenName.toLowerCase().includes(q))
  ).slice(0, 10); // Limit to 10 results
});

function selectMember(member: Member) {
  emit('select', member.id);
  query.value = ''; // Optional: clear or keep
  isOpen.value = false;
}

function handleClickOutside(event: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
