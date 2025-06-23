<script setup lang="ts">
import {onBeforeMount, ref} from 'vue';
import Markdown from 'vue-markdown-render';
import hljs from 'highlight.js';
import copyButtonPlugin from '@/plugins/markdown/copyButtonPlugin.ts';
import {useI18n} from 'vue-i18n';
import {Copy, Check} from 'lucide-vue-next';
import hrefPlugin from "@/plugins/markdown/hrefPlugin.ts";
import type {MessageRole} from "@/models/ai/messages.ts";
import {getModelByUid} from "@/models/ai/providers.ts";

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

// render markdown
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
      <div class="content my-2">
        <Markdown
            :source="props.content"
            :options="options"
            :plugins="[copyButtonPlugin, hrefPlugin]"
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

      <!-- Buttons -->
      <!--      <div-->
      <!--          class="mt-1 flex justify-start items-start space-y-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"-->
      <!--          :class="props.role === 'user' ? 'items-end' : 'items-start'">-->
      <!--        <button-->
      <!--            v-if="props.role === 'user'"-->
      <!--            @click="$emit('edit')"-->
      <!--            class="mr-1 p-1 mt-2 rounded text-xs inline-flex items-center justify-center"-->
      <!--            :class="{ 'invisible': !editable }">-->
      <!--          <Pencil class="w-4 h-4"/>-->
      <!--        </button>-->
      <!--      </div>-->
    </div>
  </div>
</template>