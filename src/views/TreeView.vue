<template>
  <div class="container mx-auto p-4 h-screen flex flex-col">
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-bold">族谱树</h1>
        <button @click="showWorshipMap = true" class="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded shadow text-sm flex items-center gap-1">
          <span>🗺️</span> 祭扫地图
        </button>
        <router-link to="/book" class="bg-stone-600 hover:bg-stone-700 text-white px-3 py-1 rounded shadow text-sm flex items-center gap-1">
          <span>📖</span> 谱书模式
        </router-link>
      </div>
      <router-link to="/" class="text-blue-500 hover:underline">返回首页</router-link>
    </div>
    
    <div class="flex-1 border rounded bg-white shadow-lg overflow-hidden relative">
      <FamilyTree 
        v-if="rootId" 
        :members="members" 
        :root-id="rootId" 
        @add-child="onAddChild"
        @add-spouse="onAddSpouse"
        @edit="onEdit"
        @edit-cemetery="onEditCemetery"
        @delete="onDelete"
        @worship="onWorship"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMemberStore } from '../stores/memberStore';
import { storeToRefs } from 'pinia';
import FamilyTree from '../components/family-tree/FamilyTree.vue';
import CemeteryMap from '../components/map/CemeteryMap.vue';
import Memorial from '../components/worship/Memorial.vue';
import WorshipMap from '../components/worship/WorshipMap.vue';
import { type CemeteryInfo } from '../types';

const memberStore = useMemberStore();
const { members } = storeToRefs(memberStore);
const rootId = ref<string>('');

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

onMounted(() => {
  // Find root
  const root = members.value.find(m => m.generation === 1);
  if (root) {
    rootId.value = root.id;
  }
});

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
</script>
