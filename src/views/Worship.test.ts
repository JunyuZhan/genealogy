import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Worship from './Worship.vue';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    getAncestors: vi.fn(),
    getWorshipRecords: vi.fn(),
  },
}));

describe('Worship.vue', () => {
  const mockAncestors = [
    {
      id: '1',
      name: 'Ancestor 1',
      generation: 1,
      birthDate: '1900-01-01',
      deathDate: '1980-01-01',
      description: 'Description 1'
    }
  ];

  const mockRecords = [
    { user: 'User A', offering: 'Incense', time: '10 mins ago' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (api.getAncestors as any).mockResolvedValue(mockAncestors);
    (api.getWorshipRecords as any).mockResolvedValue(mockRecords);
  });

  it('renders and fetches data', async () => {
    const wrapper = mount(Worship);
    
    expect(api.getAncestors).toHaveBeenCalled();
    expect(api.getWorshipRecords).toHaveBeenCalled();

    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Ancestor 1');
  });

  it('selects an ancestor', async () => {
    const wrapper = mount(Worship);
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    const ancestorCard = wrapper.find('.cursor-pointer');
    await ancestorCard.trigger('click');

    // Check if modal appears
    expect(wrapper.find('.fixed.inset-0').exists()).toBe(true);
    expect(wrapper.text()).toContain('祭拜 Ancestor 1');
  });

  it('makes an offering', async () => {
    const wrapper = mount(Worship);
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    // Select ancestor
    await wrapper.find('.cursor-pointer').trigger('click');

    // Find offering buttons
    const offeringButtons = wrapper.findAll('button.flex.flex-col');
    expect(offeringButtons.length).toBeGreaterThan(0);
    // Click first offering (e.g. Incense)
    const firstButton = offeringButtons[0];
    if (firstButton) {
      await firstButton.trigger('click');
    }

    // Check if offering count increases (visually represented by bouncing elements)
    const bouncingElements = wrapper.findAll('.animate-bounce');
    expect(bouncingElements.length).toBeGreaterThan(0);
    
    // Check if record is added locally
    expect(wrapper.text()).toContain('我 献上了');
  });
});
