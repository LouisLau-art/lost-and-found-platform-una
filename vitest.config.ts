import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        include: ['tests/**/*.test.ts'],
        testTimeout: 60000,
        hookTimeout: 60000,
        // Use Node environment for simple HTTP tests
        environment: 'node',
    },
})
