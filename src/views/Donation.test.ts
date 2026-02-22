import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Donation from './Donation.vue';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    getDonations: vi.fn(),
  },
}));

describe('Donation.vue', () => {
  const mockDonations = [
    { name: 'Donor 1', amount: 100, purpose: 'general', date: '2024-01-01' },
    { name: 'Donor 2', amount: 200, purpose: 'temple', date: '2024-01-02' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (api.getDonations as any).mockResolvedValue(mockDonations);
    window.alert = vi.fn();
  });

  it('renders and fetches donations', async () => {
    const wrapper = mount(Donation);
    
    expect(api.getDonations).toHaveBeenCalled();
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Donor 1');
    expect(wrapper.text()).toContain('Donor 2');
  });

  it('submits a new donation', async () => {
    const wrapper = mount(Donation);
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    // Fill form
    const inputs = wrapper.findAll('input');
    await inputs[0]!.setValue('New Donor'); // Name
    await inputs[1]!.setValue('500'); // Amount

    // Submit
    await wrapper.find('form').trigger('submit.prevent');

    expect(window.alert).toHaveBeenCalled();
    
    // Check if added to honor roll
    expect(wrapper.text()).toContain('New Donor');
    expect(wrapper.text()).toContain('¥500');
  });

  it('prevents submission if fields empty', async () => {
    const wrapper = mount(Donation);
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    // Submit empty form
    await wrapper.find('form').trigger('submit.prevent');

    expect(window.alert).not.toHaveBeenCalled();
  });
});
