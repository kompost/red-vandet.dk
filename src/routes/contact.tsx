import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/contact')({ component: Contact })

function Contact() {
    return (
        <main className="mx-auto max-w-2xl px-6 py-32 md:px-12">
            <p className="mb-2 font-mono text-xs tracking-widest text-[var(--sea-ink-soft)] uppercase">Skriv til os</p>
            <h1 className="mb-10 text-5xl font-bold text-[var(--sea-ink)]">Kontakt</h1>
            <form className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[var(--sea-ink)]" htmlFor="name">Navn</label>
                    <input
                        id="name"
                        type="text"
                        placeholder="Dit navn"
                        className="rounded-xl border border-border/50 bg-secondary/30 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-secondary/60"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[var(--sea-ink)]" htmlFor="email">E-mail</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="din@email.dk"
                        className="rounded-xl border border-border/50 bg-secondary/30 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-secondary/60"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[var(--sea-ink)]" htmlFor="message">Besked</label>
                    <textarea
                        id="message"
                        rows={6}
                        placeholder="Skriv din besked her..."
                        className="rounded-xl border border-border/50 bg-secondary/30 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-secondary/60 resize-none"
                    />
                </div>
                <button
                    type="submit"
                    className="self-start rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                    Send besked
                </button>
            </form>
        </main>
    )
}
