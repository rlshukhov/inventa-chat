<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { useVModel } from '@vueuse/core'
import { ref, defineExpose } from 'vue'

const props = defineProps<{
  class?: HTMLAttributes['class']
  defaultValue?: string | number
  modelValue?: string | number
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
})

const textarea = ref<HTMLTextAreaElement | null>(null)
defineExpose({ textarea })
</script>

<template>
  <textarea
      ref="textarea"
      v-model="modelValue"
      :class="cn(
    'max-h-40',
    'overflow-y-auto',
    'placeholder:text-muted-foreground flex field-sizing-content min-h-16 w-full rounded-md bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
    props.class
  )"
  />
</template>