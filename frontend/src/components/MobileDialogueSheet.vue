<script setup lang="ts">
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet'
import {Menu, Pencil} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import DialogueList from "@/components/DialogueList.vue";
import { ref, onMounted, onUnmounted } from 'vue'
import Settings from "@/components/Settings.vue";

const props = defineProps<{
  dialogues: { id: string, title: string }[],
  selectedId: string | null
}>()

const emit = defineEmits(['update:open', 'select', 'delete', 'rename', 'create', 'delete-all'])
const isSheetOpen = ref(false)

function handleResize() {
  if (window.innerWidth >= 768) {
    isSheetOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="flex md:hidden items-center justify-between w-full border-b dark:border-gray-700 pb-3">
    <Sheet v-model:open="isSheetOpen">
      <SheetTrigger as-child>
        <Button variant="outline" size="icon" class="focus:ring-0 focus:outline-none">
          <Menu class="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" class="w-64 flex flex-col">
        <DialogueList
            :dialogues="props.dialogues"
            :selectedId="props.selectedId"
            @select="id => { emit('select', id); isSheetOpen = false }"
            @create="() => emit('create')"
            @delete="dialogue => emit('delete', dialogue)"
            @rename="dialogue => emit('rename', dialogue)"
            @delete-all="dialogue => emit('delete-all', dialogue)"
        />
      </SheetContent>
    </Sheet>

    <p class="text-lg font-semibold flex-1 text-center">
      {{ props.dialogues.find(d => d.id === props.selectedId)?.title || '' }}
    </p>

    <Button variant="ghost" size="icon" @click="emit('create')">
      <Pencil class="w-5 h-5" />
    </Button>
    <Settings/>
  </div>
</template>