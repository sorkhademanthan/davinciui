// apps/web/components/docs-page-layout.tsx
import type React from "react"
import Link from "next/link"
import { Suspense } from "react"
import { InstallCommand } from "@/components/install-command"
import { ImportCodeBlock } from "@/components/import-code-block"
import { DynamicCodeBlock } from "@/components/dynamic-code-block"
import { DocsPropsTable } from "@/components/docs-props-table"
import { DocsFooterSection } from "@/components/docs-footer-section"
import { ComponentPagination } from "@/components/component-pagination"
import { Section } from "@/components/component-layout"
import { DocsPreviewWrapper, type VariantItem } from "@/components/docs-preview-wrapper"
import { highlightCode } from "@/lib/shiki"
import { splitImportAndUsage, stripImportFromCode } from "@/lib/split-import"
import type { BundledLanguage } from "shiki"
import { FloatingDocsSidebarLazy } from "@/components/floating-docs-sidebar-lazy"
import { buildDocsPageMarkdown } from "@/lib/docs-page-markdown"
import { PageContextMenu } from "@/components/page-context-menu"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PropItem {
  name: string
  type: string
  default?: string
  description: string
}

export interface ExampleItem {
  title: string
  preview: React.ReactNode
  code: string
  fullWidth?: boolean
}

export interface DocsPageLayoutProps {
  title: string
  description: string
  preview: React.ReactNode
  previewCode: string
  installPackageName: string
  installDependencies?: string
  installSourceCode?: string
  installSourceFilename?: string
  importCode?: string | React.ReactNode
  usageCode: string | React.ReactNode
  examples?: ExampleItem[]
  props?: PropItem[]
  action?: React.ReactNode
  fullWidthPreview?: boolean
  /** Lets a component's right-side preview provide its own scroll surface. */
  scrollablePreview?: boolean
  unstyledPreview?: boolean
  type?: string
  dependencies?: string[]
  personalizeContent?: React.ReactNode
  hideDefaultPreviewVariant?: boolean
  hideExamples?: boolean
  installationNote?: React.ReactNode
  usageNote?: React.ReactNode
  /** Optional extra sections rendered after API Reference (e.g. Changelog). */
  afterContent?: React.ReactNode
}

function CodeBlockSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`h-48 w-full animate-pulse rounded-md border border-border bg-muted/40 ${className || ""}`}
    />
  )
}

function slugify(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-")
}

export async function DocsPageLayout({
  title,
  description,
  preview,
  installPackageName,
  installSourceCode,
  installDependencies,
  installSourceFilename,
  importCode,
  usageCode,
  examples = [],
  props = [],
  fullWidthPreview = false,
  scrollablePreview = false,
  personalizeContent,
  hideDefaultPreviewVariant = false,
  hideExamples = false,
  installationNote,
  usageNote,
  afterContent,
}: DocsPageLayoutProps) {

  const pageMarkdown = buildDocsPageMarkdown({
    title,
    description,
    installPackageName,
    installDependencies,
    installSourceCode,
    installSourceFilename,
    usageCode: typeof usageCode === "string" ? usageCode : "",
    examples,
    props,
  })

  // Auto-split import lines from usageCode for Import + Usage sections
  let resolvedImportCode = ""
  let resolvedUsageCode = ""
  let importHtml = ""
  let usageHtml = ""

  if (typeof usageCode === "string") {
    const split = splitImportAndUsage(usageCode)

    resolvedImportCode =
      typeof importCode === "string" && importCode.trim()
        ? importCode.trim()
        : split.importCode

    resolvedUsageCode = split.usageCode || usageCode.trim()

    // If usage still starts with imports (e.g. explicit importCode + full usageCode), strip them
    if (resolvedUsageCode.startsWith("import ")) {
      resolvedUsageCode = stripImportFromCode(resolvedUsageCode)
    }

    if (resolvedImportCode) {
      importHtml = await highlightCode(resolvedImportCode, "tsx" as BundledLanguage)
    }
    if (resolvedUsageCode) {
      usageHtml = await highlightCode(resolvedUsageCode, "tsx" as BundledLanguage)
    }
  }

  const variantCodes = hideExamples ? [] : examples.map((ex) => stripImportFromCode(ex.code || ""))
  const variantTitles = hideExamples ? [] : examples.map((ex) => ex.title)
  const visibleExamples = hideExamples ? [] : examples

  const toc: { title: string; id: string; depth: number }[] = [
    { title: "Installation", id: "installation", depth: 2 },
    { title: "Usage", id: "usage", depth: 2 },
    ...visibleExamples.map((ex) => ({ title: ex.title, id: slugify(ex.title), depth: 3 })),
    ...(props.length > 0 ? [{ title: "API Reference", id: "api-reference", depth: 2 }] : []),
  ]

  return (
    <div data-docs-layout className="w-full">
      {/* Mobile docs nav — inline, shadcn-style (was a fixed overlay cluster) */}
      <div className="border-b border-border/60 lg:hidden">
        <div className="flex items-center gap-2 px-4 py-2.5">
          <FloatingDocsSidebarLazy />
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/docs" className="shrink-0 transition-colors hover:text-foreground">
              Docs
            </Link>
            <ChevronRight className="size-3.5 shrink-0 opacity-50" aria-hidden="true" />
            <span className="truncate font-medium text-foreground">{title}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 md:py-8 lg:px-8 lg:py-10">
        <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_220px] xl:gap-10">
          {/* Article */}
          <article className="min-w-0">
            {/* Header — title row with actions, shadcn-style */}
            <header>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {title}
                </h1>
                <div className="shrink-0 pt-1">
                  <ComponentPagination currentSlug={installPackageName} />
                </div>
              </div>
              <p className="mt-3 max-w-2xl text-[15px] leading-7 text-muted-foreground">
                {description}
              </p>
              <div className="mt-4">
                <PageContextMenu content={pageMarkdown} />
              </div>
            </header>

            {/* Preview — sits directly under the header, shadcn-style */}
            <div
              className={cn(
                "mt-6 w-full overflow-hidden",
                scrollablePreview ? "max-h-[560px] min-h-[420px]" : "min-h-[420px] lg:min-h-[480px]",
              )}
            >
              <DocsPreviewWrapper
                fullWidthPreview={fullWidthPreview}
                scrollablePreview={scrollablePreview}
                personalizeContent={personalizeContent}
                hideDefaultVariant={hideDefaultPreviewVariant}
                sourceCodeFilename={installSourceCode ? (installSourceFilename || `${installPackageName}.tsx`) : undefined}
                sourceCodeKey={installSourceCode ? installPackageName : undefined}
                variants={examples as VariantItem[]}
              >
                {preview}
              </DocsPreviewWrapper>
            </div>

            {/* Installation */}
            <Section title="Installation" className="mt-10 scroll-mt-24" id="installation">
              {installationNote && <div className="mb-4">{installationNote}</div>}
              <InstallCommand component={installPackageName} />
            </Section>

            {/* Usage */}
            <Section title="Usage" className="mt-10 scroll-mt-24" id="usage">
              {usageNote && <div className="mb-4">{usageNote}</div>}
              <div className="usage-code-scrollbar-none">
                {typeof usageCode === "string" ? (
                  resolvedUsageCode ? (
                    <Suspense fallback={<CodeBlockSkeleton />}>
                      {resolvedImportCode ? (
                        <div className="space-y-3">
                          <ImportCodeBlock html={importHtml} />
                          <DynamicCodeBlock
                            originalCode={resolvedUsageCode}
                            defaultHtml={usageHtml}
                            variantTitles={variantTitles}
                            variantCodes={variantCodes}
                            hideDefaultTab={hideDefaultPreviewVariant}
                          />
                        </div>
                      ) : (
                        <DynamicCodeBlock
                          originalCode={resolvedUsageCode}
                          defaultHtml={usageHtml}
                          variantTitles={variantTitles}
                          variantCodes={variantCodes}
                          hideDefaultTab={hideDefaultPreviewVariant}
                        />
                      )}
                    </Suspense>
                  ) : null
                ) : (
                  usageCode
                )}
              </div>
            </Section>

            {/* Composition callouts */}
            {title === "Dialog" && (
              <Section title="Composition" className="mt-10 scroll-mt-24">
                <div className="space-y-3">
                  <p className="text-sm leading-6 text-muted-foreground">Use the following composition to build a Dialog:</p>
                  <pre className="overflow-x-auto rounded-md border border-border bg-muted/40 p-4 font-mono text-xs leading-6">
{`Dialog
├── DialogTrigger
└── DialogContent
    ├── DialogHeader
    │   ├── DialogTitle
    │   └── DialogDescription
    └── DialogFooter`}
                  </pre>
                </div>
              </Section>
            )}
            {title === "Popover" && (
              <Section title="Composition" className="mt-10 scroll-mt-24">
                <div className="space-y-3">
                  <p className="text-sm leading-6 text-muted-foreground">Use the following composition to build a Popover:</p>
                  <pre className="overflow-x-auto rounded-md border border-border bg-muted/40 p-4 font-mono text-xs leading-6">
{`Popover
├── PopoverTrigger
└── PopoverContent`}
                  </pre>
                </div>
              </Section>
            )}
            {title === "Tooltip" && (
              <Section title="Composition" className="mt-10 scroll-mt-24">
                <div className="space-y-3">
                  <p className="text-sm leading-6 text-muted-foreground">Use the following composition to build a Tooltip:</p>
                  <pre className="overflow-x-auto rounded-md border border-border bg-muted/40 p-4 font-mono text-xs leading-6">
{`TooltipProvider
└── Tooltip
    ├── TooltipTrigger
    └── TooltipContent`}
                  </pre>
                </div>
              </Section>
            )}

            {title === "Card" && (
              <Section title="Composition" className="mt-10 scroll-mt-24">
                <div className="space-y-3">
                  <p className="text-sm leading-6 text-muted-foreground">Use the following composition to build a Card:</p>
                  <pre className="overflow-x-auto rounded-md border border-border bg-muted/40 p-4 font-mono text-xs leading-6">
{`Card
├── CardHeader
│   ├── CardTitle
│   ├── CardDescription
│   └── CardAction
├── CardContent
└── CardFooter`}
                  </pre>
                </div>
              </Section>
            )}

            {title === "Dropdown Menu" && (
              <Section title="Composition" className="mt-10 scroll-mt-24">
                <div className="space-y-3">
                  <p className="text-sm leading-6 text-muted-foreground">Use the following composition to build a Dropdown Menu:</p>
                  <pre className="overflow-x-auto rounded-md border border-border bg-muted/40 p-4 font-mono text-xs leading-6">
{`DropdownMenu
├── DropdownMenuTrigger
└── DropdownMenuContent
    ├── DropdownMenuLabel
    ├── DropdownMenuItem (+ Shortcut)
    ├── DropdownMenuSeparator
    ├── DropdownMenuCheckboxItem / RadioGroup + RadioItem
    └── DropdownMenuSub
        ├── DropdownMenuSubTrigger
        └── DropdownMenuSubContent`}
                  </pre>
                </div>
              </Section>
            )}

            {/* Examples */}
            {visibleExamples.length > 0 && (
              <div className="mt-4 space-y-8">
                {visibleExamples.map((ex) => (
                  <Section key={ex.title} title={ex.title} level={3} className="scroll-mt-24 pt-4" id={slugify(ex.title)}>
                    <div className="min-h-[280px] w-full overflow-hidden">
                      <DocsPreviewWrapper
                        personalizeContent={personalizeContent}
                        hideDefaultVariant
                        variants={[]}
                      >
                        {ex.preview}
                      </DocsPreviewWrapper>
                    </div>
                  </Section>
                ))}
              </div>
            )}

            {/* Props */}
            {props.length > 0 && (
              <Section title="API Reference" className="mt-10 scroll-mt-24" id="api-reference">
                <DocsPropsTable props={props} />
              </Section>
            )}

            {afterContent}

            <div className="mt-12 border-t pt-6">
              <DocsFooterSection />
            </div>
          </article>

          {/* Right rail — On This Page + promo card, shadcn-style */}
          <aside className="hidden xl:block">
            <div className="sticky top-24 max-h-[calc(100svh-7rem)] overflow-y-auto pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <p className="mb-2 text-xs font-medium text-muted-foreground">On This Page</p>
              <ul className="space-y-1 text-sm">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className={cn(
                        "block py-0.5 text-muted-foreground transition-colors hover:text-foreground",
                        item.depth === 3 && "pl-4",
                      )}
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="mt-6 rounded-xl bg-muted/60 p-5">
                <p className="text-[15px] font-semibold leading-snug tracking-tight">
                  Star DavinciUI on GitHub
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Free and open-source. A star keeps new components coming.
                </p>
                <a
                  href="https://github.com/sorkhademanthan/davinciui"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex h-8 items-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Star on GitHub
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
