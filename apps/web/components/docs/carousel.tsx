import { DocsPageLayout } from "@/components/docs-page-layout"
import {
  CarouselPreview,
  CarouselSizePreview,
  CarouselSpacingPreview,
  CarouselOrientationPreview,
  CarouselOptionsPreview,
  CarouselApiPreview,
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
          title: "Options",
          preview: <CarouselOptionsPreview />,
          code: `<Carousel
  opts={{
    align: "start",
    loop: true,
  }}
>
  <CarouselContent>
    <CarouselItem>...</CarouselItem>
    <CarouselItem>...</CarouselItem>
    <CarouselItem>...</CarouselItem>
  </CarouselContent>
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
