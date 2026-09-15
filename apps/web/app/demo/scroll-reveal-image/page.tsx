import { ScrollRevealImage } from "@workspace/ui/components/scroll-reveal-image";

const images = [
  { src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1800&q=90", alt: "Portrait of a man against a dark background", title: "Night Transit", accent: "#ff4f9a" },
  { src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1800&q=90", alt: "Portrait of a smiling woman", title: "Quiet Signal", accent: "#c6ff3d" },
  { src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1800&q=90", alt: "Portrait of a woman in bright light", title: "Open Horizon", accent: "#a86cff" },
  { src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1800&q=90", alt: "Portrait of a woman in natural light", title: "Still Water", accent: "#4ed8ff" },
];

export default function ScrollRevealImageDemoPage() {
  return (
    <main className="min-h-screen">
      <ScrollRevealImage images={images} />
    </main>
  );
}
