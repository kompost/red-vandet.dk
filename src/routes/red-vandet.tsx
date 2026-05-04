import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/red-vandet')({ component: RedVandet })

function RedVandet() {
    return (
        <main className="mx-auto max-w-3xl px-6 py-32 md:px-12">
            <p className="mb-2 font-mono text-xs tracking-widest text-[var(--sea-ink-soft)] uppercase">Om os</p>
            <h1 className="mb-16 text-5xl font-bold text-[var(--sea-ink)]">Foreningen Red-Vandet</h1>

            <section className="mb-14">
                <h2 className="mb-4 text-2xl font-semibold text-[var(--sea-ink)]">Mission</h2>
                <p className="text-[var(--sea-ink-soft)] leading-relaxed">
                    Red Vandets mission er at sikre rent drikkevand og rent vand i Danmarks vandløb, søer og indre farvande.
                    Vi arbejder for, at både nuværende og kommende generationer har adgang til rent vand og en sund natur.
                </p>
            </section>

            <section className="mb-14">
                <h2 className="mb-4 text-2xl font-semibold text-[var(--sea-ink)]">Vision</h2>
                <p className="mb-4 text-[var(--sea-ink-soft)]">Vi ønsker et Danmark, hvor:</p>
                <ul className="flex flex-col gap-3">
                    {[
                        'grundvandet og drikkevandet er rent og beskyttet',
                        'vandløb, søer, fjorde og have er i økologisk balance',
                        'der er god plads til natur og biodiversiteten trives',
                        'menneskelig aktivitet sker inden for naturens grænser',
                    ].map((item) => (
                        <li key={item} className="flex items-start gap-3">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            <span className="text-[var(--sea-ink-soft)] leading-relaxed">{item}</span>
                        </li>
                    ))}
                </ul>
            </section>

            <section className="mb-14">
                <h2 className="mb-4 text-2xl font-semibold text-[var(--sea-ink)]">Hvem er vi?</h2>
                <p className="text-[var(--sea-ink-soft)] leading-relaxed">
                    Red Vandet er en uafhængig, non-profit tænketank og forening bestående af fagfolk med bred erfaring inden for miljø,
                    natur, vandforsyning, administration og landbrugsrelaterede produktionsformer.
                    Vi arbejder ulønnet og på et fælles fagligt grundlag for at skabe langsigtede, bæredygtige løsninger for vand og natur i Danmark.
                </p>
            </section>

            <section className="mb-14">
                <h2 className="mb-4 text-2xl font-semibold text-[var(--sea-ink)]">Hvad vil vi?</h2>
                <div className="flex flex-col gap-4 text-[var(--sea-ink-soft)] leading-relaxed">
                    <p>
                        Vi mener, at det nuværende konventionelle landbrug er ude af trit med det naturgrundlag, som erhvervet bygger på.
                        Forurening af grundvand, drikkevand, vandløb, søer og indre farvande taler sit tydelige sprog. Samtidig er biodiversiteten
                        under pres, arealer til natur for små, og naturens evne til at regenerere svækkes.
                    </p>
                    <p>
                        Hertil kommer alvorlige problemer med dyrevelfærd og en række andre forhold, som efter vores vurdering er
                        uacceptable for et moderne samfund.
                    </p>
                    <p>
                        Landbruget er samtidig i vid udstrækning understøttet af offentlige støtteordninger. Når de samlede følgevirkninger på
                        miljø, natur og samfund medregnes, er det vores vurdering, at den nuværende produktionsform ikke er bæredygtig –
                        hverken økonomisk, miljømæssigt eller etisk.
                    </p>
                    <p>
                        Vi mener derfor, at der ikke er nogen vej uden om en grundlæggende omstilling af landbruget, hvis vi skal sikre rent
                        vand og en sund natur i Danmark.
                    </p>
                    <p className="font-medium text-[var(--sea-ink)]">Der er behov for nytænkning.</p>
                    <p>Vi vil bidrage med:</p>
                </div>
                <ul className="mt-4 flex flex-col gap-3">
                    {[
                        'fagligt funderede analyser',
                        'konkrete forslag til ændringer',
                        'hvidbøger, rapporter og artikler',
                        'dialog med fagfolk, organisationer og beslutningstagere',
                    ].map((item) => (
                        <li key={item} className="flex items-start gap-3">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            <span className="text-[var(--sea-ink-soft)] leading-relaxed">{item}</span>
                        </li>
                    ))}
                </ul>
                <p className="mt-6 text-[var(--sea-ink-soft)] leading-relaxed">
                    Som grundlag for vores arbejde har vi udarbejdet en hvidbog, der samler vores faglige ståsted og anbefalinger.
                </p>
            </section>
        </main>
    )
}
