import { db, notifications } from '~~/server/database'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const session = await getUserSession(event)
    if (!session?.user) {
        throw createError({ statusCode: 401, message: '请先登录' })
    }

    const allNotifications = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, session.user.id))
        .orderBy(desc(notifications.createdAt))
        .all()

    const unreadCount = allNotifications.filter(n => n.status === 'unread').length

    return {
        data: allNotifications,
        unreadCount,
    }
})
