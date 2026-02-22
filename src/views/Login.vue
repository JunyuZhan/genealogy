<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        登录宗族平台
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        传承家族文化，连接过去与未来
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form class="space-y-6" @submit.prevent="handleLogin">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">
              用户名
            </label>
            <div class="mt-1">
              <input 
                id="username" 
                v-model="username"
                name="username" 
                type="text" 
                required 
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              密码
            </label>
            <div class="mt-1">
              <input 
                id="password" 
                v-model="password"
                name="password" 
                type="password" 
                required 
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
              />
            </div>
          </div>

          <div v-if="errorMsg" class="text-red-500 text-sm">
            {{ errorMsg }}
          </div>

          <div>
            <button 
              type="submit" 
              :disabled="loading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {{ loading ? '登录中...' : '登录' }}
            </button>
          </div>
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">
                还没有账号？
              </span>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-1 gap-3">
             <router-link to="/register" class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
               注册新账号
             </router-link>
          </div>
          
          <div class="mt-4 text-center text-xs text-gray-400">
            演示账号: admin/admin 或 user/user
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const username = ref('');
const password = ref('');
const loading = ref(false);
const errorMsg = ref('');
const router = useRouter();
const authStore = useAuthStore();

async function handleLogin() {
  loading.value = true;
  errorMsg.value = '';
  
  try {
    const success = await authStore.login(username.value, password.value);
    if (success) {
      router.push('/');
    } else {
      errorMsg.value = '用户名或密码错误';
    }
  } catch (err) {
    errorMsg.value = '登录失败，请稍后重试';
  } finally {
    loading.value = false;
  }
}
</script>
