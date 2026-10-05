"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Eraser,
  Loader2,
  LayoutTemplate,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useId, useMemo, useState } from "react";
import {
  buildDirectCreateInput,
  type DirectCreateStarterId,
  validateDirectSystemName,
} from "@/lib/design-system/direct-create";
import { browserDesignSystems } from "@/lib/design-system/repository";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const MAX_NAME_LENGTH = 60;

const NAME_SUGGESTIONS = ["Da Vinci UI", "Acme Product", "Moonlight"] as const;

const startingPoints: ReadonlyArray<{
  id: DirectCreateStarterId;
  label: string;
  tagline: string;
  description: string;
  detail: string;
  tokens: string[];
}> = [
  {
    id: "blank",
    label: "Blank",
    tagline: "Total control",
    description: "A clean, neutral foundation.",
    detail: "Every color, type, and spacing token starts unopinionated.",
    tokens: ["Neutral base", "No presets", "You decide all"],
  },
  {
    id: "minimal",
    label: "Minimal",
    tagline: "Faster start",
    description: "Restrained, ready-to-edit defaults.",
    detail: "Sensible tokens you can refine in Foundations.",
    tokens: ["Base palette", "Type scale", "Spacing + radius"],
  },
];

function StarterPreview({ id, selected }: { id: DirectCreateStarterId; selected: boolean }) {
  if (id === "blank") {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "mt-4 rounded-lg border border-dashed p-3 transition-colors",
          selected ? "border-foreground/30 bg-background" : "border-border bg-background/60",
        )}
      >
        <div className="grid grid-cols-3 gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-7 rounded-md border border-dashed border-border bg-muted/40"
            />
          ))}
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <Eraser className="size-3 text-muted-foreground" />
          <div className="h-1.5 w-24 rounded-full bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        "mt-4 rounded-lg border p-3 transition-colors",
        selected ? "border-foreground/20 bg-background" : "border-border bg-background/60",
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className="size-5 rounded-md bg-[#18181b] dark:bg-zinc-100" />
        <span className="size-5 rounded-md bg-[#d4d4d8]" />
        <span className="size-5 rounded-md bg-[#71717a]" />
        <span className="size-5 rounded-md bg-[#e4e4e7] ring-1 ring-inset ring-black/10" />
        <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Aa
        </span>
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="h-2 w-3/4 rounded-full bg-foreground/80" />
        <div className="h-1.5 w-1/2 rounded-full bg-muted-foreground/30" />
        <div className="h-1.5 w-2/3 rounded-full bg-muted-foreground/20" />
      </div>
    </div>
  );
}

export function CreateDesignSystem() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [starterId, setStarterId] = useState<DirectCreateStarterId>("blank");
  const [nameTouched, setNameTouched] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const nameError = nameTouched ? validateDirectSystemName(name) : null;
  const hintId = useId();
  const errorId = useId();

  const trimmed = name.trim();
  const isValid = useMemo(() => validateDirectSystemName(name) === null, [name]);
  const starter = startingPoints.find((s) => s.id === starterId);

  const createSystem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isCreating) return;

    setNameTouched(true);
    setCreateError(null);
    if (validateDirectSystemName(name)) return;

    setIsCreating(true);
    const result = browserDesignSystems.create(
      buildDirectCreateInput(name, starterId),
    );

    if (!result.ok) {
      setCreateError(result.error);
      setIsCreating(false);
      return;
    }

    track("design_system_created", { starter: starterId });
    router.push(`/design-system/${result.system.id}/colors`);
  };

  return (
    <main className="relative min-h-[calc(100svh-4.5rem)] min-w-0 overflow-x-clip px-[15px] py-[29px] sm:px-[27px] sm:py-[37px] lg:px-[35px]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(55%_80%_at_50%_0%,hsl(var(--muted))_0%,transparent_72%)] opacity-50"
      />

      <div className="relative w-full">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1 text-sm text-muted-foreground"
        >
          <Link
            href="/design-system"
            className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Design system
          </Link>
          <ChevronRight aria-hidden="true" className="size-3.5" />
          <span className="text-foreground">Create design system</span>
        </nav>

        <header className="mt-5 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Create a design system
            </h1>
            <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Begin with a name, choose your foundation, and move straight into the tokens.
              Everything remains editable.
            </p>
          </div>
        </header>

        <form
          onSubmit={createSystem}
          noValidate
          className="mt-6 w-full overflow-hidden rounded-2xl border border-border bg-card shadow-[0_20px_55px_-38px_rgba(0,0,0,0.35)]"
        >
          <div className="px-5 py-6 sm:px-6 sm:py-8">
            <section className="grid gap-4 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-6">
              <div className="flex items-start gap-3 sm:flex-col sm:items-center sm:gap-0">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-foreground font-mono text-xs font-medium text-background">
                  01
                </span>
                <span aria-hidden="true" className="hidden w-px flex-1 bg-border sm:mt-3 sm:block" />
              </div>
              <div className="lg:grid lg:grid-cols-[minmax(12rem,0.62fr)_minmax(0,1.38fr)] lg:gap-10">
                <div>
                  <label htmlFor="system-name" className="text-base font-semibold tracking-tight">
                    Name your system
                  </label>
                  <p id={hintId} className="mt-1 max-w-[18rem] text-sm leading-6 text-muted-foreground">
                    A recognizable name makes it easy to find this system later.
                  </p>
                </div>
                <div className="mt-4 rounded-xl border border-border bg-muted/20 p-3 sm:p-4 lg:mt-0">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-medium text-muted-foreground">System name</span>
                    <span
                      className={cn(
                        "shrink-0 font-mono text-[11px] tabular-nums",
                        name.length > MAX_NAME_LENGTH ? "text-destructive" : "text-muted-foreground",
                      )}
                    >
                      {name.length}/{MAX_NAME_LENGTH}
                    </span>
                  </div>

                  <div className="relative mt-2.5">
                    <input
                      id="system-name"
                      autoComplete="off"
                      maxLength={MAX_NAME_LENGTH + 20}
                      value={name}
                      onChange={(event) => {
                        setName(event.target.value);
                        if (createError) setCreateError(null);
                      }}
                      onBlur={() => setNameTouched(Boolean(name.trim()))}
                      aria-describedby={nameError ? errorId : hintId}
                      aria-invalid={Boolean(nameError)}
                      placeholder="For example, Da Vinci UI"
                      className="min-h-[54px] w-full rounded-lg border border-input bg-background px-4 py-3 text-[15px] shadow-sm outline-none transition-all placeholder:text-muted-foreground/60 hover:border-foreground/35 focus:border-foreground/50 focus:ring-4 focus:ring-ring/20 aria-[invalid=true]:border-destructive/60 aria-[invalid=true]:focus:ring-destructive/15"
                    />
                    {name && (
                      <button
                        type="button"
                        aria-label="Clear system name"
                        onClick={() => setName("")}
                        className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <X aria-hidden="true" className="size-4" />
                      </button>
                    )}
                  </div>
                  {nameError ? (
                    <p id={errorId} role="alert" className="mt-2 text-sm text-destructive">
                      {nameError}
                    </p>
                  ) : (
                    <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5">
                      <span className="mr-1 text-xs text-muted-foreground">Suggestions</span>
                      {NAME_SUGGESTIONS.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => {
                            setName(suggestion);
                            setNameTouched(true);
                            if (createError) setCreateError(null);
                          }}
                          className="min-h-8 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="mt-8 grid gap-4 border-t border-border pt-8 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-6">
              <div className="flex items-start gap-3 sm:justify-center">
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-background font-mono text-xs font-medium text-muted-foreground">
                  02
                </span>
              </div>
              <fieldset>
                <legend className="text-base font-semibold tracking-tight">Choose a starting point</legend>
                <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
                  Both foundations are completely editable. This only gives your first set of tokens a shape.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {startingPoints.map((option) => {
                    const selected = starterId === option.id;
                    return (
                      <label
                        key={option.id}
                        className={cn(
                          "group relative flex min-h-[18rem] cursor-pointer flex-col rounded-xl border p-4 text-left transition-all focus-within:ring-4 focus-within:ring-ring/20",
                          selected
                            ? "border-foreground bg-muted/35 shadow-[inset_0_0_0_1px_hsl(var(--foreground))]"
                            : "border-border bg-background hover:border-foreground/35 hover:bg-muted/20",
                        )}
                      >
                        <input
                          type="radio"
                          name="starting-point"
                          value={option.id}
                          checked={selected}
                          onChange={() => setStarterId(option.id)}
                          className="sr-only"
                        />
                        <span className="flex items-center justify-between gap-3">
                          <span className="inline-flex items-center gap-2.5">
                            <span
                              className={cn(
                                "grid size-8 place-items-center rounded-lg border",
                                selected
                                  ? "border-foreground/20 bg-foreground text-background"
                                  : "border-border bg-muted/60 text-muted-foreground",
                              )}
                            >
                              {option.id === "blank" ? (
                                <Eraser aria-hidden="true" className="size-4" />
                              ) : (
                                <LayoutTemplate aria-hidden="true" className="size-4" />
                              )}
                            </span>
                            <span>
                              <span className="block text-[15px] font-semibold tracking-tight">{option.label}</span>
                              <span className="block text-xs text-muted-foreground">{option.tagline}</span>
                            </span>
                          </span>
                          <span
                            aria-hidden="true"
                            className={cn(
                              "grid size-5 shrink-0 place-items-center rounded-full border transition-colors",
                              selected
                                ? "border-foreground bg-foreground text-background"
                                : "border-border text-transparent group-hover:border-foreground/40",
                            )}
                          >
                            <Check className="size-3" />
                          </span>
                        </span>

                        <StarterPreview id={option.id} selected={selected} />

                        <span className="mt-4 text-sm font-medium leading-5">{option.description}</span>
                        <span className="mt-1 text-[13px] leading-5 text-muted-foreground">{option.detail}</span>
                        <span className="mt-auto flex flex-wrap gap-1.5 pt-4">
                          {option.tokens.map((token) => (
                            <span
                              key={token}
                              className={cn(
                                "rounded-md px-1.5 py-1 text-[11px] font-medium",
                                selected ? "bg-background text-foreground" : "bg-muted/60 text-muted-foreground",
                              )}
                            >
                              {token}
                            </span>
                          ))}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </section>
          </div>

          {createError && (
            <div className="px-5 sm:px-6">
              <p
                role="alert"
                className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {createError} Your choices are still here; try again.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-4 border-t border-border bg-muted/25 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p aria-live="polite" className="order-2 text-[13px] leading-5 text-muted-foreground sm:order-1">
              {trimmed ? (
                <>
                  Creating <span className="font-semibold text-foreground">“{trimmed}”</span> from{" "}
                  <span className="font-semibold text-foreground">{starter?.label}</span>.
                </>
              ) : (
                "Give your system a name to continue."
              )}
            </p>
            <div className="order-1 flex flex-col-reverse gap-2 sm:order-2 sm:flex-row sm:items-center">
              <Link
                href="/design-system"
                className="inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isCreating || !isValid}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-foreground px-5 text-sm font-semibold text-background shadow-sm transition-all hover:-translate-y-px hover:bg-foreground/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30 active:translate-y-0 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none"
              >
                {isCreating ? (
                  <>
                    <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    Create design system
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        <p className="mt-5 max-w-md text-xs leading-5 text-muted-foreground">
          Systems are stored locally in this browser. You’ll land directly in
          Foundations → Colors.
        </p>
      </div>
    </main>
  );
}
