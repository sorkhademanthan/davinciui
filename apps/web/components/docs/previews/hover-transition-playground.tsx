"use client";

import { useEffect } from "react";
import { create } from "zustand";
import {
  HoverTransition,
  hoverTransitionDirections,
  hoverTransitionEffects,
  type HoverTransitionDirection,
  type HoverTransitionEffect,
} from "@workspace/ui/components/hover-transition";
import { configEquals, usePlaygroundStore } from "@/hooks/use-playground-store";
import {
  CustomizePanel,
  bindCustomizeUpdate,
  type CustomizeControl,
} from "@/components/customize-panel";

const PEOPLE = [
  {
    id: "tom",
    name: "Tom Mathews",
    role: "CEO",
    bio: "Leading the agency's mission to blend Indonesian creativity with cutting-edge AI automation that helps businesses work smarter and scale faster.",
    position: "0% 0%",
  },
  {
    id: "andrew",
    name: "Andrew Michel",
    role: "COO",
    bio: "Turning ambitious ideas into focused systems, strong teams, and repeatable operations that keep every project moving forward.",
    position: "33.333% 0%",
  },
  {
    id: "james",
    name: "James Smith",
    role: "CTO",
    bio: "Building reliable AI products that connect thoughtful engineering with simple, human-centered digital experiences.",
    position: "66.667% 0%",
  },
  {
    id: "marlen",
    name: "Marlen",
    role: "CMO",
    bio: "Shaping clear brand stories and campaigns that turn attention into lasting relationships between people and products.",
    position: "100% 0%",
  },
  {
    id: "sophie",
    name: "Sophie Laura",
    role: "Strategy Director",
    bio: "Finding the sharpest path through complex challenges and translating research into confident creative direction.",
    position: "0% 100%",
  },
  {
    id: "daniel",
    name: "Daniel Reed",
    role: "Product Director",
    bio: "Guiding products from first sketch to launch with a practical balance of customer insight, craft, and commercial impact.",
    position: "33.333% 100%",
  },
  {
    id: "amina",
    name: "Amina Yusuf",
    role: "Creative Director",
    bio: "Creating expressive visual systems where culture, technology, and meticulous art direction meet with purpose.",
    position: "66.667% 100%",
  },
  {
    id: "liam",
    name: "Liam Woods",
    role: "Studio Partner",
    bio: "Helping clients turn bold goals into enduring collaborations, measurable growth, and work the whole team is proud to share.",
    position: "100% 100%",
  },
] as const;

type Person = (typeof PEOPLE)[number];
type PersonId = Person["id"];

const EASINGS = {
  smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
  soft: "cubic-bezier(0.4, 0, 0.2, 1)",
  snappy: "cubic-bezier(0.33, 1, 0.68, 1)",
} as const;

type EasingName = keyof typeof EASINGS;

const optionLabel = (value: string) =>
  value.replace(/-/g, " ").replace(/^./, (char) => char.toUpperCase());

const CONTROLS: CustomizeControl[] = [
  { type: "color", key: "color", label: "Hover color", defaultColor: "#dfff5f", group: "Card" },
  { type: "select", key: "effect", label: "Effect", options: hoverTransitionEffects.map((effect) => ({ label: optionLabel(effect), value: effect })), group: "Card" },
  { type: "select", key: "direction", label: "Direction", options: hoverTransitionDirections.map((direction) => ({ label: optionLabel(direction), value: direction })), group: "Card" },
  { type: "slider", key: "duration", label: "Duration", min: 0.15, max: 1.8, step: 0.05, unit: "s", group: "Timing" },
  { type: "select", key: "easing", label: "Easing", options: Object.keys(EASINGS).map((easing) => ({ label: optionLabel(easing), value: easing })), group: "Timing" },
];

interface CardConfig {
  effect: HoverTransitionEffect;
  direction: HoverTransitionDirection;
  color: string;
}

interface HoverTransitionConfig {
  selectedCard: PersonId;
  cards: Record<PersonId, CardConfig>;
  duration: number;
  easing: EasingName;
}

const DEFAULT_CONFIG: HoverTransitionConfig = {
  selectedCard: "tom",
  cards: {
    tom: { effect: "morph", direction: "center", color: "#dfff5f" },
    andrew: {
      effect: "diagonal",
      direction: "top-left",
      color: "#ff795f",
    },
    james: { effect: "strips", direction: "bottom", color: "#7c8cff" },
    marlen: { effect: "ripple", direction: "center", color: "#ff9bcb" },
    sophie: { effect: "curtain", direction: "top", color: "#56d6b0" },
    daniel: { effect: "slide", direction: "left", color: "#ffc857" },
    amina: {
      effect: "wipe",
      direction: "bottom-right",
      color: "#bba7ff",
    },
    liam: {
      effect: "parallax",
      direction: "top-right",
      color: "#62d6e8",
    },
  },
  duration: 1.5,
  easing: "smooth",
};

interface HoverTransitionStore {
  config: HoverTransitionConfig;
  selectCard: (id: PersonId) => void;
  updateCard: (id: PersonId, updates: Partial<CardConfig>) => void;
  updateTiming: (
    updates: Partial<Pick<HoverTransitionConfig, "duration" | "easing">>,
  ) => void;
  resetConfig: () => void;
}

const useHoverTransitionStore = create<HoverTransitionStore>((set) => ({
  config: DEFAULT_CONFIG,
  selectCard: (selectedCard) =>
    set((state) => ({ config: { ...state.config, selectedCard } })),
  updateCard: (id, updates) =>
    set((state) => ({
      config: {
        ...state.config,
        cards: {
          ...state.config.cards,
          [id]: { ...state.config.cards[id], ...updates },
        },
      },
    })),
  updateTiming: (updates) =>
    set((state) => ({ config: { ...state.config, ...updates } })),
  resetConfig: () => set({ config: DEFAULT_CONFIG }),
}));

function generateCode(config: HoverTransitionConfig) {
  const card = config.cards[config.selectedCard];
  const person = PEOPLE.find((item) => item.id === config.selectedCard)!;
  const initials = person.name
    .split(" ")
    .map((part) => part[0])
    .join("");

  return `"use client"

import { HoverTransition } from "@/components/ui/hover-transition"

function DefaultCard() {
  return (
    <article className="relative flex h-full flex-col justify-between overflow-hidden bg-[#ece9e1] p-6 text-[#151515]">
      <span className="text-xs font-medium uppercase tracking-[0.16em] text-black/50">
        ${person.role}
      </span>
      <div aria-hidden="true" className="absolute inset-0 grid place-items-center text-[9rem] font-semibold tracking-[-0.08em] text-black/[0.06]">
        ${initials}
      </div>
      <div className="relative">
        <h3 className="text-3xl font-medium tracking-[-0.05em]">${person.name}</h3>
        <p className="mt-1 text-sm text-black/55">Hover to meet the team.</p>
      </div>
    </article>
  )
}

function HoverCard() {
  return (
    <article className="flex h-full flex-col justify-between p-6 text-[#111]" style={{ backgroundColor: "${card.color}" }}>
      <p className="max-w-[24ch] text-xl font-medium leading-tight tracking-[-0.035em]">
        ${person.bio}
      </p>
      <div>
        <p className="font-semibold">${person.name}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-black/55">
          ${person.role}
        </p>
      </div>
    </article>
  )
}

export default function HoverTransitionDemo() {
  return (
    <HoverTransition
      effect="${card.effect}"
      direction="${card.direction}"
      duration={${config.duration}}
      easing="${EASINGS[config.easing]}"
      defaultComponent={<DefaultCard />}
      hoverComponent={<HoverCard />}
      className="aspect-[4/5] w-full max-w-sm rounded-3xl"
    />
  )
}`;
}

function PortraitCard({
  person,
  effect,
}: {
  person: Person;
  effect: HoverTransitionEffect;
}) {
  return (
    <article
      className="relative h-full w-full overflow-hidden bg-[#f8f8f5] bg-[length:400%_200%] bg-no-repeat"
      style={{
        backgroundImage: "url('/images/hover-transition-team.jpg')",
        backgroundPosition: person.position,
      }}
    >
      <div className="absolute inset-x-0 bottom-0 px-[clamp(14px,5cqw,22px)] pb-[clamp(14px,5cqw,22px)] text-[#151515]">
        <p className="text-[clamp(18px,7cqw,28px)] font-medium leading-none tracking-[-0.045em]">
          {person.name}
        </p>
        <p className="mt-1.5 text-[clamp(10px,3.2cqw,12px)] uppercase leading-none tracking-[-0.02em] text-black/65">
          {person.role}
        </p>
      </div>
      <div className="absolute inset-x-[clamp(10px,5cqw,18px)] top-[clamp(10px,5cqw,18px)] flex justify-end font-mono text-[clamp(8px,3cqw,10px)] uppercase tracking-[0.08em] text-black/55">
        <span>{effect}</span>
      </div>
    </article>
  );
}

function PersonDetails({
  person,
  color,
  effect,
}: {
  person: Person;
  color: string;
  effect: HoverTransitionEffect;
}) {
  return (
    <article
      className="relative flex h-full w-full flex-col justify-between overflow-hidden p-[clamp(16px,5cqw,24px)] text-[#111]"
      style={{
        backgroundColor: color,
        backgroundImage:
          "radial-gradient(circle at 85% 5%, rgba(255,255,255,.42), transparent 34%), linear-gradient(145deg, rgba(255,255,255,.12), transparent 58%)",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[length:400%_200%] bg-no-repeat opacity-[0.13] grayscale [mix-blend-mode:multiply] [mask-image:linear-gradient(to_bottom,transparent_8%,black_65%)]"
        style={{
          backgroundImage: "url('/images/hover-transition-team.jpg')",
          backgroundPosition: person.position,
        }}
      />
      <div className="relative">
        <div className="flex translate-y-2 justify-end blur-[2px] opacity-0 transition-[transform,filter,opacity] duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[active=true]/hover-card:translate-y-0 group-data-[active=true]/hover-card:blur-none group-data-[active=true]/hover-card:opacity-100 group-data-[active=true]/hover-card:delay-150 motion-reduce:translate-y-0 motion-reduce:blur-none motion-reduce:opacity-100 motion-reduce:transition-none font-mono text-[clamp(8px,3cqw,10px)] uppercase tracking-[0.1em] text-black/55">
          <span>{effect}</span>
        </div>
        <p className="mt-[clamp(16px,6cqw,30px)] max-w-[25ch] translate-y-3 blur-[3px] opacity-0 transition-[transform,filter,opacity] duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[active=true]/hover-card:translate-y-0 group-data-[active=true]/hover-card:blur-none group-data-[active=true]/hover-card:opacity-100 group-data-[active=true]/hover-card:delay-200 motion-reduce:translate-y-0 motion-reduce:blur-none motion-reduce:opacity-100 motion-reduce:transition-none text-[clamp(16px,6cqw,22px)] font-medium leading-[1.16] tracking-[-0.04em]">
          {person.bio}
        </p>
      </div>
      <div className="relative translate-y-3 border-t border-black/25 pt-[clamp(12px,4cqw,18px)] blur-[2px] opacity-0 transition-[transform,filter,opacity] duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[active=true]/hover-card:translate-y-0 group-data-[active=true]/hover-card:blur-none group-data-[active=true]/hover-card:opacity-100 group-data-[active=true]/hover-card:delay-250 motion-reduce:translate-y-0 motion-reduce:blur-none motion-reduce:opacity-100 motion-reduce:transition-none">
        <p className="text-[clamp(14px,5cqw,18px)] font-semibold leading-none tracking-[-0.035em]">
          {person.name}
        </p>
        <p className="mt-1 text-[clamp(8px,3cqw,10px)] uppercase tracking-[0.08em] text-black/55">
          {person.role}
        </p>
      </div>
    </article>
  );
}

export function HoverTransitionPlayground() {
  const config = useHoverTransitionStore((state) => state.config);
  const selectCard = useHoverTransitionStore((state) => state.selectCard);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const api = usePlaygroundStore.getState();
      api.registerPreviewReset("hover-transition", () => useHoverTransitionStore.getState().resetConfig());
      api.setPersonalizedCode("hover-transition", generateCode(config), !configEquals(config, DEFAULT_CONFIG));
    }, 150);
    return () => window.clearTimeout(timeout);
  }, [config]);

  return (
    <div className="flex h-full min-h-[520px] w-full items-center overflow-hidden py-8 [container-type:size] sm:py-12">
      <div
        className="flex w-full snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-smooth px-4 py-2 [scroll-padding-inline:1rem] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:gap-4 sm:px-6 sm:[scroll-padding-inline:1.5rem] lg:px-8 lg:[scroll-padding-inline:2rem]"
        aria-label="Team hover transitions"
      >
        {PEOPLE.map((person) => {
          const card = config.cards[person.id];
          return (
            <HoverTransition
              key={person.id}
              effect={card.effect}
              direction={card.direction}
              duration={config.duration}
              easing={EASINGS[config.easing]}
              label={`${person.name}, ${person.role}`}
              onClick={() => selectCard(person.id)}
              defaultComponent={
                <PortraitCard person={person} effect={card.effect} />
              }
              hoverComponent={
                <PersonDetails
                  person={person}
                  color={card.color}
                  effect={card.effect}
                />
              }
              className="group/hover-card aspect-[.795] w-[clamp(260px,38cqw,390px)] shrink-0 snap-start rounded-[clamp(18px,2cqw,26px)] bg-[#f8f8f5] ring-1 ring-black/10 [container-type:inline-size] dark:ring-white/10"
            />
          );
        })}
      </div>
    </div>
  );
}

export function HoverTransitionPersonalizePanel() {
  const config = useHoverTransitionStore((state) => state.config);
  const selectCard = useHoverTransitionStore((state) => state.selectCard);
  const updateCard = useHoverTransitionStore((state) => state.updateCard);
  const updateTiming = useHoverTransitionStore((state) => state.updateTiming);
  const card = config.cards[config.selectedCard];
  const values = {
    ...config,
    color: card.color,
    effect: card.effect,
    direction: card.direction,
  };
  const defaults = {
    ...DEFAULT_CONFIG,
    color: DEFAULT_CONFIG.cards[DEFAULT_CONFIG.selectedCard].color,
    effect: DEFAULT_CONFIG.cards[DEFAULT_CONFIG.selectedCard].effect,
    direction: DEFAULT_CONFIG.cards[DEFAULT_CONFIG.selectedCard].direction,
  };

  const update = (updates: Partial<{
    color: string;
    effect: HoverTransitionEffect;
    direction: HoverTransitionDirection;
    duration: number;
    easing: EasingName;
  }>) => {
    const cardUpdates: Partial<CardConfig> = {};
    if (updates.color !== undefined) {
      cardUpdates.color = updates.color;
    }
    if (updates.effect !== undefined) {
      cardUpdates.effect = updates.effect;
    }
    if (updates.direction !== undefined) {
      cardUpdates.direction = updates.direction;
    }
    if (Object.keys(cardUpdates).length > 0) {
      updateCard(config.selectedCard, cardUpdates);
    }

    const timingUpdates: Partial<
      Pick<HoverTransitionConfig, "duration" | "easing">
    > = {};
    if (updates.duration !== undefined) {
      timingUpdates.duration = updates.duration;
    }
    if (updates.easing !== undefined) {
      timingUpdates.easing = updates.easing;
    }
    if (Object.keys(timingUpdates).length > 0) {
      updateTiming(timingUpdates);
    }
  };

  return (
    <CustomizePanel
      slug="hover-transition"
      controls={CONTROLS}
      values={values}
      defaults={defaults}
      onChange={bindCustomizeUpdate(update)}
      onReset={() => usePlaygroundStore.getState().resetPreview("hover-transition")}
      presets={PEOPLE.map((person) => ({
        label: person.name,
        value: person.id,
      }))}
      activePreset={config.selectedCard}
      onPresetChange={(value) => {
        const person = PEOPLE.find((item) => item.id === value);
        if (person) {
          selectCard(person.id);
        }
      }}
    />
  );
}
