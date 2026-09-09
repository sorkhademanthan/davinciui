import { DocsPageLayout } from "@/components/docs-page-layout"
import {
  CarouselApiPreview,
  CarouselAutoplayPreview,
  CarouselCounterPreview,
  CarouselDotsPreview,
  CarouselHeroPreview,
  CarouselOrientationPreview,
  CarouselPeekPreview,
  CarouselPreview,
  CarouselProgressPreview,
  CarouselSizePreview,
  CarouselSpacingPreview,
  CarouselThumbnailsPreview,
} from "@/components/docs/previews/carousel-preview"
import { readComponentSource } from "@/lib/source-code"

const importCode = `import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"`

const defaultCode = `import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export function CarouselDemo() {
  return (
    <Carousel className="w-full max-w-xs">
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="text-4xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}`

export async function CarouselDocs() {
  const sourceCode =
    (await readComponentSource("carousel")) || "// Unable to load source code"

  return (
    <DocsPageLayout
      title="Carousel"
      description="A carousel with motion and swipe built using Embla."
      preview={<CarouselPreview />}
      previewCode={defaultCode}
      installPackageName="carousel"
      installDependencies="embla-carousel-react"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/carousel.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      examples={[
        {
          title: "Sizes",
          preview: <CarouselSizePreview />,
          code: `// 33% of the carousel width.
<Carousel>
  <CarouselContent>
    <CarouselItem className="basis-1/3">...</CarouselItem>
    <CarouselItem className="basis-1/3">...</CarouselItem>
    <CarouselItem className="basis-1/3">...</CarouselItem>
  </CarouselContent>
</Carousel>

// 50% on small screens and 33% on larger screens.
<Carousel>
  <CarouselContent>
    <CarouselItem className="md:basis-1/2 lg:basis-1/3">...</CarouselItem>
    <CarouselItem className="md:basis-1/2 lg:basis-1/3">...</CarouselItem>
    <CarouselItem className="md:basis-1/2 lg:basis-1/3">...</CarouselItem>
  </CarouselContent>
</Carousel>`,
        },
        {
          title: "Spacing",
          preview: <CarouselSpacingPreview />,
          code: `<Carousel>
  <CarouselContent className="-ml-4">
    <CarouselItem className="pl-4">...</CarouselItem>
    <CarouselItem className="pl-4">...</CarouselItem>
    <CarouselItem className="pl-4">...</CarouselItem>
  </CarouselContent>
</Carousel>

<Carousel>
  <CarouselContent className="-ml-2 md:-ml-4">
    <CarouselItem className="pl-2 md:pl-4">...</CarouselItem>
    <CarouselItem className="pl-2 md:pl-4">...</CarouselItem>
    <CarouselItem className="pl-2 md:pl-4">...</CarouselItem>
  </CarouselContent>
</Carousel>`,
        },
        {
          title: "Orientation",
          preview: <CarouselOrientationPreview />,
          code: `<Carousel orientation="vertical | horizontal">
  <CarouselContent>
    <CarouselItem>...</CarouselItem>
    <CarouselItem>...</CarouselItem>
    <CarouselItem>...</CarouselItem>
  </CarouselContent>
</Carousel>`,
        },
        {
          title: "Dots",
          preview: <CarouselDotsPreview />,
          code: `import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

<Carousel ariaLabel="Featured items">
  <CarouselContent>
    <CarouselItem>...</CarouselItem>
    <CarouselItem>...</CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
  <CarouselDots />
</Carousel>`,
        },
        {
          title: "Counter",
          preview: <CarouselCounterPreview />,
          code: `<Carousel ariaLabel="Gallery with counter">
  <CarouselContent>
    <CarouselItem>...</CarouselItem>
  </CarouselContent>
  <CarouselCounter />
</Carousel>`,
        },
        {
          title: "Progress",
          preview: <CarouselProgressPreview />,
          code: `<Carousel ariaLabel="Gallery with progress">
  <CarouselContent>
    <CarouselItem>...</CarouselItem>
  </CarouselContent>
  <CarouselProgress />
</Carousel>`,
        },
        {
          title: "Autoplay",
          preview: <CarouselAutoplayPreview />,
          code: `// Off by default; pauses on hover/focus with visible play/pause.
<Carousel autoplay autoplayInterval={5000} opts={{ loop: true }} ariaLabel="Autoplaying highlights">
  <CarouselContent>
    <CarouselItem>...</CarouselItem>
  </CarouselContent>
  <CarouselPlayButton />
  <CarouselDots />
</Carousel>`,
        },
        {
          title: "Peek",
          preview: <CarouselPeekPreview />,
          code: `<Carousel opts={{ align: "start", containScroll: "trimSnaps" }}>
  <CarouselContent className="-ml-3">
    <CarouselItem className="basis-[78%] pl-3 sm:basis-1/3">...</CarouselItem>
    <CarouselItem className="basis-[78%] pl-3 sm:basis-1/3">...</CarouselItem>
  </CarouselContent>
</Carousel>`,
        },
        {
          title: "Thumbnails",
          preview: <CarouselThumbnailsPreview />,
          code: `// Thumbnail-driven gallery: eager first image (LCP), lazy rest.
<Carousel setApi={setApi}>
  <CarouselContent>
    <CarouselItem>
      <img src="..." alt="Gallery image 1" loading="eager" />
    </CarouselItem>
    <CarouselItem>
      <img src="..." alt="Gallery image 2" loading="lazy" />
    </CarouselItem>
  </CarouselContent>
</Carousel>
// Thumbnails: buttons with role="tab", aria-selected, api.scrollTo(i)`,
        },
        {
          title: "Hero",
          preview: <CarouselHeroPreview />,
          code: `<Carousel opts={{ loop: true }} ariaLabel="Featured stories">
  <CarouselContent>
    <CarouselItem>
      <h3>Design beyond defaults</h3>
      <p>A carousel that feels inevitable.</p>
      <Button>Explore components</Button>
    </CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
  <CarouselDots />
</Carousel>`,
        },
        {
          title: "API",
          preview: <CarouselApiPreview />,
          code: `import { type CarouselApi } from "@/components/ui/carousel"

export function Example() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  return (
    <Carousel setApi={setApi}>
      <CarouselContent>
        <CarouselItem>...</CarouselItem>
        <CarouselItem>...</CarouselItem>
        <CarouselItem>...</CarouselItem>
      </CarouselContent>
    </Carousel>
  )
}`,
        },
      ]}
      props={[
        {
          name: "Carousel",
          type: "Component",
          description: "Root container. Wraps all carousel parts.",
        },
        {
          name: "CarouselContent",
          type: "Component",
          description: "Scrollable container that holds CarouselItem elements.",
        },
        {
          name: "CarouselItem",
          type: "Component",
          description: "Single slide. Use basis-* utilities to control visible count.",
        },
        {
          name: "CarouselPrevious / CarouselNext",
          type: "Component",
          description: "Navigation buttons. Disabled automatically at bounds.",
        },
        {
          name: "CarouselDots",
          type: "Component",
          description: "Accessible pill pagination (tablist). 44px touch targets, aria-selected, auto-expanding active dot.",
        },
        {
          name: "CarouselCounter",
          type: "Component",
          description: "Numbers pagination with aria-live announcement (Slide X of Y).",
        },
        {
          name: "CarouselProgress",
          type: "Component",
          description: "Linear progressbar pagination with role=progressbar and aria-valuenow.",
        },
        {
          name: "CarouselPlayButton",
          type: "Component",
          description: "Visible play/pause toggle for autoplay. Renders only when autoplay is enabled.",
        },
        {
          name: "autoplay",
          type: "boolean",
          default: "false",
          description: "Auto-advance slides. Off by default; disabled under prefers-reduced-motion.",
        },
        {
          name: "autoplayInterval",
          type: "number",
          default: "5000",
          description: "Delay between slides in ms. Use >= 5000 image-only, >= 7000 text-heavy.",
        },
        {
          name: "pauseOnHover / pauseOnFocus",
          type: "boolean",
          default: "true",
          description: "Pause autoplay while hovered or focused (WCAG requirement).",
        },
        {
          name: "ariaLabel",
          type: "string",
          default: '"Carousel"',
          description: "Accessible label for the carousel region. Slides auto-label as Slide X of Y.",
        },
        {
          name: "orientation",
          type: '"horizontal" | "vertical"',
          default: '"horizontal"',
          description: "Axis of the carousel. Sets Embla axis to x or y.",
        },
        {
          name: "opts",
          type: "CarouselOptions",
          description: "Embla options — e.g. { align: 'start', loop: true, direction: 'rtl' | 'ltr' }.",
        },
        {
          name: "plugins",
          type: "EmblaPluginType[]",
          description: "Embla plugins — e.g. Autoplay({ delay: 2000 }).",
        },
        {
          name: "setApi",
          type: "(api: CarouselApi) => void",
          description: "Receives the Embla API for imperative control (dots, current index, events).",
        },
        {
          name: "className",
          type: "string",
          description: "Additional CSS classes.",
        },
      ]}
    />
  )
}
