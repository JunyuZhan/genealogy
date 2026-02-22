<template>
  <div class="min-h-screen bg-amber-50 p-6">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-10">
        <h1 class="text-4xl font-serif font-bold text-amber-900 mb-4">宗族互助</h1>
        <p class="text-amber-800 text-lg">守望相助，患难与共</p>
      </div>

      <!-- Action Bar -->
      <div class="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div class="flex flex-wrap gap-2 md:gap-4 justify-center">
          <button @click="filter = 'all'" :class="filter === 'all' ? 'bg-amber-600 text-white' : 'bg-white text-amber-900'" class="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base rounded-full shadow-sm hover:shadow-md transition-all">全部</button>
          <button @click="filter = 'education'" :class="filter === 'education' ? 'bg-amber-600 text-white' : 'bg-white text-amber-900'" class="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base rounded-full shadow-sm hover:shadow-md transition-all">助学</button>
          <button @click="filter = 'medical'" :class="filter === 'medical' ? 'bg-amber-600 text-white' : 'bg-white text-amber-900'" class="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base rounded-full shadow-sm hover:shadow-md transition-all">医疗</button>
          <button @click="filter = 'emergency'" :class="filter === 'emergency' ? 'bg-amber-600 text-white' : 'bg-white text-amber-900'" class="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base rounded-full shadow-sm hover:shadow-md transition-all">急难</button>
        </div>
        <button @click="showCreateModal = true" class="bg-amber-900 text-white px-6 py-2 rounded-lg hover:bg-amber-800 transition-colors flex items-center gap-2 text-sm md:text-base w-full md:w-auto justify-center">
          <span>+</span> 发起倡议
        </button>
      </div>

      <!-- Initiatives Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="item in filteredInitiatives" :key="item.id" class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-amber-100">
          <div class="p-6">
            <div class="flex justify-between items-start mb-4">
              <div>
                <span :class="getTypeClass(item.type)" class="text-xs font-bold px-2 py-1 rounded uppercase tracking-wide mb-2 inline-block">
                  {{ getTypeLabel(item.type) }}
                </span>
                <h3 class="text-xl font-bold text-gray-900">{{ item.title }}</h3>
              </div>
              <span class="text-sm text-gray-500">{{ item.date }}</span>
            </div>
            
            <p class="text-gray-600 mb-6 line-clamp-3">{{ item.description }}</p>
            
            <!-- Progress Bar -->
            <div class="mb-2 flex justify-between text-sm font-medium">
              <span class="text-amber-700">已筹: ¥{{ item.raised.toLocaleString() }}</span>
              <span class="text-gray-400">目标: ¥{{ item.goal.toLocaleString() }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5 mb-6">
              <div class="bg-amber-600 h-2.5 rounded-full transition-all duration-1000" :style="{ width: getProgress(item) + '%' }"></div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex -space-x-2">
                <div v-for="(donor, i) in item.recentDonors" :key="i" class="w-8 h-8 rounded-full bg-amber-200 border-2 border-white flex items-center justify-center text-xs font-bold text-amber-800" :title="donor">
                  {{ donor.charAt(0) }}
                </div>
                <div v-if="item.donorCount > 3" class="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-500">
                  +{{ item.donorCount - 3 }}
                </div>
              </div>
              <button class="text-amber-700 font-bold hover:underline">查看详情 &rarr;</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Modal -->
      <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl w-full max-w-lg p-6 sm:p-8 relative mx-4">
          <button @click="showCreateModal = false" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 class="text-2xl font-bold mb-6 text-gray-800">发起互助倡议</h2>
          
          <form @submit.prevent="submitInitiative" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">倡议标题</label>
              <input v-model="form.title" type="text" class="w-full border-gray-300 rounded-lg shadow-sm focus:border-amber-500 focus:ring-amber-500 py-2.5" required placeholder="请输入标题">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">类型</label>
              <select v-model="form.type" class="w-full border-gray-300 rounded-lg shadow-sm focus:border-amber-500 focus:ring-amber-500 py-2.5">
                <option value="education">奖学助学</option>
                <option value="medical">医疗救助</option>
                <option value="emergency">急难救助</option>
                <option value="other">其他</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">目标金额 (元)</label>
              <input v-model="form.goal" type="number" class="w-full border-gray-300 rounded-lg shadow-sm focus:border-amber-500 focus:ring-amber-500 py-2.5" required placeholder="0.00">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">详细说明</label>
              <textarea v-model="form.description" rows="4" class="w-full border-gray-300 rounded-lg shadow-sm focus:border-amber-500 focus:ring-amber-500 py-2" required placeholder="请详细描述情况..."></textarea>
            </div>

            <button type="submit" class="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 font-bold shadow-md transition-transform active:scale-95 touch-manipulation">
              提交申请
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { api } from '../services/api'

interface Initiative {
  id: string
  title: string
  type: 'education' | 'medical' | 'emergency' | 'other'
  description: string
  goal: number
  raised: number
  date: string
  recentDonors: string[]
  donorCount: number
}

const filter = ref('all')
const showCreateModal = ref(false)
const initiatives = ref<Initiative[]>([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    initiatives.value = await api.getMutualAid()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

const form = reactive({
  title: '',
  type: 'education',
  goal: '',
  description: ''
})

const filteredInitiatives = computed(() => {
  if (filter.value === 'all') return initiatives.value
  return initiatives.value.filter(i => i.type === filter.value)
})

function getTypeLabel(type: string) {
  const map: Record<string, string> = {
    education: '奖学助学',
    medical: '医疗救助',
    emergency: '急难救助',
    other: '其他'
  }
  return map[type] || '其他'
}

function getTypeClass(type: string) {
  const map: Record<string, string> = {
    education: 'bg-blue-100 text-blue-800',
    medical: 'bg-red-100 text-red-800',
    emergency: 'bg-orange-100 text-orange-800',
    other: 'bg-gray-100 text-gray-800'
  }
  return map[type] || 'bg-gray-100 text-gray-800'
}

function getProgress(item: Initiative) {
  return Math.min(100, Math.round((item.raised / item.goal) * 100))
}

function submitInitiative() {
  initiatives.value.unshift({
    id: Date.now().toString(),
    title: form.title,
    type: form.type as any,
    description: form.description,
    goal: Number(form.goal),
    raised: 0,
    date: new Date().toLocaleDateString(),
    recentDonors: [],
    donorCount: 0
  })
  showCreateModal.value = false
  // Reset form
  form.title = ''
  form.goal = ''
  form.description = ''
  alert('倡议已提交，等待管理员审核。')
}
</script>
