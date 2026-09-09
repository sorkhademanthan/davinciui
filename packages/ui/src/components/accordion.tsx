"use client";

import * as React from "react";
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { ChevronDown } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";

export type AccordionVariant = "default" | "bordered" | "card";

const AccordionVariantContext = React.createContext<AccordionVariant>("default");

export interface AccordionProps {
  /** Allow multiple items open at once. @default false */
  multiple?: boolean;
  /** Controlled open value(s). Single mode uses a string. */
  value?: string | string[];
  /** Uncontrolled initial open value(s). */
  defaultValue?: string | string[];
  /** Fires when the open value(s) change. */
  onValueChange?: (value: string | string[]) => void;
  /** Disable the whole accordion. @default false */
  disabled?: boolean;
  /** Visual treatment. @default "default" */
  variant?: AccordionVariant;
  className?: string;
  children?: React.ReactNode;
}

function toArray(value: string | string[] | undefined): string[] | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value : value === "" ? [] : [value];
}

function Accordion({
  multiple = false,
  value,
  defaultValue,
  onValueChange,
  disabled,
  variant = "default",
  className,
  children,
}: AccordionProps) {
  return (
    <AccordionVariantContext.Provider value={variant}>
      <AccordionPrimitive.Root
        data-slot="accordion"
        data-variant={variant}
        multiple={multiple}
        disabled={disabled}
        value={toArray(value)}
        defaultValue={toArray(defaultValue)}
        onValueChange={(next) => {
          if (multiple) (onValueChange as ((v: string[]) => void) | undefined)?.(next);
          else (onValueChange as ((v: string) => void) | undefined)?.(next[0] ?? "");
        }}
        className={cn(
          "w-full",
          variant === "bordered" && "divide-y overflow-hidden rounded-xl border shadow-xs",
          variant === "card" && "flex flex-col gap-2",
          className
        )}
      >
        {children}
      </AccordionPrimitive.Root>
    </AccordionVariantContext.Provider>
  );
}

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Unique value identifying this item. */
  value: string;
  /** Disable this item. @default false */
  disabled?: boolean;
}

function AccordionItem({ value, disabled, className, ...props }: AccordionItemProps) {
  const variant = React.useContext(AccordionVariantContext);
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      value={value}
      disabled={disabled}
      className={cn(
        variant === "default" && "border-b last:border-b-0",
        variant === "bordered" && "bg-background px-4 transition-colors data-[open]:bg-muted/40",
        variant === "card" &&
          "rounded-xl border bg-card px-4 shadow-xs transition-[box-shadow,border-color] duration-300 data-[open]:border-primary/25 data-[open]:shadow-md",
        className
      )}
      {...props}
    />
  );
}

export interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Hide the chevron indicator. @default false */
  hideIcon?: boolean;
}

function AccordionTrigger({ hideIcon = false, className, children, ...props }: AccordionTriggerProps) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "flex flex-1 items-center gap-4 py-4 text-left text-[15px] font-medium transition-colors outline-none",
          "hover:text-foreground focus-visible:z-10 focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-ring/40",
          "disabled:pointer-events-none disabled:opacity-50",
          "[&[data-open]>span:last-child]:rotate-180 [&[data-open]>span:last-child]:border-primary/30 [&[data-open]>span:last-child]:bg-primary/10 [&[data-open]>span:last-child]:text-primary",
          className
        )}
        {...(props as React.ComponentProps<typeof AccordionPrimitive.Trigger>)}
      >
        <span className="flex-1">{children}</span>
        {!hideIcon && (
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full border text-muted-foreground transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none">
            <ChevronDown className="size-3.5" />
          </span>
        )}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Keep mounted when closed (find-in-page support). @default false */
  keepMounted?: boolean;
}

function AccordionContent({ keepMounted, className, children, ...props }: AccordionContentProps) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      keepMounted={keepMounted}
      className={cn(
        // Height animates through grid rows (no JS measurement). Open eases
        // out long and soft; close snaps back quicker and more linear.
        // Content fades + settles with a slight delay only while opening.
        "group/panel grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "data-[closed]:grid-rows-[0fr] data-[closed]:duration-200 data-[closed]:ease-[cubic-bezier(0.4,0,0.2,1)]",
        "data-[open]:grid-rows-[1fr]",
        "motion-reduce:transition-none",
        className
      )}
      {...props}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="pt-0 pb-4 text-sm leading-6 text-muted-foreground transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[closed]:-translate-y-1 group-data-[closed]:opacity-0 group-data-[open]:translate-y-0 group-data-[open]:opacity-100 group-data-[open]:delay-75 motion-reduce:transition-none">
          {children}
        </div>
      </div>
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };

export default Accordion;
