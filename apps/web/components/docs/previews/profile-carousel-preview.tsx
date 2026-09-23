"use client";

import {
  ProfileCarousel,
  type Profile,
} from "@workspace/ui/components/profile-carousel";

export const profileCarouselDemoProfiles: Profile[] = [
  {
    id: "mario-tomsen",
    name: "Mario Tomsen",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=640&auto=format&fit=crop",
    description: "Brand designer crafting bold visual identities.",
    category: "Brand Design",
    objectPosition: "50% 25%",
  },
  {
    id: "linda-fuchs",
    name: "Linda Fuchs",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=640&auto=format&fit=crop",
    description: "Illustrator focused on playful editorial artwork.",
    category: "Illustration",
    objectPosition: "50% 25%",
  },
  {
    id: "ava-kim",
    name: "Ava Kim",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=640&auto=format&fit=crop",
    description: "UX researcher turning insight into clear direction.",
    category: "UX Research",
    objectPosition: "50% 20%",
  },
  {
    id: "noah-carter",
    name: "Noah Carter",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=640&auto=format&fit=crop",
    description: "Motion designer bringing interfaces to life.",
    category: "Motion Design",
    objectPosition: "50% 25%",
  },
  {
    id: "marcus-berendt",
    name: "Marcus Berendt",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=640&auto=format&fit=crop",
    description: "Product Designer focused on intuitive digital experiences.",
    category: "Product Design",
    objectPosition: "50% 20%",
  },
  {
    id: "sofia-marchetti",
    name: "Sofia Marchetti",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=640&auto=format&fit=crop",
    description: "Design systems lead scaling components with care.",
    category: "Design Systems",
    objectPosition: "50% 20%",
  },
  {
    id: "jonas-weber",
    name: "Jonas Weber",
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=640&auto=format&fit=crop",
    description: "Creative director shaping calm, confident brands.",
    category: "Art Direction",
    objectPosition: "50% 25%",
  },
  {
    id: "emma-larsen",
    name: "Emma Larsen",
    image:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=640&auto=format&fit=crop",
    description: "Interaction designer obsessed with micro-detail.",
    category: "Interaction",
    objectPosition: "50% 25%",
  },
];

export function ProfileCarouselPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <ProfileCarousel profiles={profileCarouselDemoProfiles} initialIndex={0} />
    </div>
  );
}
