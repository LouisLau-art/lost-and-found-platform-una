import { db, claims, posts, users } from '~~/server/database'
import { eq, desc } from 'drizzle-orm'

// Get current user's claims
export default defineEventHandler(async (event) => {
    const session = await getUserSession(event)
    if (!session?.user) {
        throw createError({ statusCode: 401, message: '请先登录' })
    }

    const userClaims = await db
        .select({
            id: claims.id,
            status: claims.status,
            message: claims.message,
            createdAt: claims.createdAt,
            postId: claims.postId,
            postTitle: posts.title,
            postType: posts.itemType,
        })
        .from(claims)
        .leftJoin(posts, eq(claims.postId, posts.id))
        .where(eq(claims.claimerId, session.user.id))
        .orderBy(desc(claims.createdAt))
        .all()

    return { data: userClaims }
})
