import type { Metadata } from "next";
import {
  TiltFlipPolaroidStory,
  type TiltFlipPolaroidStory as Story,
} from "@/components/docs/previews/tilt-flip-polaroid-story";
import { caveatFont } from "@/lib/caveat-font";

const STORIES = new Set<Story>([
  "default",
  "flipped",
  "notilt",
  "long",
  "reduced",
  "controlled",
]);

export const metadata: Metadata = {
  title: "Tilt Flip Polaroid stories",
  robots: { index: false, follow: false },
};

export default async function TiltFlipPolaroidDemoPage({
  searchParams,
}: {
  searchParams: Promise<{ story?: string }>;
}) {
  const params = await searchParams;
  const requested = params.story as Story | undefined;
  const story = requested && STORIES.has(requested) ? requested : "default";

  return (
    <TiltFlipPolaroidStory
      story={story}
      className={caveatFont.variable}
    />
  );
}
