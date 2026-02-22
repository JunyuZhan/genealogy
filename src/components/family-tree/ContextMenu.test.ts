import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ContextMenu from './ContextMenu.vue';

describe('components/family-tree/ContextMenu.vue', () => {
  const createProps = (overrides: any = {}) => ({
    isVisible: true,
    position: { x: 100, y: 200 },
    memberName: '张三',
    isAlive: true,
    ...overrides
  });

  it('should render when visible', () => {
    const wrapper = mount(ContextMenu, {
      props: createProps()
    });

    expect(wrapper.find('.fixed').exists()).toBe(true);
    expect(wrapper.text()).toContain('张三');
  });

  it('should not render when not visible', () => {
    const wrapper = mount(ContextMenu, {
      props: createProps({ isVisible: false })
    });

    expect(wrapper.find('.fixed').exists()).toBe(false);
  });

  it('should display all menu items', () => {
    const wrapper = mount(ContextMenu, {
      props: createProps({ isAlive: true })
    });

    expect(wrapper.text()).toContain('添加子女');
    expect(wrapper.text()).toContain('添加配偶');
    expect(wrapper.text()).toContain('编辑墓址');
    expect(wrapper.text()).toContain('编辑信息');
    expect(wrapper.text()).toContain('删除成员');
  });

  it('should not show worship option for alive members', () => {
    const wrapper = mount(ContextMenu, {
      props: createProps({ isAlive: true })
    });

    expect(wrapper.text()).not.toContain('在线祭扫');
  });

  it('should show worship option for deceased members', () => {
    const wrapper = mount(ContextMenu, {
      props: createProps({ isAlive: false })
    });

    expect(wrapper.text()).toContain('在线祭扫');
  });

  it('should emit close event when overlay is clicked', async () => {
    const wrapper = mount(ContextMenu, {
      props: createProps()
    });

    await wrapper.find('.fixed.inset-0').trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('should emit action event with add-child when button clicked', async () => {
    const wrapper = mount(ContextMenu, {
      props: createProps()
    });

    const buttons = wrapper.findAll('button');
    await buttons[0]?.trigger('click');

    expect(wrapper.emitted('action')).toBeTruthy();
    expect(wrapper.emitted('action')?.[0]).toEqual(['add-child']);
  });

  it('should emit action event with add-spouse when button clicked', async () => {
    const wrapper = mount(ContextMenu, {
      props: createProps()
    });

    const buttons = wrapper.findAll('button');
    await buttons[1]?.trigger('click');

    expect(wrapper.emitted('action')).toBeTruthy();
    expect(wrapper.emitted('action')?.[0]).toEqual(['add-spouse']);
  });

  it('should emit action event with edit-cemetery when button clicked', async () => {
    const wrapper = mount(ContextMenu, {
      props: createProps()
    });

    const buttons = wrapper.findAll('button');
    await buttons[2]?.trigger('click');

    expect(wrapper.emitted('action')).toBeTruthy();
    expect(wrapper.emitted('action')?.[0]).toEqual(['edit-cemetery']);
  });

  it('should emit action event with edit when button clicked', async () => {
    const wrapper = mount(ContextMenu, {
      props: createProps()
    });

    const buttons = wrapper.findAll('button');
    await buttons[3]?.trigger('click');

    expect(wrapper.emitted('action')).toBeTruthy();
    expect(wrapper.emitted('action')?.[0]).toEqual(['edit']);
  });

  it('should emit action event with delete when button clicked', async () => {
    const wrapper = mount(ContextMenu, {
      props: createProps({ isAlive: false })
    });

    const buttons = wrapper.findAll('button');
    const deleteButton = buttons[buttons.length - 1];
    await deleteButton?.trigger('click');

    expect(wrapper.emitted('action')).toBeTruthy();
    expect(wrapper.emitted('action')?.[0]).toEqual(['delete']);
  });

  it('should position menu correctly', () => {
    const wrapper = mount(ContextMenu, {
      props: createProps({ position: { x: 150, y: 250 } })
    });

    const menu = wrapper.find('.fixed.bg-white');
    expect(menu.attributes('style')).toContain('left: 150px');
    expect(menu.attributes('style')).toContain('top: 250px');
  });
});
