// This script runs via Node.js during Nuxt dev/build to seed the database
// using the same password hashing as the main application

import { db, users, categories, posts } from '../server/database'
import { eq } from 'drizzle-orm'
import crypto from 'crypto'

// Hash password using scrypt (same as nuxt-auth-utils hashPassword)
async function hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(16).toString('hex')
        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err)
            resolve(`${salt}:${derivedKey.toString('hex')}`)
        })
    })
}

export default defineNitroPlugin(async () => {
    console.log('🌱 Checking database seed...')

    // Check if already seeded
    const existingUsers = await db.select().from(users).limit(1).all()
    if (existingUsers.length > 0) {
        console.log('✅ Database already seeded, skipping.')
        return
    }

    console.log('📍 Seeding database...')

    const now = new Date().toISOString()

    // Seed categories
    const categoryData = [
        { name: '电子产品', nameEn: 'electronics', description: '手机、电脑、耳机等', icon: '📱' },
        { name: '证件', nameEn: 'documents', description: '身份证、学生证、银行卡等', icon: '🪪' },
        { name: '钥匙', nameEn: 'keys', description: '各类钥匙', icon: '🔑' },
        { name: '衣物', nameEn: 'clothing', description: '衣服、帽子、围巾等', icon: '👕' },
        { name: '书籍文具', nameEn: 'stationery', description: '书籍、笔记本、文具等', icon: '📚' },
        { name: '其他', nameEn: 'other', description: '其他物品', icon: '📦' },
    ]

    for (const cat of categoryData) {
        await db.insert(categories).values({
            name: cat.name,
            nameEn: cat.nameEn,
            description: cat.description,
            icon: cat.icon,
            isActive: true,
            createdAt: now,
        }).onConflictDoNothing()
    }
    console.log('  ✅ Categories seeded')

    // Seed users
    const passwordHash = await hashPassword('123456')

    const testUsers = [
        { name: '张三', username: 'zhangsan', email: 'zhangsan@example.com' },
        { name: '李四', username: 'lisi', email: 'lisi@example.com' },
        { name: '王五', username: 'wangwu', email: 'wangwu@example.com' },
    ]

    for (const user of testUsers) {
        await db.insert(users).values({
            name: user.name,
            username: user.username,
            email: user.email,
            passwordHash: passwordHash,
            creditScore: 60,
            isActive: true,
            isAdmin: false,
            createdAt: now,
        }).onConflictDoNothing()
    }
    console.log('  ✅ Users seeded (password: 123456)')

    // Seed posts
    const testPosts = [
        {
            title: '丢失黑色双肩包',
            content: '今天下午在图书馆三楼自习室遗失一个黑色双肩包，里面有电脑和笔记本，非常重要，请捡到者联系我！',
            itemType: 'lost',
            location: '图书馆三楼',
            contactInfo: '13800138001',
            authorId: 1,
            categoryId: 6,
        },
        {
            title: '捡到一张学生证',
            content: '在食堂门口捡到一张学生证，证件号末四位是1234，请失主联系我领取。',
            itemType: 'found',
            location: '一食堂门口',
            contactInfo: 'wx: lisi_wx',
            authorId: 2,
            categoryId: 2,
        },
        {
            title: '丢失苹果AirPods Pro',
            content: '昨天晚上在操场跑步时遗失白色AirPods Pro一副，耳机盒上有贴纸，请捡到者联系我，必有重谢！',
            itemType: 'lost',
            location: '操场',
            contactInfo: '13900139001',
            authorId: 3,
            categoryId: 1,
        },
        {
            title: '捡到一串钥匙',
            content: '在教学楼B栋二楼走廊捡到一串钥匙，有三把钥匙和一个卡通挂件。请失主联系认领。',
            itemType: 'found',
            location: '教学楼B栋',
            contactInfo: 'zhangsan@example.com',
            authorId: 1,
            categoryId: 3,
        },
        {
            title: '遗失一本《高等数学》教材',
            content: '在2号教学楼201教室遗失一本《高等数学》第七版，书上有很多笔记，对我很重要，望好心人归还。',
            itemType: 'lost',
            location: '2号教学楼201',
            contactInfo: '15800158001',
            authorId: 2,
            categoryId: 5,
        },
        {
            title: '捡到黑色钱包',
            content: '今天早上在男生宿舍楼下捡到一个黑色钱包，里面有身份证和一些现金，请失主尽快联系我。',
            itemType: 'found',
            location: '男生宿舍楼下',
            contactInfo: 'wangwu@example.com',
            authorId: 3,
            categoryId: 6,
        },
    ]

    for (const post of testPosts) {
        await db.insert(posts).values({
            title: post.title,
            content: post.content,
            status: 'pending',
            itemType: post.itemType,
            location: post.location,
            contactInfo: post.contactInfo,
            images: '[]',
            isClaimed: false,
            createdAt: now,
            authorId: post.authorId,
            categoryId: post.categoryId,
        })
    }
    console.log('  ✅ Posts seeded')

    console.log('🎉 Database seeding completed!')
    console.log('Test accounts:')
    console.log('  - zhangsan@example.com / 123456')
    console.log('  - lisi@example.com / 123456')
    console.log('  - wangwu@example.com / 123456')
})
