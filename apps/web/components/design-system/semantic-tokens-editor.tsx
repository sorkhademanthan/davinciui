"use client"

import {
  AlertTriangle,
  Check,
  Copy,
  Info,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react"
import { useMemo, useState, type ReactNode } from "react"
import type { DesignSystemConfig, SemanticCategory, SemanticToken } from "@/lib/design-system/domain"
import { isHexColor, resolveToken } from "@/lib/design-system/domain"
import { usePreviewTheme } from "@/components/design-system/use-preview-theme"
import {
  SEMANTIC_CATEGORIES,
  addMissingDefaults,
  canDeleteSemanticToken,
  categoryLabel,
  classifyValue,
  createSemanticToken,
  duplicateSemanticToken,
  findTokenReferences,
  formatChain,
  groupTokensByCategory,
  insertSemanticToken,
  isSemanticCategory,
  missingStandardTokens,
  removeSemanticToken,
  resetTokenToStarter,
  semanticIssues,
  slugifySemanticId,
  updateTokenCategory,
  updateTokenDescription,
  updateTokenLabel,
  updateTokenValue,
  usageCount,
  validReferenceCandidates,
} from "@/lib/design-system/semantic-tokens"

export function SemanticTokensEditor({
  system,
  save,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
}) {
  return (
    <>
      <PageHeader
        eyebrow="Design System / Semantic tokens"
        title="Colour roles"
        description="Give the colours you already chose a job: page background, main text, buttons, borders, and messages. Your components will use these roles everywhere."
      />
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          <MissingDefaultsBanner system={system} save={save} />
          <EssentialsBoard system={system} save={save} />
          <details className="rounded-xl border border-border bg-background">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 text-sm font-medium marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span>Advanced token settings</span>
              <span className="text-xs font-normal text-muted-foreground">
                Add custom roles, edit names, or see technical references
              </span>
            </summary>
            <div className="border-t border-border p-3 sm:p-5">
              <TokenGroups system={system} save={save} />
            </div>
          </details>
        </div>
        <SemanticPreview system={system} />
      </div>
    </>
  )
}

const STARTER_TOKEN_CHOICES = [
  { id: "background.canvas", label: "Page background", purpose: "The colour behind your whole website" },
  { id: "text.primary", label: "Main text", purpose: "Headings, labels, and important copy" },
  { id: "action.primary.background", label: "Main button", purpose: "The colour of the primary action people click" },
  { id: "action.primary.foreground", label: "Main button text", purpose: "Text that stays readable on the main button" },
  { id: "border.default", label: "Card and input border", purpose: "The quiet edge around cards, inputs, and sections" },
] as const

const MORE_TOKEN_GROUPS = [
  {
    title: "Cards and page layers",
    tokens: [
      { id: "surface.default", purpose: "Cards, panels, and menus" },
      { id: "surface.raised", purpose: "Floating cards and dialogs" },
      { id: "surface.sunken", purpose: "Inset areas and pressed surfaces" },
      { id: "background.subtle", purpose: "Quiet page sections" },
      { id: "background.inverse", purpose: "Dark or inverted sections" },
      { id: "text.inverse", purpose: "Text on dark or inverted sections" },
    ],
  },
  {
    title: "Supporting text and actions",
    tokens: [
      { id: "text.secondary", purpose: "Paragraphs and supporting copy" },
      { id: "text.muted", purpose: "Hints, captions, and metadata" },
      { id: "action.secondary.background", purpose: "Secondary button background" },
      { id: "action.secondary.foreground", purpose: "Text on secondary buttons" },
      { id: "focus.ring", purpose: "The visible keyboard focus outline" },
    ],
  },
  {
    title: "Success, warning, error, and information",
    tokens: [
      { id: "status.success.background", purpose: "Success message background" },
      { id: "status.success.foreground", purpose: "Success message text and icon" },
      { id: "status.warning.background", purpose: "Warning message background" },
      { id: "status.warning.foreground", purpose: "Warning message text and icon" },
      { id: "status.danger.background", purpose: "Error message background" },
      { id: "status.danger.foreground", purpose: "Error message text and icon" },
      { id: "status.info.background", purpose: "Information message background" },
      { id: "status.info.foreground", purpose: "Information message text and icon" },
    ],
  },
] as const

function EssentialsBoard({
  system,
  save,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
}) {
  const tokensById = new Map((system.semanticTokens ?? []).map((token) => [token.id, token]))
  const starterChoices = STARTER_TOKEN_CHOICES.map((entry) => ({
    ...entry,
    token: tokensById.get(entry.id),
  })).filter((entry): entry is (typeof STARTER_TOKEN_CHOICES)[number] & { token: SemanticToken } => Boolean(entry.token))
  const moreGroups = MORE_TOKEN_GROUPS.map((group) => ({
    ...group,
    tokens: group.tokens
      .map((entry) => ({ ...entry, token: tokensById.get(entry.id) }))
      .filter((entry): entry is (typeof group.tokens)[number] & { token: SemanticToken } => Boolean(entry.token)),
  })).filter((group) => group.tokens.length > 0)

  return (
    <section aria-label="Everyday colour roles" className="rounded-xl border border-border bg-background p-5">
      <div className="max-w-2xl">
        <h2 className="text-lg font-semibold">Start with five colour choices</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          These five choices are enough to make a clear, usable interface. Everything else already has sensible starter values.
        </p>
      </div>
      <ul className="mt-5 grid gap-2 lg:grid-cols-2">
        {starterChoices.map(({ token, label, purpose }) => (
          <SimpleTokenCard key={token.id} system={system} save={save} token={{ ...token, label }} purpose={purpose} />
        ))}
      </ul>
      {starterChoices.length === 0 && (
        <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
          Add the missing defaults above to start choosing your everyday colour roles.
        </p>
      )}
      <details className="mt-5 border-t border-border pt-3">
        <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Fine-tune more colours
        </summary>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Optional: adjust card layers, secondary actions, and message states when your product needs them.
        </p>
        <div className="mt-4 space-y-5">
          {moreGroups.map((group) => (
            <section key={group.title}>
              <h3 className="text-sm font-semibold">{group.title}</h3>
              <ul className="mt-2 grid gap-2 lg:grid-cols-2">
                {group.tokens.map(({ token, purpose }) => (
                  <SimpleTokenCard key={token.id} system={system} save={save} token={token} purpose={purpose} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </details>
      <details className="mt-3 text-xs text-muted-foreground">
        <summary className="inline-flex min-h-11 cursor-pointer items-center font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Need separate Light and Dark colours?
        </summary>
        <p className="mt-1 leading-5">
          First choose your shared base colours here. Then open Themes to give only the colours that need it a different Dark value.
        </p>
      </details>
    </section>
  )
}

function SimpleTokenCard({
  system,
  save,
  token,
  purpose,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
  token: SemanticToken
  purpose: string
}) {
  const [showPicker, setShowPicker] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const resolution = resolveToken(system, token.id)
  const resolved = resolution.status === "resolved" ? resolution.value : null

  const choose = (value: string) => {
    const result = updateTokenValue(system, token.id, value)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setError(null)
    setShowPicker(false)
    save(result.system)
  }

  return (
    <li className="rounded-lg border border-border p-3">
      <div className="flex min-w-0 items-center gap-3">
        <ResolvedSwatch resolution={resolution} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{token.label}</p>
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{purpose}</p>
        </div>
        <button
          onClick={() => setShowPicker((open) => !open)}
          aria-expanded={showPicker}
          aria-label={`Choose a colour for ${token.label}`}
          className="inline-flex min-h-11 shrink-0 items-center rounded-lg border border-border px-3 text-xs font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        >
          Change
        </button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground" title={resolved ?? token.value}>
        Current colour: <span className="font-medium text-foreground">{friendlyColourName(token.value)}</span>
      </p>
      {showPicker && (
        <ReferencePicker
          system={system}
          excludeId={token.id}
          current={token.value}
          onPick={choose}
          onClose={() => {
            setShowPicker(false)
            setError(null)
          }}
        />
      )}
      {error && <p role="alert" className="mt-2 text-xs font-medium text-destructive">{error}</p>}
    </li>
  )
}

function friendlyColourName(value: string): string {
  const isRawHex: boolean = isHexColor(value)
  if (isRawHex) return `Custom ${value.toUpperCase()}`
  const shade = value.match(/^([a-z0-9-]+)\.(\d+)$/i)
  if (shade) return `${shade[1]![0]!.toUpperCase()}${shade[1]!.slice(1)} ${shade[2]}`
  return "Matches another shared colour"
}

function MissingDefaultsBanner({
  system,
  save,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
}) {
  const missing = missingStandardTokens(system)
  const [added, setAdded] = useState<string[] | null>(null)
  if (missing.length === 0 && !added) return null
  return (
    <section
      aria-label="Missing standard tokens"
      className="rounded-xl border border-border bg-background p-5"
    >
      {missing.length > 0 ? (
        <>
          <h2 className="font-medium">Older system, newer baseline ({missing.length} missing)</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            This system predates the full baseline. Adding fills in only the absent standard
            tokens with starter-consistent values — your edits and custom tokens stay untouched:
          </p>
          <p className="mt-2 font-mono text-[11px] leading-5 text-muted-foreground">
            {missing.slice(0, 8).join(", ")}
            {missing.length > 8 ? ` and ${missing.length - 8} more` : ""}
          </p>
          <button
            onClick={() => {
              const result = addMissingDefaults(system)
              save(result.system)
              setAdded(result.added)
            }}
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add missing defaults
          </button>
        </>
      ) : (
        <p role="status" className="text-xs text-muted-foreground">
          <Check className="mr-1 inline size-4" aria-hidden="true" />
          Added {added?.length ?? 0} missing standard tokens. Nothing existing was changed.
        </p>
      )}
    </section>
  )
}

function TokenGroups({
  system,
  save,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
}) {
  const [showAdd, setShowAdd] = useState(false)
  const groups = groupTokensByCategory(system.semanticTokens ?? [])
  const issues = semanticIssues(system)

  return (
    <section aria-label="Semantic token groups" className="rounded-xl border border-border bg-background p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-medium">Tokens by category ({system.semanticTokens?.length ?? 0})</h2>
        <button
          onClick={() => setShowAdd((open) => !open)}
          aria-expanded={showAdd}
          aria-controls="add-semantic-token-form"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        >
          {showAdd ? <X className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
          {showAdd ? "Close" : "Add token"}
        </button>
      </div>
      {showAdd && <AddTokenForm system={system} save={save} onDone={() => setShowAdd(false)} />}
      <div className="mt-4 space-y-6">
        {groups.map((group) => (
          <div key={group.category}>
            <h3 className="text-sm font-semibold">
              {categoryLabel(group.category)}{" "}
              <span className="font-normal text-muted-foreground">({group.tokens.length})</span>
            </h3>
            <ul className="mt-2 space-y-2">
              {group.tokens.map((token) => (
                <TokenRow key={token.id} system={system} save={save} token={token} />
              ))}
            </ul>
          </div>
        ))}
      </div>
      {issues.length > 0 && (
        <div role="alert" className="mt-4 rounded-lg border border-destructive/40 p-3 text-xs text-destructive">
          {issues.map((issue) => (
            <p key={`${issue.path}-${issue.message}`}>{issue.message}</p>
          ))}
        </div>
      )}
    </section>
  )
}

function TokenRow({
  system,
  save,
  token,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
  token: SemanticToken
}) {
  const [labelDraft, setLabelDraft] = useState<string | null>(null)
  const [descriptionDraft, setDescriptionDraft] = useState<string | null>(null)
  const [labelError, setLabelError] = useState<string | null>(null)
  const [valueError, setValueError] = useState<string | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [confirmingReset, setConfirmingReset] = useState(false)

  const resolution = resolveToken(system, token.id)
  const classified = classifyValue(system, token.value)
  const usedBy = usageCount(system, token.id)
  const guard = canDeleteSemanticToken(system, token.id)
  const restorable = resetTokenToStarter(system, token.id) !== null

  const commitLabel = () => {
    const trimmed = (labelDraft ?? token.label).trim()
    if (!trimmed) {
      setLabelError("Label cannot be empty — keeping the previous label.")
      setLabelDraft(null)
      return
    }
    setLabelError(null)
    setLabelDraft(null)
    if (trimmed !== token.label) save(updateTokenLabel(system, token.id, trimmed))
  }

  const commitDescription = () => {
    const trimmed = (descriptionDraft ?? token.description ?? "").trim()
    if (trimmed === (token.description ?? "")) {
      setDescriptionDraft(null)
      return
    }
    save(updateTokenDescription(system, token.id, trimmed))
    setDescriptionDraft(null)
  }

  const pickValue = (value: string) => {
    const result = updateTokenValue(system, token.id, value)
    if (!result.ok) {
      setValueError(result.error)
      return
    }
    setValueError(null)
    setShowPicker(false)
    save(result.system)
  }

  return (
    <li className="rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="min-w-0 flex-1 basis-48">
          <p className="truncate text-[13px] font-medium">{labelDraft ?? token.label}</p>
          <p className="truncate font-mono text-[11px] text-muted-foreground">
            {token.id} · {categoryLabel(isSemanticCategory(token.category) ? token.category : "custom")}
          </p>
        </div>
        <ResolvedSwatch resolution={resolution} />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPicker((open) => !open)}
            aria-expanded={showPicker}
            aria-label={`Edit reference for ${token.id}, currently ${token.value}`}
            className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 font-mono text-[12px] transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          >
            {token.value}
          </button>
          {restorable &&
            (!confirmingReset ? (
              <button
                onClick={() => setConfirmingReset(true)}
                aria-label={`Reset ${token.id} to starter default`}
                title="Reset to starter default"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
              >
                <RotateCcw className="size-4" aria-hidden="true" />
              </button>
            ) : (
              <span className="flex items-center gap-2">
                <button
                  onClick={() => setConfirmingReset(false)}
                  aria-label={`Keep custom value for ${token.id}`}
                  className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                >
                  Keep
                </button>
                <button
                  onClick={() => {
                    const next = resetTokenToStarter(system, token.id)
                    if (next) save(next)
                    setConfirmingReset(false)
                  }}
                  aria-label={`Confirm reset of ${token.id}`}
                  className="inline-flex min-h-11 items-center rounded-lg bg-foreground px-3 text-xs font-medium text-background hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                >
                  Reset
                </button>
              </span>
            ))}
          <button
            onClick={() => {
              const copy = duplicateSemanticToken(system, token.id)
              if (copy) save(insertSemanticToken(system, copy))
            }}
            aria-label={`Duplicate token ${token.id}`}
            title="Duplicate as an independent token"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          >
            <Copy className="size-4" aria-hidden="true" />
          </button>
          {!confirmingDelete ? (
            <button
              onClick={() => setConfirmingDelete(true)}
              aria-label={`Delete token ${token.id}`}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          ) : guard.ok ? (
            <span className="flex items-center gap-2">
              <button
                onClick={() => setConfirmingDelete(false)}
                aria-label={`Keep token ${token.id}`}
                className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
              >
                Keep
              </button>
              <button
                onClick={() => {
                  save(removeSemanticToken(system, token.id))
                  setConfirmingDelete(false)
                }}
                aria-label={`Confirm deletion of token ${token.id}`}
                className="inline-flex min-h-11 items-center rounded-lg bg-destructive px-3 text-xs font-medium text-white hover:bg-destructive/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
              >
                Delete
              </button>
            </span>
          ) : (
            <button
              onClick={() => setConfirmingDelete(false)}
              aria-label={`Understood, keep token ${token.id}`}
              className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            >
              Understood
            </button>
          )}
        </div>
      </div>

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <div>
          <label htmlFor={`tokens-${token.id}-label`} className="sr-only">
            {token.id} label
          </label>
          <input
            id={`tokens-${token.id}-label`}
            value={labelDraft ?? token.label}
            onChange={(event) => {
              setLabelDraft(event.target.value)
              setLabelError(null)
            }}
            onBlur={commitLabel}
            onKeyDown={(event) => {
              if (event.key === "Enter") (event.target as HTMLInputElement).blur()
            }}
            maxLength={60}
            placeholder="Visible label"
            aria-invalid={Boolean(labelError)}
            aria-describedby={labelError ? `tokens-${token.id}-label-error` : undefined}
            className={`min-h-11 w-full rounded-lg border bg-background px-2.5 text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring ${labelError ? "border-destructive" : "border-border"}`}
          />
        </div>
        <div className="flex gap-2">
          <div className="min-w-0 flex-1">
            <label htmlFor={`tokens-${token.id}-category`} className="sr-only">
              {token.id} category
            </label>
            <select
              id={`tokens-${token.id}-category`}
              value={isSemanticCategory(token.category) ? token.category : "custom"}
              onChange={(event) => {
                const next = event.target.value
                if (isSemanticCategory(next) && next !== token.category) {
                  save(updateTokenCategory(system, token.id, next))
                }
              }}
              className="min-h-11 w-full rounded-lg border border-border bg-background px-2.5 text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              {SEMANTIC_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {categoryLabel(category)}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-0 flex-1">
            <label htmlFor={`tokens-${token.id}-description`} className="sr-only">
              {token.id} description
            </label>
            <input
              id={`tokens-${token.id}-description`}
              value={descriptionDraft ?? token.description ?? ""}
              onChange={(event) => setDescriptionDraft(event.target.value)}
              onBlur={commitDescription}
              onKeyDown={(event) => {
                if (event.key === "Enter") (event.target as HTMLInputElement).blur()
              }}
              maxLength={140}
              placeholder="Usage note (optional)"
              className="min-h-11 w-full rounded-lg border border-border bg-background px-2.5 text-[13px] outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>
      </div>

      {showPicker && (
        <ReferencePicker
          system={system}
          excludeId={token.id}
          current={token.value}
          onPick={pickValue}
          onClose={() => {
            setShowPicker(false)
            setValueError(null)
          }}
        />
      )}

      <div className="mt-1 min-h-5" aria-live="polite">
        {labelError ? (
          <p id={`tokens-${token.id}-label-error`} role="alert" className="text-xs font-medium text-destructive">
            {labelError}
          </p>
        ) : valueError ? (
          <p role="alert" className="text-xs font-medium text-destructive">
            {valueError}
          </p>
        ) : !guard.ok && confirmingDelete ? (
          <DependencyNotice system={system} id={token.id} />
        ) : (
          <TokenMetaLine
            classifiedKind={classified?.kind ?? null}
            classifiedDetail={classified?.detail ?? null}
            chain={resolution.status === "resolved" ? resolution.chain : []}
            resolved={resolution.status === "resolved" ? resolution.value : null}
            usedBy={usedBy}
          />
        )}
      </div>
    </li>
  )
}

function ResolvedSwatch({
  resolution,
}: {
  resolution: ReturnType<typeof resolveToken>
}) {
  if (resolution.status !== "resolved" || !isHexColor(resolution.value)) {
    return (
      <span
        className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-dashed border-border px-2.5 font-mono text-[11px] text-muted-foreground"
        title={resolution.status === "resolved" ? resolution.value : (resolution.reason ?? "Unresolved")}
      >
        <XCircle className="size-4" aria-hidden="true" />
        {resolution.status === "resolved" ? resolution.value.slice(0, 18) : "unresolved"}
      </span>
    )
  }
  return (
    <span
      aria-hidden="true"
      className="inline-block size-11 shrink-0 rounded-lg border border-border"
      style={{ backgroundColor: resolution.value }}
      title={resolution.value}
    />
  )
}

function TokenMetaLine({
  classifiedKind,
  classifiedDetail,
  chain,
  resolved,
  usedBy,
}: {
  classifiedKind: "foundation" | "alias" | "raw" | null
  classifiedDetail: string | null
  chain: readonly string[]
  resolved: string | null
  usedBy: number
}) {
  const kindCopy =
    classifiedKind === "foundation"
      ? "Foundation reference"
      : classifiedKind === "alias"
        ? "Semantic alias"
        : classifiedKind === "raw"
          ? "Raw fallback"
          : "Unresolved value"
  return (
    <p className="font-mono text-[11px] leading-5 text-muted-foreground">
      {kindCopy}
      {classifiedDetail ? ` · ${classifiedDetail}` : ""}
      {chain.length > 0 && <> · {formatChain(chain)}</>}
      {resolved && <> → {resolved}</>}
      {` · used by ${usedBy}`}
    </p>
  )
}

function DependencyNotice({ system, id }: { system: DesignSystemConfig; id: string }) {
  const guard = canDeleteSemanticToken(system, id)
  if (guard.ok) return null
  const references = "references" in guard ? guard.references : []
  return (
    <div>
      <p className="text-xs text-muted-foreground">{guard.reasons[0]}</p>
      {references.length > 0 && (
        <p className="font-mono text-[11px] text-muted-foreground">
          ({references.slice(0, 4).map((reference) => reference.pointer).join(", ")}
          {references.length > 4 ? ` and ${references.length - 4} more` : ""})
        </p>
      )}
    </div>
  )
}

function ReferencePicker({
  system,
  excludeId,
  current,
  onPick,
  onClose,
}: {
  system: DesignSystemConfig
  excludeId: string
  current: string
  onPick: (value: string) => void
  onClose: () => void
}) {
  const [query, setQuery] = useState("")
  const [hexDraft, setHexDraft] = useState("")
  const [hexError, setHexError] = useState<string | null>(null)
  const candidates = useMemo(() => validReferenceCandidates(system, excludeId), [system, excludeId])
  const needle = query.trim().toLowerCase()
  const foundations = candidates.foundations.filter((id) => id.toLowerCase().includes(needle)).slice(0, 40)
  const aliases = candidates.aliases.filter((id) => id.toLowerCase().includes(needle)).slice(0, 40)

  const submitHex = () => {
    const text = hexDraft.trim()
    if (!isHexColor(text)) {
      setHexError("Enter a valid six-digit hex color, e.g. #635bff.")
      return
    }
    setHexError(null)
    onPick(text)
  }

  return (
    <div className="mt-2 rounded-lg border border-dashed border-border p-3" role="dialog" aria-label={`Reference picker for ${excludeId}`}>
      <div className="flex items-center gap-2">
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <label htmlFor={`picker-${excludeId}-search`} className="sr-only">
          Filter palette shades and semantic aliases
        </label>
        <input
          id={`picker-${excludeId}-search`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter shades and aliases…"
          className="min-h-11 w-full min-w-0 rounded-lg border border-border bg-background px-2.5 text-[13px] outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button
          onClick={onClose}
          aria-label="Close reference picker"
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg border border-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div className="mt-2 grid max-h-56 gap-4 overflow-y-auto sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold">Palette shades ({foundations.length})</p>
          <ul className="mt-1 space-y-0.5">
            {foundations.map((id) => (
              <li key={id}>
                <button
                  onClick={() => onPick(id)}
                  aria-pressed={current === id}
                  className={`flex min-h-11 w-full items-center gap-2 rounded-md px-2 text-left font-mono text-[12px] transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${current === id ? "bg-muted font-medium" : ""}`}
                >
                  <ShadeDot system={system} reference={id} />
                  <span className="min-w-0 flex-1 truncate">{id}</span>
                  {current === id && <Check className="size-4 shrink-0" aria-hidden="true" />}
                </button>
              </li>
            ))}
            {foundations.length === 0 && <li className="text-xs text-muted-foreground">No shades match.</li>}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold">Semantic aliases ({aliases.length})</p>
          <p className="text-[11px] text-muted-foreground">Self and cycle-closing choices are hidden.</p>
          <ul className="mt-1 space-y-0.5">
            {aliases.map((id) => (
              <li key={id}>
                <button
                  onClick={() => onPick(id)}
                  aria-pressed={current === id}
                  className={`flex min-h-11 w-full items-center gap-2 rounded-md px-2 text-left font-mono text-[12px] transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${current === id ? "bg-muted font-medium" : ""}`}
                >
                  <ShadeDot system={system} reference={id} />
                  <span className="min-w-0 flex-1 truncate">{id}</span>
                  {current === id && <Check className="size-4 shrink-0" aria-hidden="true" />}
                </button>
              </li>
            ))}
            {aliases.length === 0 && <li className="text-xs text-muted-foreground">No aliases match.</li>}
          </ul>
        </div>
      </div>
      <div className="mt-2 border-t border-border pt-2">
        <label htmlFor={`picker-${excludeId}-hex`} className="text-xs font-medium">
          Raw hex fallback <span className="font-normal text-muted-foreground">(only if no shade or alias fits)</span>
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id={`picker-${excludeId}-hex`}
            value={hexDraft}
            onChange={(event) => {
              setHexDraft(event.target.value)
              setHexError(null)
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") submitHex()
            }}
            placeholder="#635bff"
            spellCheck={false}
            className={`min-h-11 w-full min-w-0 rounded-lg border bg-background px-2.5 font-mono text-[13px] outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring ${hexError ? "border-destructive" : "border-border"}`}
          />
          <button
            onClick={submitHex}
            className="inline-flex min-h-11 shrink-0 items-center rounded-lg bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          >
            Use hex
          </button>
        </div>
        {hexError && (
          <p role="alert" className="mt-1 text-xs font-medium text-destructive">
            {hexError}
          </p>
        )}
      </div>
    </div>
  )
}

function ShadeDot({ system, reference }: { system: DesignSystemConfig; reference: string }) {
  const resolution = resolveToken(system, reference)
  const color = resolution.status === "resolved" && isHexColor(resolution.value) ? resolution.value : "transparent"
  return (
    <span
      aria-hidden="true"
      className="inline-block size-4 shrink-0 rounded-full border border-border"
      style={{ backgroundColor: color }}
    />
  )
}

function AddTokenForm({
  system,
  save,
  onDone,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
  onDone: () => void
}) {
  const [label, setLabel] = useState("")
  const [category, setCategory] = useState<SemanticCategory>("custom")
  const [value, setValue] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string | null>(null)
  const existingIds = (system.semanticTokens ?? []).map((token) => token.id)
  const previewId = label.trim() ? slugifySemanticId(label.trim(), category, existingIds) : "—"

  const handleAdd = () => {
    const result = createSemanticToken(system, {
      label,
      category,
      value,
      description: description.trim() ? description : undefined,
    })
    if (!result.ok) {
      setError(result.error)
      return
    }
    save(insertSemanticToken(system, result.token))
    onDone()
  }

  return (
    <div id="add-semantic-token-form" className="mt-4 rounded-lg border border-dashed border-border p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="add-token-form-label" className="text-sm font-medium">
            Token name
          </label>
          <input
            id="add-token-form-label"
            value={label}
            onChange={(event) => {
              setLabel(event.target.value)
              setError(null)
            }}
            placeholder="e.g. Card border"
            maxLength={60}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="add-token-form-category" className="text-sm font-medium">
            Category
          </label>
          <select
            id="add-token-form-category"
            value={category}
            onChange={(event) => {
              const next = event.target.value
              if (isSemanticCategory(next)) setCategory(next)
              setError(null)
            }}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            {SEMANTIC_CATEGORIES.map((entry) => (
              <option key={entry} value={entry}>
                {categoryLabel(entry)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="add-token-form-value" className="text-sm font-medium">
            Value or reference
          </label>
          <input
            id="add-token-form-value"
            value={value}
            onChange={(event) => {
              setValue(event.target.value)
              setError(null)
            }}
            placeholder="brand.600, text.primary, or #635bff"
            spellCheck={false}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 font-mono text-[13px] outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="add-token-form-description" className="text-sm font-medium">
            Usage note <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="add-token-form-description"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value)
              setError(null)
            }}
            placeholder="e.g. Card outlines on canvas"
            maxLength={140}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>
      <p className="mt-2 font-mono text-[11px] text-muted-foreground" aria-live="polite">
        Stable id preview: {previewId} (generated once from name and category; labels stay editable)
      </p>
      <div className="mt-1 min-h-5" aria-live="polite">
        {error && (
          <p role="alert" className="text-xs font-medium text-destructive">
            {error}
          </p>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          onClick={handleAdd}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add token
        </button>
        <button
          onClick={onDone}
          className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function resolvePreviewColor(system: DesignSystemConfig, id: string, themeId?: string): string {
  const resolution = resolveToken(system, id, themeId)
  if (resolution.status === "resolved" && isHexColor(resolution.value)) return resolution.value
  return "transparent"
}

function SemanticPreview({ system }: { system: DesignSystemConfig }) {
  const { themeOptions } = usePreviewTheme(system)
  // Base is intentional: this page edits base semantic values, so the first
  // thing people see must reflect their most recent choice. Theme comparison
  // stays one explicit click away instead of silently masking an edit.
  const [previewMode, setPreviewMode] = useState<string>("base")
  const activeThemeId = previewMode === "base" ? undefined : previewMode
  const activeTheme = themeOptions.find((theme) => theme.id === activeThemeId)
  const canvas = resolvePreviewColor(system, "background.canvas", activeThemeId)
  const surface = resolvePreviewColor(system, "surface.default", activeThemeId)
  const cardBorder = resolvePreviewColor(system, "border.default", activeThemeId)
  const heading = resolvePreviewColor(system, "text.primary", activeThemeId)
  const body = resolvePreviewColor(system, "text.secondary", activeThemeId)
  const muted = resolvePreviewColor(system, "text.muted", activeThemeId)
  const inverseBg = resolvePreviewColor(system, "background.inverse", activeThemeId)
  const inverseText = resolvePreviewColor(system, "text.inverse", activeThemeId)
  const primaryBg = resolvePreviewColor(system, "action.primary.background", activeThemeId)
  const primaryFg = resolvePreviewColor(system, "action.primary.foreground", activeThemeId)
  const secondaryBg = resolvePreviewColor(system, "action.secondary.background", activeThemeId)
  const secondaryFg = resolvePreviewColor(system, "action.secondary.foreground", activeThemeId)
  const focusRing = resolvePreviewColor(system, "focus.ring", activeThemeId)
  const subtleBg = resolvePreviewColor(system, "background.subtle", activeThemeId)

  const statuses = [
    { kind: "Success", fg: "status.success.foreground", bg: "status.success.background", Icon: Check },
    { kind: "Warning", fg: "status.warning.foreground", bg: "status.warning.background", Icon: AlertTriangle },
    { kind: "Danger", fg: "status.danger.foreground", bg: "status.danger.background", Icon: XCircle },
    { kind: "Info", fg: "status.info.foreground", bg: "status.info.background", Icon: Info },
  ] as const

  const themeRows: Array<{ id: string; label: string }> = [
    { id: "background.canvas", label: "canvas" },
    { id: "text.primary", label: "text" },
    { id: "action.primary.background", label: "action" },
  ]

  return (
    <aside aria-label="Semantic token preview" className="h-fit rounded-xl border border-border bg-background p-5">
      <p className="text-xs font-semibold tracking-wider text-muted-foreground">LIVE PREVIEW</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        Changes on the left appear here immediately. Compare Light or Dark only when you are ready.
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Preview theme">
        <button
          aria-pressed={previewMode === "base"}
          onClick={() => setPreviewMode("base")}
          className={`inline-flex min-h-11 items-center rounded-lg border px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${previewMode === "base" ? "border-foreground bg-muted" : "border-border hover:bg-muted/60"}`}
        >
          Base colours
        </button>
        {themeOptions.map((theme) => (
          <button
            key={theme.id}
            aria-pressed={previewMode === theme.id}
            onClick={() => setPreviewMode(theme.id)}
            className={`inline-flex min-h-11 items-center rounded-lg border px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${previewMode === theme.id ? "border-foreground bg-muted" : "border-border hover:bg-muted/60"}`}
          >
            {theme.label} · {theme.mode}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[11px] leading-4 text-muted-foreground" role="status">
        {activeTheme
          ? `Showing ${activeTheme.label}. Theme-specific colours can differ from your base choices.`
          : "Showing base colours. Every colour you change on this page updates this preview."}
      </p>

      <div className="mt-3 overflow-hidden rounded-lg border" style={{ borderColor: cardBorder, backgroundColor: canvas, ["--sys-ph" as string]: muted }}>
        <div className="border-b px-3 py-2" style={{ borderColor: cardBorder, backgroundColor: subtleBg }}>
          <p className="truncate text-[13px] font-semibold" style={{ color: heading }}>
            Canvas · surface · card
          </p>
          <p className="truncate font-mono text-[10px]" style={{ color: muted }}>
            background.canvas / surface.default / border.default
          </p>
        </div>
        <div className="space-y-2 p-3">
          <div className="rounded-lg border p-3" style={{ borderColor: cardBorder, backgroundColor: surface }}>
            <p className="text-[13px] font-semibold" style={{ color: heading }}>
              Heading uses text.primary
            </p>
            <p className="mt-0.5 text-[12px] leading-5" style={{ color: body }}>
              Body copy uses text.secondary for comfortable reading measure.
            </p>
            <p className="mt-0.5 font-mono text-[10px]" style={{ color: muted }}>
              Muted metadata · text.muted
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span
                className="inline-flex min-h-11 items-center rounded-lg px-4 text-sm font-medium"
                style={{ backgroundColor: primaryBg, color: primaryFg }}
              >
                Primary button
              </span>
              <span
                className="inline-flex min-h-11 items-center rounded-lg border px-4 text-sm font-medium"
                style={{ backgroundColor: secondaryBg, color: secondaryFg, borderColor: cardBorder }}
              >
                Secondary
              </span>
            </div>
            <p className="mt-1.5 font-mono text-[10px]" style={{ color: muted }}>
              action.primary.* / action.secondary.*
            </p>
          </div>
          <div>
            <label className="block text-[12px] font-medium" style={{ color: heading }} htmlFor="semantic-preview-input">
              Default and focused input
              <input
                id="semantic-preview-input"
                placeholder="you@example.com"
                className="mt-1.5 block min-h-11 w-full min-w-0 rounded-lg border px-3 text-sm outline-none placeholder:text-[var(--sys-ph)] focus-visible:ring-2"
                style={{ borderColor: cardBorder, color: heading, backgroundColor: canvas, ["--tw-ring-color" as string]: focusRing }}
              />
            </label>
            <p className="mt-1 font-mono text-[10px]" style={{ color: muted }}>
              border.default · focus.ring on focus
            </p>
          </div>
          <div className="rounded-lg p-3" style={{ backgroundColor: inverseBg }}>
            <p className="text-[12px] font-medium" style={{ color: inverseText }}>
              Inverse text on inverse background
            </p>
            <p className="font-mono text-[10px]" style={{ color: inverseText }}>
              background.inverse / text.inverse
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-2" aria-label="Status alerts">
        {statuses.map(({ kind, fg, bg, Icon }) => (
          <p
            key={kind}
            className="flex min-h-11 items-center gap-2 rounded-lg border px-3 text-[12px] font-medium"
            style={{
              color: resolvePreviewColor(system, fg, activeThemeId),
              backgroundColor: resolvePreviewColor(system, bg, activeThemeId),
              borderColor: resolvePreviewColor(system, fg, activeThemeId),
            }}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {kind}: status.{kind.toLowerCase()}.foreground on status.{kind.toLowerCase()}.background
          </p>
        ))}
      </div>

      <div className="mt-3 rounded-lg border border-border p-3" aria-label="Dialog and scrim example">
        <p className="text-[12px] font-medium" style={{ color: heading }}>
          Dialog over overlay.scrim
        </p>
        <div className="mt-2 rounded-lg p-3" style={{ backgroundColor: resolvePreviewColor(system, "overlay.scrim", activeThemeId) }}>
          <div className="rounded-lg border p-3" style={{ borderColor: cardBorder, backgroundColor: surface }}>
            <p className="text-[13px] font-semibold" style={{ color: heading }}>
              Confirm changes
            </p>
            <p className="mt-0.5 text-[12px]" style={{ color: body }}>
              The scrim dims the canvas behind dialogs.
            </p>
          </div>
        </div>
        <p className="mt-1 font-mono text-[10px]" style={{ color: muted }}>
          overlay.scrim · surface.default
        </p>
      </div>

      <details className="mt-3 text-xs text-muted-foreground">
        <summary className="inline-flex min-h-11 cursor-pointer items-center font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Light / dark resolution (read-only)
        </summary>
        <ul className="mt-2 space-y-1 font-mono text-[11px]">
          {themeRows.map((row) => (
            <li key={row.id}>
              {row.label} ← base {resolveToken(system, row.id).value} · light{" "}
              {resolveToken(system, row.id, "light").value} · dark{" "}
              {resolveToken(system, row.id, "dark").value}
            </li>
          ))}
        </ul>
        <p className="mt-1">Theme overrides stay read-only here — the Themes phase owns them.</p>
      </details>

      <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
        Note: numeric contrast auditing belongs to the later Validate phase; this preview checks
        wiring and states, not contrast ratios.
      </p>

      <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
        Tokens referenced across the system:{" "}
        {findTokenReferences(system, "text.primary").length} inbound for text.primary ·{" "}
        {findTokenReferences(system, "action.primary.background").length} for action.primary.background.
      </p>
    </aside>
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
