<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">支系合并管理</h1>
          <p class="text-gray-500 mt-1">处理分支数据合并，解决重名与代际冲突。</p>
        </div>
        <router-link to="/branch" class="text-blue-600 hover:text-blue-800">返回支系列表</router-link>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left: Upload/Select Source -->
        <div class="lg:col-span-1 space-y-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-bold text-gray-800 mb-4">1. 选择待合并数据</h2>
            
            <div class="space-y-4">
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer" @click="triggerFileUpload">
                <div class="text-3xl mb-2">📂</div>
                <p class="text-sm font-medium text-gray-700">上传支系数据文件</p>
                <p class="text-xs text-gray-400 mt-1">支持 JSON / GEDCOM 格式</p>
                <input type="file" ref="fileInput" class="hidden" accept=".json,.ged" @change="handleFileUpload">
              </div>

              <div class="relative">
                <div class="absolute inset-0 flex items-center" aria-hidden="true">
                  <div class="w-full border-t border-gray-200"></div>
                </div>
                <div class="relative flex justify-center">
                  <span class="px-2 bg-white text-sm text-gray-500">或</span>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">从现有分支选择</label>
                <select v-model="selectedBranchId" class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                  <option value="">请选择...</option>
                  <option value="branch_a">岭北支系 (待合并)</option>
                  <option value="branch_b">城西分支 (待合并)</option>
                </select>
                <button 
                  @click="loadBranchData" 
                  :disabled="!selectedBranchId"
                  class="mt-3 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  加载数据
                </button>
              </div>
            </div>
          </div>

          <!-- Summary Card -->
          <div v-if="incomingData" class="bg-blue-50 rounded-xl border border-blue-100 p-6">
            <h3 class="text-blue-900 font-bold mb-2">数据概览</h3>
            <ul class="space-y-2 text-sm text-blue-800">
              <li class="flex justify-between">
                <span>成员总数:</span>
                <span class="font-bold">{{ incomingData.members.length }}</span>
              </li>
              <li class="flex justify-between">
                <span>起始世代:</span>
                <span class="font-bold">{{ incomingData.minGen }}世</span>
              </li>
              <li class="flex justify-between">
                <span>结束世代:</span>
                <span class="font-bold">{{ incomingData.maxGen }}世</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Right: Conflict Resolution -->
        <div class="lg:col-span-2 space-y-6">
          <div v-if="conflicts.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100 bg-amber-50 flex justify-between items-center">
              <div>
                <h2 class="text-lg font-bold text-amber-900">2. 冲突处理</h2>
                <p class="text-sm text-amber-700">发现 {{ conflicts.length }} 个潜在冲突，请逐一确认。</p>
              </div>
              <div class="text-sm text-amber-800">
                已解决: {{ resolvedCount }} / {{ conflicts.length }}
              </div>
            </div>

            <div class="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              <div v-for="(conflict, index) in conflicts" :key="index" class="p-6">
                <div class="flex items-start gap-4 mb-4">
                  <span class="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded">
                    {{ conflict.type === 'duplicate' ? '疑似重名' : '代际冲突' }}
                  </span>
                  <p class="text-gray-800 font-medium">{{ conflict.description }}</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <!-- Existing -->
                  <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div class="text-xs text-gray-500 mb-1 uppercase tracking-wider">主树现有数据</div>
                    <div class="font-bold text-gray-900">{{ conflict.existing.name }}</div>
                    <div class="text-sm text-gray-600 mt-1">
                      {{ conflict.existing.generation }}世 | {{ conflict.existing.gender === 'M' ? '男' : '女' }}
                    </div>
                    <div class="text-xs text-gray-500 mt-2">
                      ID: {{ conflict.existing.id }}
                    </div>
                  </div>

                  <!-- Incoming -->
                  <div class="border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <div class="text-xs text-blue-500 mb-1 uppercase tracking-wider">待合并数据</div>
                    <div class="font-bold text-blue-900">{{ conflict.incoming.name }}</div>
                    <div class="text-sm text-blue-800 mt-1">
                      {{ conflict.incoming.generation }}世 | {{ conflict.incoming.gender === 'M' ? '男' : '女' }}
                    </div>
                    <div class="text-xs text-blue-400 mt-2">
                      ID: {{ conflict.incoming.id }}
                    </div>
                  </div>
                </div>

                <div class="flex flex-col sm:flex-row gap-3">
                  <label class="flex-1 cursor-pointer touch-manipulation">
                    <input type="radio" :name="`conflict-${index}`" value="skip" v-model="resolutions[index].action" class="peer sr-only">
                    <div class="text-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 peer-checked:bg-gray-800 peer-checked:text-white peer-checked:border-gray-800 transition-all">
                      <div class="font-bold text-sm">保留现有</div>
                      <div class="text-xs opacity-80">忽略传入数据</div>
                    </div>
                  </label>

                  <label class="flex-1 cursor-pointer touch-manipulation">
                    <input type="radio" :name="`conflict-${index}`" value="replace" v-model="resolutions[index].action" class="peer sr-only">
                    <div class="text-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 transition-all">
                      <div class="font-bold text-sm">覆盖现有</div>
                      <div class="text-xs opacity-80">使用传入数据更新</div>
                    </div>
                  </label>

                  <label class="flex-1 cursor-pointer touch-manipulation">
                    <input type="radio" :name="`conflict-${index}`" value="keep_both" v-model="resolutions[index].action" class="peer sr-only">
                    <div class="text-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 peer-checked:bg-green-600 peer-checked:text-white peer-checked:border-green-600 transition-all">
                      <div class="font-bold text-sm">两者皆留</div>
                      <div class="text-xs opacity-80">视为不同人员</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="incomingData" class="bg-green-50 rounded-xl border border-green-200 p-8 text-center">
             <div class="text-4xl mb-4">✅</div>
             <h3 class="text-xl font-bold text-green-900 mb-2">检测完成</h3>
             <p class="text-green-700">未发现明显的数据冲突，可以直接合并。</p>
          </div>

          <div v-if="incomingData" class="flex justify-end pt-4">
             <button @click="performMerge" :disabled="resolvedCount < conflicts.length" class="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transform transition-transform active:scale-95">
               确认合并
             </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMemberStore } from '../stores/memberStore';
import { type Member } from '../types';

const memberStore = useMemberStore();
const fileInput = ref<HTMLInputElement | null>(null);
const selectedBranchId = ref('');
const incomingData = ref<{ members: Member[], minGen: number, maxGen: number } | null>(null);
const conflicts = ref<any[]>([]);
const resolutions = ref<any[]>([]);

const resolvedCount = computed(() => {
  return resolutions.value.filter(r => r.action).length;
});

function triggerFileUpload() {
  fileInput.value?.click();
}

function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string);
      processIncomingData(data);
    } catch (err) {
      alert('文件解析失败，请确保是有效的 JSON 格式');
    }
  };
  reader.readAsText(file);
}

function loadBranchData() {
  // Mock loading data
  const mockIncoming: Member[] = [
    {
      id: 'branch_1',
      name: '张大郎', // Duplicate with existing
      gender: 'M',
      generation: 2,
      generationWord: '大',
      order: 1,
      isAlive: false,
      birthDate: '1930-02-02', // Slightly different date
      parents: [],
      children: [],
      spouses: [],
      cemetery: null,
      branchName: '岭北支系',
      isFloating: true
    },
    {
      id: 'branch_2',
      name: '张岭北', // New
      gender: 'M',
      generation: 3,
      generationWord: '小',
      order: 1,
      isAlive: true,
      birthDate: '1965-01-01',
      parents: [],
      children: [],
      spouses: [],
      cemetery: null,
      branchName: '岭北支系',
      isFloating: true
    }
  ];
  
  processIncomingData(mockIncoming);
}

function processIncomingData(members: Member[]) {
  const gens = members.map(m => m.generation);
  incomingData.value = {
    members,
    minGen: Math.min(...gens),
    maxGen: Math.max(...gens)
  };

  const result = memberStore.detectConflicts(members);
  conflicts.value = result.conflicts;
  
  // Initialize resolutions
  resolutions.value = result.conflicts.map(c => ({
    conflictIndex: 0,
    incomingId: c.incoming.id,
    existingId: c.existing.id,
    incomingData: c.incoming,
    action: null // 'skip' | 'replace' | 'keep_both'
  }));
}

function performMerge() {
  if (!incomingData.value) return;
  
  memberStore.mergeBranch(incomingData.value.members, resolutions.value);
  alert('合并操作成功完成！');
  
  // Reset
  incomingData.value = null;
  conflicts.value = [];
  resolutions.value = [];
  selectedBranchId.value = '';
}
</script>
