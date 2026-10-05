import { cn } from "@/lib/utils"

export interface DocsPropItem {
  name: string
  type: string
  default?: string
  description: string
}

interface DocsPropsTableProps {
  props: DocsPropItem[]
  className?: string
}

export function DocsPropsTable({ props, className }: DocsPropsTableProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-border",
        className
      )}
    >
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2.5 text-left text-[13px] font-medium text-muted-foreground">
                Prop
              </th>
              <th className="w-[28%] px-4 py-2.5 text-left text-[13px] font-medium text-muted-foreground">
                Type
              </th>
              <th className="w-[22%] px-4 py-2.5 text-left text-[13px] font-medium text-muted-foreground">
                Default
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {props.map((prop) => (
              <tr
                key={prop.name}
                className="transition-colors hover:bg-muted/50"
              >
                <td className="px-4 py-3 align-top">
                  <div className="space-y-1">
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px] font-medium text-foreground">
                      {prop.name}
                    </code>
                    {prop.description && (
                      <p className="max-w-md text-[13px] leading-relaxed text-muted-foreground">
                        {prop.description}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 align-top">
                  <code className="font-mono text-[13px] text-muted-foreground">
                    {prop.type}
                  </code>
                </td>
                <td className="px-4 py-3 align-top">
                  {prop.default ? (
                    <code className="font-mono text-[13px] text-muted-foreground">
                      {prop.default}
                    </code>
                  ) : (
                    <span className="text-[13px] text-muted-foreground/50">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
