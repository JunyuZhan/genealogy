<template>
  <footer class="bg-gray-900 text-gray-400 py-12 mt-auto">
    <div class="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-center md:text-left">
      <div>
        <h4 class="text-white font-bold text-lg mb-4 flex items-center justify-center md:justify-start gap-2">
          <span>{{ configStore.systemLogo || '📜' }}</span> {{ configStore.systemName }}
        </h4>
        <p class="text-sm leading-relaxed mb-4">
          {{ configStore.systemDescription }}
        </p>
      </div>
      <div>
        <h4 class="text-white font-bold mb-4">快速链接</h4>
        <ul class="space-y-2 text-sm">
          <li><router-link to="/tree" class="hover:text-white transition-colors">族谱浏览</router-link></li>
          <li v-if="configStore.isMemorialEnabled"><router-link to="/worship" class="hover:text-white transition-colors">祭扫纪念</router-link></li>
          <li><router-link to="/news" class="hover:text-white transition-colors">家族动态</router-link></li>
          <li><router-link to="/mutual-aid" class="hover:text-white transition-colors">宗族互助</router-link></li>
        </ul>
      </div>
      <div>
        <h4 class="text-white font-bold mb-4">联系方式</h4>
        <ul class="space-y-2 text-sm">
          <li>📍 地址：{{ configStore.contactAddress }}</li>
          <li>📧 邮箱：{{ configStore.contactEmail }}</li>
          <li>📞 电话：{{ configStore.contactPhone }}</li>
        </ul>
      </div>
      <div>
        <h4 class="text-white font-bold mb-4">管理入口</h4>
        <router-link to="/login" class="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg text-sm transition-colors inline-block border border-gray-700">
          管理后台登录
        </router-link>
      </div>
    </div>
    <div class="border-t border-gray-800 pt-8 text-center text-xs text-gray-500">
      <div class="flex flex-col md:flex-row justify-center items-center gap-2">
        <p>&copy; {{ new Date().getFullYear() }} {{ configStore.systemName }}. All rights reserved.</p>
        <span class="hidden md:inline">|</span>
        <router-link to="/privacy" class="hover:text-gray-300 transition-colors">隐私政策</router-link>
        <span class="hidden md:inline">|</span>
        <a href="#" class="hover:text-gray-300 transition-colors">使用条款</a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useConfigStore } from '../../stores/configStore';
const configStore = useConfigStore();
</script>
