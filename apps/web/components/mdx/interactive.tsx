"use client"

import {
  Children,
  isValidElement,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
} from "react"
import { Check, Copy, Sparkles } from "lucide-react"

import {
  PACKAGE_MANAGERS,
  usePackageManager,
  type PackageManager,
} from "@/hooks/use-package-manager"
import { cn } from "@/lib/utils"

function isPackageManager(value?: string): value is PackageManager {
  return value !== undefined && (PACKAGE_MANAGERS as readonly string[]).includes(value)
}

function CodeActions({ children }: { children: ReactNode }) {
  return <div className="docs-code-actions">{children}</div>
}

export function Tabs({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(0)
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<{
    title?: string
  }>[]

  if (items.length === 0) return null

  return (
    <div className="docs-tabs">
      <div role="tablist" aria-label="Documentation tabs" className="docs-tabs-list">
        {items.map((child, index) => (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={active === index}
            onClick={() => setActive(index)}
            className="docs-tab"
            data-state={active === index ? "active" : "inactive"}
          >
            {child.props.title ?? `Tab ${index + 1}`}
          </button>
        ))}
      </div>
      {items.map((child, index) => (
        <div
          key={index}
          role="tabpanel"
          className="docs-tab-panel"
          hidden={active !== index}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

export function Tab({
  children,
}: {
  title?: string
  children: ReactNode
}) {
  return <>{children}</>
}

export function CodeGroup({
  children,
  titles,
}: {
  children: ReactNode
  titles?: string[]
}) {
  const [localActive, setLocalActive] = useState(0)
  const [packageManager, setPackageManager] = usePackageManager()
  const items = Children.toArray(children)
  const sharedPreference = Boolean(titles?.length && titles.every(isPackageManager))
  const pmIndex = titles?.findIndex((title) => title === packageManager) ?? -1
  const active = sharedPreference ? Math.max(pmIndex, 0) : localActive

  if (items.length === 0) return null

  function select(index: number) {
    if (!sharedPreference) {
      setLocalActive(index)
      return
    }
    const title = titles?.[index]
    if (isPackageManager(title)) setPackageManager(title)
  }

  return (
    <div className="docs-tabs">
      <div role="tablist" aria-label="Code examples" className="docs-tabs-list">
        {items.map((_, index) => (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={active === index}
            onClick={() => select(index)}
            className="docs-tab"
            data-state={active === index ? "active" : "inactive"}
          >
            {titles?.[index] ?? `Code ${index + 1}`}
          </button>
        ))}
      </div>
      <div className="docs-tab-panel">{items[active]}</div>
    </div>
  )
}

export function Pre({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<"pre">) {
  const ref = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)

  async function copy() {
    const text = ref.current?.innerText ?? ""
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard access can be blocked; leave the label unchanged.
    }
  }

  function askAI() {
    const code = ref.current?.innerText ?? ""
    window.dispatchEvent(new CustomEvent("dv:ask-ai", { detail: { prompt: `Explain this code:\n\n${code}` } }))
  }

  return (
    <div className="docs-code-block dv-code">
      <CodeActions>
        <button type="button" className="dv-code-btn docs-copy" onClick={copy} aria-label={copied ? "Copied" : "Copy code"}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
        <button type="button" className="dv-code-btn" onClick={askAI} aria-label="Ask AI about this code">
          <Sparkles size={16} />
        </button>
        <span className="sr-only" aria-live="polite">{copied ? "Copied to clipboard" : ""}</span>
      </CodeActions>
      <pre ref={ref} className={cn(className)} {...props}>
        {children}
      </pre>
    </div>
  )
}

export function CodeBlock({
  children,
  ...props
}: ComponentPropsWithoutRef<"pre">) {
  return <Pre {...props}>{children}</Pre>
}
