"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  LayoutTemplate,
  Paintbrush,
  PenLine,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createDesignSystem, presets } from "@/lib/design-system/domain";
import { browserDesignSystems } from "@/lib/design-system/repository";

const steps = [
  {
    title: "Starting point",
    heading: "Choose a starting point",
    description: "Pick the closest fit. You can change every foundation later.",
    icon: LayoutTemplate,
  },
  {
    title: "Brand details",
    heading: "Give the system a home",
    description:
      "These details make the system recognisable when you return to it or export documentation.",
    icon: PenLine,
  },
  {
    title: "Initial style",
    heading: "Set the visual direction",
    description:
      "Set just enough direction now. You can tune every token in the builder next.",
    icon: Paintbrush,
  },
  {
    title: "Review",
    heading: "Check the foundations",
    description:
      "Your first set of choices is ready. Create the system and start in Colors.",
    icon: Sparkles,
  },
] as const;

const fontOptions = ["Inter", "Manrope", "DM Sans", "Space Grotesk"];
const colorSwatches = [
  "#635bff",
  "#0f766e",
  "#db2777",
  "#a16207",
  "#8b5cf6",
  "#18181b",
];

function isHex(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value.trim());
}

export function CreateDesignSystem() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [presetId, setPresetId] = useState("saas");
  const preset = presets.find((item) => item.id === presetId) ?? presets[2]!;
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState<string>(preset.color);
  const [font, setFont] = useState<string>(preset.font);
  const [density, setDensity] =
    useState<"compact" | "comfortable">(preset.density);
  const [touched, setTouched] = useState(false);

  const nameError = touched && !name.trim() ? "Give your system a name to continue." : null;
  const colorValid = isHex(color);
  const canContinue =
    step === 2 ? name.trim().length > 0 : step === 3 ? colorValid : true;

  const blockers = useMemo(() => {
    if (step === 2 && !name.trim()) return "Add a system name to continue";
    if (step === 3 && !colorValid) return "Use a 6-digit hex color (e.g. #635BFF)";
    return null;
  }, [step, name, colorValid]);

  const selectPreset = (nextId: string) => {
    const next = presets.find((item) => item.id === nextId)!;
    setPresetId(nextId);
    setColor(next.color);
    setFont(next.font);
    setDensity(next.density);
  };

  const next = () => {
    if (step === 2) setTouched(true);
    if (!canContinue) return;
    setStep((current) => Math.min(4, current + 1));
  };

  const back = () => setStep((current) => Math.max(1, current - 1));

  const finish = () => {
    const system = createDesignSystem({
      name: name.trim() || "Untitled system",
      brand,
      description,
      presetId,
      color: colorValid ? color : preset.color,
      font,
      density,
    });
    browserDesignSystems.save(system);
    router.push(`/design-system/${system.id}/colors`);
  };

  const progress = (step / steps.length) * 100;
  const slug = useMemo(
    () =>
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 40) || "untitled-system",
    [name],
  );

  return (
    <main className="min-h-[calc(100svh-3.5rem)] min-w-0 bg-background px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-6xl">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/design-system"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            All design systems
          </Link>
          <button
            type="button"
            onClick={() => router.push("/design-system")}
            className="min-h-10 rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Exit setup
          </button>
        </div>

        {/* Stepper */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <ol
            className="grid gap-2 sm:grid-cols-4"
            aria-label="Setup progress"
          >
            {steps.map((s, i) => {
              const n = i + 1;
              const done = n < step;
              const active = n === step;
              const Icon = s.icon;
              return (
                <li key={s.title}>
                  <button
                    type="button"
                    onClick={() => {
                      // allow going back freely, forward only if valid
                      if (n < step) setStep(n);
                    }}
                    disabled={n > step}
                    aria-current={active ? "step" : undefined}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      active
                        ? "border-foreground/30 bg-muted/70"
                        : done
                          ? "border-border hover:border-foreground/30 hover:bg-muted/40"
                          : "border-transparent opacity-55"
                    } ${n > step ? "cursor-default" : "cursor-pointer"}`}
                  >
                    <span
                      className={`grid size-9 shrink-0 place-items-center rounded-lg transition-colors ${
                        done
                          ? "bg-emerald-500 text-white"
                          : active
                            ? "bg-foreground text-background"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {done ? (
                        <Check aria-hidden="true" className="size-4" />
                      ) : (
                        <Icon aria-hidden="true" className="size-4" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        Step {n}
                      </span>
                      <span className="block truncate text-sm font-medium">
                        {s.title}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <div
            className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={step}
            aria-valuemin={1}
            aria-valuemax={4}
            aria-label={`Step ${step} of 4`}
          >
            <div
              className="h-full rounded-full bg-foreground transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* Main column */}
          <div className="min-w-0">
            <div key={step} className="max-w-2xl">
              <p className="text-sm font-medium text-muted-foreground">
                Step {step} of {steps.length} — {steps[step - 1]!.title}
              </p>
              <h1 className="mt-2 text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                {steps[step - 1]!.heading}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                {steps[step - 1]!.description}
              </p>
            </div>

            <div key={`body-${step}`} className="mt-7">
              {step === 1 && (
                <TemplateStep selected={presetId} onSelect={selectPreset} />
              )}
              {step === 2 && (
                <BrandStep
                  name={name}
                  brand={brand}
                  description={description}
                  slug={slug}
                  nameError={nameError}
                  setName={setName}
                  setBrand={setBrand}
                  setDescription={setDescription}
                />
              )}
              {step === 3 && (
                <StyleStep
                  color={color}
                  font={font}
                  density={density}
                  setColor={setColor}
                  setFont={setFont}
                  setDensity={setDensity}
                />
              )}
              {step === 4 && (
                <ReviewStep
                  name={name}
                  brand={brand}
                  description={description}
                  preset={preset.name}
                  color={colorValid ? color : preset.color}
                  font={font}
                  density={density}
                  onEdit={setStep}
                />
              )}
            </div>

            {/* Footer nav */}
            <div className="mt-8 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={back}
                disabled={step === 1}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:invisible focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ArrowLeft aria-hidden="true" className="size-4" />
                Back
              </button>
              <div className="flex items-center gap-3">
                {blockers && (
                  <p className="hidden text-xs text-muted-foreground sm:block" role="status">
                    {blockers}
                  </p>
                )}
                {step < 4 ? (
                  <button
                    onClick={next}
                    disabled={!canContinue}
                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-foreground px-6 text-sm font-medium text-background transition-all hover:bg-foreground/85 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                  >
                    Continue
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </button>
                ) : (
                  <button
                    onClick={finish}
                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-foreground px-6 text-sm font-medium text-background transition-all hover:bg-foreground/85 sm:flex-none"
                  >
                    Create design system
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </button>
                )}
              </div>
            </div>
            {blockers && (
              <p className="mt-2 text-xs text-muted-foreground sm:hidden" role="status">
                {blockers}
              </p>
            )}
          </div>

          {/* Live summary sidebar */}
          <aside
            className="lg:sticky lg:top-20 lg:self-start"
            aria-label="Live summary"
          >
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="border-b border-border px-5 py-4">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                  </span>
                  Live summary
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Updates as you type.
                </p>
              </div>
              <div className="space-y-4 p-5">
                <div className="flex items-center gap-3">
                  <span
                    className="grid size-11 shrink-0 place-items-center rounded-xl text-lg font-semibold text-white transition-colors duration-300"
                    style={{ backgroundColor: colorValid ? color : preset.color }}
                    aria-hidden="true"
                  >
                    {(name.trim()[0] || brand.trim()[0] || "D").toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {name.trim() || "Untitled system"}
                    </p>
                    <p className="truncate font-mono text-[11px] text-muted-foreground">
                      /{slug}
                    </p>
                  </div>
                </div>
                <dl className="space-y-2.5 rounded-xl bg-muted/50 p-3.5 text-[13px]">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Starter</dt>
                    <dd className="font-medium">{preset.name}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Brand</dt>
                    <dd className="max-w-[140px] truncate font-medium">
                      {brand.trim() || "—"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Color</dt>
                    <dd className="flex items-center gap-1.5 font-mono text-xs uppercase">
                      <span
                        className="size-4 rounded ring-1 ring-black/10 dark:ring-white/20"
                        style={{
                          backgroundColor: colorValid ? color : preset.color,
                        }}
                      />
                      {(colorValid ? color : preset.color).toUpperCase()}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Type</dt>
                    <dd className="font-medium" style={{ fontFamily: font }}>
                      {font}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Density</dt>
                    <dd className="font-medium capitalize">{density}</dd>
                  </div>
                </dl>
                {/* Mini preview */}
                <div className="rounded-xl border border-border p-3.5">
                  <p
                    className="text-base font-semibold tracking-tight"
                    style={{ fontFamily: font }}
                  >
                    Project overview
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                    Styled by your tokens.
                  </p>
                  <div className={`mt-3 flex gap-2 ${density === "compact" ? "[&>*]:h-7 [&>*]:text-[11px]" : "[&>*]:h-9 [&>*]:text-xs"}`}>
                    <span
                      className="inline-flex items-center rounded-md px-3 font-semibold text-white transition-all"
                      style={{
                        backgroundColor: colorValid ? color : preset.color,
                        fontFamily: font,
                      }}
                    >
                      New project
                    </span>
                    <span className="inline-flex items-center rounded-md border border-border px-3 font-medium">
                      Activity
                    </span>
                  </div>
                </div>
              </div>
              <div className="border-t border-border bg-muted/30 px-5 py-3.5">
                <p className="text-[11px] leading-5 text-muted-foreground">
                  Next: open in the builder at{" "}
                  <span className="font-mono">Colors → Type → Themes</span>
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function TemplateStep({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      className="grid gap-3 sm:grid-cols-2"
      role="radiogroup"
      aria-label="Choose a starter preset"
    >
      {presets.map((item) => {
        const active = selected === item.id;
        return (
          <button
            type="button"
            key={item.id}
            role="radio"
            aria-checked={active}
            onClick={() => onSelect(item.id)}
            className={`group relative flex min-h-28 items-start gap-3.5 overflow-hidden rounded-2xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              active
                ? "border-foreground bg-muted/60 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.15)]"
                : "border-border bg-card hover:border-foreground/40 hover:bg-muted/30 hover:shadow-sm"
            }`}
          >
            <span
              aria-hidden="true"
              className="relative mt-0.5 block size-10 shrink-0 overflow-hidden rounded-xl ring-1 ring-black/10 dark:ring-white/15"
              style={{ background: item.color }}
            >
              <span className="absolute inset-x-2 bottom-1.5 space-y-1">
                <i className="block h-1 rounded-full bg-white/80" />
                <i className="block h-1 w-2/3 rounded-full bg-white/50" />
              </span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{item.name}</span>
                {active && (
                  <span className="grid size-5 place-items-center rounded-full bg-foreground text-background">
                    <Check aria-hidden="true" className="size-3" />
                  </span>
                )}
              </span>
              <span className="mt-1 block text-[13px] leading-5 text-muted-foreground">
                {item.description}
              </span>
              <span className="mt-2.5 flex flex-wrap gap-1.5">
                <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {item.font}
                </span>
                <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] capitalize text-muted-foreground">
                  {item.density}
                </span>
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function BrandStep({
  name,
  brand,
  description,
  slug,
  nameError,
  setName,
  setBrand,
  setDescription,
}: {
  name: string;
  brand: string;
  description: string;
  slug: string;
  nameError: string | null;
  setName: (value: string) => void;
  setBrand: (value: string) => void;
  setDescription: (value: string) => void;
}) {
  return (
    <div className="max-w-2xl rounded-2xl border border-border bg-card p-5 sm:p-7">
      <div className="grid gap-6">
        <div>
          <label htmlFor="ds-name" className="text-sm font-semibold">
            Design system name <span className="text-destructive">*</span>
          </label>
          <input
            id="ds-name"
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Acme product system"
            aria-invalid={!!nameError}
            aria-describedby={nameError ? "ds-name-error" : "ds-name-hint"}
            className={`mt-2 min-h-12 w-full rounded-xl border bg-transparent px-3.5 text-[15px] outline-none transition-all placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-ring focus:ring-offset-1 ${
              nameError ? "border-destructive" : "border-border focus:border-foreground"
            }`}
          />
          {nameError ? (
            <span id="ds-name-error" className="mt-1.5 block text-xs font-medium text-destructive">
              {nameError}
            </span>
          ) : (
            <span id="ds-name-hint" className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
              <span>Use a name your team will recognise later.</span>
              <span className="font-mono">/{slug}</span>
            </span>
          )}
        </div>
        <div>
          <label htmlFor="ds-brand" className="text-sm font-semibold">
            Brand or team
            <span className="ml-2 text-xs font-normal text-muted-foreground">Optional</span>
          </label>
          <input
            id="ds-brand"
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
            placeholder="e.g. Acme"
            className="mt-2 min-h-12 w-full rounded-xl border border-border bg-transparent px-3.5 text-[15px] outline-none transition-all placeholder:text-muted-foreground/60 focus:border-foreground focus:ring-2 focus:ring-ring focus:ring-offset-1"
          />
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="ds-desc" className="text-sm font-semibold">
              What is this system for?
              <span className="ml-2 text-xs font-normal text-muted-foreground">Optional</span>
            </label>
            <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
              {description.length}/240
            </span>
          </div>
          <textarea
            id="ds-desc"
            value={description}
            maxLength={240}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="A short description of the product or experience this will support."
            rows={4}
            className="mt-2 min-h-28 w-full resize-y rounded-xl border border-border bg-transparent px-3.5 py-3 text-[15px] outline-none transition-all placeholder:text-muted-foreground/60 focus:border-foreground focus:ring-2 focus:ring-ring focus:ring-offset-1"
          />
        </div>
      </div>
    </div>
  );
}

function StyleStep({
  color,
  font,
  density,
  setColor,
  setFont,
  setDensity,
}: {
  color: string;
  font: string;
  density: "compact" | "comfortable";
  setColor: (value: string) => void;
  setFont: (value: string) => void;
  setDensity: (value: "compact" | "comfortable") => void;
}) {
  const valid = isHex(color);
  return (
    <div className="grid max-w-3xl gap-4">
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold">Primary color</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              This becomes the initial brand palette — shades generate automatically.
            </p>
          </div>
          <span
            className="hidden size-12 shrink-0 rounded-xl shadow-inner ring-1 ring-black/10 dark:ring-white/15 transition-colors duration-300 sm:block"
            style={{ backgroundColor: valid ? color : "#635bff" }}
          />
        </div>
        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Suggested colors">
          {colorSwatches.map((sw) => (
            <button
              key={sw}
              type="button"
              title={sw}
              aria-label={`Use ${sw}`}
              aria-pressed={color.toLowerCase() === sw.toLowerCase()}
              onClick={() => setColor(sw)}
              className={`size-10 rounded-full ring-offset-2 ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                color.toLowerCase() === sw.toLowerCase()
                  ? "ring-2 ring-foreground scale-105"
                  : "hover:scale-105 ring-1 ring-black/10 dark:ring-white/15"
              }`}
              style={{ backgroundColor: sw }}
            />
          ))}
          <label
            className="relative grid size-10 cursor-pointer place-items-center overflow-hidden rounded-full bg-gradient-to-br from-red-400 via-violet-500 to-emerald-400 text-[10px] font-bold text-white ring-1 ring-black/10"
            title="Custom color"
          >
            <input
              aria-label="Pick a custom primary color"
              type="color"
              value={valid ? color : "#635bff"}
              onChange={(event) => setColor(event.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            +
          </label>
        </div>
        <div className="mt-4 flex max-w-xs items-center gap-2">
          <span className="font-mono text-sm text-muted-foreground">#</span>
          <input
            value={color.replace(/^#/, "")}
            onChange={(event) => setColor(`#${event.target.value}`)}
            spellCheck={false}
            maxLength={6}
            aria-label="Primary color hex value"
            aria-invalid={!valid}
            placeholder="635BFF"
            className={`min-h-11 w-full flex-1 rounded-lg border bg-transparent px-3 font-mono text-sm uppercase outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-foreground ${
              valid ? "border-border" : "border-destructive"
            }`}
          />
        </div>
        {!valid && (
          <p className="mt-2 text-xs font-medium text-destructive" role="alert">
            Enter a 6-digit hex value, e.g. #635BFF.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h3 className="font-semibold">Typeface</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Sets headings, body, and the type scale in the builder.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Choose a typeface">
          {fontOptions.map((item) => {
            const active = font === item;
            return (
              <button
                key={item}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setFont(item)}
                className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  active
                    ? "border-foreground bg-muted/60"
                    : "border-border hover:border-foreground/40 hover:bg-muted/30"
                }`}
              >
                <span
                  className="grid size-11 shrink-0 place-items-center rounded-lg bg-muted text-xl"
                  style={{ fontFamily: item }}
                  aria-hidden="true"
                >
                  Aa
                </span>
                <span>
                  <span className="block text-sm font-medium" style={{ fontFamily: item }}>
                    {item}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    Headings & body
                  </span>
                </span>
                {active && <Check aria-hidden="true" className="ml-auto size-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h3 className="font-semibold">Interface density</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Controls spacing and control height across components.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-muted/50 p-1.5" role="radiogroup" aria-label="Choose density">
          {(["comfortable", "compact"] as const).map((item) => {
            const active = density === item;
            return (
              <button
                key={item}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setDensity(item)}
                className={`rounded-lg px-4 py-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  active ? "bg-background shadow-sm ring-1 ring-border" : "hover:bg-background/60"
                }`}
              >
                <span className="block text-sm font-semibold capitalize">{item}</span>
                <span className="mt-2 block space-y-1" aria-hidden="true">
                  <i className={`block rounded bg-foreground/15 ${item === "compact" ? "h-1.5" : "h-2.5"}`} />
                  <i className={`block w-2/3 rounded bg-foreground/15 ${item === "compact" ? "h-1.5" : "h-2.5"}`} />
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function ReviewStep({
  name,
  brand,
  description,
  preset,
  color,
  font,
  density,
  onEdit,
}: {
  name: string;
  brand: string;
  description: string;
  preset: string;
  color: string;
  font: string;
  density: string;
  onEdit: (step: number) => void;
}) {
  const rows: Array<[string, string, number, string]> = [
    ["Starting point", preset, 1, "Change starter"],
    ["Primary color", color.toUpperCase(), 3, "Change color"],
    ["Typeface", font, 3, "Change type"],
    ["Density", density, 3, "Change density"],
  ];
  return (
    <div className="grid max-w-3xl gap-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-start gap-4 p-5 sm:p-6">
          <span
            className="grid size-12 shrink-0 place-items-center rounded-2xl text-xl font-semibold text-white"
            style={{ backgroundColor: color }}
            aria-hidden="true"
          >
            {(name.trim()[0] || brand.trim()[0] || "D").toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold tracking-tight">
              {name.trim() || "Untitled system"}
            </p>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {brand.trim() || "No brand name added"}
              {description.trim() ? ` — ${description.trim()}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onEdit(2)}
            className="shrink-0 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Edit details
          </button>
        </div>
        <dl className="divide-y divide-border border-t border-border">
          {rows.map(([label, value, target, action]) => (
            <div
              className="flex items-center justify-between gap-4 px-5 py-3.5 text-sm sm:px-6"
              key={label}
            >
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="flex items-center gap-3">
                {label === "Primary color" && (
                  <span
                    className="size-5 rounded-md ring-1 ring-black/10 dark:ring-white/20"
                    style={{ backgroundColor: value }}
                  />
                )}
                <span className="font-medium" style={label === "Typeface" ? { fontFamily: value } : undefined}>
                  <span className={label === "Primary color" ? "font-mono text-[13px] uppercase" : "capitalize"}>
                    {value}
                  </span>
                </span>
                <button
                  type="button"
                  aria-label={action}
                  onClick={() => onEdit(target)}
                  className="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Edit
                </button>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-5">
        <p className="flex items-center gap-2 text-sm font-medium">
          <Sparkles aria-hidden="true" className="size-4 text-muted-foreground" />
          What happens next
        </p>
        <ol className="mt-3 space-y-2 text-[13px] leading-5 text-muted-foreground">
          <li className="flex gap-2.5">
            <Check aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
            System is created locally with a full palette, type scale, and light + dark themes.
          </li>
          <li className="flex gap-2.5">
            <Check aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
            You land in <span className="font-medium text-foreground">Colors</span> — tune, then move through Type and Themes.
          </li>
          <li className="flex gap-2.5">
            <Check aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
            Export tokens or documentation whenever you&apos;re ready.
          </li>
        </ol>
      </div>
    </div>
  );
}
