"use client"

import * as React from "react"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
  /** Enable automatic advancement. Default off (WCAG: autoplay is opt-in). */
  autoplay?: boolean
  /** Delay between slides in ms. Use >= 5000 for image-only, >= 7000 for text. */
  autoplayInterval?: number
  /** Pause autoplay while pointer hovers the carousel. */
  pauseOnHover?: boolean
  /** Pause autoplay while focus is inside the carousel. */
  pauseOnFocus?: boolean
  /** Stop autoplay permanently after manual navigation. Default false (timer resets). */
  stopOnInteraction?: boolean
  /** Accessible label for the carousel region. */
  ariaLabel?: string
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  scrollTo: (index: number) => void
  canScrollPrev: boolean
  canScrollNext: boolean
  selectedIndex: number
  scrollSnaps: number[]
  isPlaying: boolean
  setIsPlaying: (playing: boolean) => void
  autoplayEnabled: boolean
} & CarouselProps

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }
  return context
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  autoplay = false,
  autoplayInterval = 5000,
  pauseOnHover = true,
  pauseOnFocus = true,
  stopOnInteraction = false,
  ariaLabel = "Carousel",
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins
  )

  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([])

  // Autoplay state — respects prefers-reduced-motion on mount.
  const [isPlaying, setIsPlaying] = React.useState(autoplay)
  const [isHoverPaused, setIsHoverPaused] = React.useState(false)
  const [isFocusPaused, setIsFocusPaused] = React.useState(false)
  const autoplayEnabled = autoplay

  React.useEffect(() => {
    setIsPlaying(autoplay)
  }, [autoplay])

  React.useEffect(() => {
    if (!autoplay) return
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      setIsPlaying(false)
    }
  }, [autoplay])

  const onSelect = React.useCallback((currentApi: CarouselApi) => {
    if (!currentApi) return
    setCanScrollPrev(currentApi.canScrollPrev())
    setCanScrollNext(currentApi.canScrollNext())
    setSelectedIndex(currentApi.selectedScrollSnap())
    setScrollSnaps(currentApi.scrollSnapList())
  }, [])

  const scrollPrev = React.useCallback(() => {
    if (stopOnInteraction) setIsPlaying(false)
    api?.scrollPrev()
  }, [api, stopOnInteraction])

  const scrollNext = React.useCallback(() => {
    if (stopOnInteraction) setIsPlaying(false)
    api?.scrollNext()
  }, [api, stopOnInteraction])

  const scrollTo = React.useCallback(
    (index: number) => {
      if (stopOnInteraction) setIsPlaying(false)
      api?.scrollTo(index)
    },
    [api, stopOnInteraction]
  )

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext]
  )

  React.useEffect(() => {
    if (!api || !setApi) return
    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) return
    onSelect(api)
    api.on("reInit", onSelect)
    api.on("select", onSelect)

    return () => {
      api.off("select", onSelect)
      api.off("reInit", onSelect)
    }
  }, [api, onSelect])

  // Autoplay loop — timer resets on slide change via selectedIndex dep.
  const effectivePlaying =
    autoplayEnabled &&
    isPlaying &&
    !(pauseOnHover && isHoverPaused) &&
    !(pauseOnFocus && isFocusPaused)

  React.useEffect(() => {
    if (!effectivePlaying || !api) return
    const id = window.setTimeout(
      () => {
        if (!api.canScrollNext() && api.scrollSnapList().length > 0) {
          // No loop: wrap to start so autoplay never gets "stuck".
          api.scrollTo(0)
        } else {
          api.scrollNext()
        }
      },
      Math.max(autoplayInterval, 1000)
    )
    return () => window.clearTimeout(id)
  }, [effectivePlaying, api, selectedIndex, autoplayInterval])

  const total = scrollSnaps.length

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        scrollTo,
        canScrollPrev,
        canScrollNext,
        selectedIndex,
        scrollSnaps,
        isPlaying,
        setIsPlaying,
        autoplayEnabled,
        autoplay,
        autoplayInterval,
        pauseOnHover,
        pauseOnFocus,
        stopOnInteraction,
        ariaLabel,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        data-slot="carousel"
        onMouseEnter={
          pauseOnHover ? () => setIsHoverPaused(true) : undefined
        }
        onMouseLeave={
          pauseOnHover ? () => setIsHoverPaused(false) : undefined
        }
        onFocusCapture={
          pauseOnFocus ? () => setIsFocusPaused(true) : undefined
        }
        onBlurCapture={
          pauseOnFocus ? () => setIsFocusPaused(false) : undefined
        }
        {...props}
      >
        {children}
        {/* Screen-reader announcement of slide changes */}
        <span className="sr-only" aria-live="polite" aria-atomic="true">
          {total > 0
            ? `Slide ${selectedIndex + 1} of ${total}`
            : undefined}
        </span>
      </div>
    </CarouselContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Content — auto-labels slides "Slide X of Y" when not provided
// ---------------------------------------------------------------------------

function CarouselContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel()

  const count = React.Children.count(children)
  const labeled = React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) return child
    const existing = (child.props as { "aria-label"?: string })[
      "aria-label"
    ]
    if (existing) return child
    return React.cloneElement(child as React.ReactElement<any>, {
      "aria-label": `Slide ${index + 1} of ${count}`,
    })
  })

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      >
        {labeled ?? children}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Item
// ---------------------------------------------------------------------------

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel()

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -left-12 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      aria-label="Previous slide"
      {...props}
    >
      <ArrowLeft className="size-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -right-12 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      aria-label="Next slide"
      {...props}
    >
      <ArrowRight className="size-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}

// ---------------------------------------------------------------------------
// Dots — accessible pagination with 44px touch targets
// ---------------------------------------------------------------------------

function CarouselDots({ className, ...props }: React.ComponentProps<"div">) {
  const { scrollSnaps, selectedIndex, scrollTo } = useCarousel()

  if (scrollSnaps.length <= 1) return null

  return (
    <div
      data-slot="carousel-dots"
      role="tablist"
      aria-label="Slide navigation"
      className={cn("flex items-center justify-center gap-0.5", className)}
      {...props}
    >
      {scrollSnaps.map((_, index) => {
        const selected = index === selectedIndex
        return (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => scrollTo(index)}
            className="flex size-9 cursor-pointer items-center justify-center rounded-full outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span
              aria-hidden="true"
              className={cn(
                "h-2 rounded-full transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                selected
                  ? "w-6 bg-foreground"
                  : "w-2 bg-foreground/25 hover:bg-foreground/50"
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Counter — "Slide X of Y" numbers pagination
// ---------------------------------------------------------------------------

function CarouselCounter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { selectedIndex, scrollSnaps } = useCarousel()
  const total = scrollSnaps.length || 1

  return (
    <div
      data-slot="carousel-counter"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        "text-xs font-medium tabular-nums text-muted-foreground",
        className
      )}
      {...props}
    >
      Slide {selectedIndex + 1} of {total}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Progress — linear progressbar pagination
// ---------------------------------------------------------------------------

function CarouselProgress({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { selectedIndex, scrollSnaps } = useCarousel()
  const total = scrollSnaps.length || 1
  const value = ((selectedIndex + 1) / total) * 100

  return (
    <div
      data-slot="carousel-progress"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={selectedIndex + 1}
      aria-label={`Slide ${selectedIndex + 1} of ${total}`}
      className={cn(
        "h-1 w-full overflow-hidden rounded-full bg-foreground/10",
        className
      )}
      {...props}
    >
      <div
        className="h-full rounded-full bg-foreground transition-[width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Play / pause toggle for autoplay (WCAG: visible control required)
// ---------------------------------------------------------------------------

function CarouselPlayButton({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { isPlaying, setIsPlaying, autoplayEnabled } = useCarousel()

  if (!autoplayEnabled) return null

  return (
    <Button
      data-slot="carousel-play-button"
      variant={variant}
      size={size}
      aria-label={isPlaying ? "Pause autoplay" : "Play autoplay"}
      aria-pressed={isPlaying}
      onClick={() => setIsPlaying(!isPlaying)}
      className={cn("size-8 rounded-full", className)}
      {...props}
    >
      {isPlaying ? (
        <Pause className="size-4" />
      ) : (
        <Play className="size-4" />
      )}
      <span className="sr-only">
        {isPlaying ? "Pause autoplay" : "Play autoplay"}
      </span>
    </Button>
  )
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
  CarouselCounter,
  CarouselProgress,
  CarouselPlayButton,
  useCarousel,
}
