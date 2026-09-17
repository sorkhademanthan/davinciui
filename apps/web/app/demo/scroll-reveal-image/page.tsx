import { ScrollRevealImage } from "@workspace/ui/components/scroll-reveal-image";

const images = [
  { src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1800&q=90", alt: "Noir portrait of a man on a black background" },
  { src: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=1800&q=90", alt: "Ember portrait of a woman against a deep red wall" },
  { src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1800&q=90", alt: "Velvet portrait of a woman in a charcoal studio" },
  { src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1800&q=90", alt: "Ashen portrait of a man against a gray studio wall" },
];

export default function ScrollRevealImageDemoPage() {
  return (
    <main className="min-h-screen">
      <ScrollRevealImage images={images} />
    </main>
  );
}
