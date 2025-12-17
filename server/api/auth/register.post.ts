import { db, users } from '~~/server/database'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { name, username, email, password } = body

    // Validate required fields
    if (!name || !username || !email || !password) {
        throw createError({
            statusCode: 400,
            message: '所有字段都是必填的',
        })
    }

    // Validate password length
    if (password.length < 6) {
        throw createError({
            statusCode: 400,
            message: '密码至少需要6个字符',
        })
    }

    // Check if email already exists
    const existingEmail = await db.select().from(users).where(eq(users.email, email)).get()
    if (existingEmail) {
        throw createError({
            statusCode: 400,
            message: '该邮箱已被注册',
        })
    }

    // Check if username already exists
    const existingUsername = await db.select().from(users).where(eq(users.username, username)).get()
    if (existingUsername) {
        throw createError({
            statusCode: 400,
            message: '该用户名已被使用',
        })
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const now = new Date().toISOString()
    const result = await db.insert(users).values({
        name,
        username,
        email,
        passwordHash,
        creditScore: 60, // Default credit score
        isActive: true,
        isAdmin: false,
        createdAt: now,
    }).returning()

    const newUser = result[0]

    // Set user session
    await setUserSession(event, {
        user: {
            id: newUser.id,
            name: newUser.name,
            username: newUser.username,
            email: newUser.email,
            isAdmin: newUser.isAdmin,
            creditScore: newUser.creditScore,
        },
    })

    return {
        success: true,
        user: {
            id: newUser.id,
            name: newUser.name,
            username: newUser.username,
            email: newUser.email,
        },
    }
})
