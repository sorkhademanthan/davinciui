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
  const sourceCode = (await readComponentSource("team-slide-reveal")) || "// Unable to load source code";
  return (
    <DocsPageLayout
      title="Team Slide Reveal"
      description="A portrait-led profile card that slides into a compact testimonial summary on click, then returns with an explicit back control. It retains a single stable footprint from catalog card to fullscreen preview."
      preview={<TeamSlideRevealPreview />}
      previewCode={usageCode}
      usageCode={usageCode}
      installPackageName="team-slide-reveal"
      installDependencies="lucide-react"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/team-slide-reveal.tsx"
      fullWidthPreview
      unstyledPreview
      props={[
        { name: "image", type: "string", description: "Portrait URL shown in the profile card and testimonial signature." },
        { name: "imageAlt", type: "string", description: "Accessible portrait description." },
        { name: "name", type: "string", default: '"Takahashi Aya"', description: "Member name displayed on both states." },
        { name: "role", type: "string", default: '"CEO, Pentaclay"', description: "Role or attribution line." },
        { name: "testimonial", type: "string", description: "Summary shown after the card is opened." },
        { name: "open", type: "boolean", description: "Controlled summary state." },
        { name: "defaultOpen", type: "boolean", default: "false", description: "Initial summary state when uncontrolled." },
        { name: "onOpenChange", type: "(open: boolean) => void", description: "Called when the user opens or closes the summary." },
        { name: "radius", type: "number", default: "14", description: "Outer corner radius in pixels." },
        { name: "duration", type: "number", default: "560", description: "Swap transition duration in milliseconds." },
        { name: "compact", type: "boolean", default: "false", description: "Uses the denser layout for compact preview cards." },
      ]}
    />
  );
}
