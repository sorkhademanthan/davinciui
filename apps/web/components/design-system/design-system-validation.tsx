"use client"

import {
  AlertTriangle,
  ArrowRight,
  Check,
  ClipboardCheck,
  Info,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { useMemo, useState, type ReactNode } from "react"
import type { DesignSystemConfig } from "@/lib/design-system/domain"
import {
  validateDesignSystemReport,
  type ValidationFinding,
  type ValidationSeverity,
} from "@/lib/design-system/validation"

type Filter = "all" | "error" | "warning" | "passed"

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "All" },
  { id: "error", label: "Errors" },
  { id: "warning", label: "Warnings" },
  { id: "passed", label: "Passed" },
]

/**
 * Read-only Validate workspace. Receives the system without any save
 * callback by construction: validation never modifies or saves the system,
 * and every control below only sets local page state (the active filter).
 */
export function DesignSystemValidation({ system }: { system: DesignSystemConfig }) {
  const [filter, setFilter] = useState<Filter>("all")
  const report = useMemo(
    () => validateDesignSystemReport(system, { systemId: system.id }),
    [system],
  )

  const visibleGroups = useMemo(
    () =>
      report.groups.map((group) => ({
        ...group,
        findings: group.findings.filter((finding) =>
          filter === "all" ? true : filter === "passed" ? false : finding.severity === filter,
        ),
      })),
    [report, filter],
  )
  const visibleCount = visibleGroups.reduce((total, group) => total + group.findings.length, 0)

  return (
    <>
      <PageHeader
        eyebrow="Design System / System"
        title="Validate"
        description="Is this system safe and ready to use or export? Every check below reads the saved configuration — nothing here changes or saves anything."
      />

      <StatusBanner status={report.status} label={report.statusLabel} summary={report.summary} />

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <CountCard label="Errors" value={report.summary.errors} tone="error" hint="Block export until fixed." />
        <CountCard label="Warnings" value={report.summary.warnings} tone="warning" hint="Ship with the export report." />
        <CountCard label="Passed checks" value={report.summary.passed} tone="passed" hint="Individual checks that passed." />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label="Filter validation results">
        <span className="text-xs font-medium text-muted-foreground">Show:</span>
        {FILTERS.map((option) => {
          const active = filter === option.id
          const count =
            option.id === "all"
              ? report.summary.errors + report.summary.warnings + report.summary.infos
              : option.id === "error"
                ? report.summary.errors
                : option.id === "warning"
                  ? report.summary.warnings
                  : report.summary.passed
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setFilter(option.id)}
              aria-pressed={active}
              className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {option.label}
              <span className={active ? "opacity-70" : "text-muted-foreground"}>({count})</span>
            </button>
          )
        })}
      </div>

      {filter === "passed" ? (
        <PassedChecks checked={report.checked} passed={report.summary.passed} />
      ) : visibleCount === 0 ? (
        <EmptyState
          filtered={filter !== "all"}
          onShowAll={() => setFilter("all")}
        />
      ) : (
        <div className="mt-6 space-y-8">
          {visibleGroups
            .filter((group) => group.findings.length > 0)
            .map((group) => (
              <section key={group.id} aria-labelledby={`validate-group-${group.id}`}>
                <h2 id={`validate-group-${group.id}`} className="text-sm font-semibold">
                  {group.title}
                  <span className="ml-2 font-normal text-muted-foreground">({group.findings.length})</span>
                </h2>
                <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">{group.description}</p>
                <ul className="mt-3 space-y-3">
                  {group.findings.map((finding) => (
                    <FindingCard key={finding.id} finding={finding} />
                  ))}
                </ul>
              </section>
            ))}
        </div>
      )}

      <details className="group mt-8 rounded-xl border border-border bg-background">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
          <ClipboardCheck className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          What we checked
          <span className="ml-auto text-xs font-normal text-muted-foreground group-open:hidden">Show</span>
          <span className="ml-auto hidden text-xs font-normal text-muted-foreground group-open:inline">Hide</span>
        </summary>
        <ul className="space-y-1.5 border-t border-border px-4 py-4">
          {report.checked.map((item) => (
            <li key={item} className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
              <Check className="mt-1 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </details>
    </>
  )
}

function StatusBanner({
  status,
  label,
  summary,
}: {
  status: "ready" | "ready-with-warnings" | "needs-attention"
  label: string
  summary: { errors: number; warnings: number; passed: number }
}) {
  const tone =
    status === "ready"
      ? "border-emerald-500/40 bg-emerald-500/10"
      : status === "ready-with-warnings"
        ? "border-amber-500/40 bg-amber-500/10"
        : "border-destructive/40 bg-destructive/10"
  const Icon = status === "ready" ? Check : status === "ready-with-warnings" ? AlertTriangle : XCircle
  const iconTone =
    status === "ready"
      ? "text-emerald-600 dark:text-emerald-400"
      : status === "ready-with-warnings"
        ? "text-amber-600 dark:text-amber-400"
        : "text-destructive"
  const copy =
    status === "ready"
      ? `${summary.passed} checks passed and nothing needs your attention. This system is safe to export.`
      : status === "ready-with-warnings"
        ? `No errors, but ${summary.warnings} warning${summary.warnings === 1 ? "" : "s"} deserve${summary.warnings === 1 ? "s" : ""} a look. Warnings do not block export — they travel with the export report.`
        : `${summary.errors} error${summary.errors === 1 ? "" : "s"} must be fixed before this system is safe to export. Each item below links to the editor that fixes it.`
  return (
    <div role="status" className={`mt-6 flex items-start gap-3 rounded-xl border p-4 sm:p-5 ${tone}`}>
      <span className={`grid size-10 shrink-0 place-items-center rounded-full bg-background ${iconTone}`}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h2 className="text-base font-semibold sm:text-lg">{label}</h2>
        <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">{copy}</p>
      </div>
    </div>
  )
}

function CountCard({
  label,
  value,
  tone,
  hint,
}: {
  label: string
  value: number
  tone: "error" | "warning" | "passed"
  hint: string
}) {
  const Icon = tone === "error" ? XCircle : tone === "warning" ? AlertTriangle : Check
  const iconTone =
    tone === "error"
      ? "text-destructive"
      : tone === "warning"
        ? "text-amber-600 dark:text-amber-400"
        : "text-emerald-600 dark:text-emerald-400"
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className={`size-3.5 ${iconTone}`} aria-hidden="true" />
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
    </div>
  )
}

function severityMeta(severity: ValidationSeverity): { Icon: typeof Info; label: string; className: string } {
  if (severity === "error") return { Icon: XCircle, label: "Error", className: "text-destructive" }
  if (severity === "warning") return { Icon: AlertTriangle, label: "Warning", className: "text-amber-600 dark:text-amber-400" }
  return { Icon: Info, label: "Note", className: "text-muted-foreground" }
}

function FindingCard({ finding }: { finding: ValidationFinding }) {
  const { Icon, label, className } = severityMeta(finding.severity)
  const opensComponentCatalog = finding.route === "/experience/components"
  return (
    <li className="rounded-xl border border-border bg-background p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium ${className}`}>
          <Icon className="size-3" aria-hidden="true" />
          {label}
        </span>
        <h3 className="min-w-0 flex-1 text-sm font-medium">{finding.title}</h3>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground sm:text-[13px] sm:leading-6">{finding.explanation}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="min-w-0 text-xs text-muted-foreground">
          Affected: <code className="break-all font-mono text-[11px] text-foreground">{finding.affected}</code>
        </p>
        <Link
          href={finding.route}
          className="ml-auto inline-flex min-h-9 items-center gap-1 rounded-lg border border-border px-3 text-xs font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {opensComponentCatalog ? "Open component catalog" : "Open in editor"}
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </li>
  )
}

function PassedChecks({ checked, passed }: { checked: string[]; passed: number }) {
  return (
    <section aria-labelledby="validate-passed" className="mt-6 rounded-xl border border-border bg-background p-4 sm:p-5">
      <h2 id="validate-passed" className="flex items-center gap-1.5 text-sm font-semibold">
        <Check className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        Passed checks ({passed})
      </h2>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        These areas were inspected and need no action. Individual passing assertions are counted above; the areas are listed below.
      </p>
      <ul className="mt-3 space-y-1.5">
        {checked.map((item) => (
          <li key={item} className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
            <Check className="mt-1 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}

function EmptyState({ filtered, onShowAll }: { filtered: boolean; onShowAll: () => void }) {
  return (
    <section aria-labelledby="validate-empty" className="mt-6 rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-6 text-center sm:p-10">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-500/15">
        <Check className="size-6 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
      </span>
      <h2 id="validate-empty" className="mt-4 text-lg font-semibold">
        {filtered ? "Nothing under this filter" : "Ready to export"}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {filtered
          ? "No findings match this severity filter. Everything else is either passing or listed under another filter."
          : "Every check passed — foundations resolve, tokens and themes are sound, components are ready, and contrast guidance is clear. This system is safe to use and export."}
      </p>
      {filtered && (
        <button
          type="button"
          onClick={onShowAll}
          className="mt-4 inline-flex min-h-9 items-center rounded-lg border border-border px-4 text-xs font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Show all results
        </button>
      )}
    </section>
  )
}

function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
      <div>
        <p className="text-xs text-muted-foreground">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </header>
  )
}
