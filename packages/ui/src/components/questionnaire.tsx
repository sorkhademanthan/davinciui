"use client";

import { cn } from "@workspace/ui/lib/utils";
import * as React from "react";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type QuestionnaireItemStatus = "unanswered" | "answered" | "skipped";

export interface QuestionnaireChoiceDefinition {
  value: string;
  disabled?: boolean;
}

export interface QuestionnaireItemDefinition {
  name: string;
  required?: boolean;
  disabled?: boolean;
  choices?: readonly QuestionnaireChoiceDefinition[];
}

interface RegisteredItem {
  name: string;
  required: boolean;
  multiple: boolean;
  disabled: boolean;
}

interface QuestionnaireContextValue {
  activeName: string | null;
  enabledNames: string[];
  total: number;
  current: number;
  isFirst: boolean;
  isLast: boolean;
  shortcuts: "letters" | "numbers" | undefined;
  statusOf: (name: string) => QuestionnaireItemStatus;
  activeStatus: QuestionnaireItemStatus;
  isInvalid: (name: string) => boolean;
  registerItem: (item: RegisteredItem) => void;
  unregisterItem: (name: string) => void;
  getItem: (name: string) => RegisteredItem | undefined;
  notifyAnswered: (name: string) => void;
  shortcutFor: (itemName: string, value: string | null, domIndex: number) => string | null;
  registerFieldset: (name: string, node: HTMLFieldSetElement | null) => void;
  goTo: (name: string) => void;
  goNext: () => void;
  goPrevious: () => void;
  skipActive: () => void;
  formRef: React.RefObject<HTMLFormElement | null>;
}

const QuestionnaireContext = React.createContext<QuestionnaireContextValue | null>(null);

function useQuestionnaire() {
  const ctx = React.useContext(QuestionnaireContext);
  if (!ctx) throw new Error("Questionnaire parts must be used inside <Questionnaire>.");
  return ctx;
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const NUMBERS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

function shortcutAt(mode: "letters" | "numbers" | undefined, index: number): string | null {
  if (!mode) return null;
  const pool = mode === "letters" ? LETTERS : NUMBERS;
  return pool[index] ?? null;
}

// ─────────────────────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────────────────────

export interface QuestionnaireProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "onReset"> {
  items?: readonly QuestionnaireItemDefinition[];
  item?: string;
  defaultItem?: string;
  onItemChange?: (item: string) => void;
  shortcuts?: "letters" | "numbers";
  noValidate?: boolean;
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  onReset?: React.FormEventHandler<HTMLFormElement>;
}

function readItemAnswered(form: HTMLFormElement | null, name: string): boolean {
  if (!form) return false;
  const controls = form.querySelectorAll<HTMLInputElement>(`input[name="${CSS.escape(name)}"]`);
  for (const el of Array.from(controls)) {
    if (el.disabled) continue;
    if (el.type === "checkbox" || el.type === "radio") {
      if (el.checked) return true;
    } else if (el.value.trim() !== "") {
      return true;
    }
  }
  return false;
}

function QuestionnaireRoot({
  items,
  item: controlledItem,
  defaultItem,
  onItemChange,
  shortcuts,
  noValidate = true,
  className,
  children,
  onSubmit,
  onReset,
  onKeyDown,
  onChange,
  ...props
}: QuestionnaireProps) {
  const formRef = React.useRef<HTMLFormElement | null>(null);
  const [registered, setRegistered] = React.useState<RegisteredItem[]>([]);
  const [version, setVersion] = React.useState(0);
  const [skipped, setSkipped] = React.useState<Set<string>>(new Set());
  const [invalid, setInvalid] = React.useState<Set<string>>(new Set());
  const [uncontrolledActive, setUncontrolledActive] = React.useState<string | null>(defaultItem ?? null);

  const fieldsetRegistry = React.useRef(new Map<string, HTMLFieldSetElement | null>());

  const defEnabledNames = React.useMemo(() => {
    if (!items) return null;
    return items.filter((i) => !i.disabled).map((i) => i.name);
  }, [items]);

  const regEnabledNames = registered.filter((r) => !r.disabled).map((r) => r.name);

  const enabledNames = defEnabledNames ?? regEnabledNames;
  const total = enabledNames.length;

  const activeName = controlledItem ?? uncontrolledActive ?? enabledNames[0] ?? null;
  const activeIndex = activeName ? enabledNames.indexOf(activeName) : -1;
  const current = activeIndex >= 0 ? activeIndex + 1 : 0;

  const setActive = React.useCallback(
    (name: string) => {
      if (controlledItem === undefined) setUncontrolledActive(name);
      onItemChange?.(name);
    },
    [controlledItem, onItemChange]
  );

  const registerItem = React.useCallback((item: RegisteredItem) => {
    setRegistered((prev) => {
      const next = prev.filter((r) => r.name !== item.name);
      next.push(item);
      return next;
    });
  }, []);

  const unregisterItem = React.useCallback((name: string) => {
    setRegistered((prev) => prev.filter((r) => r.name !== name));
  }, []);

  const getItem = React.useCallback(
    (name: string) => {
      const fromReg = registered.find((r) => r.name === name);
      if (fromReg) return fromReg;
      const def = items?.find((i) => i.name === name);
      if (def) return { name: def.name, required: !!def.required, multiple: false, disabled: !!def.disabled };
      return undefined;
    },
    [registered, items]
  );

  const statusOf = React.useCallback(
    (name: string): QuestionnaireItemStatus => {
      if (skipped.has(name)) return "skipped";
      if (readItemAnswered(formRef.current, name)) return "answered";
      return "unanswered";
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [skipped, version, activeName]
  );

  const activeStatus: QuestionnaireItemStatus = activeName ? statusOf(activeName) : "unanswered";

  const isInvalid = React.useCallback((name: string) => invalid.has(name), [invalid]);

  const notifyAnswered = React.useCallback(
    (name: string) => {
      setSkipped((prev) => {
        if (!prev.has(name)) return prev;
        const next = new Set(prev);
        next.delete(name);
        return next;
      });
      setInvalid((prev) => {
        if (!prev.has(name)) return prev;
        const next = new Set(prev);
        next.delete(name);
        return next;
      });
      setVersion((v) => v + 1);
    },
    []
  );

  const shortcutFor = React.useCallback(
    (itemName: string, value: string | null, domIndex: number): string | null => {
      if (!shortcuts) return null;
      const def = items?.find((i) => i.name === itemName);
      if (def?.choices && value != null) {
        let enabledIndex = -1;
        for (const c of def.choices) {
          if (c.disabled) {
            if (c.value === value) return null;
            continue;
          }
          enabledIndex += 1;
          if (c.value === value) return shortcutAt(shortcuts, enabledIndex);
        }
        return null;
      }
      return shortcutAt(shortcuts, domIndex);
    },
    [shortcuts, items]
  );

  const registerFieldset = React.useCallback((name: string, node: HTMLFieldSetElement | null) => {
    if (node) fieldsetRegistry.current.set(name, node);
    else fieldsetRegistry.current.delete(name);
  }, []);

  const focusItem = (name: string, focusAnswerOnError = false) => {
    requestAnimationFrame(() => {
      const fs = fieldsetRegistry.current.get(name);
      if (!fs) return;
      if (focusAnswerOnError) {
        const target = fs.querySelector<HTMLInputElement>("input:not([disabled])");
        target?.focus();
      } else {
        fs.focus();
      }
    });
  };

  const checkValid = (name: string): boolean => {
    const reg = getItem(name);
    if (!reg || reg.disabled) return true;
    if (readItemAnswered(formRef.current, name)) return true;
    if (!reg.required && skipped.has(name)) return true;
    return false;
  };

  const goTo = React.useCallback(
    (name: string) => {
      if (!enabledNames.includes(name)) return;
      setActive(name);
      focusItem(name);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enabledNames.join(","), setActive]
  );

  const goNext = React.useCallback(() => {
    if (!activeName) return;
    if (!checkValid(activeName)) {
      setInvalid((prev) => new Set(prev).add(activeName));
      focusItem(activeName, true);
      return;
    }
    const idx = enabledNames.indexOf(activeName);
    const next = enabledNames[idx + 1];
    if (next) {
      setActive(next);
      focusItem(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeName, enabledNames.join(","), skipped, setActive]);

  const goPrevious = React.useCallback(() => {
    if (!activeName) return;
    const idx = enabledNames.indexOf(activeName);
    const prev = enabledNames[idx - 1];
    if (prev) {
      setActive(prev);
      focusItem(prev);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeName, enabledNames.join(","), setActive]);

  const skipActive = React.useCallback(() => {
    if (!activeName) return;
    const reg = getItem(activeName);
    if (!reg || reg.required) return;
    const form = formRef.current;
    if (form) {
      form.querySelectorAll<HTMLInputElement>(`input[name="${CSS.escape(activeName)}"]`).forEach((el) => {
        if (el.type === "checkbox" || el.type === "radio") el.checked = false;
        else el.value = "";
      });
    }
    setInvalid((prev) => {
      const next = new Set(prev);
      next.delete(activeName);
      return next;
    });
    setSkipped((prev) => new Set(prev).add(activeName));
    const idx = enabledNames.indexOf(activeName);
    const next = enabledNames[idx + 1];
    if (next) {
      setActive(next);
      focusItem(next);
    } else {
      setVersion((v) => v + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeName, enabledNames.join(","), setActive]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    for (const name of enabledNames) {
      if (!checkValid(name)) {
        e.preventDefault();
        setInvalid((prev) => new Set(prev).add(name));
        setActive(name);
        focusItem(name, true);
        return;
      }
    }
    onSubmit?.(e);
  };

  const handleReset: React.FormEventHandler<HTMLFormElement> = (e) => {
    if (onReset) {
      onReset(e);
      if (e.defaultPrevented) return;
    }
    setSkipped(new Set());
    setInvalid(new Set());
    const fallback = defaultItem ?? enabledNames[0] ?? null;
    if (controlledItem === undefined) setUncontrolledActive(fallback);
    else if (fallback) onItemChange?.(fallback);
  };

  const handleChange: React.FormEventHandler<HTMLFormElement> = (e) => {
    onChange?.(e);
    setVersion((v) => v + 1);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLFormElement> = (e) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    const target = e.target as HTMLElement;
    const isTextEntry =
      target instanceof HTMLInputElement &&
      target.type !== "checkbox" &&
      target.type !== "radio" &&
      target.type !== "button";
    const isRadio = target instanceof HTMLInputElement && target.type === "radio";

    // Cmd/Ctrl+Enter: validate + continue or submit.
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (activeName && enabledNames.indexOf(activeName) < enabledNames.length - 1) goNext();
      else formRef.current?.requestSubmit();
      return;
    }

    // ArrowLeft/Right item navigation (outside radios + text entry).
    if (!isRadio && !isTextEntry && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrevious();
      } else if (statusOf(activeName ?? "") !== "unanswered") {
        e.preventDefault();
        goNext();
      }
      return;
    }

    // Answer shortcuts (pause while typing).
    if (!shortcuts || isTextEntry || e.metaKey || e.ctrlKey || e.altKey) return;
    const key = e.key.toUpperCase();
    const form = formRef.current;
    if (!form || !activeName) return;
    const choiceInputs = Array.from(
      form.querySelectorAll<HTMLInputElement>(
        `fieldset[data-questionnaire-item="${CSS.escape(activeName)}"] input[data-choice-input]:not([disabled])`
      )
    );
    const idx = choiceInputs.findIndex((el) => el.dataset.shortcut?.toUpperCase() === key);
    const match = choiceInputs[idx];
    if (idx >= 0 && match) {
      e.preventDefault();
      match.click();
      match.focus();
    }
  };

  const ctx: QuestionnaireContextValue = {
    activeName,
    enabledNames,
    total,
    current,
    isFirst: activeIndex <= 0,
    isLast: activeIndex === enabledNames.length - 1,
    shortcuts,
    statusOf,
    activeStatus,
    isInvalid,
    registerItem,
    unregisterItem,
    getItem,
    notifyAnswered,
    shortcutFor,
    registerFieldset,
    goTo,
    goNext,
    goPrevious,
    skipActive,
    formRef,
  };

  return (
    <QuestionnaireContext.Provider value={ctx}>
      <form
        ref={formRef}
        data-slot="questionnaire"
        data-current={current || undefined}
        data-total={total || undefined}
        data-first={activeIndex === 0 || undefined}
        data-last={activeIndex === enabledNames.length - 1 || undefined}
        data-shortcuts={shortcuts}
        noValidate={noValidate}
        onSubmit={handleSubmit}
        onReset={handleReset}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={cn("flex w-full flex-col gap-6", className)}
        {...props}
      >
        {children}
      </form>
    </QuestionnaireContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────
// Progress
// ─────────────────────────────────────────────────────────────

export interface QuestionnaireProgressState {
  current: number;
  total: number;
  first: boolean;
  last: boolean;
}

interface QuestionnaireProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  render?: (props: React.HTMLAttributes<HTMLDivElement>, state: QuestionnaireProgressState) => React.ReactElement;
}

function QuestionnaireProgress({ className, children, render, ...props }: QuestionnaireProgressProps) {
  const { current, total, isFirst, isLast } = useQuestionnaire();
  const state: QuestionnaireProgressState = { current, total, first: isFirst, last: isLast };
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  if (render) return render({ ...props, className }, state);
  return (
    <div data-slot="questionnaire-progress" className={cn("flex flex-col gap-2", className)} {...props}>
      <div
        role="progressbar"
        aria-label="Questionnaire progress"
        aria-valuemin={1}
        aria-valuemax={Math.max(total, 1)}
        aria-valuenow={Math.max(current, 1)}
        aria-valuetext={`Question ${Math.max(current, 1)} of ${Math.max(total, 1)}`}
        className="flex items-center justify-between gap-4"
      >
        <span className="text-sm text-muted-foreground">
          {children ?? `Question ${Math.max(current, 1)} of ${Math.max(total, 1)}`}
        </span>
        <span className="font-mono text-xs text-muted-foreground">{pct}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Item / Title / Description
// ─────────────────────────────────────────────────────────────

export interface QuestionnaireItemProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  name: string;
  required?: boolean;
  multiple?: boolean;
  invalid?: boolean;
  onStatusChange?: (status: QuestionnaireItemStatus) => void;
}

const QuestionnaireItemIds = React.createContext({ descId: "", errId: "" });

function QuestionnaireItem({
  name,
  required = false,
  multiple = false,
  disabled = false,
  invalid: invalidProp = false,
  onStatusChange,
  className,
  children,
  ...props
}: QuestionnaireItemProps) {
  const ctx = useQuestionnaire();
  const ref = React.useRef<HTMLFieldSetElement | null>(null);
  const isActive = ctx.activeName === name;
  const status = ctx.statusOf(name);
  const failed = invalidProp || ctx.isInvalid(name);
  const descId = React.useId();
  const errId = React.useId();

  React.useEffect(() => {
    ctx.registerItem({ name, required, multiple, disabled });
    return () => ctx.unregisterItem(name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, required, multiple, disabled]);

  const prevStatus = React.useRef(status);
  React.useEffect(() => {
    if (prevStatus.current !== status) {
      prevStatus.current = status;
      onStatusChange?.(status);
    }
  }, [status, onStatusChange]);

  return (
    <fieldset
      ref={(node) => {
        ref.current = node;
        ctx.registerFieldset(name, node);
      }}
      data-slot="questionnaire-item"
      data-questionnaire-item={name}
      data-active={isActive || undefined}
      data-status={status}
      data-required={required || undefined}
      data-multiple={multiple || undefined}
      data-disabled={disabled || undefined}
      data-invalid={failed || undefined}
      aria-invalid={failed || undefined}
      aria-describedby={`${descId} ${failed ? errId : ""}`.trim()}
      tabIndex={-1}
      hidden={!isActive}
      className={cn("flex flex-col gap-4 outline-none", className)}
      {...props}
    >
      <QuestionnaireItemIds.Provider value={{ descId, errId }}>
        {children}
      </QuestionnaireItemIds.Provider>
    </fieldset>
  );
}

function QuestionnaireTitle({ className, ...props }: React.HTMLAttributes<HTMLLegendElement>) {
  return (
    <legend
      data-slot="questionnaire-title"
      className={cn("text-lg font-semibold leading-7", className)}
      {...props}
    />
  );
}

function QuestionnaireDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const { descId } = React.useContext(QuestionnaireItemIds);
  return (
    <p
      data-slot="questionnaire-description"
      id={descId || undefined}
      className={cn("text-sm leading-6 text-muted-foreground", className)}
      {...props}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// Choices / Choice / Input / Error
// ─────────────────────────────────────────────────────────────

function QuestionnaireChoices({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { shortcuts } = useQuestionnaire();
  return (
    <div
      data-slot="questionnaire-choices"
      data-shortcuts={shortcuts}
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

const ChoiceContext = React.createContext<{ itemName: string; value: string; shortcut: string | null; type: "radio" | "checkbox" }>({
  itemName: "",
  value: "",
  shortcut: null,
  type: "radio",
});

export interface QuestionnaireChoiceProps extends Omit<React.LabelHTMLAttributes<HTMLLabelElement>, "onChange"> {
  value: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

function QuestionnaireChoice({ value, checked, defaultChecked, disabled, onChange, className, children, ...props }: QuestionnaireChoiceProps) {
  const ctx = useQuestionnaire();
  // Choices only render inside the active fieldset, so activeName is the owner.
  const itemName = ctx.activeName ?? "";
  const reg = itemName ? ctx.getItem(itemName) : undefined;
  const type = reg?.multiple ? "checkbox" : "radio";
  const itemInvalid = itemName ? ctx.isInvalid(itemName) : false;
  const labelRef = React.useRef<HTMLLabelElement | null>(null);
  const [domIndex, setDomIndex] = React.useState(0);

  React.useEffect(() => {
    const label = labelRef.current;
    const fieldset = label?.closest("fieldset[data-questionnaire-item]");
    if (!fieldset) return;
    const siblings = Array.from(
      fieldset.querySelectorAll(':scope label[data-slot="questionnaire-choice"]:not([data-disabled])')
    );
    if (label) setDomIndex(Math.max(0, siblings.indexOf(label)));
  }, []);

  const shortcut = disabled ? null : ctx.shortcutFor(itemName, value, domIndex);
  return (
    <ChoiceContext.Provider value={{ itemName, value, shortcut, type }}>
      <label
        ref={labelRef}
        data-slot="questionnaire-choice"
        data-type={type}
        data-disabled={disabled || undefined}
        data-invalid={itemInvalid || undefined}
        data-shortcut={shortcut ?? undefined}
        className={cn(
          "group flex cursor-pointer items-center gap-3 rounded-xl border bg-card px-4 py-3 text-sm shadow-xs transition-colors",
          "has-[input:checked]:border-primary has-[input:checked]:bg-primary/5 has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring/40",
          "has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50",
          itemInvalid && "border-destructive/60",
          className
        )}
        {...props}
      >
        <ChoiceInput checked={checked} defaultChecked={defaultChecked} disabled={disabled} onChange={onChange} />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">{children}</span>
        {shortcut ? <ChoiceShortcut /> : null}
      </label>
    </ChoiceContext.Provider>
  );
}

function ChoiceInput({
  className,
  onChange,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "name" | "value">) {
  const { itemName, value, shortcut, type } = React.useContext(ChoiceContext);
  const ctx = useQuestionnaire();
  return (
    <span
      className={cn(
        "relative flex size-4 shrink-0 items-center justify-center rounded-full border border-input shadow-xs transition-colors",
        type === "checkbox" && "rounded-[5px]",
        "has-[input:checked]:border-primary has-[input:checked]:bg-primary"
      )}
    >
      <input
        data-slot="questionnaire-choice-input"
        data-choice-input=""
        data-shortcut={shortcut ?? undefined}
        aria-keyshortcuts={shortcut ?? undefined}
        type={type}
        name={itemName}
        value={value}
        aria-invalid={itemName ? ctx.isInvalid(itemName) || undefined : undefined}
        className={cn("peer sr-only", className)}
        onChange={(e) => {
          onChange?.(e);
          ctx.notifyAnswered(itemName);
        }}
        {...props}
      />
      {type === "radio" ? (
        <span className="size-1.5 rounded-full bg-primary-foreground opacity-0 transition-opacity peer-checked:opacity-100" />
      ) : (
        <svg viewBox="0 0 12 12" aria-hidden className="size-3 text-primary-foreground opacity-0 transition-opacity peer-checked:opacity-100">
          <path d="M2 6.5 4.8 9 10 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}

function QuestionnaireChoiceLabel({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span data-slot="questionnaire-choice-label" className={cn("font-medium leading-6", className)} {...props} />;
}

function ChoiceShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  const { shortcut } = React.useContext(ChoiceContext);
  if (!shortcut) return null;
  return (
    <kbd
      data-slot="questionnaire-choice-shortcut"
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-md border bg-muted font-mono text-[11px] text-muted-foreground",
        className
      )}
      {...props}
    >
      {shortcut}
    </kbd>
  );
}

export interface QuestionnaireInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  render?: (props: React.InputHTMLAttributes<HTMLInputElement>) => React.ReactElement;
}

function QuestionnaireInput({ className, onChange, render, ...props }: QuestionnaireInputProps) {
  const ctx = useQuestionnaire();
  const itemName = ctx.activeName ?? "";
  const [filled, setFilled] = React.useState(false);
  const inputProps = {
    "data-slot": "questionnaire-input",
    "data-filled": filled || undefined,
    "data-empty": !filled || undefined,
    name: itemName,
    "aria-label": props["aria-label"] ?? "Another answer",
    className: cn(
      "h-10 w-full rounded-xl border bg-background px-3 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground/70",
      "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50",
      className
    ),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      setFilled(e.target.value.trim() !== "");
      ctx.notifyAnswered(itemName);
    },
    ...props,
  } as React.InputHTMLAttributes<HTMLInputElement>;
  if (render) return render(inputProps);
  return <input {...inputProps} />;
}

function QuestionnaireError({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const ctx = useQuestionnaire();
  const { errId } = React.useContext(QuestionnaireItemIds);
  const itemName = ctx.activeName ?? "";
  const failed = itemName ? ctx.isInvalid(itemName) : false;
  if (!failed) return null;
  return (
    <p
      data-slot="questionnaire-error"
      data-invalid=""
      role="alert"
      id={errId || undefined}
      className={cn("text-[13px] font-medium leading-5 text-destructive", className)}
      {...props}
    >
      {children ?? "Choose an answer to continue."}
    </p>
  );
}

// ─────────────────────────────────────────────────────────────
// Actions
// ─────────────────────────────────────────────────────────────

function QuestionnaireActions({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="questionnaire-actions" className={cn("flex flex-wrap items-center gap-2", className)} {...props} />
  );
}

interface NavButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  render?: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => React.ReactElement;
}

function navButtonClass(primary?: boolean) {
  return primary
    ? "inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
    : "inline-flex h-9 items-center justify-center gap-2 rounded-md border bg-background px-4 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50";
}

function QuestionnairePrevious({ className, children, render, ...props }: NavButtonProps) {
  const ctx = useQuestionnaire();
  if (ctx.isFirst) return null;
  const buttonProps = {
    type: "button" as const,
    "data-slot": "questionnaire-previous",
    "data-visible": "",
    "data-status": ctx.activeStatus,
    className: cn(navButtonClass(false), className),
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(e);
      if (!e.defaultPrevented) ctx.goPrevious();
    },
    ...props,
    children: children ?? "Previous",
  };
  if (render) return render(buttonProps);
  return <button {...buttonProps} />;
}

function QuestionnaireSkip({ className, children, render, ...props }: NavButtonProps) {
  const ctx = useQuestionnaire();
  const reg = ctx.activeName ? ctx.getItem(ctx.activeName) : undefined;
  if (!reg || reg.required) return null;
  const buttonProps = {
    type: "button" as const,
    "data-slot": "questionnaire-skip",
    "data-visible": "",
    "data-status": ctx.activeStatus,
    className: cn(navButtonClass(false), className),
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(e);
      if (!e.defaultPrevented) ctx.skipActive();
    },
    ...props,
    children: children ?? "Skip",
  };
  if (render) return render(buttonProps);
  return <button {...buttonProps} />;
}

function QuestionnaireNext({ className, children, render, ...props }: NavButtonProps) {
  const ctx = useQuestionnaire();
  if (ctx.isLast) return null;
  const buttonProps = {
    type: "button" as const,
    "data-slot": "questionnaire-next",
    "data-visible": "",
    "data-shortcut": "Enter",
    "data-status": ctx.activeStatus,
    className: cn(navButtonClass(true), className),
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(e);
      if (!e.defaultPrevented) ctx.goNext();
    },
    ...props,
    children: children ?? "Next",
  };
  if (render) return render(buttonProps);
  return <button {...buttonProps} />;
}

function QuestionnaireSubmit({ className, children, render, ...props }: NavButtonProps) {
  const ctx = useQuestionnaire();
  if (!ctx.isLast) return null;
  const buttonProps = {
    type: "submit" as const,
    "data-slot": "questionnaire-submit",
    "data-visible": "",
    "data-shortcut": "Enter",
    "data-status": ctx.activeStatus,
    className: cn(navButtonClass(true), className),
    ...props,
    children: children ?? "Submit",
  };
  if (render) return render(buttonProps);
  return <button {...buttonProps} />;
}

// ─────────────────────────────────────────────────────────────
// Flat styled exports (shadcn registry naming)
// ─────────────────────────────────────────────────────────────

const Questionnaire = QuestionnaireRoot;

export {
  Questionnaire,
  QuestionnaireRoot,
  QuestionnaireProgress,
  QuestionnaireItem,
  QuestionnaireTitle,
  QuestionnaireDescription,
  QuestionnaireChoices,
  QuestionnaireChoice,
  ChoiceInput as QuestionnaireChoiceInput,
  QuestionnaireChoiceLabel,
  ChoiceShortcut as QuestionnaireChoiceShortcut,
  QuestionnaireInput,
  QuestionnaireError,
  QuestionnaireActions,
  QuestionnairePrevious,
  QuestionnaireSkip,
  QuestionnaireNext,
  QuestionnaireSubmit,
  useQuestionnaire,
};

export default Questionnaire;
