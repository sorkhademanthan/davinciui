"use client";

import {
  ProfileCarousel,
  type Profile,
} from "@workspace/ui/components/profile-carousel";

export const profileCarouselDemoProfiles: Profile[] = [
  {
    id: "mario-tomsen",
    name: "Mario Tomsen",
    image: "/images/spiral-3d-slider/blue-double.webp",
    description: "Brand designer crafting bold visual identities.",
    category: "Brand Design",
  },
  {
    id: "linda-fuchs",
    name: "Linda Fuchs",
    image: "/images/spiral-3d-slider/dark-glitch.webp",
    description: "Illustrator focused on playful editorial artwork.",
    category: "Illustration",
  },
  {
    id: "ava-kim",
    name: "Ava Kim",
    image: "/images/spiral-3d-slider/prism-portrait.webp",
    description: "UX researcher turning insight into clear direction.",
    category: "UX Research",
  },
  {
    id: "noah-carter",
    name: "Noah Carter",
    image: "/images/spiral-3d-slider/silver-motion.webp",
    description: "Motion designer bringing interfaces to life.",
    category: "Motion Design",
  },
  {
    id: "marcus-berendt",
    name: "Marcus Berendt",
    image: "/images/spiral-3d-slider/red-echo.webp",
    description: "Product Designer focused on intuitive digital experiences.",
    category: "Product Design",
  },
  {
    id: "sofia-marchetti",
    name: "Sofia Marchetti",
    image: "/images/spiral-3d-slider/crimson-profile.webp",
    description: "Design systems lead scaling components with care.",
    category: "Design Systems",
  },
  {
    id: "jonas-weber",
    name: "Jonas Weber",
    image: "/images/spiral-3d-slider/red-blue-figure.webp",
    description: "Creative director shaping calm, confident brands.",
    category: "Art Direction",
  },
  {
    id: "emma-larsen",
    name: "Emma Larsen",
    image: "/images/spiral-3d-slider/ghosted-portrait.webp",
    description: "Interaction designer obsessed with micro-detail.",
    category: "Interaction",
  },
];

export function ProfileCarouselPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <ProfileCarousel profiles={profileCarouselDemoProfiles} initialIndex={0} />
    </div>
  );
}
