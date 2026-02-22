<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b flex justify-between items-center">
        <h3 class="text-lg font-bold">墓冢定位 - {{ memberName }}</h3>
        <button @click="emit('close')" class="text-gray-500 hover:text-gray-700">✕</button>
      </div>

      <!-- Map Container -->
      <div class="flex-1 relative">
        <div ref="mapRef" class="w-full h-full"></div>
        
        <!-- Search/Info Overlay -->
        <div class="absolute top-4 left-14 z-[1000] bg-white p-2 rounded shadow-md flex gap-2">
          <input 
            v-model="addressInput" 
            placeholder="输入地址或山头名称..." 
            class="border rounded px-2 py-1 text-sm w-64"
          />
          <button @click="searchAddress" class="bg-blue-500 text-white px-3 py-1 rounded text-sm">
            搜索
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 border-t flex justify-between items-center bg-gray-50">
        <div class="text-sm text-gray-600">
          <span v-if="selectedLocation">
            已选位置: {{ selectedLocation.lat.toFixed(6) }}, {{ selectedLocation.lng.toFixed(6) }}
          </span>
          <span v-else>点击地图选择位置</span>
        </div>
        <div class="flex gap-2">
          <button @click="emit('close')" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">取消</button>
          <button 
            @click="confirmSelection" 
            :disabled="!selectedLocation"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            保存位置
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, toRaw } from 'vue';
import L from 'leaflet';
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

onMounted(() => {
  if (!mapRef.value) return;

  // Initialize Map
  const initialLat = props.initialCemetery?.lat || 30.2741; 
  const initialLng = props.initialCemetery?.lng || 120.1551;

  // Store raw instance to avoid reactivity overhead which confuses Leaflet types
  const map = L.map(mapRef.value).setView([initialLat, initialLng], 13);
  mapInstance.value = map;

  // Add OpenStreetMap Tile Layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Add initial marker if exists
  if (selectedLocation.value) {
    addMarker(selectedLocation.value.lat, selectedLocation.value.lng);
  }

  // Click handler
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

function searchAddress() {
  // Mock search for now or integrate a geocoding API
  alert('搜索功能需接入地理编码 API (如高德/百度/OSM Nominatim)');
}

function confirmSelection() {
  if (selectedLocation.value) {
    emit('save', {
      lat: selectedLocation.value.lat,
      lng: selectedLocation.value.lng,
      address: addressInput.value || '地图选点',
      photos: props.initialCemetery?.photos || []
    });
    emit('close');
  }
}
</script>

<style>
/* Fix Leaflet marker icon issue in Vite/Webpack */
.leaflet-default-icon-path {
  background-image: url(https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png);
}
</style>
