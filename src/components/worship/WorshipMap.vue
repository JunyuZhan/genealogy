<template>
  <div class="fixed inset-0 z-40 bg-white flex flex-col">
    <!-- Header -->
    <div class="p-4 border-b flex justify-between items-center shadow-sm z-50 bg-white">
      <h2 class="text-xl font-bold flex items-center gap-2">
        <span>🗺️</span> 祭扫地图
      </h2>
      <button @click="$emit('close')" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-medium transition-colors">
        关闭地图
      </button>
    </div>

    <!-- Map Container -->
    <div ref="mapContainer" class="flex-1 w-full h-full z-0"></div>

    <!-- Legend/Info -->
    <div class="absolute bottom-8 left-8 z-[400] bg-white p-4 rounded shadow-lg max-w-xs">
      <h3 class="font-bold mb-2 text-gray-800">关于祭扫地图</h3>
      <p class="text-sm text-gray-600">
        这里展示了所有已登记墓址的先人。点击地图上的标记即可进入祭扫纪念页面。
      </p>
      <div class="mt-2 text-xs text-gray-500">
        共找到 {{ membersWithCemetery.length }} 处墓址
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { type Member } from '../../types';

// Fix Leaflet icon issue
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Override default icon
const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const props = defineProps<{
  members: Member[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'worship', memberId: string): void;
}>();

const mapContainer = ref<HTMLElement | null>(null);
const map = ref<L.Map | null>(null);

const membersWithCemetery = computed(() => {
  return props.members.filter(m => m.cemetery && m.cemetery.lat && m.cemetery.lng);
});

onMounted(() => {
  initMap();
});

function initMap() {
  if (!mapContainer.value) return;

  // Default center (China center roughly) or average of points
  const center: [number, number] = [35.8617, 104.1954]; 
  const zoom = 4;

  const mapInstance = L.map(mapContainer.value).setView(center, zoom);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(mapInstance);

  map.value = mapInstance;

  // Add markers
  const bounds = L.latLngBounds([]);
  let hasMarkers = false;

  membersWithCemetery.value.forEach(member => {
    if (!member.cemetery) return;
    
    const { lat, lng, address } = member.cemetery;
    const marker = L.marker([lat, lng]).addTo(mapInstance);
    
    // Create popup content
    const popupContent = document.createElement('div');
    popupContent.className = 'text-center p-2';
    
    const title = document.createElement('div');
    title.className = 'font-bold text-lg mb-1';
    title.innerText = member.name;
    popupContent.appendChild(title);

    const addr = document.createElement('div');
    addr.className = 'text-sm text-gray-600 mb-3';
    addr.innerText = address || '未知地址';
    popupContent.appendChild(addr);
    
    const btn = document.createElement('button');
    btn.className = 'bg-amber-600 text-white px-3 py-1 rounded text-sm hover:bg-amber-700 transition-colors w-full';
    btn.innerText = '🙏 进入祭扫';
    btn.onclick = () => {
      emit('worship', member.id);
    };
    
    popupContent.appendChild(btn);
    marker.bindPopup(popupContent);

    bounds.extend([lat, lng]);
    hasMarkers = true;
  });

  if (hasMarkers) {
    mapInstance.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }
}
</script>

<style scoped>
/* Leaflet popup customization if needed */
:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}
:deep(.leaflet-popup-content) {
  margin: 0;
  padding: 10px;
}
</style>
