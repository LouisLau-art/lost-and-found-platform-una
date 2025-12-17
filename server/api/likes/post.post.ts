import { db, likes, posts } from '~~/server/database'
import { eq, and, count } from 'drizzle-orm'

// Toggle like on a post
export default defineEventHandler(async (event) => {
    const session = await getUserSession(event)
    if (!session?.user) {
        throw createError({ statusCode: 401, message: '请先登录' })
    }

    const body = await readBody(event)
    const { postId } = body

    if (!postId) {
        throw createError({ statusCode: 400, message: '缺少帖子ID' })
    }

    // Check if already liked
    const existingLike = await db
        .select()
        .from(likes)
        .where(and(
            eq(likes.userId, session.user.id),
            eq(likes.postId, postId)
        ))
        .get()

    if (existingLike) {
        // Unlike
        await db.delete(likes).where(eq(likes.id, existingLike.id))
        return { liked: false }
    } else {
        // Like
        await db.insert(likes).values({
            userId: session.user.id,
            postId,
            createdAt: new Date().toISOString(),
        })
        return { liked: true }
    }
})
