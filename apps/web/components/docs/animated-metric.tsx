import {AnimatedMetric} from "@workspace/ui/components/animated-metric";

import {DocsPageLayout} from "@/components/docs-page-layout";

import {readComponentSource} from "@/lib/source-code";
import {AnimatedMetricPlayground, AnimatedMetricPersonalizePanel} from "@/components/docs/previews/interaction-playgrounds";

const usageCode = `import { AnimatedMetric } from "@/components/ui/animated-metric"

export default function Stats() {
  return (
    <AnimatedMetric
      value={3}
      suffix="m+"
      label="Ad impressions managed"
    />
  )
}`;

export async function AnimatedMetricDocs() {
  const sourceCode =
    (await readComponentSource("animated-metric")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Animated Metric"
      description="An editorial count-up statistic — the number eases from its start value to the exact final figure when it enters the viewport, with a subtle rise-and-fade entrance and a screen-reader-friendly final value. One container-aware component scales from gallery card to fullscreen."
      preview={<AnimatedMetricPlayground />}
      personalizeContent={<AnimatedMetricPersonalizePanel />}
      previewCode={usageCode}
      usageCode={usageCode}
      installPackageName="animated-metric"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/animated-metric.tsx"
      fullWidthPreview
      unstyledPreview
      examples={[
        {
          title: "Currency with decimals",
          preview: (
            <div
              className="flex min-h-[240px] items-center justify-center px-6"
              style={{ containerType: "inline-size" }}
            >
              <AnimatedMetric
                value={2.4}
                prefix="$"
                suffix="m"
                decimals={1}
                label="Processed this quarter"
                duration={1400}
              />
            </div>
          ),
          code: `import { AnimatedMetric } from "@/components/ui/animated-metric"

<AnimatedMetric
  value={2.4}
  prefix="$"
  suffix="m"
  decimals={1}
  label="Processed this quarter"
  duration={1400}
/>`,
        },
        {
          title: "Staggered stat row",
          preview: (
            <div
              className="grid min-h-[240px] w-full max-w-xl grid-cols-3 items-center gap-6 px-6"
              style={{ containerType: "inline-size" }}
            >
              <AnimatedMetric
                value={128}
                suffix="+"
                label="Components"
                delay={0}
              />
              <AnimatedMetric
                value={99.9}
                suffix="%"
                decimals={1}
                label="Uptime"
                delay={120}
              />
              <AnimatedMetric
                value={4.9}
                suffix="/5"
                decimals={1}
                label="Rating"
                delay={240}
              />
            </div>
          ),
          code: `import { AnimatedMetric } from "@/components/ui/animated-metric"

<div className="grid grid-cols-3 gap-6">
  <AnimatedMetric value={128} suffix="+" label="Components" />
  <AnimatedMetric value={99.9} suffix="%" decimals={1} label="Uptime" delay={120} />
  <AnimatedMetric value={4.9} suffix="/5" decimals={1} label="Rating" delay={240} />
</div>`,
        },
      ]}
      props={[
        {
          name: "value",
          type: "number",
          description:
            "Final numeric value. Rendered exactly on completion — never 2.9999999.",
        },
        {
          name: "prefix",
          type: "string",
          description: 'Static prefix, e.g. "$" for $5m or "€" for €2.4m.',
        },
        {
          name: "suffix",
          type: "string",
          description:
            'Static suffix, e.g. "m+", "+", "%", "k+". Never animated.',
        },
        {
          name: "label",
          type: "string",
          description:
            "Smaller description under the metric, enters with a slight delay.",
        },
        {
          name: "startValue",
          type: "number",
          default: "0",
          description: "Value the count starts from.",
        },
        {
          name: "duration",
          type: "number",
          default: "1500",
          description:
            "Count duration in milliseconds (1200–1800 feels like the reference).",
        },
        {
          name: "decimals",
          type: "number",
          default: "0",
          description: "Fixed decimal places, e.g. 1 for 1.5m+ or 99.9%.",
        },
        {
          name: "delay",
          type: "number",
          default: "0",
          description:
            "Stagger offset in milliseconds before counting starts — 0/100/200/300 across a stat row.",
        },
        {
          name: "once",
          type: "boolean",
          default: "true",
          description:
            "Animate once and stay. When false, leaving the viewport resets and re-entering replays. Ignored when loop is true.",
        },
        {
          name: "loop",
          type: "boolean",
          default: "false",
          description:
            "Replay indefinitely while visible, pausing loopDelay on the final value each cycle.",
        },
        {
          name: "loopDelay",
          type: "number",
          default: "1500",
          description:
            "Pause in milliseconds on the final value between loops.",
        },
        {
          name: "threshold",
          type: "number",
          default: "0.25",
          description:
            "Fraction of the component visible before triggering (0–1).",
        },
        {
          name: "valueClassName",
          type: "string",
          description: "Extra classes for the metric figure.",
        },
        {
          name: "labelClassName",
          type: "string",
          description: "Extra classes for the label.",
        },
      ]}
    />
  );
}
