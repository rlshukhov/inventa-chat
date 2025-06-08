<script setup lang="ts">
import { watch, ref } from 'vue'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  open: boolean,
  title: string
}>()

const emit = defineEmits(['update:open', 'confirm'])

const localTitle = ref('')

watch(() => props.open, (newVal) => {
  if (newVal) {
    localTitle.value = props.title
  }
})

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && localTitle.value.trim().length > 0) {
    emit('confirm', localTitle.value.trim())
  }
}
</script>

<template>
  <AlertDialog :open="props.open" @update:open="emit('update:open', $event)">
    <AlertDialogContent class="sm:max-w-md">
      <AlertDialogHeader>
        <AlertDialogTitle>{{ t('rename_dialog.title') }}</AlertDialogTitle>
        <AlertDialogDescription>{{ t('rename_dialog.description') }}</AlertDialogDescription>
      </AlertDialogHeader>

      <Input
          v-model="localTitle"
          :placeholder="t('rename_dialog.placeholder')"
          class="mt-4"
          @keydown="onKeydown"
      />

      <AlertDialogFooter class="flex justify-end space-x-2 mt-4">
        <AlertDialogCancel as-child>
          <Button variant="outline">{{ t('rename_dialog.cancel') }}</Button>
        </AlertDialogCancel>
        <AlertDialogAction as-child>
          <Button :disabled="localTitle.trim().length === 0" @click="emit('confirm', localTitle.trim())">
            {{ t('rename_dialog.confirm') }}
          </Button>
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>