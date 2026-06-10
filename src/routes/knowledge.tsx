import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { prisma } from '#/db'

const docsPath = () => process.env.DOCUMENTS_PATH || '/documents'
const externalDocsPath = () => join(docsPath(), 'external')

const getKnowledgeData = createServerFn().handler(async () => {
    const [externalLinks, files, externalFiles] = await Promise.all([
        prisma.externalLink.findMany({ orderBy: { createdAt: 'desc' } }),
        readdir(docsPath()).then((f) => f.filter((f) => f.endsWith('.pdf')).sort()).catch(() => []),
        readdir(externalDocsPath()).then((f) => f.filter((f) => f.endsWith('.pdf')).sort()).catch(() => []),
    ])
    return { files, externalFiles, externalLinks }
})

export const Route = createFileRoute('/knowledge')({
    loader: () => getKnowledgeData(),
    component: Knowledge,
})

function Knowledge() {
    const { files, externalFiles, externalLinks } = Route.useLoaderData()

    return (
        <main className="mx-auto max-w-3xl px-6 py-32 md:px-12">
            <p className="mb-2 font-mono text-xs tracking-widest text-[var(--sea-ink-soft)] uppercase">
                Udgivelser
            </p>
            <h1 className="mb-4 text-5xl font-bold text-[var(--sea-ink)]">
                Dokumenter
            </h1>
            <p className="mb-16 max-w-xl text-lg text-[var(--sea-ink-soft)]">
                Hvidbøger, rapporter og analyser fra Red Vandet.
            </p>

            <section className="mb-16">
                <p className="mb-6 font-mono text-xs tracking-widest text-[var(--sea-ink-soft)] uppercase">
                    Egne udgivelser
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
            </section>

            <section>
                <p className="mb-6 font-mono text-xs tracking-widest text-[var(--sea-ink-soft)] uppercase">
                    Andre relevante udgivelser
                </p>
                {externalFiles.length === 0 && externalLinks.length === 0 ? (
                    <p className="text-[var(--sea-ink-soft)]">Ingen udgivelser tilgængelige endnu.</p>
                ) : (
                    <ul className="flex flex-col divide-y divide-border/40">
                        {externalFiles.map((file, i) => (
                            <li key={file}>
                                <a
                                    href={`/documents/external/${file}`}
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
                        {externalLinks.map((link, i) => (
                            <li key={link.id}>
                                <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group flex items-center gap-4 py-5 transition-colors hover:text-primary"
                                >
                                    <span className="font-mono text-xs text-[var(--sea-ink-soft)] w-5 shrink-0">
                                        {String(externalFiles.length + i + 1).padStart(2, '0')}
                                    </span>
                                    <span className="flex-1 text-lg font-medium text-[var(--sea-ink)] group-hover:text-primary transition-colors">
                                        {link.title}
                                    </span>
                                    <span className="font-mono text-xs text-[var(--sea-ink-soft)] uppercase">↗</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </main>
    )
}
