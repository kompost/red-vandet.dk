import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { auth } from '#/lib/auth'
import { authClient } from '#/lib/auth-client'

const getSession = createServerFn().handler(async () => {
    const request = getRequest()
    const session = await auth.api.getSession({ headers: request.headers })
    return session
})

export const Route = createFileRoute('/admin')({
    beforeLoad: async () => {
        const session = await getSession()
        if (!session) {
            throw redirect({ to: '/login' })
        }
        return { session }
    },
    component: AdminPage,
})

function AdminPage() {
    const { session } = Route.useRouteContext()
    const router = useRouter()

    const handleSignOut = async () => {
        await authClient.signOut()
        await router.navigate({ to: '/login' })
    }

    return (
        <main className="mx-auto max-w-3xl px-6 py-32 md:px-12">
            <div className="mb-10 flex items-center justify-between">
                <div>
                    <p className="mb-1 font-mono text-xs tracking-widest text-[var(--sea-ink-soft)] uppercase">
                        Administration
                    </p>
                    <h1 className="text-4xl font-bold text-[var(--sea-ink)]">Dashboard</h1>
                </div>
                <button
                    type="button"
                    onClick={handleSignOut}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary"
                >
                    Log ud
                </button>
            </div>

            <div className="rounded-xl border border-border bg-secondary/20 p-6">
                <p className="mb-1 text-xs font-mono text-[var(--sea-ink-soft)] uppercase tracking-widest">
                    Logget ind som
                </p>
                <p className="text-lg font-semibold text-[var(--sea-ink)]">{session.user.name}</p>
                <p className="text-sm text-muted-foreground">{session.user.email}</p>
            </div>
        </main>
    )
}
