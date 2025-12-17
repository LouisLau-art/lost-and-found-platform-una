import { db, comments } from '~~/server/database'

export default defineEventHandler(async (event) => {
    // Check authentication
    const session = await getUserSession(event)
    if (!session?.user) {
        throw createError({ statusCode: 401, message: '请先登录' })
    }

    const body = await readBody(event)
    const { postId, content } = body

    if (!postId || !content) {
        throw createError({
            statusCode: 400,
            message: '帖子ID和评论内容为必填项',
        })
    }

    const now = new Date().toISOString()

    const result = await db.insert(comments).values({
        postId,
        content,
        authorId: session.user.id,
        createdAt: now,
    }).returning()

    return {
        success: true,
        comment: result[0],
    }
})
