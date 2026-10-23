import {
  ProfileCarousel,
  type Profile,
} from "@workspace/ui/components/profile-carousel";

import { DocsPageLayout } from "@/components/docs-page-layout";
import { ProfileCarouselPreview } from "@/components/docs/previews/profile-carousel-preview";
import { readComponentSource } from "@/lib/source-code";

const usageCode = `import { ProfileCarousel, type Profile } from "@/components/ui/profile-carousel"

const profiles: Profile[] = [
  {
    id: "marcus-berendt",
    name: "Marcus Berendt",
    image: "/images/spiral-3d-slider/red-echo.jpg",
    description: "Product Designer focused on intuitive digital experiences.",
    category: "Product Design",
    objectPosition: "50% 20%",
  },
  {
    id: "ava-kim",
    name: "Ava Kim",
    image: "/images/spiral-3d-slider/prism-portrait.jpg",
    description: "UX researcher turning insight into clear direction.",
    category: "UX Research",
  },
]

export default function TeamGallery() {
  return (
    <ProfileCarousel
      profiles={profiles}
      onProfileClick={(profile) => console.log("view profile:", profile.id)}
    />
  )
}`;

const exampleProfiles: Profile[] = [
  {
    id: "marcus-berendt",
    name: "Marcus Berendt",
    image: "/images/spiral-3d-slider/red-echo.jpg",
    description: "Product Designer focused on intuitive digital experiences.",
    category: "Product Design",
    objectPosition: "50% 20%",
  },
  {
    id: "ava-kim",
    name: "Ava Kim",
    image: "/images/spiral-3d-slider/prism-portrait.jpg",
    description: "UX researcher turning insight into clear direction.",
    category: "UX Research",
  },
  {
    id: "noa-park",
    name: "Noa Park",
    image: "/images/spiral-3d-slider/blue-profile.jpg",
    description: "Design engineer shipping polished interfaces.",
    category: "Engineering",
  },
  {
    id: "ari-vega",
    name: "Ari Vega",
    image: "/images/spiral-3d-slider/green-portrait.jpg",
    description: "Creative director shaping brand systems.",
    category: "Creative Direction",
  },
];

export async function ProfileCarouselDocs() {
  const sourceCode =
    (await readComponentSource("profile-carousel")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Profile Carousel"
      description="An editorial team carousel — full portrait cards with one traveling profile detail card, edge-clipped viewport, seamless looping, and drag plus arrow navigation on a single GPU-accelerated track."
      preview={<ProfileCarouselPreview />}
      previewCode={usageCode}
      usageCode={usageCode}
      installPackageName="profile-carousel"
      installDependencies="lucide-react clsx tailwind-merge"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/profile-carousel.tsx"
      fullWidthPreview
      unstyledPreview
      examples={[
        {
          title: "Autoplay through the team",
          preview: (
            <div className="w-full">
              <ProfileCarousel
                profiles={exampleProfiles}
                autoplay
                autoplayInterval={3000}
              />
            </div>
          ),
          code: `import { ProfileCarousel } from "@/components/ui/profile-carousel"

<ProfileCarousel
  profiles={profiles}
  autoplay
  autoplayInterval={3000}
/>`,
        },
        {
          title: "Starts on the second profile",
          preview: (
            <div className="w-full">
              <ProfileCarousel
                profiles={exampleProfiles}
                initialIndex={1}
                loop={false}
              />
            </div>
          ),
          code: `import { ProfileCarousel } from "@/components/ui/profile-carousel"

<ProfileCarousel
  profiles={profiles}
  initialIndex={1}
  loop={false}
/>`,
        },
      ]}
      props={[
        {
          name: "profiles",
          type: "Profile[]",
          description:
            "Profiles shown in the track. Each profile has id, name, image, description, category, optional objectPosition for portrait framing, and optional href.",
        },
        {
          name: "initialIndex",
          type: "number",
          default: "0",
          description: "Profile that starts behind the detail card position.",
        },
        {
          name: "loop",
          type: "boolean",
          default: "true",
          description:
            "Wrap past either end with cloned copies and a seamless invisible reset.",
        },
        {
          name: "draggable",
          type: "boolean",
          default: "true",
          description:
            "Enable mouse drag and touch swipe. Dragging past ~22% of a card step changes slides, otherwise it snaps back.",
        },
        {
          name: "transitionDuration",
          type: "number",
          default: "600",
          description:
            "Slide transition duration in milliseconds. Uses a smooth ease-out curve and collapses to zero when reduced motion is preferred.",
        },
        {
          name: "autoplay",
          type: "boolean",
          default: "false",
          description:
            "Opt-in automatic advancement. Pauses on hover, focus, and reduced motion.",
        },
        {
          name: "autoplayInterval",
          type: "number",
          default: "5000",
          description: "Delay between automatic steps in milliseconds.",
        },
        {
          name: "onProfileClick",
          type: "(profile: Profile) => void",
          description:
            "Called when a card's View Profile control is activated.",
        },
        {
          name: "onIndexChange",
          type: "(index: number) => void",
          description: "Called with the real profile index when it changes.",
        },
        {
          name: "className",
          type: "string",
          description: "Additional CSS classes for the carousel section.",
        },
      ]}
    />
  );
}
