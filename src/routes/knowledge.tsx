import { createServerFn } from '@tanstack/react-start'
import { createFileRoute } from '@tanstack/react-router'
import { readdir } from 'node:fs/promises'

const getDocuments = createServerFn().handler(async () => {
    try {
        const files = await readdir('/documents')
        return files.filter((f) => f.endsWith('.pdf')).sort()
    } catch {
        return []
    }
})

export const Route = createFileRoute('/knowledge')({
    loader: () => getDocuments(),
    component: Knowledge,
})

function Knowledge() {
    const files = Route.useLoaderData()

    return (
        <main className="mx-auto max-w-3xl px-6 py-32 md:px-12">
            <p className="mb-2 font-mono text-xs tracking-widest text-[var(--sea-ink-soft)] uppercase">Udgivelser</p>
            <h1 className="mb-4 text-5xl font-bold text-[var(--sea-ink)]">Dokumenter</h1>
            <p className="mb-16 max-w-xl text-lg text-[var(--sea-ink-soft)]">
                Hvidbøger, rapporter og analyser fra Red Vandet.
            </p>

            {files.length === 0 ? (
                <p className="text-[var(--sea-ink-soft)]">Ingen dokumenter tilgængelige endnu.</p>
            ) : (
                <ul className="flex flex-col divide-y divide-border/40">
                    {files.map((file, i) => (
                        <li key={file}>
                            <a
                                href={`/documents/${file}`}
                                target="_blank"
                                rel="noreferrer"
                                className="group flex items-center gap-4 py-5 transition-colors hover:text-primary"
                            >
                                <span className="font-mono text-xs text-[var(--sea-ink-soft)] w-5 shrink-0">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <span className="flex-1 text-lg font-medium text-[var(--sea-ink)] group-hover:text-primary transition-colors">
                                    {file.replace(/_/g, ' ').replace(/\.pdf$/i, '')}
                                </span>
                                <span className="font-mono text-xs text-[var(--sea-ink-soft)] uppercase">PDF</span>
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    )
}
