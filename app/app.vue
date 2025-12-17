<script setup lang="ts">
useHead({
  title: '校园失物招领平台',
  meta: [
    { name: 'description', content: '让每一个遗失的物品都能找到回家的路' }
  ],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.ico' }
  ]
})
</script>

<template>
  <div class="min-h-screen bg-$c-bg text-$c-fg antialiased">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    
    <!-- Una UI Toaster - automatically handles toast notifications -->
    <NToaster />
  </div>
</template>

<style>
/* Global styles using Una UI CSS variables */
body {
  font-family: Inter, sans-serif;
}
</style>
