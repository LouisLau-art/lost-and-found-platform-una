<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const { data: session } = await useFetch('/api/auth/me')
const user = computed(() => session.value?.user)

// User's posts
const { data: myPostsData } = await useFetch('/api/posts', {
  query: { authorId: user.value?.id, limit: '20' }
})
const myPosts = computed(() => myPostsData.value?.data || [])

// User's claims
const { data: myClaimsData } = await useFetch('/api/claims/my')
const myClaims = computed(() => myClaimsData.value?.data || [])
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-8">
    
    <!-- User Profile Header -->
    <div class="flex items-center gap-6 p-6 rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <div class="relative">
        <UAvatar
          :src="user?.avatar"
          :alt="user?.name"
          size="2xl"
          class="h-24 w-24 text-2xl"
        />
        <div class="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-green-500 border-4 border-background"></div>
      </div>
      
      <div class="flex-1 space-y-1">
        <h1 class="text-2xl font-bold">{{ user?.name }}</h1>
        <p class="text-muted-foreground flex items-center gap-2">
          <span>@{{ user?.username }}</span>
          <span class="w-1 h-1 rounded-full bg-border"></span>
          <span>{{ user?.email }}</span>
        </p>
        <div class="flex gap-2 mt-3">
          <UBadge variant="secondary" class="gap-1">
            <span class="i-ph-star-fill text-yellow-500" />
            信用分: {{ user?.creditScore }}
          </UBadge>
          <UBadge variant="outline">{{ user?.isAdmin ? '管理员' : '普通用户' }}</UBadge>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 gap-4">
      <div class="p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-lg bg-primary/10 text-primary">
            <span class="i-ph-file-text-bold text-2xl" />
          </div>
          <div>
            <div class="text-sm text-muted-foreground">已发布</div>
            <div class="text-2xl font-bold">{{ myPosts.length }}</div>
          </div>
        </div>
      </div>
      
      <div class="p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-lg bg-green-500/10 text-green-500">
            <span class="i-ph-hand-pointing-bold text-2xl" />
          </div>
          <div>
            <div class="text-sm text-muted-foreground">已认领</div>
            <div class="text-2xl font-bold">{{ myClaims.length }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- content tabs -->
    <UTabs default-value="posts" class="w-full">
      <UTabsList class="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
        <UTabsTrigger value="posts" class="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-3 px-6">
          我的发布
        </UTabsTrigger>
        <UTabsTrigger value="claims" class="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-3 px-6">
          我的认领
        </UTabsTrigger>
      </UTabsList>

      <UTabsContent value="posts" class="mt-6 space-y-4">
        <div v-if="myPosts.length" class="grid gap-4">
          <NuxtLink
            v-for="post in myPosts"
            :key="post.id"
            :to="`/post/${post.id}`"
            class="group flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-all"
          >
            <div class="flex items-center gap-4">
              <div 
                class="flex h-10 w-10 items-center justify-center rounded-full"
                :class="post.itemType === 'lost' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-green-500/10 text-green-600'"
              >
                <span :class="post.itemType === 'lost' ? 'i-ph-magnifying-glass-bold' : 'i-ph-hand-heart-bold'" />
              </div>
              <div>
                <h3 class="font-medium group-hover:text-primary transition-colors">{{ post.title }}</h3>
                <div class="text-sm text-muted-foreground mt-0.5">
                  {{ new Date(post.createdAt).toLocaleDateString('zh-CN') }}
                  <span class="mx-1">·</span>
                  {{ post.contactInfo }}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <UBadge :variant="post.status === 'resolved' ? 'default' : 'secondary'">
                {{ post.status === 'resolved' ? '已解决' : '进行中' }}
              </UBadge>
              <span class="i-ph-caret-right text-muted-foreground" />
            </div>
          </NuxtLink>
        </div>
        <div v-else class="text-center py-12 border border-dashed rounded-xl">
          <div class="i-ph-notebook text-4xl text-muted-foreground mx-auto mb-3" />
          <p class="text-muted-foreground">暂无发布记录</p>
          <UButton to="/post/new" variant="link" class="mt-2">去发布</UButton>
        </div>
      </UTabsContent>
      
      <UTabsContent value="claims" class="mt-6">
         <div v-if="myClaims.length" class="grid gap-4">
          <div
            v-for="claim in myClaims"
            :key="claim.id"
            class="p-4 rounded-lg border border-border bg-card"
          >
            <div class="flex justify-between items-start mb-2">
              <div class="font-medium">申请认领: {{ claim.postTitle }}</div>
              <UBadge :variant="claim.status === 'approved' ? 'default' : claim.status === 'rejected' ? 'destructive' : 'secondary'">
                {{ claim.status === 'approved' ? '通过' : claim.status === 'rejected' ? '拒绝' : '审核中' }}
              </UBadge>
            </div>
            <p class="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
              "{{ claim.message }}"
            </p>
            <div class="text-xs text-muted-foreground mt-2 text-right">
              {{ new Date(claim.createdAt).toLocaleString('zh-CN') }}
            </div>
          </div>
         </div>
         <div v-else class="text-center py-12 border border-dashed rounded-xl">
           <div class="i-ph-hand-pointing text-4xl text-muted-foreground mx-auto mb-3" />
           <p class="text-muted-foreground">暂无认领记录</p>
         </div>
      </UTabsContent>
    </UTabs>
  </div>
</template>
