"use client"

import * as React from "react"
import { Card, CardContent } from "@workspace/ui/components/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@workspace/ui/components/carousel"

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
