"use client"

import { CopyButton } from "@/components/copy-button"

/**
 * Shared boxed shell for code snippets (Usage import block + Installation
 * command). Lives here so both surfaces render the same border, radius,
 * background and padding without duplicating the classes.
 */
export const CODE_BLOCK_BOX_CLASS =
  "rounded-md border border-border bg-muted/40"

interface ImportCodeBlockProps {
  html: string
  code: string
}

export function ImportCodeBlock({ html, code }: ImportCodeBlockProps) {
  return (
    <div
      data-code-block
      data-line-numbers="false"
      className={`relative overflow-hidden ${CODE_BLOCK_BOX_CLASS} text-sm [&_.shiki]:!bg-transparent [&_pre]:!bg-transparent [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_pre]:px-4 [&_pre]:py-3.5 [&_pre]:pr-12`}
    >
      <CopyButton code={code.trim()} />
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
