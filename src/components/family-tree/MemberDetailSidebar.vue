<template>
  <Transition name="slide">
    <div v-if="isVisible && member" class="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-50 flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b bg-gray-50">
        <h2 class="text-lg font-bold text-gray-800">成员详情</h2>
        <button @click="close" class="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <!-- Basic Info -->
        <div class="space-y-2">
          <div class="flex items-center gap-3">
            <div 
              class="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
              :class="member.gender === 'M' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'"
            >
              {{ member.gender === 'M' ? '♂' : '♀' }}
            </div>
            <div>
              <h3 class="text-xl font-semibold">{{ member.name }}</h3>
              <p class="text-sm text-gray-500">{{ member.generationWord ? `字辈: ${member.generationWord}` : '' }}</p>
            </div>
          </div>
        </div>

        <!-- Status Badge -->
        <div>
          <span 
            class="inline-block px-3 py-1 rounded-full text-sm"
            :class="member.isAlive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'"
          >
            {{ member.isAlive ? '在世' : '已故' }}
          </span>
          <span v-if="member.isFloating" class="ml-2 inline-block px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-700">
            独立支系
          </span>
        </div>

        <!-- Details -->
        <div class="space-y-3 text-sm">
          <div v-if="member.givenName" class="flex justify-between">
            <span class="text-gray-500">字/号:</span>
            <span>{{ member.givenName }}</span>
          </div>
          <div v-if="member.nickname" class="flex justify-between">
            <span class="text-gray-500">乳名:</span>
            <span>{{ member.nickname }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">性别:</span>
            <span>{{ member.gender === 'M' ? '男' : '女' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">世代:</span>
            <span>第{{ member.generation }}世</span>
          </div>
          <div v-if="member.order" class="flex justify-between">
            <span class="text-gray-500">排行:</span>
            <span>第{{ member.order }}位</span>
          </div>
          <div v-if="member.birthDate" class="flex justify-between">
            <span class="text-gray-500">出生日期:</span>
            <span>{{ member.birthDate }}</span>
          </div>
          <div v-if="!member.isAlive && member.deathDate" class="flex justify-between">
            <span class="text-gray-500">去世时间:</span>
            <span>{{ member.deathDate }}</span>
          </div>
        </div>

        <!-- Spouses -->
        <div v-if="member.spouses && member.spouses.length > 0">
          <h4 class="font-medium text-gray-700 border-b pb-1 mb-2">配偶</h4>
          <div v-for="(spouse, index) in member.spouses" :key="index" class="bg-gray-50 p-2 rounded text-sm">
            <div class="flex justify-between">
              <span>{{ spouse.name }}</span>
              <span class="text-xs text-gray-400">{{ spouse.isAlive ? '在世' : '已故' }}</span>
            </div>
            <div v-if="spouse.maidenName" class="text-xs text-gray-500">娘家姓: {{ spouse.maidenName }}</div>
            <div v-if="spouse.marriedDate" class="text-xs text-gray-500">结婚日期: {{ spouse.marriedDate }}</div>
          </div>
        </div>

        <!-- Parents -->
        <div v-if="member.parents && member.parents.length > 0">
          <h4 class="font-medium text-gray-700 border-b pb-1 mb-2">父母</h4>
          <div v-for="parent in member.parents" :key="parent.targetId" class="bg-gray-50 p-2 rounded text-sm">
            <span class="text-xs text-gray-400">{{ parent.role === 'father' ? '父亲' : '母亲' }}</span>
            <div class="cursor-pointer text-blue-600 hover:underline" @click="$emit('view-member', parent.targetId)">
              {{ getParentName(parent.targetId) }}
            </div>
          </div>
        </div>

        <!-- Children -->
        <div v-if="member.children && member.children.length > 0">
          <h4 class="font-medium text-gray-700 border-b pb-1 mb-2">子女 ({{ member.children.length }}人)</h4>
          <div class="flex flex-wrap gap-1">
            <span 
              v-for="child in member.children" 
              :key="child.targetId"
              class="px-2 py-1 bg-gray-50 rounded text-xs cursor-pointer hover:bg-blue-50"
              @click="$emit('view-member', child.targetId)"
            >
              {{ getChildName(child.targetId) }}
            </span>
          </div>
        </div>

        <!-- Cemetery -->
        <div v-if="member.cemetery && !member.isAlive">
          <h4 class="font-medium text-gray-700 border-b pb-1 mb-2">墓冢信息</h4>
          <div class="bg-gray-50 p-2 rounded text-sm space-y-1">
            <div v-if="member.cemetery.address" class="text-gray-600">
              <span class="text-gray-400">地址:</span> {{ member.cemetery.address }}
            </div>
            <div v-if="member.cemetery.cemeteryCode" class="text-gray-600">
              <span class="text-gray-400">墓号:</span> {{ member.cemetery.cemeteryCode }}
            </div>
            <button 
              v-if="member.cemetery.lat && member.cemetery.lng"
              @click="$emit('view-cemetery', member?.cemetery)"
              class="mt-2 w-full py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
            >
              查看墓地图
            </button>
          </div>
        </div>

        <!-- Memorial Info -->
        <div v-if="!member.isAlive">
          <h4 class="font-medium text-gray-700 border-b pb-1 mb-2">祭扫信息</h4>
          <div class="bg-gray-50 p-2 rounded text-sm space-y-1">
            <div class="flex justify-between">
              <span class="text-gray-500">祭扫次数:</span>
              <span>{{ member.visitCount || 0 }}次</span>
            </div>
            <div v-if="member.lastVisitedAt" class="flex justify-between">
              <span class="text-gray-500">最后祭扫:</span>
              <span>{{ formatDate(member.lastVisitedAt) }}</span>
            </div>
            <button 
              @click="$emit('memorial', member.id)"
              class="mt-2 w-full py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              祭扫纪念
            </button>
          </div>
        </div>

        <!-- Bio -->
        <div v-if="member.bio">
          <h4 class="font-medium text-gray-700 border-b pb-1 mb-2">生平简介</h4>
          <p class="text-sm text-gray-600 whitespace-pre-wrap">{{ member.bio }}</p>
        </div>

        <!-- Branch -->
        <div>
          <h4 class="font-medium text-gray-700 border-b pb-1 mb-2">所属支系</h4>
          <span class="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
            {{ member.branchName || '未分配' }}
          </span>
        </div>

        <!-- Tags -->
        <div v-if="member.tags && member.tags.length > 0">
          <h4 class="font-medium text-gray-700 border-b pb-1 mb-2">标签</h4>
          <div class="flex flex-wrap gap-1">
            <span 
              v-for="tag in member.tags" 
              :key="tag"
              class="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="p-4 border-t bg-gray-50 space-y-2">
        <div class="flex gap-2">
          <button 
            @click="$emit('add-child', member.id)"
            class="flex-1 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            添加子女
          </button>
          <button 
            @click="$emit('add-spouse', member.id)"
            class="flex-1 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 text-sm"
          >
            添加配偶
          </button>
        </div>
        <div class="flex gap-2">
          <button 
            @click="$emit('edit', member.id)"
            class="flex-1 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
          >
            编辑资料
          </button>
          <button 
            @click="handleDelete"
            class="flex-1 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            删除成员
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Backdrop -->
  <Transition name="fade">
    <div v-if="isVisible" @click="close" class="fixed inset-0 bg-black bg-opacity-30 z-40"></div>
  </Transition>
</template>

<script setup lang="ts">
import { type Member } from '../../types';

const props = defineProps<{
  isVisible: boolean;
  member: Member | null;
  allMembers: Member[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'edit', id: string): void;
  (e: 'delete', id: string): void;
  (e: 'add-child', id: string): void;
  (e: 'add-spouse', id: string): void;
  (e: 'view-member', id: string): void;
  (e: 'view-cemetery', cemetery: Member['cemetery']): void;
  (e: 'memorial', id: string): void;
}>();

function close() {
  emit('close');
}

function handleDelete() {
  if (props.member && confirm(`确定要删除成员 "${props.member.name}" 吗？此操作不可恢复。`)) {
    emit('delete', props.member.id);
  }
}

function getParentName(id: string): string {
  const parent = props.allMembers.find(m => m.id === id);
  return parent?.name || '未知';
}

function getChildName(id: string): string {
  const child = props.allMembers.find(m => m.id === id);
  return child?.name || '未知';
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN');
}
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
