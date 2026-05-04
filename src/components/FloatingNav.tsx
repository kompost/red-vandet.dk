import { Link, useLocation } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Home, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const NAV_ITEMS = [
    { label: 'Red Vandet', path: '/red-vandet' },
    { label: 'Kontakt', path: '/contact' },
    { label: 'Udgivelser', path: '/knowledge' },
]

export default function FloatingNav() {
    const [menuOpen, setMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const location = useLocation()

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 100)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => {
        setMenuOpen(false)
    }, [])

    return (
        <>
            <nav
                className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
            >
                <div className="flex items-center gap-1 px-2 py-2 rounded-full bg-background/70 backdrop-blur-xl border border-border/50 shadow-2xl shadow-black/40">
                    <Link
                        to="/"
                        className="flex items-center justify-center w-9 h-9 rounded-full text-primary hover:bg-secondary transition-colors"
                    >
                        <Home className="w-4 h-4" />
                    </Link>
                    <div className="hidden md:flex items-center gap-0.5">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`px-3 py-2 text-xs font-medium tracking-wide transition-colors rounded-full ${
                                    location.pathname === item.path
                                        ? 'text-primary-foreground bg-primary'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                    <button
                        type="submit"
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-secondary transition-colors"
                    >
                        {menuOpen ? (
                            <X className="w-4 h-4" />
                        ) : (
                            <Menu className="w-4 h-4" />
                        )}
                    </button>
                    {/* <Link
                        to="/members"
                        className="ml-1 px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
                    >
                        Bliv Medlem
                    </Link> */}
                </div>
            </nav>

            {/* Top nav visible before scroll */}
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'opacity-0 -translate-y-full pointer-events-none' : 'opacity-100 translate-y-0'}`}
            >
                <div className="flex items-center justify-between px-6 md:px-12 py-5">
                    <Link to="/" className="flex items-center gap-3">
                        <img
                            src="https://media.base44.com/images/public/69f75336e96bd4099e5fc9aa/f249384d3_LOGOREDVANDET.png"
                            alt="Red Vandet"
                            className="h-10 w-auto"
                        />
                    </Link>
                    <div className="flex items-center gap-6">
                        <div className="hidden lg:flex items-center gap-6">
                            {NAV_ITEMS.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className="text-sm text-foreground/70 hover:text-primary transition-colors font-medium"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                        <button
                            type="submit"
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full border border-border/50 hover:bg-secondary transition-colors"
                        >
                            {menuOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <Menu className="w-5 h-5" />
                            )}
                        </button>
                        {/* <Link
                            to="/members"
                            className="hidden sm:inline-flex px-5 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
                        >
                            Bliv Medlem
                        </Link> */}
                    </div>
                </div>
            </nav>

            {/* Full screen menu overlay */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-2xl flex flex-col"
                    >
                        <div className="flex items-center justify-between px-6 md:px-12 py-5">
                            <Link
                                to="/"
                                className="flex items-center gap-3"
                                onClick={() => setMenuOpen(false)}
                            >
                                <img
                                    src="https://media.base44.com/images/public/69f75336e96bd4099e5fc9aa/f249384d3_LOGOREDVANDET.png"
                                    alt="Red Vandet"
                                    className="h-10 w-auto"
                                />
                            </Link>
                            <button
                                type="submit"
                                onClick={() => setMenuOpen(false)}
                                className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center hover:bg-secondary transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {/* Root network lines */}
                        <svg
                            className="absolute inset-0 w-full h-full pointer-events-none opacity-10"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <title>Beskrivelse af ikonet</title>
                            <motion.line
                                x1="10%"
                                y1="0"
                                x2="30%"
                                y2="100%"
                                stroke="hsl(78 100% 50%)"
                                strokeWidth="0.5"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.5 }}
                            />
                            <motion.line
                                x1="50%"
                                y1="0"
                                x2="70%"
                                y2="100%"
                                stroke="hsl(78 100% 50%)"
                                strokeWidth="0.5"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.8, delay: 0.2 }}
                            />
                            <motion.line
                                x1="80%"
                                y1="0"
                                x2="20%"
                                y2="100%"
                                stroke="hsl(78 100% 50%)"
                                strokeWidth="0.5"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 2, delay: 0.4 }}
                            />
                            <motion.line
                                x1="90%"
                                y1="20%"
                                x2="10%"
                                y2="80%"
                                stroke="hsl(78 100% 50%)"
                                strokeWidth="0.3"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.6, delay: 0.6 }}
                            />
                        </svg>
                        <div className="flex-1 flex items-center justify-center relative z-10">
                            <div className="flex flex-col gap-2">
                                {NAV_ITEMS.map((item, i) => (
                                    <motion.div
                                        key={item.path}
                                        initial={{ opacity: 0, x: -40 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            delay: i * 0.08,
                                            duration: 0.4,
                                        }}
                                    >
                                        <Link
                                            to={item.path}
                                            onClick={() => setMenuOpen(false)}
                                            className="group flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-secondary/50 transition-colors"
                                        >
                                            <span className="font-mono text-xs text-muted-foreground">
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                            <span className="font-display text-3xl md:text-5xl font-medium text-foreground group-hover:text-primary transition-colors">
                                                {item.label}
                                            </span>
                                            <ArrowUpRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
