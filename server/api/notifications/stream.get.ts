import { db, notifications } from '~~/server/database'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const session = await getUserSession(event)
    if (!session?.user) {
        throw createError({ statusCode: 401, message: '请先登录' })
    }

    // Set SSE headers
    setHeader(event, 'Content-Type', 'text/event-stream')
    setHeader(event, 'Cache-Control', 'no-cache')
    setHeader(event, 'Connection', 'keep-alive')

    const userId = session.user.id

    // Send initial notifications
    const initialNotifications = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .where(eq(notifications.status, 'unread'))
        .all()

    // Send initial data
    const sendEvent = (data: any) => {
        return `data: ${JSON.stringify(data)}\n\n`
    }

    // In a real implementation, you would keep the connection open
    // and send events when new notifications arrive.
    // For simplicity, we'll send initial data and close.
    return sendEvent({
        type: 'init',
        notifications: initialNotifications,
        count: initialNotifications.length,
    })
})
