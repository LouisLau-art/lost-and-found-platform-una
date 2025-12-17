import { db, notifications } from '~~/server/database'
import { eq } from 'drizzle-orm'

// Mark single notification as read
export default defineEventHandler(async (event) => {
    const session = await getUserSession(event)
    if (!session?.user) {
        throw createError({ statusCode: 401, message: '请先登录' })
    }

    const id = parseInt(getRouterParam(event, 'id') || '')

    if (isNaN(id)) {
        throw createError({ statusCode: 400, message: '无效的通知ID' })
    }

    // Verify ownership
    const notif = await db.select().from(notifications).where(eq(notifications.id, id)).get()

    if (!notif || notif.userId !== session.user.id) {
        throw createError({ statusCode: 404, message: '通知不存在' })
    }

    await db.update(notifications)
        .set({ status: 'read', readAt: new Date().toISOString() })
        .where(eq(notifications.id, id))

    return { success: true }
})
