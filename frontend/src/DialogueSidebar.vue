<script setup lang="ts">
import {
  Sidebar,
  SidebarContent,
  SidebarRail
} from "@/components/ui/sidebar";
import DialogueList from "@/components/DialogueList.vue";

const props = defineProps<{
  dialogues: { id: string, title: string }[],
  selectedId: string | null
}>()

const emit = defineEmits(['update:open', 'select', 'delete', 'rename', 'create', 'delete-all'])

</script>

<template>
  <Sidebar>
    <SidebarContent>
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
    <SidebarRail />
  </Sidebar>
</template>