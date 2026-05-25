import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { useState } from 'react'
import { authClient } from '#/lib/auth-client'
import { auth } from '#/lib/auth'

const getSession = createServerFn().handler(async () => {
    const request = getRequest()
    const session = await auth.api.getSession({ headers: request.headers })
    return session
})

export const Route = createFileRoute('/login')({
    beforeLoad: async () => {
        const session = await getSession()
        if (session) {
            throw redirect({ to: '/admin' })
        }
    },
    component: LoginPage,
})

function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const { error } = await authClient.signIn.email({
            email,
            password,
            callbackURL: '/admin',
        })

        if (error) {
            setError(error.message ?? 'Login fejlede')
            setLoading(false)
        } else {
            await router.navigate({ to: '/admin' })
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <h1 className="mb-8 text-2xl font-bold text-[var(--sea-ink)]">Log ind</h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="email" className="text-sm font-medium text-[var(--sea-ink)]">
                            E-mail
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="password" className="text-sm font-medium text-[var(--sea-ink)]">
                            Adgangskode
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {error && (
                        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        {loading ? 'Logger ind…' : 'Log ind'}
                    </button>
                </form>
            </div>
        </main>
    )
}
