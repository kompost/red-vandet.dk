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
                    className="mb-4 w-[calc(100vw-3rem)] max-w-[600px]"
                />
            </section>
        </main>
    )
}
