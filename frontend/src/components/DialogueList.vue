<script setup lang="ts">
import { Menu, Trash2 } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineProps<{
  dialogues: { id: string, title: string }[],
  selectedId: string | null
}>();

defineEmits(['select', 'delete', 'rename', 'create', 'delete-all']);
</script>

<template>
  <div class="titlebar flex flex-col h-full overflow-y-scroll w-full">
    <div class="flex justify-between items-center mb-2">
      <h2 class="font-semibold text-lg px-4">{{ t('dialogue_list.title') }}</h2>
      <div class="flex gap-2 px-2">
        <Button variant="ghost" size="icon" @click="$emit('delete-all')">
          <Trash2 class="w-5 h-5" />
        </Button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto space-y-2">
      <div
          @click.self="$emit('select', dialogue)"
          v-for="dialogue in dialogues"
          :key="dialogue.id"
          :class="['group flex items-center rounded-lg cursor-pointer mx-2 py-2',
                { 'bg-[rgba(0,0,255,0.07)] dark:bg-[rgba(0,0,255,0.2)]': selectedId === dialogue.id }]"
      >
        <div class="ml-3 flex-1 max-w-30 md:max-w-50" @click="$emit('select', dialogue)">
          <p class="text-sm font-medium truncate">{{ dialogue.title }}</p>
        </div>

        <!-- DropdownMenu for mobile and desktop versions -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="link" size="icon" class="ml-auto">
              <Menu />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-40">
            <DropdownMenuItem @click="$emit('delete', dialogue)">{{ t('dialogue_list.menu.delete') }}</DropdownMenuItem>
            <DropdownMenuItem @click="$emit('rename', dialogue)">{{ t('dialogue_list.menu.rename') }}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </div>
</template>