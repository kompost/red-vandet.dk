import { useEffect, useRef, useState } from 'react'
import type { OutputData } from '@editorjs/editorjs'
import type { EditorContent } from './PageBlockRenderer'

const DEFAULT_DATA: OutputData = {
	blocks: [
		{ type: 'header', data: { text: 'Mission', level: 2 } },
		{
			type: 'paragraph',
			data: {
				text: 'Red Vandets mission er at sikre rent drikkevand og rent vand i Danmarks vandløb, søer og indre farvande. Vi arbejder for, at både nuværende og kommende generationer har adgang til rent vand og en sund natur.',
			},
		},
		{ type: 'header', data: { text: 'Vision', level: 2 } },
		{ type: 'paragraph', data: { text: 'Vi ønsker et Danmark, hvor:' } },
		{
			type: 'list',
			data: {
				style: 'unordered',
				meta: {},
				items: [
					{ content: 'grundvandet og drikkevandet er rent og beskyttet', meta: {}, items: [] },
					{ content: 'vandløb, søer, fjorde og have er i økologisk balance', meta: {}, items: [] },
					{ content: 'der er god plads til natur og biodiversiteten trives', meta: {}, items: [] },
					{ content: 'menneskelig aktivitet sker inden for naturens grænser', meta: {}, items: [] },
				],
			},
		},
		{ type: 'header', data: { text: 'Hvem er vi?', level: 2 } },
		{
			type: 'paragraph',
			data: {
				text: 'Red Vandet er en uafhængig, non-profit tænketank og forening bestående af fagfolk med bred erfaring inden for miljø, natur, vandforsyning, administration og landbrugsrelaterede produktionsformer. Vi arbejder ulønnet og på et fælles fagligt grundlag for at skabe langsigtede, bæredygtige løsninger for vand og natur i Danmark.',
			},
		},
		{ type: 'header', data: { text: 'Hvad vil vi?', level: 2 } },
		{
			type: 'paragraph',
			data: {
				text: 'Vi mener, at det nuværende konventionelle landbrug er ude af trit med det naturgrundlag, som erhvervet bygger på. Forurening af grundvand, drikkevand, vandløb, søer og indre farvande taler sit tydelige sprog. Samtidig er biodiversiteten under pres, arealer til natur for små, og naturens evne til at regenerere svækkes.',
			},
		},
		{
			type: 'paragraph',
			data: {
				text: 'Hertil kommer alvorlige problemer med dyrevelfærd og en række andre forhold, som efter vores vurdering er uacceptable for et moderne samfund.',
			},
		},
		{
			type: 'paragraph',
			data: {
				text: 'Landbruget er samtidig i vid udstrækning understøttet af offentlige støtteordninger. Når de samlede følgevirkninger på miljø, natur og samfund medregnes, er det vores vurdering, at den nuværende produktionsform ikke er bæredygtig – hverken økonomisk, miljømæssigt eller etisk.',
			},
		},
		{
			type: 'paragraph',
			data: {
				text: 'Vi mener derfor, at der ikke er nogen vej uden om en grundlæggende omstilling af landbruget, hvis vi skal sikre rent vand og en sund natur i Danmark.',
			},
		},
		{ type: 'paragraph', data: { text: '<b>Der er behov for nytænkning.</b>' } },
		{ type: 'paragraph', data: { text: 'Vi vil bidrage med:' } },
		{
			type: 'list',
			data: {
				style: 'unordered',
				meta: {},
				items: [
					{ content: 'fagligt funderede analyser', meta: {}, items: [] },
					{ content: 'konkrete forslag til ændringer', meta: {}, items: [] },
					{ content: 'hvidbøger, rapporter og artikler', meta: {}, items: [] },
					{ content: 'dialog med fagfolk, organisationer og beslutningstagere', meta: {}, items: [] },
				],
			},
		},
		{
			type: 'paragraph',
			data: {
				text: 'Som grundlag for vores arbejde har vi udarbejdet en hvidbog, der samler vores faglige ståsted og anbefalinger.',
			},
		},
	],
}

type Props = {
	initialData: EditorContent | null
	onSave: (data: OutputData) => Promise<void>
}

export function PageEditor({ initialData, onSave }: Props) {
	const holderRef = useRef<HTMLDivElement>(null)
	const editorRef = useRef<import('@editorjs/editorjs').default | null>(null)
	const [saveStatus, setSaveStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

	useEffect(() => {
		let destroyed = false
		let editorInstance: import('@editorjs/editorjs').default | null = null

		Promise.all([
			import('@editorjs/editorjs'),
			import('@editorjs/header'),
			import('@editorjs/list'),
		]).then(([{ default: EditorJS }, { default: Header }, { default: List }]) => {
			if (destroyed || !holderRef.current) return
			editorInstance = new EditorJS({
				holder: holderRef.current,
				tools: {
					header: {
						// biome-ignore lint/suspicious/noExplicitAny: editorjs tool class type
						class: Header as any,
						config: { levels: [2, 3], defaultLevel: 2 },
					},
					list: {
						// biome-ignore lint/suspicious/noExplicitAny: editorjs tool class type
						class: List as any,
						inlineToolbar: true,
						config: { defaultStyle: 'unordered' },
					},
				},
				data: (initialData as OutputData) ?? DEFAULT_DATA,
				placeholder: 'Begynd at skrive...',
			})
			editorRef.current = editorInstance
		})

		return () => {
			destroyed = true
			if (editorInstance) {
				editorInstance.isReady
					.then(() => editorInstance?.destroy())
					.catch(() => {})
				editorRef.current = null
			}
		}
	}, [])

	const handleSave = async () => {
		if (!editorRef.current) return
		setSaveStatus('loading')
		try {
			await editorRef.current.isReady
			const output = await editorRef.current.save()
			await onSave(output)
			setSaveStatus('success')
			setTimeout(() => setSaveStatus('idle'), 2000)
		} catch {
			setSaveStatus('error')
		}
	}

	return (
		<div className="flex flex-col gap-6">
			<div
				ref={holderRef}
				className="rounded-xl border border-border bg-secondary/10 px-6 py-4 min-h-[400px]"
			/>
			<div className="flex items-center gap-4">
				<button
					type="button"
					onClick={handleSave}
					disabled={saveStatus === 'loading'}
					className="self-start rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
				>
					{saveStatus === 'loading' ? 'Gemmer...' : 'Gem indhold'}
				</button>
				{saveStatus === 'success' && (
					<p className="text-sm text-green-600 dark:text-green-400">Gemt!</p>
				)}
				{saveStatus === 'error' && (
					<p className="text-sm text-destructive">Noget gik galt. Prøv igen.</p>
				)}
			</div>
		</div>
	)
}
