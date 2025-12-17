<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const route = useRoute()
const { data: session } = await useFetch('/api/auth/me')
const { toast } = useToast()

// Initialize type from query param
const initialType = route.query.type === 'found' ? 'found' : 'lost'

const form = ref({
  type: initialType as 'lost' | 'found',
  title: '',
  content: '',
  location: '',
  contactInfo: session.value?.user?.email || '',
  categoryId: undefined,
})

const { data: categories } = await useFetch('/api/categories-simple')
const isSubmitting = ref(false)

// Dynamic placeholders
const titlePlaceholder = computed(() =>
  form.value.type === 'lost' ? '例如：丢失黑色钱包' : '例如：捡到一把钥匙'
)
const contentPlaceholder = computed(() =>
  form.value.type === 'lost'
    ? '请详细描述物品特征、丢失的时间和地点等信息...'
    : '请详细描述物品特征、捡到的时间和地点等信息...'
)

// Watch session to update contact info
watch(() => session.value?.user?.email, (email) => {
  if (email && !form.value.contactInfo) {
    form.value.contactInfo = email
  }
})

const imagePreview = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

// Handle file selection
function handleFileSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  // Convert to base64 for MVP simplicity
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

function removeImage() {
  imagePreview.value = null
  // Reset input value if possible, or just ignore since we use preview for submission
}

async function handleSubmit() {
  if (!session.value?.user) {
    toast({
      title: '请先登录',
      toast: 'soft-yellow',
      leading: 'i-ph-warning-bold',
      closable: true
    })
    navigateTo('/login')
    return
  }

  if (!form.value.title || !form.value.content) {
    toast({
      title: '请填写标题和描述',
      toast: 'soft-yellow',
      leading: 'i-ph-warning-bold',
      closable: true
    })
    return
  }

  isSubmitting.value = true

  try {
    const result = await $fetch('/api/posts', {
      method: 'POST',
      body: {
        title: form.value.title,
        content: form.value.content,
        itemType: form.value.type,
        location: form.value.location || null,
        contactInfo: form.value.contactInfo || null,
        categoryId: form.value.categoryId ? Number(form.value.categoryId) : null,
        images: imagePreview.value ? [imagePreview.value] : [],
      },
    })

    if (result.success) {
      toast({
        title: '发布成功',
        toast: 'soft-success',
        leading: 'i-ph-check-circle-bold',
        closable: true
      })
      navigateTo(`/post/${result.post.id}`)
    }
  } catch (e: any) {
    toast({
      title: '发布失败',
      description: e.data?.message || '未知错误',
      toast: 'soft-red',
      leading: 'i-ph-warning-circle-bold',
      closable: true
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto py-8 px-4 sm:px-0">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">发布信息</h1>
      <p class="text-muted-foreground">填写物品详情，帮助快速找回或归还</p>
    </div>

    <!-- Login prompt -->
    <UAlert
      v-if="!session?.user"
      icon="i-ph-info"
      title="请先登录"
      description="您需要登录后才能发布信息"
      color="warning"
      variant="soft"
      class="mb-6"
    >
      <template #action>
        <UButton to="/login" size="xs" variant="solid" color="warning">去登录</UButton>
      </template>
    </UAlert>

    <!-- Type Selector -->
    <div class="grid grid-cols-2 gap-4 mb-8">
      <div
        class="cursor-pointer rounded-xl border-2 p-4 text-center transition-all hover:bg-muted/50"
        :class="form.type === 'lost' ? 'border-yellow-500 bg-yellow-500/5 text-yellow-600' : 'border-input'"
        @click="form.type = 'lost'"
      >
        <div class="i-ph-magnifying-glass-bold text-3xl mx-auto mb-2" />
        <div class="font-bold">我丢失了东西</div>
      </div>
      <div
        class="cursor-pointer rounded-xl border-2 p-4 text-center transition-all hover:bg-muted/50"
        :class="form.type === 'found' ? 'border-green-500 bg-green-500/5 text-green-600' : 'border-input'"
        @click="form.type = 'found'"
      >
        <div class="i-ph-hand-heart-bold text-3xl mx-auto mb-2" />
        <div class="font-bold">我捡到了东西</div>
      </div>
    </div>

    <!-- Form in Card -->
    <UCard>
      <template #content>
        <form @submit.prevent="handleSubmit" class="space-y-6">

          <!-- Image Upload with Standard Components -->
          <UFormGroup label="物品图片" description="支持上传一张图片，帮助辨认">
            <div class="space-y-3">
              <UInput
                type="file"
                accept="image/*"
                leading="i-ph-image"
                @change="handleFileSelect"
                class="cursor-pointer"
              />

              <div v-if="imagePreview" class="relative w-full h-48 rounded-lg overflow-hidden border border-border group">
                <img :src="imagePreview" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <UButton color="red" size="sm" icon="i-ph-trash" variant="solid" @click="removeImage">移除图片</UButton>
                </div>
              </div>
            </div>
          </UFormGroup>

          <!-- Title -->
          <UFormGroup label="标题" required>
            <UInput
              v-model="form.title"
              :placeholder="titlePlaceholder"
              size="lg"
            />
          </UFormGroup>

          <!-- Category -->
          <UFormGroup label="分类">
            <USelect v-model="form.categoryId">
              <USelectTrigger>
                <USelectValue placeholder="选择物品分类" />
              </USelectTrigger>
              <USelectContent>
                <USelectGroup>
                  <USelectLabel>分类</USelectLabel>
                  <USelectItem 
                    v-for="cat in (categories as any[])" 
                    :key="cat.id" 
                    :value="String(cat.id)"
                  >
                    <div class="flex items-center gap-2">
                      <span>{{ cat.icon }}</span>
                      <span>{{ cat.name }}</span>
                    </div>
                  </USelectItem>
                </USelectGroup>
              </USelectContent>
            </USelect>
          </UFormGroup>

          <!-- Content -->
          <UFormGroup label="详细描述" required>
            <UInput
              v-model="form.content"
              type="textarea"
              :rows="5"
              autoresize
              :placeholder="contentPlaceholder"
              class="w-full"
            />
          </UFormGroup>

          <!-- Location -->
          <UFormGroup label="地点">
             <UInput
              v-model="form.location"
              placeholder="例如：图书馆三楼"
              leading="i-ph-map-pin"
            />
          </UFormGroup>

          <!-- Contact -->
          <UFormGroup label="联系方式">
            <UInput
              v-model="form.contactInfo"
              placeholder="手机号或微信"
              leading="i-ph-phone"
            />
          </UFormGroup>

          <!-- Submit -->
          <div class="pt-4">
            <UButton
              type="submit"
              :loading="isSubmitting"
              :disabled="!session?.user"
              size="lg"
              class="w-full"
            >
              {{ isSubmitting ? '发布中...' : '立即发布' }}
            </UButton>
          </div>
        </form>
      </template>
    </UCard>
  </div>
</template>
