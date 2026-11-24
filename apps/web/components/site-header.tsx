"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SlidersHorizontal } from "lucide-react"
import { DavinciUILogo } from "@/components/logos/davinci-ui-logo"
import { CommandMenu } from "@/components/command-menu"
import { GitHubButton } from "@/components/github-button"
import { landingGutterClass } from "@/components/landing/landing-frame"
import { ThemeToggle } from "@/components/theme-toggle"
import { useDocStore } from "@/hooks/use-doc-store"
import { cn } from "@/lib/utils"

interface SiteHeaderProps {
    sidebarToggle?: React.ReactNode
    /** Kept for existing call sites; the header rail stays consistent across pages. */
    landingGutter?: boolean
}

export function SiteHeader({ sidebarToggle, landingGutter }: SiteHeaderProps) {
    const pathname = usePathname()
    const [mobileNavOpen, setMobileNavOpen] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)

    // Personalize entry point: a docs preview registers its playground
    // panel in the doc store; the header jumps to the inline panel.
    const personalizeContent = useDocStore((state) => state.personalizeContent)
    const hasPersonalize = personalizeContent != null
    const scrollToPersonalize = React.useCallback(() => {
        const target = document.getElementById("controls")
        if (!target) return
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        const lenis = (window as Window & { __lenis?: { scrollTo: (target: number | string | HTMLElement, options?: { offset?: number; immediate?: boolean; force?: boolean }) => void; stop: () => void; start: () => void } }).__lenis
        if (lenis) {
            lenis.scrollTo(target, { offset: -88, immediate: reduceMotion, force: true })
            return
        }
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" })
    }, [])

    React.useEffect(() => {
        setMobileNavOpen(false)
    }, [pathname])

    React.useEffect(() => {
        const updateScrolledState = () => {
            setIsScrolled(window.scrollY > 8)
        }

        updateScrolledState()
        window.addEventListener("scroll", updateScrolledState, { passive: true })

        return () => {
            window.removeEventListener("scroll", updateScrolledState)
        }
    }, [])

    const isDesignSystemActive =
        pathname.startsWith("/design-system") ||
        pathname.startsWith("/docs/foundations") ||
        pathname.startsWith("/docs/tokens") ||
        pathname.startsWith("/docs/theming") ||
        pathname.startsWith("/docs/primitives") ||
        pathname === "/docs" ||
        pathname.startsWith("/docs/installation") ||
        pathname.startsWith("/docs/quick-start") ||
        pathname.startsWith("/docs/configuration")
    const isExperienceActive =
        pathname.startsWith("/experience") ||
        pathname.startsWith("/blocks") ||
        pathname.startsWith("/docs/components") ||
        pathname.startsWith("/docs/premium") ||
        pathname.startsWith("/docs/motion") ||
        pathname.startsWith("/docs/scroll") ||
        pathname.startsWith("/docs/registry")

    const isDocsActive = pathname === "/docs" || pathname.startsWith("/docs/installation") || pathname.startsWith("/docs/configuration") || pathname.startsWith("/docs/components-json") || pathname.startsWith("/docs/theming") || pathname.startsWith("/docs/cli") || pathname.startsWith("/docs/monorepo") || pathname.startsWith("/docs/changelog")

    const navItems = [
        { href: "/docs", label: "Docs", active: isDocsActive },
        { href: "/experience/components", label: "Components", active: isExperienceActive },
        { href: "/design-system", label: "Design System", active: isDesignSystemActive },
        { href: "/blocks", label: "Blocks", active: pathname.startsWith("/blocks") || pathname.startsWith("/experience/blocks") },
        { href: "/docs/mcp", label: "MCP", active: pathname.startsWith("/docs/mcp") },
    ] as const

    return (
        <header
            data-site-header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 w-full transition-[background-color,border-color] duration-200",
                landingGutter
                    ? isScrolled
                        ? "border-b border-line bg-background/95 backdrop-blur-md"
                        : "border-b border-transparent bg-transparent"
                    : "border-b border-line bg-background"
            )}
        >
            <div
                className={cn(
                    "h-18 w-full",
                    landingGutterClass
                )}
            >
                <div className="mx-auto flex h-full w-full max-w-[1360px] items-center">
                <div className="flex flex-1 items-center gap-1.5">
                    {sidebarToggle && (
                        <div className="md:hidden">
                            {sidebarToggle}
                        </div>
                    )}
                    <Link
                        href="/"
                        className="group inline-flex h-10 items-center gap-2 rounded-md px-1 transition-colors duration-200 hover:bg-muted/60 dark:hover:bg-muted/40"
                    >
                        <DavinciUILogo className="size-8 shrink-0 transition-opacity group-hover:opacity-80" />
                        <span className="translate-y-[2px] text-xl font-semibold tracking-tight text-foreground">DAVINCIUI</span>
                    </Link>
                    <nav className="hidden items-center gap-0.5 text-[15px] font-normal lg:flex">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={item.active ? "page" : undefined}
                                className={cn(
                                    "inline-flex h-10 items-center gap-1 whitespace-nowrap px-2 transition-[color,opacity] duration-200 ease-out",
                                    item.active
                                        ? "text-foreground"
                                        : "text-foreground/55 hover:text-foreground/80"
                                )}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="ml-auto flex items-center gap-1">
                    <CommandMenu />
                    <div className="hidden h-4 w-px bg-foreground/15 dark:bg-foreground/20 sm:block" />
                    <div className="flex items-center gap-1">
                        <GitHubButton />
                        <div className="hidden h-4 w-px bg-foreground/15 dark:bg-foreground/20 sm:block" />
                        <div className="hidden sm:block">
                            <ThemeToggle />
                        </div>
                        {hasPersonalize && (
                            <>
                                <div className="hidden h-4 w-px bg-foreground/15 dark:bg-foreground/20 sm:block" />
                                <button
                                    type="button"
                                    onClick={scrollToPersonalize}
                                    aria-label="Customize"
                                    title="Customize"
                                    className="hidden h-10 w-10 items-center justify-center rounded-lg border border-transparent transition-shadow hover:bg-accent sm:inline-flex"
                                >
                                    <SlidersHorizontal className="size-4 opacity-80" />
                                </button>
                            </>
                        )}
                        <div className="hidden h-4 w-px bg-foreground/15 dark:bg-foreground/20 sm:block" />
                        <Link
                            href="/docs/installation"
                            className="hidden h-10 items-center justify-center rounded-lg bg-foreground px-4 text-[15px] font-medium text-background transition-opacity hover:opacity-90 lg:inline-flex"
                        >
                            Get Started
                        </Link>
                        <button
                            type="button"
                            className="group relative flex size-11 touch-manipulation flex-col items-center justify-center gap-1 rounded-md border-none transition-colors active:scale-none aria-expanded:bg-accent lg:hidden"
                            aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
                            aria-expanded={mobileNavOpen}
                            onClick={() => setMobileNavOpen((open) => !open)}
                        >
                            <span
                                className={cn(
                                    "h-0.5 w-4 rounded-[1px] bg-foreground transition-transform",
                                    mobileNavOpen && "translate-y-[3px] rotate-45"
                                )}
                            />
                            <span
                                className={cn(
                                    "h-0.5 w-4 rounded-[1px] bg-foreground transition-transform",
                                    mobileNavOpen && "-translate-y-[3px] -rotate-45"
                                )}
                            />
                        </button>
                    </div>
                </div>
                </div>
            </div>
            {mobileNavOpen && (
                <div className="absolute right-4 top-[calc(100%+0.5rem)] z-50 flex w-60 origin-top-right flex-col gap-1 rounded-xl bg-popover p-1 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden lg:hidden dark:ring-foreground/20">
                    <nav className="flex flex-col" aria-label="Mobile navigation">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={item.active ? "page" : undefined}
                                className="flex items-center justify-between rounded-lg px-3 py-2 text-base aria-[current=page]:bg-accent"
                            >
                                <span>{item.label}</span>
                            </Link>
                        ))}
                        <div className="my-1 h-px bg-border" />
                        <div className="flex min-h-11 items-center justify-between px-3 text-base">
                            <span>Appearance</span>
                            <ThemeToggle className="h-11 w-11" />
                        </div>
                            {hasPersonalize && (
                            <button
                                type="button"
                                onClick={() => {
                                    setMobileNavOpen(false)
                                    scrollToPersonalize()
                                }}
                                className="flex items-center justify-between rounded-lg px-3 py-2 text-base"
                            >
                                <span>Customize</span>
                                <SlidersHorizontal className="size-4 opacity-60" />
                            </button>
                        )}
                        <Link
                            href="/docs/installation"
                            className="rounded-lg bg-foreground px-3 py-2 text-center text-base font-medium text-background"
                        >
                            Get Started
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    )
}
