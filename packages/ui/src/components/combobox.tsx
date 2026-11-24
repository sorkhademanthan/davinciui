"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Check, ChevronDown, X } from "lucide-react";
import * as React from "react";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface ComboboxItem {
  /** Unique value. */
  value: string;
  /** Display text. Falls back to value. */
  label?: string;
  /** Extra matchable keywords. */
  keywords?: string[];
  /** Unselectable option. */
  disabled?: boolean;
}

export interface ComboboxGroup {
  label: string;
  items: ComboboxItem[];
}

export type ComboboxValue = string | string[] | null;

export interface ComboboxProps {
  /** Flat options. Ignored when `groups` is provided. */
  items?: ComboboxItem[];
  /** Grouped options. */
  groups?: ComboboxGroup[];
  /** Multi-select with chips. @default false */
  multiple?: boolean;
  /** Controlled selection. */
  value?: ComboboxValue;
  /** Uncontrolled initial selection. */
  defaultValue?: ComboboxValue;
  /** Fires on every selection change. */
  onValueChange?: (value: ComboboxValue) => void;
  /** Controlled filter text. */
  inputValue?: string;
  /** Uncontrolled initial filter text. */
  defaultInputValue?: string;
  /** Fires when the filter text changes. */
  onInputChange?: (value: string) => void;
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  /** Fires when the popup opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Maximum selections in multiple mode. */
  maxSelections?: number;
  /** Input placeholder. */
  placeholder?: string;
  /** Content shown when the filter matches nothing. */
  emptyMessage?: React.ReactNode;
  /** Disable the whole control. @default false */
  disabled?: boolean;
  /** Error state with destructive ring. @default false */
  invalid?: boolean;
  /** Show an X button that clears the selection. @default false */
  showClearButton?: boolean;
  /** Highlight the first match on open/type. @default false */
  autoHighlight?: boolean;
  /** Custom filter. Defaults to label/value/keyword contains-match. */
  filterItems?: (items: ComboboxItem[], query: string) => ComboboxItem[];
  /** Custom option renderer. */
  renderItem?: (item: ComboboxItem, state: { selected: boolean; highlighted: boolean }) => React.ReactNode;
  /** Text direction. @default "ltr" */
  dir?: "ltr" | "rtl";
  /** Extra classes for the root. */
  className?: string;
  /** Extra classes for the text input. */
  inputClassName?: string;
}

function defaultFilter(items: ComboboxItem[], query: string): ComboboxItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => {
    const hay = `${item.label ?? item.value} ${item.value} ${(item.keywords ?? []).join(" ")}`.toLowerCase();
    return hay.includes(q);
  });
}

function asArray(value: ComboboxValue): string[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export function Combobox({
  items = [],
  groups,
  multiple = false,
  value: controlledValue,
  defaultValue = null,
  onValueChange,
  inputValue: controlledInput,
  defaultInputValue = "",
  onInputChange,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  maxSelections,
  placeholder = "Select…",
  emptyMessage = "No results found.",
  disabled = false,
  invalid = false,
  showClearButton = false,
  autoHighlight = false,
  filterItems = defaultFilter,
  renderItem,
  dir = "ltr",
  className,
  inputClassName,
}: ComboboxProps) {
  const baseId = React.useId();
  const listId = `${baseId}-listbox`;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);

  const [internalValue, setInternalValue] = React.useState<ComboboxValue>(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const [internalQuery, setInternalQuery] = React.useState(defaultInputValue);
  const query = controlledInput !== undefined ? controlledInput : internalQuery;

  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const [highlight, setHighlight] = React.useState(-1);

  const sections = React.useMemo<Array<{ label?: string; items: ComboboxItem[] }>>(() => {
    if (groups) return groups.map((g) => ({ label: g.label, items: g.items }));
    return [{ items }];
  }, [groups, items]);

  const allItems = React.useMemo(() => sections.flatMap((s) => s.items), [sections]);

  const visibleSections = React.useMemo(() => {
    return sections
      .map((s) => ({ label: s.label, items: filterItems(s.items, query) }))
      .filter((s) => s.items.length > 0);
  }, [sections, filterItems, query]);

  const flatOptions = React.useMemo(() => visibleSections.flatMap((s) => s.items), [visibleSections]);

  const selectedValues = asArray(value);
  const maxed = multiple && maxSelections !== undefined && selectedValues.length >= maxSelections;

  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const setQuery = (next: string) => {
    if (controlledInput === undefined) setInternalQuery(next);
    onInputChange?.(next);
  };

  const labelOf = (v: string): string => {
    const found = allItems.find((i) => i.value === v);
    return found?.label ?? found?.value ?? v;
  };

  const emitValue = (next: ComboboxValue) => {
    if (controlledValue === undefined) setInternalValue(next);
    onValueChange?.(next);
  };

  const syncQueryToValue = (next: ComboboxValue) => {
    if (multiple || controlledInput !== undefined) return;
    const first = asArray(next)[0];
    setQuery(first !== undefined ? labelOf(first) : "");
  };

  const pick = (item: ComboboxItem) => {
    if (item.disabled || disabled) return;
    if (multiple) {
      const has = selectedValues.includes(item.value);
      if (!has && maxed) return;
      emitValue(has ? selectedValues.filter((v) => v !== item.value) : [...selectedValues, item.value]);
      setQuery("");
      setHighlight(-1);
      inputRef.current?.focus();
    } else {
      emitValue(item.value);
      setQuery(item.label ?? item.value);
      setOpen(false);
      setHighlight(-1);
    }
  };

  const clearAll = () => {
    emitValue(multiple ? [] : null);
    setQuery("");
    setHighlight(-1);
    inputRef.current?.focus();
  };

  const openWithHighlight = () => {
    setOpen(true);
    if (autoHighlight) {
      const idx = flatOptions.findIndex((i) => !i.disabled);
      setHighlight(idx);
    } else {
      setHighlight(-1);
    }
  };

  // Keep the first match highlighted while filtering when autoHighlight is on.
  React.useEffect(() => {
    if (open && autoHighlight && highlight === -1) {
      const idx = flatOptions.findIndex((i) => !i.disabled);
      if (idx >= 0) setHighlight(idx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, autoHighlight, query]);

  const moveHighlight = (delta: number) => {
    if (flatOptions.length === 0) return;
    let idx = highlight;
    for (let step = 0; step < flatOptions.length; step++) {
      idx = (idx + delta + flatOptions.length) % flatOptions.length;
      if (!flatOptions[idx]?.disabled) break;
    }
    setHighlight(idx);
    document.getElementById(`${listId}-opt-${idx}`)?.scrollIntoView({ block: "nearest" });
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        openWithHighlight();
        return;
      }
      moveHighlight(e.key === "ArrowDown" ? 1 : -1);
      return;
    }
    if (e.key === "Home" || e.key === "End") {
      if (!open) return;
      e.preventDefault();
      const enabled = flatOptions.map((o, i) => (!o.disabled ? i : -1)).filter((i) => i >= 0);
      const target = e.key === "Home" ? enabled[0] : enabled[enabled.length - 1];
      if (target !== undefined) setHighlight(target);
      return;
    }
    if (e.key === "Enter") {
      if (!open) {
        openWithHighlight();
        return;
      }
      const target = highlight >= 0 ? flatOptions[highlight] : undefined;
      if (target && !target.disabled) {
        e.preventDefault();
        pick(target);
      }
      return;
    }
    if (e.key === "Escape") {
      if (open) {
        e.preventDefault();
        setOpen(false);
        syncQueryToValue(value);
      }
      return;
    }
    if (e.key === "Backspace" && multiple && query === "" && selectedValues.length > 0) {
      emitValue(selectedValues.slice(0, -1));
    }
  };

  // Close on outside pointer.
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        syncQueryToValue(value);
      }
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const hasValue = selectedValues.length > 0;
  const activeDescendant = highlight >= 0 ? `${listId}-opt-${highlight}` : undefined;
  let flatCursor = -1;

  return (
    <div ref={rootRef} data-slot="combobox" dir={dir} className={cn("relative w-72", className)}>
      {/* Control */}
      <div
        className={cn(
          "flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm shadow-xs transition-colors",
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring",
          disabled && "cursor-not-allowed opacity-50",
          invalid && "border-destructive ring-1 ring-destructive/20 focus-within:ring-destructive/40",
        )}
        onClick={() => {
          if (disabled) return;
          inputRef.current?.focus();
          if (!open) openWithHighlight();
        }}
      >
        {multiple &&
          selectedValues.map((v) => (
            <span
              key={v}
              className="inline-flex max-w-full items-center gap-1 rounded-md bg-secondary py-0.5 pe-1 ps-2 text-xs font-medium text-secondary-foreground"
            >
              <span className="truncate">{labelOf(v)}</span>
              <button
                type="button"
                aria-label={`Remove ${labelOf(v)}`}
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  emitValue(selectedValues.filter((x) => x !== v));
                }}
                className="rounded-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        <input
          ref={inputRef}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={activeDescendant}
          aria-autocomplete="list"
          aria-invalid={invalid}
          disabled={disabled}
          value={query}
          placeholder={multiple && hasValue ? "" : placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
            // Typing resets highlight; the autoHighlight effect re-picks first match.
            setHighlight(-1);
          }}
          onFocus={() => {
            if (!open && !disabled) openWithHighlight();
          }}
          onKeyDown={onInputKeyDown}
          className={cn(
            "min-w-16 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
            inputClassName,
          )}
        />
        {showClearButton && hasValue && !disabled && (
          <button
            type="button"
            aria-label="Clear selection"
            onClick={(e) => {
              e.stopPropagation();
              clearAll();
            }}
            className="shrink-0 rounded-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      </div>

      {/* Popup */}
      {open && !disabled && (
        <div className="absolute inset-x-0 top-full z-50 mt-1.5">
          <div
            role="listbox"
            id={listId}
            aria-multiselectable={multiple || undefined}
            onMouseDown={(e) => e.preventDefault()}
            data-lenis-prevent className="max-h-64 overflow-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md"
          >
            {visibleSections.length === 0 && (
              <div className="px-2.5 py-6 text-center text-sm text-muted-foreground">{emptyMessage}</div>
            )}
            {visibleSections.map((section, si) => (
              <div key={section.label ?? `flat-${si}`}>
                {section.label && (
                  <div className="px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {section.label}
                  </div>
                )}
                {section.items.map((item) => {
                  flatCursor += 1;
                  const idx = flatCursor;
                  const selected = selectedValues.includes(item.value);
                  const highlighted = idx === highlight;
                  return (
                    <div
                      key={item.value}
                      role="option"
                      id={`${listId}-opt-${idx}`}
                      aria-selected={selected}
                      aria-disabled={item.disabled || undefined}
                      onClick={() => pick(item)}
                      onMouseMove={() => {
                        if (!item.disabled && highlight !== idx) setHighlight(idx);
                      }}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm",
                        highlighted && "bg-accent text-accent-foreground",
                        item.disabled && "cursor-not-allowed opacity-40",
                      )}
                    >
                      {multiple && (
                        <span
                          className={cn(
                            "flex size-4 shrink-0 items-center justify-center rounded border",
                            selected ? "border-primary bg-primary text-primary-foreground" : "border-input",
                          )}
                          aria-hidden
                        >
                          {selected && <Check className="size-3" />}
                        </span>
                      )}
                      <span className="flex-1 truncate">
                        {renderItem ? (
                          renderItem(item, { selected, highlighted })
                        ) : (
                          <>{item.label ?? item.value}</>
                        )}
                      </span>
                      {!multiple && selected && <Check className="size-4 shrink-0" aria-hidden />}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Combobox;
