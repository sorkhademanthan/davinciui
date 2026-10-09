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
import { DocsSnippet } from "@/components/docs-snippet"
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
  /** Accessibility behavior — rendered as its own section when provided. */
  accessibilityNote?: React.ReactNode
  /** Motion behavior and reduced-motion handling — rendered when provided. */
  motionNote?: React.ReactNode
  /** Customization guidance — rendered as its own section when provided. */
  customizationNote?: React.ReactNode
  /** Known constraints — rendered as their own section when provided. */
  constraintsNote?: React.ReactNode
  /** Related components or foundations — rendered as link pills when provided. */
  relatedLinks?: { title: string; href: string }[]
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
  unstyledPreview = false,
  personalizeContent,
  hideDefaultPreviewVariant = false,
  hideExamples = false,
  installationNote,
  usageNote,
  afterContent,
  accessibilityNote,
  motionNote,
  customizationNote,
  constraintsNote,
  relatedLinks = [],
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
        <div>
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
                "mt-6 grid w-full overflow-hidden",
                scrollablePreview ? "max-h-[560px] min-h-[420px]" : "min-h-[420px] lg:min-h-[480px]",
              )}
            >
              <DocsPreviewWrapper
                fullWidthPreview={fullWidthPreview}
                scrollablePreview={scrollablePreview}
                unstyledPreview={unstyledPreview}
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
                          <ImportCodeBlock html={importHtml} code={resolvedImportCode} />
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
                  <DocsSnippet
                    variant="muted"
                    code={`Dialog
├── DialogTrigger
└── DialogContent
    ├── DialogHeader
    │   ├── DialogTitle
    │   └── DialogDescription
    └── DialogFooter`}
                  />
                </div>
              </Section>
            )}
            {title === "Popover" && (
              <Section title="Composition" className="mt-10 scroll-mt-24">
                <div className="space-y-3">
                  <p className="text-sm leading-6 text-muted-foreground">Use the following composition to build a Popover:</p>
                  <DocsSnippet
                    variant="muted"
                    code={`Popover
├── PopoverTrigger
└── PopoverContent`}
                  />
                </div>
              </Section>
            )}
            {title === "Tooltip" && (
              <Section title="Composition" className="mt-10 scroll-mt-24">
                <div className="space-y-3">
                  <p className="text-sm leading-6 text-muted-foreground">Use the following composition to build a Tooltip:</p>
                  <DocsSnippet
                    variant="muted"
                    code={`TooltipProvider
└── Tooltip
    ├── TooltipTrigger
    └── TooltipContent`}
                  />
                </div>
              </Section>
            )}

            {title === "Card" && (
              <Section title="Composition" className="mt-10 scroll-mt-24">
                <div className="space-y-3">
                  <p className="text-sm leading-6 text-muted-foreground">Use the following composition to build a Card:</p>
                  <DocsSnippet
                    variant="muted"
                    code={`Card
├── CardHeader
│   ├── CardTitle
│   ├── CardDescription
│   └── CardAction
├── CardContent
└── CardFooter`}
                  />
                </div>
              </Section>
            )}

            {title === "Dropdown Menu" && (
              <Section title="Composition" className="mt-10 scroll-mt-24">
                <div className="space-y-3">
                  <p className="text-sm leading-6 text-muted-foreground">Use the following composition to build a Dropdown Menu:</p>
                  <DocsSnippet
                    variant="muted"
                    code={`DropdownMenu
├── DropdownMenuTrigger
└── DropdownMenuContent
    ├── DropdownMenuLabel
    ├── DropdownMenuItem (+ Shortcut)
    ├── DropdownMenuSeparator
    ├── DropdownMenuCheckboxItem / RadioGroup + RadioItem
    └── DropdownMenuSub
        ├── DropdownMenuSubTrigger
        └── DropdownMenuSubContent`}
                  />
                </div>
              </Section>
            )}

            {/* Examples */}
            {visibleExamples.length > 0 && (
              <div className="mt-4 space-y-8">
                {visibleExamples.map((ex) => (
                  <Section key={ex.title} title={ex.title} level={3} className="scroll-mt-24 pt-4" id={slugify(ex.title)}>
                    <div className="grid min-h-[280px] w-full overflow-hidden">
                      <DocsPreviewWrapper
                        unstyledPreview={unstyledPreview}
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

            {accessibilityNote && (
              <Section title="Accessibility" className="mt-10 scroll-mt-24" id="accessibility">
                <div className="text-sm leading-6 text-muted-foreground">{accessibilityNote}</div>
              </Section>
            )}

            {motionNote && (
              <Section title="Motion" className="mt-10 scroll-mt-24" id="motion">
                <div className="text-sm leading-6 text-muted-foreground">{motionNote}</div>
              </Section>
            )}

            {customizationNote && (
              <Section title="Customization" className="mt-10 scroll-mt-24" id="customization">
                <div className="text-sm leading-6 text-muted-foreground">{customizationNote}</div>
              </Section>
            )}

            {constraintsNote && (
              <Section title="Known constraints" className="mt-10 scroll-mt-24" id="known-constraints">
                <div className="text-sm leading-6 text-muted-foreground">{constraintsNote}</div>
              </Section>
            )}

            {relatedLinks.length > 0 && (
              <Section title="Related" className="mt-10 scroll-mt-24" id="related">
                <div className="flex flex-wrap gap-1.5">
                  {relatedLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-full border bg-background px-2.5 py-1 text-xs hover:bg-accent"
                    >
                      {link.title}
                    </Link>
                  ))}
                </div>
              </Section>
            )}

            {afterContent}

            <div className="mt-12 border-t pt-6">
              <DocsFooterSection />
            </div>
          </article>

        </div>
      </div>
    </div>
  )
}
