<template>
  <div 
    v-if="isVisible"
    class="fixed bg-white shadow-xl rounded border border-gray-200 py-1 min-w-[160px] z-50"
    :style="{ left: `${position.x}px`, top: `${position.y}px` }"
  >
    <div class="px-4 py-2 border-b border-gray-100 bg-gray-50">
      <span class="font-bold text-sm text-gray-700">{{ memberName }}</span>
    </div>
    
    <button 
      @click="emit('action', 'add-child')" 
      class="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm text-gray-700 flex items-center gap-2"
    >
      <span>👶</span> 添加子女
    </button>
    
    <button 
      @click="emit('action', 'add-spouse')" 
      class="w-full text-left px-4 py-2 hover:bg-pink-50 text-sm text-gray-700 flex items-center gap-2"
    >
      <span>💍</span> 添加配偶
    </button>
    
    <div class="border-t border-gray-100 my-1"></div>
    
    <button 
      @click="emit('action', 'edit-cemetery')" 
      class="w-full text-left px-4 py-2 hover:bg-green-50 text-sm text-gray-700 flex items-center gap-2"
    >
      <span>📍</span> 编辑墓址
    </button>
    
    <button 
      @click="emit('action', 'edit')" 
      class="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 flex items-center gap-2"
    >
      <span>✏️</span> 编辑信息
    </button>
    
    <button 
      v-if="!isAlive"
      @click="emit('action', 'worship')" 
      class="w-full text-left px-4 py-2 hover:bg-amber-50 text-sm text-amber-700 flex items-center gap-2"
    >
      <span>🙏</span> 在线祭扫
    </button>
    
    <button 
      @click="emit('action', 'delete')" 
      class="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600 flex items-center gap-2"
    >
      <span>🗑️</span> 删除成员
    </button>
  </div>
  
  <!-- Overlay to close menu when clicking outside -->
  <div 
    v-if="isVisible" 
    class="fixed inset-0 z-40" 
    @click="emit('close')"
    @contextmenu.prevent="emit('close')"
  ></div>
</template>

<script setup lang="ts">
defineProps<{
  isVisible: boolean;
  position: { x: number; y: number };
  memberName: string;
  isAlive?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'action', action: 'add-child' | 'add-spouse' | 'edit' | 'delete' | 'edit-cemetery' | 'worship'): void;
}>();
</script>
