"use client"

import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronDown,
  ClipboardCheck,
  Eye,
  Info,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { useMemo, useState, type ReactNode } from "react"
import type { DesignSystemConfig } from "@/lib/design-system/domain"
import {
  validateDesignSystemReport,
  type ValidationFinding,
  type ValidationReport,
  type ValidationSeverity,
} from "@/lib/design-system/validation"

type Filter = "all" | "error" | "warning" | "passed"

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "All findings" },
  { id: "error", label: "Blockers" },
  { id: "warning", label: "Warnings" },
  { id: "passed", label: "Passed" },
]

/**
 * Read-only Validate workspace. The report is derived from the saved system;
 * controls only change how results are displayed and never mutate tokens.
 */
export function DesignSystemValidation({ system }: { system: DesignSystemConfig }) {
  const report = useMemo(
    () => validateDesignSystemReport(system, { systemId: system.id }),
    [system],
  )
  const [filter, setFilter] = useState<Filter>(() =>
    report.summary.errors > 0 ? "error" : report.summary.warnings > 0 ? "warning" : "all",
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
  const firstAction = report.groups
    .flatMap((group) => group.findings)
    .find((finding) => finding.severity === "error") ??
    report.groups.flatMap((group) => group.findings).find((finding) => finding.severity === "warning")

  return (
    <>
      <PageHeader
        eyebrow="Design System / Review"
        title="Is your system ready?"
        description="Run a final check across foundations, colour roles, themes, accessibility guidance, and export requirements."
        action={
          <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-border bg-muted/40 px-3 text-xs font-medium text-muted-foreground">
            <Eye className="size-3.5" aria-hidden="true" />
            Read only
          </span>
        }
      />

      <ReadinessHero report={report} firstAction={firstAction} systemId={system.id} />

      <section aria-labelledby="validation-results-heading" className="mt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="validation-results-heading" className="text-lg font-semibold">Review results</h2>
            <p className="mt-1 text-sm text-muted-foreground">Start with blockers, then review warnings before exporting.</p>
          </div>
          <p className="text-xs tabular-nums text-muted-foreground">
            {report.summary.errors + report.summary.warnings} need attention
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4" role="group" aria-label="Filter validation results">
          {FILTERS.map((option) => {
            const active = filter === option.id
            const count = countForFilter(report, option.id)
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setFilter(option.id)}
                aria-pressed={active}
                className={`min-h-16 bg-background px-3 py-2 text-left transition-colors focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none ${active ? "bg-foreground text-background" : "hover:bg-muted"}`}
              >
                <span className={`block text-[11px] ${active ? "text-background/70" : "text-muted-foreground"}`}>{option.label}</span>
                <span className="mt-0.5 block text-lg font-semibold tabular-nums">{count}</span>
              </button>
            )
          })}
        </div>

        {filter === "passed" ? (
          <PassedChecks checked={report.checked} passed={report.summary.passed} />
        ) : visibleCount === 0 ? (
          <EmptyState filtered={filter !== "all"} onShowAll={() => setFilter("all")} />
        ) : (
          <div className="mt-5 space-y-4">
            {visibleGroups
              .filter((group) => group.findings.length > 0)
              .map((group) => (
                <section key={group.id} aria-labelledby={`validate-group-${group.id}`} className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
                  <div className="border-b border-border bg-muted/20 px-4 py-3 sm:px-5 sm:py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 id={`validate-group-${group.id}`} className="text-sm font-semibold">{group.title}</h3>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] tabular-nums text-muted-foreground">{group.findings.length}</span>
                    </div>
                    <p className="mt-1 max-w-3xl text-xs leading-5 text-muted-foreground">{group.description}</p>
                  </div>
                  <ul className="divide-y divide-border">
                    {group.findings.map((finding) => (
                      <FindingCard key={finding.id} finding={finding} />
                    ))}
                  </ul>
                </section>
              ))}
          </div>
        )}
      </section>

      <details className="group mt-6 rounded-xl border border-border bg-background">
        <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none [&::-webkit-details-marker]:hidden">
          <ClipboardCheck className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          What this validation checks
          <span className="ml-auto text-xs font-normal text-muted-foreground">{report.checked.length} areas</span>
          <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
        </summary>
        <ul className="grid gap-2 border-t border-border px-4 py-4 sm:grid-cols-2">
          {report.checked.map((item) => (
            <li key={item} className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
              <Check className="mt-1 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </details>

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-muted/20 p-3 text-xs leading-5 text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>Automated contrast checks are guidance, not an accessibility certification. Test the finished product with keyboards, screen readers, zoom, and real content.</p>
      </div>
    </>
  )
}

function ReadinessHero({
  report,
  firstAction,
  systemId,
}: {
  report: ValidationReport
  firstAction?: ValidationFinding
  systemId: string
}) {
  const needsAttention = report.status === "needs-attention"
  const hasWarnings = report.status === "ready-with-warnings"
  const Icon = needsAttention ? ShieldAlert : ShieldCheck
  const total = report.summary.passed + report.summary.errors + report.summary.warnings + report.summary.infos
  const passedPercent = total === 0 ? 100 : Math.round((report.summary.passed / total) * 100)
  const tone = needsAttention
    ? "border-destructive/40 bg-destructive/5"
    : hasWarnings
      ? "border-amber-500/40 bg-amber-500/5"
      : "border-emerald-500/40 bg-emerald-500/5"
  const iconTone = needsAttention
    ? "bg-destructive/10 text-destructive"
    : hasWarnings
      ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
      : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
  const copy = needsAttention
    ? `${report.summary.errors} blocker${report.summary.errors === 1 ? "" : "s"} must be fixed before export.`
    : hasWarnings
      ? `Nothing blocks export. Review ${report.summary.warnings} warning${report.summary.warnings === 1 ? "" : "s"} before handoff.`
      : "No blockers or warnings were found. This system is ready for handoff."
  const actionHref = firstAction?.route ?? `/design-system/${systemId}/export`
  const actionLabel = firstAction?.severity === "error"
    ? "Fix first blocker"
    : firstAction
      ? "Review first warning"
      : "Continue to export"
  const progressLabel = needsAttention ? "Export blocked" : hasWarnings ? "Warnings remain" : "Ready to export"
  const progressTone = needsAttention ? "bg-destructive" : hasWarnings ? "bg-amber-500" : "bg-emerald-600 dark:bg-emerald-400"

  return (
    <section aria-labelledby="readiness-heading" role="status" className={`mt-6 overflow-hidden rounded-2xl border shadow-sm ${tone}`}>
      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="flex min-w-0 items-start gap-4">
          <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${iconTone}`}>
            <Icon className="size-6" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">Export readiness</p>
            <h2 id="readiness-heading" className="mt-1 text-xl font-semibold sm:text-2xl">{report.statusLabel}</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{copy}</p>
          </div>
        </div>
        <Link
          href={actionHref}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
        >
          {actionLabel}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="border-t border-current/10 bg-background/50 px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-medium">{report.summary.passed} checks passed</span>
          <span className="text-muted-foreground">{progressLabel}</span>
        </div>
        <div
          role="progressbar"
          aria-label={`${report.summary.passed} of ${total} checks passed`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={passedPercent}
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-border"
        >
          <div className={`h-full rounded-full transition-[width] motion-reduce:transition-none ${progressTone}`} style={{ width: `${passedPercent}%` }} />
        </div>
      </div>
    </section>
  )
}

function countForFilter(report: ValidationReport, filter: Filter): number {
  if (filter === "error") return report.summary.errors
  if (filter === "warning") return report.summary.warnings
  if (filter === "passed") return report.summary.passed
  return report.summary.errors + report.summary.warnings + report.summary.infos
}

function severityMeta(severity: ValidationSeverity): {
  Icon: typeof Info
  label: string
  iconClassName: string
  badgeClassName: string
} {
  if (severity === "error") {
    return {
      Icon: XCircle,
      label: "Blocker",
      iconClassName: "bg-destructive/10 text-destructive",
      badgeClassName: "bg-destructive/10 text-destructive",
    }
  }
  if (severity === "warning") {
    return {
      Icon: AlertTriangle,
      label: "Warning",
      iconClassName: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
      badgeClassName: "bg-amber-500/15 text-amber-800 dark:text-amber-200",
    }
  }
  return {
    Icon: Info,
    label: "Note",
    iconClassName: "bg-muted text-muted-foreground",
    badgeClassName: "bg-muted text-muted-foreground",
  }
}

function findingActionLabel(finding: ValidationFinding): string {
  if (finding.route === "/experience/components") return "Open component catalog"
  if (finding.route.endsWith("/tokens")) return "Open colour roles"
  if (finding.route.endsWith("/themes")) return "Open themes"
  if (finding.route.endsWith("/validate")) return "Review validation"
  if (finding.route.endsWith("/export")) return "Open export"
  return "Open the setting"
}

function FindingCard({ finding }: { finding: ValidationFinding }) {
  const { Icon, label, iconClassName, badgeClassName } = severityMeta(finding.severity)
  return (
    <li className="p-4 sm:p-5">
      <div className="flex min-w-0 items-start gap-3">
        <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${iconClassName}`}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="min-w-0 text-sm font-semibold">{finding.title}</h4>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${badgeClassName}`}>{label}</span>
          </div>
          <p className="mt-1.5 max-w-3xl text-xs leading-5 text-muted-foreground sm:text-[13px] sm:leading-6">{finding.explanation}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Link
              href={finding.route}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-border px-3 text-xs font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            >
              {findingActionLabel(finding)}
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
            <details className="group min-w-0">
              <summary className="cursor-pointer list-none text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                Technical details
              </summary>
              <p className="mt-2 max-w-full break-words rounded-lg bg-muted/50 p-2.5 font-mono text-[10px] leading-4 text-muted-foreground">
                {finding.affected} · {finding.path}
              </p>
            </details>
          </div>
        </div>
      </div>
    </li>
  )
}

function PassedChecks({ checked, passed }: { checked: string[]; passed: number }) {
  return (
    <section aria-labelledby="validate-passed" className="mt-5 overflow-hidden rounded-2xl border border-emerald-500/30 bg-background shadow-sm">
      <div className="border-b border-border bg-emerald-500/5 px-4 py-4 sm:px-5">
        <h3 id="validate-passed" className="flex items-center gap-2 text-sm font-semibold">
          <Check className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          Passed checks ({passed})
        </h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">These areas need no action.</p>
      </div>
      <ul className="grid gap-2 p-4 sm:grid-cols-2 sm:p-5">
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
    <section aria-labelledby="validate-empty" className="mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center sm:p-9">
      <span className="mx-auto grid size-11 place-items-center rounded-2xl bg-emerald-500/15">
        <Check className="size-5 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
      </span>
      <h3 id="validate-empty" className="mt-3 text-base font-semibold">{filtered ? "Nothing under this filter" : "No findings"}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">
        {filtered ? "Choose another result type to continue reviewing the system." : "No blockers, warnings, or notes were found."}
      </p>
      {filtered && (
        <button
          type="button"
          onClick={onShowAll}
          className="mt-4 inline-flex min-h-10 items-center rounded-xl border border-border px-4 text-xs font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        >
          Show all findings
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
        <h1 className="mt-2 text-3xl font-semibold text-balance">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action}
    </header>
  )
}
