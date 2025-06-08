<script setup lang="ts">
import {ref, nextTick, onMounted, watch} from 'vue'
import DialogueList from '@/components/DialogueList.vue'
import MessageList from '@/components/MessageList.vue'
import DeleteDialogueDialog from '@/components/DeleteDialogueDialog.vue'
import RenameDialogueDialog from '@/components/RenameDialogueDialog.vue'
import MobileDialogueSheet from '@/components/MobileDialogueSheet.vue'
import { Textarea } from '@/components/ui/textarea'
import {Send, X} from 'lucide-vue-next'
import { Button } from "@/components/ui/button";
import {db, getApiKey, getSelectedModel, getSelectedProvider} from '@/data/chatDatabase.ts';
import { fetchResponseStream } from '@/aiService.ts';
import Settings from "@/components/Settings.vue";
import type { ChatMessage, Dialogue } from '@/data/chatDatabase.ts';
import { useI18n } from 'vue-i18n'
import ConfirmDeleteDialogs from '@/components/ConfirmDeleteDialogs.vue'

const input = ref('')
const isAwaiting = ref(false)
const messageListRef = ref<HTMLDivElement | null>(null)
const dialogueToDelete = ref<Dialogue | null>(null)
const isRemoveConfirmOpen = ref(false)
const renameModalOpen = ref(false)
const dialogueToRename = ref<Dialogue | null>(null)
const newDialogueTitle = ref('')
const sheetOpen = ref(false)
const isTyping = ref(false)
const dialogues = ref<Dialogue[]>([])
const selectedDialogue = ref<Dialogue | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const isSettingsOpen = defineModel<boolean>('open')
const { t } = useI18n()
const abortController = ref<AbortController | null>(null)
const editingLastUserMessage = ref(false)
const editingContent = ref('')
const isDialogsOpen = ref(false)

const updateTheme = () => {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle('dark', isDark);
};

updateTheme();

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateTheme);

// calculation of textarea height
function autoResize() {
  const textareaComponent = textareaRef.value as any;
  const textarea = textareaComponent?.textarea as HTMLTextAreaElement | undefined;

  if (!textarea) return;

  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
}

function scrollToBottom() {
  nextTick(() => {
    messageListRef.value?.scrollTo({
      top: messageListRef.value.scrollHeight,
      behavior: 'smooth'
    })
  })
}

function handleEnter() {
  if (editingLastUserMessage.value) {
    confirmEditAndRegenerate();
  } else {
    sendMessage();
  }
}

function startEditingLastUserMessage() {
  const lastIndex = selectedDialogue.value?.messages.findLastIndex(m => m.role === 'user');
  if (lastIndex === -1 || lastIndex === undefined || isAwaiting.value) return

  const content = selectedDialogue.value!.messages[lastIndex].content
  input.value = content
  editingContent.value = content
  editingLastUserMessage.value = true
  nextTick(autoResize)
}

// editing message
async function confirmEditAndRegenerate() {
  const messages = selectedDialogue.value?.messages
  if (!messages) return

  const userIndex = messages.findLastIndex(m => m.role === 'user')
  const assistantIndex = userIndex + 1

  const userMessage = messages[userIndex];
  userMessage.content = input.value;

  if (userMessage.id) {
    await db.messages.update(userMessage.id, { content: input.value });
  }

  if (messages[assistantIndex]?.role === 'assistant') {
    const deleted = messages.splice(assistantIndex, 1)[0];
    if (deleted?.id) {
      await db.messages.delete(deleted.id);
    }
  }

  editingLastUserMessage.value = false;
  input.value = ''
  editingContent.value = '';
  await sendMessage(true);
}

function cancelEditing() {
  input.value = ''
  editingLastUserMessage.value = false
  editingContent.value = ''
}

function stopGeneration() {
  abortController.value?.abort()
  abortController.value = null
  isAwaiting.value = false
  isTyping.value = false
}

async function sendMessage(regenerating = false) {
  abortController.value = new AbortController();
  if ((input.value.trim().length === 0 && !regenerating) || !selectedDialogue.value || isAwaiting.value) return;

  let userMessageContent = input.value.trim();
  const currentDialogueId = selectedDialogue.value.id;

  if (!regenerating) {
    const userMessage: ChatMessage = {
      dialogueId: currentDialogueId,
      role: 'user',
      content: userMessageContent,
      timestamp: Date.now()
    }

    selectedDialogue.value.messages.push({
      id: undefined,
      dialogueId: userMessage.dialogueId,
      role: userMessage.role,
      content: userMessage.content,
      timestamp: userMessage.timestamp,
    });

    await db.messages.add(userMessage);
  }

  if (!regenerating) input.value = '';
  isAwaiting.value = true;
  isTyping.value = true;
  scrollToBottom();

  const fullContext = [
    { role: 'system', content: 'Ты полезный ассистент, помогаешь по программированию и другим вопросам.' },
    ...selectedDialogue.value.messages.map(m => ({
      role: m.role,
      content: m.content
    }))
  ];

  const rawProvider = await getSelectedProvider();
  const provider = (rawProvider === 'gpt' || rawProvider === 'deepseek') ? rawProvider : 'gpt';
  let fullContent = '';

  try {
    await fetchResponseStream(fullContext, provider, (partial: string) => {
      fullContent = partial;
      if (selectedDialogue.value?.id === currentDialogueId) {
        const lastMessage = selectedDialogue.value.messages[selectedDialogue.value.messages.length - 1];
        if (lastMessage?.role === 'assistant') {
          lastMessage.content = partial;
        } else {
          selectedDialogue.value.messages.push({
            id: undefined,
            dialogueId: currentDialogueId,
            role: 'assistant',
            content: partial,
            timestamp: Date.now()
          });
        }
        scrollToBottom();
      }
    }, abortController.value);

    if (selectedDialogue.value && selectedDialogue.value.id === currentDialogueId) {
      await db.messages.add({
        dialogueId: currentDialogueId,
        role: 'assistant',
        content: fullContent,
        timestamp: Date.now()
      });
    }
  } catch (e: unknown) {
    if (e instanceof Error && e.name !== 'AbortError') {
      console.error('Ошибка при получении ответа:', e);
    }
  }
  abortController.value = null;
  isTyping.value = false;
  isAwaiting.value = false;
  scrollToBottom();

  if (regenerating) {
    editingLastUserMessage.value = false;
    editingContent.value = '';
    input.value = '';
  }
}

async function selectDialogue(dialogue: Dialogue) {
  selectedDialogue.value = dialogue
  sheetOpen.value = false
  isTyping.value = false

  const storedMessages = await db.messages
      .where('dialogueId')
      .equals(dialogue.id)
      .sortBy('timestamp')

  selectedDialogue.value.messages = storedMessages.map(msg => ({
    id: msg.id,
    dialogueId: msg.dialogueId,
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp,
  }));

  scrollToBottom()

  await nextTick(() => {
    const textareaComponent = textareaRef.value as any;
    const textarea = textareaComponent?.textarea as HTMLTextAreaElement | undefined;
    textarea?.focus();
  })
}

function confirmDeleteDialogue() {
  if (!dialogueToDelete.value) return

  dialogues.value = dialogues.value.filter(d => d.id !== dialogueToDelete.value!.id)

  if (selectedDialogue.value?.id === dialogueToDelete.value.id) {
    selectedDialogue.value = dialogues.value[0] || null
  }

  db.dialogues.delete(dialogueToDelete.value.id)
  db.messages.where('dialogueId').equals(dialogueToDelete.value.id).delete()

  dialogueToDelete.value = null
  isRemoveConfirmOpen.value = false
  scrollToBottom()
}

function openRenameModal(dialogue: Dialogue) {
  dialogueToRename.value = { ...dialogue }
  newDialogueTitle.value = dialogue.title
  renameModalOpen.value = true
}

async function confirmRenameDialogue() {
  if (!dialogueToRename.value || newDialogueTitle.value.trim() === '') return

  const newTitle = newDialogueTitle.value.trim()

  dialogues.value = dialogues.value.map(d =>
      d.id === dialogueToRename.value!.id
          ? { ...d, title: newTitle }
          : d
  )

  if (selectedDialogue.value?.id === dialogueToRename.value.id) {
    selectedDialogue.value = { ...selectedDialogue.value, title: newTitle }
  }

  await db.dialogues.update(dialogueToRename.value.id, { title: newTitle });

  renameModalOpen.value = false
  dialogueToRename.value = null
}

async function createNewDialogue() {
  const newDialogueId = Date.now().toString();

  const newDialogue = {
    id: newDialogueId,
    title: t('new_dialogue', { n: dialogues.value.length + 1 }),
    messages: []
  };

  await db.dialogues.add({ id: newDialogue.id, title: newDialogue.title });

  dialogues.value.unshift(newDialogue);

  selectedDialogue.value = dialogues.value[0];
  scrollToBottom();

  await nextTick(() => {
    const textareaComponent = textareaRef.value as any;
    const textarea = textareaComponent?.textarea as HTMLTextAreaElement | undefined;
    textarea?.focus();
  });
}

async function loadDialogues() {
  const storedDialogues = await db.dialogues.toArray();

  dialogues.value = storedDialogues.map(d => ({
    id: d.id,
    title: d.title,
    messages: [] as ChatMessage[]
  }));

  if (dialogues.value.length > 0) {
    await selectDialogue(dialogues.value[0]);
  }
}

function openDeleteDialogs() {
  isDialogsOpen.value = true
}

async function onConfirmDelete() {
  isDialogsOpen.value = false

  await db.dialogues.clear()
  await db.messages.clear()
  dialogues.value = []
  selectedDialogue.value = null
}

onMounted(async () => {
  await loadDialogues()
  await nextTick(() => autoResize())
  const provider = await getSelectedProvider()
  const model = provider ? await getSelectedModel(provider) : null
  const apiKey = provider ? await getApiKey(provider) : null

  if (!provider || !model || !apiKey) {
    isSettingsOpen.value = true
  }
})

watch(input, () => nextTick(() => autoResize()))

watch(isDialogsOpen, (val) => {
  if (val) {
    sheetOpen.value = false
  }
})
</script>

<template>
  <div class="flex flex-row h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">

    <!-- Sidebar for large screens -->
    <div class="hidden md:flex min-w-80 w-80">
      <DialogueList
          :dialogues="dialogues"
          :selectedId="selectedDialogue?.id || null"
          @select="selectDialogue"
          @delete="dialogue => { dialogueToDelete = dialogue; isRemoveConfirmOpen = true }"
          @rename="openRenameModal"
          @create="createNewDialogue"
          @delete-all="openDeleteDialogs"
      />
    </div>

    <!-- Main content -->
    <div class="p-4 flex flex-col flex-1 min-w-1">

      <!-- Heading and settings button for large screens -->
      <div class="hidden md:flex items-center justify-between mb-4 border-b dark:border-gray-700 pb-3">
        <p class="text-lg font-semibold">
          {{ selectedDialogue?.title }}
        </p>
        <Settings v-model:open="isSettingsOpen" />
      </div>

      <!-- Mobile menu -->
      <MobileDialogueSheet
          :dialogues="dialogues"
          :selectedId="selectedDialogue?.id || null"
          @select="selectDialogue"
          @create="createNewDialogue"
          @delete="dialogue => { dialogueToDelete = dialogue; isRemoveConfirmOpen = true }"
          @rename="openRenameModal"
          @delete-all="openDeleteDialogs"/>

      <!-- List of messages -->
      <div v-if="selectedDialogue" ref="messageListRef" class="flex-1 overflow-y-auto space-y-2 mb-2">
        <MessageList
            :messages="selectedDialogue.messages"
            @edit-last-user-message="startEditingLastUserMessage"/>
        <div v-if="isTyping" class="p-1 text-gray-500">
          {{ t('bot_typing') }}
        </div>
      </div>
      <div v-else class="text-center text-gray-500 dark:text-gray-400">
        {{ t('no_dialogue_selected') }}
      </div>

      <!-- Input and send button -->
      <div v-if="selectedDialogue" class="flex items-end w-full space-x-2 mt-auto">
        <Textarea
            v-model="input"
            ref="textareaRef"
            :placeholder="t('enter_message')"
            class="flex-1 p-2 rounded border dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[2.5rem] resize-none"
            @input="autoResize"
            @keydown.enter.exact.prevent="handleEnter"/>

        <!-- Buttons -->
        <div v-if="editingLastUserMessage">
          <Button :disabled="input.length === 0"
                  @click="confirmEditAndRegenerate"
                  variant="ghost">
            <Send/>
          </Button>
          <Button @click="cancelEditing" variant="ghost">
            <X />
          </Button>
        </div>

        <Button
            v-else-if="!isAwaiting"
            :disabled="input.length === 0"
            @click="sendMessage"
            class="flex items-center justify-center h-full"
            variant="ghost">
          <Send/>
        </Button>

        <Button
            v-if="isAwaiting"
            @click="stopGeneration"
            class="h-full"
            variant="destructive">
          {{ t('stop') }}
        </Button>
      </div>

      <!-- Delete modal -->
      <DeleteDialogueDialog
          :open="isRemoveConfirmOpen"
          :dialogue="dialogueToDelete"
          @update:open="isRemoveConfirmOpen = $event"
          @confirm="confirmDeleteDialogue"/>

      <!-- Rename modal -->
      <RenameDialogueDialog
          :open="renameModalOpen"
          :title="newDialogueTitle"
          @update:open="renameModalOpen = $event"
          @confirm="title => { newDialogueTitle = title; confirmRenameDialogue() }"/>

      <ConfirmDeleteDialogs
          :open="isDialogsOpen"
          :dialogue="{ title: t('all-dialog') }"
          @update:open="val => isDialogsOpen = val"
          @confirm="onConfirmDelete"
      />
    </div>
  </div>
</template>