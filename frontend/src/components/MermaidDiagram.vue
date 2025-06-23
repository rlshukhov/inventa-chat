<template>
  <div class="mermaid-container group relative w-full max-w-full bg-[var(--tw-prose-pre-bg)] rounded-sm">
    <div :id="id" v-html="renderedSvg" class="flex justify-center max-h-[75vh] md:max-h-[50vh]"></div>
    <div v-if="error" class="mermaid-error">
      <p>Ошибка рендеринга диаграммы:</p>
      <pre>{{ error }}</pre>
    </div>
    <div v-else-if="loading" class="mermaid-loading">
      Загрузка диаграммы...
    </div>
    <button @click="copyCode"
            class="copy-btn absolute top-2 right-2 opacity-70 md:opacity-0 md:group-hover:opacity-70 transition-opacity p-1 rounded bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-xs z-10 flex flex-row gap-2">
      <p style="margin: 0">mermaid</p>
      <Copy v-if="isCopyIcon" class="w-4 h-4"/>
      <Check v-else class="w-4 h-4"></Check>
    </button>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, nextTick} from 'vue';
import mermaid from 'mermaid';
import {Copy,Check} from "lucide-vue-next";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  chart: {
    type: String,
    required: true,
  },
  theme: {
    type: String,
    default: 'default',
  },
});

const loading = ref(true);
const error = ref(null);

const renderedSvg = ref<string | null>(null);
const isCopyIcon = ref(true);

const copyCode = () => {
  isCopyIcon.value=false;
  setTimeout(() => {
    isCopyIcon.value=true;
  }, 2000);

  const code = props.chart;
  navigator.clipboard.writeText(code).catch(err => {
    console.error('Ошибка копирования кода:', err);
  });
};

onMounted(async () => {
  try {
    mermaid.initialize({
      startOnLoad: false,
      theme: props.theme as any,
      securityLevel: 'loose',
      fontFamily: 'inherit',
      fontSize: 16,
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
      },
    });

    await renderDiagram();
  } catch (err: any) {
    console.error('Mermaid initialization error:', err);
    error.value = err.message;
    loading.value = false;
  }
});

const renderDiagram = async () => {
  try {
    loading.value = true;
    error.value = null;

    const decodedChart = props.chart
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

    await nextTick();

    const parseResult = await mermaid.parse(decodedChart);
    if (!parseResult) {
      throw new Error('Некорректный синтаксис диаграммы');
    }

    const {svg} = await mermaid.render(`${props.id}-svg`, decodedChart);
    renderedSvg.value = svg;
    loading.value = false;
  } catch (err: any) {
    console.error('Mermaid render error:', err);
    error.value = err.message;
    loading.value = false;
  }
};
</script>

<style scoped>
.mermaid-container {
  margin: 1rem 0;
  text-align: center;
}

.mermaid-container :deep(svg) {
  max-width: 100%;
  height: auto;
}

.mermaid-error {
  background-color: var(--tw-prose-pre-bg);
  border-radius: 4px;
  padding: 1rem;
  color: var(--tw-prose-pre-code);
}

.mermaid-error pre {
  background: none;
  border: none;
  margin: 0.5rem 0 0 0;
  font-size: 0.875rem;
  color: var(--tw-prose-pre-code);
}

.mermaid-loading {
  padding: 2rem;
  color: var(--tw-prose-pre-code);
  font-style: italic;
}
</style>
