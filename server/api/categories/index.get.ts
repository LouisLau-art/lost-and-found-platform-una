import { db, categories } from '~~/server/database'

export default defineEventHandler(async () => {
    const allCategories = await db.select().from(categories).all()
    return allCategories
})
