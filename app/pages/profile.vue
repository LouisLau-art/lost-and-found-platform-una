<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const route = useRoute()
const { data: session } = await useFetch('/api/auth/me')

// Check if viewing another user's profile
const viewingUserId = route.query.userId ? Number(route.query.userId) : session.value?.user?.id
const isOwnProfile = computed(() => viewingUserId === session.value?.user?.id)

// Fetch user data (either current user or specified user)
const { data: userData } = await useFetch(`/api/users/${viewingUserId}`)
const user = computed(() => userData.value || session.value?.user)

// User's posts
const { data: myPostsData } = await useFetch('/api/posts', {
  query: { authorId: String(viewingUserId), limit: '20' }
})
const myPosts = computed(() => myPostsData.value?.data || [])

// User's claims (only show for own profile)
const { data: myClaimsData } = isOwnProfile.value ? await useFetch('/api/claims/my') : { data: ref(null) }
const myClaims = computed(() => myClaimsData?.value?.data || [])

const activeTab = ref('posts')

// Tab items
const tabItems = computed(() => [
  { value: 'posts', label: '我的发布', content: 'posts' },
  { value: 'claims', label: '我的认领', content: 'claims' }
])
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-8">
    
    <!-- User Profile Header -->
    <NCard card="outline" class="shadow-sm">
      <div class="flex items-center gap-6">
        <div class="relative">
          <NAvatar 
            :src="user?.avatar" 
            :alt="user?.name"
            :label="user?.name?.[0]"
            size="xl"
            avatar="soft"
            class="w-24 h-24"
          />
          <div class="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-green-500 border-4 border-$c-bg" />
        </div>
        
        <div class="flex-1 space-y-1">
          <h1 class="text-2xl font-bold">{{ user?.name }}</h1>
          <p class="opacity-70 flex items-center gap-2">
            <span>@{{ user?.username }}</span>
            <span class="w-1 h-1 rounded-full bg-$c-fg/50" />
            <span>{{ user?.email }}</span>
          </p>
          <div class="flex gap-2 mt-3">
            <NBadge badge="soft-warning" leading="i-ph-star-fill">
              信用分: {{ user?.creditScore }}
            </NBadge>
            <NBadge badge="outline">{{ user?.isAdmin ? '管理员' : '普通用户' }}</NBadge>
          </div>
        </div>
      </div>
    </NCard>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 gap-4">
      <NCard card="outline" class="shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-lg bg-$c-primary/10 text-$c-primary">
            <span class="i-ph-file-text-bold text-2xl" />
          </div>
          <div>
            <div class="text-sm opacity-70">已发布</div>
            <div class="text-2xl font-bold">{{ myPosts.length }}</div>
          </div>
        </div>
      </NCard>
      
      <NCard card="outline" class="shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-lg bg-green-500/10 text-green-500">
            <span class="i-ph-hand-pointing-bold text-2xl" />
          </div>
          <div>
            <div class="text-sm opacity-70">已认领</div>
            <div class="text-2xl font-bold">{{ myClaims.length }}</div>
          </div>
        </div>
      </NCard>
    </div>

    <!-- Content Tabs -->
    <NTabs v-model="activeTab" :items="tabItems">
      <template #content="{ value }">
        <!-- Posts Tab -->
        <div v-if="value === 'posts'" class="space-y-4 mt-6">
          <div v-if="myPosts.length" class="grid gap-4">
            <NuxtLink
              v-for="post in myPosts"
              :key="post.id"
              :to="`/post/${post.id}`"
              class="group flex items-center justify-between p-4 rounded-lg border border-$c-divider bg-$c-bg hover:border-$c-primary/50 transition-all"
            >
              <div class="flex items-center gap-4">
                <div 
                  class="flex h-10 w-10 items-center justify-center rounded-full"
                  :class="post.itemType === 'lost' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-green-500/10 text-green-600'"
                >
                  <span :class="post.itemType === 'lost' ? 'i-ph-magnifying-glass-bold' : 'i-ph-hand-heart-bold'" />
                </div>
                <div>
                  <h3 class="font-medium group-hover:text-$c-primary transition-colors">{{ post.title }}</h3>
                  <div class="text-sm opacity-70 mt-0.5">
                    {{ new Date(post.createdAt).toLocaleDateString('zh-CN') }}
                    <span class="mx-1">·</span>
                    {{ post.contactInfo }}
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <NBadge :badge="post.status === 'resolved' ? 'soft-success' : 'soft'">
                  {{ post.status === 'resolved' ? '已解决' : '进行中' }}
                </NBadge>
                <span class="i-ph-caret-right opacity-50" />
              </div>
            </NuxtLink>
          </div>
          <div v-else class="text-center py-12 border border-dashed border-$c-divider rounded-xl">
            <div class="i-ph-notebook text-4xl opacity-50 mx-auto mb-3" />
            <p class="opacity-70">暂无发布记录</p>
            <NButton to="/post/new" btn="link" class="mt-2">去发布</NButton>
          </div>
        </div>
        
        <!-- Claims Tab -->
        <div v-if="value === 'claims'" class="mt-6">
          <div v-if="myClaims.length" class="grid gap-4">
            <NCard
              v-for="claim in myClaims"
              :key="claim.id"
              card="outline"
            >
              <div class="flex justify-between items-start mb-2">
                <div class="font-medium">申请认领: {{ claim.postTitle }}</div>
                <NBadge 
                  :badge="claim.status === 'approved' ? 'soft-success' : claim.status === 'rejected' ? 'soft-error' : 'soft'"
                >
                  {{ claim.status === 'approved' ? '通过' : claim.status === 'rejected' ? '拒绝' : '审核中' }}
                </NBadge>
              </div>
              <p class="text-sm opacity-70 bg-$c-muted p-2 rounded">
                "{{ claim.message }}"
              </p>
              <div class="text-xs opacity-50 mt-2 text-right">
                {{ new Date(claim.createdAt).toLocaleString('zh-CN') }}
              </div>
            </NCard>
          </div>
          <div v-else class="text-center py-12 border border-dashed border-$c-divider rounded-xl">
            <div class="i-ph-hand-pointing text-4xl opacity-50 mx-auto mb-3" />
            <p class="opacity-70">暂无认领记录</p>
          </div>
        </div>
      </template>
    </NTabs>
  </div>
</template>
