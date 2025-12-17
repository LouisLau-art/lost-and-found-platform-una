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

// Check if current user has already claimed this post
const { data: userClaims } = await useFetch('/api/claims/my')
const hasUserClaimed = computed(() => {
  if (!session.value?.user || !userClaims.value?.data) return false
  return userClaims.value.data.some((claim: any) => claim.postId === Number(postId))
})

// Fetch claims for this post (if current user is the author)
const { data: postClaimsData, refresh: refreshClaims } = await useFetch(`/api/posts/${postId}/claims`)
const postClaims = computed(() => postClaimsData.value?.data || [])
const pendingClaims = computed(() => postClaims.value.filter((c: any) => c.status === 'pending'))

const newComment = ref('')
const isSubmittingComment = ref(false)
const isSubmittingClaim = ref(false)
const claimMessage = ref('')
const showClaimDialog = ref(false)
const processingClaimId = ref<number | null>(null)
const showReviewModal = ref(false)

const isAuthor = computed(() => session.value?.user?.id === post.value?.authorId)
const isLoggedIn = computed(() => !!session.value?.user)

// Determine if there is an approved claim relevant to the current user
const approvedClaimId = computed(() => {
  if (isAuthor.value) {
     const claim = postClaimsData.value?.data?.find((c: any) => c.status === 'approved')
     return claim?.id
  }
  // Check user claims
  const claim = userClaims.value?.data?.find((c: any) => c.postId === Number(postId) && c.status === 'approved')
  return claim?.id
})

// Check if already reviewed
const { data: reviewCheck, refresh: refreshReviewCheck } = await useFetch('/api/reviews/check', {
  query: { claimId: approvedClaimId },
  immediate: !!approvedClaimId.value,
  watch: [approvedClaimId]
})

function handleReviewSuccess() {
  refreshReviewCheck()
  refresh() 
}

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
      toast: 'soft-error',
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
    
    window.location.reload()
    
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
      toast: 'soft-error',
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

async function processClaim(claimId: number, action: 'approve' | 'reject') {
  processingClaimId.value = claimId
  
  try {
    await $fetch(`/api/claims/${claimId}/process`, {
      method: 'POST',
      body: { action },
    })
    
    toast({
      title: action === 'approve' ? '已通过认领申请' : '已拒绝认领申请',
      description: action === 'approve' ? '帖子已标记为已解决' : '申请人已收到通知',
      toast: 'soft-success',
      leading: 'i-ph-check-circle-bold',
     closable: true
    })
    
    await refreshClaims()
    await refresh()
  } catch (e: any) {
    toast({
      title: '操作失败',
      description: e.data?.message || '未知错误',
      toast: 'soft-error',
      leading: 'i-ph-warning-circle-bold',
      closable: true
    })
  } finally {
    processingClaimId.value = null
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6 pb-12">
    <!-- Error State -->
    <div v-if="error" class="text-center py-20 bg-$c-muted/50 rounded-xl border border-dashed border-$c-divider">
      <div class="i-ph-warning-circle text-6xl opacity-50 mx-auto mb-4" />
      <p class="text-lg font-medium">{{ error.data?.message || '帖子不存在' }}</p>
      <NButton to="/" btn="outline" class="mt-4">返回首页</NButton>
    </div>

    <!-- Post Content -->
    <div v-else-if="post" class="space-y-6">
      
      <!-- Main Card -->
      <NCard card="outline" class="shadow-sm">
        <!-- Header Info -->
        <div class="flex flex-wrap items-center gap-3 mb-2">
          <NBadge 
            :badge="post.itemType === 'lost' ? 'solid-warning' : 'solid-success'"
            :leading="post.itemType === 'lost' ? 'i-ph-magnifying-glass-bold' : 'i-ph-hand-heart-bold'"
            size="md"
          >
            {{ post.itemType === 'lost' ? '寻物' : '招领' }}
          </NBadge>
          <NBadge 
            :badge="post.status === 'resolved' ? 'outline-success' : post.status === 'closed' ? 'outline-error' : 'outline'"
          >
            {{ post.status === 'resolved' ? '已解决' : post.status === 'closed' ? '已关闭' : '进行中' }}
          </NBadge>
          <span class="text-xs opacity-50 ml-auto">
            ID: #{{ post.id }}
          </span>
        </div>
        
        <h1 class="text-3xl font-bold mb-4 leading-tight">{{ post.title }}</h1>
        
        <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm opacity-70">
          <NuxtLink :to="`/user/${post.authorId}`" class="flex items-center gap-2 hover:opacity-100 transition-opacity">
            <NAvatar 
              :src="post.authorAvatar" 
              :alt="post.authorName"
              :label="post.authorName?.[0]"
              size="xs"
            />
            <span class="font-medium">{{ post.authorName }}</span>
            <span class="text-xs">(@{{ post.authorUsername }})</span>
          </NuxtLink>
          
          <div class="flex items-center gap-1" title="信用分">
            <span class="i-ph-star-fill text-yellow-500" />
            <span>{{ post.authorCreditScore }}</span>
          </div>
          
          <div class="flex items-center gap-1">
            <span class="i-ph-calendar-blank" />
            <span>{{ new Date(post.createdAt).toLocaleString('zh-CN') }}</span>
          </div>
        </div>

        <NSeparator class="my-4" />

        <!-- Review Alert -->
        <NAlert 
          v-if="approvedClaimId && reviewCheck && !reviewCheck.hasReviewed" 
          alert="soft-success"
          icon="i-ph-star-fill"
          class="mb-6"
        >
          <template #title>交易已完成</template>
          <template #description>请评价对方，帮助社区建立信任！</template>
          <NButton size="sm" btn="outline" @click="showReviewModal = true">去评价</NButton>
        </NAlert>

        <!-- content & images -->
        <div class="space-y-6">
          <div v-if="post.images?.length" class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <img
              v-for="(img, i) in post.images"
              :key="i"
              :src="img"
              :alt="`图片 ${i + 1}`"
              class="w-full aspect-square object-cover rounded-lg border border-$c-divider cursor-pointer hover:opacity-90 transition-opacity"
            />
          </div>

          <div class="prose dark:prose-invert max-w-none">
            <p class="whitespace-pre-wrap text-lg leading-relaxed">{{ post.content }}</p>
          </div>
          
          <div class="flex flex-wrap gap-4 pt-4">
            <div v-if="post.location" class="flex items-center gap-2 px-3 py-1.5 rounded-md bg-$c-muted text-sm font-medium">
              <span class="i-ph-map-pin text-$c-primary" />
              {{ post.location }}
            </div>
            <div v-if="post.categoryName" class="flex items-center gap-2 px-3 py-1.5 rounded-md bg-$c-muted text-sm font-medium">
              <span class="i-ph-tag text-$c-primary" />
              {{ post.categoryName }}
            </div>
            <div v-if="post.contactInfo" class="flex items-center gap-2 px-3 py-1.5 rounded-md bg-$c-muted text-sm font-medium">
              <span class="i-ph-phone text-$c-primary" />
              {{ post.contactInfo }}
            </div>
            <!-- AI Image Tags Display -->
            <div v-if="post.imageTags" class="w-full mt-2 pt-2 border-t border-$c-divider">
              <div class="flex flex-wrap gap-2 text-xs">
                <span class="opacity-70 flex items-center gap-1">
                  <span class="i-ph-robot text-$c-primary" /> AI Tagging:
                </span>
                <NBadge 
                  v-for="tag in post.imageTags.split(',')" 
                  :key="tag" 
                  badge="soft"
                  size="xs"
                >
                  {{ tag }}
                </NBadge>
              </div>
            </div>
          </div>
        </div>

        <NSeparator class="my-4" />

        <!-- Footer Actions -->
        <template #footer>
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-4">
              <NButton 
                btn="ghost"
                :class="post.userLiked ? 'text-red-500' : ''"
                @click="togglePostLike"
              >
                <span :class="post.userLiked ? 'i-ph-heart-fill' : 'i-ph-heart'" class="mr-2" />
                {{ post.likeCount || 0 }} 赞
              </NButton>
              <div class="flex items-center gap-2 opacity-70 px-4 py-2">
                <span class="i-ph-chat-circle" />
                {{ post.comments?.length || 0 }} 评论
              </div>
            </div>
            
            <NButton
              v-if="!isAuthor && post.status === 'pending'"
              :btn="hasUserClaimed ? 'outline' : 'solid-primary'"
              :disabled="hasUserClaimed"
              :leading="hasUserClaimed ? 'i-ph-check-circle' : 'i-ph-hand-pointing'"
              @click="isLoggedIn ? (hasUserClaimed ? null : showClaimDialog = true) : navigateTo('/login')"
            >
              {{ hasUserClaimed ? '已提交申请' : '认领物品' }}
            </NButton>
          </div>
        </template>
      </NCard>

      <!-- Claim Requests (Author Only) -->
      <NCard v-if="isAuthor && pendingClaims.length > 0" card="outline-warning" class="overflow-hidden">
        <template #header>
          <div class="flex items-center gap-2">
            <span class="i-ph-hand-stop-fill text-orange-500 text-xl" />
            <h3 class="font-bold text-lg">待审核的认领申请</h3>
            <NBadge badge="solid-warning" class="ml-auto">{{ pendingClaims.length }}</NBadge>
          </div>
        </template>
        
        <div class="space-y-4">
          <NCard
            v-for="claim in pendingClaims"
            :key="claim.id"
            card="outline"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-start gap-3 flex-1">
                <!-- Avatar -->
                <NAvatar 
                  :src="claim.claimerAvatar"
                  :alt="claim.claimerName"
                  :label="claim.claimerName?.[0]"
                  size="md"
                  class="ring-2 ring-$c-primary ring-offset-2"
                />
                
                <!-- Claim Info -->
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <NuxtLink :to="`/user/${claim.claimerId}`" class="font-bold hover:text-$c-primary">
                      {{ claim.claimerName }}
                    </NuxtLink>
                    <span class="text-xs opacity-50">@{{ claim.claimerUsername }}</span>
                    <div class="flex items-center gap-1 text-xs">
                      <span class="i-ph-star-fill text-yellow-500" />
                      <span>{{ claim.claimerCreditScore }}</span>
                    </div>
                  </div>
                  
                  <div v-if="claim.message" class="bg-$c-muted p-3 rounded-lg mb-2">
                    <p class="text-sm opacity-90">"{{ claim.message }}"</p>
                  </div>
                  <div v-else class="text-xs opacity-50 mb-2">
                    未填写留言
                  </div>
                  
                  <div class="text-xs opacity-50">
                    申请时间：{{ new Date(claim.createdAt).toLocaleString('zh-CN') }}
                  </div>
                </div>
              </div>
              
              <!-- Actions -->
              <div class="flex flex-col gap-2 flex-shrink-0">
                <NButton
                  btn="solid-success"
                  size="sm"
                  leading="i-ph-check-bold"
                  :loading="processingClaimId === claim.id"
                  :disabled="processingClaimId !== null"
                  @click="processClaim(claim.id, 'approve')"
                >
                  通过
                </NButton>
                <NButton
                  btn="solid-error"
                  size="sm"
                  leading="i-ph-x-bold"
                  :loading="processingClaimId === claim.id"
                  :disabled="processingClaimId !== null"
                  @click="processClaim(claim.id, 'reject')"
                >
                  拒绝
                </NButton>
              </div>
            </div>
          </NCard>
        </div>
      </NCard>

      <!-- AI Matches -->
      <NCard v-if="matches?.matches?.length" card="outline" class="border-purple-500/20 bg-purple-500/5">
        <template #header>
          <div class="flex items-center gap-2">
            <span class="i-ph-sparkle-fill text-purple-500 text-xl" />
            <h3 class="font-bold text-lg">AI 智能匹配</h3>
            <span class="text-xs opacity-50 ml-auto">可能相关的其他信息</span>
          </div>
        </template>
        
        <div class="space-y-3">
          <NuxtLink
            v-for="match in matches.matches"
            :key="match.id"
            :to="`/post/${match.id}`"
            class="block p-4 rounded-lg border border-$c-divider bg-$c-bg hover:border-purple-500/50 hover:shadow-md transition-all group"
          >
            <div class="flex items-center justify-between gap-4">
              <div class="min-w-0">
                <div class="font-medium truncate group-hover:text-purple-600 transition-colors">{{ match.title }}</div>
                <div class="text-sm opacity-70 line-clamp-1">{{ match.content }}</div>
              </div>
              <NBadge badge="soft-purple">{{ match.matchScore }}% 相似</NBadge>
            </div>
          </NuxtLink>
        </div>
      </NCard>

      <!-- Comments Section -->
      <NCard card="outline" class="shadow-sm">
        <template #header>
          <h2 class="text-lg font-bold flex items-center gap-2">
            <span class="i-ph-chats-circle" />
            评论 ({{ post.comments?.length || 0 }})
          </h2>
        </template>
      
        <div class="space-y-6">
          <!-- Comment Form -->
          <div v-if="isLoggedIn" class="flex gap-4">
            <NAvatar 
              :src="session?.user?.avatar"
              :alt="session?.user?.name"
              :label="session?.user?.name?.[0]"
              size="sm"
            />
            <div class="flex-1 space-y-3">
              <NInput
                v-model="newComment"
                type="textarea"
                placeholder="写下你的评论..."
                :rows="3"
              />
              <div class="flex justify-end">
                <NButton
                  btn="solid-primary"
                  :loading="isSubmittingComment"
                  :disabled="!newComment.trim() || isSubmittingComment"
                  @click="submitComment"
                >
                  发表评论
                </NButton>
              </div>
            </div>
          </div>
          
          <NAlert v-else alert="soft-info" icon="i-ph-info">
            <template #title>请先登录</template>
            <template #description>登录后即可参与评论讨论</template>
            <NButton to="/login" size="sm" btn="outline">去登录</NButton>
          </NAlert>

          <!-- Comments List -->
          <div class="space-y-6">
            <div
              v-for="comment in post.comments"
              :key="comment.id"
              class="group flex gap-4"
            >
              <NAvatar 
                :src="comment.authorAvatar"
                :alt="comment.authorName"
                :label="comment.authorName?.[0]"
                size="xs"
                class="mt-1"
              />
              <div class="flex-1">
                <div class="flex items-center justify-between mb-1">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-sm">{{ comment.authorName }}</span>
                    <span class="text-xs opacity-50">{{ new Date(comment.createdAt).toLocaleDateString('zh-CN') }}</span>
                  </div>
                </div>
                
                <p class="opacity-90 leading-relaxed">{{ comment.content }}</p>
                
                <div class="flex items-center gap-4 mt-2">
                  <button
                    class="flex items-center gap-1 text-xs transition-colors hover:text-red-500"
                    :class="comment.userLiked ? 'text-red-500' : 'opacity-70'"
                    @click="toggleCommentLike(comment.id)"
                  >
                    <span :class="comment.userLiked ? 'i-ph-heart-fill' : 'i-ph-heart'" />
                    {{ comment.likeCount || 0 }} 赞
                  </button>
                  <button class="text-xs opacity-70 hover:opacity-100">回复</button>
                </div>
              </div>
            </div>
            
            <div v-if="!post.comments?.length" class="text-center py-12">
              <div class="i-ph-chat-teardrop-dots text-4xl opacity-30 mx-auto mb-3" />
              <p class="opacity-50">暂无评论，快来抢沙发吧！</p>
            </div>
          </div>
        </div>
      </NCard>
    </div>

    <!-- Claim Dialog -->
    <NDialog 
      v-model:open="showClaimDialog"
      title="提交认领申请"
      description="请详细描述物品特征、丢失时间地点等细节，以证明物品所有权。"
    >
      <template #trigger>
        <span />
      </template>
      
      <NInput
        v-model="claimMessage"
        type="textarea"
        placeholder="例如：手机壳背面有个皮卡丘贴纸，锁屏是..."
        :rows="4"
        class="mt-4"
      />
      
      <template #footer>
        <div class="flex gap-2 justify-end">
          <NButton btn="ghost" @click="showClaimDialog = false">取消</NButton>
          <NButton 
            btn="solid-primary" 
            :loading="isSubmittingClaim"
            @click="submitClaim"
          >
            提交申请
          </NButton>
        </div>
      </template>
    </NDialog>

    <!-- Review Modal -->
    <ReviewModal 
      v-if="approvedClaimId && showReviewModal"
      :show="showReviewModal" 
      :claim-id="approvedClaimId"
      @close="showReviewModal = false"
      @success="handleReviewSuccess"
    />
  </div>
</template>
