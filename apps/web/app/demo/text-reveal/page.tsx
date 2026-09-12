import {
  TextReveal,
  type TextRevealBy,
  type TextRevealStyle,
} from "@workspace/ui/components/text-reveal";

const SAMPLE_TEXT =
  "DavinciUI brings a growing library of thoughtfully crafted components and flexible patterns together, helping teams build polished, consistent interfaces faster. Explore, customize every detail, and bring motion-rich experiences to life—from the first prototype through the final product.";

const COMPARISONS: {
  title: string;
  revealStyle: TextRevealStyle;
  revealBy: TextRevealBy;
}[] = [
  { title: "Linear · Characters", revealStyle: "linear", revealBy: "characters" },
  { title: "Linear · Words", revealStyle: "linear", revealBy: "words" },
  { title: "Diagonal · Characters", revealStyle: "diagonal", revealBy: "characters" },
  { title: "Diagonal · Words", revealStyle: "diagonal", revealBy: "words" },
  { title: "Random · Words", revealStyle: "random", revealBy: "words" },
  { title: "Center Out · Words", revealStyle: "center-out", revealBy: "words" },
  { title: "Edges In · Characters", revealStyle: "edges-in", revealBy: "characters" },
];

export default function TextRevealTestPage() {
  return (
    <main className="min-h-screen bg-[#09090b] px-5 pb-20 text-zinc-100 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="max-w-3xl py-14 sm:py-20">
          <p className="text-sm font-medium text-zinc-400">Text Animations</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Text Reveal comparison
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400">
            Each panel uses the same paragraph. Scroll down and back up to compare
            the reading order, spatial sweep, and character or word timing.
          </p>
        </header>

        <div className="grid gap-5 lg:grid-cols-2">
          {COMPARISONS.map(({ title, revealStyle, revealBy }, index) => (
            <section
              key={title}
              data-testid={`text-reveal-case-${index + 1}`}
              className="flex min-h-[22rem] flex-col rounded-2xl border border-white/10 bg-white/[0.035] p-6 sm:p-8"
            >
              <h2 className="text-sm font-medium text-zinc-400">{title}</h2>
              <div className="flex flex-1 items-center py-10">
                <TextReveal
                  text={SAMPLE_TEXT}
                  revealStyle={revealStyle}
                  revealBy={revealBy}
                  randomSeed={742}
                  revealSoftness={0.24}
                  scrubSmoothness={0.4}
                  fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
                  fontSize={24}
                  fontWeight={500}
                  lineHeight={1.5}
                  letterSpacing={0}
                  textAlign="left"
                  revealedColor="#f4f4f5"
                  unrevealedColor="#f4f4f5"
                  className="w-full"
                />
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
