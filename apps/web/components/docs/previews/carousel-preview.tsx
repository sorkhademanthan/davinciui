"use client"

import * as React from "react"
import { Card, CardContent } from "@workspace/ui/components/card"
import {
  Carousel,
  CarouselContent,
  CarouselCounter,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPlayButton,
  CarouselPrevious,
  CarouselProgress,
  type CarouselApi,
  useCarousel,
} from "@workspace/ui/components/carousel"
import { Button } from "@workspace/ui/components/button"
import { Pause, Play } from "lucide-react"

function Slide({ index }: { index: number }) {
  return (
    <div className="p-1">
      <Card>
        <CardContent className="flex aspect-square items-center justify-center p-6">
          <span className="text-4xl font-semibold tabular-nums">{index}</span>
        </CardContent>
      </Card>
    </div>
  )
}

function SlideTall({ index }: { index: number }) {
  return (
    <div className="p-1">
      <Card>
        <CardContent className="flex h-28 items-center justify-center p-6 sm:h-32">
          <span className="text-2xl font-semibold tabular-nums">{index}</span>
        </CardContent>
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Default — one slide per view
// ---------------------------------------------------------------------------

export function CarouselPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center px-12 py-8">
      <Carousel className="w-full max-w-xs">
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, i) => (
            <CarouselItem key={i}>
              <Slide index={i + 1} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sizes — basis utilities on CarouselItem
// ---------------------------------------------------------------------------

export function CarouselSizePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center px-12 py-8">
      <Carousel opts={{ align: "start" }} className="w-full max-w-sm">
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, i) => (
            <CarouselItem key={i} className="basis-1/3">
              <Slide index={i + 1} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Spacing — -ml on Content + pl on Item
// ---------------------------------------------------------------------------

export function CarouselSpacingPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center px-12 py-8">
      <Carousel className="w-full max-w-xs">
        <CarouselContent className="-ml-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <CarouselItem key={i} className="pl-4">
              <Slide index={i + 1} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Orientation — vertical
// ---------------------------------------------------------------------------

export function CarouselOrientationPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center px-12 py-10">
      <Carousel orientation="vertical" className="w-full max-w-xs">
        <CarouselContent className="h-[200px]">
          {Array.from({ length: 5 }).map((_, i) => (
            <CarouselItem key={i}>
              <SlideTall index={i + 1} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Options — opts={{ align:"start", loop:true }}
// ---------------------------------------------------------------------------

export function CarouselOptionsPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center px-12 py-8">
      <Carousel opts={{ align: "start", loop: true }} className="w-full max-w-xs">
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, i) => (
            <CarouselItem key={i}>
              <Slide index={i + 1} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}

// Compatibility alias — previous “Loop” name
export const CarouselLoopPreview = CarouselOptionsPreview

// ---------------------------------------------------------------------------
// API — dots + counter via setApi
// ---------------------------------------------------------------------------

export function CarouselApiPreview() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    if (!api) return
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)
    const onSelect = () => setCurrent(api.selectedScrollSnap() + 1)
    api.on("select", onSelect)
    api.on("reInit", onSelect)
    return () => {
      api.off("select", onSelect)
      api.off("reInit", onSelect)
    }
  }, [api])

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-12 py-8">
      <Carousel setApi={setApi} className="w-full max-w-xs">
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, i) => (
            <CarouselItem key={i}>
              <Slide index={i + 1} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <div className="flex items-center justify-center gap-2 py-1">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            onClick={() => api?.scrollTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`size-2.5 rounded-full transition-colors ${
              i === current - 1 ? "bg-foreground" : "bg-foreground/20"
            }`}
          />
        ))}
      </div>
      <p className="text-xs font-medium tabular-nums text-muted-foreground">
        Slide {current} of {count || 5}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dots — accessible pill pagination (recommended default)
// ---------------------------------------------------------------------------

export function CarouselDotsPreview() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-12 py-8">
      <Carousel className="w-full max-w-xs" ariaLabel="Featured items">
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, i) => (
            <CarouselItem key={i}>
              <Slide index={i + 1} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:inline-flex" />
        <CarouselNext className="hidden sm:inline-flex" />
        <div className="mt-4 flex justify-center">
          <CarouselDots />
        </div>
      </Carousel>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Counter + progress variants
// ---------------------------------------------------------------------------

export function CarouselCounterPreview() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-12 py-8">
      <Carousel className="w-full max-w-xs" ariaLabel="Gallery with counter">
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, i) => (
            <CarouselItem key={i}>
              <Slide index={i + 1} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        <div className="mt-3 flex items-center justify-between">
          <CarouselCounter />
          <span className="text-xs text-muted-foreground">Swipe or use arrows</span>
        </div>
      </Carousel>
    </div>
  )
}

export function CarouselProgressPreview() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-12 py-8">
      <Carousel className="w-full max-w-xs" ariaLabel="Gallery with progress">
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, i) => (
            <CarouselItem key={i}>
              <Slide index={i + 1} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        <CarouselProgress className="mt-4" />
      </Carousel>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Autoplay — WCAG-compliant with visible play/pause, pause on hover/focus
// ---------------------------------------------------------------------------

export function CarouselAutoplayPreview() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-12 py-8">
      <Carousel
        className="w-full max-w-xs"
        ariaLabel="Autoplaying highlights"
        autoplay
        autoplayInterval={5000}
        opts={{ loop: true }}
      >
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, i) => (
            <CarouselItem key={i}>
              <Slide index={i + 1} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:inline-flex" />
        <CarouselNext className="hidden sm:inline-flex" />
        <div className="mt-4 flex items-center justify-center gap-3">
          <CarouselPlayButton />
          <CarouselDots />
        </div>
      </Carousel>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Peek — subtle preview of next slide signals scrollability on mobile
// ---------------------------------------------------------------------------

export function CarouselPeekPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center py-8 pl-6">
      <Carousel
        className="w-full"
        ariaLabel="Peek carousel"
        opts={{ align: "start", containScroll: "trimSnaps" }}
      >
        <CarouselContent className="-ml-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <CarouselItem key={i} className="basis-[78%] pl-3 sm:basis-1/3">
              <Slide index={i + 1} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden" />
        <CarouselNext className="hidden" />
        <div className="mt-4 flex justify-center pr-6">
          <CarouselDots />
        </div>
      </Carousel>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Thumbnails — thumbnail-driven gallery
// ---------------------------------------------------------------------------

const THUMB_IMAGES = [
  "https://images.unsplash.com/photo-1520529890308-f503006340b4?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1483366774565-c783b9f70e2c?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1496865534669-25ec2a3a0fd3?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1549791084-5f78368b208b?w=1200&q=80&auto=format&fit=crop",
]

export function CarouselThumbnailsPreview() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)

  React.useEffect(() => {
    if (!api) return
    const onSelect = () => setCurrent(api.selectedScrollSnap())
    onSelect()
    api.on("select", onSelect)
    api.on("reInit", onSelect)
    return () => {
      api.off("select", onSelect)
      api.off("reInit", onSelect)
    }
  }, [api])

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 py-8">
      <Carousel setApi={setApi} className="w-full max-w-sm" ariaLabel="Product gallery">
        <CarouselContent>
          {THUMB_IMAGES.map((src, i) => (
            <CarouselItem key={src}>
              <div className="p-1">
                <div className="overflow-hidden rounded-xl border bg-muted">
                  {/* First image eager for LCP, rest lazy */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`Gallery image ${i + 1}`}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-3" />
        <CarouselNext className="right-3" />
      </Carousel>
      <div className="grid w-full max-w-sm grid-cols-4 gap-2 px-1" role="tablist" aria-label="Choose slide">
        {THUMB_IMAGES.map((src, i) => (
          <button
            key={src}
            type="button"
            role="tab"
            aria-selected={i === current}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => api?.scrollTo(i)}
            className={`overflow-hidden rounded-lg border-2 transition outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              i === current ? "border-foreground" : "border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" loading="lazy" decoding="async" className="aspect-square w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Hero — content-rich slide (text + CTA), first slide eager
// ---------------------------------------------------------------------------

export function CarouselHeroPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <Carousel
        className="w-full max-w-2xl"
        ariaLabel="Featured stories"
        opts={{ loop: true }}
      >
        <CarouselContent>
          {[
            { title: "Design beyond defaults", copy: "A carousel that feels inevitable — fast, accessible, delightful.", cta: "Explore components" },
            { title: "Accessible by design", copy: "Keyboard, screen reader and touch support mapped to WCAG 2.2 AA.", cta: "Read the spec" },
            { title: "Performance first", copy: "Eager first slide, lazy rest. GPU transforms, zero layout shift.", cta: "See benchmarks" },
          ].map((s, i) => (
            <CarouselItem key={s.title}>
              <div className="p-1">
                <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-foreground/[0.06] via-background to-background p-8 sm:p-10">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Slide {i + 1} — Featured
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{s.title}</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{s.copy}</p>
                  <Button className="mt-5" size="sm">{s.cta}</Button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-3" />
        <CarouselNext className="right-3" />
        <div className="mt-4 flex items-center justify-center gap-3">
          <CarouselDots />
        </div>
      </Carousel>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Inline autoplay controls (custom play/pause wiring via useCarousel)
// ---------------------------------------------------------------------------

export function CarouselAutoplayControlsPreview() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-12 py-8">
      <Carousel
        className="w-full max-w-xs"
        ariaLabel="Autoplay with custom controls"
        autoplay
        autoplayInterval={5000}
        opts={{ loop: true }}
      >
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, i) => (
            <CarouselItem key={i}>
              <Slide index={i + 1} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="mt-4 flex items-center justify-center gap-2">
          <AutoplayToggleButton />
          <CarouselCounter />
        </div>
        <CarouselProgress className="mt-3" />
      </Carousel>
    </div>
  )
}

function AutoplayToggleButton() {
  const { isPlaying, setIsPlaying } = useCarousel()
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setIsPlaying(!isPlaying)}
      aria-pressed={isPlaying}
      className="gap-2 rounded-full"
    >
      {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
      {isPlaying ? "Pause" : "Play"}
    </Button>
  )
}
