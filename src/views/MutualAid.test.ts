import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MutualAid from './MutualAid.vue';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    getMutualAid: vi.fn(),
  },
}));

describe('MutualAid.vue', () => {
  const mockInitiatives = [
    {
      id: '1',
      title: 'Scholarship',
      type: 'education',
      description: 'Desc 1',
      goal: 1000,
      raised: 500,
      date: '2024-01-01',
      recentDonors: [],
      donorCount: 0
    },
    {
      id: '2',
      title: 'Medical Aid',
      type: 'medical',
      description: 'Desc 2',
      goal: 2000,
      raised: 100,
      date: '2024-01-02',
      recentDonors: [],
      donorCount: 0
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (api.getMutualAid as any).mockResolvedValue(mockInitiatives);
    window.alert = vi.fn();
  });

  it('renders and fetches initiatives', async () => {
    const wrapper = mount(MutualAid);
    
    expect(api.getMutualAid).toHaveBeenCalled();
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Scholarship');
    expect(wrapper.text()).toContain('Medical Aid');
  });

  it('filters initiatives', async () => {
    const wrapper = mount(MutualAid);
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    // Click 'Education' filter button (find by text '助学')
    const buttons = wrapper.findAll('button');
    const eduBtn = buttons.find(b => b.text() === '助学');
    expect(eduBtn).toBeDefined();
    await eduBtn!.trigger('click');

    expect(wrapper.text()).toContain('Scholarship');
    expect(wrapper.text()).not.toContain('Medical Aid');
  });

  it('opens create modal and submits form', async () => {
    const wrapper = mount(MutualAid);
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    // Click create button
    const createBtn = wrapper.find('button.bg-amber-900');
    await createBtn.trigger('click');

    // Fill form
    const inputs = wrapper.findAll('input');
    const textarea = wrapper.find('textarea');
    
    await inputs[0]!.setValue('New Initiative'); // Title
    await inputs[1]!.setValue('5000'); // Goal
    await textarea.setValue('Help needed'); // Description

    // Submit
    await wrapper.find('form').trigger('submit.prevent');

    expect(window.alert).toHaveBeenCalled();
    // Check if added to list (at top)
    expect(wrapper.text()).toContain('New Initiative');
  });
});
