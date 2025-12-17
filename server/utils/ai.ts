// AI Search utilities using Transformers.js
// Lazy load the model to avoid blocking startup

let pipeline: any = null
let embedder: any = null

async function getEmbedder() {
    if (embedder) return embedder

    // Dynamic import to avoid SSR issues
    const { pipeline: pipelineFn } = await import('@xenova/transformers')

    // Use MiniLM for text embeddings - lightweight and fast
    embedder = await pipelineFn('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        quantized: true, // Use quantized model for faster inference
    })

    return embedder
}

/**
 * Generate embedding vector for text
 */
export async function getTextEmbedding(text: string): Promise<number[]> {
    const embedder = await getEmbedder()
    const output = await embedder(text, { pooling: 'mean', normalize: true })
    return Array.from(output.data)
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i]
        normA += a[i] * a[i]
        normB += b[i] * b[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * Find similar posts using semantic search
 */
export async function findSimilarPosts(
    queryText: string,
    posts: { id: number; title: string; content: string }[],
    topK: number = 10,
    threshold: number = 0.3
): Promise<{ id: number; score: number }[]> {
    const queryEmbedding = await getTextEmbedding(queryText)

    const results: { id: number; score: number }[] = []

    for (const post of posts) {
        const postText = `${post.title} ${post.content}`
        const postEmbedding = await getTextEmbedding(postText)
        const score = cosineSimilarity(queryEmbedding, postEmbedding)

        if (score >= threshold) {
            results.push({ id: post.id, score })
        }
    }

    // Sort by score descending and take top K
    return results.sort((a, b) => b.score - a.score).slice(0, topK)
}
