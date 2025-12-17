// Auth middleware - redirect to login if not authenticated
export default defineNuxtRouteMiddleware(async () => {
    const { data: session } = await useFetch('/api/auth/me')

    if (!session.value?.user) {
        return navigateTo('/login')
    }
})
