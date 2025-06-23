<script setup lang="ts">
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { watch, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
  open: boolean
  dialogue: { title: string } | null
}>();

const emit = defineEmits(['update:open', 'confirm']);

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && props.open) {
    emit('confirm');
  }
}

watch(() => props.open, (newVal) => {
  if (newVal) {
    window.addEventListener('keydown', onKeydown);
  } else {
    window.removeEventListener('keydown', onKeydown);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
});
</script>

<template>
  <AlertDialog :open="props.open" @update:open="$emit('update:open', $event)">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ t('dialog.delete_title') }}</AlertDialogTitle>
        <AlertDialogDescription>
          {{ t('all-dialog') }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>{{ t('dialog.cancel_button') }}</AlertDialogCancel>
        <AlertDialogAction @click="$emit('confirm')">{{ t('dialog.confirm_button') }}</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>