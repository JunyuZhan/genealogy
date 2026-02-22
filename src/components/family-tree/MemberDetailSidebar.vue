<template>
  <div>
    <!-- Backdrop for mobile -->
    <div v-if="isVisible" class="fixed inset-0 bg-black/30 z-40 md:hidden" @click="$emit('close')"></div>
    
    <div class="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out"
         :class="{'translate-x-0': isVisible, 'translate-x-full': !isVisible}">
      <div class="h-full flex flex-col overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h2 class="text-xl font-bold text-gray-800">成员详情</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 focus:outline-none">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6" v-if="member">
        <!-- Basic Info -->
        <div class="flex items-start gap-4">
          <div class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl text-blue-600 font-bold border-2 border-white shadow-sm">
            {{ member.name[0] }}
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <h3 class="text-2xl font-bold text-gray-900">{{ member.name }}</h3>
              <span v-if="member.givenName" class="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">字 {{ member.givenName }}</span>
            </div>
            <p class="text-sm text-gray-500 mt-1">
              第 {{ member.generation }} 世
              <span v-if="member.generationWord">· {{ member.generationWord }}字辈</span>
            </p>
            <div class="flex gap-2 mt-2">
              <span class="px-2 py-0.5 text-xs font-medium rounded-full" 
                    :class="member.gender === 'M' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'">
                {{ member.gender === 'M' ? '男' : '女' }}
              </span>
              <span class="px-2 py-0.5 text-xs font-medium rounded-full"
                    :class="member.isAlive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
                {{ member.isAlive ? '在世' : '已故' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Bio & Dates -->
        <div class="border-t border-gray-100 pt-4">
          <div class="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <span class="text-gray-500 block text-xs">出生日期</span>
              <span class="font-medium">{{ member.birthDate || '未知' }}</span>
            </div>
            <div v-if="!member.isAlive">
              <span class="text-gray-500 block text-xs">去世日期</span>
              <span class="font-medium">{{ member.deathDate || '未知' }}</span>
            </div>
          </div>
          
          <div v-if="member.bio" class="bg-gray-50 p-3 rounded text-sm text-gray-600 italic border border-gray-100">
            "{{ member.bio }}"
          </div>
        </div>

        <!-- Family Relations -->
        <div class="border-t border-gray-100 pt-4">
          <h4 class="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>👪</span> 家族关系
          </h4>
          
          <!-- Parents -->
          <div class="mb-4">
            <span class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">父母</span>
            <div v-if="parents.length > 0" class="flex flex-wrap gap-2">
              <div v-for="p in parents" :key="p.id" 
                   class="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1 text-sm shadow-sm cursor-pointer hover:border-blue-300 hover:text-blue-600 transition-colors"
                   @click="$emit('select', p.id)">
                <span>{{ p.name }}</span>
              </div>
            </div>
            <div v-else class="text-sm text-gray-400 italic">暂无记录</div>
          </div>

          <!-- Siblings -->
          <div class="mb-4">
            <div class="flex justify-between items-center mb-1">
                <span class="text-xs font-bold text-gray-400 uppercase tracking-wider block">兄弟姐妹</span>
                <button @click="$emit('add-sibling', member.id)" class="text-xs text-blue-500 hover:text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    + 添加
                </button>
            </div>
            <div v-if="siblings.length > 0" class="flex flex-wrap gap-2">
              <div v-for="sib in siblings" :key="sib.id" 
                   class="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1 text-sm shadow-sm cursor-pointer hover:border-blue-300 hover:text-blue-600 transition-colors"
                   @click="$emit('select', sib.id)">
                <span>{{ sib.name }}</span>
              </div>
            </div>
            <div v-else class="text-sm text-gray-400 italic">暂无记录</div>
          </div>

          <!-- Spouses -->
          <div class="mb-4">
            <span class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">配偶</span>
            <div v-if="member.spouses && member.spouses.length > 0" class="flex flex-col gap-2">
              <div v-for="s in member.spouses" :key="s.name" class="flex justify-between items-center bg-pink-50 border border-pink-100 rounded px-3 py-2 text-sm">
                <span class="font-medium text-pink-900">{{ s.name }}</span>
                <span class="text-xs text-pink-400">{{ s.isAlive ? '在世' : '已故' }}</span>
              </div>
            </div>
            <div v-else class="text-sm text-gray-400 italic">未婚 / 无记录</div>
          </div>

          <!-- Children -->
          <div>
            <span class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">子女</span>
            <div v-if="children.length > 0" class="flex flex-col gap-2">
              <div v-for="c in children" :key="c.id" 
                   class="flex justify-between items-center bg-white border border-gray-200 rounded px-3 py-2 text-sm cursor-pointer hover:border-blue-300 transition-colors"
                   @click="$emit('select', c.id)">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full" :class="c.gender === 'M' ? 'bg-blue-400' : 'bg-pink-400'"></span>
                  <span class="font-medium text-gray-700">{{ c.name }}</span>
                </div>
                <span class="text-xs text-gray-400">第{{ c.generation }}世</span>
              </div>
            </div>
            <div v-else class="text-sm text-gray-400 italic">暂无记录</div>
          </div>
        </div>

        <!-- Cemetery -->
        <div class="border-t border-gray-100 pt-4" v-if="!member.isAlive">
          <h4 class="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>🪦</span> 墓址信息
          </h4>
          <div v-if="member.cemetery" class="bg-stone-50 border border-stone-200 rounded p-3">
             <div class="text-sm text-gray-800 mb-1 font-medium">{{ member.cemetery.address || '位置已标记' }}</div>
             <div class="text-xs text-gray-500 mb-3">
               Lat: {{ member.cemetery.lat.toFixed(6) }}, Lng: {{ member.cemetery.lng.toFixed(6) }}
             </div>
             <div class="flex gap-2">
               <button @click="$emit('worship', member.id)" class="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-xs py-1.5 rounded transition-colors">
                 🙏 在线祭扫
               </button>
               <button @click="$emit('edit-cemetery', member.id)" class="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 text-xs py-1.5 rounded transition-colors">
                 📍 查看地图
               </button>
             </div>
          </div>
          <div v-else class="text-sm text-gray-400 italic">
            暂无墓址信息 <button @click="$emit('edit-cemetery', member.id)" class="text-blue-500 hover:underline ml-1">去添加</button>
          </div>
        </div>

      </div>
      <div v-else class="flex-1 flex items-center justify-center text-gray-400">
        未选择成员
      </div>

      <!-- Footer Actions -->
      <div class="p-4 bg-gray-50 border-t border-gray-200" v-if="member">
        <div class="flex gap-3 mb-2">
          <button @click="$emit('edit', member.id)" class="flex-1 bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
            编辑
          </button>
          <button @click="confirmDelete" class="flex-1 bg-red-50 border border-red-200 text-red-700 font-medium py-2 px-4 rounded shadow-sm hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
            删除
          </button>
        </div>
        <button @click="showCorrectionModal = true" class="w-full text-xs text-blue-500 hover:text-blue-700 hover:underline py-1">
          发现信息有误？申请修正
        </button>
      </div>

      <!-- Correction Modal -->
      <div v-if="showCorrectionModal" class="absolute inset-0 z-50 flex items-end justify-center sm:items-center p-4 bg-black/20 backdrop-blur-sm">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 relative animate-in fade-in zoom-in duration-200">
          <button @click="showCorrectionModal = false" class="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          <h3 class="text-lg font-bold mb-2 text-gray-900">申请信息修正</h3>
          <p class="text-sm text-gray-500 mb-4">请描述 {{ member?.name }} 的信息错误及正确内容。</p>
          <textarea v-model="correctionReason" rows="4" class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm p-3 mb-4" placeholder="例如：出生日期应为1980年..."></textarea>
          <button @click="submitCorrection" class="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-bold shadow-sm transition-transform active:scale-95">提交申请</button>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { type Member, RelationshipType } from '../../types';

const props = defineProps<{
  isVisible: boolean;
  member: Member | null;
  allMembers: Member[];
}>();

const showCorrectionModal = ref(false);
const correctionReason = ref('');

function submitCorrection() {
  if (!correctionReason.value) return;
  alert('修正申请已提交，管理员将尽快审核。');
  showCorrectionModal.value = false;
  correctionReason.value = '';
}

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'select', memberId: string): void;
  (e: 'edit', memberId: string): void;
  (e: 'delete', memberId: string): void;
  (e: 'edit-cemetery', memberId: string): void;
  (e: 'worship', memberId: string): void;
  (e: 'add-sibling', memberId: string): void;
}>();

const parents = computed(() => {
  if (!props.member) return [];
  return props.member.parents.map(link => 
    props.allMembers.find(m => m.id === link.targetId)
  ).filter(Boolean) as Member[];
});

const siblings = computed(() => {
  if (!props.member || props.member.parents.length === 0) return [];
  
  const parentIds = props.member.parents
    .filter(p => p.relationship === RelationshipType.BIOLOGICAL || p.relationship === RelationshipType.ADOPTED)
    .map(p => p.targetId);
    
  if (parentIds.length === 0) return [];
  
  return props.allMembers.filter(m => 
    m.id !== props.member?.id && 
    m.parents.some(p => parentIds.includes(p.targetId))
  ).sort((a, b) => (a.order || 0) - (b.order || 0));
});

const children = computed(() => {
  if (!props.member) return [];
  // Find members who have this member as parent
  // Or utilize the children links stored in member
  return props.member.children.map(link =>
    props.allMembers.find(m => m.id === link.targetId)
  ).filter(Boolean) as Member[];
});

function confirmDelete() {
  if (props.member && confirm(`确定要删除成员 "${props.member.name}" 吗？此操作不可恢复。`)) {
    emit('delete', props.member.id);
  }
}
</script>
