<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import Footer from './components/common/Footer.vue';
import { useMemberStore } from './stores/memberStore';
import { useConfigStore } from './stores/configStore';

const isMobileMenuOpen = ref(false);
const route = useRoute();
const memberStore = useMemberStore();
const configStore = useConfigStore();

watch(route, () => {
  isMobileMenuOpen.value = false;
});

onMounted(async () => {
  await configStore.fetchConfig();
  memberStore.fetchMembers();
  document.title = configStore.systemName;
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <nav class="bg-white shadow-sm sticky top-0 z-50">
      <div class="container mx-auto px-4 h-16 flex items-center justify-between">
        <!-- Logo -->
        <router-link to="/" class="font-bold text-xl text-gray-800 flex items-center gap-2">
          <span>{{ configStore.systemLogo || '📜' }}</span> <span class="hidden sm:inline">{{ configStore.systemName }}</span>
        </router-link>

        <!-- Desktop Menu -->
        <div class="hidden md:flex gap-6 text-sm font-medium">
          <router-link to="/tree" class="text-gray-600 hover:text-gray-900 transition-colors">族谱树</router-link>
          <router-link to="/book" class="text-gray-600 hover:text-gray-900 transition-colors">谱书预览</router-link>
          <router-link v-if="configStore.isMemorialEnabled" to="/worship" class="text-gray-600 hover:text-gray-900 transition-colors">在线祭拜</router-link>
          <router-link to="/mutual-aid" class="text-gray-600 hover:text-gray-900 transition-colors">宗族互助</router-link>
          <router-link to="/news" class="text-gray-600 hover:text-gray-900 transition-colors">家族动态</router-link>
          <router-link v-if="configStore.isDonationEnabled" to="/donation" class="text-gray-600 hover:text-gray-900 transition-colors">捐赠公示</router-link>
        </div>

        <!-- Desktop Actions -->
        <div class="hidden md:flex gap-4 items-center">
          <router-link to="/settings" class="text-gray-500 hover:text-gray-700 transition-colors" title="设置">
            <span class="sr-only">设置</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </router-link>
          <router-link to="/privacy" class="text-gray-500 hover:text-gray-700 transition-colors" title="隐私">
            <span class="sr-only">隐私</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </router-link>
        </div>

        <!-- Mobile Menu Button -->
        <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <svg v-if="!isMobileMenuOpen" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Mobile Menu Dropdown -->
      <div v-show="isMobileMenuOpen" class="md:hidden border-t border-gray-100 bg-white absolute w-full shadow-lg">
        <div class="px-4 py-3 space-y-3">
          <router-link @click="isMobileMenuOpen = false" to="/tree" class="block text-gray-700 font-medium py-2 hover:text-blue-600">🌳 族谱树</router-link>
          <router-link @click="isMobileMenuOpen = false" to="/book" class="block text-gray-700 font-medium py-2 hover:text-blue-600">📖 谱书预览</router-link>
          <router-link v-if="configStore.isMemorialEnabled" @click="isMobileMenuOpen = false" to="/worship" class="block text-gray-700 font-medium py-2 hover:text-blue-600">🙏 在线祭拜</router-link>
          <router-link @click="isMobileMenuOpen = false" to="/mutual-aid" class="block text-gray-700 font-medium py-2 hover:text-blue-600">🤝 宗族互助</router-link>
          <router-link @click="isMobileMenuOpen = false" to="/news" class="block text-gray-700 font-medium py-2 hover:text-blue-600">📢 家族动态</router-link>
          <router-link v-if="configStore.isDonationEnabled" @click="isMobileMenuOpen = false" to="/donation" class="block text-gray-700 font-medium py-2 hover:text-blue-600">💰 捐赠公示</router-link>
          <div class="border-t border-gray-100 pt-3 flex gap-4">
            <router-link @click="isMobileMenuOpen = false" to="/settings" class="flex-1 text-center py-2 bg-gray-50 rounded text-gray-600 text-sm">⚙️ 设置</router-link>
            <router-link @click="isMobileMenuOpen = false" to="/privacy" class="flex-1 text-center py-2 bg-gray-50 rounded text-gray-600 text-sm">🔒 隐私</router-link>
          </div>
        </div>
      </div>
    </nav>
    <main class="flex-grow">
      <router-view />
    </main>
    <Footer v-if="!route.meta.hideFooter" />
  </div>
</template>

<style scoped>
</style>
