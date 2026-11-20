"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Check, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { configEquals } from "@/hooks/use-playground-store";

export type CustomizeControlValue = string | number | boolean;

export type CustomizeSelectOption = {
  label: string;
  value: string;
};

interface CustomizeControlBase {
  key: string;
  label: string;
  group?: string;
  advanced?: boolean;
}

export type CustomizeControl =
  | (CustomizeControlBase & {
      type: "slider";
      min: number;
      max: number;
      step: number;
      unit?: string;
    })
  | (CustomizeControlBase & { type: "select"; options: CustomizeSelectOption[] })
  | (CustomizeControlBase & { type: "color"; defaultColor?: string })
  | (CustomizeControlBase & { type: "toggle" })
  | (CustomizeControlBase & {
      type: "text";
      placeholder?: string;
      maxLength?: number;
    })
  | (CustomizeControlBase & {
      type: "textarea";
      placeholder?: string;
    });

export type CustomizePreset = {
  label: string;
  value: string;
};

export type CustomizePanelProps = {
  slug: string;
  controls: CustomizeControl[];
  values: object;
  defaults: object;
  onChange: (key: string, value: CustomizeControlValue) => void;
  onReset: () => void;
  presets?: CustomizePreset[];
  activePreset?: string;
  onPresetChange?: (value: string) => void;
  title?: string;
};

export function bindCustomizeUpdate<T extends Record<string, CustomizeControlValue>>(
  update: (updates: Partial<T>) => void,
) {
  return (key: string, value: CustomizeControlValue) =>
    update({ [key]: value } as Partial<T>);
}

function normalizeLabel(label: string) {
  const cleaned = label.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return label;
  const words = cleaned.split(" ");
  const formatted = words
    .map((word) =>
      word.length > 2 && word === word.toUpperCase()
        ? word.charAt(0) + word.slice(1).toLowerCase()
        : word,
    )
    .join(" ");
  if (!formatted) return cleaned;
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function normalizeUnit(unit?: string) {
  if (!unit) return "";
  if (unit === "×") return "x";
  if (unit === "°") return "deg";
  return unit;
}

function decimalsForStep(step: number) {
  if (step >= 1) return 0;
  if (step >= 0.1) return 1;
  if (step >= 0.01) return 2;
  return 3;
}

export function formatCustomizeNumber(value: number, step: number, unit?: string) {
  const decimals = decimalsForStep(step);
  const suffix = normalizeUnit(unit);
  return `${value.toFixed(decimals)}${suffix}`;
}

export function normalizeHexColor(value: string) {
  const raw = value.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(raw)) {
    return `#${raw
      .split("")
      .map((char) => char + char)
      .join("")
      .toLowerCase()}`;
  }
  if (/^[0-9a-fA-F]{6}$/.test(raw)) return `#${raw.toLowerCase()}`;
  return null;
}

const CONTROL_RANK: Record<CustomizeControl["type"], number> = {
  select: 0,
  color: 1,
  slider: 2,
  text: 3,
  textarea: 3,
  toggle: 4,
};

function orderControls(controls: CustomizeControl[]) {
  return controls
    .map((control, index) => ({ control, index }))
    .sort((a, b) => {
      const rank = CONTROL_RANK[a.control.type] - CONTROL_RANK[b.control.type];
      if (rank !== 0) return rank;
      const group = (a.control.group ?? "").localeCompare(b.control.group ?? "");
      if (group !== 0) return group;
      return a.index - b.index;
    })
    .map(({ control }) => control);
}

type FloatingMenuProps = {
  open: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  children: React.ReactNode;
  minWidth?: number;
  label: string;
};

function FloatingMenu({
  open,
  anchorRef,
  onClose,
  children,
  minWidth = 180,
  label,
}: FloatingMenuProps) {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [rect, setRect] = React.useState<DOMRect | null>(null);

  React.useEffect(() => {
    if (!open) {
      setRect(null);
      return;
    }
    const update = () => {
      const anchor = anchorRef.current;
      if (anchor) setRect(anchor.getBoundingClientRect());
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", onClose, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", onClose, true);
    };
  }, [open, anchorRef, onClose]);

  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || anchorRef.current?.contains(target)) return;
      onClose();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, anchorRef, onClose]);

  if (!open || !rect || typeof document === "undefined") return null;

  const width = Math.max(rect.width, minWidth);
  const estimatedHeight = 260;
  const opensUp = rect.bottom + estimatedHeight > window.innerHeight - 8;
  const top = opensUp
    ? Math.max(8, rect.top - estimatedHeight - 6)
    : rect.bottom + 6;
  const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));

  return createPortal(
    <div
      ref={menuRef}
      role="dialog"
      aria-label={label}
      data-customize-floating
      className="fixed z-[100] overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-xl ring-1 ring-black/5 dark:ring-white/10"
      style={{ top, left, width }}
    >
      {children}
    </div>,
    document.body,
  );
}

type TileProps = {
  control: CustomizeControl;
  value: CustomizeControlValue | undefined;
  onChange: (value: CustomizeControlValue) => void;
};

const SliderTile = React.memo(function SliderTile({
  control,
  value,
  onChange,
}: TileProps & { control: Extract<CustomizeControl, { type: "slider" }> }) {
  const { min, max, step, unit } = control;
  const current = typeof value === "number" && Number.isFinite(value) ? value : min;
  const [draft, setDraft] = React.useState(() =>
    formatCustomizeNumber(current, step, unit),
  );
  const [editing, setEditing] = React.useState(false);
  const frameRef = React.useRef<number | null>(null);
  const latestRef = React.useRef(current);

  React.useEffect(() => {
    if (editing) return;
    latestRef.current = current;
    setDraft(formatCustomizeNumber(current, step, unit));
  }, [current, step, unit, editing]);

  React.useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  const percent = max === min ? 0 : ((current - min) / (max - min)) * 100;

  const commit = React.useCallback(
    (nextValue: number) => {
      const clamped = Math.min(max, Math.max(min, nextValue));
      const snapped = Number(clamped.toFixed(decimalsForStep(step)));
      if (snapped === latestRef.current) return;
      latestRef.current = snapped;
      setDraft(formatCustomizeNumber(snapped, step, unit));
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        onChange(snapped);
      });
    },
    [max, min, onChange, step, unit],
  );

  const fromPointer = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      if (rect.width <= 0) return;
      const ratio = (event.clientX - rect.left) / rect.width;
      commit(min + ratio * (max - min));
    },
    [commit, max, min],
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const largeStep = step * 10;
    let next: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      next = latestRef.current + (event.shiftKey ? largeStep : step);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      next = latestRef.current - (event.shiftKey ? largeStep : step);
    } else if (event.key === "PageUp") {
      next = latestRef.current + largeStep;
    } else if (event.key === "PageDown") {
      next = latestRef.current - largeStep;
    } else if (event.key === "Home") {
      next = min;
    } else if (event.key === "End") {
      next = max;
    }
    if (next === null) return;
    event.preventDefault();
    commit(next);
  };

  const finishEditing = () => {
    const parsed = Number.parseFloat(draft.replace(/[^\d.-]/g, ""));
    setEditing(false);
    if (Number.isFinite(parsed)) commit(parsed);
    else setDraft(formatCustomizeNumber(latestRef.current, step, unit));
  };

  return (
    <div
      data-customize-tile
      data-customize-tile-type="slider"
      role="slider"
      tabIndex={0}
      aria-label={normalizeLabel(control.label)}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={current}
      aria-valuetext={formatCustomizeNumber(current, step, unit)}
      className="group relative flex h-12 w-full cursor-ew-resize touch-none select-none items-center justify-between gap-2 overflow-hidden rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none transition-colors hover:border-foreground/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      onPointerDown={(event) => {
        if (editing) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        fromPointer(event);
      }}
      onPointerMove={(event) => {
        if (editing || (event.buttons & 1) === 0) return;
        fromPointer(event);
      }}
      onPointerUp={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      }}
      onKeyDown={onKeyDown}
      onDoubleClick={() => setEditing(true)}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 bg-accent transition-[width] duration-75"
        style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
      />
      <span className="relative z-10 min-w-0 truncate">{normalizeLabel(control.label)}</span>
      {editing ? (
        <input
          autoFocus
          value={draft}
          aria-label={`${normalizeLabel(control.label)} value`}
          className="relative z-10 h-8 w-20 rounded-md border border-border bg-background px-2 text-right text-sm tabular-nums text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onPointerDown={(event) => event.stopPropagation()}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={finishEditing}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              finishEditing();
            } else if (event.key === "Escape") {
              setDraft(formatCustomizeNumber(latestRef.current, step, unit));
              setEditing(false);
            }
          }}
        />
      ) : (
        <span className="relative z-10 shrink-0 rounded px-1 font-mono text-xs tabular-nums text-muted-foreground">
          {formatCustomizeNumber(current, step, unit)}
        </span>
      )}
    </div>
  );
});

const SelectTile = React.memo(function SelectTile({
  control,
  value,
  onChange,
  isPreset = false,
}: TileProps & {
  control: Extract<CustomizeControl, { type: "select" }>;
  isPreset?: boolean;
}) {
  const anchorRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const currentValue = typeof value === "string" ? value : control.options[0]?.value ?? "";
  const currentLabel =
    control.options.find((option) => option.value === currentValue)?.label ?? currentValue;
  const label = isPreset ? "Preset" : normalizeLabel(control.label);

  return (
    <div
      data-customize-tile
      data-customize-tile-type={isPreset ? "preset" : "select"}
      className={cn("relative", isPreset && "col-span-full")}
    >
      <button
        ref={anchorRef}
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-12 w-full items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none transition-colors hover:border-foreground/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        onClick={() => setOpen((previous) => !previous)}
      >
        <span className="min-w-0 truncate text-left">{label}</span>
        <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
          <span className="max-w-[12rem] truncate text-right">{currentLabel}</span>
          {open ? (
            <ChevronUp className="size-3.5 shrink-0" aria-hidden="true" />
          ) : (
            <ChevronDown className="size-3.5 shrink-0" aria-hidden="true" />
          )}
        </span>
      </button>
      <FloatingMenu
        open={open}
        anchorRef={anchorRef}
        onClose={() => setOpen(false)}
        label={label}
      >
        <div role="listbox" aria-label={label} className="max-h-64 overflow-y-auto">
          {control.options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === currentValue}
              className="flex h-10 w-full items-center justify-between gap-2 rounded-md px-2.5 text-left text-sm text-foreground outline-none hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              <span className="truncate">{option.label}</span>
              {option.value === currentValue ? (
                <Check className="size-3.5 shrink-0" aria-hidden="true" />
              ) : null}
            </button>
          ))}
        </div>
      </FloatingMenu>
    </div>
  );
});

const ColorTile = React.memo(function ColorTile({
  control,
  value,
  onChange,
}: TileProps & { control: Extract<CustomizeControl, { type: "color" }> }) {
  const anchorRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const normalized = normalizeHexColor(typeof value === "string" ? value : "");
  const fallback = normalizeHexColor(control.defaultColor ?? "") ?? "#000000";
  const [draft, setDraft] = React.useState(normalized ?? "");

  React.useEffect(() => {
    setDraft(normalized ?? "");
  }, [normalized]);

  return (
    <div data-customize-tile data-customize-tile-type="color" className="relative">
      <div className="flex h-12 w-full items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 text-sm text-foreground">
        <span className="min-w-0 truncate">{normalizeLabel(control.label)}</span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="font-mono text-xs uppercase text-muted-foreground">
            {normalized ?? String(value ?? "")}
          </span>
          <button
            ref={anchorRef}
            type="button"
            aria-label={`${normalizeLabel(control.label)} color picker`}
            aria-expanded={open}
            className="size-6 rounded-md border border-border outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            style={{ backgroundColor: normalized ?? fallback }}
            onClick={() => setOpen((previous) => !previous)}
          />
        </span>
      </div>
      <FloatingMenu
        open={open}
        anchorRef={anchorRef}
        onClose={() => setOpen(false)}
        label={`${normalizeLabel(control.label)} color picker`}
        minWidth={220}
      >
        <div className="space-y-2 p-2">
          <input
            type="color"
            aria-label={`${normalizeLabel(control.label)} color input`}
            value={normalized ?? fallback}
            className="h-10 w-full cursor-pointer rounded-md border border-border bg-transparent p-1"
            onChange={(event) => {
              const next = normalizeHexColor(event.target.value);
              if (next) {
                setDraft(next);
                onChange(next);
              }
            }}
          />
          <input
            value={draft}
            aria-label={`${normalizeLabel(control.label)} hex value`}
            placeholder="#000000"
            spellCheck={false}
            className="h-9 w-full rounded-md border border-border bg-background px-2.5 font-mono text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onChange={(event) => {
              const nextDraft = event.target.value;
              setDraft(nextDraft);
              const next = normalizeHexColor(nextDraft);
              if (next) onChange(next);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                const next = normalizeHexColor(draft);
                if (next) {
                  onChange(next);
                  setOpen(false);
                }
              }
            }}
          />
        </div>
      </FloatingMenu>
    </div>
  );
});

const ToggleTile = React.memo(function ToggleTile({
  control,
  value,
  onChange,
}: TileProps & { control: Extract<CustomizeControl, { type: "toggle" }> }) {
  const checked = Boolean(value);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={normalizeLabel(control.label)}
      data-customize-tile
      data-customize-tile-type="toggle"
      className="flex h-12 w-full items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none transition-colors hover:border-foreground/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      onClick={() => onChange(!checked)}
    >
      <span className="min-w-0 truncate">{normalizeLabel(control.label)}</span>
      <span
        aria-hidden="true"
        className={cn(
          "relative h-6 w-10 shrink-0 rounded-full border border-border transition-colors",
          checked ? "bg-foreground" : "bg-muted",
        )}
      >
        <span
          className={cn(
            "absolute top-[3px] size-[16px] rounded-full bg-background transition-transform",
            checked ? "translate-x-[19px]" : "translate-x-[3px]",
          )}
        />
      </span>
    </button>
  );
});

const TextTile = React.memo(function TextTile({
  control,
  value,
  onChange,
}: TileProps & {
  control: Extract<CustomizeControl, { type: "text" | "textarea" }>;
}) {
  const current = typeof value === "string" ? value : "";
  return (
    <label
      data-customize-tile
      data-customize-tile-type={control.type}
      className="flex h-12 w-full items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background"
    >
      <span className="min-w-0 shrink-0">{normalizeLabel(control.label)}</span>
      <input
        value={current}
        placeholder={control.type === "text" ? control.placeholder : undefined}
        maxLength={control.type === "text" ? control.maxLength : undefined}
        aria-label={normalizeLabel(control.label)}
        className="h-8 min-w-0 flex-1 rounded-md border border-border bg-background px-2 text-right text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
});

function Tile({ control, value, onChange }: TileProps) {
  switch (control.type) {
    case "slider":
      return <SliderTile control={control} value={value} onChange={onChange} />;
    case "select":
      return <SelectTile control={control} value={value} onChange={onChange} />;
    case "color":
      return <ColorTile control={control} value={value} onChange={onChange} />;
    case "toggle":
      return <ToggleTile control={control} value={value} onChange={onChange} />;
    case "text":
    case "textarea":
      return <TextTile control={control} value={value} onChange={onChange} />;
  }
}

export function CustomizePanel({
  slug,
  controls,
  values,
  defaults,
  onChange,
  onReset,
  presets,
  activePreset,
  onPresetChange,
  title = "Customize",
}: CustomizePanelProps) {
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const valueMap = values as Record<string, CustomizeControlValue>;
  const [scrollable, setScrollable] = React.useState(false);
  const [advancedOpen, setAdvancedOpen] = React.useState(false);

  const { normal, advanced } = React.useMemo(() => {
    const ordered = orderControls(controls);
    return {
      normal: ordered.filter((control) => !control.advanced),
      advanced: ordered.filter((control) => control.advanced),
    };
  }, [controls]);

  const dirty = React.useMemo(
    () => !configEquals(values, defaults),
    [defaults, values],
  );

  React.useEffect(() => {
    const element = bodyRef.current;
    if (!element) return;
    const update = () => setScrollable(element.scrollHeight > element.clientHeight + 2);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [normal.length, advanced.length, presets?.length]);

  const presetOptions = React.useMemo(() => {
    if (!presets?.length) return [];
    const options = presets.map((preset) => ({
      label: preset.label,
      value: preset.value,
    }));
    if (activePreset && !options.some((option) => option.value === activePreset)) {
      options.push({ label: activePreset, value: activePreset });
    }
    return options;
  }, [activePreset, presets]);

  const handleReset = () => {
    if (dirty) onReset();
  };

  return (
    <Card
      id="controls"
      data-section-title="Controls"
      variant="outline"
      className="mt-6 scroll-mt-24 overflow-hidden"
    >
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border/70 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <span className="truncate rounded-full border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            {slug}
          </span>
        </div>
        <CardAction>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!dirty}
            aria-disabled={!dirty}
            onClick={handleReset}
            className={cn(
              "h-8 gap-1.5 px-2 text-xs",
              !dirty && "pointer-events-none opacity-40",
            )}
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Reset
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="relative p-3 pt-0">
        <div
          ref={bodyRef}
          data-customize-body
          className="max-h-[456px] space-y-2 overflow-y-auto overscroll-contain py-3 pr-1 [scrollbar-width:thin]"
        >
          {presetOptions.length > 0 && onPresetChange ? (
            <SelectTile
              control={{
                type: "select",
                key: "__preset",
                label: "Preset",
                options: presetOptions,
              }}
              value={activePreset ?? presetOptions[0]?.value ?? ""}
              onChange={(value) => onPresetChange(String(value))}
              isPreset
            />
          ) : null}

          <div
            data-customize-grid
            className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3"
          >
            {normal.map((control) => (
              <Tile
                key={control.key}
                control={control}
                value={valueMap[control.key]}
                onChange={(value) => onChange(control.key, value)}
              />
            ))}
          </div>

          {advanced.length > 0 ? (
            <div data-customize-advanced className="col-span-full space-y-2">
              <button
                type="button"
                aria-expanded={advancedOpen}
                data-customize-advanced-trigger
                className="flex h-12 w-full items-center justify-between rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none transition-colors hover:border-foreground/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                onClick={() => setAdvancedOpen((previous) => !previous)}
              >
                <span>Advanced</span>
                {advancedOpen ? (
                  <ChevronUp className="size-4 text-muted-foreground" aria-hidden="true" />
                ) : (
                  <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
                )}
              </button>
              {advancedOpen ? (
                <div
                  data-customize-grid="advanced"
                  className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3"
                >
                  {advanced.map((control) => (
                    <Tile
                      key={control.key}
                      control={control}
                      value={valueMap[control.key]}
                      onChange={(value) => onChange(control.key, value)}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        {scrollable ? (
          <div
            data-customize-scroll-hint
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-3 bottom-0 flex h-10 items-end justify-center bg-gradient-to-t from-card via-card/85 to-transparent pb-1"
          >
            <span className="rounded-full border border-border bg-background/90 px-2 py-0.5 text-[10px] text-muted-foreground">
              Scroll for more
            </span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
