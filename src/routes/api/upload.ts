import { createFileRoute } from '@tanstack/react-router'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { auth } from '#/lib/auth'

const docsPath = () => process.env.DOCUMENTS_PATH || '/documents'

export const Route = createFileRoute('/api/upload')({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const session = await auth.api.getSession({ headers: request.headers })
				if (!session) return new Response('Unauthorized', { status: 401 })

				const formData = await request.formData()
				const file = formData.get('file') as File | null

				if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
					return new Response('Only PDF files are allowed', { status: 400 })
				}

				const filename = file.name.replace(/[^a-zA-Z0-9æøåÆØÅ._-]/g, '_')
				await mkdir(docsPath(), { recursive: true })
				await writeFile(join(docsPath(), filename), Buffer.from(await file.arrayBuffer()))

				return new Response(JSON.stringify({ ok: true }), {
					headers: { 'Content-Type': 'application/json' },
				})
			},
		},
	},
})
