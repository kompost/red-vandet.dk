import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/knowledge')({ component: Knowledge })

const TOPICS = [
    { title: 'Grundvand', desc: 'Hvad er grundvand, og hvordan påvirkes det af vores adfærd og klimaet?' },
    { title: 'Spildevand', desc: 'Sådan håndteres spildevand fra husholdninger og industri i Danmark.' },
    { title: 'Havmiljø', desc: 'Havets tilstand og de faktorer der påvirker livet under overfladen.' },
    { title: 'Klimaændringer', desc: 'Vandkredsløbets rolle i et varmere klima og konsekvenserne for Danmark.' },
    { title: 'Drikkevand', desc: 'Fra kilde til hane — hvad sikrer kvaliteten af vores drikkevand?' },
    { title: 'Oversvømmelser', desc: 'Risici, forebyggelse og klimatilpasning i danske kommuner.' },
]

function Knowledge() {
    return (
        <main className="mx-auto max-w-6xl px-6 py-32 md:px-12">
            <p className="mb-2 font-mono text-xs tracking-widest text-[var(--sea-ink-soft)] uppercase">Lær mere</p>
            <h1 className="mb-4 text-5xl font-bold text-[var(--sea-ink)]">Viden om vand</h1>
            <p className="mb-16 max-w-xl text-lg text-[var(--sea-ink-soft)]">
                Vi samler viden om vandmiljø, klimaets påvirkninger og bæredygtig vandforvaltning.
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {TOPICS.map((topic) => (
                    <div
                        key={topic.title}
                        className="rounded-2xl border border-border/40 bg-secondary/20 p-8 transition-colors hover:bg-secondary/40"
                    >
                        <div className="mb-4 h-10 w-10 rounded-full bg-primary/20" />
                        <h2 className="mb-2 text-xl font-semibold text-[var(--sea-ink)]">{topic.title}</h2>
                        <p className="text-sm text-[var(--sea-ink-soft)]">{topic.desc}</p>
                    </div>
                ))}
            </div>
        </main>
    )
}
