"use client";

import * as React from "react";
import { create } from "zustand";
import { Bookshelf, type BookItem } from "@workspace/ui/components/bookshelf";
import { configEquals, usePlaygroundStore } from "@/hooks/use-playground-store";
import { CustomizePanel, bindCustomizeUpdate, type CustomizeControl } from "@/components/customize-panel";

const DEMO_BOOKS = [
  {
    id: "grid-systems",
    title: "Grid Systems",
    subtitle: "In Graphic Design",
    author: "Kimberly Elam",
    color: "#b4522f",
    coverColor: "#b4522f",
    textColor: "#f8e9dc",
    width: 172,
    thickness: 34,
  },
  {
    id: "kinfolk",
    title: "Kinfolk Entrepreneur",
    subtitle: "The",
    author: "Nathan Williams",
    color: "#c6c0b2",
    coverColor: "#d9d4c9",
    textColor: "#1d1b18",
    width: 196,
    thickness: 40,
  },
  {
    id: "genius",
    title: "Genius Behind Apple",
    subtitle: "Jony Ive",
    author: "Leander Kahney",
    color: "#232323",
    coverColor: "#1b1b1b",
    textColor: "#ece7db",
    width: 164,
    thickness: 36,
  },
  {
    id: "app-icon",
    title: "The iOS App Icon Book",
    subtitle: "Michael Flarup",
    author: "2022 Edition",
    color: "#e8e2d6",
    coverColor: "#f1ece2",
    textColor: "#151515",
    accent: "#ff8ac8",
    width: 198,
    thickness: 38,
  },
  {
    id: "principles",
    title: "Universal Principles of UX",
    author: "Irene Pereyra",
    color: "#2a2a2a",
    coverColor: "#252525",
    textColor: "#f1ede3",
    width: 176,
    thickness: 42,
  },
  {
    id: "how-to",
    title: "How To",
    subtitle: "Use graphic design to sell things",
    author: "Michael Bierut",
    color: "#d5d1c7",
    coverColor: "#e8e3d8",
    textColor: "#151515",
    width: 168,
    thickness: 34,
  },
  {
    id: "design-everyday",
    title: "The Design of Everyday Things",
    author: "Don Norman",
    color: "#8c2f22",
    coverColor: "#8c2f22",
    textColor: "#f8e9dc",
    width: 184,
    thickness: 38,
  },
] satisfies BookItem[];

interface BookshelfPlaygroundConfig {
  bookHeight: number;
  gap: number;
  perspective: number;
  transitionDuration: number;
  autoplay: boolean;
  autoplayInterval: number;
}

const DEFAULT_CONFIG: BookshelfPlaygroundConfig = {
  bookHeight: 340,
  gap: 18,
  perspective: 1400,
  transitionDuration: 1.1,
  autoplay: true,
  autoplayInterval: 4,
};

interface BookshelfPlaygroundStore {
  config: BookshelfPlaygroundConfig;
  updateConfig: (u: Partial<BookshelfPlaygroundConfig>) => void;
  resetConfig: () => void;
}

const useBookshelfPlayground = create<BookshelfPlaygroundStore>((set) => ({
  config: DEFAULT_CONFIG,
  updateConfig: (u) => set((s) => ({ config: { ...s.config, ...u } })),
  resetConfig: () => set({ config: DEFAULT_CONFIG }),
}));

function generateCode(c: BookshelfPlaygroundConfig) {
  return `import { Bookshelf, type BookItem } from "@/components/ui/bookshelf"

const books: BookItem[] = [
  {
    id: "grid-systems",
    title: "Grid Systems",
    subtitle: "In Graphic Design",
    author: "Kimberly Elam",
    color: "#b4522f",
    width: 172,
    thickness: 34,
  },
  {
    id: "kinfolk",
    title: "Kinfolk Entrepreneur",
    author: "Nathan Williams",
    color: "#d9d4c9",
    textColor: "#1d1b18",
    width: 196,
    thickness: 40,
  },
  {
    id: "app-icon",
    title: "The iOS App Icon Book",
    author: "Michael Flarup",
    color: "#f1ece2",
    textColor: "#151515",
    accent: "#ff8ac8",
    width: 198,
    thickness: 38,
  },
];

export function MyBookshelf() {
  return (
    <Bookshelf
      books={books}
      initialIndex={1}
      bookHeight={${c.bookHeight}}
      gap={${c.gap}}
      perspective={${c.perspective}}
      transitionDuration={${c.transitionDuration}}
      autoplay={${c.autoplay}}
      autoplayInterval={${c.autoplayInterval}}
    />
  )
}`;
}

export function BookshelfPlayground() {
  const config = useBookshelfPlayground((s) => s.config);

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      const api = usePlaygroundStore.getState();
      api.registerPreviewReset("bookshelf", () =>
        useBookshelfPlayground.getState().resetConfig(),
      );
      api.setPersonalizedCode(
        "bookshelf",
        generateCode(config),
        !configEquals(config, DEFAULT_CONFIG),
      );
    }, 180);
    return () => window.clearTimeout(t);
  }, [config]);

  return (
    <div className="flex h-full min-h-[560px] w-full items-center justify-center overflow-hidden bg-black p-6 dark:bg-black lg:p-10">
      <Bookshelf
        books={DEMO_BOOKS}
        initialIndex={1}
        bookHeight={config.bookHeight}
        gap={config.gap}
        perspective={config.perspective}
        transitionDuration={config.transitionDuration}
        autoplay={config.autoplay}
        autoplayInterval={config.autoplayInterval}
        className="max-w-[900px]"
      />
    </div>
  );
}

export function BookshelfPreview() {
  return <BookshelfPlayground />;
}

const CONTROLS: CustomizeControl[] = [
  { type: "slider", key: "bookHeight", label: "Book height", min: 200, max: 480, step: 10, unit: "px" },
  { type: "slider", key: "gap", label: "Gap", min: 8, max: 40, step: 2, unit: "px" },
  { type: "slider", key: "perspective", label: "Perspective", min: 600, max: 1800, step: 50, unit: "px" },
  { type: "slider", key: "transitionDuration", label: "Transition duration", min: 0.4, max: 2.5, step: 0.05, unit: "s" },
  { type: "slider", key: "autoplayInterval", label: "Autoplay interval", min: 2, max: 10, step: 0.5, unit: "s" },
  { type: "toggle", key: "autoplay", label: "Autoplay" },
];

export function BookshelfPersonalizePanel() {
  const config = useBookshelfPlayground((s) => s.config);
  const update = useBookshelfPlayground((s) => s.updateConfig);

  return (
    <CustomizePanel
      slug="bookshelf"
      controls={CONTROLS}
      values={config}
      defaults={DEFAULT_CONFIG}
      onChange={bindCustomizeUpdate(update)}
      onReset={() => usePlaygroundStore.getState().resetPreview("bookshelf")}
    />
  );
}
