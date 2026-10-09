"use client"

import * as React from "react"
import { Code2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { DocsCodePanel } from "@/components/docs-code-panel"
import { useDocStore } from "@/hooks/use-doc-store"
import { usePlaygroundStore } from "@/hooks/use-playground-store"
import { useSmoothCodeHeight } from "@/hooks/use-smooth-code-height"
import { stripImportFromCode } from "@/lib/split-import"

interface DynamicCodeBlockProps {
  originalCode: string
  defaultHtml: string
  /** Full usage snippet, shown as its own tab only when it differs. */
  usageTabCode?: string
  usageTabHtml?: string
  className?: string
  variantCodes?: string[]
  variantTitles?: string[]
  hideDefaultTab?: boolean
  /**
   * Registry slug for live personalization. When the playground store holds
   * generated code for this slug, the Default tab shows it (highlighted +
   * copied) instead of the static `originalCode` — so the Usage block always
   * matches the personalized preview. Variant tabs are unaffected.
   */
  personalizedSlug?: string
}

async function fetchHighlightedTsx(code: string): Promise<string> {
  const response = await fetch("/api/docs/source", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, lang: "tsx" }),
  })

  if (!response.ok) {
    throw new Error("Failed to highlight code")
  }

  const data = (await response.json()) as { html?: string }
  return data.html ?? ""
}

export function DynamicCodeBlock({
  originalCode,
  defaultHtml,
  usageTabCode,
  usageTabHtml,
  className,
  variantCodes = [],
  variantTitles = [],
  hideDefaultTab = false,
  personalizedSlug,
}: DynamicCodeBlockProps) {
  const { activeVariantIndex, setActiveVariantIndex } = useDocStore()
  const liveCode = usePlaygroundStore((state) => state.code)
  const liveCodeSlug = usePlaygroundStore((state) => state.codeSlug)
  const liveDirty =
    usePlaygroundStore((state) =>
      personalizedSlug ? state.dirtySlugs[personalizedSlug] === true : false,
    )
  const [variantHtmlMap, setVariantHtmlMap] = React.useState<Record<number, string>>({})
  const [visibleHtml, setVisibleHtml] = React.useState(defaultHtml)
  const [isSwitching, setIsSwitching] = React.useState(false)
  const hasMountedRef = React.useRef(false)
  const visibleHtmlRef = React.useRef(defaultHtml)

  const tabs = React.useMemo(() => {
    const items: { id: string; label: string }[] = []
    if (!hideDefaultTab) {
      items.push({ id: "default", label: "Default" })
    }
    if (usageTabCode && usageTabHtml) {
      items.push({ id: "usage", label: "Usage" })
    }
    variantTitles.forEach((title, i) => {
      items.push({ id: String(i), label: title })
    })
    return items
  }, [hideDefaultTab, usageTabCode, usageTabHtml, variantTitles])

  // The Usage tab is local to the code block: it never drives the preview,
  // which keeps rendering the default variant underneath.
  const [showUsageTab, setShowUsageTab] = React.useState(false)

  const activeTab = React.useMemo(() => {
    if (showUsageTab && usageTabCode) return "usage"
    if (activeVariantIndex === -1) return hideDefaultTab ? tabs[0]?.id ?? "default" : "default"
    return String(activeVariantIndex)
  }, [showUsageTab, usageTabCode, activeVariantIndex, hideDefaultTab, tabs])

  const showingUsageTab = showUsageTab && Boolean(usageTabCode && usageTabHtml)

  const targetHtml =
    showingUsageTab && usageTabHtml
      ? usageTabHtml
      : activeVariantIndex === -1 ? defaultHtml : variantHtmlMap[activeVariantIndex]

  // Live personalization: generated code scoped to this page's slug replaces
  // the static Default-tab code (display + copy). Import lines are stripped
  // because the Import block above stays static — imports never change with
  // personalization. Shown only when the live code actually differs.
  const scopedLiveCode =
    personalizedSlug && liveCodeSlug === personalizedSlug ? liveCode.trim() : ""
  const liveUsage = scopedLiveCode ? stripImportFromCode(scopedLiveCode).trim() : ""
  const isPersonalized =
    activeVariantIndex === -1 &&
    liveDirty &&
    liveUsage.length > 0 &&
    liveUsage !== originalCode.trim()

  const [liveHtml, setLiveHtml] = React.useState<string | null>(null)
  React.useEffect(() => {
    if (!isPersonalized) {
      setLiveHtml(null)
      return
    }
    const timer = window.setTimeout(() => {
      fetchHighlightedTsx(liveUsage)
        .then((html) => setLiveHtml(html || null))
        .catch(() => setLiveHtml(null))
    }, 250)
    return () => window.clearTimeout(timer)
  }, [isPersonalized, liveUsage])

  const effectiveHtml =
    activeVariantIndex === -1 && isPersonalized && liveHtml ? liveHtml : targetHtml

  const rawCodeToUse =
    showingUsageTab && usageTabCode
      ? usageTabCode
      : activeVariantIndex === -1
        ? isPersonalized
          ? liveUsage
          : originalCode
        : variantCodes[activeVariantIndex] || originalCode

  const { contentRef, contentHeight, wrapperProps } = useSmoothCodeHeight([
    visibleHtml,
    activeVariantIndex,
  ])
  const hasUnboundedHeight = className?.includes("max-h-none")
  const resolvedWrapperStyle = hasUnboundedHeight
    ? wrapperProps.style
    : {
        ...wrapperProps.style,
        height:
          contentHeight !== undefined
            ? Math.min(contentHeight, 500)
            : wrapperProps.style.height,
      }

  React.useEffect(() => {
    if (hideDefaultTab && activeVariantIndex === -1 && variantTitles.length > 0) {
      setActiveVariantIndex(0)
    }
  }, [hideDefaultTab, activeVariantIndex, variantTitles.length, setActiveVariantIndex])

  React.useEffect(() => {
    let cancelled = false

    const prefetchVariants = async () => {
      const entries = await Promise.all(
        variantCodes.map(async (code, index) => {
          if (!code) return null
          try {
            const html = await fetchHighlightedTsx(code)
            return { index, html }
          } catch {
            return null
          }
        })
      )

      if (cancelled) return

      setVariantHtmlMap((prev) => {
        const next = { ...prev }
        for (const entry of entries) {
          if (entry?.html) {
            next[entry.index] = entry.html
          }
        }
        return next
      })
    }

    prefetchVariants()
    return () => {
      cancelled = true
    }
  }, [variantCodes])

  React.useEffect(() => {
    if (effectiveHtml) {
      const shouldAnimate = hasMountedRef.current && effectiveHtml !== visibleHtmlRef.current
      if (shouldAnimate) {
        setIsSwitching(true)
      }
      visibleHtmlRef.current = effectiveHtml
      setVisibleHtml(effectiveHtml)
      hasMountedRef.current = true
      if (shouldAnimate) {
        const timer = window.setTimeout(() => setIsSwitching(false), 200)
        return () => window.clearTimeout(timer)
      }
    }
    return undefined
  }, [effectiveHtml])

  const handleTabChange = (id: string) => {
    if (id === "usage") {
      setShowUsageTab(true)
      return
    }
    setShowUsageTab(false)
    if (id === "default") {
      setActiveVariantIndex(-1)
      return
    }
    setActiveVariantIndex(Number(id))
  }

  // Preview-toolbar tab switches drive the code block back off the Usage tab.
  React.useEffect(() => {
    setShowUsageTab(false)
  }, [activeVariantIndex])

  const isLoadingActiveVariant =
    activeVariantIndex >= 0 && !variantHtmlMap[activeVariantIndex]

  return (
    <DocsCodePanel
      icon={Code2}
      copyCode={rawCodeToUse.trim()}
      badge={
        isPersonalized && !showingUsageTab ? (
          <span className="shrink-0 rounded-full border border-emerald-600/25 bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
            Personalized
          </span>
        ) : undefined
      }
      tabs={tabs.length > 1 ? tabs : undefined}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      tabListAriaLabel="Example variant"
      className={className}
    >
      <div
        {...wrapperProps}
        style={resolvedWrapperStyle}
        className={cn(
          wrapperProps.className,
          "rounded-b-md bg-background",
          className?.includes("h-full") && "h-full"
        )}
      >
        <div
          ref={contentRef}
          className={cn(
            "transition-opacity duration-150",
            (isSwitching || isLoadingActiveVariant) && "opacity-70",
            hasUnboundedHeight
              ? "h-full"
              : "max-h-[500px] overflow-auto"
          )}
        >
          <div
            className="[&_.shiki]:!bg-transparent [&_pre]:!bg-transparent [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_pre]:p-4"
            dangerouslySetInnerHTML={{ __html: visibleHtml }}
          />
        </div>
      </div>
    </DocsCodePanel>
  )
}
