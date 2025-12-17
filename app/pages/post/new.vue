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
  categoryId: undefined as string | undefined,
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
const imageEmbedding = ref<number[] | null>(null)
const imageTags = ref<string[]>([])
const isAnalyzing = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// Handle file selection
async function handleFileSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  // 1. Preview immediately
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)

  // 2. Try AI analysis in background (don't block the user)
  isAnalyzing.value = true
  imageEmbedding.value = null
  imageTags.value = []

  try {
    const formData = new FormData()
    formData.append('image', file)
    
    toast({
       title: '正在进行AI视觉分析...',
       description: file.size > 500000 ? '压缩中...' : '提取图片特征中',
       toast: 'soft-info',
    })

    const result = await $fetch<{ success: boolean; embedding?: number[]; tags?: string[]; warning?: string }>('/api/upload/analyze', {
      method: 'POST',
      body: formData
    })

    if (result.success) {
        if (result.embedding && result.embedding.length > 0) {
            imageEmbedding.value = result.embedding
        }
        if (result.tags && result.tags.length > 0) {
            imageTags.value = result.tags
            toast({
                title: 'AI分析完成',
                description: `识别到: ${imageTags.value.join(', ')}`,
                toast: 'soft-success',
                leading: 'i-ph-sparkle-fill'
            })
        } else if (result.warning) {
            toast({
                title: '分析跳过', 
                description: result.warning, 
                toast: 'soft-warning'
            })
        }
    }
  } catch (e) {
    console.error('AI Analysis failed:', e)
    // Silent fail - AI is optional
  } finally {
    isAnalyzing.value = false
  }
}

function removeImage() {
  imagePreview.value = null
  imageEmbedding.value = null
  if (fileInput.value) fileInput.value.value = ''
}

async function handleSubmit() {
  if (!session.value?.user) {
    toast({
      title: '请先登录',
      toast: 'soft-warning',
      leading: 'i-ph-warning-bold',
      closable: true
    })
    navigateTo('/login')
    return
  }

  if (!form.value.title || !form.value.content) {
    toast({
      title: '请填写标题和描述',
      toast: 'soft-warning',
      leading: 'i-ph-warning-bold',
      closable: true
    })
    return
  }

  isSubmitting.value = true

  try {
    const result = await $fetch<{ success: boolean; post: { id: number } }>('/api/posts', {
      method: 'POST',
      body: {
        title: form.value.title,
        content: form.value.content,
        itemType: form.value.type,
        location: form.value.location || null,
        contactInfo: form.value.contactInfo || null,
        categoryId: form.value.categoryId ? Number(form.value.categoryId) : null,
        images: imagePreview.value ? [imagePreview.value] : [],
        imageEmbedding: imageEmbedding.value,
        imageTags: imageTags.value.length > 0 ? imageTags.value.join(',') : null,
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
    } else {
        throw new Error('Server returned unsuccessful status')
    }
  } catch (e: any) {
    console.error('Submit failed:', e)
    toast({
      title: '发布失败',
      description: e.data?.message || e.message || '未知错误',
      toast: 'soft-error',
      leading: 'i-ph-warning-circle-bold',
      closable: true
    })
    isSubmitting.value = false
  }
}

// Category items for select
const categoryItems = computed(() => 
  (categories.value as any[] || []).map(cat => ({
    label: cat.name,
    value: String(cat.id)
  }))
)
</script>

<template>
  <div class="max-w-2xl mx-auto py-8 px-4 sm:px-0">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">发布信息</h1>
      <p class="opacity-70">填写物品详情，帮助快速找回或归还</p>
    </div>

    <!-- Login prompt -->
    <NAlert 
      v-if="!session?.user" 
      alert="soft-warning"
      title="请先登录"
      description="您需要登录后才能发布信息"
      icon="i-ph-info"
      class="mb-6"
    >
      <template #default>
        <NButton to="/login" size="sm" btn="solid-warning" class="mt-2">去登录</NButton>
      </template>
    </NAlert>

    <!-- Type Selector -->
    <div class="grid grid-cols-2 gap-4 mb-8">
      <div
        class="cursor-pointer rounded-xl border-2 p-6 text-center transition-all hover:scale-[1.02]"
        :class="form.type === 'lost' 
          ? 'border-yellow-500 bg-yellow-500 text-white shadow-lg scale-[1.02]' 
          : 'border-$c-divider hover:border-yellow-500/50 hover:bg-yellow-500/5'"
        @click="form.type = 'lost'"
      >
        <div class="i-ph-magnifying-glass-bold text-4xl mx-auto mb-3" />
        <div class="font-bold text-lg">我丢失了东西</div>
        <div v-if="form.type === 'lost'" class="text-xs mt-2 opacity-80">✓ 已选择</div>
      </div>
      <div
        class="cursor-pointer rounded-xl border-2 p-6 text-center transition-all hover:scale-[1.02]"
        :class="form.type === 'found' 
          ? 'border-green-500 bg-green-500 text-white shadow-lg scale-[1.02]' 
          : 'border-$c-divider hover:border-green-500/50 hover:bg-green-500/5'"
        @click="form.type = 'found'"
      >
        <div class="i-ph-hand-heart-bold text-4xl mx-auto mb-3" />
        <div class="font-bold text-lg">我捡到了东西</div>
        <div v-if="form.type === 'found'" class="text-xs mt-2 opacity-80">✓ 已选择</div>
      </div>
    </div>

    <!-- Form in Card -->
    <NCard card="outline" class="shadow-xl">
      <form @submit.prevent="handleSubmit" class="space-y-6">

        <!-- Image Upload -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <NLabel>物品图片</NLabel>
            <span class="text-xs opacity-70">支持上传一张图片，帮助辨认</span>
          </div>
          <div class="space-y-3">
            <input 
              ref="fileInput"
              type="file" 
              accept="image/*"
              class="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-$c-primary file:text-white file:cursor-pointer hover:file:bg-$c-primary/80 border border-$c-divider rounded-lg p-2" 
              @change="handleFileSelect"
            />

            <div v-if="imagePreview" class="relative w-full h-48 rounded-lg overflow-hidden border border-$c-divider group">
              <img :src="imagePreview" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <NButton type="button" btn="solid-error" size="sm" leading="i-ph-trash" @click="removeImage">
                  移除图片
                </NButton>
              </div>
              <div v-if="isAnalyzing" class="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span class="i-ph-spinner-gap text-3xl text-white animate-spin" />
              </div>
            </div>
            
            <!-- AI Tags Display -->
            <div v-if="imageTags.length > 0" class="flex flex-wrap gap-2">
              <NBadge v-for="tag in imageTags" :key="tag" badge="soft-primary" leading="i-ph-tag-simple">
                {{ tag }}
              </NBadge>
            </div>
          </div>
        </div>


        <!-- Title -->
        <div class="space-y-2">
          <NLabel for="title">标题 <span class="text-red-500">*</span></NLabel>
          <NInput 
            id="title"
            v-model="form.title" 
            type="text" 
            :placeholder="titlePlaceholder" 
            size="lg"
          />
        </div>

        <!-- Category -->
        <div class="space-y-2">
          <NLabel for="category">分类</NLabel>
          <NSelect 
            id="category"
            v-model="form.categoryId"
            :items="categoryItems"
            placeholder="选择物品分类"
          />
        </div>

        <!-- Content -->
        <div class="space-y-2">
          <NLabel for="content">详细描述 <span class="text-red-500">*</span></NLabel>
          <NInput 
            id="content"
            v-model="form.content"
            type="textarea"
            :placeholder="contentPlaceholder"
            :rows="4"
          />
        </div>

        <!-- Location -->
        <div class="space-y-2">
          <NLabel for="location">地点</NLabel>
          <NInput 
            id="location"
            v-model="form.location"
            type="text"
            placeholder="例如：图书馆三楼"
            leading="i-ph-map-pin"
          />
        </div>

        <!-- Contact -->
        <div class="space-y-2">
          <NLabel for="contact">联系方式</NLabel>
          <NInput 
            id="contact"
            v-model="form.contactInfo"
            type="text"
            placeholder="手机号或微信"
            leading="i-ph-phone"
          />
        </div>

        <!-- Submit -->
        <div class="pt-4">
          <NButton 
            type="submit" 
            btn="solid-primary"
            block
            size="lg"
            :loading="isSubmitting"
            :disabled="isSubmitting || !session?.user"
          >
            {{ isSubmitting ? '发布中...' : '立即发布' }}
          </NButton>
        </div>
      </form>
    </NCard>
  </div>
</template>
