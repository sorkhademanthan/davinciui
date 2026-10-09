"use client"

import * as React from "react"
import * as ReactDOM from "react-dom"
import { cn } from "@/lib/utils"
import { RotateCcw, Search, SlidersHorizontal, Check, Maximize, Minimize, CodeXml, ChevronLeft, Copy } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion, AnimatePresence, useDragControls, type PanInfo } from "framer-motion"
import { useDocStore } from "@/hooks/use-doc-store"
import { usePlaygroundStore } from "@/hooks/use-playground-store"
import { useInViewport } from "@/hooks/use-in-viewport"
import { useModalDialog } from "@/hooks/use-modal-dialog"
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

  const resolvedActiveVariant = hideDefaultVariant && activeVariant === -1 ? 0 : activeVariant

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
              Preview
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
            <motion.div
              ref={sourceDialogRef}
              role="dialog"
              aria-modal="true"
              aria-label="Source code"
              tabIndex={-1}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              drag="y"
              dragControls={sourceDragControls}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.4 }}
              onDragEnd={(_: unknown, info: PanInfo) => {
                if (info.offset.y > 100 || info.velocity.y > 500) {
                  setShowSource(false)
                }
              }}
              className="fixed bottom-0 left-0 z-50 flex flex-col outline-none h-[80vh] w-full rounded-t-lg border-t border-border/20 bg-transparent shadow-none pointer-events-none lg:top-0 lg:bottom-0 lg:h-screen lg:max-h-screen lg:w-1/2 lg:rounded-none lg:border-none lg:pt-3 lg:pb-3 lg:pl-3 lg:pr-1.5"
            >
              <div className="relative h-full overflow-hidden rounded-md border border-border bg-background shadow-lg pointer-events-auto">
                {/* Header Overlay */}
                <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
                  <div className="absolute inset-0 h-24 bg-gradient-to-b from-background to-transparent [mask-image:linear-gradient(to_bottom,black_20%,transparent)]" />
                  <div className="relative z-10 flex flex-col pointer-events-auto">
                    {/* Drag handle - top edge-to-edge */}
                      <div className="flex items-center justify-center pt-2 pb-1 touch-none"
                        onPointerDown={(event) => sourceDragControls.start(event)}
                      >
                        <div className="w-10 h-1 rounded-full bg-muted-foreground/20 transition-colors hover:bg-muted-foreground/30" />
                      </div>

                    {/* Header row */}
                    <div className="flex items-center justify-between px-4 py-1">
                      <button
                        onClick={() => setShowSource(false)}
                        aria-label="Close source code panel"
                        className="inline-flex items-center gap-1.5 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="text-xs font-mono tracking-wide">Source Code</span>
                      </button>

                      <div className="flex items-center gap-3">
                        {sourceCodeFilename && (
                          <div className="flex items-center gap-1.5">
                            <svg className="h-3.5 w-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                            <span className="text-xs font-mono text-muted-foreground">{sourceCodeFilename}</span>
                          </div>
                        )}
                        {sourceCode && (
                          <button
                            onClick={async () => {
                              await navigator.clipboard.writeText(sourceCode)
                              setCopied(true)
                              setTimeout(() => setCopied(false), 2000)
                            }}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            aria-label={copied ? "Copied" : "Copy code"}
                          >
                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Code content - full height, hidden scrollbar */}
                <div className="relative h-full min-h-0">
                  {/* Bottom gradient overlay */}
                  <div className="absolute bottom-0 left-0 right-0 z-10 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none [mask-image:linear-gradient(to_top,black_30%,transparent)]" />
                  <div data-drawer-code className="h-full overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&_pre]:min-h-full [&_pre]:!pt-24 [&_pre]:!px-4 [&_.relative.group_>_button]:hidden">
                    <div className="h-full w-full">
                      {isSourceLoading && (
                        <div className="flex h-full items-center justify-center px-4 pt-24 pb-8">
                          <span className="text-sm text-muted-foreground/60 font-mono tracking-wide">
                            Loading source code...
                          </span>
                        </div>
                      )}
                      {!isSourceLoading && sourceLoadError && (
                        <div className="px-4 pt-24 text-sm text-muted-foreground">{sourceLoadError}</div>
                      )}
                      {!isSourceLoading && !sourceLoadError && sourceHtml && (
                        <div
                          data-code-block
                          data-line-numbers="false"
                          className="relative text-sm w-full border-none bg-transparent [&_.relative.group_>_button]:hidden [&_.shiki]:border-none [&_.shiki]:rounded-none"
                          dangerouslySetInnerHTML={{ __html: sourceHtml }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
