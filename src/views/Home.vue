<template>
  <div class="container mx-auto p-4 flex flex-col items-center justify-center h-screen bg-gray-50">
    <h1 class="text-4xl font-bold mb-4 text-gray-800">宗族数字化平台</h1>
    <p class="text-gray-600 mb-8">传承家族文化，连接过去与未来。</p>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
      <div class="bg-white p-6 rounded shadow hover:shadow-lg transition-shadow border">
        <h2 class="text-xl font-bold mb-2 flex items-center gap-2"><span>📖</span> 浏览族谱</h2>
        <p class="text-gray-500 mb-4">查看家族世系树，了解先人历史。</p>
        <router-link to="/tree" class="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
          进入族谱
        </router-link>
      </div>

      <div class="bg-white p-6 rounded shadow hover:shadow-lg transition-shadow border">
        <h2 class="text-xl font-bold mb-2 flex items-center gap-2"><span>💾</span> 数据管理</h2>
        <p class="text-gray-500 mb-4">导入或导出 GEDCOM 格式数据。</p>
        <div class="flex gap-2">
          <label class="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-center cursor-pointer transition-colors">
            导入 GEDCOM
            <input type="file" accept=".ged" class="hidden" @change="handleImport" />
          </label>
          <button @click="handleExport" class="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded transition-colors">
            导出 GEDCOM
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMemberStore } from '../stores/memberStore';
import { exportGEDCOM, importGEDCOM } from '../utils/gedcom';

const memberStore = useMemberStore();

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
