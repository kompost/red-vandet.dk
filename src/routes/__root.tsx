import { TanStackDevtools } from '@tanstack/react-devtools'
import { createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import HorizonLine from '#/components/HorizonLine'
import Footer from '../components/Footer'
import Header from '../components/Header'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
    head: () => ({
        meta: [
            {
                charSet: 'utf-8',
            },
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1',
            },
            {
                title: 'Red Vandet!',
            },
        ],
        links: [
            {
                rel: 'stylesheet',
                href: appCss,
            },
            {
                rel: 'icon',
                type: 'image/svg+xml',
                href: '/favicon.svg',
            },
        ],
    }),
    shellComponent: RootDocument,
    notFoundComponent: NotFound,
})

function NotFound() {
    return (
        <main className="mx-auto max-w-2xl px-6 py-32 md:px-12 text-center">
            <p className="mb-2 font-mono text-xs tracking-widest text-[var(--sea-ink-soft)] uppercase">
                404
            </p>
            <h1 className="text-5xl font-bold text-[var(--sea-ink)]">
                Siden findes ikke
            </h1>
        </main>
    )
}

function RootDocument({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <HeadContent />
            </head>
            <body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)]">
                <HorizonLine />
                <Header />
                {children}
                <Footer />
                <TanStackDevtools
                    config={{
                        position: 'bottom-right',
                    }}
                    plugins={[
                        {
                            name: 'Tanstack Router',
                            render: <TanStackRouterDevtoolsPanel />,
                        },
                    ]}
                />
                <Scripts />
            </body>
        </html>
    )
}
