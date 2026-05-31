import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
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
		return { messages: await getMessages() }
	},
	component: AdminPage,
})

type Tab = 'dashboard' | 'messages'

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
	const { messages: initialMessages } = Route.useLoaderData()
	const router = useRouter()
	const [tab, setTab] = useState<Tab>('dashboard')
	const [expandedId, setExpandedId] = useState<string | null>(null)
	const [localReadIds, setLocalReadIds] = useState<Set<string>>(new Set())
	const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())
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
			</div>

			{tab === 'dashboard' && (
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
		</main>
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
