<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as d3 from 'd3';
import type { Person, RelationLink } from '../data/mockData';

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  photo: string;
  data: Record<string, unknown>;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  label: string;
}

const props = defineProps<{
  persons: Person[];
  links: RelationLink[];
}>();

const svgRef = ref<SVGSVGElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);
const tooltip = ref<{ visible: boolean; x: number; y: number; person: Person | null }>({
  visible: false,
  x: 0,
  y: 0,
  person: null,
});

const NODE_R = 36;
let simulation: d3.Simulation<SimNode, SimLink> | null = null;

const formatData = (data: Record<string, unknown>) =>
  Object.entries(data).map(([k, v]) => ({ key: k, value: String(v) }));

function buildGraph() {
  if (!svgRef.value || !containerRef.value) return;

  const width = containerRef.value.clientWidth;
  const height = containerRef.value.clientHeight;

  const svg = d3.select(svgRef.value);
  svg.selectAll('*').remove();

  svg
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`);

  // Defs: arrowhead + clip paths per node
  const defs = svg.append('defs');

  defs
    .append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', NODE_R + 12)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#94a3b8');

  props.persons.forEach((p) => {
    defs
      .append('clipPath')
      .attr('id', `clip-${p.id}`)
      .append('circle')
      .attr('r', NODE_R)
      .attr('cx', 0)
      .attr('cy', 0);
  });

  const nodes: SimNode[] = props.persons.map((p) => ({ ...p }));
  const linksData: SimLink[] = props.links.map((l) => ({
    source: l.source,
    target: l.target,
    label: l.label,
  }));

  simulation = d3
    .forceSimulation<SimNode, SimLink>(nodes)
    .force(
      'link',
      d3
        .forceLink<SimNode, SimLink>(linksData)
        .id((d) => d.id)
        .distance(160)
    )
    .force('charge', d3.forceManyBody().strength(-400))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide(NODE_R + 20));

  const root = svg.append('g').attr('class', 'root');

  // Zoom & pan
  const zoom = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.3, 3])
    .on('zoom', (event) => {
      root.attr('transform', event.transform);
    });
  svg.call(zoom);

  // Links
  const link = root
    .append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(linksData)
    .join('line')
    .attr('stroke', '#94a3b8')
    .attr('stroke-width', 1.5)
    .attr('stroke-dasharray', '6 3')
    .attr('marker-end', 'url(#arrow)');

  const linkLabel = root
    .append('g')
    .attr('class', 'link-labels')
    .selectAll('text')
    .data(linksData)
    .join('text')
    .attr('text-anchor', 'middle')
    .attr('font-size', 10)
    .attr('fill', '#64748b')
    .attr('dy', -4)
    .text((d) => d.label);

  // Nodes
  const node = root
    .append('g')
    .attr('class', 'nodes')
    .selectAll<SVGGElement, SimNode>('g')
    .data(nodes)
    .join('g')
    .attr('class', 'node')
    .style('cursor', 'grab');

  // Shadow circle
  node
    .append('circle')
    .attr('r', NODE_R + 2)
    .attr('fill', 'rgba(0,0,0,0.15)')
    .attr('cy', 3);

  // White background circle
  node
    .append('circle')
    .attr('r', NODE_R)
    .attr('fill', '#fff')
    .attr('stroke', '#e2e8f0')
    .attr('stroke-width', 2);

  // Person photo
  node
    .append('image')
    .attr('href', (d) => d.photo)
    .attr('x', -NODE_R)
    .attr('y', -NODE_R)
    .attr('width', NODE_R * 2)
    .attr('height', NODE_R * 2)
    .attr('clip-path', (d) => `url(#clip-${d.id})`);

  // Ring border on top
  node
    .append('circle')
    .attr('r', NODE_R)
    .attr('fill', 'none')
    .attr('stroke', '#3b82f6')
    .attr('stroke-width', 2.5)
    .style('transition', 'stroke 0.2s');

  // Name label
  node
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', NODE_R + 16)
    .attr('font-size', 12)
    .attr('font-weight', '600')
    .attr('fill', '#1e293b')
    .text((d) => d.name);

  // Hover interactions
  node
    .on('mouseenter', function (event: MouseEvent, d: SimNode) {
      d3.select(this).select('circle:nth-child(3)').attr('stroke', '#2563eb').attr('stroke-width', 4);
      const rect = containerRef.value!.getBoundingClientRect();
      tooltip.value = {
        visible: true,
        x: event.clientX - rect.left + 16,
        y: event.clientY - rect.top + 16,
        person: props.persons.find((p) => p.id === d.id) ?? null,
      };
    })
    .on('mousemove', function (event: MouseEvent) {
      const rect = containerRef.value!.getBoundingClientRect();
      tooltip.value.x = event.clientX - rect.left + 16;
      tooltip.value.y = event.clientY - rect.top + 16;
    })
    .on('mouseleave', function () {
      d3.select(this).select('circle:nth-child(3)').attr('stroke', '#3b82f6').attr('stroke-width', 2.5);
      tooltip.value.visible = false;
    });

  // Drag behavior
  const drag = d3
    .drag<SVGGElement, SimNode>()
    .on('start', (event, d) => {
      if (!event.active) simulation!.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
      d3.select(event.sourceEvent.target.closest('.node')).style('cursor', 'grabbing');
    })
    .on('drag', (event, d) => {
      d.fx = event.x;
      d.fy = event.y;
    })
    .on('end', (event) => {
      if (!event.active) simulation!.alphaTarget(0);
      d3.select(event.sourceEvent.target.closest('.node')).style('cursor', 'grab');
    });

  node.call(drag);

  simulation.on('tick', () => {
    link
      .attr('x1', (d) => (d.source as SimNode).x ?? 0)
      .attr('y1', (d) => (d.source as SimNode).y ?? 0)
      .attr('x2', (d) => (d.target as SimNode).x ?? 0)
      .attr('y2', (d) => (d.target as SimNode).y ?? 0);

    linkLabel
      .attr('x', (d) => (((d.source as SimNode).x ?? 0) + ((d.target as SimNode).x ?? 0)) / 2)
      .attr('y', (d) => (((d.source as SimNode).y ?? 0) + ((d.target as SimNode).y ?? 0)) / 2);

    node.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
  });
}

const resizeObs = ref<ResizeObserver | null>(null);

onMounted(() => {
  buildGraph();
  resizeObs.value = new ResizeObserver(() => buildGraph());
  if (containerRef.value) resizeObs.value.observe(containerRef.value);
});

onUnmounted(() => {
  simulation?.stop();
  resizeObs.value?.disconnect();
});

watch(() => [props.persons, props.links], buildGraph, { deep: true });
</script>

<template>
  <div ref="containerRef" class="graph-container">
    <svg ref="svgRef" class="graph-svg" />

    <!-- Tooltip -->
    <Transition name="tooltip">
      <div
        v-if="tooltip.visible && tooltip.person"
        class="tooltip"
        :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }"
      >
        <div class="tooltip-header">
          <img :src="tooltip.person.photo" class="tooltip-photo" :alt="tooltip.person.name" />
          <div>
            <div class="tooltip-name">{{ tooltip.person.name }}</div>
            <div class="tooltip-id">ID: {{ tooltip.person.id }}</div>
          </div>
        </div>
        <div class="tooltip-divider" />
        <div class="tooltip-body">
          <div
            v-for="item in formatData(tooltip.person.data)"
            :key="item.key"
            class="tooltip-row"
          >
            <span class="tooltip-key">{{ item.key }}</span>
            <span class="tooltip-val">{{ item.value }}</span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.graph-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.graph-svg {
  display: block;
  width: 100%;
  height: 100%;
}

.tooltip {
  position: absolute;
  z-index: 50;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px;
  min-width: 220px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  pointer-events: none;
}

.tooltip-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.tooltip-photo {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid #3b82f6;
  object-fit: cover;
}

.tooltip-name {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}

.tooltip-id {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

.tooltip-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 8px 0;
}

.tooltip-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tooltip-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
}

.tooltip-key {
  color: #64748b;
  font-weight: 500;
  text-transform: capitalize;
}

.tooltip-val {
  color: #0f172a;
  font-weight: 600;
  text-align: right;
}

.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
