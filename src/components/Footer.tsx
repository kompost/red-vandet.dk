export default function Footer() {
	const year = new Date().getFullYear()

	return (
		<footer className="border-t border-[var(--line)] px-4 py-6 text-center text-sm text-[var(--sea-ink-soft)]">
			<p className="m-0">&copy; {year} red-vandet.dk</p>
		</footer>
	)
}
