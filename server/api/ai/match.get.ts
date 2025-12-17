import { db, posts, users, categories, notifications } from '~~/server/database'
import { eq, desc, and, not } from 'drizzle-orm'
import { findSimilarPosts } from '~~/server/utils/ai'

// Smart match: Find potential matches between lost and found items
export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const { postId, type } = query as { postId?: string; type?: 'lost' | 'found' }

    if (!postId) {
        throw createError({ statusCode: 400, message: '缺少帖子ID' })
    }

    // Get the source post
    const sourcePost = await db
        .select()
        .from(posts)
        .where(eq(posts.id, parseInt(postId)))
        .get()

    if (!sourcePost) {
        throw createError({ statusCode: 404, message: '帖子不存在' })
    }

    // Find opposite type posts (if source is 'lost', find 'found' posts and vice versa)
    const oppositeType = sourcePost.itemType === 'lost' ? 'found' : 'lost'

    const candidatePosts = await db
        .select({
            id: posts.id,
            title: posts.title,
            content: posts.content,
            status: posts.status,
            itemType: posts.itemType,
            location: posts.location,
            images: posts.images,
            createdAt: posts.createdAt,
            authorId: posts.authorId,
            authorName: users.name,
            categoryId: posts.categoryId,
            categoryName: categories.name,
            categoryIcon: categories.icon,
        })
        .from(posts)
        .leftJoin(users, eq(posts.authorId, users.id))
        .leftJoin(categories, eq(posts.categoryId, categories.id))
        .where(and(
            eq(posts.itemType, oppositeType),
            eq(posts.status, 'pending'), // Only active posts
            not(eq(posts.authorId, sourcePost.authorId)) // Not from same author
        ))
        .orderBy(desc(posts.createdAt))
        .limit(50) // Limit candidates for performance
        .all()

    if (candidatePosts.length === 0) {
        return { matches: [], message: '暂无匹配的信息' }
    }

    // Use AI to find semantically similar posts
    const queryText = `${sourcePost.title} ${sourcePost.content}`
    const similarIds = await findSimilarPosts(
        queryText,
        candidatePosts.map(p => ({ id: p.id, title: p.title, content: p.content })),
        5, // Top 5 matches
        0.3 // Similarity threshold
    )

    // Map back to full post data with scores
    const matches = similarIds.map(({ id, score }) => {
        const post = candidatePosts.find(p => p.id === id)!
        return {
            ...post,
            images: post.images ? JSON.parse(post.images) : [],
            matchScore: Math.round(score * 100), // Convert to percentage
        }
    })

    return {
        matches,
        sourcePost: {
            id: sourcePost.id,
            title: sourcePost.title,
            itemType: sourcePost.itemType,
        },
    }
})
