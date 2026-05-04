import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/red-vandet')({ component: RedVandet })

function RedVandet() {
    return (
        <main className="mx-auto max-w-4xl px-6 py-32 md:px-12">
            <p className="mb-2 font-mono text-xs tracking-widest text-[var(--sea-ink-soft)] uppercase">Om os</p>
            <h1 className="mb-6 text-5xl font-bold text-[var(--sea-ink)]">Red Vandet</h1>
            <p className="mb-16 max-w-xl text-lg text-[var(--sea-ink-soft)]">
                Vi arbejder for rent og bæredygtigt vand i Danmark — til naturen, til menneskene og til fremtiden.
            </p>
            <div className="grid gap-12 md:grid-cols-2">
                <div>
                    <h2 className="mb-4 text-2xl font-semibold text-[var(--sea-ink)]">Vores mission</h2>
                    <p className="text-[var(--sea-ink-soft)]">
                        Placeholder — indhold om organisationens formål og arbejde kommer her.
                    </p>
                </div>
                <div>
                    <h2 className="mb-4 text-2xl font-semibold text-[var(--sea-ink)]">Hvad vi gør</h2>
                    <p className="text-[var(--sea-ink-soft)]">
                        Placeholder — beskrivelse af aktiviteter, kampagner og samarbejder.
                    </p>
                </div>
                <div>
                    <h2 className="mb-4 text-2xl font-semibold text-[var(--sea-ink)]">Vores værdier</h2>
                    <p className="text-[var(--sea-ink-soft)]">
                        Placeholder — organisationens kerneværdier og principper.
                    </p>
                </div>
                <div>
                    <h2 className="mb-4 text-2xl font-semibold text-[var(--sea-ink)]">Bestyrelsen</h2>
                    <p className="text-[var(--sea-ink-soft)]">
                        Placeholder — navne og roller for bestyrelsesmedlemmer.
                    </p>
                </div>
            </div>
        </main>
    )
}
