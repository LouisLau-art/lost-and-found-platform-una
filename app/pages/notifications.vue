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

// Get icon based on notification type
function getIcon(type: string) {
  switch (type) {
    case 'ai_match': return '🤖'
    case 'claim': return '🖐️'
    case 'comment': return '💬'
    default: return '🔔'
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">
        🔔 消息中心
        <span v-if="unreadCount > 0" class="ml-2 px-2 py-1 rounded-full bg-red-500 text-white text-sm">
          {{ unreadCount }}
        </span>
      </h1>
      <UButton
        v-if="unreadCount > 0"
        variant="ghost"
        size="sm"
        @click="markAllAsRead"
      >
        ✅ 全部标为已读
      </UButton>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="flex justify-center py-12">
      <span class="text-3xl animate-spin">⏳</span>
    </div>

    <!-- Notifications list -->
    <div v-else-if="notifications.length" class="space-y-3">
      <div
        v-for="notif in notifications"
        :key="notif.id"
        :class="[
          'p-4 rounded-lg border cursor-pointer hover:ring-2 hover:ring-primary transition',
          notif.status === 'unread' ? 'border-primary bg-primary/5' : 'border-$una-border opacity-60'
        ]"
        @click="notif.relatedPostId && navigateTo(`/post/${notif.relatedPostId}`)"
      >
        <div class="flex gap-4">
          <div class="flex-shrink-0 text-2xl">
            {{ getIcon(notif.type) }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-semibold">{{ notif.title }}</h3>
              <span v-if="notif.status === 'unread'" class="px-2 py-0.5 rounded bg-red-500 text-white text-xs">
                新
              </span>
            </div>
            <p class="text-sm opacity-70">{{ notif.content }}</p>
            <p class="text-xs opacity-50 mt-2">
              {{ new Date(notif.createdAt).toLocaleString('zh-CN') }}
            </p>
          </div>
          <div v-if="notif.status === 'unread'" class="flex-shrink-0">
            <UButton
              variant="ghost"
              size="xs"
              @click.stop="markAsRead(notif.id)"
            >
              ✓
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-12">
      <span class="text-6xl opacity-30">🔕</span>
      <p class="mt-4 opacity-50">暂无消息</p>
    </div>
  </div>
</template>
