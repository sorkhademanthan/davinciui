import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  ChartAreaPreview,
  ChartBarPreview,
  ChartLinePreview,
  ChartPiePreview,
  ChartRtlPreview,
  ChartThemingPreview,
  ChartTooltipCustomPreview,
} from "@/components/docs/previews/chart-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"`;
const defaultCode = `import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
]

const chartConfig = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig

export function Example() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}`;

export async function ChartDocs() {
  const sourceCode =
    (await readComponentSource("chart")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Chart"
      description="Beautiful charts built on Recharts v3. Compose Recharts primitives inside ChartContainer and theme everything through chart config."
      preview={<ChartBarPreview />}
      previewCode={defaultCode}
      installPackageName="chart"
      installDependencies="recharts"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/chart.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      usageNote={
        <div className="space-y-3">
          <p className="text-sm leading-6 text-muted-foreground">
            We do not wrap Recharts — build charts with Recharts components and bring in ChartTooltip or ChartLegend
            only where needed. Always keep a height, <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">min-h-*</code>, or{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">aspect-*</code> on ChartContainer so
            ResponsiveContainer can measure on first render. Use{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">var(--chart-1)</code> (not{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">hsl(var(--chart-1))</code>) when
            referencing chart tokens, and add{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">accessibilityLayer</code> for
            keyboard and screen-reader support.
          </p>
        </div>
      }
      examples={[
        {
          title: "Line",
          preview: <ChartLinePreview />,
          code: `import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

<ChartContainer config={chartConfig} className="min-h-[200px] w-full">
  <LineChart accessibilityLayer data={chartData}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
    <ChartTooltip content={<ChartTooltipContent />} />
    <ChartLegend content={<ChartLegendContent />} />
    <Line type="monotone" dataKey="desktop" stroke="var(--color-desktop)" strokeWidth={2} dot={false} />
    <Line type="monotone" dataKey="mobile" stroke="var(--color-mobile)" strokeWidth={2} dot={false} />
  </LineChart>
</ChartContainer>`,
        },
        {
          title: "Area",
          preview: <ChartAreaPreview />,
          code: `import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

<ChartContainer config={chartConfig} className="min-h-[200px] w-full">
  <AreaChart accessibilityLayer data={chartData}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Area type="monotone" dataKey="desktop" fill="var(--color-desktop)" fillOpacity={0.25} stroke="var(--color-desktop)" strokeWidth={2} />
    <Area type="monotone" dataKey="mobile" fill="var(--color-mobile)" fillOpacity={0.25} stroke="var(--color-mobile)" strokeWidth={2} />
  </AreaChart>
</ChartContainer>`,
        },
        {
          title: "Pie / Donut",
          preview: <ChartPiePreview />,
          code: `import { Cell, Pie, PieChart } from "recharts"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const browserData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
]

const browserConfig = {
  visitors: { label: "Visitors" },
  chrome: { label: "Chrome", color: "var(--chart-1)" },
  safari: { label: "Safari", color: "var(--chart-2)" },
} satisfies ChartConfig

<ChartContainer config={browserConfig} className="min-h-[200px] w-full">
  <PieChart accessibilityLayer>
    <ChartTooltip content={<ChartTooltipContent labelKey="visitors" nameKey="browser" />} />
    <Pie data={browserData} dataKey="visitors" nameKey="browser" innerRadius={56}>
      {browserData.map((entry) => (
        <Cell key={entry.browser} fill={entry.fill} />
      ))}
    </Pie>
    <ChartLegend content={<ChartLegendContent nameKey="browser" />} />
  </PieChart>
</ChartContainer>`,
        },
        {
          title: "Custom Tooltip",
          preview: <ChartTooltipCustomPreview />,
          code: `import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// indicator="dot" | "line" | "dashed"; hideLabel and
// hideIndicator toggle parts; labelFormatter and
// formatter fully customize content.
<ChartTooltip
  content={
    <ChartTooltipContent
      indicator="line"
      labelFormatter={(value, payload) => {
        const total = payload.reduce((sum, item) => sum + Number(item.value), 0)
        return <div className="font-medium">{total.toLocaleString()} visits</div>
      }}
    />
  }
/>`,
        },
        {
          title: "Theming",
          preview: <ChartThemingPreview />,
          code: `import { type ChartConfig } from "@/components/ui/chart"

// Per-key color, any format — or a light/dark theme object
// that adapts automatically. Reference with var(--color-KEY).
const chartConfig = {
  desktop: {
    label: "Desktop",
    theme: { light: "#2563eb", dark: "#60a5fa" },
  },
  mobile: { label: "Mobile", color: "hsl(220, 98%, 61%)" },
  tablet: { label: "Tablet", color: "oklch(0.6 0.118 184.704)" },
} satisfies ChartConfig

<Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />`,
        },
        {
          title: "RTL",
          preview: <ChartRtlPreview />,
          code: `import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

<div dir="rtl">
  <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
    <BarChart accessibilityLayer data={chartData}>
      <CartesianGrid vertical={false} />
      <XAxis dataKey="month" tickLine={false} axisLine={false} />
      <ChartTooltip content={<ChartTooltipContent />} />
      <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
    </BarChart>
  </ChartContainer>
</div>`,
        },
      ]}
      props={[
        { name: "config", type: "ChartConfig", default: "—", description: "Labels, icons, and colors per data key. Generates --color-* tokens." },
        { name: "label", type: "ReactNode", default: "—", description: "Human-readable label for a config entry." },
        { name: "color", type: "string", default: "—", description: "hex, hsl, oklch, or var(--chart-*) token." },
        { name: "theme", type: "{ light: string; dark: string }", default: "—", description: "Per-mode colors. Use instead of color, not with it." },
        { name: "indicator", type: '"dot" | "line" | "dashed"', default: '"dot"', description: "Tooltip indicator style (ChartTooltipContent)." },
        { name: "hideLabel", type: "boolean", default: "false", description: "Hide the tooltip label row." },
        { name: "hideIndicator", type: "boolean", default: "false", description: "Hide the tooltip color indicator." },
        { name: "labelKey", type: "string", default: "—", description: "Custom key for the tooltip label." },
        { name: "nameKey", type: "string", default: "—", description: "Custom key for tooltip and legend names." },
        { name: "accessibilityLayer", type: "boolean", default: "false", description: "Recharts keyboard + screen-reader support on the chart." },
      ]}
    />
  );
}
