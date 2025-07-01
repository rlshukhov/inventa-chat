<script setup lang="ts">
import {ref, nextTick, onMounted, watch, onBeforeUnmount} from 'vue';
import MessageList from '@/components/MessageList.vue';
import DeleteDialogueDialog from '@/components/DeleteDialogueDialog.vue';
import RenameDialogueDialog from '@/components/RenameDialogueDialog.vue';
import {Textarea} from '@/components/ui/textarea';
import {Pencil, Send, X, PanelLeft} from 'lucide-vue-next';
import {Button} from "@/components/ui/button";
import Settings from "@/components/Settings.vue";
import {useI18n} from 'vue-i18n';
import ConfirmDeleteDialogs from '@/components/ConfirmDeleteDialogs.vue';
import {eventBus} from "@/eventBus.ts";

const input = ref('');
const isAwaiting = ref(false);
const messageListRef = ref<HTMLDivElement | null>(null);
const dialogueToDelete = ref<Dialogue | null>(null);
const isRemoveConfirmOpen = ref(false);
const renameModalOpen = ref(false);
const dialogueToRename = ref<Dialogue | null>(null);
const newDialogueTitle = ref('');
const sheetOpen = ref(false);
const dialogues = ref<Dialogue[]>([]);
const selectedDialogue = ref<Dialogue | null>(null);
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const isSettingsOpen = defineModel<boolean>('open');
const {t} = useI18n();
const abortController = ref<AbortController | null>(null);
const editingLastUserMessage = ref(false);
const editingContent = ref('');
const isDialogsOpen = ref(false);
const selectedModel = ref<Model | null>(null);

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import {SidebarContent, SidebarProvider} from "@/components/ui/sidebar";
import DialogueSidebar from "@/DialogueSidebar.vue";
import {streamChatCompletion} from "@/lib/services/ai.ts";
import type {Dialogue} from "@/models/chats.ts";
import {chatsStorage} from "@/lib/services/chats.ts";
import {getModelByUid, type Provider, providers} from "@/models/ai/providers.ts";
import type {Model} from "@/models/ai/models.ts";
import type {Message} from "@/models/ai/messages.ts";
import {settings} from "@/lib/services/settings.ts";
import {useMediaQuery} from "@vueuse/core";

const updateTheme = () => {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle('dark', isDark);
};

updateTheme();

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateTheme);

let isUserScrolling: boolean = false;
let scrollTimeout: number | undefined = undefined;
const SCROLL_DEBOUNCE = 1000;

function handleScroll() {
  isUserScrolling = true;

  clearTimeout(scrollTimeout);

  scrollTimeout = setTimeout(() => {
    isUserScrolling = false;
  }, SCROLL_DEBOUNCE);
}

function setupScrollListener() {
  const container = messageListRef.value;
  if (!container) {
    return;
  }

  container.addEventListener('scroll', handleScroll, {passive: true});
}

function isAtBottom(threshold = 150) {
  const container = messageListRef.value;
  if (!container) {
    return;
  }

  return container.scrollTop + container.clientHeight >=
      container.scrollHeight - threshold;
}

function scrollToBottom(force: boolean = true) {
  void nextTick(() => {
    if ((isUserScrolling || !isAtBottom()) && !force) {
      return;
    }

    messageListRef.value?.scrollTo({
      top: messageListRef.value.scrollHeight,
      behavior: force ? 'smooth' : 'instant',
    });
  });
}

function handleEnter(event: KeyboardEvent) {
  if (!settings.sendOnEnter) {
    return;
  }

  event.preventDefault();
  void sendMessage();
}

function startEditingLastUserMessage() {
  const lastIndex = selectedDialogue.value?.messages.findLastIndex(m => m.role === 'user');
  if (lastIndex === -1 || lastIndex === undefined || isAwaiting.value) {
    return;
  }

  const content = selectedDialogue.value!.messages[lastIndex].content;
  input.value = content;
  editingContent.value = content;
  editingLastUserMessage.value = true;
}

function stopGeneration() {
  abortController.value?.abort();
  abortController.value = null;
  isAwaiting.value = false;
}

async function sendMessage() {
  abortController.value = new AbortController();
  if ((input.value.trim().length === 0) || !selectedDialogue.value || isAwaiting.value) {
    return;
  }

  const userMessageContent = input.value.trim();
  const currentDialogueId = selectedDialogue.value.id;

  const userMessage = chatsStorage.createMessage(currentDialogueId, 'user', userMessageContent);
  selectedDialogue.value.messages.push(userMessage);
  await chatsStorage.storeMessage(userMessage);

  input.value = '';
  isAwaiting.value = true;
  scrollToBottom();

  const fullContext: Message[] = [
    {
      role: 'system',
      content: 'Ты полезный ассистент, помогаешь по программированию и другим вопросам.',
    },
    ...selectedDialogue.value.messages.map(m => ({
      role: m.role,
      content: m.content,
    })),
  ];

  let fullContent = '';

  selectedDialogue.value.messages.push(chatsStorage.createMessage(selectedDialogue.value.id, 'assistant', '', selectedModel.value?.uid, userMessage.id, true));

  try {
    await streamChatCompletion(selectedModel.value!, fullContext, (partial: string) => {
      fullContent = partial;
      if (selectedDialogue.value?.id === currentDialogueId) {
        const lastMessage = selectedDialogue.value.messages[selectedDialogue.value.messages.length - 1];
        if (lastMessage?.role === 'assistant') {
          lastMessage.content = partial;
        }
        scrollToBottom(false);
      }
    }, abortController.value);

    const lastMessage = selectedDialogue.value.messages[selectedDialogue.value.messages.length - 1];
    if (lastMessage?.role === 'assistant') {
      lastMessage.isTyping = false;
    }

    if (selectedDialogue.value && selectedDialogue.value.id === currentDialogueId) {
      await chatsStorage.storeMessage(chatsStorage.createMessage(selectedDialogue.value.id, 'assistant', fullContent, selectedModel.value?.uid, userMessage.id));
    }
  } catch (e: unknown) {
    if (e instanceof Error && e.name !== 'AbortError') {
      console.error('Ошибка при получении ответа:', e);
    }
  }
  abortController.value = null;
  isAwaiting.value = false;
  scrollToBottom(false);
}

const isMobile = useMediaQuery('(max-width: 768px)');

async function selectDialogue(dialogue: Dialogue) {
  if (isMobile) {
    isSidebarOpenMobile.value = false;
  }

  selectedDialogue.value = dialogue;
  sheetOpen.value = false;

  selectedDialogue.value = await chatsStorage.getDialogueWithMessages(dialogue.id);

  scrollToBottom();

  await nextTick(() => {
    const textareaComponent = textareaRef.value as any;
    const textarea = textareaComponent?.textarea as HTMLTextAreaElement | undefined;
    textarea?.focus();
  });
}

function confirmDeleteDialogue() {
  if (isMobile) {
    isSidebarOpenMobile.value = false;
  }

  if (!dialogueToDelete.value) {
    return;
  }

  dialogues.value = dialogues.value.filter(d => d.id !== dialogueToDelete.value!.id);

  if (selectedDialogue.value?.id === dialogueToDelete.value.id) {
    selectedDialogue.value = dialogues.value[0] || null;
  }

  void chatsStorage.deleteDialogue(selectedDialogue.value!.id);

  dialogueToDelete.value = null;
  isRemoveConfirmOpen.value = false;
  scrollToBottom();
}

function openRenameModal(dialogue: Dialogue) {
  if (isMobile) {
    isSidebarOpenMobile.value = false;
  }

  dialogueToRename.value = {...dialogue};
  newDialogueTitle.value = dialogue.title;
  renameModalOpen.value = true;
}

function openDeleteModal(dialogue: Dialogue) {
  if (isMobile) {
    isSidebarOpenMobile.value = false;
  }

  dialogueToDelete.value = dialogue;
  isRemoveConfirmOpen.value = true;
}

async function confirmRenameDialogue() {
  if (isMobile) {
    isSidebarOpenMobile.value = false;
  }

  if (!dialogueToRename.value || newDialogueTitle.value.trim() === '') {
    return;
  }

  const newTitle = newDialogueTitle.value.trim();

  dialogues.value = dialogues.value.map(d =>
      d.id === dialogueToRename.value!.id
          ? {...d, title: newTitle}
          : d,
  );

  if (selectedDialogue.value?.id === dialogueToRename.value.id) {
    selectedDialogue.value = {...selectedDialogue.value, title: newTitle};
  }

  await chatsStorage.storeDialogue(selectedDialogue.value!);

  renameModalOpen.value = false;
  dialogueToRename.value = null;
}

async function createNewDialogue() {
  const newDialogue = chatsStorage.createDialogue(t('new_dialogue', {n: dialogues.value.length + 1}));
  await chatsStorage.storeDialogue(newDialogue);

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
  dialogues.value = await chatsStorage.getDialogues() as Dialogue[];
  if (dialogues.value.length > 0) {
    await selectDialogue(dialogues.value[0]);
  }
}

function openDeleteDialogs() {
  if (isMobile) {
    isSidebarOpenMobile.value = false;
  }

  isDialogsOpen.value = true;
}

async function onConfirmDelete() {
  if (isMobile) {
    isSidebarOpenMobile.value = false;
  }

  isDialogsOpen.value = false;

  await chatsStorage.drop();
  dialogues.value = [];
  selectedDialogue.value = null;
}

onBeforeUnmount(() => {
  const container = messageListRef.value;
  container?.removeEventListener('scroll', handleScroll);
  clearTimeout(scrollTimeout);
});

onMounted(async () => {
  setupScrollListener();

  const available = (await Promise.all(providers.map(p => p.isAvailable()))).some(Boolean);
  if (!available) {
    isSettingsOpen.value = true;
  }

  await loadDialogues();
  const model = getModelByUid(settings.lastUsedModelUid ?? '');

  if (model) {
    selectedModel.value = model;
  }
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  eventBus.on('settingsUpdate', filterProviders);
  await filterProviders();
});

watch(isDialogsOpen, (val) => {
  if (val) {
    sheetOpen.value = false;
  }
});

async function filterProviders() {
  filteredProviders.value = [];

  const filtered: Array<Provider> = [];
  for (const provider of providers) {
    if (await provider.isAvailable()) {
      filtered.push(provider);
    }
  }

  filteredProviders.value = filtered;
}

const filteredProviders = ref(providers);

const getModelsByProvider = (providerId: string) => {
  return filteredProviders.value.filter(provider => provider.id === providerId)[0].models;
};

const isSidebarOpen = ref(true);
const isSidebarOpenMobile = ref(false);
</script>

<template>
  <div class="full">
    <SidebarContent class="full">
      <SidebarProvider :open="isSidebarOpen" :open-mobile="isSidebarOpenMobile"
                       @update:openMobile="(v) => isSidebarOpenMobile = v">
        <DialogueSidebar
            :dialogues="dialogues"
            :selectedId="selectedDialogue?.id || null"
            @select="selectDialogue"
            @create="createNewDialogue"
            @delete="openDeleteModal"
            @rename="openRenameModal"
            @delete-all="openDeleteDialogs"
        />
        <main class="w-full h-full min-h-full max-h-full"
              :class="{'without-sidebar': isSidebarOpen && !isMobile}">
          <!-- Main content -->
          <div class="flex flex-col h-full min-h-full max-h-full">

            <!-- Heading and settings button for large screens -->
            <div class="titlebar px-2 flex items-center justify-between border-b translucent-border pb-2 shadow-lg z-1">
              <Button class="hidden md:flex" variant="link" size="icon" @click="isSidebarOpen=!isSidebarOpen">
                <PanelLeft class="w-5 h-5"/>
              </Button>
              <Button class="flex md:hidden" variant="link" size="icon"
                      @click="isSidebarOpenMobile=!isSidebarOpenMobile">
                <PanelLeft class="w-5 h-5"/>
              </Button>
              <p class="text-lg font-semibold flex-1 px-2">
                {{ selectedDialogue?.title }}
              </p>
              <Button variant="ghost" size="icon" @click="createNewDialogue" class="mr-2">
                <Pencil class="w-5 h-5"/>
              </Button>
              <Settings v-model:open="isSettingsOpen"/>
            </div>

            <!-- List of messages -->
            <div v-if="selectedDialogue" ref="messageListRef" class="flex-grow overflow-auto px-2">
              <MessageList :messages="selectedDialogue.messages"
                           @edit-last-user-message="startEditingLastUserMessage"/>
            </div>
            <p v-else class="text-center my-auto">
              {{ t('no_dialogue_selected') }}
            </p>

            <div v-if="selectedDialogue"
                 class="flex flex-row border-t translucent-border mb-2 mb-safe z-1 shadow-[0_-10px_15px_-3px_rgb(0_0_0_/_0.1),0_-4px_6px_-4px_rgb(0_0_0_/_0.1)]">
              <div class="flex flex-col w-full">
                <div class="w-full overflow-auto no-scrollbar">
                  <div class="flex flex-row gap-1 text-sm py-1 px-2">
                    <p>{{ t('model') }}:</p>

                    <DropdownMenu>
                      <DropdownMenuTrigger as-child>
                        <Button variant="ghost" class="px-1 py-0 h-auto">
                    <span class="underline decoration-dotted">
                      {{ selectedModel?.title || t('select_model') }}
                    </span>
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent class="w-48">
                        <DropdownMenuLabel>{{ t('select_model') }}</DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <DropdownMenuSub
                            v-for="provider in filteredProviders"
                            :key="provider.id"
                        >
                          <DropdownMenuSubTrigger>
                            {{ provider.title }}
                          </DropdownMenuSubTrigger>

                          <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                              <DropdownMenuItem
                                  v-for="model in getModelsByProvider(provider.id)"
                                  :key="model.id"
                                  @click="selectedModel=model"
                              >
                                {{ model.id }}
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <Textarea
                    v-model="input"
                    ref="textareaRef"
                    :placeholder="t('enter_message')"
                    class="flex-1 focus:outline-none min-h-[4rem] resize-none"
                    :disabled="isAwaiting"
                    @keydown.enter.exact="(e: KeyboardEvent) => handleEnter(e)"
                />
              </div>

              <Button
                  v-if="!isAwaiting"
                  :disabled="input.length === 0"
                  @click="handleEnter"
                  class="flex items-center justify-center h-full mr-2"
                  variant="link">
                <Send class="!w-5 !h-5"/>
              </Button>
              <Button
                  v-if="isAwaiting"
                  @click="stopGeneration"
                  class="flex items-center justify-center h-full mr-2"
                  variant="link">
                <X color="red" class="!w-5 !h-5"></X>
              </Button>

            </div>
          </div>
        </main>
      </SidebarProvider>
    </SidebarContent>

    <DeleteDialogueDialog
        :open="isRemoveConfirmOpen"
        :dialogue="dialogueToDelete"
        @update:open="isRemoveConfirmOpen = $event"
        @confirm="confirmDeleteDialogue"/>
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
</template>