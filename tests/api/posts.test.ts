/**
 * Posts API Integration Tests
 */

import { describe, it, expect, beforeAll } from 'vitest'

const BASE_URL = 'http://localhost:3000'

describe('Posts API', () => {
    let authCookie: string = ''
    let createdPostId: number

    const testUser = {
        name: 'Posts Test User',
        username: `postuser_${Date.now()}`,
        email: `posttest_${Date.now()}@example.com`,
        password: 'password123',
    }

    beforeAll(async () => {
        // Register to get auth cookie
        const response = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser),
        })

        const cookie = response.headers.get('set-cookie')
        if (cookie) {
            authCookie = cookie.split(';')[0]
        }
    })

    describe('GET /api/posts', () => {
        it('should return posts list (public)', async () => {
            const response = await fetch(`${BASE_URL}/api/posts`)
            expect(response.ok).toBe(true)

            const data = await response.json()
            // API returns { data: [...], pagination: {...} }
            expect(data.data).toBeDefined()
            expect(Array.isArray(data.data)).toBe(true)
            expect(data.pagination).toBeDefined()
        })

        it('should support pagination', async () => {
            const response = await fetch(`${BASE_URL}/api/posts?page=1&limit=5`)
            expect(response.ok).toBe(true)

            const result = await response.json()
            expect(result.data.length).toBeLessThanOrEqual(5)
            expect(result.pagination.limit).toBe(5)
        })

        it('should filter by type', async () => {
            const response = await fetch(`${BASE_URL}/api/posts?type=lost`)
            expect(response.ok).toBe(true)

            const result = await response.json()
            for (const post of result.data) {
                expect(post.itemType).toBe('lost')
            }
        })
    })

    describe('POST /api/posts', () => {
        it('should fail without authentication', async () => {
            const response = await fetch(`${BASE_URL}/api/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'Test Post',
                    content: 'Test content',
                    itemType: 'lost',
                }),
            })

            expect(response.status).toBe(401)
        })

        it('should create a post with authentication', async () => {
            const response = await fetch(`${BASE_URL}/api/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: authCookie,
                },
                body: JSON.stringify({
                    title: 'Lost Wallet Test',
                    content: 'I lost my wallet near the library',
                    itemType: 'lost',
                    location: 'Library',
                }),
            })

            expect(response.ok).toBe(true)
            const data = await response.json()
            expect(data.success).toBe(true)
            expect(data.post.title).toBe('Lost Wallet Test')
            expect(data.post.itemType).toBe('lost')

            createdPostId = data.post.id
        })

        it('should fail with missing required fields', async () => {
            const response = await fetch(`${BASE_URL}/api/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: authCookie,
                },
                body: JSON.stringify({
                    title: 'Only Title',
                }),
            })

            expect(response.status).toBe(400)
        })

        it('should fail with invalid itemType', async () => {
            const response = await fetch(`${BASE_URL}/api/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: authCookie,
                },
                body: JSON.stringify({
                    title: 'Test',
                    content: 'Content',
                    itemType: 'invalid',
                }),
            })

            expect(response.status).toBe(400)
        })
    })

    describe('GET /api/posts/:id', () => {
        it('should return specific post details', async () => {
            if (!createdPostId) return

            const response = await fetch(`${BASE_URL}/api/posts/${createdPostId}`)
            expect(response.ok).toBe(true)

            const data = await response.json()
            expect(data.id).toBe(createdPostId)
        })

        it('should return 404 for non-existent post', async () => {
            const response = await fetch(`${BASE_URL}/api/posts/999999`)
            expect(response.status).toBe(404)
        })
    })
})
