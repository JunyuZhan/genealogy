<script setup lang="ts">
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm p-4">
      <div class="container mx-auto flex gap-4">
        <router-link to="/" class="font-bold text-gray-800">首页</router-link>
        <router-link to="/tree" class="text-gray-600 hover:text-gray-900">族谱树</router-link>
      </div>
    </nav>
    <main>
      <router-view />
    </main>
  </div>
</template>

<style scoped>
</style>
