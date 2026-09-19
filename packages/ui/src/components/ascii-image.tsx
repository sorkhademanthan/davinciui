"use client"

import { cn } from "@workspace/ui/lib/utils"
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react"

export type AsciiPresetName = "minimal" | "classic" | "detailed" | "halftone"
export type AsciiResolution = "low" | "medium" | "high" | number
export type AsciiColorMode = "mono" | "source"
export type AsciiBackgroundMode = "ascii" | "empty" | "edge"
export type AsciiOpacityMode = "fixed" | "luminance"
export type AsciiFit = "contain" | "cover"
export type AsciiPosition = "center" | "top" | "bottom" | "left" | "right"
export type AsciiEffectKind = "none" | "reveal" | "scramble"
export type AsciiTrigger = "load" | "inView"

export interface AsciiImageProps {
  src: string
  alt?: string
  preset?: AsciiPresetName
  characters?: string
  resolution?: AsciiResolution
  cellSize?: number
  fontFamily?: string
  fontSize?: number
  fontWeight?: number | string
  lineHeight?: number
  foreground?: string
  background?: string
  colorMode?: AsciiColorMode
  brightness?: number
  contrast?: number
  invert?: boolean
  backgroundMode?: AsciiBackgroundMode
  backgroundThreshold?: number
  opacityMode?: AsciiOpacityMode
  opacity?: number
  opacityGamma?: number
  fit?: AsciiFit
  position?: AsciiPosition
  effect?: AsciiEffectKind
  effectDuration?: number
  trigger?: AsciiTrigger
  className?: string
  style?: CSSProperties
  onLoad?: () => void
  onError?: (error: unknown) => void
}

type AsciiCell = {
  char: string
  scramble: string
  x: number
  y: number
  luminance: number
  r: number
  g: number
  b: number
  order: number
}

export const asciiPresets: Record<AsciiPresetName, { characters: string; cellSize: number }> = {
  minimal: { characters: " .:#@", cellSize: 8 },
  classic: { characters: " .:-=+*#%@", cellSize: 6 },
  detailed: {
    characters: " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
    cellSize: 4,
  },
  halftone: { characters: " .oO0@", cellSize: 5 },
}

const RESOLUTION_SIZES: Record<"low" | "medium" | "high", number> = {
  low: 10,
  medium: 6.5,
  high: 4.5,
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

// Deterministic pseudo-random per cell so reveal/scramble order is stable per process.
function hash01(index: number) {
  const s = Math.sin(index * 12.9898 + 78.233) * 43758.5453
  return s - Math.floor(s)
}

function resolveCellTarget(
  preset: AsciiPresetName,
  resolution: AsciiResolution,
  cellSize?: number,
  fontSize?: number,
): number {
  if (typeof fontSize === "number" && fontSize > 0) return fontSize
  if (typeof cellSize === "number" && cellSize > 0) return cellSize
  if (typeof resolution === "number" && resolution > 0) return resolution
  if (typeof resolution === "string") return RESOLUTION_SIZES[resolution] ?? asciiPresets[preset].cellSize
  return asciiPresets[preset].cellSize
}

function resolveForeground(canvas: HTMLCanvasElement, foreground: string): string {
  if (foreground !== "currentColor") return foreground
  const computed = getComputedStyle(canvas).color
  return computed || "#f2f2f2"
}

export function AsciiImage({
  src,
  alt = "",
  preset = "detailed",
  characters,
  resolution = "high",
  cellSize,
  fontFamily = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSize: fontSizeProp,
  fontWeight = 400,
  lineHeight = 1,
  foreground = "currentColor",
  background = "transparent",
  colorMode = "mono",
  brightness = 0,
  contrast = 1.1,
  invert = false,
  backgroundMode = "ascii",
  backgroundThreshold = 0.95,
  opacityMode = "fixed",
  opacity = 1,
  opacityGamma = 1.4,
  fit = "contain",
  position = "center",
  effect = "none",
  effectDuration = 1400,
  trigger = "load",
  className,
  style,
  onLoad,
  onError,
}: AsciiImageProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cellsRef = useRef<AsciiCell[]>([])
  const rafRef = useRef(0)
  const resizeRafRef = useRef(0)
  const loadIdRef = useRef(0)
  const inViewRef = useRef(trigger !== "inView")
  const onLoadRef = useRef(onLoad)
  const onErrorRef = useRef(onError)
  onLoadRef.current = onLoad
  onErrorRef.current = onError

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")

  const ramp = useMemo(
    () => characters ?? asciiPresets[preset].characters,
    [characters, preset],
  )
  const baseCell = useMemo(
    () => resolveCellTarget(preset, resolution, cellSize, fontSizeProp),
    [preset, resolution, cellSize, fontSizeProp],
  )

  useEffect(() => {
    const wrapper = wrapperRef.current
    const canvas = canvasRef.current
    if (!wrapper || !canvas) return

    const ctx = canvas.getContext("2d")
    const sampler = document.createElement("canvas")
    const sampleCtx = sampler.getContext("2d", { willReadFrequently: true })
    if (!ctx || !sampleCtx) return

    let disposed = false
    let image: HTMLImageElement | null = new Image()
    let imageReady = false
    let cssW = 0
    let cssH = 0
    let animationStart = 0
    let io: IntersectionObserver | null = null
    const loadId = ++loadIdRef.current
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const cancelAnim = () => cancelAnimationFrame(rafRef.current)

    const process = () => {
      if (!imageReady || !image || cssW === 0 || cssH === 0 || ramp.length === 0) return false
      // Target glyph size; grow slightly on tiny containers so the subject stays readable.
      const responsiveScale = cssW < 380 ? 1.25 : cssW < 640 ? 1.12 : 1
      const fontSize = Math.max(2, baseCell * responsiveScale)
      const cellH = Math.max(3, fontSize * Math.max(0.5, lineHeight))
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
      const measured = ctx.measureText("M").width || fontSize * 0.6
      const cellW = Math.max(2, measured)
      const columns = Math.max(1, Math.round(cssW / cellW))
      const rows = Math.max(1, Math.round(cssH / cellH))

      sampler.width = columns
      sampler.height = rows
      sampleCtx.clearRect(0, 0, columns, rows)

      const iw = image.naturalWidth
      const ih = image.naturalHeight
      if (!iw || !ih) return false
      const s =
        fit === "cover" ? Math.max(columns / iw, rows / ih) : Math.min(columns / iw, rows / ih)
      const dw = Math.max(1, iw * s)
      const dh = Math.max(1, ih * s)
      let ox = (columns - dw) / 2
      let oy = (rows - dh) / 2
      if (position === "top") oy = 0
      if (position === "bottom") oy = rows - dh
      if (position === "left") ox = 0
      if (position === "right") ox = columns - dw
      sampleCtx.imageSmoothingEnabled = true
      sampleCtx.imageSmoothingQuality = "high"
      sampleCtx.drawImage(image, ox, oy, dw, dh)

      let data: Uint8ClampedArray
      try {
        data = sampleCtx.getImageData(0, 0, columns, rows).data
      } catch (error) {
        if (loadId !== loadIdRef.current || disposed) return false
        setStatus("error")
        onErrorRef.current?.(error)
        return false
      }

      const cells: AsciiCell[] = new Array(columns * rows)
      const last = ramp.length - 1
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          const i = row * columns + col
          const p = i * 4
          const r = data[p] ?? 0
          const g = data[p + 1] ?? 0
          const b = data[p + 2] ?? 0
          if (backgroundMode === "edge") {
            // Portraits usually have a clean backdrop above the subject; averaging
            // opposite edges can blend the backdrop with the subject and erase both.
            const edge = columns >= rows ? row * columns : col
            const edgeP = edge * 4
            const bgR = data[edgeP] ?? 0
            const bgG = data[edgeP + 1] ?? 0
            const bgB = data[edgeP + 2] ?? 0
            const edgeDistance = Math.hypot(r - bgR, g - bgG, b - bgB) / 441.67
            if (edgeDistance <= backgroundThreshold) {
              cells[i] = { char: "", scramble: "", x: col * cellW, y: row * cellH, luminance: 0, r, g, b, order: hash01(i) }
              continue
            }
          }
          // Perceived luminance, then contrast around midpoint + brightness shift.
          let v = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 255
          v = (v - 0.5) * contrast + 0.5 + brightness
          v = clamp(v)
          const lumForBg = invert ? 1 - v : v
          if (backgroundMode === "empty" && lumForBg >= backgroundThreshold) {
            cells[i] = { char: "", scramble: "", x: col * cellW, y: row * cellH, luminance: v, r, g, b, order: hash01(i) }
            continue
          }
          const mapped = invert ? v : 1 - v
          const ch = ramp[Math.min(last, Math.floor(clamp(mapped) * last))] ?? ""
          cells[i] = {
            char: ch.trim() === "" ? "" : ch,
            scramble: ramp[Math.floor(hash01(i * 7 + 3) * ramp.length)] ?? ch,
            x: col * cellW,
            y: row * cellH,
            luminance: v,
            r,
            g,
            b,
            order: hash01(i),
          }
        }
      }
      cellsRef.current = cells
      // Stash metrics for the draw stage.
      ;(process as unknown as { metrics?: { cellW: number; cellH: number; fontSize: number } }).metrics = {
        cellW,
        cellH,
        fontSize,
      }
      return true
    }

    const draw = (progress: number) => {
      const cells = cellsRef.current
      const metrics = (process as unknown as { metrics?: { cellW: number; cellH: number; fontSize: number } }).metrics
      if (!metrics) return
      const dpr = Math.min(window.devicePixelRatio || 1, 3)
      // Canvas backing store already sized in resize(); ensure transform is exact.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, cssW, cssH)
      if (background !== "transparent") {
        ctx.fillStyle = background
        ctx.fillRect(0, 0, cssW, cssH)
      }
      ctx.font = `${fontWeight} ${metrics.fontSize}px ${fontFamily}`
      ctx.textBaseline = "top"
      const mono = colorMode === "mono" ? resolveForeground(canvas, foreground) : ""
      const gamma = Math.max(0.1, opacityGamma)

      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i]!
        if (!cell.char) continue
        let glyph = cell.char
        if (effect === "reveal") {
          if (cell.order > progress) continue
        } else if (effect === "scramble") {
          glyph = cell.order <= progress ? cell.char : cell.scramble
          if (!glyph || glyph.trim() === "") continue
        }
        if (colorMode === "source") {
          ctx.fillStyle = `rgb(${cell.r}, ${cell.g}, ${cell.b})`
        } else {
          ctx.fillStyle = mono
        }
        ctx.globalAlpha =
          opacityMode === "luminance"
            ? clamp(Math.pow(1 - cell.luminance, gamma)) * clamp(opacity)
            : clamp(opacity)
        ctx.fillText(glyph, cell.x, cell.y)
      }
      ctx.globalAlpha = 1
    }

    const renderFinal = () => {
      cancelAnim()
      draw(1)
    }

    const play = () => {
      if (effect === "none" || reduceMotion || effectDuration <= 0) {
        renderFinal()
        return
      }
      cancelAnim()
      animationStart = performance.now()
      const tick = (now: number) => {
        if (disposed || loadId !== loadIdRef.current) return
        const p = clamp((now - animationStart) / Math.max(1, effectDuration))
        draw(p)
        if (p < 1) {
          rafRef.current = requestAnimationFrame(tick)
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    const refresh = () => {
      if (disposed || loadId !== loadIdRef.current || !imageReady) return
      if (!process()) return
      if (!inViewRef.current) {
        draw(0)
        return
      }
      play()
    }

    const resize = () => {
      const rect = wrapper.getBoundingClientRect()
      const w = Math.max(1, Math.round(rect.width))
      const h = Math.max(1, Math.round(rect.height))
      if (w === cssW && h === cssH && cellsRef.current.length > 0) return
      cssW = w
      cssH = h
      const dpr = Math.min(window.devicePixelRatio || 1, 3)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      refresh()
    }

    const scheduleResize = () => {
      cancelAnimationFrame(resizeRafRef.current)
      resizeRafRef.current = requestAnimationFrame(resize)
    }

    const ro = new ResizeObserver(scheduleResize)
    ro.observe(wrapper)

    if (trigger === "inView") {
      inViewRef.current = false
      io = new IntersectionObserver(
        (entries) => {
          if (disposed || loadId !== loadIdRef.current) return
          if (entries.some((e) => e.isIntersecting)) {
            inViewRef.current = true
            refresh()
            io?.disconnect()
            io = null
          }
        },
        { threshold: 0.15 },
      )
      io.observe(wrapper)
    } else {
      inViewRef.current = true
    }

    setStatus("loading")
    image.crossOrigin = "anonymous"
    image.onload = () => {
      if (disposed || loadId !== loadIdRef.current) return
      imageReady = true
      setStatus("ready")
      onLoadRef.current?.()
      resize()
    }
    image.onerror = (event) => {
      if (disposed || loadId !== loadIdRef.current) return
      setStatus("error")
      onErrorRef.current?.(event)
    }
    image.src = src
    if (image.complete && image.naturalWidth > 0) image.onload?.(new Event("load") as never)

    // Initial measure in case the observer fires late.
    resize()

    return () => {
      disposed = true
      // Invalidate any in-flight image load for this effect run.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      loadIdRef.current++
      cancelAnim()
      cancelAnimationFrame(resizeRafRef.current)
      ro.disconnect()
      io?.disconnect()
      if (image) {
        image.onload = null
        image.onerror = null
        image = null
      }
      cellsRef.current = []
    }
    // Re-process only when inputs affecting sampling change; drawing reacts via refresh().
  }, [
    src,
    ramp,
    baseCell,
    fontFamily,
    fontWeight,
    lineHeight,
    foreground,
    background,
    colorMode,
    brightness,
    contrast,
    invert,
    backgroundMode,
    backgroundThreshold,
    opacityMode,
    opacity,
    opacityGamma,
    fit,
    position,
    effect,
    effectDuration,
    trigger,
  ])

  const decorative = alt === ""

  return (
    <div
      ref={wrapperRef}
      className={cn("relative size-full overflow-hidden", className)}
      style={style}
      data-status={status}
    >
      <canvas
        ref={canvasRef}
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : alt}
        aria-hidden={decorative || undefined}
        className="block size-full"
      />
    </div>
  )
}
