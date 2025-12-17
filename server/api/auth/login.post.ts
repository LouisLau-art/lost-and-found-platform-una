import { db, users } from '~~/server/database'
import { eq } from 'drizzle-orm'
import crypto from 'crypto'

// Verify PBKDF2-SHA256 password (compatible with old Python passlib format)
function verifyPbkdf2Password(password: string, hash: string): boolean {
    try {
        // Format: $pbkdf2-sha256$rounds$salt$hash
        const parts = hash.split('$')
        if (parts.length !== 5 || parts[1] !== 'pbkdf2-sha256') {
            return false
        }
        const rounds = parseInt(parts[2])
        const salt = Buffer.from(parts[3].replace(/\./g, '+'), 'base64')
        const storedHash = Buffer.from(parts[4].replace(/\./g, '+'), 'base64')

        const derivedKey = crypto.pbkdf2Sync(password, salt, rounds, storedHash.length, 'sha256')
        return crypto.timingSafeEqual(derivedKey, storedHash)
    } catch {
        return false
    }
}

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { email, password } = body

    if (!email || !password) {
        throw createError({
            statusCode: 400,
            message: '邮箱和密码不能为空',
        })
    }

    // Find user by email
    const user = await db.select().from(users).where(eq(users.email, email)).get()

    if (!user) {
        throw createError({
            statusCode: 401,
            message: '邮箱或密码错误',
        })
    }

    // Verify password - support both old PBKDF2 and new scrypt format
    let isValid = false
    if (user.passwordHash.startsWith('$pbkdf2-sha256$')) {
        isValid = verifyPbkdf2Password(password, user.passwordHash)
    } else {
        // New scrypt format from nuxt-auth-utils
        isValid = await verifyPassword(user.passwordHash, password)
    }

    if (!isValid) {
        throw createError({
            statusCode: 401,
            message: '邮箱或密码错误',
        })
    }

    // Check if user is active
    if (!user.isActive) {
        throw createError({
            statusCode: 403,
            message: '账户已被禁用',
        })
    }

    // Set user session
    await setUserSession(event, {
        user: {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin,
            creditScore: user.creditScore,
        },
    })

    return {
        success: true,
        user: {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin,
            creditScore: user.creditScore,
        },
    }
})
