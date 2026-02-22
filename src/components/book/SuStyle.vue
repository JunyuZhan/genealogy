<template>
  <div class="su-style-container w-full h-full overflow-auto bg-[#fdfbf7] p-8 flex justify-center min-w-max">
    <SuNode v-if="root" :member="root" :members="members" :show-spouses="showSpouses" />
    <div v-else class="text-gray-400">请选择根节点</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { type Member } from '../../types';
import SuNode from './SuNode.vue';

const props = defineProps<{
  members: Member[];
  rootId: string;
  showSpouses?: boolean;
}>();

const root = computed(() => props.members.find(m => m.id === props.rootId));
</script>
