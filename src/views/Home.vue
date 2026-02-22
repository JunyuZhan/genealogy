<template>
  <div class="min-h-screen bg-gray-50 flex flex-col font-sans">
    <!-- 0.1.1 Header -->
    <header class="bg-white shadow-sm sticky top-0 z-30">
      <div class="container mx-auto px-4 h-16 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-amber-700 rounded-full flex items-center justify-center text-white font-serif font-bold text-xl">陈</div>
          <h1 class="text-xl font-bold text-gray-800 tracking-wide">陈氏宗族数字化平台</h1>
        </div>
        
        <nav class="hidden md:flex gap-8 text-gray-600 font-medium">
          <router-link to="/" class="text-amber-700 font-bold">首页</router-link>
          <router-link to="/tree" class="hover:text-amber-700 transition-colors">族谱浏览</router-link>
          <a href="#" class="hover:text-amber-700 transition-colors">祭扫纪念</a>
          <a href="#" class="hover:text-amber-700 transition-colors">家族动态</a>
          <a href="#" class="hover:text-amber-700 transition-colors">慈善公益</a>
        </nav>

        <div class="flex items-center gap-4">
          <div v-if="user" class="flex items-center gap-2">
            <img :src="user.avatar" class="w-8 h-8 rounded-full border border-gray-200" />
            <span class="text-sm font-medium text-gray-700">{{ user.name }}</span>
            <button @click="handleLogout" class="text-xs text-gray-400 hover:text-red-500 ml-2">退出</button>
          </div>
          <div v-else class="flex gap-2 text-sm">
            <router-link to="/login" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors">登录</router-link>
            <router-link to="/register" class="px-4 py-2 bg-amber-700 text-white hover:bg-amber-800 rounded-md transition-colors shadow-sm">注册</router-link>
          </div>
        </div>
      </div>
    </header>

    <!-- 0.1.2 Banner -->
    <div class="relative bg-stone-900 h-[300px] md:h-[400px] flex items-center justify-center overflow-hidden">
      <div class="absolute inset-0 opacity-40">
        <img src="https://images.unsplash.com/photo-1599940824399-b87987ce179a?q=80&w=2000&auto=format&fit=crop" class="w-full h-full object-cover" />
      </div>
      <div class="relative z-10 text-center text-white max-w-4xl px-4">
        <h2 class="text-3xl md:text-5xl font-serif font-bold mb-4 md:mb-6 tracking-widest text-amber-50 drop-shadow-lg">颍川世泽 长发其祥</h2>
        <p class="text-base md:text-xl text-gray-200 mb-6 md:mb-8 font-light tracking-wide leading-relaxed">
          慎终追远，民德归厚矣。<br class="hidden md:block"/>
          家族不仅仅是血脉的延续，更是精神的传承。
        </p>
        <div class="flex flex-col md:flex-row justify-center gap-4">
          <router-link to="/tree" class="px-6 py-2 md:px-8 md:py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-full font-bold shadow-lg transition-all hover:scale-105 text-sm md:text-base">
            查阅族谱
          </router-link>
          <button class="px-6 py-2 md:px-8 md:py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-full font-bold transition-all text-sm md:text-base">
            了解家族历史
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-12 flex-1">
      
      <!-- 0.1.5 Statistics -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
          <div class="text-3xl font-bold text-amber-700 mb-1">{{ memberStore.members.length }}</div>
          <div class="text-sm text-gray-500">家族成员总数</div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
          <div class="text-3xl font-bold text-blue-600 mb-1">{{ livingCount }}</div>
          <div class="text-sm text-gray-500">在世人口</div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
          <div class="text-3xl font-bold text-stone-600 mb-1">{{ generationsCount }}</div>
          <div class="text-sm text-gray-500">繁衍世代</div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
          <div class="text-3xl font-bold text-green-600 mb-1">12,580</div>
          <div class="text-sm text-gray-500">累计祭扫人次</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 0.1.3 & 0.1.4 Feature Cards -->
        <div class="lg:col-span-2 space-y-8">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span class="w-1 h-6 bg-amber-600 rounded-full"></span>
              功能中心
            </h3>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
              <div class="h-32 bg-blue-50 relative overflow-hidden">
                <div class="absolute -right-4 -bottom-4 text-9xl opacity-10">🌳</div>
              </div>
              <div class="p-6 relative">
                <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white text-2xl mb-4 shadow-lg absolute -top-6">📖</div>
                <h4 class="text-lg font-bold text-gray-800 mb-2">数字化族谱</h4>
                <p class="text-gray-500 text-sm mb-4">支持欧式/苏式双排版，D3.js 动态交互，清晰展示家族脉络与成员关系。</p>
                <router-link to="/tree" class="text-blue-600 font-medium text-sm hover:underline flex items-center gap-1">
                  立即浏览 <span>→</span>
                </router-link>
              </div>
            </div>

            <div class="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
              <div class="h-32 bg-amber-50 relative overflow-hidden">
                <div class="absolute -right-4 -bottom-4 text-9xl opacity-10">🕯️</div>
              </div>
              <div class="p-6 relative">
                <div class="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center text-white text-2xl mb-4 shadow-lg absolute -top-6">🙏</div>
                <h4 class="text-lg font-bold text-gray-800 mb-2">云端祭扫</h4>
                <p class="text-gray-500 text-sm mb-4">打破时空限制，随时随地缅怀先人。支持点烛、献花、寄语等互动仪式。</p>
                <router-link to="/tree" class="text-amber-600 font-medium text-sm hover:underline flex items-center gap-1">
                  进入纪念馆 <span>→</span>
                </router-link>
              </div>
            </div>

            <div class="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
              <div class="h-32 bg-green-50 relative overflow-hidden">
                <div class="absolute -right-4 -bottom-4 text-9xl opacity-10">💾</div>
              </div>
              <div class="p-6 relative">
                <div class="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white text-2xl mb-4 shadow-lg absolute -top-6">📂</div>
                <h4 class="text-lg font-bold text-gray-800 mb-2">数据管理</h4>
                <p class="text-gray-500 text-sm mb-4">支持 GEDCOM 标准格式导入导出，确保家族数据资产的安全与传承。</p>
                <div class="flex gap-2">
                   <label class="text-green-600 font-medium text-sm hover:underline cursor-pointer">
                      导入数据
                      <input type="file" accept=".ged" class="hidden" @change="handleImport" />
                   </label>
                   <span class="text-gray-300">|</span>
                   <button @click="handleExport" class="text-green-600 font-medium text-sm hover:underline">
                      导出备份
                   </button>
                </div>
              </div>
            </div>

             <div class="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all opacity-70">
              <div class="h-32 bg-purple-50 relative overflow-hidden">
                <div class="absolute -right-4 -bottom-4 text-9xl opacity-10">🤝</div>
              </div>
              <div class="p-6 relative">
                <div class="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white text-2xl mb-4 shadow-lg absolute -top-6">❤️</div>
                <h4 class="text-lg font-bold text-gray-800 mb-2">宗族慈善</h4>
                <p class="text-gray-500 text-sm mb-4">奖学助教，扶贫济困。汇聚族人力量，共建美好家族未来。</p>
                <span class="text-gray-400 font-medium text-sm cursor-not-allowed">
                  即将上线
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 0.1.6 News Sidebar -->
        <div class="space-y-8">
           <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h3 class="font-bold text-gray-800 mb-4 flex items-center justify-between">
               <span>📢 家族公告</span>
               <a href="#" class="text-xs text-gray-400 hover:text-blue-500">更多</a>
             </h3>
             <ul class="space-y-4">
               <li class="pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                 <a href="#" class="block hover:text-amber-700 transition-colors">
                   <span class="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded mb-1 inline-block">置顶</span>
                   <p class="text-sm font-medium text-gray-700 leading-snug">关于举办2024年清明全族祭祖大典的通知</p>
                   <span class="text-xs text-gray-400 mt-1 block">2024-03-01</span>
                 </a>
               </li>
               <li class="pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                 <a href="#" class="block hover:text-amber-700 transition-colors">
                   <p class="text-sm font-medium text-gray-700 leading-snug">陈氏宗祠修缮工程捐款明细公示（第三期）</p>
                   <span class="text-xs text-gray-400 mt-1 block">2024-02-15</span>
                 </a>
               </li>
               <li class="pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                 <a href="#" class="block hover:text-amber-700 transition-colors">
                   <p class="text-sm font-medium text-gray-700 leading-snug">热烈祝贺族亲陈某某荣获国家科技进步奖</p>
                   <span class="text-xs text-gray-400 mt-1 block">2024-01-10</span>
                 </a>
               </li>
             </ul>
           </div>

           <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h3 class="font-bold text-gray-800 mb-4">✨ 最新动态</h3>
             <div class="space-y-4">
                <div class="flex gap-3">
                  <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs">👤</div>
                  <div>
                    <p class="text-sm text-gray-600"><span class="font-bold text-gray-800">陈建国</span> 更新了族谱信息</p>
                    <span class="text-xs text-gray-400">10分钟前</span>
                  </div>
                </div>
                <div class="flex gap-3">
                  <div class="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-xs">🕯️</div>
                  <div>
                    <p class="text-sm text-gray-600"><span class="font-bold text-gray-800">陈晓玲</span> 在线祭拜了先祖</p>
                    <span class="text-xs text-gray-400">30分钟前</span>
                  </div>
                </div>
                <div class="flex gap-3">
                  <div class="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-xs">👶</div>
                  <div>
                    <p class="text-sm text-gray-600">家族迎来新成员 <span class="font-bold text-gray-800">陈子轩</span></p>
                    <span class="text-xs text-gray-400">2小时前</span>
                  </div>
                </div>
             </div>
           </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMemberStore } from '../stores/memberStore';
import { useAuthStore } from '../stores/authStore';
import { storeToRefs } from 'pinia';
import { exportGEDCOM, importGEDCOM } from '../utils/gedcom';

const memberStore = useMemberStore();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const livingCount = computed(() => memberStore.members.filter(m => m.isAlive).length);
const generationsCount = computed(() => {
  if (memberStore.members.length === 0) return 0;
  return Math.max(...memberStore.members.map(m => m.generation));
});

function handleLogout() {
  authStore.logout();
}

function handleImport(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const members = importGEDCOM(content);
        if (members.length > 0) {
          if (confirm(`解析到 ${members.length} 位成员，确定要覆盖当前数据吗？`)) {
             memberStore.setMembers(members);
             alert('导入成功！');
          }
        } else {
          alert('未能解析到成员数据。');
        }
      }
    };
    reader.readAsText(input.files[0]);
  }
}

function handleExport() {
  const content = exportGEDCOM(memberStore.members);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'genealogy.ged';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
</script>
