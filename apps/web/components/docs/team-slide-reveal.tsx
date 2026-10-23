import { TeamSlideReveal } from "@workspace/ui/components/team-slide-reveal";

import { DocsPageLayout } from "@/components/docs-page-layout";
import { TeamSlideRevealPreview } from "@/components/docs/previews/team-slide-reveal-preview";
import { readComponentSource } from "@/lib/source-code";

const usageCode = `"use client";

import { TeamSlideReveal } from "@/components/ui/team-slide-reveal";

export function FounderStory() {
  return (
    <div className="h-[520px] w-[380px]">
      <TeamSlideReveal
        image="/images/founder.jpg"
        imageAlt="Portrait of Takahashi Aya"
        name="Takahashi Aya"
        role="CEO, Pentaclay"
        testimonial="I’m focused on growing my brand and turning my design skills into something bigger."
      />
    </div>
  );
}`;

export async function TeamSlideRevealDocs() {
  const sourceCode =
    (await readComponentSource("team-slide-reveal")) ||
    "// Unable to load source code";
  return (
    <DocsPageLayout
      hideExamples
      title="Team Slide Reveal"
      description="An editorial portrait card that reveals a personal story in a rising sheet. Open the full card, then use the back control to return to the profile."
      preview={<TeamSlideRevealPreview />}
      previewCode={usageCode}
      usageCode={usageCode}
      examples={[
        {
          title: "Expanded by default",
          preview: (
            <div className="flex min-h-[420px] items-center justify-center px-6">
              <div className="aspect-[.73] h-[380px]">
                <TeamSlideReveal
                  image="/images/spiral-3d-slider/green-portrait.jpg"
                  imageAlt="Portrait lit in deep green"
                  name="Ari Vega"
                  role="Creative Director"
                  testimonial="We build small, deliberate interfaces that make the work feel inevitable."
                  defaultOpen
                />
              </div>
            </div>
          ),
          code: `import { TeamSlideReveal } from "@/components/ui/team-slide-reveal"

<div className="aspect-[.73] h-[420px]">
  <TeamSlideReveal
    image="/images/founder.jpg"
    imageAlt="Portrait lit in deep green"
    name="Ari Vega"
    role="Creative Director"
    testimonial="We build small, deliberate interfaces that make the work feel inevitable."
    defaultOpen
  />
</div>`,
        },
        {
          title: "Compact card",
          preview: (
            <div className="flex min-h-[420px] items-center justify-center px-6">
              <div className="aspect-[.73] h-[320px]">
                <TeamSlideReveal
                  compact
                  image="/images/spiral-3d-slider/blue-profile.jpg"
                  imageAlt="Profile lit in electric blue"
                  name="Noa Park"
                  role="Design Engineer"
                  testimonial="Details are the product."
                />
              </div>
            </div>
          ),
          code: `import { TeamSlideReveal } from "@/components/ui/team-slide-reveal"

<div className="aspect-[.73] h-[360px]">
  <TeamSlideReveal
    compact
    image="/images/founder.jpg"
    imageAlt="Profile lit in electric blue"
    name="Noa Park"
    role="Design Engineer"
    testimonial="Details are the product."
  />
</div>`,
        },
      ]}
      installPackageName="team-slide-reveal"
      installDependencies="lucide-react"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/team-slide-reveal.tsx"
      fullWidthPreview
      unstyledPreview
      props={[
        {
          name: "image",
          type: "string",
          description:
            "Portrait URL shown in the profile card and testimonial signature.",
        },
        {
          name: "imageAlt",
          type: "string",
          description: "Accessible portrait description.",
        },
        {
          name: "name",
          type: "string",
          default: '"Takahashi Aya"',
          description: "Member name displayed on both states.",
        },
        {
          name: "role",
          type: "string",
          default: '"CEO, Pentaclay"',
          description: "Role or attribution line.",
        },
        {
          name: "testimonial",
          type: "string",
          description: "Summary shown after the card is opened.",
        },
        {
          name: "open",
          type: "boolean",
          description: "Controlled summary state.",
        },
        {
          name: "defaultOpen",
          type: "boolean",
          default: "false",
          description: "Initial summary state when uncontrolled.",
        },
        {
          name: "onOpenChange",
          type: "(open: boolean) => void",
          description: "Called when the user opens or closes the summary.",
        },
        {
          name: "radius",
          type: "number",
          default: "14",
          description: "Outer corner radius in pixels.",
        },
        {
          name: "duration",
          type: "number",
          default: "480",
          description: "Sheet transition duration in milliseconds.",
        },
        {
          name: "compact",
          type: "boolean",
          default: "false",
          description: "Uses the denser layout for compact preview cards.",
        },
      ]}
    />
  );
}
