"use client";

import { cn } from "@workspace/ui/lib/utils";
import * as React from "react";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface InputOTPProps {
  /** Number of slots. @default 6 */
  length?: number;
  /** Controlled value. */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Fires on every change with the joined value. */
  onValueChange?: (value: string) => void;
  /** Fires once when every slot is filled. */
  onComplete?: (value: string) => void;
  /** Allowed characters as a regex source, e.g. "[0-9]". @default "[0-9]" */
  pattern?: string;
  /** Uppercase alphabetical input. @default false */
  uppercase?: boolean;
  /** 0-based slot indexes after which a separator renders. */
  separatorAfter?: number[];
  /** Disable all slots. @default false */
  disabled?: boolean;
  /** Error state with destructive ring. @default false */
  invalid?: boolean;
  /** Focus the first slot on mount. @default false */
  autoFocus?: boolean;
  /** Mobile keyboard hint. @default "text" */
  inputMode?: "text" | "numeric";
  /** Text direction. @default "ltr" */
  dir?: "ltr" | "rtl";
  /** Extra classes for the root. */
  className?: string;
  /** Extra classes for each slot. */
  slotClassName?: string;
}

function splitChars(value: string, length: number): string[] {
  const chars = Array.from(value).slice(0, length);
  while (chars.length < length) chars.push("");
  return chars;
}

// ─────────────────────────────────────────────────────────────
// Component — per-slot inputs with advance, paste-fill and
// direction-aware arrow navigation.
// ─────────────────────────────────────────────────────────────

export function InputOTP({
  length = 6,
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  onComplete,
  pattern = "[0-9]",
  uppercase = false,
  separatorAfter = [],
  disabled = false,
  invalid = false,
  autoFocus = false,
  inputMode = "text",
  dir = "ltr",
  className,
  slotClassName,
}: InputOTPProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const inputsRef = React.useRef<Array<HTMLInputElement | null>>([]);
  const completedRef = React.useRef<string | null>(null);

  const chars = splitChars(value, length);
  const matcher = React.useMemo(() => {
    try {
      return new RegExp(`^(?:${pattern})$`, "u");
    } catch {
      return /^.$/u;
    }
  }, [pattern]);

  const normalize = (ch: string): string | null => {
    let c = ch;
    if (uppercase) c = c.toUpperCase();
    return matcher.test(c) ? c : null;
  };

  const emit = (next: string) => {
    if (controlledValue === undefined) setInternalValue(next);
    onValueChange?.(next);
    if (next.length === length && completedRef.current !== next) {
      completedRef.current = next;
      onComplete?.(next);
    }
    if (next.length !== length) completedRef.current = null;
  };

  const focusSlot = (index: number) => {
    const clamped = Math.max(0, Math.min(length - 1, index));
    inputsRef.current[clamped]?.focus();
    inputsRef.current[clamped]?.select();
  };

  React.useEffect(() => {
    if (autoFocus && !disabled) focusSlot(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setRef = (index: number) => (node: HTMLInputElement | null) => {
    inputsRef.current[index] = node;
  };

  const handleChange = (index: number, raw: string) => {
    if (disabled) return;
    // Take the last typed char (covers autocomplete/IME single chars).
    const c = normalize(Array.from(raw).slice(-1)[0] ?? "");
    const next = [...chars];
    if (c === null) {
      // Reject without disturbing focus.
      const node = inputsRef.current[index];
      if (node) node.value = next[index] ?? "";
      return;
    }
    next[index] = c;
    emit(next.join(""));
    if (index < length - 1) focusSlot(index + 1);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // In RTL, visual left/right is mirrored.
    const flip = dir === "rtl" ? -1 : 1;
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...chars];
      if (next[index]) {
        next[index] = "";
        emit(next.join(""));
      } else if (index > 0) {
        next[index - 1] = "";
        emit(next.join(""));
        focusSlot(index - 1);
      }
      return;
    }
    if (e.key === "Delete") {
      e.preventDefault();
      const next = [...chars];
      next[index] = "";
      emit(next.join(""));
      return;
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusSlot(index - flip);
      return;
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      focusSlot(index + flip);
      return;
    }
    if (e.key === "Home") {
      e.preventDefault();
      focusSlot(0);
      return;
    }
    if (e.key === "End") {
      e.preventDefault();
      focusSlot(length - 1);
    }
  };

  const handlePaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;
    const text = Array.from(e.clipboardData.getData("text"));
    if (text.length === 0) return;
    const next = [...chars];
    let cursor = index;
    for (const raw of text) {
      if (cursor >= length) break;
      const c = normalize(raw);
      if (c === null) continue;
      next[cursor] = c;
      cursor += 1;
    }
    emit(next.join(""));
    focusSlot(Math.min(cursor, length - 1));
  };

  return (
    <div
      data-slot="input-otp"
      role="group"
      aria-label="One-time code"
      dir={dir}
      className={cn("flex items-center gap-2", className)}
    >
      {chars.map((ch, i) => (
        <React.Fragment key={i}>
          <input
            ref={setRef(i)}
            value={ch}
            disabled={disabled}
            inputMode={inputMode}
            autoComplete={i === 0 ? "one-time-code" : "off"}
            aria-label={`Digit ${i + 1} of ${length}`}
            aria-invalid={invalid || undefined}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={(e) => handlePaste(i, e)}
            onFocus={(e) => e.target.select()}
            onClick={(e) => (e.target as HTMLInputElement).select()}
            className={cn(
              "size-11 rounded-lg border border-input bg-background text-center text-lg font-semibold tabular-nums shadow-xs transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-ring",
              "disabled:cursor-not-allowed disabled:opacity-50",
              invalid && "border-destructive ring-1 ring-destructive/20 focus:ring-destructive/40",
              slotClassName,
            )}
          />
          {separatorAfter.includes(i) && i < length - 1 && (
            <span aria-hidden className="text-lg font-medium text-muted-foreground">
              –
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default InputOTP;
