<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">支系管理</h1>
          <p class="text-gray-500 mt-1">管理家族各分支及其负责人，审核信息变更。</p>
        </div>
        <div class="flex flex-wrap gap-3 w-full md:w-auto">
          <button @click="showImportModal = true" class="flex-1 md:flex-none justify-center bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2 touch-manipulation">
            <span>📥</span> <span class="hidden sm:inline">批量</span>导入
          </button>
          <router-link to="/branch-merge" class="flex-1 md:flex-none justify-center bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2 touch-manipulation">
            <span>🔀</span> <span class="hidden sm:inline">分支</span>合并
          </router-link>
          <button @click="showAddBranchModal = true" class="flex-1 md:flex-none justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 touch-manipulation">
            <span>+</span> <span class="hidden sm:inline">新增</span>支系
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Branch List -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 class="text-lg font-bold text-gray-800">支系列表</h2>
              <div class="text-sm text-gray-500">共 {{ branches.length }} 个支系</div>
            </div>
            <div class="divide-y divide-gray-100">
              <div v-for="branch in branches" :key="branch.id" class="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                <div class="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                  <div>
                    <h3 class="text-xl font-bold text-gray-900 flex flex-wrap items-center gap-2">
                      {{ branch.name }}
                      <span v-if="branch.isMain" class="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded whitespace-nowrap">主脉</span>
                    </h3>
                    <p class="text-gray-500 text-sm mt-1">始迁祖: {{ branch.ancestor }} | 迁入时间: {{ branch.moveDate }}</p>
                  </div>
                  <div class="flex gap-2 self-end sm:self-start">
                    <button class="text-gray-400 hover:text-blue-600 p-2 touch-manipulation">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div class="bg-gray-50 rounded-lg p-4 mb-4">
                  <div class="flex items-center gap-3 mb-2">
                    <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">
                      联
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="text-sm font-bold text-gray-900 truncate">{{ branch.contactPerson }}</p>
                      <p class="text-xs text-gray-500 truncate">{{ branch.contactPhone }}</p>
                    </div>
                    <button class="ml-auto text-xs text-blue-600 hover:underline px-2 py-1 touch-manipulation">更换</button>
                  </div>
                  <p class="text-sm text-gray-600 line-clamp-2">{{ branch.description }}</p>
                </div>

                <div class="flex flex-wrap gap-4 text-sm">
                  <span class="text-gray-500">成员: <strong class="text-gray-900">{{ branch.memberCount }}</strong></span>
                  <span class="text-gray-500">待审核: <strong class="text-amber-600">{{ branch.pendingReviews }}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pending Reviews -->
        <div class="space-y-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
            <div class="px-6 py-4 border-b border-gray-100 bg-amber-50">
              <h2 class="text-lg font-bold text-amber-900">待审核事项</h2>
            </div>
            <div class="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              <div v-for="review in pendingReviews" :key="review.id" class="p-4 hover:bg-gray-50">
                <div class="flex justify-between items-start mb-2">
                  <span :class="getReviewTypeClass(review.type)" class="text-xs font-bold px-2 py-0.5 rounded">
                    {{ getReviewTypeLabel(review.type) }}
                  </span>
                  <span class="text-xs text-gray-400">{{ review.date }}</span>
                </div>
                <p class="text-sm font-bold text-gray-900 mb-1">{{ review.title }}</p>
                <div v-if="review.type === 'cemetery_photo' && review.payload" class="mb-2 bg-gray-50 p-2 rounded border border-gray-100">
                   <img :src="review.payload.photoUrl" class="w-full h-32 object-cover rounded mb-1 cursor-pointer hover:opacity-90">
                   <p class="text-xs text-gray-500">{{ review.payload.description }}</p>
                </div>
                <p class="text-xs text-gray-500 mb-3">提交人: {{ review.submitter }} ({{ review.branch }})</p>
                
                <div class="flex gap-2">
                  <button @click="approve(review.id)" class="flex-1 bg-green-50 text-green-700 text-xs py-1.5 rounded hover:bg-green-100 font-bold">通过</button>
                  <button @click="reject(review.id)" class="flex-1 bg-red-50 text-red-700 text-xs py-1.5 rounded hover:bg-red-100 font-bold">驳回</button>
                </div>
              </div>
              <div v-if="pendingReviews.length === 0" class="p-8 text-center text-gray-400 text-sm">
                暂无待审核事项
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Branch Modal -->
      <div v-if="showAddBranchModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl w-full max-w-md p-6 relative mx-4">
          <button @click="showAddBranchModal = false" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 class="text-xl font-bold mb-4">新增支系</h2>
          <form @submit.prevent="addBranch" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">支系名称</label>
              <input v-model="newBranch.name" type="text" class="w-full border-gray-300 rounded-lg shadow-sm py-2.5" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">始迁祖</label>
              <input v-model="newBranch.ancestor" type="text" class="w-full border-gray-300 rounded-lg shadow-sm py-2.5" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">联系人</label>
              <input v-model="newBranch.contactPerson" type="text" class="w-full border-gray-300 rounded-lg shadow-sm py-2.5" required>
            </div>
            <button type="submit" class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold touch-manipulation">确认添加</button>
          </form>
        </div>
      </div>
      <!-- Import Modal -->
      <div v-if="showImportModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl w-full max-w-lg p-6 relative mx-4">
          <button @click="showImportModal = false" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 class="text-xl font-bold mb-4">批量导入成员信息</h2>
          
          <div class="space-y-6">
            <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 class="text-sm font-bold text-blue-800 mb-2">步骤 1: 下载模板</h3>
              <p class="text-sm text-blue-600 mb-3">请先下载标准导入模板，按照格式填写成员信息。</p>
              <button class="bg-white text-blue-600 border border-blue-200 px-3 py-2 rounded text-sm hover:bg-blue-50 font-medium w-full sm:w-auto touch-manipulation">
                📥 下载 Excel 模板
              </button>
            </div>

            <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer touch-manipulation">
              <div class="text-4xl mb-2">📄</div>
              <p class="text-gray-600 font-medium">点击或拖拽文件到此处上传</p>
              <p class="text-xs text-gray-400 mt-1">支持 .xlsx, .csv 格式 (最大 5MB)</p>
            </div>

            <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
              <button @click="showImportModal = false" class="px-4 py-3 sm:py-2 text-gray-600 hover:bg-gray-100 rounded-lg w-full sm:w-auto touch-manipulation">取消</button>
              <button class="px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-sm w-full sm:w-auto touch-manipulation">开始导入</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Branch {
  id: string
  name: string
  ancestor: string
  moveDate: string
  description: string
  contactPerson: string
  contactPhone: string
  memberCount: number
  pendingReviews: number
  isMain?: boolean
}

interface Review {
  id: string
  type: 'info_update' | 'new_member' | 'merge_request' | 'cemetery_photo'
  title: string
  submitter: string
  branch: string
  date: string
  payload?: any
}

const showAddBranchModal = ref(false)
const showImportModal = ref(false)

const branches = ref<Branch[]>([])
const pendingReviews = ref<Review[]>([])
const loading = ref(false)

import { onMounted } from 'vue'
import { api } from '../services/api'

onMounted(async () => {
  loading.value = true
  try {
    const [branchesData, reviewsData] = await Promise.all([
      api.getBranches(),
      api.getBranchReviews()
    ])
    branches.value = branchesData
    pendingReviews.value = reviewsData
  } catch (e) {
    console.error('Failed to load branch data:', e)
  } finally {
    loading.value = false
  }
})

const newBranch = ref({
  name: '',
  ancestor: '',
  contactPerson: ''
})

function getReviewTypeLabel(type: string) {
  const map: Record<string, string> = {
    info_update: '信息变更',
    new_member: '新增成员',
    merge_request: '合并请求',
    cemetery_photo: '墓冢照片'
  }
  return map[type]
}

function getReviewTypeClass(type: string) {
  const map: Record<string, string> = {
    info_update: 'bg-blue-100 text-blue-800',
    new_member: 'bg-green-100 text-green-800',
    merge_request: 'bg-purple-100 text-purple-800',
    cemetery_photo: 'bg-amber-100 text-amber-800'
  }
  return map[type]
}

function approve(id: string) {
  if (confirm('确认通过此申请吗？')) {
    pendingReviews.value = pendingReviews.value.filter(r => r.id !== id)
  }
}

function reject(id: string) {
  if (confirm('确认驳回此申请吗？')) {
    pendingReviews.value = pendingReviews.value.filter(r => r.id !== id)
  }
}

function addBranch() {
  branches.value.push({
    id: Date.now().toString(),
    name: newBranch.value.name,
    ancestor: newBranch.value.ancestor,
    moveDate: '未知',
    description: '暂无描述',
    contactPerson: newBranch.value.contactPerson,
    contactPhone: '暂无',
    memberCount: 0,
    pendingReviews: 0
  })
  showAddBranchModal.value = false
  newBranch.value = { name: '', ancestor: '', contactPerson: '' }
}
</script>
