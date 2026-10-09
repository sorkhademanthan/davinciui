"use client"

import {
  AlertTriangle,
  ArrowRight,
  Braces,
  Check,
  CheckCircle2,
  Code2,
  Download,
  FileJson,
  FileText,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react"
import Link from "next/link"
import { useMemo, useState, type ReactNode } from "react"
import { CopyButton } from "@/components/copy-button"
import { DocsSnippet } from "@/components/docs-snippet"
import type { DesignSystemConfig } from "@/lib/design-system/domain"
import { track } from "@/lib/analytics"
import {
  prepareDesignSystemExport,
  exportFailureMessage,
  serializeDesignSystemCss,
  serializeDesignSystemJson,
  type DesignSystemExportModel,
} from "@/lib/design-system/export"

type DownloadKind = "pdf" | "json" | "css"
type DownloadState = { kind: DownloadKind; phase: "working" | "done" | "error"; message: string } | null

export function DesignSystemExport({ system }: { system: DesignSystemConfig }) {
  const prepared = useMemo(() => prepareDesignSystemExport(system), [system])
  const [downloadState, setDownloadState] = useState<DownloadState>(null)
  const report = prepared.ok ? prepared.model.report : prepared.report
  const model = prepared.ok ? prepared.model : null
  // Memoized so the one-click Copy button and the CSS download share the
  // exact same generated text without recomputing on every render.
  const cssText = useMemo(
    () => (model ? serializeDesignSystemCss(model.system) : ""),
    [model],
  )
  const blockingErrors = prepared.ok ? [] : prepared.errors
  const warningCount = report.summary.warnings

  async function download(kind: DownloadKind) {
    if (!model || downloadState?.phase === "working") return
    const filename = `${model.filenameBase}.${kind}`
    setDownloadState({ kind, phase: "working", message: kind === "pdf" ? "Building your handbook..." : `Preparing ${kind.toUpperCase()}...` })
    try {
      if (kind === "pdf") {
        const [{ pdf }, { DesignSystemExportDocument }] = await Promise.all([
          import("@react-pdf/renderer"),
          import("@/components/design-system/design-system-export-document"),
        ])
        const blob = await pdf(<DesignSystemExportDocument model={model} />).toBlob()
        triggerDownload(blob, filename)
      } else {
        const content = kind === "json" ? serializeDesignSystemJson(model.system) : cssText
        const mime = kind === "json" ? "application/json;charset=utf-8" : "text/css;charset=utf-8"
        triggerDownload(new Blob([content], { type: mime }), filename)
      }
      setDownloadState({ kind, phase: "done", message: `${filename} downloaded.` })
      track("design_system_exported", { format: kind })
    } catch (error) {
      setDownloadState({ kind, phase: "error", message: exportFailureMessage(error, kind) })
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Design System / Handoff"
        title="Export your system"
        description="Create a structured handbook for people and clean token files for product code. Everything is generated privately in this browser."
        action={<PrivacyBadge />}
      />

      <ReadinessCard system={system} model={model} errors={blockingErrors} warningCount={warningCount} />

      {model ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <main className="min-w-0 space-y-6">
            <section aria-labelledby="pdf-export-heading" className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="border-b border-border p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
                      <FileText className="size-5" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 id="pdf-export-heading" className="text-lg font-semibold">Design-system handbook</h2>
                        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">Recommended</span>
                      </div>
                      <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">An editorial, paginated handbook with visual specimens, technical references, theme previews, and a clean system-health summary.</p>
                    </div>
                  </div>
                  <DownloadButton kind="pdf" state={downloadState} onClick={() => void download("pdf")} primary />
                </div>
              </div>
              <div className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                <DocumentFact label="Chapters" value={`${model.chapters.length} structured sections`} />
                <DocumentFact label="Themes" value={`${model.system.themes.length} documented`} />
                <DocumentFact label="PDF contents" value="Clean handbook only" />
              </div>
            </section>

            <section aria-labelledby="developer-files-heading" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div className="max-w-2xl">
                <h2 id="developer-files-heading" className="text-lg font-semibold">Developer files</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Use JSON to preserve the full editable system. Use CSS when the product needs resolved variables immediately.</p>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <DeveloperFile
                  icon={<FileJson className="size-5" aria-hidden="true" />}
                  title="Tokens JSON"
                  description="Canonical data that can be imported into DavinciUI again without losing editable values."
                  kind="json"
                  state={downloadState}
                  onClick={() => void download("json")}
                  footer={
                    <p className="mt-3 text-xs leading-5 text-muted-foreground">
                      Re-import anytime from{" "}
                      <Link href="/design-system" className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80">
                        Design systems → Import
                      </Link>
                      .
                    </p>
                  }
                />
                <DeveloperFile
                  icon={<Code2 className="size-5" aria-hidden="true" />}
                  title="CSS variables"
                  description="Foundation variables plus resolved semantic roles for every saved theme."
                  kind="css"
                  state={downloadState}
                  onClick={() => void download("css")}
                  copyText={cssText}
                />
              </div>
            </section>

            <UsageSection />

            <section aria-labelledby="included-heading" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <h2 id="included-heading" className="text-lg font-semibold">What the handbook includes</h2>
              <p className="mt-1 text-sm text-muted-foreground">The contents follow the same order your team should use when applying the system.</p>
              <ol className="mt-5 grid gap-x-6 gap-y-1 sm:grid-cols-2">
                {model.chapters.map((chapter) => (
                  <li key={chapter.id} className="flex gap-3 border-b border-border/70 py-3 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0">
                    <span className="mt-0.5 text-xs font-semibold tabular-nums text-muted-foreground">{chapter.number}</span>
                    <div><p className="text-sm font-medium">{chapter.title}</p><p className="mt-0.5 text-xs leading-5 text-muted-foreground">{chapter.description}</p></div>
                  </li>
                ))}
              </ol>
            </section>
          </main>

          <aside className="min-w-0 space-y-4 xl:sticky xl:top-20 xl:self-start">
            <DocumentPreview model={model} />
            <LocalOnlyNote />
          </aside>
        </div>
      ) : (
        <BlockedState systemId={system.id} errors={blockingErrors} />
      )}

      <div className="sr-only" role="status" aria-live="polite">{downloadState?.message}</div>
      {downloadState && downloadState.phase !== "working" && (
        <div className={`mt-4 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${downloadState.phase === "done" ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300" : "border-destructive/30 bg-destructive/5 text-destructive"}`} role={downloadState.phase === "error" ? "alert" : "status"}>
          {downloadState.phase === "done" ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> : <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}
          <p>{downloadState.message}</p>
        </div>
      )}
    </>
  )
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6"><div><p className="text-xs text-muted-foreground">{eyebrow}</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p></div>{action}</header>
}

function PrivacyBadge() {
  return <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-border bg-muted/40 px-3 text-xs font-medium text-muted-foreground"><LockKeyhole className="size-3.5" aria-hidden="true" />Local export</span>
}

function ReadinessCard({ system, model, errors, warningCount }: { system: DesignSystemConfig; model: DesignSystemExportModel | null; errors: Array<{ id: string }>; warningCount: number }) {
  const ready = model !== null
  return (
    <section aria-label="Export readiness" className={`mt-6 overflow-hidden rounded-2xl border ${ready ? "border-emerald-500/25 bg-emerald-500/[0.04]" : "border-destructive/30 bg-destructive/[0.04]"}`}>
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex min-w-0 gap-3">
          <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${ready ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-destructive/10 text-destructive"}`}>
            {ready ? <ShieldCheck className="size-5" aria-hidden="true" /> : <AlertTriangle className="size-5" aria-hidden="true" />}
          </div>
          <div>
            <h2 className="font-semibold">{ready ? (warningCount > 0 ? "Ready with review notes" : "Ready to export") : "Export is blocked"}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{ready ? (warningCount > 0 && model ? `${warningCount} non-blocking warning${warningCount === 1 ? "" : "s"} remain available in Validate and are excluded from the downloaded handbook.` : "No automated blockers or warnings were found in the saved system.") : `${errors.length} blocker${errors.length === 1 ? "" : "s"} must be resolved before a reliable document can be generated.`}</p>
          </div>
        </div>
        {!ready && <Link href={`/design-system/${system.id}/validate`} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">Fix blockers <ArrowRight className="size-4" aria-hidden="true" /></Link>}
      </div>
    </section>
  )
}

function DownloadButton({ kind, state, onClick, primary = false }: { kind: DownloadKind; state: DownloadState; onClick: () => void; primary?: boolean }) {
  const working = state?.kind === kind && state.phase === "working"
  return <button type="button" onClick={onClick} disabled={state?.phase === "working"} className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 ${primary ? "bg-foreground text-background hover:bg-foreground/90" : "border border-border bg-background hover:bg-muted"}`}>{working ? <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Download className="size-4" aria-hidden="true" />}{working ? "Preparing..." : `Download ${kind.toUpperCase()}`}</button>
}

function DocumentFact({ label, value }: { label: string; value: string }) {
  return <div className="px-5 py-4 sm:px-6"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-sm font-medium">{value}</p></div>
}

function DeveloperFile({ icon, title, description, kind, state, onClick, copyText, footer }: { icon: ReactNode; title: string; description: string; kind: DownloadKind; state: DownloadState; onClick: () => void; copyText?: string; footer?: ReactNode }) {
  return <article className="flex min-w-0 flex-col rounded-xl border border-border bg-background p-4"><div className="flex size-9 items-center justify-center rounded-lg bg-muted text-foreground">{icon}</div><h3 className="mt-4 text-sm font-semibold">{title}</h3><p className="mt-1 flex-1 text-xs leading-5 text-muted-foreground">{description}</p><div className="mt-4 flex items-center gap-2"><div className="flex-1"><DownloadButton kind={kind} state={state} onClick={onClick} /></div>{copyText ? <CopyButton code={copyText} absolute={false} className="rounded-lg border border-border" /> : null}</div>{footer}</article>
}

function UsageSection() {
  return (
    <section aria-labelledby="usage-heading" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 id="usage-heading" className="text-lg font-semibold">Use it in your project</h2>
      <p className="mt-1 text-sm text-muted-foreground">Three steps from export to running product code.</p>
      <ol className="mt-5 space-y-5">
        <li>
          <p className="text-sm font-medium"><span className="mr-2 inline-grid size-5 place-items-center rounded-full bg-muted text-[11px] font-semibold">1</span>Add the variables</p>
          <p className="mt-1.5 text-xs leading-5 text-muted-foreground">Copy or download the CSS above and paste it into your global stylesheet (e.g. <code className="rounded bg-muted px-1 py-0.5 font-mono">app/globals.css</code>), after Tailwind. Every token ships as a <code className="rounded bg-muted px-1 py-0.5 font-mono">--ds-*</code> variable.</p>
        </li>
        <li>
          <p className="text-sm font-medium"><span className="mr-2 inline-grid size-5 place-items-center rounded-full bg-muted text-[11px] font-semibold">2</span>Set the active theme</p>
          <p className="mt-1.5 text-xs leading-5 text-muted-foreground">Semantic roles resolve per theme through a <code className="rounded bg-muted px-1 py-0.5 font-mono">data-ds-theme</code> attribute. Put it on <code className="rounded bg-muted px-1 py-0.5 font-mono">&lt;html&gt;</code> and swap the value to switch themes:</p>
          <div className="mt-2.5"><DocsSnippet variant="muted" code={`<html data-ds-theme="dark">\n  <!-- … -->\n</html>\n\n// Switch at runtime:\ndocument.documentElement.dataset.dsTheme = "light"`} /></div>
        </li>
        <li>
          <p className="text-sm font-medium"><span className="mr-2 inline-grid size-5 place-items-center rounded-full bg-muted text-[11px] font-semibold">3</span>Reference the tokens</p>
          <p className="mt-1.5 text-xs leading-5 text-muted-foreground">Use any <code className="rounded bg-muted px-1 py-0.5 font-mono">--ds-*</code> name from the file — pick exact names from your download:</p>
          <div className="mt-2.5"><DocsSnippet variant="muted" code={`.card {\n  background: var(--ds-surface);\n  color: var(--ds-text);\n  border-radius: var(--ds-radius-md);\n}`} /></div>
        </li>
      </ol>
    </section>
  )
}

function DocumentPreview({ model }: { model: DesignSystemExportModel }) {
  const palettes = model.system.foundations.colors.palettes.filter((palette) => palette.enabled).slice(0, 5)
  return (
    <section aria-labelledby="document-preview-heading" className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border p-4"><h2 id="document-preview-heading" className="text-sm font-semibold">Document preview</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">A4 portrait with repeating headers, page numbers, and linked chapters.</p></div>
      <div className="bg-muted/50 p-5">
        <div className="mx-auto aspect-[1/1.414] max-w-[220px] overflow-hidden rounded-sm bg-zinc-950 p-5 text-white shadow-xl ring-1 ring-black/10">
          <div className="flex items-center justify-between text-[6px] font-semibold tracking-wider text-zinc-300"><span>DAVINCIUI</span><span className="font-normal text-zinc-500">DESIGN SYSTEM</span></div>
          <div className="mt-10 grid grid-cols-[1fr_70px] gap-4">
            <div><p className="text-[6px] text-zinc-500">SPECIFICATION / {model.system.meta.version}</p><p className="mt-2 break-words text-[18px] font-semibold leading-[0.98] tracking-tight">{model.system.meta.name}<br />Design system</p></div>
            <div className="border border-zinc-700 p-2"><p className="text-lg font-semibold">Aa</p><div className="mt-4 flex gap-1">{palettes.map((palette) => <span key={palette.id} className="size-2 rounded-full" style={{ backgroundColor: palette.base }} />)}</div><div className="mt-4 flex items-end gap-1">{[3, 6, 9, 13].map((height) => <span key={height} className="w-1 bg-zinc-600" style={{ height }} />)}</div></div>
          </div>
          <p className="mt-4 max-w-[130px] text-[6px] leading-3 text-zinc-500">A visual handbook and technical reference generated from the saved system.</p>
          <div className="mt-10 border-t border-zinc-800 pt-2 text-[5px] text-zinc-500">SYSTEM FINGERPRINT / A4</div>
        </div>
      </div>
      <div className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Check className="size-3.5 text-emerald-600" aria-hidden="true" /><span>Clickable editorial contents</span></div><div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"><Check className="size-3.5 text-emerald-600" aria-hidden="true" /><span>Visual specimens plus references</span></div><div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"><Check className="size-3.5 text-emerald-600" aria-hidden="true" /><span>Clean system-health summary</span></div></div>
    </section>
  )
}

function LocalOnlyNote() {
  return <section className="rounded-2xl border border-border bg-card p-4"><div className="flex items-start gap-3"><Braces className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><div><h2 className="text-sm font-semibold">Private by default</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">Files are assembled from the saved browser copy. Nothing is uploaded to a server or stored in a database.</p></div></div></section>
}

function BlockedState({ systemId, errors }: { systemId: string; errors: Array<{ id: string; title: string }> }) {
  return <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6"><div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive"><AlertTriangle className="size-5" aria-hidden="true" /></div><h2 className="mt-4 text-lg font-semibold">Resolve blockers before exporting</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">This prevents unresolved references or invalid values from becoming an unreliable handoff document.</p><ul className="mt-5 space-y-2">{errors.slice(0, 4).map((error) => <li key={error.id} className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">{error.title}</li>)}</ul><Link href={`/design-system/${systemId}/validate`} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background">Open Validate <ArrowRight className="size-4" aria-hidden="true" /></Link></section>
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.rel = "noopener"
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
}
