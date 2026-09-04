"use client";

import { cn } from "@workspace/ui/lib/utils";
import { CalendarDays, X } from "lucide-react";
import * as React from "react";
import { Calendar, type CalendarSystem, type DateRange } from "./calendar";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface DatePickerPreset {
  label: string;
  value: Date | (() => Date);
}

export type DatePickerPlacement = "bottom-start" | "bottom-end" | "top-start" | "top-end";

export interface DatePickerProps {
  /** Controlled selected date. */
  value?: Date | null;
  /** Uncontrolled initial date. */
  defaultValue?: Date | null;
  /** Fires when the date changes (pick, preset, clear, time edit). */
  onValueChange?: (date: Date | null) => void;
  /** Input placeholder. */
  placeholder?: string;
  /** Disable the whole control. @default false */
  disabled?: boolean;
  /** Error state with destructive ring. @default false */
  invalid?: boolean;
  /** Show an X button that clears the date. @default false */
  showClearButton?: boolean;
  /** Hour/minute selects bound to the value. @default false */
  showTimeSelect?: boolean;
  /** Quick-pick buttons rendered above the calendar. */
  presets?: DatePickerPreset[];
  /** Booked days — array, predicate, or both. */
  disabledDates?: Date[] | ((date: Date) => boolean);
  /** Display formatter for the input. Defaults to locale short date (+time). */
  formatDate?: (date: Date) => string;
  /** BCP-47 locale for the calendar and the readout. @default "en-US" */
  locale?: string;
  /** 0 = Sunday … 6 = Saturday. @default 0 */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Calendar system for the grid. @default "gregory" */
  calendarSystem?: CalendarSystem;
  /** Text direction. @default "ltr" */
  dir?: "ltr" | "rtl";
  /** Popup alignment relative to the field. @default "bottom-start" */
  placement?: DatePickerPlacement;
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  /** Fires when the popup opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Extra classes for the root. */
  className?: string;
  /** Extra classes for the text input. */
  inputClassName?: string;
  /** Extra classes for the inner calendar. */
  calendarClassName?: string;
}

function resolvePreset(p: DatePickerPreset): Date {
  return typeof p.value === "function" ? p.value() : p.value;
}

const POPUP_POSITION: Record<DatePickerPlacement, string> = {
  "bottom-start": "top-full start-0 mt-1.5",
  "bottom-end": "top-full end-0 mt-1.5",
  "top-start": "bottom-full start-0 mb-1.5",
  "top-end": "bottom-full end-0 mb-1.5",
};

// ─────────────────────────────────────────────────────────────
// Component — input-anchored single-date picker.
// ─────────────────────────────────────────────────────────────

export function DatePicker({
  value: controlledValue,
  defaultValue = null,
  onValueChange,
  placeholder = "Pick a date",
  disabled = false,
  invalid = false,
  showClearButton = false,
  showTimeSelect = false,
  presets,
  disabledDates,
  formatDate,
  locale = "en-US",
  weekStartsOn,
  calendarSystem = "gregory",
  dir = "ltr",
  placement = "bottom-start",
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  className,
  inputClassName,
  calendarClassName,
}: DatePickerProps) {
  const [internalValue, setInternalValue] = React.useState<Date | null>(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const rootRef = React.useRef<HTMLDivElement>(null);

  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const emit = (next: Date | null) => {
    if (controlledValue === undefined) setInternalValue(next);
    onValueChange?.(next);
  };

  const display = React.useMemo(() => {
    if (!value) return "";
    if (formatDate) return formatDate(value);
    return value.toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
      ...(showTimeSelect ? { hour: "2-digit", minute: "2-digit" } : {}),
    });
  }, [value, formatDate, locale, showTimeSelect]);

  // Close on outside pointer / Escape.
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open ]);

  const hasValue = value != null;

  return (
    <div ref={rootRef} data-slot="date-picker" dir={dir} className={cn("relative w-72", className)}>
      <div
        role="button"
        tabIndex={disabled ? undefined : 0}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-disabled={disabled || undefined}
        onClick={() => {
          if (!disabled) setOpen(!open);
        }}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault();
            setOpen(!open);
          }
        }}
        className={cn(
          "flex h-10 w-full cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm shadow-xs transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          !hasValue && "text-muted-foreground",
          disabled && "cursor-not-allowed opacity-50",
          invalid && "border-destructive ring-1 ring-destructive/20",
        )}
      >
        <CalendarDays className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <input
          readOnly
          tabIndex={-1}
          value={display}
          placeholder={placeholder}
          disabled={disabled}
          aria-label="Selected date"
          onFocus={(e) => e.target.blur()}
          className={cn(
            "min-w-0 flex-1 cursor-pointer bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
            inputClassName,
          )}
        />
        {showClearButton && hasValue && !disabled && (
          <button
            type="button"
            aria-label="Clear date"
            onClick={(e) => {
              e.stopPropagation();
              emit(null);
            }}
            className="shrink-0 rounded-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {open && !disabled && (
        <div className={cn("absolute z-50", POPUP_POSITION[placement])}>
          <div role="dialog" aria-label="Choose date" className="flex flex-col items-stretch gap-2">
            {presets && presets.length > 0 && (
              <div className="flex flex-wrap gap-1.5 rounded-xl border bg-card p-2 shadow-md">
                {presets.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      emit(resolvePreset(p));
                      setOpen(false);
                    }}
                    className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
            <Calendar
              mode="single"
              selected={value}
              onSelect={(v: Date | DateRange | null) => {
                if (v instanceof Date) {
                  emit(v);
                  setOpen(false);
                }
              }}
              disabled={disabledDates}
              locale={locale}
              weekStartsOn={weekStartsOn}
              calendarSystem={calendarSystem}
              showTimeSelect={showTimeSelect}
              dir={dir}
              className={calendarClassName}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default DatePicker;
