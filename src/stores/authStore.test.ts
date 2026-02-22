import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from './authStore';

describe('stores/authStore.ts', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('Initial State', () => {
    it('should have null user initially', () => {
      const store = useAuthStore();
      expect(store.user).toBeNull();
    });

    it('should not be authenticated initially', () => {
      const store = useAuthStore();
      expect(store.isAuthenticated).toBe(false);
    });
  });

  describe('login', () => {
    it('should login successfully with admin credentials', async () => {
      const store = useAuthStore();
      
      const result = await store.login('admin', 'admin');
      
      expect(result).toBe(true);
      expect(store.user).not.toBeNull();
      expect(store.user?.username).toBe('admin');
      expect(store.user?.role).toBe('admin');
    });

    it('should login successfully with user credentials', async () => {
      const store = useAuthStore();
      
      const result = await store.login('user', 'user');
      
      expect(result).toBe(true);
      expect(store.user?.role).toBe('member');
    });

    it('should fail login with wrong credentials', async () => {
      const store = useAuthStore();
      
      const result = await store.login('wrong', 'wrong');
      
      expect(result).toBe(false);
      expect(store.user).toBeNull();
    });

    it('should set isAuthenticated to true after login', async () => {
      const store = useAuthStore();
      
      await store.login('admin', 'admin');
      
      expect(store.isAuthenticated).toBe(true);
    });
  });

  describe('logout', () => {
    it('should logout and clear user', async () => {
      const store = useAuthStore();
      await store.login('admin', 'admin');
      
      store.logout();
      
      expect(store.user).toBeNull();
      expect(store.isAuthenticated).toBe(false);
    });
  });

  describe('register', () => {
    it('should register new user successfully', async () => {
      const store = useAuthStore();
      
      const result = await store.register({ 
        username: 'newuser', 
        name: '新用户' 
      });
      
      expect(result).toBe(true);
      expect(store.user).not.toBeNull();
      expect(store.user?.username).toBe('newuser');
      expect(store.user?.role).toBe('member');
    });

    it('should set default name if not provided', async () => {
      const store = useAuthStore();
      
      await store.register({ username: 'testuser' });
      
      expect(store.user?.name).toBe('新成员');
    });

    it('should set isAuthenticated after register', async () => {
      const store = useAuthStore();
      
      await store.register({ username: 'testuser' });
      
      expect(store.isAuthenticated).toBe(true);
    });
  });
});
