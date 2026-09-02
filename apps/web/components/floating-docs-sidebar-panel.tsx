"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"
import { docsConfig } from "@/config/docs"
import { components } from "@/registry"
import { useDocsSidebar } from "@/components/docs-sidebar-context"
import { DocsSidebarNav } from "@/components/docs-sidebar-nav"

type PreviewSources = {
  mp4: string
  webm: string
}

let preferredPreviewFormat: "webm" | "mp4" | null = null

function getPreferredPreviewSrc(sources: PreviewSources) {
  if (typeof window === "undefined") return sources.mp4
  if (!preferredPreviewFormat) {
    const probe = document.createElement("video")
    const supportsWebm = Boolean(probe.canPlayType('video/webm; codecs="vp9,opus"'))
    preferredPreviewFormat = supportsWebm ? "webm" : "mp4"
  }
  return preferredPreviewFormat === "webm" ? sources.webm : "mp4"
}

function getPreviewSources(previewVideo?: string) {
  if (!previewVideo) return null
  const match = previewVideo.match(/^(.*)\.(mov|mp4|webm)(\?.*)?$/i)
  if (!match) return null
  const [, base, , query = ""] = match
  return {
    mp4: `${base}.mp4${query}`,
    webm: `${base}.webm${query}`,
  }
}

export function FloatingDocsSidebarPanel() {
  const pathname = usePathname()
  const { isOpen, close } = useDocsSidebar()
  const [isHoverVideoReady, setIsHoverVideoReady] = React.useState(false)
  const [hoverPreview, setHoverPreview] = React.useState<{
    title: string
    videoSrc: string
  } | null>(null)
  const [hoverPosition, setHoverPosition] = React.useState<{ x: number; y: number } | null>(null)
  const warmedPreviewKeys = React.useRef(new Set<string>())

  const warmPreviewAssets = React.useCallback((sources: PreviewSources) => {
    if (typeof window === "undefined") return
    const selectedSrc = getPreferredPreviewSrc(sources)
    if (warmedPreviewKeys.current.has(selectedSrc)) return
    warmedPreviewKeys.current.add(selectedSrc)
    const video = document.createElement("video")
    video.preload = "auto"
    video.muted = true
    video.playsInline = true
    video.src = selectedSrc
    video.load()
  }, [])

  const getPreviewPosition = React.useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    const cardWidth = 224
    const cardHeight = 170
    const offset = 18
    const maxX = Math.max(16, window.innerWidth - cardWidth - 16)
    const maxY = Math.max(16, window.innerHeight - cardHeight - 16)
    const x = Math.max(16, Math.min(event.clientX + offset, maxX))
    const y = Math.max(16, Math.min(event.clientY + offset, maxY))
    return { x, y }
  }, [])

  const updateHoverPreview = React.useCallback(
    (item: { title: string; href: string }, event: React.MouseEvent<HTMLAnchorElement>) => {
      const slug = item.href.split("/").pop()
      if (!slug) {
        setHoverPreview(null)
        return
      }
      const previewVideo = components[slug]?.previewVideo
      const sources = getPreviewSources(previewVideo)
      if (!sources) {
        setHoverPreview(null)
        setHoverPosition(null)
        return
      }
      warmPreviewAssets(sources)
      setHoverPosition(getPreviewPosition(event))
      setHoverPreview({ title: item.title, videoSrc: getPreferredPreviewSrc(sources) })
    },
    [getPreviewPosition, warmPreviewAssets]
  )

  const updateHoverPosition = React.useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      setHoverPosition(getPreviewPosition(event))
    },
    [getPreviewPosition]
  )

  React.useEffect(() => {
    close()
  }, [pathname, close])

  React.useEffect(() => {
    if (!isOpen) {
      setHoverPreview(null)
      setHoverPosition(null)
      setIsHoverVideoReady(false)
    }
  }, [isOpen])

  React.useEffect(() => {
    if (!hoverPreview) {
      setIsHoverVideoReady(false)
      return
    }
    setIsHoverVideoReady(false)
  }, [hoverPreview?.videoSrc])

  React.useEffect(() => {
    if (!isOpen) return
    const initialSources: PreviewSources[] = []
    for (const group of docsConfig.nav) {
      for (const item of group.items) {
        const candidates: typeof group.items = item.items?.length ? item.items : [item]
        for (const candidate of candidates) {
          const slug = candidate.href.split("/").pop()
          if (!slug) continue
          const previewVideo = components[slug]?.previewVideo
          const sources = getPreviewSources(previewVideo)
          if (!sources) continue
          initialSources.push(sources)
          if (initialSources.length >= 5) break
        }
        if (initialSources.length >= 5) break
      }
      if (initialSources.length >= 5) break
    }
    initialSources.forEach((sources) => warmPreviewAssets(sources))
  }, [isOpen, warmPreviewAssets])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: -280, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -40, opacity: 0 }}
          transition={{ type: "spring", duration: 0.35, bounce: 0 }}
          className="fixed top-3 left-3 z-50 flex w-[248px] flex-col"
          onMouseLeave={close}
        >
          <div className="flex max-h-[calc(100vh-24px)] flex-col overflow-hidden rounded-2xl border border-border/50 bg-white shadow-card dark:bg-[#0a0a0a]">
            <div className="flex-1 overflow-hidden">
              <DocsSidebarNav
                onNavigate={close}
                onHoverItem={updateHoverPreview}
                onHoverMove={updateHoverPosition}
                onHoverLeave={() => {
                  setHoverPreview(null)
                  setHoverPosition(null)
                }}
              />
            </div>
          </div>

          <AnimatePresence>
            {hoverPreview && hoverPosition && (
              <motion.div
                key={hoverPreview.videoSrc}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.08, ease: "easeOut" }}
                className="pointer-events-none fixed z-[70] w-56"
                style={{ left: hoverPosition.x, top: hoverPosition.y }}
              >
                <div className="overflow-hidden rounded-xl border border-zinc-200/70 bg-white/95 shadow-2xl backdrop-blur-md dark:border-zinc-800/70 dark:bg-zinc-900/95">
                  <div className="relative h-32 w-full bg-zinc-100 dark:bg-zinc-800/60">
                    <video
                      key={hoverPreview.videoSrc}
                      src={hoverPreview.videoSrc}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="auto"
                      onLoadedData={() => setIsHoverVideoReady(true)}
                      className={cn("relative h-full w-full object-cover transition-opacity duration-150", isHoverVideoReady ? "opacity-100" : "opacity-0")}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
