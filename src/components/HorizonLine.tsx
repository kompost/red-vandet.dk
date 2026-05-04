import { useEffect, useState } from 'react'

export default function HorizonLine() {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY
            const docHeight =
                document.documentElement.scrollHeight - window.innerHeight
            setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0)
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className="fixed top-0 left-0 w-full z-[100] h-[2px] bg-border/30">
            <div
                className="h-full bg-primary transition-all duration-150 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    )
}
