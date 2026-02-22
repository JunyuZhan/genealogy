<template>
  <div class="family-tree-container overflow-hidden w-full h-full relative" ref="containerRef">
    <svg ref="svgRef" class="w-full h-full cursor-grab active:cursor-grabbing">
      <g ref="gRef"></g>
    </svg>
    
    <div class="absolute top-4 right-4 flex flex-col gap-2">
      <button @click="resetZoom" class="bg-white p-2 rounded shadow hover:bg-gray-100" title="Reset Zoom">
        <span class="text-xl">↺</span>
      </button>
    </div>

    <ContextMenu 
      :is-visible="menuVisible"
      :position="menuPosition"
      :member-name="selectedMember?.name || ''"
      :is-alive="selectedMember?.isAlive"
      @close="menuVisible = false"
      @action="handleMenuAction"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import * as d3 from 'd3';
import { type Member } from '../../types';
import { type D3MemberNode, transformToD3Tree } from '../../utils/treeBuilder';
import ContextMenu from './ContextMenu.vue';

const props = defineProps<{
  members: Member[];
  rootId: string;
}>();

const emit = defineEmits<{
  (e: 'add-child', memberId: string): void;
  (e: 'add-spouse', memberId: string): void;
  (e: 'edit', memberId: string): void;
  (e: 'edit-cemetery', memberId: string): void;
  (e: 'delete', memberId: string): void;
  (e: 'worship', memberId: string): void;
}>();

const containerRef = ref<HTMLElement | null>(null);
const svgRef = ref<SVGSVGElement | null>(null);
const gRef = ref<SVGGElement | null>(null);

// Menu State
const menuVisible = ref(false);
const menuPosition = ref({ x: 0, y: 0 });
const selectedMember = ref<{ id: string; name: string; isAlive: boolean } | null>(null);

function handleContextMenu(event: MouseEvent, d: d3.HierarchyNode<D3MemberNode>) {
  event.preventDefault();
  menuVisible.value = true;
  menuPosition.value = { x: event.clientX, y: event.clientY };
  selectedMember.value = { id: d.data.id, name: d.data.name, isAlive: d.data.isAlive };
}

function handleMenuAction(action: 'add-child' | 'add-spouse' | 'edit' | 'delete' | 'edit-cemetery' | 'worship') {
  if (!selectedMember.value) return;
  
  if (action === 'add-child') emit('add-child', selectedMember.value.id);
  else if (action === 'add-spouse') emit('add-spouse', selectedMember.value.id);
  else if (action === 'edit') emit('edit', selectedMember.value.id);
  else if (action === 'delete') emit('delete', selectedMember.value.id);
  else if (action === 'edit-cemetery') emit('edit-cemetery', selectedMember.value.id);
  else if (action === 'worship') emit('worship', selectedMember.value.id);

  menuVisible.value = false;
}

// Configuration
const config = {
  nodeWidth: 180,
  nodeHeight: 80,
  levelSpacing: 150, // Vertical spacing between generations
  siblingSpacing: 200, // Horizontal spacing between siblings
  duration: 500
};

let zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;

onMounted(() => {
  if (props.members.length > 0 && props.rootId) {
    renderTree();
  }
});

watch(() => [props.members, props.rootId], () => {
  renderTree();
}, { deep: true });

function resetZoom() {
  if (svgRef.value && zoom) {
    d3.select(svgRef.value)
      .transition()
      .duration(750)
      .call(zoom.transform, d3.zoomIdentity.translate(window.innerWidth / 2, 50).scale(1));
  }
}

function renderTree() {
  if (!svgRef.value || !gRef.value || !containerRef.value) return;

  const width = containerRef.value.clientWidth;
  // const height = containerRef.value.clientHeight;

  // 1. Transform data
  const rootData = transformToD3Tree(props.members, props.rootId);
  if (!rootData) {
    console.error("Root member not found or tree build failed");
    return;
  }

  // 2. Setup Hierarchy
  const root = d3.hierarchy<D3MemberNode>(rootData);
  
  // 3. Setup Tree Layout
  const treeLayout = d3.tree<D3MemberNode>()
    .nodeSize([config.nodeWidth + 20, config.nodeHeight + config.levelSpacing]);

  // Initial calculation
  treeLayout(root);

  // 4. Setup Zoom
  zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 2])
    .on('zoom', (event) => {
      d3.select(gRef.value).attr('transform', event.transform);
    });

  d3.select(svgRef.value).call(zoom);
  
  // Center initial view
  d3.select(svgRef.value).call(
    zoom.transform, 
    d3.zoomIdentity.translate(width / 2, 50).scale(0.8)
  );

  update(root);
}

function update(source: d3.HierarchyNode<D3MemberNode>) {
  if (!gRef.value) return;
  
  const g = d3.select(gRef.value);
  
  // Re-compute layout
  // Note: d3.tree computes x and y. 
  // For vertical tree: x is horizontal position, y is depth (vertical)
  const treeLayout = d3.tree<D3MemberNode>()
    .nodeSize([config.nodeWidth + 40, config.nodeHeight + 80]);
    
  treeLayout(source);

  // Get nodes and links
  const nodes = source.descendants();
  const links = source.links();

  // Normalize depth (Y-axis) - ensure generation alignment
  nodes.forEach(d => {
    d.y = d.depth * config.levelSpacing;
  });

  // --- NODES ---
  const node = g.selectAll<SVGGElement, d3.HierarchyNode<D3MemberNode>>('g.node')
    .data(nodes, d => d.data.id);

  // Enter nodes
  const nodeEnter = node.enter().append('g')
    .attr('class', 'node')
    .attr('transform', () => `translate(${source.x ?? 0},${source.y ?? 0})`)
    .attr('cursor', 'pointer')
    .on('click', (_event, d) => {
        toggleChildren(d);
        update(d); // Update from clicked node
    })
    .on('contextmenu', (event, d) => {
        handleContextMenu(event, d);
    });

  // Node Card (Rectangle)
  nodeEnter.append('rect')
    .attr('width', config.nodeWidth)
    .attr('height', config.nodeHeight)
    .attr('x', -config.nodeWidth / 2)
    .attr('y', -config.nodeHeight / 2)
    .attr('rx', 5)
    .attr('ry', 5)
    .attr('stroke', d => d.data.gender === 'M' ? '#1e40af' : '#be123c') // Blue/Red border
    .attr('stroke-width', 2)
    .attr('fill', d => d.data.isAlive ? '#ffffff' : '#f3f4f6'); // Gray bg if dead

  // Name Text
  nodeEnter.append('text')
    .attr('dy', '-0.5em')
    .attr('text-anchor', 'middle')
    .attr('font-weight', 'bold')
    .attr('font-size', '14px')
    .attr('fill', '#374151')
    .text(d => d.data.name);
    
  // Spouse Text (Simplified for now)
  nodeEnter.append('text')
    .attr('dy', '1.2em')
    .attr('text-anchor', 'middle')
    .attr('font-size', '12px')
    .attr('fill', '#6b7280')
    .text(d => {
        const spouses = d.data.spouses;
        if (spouses && spouses.length > 0) {
            return `配: ${spouses.map(s => s.name).join(',')}`;
        }
        return '';
    });

  // Expand/Collapse Circle indicator
  nodeEnter.append('circle')
    .attr('class', 'toggler')
    .attr('r', 6)
    .attr('cy', config.nodeHeight / 2)
    .attr('fill', '#fff')
    .attr('stroke', '#9ca3af')
    .attr('stroke-width', 1)
    .style('opacity', d => (d.children || d.data._children) ? 1 : 0); // Only show if has children

  // UPDATE nodes
  const nodeUpdate = node.merge(nodeEnter)
    .transition().duration(config.duration)
    .attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`);
    
  // Update Toggler style (filled if collapsed)
  nodeUpdate.select('circle.toggler')
    .attr('fill', d => (d.data._children ? '#9ca3af' : '#fff')); // Filled if collapsed

  // Exit nodes
  node.exit()
    .transition().duration(config.duration)
    .attr('transform', () => `translate(${source.x ?? 0},${source.y ?? 0})`) // Shrink to parent
    .style('opacity', 0)
    .remove();

  // --- LINKS ---
  const link = g.selectAll<SVGPathElement, d3.HierarchyLink<D3MemberNode>>('path.link')
    .data(links, d => d.target.data.id);

  // Enter links
  const linkEnter = link.enter().insert('path', '.node')
    .attr('class', 'link')
    .attr('fill', 'none')
    .attr('stroke', '#cbd5e1')
    .attr('stroke-width', 1.5)
    .attr('d', () => {
        // Start at parent
        const o = { x: source.x ?? 0, y: source.y ?? 0 };
        return diagonal(o, o);
    });

  // Update links
  link.merge(linkEnter)
    .transition().duration(config.duration)
    .attr('d', d => diagonal(
      {x: d.source.x ?? 0, y: d.source.y ?? 0}, 
      {x: d.target.x ?? 0, y: d.target.y ?? 0}
    ));

  // Exit links
  link.exit()
    .transition().duration(config.duration)
    .attr('d', () => {
        const o = { x: source.x ?? 0, y: source.y ?? 0 };
        return diagonal(o, o);
    })
    .remove();
}

// Custom diagonal generator for elbow/curved lines
function diagonal(s: {x: number, y: number}, d: {x: number, y: number}) {
  // Simple cubic bezier curve
  // M s.x, s.y 
  // C s.x, (s.y + d.y) / 2
  //   d.x, (s.y + d.y) / 2
  //   d.x, d.y
  
  // Adjust start point to bottom of rect, end point to top of rect
  const startY = s.y + config.nodeHeight / 2;
  const endY = d.y - config.nodeHeight / 2;
  
  return `M ${s.x} ${startY}
          C ${s.x} ${(startY + endY) / 2},
            ${d.x} ${(startY + endY) / 2},
            ${d.x} ${endY}`;
}

function toggleChildren(d: any) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
    // We also need to update the data object to persist state across renders if we were re-calculating from scratch
    // But here d is a D3 Node, so modifying it is enough for the current session
    if (d.data) d.data._children = d._children;
  } else {
    d.children = d._children;
    d._children = null;
    if (d.data) d.data._children = null;
  }
}
</script>

<style scoped>
/* Add any specific styles here if Tailwind is not enough */
</style>
