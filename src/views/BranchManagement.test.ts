import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BranchManagement from './BranchManagement.vue';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    getBranches: vi.fn(),
    getBranchReviews: vi.fn(),
  },
}));

describe('BranchManagement.vue', () => {
  const mockBranches = [
    {
      id: '1',
      name: 'Main Branch',
      ancestor: 'Ancestor 1',
      moveDate: 'Date 1',
      description: 'Desc 1',
      contactPerson: 'Contact 1',
      contactPhone: '123456',
      memberCount: 100,
      pendingReviews: 1,
      isMain: true
    }
  ];

  const mockReviews = [
    {
      id: 'r1',
      type: 'info_update',
      title: 'Update Info',
      submitter: 'User 1',
      branch: 'Main Branch',
      date: '2024-01-01'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (api.getBranches as any).mockResolvedValue(mockBranches);
    (api.getBranchReviews as any).mockResolvedValue(mockReviews);
    
    // Mock window.confirm
    window.confirm = vi.fn(() => true);
    // Mock window.alert (if used)
    window.alert = vi.fn();
  });

  it('renders and fetches data', async () => {
    const wrapper = mount(BranchManagement, {
      global: {
        stubs: ['router-link']
      }
    });

    expect(api.getBranches).toHaveBeenCalled();
    expect(api.getBranchReviews).toHaveBeenCalled();

    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Main Branch');
    expect(wrapper.text()).toContain('Update Info');
  });

  it('adds a new branch', async () => {
    const wrapper = mount(BranchManagement, {
      global: {
        stubs: ['router-link']
      }
    });
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    // Open modal
    await wrapper.find('button.bg-blue-600').trigger('click'); // "新增支系" button
    
    // Fill form
    const inputs = wrapper.findAll('input');
    expect(inputs.length).toBeGreaterThanOrEqual(3);
    
    await inputs[0]!.setValue('New Branch'); // Name
    await inputs[1]!.setValue('Ancestor 2'); // Ancestor
    await inputs[2]!.setValue('Contact 2'); // Contact

    // Submit
    await wrapper.find('form').trigger('submit.prevent');

    // Check if added
    expect(wrapper.text()).toContain('New Branch');
    expect(wrapper.text()).toContain('Ancestor 2');
  });

  it('approves a review', async () => {
    const wrapper = mount(BranchManagement, {
      global: {
        stubs: ['router-link']
      }
    });
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    const approveBtn = wrapper.find('button.bg-green-50');
    await approveBtn.trigger('click');

    expect(window.confirm).toHaveBeenCalled();
    // Review should be removed from list
    expect(wrapper.text()).not.toContain('Update Info');
  });

  it('rejects a review', async () => {
    const wrapper = mount(BranchManagement, {
      global: {
        stubs: ['router-link']
      }
    });
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    const rejectBtn = wrapper.find('button.bg-red-50');
    await rejectBtn.trigger('click');

    expect(window.confirm).toHaveBeenCalled();
    // Review should be removed from list
    expect(wrapper.text()).not.toContain('Update Info');
  });
});
