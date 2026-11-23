import type {
  ComponentPropsWithoutRef,
  ComponentType,
  ReactNode,
} from "react"
import Link from "next/link"
import {
  CircleCheck,
  Info,
  Lightbulb,
  OctagonAlert,
  TriangleAlert,
} from "lucide-react"

import { cn } from "@/lib/utils"

import { CodeBlock, CodeGroup, Pre, Tab, Tabs } from "./interactive"

type CalloutType = "info" | "tip" | "note" | "warning" | "danger" | "success"

const calloutIcons: Record<
  CalloutType,
  ComponentType<{ className?: string; "aria-hidden"?: boolean }>
> = {
  info: Info,
  tip: Lightbulb,
  note: Info,
  warning: TriangleAlert,
  danger: OctagonAlert,
  success: CircleCheck,
}

export function Callout({
  type = "note",
  title,
  children,
}: {
  type?: CalloutType
  title?: string
  children: ReactNode
}) {
  const Icon = calloutIcons[type]

  return (
    <div className="docs-callout" data-type={type}>
      <Icon aria-hidden={true} />
      <div className="docs-callout-body">
        {title ? <div className="docs-callout-title">{title}</div> : null}
        {children}
      </div>
    </div>
  )
}

export function Steps({ children }: { children: ReactNode }) {
  return <div className="docs-steps">{children}</div>
}

export function Step({
  title,
  children,
}: {
  title?: string
  children: ReactNode
}) {
  return (
    <div className="docs-step">
      {title ? <div className="docs-step-title">{title}</div> : null}
      <div className="docs-step-body">{children}</div>
    </div>
  )
}

export function Cards({ children }: { children: ReactNode }) {
  return <div className="docs-cards">{children}</div>
}

export function Card({
  title,
  href,
  description,
  icon: Icon,
  children,
}: {
  title: string
  href?: string
  description?: string
  icon?: ComponentType<{ className?: string }>
  children?: ReactNode
}) {
  const content = (
    <>
      {Icon ? <Icon /> : null}
      <span className="docs-card-title">{title}</span>
      {description ? (
        <span className="docs-card-description">{description}</span>
      ) : null}
      {children}
    </>
  )

  if (href) {
    return (
      <Link href={href} className="docs-card">
        {content}
      </Link>
    )
  }

  return <div className="docs-card">{content}</div>
}

export function Accordion({ children }: { children: ReactNode }) {
  return <div className="docs-accordion">{children}</div>
}

export function AccordionItem({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <details className="docs-accordion-item">
      <summary>{title}</summary>
      <div className="docs-accordion-body">{children}</div>
    </details>
  )
}

export function Frame({
  caption,
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"figure"> & { caption?: string }) {
  return (
    <figure className={cn("docs-frame", className)} {...props}>
      {children}
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  )
}

export function ParamField({
  name,
  type,
  required,
  default: defaultValue,
  children,
}: {
  name: string
  type?: string
  required?: boolean
  default?: string
  children?: ReactNode
}) {
  return (
    <div className="docs-param">
      <div className="docs-param-head">
        <code className="docs-param-name">{name}</code>
        {type ? <span className="docs-param-type">{type}</span> : null}
        {required ? <span className="docs-param-required">Required</span> : null}
        {defaultValue ? (
          <span className="docs-param-type">default: {defaultValue}</span>
        ) : null}
      </div>
      {children ? <div className="docs-param-body">{children}</div> : null}
    </div>
  )
}

function Anchor({ href = "", ...props }: ComponentPropsWithoutRef<"a">) {
  if (/^https?:\/\//.test(href)) {
    return <a href={href} target="_blank" rel="noopener noreferrer" {...props} />
  }
  return <Link href={href} {...props} />
}

export const mdxComponents = {
  a: Anchor,
  Callout,
  Steps,
  Step,
  Cards,
  Card,
  Accordion,
  AccordionItem,
  Frame,
  ParamField,
  Tabs,
  Tab,
  CodeGroup,
  CodeBlock,
  pre: Pre,
}
