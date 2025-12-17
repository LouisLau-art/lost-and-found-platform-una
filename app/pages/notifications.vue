<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const { data: notificationsData, refresh, pending } = await useFetch('/api/notifications')

const notifications = computed(() => notificationsData.value?.data || [])
const unreadCount = computed(() => notificationsData.value?.unreadCount || 0)

// Mark notification as read
async function markAsRead(id: number) {
  await $fetch(`/api/notifications/${id}/read`, { method: 'POST' })
  refresh()
}

// Mark all as read
async function markAllAsRead() {
  await $fetch('/api/notifications/read-all', { method: 'POST' })
  refresh()
}

// Handle notification click
async function handleNotificationClick(notif: any) {
  // Mark as read if unread
  if (notif.status === 'unread') {
    await markAsRead(notif.id)
  }
  
  // Navigate to related post
  if (notif.relatedPostId) {
    navigateTo(`/post/${notif.relatedPostId}`)
  }
}

// Get icon based on notification type
function getIcon(type: string) {
  switch (type) {
    case 'ai_match': return 'i-ph-robot'
    case 'claim': return 'i-ph-hand-pointing'
    case 'comment': return 'i-ph-chat-circle'
    default: return 'i-ph-bell'
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold flex items-center gap-2">
        <span class="i-ph-bell" />
        消息中心
        <NBadge v-if="unreadCount > 0" badge="solid-error" size="sm">
          {{ unreadCount }}
        </NBadge>
      </h1>
      <NButton
        v-if="unreadCount > 0"
        btn="ghost"
        size="sm"
        leading="i-ph-check"
        @click="markAllAsRead"
      >
        全部标为已读
      </NButton>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="flex justify-center py-12">
      <span class="i-ph-spinner-gap text-3xl animate-spin" />
    </div>

    <!-- Notifications list -->
    <div v-else-if="notifications.length" class="space-y-3">
      <NCard
        v-for="notif in notifications"
        :key="notif.id"
        :card="notif.status === 'unread' ? 'outline-primary' : 'outline'"
        :class="[
          'cursor-pointer hover:border-$c-primary transition',
          notif.status !== 'unread' && 'opacity-60'
        ]"
        @click="handleNotificationClick(notif)"
      >
        <div class="flex gap-4">
          <div class="flex-shrink-0 p-2 rounded-full bg-$c-muted">
            <span :class="[getIcon(notif.type), 'text-xl text-$c-primary']" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-semibold">{{ notif.title }}</h3>
              <NBadge v-if="notif.status === 'unread'" badge="solid-error" size="xs">
                新
              </NBadge>
            </div>
            <p class="text-sm opacity-70">{{ notif.content }}</p>
            <p class="text-xs opacity-50 mt-2">
              {{ new Date(notif.createdAt).toLocaleString('zh-CN') }}
            </p>
          </div>
          <div v-if="notif.status === 'unread'" class="flex-shrink-0">
            <NButton
              btn="ghost"
              size="xs"
              leading="i-ph-check"
              @click.stop="markAsRead(notif.id)"
            />
          </div>
        </div>
      </NCard>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-12">
      <span class="i-ph-bell-slash text-6xl opacity-30" />
      <p class="mt-4 opacity-50">暂无消息</p>
    </div>
  </div>
</template>
