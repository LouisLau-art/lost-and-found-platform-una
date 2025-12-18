/**
 * API Integration Tests
 * 
 * These tests require the dev server to be running on port 3000.
 * Run: bun run dev
 * Then in another terminal: bun run test:run
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'

const BASE_URL = 'http://localhost:3000'

// Helper function to make API calls
async function api(path: string, options: RequestInit = {}) {
    const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
        const error: any = new Error(data?.message || 'API Error')
        error.statusCode = response.status
        error.data = data
        throw error
    }

    return { data, headers: response.headers }
}

describe('Auth API', () => {
    const testUser = {
        name: 'Test User',
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password: 'password123',
    }

    let authCookie: string = ''

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const response = await fetch(`${BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testUser),
            })

            expect(response.ok).toBe(true)
            const data = await response.json()
            expect(data.success).toBe(true)
            expect(data.user.username).toBe(testUser.username)

            // Save cookie for later tests
            const cookie = response.headers.get('set-cookie')
            if (cookie) {
                authCookie = cookie.split(';')[0]
            }
        })

        it('should fail with missing fields', async () => {
            const response = await fetch(`${BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Incomplete' }),
            })

            expect(response.status).toBe(400)
        })

        it('should fail with short password', async () => {
            const response = await fetch(`${BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Test',
                    username: `short_${Date.now()}`,
                    email: `short_${Date.now()}@test.com`,
                    password: '123',
                }),
            })

            expect(response.status).toBe(400)
        })

        it('should fail with duplicate email', async () => {
            const response = await fetch(`${BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testUser),
            })

            expect(response.status).toBe(400)
        })
    })

    describe('POST /api/auth/login', () => {
        it('should login with correct credentials', async () => {
            const response = await fetch(`${BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: testUser.email,
                    password: testUser.password,
                }),
            })

            expect(response.ok).toBe(true)
            const data = await response.json()
            expect(data.success).toBe(true)
            expect(data.user.email).toBe(testUser.email)
        })

        it('should fail with wrong password', async () => {
            const response = await fetch(`${BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: testUser.email,
                    password: 'wrongpassword',
                }),
            })

            expect(response.status).toBe(401)
        })

        it('should fail with non-existent email', async () => {
            const response = await fetch(`${BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'nonexistent@example.com',
                    password: 'password123',
                }),
            })

            expect(response.status).toBe(401)
        })
    })
})
