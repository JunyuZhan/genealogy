<template>
  <div class="container mx-auto p-4 max-w-5xl">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <h1 class="text-3xl font-bold text-gray-800">家族动态</h1>
      <div class="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
        <button class="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm whitespace-nowrap touch-manipulation">全部</button>
        <button class="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm whitespace-nowrap touch-manipulation">公告</button>
        <button class="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm whitespace-nowrap touch-manipulation">新闻</button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Main Feed -->
      <div class="md:col-span-2 space-y-6">
        <article v-for="item in mainNews" :key="item.id" class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
          <div class="p-6">
            <div class="flex items-center gap-2 mb-3">
              <span 
                class="px-2 py-0.5 text-xs font-medium rounded"
                :class="item.type === 'notice' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'"
              >
                {{ item.type === 'notice' ? '公告' : '新闻' }}
              </span>
              <span class="text-gray-400 text-sm">{{ item.date }}</span>
            </div>
            <h2 class="text-xl font-bold text-gray-900 mb-2 hover:text-amber-700 cursor-pointer">{{ item.title }}</h2>
            <p class="text-gray-600 mb-4 line-clamp-3">{{ item.summary }}</p>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500">发布人：{{ item.author }}</span>
              <button class="text-blue-600 hover:text-blue-800 text-sm font-medium">阅读全文 →</button>
            </div>
          </div>
        </article>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Pinned -->
        <div class="bg-amber-50 rounded-lg p-6 border border-amber-100">
          <h3 class="font-bold text-amber-900 mb-4 flex items-center gap-2">
            <span>📌</span> 重要置顶
          </h3>
          <ul class="space-y-3">
            <li v-for="item in pinned" :key="item.id" class="text-sm">
              <a href="#" class="text-amber-800 hover:underline block mb-1 font-medium">{{ item.title }}</a>
              <span class="text-amber-800/80 text-xs">{{ item.date }}</span>
            </li>
          </ul>
        </div>

        <!-- Tags -->
        <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 class="font-bold text-gray-800 mb-4">热门标签</h3>
          <div class="flex flex-wrap gap-2">
            <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-gray-200 cursor-pointer">祭祖大典</span>
            <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-gray-200 cursor-pointer">修缮工程</span>
            <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-gray-200 cursor-pointer">奖学金</span>
            <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-gray-200 cursor-pointer">族谱修订</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { api } from '../services/api';

const news = ref<any[]>([]);
const loading = ref(false);

const pinned = computed(() => news.value.filter(item => item.isPinned));
const mainNews = computed(() => news.value.filter(item => !item.isPinned));

onMounted(async () => {
  loading.value = true;
  try {
    const data = await api.getNews();
    news.value = data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});
</script>
