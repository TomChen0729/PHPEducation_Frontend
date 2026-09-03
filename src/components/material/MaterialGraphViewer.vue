<template>
  <div class="material-graph-viewer" :class="themeClass">
    <!-- Toolbar -->
    <div class="material-graph-viewer__toolbar">
      <q-input
        v-model="searchText"
        dense
        outlined
        clearable
        placeholder="搜尋章節、單元或知識卡"
        class="material-graph-viewer__search"
        @keyup.enter="searchNode"
        @clear="searchMessage = ''"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>

        <template #append>
          <q-btn flat dense round icon="arrow_forward" @click="searchNode" />
        </template>
      </q-input>

      <div class="material-graph-viewer__toolbar-actions">
        <q-btn flat round icon="zoom_in" @click="zoomIn">
          <q-tooltip> 放大 </q-tooltip>
        </q-btn>

        <q-btn flat round icon="zoom_out" @click="zoomOut">
          <q-tooltip> 縮小 </q-tooltip>
        </q-btn>

        <q-btn flat round icon="center_focus_strong" @click="fitGraph">
          <q-tooltip> 置中 </q-tooltip>
        </q-btn>

        <q-btn flat round icon="hub" @click="rearrangeGraph">
          <q-tooltip> 重新排列 </q-tooltip>
        </q-btn>
      </div>
    </div>

    <div v-if="searchMessage" class="material-graph-viewer__search-message">
      {{ searchMessage }}
    </div>

    <!-- Legend -->
    <div class="material-graph-viewer__legend">
      <div class="material-graph-viewer__legend-item">
        <span
          class="material-graph-viewer__legend-dot"
          :style="{
            backgroundColor: levelColors.course,
          }"
        />

        課程
      </div>

      <div class="material-graph-viewer__legend-item">
        <span
          class="material-graph-viewer__legend-dot"
          :style="{
            backgroundColor: levelColors.chapter,
          }"
        />

        章節
      </div>

      <div class="material-graph-viewer__legend-item">
        <span
          class="material-graph-viewer__legend-dot"
          :style="{
            backgroundColor: levelColors.unit,
          }"
        />

        單元
      </div>

      <div v-for="type in cardTypes" :key="type" class="material-graph-viewer__legend-item">
        <span
          class="material-graph-viewer__legend-dot"
          :style="{
            backgroundColor: getCardColor(type),
          }"
        />

        {{ type }}
      </div>
    </div>

    <!-- Graph -->
    <div
      class="material-graph-viewer__body"
      :class="{
        'material-graph-viewer__body--detail': selectedMeta !== null,
      }"
    >
      <div class="material-graph-viewer__canvas-wrapper">
        <div v-if="!tree" class="material-graph-viewer__empty">
          <q-icon name="hub" size="54px" />

          <div>目前沒有可顯示的教材圖譜</div>
        </div>

        <div v-show="tree" ref="networkContainer" class="material-graph-viewer__canvas" />
      </div>

      <!-- Detail -->
      <aside v-if="selectedMeta" class="material-graph-viewer__detail">
        <div class="material-graph-viewer__detail-header">
          <div>
            <q-badge :color="selectedBadgeColor" :label="selectedKindLabel" />

            <div class="material-graph-viewer__detail-title">
              {{ selectedMeta.title }}
            </div>
          </div>

          <q-btn flat round dense icon="close" @click="clearSelection" />
        </div>

        <q-separator />

        <div class="material-graph-viewer__detail-content">
          <template v-if="selectedMeta.kind !== 'card'">
            <div v-if="selectedMeta.number" class="material-graph-viewer__detail-row">
              <div class="material-graph-viewer__detail-label">階層編號</div>

              <div>
                {{ selectedMeta.number }}
              </div>
            </div>

            <div class="material-graph-viewer__detail-row">
              <div class="material-graph-viewer__detail-label">下層項目</div>

              <div>{{ selectedMeta.itemCount ?? 0 }} 項</div>
            </div>
          </template>

          <template v-else-if="selectedMeta.card">
            <div class="material-graph-viewer__detail-row">
              <div class="material-graph-viewer__detail-label">類別</div>

              <q-badge
                outline
                :style="{
                  color: getCardColor(selectedMeta.card.type || 'keyword'),
                }"
                :label="selectedMeta.card.type || 'keyword'"
              />
            </div>

            <div v-if="selectedMeta.paths.length > 0" class="material-graph-viewer__detail-section">
              <div class="material-graph-viewer__detail-label">所屬位置</div>

              <div class="material-graph-viewer__paths">
                <q-chip v-for="path in selectedMeta.paths" :key="path" dense outline>
                  {{ path }}
                </q-chip>
              </div>
            </div>

            <div class="material-graph-viewer__detail-section">
              <div class="material-graph-viewer__detail-label">教材內容</div>

              <RichContentViewer :content="selectedMeta.card.content" />
            </div>

            <div v-if="selectedMeta.card.example" class="material-graph-viewer__detail-section">
              <div class="material-graph-viewer__detail-label">程式範例</div>

              <CodeExampleViewer :code="selectedMeta.card.example" :theme="theme" />
            </div>
          </template>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import { DataSet } from 'vis-data';

import { Network } from 'vis-network';

import type { Edge, Node, Options } from 'vis-network';

import RichContentViewer from '../common/RichContentViewer.vue';

import CodeExampleViewer from '../common/CodeExampleViewer.vue';

import type { MaterialCourseTree, MaterialKnowledgeCardNode } from '../../types/material';

type GraphNodeKind = 'course' | 'chapter' | 'unit' | 'card';

interface GraphNodeMeta {
  id: string;
  kind: GraphNodeKind;
  title: string;
  number?: string;
  itemCount?: number;
  card?: MaterialKnowledgeCardNode;
  paths: string[];
}

interface NetworkClickParams {
  nodes: Array<string | number>;
}

const props = withDefaults(
  defineProps<{
    tree: MaterialCourseTree | null;

    theme?: 'teacher' | 'student';
  }>(),
  {
    theme: 'teacher',
  },
);

const networkContainer = ref<HTMLDivElement | null>(null);

const selectedNodeId = ref<string | null>(null);

const searchText = ref('');

const searchMessage = ref('');

let network: Network | null = null;

const nodeMeta = new Map<string, GraphNodeMeta>();

const theme = computed(() => props.theme);

const themeClass = computed(() =>
  props.theme === 'student' ? 'material-graph-viewer--student' : 'material-graph-viewer--teacher',
);

const levelColors = computed(() => {
  if (props.theme === 'student') {
    return {
      course: '#00796b',
      chapter: '#00838f',
      unit: '#43a047',
    };
  }

  return {
    course: '#1565c0',
    chapter: '#5c6bc0',
    unit: '#26a69a',
  };
});

const selectedMeta = computed(() => {
  if (!selectedNodeId.value) {
    return null;
  }

  return nodeMeta.get(selectedNodeId.value) ?? null;
});

const selectedKindLabel = computed(() => {
  switch (selectedMeta.value?.kind) {
    case 'course':
      return '課程';

    case 'chapter':
      return '章節';

    case 'unit':
      return '單元';

    case 'card':
      return '知識卡';

    default:
      return '';
  }
});

const selectedBadgeColor = computed(() => {
  switch (selectedMeta.value?.kind) {
    case 'course':
      return props.theme === 'student' ? 'teal' : 'blue';

    case 'chapter':
      return 'indigo';

    case 'unit':
      return 'teal';

    case 'card':
      return 'blue-grey';

    default:
      return 'grey';
  }
});

const cardTypes = computed(() => {
  const types = new Set<string>();

  props.tree?.chapters.forEach((chapter) => {
    chapter.units.forEach((unit) => {
      unit.knowledge_cards.forEach((card) => {
        types.add(card.type || 'keyword');
      });
    });
  });

  return [...types].sort();
});

onMounted(() => {
  void rebuildGraph();
});

onBeforeUnmount(() => {
  network?.destroy();

  network = null;
});

watch(
  () => props.tree,

  () => {
    selectedNodeId.value = null;

    void rebuildGraph();
  },

  {
    deep: true,
  },
);

async function rebuildGraph() {
  await nextTick();

  const container = networkContainer.value;

  if (!container || !props.tree) {
    network?.destroy();

    network = null;

    return;
  }

  network?.destroy();

  nodeMeta.clear();

  const { nodes, edges } = buildGraphData(props.tree);

  const nodeData = new DataSet<Node>(nodes);

  const edgeData = new DataSet<Edge>(edges);

  const options: Options = {
    autoResize: true,

    nodes: {
      borderWidth: 2,

      borderWidthSelected: 4,

      font: {
        color: '#ffffff',

        size: 14,

        face: 'Arial',
      },

      shadow: {
        enabled: true,

        size: 8,

        x: 1,

        y: 2,
      },
    },

    edges: {
      width: 1.5,

      color: {
        color: '#b0bec5',

        highlight: '#607d8b',

        hover: '#78909c',
      },

      arrows: {
        to: {
          enabled: true,

          scaleFactor: 0.4,
        },
      },

      smooth: {
        enabled: true,

        type: 'continuous',

        roundness: 0.3,
      },
    },

    interaction: {
      hover: true,

      dragNodes: true,

      dragView: true,

      zoomView: true,

      multiselect: false,
    },

    physics: {
      enabled: true,

      barnesHut: {
        gravitationalConstant: -5200,

        centralGravity: 0.22,

        springLength: 145,

        springConstant: 0.035,

        damping: 0.16,

        avoidOverlap: 0.65,
      },

      stabilization: {
        enabled: true,

        iterations: 260,

        updateInterval: 25,
      },
    },
  };

  network = new Network(
    container,
    {
      nodes: nodeData,

      edges: edgeData,
    },
    options,
  );

  network.on('click', (params: NetworkClickParams) => {
    const id = params.nodes[0];

    if (id === undefined) {
      clearSelection();

      return;
    }

    selectedNodeId.value = String(id);
  });

  network.once('stabilizationIterationsDone', () => {
    network?.setOptions({
      physics: false,
    });

    fitGraph();
  });
}

function buildGraphData(tree: MaterialCourseTree) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const edgeIds = new Set<string>();

  const courseId = `course:${tree.id}`;

  // Course
  nodes.push({
    id: courseId,
    label: tree.name,
    title: tree.name,
    shape: 'dot',
    size: 38,
    color: levelColors.value.course,
  });

  nodeMeta.set(courseId, {
    id: courseId,
    kind: 'course',
    title: tree.name,
    itemCount: tree.chapters.length,
    paths: [],
  });

  const chapters = [...tree.chapters].sort((a, b) => a.sort_order - b.sort_order);

  // Chapter
  chapters.forEach((chapter, chapterIndex) => {
    const chapterOrder = displayOrder(chapter.sort_order, chapterIndex);

    const chapterNumber = String(chapterOrder);

    const chapterId = `chapter:${chapter.id}`;

    nodes.push({
      id: chapterId,

      label: `${chapterNumber} ${chapter.name}`,

      title: chapter.name,

      shape: 'dot',

      size: 29,

      color: levelColors.value.chapter,
    });

    nodeMeta.set(chapterId, {
      id: chapterId,

      kind: 'chapter',

      title: chapter.name,

      number: chapterNumber,

      itemCount: chapter.units.length,

      paths: [tree.name],
    });

    // Course → Chapter
    addEdge(edges, edgeIds, courseId, chapterId);

    const units = [...chapter.units].sort((a, b) => a.sort_order - b.sort_order);

    // Unit
    units.forEach((unit, unitIndex) => {
      const unitOrder = displayOrder(unit.sort_order, unitIndex);

      const unitNumber = `${chapterNumber}.${unitOrder}`;

      const unitId = `unit:${unit.id}`;

      nodes.push({
        id: unitId,

        label: `${unitNumber} ${unit.name}`,

        title: unit.name,

        shape: 'dot',

        size: 24,

        color: levelColors.value.unit,
      });

      nodeMeta.set(unitId, {
        id: unitId,

        kind: 'unit',

        title: unit.name,

        number: unitNumber,

        itemCount: unit.knowledge_cards.length,

        paths: [`${chapterNumber} ${chapter.name}`],
      });

      // Chapter → Unit
      addEdge(edges, edgeIds, chapterId, unitId);

      const cards = [...unit.knowledge_cards].sort((a, b) => a.sort_order - b.sort_order);

      // Knowledge Card
      cards.forEach((card, cardIndex) => {
        const cardId = `card:${card.id}`;

        const cardOrder = displayOrder(card.sort_order, cardIndex);

        const cardNumber = `${unitNumber}.${cardOrder}`;

        const path =
          `${chapterNumber} ${chapter.name}` +
          ` / ${unitNumber} ${unit.name}` +
          ` / ${cardNumber} ${card.title}`;

        /*
         * 同一張知識卡可能屬於多個 Unit。
         * 相同 card.id 只建立一個 Node。
         */
        if (!nodeMeta.has(cardId)) {
          nodes.push({
            id: cardId,

            label: card.title,

            title: `${card.title} (${card.type || 'keyword'})`,

            shape: 'dot',

            size: 20,

            color: getCardColor(card.type || 'keyword'),
          });

          nodeMeta.set(cardId, {
            id: cardId,

            kind: 'card',

            title: card.title,

            card,

            paths: [path],
          });
        } else {
          const meta = nodeMeta.get(cardId);

          if (meta && !meta.paths.includes(path)) {
            meta.paths.push(path);
          }
        }

        // Unit → Knowledge Card
        addEdge(edges, edgeIds, unitId, cardId);
      });
    });
  });

  return {
    nodes,
    edges,
  };
}

function addEdge(
  edges: Edge[],

  ids: Set<string>,

  from: string,

  to: string,
) {
  const id = `${from}->${to}`;

  if (ids.has(id)) {
    return;
  }

  ids.add(id);

  edges.push({
    id,
    from,
    to,
  });
}

function searchNode() {
  const search = normalize(searchText.value);

  if (!search) {
    searchMessage.value = '';

    return;
  }

  const match = [...nodeMeta.values()].find((item) => normalize(item.title).includes(search));

  if (!match || !network) {
    searchMessage.value = '找不到符合的教材節點';

    return;
  }

  searchMessage.value = '';

  selectedNodeId.value = match.id;

  network.selectNodes([match.id]);

  network.focus(match.id, {
    scale: 1.15,

    animation: {
      duration: 450,

      easingFunction: 'easeInOutQuad',
    },
  });
}

function zoomIn() {
  if (!network) {
    return;
  }

  network.moveTo({
    scale: network.getScale() * 1.2,

    animation: true,
  });
}

function zoomOut() {
  if (!network) {
    return;
  }

  network.moveTo({
    scale: network.getScale() / 1.2,

    animation: true,
  });
}

function fitGraph() {
  network?.fit({
    animation: {
      duration: 450,

      easingFunction: 'easeInOutQuad',
    },
  });
}

function rearrangeGraph() {
  if (!network) {
    return;
  }

  network.setOptions({
    physics: true,
  });

  network.stabilize(180);

  network.once('stabilized', () => {
    network?.setOptions({
      physics: false,
    });

    fitGraph();
  });
}

function clearSelection() {
  selectedNodeId.value = null;

  network?.unselectAll();
}

function getCardColor(type: string) {
  const normalized = normalize(type);

  const fixed: Record<string, string> = {
    keyword: '#7e57c2',

    function: '#ef6c00',

    concept: '#00897b',

    syntax: '#3949ab',

    operator: '#c62828',

    database: '#6d4c41',
  };

  const fixedColor = fixed[normalized];

  if (fixedColor) {
    return fixedColor;
  }

  let hash = 0;

  for (let index = 0; index < normalized.length; index += 1) {
    hash = normalized.charCodeAt(index) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;

  return `hsl(${hue} 55% 42%)`;
}

function displayOrder(
  order: number,

  index: number,
) {
  return order > 0 ? order : index + 1;
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}
</script>
