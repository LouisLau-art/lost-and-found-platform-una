<script setup lang="ts">
const colorMode = useColorMode()
const { data: session, refresh: refreshSession } = await useFetch('/api/auth/me')

const isLoggedIn = computed(() => !!session.value?.user)

async function handleLogout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await refreshSession()
  window.location.href = '/'
}

function toggleColorMode() {
  colorMode.preference = colorMode.preference === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <div class="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col">
    <!-- Header -->
    <header class="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container mx-auto flex h-16 items-center justify-between px-4">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 text-xl font-bold text-primary transition hover:opacity-80">
          <span class="i-ph-magnifying-glass-bold text-2xl" />
          <span>失物招领</span>
        </NuxtLink>
        
        <!-- Navigation -->
        <nav class="flex items-center gap-2 md:gap-3">
          <UButton 
            to="/post/new" 
            size="sm"
            color="primary"
            class="hidden sm:flex"
          >
            <span class="i-ph-plus-bold mr-1" />
            发布
          </UButton>
          
          <!-- Mobile Publish Icon -->
          <UButton 
            to="/post/new" 
            size="sm"
            color="primary"
            square
            class="sm:hidden"
          >
            <span class="i-ph-plus-bold" />
          </UButton>

          <template v-if="isLoggedIn">
            <UTooltip text="消息通知">
              <UButton to="/notifications" variant="ghost" size="sm" square>
                <span class="i-ph-bell text-xl" />
              </UButton>
            </UTooltip>
            
            <UDropdownMenu>
              <!-- Trigger -->
              <UButton variant="ghost" size="sm" class="gap-2 px-2">
                <UAvatar 
                  :src="session?.user?.avatar" 
                  :alt="session?.user?.name" 
                  size="2xs"
                />
                <span class="hidden sm:inline">{{ session?.user?.name }}</span>
                <span class="i-ph-caret-down text-muted-foreground text-xs" />
              </UButton>

              <!-- Content -->
              <template #content>
                <div class="min-w-[12rem]">
                  <div class="px-2 py-1.5 text-sm font-semibold">
                    我的账户
                  </div>
                  <UDropdownMenuSeparator />
                  <UDropdownMenuItem
                    leading="i-ph-user-circle"
                    label="个人中心"
                    @select="navigateTo('/profile')"
                  />
                  <UDropdownMenuSeparator />
                  <UDropdownMenuItem
                    leading="i-ph-sign-out"
                    label="退出登录"
                    class="text-red-500 focus:text-red-500"
                    @select="handleLogout"
                  />
                </div>
              </template>
            </UDropdownMenu>
          </template>
          
          <template v-else>
            <div class="flex items-center gap-2">
              <UButton to="/login" variant="ghost" size="sm">登录</UButton>
              <UButton to="/register" variant="outline" size="sm">注册</UButton>
            </div>
          </template>

          <div class="w-px h-6 bg-border mx-1"></div>

          <!-- Theme toggle -->
          <UTooltip :text="colorMode.preference === 'dark' ? '切换亮色模式' : '切换暗色模式'">
            <UButton
              variant="ghost"
              size="sm"
              square
              @click="toggleColorMode"
            >
              <span class="dark:i-ph-moon-bold i-ph-sun-bold text-xl" />
            </UButton>
          </UTooltip>
        </nav>
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-1 container mx-auto px-4 py-8 w-full max-w-7xl">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="border-t border-border py-8 mt-auto bg-muted/20">
      <div class="container mx-auto px-4 text-center text-muted-foreground text-sm">
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <p>&copy; 2025 校园失物招领平台</p>
          <span class="hidden sm:inline text-border">|</span>
          <p>Built with Nuxt + Una UI</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
/* Global resets and utility fixes */
html, body {
  height: 100%;
}
#__nuxt {
  height: 100%;
}

.bg-background {
  background-color: rgb(var(--una-background));
}
.text-foreground {
  color: rgb(var(--una-foreground));
}
.border-border {
  border-color: rgb(var(--una-border));
}
</style>
