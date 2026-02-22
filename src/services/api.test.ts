import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { get, post, api } from './api';

describe('services/api.ts', () => {
  const mockFetch = vi.fn();
  
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('get', () => {
    it('should fetch data successfully', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await get('/test-endpoint');
      
      expect(mockFetch).toHaveBeenCalledWith('/api/test-endpoint');
      expect(result).toEqual(mockData);
    });

    it('should throw error on failed fetch', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(get('/test-endpoint')).rejects.toThrow('API Error: Not Found');
    });
  });

  describe('post', () => {
    it('should simulate post request', async () => {
      const mockData = { id: 1, name: 'Test' };
      // Mock console.log to avoid cluttering test output
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const result = await post('/test-endpoint', mockData);
      
      expect(result).toEqual(mockData);
      expect(consoleSpy).toHaveBeenCalledWith('[Mock POST] /test-endpoint', mockData);
      
      consoleSpy.mockRestore();
    });
  });

  describe('api object', () => {
    it('should define all API methods', () => {
      const methods = [
        'getMembers',
        'getNews',
        'getDonations',
        'getAncestors',
        'getMutualAid',
        'getBranches',
        'getBranchReviews',
        'getWorshipRecords'
      ];

      methods.forEach(method => {
        expect(api).toHaveProperty(method);
        expect(typeof (api as any)[method]).toBe('function');
      });
    });

    it('should call correct endpoints', async () => {
      mockFetch.mockResolvedValue({ ok: true, json: async () => [] });

      await api.getMembers();
      expect(mockFetch).toHaveBeenCalledWith('/api/members.json');

      await api.getNews();
      expect(mockFetch).toHaveBeenCalledWith('/api/news.json');

      await api.getDonations();
      expect(mockFetch).toHaveBeenCalledWith('/api/donations.json');

      await api.getAncestors();
      expect(mockFetch).toHaveBeenCalledWith('/api/worship_ancestors.json');

      await api.getMutualAid();
      expect(mockFetch).toHaveBeenCalledWith('/api/mutual_aid.json');

      await api.getBranches();
      expect(mockFetch).toHaveBeenCalledWith('/api/branches.json');

      await api.getBranchReviews();
      expect(mockFetch).toHaveBeenCalledWith('/api/branch_reviews.json');

      await api.getWorshipRecords();
      expect(mockFetch).toHaveBeenCalledWith('/api/worship_records.json');
    });
  });
});
