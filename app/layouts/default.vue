<script setup lang="ts">
const colorMode = useColorMode()
const { data: session, refresh: refreshSession } = await useFetch('/api/auth/me')

const isLoggedIn = computed(() => !!session.value?.user)

// Unread notifications count
const unreadCount = ref(0)

// Fetch initial unread count
if (isLoggedIn.value) {
  const { data: notifData } = await useFetch('/api/notifications')
  unreadCount.value = notifData.value?.data?.filter((n: any) => n.status === 'unread').length || 0
  
  // Setup SSE for real-time notifications
  if (import.meta.client) {
    const eventSource = new EventSource('/api/notifications/stream')
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'notification') {
        unreadCount.value++
      }
    }
    
    // Cleanup on unmount
    onUnmounted(() => {
      eventSource.close()
    })
  }
}

async function handleLogout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await refreshSession()
  window.location.href = '/'
}

function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

// Dropdown menu items for user
const userMenuItems = computed(() => [
  {
    label: '个人中心',
    icon: 'i-ph-user-circle',
    to: '/profile'
  },
  {
    label: '退出登录',
    icon: 'i-ph-sign-out',
    click: handleLogout,
    class: 'text-red-500'
  }
])
</script>

<template>
  <div class="min-h-screen bg-$c-bg transition-colors duration-300 flex flex-col">
    <!-- Header -->
    <header class="sticky top-0 z-50 border-b border-$c-divider bg-$c-bg/80 backdrop-blur">
      <div class="container mx-auto flex h-16 items-center justify-between px-4">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 text-xl font-bold text-$c-primary transition hover:opacity-80">
          <span class="i-ph-magnifying-glass-bold text-2xl" />
          <span>失物招领</span>
        </NuxtLink>
        
        <!-- Navigation -->
        <nav class="flex items-center gap-2 md:gap-3">
          <NButton 
            to="/post/new" 
            btn="solid-primary"
            size="sm"
            leading="i-ph-plus-bold"
            class="hidden sm:flex"
          >
            发布
          </NButton>
          
          <!-- Mobile Publish Icon -->
          <NButton 
            to="/post/new" 
            btn="solid-primary"
            size="sm"
            square
            icon
            leading="i-ph-plus-bold"
            class="sm:hidden"
          />

          <template v-if="isLoggedIn">
            <!-- Notifications -->
            <NTooltip content="消息通知">
              <NIndicator 
                :visible="unreadCount > 0" 
                :label="unreadCount > 99 ? '99+' : String(unreadCount)"
                indicator="solid-red"
                size="xs"
              >
                <NButton 
                  to="/notifications" 
                  btn="ghost"
                  size="sm"
                  square
                  icon
                  leading="i-ph-bell"
                />
              </NIndicator>
            </NTooltip>
            
            <!-- User Dropdown -->
            <NDropdownMenu :items="userMenuItems">
              <template #trigger>
                <NButton btn="ghost" size="sm" class="gap-2 px-2">
                  <NAvatar 
                    :src="session?.user?.avatar" 
                    :alt="session?.user?.name"
                    :label="session?.user?.name?.[0]"
                    size="xs"
                    avatar="soft-primary"
                  />
                  <span class="hidden sm:inline">{{ session?.user?.name }}</span>
                  <span class="i-ph-caret-down text-xs opacity-70" />
                </NButton>
              </template>
            </NDropdownMenu>
          </template>
          
          <template v-else>
            <div class="flex items-center gap-2">
              <NButton to="/login" btn="ghost" size="sm">登录</NButton>
              <NButton to="/register" btn="outline" size="sm">注册</NButton>
            </div>
          </template>

          <NSeparator orientation="vertical" class="h-6 mx-1" />

          <!-- Theme toggle -->
          <ClientOnly>
            <NTooltip :content="colorMode.value === 'dark' ? '切换亮色模式' : '切换暗色模式'">
              <NButton
                btn="ghost"
                size="sm"
                square
                icon
                :leading="colorMode.value === 'dark' ? 'i-ph-moon-bold' : 'i-ph-sun-bold'"
                @click="toggleColorMode"
              />
            </NTooltip>
          </ClientOnly>
        </nav>
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-1 container mx-auto px-4 py-8 w-full max-w-7xl">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="border-t border-$c-divider py-8 mt-auto bg-$c-muted/50">
      <div class="container mx-auto px-4 text-center opacity-70 text-sm">
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <p>&copy; 2025 校园失物招领平台</p>
          <span class="hidden sm:inline opacity-30">|</span>
          <p>Built with Nuxt + Una UI</p>
        </div>
      </div>
    </footer>
  </div>
</template>
