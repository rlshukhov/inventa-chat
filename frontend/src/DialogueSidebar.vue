<script setup lang="ts">
import {
  Sidebar,
  SidebarContent,
} from "@/components/ui/sidebar";
import DialogueList from "@/components/DialogueList.vue";

const props = defineProps<{
  dialogues: { id: string, title: string }[],
  selectedId: string | null
}>();

const emit = defineEmits(['update:open', 'select', 'delete', 'rename', 'create', 'delete-all']);

</script>

<template>
  <Sidebar>
    <SidebarContent class="bg-background md:bg-transparent">
      <DialogueList
          :dialogues="props.dialogues"
          :selectedId="props.selectedId"
          @select="id => emit('select', id)"
          @create="() => emit('create')"
          @delete="dialogue => emit('delete', dialogue)"
          @rename="dialogue => emit('rename', dialogue)"
          @delete-all="dialogue => emit('delete-all', dialogue)"
      />
    </SidebarContent>
  </Sidebar>
</template>