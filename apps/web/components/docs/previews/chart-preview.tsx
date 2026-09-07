"use client";

import * as React from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui/components/chart";

function DemoShell({ children, readout }: { children: React.ReactNode; readout?: string }) {
  return (
    <div className="flex min-h-[340px] w-full flex-col items-center justify-center gap-3 overflow-auto bg-background p-6">
      <div className="w-full max-w-md">{children}</div>
      {readout !== undefined && (
        <p className="font-mono text-xs text-muted-foreground" aria-live="polite">
          {readout}
        </p>
      )}
    </div>
  );
}

const monthlyData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const trafficConfig = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function ChartBarPreview() {
  return (
    <DemoShell readout="grid · axis · tooltip · legend — hover the bars">
      <ChartContainer config={trafficConfig} className="min-h-[260px] w-full">
        <BarChart accessibilityLayer data={monthlyData}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => String(value).slice(0, 3)} />
          <YAxis tickLine={false} axisLine={false} width={32} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
          <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
        </BarChart>
      </ChartContainer>
    </DemoShell>
  );
}

export function ChartLinePreview() {
  return (
    <DemoShell readout="accessibilityLayer adds keyboard + screen-reader support">
      <ChartContainer config={trafficConfig} className="min-h-[260px] w-full">
        <LineChart accessibilityLayer data={monthlyData} margin={{ left: 0, right: 12 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => String(value).slice(0, 3)} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line type="monotone" dataKey="desktop" stroke="var(--color-desktop)" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="mobile" stroke="var(--color-mobile)" strokeWidth={2} dot={false} />
        </LineChart>
      </ChartContainer>
    </DemoShell>
  );
}

export function ChartAreaPreview() {
  return (
    <DemoShell>
      <ChartContainer config={trafficConfig} className="min-h-[260px] w-full">
        <AreaChart accessibilityLayer data={monthlyData} margin={{ left: 0, right: 12 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => String(value).slice(0, 3)} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area type="monotone" dataKey="desktop" fill="var(--color-desktop)" fillOpacity={0.25} stroke="var(--color-desktop)" strokeWidth={2} />
          <Area type="monotone" dataKey="mobile" fill="var(--color-mobile)" fillOpacity={0.25} stroke="var(--color-mobile)" strokeWidth={2} />
        </AreaChart>
      </ChartContainer>
    </DemoShell>
  );
}

const browserData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 90, fill: "var(--color-other)" },
];

const browserConfig = {
  visitors: { label: "Visitors" },
  chrome: { label: "Chrome", color: "var(--chart-1)" },
  safari: { label: "Safari", color: "var(--chart-2)" },
  firefox: { label: "Firefox", color: "var(--chart-3)" },
  edge: { label: "Edge", color: "var(--chart-4)" },
  other: { label: "Other", color: "var(--chart-5)" },
} satisfies ChartConfig;

export function ChartPiePreview() {
  return (
    <DemoShell readout="custom labelKey + nameKey drive tooltip and legend names">
      <ChartContainer config={browserConfig} className="min-h-[260px] w-full">
        <PieChart accessibilityLayer>
          <ChartTooltip content={<ChartTooltipContent labelKey="visitors" nameKey="browser" />} />
          <Pie data={browserData} dataKey="visitors" nameKey="browser" innerRadius={56} outerRadius={88} strokeWidth={2}>
            {browserData.map((entry) => (
              <Cell key={entry.browser} fill={entry.fill} />
            ))}
          </Pie>
          <ChartLegend content={<ChartLegendContent nameKey="browser" />} />
        </PieChart>
      </ChartContainer>
    </DemoShell>
  );
}

export function ChartTooltipCustomPreview() {
  return (
    <DemoShell readout='indicator="line" · hideLabel · custom formatter'>
      <ChartContainer config={trafficConfig} className="min-h-[260px] w-full">
        <BarChart accessibilityLayer data={monthlyData}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => String(value).slice(0, 3)} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                indicator="line"
                labelFormatter={(_, payload) => {
                  const total = payload.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
                  return (
                    <div className="font-medium">
                      {payload[0]?.payload && typeof payload[0].payload === "object" && "month" in payload[0].payload
                        ? String((payload[0].payload as { month: unknown }).month)
                        : "Total"}{" "}
                      · {total.toLocaleString()} visits
                    </div>
                  );
                }}
              />
            }
          />
          <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
          <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
        </BarChart>
      </ChartContainer>
    </DemoShell>
  );
}

const themedConfig = {
  desktop: { label: "Desktop", theme: { light: "#2563eb", dark: "#60a5fa" } },
  mobile: { label: "Mobile", color: "hsl(220, 98%, 61%)" },
  tablet: { label: "Tablet", color: "oklch(0.6 0.118 184.704)" },
} satisfies ChartConfig;

const themedData = [
  { month: "Jan", desktop: 186, mobile: 80, tablet: 40 },
  { month: "Feb", desktop: 305, mobile: 200, tablet: 90 },
  { month: "Mar", desktop: 237, mobile: 120, tablet: 70 },
  { month: "Apr", desktop: 209, mobile: 130, tablet: 110 },
];

export function ChartThemingPreview() {
  return (
    <DemoShell readout="theme object adapts to dark mode · hex/hsl/oklch all supported">
      <ChartContainer config={themedConfig} className="min-h-[260px] w-full">
        <BarChart accessibilityLayer data={themedData}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
          <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
          <Bar dataKey="tablet" fill="var(--color-tablet)" radius={4} />
        </BarChart>
      </ChartContainer>
    </DemoShell>
  );
}

export function ChartRtlPreview() {
  return (
    <DemoShell readout="dir=rtl · axis and tooltip follow direction">
      <div dir="rtl">
        <ChartContainer config={trafficConfig} className="min-h-[260px] w-full">
          <BarChart accessibilityLayer data={monthlyData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => String(value).slice(0, 3)} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
            <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
          </BarChart>
        </ChartContainer>
      </div>
    </DemoShell>
  );
}
