<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b flex justify-between items-center">
        <h3 class="text-lg font-bold">墓冢定位 - {{ memberName }}</h3>
        <button @click="emit('close')" class="text-gray-500 hover:text-gray-700">✕</button>
      </div>

      <!-- Content -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Left: Map -->
        <div class="flex-1 relative border-r">
          <div ref="mapRef" class="w-full h-full"></div>
          
          <div class="absolute top-4 left-14 z-[1000] bg-white p-2 rounded shadow-md flex gap-2">
            <input 
              v-model="addressInput" 
              placeholder="输入地址或山头名称..." 
              class="border rounded px-2 py-1 text-sm w-48"
            />
          </div>
        </div>

        <!-- Right: Info & Photos -->
        <div class="w-80 p-4 flex flex-col gap-4 overflow-y-auto bg-gray-50">
          <!-- Location Info -->
          <div class="bg-white p-3 rounded shadow-sm">
            <h4 class="font-bold text-sm mb-2 text-gray-700">📍 位置信息</h4>
            <div class="text-xs text-gray-600 space-y-1">
              <p>纬度: {{ selectedLocation?.lat.toFixed(6) || '-' }}</p>
              <p>经度: {{ selectedLocation?.lng.toFixed(6) || '-' }}</p>
              <p>地址: {{ addressInput || '-' }}</p>
            </div>
            
            <div v-if="qrCodeUrl" class="mt-3 flex flex-col items-center">
               <img :src="qrCodeUrl" class="w-24 h-24 border" />
               <span class="text-xs text-gray-500 mt-1">扫码导航</span>
            </div>
          </div>

          <!-- Photos -->
          <div class="bg-white p-3 rounded shadow-sm">
            <h4 class="font-bold text-sm mb-2 text-gray-700">📷 墓冢照片</h4>
            <div class="grid grid-cols-2 gap-2 mb-2">
              <div 
                v-for="(photo, idx) in photos" 
                :key="idx" 
                class="relative aspect-square bg-gray-100 rounded overflow-hidden group"
              >
                <img :src="photo" class="w-full h-full object-cover" />
                <button 
                  @click="removePhoto(idx)"
                  class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
              
              <!-- Upload Button -->
              <label class="aspect-square border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <span class="text-2xl text-gray-400">+</span>
                <span class="text-xs text-gray-500">上传照片</span>
                <input type="file" accept="image/*" class="hidden" @change="handlePhotoUpload" />
              </label>
            </div>
          </div>

          <!-- Panorama -->
          <div class="bg-white p-3 rounded shadow-sm">
            <h4 class="font-bold text-sm mb-2 text-gray-700">🌐 全景影像</h4>
            <div v-if="panoramaUrl" class="relative aspect-video bg-gray-100 rounded overflow-hidden group">
               <div class="w-full h-full flex items-center justify-center bg-gray-800 text-white text-xs">
                 (全景预览占位)
                 <br/>
                 {{ panoramaUrl }}
               </div>
               <button 
                  @click="panoramaUrl = ''"
                  class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
            </div>
            <label v-else class="w-full py-6 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <span class="text-sm text-gray-500">上传360°全景图</span>
                <input type="file" accept="image/*" class="hidden" @change="handlePanoramaUpload" />
            </label>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 border-t flex justify-between items-center bg-white">
        <div class="text-sm text-gray-500">
          点击地图修改位置
        </div>
        <div class="flex gap-2">
          <button @click="emit('close')" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">取消</button>
          <button 
            @click="confirmSelection" 
            :disabled="!selectedLocation"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            保存更改
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, toRaw, watch } from 'vue';
import L from 'leaflet';
import QRCode from 'qrcode';
import 'leaflet/dist/leaflet.css';
import { type CemeteryInfo } from '../../types';

const props = defineProps<{
  memberName: string;
  initialCemetery?: CemeteryInfo | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', data: CemeteryInfo): void;
}>();

const mapRef = ref<HTMLElement | null>(null);
const mapInstance = ref<L.Map | null>(null);
const markerInstance = ref<L.Marker | null>(null);

const addressInput = ref(props.initialCemetery?.address || '');
const selectedLocation = ref<{ lat: number; lng: number } | null>(
  props.initialCemetery ? { lat: props.initialCemetery.lat, lng: props.initialCemetery.lng } : null
);

const photos = ref<string[]>(props.initialCemetery?.photos || []);
const panoramaUrl = ref<string>(props.initialCemetery?.panorama || '');
const qrCodeUrl = ref<string>('');

// Generate QR Code when location changes
watch(selectedLocation, async (newLoc) => {
  if (newLoc) {
    // Generate a geo URI or a maps link
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${newLoc.lat},${newLoc.lng}`;
    try {
      qrCodeUrl.value = await QRCode.toDataURL(mapsLink);
    } catch (err) {
      console.error(err);
    }
  } else {
    qrCodeUrl.value = '';
  }
}, { immediate: true });

onMounted(() => {
  if (!mapRef.value) return;

  const initialLat = props.initialCemetery?.lat || 30.2741; 
  const initialLng = props.initialCemetery?.lng || 120.1551;

  const map = L.map(mapRef.value).setView([initialLat, initialLng], 13);
  mapInstance.value = map;

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  if (selectedLocation.value) {
    addMarker(selectedLocation.value.lat, selectedLocation.value.lng);
  }

  map.on('click', (e: L.LeafletMouseEvent) => {
    selectedLocation.value = { lat: e.latlng.lat, lng: e.latlng.lng };
    addMarker(e.latlng.lat, e.latlng.lng);
  });
});

onUnmounted(() => {
  if (mapInstance.value) {
    const rawMap = toRaw(mapInstance.value);
    rawMap.remove();
    mapInstance.value = null;
  }
});

function addMarker(lat: number, lng: number) {
  const map = toRaw(mapInstance.value);
  if (!map) return;

  if (markerInstance.value) {
    const rawMarker = toRaw(markerInstance.value);
    map.removeLayer(rawMarker as unknown as L.Layer);
  }
  
  const marker = L.marker([lat, lng]).addTo(map as unknown as L.Map);
  markerInstance.value = marker;
}

function handlePhotoUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    // Mock upload: read as data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        photos.value.push(e.target.result as string);
      }
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function removePhoto(index: number) {
  photos.value.splice(index, 1);
}

function handlePanoramaUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    // Mock upload
    panoramaUrl.value = 'mock_panorama_' + input.files[0].name;
  }
}

function confirmSelection() {
  if (selectedLocation.value) {
    emit('save', {
      lat: selectedLocation.value.lat,
      lng: selectedLocation.value.lng,
      address: addressInput.value || '地图选点',
      photos: photos.value,
      panorama: panoramaUrl.value
    });
    emit('close');
  }
}
</script>

<style>
.leaflet-default-icon-path {
  background-image: url(https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png);
}
</style>
