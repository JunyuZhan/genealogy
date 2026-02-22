<template>
  <div class="container mx-auto p-4 max-w-4xl">
    <div class="text-center mb-12">
      <h1 class="text-3xl font-bold text-gray-800 mb-4">随喜捐赠</h1>
      <p class="text-gray-600 max-w-2xl mx-auto">
        积善之家，必有余庆。您的每一份捐赠，都将用于宗族事业的发展，<br/>
        包括网站运营、宗祠修缮、奖学助教、扶贫济困等。
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
      <!-- Payment Methods -->
      <div class="bg-white p-8 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center">
        <h2 class="text-xl font-bold text-gray-800 mb-6">扫码捐赠</h2>
        <div class="flex gap-8 mb-6">
          <div class="text-center">
            <div class="w-32 h-32 bg-green-500 rounded-lg flex items-center justify-center text-white mb-2 shadow-inner">
              (微信二维码)
            </div>
            <span class="text-sm text-gray-500">微信支付</span>
          </div>
          <div class="text-center">
            <div class="w-32 h-32 bg-blue-500 rounded-lg flex items-center justify-center text-white mb-2 shadow-inner">
              (支付宝二维码)
            </div>
            <span class="text-sm text-gray-500">支付宝</span>
          </div>
        </div>
        <p class="text-xs text-gray-400">
          * 请在转账备注中注明您的姓名和联系方式，以便我们登记公示。
        </p>
      </div>

      <!-- Donation Form (Mock) -->
      <div class="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <h2 class="text-xl font-bold text-gray-800 mb-6">捐赠登记</h2>
        <form @submit.prevent="submitDonation" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">捐赠人姓名</label>
            <input type="text" v-model="form.name" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm px-3 py-2 border">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">捐赠金额 (元)</label>
            <input type="number" v-model="form.amount" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm px-3 py-2 border">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">捐赠意愿</label>
            <select v-model="form.purpose" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm px-3 py-2 border">
              <option value="general">网站运营 (不限用途)</option>
              <option value="temple">宗祠修缮</option>
              <option value="scholarship">奖学助教</option>
              <option value="charity">扶贫济困</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">寄语 (选填)</label>
            <textarea v-model="form.message" rows="2" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm px-3 py-2 border"></textarea>
          </div>
          <button type="submit" class="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded transition-colors shadow">
            提交登记
          </button>
        </form>
      </div>
    </div>

    <!-- Honor Roll -->
    <div class="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
      <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-amber-50">
        <h2 class="text-xl font-bold text-amber-900">功德榜</h2>
        <span class="text-sm text-amber-700">感谢每一位宗亲的慷慨解囊</span>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">捐赠人</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金额</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用途</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(record, idx) in honorRoll" :key="idx" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ record.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-amber-600 font-bold">¥{{ record.amount }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span class="px-2 py-1 bg-gray-100 rounded text-xs">{{ record.purpose }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ record.date }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../services/api';

const form = ref({
  name: '',
  amount: '',
  purpose: 'general',
  message: ''
});

const honorRoll = ref<any[]>([]);
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  try {
    const data = await api.getDonations();
    honorRoll.value = data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});

function submitDonation() {
  if (!form.value.name || !form.value.amount) return;
  
  // Mock submission
  alert(`感谢 ${form.value.name} 宗亲捐赠 ${form.value.amount} 元！\n我们将尽快核实并公示。`);
  
  honorRoll.value.unshift({
    name: form.value.name,
    amount: Number(form.value.amount),
    purpose: getPurposeLabel(form.value.purpose),
    date: new Date().toLocaleDateString()
  });
  
  form.value = { name: '', amount: '', purpose: 'general', message: '' };
}

function getPurposeLabel(key: string) {
  const map: Record<string, string> = {
    general: '网站运营',
    temple: '宗祠修缮',
    scholarship: '奖学助教',
    charity: '扶贫济困'
  };
  return map[key] || '其他';
}
</script>
