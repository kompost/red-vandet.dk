type ParagraphBlock = { type: 'paragraph'; data: { text: string } }
type HeaderBlock = { type: 'header'; data: { text: string; level: number } }
type ListItemV2 = { content: string; meta?: unknown; items?: ListItemV2[] }
type ListBlock = { type: 'list'; data: { style: string; items: Array<string | ListItemV2> } }
type Block = ParagraphBlock | HeaderBlock | ListBlock | { type: string; data: unknown }

export type EditorContent = { blocks: Block[] }

function getItemText(item: string | ListItemV2): string {
	return typeof item === 'string' ? item : item.content
}

function groupBySections(blocks: Block[]): Block[][] {
	const sections: Block[][] = []
	let current: Block[] = []
	for (const block of blocks) {
		if (block.type === 'header' && current.length > 0) {
			sections.push(current)
			current = []
		}
		current.push(block)
	}
	if (current.length > 0) sections.push(current)
	return sections
}

function RenderBlock({ block }: { block: Block }) {
	if (block.type === 'header') {
		const b = block as HeaderBlock
		return (
			<h2
				className="mb-4 text-2xl font-semibold text-[var(--sea-ink)]"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: editor-managed content
				dangerouslySetInnerHTML={{ __html: b.data.text }}
			/>
		)
	}

	if (block.type === 'paragraph') {
		const b = block as ParagraphBlock
		return (
			<p
				className="text-[var(--sea-ink-soft)] leading-relaxed"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: editor-managed content
				dangerouslySetInnerHTML={{ __html: b.data.text }}
			/>
		)
	}

	if (block.type === 'list') {
		const b = block as ListBlock
		return (
			<ul className="flex flex-col gap-3">
				{b.data.items.map((item, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: stable list from editor output
					<li key={i} className="flex items-start gap-3">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span
							className="text-[var(--sea-ink-soft)] leading-relaxed"
							// biome-ignore lint/security/noDangerouslySetInnerHtml: editor-managed content
							dangerouslySetInnerHTML={{ __html: getItemText(item) }}
						/>
					</li>
				))}
			</ul>
		)
	}

	return null
}

export function PageBlockRenderer({ content }: { content: EditorContent }) {
	const sections = groupBySections(content.blocks)
	return (
		<>
			{sections.map((section, si) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: sections are positional
				<section key={si} className="mb-14">
					<div className="flex flex-col gap-4">
						{section.map((block, bi) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: blocks are positional
							<RenderBlock key={bi} block={block} />
						))}
					</div>
				</section>
			))}
		</>
	)
}
