import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { prisma } from '#/db'

export const docsPath = () => process.env.DOCUMENTS_PATH || '/documents'
export const externalDocsPath = () => join(docsPath(), 'external')

export type DocumentSection = 'own' | 'external'

export type ExternalItem =
	| { type: 'file'; key: string; filename: string }
	| { type: 'link'; key: string; id: string; title: string; url: string }

async function listPdfs(dir: string) {
	try {
		return (await readdir(dir)).filter((f) => f.endsWith('.pdf')).sort()
	} catch {
		return []
	}
}

/** Sorts items by their saved position; items without one keep their given order at the end. */
async function applyOrder<T extends { key: string }>(section: DocumentSection, items: T[]) {
	const rows = await prisma.documentOrder.findMany({ where: { section } })
	const position = new Map(rows.map((r) => [r.key, r.sortOrder]))
	return items
		.map((item, i) => ({ item, pos: position.get(item.key) ?? Number.MAX_SAFE_INTEGER, i }))
		.sort((a, b) => a.pos - b.pos || a.i - b.i)
		.map(({ item }) => item)
}

export async function listOwnDocuments() {
	const files = await listPdfs(docsPath())
	const ordered = await applyOrder('own', files.map((filename) => ({ key: filename })))
	return ordered.map((f) => f.key)
}

export async function listExternalItems(): Promise<ExternalItem[]> {
	const [files, links] = await Promise.all([
		listPdfs(externalDocsPath()),
		prisma.externalLink.findMany({ orderBy: { createdAt: 'desc' } }),
	])
	const items: ExternalItem[] = [
		...files.map((filename) => ({ type: 'file' as const, key: `file:${filename}`, filename })),
		...links.map((l) => ({ type: 'link' as const, key: `link:${l.id}`, id: l.id, title: l.title, url: l.url })),
	]
	return applyOrder('external', items)
}

/** Swaps an item with its neighbour and saves the full order for the section. */
export async function moveDocument(section: DocumentSection, key: string, direction: 'up' | 'down') {
	const keys =
		section === 'own' ? await listOwnDocuments() : (await listExternalItems()).map((i) => i.key)
	const idx = keys.indexOf(key)
	const swapIdx = direction === 'up' ? idx - 1 : idx + 1
	if (idx < 0 || swapIdx < 0 || swapIdx >= keys.length) return
	;[keys[idx], keys[swapIdx]] = [keys[swapIdx], keys[idx]]
	// Rewriting the whole section also drops rows for deleted files and links.
	await prisma.$transaction([
		prisma.documentOrder.deleteMany({ where: { section } }),
		prisma.documentOrder.createMany({
			data: keys.map((k, sortOrder) => ({ section, key: k, sortOrder })),
		}),
	])
}
