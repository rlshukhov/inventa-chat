<!-- MessageBubble.vue -->
<script setup lang="ts">
import {ref} from 'vue'
import Markdown from 'vue-markdown-render'
import hljs from 'highlight.js'
import copyButtonPlugin from '@/copyButtonPlugin.ts'
import {useI18n} from 'vue-i18n'
import {Copy, Pencil} from 'lucide-vue-next'
import hrefPlugin from "@/hrefPlugin.ts";

const isCopyIcon = ref(true)
const {t} = useI18n()

defineEmits(['edit'])

const props = defineProps<{
  content: string
  role: 'user' | 'assistant'
  editable?: boolean
  model: string | null,
}>()

// render markdown
const options = {
  highlight: (str: string, lang: string) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, {language: lang}).value
      } catch {
      }
    }
    return ''
  }
}

function copyWholeMessage() {
  navigator.clipboard.writeText(props.content).then(() => {
    isCopyIcon.value = false
    setTimeout(() => {
      isCopyIcon.value = true
    }, 1000)
  })
}
</script>

<template>
  <div
      class="flex w-full my-2 group"
      :class="props.role === 'user' ? 'justify-end' : 'justify-start'">
    <!-- Message and button wrapper -->
    <div
        class="flex items-start gap-2 w-full"
        :class="props.role === 'user' ? 'flex-row-reverse' : 'flex-row'">
      <!-- Message -->
      <div
          class="relative p-3 rounded-2xl max-w-[90%] w-fit"
          :class="props.role === 'user' ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'">
        <p v-if="model" class="text-xs text-gray-400 pb-2">{{ model }}</p>
        <Markdown
            :source="props.content"
            :options="options"
            :plugins="[copyButtonPlugin, hrefPlugin]"
            :class="[
            'markdown prose prose-sm dark:prose-invert prose-hr:border-dotted prose-hr:border-b-2 prose-hr:border-b-gray-400 max-w-none',
            props.role === 'user' ? 'prose-invert text-white' : '',
          ]"/>
      </div>

      <!-- Buttons -->
      <div
          class="mt-1 flex justify-start items-start space-y-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
          :class="props.role === 'user' ? 'items-end' : 'items-start'">
        <button
            v-if="props.role === 'user'"
            @click="$emit('edit')"
            class="mr-1 p-1 mt-2 rounded hover:bg-gray-200 dark:hover:bg-gray-500 text-xs inline-flex items-center justify-center"
            :class="{ 'invisible': !editable }">
          <Pencil class="w-4 h-4"/>
        </button>

        <button
            @click="copyWholeMessage"
            class="p-1 mt-2 rounded hover:bg-gray-200 dark:hover:bg-gray-500 text-xs inline-flex items-center justify-center">
          <div v-if="isCopyIcon">
            <Copy class="w-4 h-4"/>
          </div>
          <div v-else>
            {{ t('copied') }}
          </div>
        </button>
      </div>
    </div>
  </div>
</template>