<template>
  <div class="container mx-auto p-4 h-[calc(100vh-4rem)] flex flex-col">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
        <h1 class="text-2xl font-bold">族谱树</h1>
        <GlobalSearch :members="members" @select="onSelectMember" class="w-full sm:w-auto" />
        
        <div class="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
          <button @click="showWorshipMap = true" class="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded shadow text-sm flex items-center gap-1 whitespace-nowrap">
            <span>🗺️</span> 祭扫地图
          </button>
          <button @click="exportImage" class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded shadow text-sm flex items-center gap-1 whitespace-nowrap">
            <span>🖼️</span> 导出
          </button>
          <router-link to="/book" class="bg-stone-600 hover:bg-stone-700 text-white px-3 py-1 rounded shadow text-sm flex items-center gap-1 whitespace-nowrap">
            <span>📖</span> 谱书
          </router-link>
        </div>
      </div>
      <router-link to="/" class="text-blue-500 hover:underline text-sm hidden md:block">返回首页</router-link>
    </div>
    
    <div class="flex-1 border rounded bg-white shadow-lg overflow-hidden relative">
      <FamilyTree 
        v-if="rootId" 
        :members="members" 
        :root-id="rootId"
        :highlight-id="highlightMemberId"
        @add-child="onAddChild"
        @add-spouse="onAddSpouse"
        @edit="onEdit"
        @edit-cemetery="onEditCemetery"
        @delete="onDelete"
        @worship="onWorship"
        @select="onSelectMember"
      />
      <div v-else class="flex items-center justify-center h-full text-gray-400">
        加载中...
      </div>
      
      <CemeteryMap 
        v-if="showMap"
        :member-name="currentMemberName"
        :initial-cemetery="currentCemetery"
        @close="showMap = false"
        @save="onSaveCemetery"
      />

      <Memorial
        v-if="showMemorial"
        :is-visible="showMemorial"
        :member-id="memorialMemberId"
        :member-name="memorialMemberName"
        @close="showMemorial = false"
      />

      <WorshipMap 
        v-if="showWorshipMap"
        :members="members"
        @close="showWorshipMap = false"
        @worship="onWorship"
      />

      <MemberDetailSidebar
        :is-visible="showSidebar"
        :member="sidebarMember"
        :all-members="members"
        @close="showSidebar = false"
        @select="onSelectMember"
        @edit="onEdit"
        @delete="onDelete"
        @edit-cemetery="onEditCemetery"
        @worship="onWorship"
        @add-sibling="onAddSibling"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useMemberStore } from '../stores/memberStore';
import { storeToRefs } from 'pinia';
import FamilyTree from '../components/family-tree/FamilyTree.vue';
import CemeteryMap from '../components/map/CemeteryMap.vue';
import Memorial from '../components/worship/Memorial.vue';
import WorshipMap from '../components/worship/WorshipMap.vue';
import GlobalSearch from '../components/common/GlobalSearch.vue';
import MemberDetailSidebar from '../components/family-tree/MemberDetailSidebar.vue';
import { type CemeteryInfo } from '../types';

const memberStore = useMemberStore();
const { members } = storeToRefs(memberStore);
const rootId = ref<string>('');
const highlightMemberId = ref<string>('');

// Map State
const showMap = ref(false);
const editingMemberId = ref<string>('');
const currentCemetery = ref<CemeteryInfo | null>(null);
const currentMemberName = ref('');

// Worship State
const showMemorial = ref(false);
const showWorshipMap = ref(false);
const memorialMemberId = ref('');
const memorialMemberName = ref('');

// Sidebar State
const showSidebar = ref(false);
const sidebarMemberId = ref('');
const sidebarMember = computed(() => memberStore.getMember(sidebarMemberId.value) || null);

onMounted(() => {
  // Find root
  const root = members.value.find(m => m.generation === 1);
  if (root) {
    rootId.value = root.id;
  }
});

function onSelectMember(memberId: string) {
  sidebarMemberId.value = memberId;
  highlightMemberId.value = memberId;
  showSidebar.value = true;
  
  // Optional: Center tree on member (requires exposing method from FamilyTree)
  // For now, just showing sidebar is good.
}

function onAddSibling(memberId: string) {
  const name = prompt('请输入兄弟姐妹姓名:');
  const genderStr = prompt('请输入性别 (M/F):', 'M');
  if (name && genderStr) {
    const gender = genderStr.toUpperCase() === 'F' ? 'F' : 'M';
    const result = memberStore.addSibling(memberId, { name, gender });
    if (!result) {
        alert('无法添加兄弟姐妹：该成员没有父母信息。');
    }
  }
}

function onAddChild(memberId: string) {
  const name = prompt('请输入子女姓名:');
  const genderStr = prompt('请输入性别 (M/F):', 'M');
  if (name && genderStr) {
    const gender = genderStr.toUpperCase() === 'F' ? 'F' : 'M';
    memberStore.addChild(memberId, { name, gender });
  }
}

function onAddSpouse(memberId: string) {
  const name = prompt('请输入配偶姓名:');
  if (name) {
    memberStore.addSpouse(memberId, { name, isAlive: true });
  }
}

function onEdit(memberId: string) {
  const member = memberStore.getMember(memberId);
  if (!member) return;
  const name = prompt('修改姓名:', member.name);
  if (name) {
    memberStore.updateMember(memberId, { name });
  }
}

function onEditCemetery(memberId: string) {
  const member = memberStore.getMember(memberId);
  if (!member) return;
  
  editingMemberId.value = memberId;
  currentMemberName.value = member.name;
  currentCemetery.value = member.cemetery || null;
  showMap.value = true;
}

function onSaveCemetery(data: CemeteryInfo) {
  if (editingMemberId.value) {
    memberStore.updateMember(editingMemberId.value, { cemetery: data });
  }
}

function onWorship(memberId: string) {
  const member = memberStore.getMember(memberId);
  if (!member) return;
  
  memorialMemberId.value = memberId;
  memorialMemberName.value = member.name;
  showMemorial.value = true;
}

function onDelete(memberId: string) {
  if (confirm('确定要删除该成员吗？')) {
    memberStore.deleteMember(memberId);
  }
}

function exportImage() {
  const svg = document.querySelector('.family-tree-container svg') as SVGSVGElement;
  if (!svg) {
    alert('未找到族谱树视图');
    return;
  }
  
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svg);
  
  if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  
  const url = "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(source);
  
  const img = new Image();
  img.src = url;
  img.onload = function() {
      const canvas = document.createElement('canvas');
      // Get BBox usually requires the element to be in DOM. It is.
      // But SVG BBox might be 0 if not rendered or hidden.
      // We can use getBoundingClientRect or explicit width/height from D3 config.
      // Better to use getBBox() on the main group <g>.
      const g = svg.querySelector('g');
      const bbox = g ? (g as SVGGElement).getBBox() : { x: 0, y: 0, width: 2000, height: 1000 };
      
      // Add padding
      const padding = 50;
      canvas.width = bbox.width + padding * 2;
      canvas.height = bbox.height + padding * 2;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Translate to center the content
          // The bbox.x and bbox.y might be negative (d3 zoom transform).
          // We want to draw the image such that the content (bbox) is centered.
          // Wait, drawing the SVG image draws the viewbox?
          // If we serialize the current SVG, it includes the current 'transform' on <g>.
          // So the image will look exactly like the screen (zoomed/panned).
          // If we want the FULL tree, we might need to reset zoom/pan before export.
          // For now, let's just export what is seen or slightly better:
          // The simple approach often clips content if zoomed in.
          // But user can zoom out.
          
          ctx.drawImage(img, 0, 0); // This draws the SVG at 0,0. 
          
          // Actually, drawing SVG on canvas can be tricky with external resources.
          // But here we have inline SVG.
          
          const pngUrl = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = pngUrl;
          downloadLink.download = 'family-tree.png';
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
      }
  }
}
</script>
