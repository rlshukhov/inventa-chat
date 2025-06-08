<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet'
import { Send, Menu, Pencil } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'

const sheetOpen = ref(false)
const input = ref('')
const inputLength = computed(() => input.value.trim().length)
const isAwaiting = ref(false)
const messageListRef = ref<HTMLDivElement | null>(null)
const dialogueToDelete = ref<Dialogue | null>(null)
const isRemoveConfirmOpen = ref(false)
const renameModalOpen = ref(false)
const dialogueToRename = ref<Dialogue | null>(null)
const newDialogueTitle = ref('')

interface Dialogue {
  id: string
  title: string
  messages: { role: 'assistant' | 'user'; content: string }[]
}

const dialogues = ref<Dialogue[]>([
  {
    id: '1',
    title: 'Помощь с аккаунтом',
    messages: [
      { role: 'assistant', content: 'Привет! Чем могу помочь?' },
      { role: 'user', content: 'Не получается войти в аккаунт.' },
      { role: 'assistant', content: 'Давайте разберёмся, в чём проблема.' }
    ]
  },
  {
    id: '2',
    title: 'Как выйти замуж',
    messages: [
      { role: 'assistant', content: 'Привет! Чем могу помочь?' },
      { role: 'user', content: 'Не получается войти в аккаунт.' },
      { role: 'assistant', content: 'Давайте разберёмся, в чём проблема.' }
    ]
  }
])

const selectedDialogue = ref<Dialogue | null>(dialogues.value[0])

function scrollToBottom() {
  nextTick(() => {
    messageListRef.value?.scrollTo({
      top: messageListRef.value.scrollHeight,
      behavior: 'smooth'
    })
  })
}

function sendMessage() {
  if (inputLength.value === 0 || !selectedDialogue.value || isAwaiting.value) return

  selectedDialogue.value.messages.push({ role: 'user', content: input.value.trim() })
  input.value = ''
  isAwaiting.value = true
  scrollToBottom()

  setTimeout(() => {
    selectedDialogue.value?.messages.push({ role: 'assistant', content: 'Ответ нейросети на ваш вопрос.' })
    isAwaiting.value = false
    scrollToBottom()
  }, 1000)
}

function selectDialogue(dialogue: Dialogue) {
  selectedDialogue.value = dialogue
  sheetOpen.value = false
  scrollToBottom()
}

function confirmDeleteDialogue() {
  if (!dialogueToDelete.value) return
  dialogues.value = dialogues.value.filter(d => d.id !== dialogueToDelete.value!.id)
  if (selectedDialogue.value?.id === dialogueToDelete.value.id) {
    selectedDialogue.value = dialogues.value[0] || null
  }
  dialogueToDelete.value = null
  isRemoveConfirmOpen.value = false
  scrollToBottom()
}

function openRenameModal(dialogue: Dialogue) {
  dialogueToRename.value = { ...dialogue }
  newDialogueTitle.value = dialogue.title
  renameModalOpen.value = true
}

function confirmRenameDialogue() {
  if (!dialogueToRename.value || newDialogueTitle.value.trim() === '') return
  dialogues.value = dialogues.value.map(d =>
      d.id === dialogueToRename.value!.id ? { ...d, title: newDialogueTitle.value.trim() } : d
  )
  if (selectedDialogue.value?.id === dialogueToRename.value.id) {
    selectedDialogue.value = { ...selectedDialogue.value, title: newDialogueTitle.value.trim() }
  }
  renameModalOpen.value = false
  dialogueToRename.value = null
}

const isDark = ref(false)

if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  isDark.value = mediaQuery.matches

  mediaQuery.addEventListener('change', (e) => {
    isDark.value = e.matches
    applyTheme()
  })
}

function applyTheme() {
  document.documentElement.classList.toggle('dark', isDark.value)
}

applyTheme()

function createNewDialogue() {
  const newDialogue: Dialogue = {
    id: Date.now().toString(),
    title: `Новый диалог ${dialogues.value.length + 1}`,
    messages: [
      { role: 'assistant', content: 'Привет! Я готов к разговору.' }
    ]
  }
  dialogues.value.unshift(newDialogue)
  selectedDialogue.value = newDialogue
  scrollToBottom()
}
</script>

<template>
  <div class="flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
    <!-- Список диалогов — Сайдбар -->
    <div class="hidden md:flex md:w-1/3 bg-gray-100 dark:bg-gray-800 p-4 flex-col">
      <div class="flex justify-between items-center mb-4">
        <h2 class="font-semibold text-lg">Диалоги</h2>
        <Button
            variant="outline"
            size="icon"
            @click="createNewDialogue"
        >
          <Pencil class="w-5 h-5" />
        </Button>
      </div>

      <!-- Скроллируемый список -->
      <div class="flex-1 overflow-y-auto space-y-2">
        <div
            v-for="dialogue in dialogues"
            :key="dialogue.id"
            class="group relative flex items-center mb-2 cursor-pointer p-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            :class="{ 'bg-gray-200 dark:bg-gray-700': selectedDialogue?.id === dialogue.id }"
        >
          <div class="ml-3 flex-1" @click="selectDialogue(dialogue)">
            <p class="text-sm font-medium truncate">{{ dialogue.title }}</p>
          </div>
          <div class="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="icon" class="ml-auto shrink-0">
                  <Menu class="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent class="w-40">
                <DropdownMenuItem @click="dialogueToDelete = dialogue; isRemoveConfirmOpen = true">Удалить</DropdownMenuItem>
                <DropdownMenuItem @click="openRenameModal(dialogue)">Переименовать</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>

    <!-- Основная часть -->
    <div class="flex-1 p-4 flex flex-col">

      <!-- Верхний бар для мобильных -->
      <div v-if="selectedDialogue" class="flex md:hidden items-center justify-between w-full mb-4 border-b dark:border-gray-700 pb-3">
        <!-- Меню-кнопка слева -->
        <Sheet v-model:open="sheetOpen">
          <SheetTrigger as-child>
            <Button variant="outline" size="icon" class="focus:ring-0 focus:outline-none">
              <Menu class="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" class="p-4 w-64 flex flex-col">
            <h2 class="font-semibold text-lg mb-4">Диалоги</h2>
            <div class="flex-1 overflow-y-auto space-y-2">
              <div
                  v-for="dialogue in dialogues"
                  :key="dialogue.id"
                  class="flex items-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                  :class="{ 'bg-gray-200 dark:bg-gray-700': selectedDialogue?.id === dialogue.id }"
              >
                <div class="ml-3 flex-1 overflow-hidden" @click="selectDialogue(dialogue)">
                  <p class="text-sm font-medium truncate">{{ dialogue.title }}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon" class="ml-auto shrink-0">
                      <Menu class="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent class="w-40">
                    <DropdownMenuItem @click="selectDialogue(dialogue)">Открыть</DropdownMenuItem>
                    <DropdownMenuItem @click="dialogueToDelete = dialogue; isRemoveConfirmOpen = true">Удалить</DropdownMenuItem>
                    <DropdownMenuItem @click="openRenameModal(dialogue)">Переименовать</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <!-- Название по центру -->
        <p class="text-lg font-semibold flex-1 text-center">{{ selectedDialogue.title }}</p>

        <!-- Кнопка "Создать новый диалог" справа -->
        <Button variant="ghost" size="icon" @click="createNewDialogue">
          <Pencil class="w-5 h-5" />
        </Button>
      </div>

      <!-- Панель для десктопа: только текст -->
      <div v-if="selectedDialogue" class="hidden md:flex items-center justify-between mb-4 border-b dark:border-gray-700 pb-3">
        <div class="ml-3">
          <p class="text-lg font-semibold">{{ selectedDialogue.title }}</p>
        </div>
      </div>

      <!-- Сообщения -->
      <div class="flex-1 overflow-y-auto space-y-2 pr-2" v-if="selectedDialogue" ref="messageListRef">
        <div
            v-for="(message, index) in selectedDialogue.messages"
            :key="index"
            :class="[
            'p-3 rounded-2xl max-w-[75%] break-words',
            message.role === 'user'
              ? 'ml-auto bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-100 text-gray-900'
          ]"
        >
          {{ message.content }}
        </div>
      </div>

      <!-- Пусто, если диалог не выбран -->
      <div class="text-center text-gray-500 dark:text-gray-400" v-else>
        Нет выбранного диалога.
      </div>

      <!-- Ввод сообщения -->
      <div class="flex items-center mt-4 space-x-2" v-if="selectedDialogue">
        <Input
            v-model="input"
            placeholder="Введите сообщение..."
            class="flex-1"
            @keyup.enter="!isAwaiting && sendMessage()"
        />
        <Button
            :disabled="inputLength === 0 || isAwaiting"
            @click="sendMessage"
            class="p-2 h-10 w-10 flex items-center justify-center"
        >
          <Send class="w-4 h-4" />
        </Button>
      </div>
    </div>

    <!-- Подтверждение удаления -->
    <AlertDialog v-model:open="isRemoveConfirmOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
          <AlertDialogDescription>
            Это действие нельзя отменить. Диалог <b>{{ dialogueToDelete?.title }}</b> будет удалён.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction @click="confirmDeleteDialogue">Удалить</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- Модалка переименования -->
    <Dialog v-model:open="renameModalOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Переименовать диалог</DialogTitle>
          <DialogDescription>Введите новое название для диалога.</DialogDescription>
        </DialogHeader>
        <Input v-model="newDialogueTitle" placeholder="Новое название..." class="mt-4" />
        <div class="flex justify-end space-x-2 mt-4">
          <Button variant="outline" @click="renameModalOpen = false">Отмена</Button>
          <Button :disabled="newDialogueTitle.trim().length === 0" @click="confirmRenameDialogue">Сохранить</Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
