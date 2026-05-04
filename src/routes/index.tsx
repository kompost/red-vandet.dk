import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
    return (
        <main>
            {/* Hero */}
            <section className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
                <p className="mb-4 font-mono text-xs tracking-widest text-[var(--sea-ink-soft)] uppercase">
                    Under opbygning
                </p>
                <h1 className="mb-6 text-6xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-7xl lg:text-8xl">
                    Red Vandet
                </h1>
                <p className="max-w-xl text-lg text-[var(--sea-ink-soft)]">
                    Vi arbejder på noget nyt. Scroll ned for at se hvad der er på vej.
                </p>
            </section>

            {/* News placeholder */}
            <section className="px-6 py-24 md:px-12">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-12 flex items-end justify-between">
                        <div>
                            <p className="mb-2 font-mono text-xs tracking-widest text-[var(--sea-ink-soft)] uppercase">Seneste</p>
                            <h2 className="text-4xl font-bold text-[var(--sea-ink)]">Aktuelt</h2>
                        </div>
                        <span className="text-sm text-[var(--sea-ink-soft)]">Kommer snart</span>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {['Vandkvalitet i danske fjorde', 'Nye EU-krav til spildevand', 'Klimaets effekt på grundvand'].map((title) => (
                            <div key={title} className="group rounded-2xl border border-border/40 bg-secondary/30 p-6 transition-colors hover:bg-secondary/60">
                                <div className="mb-4 h-40 rounded-xl bg-border/30" />
                                <p className="mb-2 font-mono text-xs text-[var(--sea-ink-soft)]">Placeholder</p>
                                <h3 className="text-lg font-semibold text-[var(--sea-ink)]">{title}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Data placeholder */}
            <section className="px-6 py-24 md:px-12 bg-secondary/20">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-12">
                        <p className="mb-2 font-mono text-xs tracking-widest text-[var(--sea-ink-soft)] uppercase">Indsigt</p>
                        <h2 className="text-4xl font-bold text-[var(--sea-ink)]">Tal & Analyser</h2>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            { label: 'Overvågede vandområder', value: '—' },
                            { label: 'Aktive målestationer', value: '—' },
                            { label: 'Analyserede prøver', value: '—' },
                            { label: 'Partnere', value: '—' },
                        ].map((stat) => (
                            <div key={stat.label} className="rounded-2xl border border-border/40 bg-background/50 p-8 text-center">
                                <p className="mb-2 text-4xl font-bold text-[var(--sea-ink)]">{stat.value}</p>
                                <p className="text-sm text-[var(--sea-ink-soft)]">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Knowledge placeholder */}
            <section className="px-6 py-24 md:px-12">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-12">
                        <p className="mb-2 font-mono text-xs tracking-widest text-[var(--sea-ink-soft)] uppercase">Lær mere</p>
                        <h2 className="text-4xl font-bold text-[var(--sea-ink)]">Viden om vand</h2>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                        {[
                            { title: 'Grundvand', desc: 'Hvad er grundvand, og hvordan påvirkes det af vores adfærd?' },
                            { title: 'Spildevand', desc: 'Sådan håndteres spildevand fra husholdninger og industri.' },
                            { title: 'Havmiljø', desc: 'Havets tilstand og de faktorer der påvirker det.' },
                            { title: 'Klimaændringer', desc: 'Vandkredsløbets rolle i et varmere klima.' },
                        ].map((item) => (
                            <div key={item.title} className="flex gap-6 rounded-2xl border border-border/40 bg-secondary/20 p-8 transition-colors hover:bg-secondary/40">
                                <div className="mt-1 h-10 w-10 shrink-0 rounded-full bg-primary/20" />
                                <div>
                                    <h3 className="mb-2 text-xl font-semibold text-[var(--sea-ink)]">{item.title}</h3>
                                    <p className="text-sm text-[var(--sea-ink-soft)]">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    )
}
