import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '../services/api';

export const useConfigStore = defineStore('config', () => {
  const config = ref<Record<string, any>>({});
  const isLoading = ref(false);

  // Default fallbacks if backend fetch fails or hasn't loaded yet
  const systemName = computed(() => config.value.systemName || '宗族数字化平台');
  const systemDescription = computed(() => config.value.systemDescription || '传承家族文化，连接族人情感');
  const systemLogo = computed(() => config.value.systemLogo || ''); // Empty string implies using default emoji or SVG
  
  // Footer / Contact Info
  const contactAddress = computed(() => config.value.contactAddress || '未配置地址');
  const contactEmail = computed(() => config.value.contactEmail || 'contact@example.com');
  const contactPhone = computed(() => config.value.contactPhone || '暂无电话');
  
  // Feature flags
  const isDonationEnabled = computed(() => config.value.donationEnabled !== 'false'); // Default to true if not set
  const isMemorialEnabled = computed(() => config.value.memorialEnabled !== 'false');

  async function fetchConfig() {
    isLoading.value = true;
    try {
      const data = await api.getPublicConfig();
      config.value = data;
    } catch (error) {
      console.error('Failed to load system config:', error);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    config,
    isLoading,
    systemName,
    systemDescription,
    systemLogo,
    contactAddress,
    contactEmail,
    contactPhone,
    isDonationEnabled,
    isMemorialEnabled,
    fetchConfig
  };
});
