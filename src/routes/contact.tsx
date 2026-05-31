import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { prisma } from '#/db'

const submitContactMessage = createServerFn({ method: 'POST' })
	.inputValidator((data: { name: string; email: string; message: string }) => data)
	.handler(async ({ data }) => {
		await prisma.contactMessage.create({ data })
	})

export const Route = createFileRoute('/contact')({ component: Contact })

function Contact() {
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [message, setMessage] = useState('')
	const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!name.trim() || !email.trim() || !message.trim()) return
		setStatus('loading')
		try {
			await submitContactMessage({ data: { name: name.trim(), email: email.trim(), message: message.trim() } })
			setStatus('success')
		} catch {
			setStatus('error')
		}
	}

	return (
		<main className="mx-auto max-w-2xl px-6 py-32 md:px-12">
			<p className="mb-2 font-mono text-xs tracking-widest text-[var(--sea-ink-soft)] uppercase">Skriv til os</p>
			<h1 className="mb-10 text-5xl font-bold text-[var(--sea-ink)]">Kontakt</h1>

			{status === 'success' ? (
				<div className="rounded-xl border border-border bg-secondary/20 px-6 py-10 text-center">
					<p className="text-lg font-semibold text-[var(--sea-ink)]">Tak for din besked!</p>
					<p className="mt-2 text-sm text-muted-foreground">Vi vender tilbage hurtigst muligt.</p>
				</div>
			) : (
				<form className="flex flex-col gap-6" onSubmit={handleSubmit}>
					<div className="flex flex-col gap-2">
						<label className="text-sm font-medium text-[var(--sea-ink)]" htmlFor="name">Navn</label>
						<input
							id="name"
							type="text"
							placeholder="Dit navn"
							value={name}
							onChange={e => setName(e.target.value)}
							required
							className="rounded-xl border border-border/50 bg-secondary/30 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-secondary/60"
						/>
					</div>
					<div className="flex flex-col gap-2">
						<label className="text-sm font-medium text-[var(--sea-ink)]" htmlFor="email">E-mail</label>
						<input
							id="email"
							type="email"
							placeholder="din@email.dk"
							value={email}
							onChange={e => setEmail(e.target.value)}
							required
							className="rounded-xl border border-border/50 bg-secondary/30 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-secondary/60"
						/>
					</div>
					<div className="flex flex-col gap-2">
						<label className="text-sm font-medium text-[var(--sea-ink)]" htmlFor="message">Besked</label>
						<textarea
							id="message"
							rows={6}
							placeholder="Skriv din besked her..."
							value={message}
							onChange={e => setMessage(e.target.value)}
							required
							className="rounded-xl border border-border/50 bg-secondary/30 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-secondary/60 resize-none"
						/>
					</div>
					{status === 'error' && (
						<p className="text-sm text-destructive">Noget gik galt. Prøv igen.</p>
					)}
					<button
						type="submit"
						disabled={status === 'loading'}
						className="self-start rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
					>
						{status === 'loading' ? 'Sender...' : 'Send besked'}
					</button>
				</form>
			)}

			<div className="mt-20">
				<p className="mb-6 font-mono text-xs tracking-widest text-[var(--sea-ink-soft)] uppercase">Bestyrelsen</p>
				<ul className="flex flex-col divide-y divide-border/40">
					{[
						'Bo Asmus Kjeldgaard',
						'Jens Christian Refsgaard',
						'Jens Andersen',
						'Tommy Abraham Mostrup',
						'Stig Markager',
						'Ib Larsen',
						'Erik Arvin',
					].map((boardName, i) => (
						<li key={boardName} className="flex items-center gap-4 py-4">
							<span className="font-mono text-xs text-[var(--sea-ink-soft)] w-5 shrink-0">
								{String(i + 1).padStart(2, '0')}
							</span>
							<span className="text-lg font-medium text-[var(--sea-ink)]">{boardName}</span>
						</li>
					))}
				</ul>
			</div>
		</main>
	)
}
