import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
    return (
        <main>
            {/* Hero */}
            <section className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
                <img
                    src="/logo_full.png"
                    alt="Red Vandet"
                    className="mb-10 w-[calc(100vw-3rem)] max-w-[600px]"
                />
                <div className="flex items-center gap-3 rounded-full border border-border/50 bg-secondary/40 px-5 py-2.5 backdrop-blur-sm">
                    <span className="text-xl">🚧</span>
                    <span className="font-mono text-sm tracking-wide text-[var(--sea-ink-soft)]">Under konstruktion</span>
                    <span className="text-xl">🚧</span>
                </div>
            </section>
        </main>
    )
}
