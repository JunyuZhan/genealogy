<template>
  <div class="container mx-auto p-4 h-screen flex flex-col">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 no-print">
      <h1 class="text-2xl font-bold">世系表 (谱书模式)</h1>
      <div class="flex flex-wrap justify-center gap-4 w-full md:w-auto">
        <button @click="printBook" class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded shadow text-sm flex items-center gap-1 transition-colors touch-manipulation">
          <span>🖨️</span> 打印/导出PDF
        </button>
        <!-- Style Toggles -->
        <div class="flex bg-gray-100 p-1 rounded shadow-inner">
          <button 
            @click="style = 'european'"
            :class="{'bg-white shadow text-blue-600 font-bold': style === 'european', 'text-gray-500 hover:text-gray-700': style !== 'european'}"
            class="px-4 py-2 rounded transition-all text-sm touch-manipulation"
          >
            欧式排版
          </button>
          <button 
            @click="style = 'su'"
            :class="{'bg-white shadow text-blue-600 font-bold': style === 'su', 'text-gray-500 hover:text-gray-700': style !== 'su'}"
            class="px-4 py-2 rounded transition-all text-sm touch-manipulation"
          >
            苏式排版
          </button>
        </div>
        <router-link to="/tree" class="text-blue-500 hover:underline flex items-center px-2 py-2 touch-manipulation">返回族谱树</router-link>
      </div>
    </div>

    <div class="flex-1 bg-white shadow-lg rounded overflow-hidden flex flex-col border border-gray-200">
      <!-- Toolbar -->
      <div class="p-2 border-b flex flex-col sm:flex-row gap-4 items-center bg-gray-50 px-4 no-print">
        <button 
          @click="showIndex = !showIndex" 
          :class="{'bg-blue-100 text-blue-700 border-blue-300': showIndex, 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100': !showIndex}"
          class="px-3 py-2 rounded flex items-center gap-2 text-sm border transition-colors shadow-sm w-full sm:w-auto justify-center touch-manipulation"
        >
          <span>📑</span> 
          <span>字辈索引</span>
        </button>
        
        <div class="hidden sm:block h-6 w-px bg-gray-300 mx-2"></div>

        <div class="flex gap-4 w-full sm:w-auto justify-center">
          <label class="flex items-center gap-2 text-sm cursor-pointer select-none text-gray-700 hover:text-gray-900 touch-manipulation p-2">
            <input type="checkbox" v-model="showSpouses" class="rounded text-blue-600 focus:ring-blue-500 w-5 h-5" />
            显示配偶
          </label>
          <label class="flex items-center gap-2 text-sm cursor-pointer select-none text-gray-700 hover:text-gray-900 touch-manipulation p-2">
            <input type="checkbox" v-model="showBio" class="rounded text-blue-600 focus:ring-blue-500 w-5 h-5" />
            显示生平
          </label>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-auto p-8 bg-paper relative scroll-smooth">
        <Transition name="slide-fade">
          <GenerationIndex 
            v-if="showIndex"
            :members="members"
            @close="showIndex = false"
            @select="onSelectMember"
            class="shadow-2xl border-r border-gray-200"
          />
        </Transition>
        
        <component 
          :is="style === 'european' ? EuropeanStyle : SuStyle" 
          :members="members" 
          :root-id="rootId" 
          :show-spouses="showSpouses" 
          :show-bio="showBio" 
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMemberStore } from '../stores/memberStore';
import { storeToRefs } from 'pinia';
import EuropeanStyle from '../components/book/EuropeanStyle.vue';
import SuStyle from '../components/book/SuStyle.vue';
import GenerationIndex from '../components/book/GenerationIndex.vue';

const memberStore = useMemberStore();
const { members } = storeToRefs(memberStore);
const rootId = ref<string>('');

const style = ref<'european' | 'su'>('european');
const showSpouses = ref(true);
const showBio = ref(false);
const showIndex = ref(false);

onMounted(() => {
  const root = members.value.find(m => m.generation === 1);
  if (root) rootId.value = root.id;
});

function onSelectMember(memberId: string) {
  const el = document.getElementById('member-' + memberId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Highlight effect
    el.classList.add('ring-4', 'ring-yellow-400', 'ring-opacity-50');
    setTimeout(() => {
      el.classList.remove('ring-4', 'ring-yellow-400', 'ring-opacity-50');
    }, 2000);
  }
}

function printBook() {
  window.print();
}
</script>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }
  .container {
    height: auto !important;
    overflow: visible !important;
  }
  .flex-1 {
    overflow: visible !important;
    height: auto !important;
  }
  .shadow-lg {
    box-shadow: none !important;
  }
  .border {
    border: none !important;
  }
}

.bg-paper {
  background-color: #fdfbf7;
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d6d3ce' fill-opacity='0.1'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' /%3E%3C/g%3E%3C/svg%3E");
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>
