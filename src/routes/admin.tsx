import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { randomBytes, scryptSync } from 'node:crypto'
import { unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { readdir } from 'node:fs/promises'
import { useState } from 'react'
import { prisma } from '#/db'
import { auth } from '#/lib/auth'
import { authClient } from '#/lib/auth-client'

const getSession = createServerFn().handler(async () => {
	const request = getRequest()
	const session = await auth.api.getSession({ headers: request.headers })
	return session
})

const getMessages = createServerFn().handler(async () => {
	const request = getRequest()
	const session = await auth.api.getSession({ headers: request.headers })
	if (!session) throw new Error('Unauthorized')
	const msgs = await prisma.contactMessage.findMany({
		orderBy: { createdAt: 'desc' },
	})
	return msgs.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))
})

const markMessageRead = createServerFn({ method: 'POST' })
	.inputValidator((id: string) => id)
	.handler(async ({ data: id }) => {
		const request = getRequest()
		const session = await auth.api.getSession({ headers: request.headers })
		if (!session) throw new Error('Unauthorized')
		await prisma.contactMessage.update({
			where: { id },
			data: { read: true },
		})
	})

const changePassword = createServerFn({ method: 'POST' })
	.inputValidator((data: { currentPassword: string; newPassword: string }) => data)
	.handler(async ({ data }) => {
		const request = getRequest()
		const session = await auth.api.getSession({ headers: request.headers })
		if (!session) throw new Error('Unauthorized')

		const account = await prisma.account.findFirst({
			where: { userId: session.user.id, providerId: 'credential' },
		})
		if (!account?.password) throw new Error('No password account found')

		const [salt, storedKey] = account.password.split(':')
		const attempt = scryptSync(data.currentPassword.normalize('NFKC'), salt, 64, {
			N: 16384, r: 16, p: 1, maxmem: 128 * 16384 * 16 * 2,
		})
		if (attempt.toString('hex') !== storedKey) throw new Error('Forkert adgangskode')

		const newSalt = randomBytes(16).toString('hex')
		const newKey = scryptSync(data.newPassword.normalize('NFKC'), newSalt, 64, {
			N: 16384, r: 16, p: 1, maxmem: 128 * 16384 * 16 * 2,
		})
		await prisma.account.update({
			where: { id: account.id },
			data: { password: `${newSalt}:${newKey.toString('hex')}`, updatedAt: new Date() },
		})
	})

const docsPath = () => process.env.DOCUMENTS_PATH || '/documents'

const getDocuments = createServerFn().handler(async () => {
	const request = getRequest()
	const session = await auth.api.getSession({ headers: request.headers })
	if (!session) throw new Error('Unauthorized')
	try {
		const files = await readdir(docsPath())
		return files.filter((f) => f.endsWith('.pdf')).sort()
	} catch {
		return []
	}
})

const deleteDocument = createServerFn({ method: 'POST' })
	.inputValidator((filename: string) => filename)
	.handler(async ({ data: filename }) => {
		const request = getRequest()
		const session = await auth.api.getSession({ headers: request.headers })
		if (!session) throw new Error('Unauthorized')
		if (filename.includes('/') || filename.includes('..')) throw new Error('Invalid filename')
		await unlink(join(docsPath(), filename))
	})

const getExternalLinks = createServerFn().handler(async () => {
	const request = getRequest()
	const session = await auth.api.getSession({ headers: request.headers })
	if (!session) throw new Error('Unauthorized')
	return prisma.externalLink.findMany({ orderBy: { createdAt: 'desc' } })
})

const addExternalLink = createServerFn({ method: 'POST' })
	.inputValidator((data: { title: string; url: string }) => data)
	.handler(async ({ data }) => {
		const request = getRequest()
		const session = await auth.api.getSession({ headers: request.headers })
		if (!session) throw new Error('Unauthorized')
		await prisma.externalLink.create({ data })
	})

const deleteExternalLink = createServerFn({ method: 'POST' })
	.inputValidator((id: string) => id)
	.handler(async ({ data: id }) => {
		const request = getRequest()
		const session = await auth.api.getSession({ headers: request.headers })
		if (!session) throw new Error('Unauthorized')
		await prisma.externalLink.delete({ where: { id } })
	})

const deleteMessage = createServerFn({ method: 'POST' })
	.inputValidator((id: string) => id)
	.handler(async ({ data: id }) => {
		const request = getRequest()
		const session = await auth.api.getSession({ headers: request.headers })
		if (!session) throw new Error('Unauthorized')
		await prisma.contactMessage.delete({ where: { id } })
	})

export const Route = createFileRoute('/admin')({
	beforeLoad: async () => {
		const session = await getSession()
		if (!session) {
			throw redirect({ to: '/login' })
		}
		return { session }
	},
	loader: async () => {
		const [messages, documents, externalLinks] = await Promise.all([
			getMessages(),
			getDocuments(),
			getExternalLinks(),
		])
		return { messages, documents, externalLinks }
	},
	component: AdminPage,
})

type Tab = 'dashboard' | 'messages' | 'documents'

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']

function formatDateTime(iso: string) {
	const d = new Date(iso)
	const day = d.getDate()
	const month = MONTHS[d.getMonth()]
	const year = d.getFullYear()
	const h = String(d.getHours()).padStart(2, '0')
	const m = String(d.getMinutes()).padStart(2, '0')
	return `${day}. ${month} ${year}, ${h}:${m}`
}

function AdminPage() {
	const { session } = Route.useRouteContext()
	const { messages: initialMessages, documents: initialDocuments, externalLinks: initialLinks } = Route.useLoaderData()
	const router = useRouter()
	const [tab, setTab] = useState<Tab>('dashboard')
	const [expandedId, setExpandedId] = useState<string | null>(null)
	const [localReadIds, setLocalReadIds] = useState<Set<string>>(new Set())
	const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())
	const [deletedDocs, setDeletedDocs] = useState<Set<string>>(new Set())
	const [copiedEmail, setCopiedEmail] = useState<string | null>(null)

	const handleSignOut = async () => {
		await authClient.signOut()
		await router.navigate({ to: '/login' })
	}

	const handleToggleMessage = async (id: string, alreadyRead: boolean) => {
		if (expandedId === id) {
			setExpandedId(null)
			return
		}
		setExpandedId(id)
		if (!alreadyRead && !localReadIds.has(id)) {
			setLocalReadIds((prev) => new Set(prev).add(id))
			await markMessageRead({ data: id })
		}
	}

	const handleDelete = async (e: React.MouseEvent, id: string) => {
		e.stopPropagation()
		setDeletedIds((prev) => new Set(prev).add(id))
		if (expandedId === id) setExpandedId(null)
		await deleteMessage({ data: id })
	}

	const handleCopyEmail = (e: React.MouseEvent, email: string) => {
		e.stopPropagation()
		navigator.clipboard.writeText(email)
		setCopiedEmail(email)
		setTimeout(() => setCopiedEmail(null), 2000)
	}

	const messages = initialMessages.filter((m) => !deletedIds.has(m.id))
	const unreadCount = messages.filter(
		(m) => !m.read && !localReadIds.has(m.id),
	).length

	return (
		<main className="mx-auto max-w-3xl px-6 py-32 md:px-12">
			<div className="mb-10 flex items-center justify-between">
				<div>
					<p className="mb-1 font-mono text-xs tracking-widest text-[var(--sea-ink-soft)] uppercase">
						Administration
					</p>
					<h1 className="text-4xl font-bold text-[var(--sea-ink)]">
						Dashboard
					</h1>
				</div>
				<button
					type="button"
					onClick={handleSignOut}
					className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary"
				>
					Log ud
				</button>
			</div>

			<div className="mb-8 flex gap-1 border-b border-border">
				<TabButton
					active={tab === 'dashboard'}
					onClick={() => setTab('dashboard')}
				>
					Dashboard
				</TabButton>
				<TabButton
					active={tab === 'messages'}
					onClick={() => setTab('messages')}
				>
					<span>Beskeder</span>
					{unreadCount > 0 && (
						<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
							{unreadCount}
						</span>
					)}
				</TabButton>
				<TabButton
					active={tab === 'documents'}
					onClick={() => setTab('documents')}
				>
					Dokumenter
				</TabButton>
			</div>

			{tab === 'dashboard' && (
				<div className="flex flex-col gap-6">
					<div className="rounded-xl border border-border bg-secondary/20 p-6">
						<p className="mb-1 text-xs font-mono text-[var(--sea-ink-soft)] uppercase tracking-widest">
							Logget ind som
						</p>
						<p className="text-lg font-semibold text-[var(--sea-ink)]">
							{session.user.name}
						</p>
						<p className="text-sm text-muted-foreground">
							{session.user.email}
						</p>
					</div>
					<ChangePasswordForm />
				</div>
			)}

			{tab === 'messages' && (
				<div className="rounded-xl border border-border overflow-hidden">
					{messages.length === 0 ? (
						<p className="py-12 text-center text-sm text-muted-foreground">
							Ingen beskeder endnu.
						</p>
					) : (
						<ul className="flex flex-col divide-y divide-border/40">
							{messages.map((msg) => {
								const isRead =
									msg.read || localReadIds.has(msg.id)
								const isExpanded = expandedId === msg.id
								return (
									<li key={msg.id}>
										<div
											role="button"
											tabIndex={0}
											onClick={() => handleToggleMessage(msg.id, msg.read)}
											onKeyDown={(e) => e.key === 'Enter' && handleToggleMessage(msg.id, msg.read)}
											className="w-full px-5 py-4 text-left hover:bg-secondary/30 transition-colors cursor-pointer"
										>
											<div className="flex items-start justify-between gap-4">
												<div className="flex items-center gap-3 min-w-0">
													<span
														className={`h-2 w-2 shrink-0 rounded-full mt-1 ${!isRead ? 'bg-primary' : 'bg-transparent'}`}
													/>
													<div className="min-w-0">
														<p
															className={`text-sm font-semibold truncate ${!isRead ? 'text-[var(--sea-ink)]' : 'text-muted-foreground'}`}
														>
															{msg.name}
														</p>
														<button
															type="button"
															onClick={(e) => handleCopyEmail(e, msg.email)}
															className="text-xs text-muted-foreground hover:text-primary transition-colors"
															title="Kopiér e-mail"
														>
															{copiedEmail === msg.email ? 'Kopieret!' : msg.email}
														</button>
													</div>
												</div>
												<div className="flex items-center gap-3 shrink-0">
													<p suppressHydrationWarning className="text-xs text-muted-foreground">
														{formatDateTime(msg.createdAt)}
													</p>
													<button
														type="button"
														onClick={(e) => handleDelete(e, msg.id)}
														className="text-muted-foreground/50 hover:text-destructive transition-colors"
														title="Slet besked"
													>
														<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
															<path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
														</svg>
													</button>
												</div>
											</div>
											{!isExpanded && (
												<p className="mt-2 ml-5 text-xs text-muted-foreground line-clamp-1 pl-2">
													{msg.message}
												</p>
											)}
										</div>
										{isExpanded && (
											<div className="px-5 pb-5 pl-[3.25rem]">
												<p className="text-sm text-[var(--sea-ink)] whitespace-pre-wrap leading-relaxed">
													{msg.message}
												</p>
											</div>
										)}
									</li>
								)
							})}
						</ul>
					)}
				</div>
			)}

			{tab === 'documents' && (
				<DocumentsTab
					initialDocuments={initialDocuments}
					deletedDocs={deletedDocs}
					onDelete={async (filename) => {
						setDeletedDocs((prev) => new Set(prev).add(filename))
						await deleteDocument({ data: filename })
					}}
					onUploaded={() => router.invalidate()}
					initialLinks={initialLinks}
					onLinkAdded={() => router.invalidate()}
					onLinkDeleted={(id) => deleteExternalLink({ data: id })}
				/>
			)}
		</main>
	)
}

type ExternalLink = { id: string; title: string; url: string; createdAt: Date }

function DocumentsTab({
	initialDocuments,
	deletedDocs,
	onDelete,
	onUploaded,
	initialLinks,
	onLinkAdded,
	onLinkDeleted,
}: {
	initialDocuments: string[]
	deletedDocs: Set<string>
	onDelete: (filename: string) => void
	onUploaded: () => void
	initialLinks: ExternalLink[]
	onLinkAdded: () => void
	onLinkDeleted: (id: string) => void
}) {
	const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
	const [linkStatus, setLinkStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
	const [deletedLinkIds, setDeletedLinkIds] = useState<Set<string>>(new Set())

	const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const form = e.currentTarget
		const fd = new FormData(form)
		const file = fd.get('file') as File | null
		if (!file || file.size === 0) return
		setUploadStatus('loading')
		try {
			const res = await fetch('/api/upload', { method: 'POST', body: fd })
			if (!res.ok) throw new Error()
			setUploadStatus('success')
			form.reset()
			onUploaded()
		} catch {
			setUploadStatus('error')
		}
	}

	const handleAddLink = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const form = e.currentTarget
		const fd = new FormData(form)
		const title = (fd.get('title') as string).trim()
		const url = (fd.get('url') as string).trim()
		if (!title || !url) return
		setLinkStatus('loading')
		try {
			await addExternalLink({ data: { title, url } })
			setLinkStatus('success')
			form.reset()
			onLinkAdded()
		} catch {
			setLinkStatus('error')
		}
	}

	const handleDeleteLink = async (id: string) => {
		setDeletedLinkIds((prev) => new Set(prev).add(id))
		await onLinkDeleted(id)
	}

	const documents = initialDocuments.filter((f) => !deletedDocs.has(f))
	const links = initialLinks.filter((l) => !deletedLinkIds.has(l.id))

	return (
		<div className="flex flex-col gap-10">
			{/* Egne udgivelser */}
			<div className="flex flex-col gap-4">
				<p className="font-mono text-xs tracking-widest text-[var(--sea-ink-soft)] uppercase">Egne udgivelser</p>

				<div className="rounded-xl border border-border p-6">
					<p className="mb-4 text-xs font-medium text-[var(--sea-ink)]">Upload PDF</p>
					<form onSubmit={handleUpload} className="flex flex-col gap-4">
						<input
							name="file"
							type="file"
							accept=".pdf"
							required
							className="text-sm text-[var(--sea-ink)] file:mr-4 file:rounded-lg file:border-0 file:bg-secondary file:px-4 file:py-2 file:text-sm file:font-medium file:text-[var(--sea-ink)] hover:file:bg-secondary/80"
						/>
						{uploadStatus === 'error' && <p className="text-sm text-destructive">Upload fejlede. Prøv igen.</p>}
						{uploadStatus === 'success' && <p className="text-sm text-green-600 dark:text-green-400">Fil uploadet.</p>}
						<button
							type="submit"
							disabled={uploadStatus === 'loading'}
							className="self-start rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
						>
							{uploadStatus === 'loading' ? 'Uploader...' : 'Upload'}
						</button>
					</form>
				</div>

				<div className="rounded-xl border border-border overflow-hidden">
					{documents.length === 0 ? (
						<p className="py-8 text-center text-sm text-muted-foreground">Ingen dokumenter endnu.</p>
					) : (
						<ul className="flex flex-col divide-y divide-border/40">
							{documents.map((file, i) => (
								<li key={file} className="flex items-center gap-4 px-5 py-4">
									<span className="font-mono text-xs text-muted-foreground w-5 shrink-0">
										{String(i + 1).padStart(2, '0')}
									</span>
									<span className="flex-1 text-sm text-[var(--sea-ink)] truncate">
										{file.replace(/_/g, ' ').replace(/\.pdf$/i, '')}
									</span>
									<a href={`/documents/${file}`} target="_blank" rel="noreferrer" className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors">PDF</a>
									<button type="button" onClick={() => onDelete(file)} className="text-muted-foreground/50 hover:text-destructive transition-colors" title="Slet">
										<TrashIcon />
									</button>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>

			{/* Andre relevante udgivelser */}
			<div className="flex flex-col gap-4">
				<p className="font-mono text-xs tracking-widest text-[var(--sea-ink-soft)] uppercase">Andre relevante udgivelser</p>

				<div className="rounded-xl border border-border p-6">
					<p className="mb-4 text-xs font-medium text-[var(--sea-ink)]">Tilføj eksternt link</p>
					<form onSubmit={handleAddLink} className="flex flex-col gap-3">
						<input
							name="title"
							type="text"
							placeholder="Titel"
							required
							className="rounded-lg border border-border/50 bg-secondary/30 px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-secondary/60"
						/>
						<input
							name="url"
							type="url"
							placeholder="https://..."
							required
							className="rounded-lg border border-border/50 bg-secondary/30 px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-secondary/60"
						/>
						{linkStatus === 'error' && <p className="text-sm text-destructive">Noget gik galt. Prøv igen.</p>}
						{linkStatus === 'success' && <p className="text-sm text-green-600 dark:text-green-400">Link tilføjet.</p>}
						<button
							type="submit"
							disabled={linkStatus === 'loading'}
							className="self-start rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
						>
							{linkStatus === 'loading' ? 'Gemmer...' : 'Tilføj link'}
						</button>
					</form>
				</div>

				<div className="rounded-xl border border-border overflow-hidden">
					{links.length === 0 ? (
						<p className="py-8 text-center text-sm text-muted-foreground">Ingen eksterne links endnu.</p>
					) : (
						<ul className="flex flex-col divide-y divide-border/40">
							{links.map((link, i) => (
								<li key={link.id} className="flex items-center gap-4 px-5 py-4">
									<span className="font-mono text-xs text-muted-foreground w-5 shrink-0">
										{String(i + 1).padStart(2, '0')}
									</span>
									<span className="flex-1 text-sm text-[var(--sea-ink)] truncate">{link.title}</span>
									<a href={link.url} target="_blank" rel="noreferrer" className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors truncate max-w-[160px]">{link.url}</a>
									<button type="button" onClick={() => handleDeleteLink(link.id)} className="text-muted-foreground/50 hover:text-destructive transition-colors" title="Slet">
										<TrashIcon />
									</button>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</div>
	)
}

function TrashIcon() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
		</svg>
	)
}

function ChangePasswordForm() {
	const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
	const [errorMsg, setErrorMsg] = useState('')

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const form = e.currentTarget
		const fd = new FormData(form)
		const currentPassword = fd.get('currentPassword') as string
		const newPassword = fd.get('newPassword') as string
		const confirmPassword = fd.get('confirmPassword') as string
		if (newPassword !== confirmPassword) {
			setErrorMsg('Adgangskoderne stemmer ikke overens')
			setStatus('error')
			return
		}
		setStatus('loading')
		setErrorMsg('')
		try {
			await changePassword({ data: { currentPassword, newPassword } })
			setStatus('success')
			form.reset()
		} catch (err) {
			setErrorMsg(err instanceof Error ? err.message : 'Noget gik galt')
			setStatus('error')
		}
	}

	return (
		<div className="rounded-xl border border-border p-6">
			<p className="mb-4 text-xs font-mono text-[var(--sea-ink-soft)] uppercase tracking-widest">
				Skift adgangskode
			</p>
			<form onSubmit={handleSubmit} className="flex flex-col gap-4">
				<div className="flex flex-col gap-1.5">
					<label className="text-sm font-medium text-[var(--sea-ink)]" htmlFor="currentPassword">
						Nuværende adgangskode
					</label>
					<input
						id="currentPassword"
						name="currentPassword"
						type="password"
						required
						className="rounded-lg border border-border/50 bg-secondary/30 px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:bg-secondary/60"
					/>
				</div>
				<div className="flex flex-col gap-1.5">
					<label className="text-sm font-medium text-[var(--sea-ink)]" htmlFor="newPassword">
						Ny adgangskode
					</label>
					<input
						id="newPassword"
						name="newPassword"
						type="password"
						required
						minLength={8}
						className="rounded-lg border border-border/50 bg-secondary/30 px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:bg-secondary/60"
					/>
				</div>
				<div className="flex flex-col gap-1.5">
					<label className="text-sm font-medium text-[var(--sea-ink)]" htmlFor="confirmPassword">
						Bekræft ny adgangskode
					</label>
					<input
						id="confirmPassword"
						name="confirmPassword"
						type="password"
						required
						minLength={8}
						className="rounded-lg border border-border/50 bg-secondary/30 px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:bg-secondary/60"
					/>
				</div>
				{status === 'error' && (
					<p className="text-sm text-destructive">{errorMsg || 'Noget gik galt'}</p>
				)}
				{status === 'success' && (
					<p className="text-sm text-green-600 dark:text-green-400">Adgangskode opdateret.</p>
				)}
				<button
					type="submit"
					disabled={status === 'loading'}
					className="self-start rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
				>
					{status === 'loading' ? 'Gemmer...' : 'Gem adgangskode'}
				</button>
			</form>
		</div>
	)
}

function TabButton({
	active,
	onClick,
	children,
}: {
	active: boolean
	onClick: () => void
	children: React.ReactNode
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${active
					? 'border-primary text-[var(--sea-ink)]'
					: 'border-transparent text-muted-foreground hover:text-[var(--sea-ink)]'
				}`}
		>
			{children}
		</button>
	)
}
