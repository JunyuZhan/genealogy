import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export type UserRole = 'admin' | 'branch_admin' | 'member' | 'guest';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  avatar?: string;
  branch?: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const isAuthenticated = computed(() => !!user.value);

  // Mock login
  async function login(username: string, password: string): Promise<boolean> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        if (username === 'admin' && password === 'admin') {
          user.value = {
            id: '1',
            username: 'admin',
            name: '管理员',
            role: 'admin',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
          };
          resolve(true);
        } else if (username === 'user' && password === 'user') {
          user.value = {
            id: '2',
            username: 'user',
            name: '族亲',
            role: 'member',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
          };
          resolve(true);
        } else {
          resolve(false);
        }
      }, 500);
    });
  }

  function logout() {
    user.value = null;
  }

  function register(data: any): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock registration success
        user.value = {
          id: crypto.randomUUID(),
          username: data.username,
          name: data.name || '新成员',
          role: 'member',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`
        };
        resolve(true);
      }, 800);
    });
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
    register
  };
});
