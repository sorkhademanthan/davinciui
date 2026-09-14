import { Section } from "@/components/component-layout";
import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  AmbientAudioTogglePersonalizePanel,
  AmbientAudioTogglePreview,
} from "@/components/docs/previews/ambient-audio-toggle-preview";
import { readComponentSource } from "@/lib/source-code";

const usageCode = `import { AmbientAudioToggle } from "@/components/ui/ambient-audio-toggle"

<section className="relative min-h-screen overflow-hidden">
  <AmbientAudioToggle
    src="/audio/ambient-music.mp3"
    persistenceKey="site-ambient-track"
    loop
    volume={65}
    visualizer="wave"
  />

  <div className="relative z-10">
    {/* Your hero content */}
  </div>
</section>`;

function AmbientAudioToggleNotes() {
  return (
    <>
      <Section title="About Ambient Audio Toggle" className="pt-8">
        <div className="max-w-2xl space-y-4 text-[15px] leading-7 text-muted-foreground">
          <p className="font-medium text-foreground">
            A small, visitor-controlled sound layer for a calmer, more
            atmospheric site.
          </p>
          <p>
            The player starts silent. Visitors activate playback with the
            waveform, and the same audio session continues through client-side
            page changes. Playback pauses when the tab is hidden and resumes
            when it becomes visible again.
          </p>
          <p>
            Each audio source gets its own session. Set a stable
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              persistenceKey
            </code>
            when a player needs a specific identity across page remounts.
          </p>
        </div>
      </Section>

      <Section title="Controls" className="pt-8">
        <ul className="max-w-2xl list-disc space-y-2 pl-5 text-[15px] leading-7 text-muted-foreground">
          <li>
            <strong className="text-foreground">Audio</strong> accepts MP3, WAV,
            OGG, and M4A. Playback begins only after a visitor activates the
            button.
          </li>
          <li>
            <strong className="text-foreground">Wave or Bars</strong> changes
            the visualizer. Bars supports 4 to 80 columns.
          </li>
          <li>
            <strong className="text-foreground">Volume and Loop</strong> set the
            track level and whether it repeats.
          </li>
          <li>
            <strong className="text-foreground">Waveform</strong> controls size,
            line weight, caps, intensity, speed, and paused visibility.
          </li>
          <li>
            <strong className="text-foreground">Label</strong> controls status
            text, position, colors, spacing, and visibility.
          </li>
          <li>
            <strong className="text-foreground">Keyboard</strong> toggles with
            Enter or Space and shows a visible focus ring.
          </li>
        </ul>
      </Section>

      <Section title="Best For" className="pt-8">
        <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
          Portfolio introductions, immersive product pages, audio essays, and
          ambient landing pages where visitors should choose when sound begins.
        </p>
      </Section>
    </>
  );
}

export async function AmbientAudioToggleDocs() {
  const sourceCode =
    (await readComponentSource("ambient-audio-toggle")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Ambient Audio Toggle"
      description="A visitor-controlled background music toggle with an animated waveform, persistent playback, and accessible keyboard controls."
      preview={<AmbientAudioTogglePreview />}
      personalizeContent={<AmbientAudioTogglePersonalizePanel />}
      previewCode={usageCode}
      usageCode={usageCode}
      installPackageName="ambient-audio-toggle"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/ambient-audio-toggle.tsx"
      fullWidthPreview
      unstyledPreview
      props={[
        {
          name: "src",
          type: "string",
          description: "Audio URL or uploaded file (MP3, WAV, OGG, or M4A).",
        },
        {
          name: "persistenceKey",
          type: "string",
          description:
            "Stable identity for retaining the audio session across page remounts.",
        },
        {
          name: "loop",
          type: "boolean",
          default: "true",
          description: "Repeat the track after it ends.",
        },
        {
          name: "volume",
          type: "number",
          default: "65",
          description: "Volume from 0 to 100 in 5-point steps.",
        },
        {
          name: "visualizer",
          type: '"wave" | "bars"',
          default: '"wave"',
          description: "Wave line or animated bars.",
        },
        {
          name: "barCount",
          type: "number",
          default: "24",
          description: "Number of bars, clamped from 4 to 80.",
        },
        {
          name: "activeColor / inactiveColor",
          type: "string",
          description: "Active and paused waveform colors.",
        },
        {
          name: "playingColor / pausedColor",
          type: "string",
          description: "Playing and paused label colors.",
        },
        {
          name: "labelPlaying / labelPaused",
          type: "string",
          description: "Status text for each playback state.",
        },
        {
          name: "hideLabel",
          type: "boolean",
          default: "false",
          description:
            "Hide visible status text while retaining the accessible button label.",
        },
        {
          name: "labelPosition",
          type: '"left" | "right" | "above" | "below"',
          default: '"right"',
          description: "Position of the label around the waveform.",
        },
        {
          name: "waveformWidth / waveformHeight",
          type: "number",
          default: "112 / 36",
          description: "Waveform dimensions in pixels.",
        },
        {
          name: "lineWeight / lineCap",
          type: "number / string",
          default: "2 / round",
          description: "Wave line thickness and rounded or square ends.",
        },
        {
          name: "pausedAmount",
          type: "number",
          default: "0.2",
          description: "Visible waveform level while paused.",
        },
        {
          name: "animationSpeed / intensity",
          type: "number",
          default: "1.1 / 1",
          description: "Visualizer motion speed and amplitude.",
        },
        {
          name: "transition",
          type: "number",
          default: "0.35",
          description: "Play/pause transition duration in seconds.",
        },
        {
          name: "labelGap",
          type: "number",
          default: "10",
          description: "Spacing between label and waveform in pixels.",
        },
        {
          name: "className / style",
          type: "string / CSSProperties",
          description: "Additional button styling.",
        },
      ]}
      afterContent={<AmbientAudioToggleNotes />}
    />
  );
}
