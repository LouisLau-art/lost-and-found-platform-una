/**
 * Claims API Integration Tests
 */

import { describe, it, expect, beforeAll } from 'vitest'

const BASE_URL = 'http://localhost:3000'

describe('Claims API', () => {
    let user1Cookie: string = ''
    let user2Cookie: string = ''
    let testPostId: number

    const user1 = {
        name: 'Claims User 1',
        username: `claimuser1_${Date.now()}`,
        email: `claim1_${Date.now()}@example.com`,
        password: 'password123',
    }

    const user2 = {
        name: 'Claims User 2',
        username: `claimuser2_${Date.now()}`,
        email: `claim2_${Date.now()}@example.com`,
        password: 'password123',
    }

    beforeAll(async () => {
        // Register user1 (post owner)
        const res1 = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user1),
        })
        const cookie1 = res1.headers.get('set-cookie')
        if (cookie1) user1Cookie = cookie1.split(';')[0]

        // Create a post as user1
        const postRes = await fetch(`${BASE_URL}/api/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Cookie: user1Cookie,
            },
            body: JSON.stringify({
                title: 'Found Keys for Claims Test',
                content: 'Found some keys near cafe',
                itemType: 'found',
                location: 'Cafeteria',
            }),
        })
        const postData = await postRes.json()
        testPostId = postData.post.id

        // Register user2 (claimer)
        const res2 = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user2),
        })
        const cookie2 = res2.headers.get('set-cookie')
        if (cookie2) user2Cookie = cookie2.split(';')[0]
    })

    describe('POST /api/claims', () => {
        it('should fail without authentication', async () => {
            const response = await fetch(`${BASE_URL}/api/claims`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId: testPostId, message: 'Test' }),
            })
            expect(response.status).toBe(401)
        })

        it('should fail when claiming own post', async () => {
            const response = await fetch(`${BASE_URL}/api/claims`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: user1Cookie,
                },
                body: JSON.stringify({ postId: testPostId, message: 'My own' }),
            })
            expect(response.status).toBe(400)

            const data = await response.json()
            expect(data.message).toContain('自己')
        })

        it('should create a claim successfully', async () => {
            const response = await fetch(`${BASE_URL}/api/claims`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: user2Cookie,
                },
                body: JSON.stringify({
                    postId: testPostId,
                    message: 'These are my keys with red keychain',
                }),
            })

            expect(response.ok).toBe(true)
            const data = await response.json()
            expect(data.success).toBe(true)
            expect(data.claim.postId).toBe(testPostId)
            expect(data.claim.status).toBe('pending')
        })

        it('should fail on duplicate claim', async () => {
            const response = await fetch(`${BASE_URL}/api/claims`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: user2Cookie,
                },
                body: JSON.stringify({ postId: testPostId, message: 'Again' }),
            })

            expect(response.status).toBe(400)
            const data = await response.json()
            expect(data.message).toContain('已经')
        })

        it('should fail with non-existent post', async () => {
            const response = await fetch(`${BASE_URL}/api/claims`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: user2Cookie,
                },
                body: JSON.stringify({ postId: 999999, message: 'Test' }),
            })
            expect(response.status).toBe(404)
        })
    })

    describe('GET /api/claims/my', () => {
        it('should return user claims', async () => {
            const response = await fetch(`${BASE_URL}/api/claims/my`, {
                headers: { Cookie: user2Cookie },
            })

            expect(response.ok).toBe(true)
            const result = await response.json()
            // API returns { data: [...] }
            expect(result.data).toBeDefined()
            expect(Array.isArray(result.data)).toBe(true)
            expect(result.data.length).toBeGreaterThan(0)
        })

        it('should fail without authentication', async () => {
            const response = await fetch(`${BASE_URL}/api/claims/my`)
            expect(response.status).toBe(401)
        })
    })
})
