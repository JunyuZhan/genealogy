<template>
  <div v-if="isVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm">
    <div class="relative w-full h-full max-w-5xl max-h-[90vh] bg-stone-100 rounded-lg shadow-2xl overflow-hidden flex flex-col border-4 border-stone-800">
      <!-- Header -->
      <div class="flex justify-between items-center p-4 bg-stone-900 text-amber-100 border-b-2 border-amber-700">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🙏</span>
          <h2 class="text-xl font-serif font-bold tracking-[0.2em]">在线祭扫 · {{ memberName }}</h2>
        </div>
        <div class="flex items-center gap-4">
          <button @click="subscribe" class="text-amber-200 hover:text-white text-sm flex items-center gap-1 border border-amber-800 bg-stone-800 px-2 py-1 rounded hover:bg-stone-700 transition-colors">
            <span>🔔</span> 订阅提醒
          </button>
          <button @click="$emit('close')" class="text-stone-400 hover:text-white text-2xl font-bold px-2">&times;</button>
        </div>
      </div>

      <!-- Main Content (Virtual Scene) -->
      <div class="flex-1 relative bg-stone-800 flex flex-col items-center justify-center p-8 overflow-hidden">
        
        <!-- Online Status & Log Button -->
        <div class="absolute top-4 right-4 z-40 flex flex-col gap-2 items-end">
           <div class="bg-black/40 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1 backdrop-blur-sm">
             <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
             <span>{{ onlineCount }} 人正在祭扫</span>
           </div>
           <button @click="showLog = !showLog" class="bg-white/90 text-stone-800 px-3 py-1 rounded shadow text-xs hover:bg-white transition-colors">
             📜 祭扫记录
           </button>
        </div>

        <!-- Log Sidebar -->
        <div v-if="showLog" class="absolute top-0 right-0 bottom-0 w-64 bg-stone-900/95 backdrop-blur-md text-stone-300 p-4 z-50 border-l border-stone-700 overflow-y-auto animate-slide-left">
           <div class="flex justify-between items-center mb-4 border-b border-stone-700 pb-2">
             <h3 class="font-bold text-amber-500">祭扫记录</h3>
             <button @click="showLog = false" class="text-stone-500 hover:text-white">&times;</button>
           </div>
           <div class="space-y-3 text-sm">
             <div v-for="(log, idx) in logs" :key="idx" class="flex gap-2 border-b border-stone-800 pb-2 last:border-0">
               <span class="text-stone-500 text-xs whitespace-nowrap font-mono mt-0.5">{{ log.time }}</span>
               <div>
                 <span class="text-amber-200 font-medium">{{ log.user }}</span> 
                 <span class="text-stone-400 ml-1">{{ log.action }}</span>
               </div>
             </div>
           </div>
        </div>

        <!-- Background Pattern -->
        <div class="absolute inset-0 opacity-20 pointer-events-none" 
             style="background-image: radial-gradient(#fbbf24 1px, transparent 1px); background-size: 30px 30px;">
        </div>

        <!-- Altar Table -->
        <div class="relative z-10 flex flex-col items-center w-full max-w-2xl">
          
          <!-- Portrait Frame -->
          <div class="w-48 h-64 bg-stone-300 border-[12px] border-amber-900 shadow-2xl mb-8 flex items-center justify-center relative overflow-hidden rounded-sm bg-gradient-to-b from-stone-200 to-stone-400">
             <img v-if="portraitUrl" :src="portraitUrl" class="w-full h-full object-cover grayscale opacity-90" />
             <div v-else class="text-center p-4">
               <div class="text-6xl text-stone-500 mb-2">👤</div>
               <span class="text-stone-600 font-serif font-bold">{{ memberName }}</span>
             </div>
             <!-- Black Ribbon for mourning -->
             <div class="absolute top-0 left-0 w-12 h-12 bg-black -translate-x-6 -translate-y-6 rotate-45 transform"></div>
             <div class="absolute top-0 right-0 w-12 h-12 bg-black translate-x-6 -translate-y-6 rotate-45 transform"></div>
          </div>

          <!-- Memorial Tablet (牌位) -->
          <div class="w-40 h-56 bg-gradient-to-b from-red-900 to-red-950 border-4 border-yellow-600 shadow-2xl rounded-t-full flex items-center justify-center mb-16 relative">
             <div class="absolute inset-2 border border-yellow-600/30 rounded-t-full"></div>
             <div class="writing-vertical text-yellow-100 font-serif text-2xl tracking-[0.3em] py-6 font-bold drop-shadow-md">
               先考 {{ memberName }} 之神位
             </div>
          </div>

          <!-- Offerings Table Surface -->
          <div class="w-[120%] h-32 bg-[#3d2b1f] absolute bottom-0 transform translate-y-1/2 rounded-[50%] shadow-2xl border-t-4 border-[#5d4037]"></div>

          <!-- Offerings Display Area -->
          <div class="absolute bottom-10 left-0 right-0 flex justify-center items-end gap-24 h-40 px-10 pointer-events-none z-20">
             <!-- Left Candle -->
             <div v-if="showCandle" class="candle-container relative w-6 h-32 transition-all duration-1000">
               <div class="flame absolute -top-4 left-1/2 -translate-x-1/2 animate-flicker text-2xl filter drop-shadow-[0_0_10px_rgba(255,165,0,0.8)]">🔥</div>
               <div class="candle bg-gradient-to-b from-red-500 to-red-700 w-full h-full rounded-sm shadow-lg"></div>
               <div class="absolute bottom-0 w-10 h-2 bg-stone-800 -left-2 rounded-full opacity-50"></div>
             </div>

             <!-- Incense Burner -->
             <div class="incense-container relative w-32 h-24 flex flex-col items-center justify-end">
                <div v-if="showIncense" class="absolute bottom-12 flex gap-2">
                   <div class="relative w-1 h-20 bg-amber-200">
                      <div class="absolute -top-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                      <div class="smoke absolute -top-20 -left-2 w-6 h-24 bg-gray-400 opacity-0 blur-md animate-smoke-1"></div>
                   </div>
                   <div class="relative w-1 h-24 bg-amber-200">
                      <div class="absolute -top-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                      <div class="smoke absolute -top-24 -left-2 w-6 h-28 bg-gray-400 opacity-0 blur-md animate-smoke-2"></div>
                   </div>
                   <div class="relative w-1 h-20 bg-amber-200">
                      <div class="absolute -top-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                      <div class="smoke absolute -top-20 -left-2 w-6 h-24 bg-gray-400 opacity-0 blur-md animate-smoke-3"></div>
                   </div>
                </div>
                <div class="burner w-32 h-16 bg-gradient-to-b from-amber-800 to-amber-950 rounded-b-3xl border-t-4 border-amber-700 shadow-xl flex items-center justify-center relative">
                  <div class="text-amber-900 font-serif font-bold text-2xl opacity-50">福</div>
                </div>
                <div class="w-full h-2 bg-gray-300 absolute top-0 rounded-full opacity-30"></div>
             </div>

             <!-- Flowers -->
             <div v-if="showFlowers" class="flowers-container absolute bottom-4 z-30 animate-float-up">
               <span class="text-8xl filter drop-shadow-2xl">💐</span>
             </div>
             
             <!-- Right Candle -->
             <div v-if="showCandle" class="candle-container relative w-6 h-32 transition-all duration-1000">
               <div class="flame absolute -top-4 left-1/2 -translate-x-1/2 animate-flicker text-2xl filter drop-shadow-[0_0_10px_rgba(255,165,0,0.8)]">🔥</div>
               <div class="candle bg-gradient-to-b from-red-500 to-red-700 w-full h-full rounded-sm shadow-lg"></div>
               <div class="absolute bottom-0 w-10 h-2 bg-stone-800 -left-2 rounded-full opacity-50"></div>
             </div>
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="p-6 bg-stone-100 border-t border-stone-300 flex justify-center gap-10 shadow-inner">
        <button @click="toggleCandle" 
          :class="{'bg-red-50 border-red-500 text-red-700 ring-2 ring-red-200': showCandle, 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50': !showCandle}" 
          class="flex flex-col items-center justify-center w-24 h-24 rounded-xl border transition-all duration-300 active:scale-95 shadow-sm">
          <span class="text-4xl mb-2">🕯️</span>
          <span class="text-sm font-medium">点烛</span>
        </button>
        
        <button @click="toggleIncense" 
          :class="{'bg-amber-50 border-amber-500 text-amber-700 ring-2 ring-amber-200': showIncense, 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50': !showIncense}" 
          class="flex flex-col items-center justify-center w-24 h-24 rounded-xl border transition-all duration-300 active:scale-95 shadow-sm">
          <span class="text-4xl mb-2">🥢</span>
          <span class="text-sm font-medium">上香</span>
        </button>
        
        <button @click="triggerFlowers" 
          :disabled="isFlowering"
          class="bg-white border border-gray-200 text-gray-600 hover:bg-pink-50 hover:border-pink-300 hover:text-pink-600 flex flex-col items-center justify-center w-24 h-24 rounded-xl transition-all duration-300 active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
          <span class="text-4xl mb-2">💐</span>
          <span class="text-sm font-medium">献花</span>
        </button>
        
        <button @click="openMessageBoard" 
          class="bg-white border border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 flex flex-col items-center justify-center w-24 h-24 rounded-xl transition-all duration-300 active:scale-95 shadow-sm">
          <span class="text-4xl mb-2">📝</span>
          <span class="text-sm font-medium">留言</span>
        </button>
      </div>

      <!-- Message Board Modal (Overlay) -->
      <div v-if="showMessageBoard" class="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
        <div class="bg-white rounded-lg w-[500px] shadow-2xl flex flex-col max-h-[80vh] animate-slide-up">
           <div class="p-4 border-b bg-stone-50 flex justify-between items-center rounded-t-lg">
             <h3 class="text-lg font-bold text-stone-800 font-serif">寄语哀思</h3>
             <button @click="showMessageBoard = false" class="text-gray-400 hover:text-gray-600">&times;</button>
           </div>
           
           <div class="p-4 flex-1 overflow-y-auto bg-stone-50 min-h-[300px]">
             <div v-if="messages.length === 0" class="text-center text-gray-400 py-10">
               暂无留言，写下您的第一条思念...
             </div>
             <div v-for="(msg, idx) in messages" :key="idx" class="mb-4 bg-white p-4 rounded-lg shadow-sm border border-stone-100">
               <p class="text-stone-800 mb-2 whitespace-pre-wrap">{{ msg.content }}</p>
               <div class="flex justify-between items-center text-xs text-gray-400">
                 <span>{{ msg.author || '家人' }}</span>
                 <span>{{ msg.date }}</span>
               </div>
             </div>
           </div>

           <div class="p-4 border-t bg-white rounded-b-lg">
             <textarea v-model="newMessage" 
               class="w-full border border-gray-300 rounded-lg p-3 h-24 mb-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none" 
               placeholder="写下您的思念..."></textarea>
             <div class="flex justify-end gap-3">
               <button @click="showMessageBoard = false" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">取消</button>
               <button @click="submitMessage" class="px-6 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded shadow-md transition-colors">发布留言</button>
             </div>
           </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  isVisible: boolean;
  memberId: string;
  memberName: string;
  portraitUrl?: string;
}>();

const emit = defineEmits(['close']);

const showCandle = ref(false);
const showIncense = ref(false);
const showFlowers = ref(false);
const isFlowering = ref(false);
const showMessageBoard = ref(false);
const newMessage = ref('');
const messages = ref<{content: string, date: string, author?: string}[]>([
  { content: '爷爷，我们都很想念您。', date: '2023-10-01 10:00', author: '长孙' },
  { content: '愿天堂没有病痛。', date: '2023-04-05 09:30', author: '家人' }
]);

// Log & Status
const onlineCount = ref(Math.floor(Math.random() * 10) + 1);
const showLog = ref(false);
const logs = ref<{time: string, user: string, action: string}[]>([
  { time: '09:00', user: '长孙', action: '点燃了蜡烛' },
  { time: '昨天', user: '家人', action: '献上了鲜花' }
]);

function addLog(action: string) {
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  logs.value.unshift({
    time: timeStr,
    user: '我',
    action: action
  });
}

function toggleCandle() {
  showCandle.value = !showCandle.value;
  if (showCandle.value) addLog('点燃了蜡烛');
  else addLog('熄灭了蜡烛');
}

function toggleIncense() {
  showIncense.value = !showIncense.value;
  if (showIncense.value) addLog('敬上了清香');
}

function triggerFlowers() {
  if (isFlowering.value) return;
  showFlowers.value = true;
  isFlowering.value = true;
  addLog('献上了鲜花');
  setTimeout(() => { 
    showFlowers.value = false;
    isFlowering.value = false;
  }, 4000); 
}

function openMessageBoard() {
  showMessageBoard.value = true;
}

function submitMessage() {
  if (!newMessage.value.trim()) return;
  messages.value.unshift({
    content: newMessage.value,
    date: new Date().toLocaleString(),
    author: '家人'
  });
  addLog('留下了寄语');
  newMessage.value = '';
}

function subscribe() {
  alert(`已订阅 ${props.memberName} 的祭扫提醒。\n将在清明、冬至、忌日等重要日子通知您。`);
}
</script>

<style scoped>
.writing-vertical {
  writing-mode: vertical-rl;
  text-orientation: upright;
}

@keyframes flicker {
  0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
  50% { opacity: 0.8; transform: translateX(-50%) scale(0.9); }
  25% { opacity: 0.9; transform: translateX(-52%) scale(1.1); }
  75% { opacity: 0.9; transform: translateX(-48%) scale(1.05); }
}
.animate-flicker {
  animation: flicker 0.15s infinite alternate;
}

@keyframes smoke-1 {
  0% { transform: translateY(0) scale(1); opacity: 0.6; }
  100% { transform: translateY(-40px) scale(2) translateX(10px); opacity: 0; }
}
@keyframes smoke-2 {
  0% { transform: translateY(0) scale(1); opacity: 0.6; }
  100% { transform: translateY(-50px) scale(2) translateX(-10px); opacity: 0; }
}
@keyframes smoke-3 {
  0% { transform: translateY(0) scale(1); opacity: 0.6; }
  100% { transform: translateY(-30px) scale(2) translateX(5px); opacity: 0; }
}

.animate-smoke-1 { animation: smoke-1 3s infinite linear; }
.animate-smoke-2 { animation: smoke-2 4s infinite linear 0.5s; }
.animate-smoke-3 { animation: smoke-3 3.5s infinite linear 1s; }

@keyframes float-up {
  0% { transform: translateY(20px) scale(0.8); opacity: 0; }
  20% { transform: translateY(0) scale(1); opacity: 1; }
  80% { transform: translateY(-20px) scale(1); opacity: 1; }
  100% { transform: translateY(-40px) scale(1.1); opacity: 0; }
}
.animate-float-up {
  animation: float-up 4s ease-out forwards;
}

@keyframes slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

@keyframes slide-left {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
.animate-slide-left {
  animation: slide-left 0.3s ease-out;
}
</style>
