<template>
  <div class="material-graph-viewer" :class="themeClass">
    <!-- Toolbar -->
    <div class="material-graph-viewer__toolbar">
      <q-input
        v-model="searchText"
        dense
        outlined
        clearable
        placeholder="搜尋主題、章節、單元或知識卡"
        class="material-graph-viewer__search"
        @keyup.enter="searchNode"
        @clear="clearSearch"
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

    <div v-if="searchResults.length > 0" class="material-graph-viewer__search-results">
      <div class="material-graph-viewer__search-results-header">
        找到 {{ searchResults.length }} 筆符合結果
      </div>

      <q-list separator class="material-graph-viewer__search-result-list">
        <q-item
          v-for="result in searchResults"
          :key="result.id"
          clickable
          v-ripple
          @click="focusSearchResult(result)"
        >
          <q-item-section avatar>
            <span
              class="material-graph-viewer__search-result-dot"
              :style="{
                backgroundColor: getMetaColor(result),
              }"
            />
          </q-item-section>

          <q-item-section>
            <q-item-label>
              {{ result.title }}
            </q-item-label>

            <q-item-label caption>
              {{ getKindLabel(result.kind) }}

              <template v-if="result.number"> ・{{ result.number }} </template>
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-icon name="center_focus_strong" color="grey-6" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- Legend -->
    <div class="material-graph-viewer__legend">
      <div class="material-graph-viewer__legend-item">
        <span
          class="material-graph-viewer__legend-dot"
          :style="{
            backgroundColor: levelColors.topic,
          }"
        />

        主題
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
      :style="detailLayoutStyle"
    >
      <div class="material-graph-viewer__canvas-wrapper">
        <div v-if="!tree" class="material-graph-viewer__empty">
          <q-icon name="hub" size="54px" />

          <div>目前沒有可顯示的教材圖譜</div>
        </div>

        <div v-show="tree" ref="networkContainer" class="material-graph-viewer__canvas" />
      </div>

      <!-- Detail Resize Handle -->
      <div
        v-if="selectedMeta"
        class="material-graph-viewer__resize-handle"
        @mousedown="startDetailResize"
        @dblclick="resetDetailWidth"
      />

      <!-- Detail -->
      <aside v-if="selectedMeta" class="material-graph-viewer__detail">
        <div class="material-graph-viewer__detail-header">
          <div>
            <q-badge :style="selectedBadgeStyle" :label="selectedKindLabel" />

            <div class="material-graph-viewer__detail-title">
              {{ selectedMeta.title }}
            </div>
          </div>

          <div class="material-graph-viewer__detail-actions">
            <q-btn
              v-if="theme === 'teacher' && selectedMeta.kind !== 'topic'"
              outline
              color="blue"
              icon="edit"
              label="編輯"
              no-caps
              @click="editSelectedNode"
            />

            <q-btn flat round dense icon="close" @click="clearSelection" />
          </div>
        </div>

        <q-separator />

        <div class="material-graph-viewer__detail-content">
          <!-- Topic / Chapter / Unit -->
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

          <!-- Knowledge Card -->
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
                <q-chip
                  v-for="path in selectedMeta.paths"
                  :key="path"
                  dense
                  outline
                  class="material-graph-viewer__path-chip"
                >
                  <span class="material-graph-viewer__path-text">
                    {{ path }}
                  </span>

                  <q-tooltip>
                    {{ path }}
                  </q-tooltip>
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

import type {
  MaterialChapterNode,
  MaterialCourseTree,
  MaterialKnowledgeCardNode,
  MaterialUnitNode,
} from '../../types/material';

type GraphNodeKind = 'topic' | 'chapter' | 'unit' | 'card';

interface GraphNodeMeta {
  id: string;

  kind: GraphNodeKind;

  title: string;

  number?: string;

  itemCount?: number;

  chapter?: MaterialChapterNode;

  unit?: MaterialUnitNode;

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

const emit = defineEmits<{
  'edit-chapter': [chapter: MaterialChapterNode];

  'edit-unit': [chapter: MaterialChapterNode, unit: MaterialUnitNode];

  'edit-card': [
    chapter: MaterialChapterNode,

    unit: MaterialUnitNode,

    card: MaterialKnowledgeCardNode,
  ];
}>();

const networkContainer = ref<HTMLDivElement | null>(null);

const selectedNodeId = ref<string | null>(null);

const searchText = ref('');

const searchMessage = ref('');

const searchResults = ref<GraphNodeMeta[]>([]);

const detailWidth = ref(360);

const DETAIL_MIN_WIDTH = 300;
const DETAIL_MAX_WIDTH = 680;
const DETAIL_DEFAULT_WIDTH = 360;

let resizeStartX = 0;
let resizeStartWidth = DETAIL_DEFAULT_WIDTH;

const detailLayoutStyle = computed<Record<string, string>>(() => {
  if (!selectedMeta.value) {
    return {};
  }

  return {
    '--detail-width': `${detailWidth.value}px`,
  };
});

let network: Network | null = null;

const nodeMeta = new Map<string, GraphNodeMeta>();

const theme = computed(() => props.theme);

const themeClass = computed(() =>
  props.theme === 'student' ? 'material-graph-viewer--student' : 'material-graph-viewer--teacher',
);

/*
 * 配色
 *
 * Topic     #FFD306
 * Chapter   #9999CC
 * Unit      #6FB7B7
 * function  #FF9D6F
 * keyword   #B87070
 */
const levelColors = {
  topic: '#FFD306',

  chapter: '#9999CC',

  unit: '#6FB7B7',
};

const selectedMeta = computed(() => {
  if (!selectedNodeId.value) {
    return null;
  }

  return nodeMeta.get(selectedNodeId.value) ?? null;
});

const selectedKindLabel = computed(() => {
  const kind = selectedMeta.value?.kind;

  return kind ? getKindLabel(kind) : '';
});

const selectedBadgeStyle = computed(() => {
  const meta = selectedMeta.value;

  if (!meta) {
    return {};
  }

  let color = '#78909c';

  if (meta.kind === 'topic') {
    color = levelColors.topic;
  }

  if (meta.kind === 'chapter') {
    color = levelColors.chapter;
  }

  if (meta.kind === 'unit') {
    color = levelColors.unit;
  }

  if (meta.kind === 'card' && meta.card) {
    color = getCardColor(meta.card.type || 'keyword');
  }

  return {
    backgroundColor: color,

    color: getTextColor(color),
  };
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

  window.removeEventListener('mousemove', handleDetailResize);
  window.removeEventListener('mouseup', stopDetailResize);

  document.body.classList.remove('material-graph-resizing');
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

    layout: {
      improvedLayout: true,
    },

    nodes: {
      borderWidth: 2,

      borderWidthSelected: 4,

      font: {
        color: '#37474f',

        size: 14,

        face: 'Arial',
      },

      shadow: {
        enabled: true,

        color: 'rgba(0, 0, 0, 0.14)',

        size: 8,

        x: 2,

        y: 2,
      },
    },

    edges: {
      width: 1.4,

      color: {
        color: '#c2ccd3',

        highlight: '#78909c',

        hover: '#90a4ae',
      },

      arrows: {
        to: {
          enabled: true,

          scaleFactor: 0.45,
        },
      },

      smooth: {
        enabled: true,

        type: 'dynamic',

        roundness: 0.25,
      },
    },

    interaction: {
      hover: true,

      dragNodes: true,

      dragView: true,

      zoomView: true,

      multiselect: false,

      navigationButtons: false,

      keyboard: false,
    },

    physics: {
      enabled: true,

      barnesHut: {
        gravitationalConstant: -3800,
        centralGravity: 0.28,
        springLength: 100,
        springConstant: 0.045,
        damping: 0.2,
        avoidOverlap: 0.65,
      },

      stabilization: {
        enabled: true,
        iterations: 350,
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

  /*
   * 目前一門課只有一個 Topic，
   * 根節點直接以 Topic 顯示。
   */
  const topicId = `topic:${tree.id}`;

  nodes.push({
    id: topicId,

    label: `${shortenLabel(tree.name, 22)}`,

    title: tree.name,

    shape: 'box',

    margin: {
      top: 12,

      right: 16,

      bottom: 12,

      left: 16,
    },

    borderWidth: 3,

    font: {
      color: '#4a3b00',

      size: 17,

      face: 'Arial',

      bold: {
        color: '#4a3b00',

        size: 17,

        face: 'Arial',
      },
    },

    color: makeNodeColor(levelColors.topic, '#D5B000', '#FFE24D'),

    shadow: {
      enabled: true,

      color: 'rgba(0, 0, 0, 0.20)',

      size: 12,

      x: 2,

      y: 3,
    },
  });

  nodeMeta.set(topicId, {
    id: topicId,

    kind: 'topic',

    title: tree.name,

    itemCount: tree.chapters.length,

    paths: [],
  });

  const chapters = [...tree.chapters].sort((a, b) => a.sort_order - b.sort_order);

  chapters.forEach((chapter, chapterIndex) => {
    const chapterOrder = displayOrder(chapter.sort_order, chapterIndex);

    const chapterNumber = String(chapterOrder);

    const chapterId = `chapter:${chapter.id}`;

    nodes.push({
      id: chapterId,

      label: `${chapterNumber}\n${shortenLabel(chapter.name, 20)}`,

      title: chapter.name,

      shape: 'box',

      margin: {
        top: 10,

        right: 14,

        bottom: 10,

        left: 14,
      },

      borderWidth: 2,

      font: {
        color: '#33334d',

        size: 15,

        face: 'Arial',
      },

      color: makeNodeColor(levelColors.chapter, '#7777B5', '#AFAFD8'),

      shadow: {
        enabled: true,

        color: 'rgba(0, 0, 0, 0.15)',

        size: 8,

        x: 2,

        y: 2,
      },
    });

    nodeMeta.set(chapterId, {
      id: chapterId,

      kind: 'chapter',

      title: chapter.name,

      number: chapterNumber,

      itemCount: chapter.units.length,

      chapter,

      paths: [tree.name],
    });

    addEdge(edges, edgeIds, topicId, chapterId);

    const units = [...chapter.units].sort((a, b) => a.sort_order - b.sort_order);

    units.forEach((unit, unitIndex) => {
      const unitOrder = displayOrder(unit.sort_order, unitIndex);

      const unitNumber = `${chapterNumber}.${unitOrder}`;

      const unitId = `unit:${unit.id}`;

      nodes.push({
        id: unitId,

        label: `${unitNumber}\n${shortenLabel(unit.name, 18)}`,

        title: unit.name,

        shape: 'box',

        margin: {
          top: 9,

          right: 12,

          bottom: 9,

          left: 12,
        },

        borderWidth: 2,

        font: {
          color: '#244646',

          size: 14,

          face: 'Arial',
        },

        color: makeNodeColor(levelColors.unit, '#4C9999', '#86C8C8'),

        shadow: {
          enabled: true,

          color: 'rgba(0, 0, 0, 0.13)',

          size: 7,

          x: 2,

          y: 2,
        },
      });

      nodeMeta.set(unitId, {
        id: unitId,

        kind: 'unit',

        title: unit.name,

        number: unitNumber,

        itemCount: unit.knowledge_cards.length,

        chapter,

        unit,

        paths: [`${chapterNumber} ${chapter.name}`],
      });

      addEdge(edges, edgeIds, chapterId, unitId);

      const cards = [...unit.knowledge_cards].sort((a, b) => a.sort_order - b.sort_order);

      cards.forEach((card, cardIndex) => {
        const cardId = `card:${card.id}`;

        const cardOrder = displayOrder(card.sort_order, cardIndex);

        const cardNumber = `${unitNumber}.${cardOrder}`;

        const path =
          `${chapterNumber} ${chapter.name}` +
          ` / ${unitNumber} ${unit.name}` +
          ` / ${cardNumber} ${card.title}`;

        const cardType = card.type || 'keyword';

        if (!nodeMeta.has(cardId)) {
          const background = getCardColor(cardType);

          const border = getCardBorderColor(cardType);

          const hover = getCardHoverColor(cardType);

          nodes.push({
            id: cardId,

            label: shortenLabel(card.title, 16),

            title: `${card.title} (${cardType})`,

            shape: 'ellipse',

            margin: {
              top: 30,

              right: 16,

              bottom: 30,

              left: 16,
            },

            borderWidth: 2,

            font: {
              color: getTextColor(background),

              size: 13,

              face: 'Arial',
            },

            color: makeNodeColor(background, border, hover),

            shadow: {
              enabled: true,

              color: 'rgba(0, 0, 0, 0.12)',

              size: 6,

              x: 2,

              y: 2,
            },
          });

          nodeMeta.set(cardId, {
            id: cardId,

            kind: 'card',

            title: card.title,

            chapter,

            unit,

            card,

            paths: [path],
          });
        } else {
          const meta = nodeMeta.get(cardId);

          if (meta && !meta.paths.includes(path)) {
            meta.paths.push(path);
          }
        }

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

  searchResults.value = [];

  searchMessage.value = '';

  if (!search) {
    return;
  }

  const matches = [...nodeMeta.values()].filter((item) => {
    const searchableText = [item.title, item.number ?? ''].join(' ').toLowerCase();

    return searchableText.includes(search);
  });

  if (matches.length === 0 || !network) {
    searchMessage.value = '找不到符合的教材節點';

    return;
  }

  searchResults.value = matches;

  if (matches.length === 1) {
    const result = matches[0];

    if (result) {
      focusSearchResult(result);
    }

    return;
  }

  const nodeIds = matches.map((item) => item.id);

  network.selectNodes(nodeIds);

  network.fit({
    nodes: nodeIds,

    animation: {
      duration: 450,

      easingFunction: 'easeInOutQuad',
    },
  });
}

function focusSearchResult(result: GraphNodeMeta) {
  if (!network) {
    return;
  }

  selectedNodeId.value = result.id;

  network.selectNodes([result.id]);

  network.focus(result.id, {
    scale: 1.15,

    animation: {
      duration: 450,

      easingFunction: 'easeInOutQuad',
    },
  });
}

function clearSearch() {
  searchResults.value = [];

  searchMessage.value = '';

  network?.unselectAll();
}

function getKindLabel(kind: GraphNodeKind) {
  switch (kind) {
    case 'topic':
      return '主題';

    case 'chapter':
      return '章節';

    case 'unit':
      return '單元';

    case 'card':
      return '知識卡';
  }
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

  network.stabilize(260);

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

function editSelectedNode() {
  const meta = selectedMeta.value;

  if (!meta || props.theme !== 'teacher') {
    return;
  }

  if (meta.kind === 'chapter' && meta.chapter) {
    emit('edit-chapter', meta.chapter);

    return;
  }

  if (meta.kind === 'unit' && meta.chapter && meta.unit) {
    emit('edit-unit', meta.chapter, meta.unit);

    return;
  }

  if (meta.kind === 'card' && meta.chapter && meta.unit && meta.card) {
    emit('edit-card', meta.chapter, meta.unit, meta.card);
  }
}

function getMetaColor(meta: GraphNodeMeta) {
  if (meta.kind === 'topic') {
    return levelColors.topic;
  }

  if (meta.kind === 'chapter') {
    return levelColors.chapter;
  }

  if (meta.kind === 'unit') {
    return levelColors.unit;
  }

  if (meta.kind === 'card' && meta.card) {
    return getCardColor(meta.card.type || 'keyword');
  }

  return '#90a4ae';
}

function getCardColor(type: string) {
  switch (normalize(type)) {
    case 'function':
      return '#FF9D6F';

    case 'keyword':
      return '#B87070';

    default:
      return '#B87070';
  }
}

function getCardBorderColor(type: string) {
  switch (normalize(type)) {
    case 'function':
      return '#DF7E52';

    case 'keyword':
      return '#965656';

    default:
      return '#965656';
  }
}

function getCardHoverColor(type: string) {
  switch (normalize(type)) {
    case 'function':
      return '#FFB08C';

    case 'keyword':
      return '#C88484';

    default:
      return '#C88484';
  }
}

function makeNodeColor(
  background: string,

  border: string,

  hover: string,
) {
  return {
    background,

    border,

    highlight: {
      background: hover,

      border,
    },

    hover: {
      background: hover,

      border,
    },
  };
}

function shortenLabel(
  value: string,

  maxLength: number,
) {
  const text = value.trim();

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}…`;
}

function getTextColor(background: string) {
  const hex = background.replace('#', '').trim();

  if (hex.length !== 6) {
    return '#37474f';
  }

  const red = Number.parseInt(hex.slice(0, 2), 16);

  const green = Number.parseInt(hex.slice(2, 4), 16);

  const blue = Number.parseInt(hex.slice(4, 6), 16);

  const luminance = (red * 299 + green * 587 + blue * 114) / 1000;

  return luminance > 150 ? '#37474f' : '#ffffff';
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

function startDetailResize(event: MouseEvent) {
  event.preventDefault();

  resizeStartX = event.clientX;
  resizeStartWidth = detailWidth.value;

  document.body.classList.add('material-graph-resizing');

  window.addEventListener('mousemove', handleDetailResize);
  window.addEventListener('mouseup', stopDetailResize);
}

function handleDetailResize(event: MouseEvent) {
  const delta = resizeStartX - event.clientX;

  const nextWidth = resizeStartWidth + delta;

  detailWidth.value = Math.min(DETAIL_MAX_WIDTH, Math.max(DETAIL_MIN_WIDTH, nextWidth));
}

function stopDetailResize() {
  document.body.classList.remove('material-graph-resizing');

  window.removeEventListener('mousemove', handleDetailResize);
  window.removeEventListener('mouseup', stopDetailResize);
}

function resetDetailWidth() {
  detailWidth.value = DETAIL_DEFAULT_WIDTH;
}
</script>
