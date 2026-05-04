import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({ component: Home })

function Home() {
	return (
		<main className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 text-center">
			<h1 className="mb-4 text-5xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-6xl">
				Under Construction
			</h1>
			<p className="max-w-md text-base text-[var(--sea-ink-soft)] sm:text-lg">
				Something is being built here. Check back soon.
			</p>
		</main>
	)
}
