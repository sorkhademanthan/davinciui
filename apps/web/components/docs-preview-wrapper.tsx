"use client"

import * as React from "react"
import * as ReactDOM from "react-dom"
import { cn } from "@/lib/utils"
import { RotateCcw, Search, SlidersHorizontal, Check, Maximize, Minimize, CodeXml, Copy, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion, AnimatePresence, useDragControls, type PanInfo } from "framer-motion"
import { useDocStore } from "@/hooks/use-doc-store"
import { usePlaygroundStore } from "@/hooks/use-playground-store"
import { useInViewport } from "@/hooks/use-in-viewport"
import { useModalDialog } from "@/hooks/use-modal-dialog"
import { useIsDesktop } from "@/hooks/use-is-desktop"
import { getPreviewDefinition } from "@/lib/preview-contract"

const CommandMenu = React.lazy(() =>
  import("@/components/command-menu").then((mod) => ({ default: mod.CommandMenu }))
)

export interface VariantItem {
  title: string
  preview: React.ReactNode
  code?: string
  fullWidth?: boolean
}

interface DocsPreviewWrapperProps {
  children: React.ReactNode
  /** Registry slug — resolves the shared preview contract (height, scrolling, fullscreen). */
  slug?: string
  fullWidthPreview?: boolean
  scrollablePreview?: boolean
  unstyledPreview?: boolean
  personalizeContent?: React.ReactNode
  sourceCodeFilename?: string
  sourceCodeKey?: string
  variants?: VariantItem[]
  hideDefaultVariant?: boolean
}

interface FullscreenOrigin {
  top: number
  left: number
  width: number
  height: number
  borderRadius: string
}

function PreviewIconButton({
  children,
  onClick,
  label,
  active,
  expanded,
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  label: string
  active?: boolean
  expanded?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      // Visual box stays 32px; an invisible 6px halo on every side lifts the
      // effective touch target to 44px without changing toolbar density.
      className={cn(
        "relative inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors before:absolute before:-inset-1.5 before:content-[''] hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        active && "bg-accent text-accent-foreground",
        expanded && "hover:bg-accent",
        className,
      )}
    >
      {children}
    </button>
  )
}

const previewIconClass = "size-4"

function PreviewVariantTab({
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
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-md px-2.5 py-1 text-[13px] outline-none transition-colors",
        "focus-visible:ring-1 focus-visible:ring-ring",
        active
          ? "bg-muted font-medium text-foreground"
          : "font-normal text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}

export function DocsPreviewWrapper({
  children,
  slug,
  fullWidthPreview,
  scrollablePreview,
  unstyledPreview = false,
  personalizeContent,
  sourceCodeFilename,
  sourceCodeKey,
  variants = [],
  hideDefaultVariant = false,
}: DocsPreviewWrapperProps) {
  // Shared preview contract: explicit props win, the per-slug definition
  // fills the rest, historical behavior is the fallback.
  const previewDef = slug ? getPreviewDefinition(slug) : null
  const effectiveScrollable = scrollablePreview ?? previewDef?.scrollable ?? false
  const fullscreenAllowed = previewDef?.fullscreen ?? true
  // Capability-gated universal controls. Search + theme also collapse on
  // small screens, where the site header already offers both — this keeps
  // four thumb-friendly actions in the bar instead of six.
  const showSearch = previewDef?.controls.search ?? true
  const showReload = previewDef?.controls.reload ?? true
  const showTheme = previewDef?.controls.theme ?? true
  const [key, setKey] = React.useState(0)
  const [showSource, setShowSource] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [isExpanded, setIsExpanded] = React.useState(false)
  const isDesktop = useIsDesktop()
  const [sourceHtml, setSourceHtml] = React.useState<string | null>(null)
  const [sourceCode, setSourceCode] = React.useState("")
  const [isSourceLoading, setIsSourceLoading] = React.useState(false)
  const [sourceLoadError, setSourceLoadError] = React.useState<string | null>(null)
  const [activeVariant, setActiveVariant] = React.useState(
    hideDefaultVariant && variants.length > 0 ? 0 : -1
  ) // -1 = default preview
  const sourceDragControls = useDragControls()
  const previewRef = React.useRef<HTMLDivElement>(null)
  const sourceDialogRef = React.useRef<HTMLDivElement | null>(null)
  // Pause heavy main previews far offscreen (canvases, loops, autoplay stop
  // with the unmount; toolbar/tabs/shell stay). Fullscreen and audio
  // surfaces are exempt; slug-less wrappers (examples) are gated outside.
  const { ref: viewportRef, inView: contentNearViewport } = useInViewport({
    rootMargin: "300px 0px",
  })
  const showPreviewContent =
    isExpanded || !previewDef?.unmountOffscreen || contentNearViewport
  const closeSource = React.useCallback(() => setShowSource(false), [])
  useModalDialog(showSource, {
    dialogRef: sourceDialogRef,
    onClose: closeSource,
  })
  const fullscreenOriginRef = React.useRef<FullscreenOrigin | null>(null)
  const fullscreenAnimationRef = React.useRef<Animation | null>(null)

  const resolvedActiveVariant =
    hideDefaultVariant && variants.length > 0 && activeVariant === -1
      ? 0
      : activeVariant

  const { setActiveVariantIndex, personalizeOpen, setPersonalizeOpen } = useDocStore()

  // Sync state with store — but only when this wrapper actually owns variant
  // selection. Example wrappers render with no variants (hideDefaultVariant);
  // letting them publish index 0 would hijack the shared Usage tabs and show
  // variant code while the main preview shows the default.
  React.useEffect(() => {
    if (variants.length === 0) return
    setActiveVariantIndex(resolvedActiveVariant)
  }, [resolvedActiveVariant, setActiveVariantIndex, variants.length])

  // Note: drawer rendering + registration live in the page-owned
  // PersonalizeController (one portal per page). Wrappers only read the
  // shared open state for their toolbar pill.

  const hasSourceCode = Boolean(sourceCodeKey)

  const clearFullscreenAnimation = React.useCallback(() => {
    const animation = fullscreenAnimationRef.current
    if (!animation) return
    fullscreenAnimationRef.current = null
    animation.cancel()
    if (previewRef.current) previewRef.current.style.willChange = ""
  }, [])

  const getOriginTransform = React.useCallback((origin: FullscreenOrigin) => {
    const preview = previewRef.current
    if (!preview) return "none"
    const target = preview.getBoundingClientRect()
    const scaleX = origin.width / Math.max(target.width, 1)
    const scaleY = origin.height / Math.max(target.height, 1)
    return `translate3d(${origin.left - target.left}px, ${origin.top - target.top}px, 0) scale(${scaleX}, ${scaleY})`
  }, [])

  const expandFullscreen = React.useCallback(() => {
    const preview = previewRef.current
    if (!preview || isExpanded) return

    const rect = preview.getBoundingClientRect()
    const origin: FullscreenOrigin = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      borderRadius: window.getComputedStyle(preview).borderRadius,
    }
    fullscreenOriginRef.current = origin
    clearFullscreenAnimation()

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsExpanded(true)
      return
    }

    ReactDOM.flushSync(() => setIsExpanded(true))
    const expandedPreview = previewRef.current
    if (!expandedPreview) return

    expandedPreview.style.willChange = "transform, border-radius, box-shadow"
    const animation = expandedPreview.animate(
      [
        {
          transform: getOriginTransform(origin),
          transformOrigin: "top left",
          borderRadius: origin.borderRadius,
          boxShadow: "0 10px 36px rgb(0 0 0 / 0.12)",
        },
        {
          transform: "translate3d(0, 0, 0) scale(1)",
          transformOrigin: "top left",
          borderRadius: "0px",
          boxShadow: "0 0 0 rgb(0 0 0 / 0)",
        },
      ],
      {
        duration: 420,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "both",
      },
    )
    fullscreenAnimationRef.current = animation
    void animation.finished.then(() => {
      if (fullscreenAnimationRef.current !== animation) return
      fullscreenAnimationRef.current = null
      animation.cancel()
      expandedPreview.style.willChange = ""
    }).catch(() => {})
  }, [clearFullscreenAnimation, getOriginTransform, isExpanded])

  const collapseFullscreen = React.useCallback(() => {
    const preview = previewRef.current
    const origin = fullscreenOriginRef.current
    if (!preview || !isExpanded) return

    clearFullscreenAnimation()
    if (!origin || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsExpanded(false)
      return
    }

    preview.style.willChange = "transform, border-radius, box-shadow"
    const animation = preview.animate(
      [
        {
          transform: "translate3d(0, 0, 0) scale(1)",
          transformOrigin: "top left",
          borderRadius: "0px",
          boxShadow: "0 0 0 rgb(0 0 0 / 0)",
        },
        {
          transform: getOriginTransform(origin),
          transformOrigin: "top left",
          borderRadius: origin.borderRadius,
          boxShadow: "0 10px 36px rgb(0 0 0 / 0.12)",
        },
      ],
      {
        duration: 320,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        fill: "both",
      },
    )
    fullscreenAnimationRef.current = animation
    void animation.finished.then(() => {
      if (fullscreenAnimationRef.current !== animation) return
      ReactDOM.flushSync(() => setIsExpanded(false))
      fullscreenAnimationRef.current = null
      animation.cancel()
      preview.style.willChange = ""
    }).catch(() => {})
  }, [clearFullscreenAnimation, getOriginTransform, isExpanded])

  const selectVariant = React.useCallback((index: number) => {
    if (effectiveScrollable) {
      const scroller = previewRef.current?.querySelector<HTMLElement>(
        "[data-preview-scroll-region]",
      )
      if (scroller) scroller.scrollTop = 0
    }
    setActiveVariant(index)
  }, [effectiveScrollable])

  const handleSourceOpen = React.useCallback(async () => {
    setPersonalizeOpen(false)
    if (isExpanded) {
      collapseFullscreen()
    }
    setShowSource(true)

    if (!sourceCodeKey || sourceHtml || isSourceLoading) {
      return
    }

    try {
      setIsSourceLoading(true)
      setSourceLoadError(null)
      const response = await fetch("/api/docs/source", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ component: sourceCodeKey }),
      })

      if (!response.ok) {
        throw new Error("Failed to load source code")
      }

      const data = (await response.json()) as { code?: string; html?: string }
      setSourceCode(data.code || "")
      setSourceHtml(data.html || "")
    } catch {
      setSourceLoadError("Unable to load source code right now.")
    } finally {
      setIsSourceLoading(false)
    }
  }, [collapseFullscreen, isExpanded, isSourceLoading, sourceCodeKey, sourceHtml, setPersonalizeOpen])

  const handleToggleExpanded = React.useCallback(() => {
    if (isExpanded) {
      collapseFullscreen()
      return
    }
    setShowSource(false)
    setPersonalizeOpen(false)
    expandFullscreen()
  }, [collapseFullscreen, expandFullscreen, isExpanded, setPersonalizeOpen])

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Fullscreen belongs to this preview. Preserve the surrounding page's exact
  // inline styles so exiting cannot overwrite state owned by another overlay.
  React.useEffect(() => {
    if (!isExpanded) return

    const header = document.querySelector<HTMLElement>("[data-site-header]")
    const previousHeaderDisplay = header?.style.display ?? ""
    const previousBodyOverflow = document.body.style.overflow

    if (header) header.style.display = "none"
    document.body.style.overflow = "hidden"

    return () => {
      if (header) header.style.display = previousHeaderDisplay
      document.body.style.overflow = previousBodyOverflow
    }
  }, [isExpanded])

  // Treat the expanded preview as a modal workspace: Escape closes it, Tab
  // remains inside it, and focus returns to the expansion trigger on exit.
  React.useEffect(() => {
    if (!isExpanded) return
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null

    const onKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement
      const activeOverlay = activeElement instanceof Element
        ? activeElement.closest('[role="dialog"], [role="menu"], [role="listbox"]')
        : null

      // Let a command menu or another portaled overlay above fullscreen own
      // its keyboard interaction until that overlay is dismissed.
      if (activeOverlay && activeOverlay !== previewRef.current && !previewRef.current?.contains(activeOverlay)) {
        return
      }

      if (event.key === "Escape") {
        event.preventDefault()
        collapseFullscreen()
        return
      }

      if (event.key !== "Tab" || !previewRef.current) return

      const focusable = Array.from(
        previewRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.getClientRects().length > 0 && element.getAttribute("aria-hidden") !== "true")

      if (focusable.length === 0) {
        event.preventDefault()
        previewRef.current.focus()
        return
      }

      const first = focusable[0]!
      const last = focusable[focusable.length - 1]!
      const active = document.activeElement

      if (event.shiftKey && (active === first || !previewRef.current.contains(active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || !previewRef.current.contains(active))) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown)

    return () => {
      document.removeEventListener("keydown", onKeyDown)
      previousFocus?.focus()
    }
  }, [collapseFullscreen, isExpanded])

  React.useEffect(() => clearFullscreenAnimation, [clearFullscreenAnimation])

  return (
    <div
      ref={previewRef}
      data-preview-expanded={isExpanded ? "true" : undefined}
      role={isExpanded ? "dialog" : undefined}
      aria-modal={isExpanded || undefined}
      aria-label={isExpanded ? "Fullscreen component preview" : undefined}
      tabIndex={isExpanded ? -1 : undefined}
      className={cn(
        "flex w-full flex-col overflow-hidden bg-background",
        isExpanded
          ? "fixed inset-0 z-40 h-dvh rounded-none border-0 pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]"
          : "relative h-full rounded-md border border-border",
      )}
    >
      {/* Toolbar — shadcn-style top bar: variant tabs left, actions right */}
      <div className="flex h-11 shrink-0 items-center gap-1 border-b border-border/60 px-2">
        <div
          role="tablist"
          aria-label="Preview variants"
          className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto no-scrollbar"
        >
          {!hideDefaultVariant && (
            <PreviewVariantTab
              active={resolvedActiveVariant === -1}
              onClick={() => selectVariant(-1)}
            >
              Default
            </PreviewVariantTab>
          )}

          {variants.map((variant, i) => (
            <PreviewVariantTab
              key={i}
              active={resolvedActiveVariant === i}
              onClick={() => selectVariant(i)}
            >
              {variant.title}
            </PreviewVariantTab>
          ))}
        </div>

        <div className="flex shrink-0 items-center" aria-label="Preview controls">
          {showSearch && (
          <React.Suspense
            fallback={
              <span className="hidden size-8 items-center justify-center text-muted-foreground/50 sm:inline-flex">
                <Search className="size-4" />
              </span>
            }
          >
            <CommandMenu
              trigger={
                <button
                  type="button"
                  aria-label="Search"
                  title="Search"
                  className="relative hidden size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors before:absolute before:-inset-1.5 before:content-[''] hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:inline-flex"
                >
                  <Search className="size-4" />
                </button>
              }
            />
          </React.Suspense>
          )}

          {hasSourceCode && (
            <PreviewIconButton
              onClick={handleSourceOpen}
              label="View Source"
              active={showSource}
            >
              <CodeXml className={previewIconClass} />
            </PreviewIconButton>
          )}

          {personalizeContent && (
            <PreviewIconButton
              onClick={() => {
                if (isExpanded) {
                  collapseFullscreen()
                }
                setPersonalizeOpen(true)
                setShowSource(false)
              }}
              label="Personalize"
              active={personalizeOpen}
            >
              <SlidersHorizontal className={previewIconClass} />
            </PreviewIconButton>
          )}

          {showReload && (
          <PreviewIconButton
            onClick={() => {
              // True reset: restore the component's defaults first so the
              // remount below renders pristine state (not surviving
              // personalization), then replay the preview subtree.
              if (slug) usePlaygroundStore.getState().resetPreview(slug)
              selectVariant(resolvedActiveVariant)
              setKey((k) => k + 1)
            }}
            label="Reload preview"
          >
            <RotateCcw className={previewIconClass} />
          </PreviewIconButton>
          )}

          {fullscreenAllowed && (
            <PreviewIconButton
              onClick={handleToggleExpanded}
              label={isExpanded ? "Collapse preview pane" : "Expand preview pane"}
              active={isExpanded}
            >
              {isExpanded ? <Minimize className={previewIconClass} /> : <Maximize className={previewIconClass} />}
            </PreviewIconButton>
          )}

          {showTheme && (
          <ThemeToggle className="relative hidden size-8 shrink-0 items-center justify-center rounded-md border-0 bg-transparent text-muted-foreground shadow-none transition-colors before:absolute before:-inset-1.5 before:content-[''] hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:inline-flex" />
          )}
        </div>
      </div>

      {/* The scrollable surface is opt-in per the preview contract. */}
      <div
        ref={viewportRef}
        className={cn(
        "flex w-full",
        unstyledPreview
          ? "bg-background"
          : "bg-muted/30 [background-image:radial-gradient(color-mix(in_oklab,var(--border)_55%,transparent)_1px,transparent_1px)] [background-size:20px_20px]",
        effectiveScrollable
          ? "min-h-0 flex-1 flex-col items-stretch overflow-x-hidden overflow-y-auto overscroll-contain"
          : "h-full overflow-hidden",
        !effectiveScrollable && !fullWidthPreview && "items-center justify-center"
      )}
        data-preview-scroll-region={effectiveScrollable ? "true" : undefined}
        role={effectiveScrollable ? "region" : undefined}
        aria-label={effectiveScrollable ? "Scrollable preview" : undefined}
        tabIndex={effectiveScrollable ? 0 : undefined}
      >
        <div
          className={cn(
            "w-full",
            effectiveScrollable
              ? "min-h-full"
              : (resolvedActiveVariant >= 0 && variants[resolvedActiveVariant]?.fullWidth) || fullWidthPreview
                ? "h-full"
                : "p-10 flex items-center justify-center"
          )}
        >
          <div
            key={key}
            className={cn(
              "w-full",
              effectiveScrollable ? "min-h-full" : "h-full",
              !effectiveScrollable && !fullWidthPreview && "flex items-center justify-center"
            )}
          >
            {showPreviewContent ? (
              resolvedActiveVariant === -1 ? children : variants[resolvedActiveVariant]?.preview
            ) : (
              <div data-lazy-placeholder aria-hidden="true" className="h-full w-full" />
            )}
          </div>
        </div>
      </div>

      {/* Personalize drawer is page-owned (PersonalizeController) — never
          rendered per-wrapper, so examples cannot spawn competing portals. */}

      {/* Source Code Panel Portal */}
      {mounted && ReactDOM.createPortal(
        <AnimatePresence>
          {showSource && (
            <>
              <motion.div
                aria-hidden="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={closeSource}
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] dark:bg-black/60"
              />

              <motion.div
                ref={sourceDialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="source-code-title"
                tabIndex={-1}
                initial={
                  isDesktop
                    ? { x: 40, opacity: 0 }
                    : { y: "100%", opacity: 1 }
                }
                animate={isDesktop ? { x: 0, opacity: 1 } : { y: 0, opacity: 1 }}
                exit={
                  isDesktop
                    ? { x: 40, opacity: 0 }
                    : { y: "100%", opacity: 1 }
                }
                transition={
                  isDesktop
                    ? { type: "spring", damping: 32, stiffness: 320 }
                    : { type: "spring", damping: 30, stiffness: 300 }
                }
                drag={isDesktop ? false : "y"}
                dragControls={sourceDragControls}
                dragListener={false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.4 }}
                onDragEnd={(_: unknown, info: PanInfo) => {
                  if (info.offset.y > 100 || info.velocity.y > 500) {
                    closeSource()
                  }
                }}
                className="fixed inset-x-0 bottom-0 z-50 flex h-[85svh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-background shadow-2xl outline-none lg:inset-y-4 lg:bottom-4 lg:left-auto lg:right-4 lg:h-auto lg:w-[min(860px,calc(100vw-2rem))] lg:rounded-2xl"
              >
                <div className="flex shrink-0 flex-col border-b border-border/70 bg-muted/20">
                  <div
                    className="flex touch-none items-center justify-center py-2 lg:hidden"
                    onPointerDown={(event) => sourceDragControls.start(event)}
                  >
                    <div className="h-1 w-10 rounded-full bg-muted-foreground/25 transition-colors hover:bg-muted-foreground/40" />
                  </div>

                  <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background text-muted-foreground shadow-sm">
                        <CodeXml className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h2
                            id="source-code-title"
                            className="text-sm font-semibold tracking-tight text-foreground"
                          >
                            Source code
                          </h2>
                          <span className="hidden rounded-full border border-border/70 bg-muted/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:inline-block">
                            tsx
                          </span>
                        </div>
                        {sourceCodeFilename && (
                          <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                            {sourceCodeFilename}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      {sourceCode && (
                        <button
                          type="button"
                          onClick={async () => {
                            await navigator.clipboard.writeText(sourceCode)
                            setCopied(true)
                            setTimeout(() => setCopied(false), 2000)
                          }}
                          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border/70 bg-background px-2.5 text-xs font-medium text-muted-foreground shadow-xs transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          aria-label={copied ? "Copied" : "Copy code"}
                        >
                          {copied ? (
                            <Check className="size-3.5" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
                          <span className="hidden sm:inline">
                            {copied ? "Copied" : "Copy"}
                          </span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={closeSource}
                        aria-label="Close source code panel"
                        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-auto overscroll-contain [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin]">
                  {isSourceLoading && (
                    <div
                      aria-live="polite"
                      className="flex h-full flex-col items-center justify-center gap-3 p-6 text-sm text-muted-foreground"
                    >
                      <span className="size-5 animate-spin rounded-full border-2 border-muted border-t-foreground/60" />
                      Loading source code…
                    </div>
                  )}
                  {!isSourceLoading && sourceLoadError && (
                    <div
                      role="alert"
                      className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground"
                    >
                      {sourceLoadError}
                    </div>
                  )}
                  {!isSourceLoading && !sourceLoadError && sourceHtml && (
                    <div
                      data-code-block
                      data-line-numbers="true"
                      className="relative w-full border-none bg-transparent text-[13px] leading-6 [&_.relative.group_>_button]:hidden [&_.shiki]:border-none [&_.shiki]:rounded-none [&_pre]:!px-0 [&_pre]:!py-4 [&_.shiki_[data-line]]:pl-4 [&_.shiki_[data-line]]:pr-6"
                      dangerouslySetInnerHTML={{ __html: sourceHtml }}
                    />
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
