<template>
  <div class="min-h-screen bg-stone-50 p-6">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-serif font-bold text-stone-800 mb-2">在线祭拜</h1>
        <p class="text-stone-600">慎终追远，民德归厚</p>
      </div>

      <!-- Ancestor Selection -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div v-for="ancestor in ancestors" :key="ancestor.id" 
             class="bg-white rounded-lg shadow-md overflow-hidden border border-stone-200 hover:shadow-lg transition-shadow cursor-pointer"
             @click="selectAncestor(ancestor)">
          <div class="h-48 bg-stone-200 relative">
            <!-- Placeholder for portrait -->
            <div class="absolute inset-0 flex items-center justify-center text-stone-400">
              <span class="text-6xl">👤</span>
            </div>
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <h3 class="text-white text-xl font-bold">{{ ancestor.name }}</h3>
              <p class="text-white/80 text-sm">{{ ancestor.generation }}世祖</p>
            </div>
          </div>
          <div class="p-4">
            <p class="text-stone-600 text-sm mb-2">生卒: {{ ancestor.birthDate }} - {{ ancestor.deathDate }}</p>
            <p class="text-stone-500 text-xs line-clamp-2">{{ ancestor.description }}</p>
          </div>
        </div>
      </div>

      <!-- Worship Area (Modal or Inline) -->
      <div v-if="selectedAncestor" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative mx-4 sm:mx-auto">
          <button @click="selectedAncestor = null" class="absolute top-4 right-4 text-stone-400 hover:text-stone-600 z-10 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div class="p-6 sm:p-8 text-center">
            <h2 class="text-2xl font-serif font-bold text-stone-800 mb-1">祭拜 {{ selectedAncestor.name }}</h2>
            <p class="text-stone-500 mb-8">{{ selectedAncestor.generation }}世祖</p>
            
            <div class="bg-stone-100 rounded-lg p-8 mb-8 relative min-h-[200px] flex items-center justify-center overflow-hidden">
              <div class="text-8xl text-stone-300">🪦</div>
              
              <!-- Offerings Display -->
              <div class="absolute bottom-4 flex gap-4 flex-wrap justify-center w-full px-4">
                <div v-for="(count, type) in currentOfferings" :key="type" v-show="count > 0" 
                     class="flex flex-col items-center animate-bounce">
                  <span class="text-2xl">{{ getOfferingIcon(type) }}</span>
                  <span class="text-xs font-bold text-stone-600">x{{ count }}</span>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <button v-for="item in offeringTypes" :key="item.type"
                      @click="offer(item.type)"
                      class="flex flex-col items-center p-3 rounded-lg hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-200 active:bg-stone-100 touch-manipulation">
                <span class="text-3xl mb-2">{{ item.icon }}</span>
                <span class="text-sm font-medium text-stone-700">{{ item.label }}</span>
              </button>
            </div>

            <div class="border-t border-stone-100 pt-6">
              <h3 class="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">最近祭拜</h3>
              <ul class="text-left space-y-2">
                <li v-for="(record, idx) in worshipRecords" :key="idx" class="text-sm text-stone-600 flex justify-between">
                  <span>{{ record.user }} 献上了 {{ record.offering }}</span>
                  <span class="text-stone-400">{{ record.time }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { api } from '../services/api'

interface Ancestor {
  id: string
  name: string
  generation: number
  birthDate: string
  deathDate: string
  description: string
}

interface OfferingType {
  type: string
  label: string
  icon: string
}

const ancestors = ref<Ancestor[]>([])
const loading = ref(false)
const worshipRecords = ref<any[]>([])

onMounted(async () => {
  loading.value = true
  try {
    const [ancestorsData, recordsData] = await Promise.all([
      api.getAncestors(),
      api.getWorshipRecords()
    ])
    ancestors.value = ancestorsData
    worshipRecords.value = recordsData
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

const selectedAncestor = ref<Ancestor | null>(null)

const offeringTypes: OfferingType[] = [
  { type: 'incense', label: '上香', icon: '🕯️' },
  { type: 'flower', label: '献花', icon: '💐' },
  { type: 'wine', label: '敬酒', icon: '🍶' },
  { type: 'fruit', label: '供果', icon: '🍎' }
]

const currentOfferings = reactive<Record<string, number>>({
  incense: 0,
  flower: 0,
  wine: 0,
  fruit: 0
})

function selectAncestor(ancestor: Ancestor) {
  selectedAncestor.value = ancestor
  // Reset offerings for new selection
  Object.keys(currentOfferings).forEach(key => currentOfferings[key] = 0)
}

function getOfferingIcon(type: string) {
  return offeringTypes.find(t => t.type === type)?.icon || '🎁'
}

function offer(type: string) {
  if (currentOfferings[type] !== undefined) {
    currentOfferings[type]++
  }
  const item = offeringTypes.find(t => t.type === type)
  if (item) {
    worshipRecords.value.unshift({
      user: '我',
      offering: item.label,
      time: '刚刚'
    })
  }
}
</script>
