import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import News from './News.vue';
import { api } from '../services/api';

// Mock the API module
vi.mock('../services/api', () => ({
  api: {
    getNews: vi.fn(),
  },
}));

describe('News.vue', () => {
  const mockNewsData = [
    { 
      id: 1, 
      type: 'notice', 
      title: 'Pinned Notice', 
      date: '2024-03-01', 
      author: 'Admin', 
      summary: 'Summary 1',
      isPinned: true 
    },
    { 
      id: 2, 
      type: 'news', 
      title: 'Normal News', 
      date: '2024-02-20', 
      author: 'Editor', 
      summary: 'Summary 2',
      isPinned: false 
    },
    { 
      id: 3, 
      type: 'news', 
      title: 'Another News', 
      date: '2024-01-15', 
      author: 'Writer', 
      summary: 'Summary 3',
      isPinned: false 
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (api.getNews as any).mockResolvedValue(mockNewsData);
  });

  it('renders correctly and fetches data on mount', async () => {
    const wrapper = mount(News);
    
    // Initial state (loading or empty)
    expect(api.getNews).toHaveBeenCalledTimes(1);

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    // Check if news items are rendered
    expect(wrapper.text()).toContain('Pinned Notice');
    expect(wrapper.text()).toContain('Normal News');
    expect(wrapper.text()).toContain('Another News');
  });

  it('separates pinned and main news correctly', async () => {
    const wrapper = mount(News);
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    // Check pinned section
    const pinnedSection = wrapper.find('.bg-amber-50'); // The pinned section class
    expect(pinnedSection.exists()).toBe(true);
    expect(pinnedSection.text()).toContain('Pinned Notice');
    expect(pinnedSection.text()).not.toContain('Normal News');

    // Check main feed section
    const mainFeed = wrapper.findAll('article');
    // Should have 2 articles (Normal News and Another News)
    expect(mainFeed.length).toBe(2);
    expect(mainFeed[0]?.text()).toContain('Normal News');
    expect(mainFeed[1]?.text()).toContain('Another News');
  });

  it('handles API errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (api.getNews as any).mockRejectedValue(new Error('API Error'));

    const wrapper = mount(News);
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    expect(api.getNews).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
    
    // Should render empty state or at least not crash
    // In current implementation, news array would be empty
    const articles = wrapper.findAll('article');
    expect(articles.length).toBe(0);

    consoleSpy.mockRestore();
  });

  it('displays correct type badges', async () => {
    const wrapper = mount(News);
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    // Use a more robust selector or just find by text content if class selector is tricky with special chars
    const badges = wrapper.findAll('span').filter(span => span.classes().includes('py-0.5'));
    
    // Check for '新闻' badge
    const newsBadge = badges.find(b => b.text() === '新闻');
    expect(newsBadge?.exists()).toBe(true);
    expect(newsBadge?.classes()).toContain('bg-blue-100');
  });
});
