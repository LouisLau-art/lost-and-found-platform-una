<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const route = useRoute()
const userId = Number(route.params.id)
const { data: session } = await useFetch('/api/auth/me')
const isOwnProfile = computed(() => userId === session.value?.user?.id)

// Fetch user data with error handling
const { data: userData, error: userError } = await useFetch(`/api/users/${userId}`, {
  server: true,
  lazy: false
})

const user = computed(() => userData.value)

// User's posts
const { data: postsData } = await useFetch('/api/posts', {
  query: { authorId: String(userId), limit: '50' },
  immediate: !!userData.value
})
const posts = computed(() => postsData.value?.data || [])

// User's claims (only for own profile)
const { data: claimsData } = isOwnProfile.value ? await useFetch('/api/claims/my') : { data: ref(null) }
const claims = computed(() => claimsData?.value?.data || [])

// Stats
const stats = computed(() => ({
  totalPosts: posts.value.length,
  resolvedPosts: posts.value.filter((p: any) => p.status === 'resolved').length,
  totalClaims: claims.value.length,
  approvedClaims: claims.value.filter((c: any) => c.status === 'approved').length,
}))

const activeTab = ref('posts')

// Tab items
const tabItems = computed(() => {
  const items = [
    { value: 'posts', label: `发布记录 (${posts.value.length})`, content: 'posts' }
  ]
  if (isOwnProfile.value) {
    items.push({ value: 'claims', label: `认领记录 (${claims.value.length})`, content: 'claims' })
  }
  return items
})
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-8 py-8">
    <!-- User not found -->
    <div v-if="!user" class="text-center py-20">
      <div class="i-ph-user-circle-x text-6xl opacity-30 mx-auto mb-4" />
      <h2 class="text-2xl font-bold mb-2">用户不存在</h2>
      <p class="opacity-70 mb-6">该用户可能已被删除或不存在</p>
      <NButton to="/" btn="solid-primary">返回首页</NButton>
    </div>

    <!-- User Profile -->
    <div v-else class="space-y-8">
      <!-- Profile Header -->
      <NCard card="outline" class="shadow-xl">
        <div class="flex flex-col md:flex-row items-start md:items-center gap-6">
          <!-- Avatar -->
          <NAvatar 
            :src="user.avatar"
            :alt="user.name"
            :label="user.name?.[0]"
            size="xl"
            class="w-24 h-24 ring-2 ring-$c-primary ring-offset-2 ring-offset-$c-bg"
          />

          <!-- User Info -->
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h1 class="text-3xl font-bold">{{ user.name }}</h1>
              <NBadge v-if="user.isAdmin" badge="solid-error" leading="i-ph-shield-check-fill">
                管理员
              </NBadge>
            </div>
            <p class="text-lg opacity-70 mb-3">@{{ user.username }}</p>
            
            <!-- Stats -->
            <div class="flex flex-wrap gap-4">
              <NCard card="soft" class="p-4 min-w-[120px]">
                <div class="text-xs opacity-70">信用分</div>
                <div class="text-2xl font-bold flex items-center gap-2">
                  <span class="i-ph-star-fill text-yellow-500" />
                  {{ user.creditScore }}
                </div>
              </NCard>
              <NCard card="soft" class="p-4 min-w-[120px]">
                <div class="text-xs opacity-70">发布</div>
                <div class="text-2xl font-bold">{{ stats.totalPosts }}</div>
                <div class="text-xs opacity-50">{{ stats.resolvedPosts }} 已解决</div>
              </NCard>
              <NCard v-if="isOwnProfile" card="soft" class="p-4 min-w-[120px]">
                <div class="text-xs opacity-70">认领</div>
                <div class="text-2xl font-bold">{{ stats.totalClaims }}</div>
                <div class="text-xs opacity-50">{{ stats.approvedClaims }} 已通过</div>
              </NCard>
            </div>
          </div>

          <!-- Actions -->
          <div v-if="isOwnProfile" class="flex flex-col gap-2">
            <NButton to="/profile" btn="outline" size="sm" leading="i-ph-gear">
              编辑资料
            </NButton>
          </div>
        </div>
      </NCard>

      <!-- Tabs -->
      <NCard card="outline" class="shadow-xl">
        <NTabs v-model="activeTab" :items="tabItems">
          <template #content="{ value }">
            <!-- Posts Tab -->
            <div v-if="value === 'posts'" class="space-y-4 mt-6">
              <div v-if="posts.length" class="grid gap-4">
                <NuxtLink
                  v-for="post in posts"
                  :key="post.id"
                  :to="`/post/${post.id}`"
                  class="group flex items-center justify-between p-4 rounded-lg border border-$c-divider bg-$c-bg hover:border-$c-primary/50 hover:shadow-md transition-all"
                >
                  <div class="flex items-center gap-4 flex-1 min-w-0">
                    <div 
                      class="flex h-12 w-12 items-center justify-center rounded-full flex-shrink-0"
                      :class="post.itemType === 'lost' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-green-500/10 text-green-600'"
                    >
                      <span :class="post.itemType === 'lost' ? 'i-ph-magnifying-glass-bold text-xl' : 'i-ph-hand-heart-bold text-xl'" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <h3 class="font-bold text-lg group-hover:text-$c-primary transition-colors truncate">
                        {{ post.title }}
                      </h3>
                      <div class="flex items-center gap-3 text-sm opacity-70 mt-1">
                        <span>{{ new Date(post.createdAt).toLocaleDateString('zh-CN') }}</span>
                        <span v-if="post.location" class="flex items-center gap-1">
                          <span class="i-ph-map-pin" />
                          {{ post.location }}
                        </span>
                        <span class="flex items-center gap-1">
                          <span class="i-ph-heart" />
                          {{ post.likeCount }}
                        </span>
                        <span class="flex items-center gap-1">
                          <span class="i-ph-chat-circle" />
                          {{ post.commentCount }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 flex-shrink-0">
                    <NBadge 
                      :badge="post.status === 'resolved' ? 'soft-success' : post.status === 'closed' ? 'soft-error' : 'soft'"
                    >
                      {{ post.status === 'resolved' ? '已解决' : post.status === 'closed' ? '已关闭' : '进行中' }}
                    </NBadge>
                    <span class="i-ph-caret-right opacity-50" />
                  </div>
                </NuxtLink>
              </div>
              <div v-else class="text-center py-12 border border-dashed border-$c-divider rounded-xl">
                <div class="i-ph-notebook text-4xl opacity-30 mx-auto mb-3" />
                <p class="opacity-70">{{ isOwnProfile ? '你还没有发布任何帖子' : '该用户还没有发布任何帖子' }}</p>
                <NButton v-if="isOwnProfile" to="/post/new" btn="solid-primary" class="mt-4">立即发布</NButton>
              </div>
            </div>

            <!-- Claims Tab (Own Profile Only) -->
            <div v-if="value === 'claims' && isOwnProfile" class="mt-6">
              <div v-if="claims.length" class="grid gap-4">
                <NCard
                  v-for="claim in claims"
                  :key="claim.id"
                  card="outline"
                >
                  <div class="flex justify-between items-start mb-2">
                    <div class="font-medium">申请认领: {{ claim.postTitle }}</div>
                    <NBadge 
                      :badge="claim.status === 'approved' ? 'soft-success' : claim.status === 'rejected' ? 'soft-error' : 'soft-warning'"
                    >
                      {{ claim.status === 'approved' ? '已通过' : claim.status === 'rejected' ? '已拒绝' : '审核中' }}
                    </NBadge>
                  </div>
                  <p class="text-sm opacity-70 bg-$c-muted p-3 rounded">
                    "{{ claim.message }}"
                  </p>
                  <div class="text-xs opacity-50 mt-2 text-right">
                    {{ new Date(claim.createdAt).toLocaleString('zh-CN') }}
                  </div>
                </NCard>
              </div>
              <div v-else class="text-center py-12 border border-dashed border-$c-divider rounded-xl">
                <div class="i-ph-hand-pointing text-4xl opacity-30 mx-auto mb-3" />
                <p class="opacity-70">暂无认领记录</p>
              </div>
            </div>
          </template>
        </NTabs>
      </NCard>
    </div>
  </div>
</template>
