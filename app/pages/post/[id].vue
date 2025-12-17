<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const route = useRoute()
const postId = route.params.id
const { toast } = useToast()

const { data: post, error, refresh } = await useFetch(`/api/posts/${postId}`)
const { data: session } = await useFetch('/api/auth/me')
const { data: matches } = await useFetch('/api/ai/match', { query: { postId } })

const newComment = ref('')
const isSubmittingComment = ref(false)
const isSubmittingClaim = ref(false)
const claimMessage = ref('')
const showClaimDialog = ref(false)

const isAuthor = computed(() => session.value?.user?.id === post.value?.authorId)
const isLoggedIn = computed(() => !!session.value?.user)

async function submitComment() {
  if (!newComment.value.trim()) return
  if (!isLoggedIn.value) {
    navigateTo('/login')
    return
  }
  
  isSubmittingComment.value = true
  try {
    await $fetch('/api/comments', {
      method: 'POST',
      body: {
        postId: post.value?.id,
        content: newComment.value,
      },
    })
    
    newComment.value = ''
    refresh()
    toast({
      title: '评论发布成功',
      description: '您的评论已添加',
      toast: 'soft-success',
      leading: 'i-ph-check-circle-bold',
      showProgress: true,
      closable: true
    })
  } catch (e: any) {
    toast({
      title: '评论失败',
      description: e.data?.message || '未知错误',
      toast: 'soft-red',
      leading: 'i-ph-warning-circle-bold',
      showProgress: true,
      closable: true
    })
  } finally {
    isSubmittingComment.value = false
  }
}

async function submitClaim() {
  if (!isLoggedIn.value) {
    navigateTo('/login')
    return
  }
  
  if (!claimMessage.value.trim()) {
    toast({ 
      title: '请填写认领说明', 
      toast: 'soft-yellow',
      leading: 'i-ph-warning-bold',
      closable: true
    })
    return
  }
  
  isSubmittingClaim.value = true
  try {
    await $fetch('/api/claims', {
      method: 'POST',
      body: {
        postId: post.value?.id,
        message: claimMessage.value,
      },
    })
    showClaimDialog.value = false
    claimMessage.value = ''
    toast({
      title: '申请提交成功',
      description: '请等待发布者审核',
      toast: 'soft-success',
      leading: 'i-ph-check-circle-bold',
      showProgress: true,
      closable: true
    })
  } catch (e: any) {
    toast({
      title: '提交失败',
      description: e.data?.message || '未知错误',
      toast: 'soft-red',
      leading: 'i-ph-warning-circle-bold',
      showProgress: true,
      closable: true
    })
  } finally {
    isSubmittingClaim.value = false
  }
}

async function togglePostLike() {
  if (!isLoggedIn.value) {
    navigateTo('/login')
    return
  }
  
  try {
    await $fetch('/api/likes/post', {
      method: 'POST',
      body: { postId: post.value?.id },
    })
    refresh()
  } catch (e) {
    // Silent fail or toast
  }
}

async function toggleCommentLike(commentId: number) {
  if (!isLoggedIn.value) {
    navigateTo('/login')
    return
  }
  
  try {
    await $fetch('/api/likes/comment', {
      method: 'POST',
      body: { commentId },
    })
    refresh()
  } catch (e) {
    // Silent fail
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6 pb-12">
    <!-- Error State -->
    <div v-if="error" class="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
      <div class="i-ph-warning-circle text-6xl text-muted-foreground mx-auto mb-4" />
      <p class="text-lg font-medium text-foreground">{{ error.data?.message || '帖子不存在' }}</p>
      <UButton to="/" variant="outline" class="mt-4">返回首页</UButton>
    </div>

    <!-- Post Content -->
    <div v-else-if="post" class="space-y-6">
      
      <!-- Main Card -->
      <UCard 
        card="outline-gray"
        class="overflow-hidden border-border shadow-sm"
      >
        <!-- Header Info -->
        <template #header>
          <div class="flex flex-wrap items-center gap-3 mb-4">
             <UBadge 
               :color="post.itemType === 'lost' ? 'yellow' : 'green'" 
               variant="soft"
               size="lg"
               class="gap-1 font-bold"
             >
                <span :class="post.itemType === 'lost' ? 'i-ph-magnifying-glass-bold' : 'i-ph-hand-heart-bold'" />
                {{ post.itemType === 'lost' ? '寻物' : '招领' }}
             </UBadge>
             <UBadge 
               :color="post.status === 'resolved' ? 'green' : post.status === 'closed' ? 'red' : 'gray'"
               variant="outline"
             >
               {{ post.status === 'resolved' ? '已解决' : post.status === 'closed' ? '已关闭' : '进行中' }}
             </UBadge>
             <span class="text-xs text-muted-foreground ml-auto">
               ID: #{{ post.id }}
             </span>
          </div>
          
          <h1 class="text-3xl font-bold mb-4 leading-tight">{{ post.title }}</h1>
          
          <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <div class="flex items-center gap-2">
              <UAvatar :src="post.authorAvatar" :alt="post.authorName" size="xs" />
              <span class="font-medium text-foreground">{{ post.authorName }}</span>
              <span class="text-xs">(@{{ post.authorUsername }})</span>
            </div>
            
            <div class="flex items-center gap-1" title="信用分">
              <span class="i-ph-star-fill text-yellow-500" />
              <span>{{ post.authorCreditScore }}</span>
            </div>
            
            <div class="flex items-center gap-1">
              <span class="i-ph-calendar-blank" />
              <span>{{ new Date(post.createdAt).toLocaleString('zh-CN') }}</span>
            </div>
          </div>
        </template>

        <!-- content & images -->
        <template #content>
            <div class="space-y-6">
              <div v-if="post.images?.length" class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <img
                  v-for="(img, i) in post.images"
                  :key="i"
                  :src="img"
                  :alt="`图片 ${i + 1}`"
                  class="w-full aspect-square object-cover rounded-lg border border-border cursor-pointer hover:opacity-90 transition-opacity"
                />
              </div>

              <div class="prose dark:prose-invert max-w-none">
                <p class="whitespace-pre-wrap text-lg leading-relaxed">{{ post.content }}</p>
              </div>
              
              <div class="flex flex-wrap gap-4 pt-4">
                 <div v-if="post.location" class="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted text-sm font-medium">
                    <span class="i-ph-map-pin text-primary" />
                    {{ post.location }}
                 </div>
                 <div v-if="post.categoryName" class="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted text-sm font-medium">
                    <span class="i-ph-tag text-primary" />
                    {{ post.categoryName }}
                 </div>
                 <div v-if="post.contactInfo" class="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted text-sm font-medium">
                    <span class="i-ph-phone text-primary" />
                    {{ post.contactInfo }}
                 </div>
              </div>
            </div>
        </template>

        <!-- Footer Actions -->
        <template #footer>
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-4">
               <button 
                 class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:bg-muted"
                 :class="post.userLiked ? 'text-red-500 font-medium' : 'text-muted-foreground'"
                 @click="togglePostLike"
               >
                  <span :class="post.userLiked ? 'i-ph-heart-fill text-xl' : 'i-ph-heart text-xl'" />
                  {{ post.likeCount || 0 }} 赞
               </button>
               <div class="flex items-center gap-2 text-muted-foreground px-4 py-2">
                  <span class="i-ph-chat-circle text-xl" />
                  {{ post.comments?.length || 0 }} 评论
               </div>
            </div>
            
            <UButton
              v-if="!isAuthor && post.status === 'pending'"
              size="lg"
              color="primary"
              class="shadow-sm"
              @click="isLoggedIn ? showClaimDialog = true : navigateTo('/login')"
            >
              <span class="i-ph-hand-pointing mr-2" />
              认领物品
            </UButton>
          </div>
        </template>
      </UCard>

      <!-- AI Matches -->
      <div v-if="matches?.matches?.length" class="rounded-xl border border-purple-500/20 bg-purple-500/5 overflow-hidden">
        <div class="px-6 py-4 border-b border-purple-500/10 flex items-center gap-2">
          <span class="i-ph-sparkle-fill text-purple-500 text-xl" />
          <h3 class="font-bold text-lg">AI 智能匹配</h3>
          <span class="text-xs text-muted-foreground ml-auto">可能相关的其他信息</span>
        </div>
        
        <div class="p-4 space-y-3">
          <NuxtLink
            v-for="match in matches.matches"
            :key="match.id"
            :to="`/post/${match.id}`"
            class="block p-4 rounded-lg border border-border bg-card hover:border-purple-500/50 hover:shadow-md transition-all group"
          >
            <div class="flex items-center justify-between gap-4">
              <div class="min-w-0">
                <div class="font-medium truncate group-hover:text-purple-600 transition-colors">{{ match.title }}</div>
                <div class="text-sm text-muted-foreground line-clamp-1">{{ match.content }}</div>
              </div>
              <UBadge color="purple" variant="soft">{{ match.matchScore }}% 相似</UBadge>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Comments Section -->
      <UCard title="评论" card="outline-gray">
        <template #header>
          <h2 class="font-bold text-lg flex items-center gap-2">
            <span class="i-ph-chats-circle" />
            评论 ({{ post.comments?.length || 0 }})
          </h2>
        </template>
        
        <template #content>
            <div class="space-y-6">
               <!-- Comment Form -->
              <div v-if="isLoggedIn" class="flex gap-4 mb-8">
                <UAvatar :src="session.user.avatar" :alt="session.user.name" />
                <div class="flex-1 space-y-3">
                  <UInput
                    v-model="newComment"
                    type="textarea"
                    :rows="3"
                    autoresize
                    placeholder="写下你的评论..."
                    class="w-full"
                  />
                  <div class="flex justify-end">
                    <UButton
                      :loading="isSubmittingComment"
                      :disabled="!newComment.trim()"
                      @click="submitComment"
                    >
                      发表评论
                    </UButton>
                  </div>
                </div>
              </div>
              
              <UAlert 
                v-else 
                icon="i-ph-info"
                title="请先登录" 
                description="登录后即可参与评论讨论" 
              >
                 <template #action>
                   <UButton to="/login" variant="outline" size="xs">去登录</UButton>
                 </template>
              </UAlert>

              <!-- Comments List -->
              <div class="space-y-6">
                <div
                  v-for="comment in post.comments"
                  :key="comment.id"
                  class="group flex gap-4"
                >
                  <UAvatar :src="comment.authorAvatar" :alt="comment.authorName" size="sm" class="mt-1" />
                  <div class="flex-1">
                    <div class="flex items-center justify-between mb-1">
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-sm">{{ comment.authorName }}</span>
                        <span class="text-xs text-muted-foreground">{{ new Date(comment.createdAt).toLocaleDateString('zh-CN') }}</span>
                      </div>
                    </div>
                    
                    <p class="text-foreground leading-relaxed">{{ comment.content }}</p>
                    
                    <div class="flex items-center gap-4 mt-2">
                      <button
                        class="flex items-center gap-1 text-xs transition-colors hover:text-red-500"
                         :class="comment.userLiked ? 'text-red-500' : 'text-muted-foreground'"
                        @click="toggleCommentLike(comment.id)"
                      >
                        <span :class="comment.userLiked ? 'i-ph-heart-fill' : 'i-ph-heart'" />
                        {{ comment.likeCount || 0 }} 赞
                      </button>
                      <button class="text-xs text-muted-foreground hover:text-foreground">回复</button>
                    </div>
                  </div>
                </div>
                
                <div v-if="!post.comments?.length" class="text-center py-12">
                  <div class="i-ph-chat-teardrop-dots text-4xl text-muted-foreground mx-auto mb-3" />
                  <p class="text-muted-foreground">暂无评论，快来抢沙发吧！</p>
                </div>
              </div>
            </div>
        </template>
      </UCard>
    </div>

    <!-- Claim Dialog with UDialog -->
    <UDialog 
      v-model:open="showClaimDialog"
      title="提交认领申请"
      description="请详细描述物品特征、丢失时间地点等细节，以证明物品所有权。"
    >
      <template #trigger>
        <span class="hidden" />
      </template>

      <template #body>
         <div class="py-4">
             <UInput
              v-model="claimMessage"
              type="textarea"
              :rows="5"
              autoresize
              placeholder="例如：手机壳背面有个皮卡丘贴纸，锁屏是..."
              class="w-full"
            />
         </div>
      </template>

      <template #footer>
        <UButton variant="ghost" @click="showClaimDialog = false">取消</UButton>
        <UButton :loading="isSubmittingClaim" @click="submitClaim">提交申请</UButton>
      </template>
    </UDialog>
  </div>
</template>
