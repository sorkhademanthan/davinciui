import { ScrollRevealImage } from "@workspace/ui/components/scroll-reveal-image";

const images = [
  { src: "/images/spiral-3d-slider/dark-glitch.jpg", alt: "Editorial portrait crossed by dark horizontal light trails" },
  { src: "/images/spiral-3d-slider/red-echo.jpg", alt: "Red fashion portrait swept through a long exposure" },
  { src: "/images/spiral-3d-slider/crimson-profile.jpg", alt: "Crimson profile emerging from a deep green shadow" },
  { src: "/images/spiral-3d-slider/silver-motion.jpg", alt: "Silver portrait stretched through a soft horizontal exposure" },
];

export default function ScrollRevealImageDemoPage() {
  return (
    <main className="min-h-screen">
      <ScrollRevealImage images={images} />
    </main>
  );
}
