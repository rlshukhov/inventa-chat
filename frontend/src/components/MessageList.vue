<script setup lang="ts">
import ChatMessage from './ChatMessage.vue'
import {computed} from "vue";
const props = defineProps<{
  messages: { role: 'user' | 'assistant', content: string, model: string | null }[]
}>()

const emit = defineEmits(['edit-last-user-message'])

const lastUserMessageIndex = computed(() => {
  for (let i = props.messages.length - 1; i >= 0; i--) {
    if (props.messages[i].role === 'user') return i
  }
  return -1
})
</script>

<template>
  <div class="flex-1 overflow-y-auto space-y-2">
    <ChatMessage
        v-for="(message, index) in messages"
        :key="index"
        :content="message.content"
        :role="message.role"
        :model="message.model"
        :editable="index === lastUserMessageIndex"
        @edit="() => $emit('edit-last-user-message')"
    />
  </div>
</template>