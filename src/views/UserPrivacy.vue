<template>
  <div class="container mx-auto p-4 max-w-3xl">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold text-gray-800">隐私设置</h1>
      <router-link to="/" class="text-blue-600 hover:text-blue-800">返回首页</router-link>
    </div>

    <div v-if="currentUserMember" class="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
      <div class="p-8 bg-gradient-to-r from-blue-50 to-white border-b border-gray-100">
        <div class="flex items-center gap-6">
           <div class="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-3xl text-blue-600 font-bold border-4 border-white shadow-md">
             {{ currentUserMember.name[0] }}
           </div>
           <div>
             <h2 class="text-2xl font-bold text-gray-900">{{ currentUserMember.name }}</h2>
             <p class="text-gray-500 mt-1">控制您的个人信息对外展示的范围。</p>
             <div class="mt-2 flex gap-2">
               <span class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">第 {{ currentUserMember.generation }} 世</span>
               <span class="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">{{ currentUserMember.branchName }}</span>
             </div>
           </div>
        </div>
      </div>

      <div class="p-8">
        <div class="mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-2">公开字段设置</h3>
          <p class="text-sm text-gray-500">勾选的项目将对所有访客（包括未登录用户）可见。未勾选的项目仅对家族认证成员可见。</p>
        </div>

        <div class="space-y-4 divide-y divide-gray-100">
          <div v-for="field in privacyOptions" :key="field.key" class="flex items-center justify-between py-4 first:pt-0">
            <div class="flex-1 pr-4">
              <span class="text-gray-900 font-medium block mb-1">{{ field.label }}</span>
              <p class="text-sm text-gray-500">{{ field.description }}</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" :checked="selectedFields.includes(field.key)" @change="toggleField(field.key)" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
        
        <div class="mt-8 pt-6 border-t border-gray-100 flex justify-end">
          <button @click="savePrivacy" class="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-transform active:scale-95 flex items-center gap-2">
            <span>💾</span> 保存设置
          </button>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
      <div class="text-6xl mb-4">🔒</div>
      <h2 class="text-xl font-bold text-gray-900 mb-2">需要登录</h2>
      <p class="text-gray-500 mb-6">请先登录以管理您的隐私设置。</p>
      <router-link to="/login" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium inline-block">立即登录</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useMemberStore } from '../stores/memberStore';
import { storeToRefs } from 'pinia';

const authStore = useAuthStore();
const memberStore = useMemberStore();
const { user } = storeToRefs(authStore);

// Mock mapping from auth user to member
const currentUserMember = computed(() => {
  if (!user.value) return null;
  return memberStore.getMember(user.value.id);
});

const privacyOptions = [
  { key: 'birthDate', label: '出生日期', description: '显示具体的出生年月日，如：1980年1月1日' },
  { key: 'spouses', label: '配偶信息', description: '显示配偶姓名、生卒年及婚姻状况' },
  { key: 'bio', label: '生平简介', description: '显示详细的个人生平描述、事迹' },
  { key: 'contact', label: '联系方式', description: '显示电话号码、微信等联系方式' },
  { key: 'cemetery', label: '墓址信息', description: '显示详细的墓地位置坐标及照片' },
  { key: 'photo', label: '个人照片', description: '显示头像及相册' }
];

const selectedFields = ref<string[]>([]);

// Initialize fields when user is loaded
watch(currentUserMember, (newMember) => {
  if (newMember) {
    selectedFields.value = newMember.publicFields || [];
  }
}, { immediate: true });

function toggleField(key: string) {
  const idx = selectedFields.value.indexOf(key);
  if (idx === -1) {
    selectedFields.value.push(key);
  } else {
    selectedFields.value.splice(idx, 1);
  }
}

function savePrivacy() {
  if (currentUserMember.value) {
    memberStore.updateMember(currentUserMember.value.id, {
      publicFields: [...selectedFields.value]
    });
    alert('隐私设置已成功保存！');
  }
}
</script>
