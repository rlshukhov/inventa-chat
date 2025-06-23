<script setup lang="ts">
import {createApp, nextTick, onBeforeMount, onMounted, ref, watch} from 'vue';
import Markdown from 'vue-markdown-render';
import hljs from 'highlight.js';
import copyButtonPlugin from '@/plugins/markdown/copyButtonPlugin.ts';
import {useI18n} from 'vue-i18n';
import {Copy, Check} from 'lucide-vue-next';
import hrefPlugin from "@/plugins/markdown/hrefPlugin.ts";
import type {MessageRole} from "@/models/ai/messages.ts";
import {getModelByUid} from "@/models/ai/providers.ts";
import mermaidPlugin from '@/plugins/markdown/mermaidPlugin.ts';
import MermaidDiagram from "@/components/MermaidDiagram.vue";

const isCopyIcon = ref(true);
const {t} = useI18n();

defineEmits(['edit']);

const modelTitle = ref('');

const props = defineProps<{
  content: string
  role: MessageRole
  editable?: boolean
  modelUid?: string | undefined,
  isTyping?: boolean
}>();

const options = {
  highlight: (str: string, lang: string) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, {language: lang}).value;
      } catch {
      }
    }
    return '';
  },
};

function copyWholeMessage() {
  void navigator.clipboard.writeText(props.content).then(() => {
    isCopyIcon.value = false;
    setTimeout(() => {
      isCopyIcon.value = true;
    }, 1000);
  });
}

onBeforeMount(() => {
  if (props.modelUid) {
    modelTitle.value = getModelByUid(props.modelUid)?.title || '';
  }
});

const contentRef = ref<HTMLElement>();

const mountMermaidComponents = async () => {
  await nextTick();

  if (!contentRef.value) {
    return;
  }

  const placeholders = contentRef.value.querySelectorAll('.mermaid-placeholder');

  placeholders.forEach((placeholder) => {
    const diagram = decodeURIComponent(placeholder.getAttribute('data-diagram') || '');
    const id = placeholder.getAttribute('data-id');

    if (diagram && id) {
      const componentDiv = document.createElement('div');
      componentDiv.id = `mermaid-${id}`;

      placeholder.parentNode?.replaceChild(componentDiv, placeholder);

      const app = createApp(MermaidDiagram, {
        id: id,
        chart: diagram,
        theme: 'dark',
      });

      app.mount(`#mermaid-${id}`);
    }
  });
};

onMounted(() => {
  if (!props.isTyping) {
    void mountMermaidComponents();
  }
});

watch(() => props.isTyping, () => {
  void nextTick(() => {
    if (!props.isTyping) {
      void mountMermaidComponents();
    }
  });
});
</script>

<template>
  <div
      class="w-full my-2 group flex max-w-[1000px]"
      :class="props.role === 'user' ? 'flex-row-reverse' : 'flex-row'">
    <div
        class="p-3 rounded-2xl max-w-full"
        :class="props.role === 'user' ? 'bg-[rgba(0,0,255,0.07)] dark:bg-[rgba(0,0,255,0.2)]' : 'bg-[var(--bot-message-bg-color)]'">
      <div class="header flex flex-row w-full mb-2 text-xs">
        <p class="mr-4">{{ modelTitle || t('user') }}</p>
        <button @click="copyWholeMessage"
                class="ml-auto opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <div v-if="isCopyIcon">
            <Copy class="w-4 h-4"/>
          </div>
          <div v-else>
            <Check class="w-4 h-4"/>
          </div>
        </button>
      </div>
      <div ref="contentRef" class="content my-2">
        <Markdown
            :source="props.content"
            :options="options"
            :plugins="[copyButtonPlugin, hrefPlugin, mermaidPlugin]"
            :class="[
            'flex-none markdown prose prose-sm dark:prose-invert prose-hr:border-dotted prose-hr:border-b-2 prose-hr:border-b-gray-400 max-w-none',
            props.role === 'user' ? '' : '',
          ]"/>
      </div>
      <div class="footer mt-2">
        <div v-if="isTyping" class="flex gap-2">
          <div class="animate-pulse delay-0 w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-300"></div>
          <div class="animate-pulse delay-600 w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-300"></div>
          <div class="animate-pulse delay-900 w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-300"></div>
        </div>
      </div>
    </div>
  </div>
</template>