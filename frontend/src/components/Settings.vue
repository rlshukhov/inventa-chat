<script setup lang="ts">
import {ref, computed, reactive, onMounted, watch} from 'vue';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Settings2, Globe} from 'lucide-vue-next';
import {useI18n} from 'vue-i18n';
import {eventBus} from "@/eventBus.ts";
import {Provider, type ProviderID, providerIds, providers} from "@/models/ai/providers.ts";
import {settings} from "@/lib/services/settings.ts";
import type {Language} from "@/models/settings.ts";
import {Switch} from "@/components/ui/switch";

const {t, locale} = useI18n();
const open = defineModel<boolean>('open');
const errorMessage = ref<string | null>(null);
const isSaving = ref(false);

const isValid = computed(() => {
  for (const i in apiKeys) {
    if (apiKeys[i as ProviderID]) {
      return true;
    }
  }

  return false;
});

const apiKeys = reactive<Record<ProviderID, string>>({
  ...providerIds.reduce((acc, id) => {
    acc[id] = '';
    return acc;
  }, {} as Record<ProviderID, string>),
});

async function saveSettings() {
  if (!isValid.value) {
    return;
  }

  errorMessage.value = null;
  isSaving.value = true;

  for (const provider of providers) {
    const apiKey = apiKeys[provider.id];
    if (!apiKey) {
      continue;
    }

    const isKeyValid = await validateApiKey(provider, apiKey);

    if (!isKeyValid) {
      errorMessage.value = t('settings.invalid_api_key') || 'API key is invalid';
      isSaving.value = false;
      return;
    }
  }

  for (const provider of providers) {
    await provider.storage.set('bearer-token', apiKeys[provider.id]);
  }

  eventBus.emit("settingsUpdate", null);

  isSaving.value = false;
  open.value = false;
}

async function validateApiKey(provider: Provider, apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(`${provider.api.baseURL}${provider.api.availabilityCheckUrl}`, {
      headers: await provider.api.buildHeaders({'bearer-token': apiKey}),
    });
    return response.ok;
  } catch (e) {
    console.error('API key validation error:', e);
    return false;
  }
}

onMounted(async () => {
  const savedLocale = settings.locale;
  if (savedLocale && ['en', 'ru'].includes(savedLocale)) {
    locale.value = savedLocale;
  }

  sendOnEnter.value = settings.sendOnEnter;

  for (const provider of providers) {
    apiKeys[provider.id] = await provider.storage.get('bearer-token') || '';
  }
});

async function toggleLocale() {
  locale.value = locale.value === 'en' ? 'ru' : 'en';
  await settings.setLocale(locale.value as Language);
}

const sendOnEnter = ref(settings.sendOnEnter);
watch(sendOnEnter, ((value: boolean) => {
  if (value === settings.sendOnEnter) {
    return;
  }

  void settings.setSendOnEnter(value);
}));
</script>

<template>
  <AlertDialog v-model:open="open">
    <!-- Mobile button -->
    <AlertDialogTrigger as-child>
      <Button variant="ghost">
        <Settings2 class="w-4 h-4"/>
      </Button>
    </AlertDialogTrigger>

    <AlertDialogContent class="sm:max-w-[500px]">
      <AlertDialogHeader>
        <AlertDialogTitle>{{ t('settings.title') }}</AlertDialogTitle>
      </AlertDialogHeader>

      <div class="grid gap-4 py-4">
        <!-- API Key -->
        <div class="space-y-1" v-for="provider in providers" v-bind:key="provider.id">
          <label class="text-sm font-medium">
            {{ t('settings.api_key_label', {provider: provider.title}) }}
          </label>
          <Input
              v-model="apiKeys[provider.id]"
              :placeholder="t('settings.api_key_placeholder')"
              type="password"
          />
        </div>

        <!-- Language selection -->
        <Button @click="toggleLocale" variant="secondary">
          <Globe class="w-4 h-4"/>
          {{ locale === 'en' ? 'Русский' : 'English' }}
        </Button>

        <div class="flex items-center space-x-2">
          <Switch id="send-on-enter" :model-value="sendOnEnter" @update:model-value="sendOnEnter=!sendOnEnter"/>
          <Label for="send-on-enter">{{t('settings.send_on_enter')}}</Label>
        </div>

        <p v-if="errorMessage" class="text-red-500 text-sm">
          {{ errorMessage }}
        </p>
      </div>

      <AlertDialogFooter class="flex justify-between">
        <Button
            :disabled="!isValid || isSaving"
            @click="saveSettings">
          <span v-if="!isSaving">{{ t('settings.save') }}</span>
          <span v-else class="flex items-center gap-2">
            <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l5-5-5-5v4a10 10 0 00-10 10h4z"/>
            </svg>
            {{ t('settings.saving') || 'Saving...' }}
          </span>
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>