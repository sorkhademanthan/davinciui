"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Layers3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import {
  buildDirectCreateInput,
  type DirectCreateStarterId,
  validateDirectSystemName,
} from "@/lib/design-system/direct-create";
import { browserDesignSystems } from "@/lib/design-system/repository";

const startingPoints: ReadonlyArray<{
  id: DirectCreateStarterId;
  label: string;
  description: string;
  detail: string;
}> = [
  {
    id: "blank",
    label: "Blank",
    description: "Start from a clean, neutral foundation.",
    detail: "Best when you want to make every visual decision yourself.",
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Start with restrained, ready-to-edit defaults.",
    detail: "Best when you want a faster start without a styled template.",
  },
];

export function CreateDesignSystem() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [starterId, setStarterId] = useState<DirectCreateStarterId>("blank");
  const [nameTouched, setNameTouched] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const nameError = nameTouched ? validateDirectSystemName(name) : null;

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

    router.push(`/design-system/${result.system.id}/colors`);
  };

  return (
    <div className="min-h-[calc(100svh-3.5rem)] min-w-0 bg-background px-5 py-7 sm:px-8 sm:py-10 lg:px-10">
      <div className="w-full max-w-2xl">
        <Link
          href="/design-system"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          All design systems
        </Link>

        <header className="mt-8 border-b border-border pb-7 sm:mt-10">
          <span className="grid size-11 place-items-center rounded-xl border border-border bg-muted/60">
            <Layers3 aria-hidden="true" className="size-5" />
          </span>
          <h1 className="mt-5 text-balance text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            Create a design system
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            Name your system, choose how empty it should be, and begin directly
            with its foundations.
          </p>
        </header>

        <form onSubmit={createSystem} className="py-7 sm:py-8" noValidate>
          <div>
            <label htmlFor="system-name" className="text-sm font-medium">
              System name
            </label>
            <p id="system-name-hint" className="mt-1 text-sm text-muted-foreground">
              You can change this later.
            </p>
            <input
              id="system-name"
              autoFocus
              autoComplete="off"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (createError) setCreateError(null);
              }}
              onBlur={() => setNameTouched(true)}
              aria-describedby={nameError ? "system-name-error" : "system-name-hint"}
              aria-invalid={Boolean(nameError)}
              placeholder="For example, Da Vinci UI"
              className="mt-3 min-h-12 w-full rounded-xl border border-input bg-background px-4 text-base shadow-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-foreground/50 focus:ring-2 focus:ring-ring/30 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus:ring-destructive/20"
            />
            {nameError && (
              <p id="system-name-error" role="alert" className="mt-2 text-sm text-destructive">
                {nameError}
              </p>
            )}
          </div>

          <fieldset className="mt-8">
            <legend className="text-sm font-medium">Starting point</legend>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Both options are fully editable after creation.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {startingPoints.map((option) => {
                const selected = starterId === option.id;
                return (
                  <label
                    key={option.id}
                    className={`relative flex min-h-40 cursor-pointer flex-col rounded-xl border p-4 transition-colors focus-within:ring-2 focus-within:ring-ring ${
                      selected
                        ? "border-foreground bg-muted/55"
                        : "border-border hover:border-foreground/40 hover:bg-muted/25"
                    }`}
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
                      <span className="text-base font-medium">{option.label}</span>
                      <span
                        aria-hidden="true"
                        className={`grid size-6 place-items-center rounded-full border ${
                          selected
                            ? "border-foreground bg-foreground text-background"
                            : "border-border"
                        }`}
                      >
                        {selected && <Check className="size-3.5" />}
                      </span>
                    </span>
                    <span className="mt-4 text-sm font-medium leading-5">
                      {option.description}
                    </span>
                    <span className="mt-1 text-sm leading-5 text-muted-foreground">
                      {option.detail}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {createError && (
            <p
              role="alert"
              className="mt-5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {createError} Your choices are still here; try again.
            </p>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-end">
            <Link
              href="/design-system"
              className="inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isCreating}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
            >
              {isCreating ? "Creating…" : "Create design system"}
              {!isCreating && <ArrowRight aria-hidden="true" className="size-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
