<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Settings2, Globe } from 'lucide-vue-next'
import {saveApiKey, saveLocale, getLocale, getApiKey} from '@/data/chatDatabase.ts'
import type { Locale} from '@/data/chatDatabase.ts'
import { useI18n } from 'vue-i18n'
import {providers, type ProviderRaw} from "@/aiService.ts";
import {eventBus} from "@/eventBus.ts";

const { t, locale } = useI18n()
const open = defineModel<boolean>('open')
const errorMessage = ref<string | null>(null)
const isSaving = ref(false)

const isValid = computed(() => {
  return apiKeys.gpt || apiKeys.deepseek || apiKeys.perplexity;
})

const apiKeys = reactive<Record<ProviderRaw, string>>({
  gpt: '',
  deepseek: '',
  perplexity: '',
})

async function saveSettings() {
  if (!isValid.value) return

  errorMessage.value = null
  isSaving.value = true

  for (let i=0; i < providers.length; i++) {
    const provider = providers[i].value
    const apiKey = apiKeys[provider]
    if (!apiKey) {
      continue
    }

    const isKeyValid = await validateApiKey(provider, apiKey)

    if (!isKeyValid) {
      errorMessage.value = t('settings.invalid_api_key') || 'API key is invalid'
      isSaving.value = false
      return
    }
  }

  for (let i=0; i < providers.length; i++) {
    const provider = providers[i].value
    await saveApiKey(provider, apiKeys[provider])
  }

  eventBus.emit("settingsUpdate", null)

  isSaving.value = false
  open.value = false
}

async function validateApiKey(provider: ProviderRaw, apiKey: string): Promise<boolean> {
  try {
    let response: Response

    if (provider === 'gpt') {
      response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      })
    } else if (provider === 'deepseek') {
      response = await fetch('https://api.deepseek.com/v1/models', {
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      })
    } else if (provider === 'perplexity') {
      response = await fetch('https://api.perplexity.ai/async/chat/completions', {
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      })
    } else {
      return false
    }

    return response.ok
  } catch (e) {
    console.error('API key validation error:', e)
    return false
  }
}

// load settings on mount
onMounted(async () => {
  const savedLocale = await getLocale()
  if (savedLocale && ['en', 'ru'].includes(savedLocale)) {
    locale.value = savedLocale as 'en' | 'ru'
  }

  for (let i=0; i < providers.length; i++) {
    const provider = providers[i].value
    apiKeys[provider] = await getApiKey(provider)
  }
});

async function toggleLocale() {
  locale.value = locale.value === 'en' ? 'ru' : 'en'
  await saveLocale(locale.value as Locale)
}
</script>

<template>
  <AlertDialog v-model:open="open">
    <!-- Mobile button -->
    <AlertDialogTrigger as-child>
      <Button variant="ghost" class="md:hidden">
        <Settings2 class="w-4 h-4" />
      </Button>
    </AlertDialogTrigger>

    <!-- Desktop button -->
    <AlertDialogTrigger as-child>
      <Button variant="outline" class="hidden md:flex">
        <Settings2 class="mr-2 w-4 h-4" />
        {{ t('settings.button') }}
      </Button>
    </AlertDialogTrigger>

    <AlertDialogContent
        class="sm:max-w-[500px]"

    >
      <AlertDialogHeader>
        <AlertDialogTitle>{{ t('settings.title') }}</AlertDialogTitle>
      </AlertDialogHeader>

      <div class="grid gap-4 py-4">
        <!-- API Key -->
        <div class="space-y-1" v-for="provider in providers">
          <label class="text-sm font-medium">
            {{ t('settings.api_key_label', { provider: provider.label }) }}
          </label>
          <Input
              v-model="apiKeys[provider.value]"
              :placeholder="t('settings.api_key_placeholder')"
              type="password"
          />
        </div>

        <!-- Language selection -->
        <Button @click="toggleLocale" variant="secondary">
          <Globe class="w-4 h-4" />
          {{ locale === 'en' ? 'Русский' : 'English' }}
        </Button>

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