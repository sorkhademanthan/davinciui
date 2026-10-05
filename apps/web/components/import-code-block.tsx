interface ImportCodeBlockProps {
  html: string
}

export function ImportCodeBlock({ html }: ImportCodeBlockProps) {
  return (
    <div
      data-code-block
      data-line-numbers="false"
      className="overflow-hidden rounded-md border border-border bg-muted/40 text-sm [&_.shiki]:!bg-transparent [&_pre]:!bg-transparent [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_pre]:px-4 [&_pre]:py-3.5"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
