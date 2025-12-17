import { db, notifications } from '~~/server/database'
import { eq } from 'drizzle-orm'

// Mark all notifications as read
export default defineEventHandler(async (event) => {
    const session = await getUserSession(event)
    if (!session?.user) {
        throw createError({ statusCode: 401, message: '请先登录' })
    }

    await db.update(notifications)
        .set({ status: 'read', readAt: new Date().toISOString() })
        .where(eq(notifications.userId, session.user.id))

    return { success: true }
})
