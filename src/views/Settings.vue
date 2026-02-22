<template>
  <div class="container mx-auto p-4 max-w-4xl">
    <h1 class="text-2xl font-bold mb-6 text-gray-800">系统设置</h1>
    
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <!-- 5.4.1 System Params -->
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900 mb-4">系统参数配置</h2>
        <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div class="sm:col-span-4">
            <label class="block text-sm font-medium text-gray-700">系统名称</label>
            <div class="mt-1">
              <input type="text" v-model="config.systemName" class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md">
            </div>
          </div>
          
          <div class="sm:col-span-6">
            <label class="block text-sm font-medium text-gray-700">系统描述</label>
            <div class="mt-1">
              <textarea v-model="config.description" rows="3" class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- 5.4.2 Privacy -->
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900 mb-4">隐私策略默认配置</h2>
        <div class="space-y-4">
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input id="public_living" type="checkbox" v-model="config.publicLiving" class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded">
            </div>
            <div class="ml-3 text-sm">
              <label for="public_living" class="font-medium text-gray-700">公开在世成员信息</label>
              <p class="text-gray-500">勾选后，访客可查看在世成员的基本信息（不含敏感隐私）。</p>
            </div>
          </div>
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input id="public_deceased" type="checkbox" v-model="config.publicDeceased" class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded">
            </div>
            <div class="ml-3 text-sm">
              <label for="public_deceased" class="font-medium text-gray-700">公开已故成员信息</label>
              <p class="text-gray-500">默认公开已故成员的生平、墓址等信息。</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 5.4.4 Worship -->
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900 mb-4">功能开关</h2>
        <div class="flex items-center justify-between py-2">
          <span class="flex-grow flex flex-col">
            <span class="text-sm font-medium text-gray-900">启用祭扫功能</span>
            <span class="text-sm text-gray-500">开启后，成员详情页将显示祭扫入口。</span>
          </span>
          <button 
            type="button" 
            @click="config.enableWorship = !config.enableWorship"
            :class="config.enableWorship ? 'bg-blue-600' : 'bg-gray-200'"
            class="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <span aria-hidden="true" :class="config.enableWorship ? 'translate-x-5' : 'translate-x-0'" class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"></span>
          </button>
        </div>
      </div>

      <!-- 5.4.6 Tree Style -->
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900 mb-4">世系表配置</h2>
        <div>
          <label class="block text-sm font-medium text-gray-700">默认排版模式</label>
          <select v-model="config.defaultTreeStyle" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
            <option value="tree">树状图 (D3)</option>
            <option value="european">欧式排版</option>
            <option value="su">苏式排版</option>
          </select>
        </div>
      </div>

      <!-- 5.4.3 Role Permissions -->
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900 mb-4">角色权限配置</h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700">允许普通成员编辑本人资料</span>
            <input type="checkbox" v-model="config.allowMemberEditSelf" class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded">
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700">允许访客查看详情</span>
            <input type="checkbox" v-model="config.allowGuestViewDetail" class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded">
          </div>
        </div>
      </div>

      <!-- 5.4.5 Map Service -->
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900 mb-4">地图服务配置</h2>
        <div class="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
          <div class="sm:col-span-6">
            <label class="block text-sm font-medium text-gray-700">地图 API Key</label>
            <input type="text" v-model="config.mapKey" class="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md" placeholder="例如: Mapbox / Gaode Key">
          </div>
          <div class="sm:col-span-3">
            <label class="block text-sm font-medium text-gray-700">默认中心经度</label>
            <input type="number" step="0.000001" v-model="config.defaultLng" class="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md">
          </div>
          <div class="sm:col-span-3">
            <label class="block text-sm font-medium text-gray-700">默认中心纬度</label>
            <input type="number" step="0.000001" v-model="config.defaultLat" class="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md">
          </div>
        </div>
      </div>

      <!-- 5.4.7 Portal Config -->
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900 mb-4">门户页面配置</h2>
        <div>
          <label class="block text-sm font-medium text-gray-700">首页公告内容</label>
          <textarea v-model="config.portalNotice" rows="2" class="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"></textarea>
        </div>
      </div>

      <!-- 5.4.8 Import Template -->
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900 mb-4">导入模板配置</h2>
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p class="text-sm text-gray-500 mb-2">配置批量导入时的字段映射规则和必填项检查。</p>
            <button class="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 touch-manipulation">
              <span>📄</span> 下载当前标准导入模板
            </button>
          </div>
          <button class="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-50 w-full sm:w-auto touch-manipulation">
            上传新模板定义
          </button>
        </div>
      </div>

      <!-- Advanced Management -->
      <div class="p-6 border-b border-gray-200 bg-gray-50">
        <h2 class="text-lg font-medium text-gray-900 mb-4">高级管理</h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
             <div>
               <h3 class="text-sm font-medium text-gray-900">支系管理 & 审核</h3>
               <p class="text-sm text-gray-500">管理各支系信息、联系人及数据审核。</p>
             </div>
             <router-link to="/branch" class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
               前往管理
             </router-link>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="px-4 py-3 bg-gray-50 text-right sm:px-6">
        <button @click="saveConfig" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          保存配置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const config = ref({
  systemName: '陈氏宗族数字化平台',
  description: '传承家族文化，连接过去与未来。',
  publicLiving: false,
  publicDeceased: true,
  enableWorship: true,
  defaultTreeStyle: 'tree',
  allowMemberEditSelf: false,
  allowGuestViewDetail: true,
  mapKey: '',
  defaultLng: 116.4074,
  defaultLat: 39.9042,
  portalNotice: '欢迎访问陈氏宗族数字化平台，请各位宗亲及时更新个人信息。'
});

function saveConfig() {
  // Mock save
  alert('配置已保存');
  // In real app, verify permissions and call API
}
</script>
