<script setup lang="ts">
import { Pencil, Menu, Trash2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  dialogues: { id: string, title: string }[],
  selectedId: string | null
}>()

defineEmits(['select', 'delete', 'rename', 'create', 'delete-all'])
</script>

<template>
  <div class="flex flex-col p-4 md:bg-gray-100 dark:bg-gray-800 h-full overflow-y-scroll w-full">
    <div class="flex justify-between items-center mb-4">

      <h2 class="font-semibold text-lg">{{ t('dialogue_list.title') }}</h2>
      <!-- Delete All button (desktop only) -->

      <div class="hidden md:flex gap-2">
        <!-- Delete All button (desktop only) -->
        <Button variant="outline" size="icon" @click="$emit('delete-all')">
          <Trash2 class="w-5 h-5" />
        </Button>
        <!-- Create button -->
        <Button variant="outline" size="icon" @click="$emit('create')">
          <Pencil class="w-5 h-5" />
        </Button>
      </div>
    </div>

    <!-- General list for mobile and desktop versions -->
    <div class="flex-1 overflow-y-auto space-y-2">
      <div
          @click.self="$emit('select', dialogue)"
          v-for="dialogue in dialogues"
          :key="dialogue.id"
          :class="['group flex items-center p-4 rounded-lg cursor-pointer',
                { 'bg-gray-200 dark:bg-gray-700': selectedId === dialogue.id }]"
      >
        <div class="ml-3 flex-1 max-w-30 md:max-w-50" @click="$emit('select', dialogue)">
          <p class="text-sm font-medium truncate">{{ dialogue.title }}</p>
        </div>

        <!-- DropdownMenu for mobile and desktop versions -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon" class="ml-auto shrink-0">
              <Menu class="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-40">
            <DropdownMenuItem @click="$emit('delete', dialogue)">{{ t('dialogue_list.menu.delete') }}</DropdownMenuItem>
            <DropdownMenuItem @click="$emit('rename', dialogue)">{{ t('dialogue_list.menu.rename') }}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Button
          class="w-full flex justify-center md:hidden"
          variant="outline"
          size="default"
          @click="$emit('delete-all')"
      >
        <Trash2 class="w-5 h-5" />
      </Button>
    </div>
  </div>
</template>