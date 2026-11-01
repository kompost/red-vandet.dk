import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { prisma } from '#/db'

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    emailAndPassword: {
        enabled: true,
        disableSignUp: true,
    },
    advanced: {
        // Better Auth 1.7+ ignores X-Forwarded-* unless opted in. The app is only
        // reachable through Caddy, which sets these headers, so trust them.
        trustedProxyHeaders: true,
    },
    plugins: [tanstackStartCookies()],
})
