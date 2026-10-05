"use client"

import * as React from "react"
import * as ReactDOM from "react-dom"
import { cn } from "@/lib/utils"
import { RotateCcw, Search, SlidersHorizontal, Check, Maximize, Minimize, CodeXml, ChevronLeft, Copy } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { PersonalizeDrawer } from "@/components/personalize-drawer"
import { motion, AnimatePresence, useDragControls, type PanInfo } from "framer-motion"
import { useDocStore } from "@/hooks/use-doc-store"

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
  fullWidthPreview?: boolean
  scrollablePreview?: boolean
  personalizeContent?: React.ReactNode
  sourceCodeFilename?: string
  sourceCodeKey?: string
  variants?: VariantItem[]
  hideDefaultVariant?: boolean
}

function PreviewIconButton({
  children,
  onClick,
  label,
  active,
  expanded,
}: {
  children: React.ReactNode
  onClick?: () => void
  label: string
  active?: boolean
  expanded?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        active && "bg-accent text-accent-foreground",
        expanded && "hover:bg-accent",
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

const PREVIEW_EXPAND_MS = 420
const PREVIEW_EXPAND_EASING = "cubic-bezier(0.22, 1, 0.36, 1)"

type PreviewRect = { top: number; left: number; width: number; height: number }

function toPreviewRect(rect: DOMRect | PreviewRect): PreviewRect {
  return { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
}

export function DocsPreviewWrapper({
  children,
  fullWidthPreview,
  scrollablePreview = false,
  personalizeContent,
  sourceCodeFilename,
  sourceCodeKey,
  variants = [],
  hideDefaultVariant = false,
}: DocsPreviewWrapperProps) {
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

  const resolvedActiveVariant = hideDefaultVariant && activeVariant === -1 ? 0 : activeVariant

  const { setActiveVariantIndex, personalizeOpen, registerPersonalizeContent, clearPersonalizeContent, setPersonalizeOpen } = useDocStore()

  // Sync state with store
  React.useEffect(() => {
    setActiveVariantIndex(resolvedActiveVariant)
  }, [resolvedActiveVariant, setActiveVariantIndex])

  // Expose this preview's playground panel so the site header can offer
  // the same Personalize entry point. Guarded by id so sibling previews
  // never clobber each other on unmount.
  const personalizeId = React.useId()
  React.useEffect(() => {
    if (!personalizeContent) return
    registerPersonalizeContent(personalizeId, personalizeContent)
    return () => {
      clearPersonalizeContent(personalizeId)
    }
  }, [personalizeContent, personalizeId, registerPersonalizeContent, clearPersonalizeContent])

  const previewRef = React.useRef<HTMLDivElement>(null)
  const splitPreviewRectRef = React.useRef<PreviewRect | null>(null)
  const hasSourceCode = Boolean(sourceCodeKey)

  const selectVariant = React.useCallback((index: number) => {
    if (scrollablePreview) {
      const scroller = previewRef.current?.querySelector<HTMLElement>(
        "[data-text-reveal-preview-scroll]",
      )
      if (scroller) scroller.scrollTop = 0
    }
    setActiveVariant(index)
  }, [scrollablePreview])

  const cacheSplitPreviewRect = React.useCallback(() => {
    const layout = previewRef.current?.closest("[data-docs-layout]")
    const previewShell = layout?.querySelector<HTMLElement>("[data-docs-preview-shell]")
    if (!previewShell || previewShell.style.position === "fixed") return
    splitPreviewRectRef.current = toPreviewRect(previewShell.getBoundingClientRect())
  }, [])

  const handleSourceOpen = React.useCallback(async () => {
    setPersonalizeOpen(false)
    if (isExpanded) {
      setIsExpanded(false)
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
  }, [isExpanded, isSourceLoading, sourceCodeKey, sourceHtml, setPersonalizeOpen])

  const handleToggleExpanded = React.useCallback(() => {
    setIsExpanded((prev) => {
      const next = !prev
      if (next) {
        setShowSource(false)
        setPersonalizeOpen(false)
      }
      return next
    })
  }, [setPersonalizeOpen])

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Hide navbar/header when fullscreen so toolbar (search, source, preferences, replay, fullscreen, theme) is not covered
  React.useEffect(() => {
    const header = document.querySelector("header.fixed") as HTMLElement | null
    if (!header) return
    if (isExpanded) {
      header.style.display = "none"
      document.body.style.overflow = "hidden"
    } else {
      header.style.display = ""
      document.body.style.overflow = ""
    }
    return () => {
      header.style.display = ""
      document.body.style.overflow = ""
    }
  }, [isExpanded])

  React.useEffect(() => {
    cacheSplitPreviewRect()
    if (!isExpanded) return
    const onResize = () => {
      cacheSplitPreviewRect()
      const shell = previewRef.current
        ?.closest("[data-docs-layout]")
        ?.querySelector<HTMLElement>("[data-docs-preview-shell]")
      if (shell?.dataset.previewExpanded !== "true") return
      shell.style.width = `${window.innerWidth}px`
      shell.style.height = `${window.innerHeight}px`
      shell.style.padding = window.innerWidth < 1024 ? "0px" : "12px"
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [isExpanded, cacheSplitPreviewRect, showSource])

  React.useEffect(() => {
    const layout = previewRef.current?.closest("[data-docs-layout]")
    const previewShell = layout?.querySelector<HTMLElement>("[data-docs-preview-shell]")
    if (!previewShell) return

    const isMobile = window.matchMedia("(max-width: 1023px)").matches
    const fullPadding = isMobile ? "0px" : "12px"
    const splitPadding = isMobile ? "16px" : "12px 12px 12px 6px"
    const transition = `top ${PREVIEW_EXPAND_MS}ms ${PREVIEW_EXPAND_EASING}, left ${PREVIEW_EXPAND_MS}ms ${PREVIEW_EXPAND_EASING}, width ${PREVIEW_EXPAND_MS}ms ${PREVIEW_EXPAND_EASING}, height ${PREVIEW_EXPAND_MS}ms ${PREVIEW_EXPAND_EASING}, padding ${PREVIEW_EXPAND_MS}ms ${PREVIEW_EXPAND_EASING}`

    const applyFixedRect = (rect: PreviewRect, padding: string) => {
      previewShell.style.position = "fixed"
      previewShell.style.top = `${rect.top}px`
      previewShell.style.left = `${rect.left}px`
      previewShell.style.width = `${rect.width}px`
      previewShell.style.height = `${rect.height}px`
      previewShell.style.zIndex = "100"
      previewShell.style.padding = padding
      previewShell.classList.add("bg-background")
    }

    const clearFixedStyles = () => {
      delete previewShell.dataset.previewExpanded
      for (const prop of ["position", "top", "left", "width", "height", "zIndex", "padding", "transition"] as const) {
        previewShell.style.removeProperty(prop)
      }
      previewShell.classList.remove("bg-background")
      cacheSplitPreviewRect()
    }

    let onTransitionEnd: ((event: TransitionEvent) => void) | undefined

    if (isExpanded) {
      const from = toPreviewRect(previewShell.getBoundingClientRect())
      splitPreviewRectRef.current = from

      previewShell.style.transition = "none"
      applyFixedRect(from, splitPadding)
      void previewShell.offsetHeight

      previewShell.style.transition = transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          applyFixedRect(
            { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight },
            fullPadding
          )
          previewShell.dataset.previewExpanded = "true"
        })
      })
    } else if (previewShell.style.position === "fixed") {
      const rightColumn = layout?.querySelector<HTMLElement>("[data-docs-right-column]")
      const col = rightColumn?.getBoundingClientRect()
      const targetFromLayout: PreviewRect | null = col
        ? isMobile
          ? { top: col.top, left: col.left, width: col.width, height: Math.min(col.height, window.innerHeight * 0.55) }
          : { top: col.top + 12, left: col.left + 6, width: col.width - 18, height: col.height - 24 }
        : null
      const target = targetFromLayout ?? splitPreviewRectRef.current
      if (!target) {
        clearFixedStyles()
        return
      }

      previewShell.style.transition = transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          applyFixedRect(target, splitPadding)
        })
      })

      onTransitionEnd = (event: TransitionEvent) => {
        if (event.target !== previewShell || event.propertyName !== "width") return
        clearFixedStyles()
      }
      previewShell.addEventListener("transitionend", onTransitionEnd)
    } else {
      clearFixedStyles()
    }

    return () => {
      if (onTransitionEnd) {
        previewShell.removeEventListener("transitionend", onTransitionEnd)
      }
    }
  }, [isExpanded, cacheSplitPreviewRect])

  return (
    <div className={cn(
      "relative flex h-full w-full flex-col overflow-hidden rounded-md border border-border bg-background",
    )} ref={previewRef}>
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
          <React.Suspense
            fallback={
              <span className="inline-flex size-8 items-center justify-center text-muted-foreground/50">
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
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <Search className="size-4" />
                </button>
              }
            />
          </React.Suspense>

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
                  setIsExpanded(false)
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

          <PreviewIconButton
            onClick={() => {
              selectVariant(resolvedActiveVariant)
              setKey((k) => k + 1)
            }}
            label="Reload preview"
          >
            <RotateCcw className={previewIconClass} />
          </PreviewIconButton>

          <PreviewIconButton
            onClick={handleToggleExpanded}
            label={isExpanded ? "Collapse preview pane" : "Expand preview pane"}
            active={isExpanded}
          >
            {isExpanded ? <Minimize className={previewIconClass} /> : <Maximize className={previewIconClass} />}
          </PreviewIconButton>

          <ThemeToggle className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border-0 bg-transparent text-muted-foreground shadow-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
        </div>
      </div>

      {/* The scrollable surface is opt-in; Text Reveal uses its own scroller. */}
      <div className={cn(
        "flex w-full bg-muted/30 [background-image:radial-gradient(color-mix(in_oklab,var(--border)_55%,transparent)_1px,transparent_1px)] [background-size:20px_20px]",
        scrollablePreview
          ? "min-h-0 flex-1 flex-col items-stretch overflow-x-hidden overflow-y-auto overscroll-contain"
          : "h-full overflow-hidden",
        !scrollablePreview && !fullWidthPreview && "items-center justify-center"
      )}
        data-text-reveal-preview-scroll={scrollablePreview ? "true" : undefined}
        role={scrollablePreview ? "region" : undefined}
        aria-label={scrollablePreview ? "Scrollable Text Reveal preview" : undefined}
        tabIndex={scrollablePreview ? 0 : undefined}
      >
        <div
          className={cn(
            "w-full",
            scrollablePreview
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
              scrollablePreview ? "min-h-full" : "h-full",
              !scrollablePreview && !fullWidthPreview && "flex items-center justify-center"
            )}
          >
            {resolvedActiveVariant === -1 ? children : variants[resolvedActiveVariant]?.preview}
          </div>
        </div>
      </div>

      {/* Personalize drawer — rendered by the preview that owns the panel,
          opened from the toolbar or the site header via the doc store. */}
      {personalizeContent && <PersonalizeDrawer />}

      {/* Source Code Panel Portal */}
      {mounted && ReactDOM.createPortal(
        <AnimatePresence>
          {showSource && (
            <motion.div
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
                        className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none"
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
