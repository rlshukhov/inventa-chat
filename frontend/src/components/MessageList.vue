<script setup lang="ts">
import ChatMessage from './ChatMessage.vue';
import type {MessageRole} from "@/models/ai/messages.ts";
import {computed} from "vue";
const props = defineProps<{
  messages: {
    id: string,
    role: MessageRole,
    content: string,
    modelUid?: string | undefined,
    timestamp: number,
    isTyping: boolean,
  }[],
}>();

defineEmits(['edit-last-user-message']);

const sortedMessages = computed(() =>
    [...props.messages].sort((a, b) => a.timestamp - b.timestamp),
);
</script>

<template>
  <div class="flex-1 overflow-y-auto space-y-2 mx-auto w-fit max-w-full">
    <ChatMessage
        v-for="message in sortedMessages"
        :key="message.id"
        :content="message.content"
        :role="message.role"
        :modelUid="message.modelUid"
        :is-typing="message.isTyping"
        @edit="() => $emit('edit-last-user-message')"
    />
  </div>
</template>