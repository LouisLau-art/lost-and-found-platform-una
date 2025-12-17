import { db, posts, users, categories, comments, claims, likes } from '~~/server/database'
import { eq, desc, and, count } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const id = parseInt(getRouterParam(event, 'id') || '')
    const session = await getUserSession(event)
    const currentUserId = session?.user?.id

    if (isNaN(id)) {
        throw createError({ statusCode: 400, message: '无效的帖子ID' })
    }

    // Get post with author and category info
    const post = await db
        .select({
            id: posts.id,
            title: posts.title,
            content: posts.content,
            status: posts.status,
            itemType: posts.itemType,
            location: posts.location,
            itemTime: posts.itemTime,
            contactInfo: posts.contactInfo,
            images: posts.images,
            isClaimed: posts.isClaimed,
            createdAt: posts.createdAt,
            updatedAt: posts.updatedAt,
            authorId: posts.authorId,
            authorName: users.name,
            authorUsername: users.username,
            authorCreditScore: users.creditScore,
            categoryId: posts.categoryId,
            categoryName: categories.name,
        })
        .from(posts)
        .leftJoin(users, eq(posts.authorId, users.id))
        .leftJoin(categories, eq(posts.categoryId, categories.id))
        .where(eq(posts.id, id))
        .get()

    if (!post) {
        throw createError({ statusCode: 404, message: '帖子不存在' })
    }

    // Get post like count and user liked status
    const postLikeCountResult = await db
        .select({ count: count() })
        .from(likes)
        .where(eq(likes.postId, id))
        .get()

    let userLikedPost = false
    if (currentUserId) {
        const userPostLike = await db
            .select()
            .from(likes)
            .where(and(eq(likes.postId, id), eq(likes.userId, currentUserId)))
            .get()
        userLikedPost = !!userPostLike
    }

    // Get comments with like counts
    const postComments = await db
        .select({
            id: comments.id,
            content: comments.content,
            createdAt: comments.createdAt,
            authorId: comments.authorId,
            authorName: users.name,
            authorUsername: users.username,
        })
        .from(comments)
        .leftJoin(users, eq(comments.authorId, users.id))
        .where(eq(comments.postId, id))
        .orderBy(desc(comments.createdAt))
        .all()

    // Add like info to each comment
    const commentsWithLikes = await Promise.all(
        postComments.map(async (comment) => {
            const likeCountResult = await db
                .select({ count: count() })
                .from(likes)
                .where(eq(likes.commentId, comment.id))
                .get()

            let userLiked = false
            if (currentUserId) {
                const userLike = await db
                    .select()
                    .from(likes)
                    .where(and(eq(likes.commentId, comment.id), eq(likes.userId, currentUserId)))
                    .get()
                userLiked = !!userLike
            }

            return {
                ...comment,
                likeCount: likeCountResult?.count || 0,
                userLiked,
            }
        })
    )

    // Get claims count for this post
    const postClaims = await db
        .select()
        .from(claims)
        .where(eq(claims.postId, id))
        .all()

    return {
        ...post,
        images: post.images ? JSON.parse(post.images) : [],
        comments: commentsWithLikes,
        claimsCount: postClaims.length,
        likeCount: postLikeCountResult?.count || 0,
        userLiked: userLikedPost,
    }
})
