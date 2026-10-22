import type { FocusCarouselItem } from "@workspace/ui/components/focus-carousel";

const spiralVideo = {
  src: "/preview-videos/component-animations/spiral3dslider.webm",
};

export const focusCarouselDemoItems: FocusCarouselItem[] = [
  {
    id: "tessellate",
    title: "Tessellate",
    subtitle: "Glass Form Study",
    image: {
      src: "/images/spiral-3d-slider/prism-portrait.jpg",
      alt: "Portrait split by green light and a magenta prism",
    },
    video: {
      ...spiralVideo,
      poster: "/images/spiral-3d-slider/prism-portrait.jpg",
    },
  },
  {
    id: "salvia",
    title: "Salvia",
    subtitle: "Garden Room Session",
    image: {
      src: "/images/spiral-3d-slider/green-portrait.jpg",
      alt: "Portrait washed in deep garden green",
    },
    video: {
      ...spiralVideo,
      poster: "/images/spiral-3d-slider/green-portrait.jpg",
    },
  },
  {
    id: "fathom",
    title: "Fathom",
    subtitle: "Deep Water Notes",
    image: {
      src: "/images/spiral-3d-slider/blue-profile.jpg",
      alt: "Blue-lit profile against a dark field",
    },
    video: {
      ...spiralVideo,
      poster: "/images/spiral-3d-slider/blue-profile.jpg",
    },
  },
  {
    id: "brindle",
    title: "Brindle",
    subtitle: "Slow Portrait Work",
    image: {
      src: "/images/spiral-3d-slider/dark-glitch.jpg",
      alt: "Dark editorial portrait crossed by light trails",
    },
    video: {
      ...spiralVideo,
      poster: "/images/spiral-3d-slider/dark-glitch.jpg",
    },
  },
  {
    id: "quillon",
    title: "Quillon",
    subtitle: "Edge and Shadow",
    image: {
      src: "/images/spiral-3d-slider/visor-portrait.jpg",
      alt: "Portrait under a reflective visor and hard shadow",
    },
    video: {
      ...spiralVideo,
      poster: "/images/spiral-3d-slider/visor-portrait.jpg",
    },
  },
  {
    id: "pewter",
    title: "Pewter",
    subtitle: "Cold Morning Frames",
    image: {
      src: "/images/spiral-3d-slider/silver-motion.jpg",
      alt: "Silver portrait stretched through a soft exposure",
    },
    video: {
      ...spiralVideo,
      poster: "/images/spiral-3d-slider/silver-motion.jpg",
    },
  },
  {
    id: "umbra",
    title: "Umbra",
    subtitle: "Half Lit Faces",
    image: {
      src: "/images/spiral-3d-slider/ghosted-portrait.jpg",
      alt: "Half-lit portrait sinking into shadow",
    },
  },
  {
    id: "marble",
    title: "Marble",
    subtitle: "Street Studies",
    image: {
      src: "/images/spiral-3d-slider/white-motion.jpg",
      alt: "Pale portrait blurred through motion",
    },
  },
  {
    id: "marrow",
    title: "Marrow",
    subtitle: "Quiet Studio Hours",
    image: {
      src: "/images/spiral-3d-slider/crimson-profile.jpg",
      alt: "Crimson profile emerging from a deep green shadow",
    },
  },
  {
    id: "ochre",
    title: "Ochre",
    subtitle: "Desert Light Series",
    image: {
      src: "/images/spiral-3d-slider/orange-haze.jpg",
      alt: "Warm orange haze across a portrait",
    },
  },
];

export const focusCarouselThreeItems: FocusCarouselItem[] =
  focusCarouselDemoItems.slice(0, 3);
