<script setup lang="ts">
import { ref, computed, reactive, onMounted, watch } from 'vue'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {Combobox, ComboboxAnchor, ComboboxEmpty, ComboboxGroup, ComboboxItem, ComboboxItemIndicator, ComboboxList, ComboboxTrigger} from '@/components/ui/combobox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Settings2, ChevronsUpDown, Check, Globe } from 'lucide-vue-next'
import {getApiKey, getSelectedModel, getSelectedProvider, saveApiKey, saveSelectedModel, saveSelectedProvider, saveLocale, getLocale} from '@/data/chatDatabase.ts'
import type { Locale} from '@/data/chatDatabase.ts'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
type ProviderType = typeof providers[number]['value']
const selectedProvider = ref<typeof providers[number] | null>(null)
const selectedModel = ref<{ id: string, provider: string } | null>(null)
const open = defineModel<boolean>('open')
const errorMessage = ref<string | null>(null)
const isSaving = ref(false)

const providers = [
  { label: 'ChatGPT', value: 'gpt' },
  { label: 'DeepSeek', value: 'deepseek' }
] as const

const allModels = ref([
  { id: 'gpt-4.1-mini', provider: 'gpt' },
  { id: 'gpt-4.1-nano', provider: 'gpt' },
  { id: 'deepseek-chat', provider: 'deepseek' },
  { id: 'deepseek-reasoner', provider: 'deepseek' }
])

const isValid = computed(() => {
  const provider = selectedProvider.value?.value
  return !!(
      selectedProvider.value &&
      selectedModel.value &&
      provider &&
      apiKeys[provider]?.trim()
  )
})

const apiKeys = reactive<Record<ProviderType, string>>({
  gpt: '',
  deepseek: ''
})

const filteredModels = computed(() =>
    allModels.value.filter(m => m.provider === selectedProvider.value?.value)
)

async function saveSettings() {
  if (!isValid.value || !selectedProvider.value) return

  errorMessage.value = null
  isSaving.value = true

  const provider = selectedProvider.value.value
  const apiKey = apiKeys[provider]

  const isKeyValid = await validateApiKey(provider, apiKey)

  if (!isKeyValid) {
    errorMessage.value = t('settings.invalid_api_key') || 'API key is invalid'
    isSaving.value = false
    return
  }

  await saveApiKey(provider, apiKey)
  await saveSelectedModel(provider, selectedModel.value!.id)
  await saveSelectedProvider(provider)

  isSaving.value = false
  open.value = false
}

async function validateApiKey(provider: ProviderType, apiKey: string): Promise<boolean> {
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

  const savedProvider = await getSelectedProvider();
  console.log(savedProvider);
  if (savedProvider) {
    selectedProvider.value = providers.find(p => p.value === savedProvider) || null;

    if (savedProvider) {
      const savedApiKey = await getApiKey(savedProvider);
      if (savedApiKey) apiKeys[savedProvider] = savedApiKey;

      const savedModelId = await getSelectedModel(savedProvider);
      console.log(savedModelId);
      if (savedModelId) {
        const model = allModels.value.find(m => m.id === savedModelId && m.provider === savedProvider);
        if (model) selectedModel.value = model;
      }
    }
  }
});

async function toggleLocale() {
  locale.value = locale.value === 'en' ? 'ru' : 'en'
  await saveLocale(locale.value as Locale)
}

// saving settings
watch(() => selectedProvider.value, async (newProvider) => {
  if (newProvider) {
    const prov = newProvider.value
    apiKeys[prov] = await getApiKey(prov) || ''
    const modelId = await getSelectedModel(prov)
    if (modelId) {
      const model = allModels.value.find(m => m.id === modelId && m.provider === prov)
      selectedModel.value = model || null
    } else {
      selectedModel.value = null
    }
  } else {
    Object.keys(apiKeys).forEach(k => apiKeys[k as ProviderType] = '')
    selectedModel.value = null
  }
})

watch(() => selectedModel.value, () => {
  if (selectedProvider.value && selectedModel.value) {
    localStorage.setItem('selectedModel_' + selectedProvider.value.value, selectedModel.value.id) // <-- localStorage
  }
})
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
        <div v-if="selectedProvider" class="space-y-1">
          <label class="text-sm font-medium">
            {{ t('settings.api_key_label', { provider: selectedProvider.label }) }}
          </label>
          <Input
              v-model="apiKeys[selectedProvider.value]"
              :placeholder="t('settings.api_key_placeholder')"
              type="password"
          />
        </div>

        <!-- Provider selection -->
        <Combobox v-model="selectedProvider" by="value">
          <ComboboxAnchor as-child>
            <ComboboxTrigger as-child>
              <Button variant="outline" class="w-full justify-between">
                {{ selectedProvider?.label ?? t('settings.select_provider') }}
                <ChevronsUpDown class="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </ComboboxTrigger>
          </ComboboxAnchor>
          <ComboboxList>
            <ComboboxGroup>
              <ComboboxItem
                  v-for="provider in providers"
                  :key="provider.value"
                  :value="provider"
              >
                {{ provider.label }}
                <ComboboxItemIndicator>
                  <Check class="ml-auto h-4 w-4" />
                </ComboboxItemIndicator>
              </ComboboxItem>
            </ComboboxGroup>
          </ComboboxList>
        </Combobox>

        <!-- Model selection -->
        <Combobox v-if="selectedProvider" v-model="selectedModel" by="id">
          <ComboboxAnchor as-child>
            <ComboboxTrigger as-child>
              <Button variant="outline" class="w-full justify-between">
                {{ selectedModel?.id ?? t('settings.select_model') }}
                <ChevronsUpDown class="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </ComboboxTrigger>
          </ComboboxAnchor>
          <ComboboxList>
            <ComboboxEmpty>{{ t('settings.no_models') }}</ComboboxEmpty>
            <ComboboxGroup>
              <ComboboxItem
                  v-for="model in filteredModels"
                  :key="model.id"
                  :value="model"
              >
                {{ model.id }}
                <ComboboxItemIndicator>
                  <Check class="ml-auto h-4 w-4" />
                </ComboboxItemIndicator>
              </ComboboxItem>
            </ComboboxGroup>
          </ComboboxList>
        </Combobox>

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