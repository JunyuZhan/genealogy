import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import GenerationIndex from './GenerationIndex.vue';
import type { Member } from '../../types';

describe('components/book/GenerationIndex.vue', () => {
  const createMembers = (): Member[] => [
    {
      id: '1',
      name: '张三',
      generation: 5,
      generationWord: '德',
      gender: 'M',
      isAlive: true,
      birthDate: '1990-01-01',
      parents: [],
      children: [],
      spouses: [],
      branchName: '长房',
      isFloating: false,
      cemetery: null,
      order: 1
    },
    {
      id: '2',
      name: '张五',
      generation: 5,
      generationWord: '德',
      gender: 'M',
      isAlive: true,
      birthDate: '1992-01-01',
      parents: [],
      children: [],
      spouses: [],
      branchName: '长房',
      isFloating: false,
      cemetery: null,
      order: 2
    },
    {
      id: '3',
      name: '张六',
      generation: 6,
      generationWord: '敬',
      gender: 'M',
      isAlive: true,
      birthDate: '1995-01-01',
      parents: [],
      children: [],
      spouses: [],
      branchName: '长房',
      isFloating: false,
      cemetery: null,
      order: 1
    }
  ];

  it('should render title', () => {
    const wrapper = mount(GenerationIndex, {
      props: { members: [] }
    });

    expect(wrapper.find('h3').text()).toContain('字辈索引');
  });

  it('should group members by generation', () => {
    const members = createMembers();
    const wrapper = mount(GenerationIndex, {
      props: { members }
    });

    expect(wrapper.findAll('.border-b.border-gray-100').length).toBe(2);
  });

  it('should show generation number and word', () => {
    const members = createMembers();
    const wrapper = mount(GenerationIndex, {
      props: { members }
    });

    expect(wrapper.text()).toContain('第5世');
    expect(wrapper.text()).toContain('"德"');
  });

  it('should show member count', () => {
    const members = createMembers();
    const wrapper = mount(GenerationIndex, {
      props: { members }
    });

    expect(wrapper.text()).toContain('2人');
    expect(wrapper.text()).toContain('1人');
  });

  it('should emit close event when close button clicked', async () => {
    const wrapper = mount(GenerationIndex, {
      props: { members: [] }
    });

    await wrapper.find('button').trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('should toggle expansion on click', async () => {
    const members = createMembers();
    const wrapper = mount(GenerationIndex, {
      props: { members }
    });

    const elements = wrapper.findAll('.cursor-pointer');
    await elements[0]?.trigger('click');

    expect(wrapper.findAll('.bg-white.py-1').length).toBe(1);
  });

  it('should emit select event when member clicked', async () => {
    const members = createMembers();
    const wrapper = mount(GenerationIndex, {
      props: { members }
    });

    const elements = wrapper.findAll('.cursor-pointer');
    await elements[0]?.trigger('click');
    const memberElements = wrapper.findAll('.px-4');
    await memberElements[0]?.trigger('click');

    expect(wrapper.emitted('select')).toBeTruthy();
  });

  it('should handle empty members', () => {
    const wrapper = mount(GenerationIndex, {
      props: { members: [] }
    });

    expect(wrapper.find('h3').text()).toContain('字辈索引');
  });
});
