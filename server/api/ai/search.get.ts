import { db, posts, users, categories } from '~~/server/database'
import { eq, desc, and } from 'drizzle-orm'
import { findSimilarPosts } from '~~/server/utils/ai'

// Semantic search API
export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const { q, type, limit = '10' } = query as { q: string; type?: string; limit?: string }

    if (!q || q.length < 2) {
        throw createError({ statusCode: 400, message: '搜索词至少需要2个字符' })
    }

    // Build conditions
    const conditions = []
    if (type && (type === 'lost' || type === 'found')) {
        conditions.push(eq(posts.itemType, type))
    }

    // Get all candidate posts
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
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(posts.createdAt))
        .limit(100) // Limit for performance
        .all()

    if (candidatePosts.length === 0) {
        return { results: [], total: 0 }
    }

    // Use AI to find semantically similar posts
    const similarIds = await findSimilarPosts(
        q,
        candidatePosts.map(p => ({ id: p.id, title: p.title, content: p.content })),
        parseInt(limit),
        0.2 // Lower threshold for broader search
    )

    // Map back to full post data with scores
    const results = similarIds.map(({ id, score }) => {
        const post = candidatePosts.find(p => p.id === id)!
        return {
            ...post,
            images: post.images ? JSON.parse(post.images) : [],
            relevance: Math.round(score * 100),
        }
    })

    return {
        results,
        total: results.length,
        query: q,
    }
})
