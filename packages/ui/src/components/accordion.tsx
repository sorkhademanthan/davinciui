"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

type AccordionType = "single" | "multiple";

interface AccordionContextValue {
  type: AccordionType;
  collapsible?: boolean;
  value: string | string[];
  onValueChange: (value: string) => void;
  variant?: "default" | "bordered" | "card";
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: AccordionType;
  collapsible?: boolean;
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  variant?: "default" | "bordered" | "card";
}

function Accordion({
  className,
  type = "single",
  collapsible = true,
  defaultValue,
  value: controlledValue,
  onValueChange,
  variant = "default",
  ...props
}: AccordionProps) {
  const [internalValue, setInternalValue] = React.useState<string | string[]>(
    () => {
      if (defaultValue !== undefined) return defaultValue;
      return type === "single" ? "" : [];
    }
  );

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const onValueChangeInternal = React.useCallback(
    (itemValue: string) => {
      let next: string | string[];
      if (type === "single") {
        const current = value as string;
        next = current === itemValue ? (collapsible ? "" : current) : itemValue;
      } else {
        const current = value as string[];
        next = current.includes(itemValue) ? current.filter((v) => v !== itemValue) : [...current, itemValue];
      }
      if (controlledValue === undefined) setInternalValue(next);
      onValueChange?.(next);
    },
    [type, collapsible, value, controlledValue, onValueChange]
  );

  return (
    <AccordionContext.Provider value={{ type, collapsible, value, onValueChange: onValueChangeInternal, variant }}>
      <div data-slot="accordion" className={cn("w-full", className)} {...props} />
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
}

const AccordionItemContext = React.createContext<{ value: string; disabled?: boolean; open: boolean } | null>(null);

function AccordionItem({ className, value: itemValue, disabled, ...props }: AccordionItemProps) {
  const ctx = React.useContext(AccordionContext);
  if (!ctx) throw new Error("AccordionItem must be used within Accordion");
  const open = ctx.type === "single" ? (ctx.value as string) === itemValue : (ctx.value as string[]).includes(itemValue);
  return (
    <AccordionItemContext.Provider value={{ value: itemValue, disabled, open }}>
      <div
        data-slot="accordion-item"
        data-state={open ? "open" : "closed"}
        data-disabled={disabled ? "" : undefined}
        className={cn(
          "border-b last:border-0",
          ctx.variant === "bordered" && "rounded-md border px-4 mb-2 last:mb-0",
          ctx.variant === "card" && "rounded-xl border bg-card shadow-sm px-4 mb-3 last:mb-0",
          className
        )}
        {...props}
      />
    </AccordionItemContext.Provider>
  );
}

function AccordionTrigger({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(AccordionContext);
  const itemCtx = React.useContext(AccordionItemContext);
  if (!ctx || !itemCtx) throw new Error("AccordionTrigger must be used within AccordionItem");
  return (
    <h3 className="flex">
      <button
        data-slot="accordion-trigger"
        data-state={itemCtx.open ? "open" : "closed"}
        disabled={itemCtx.disabled}
        onClick={() => !itemCtx.disabled && ctx.onValueChange(itemCtx.value)}
        className={cn(
          "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-colors hover:text-foreground disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200" />
      </button>
    </h3>
  );
}

function AccordionContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const itemCtx = React.useContext(AccordionItemContext);
  if (!itemCtx) throw new Error("AccordionContent must be used within AccordionItem");
  if (!itemCtx.open) return null;
  return (
    <div
      data-slot="accordion-content"
      data-state={itemCtx.open ? "open" : "closed"}
      className={cn("overflow-hidden pb-4 text-sm text-muted-foreground", className)}
      {...props}
    >
      <div className="pt-1">{children}</div>
    </div>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
