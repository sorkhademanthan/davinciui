"use client";

import { Bookshelf, type BookItem } from "@workspace/ui/components/bookshelf";

const DEMO_BOOKS = [
  {
    id: "grid-systems",
    title: "Grid Systems",
    author: "Kimberly Elam",
    color: "#b4522f",
    textColor: "#f8e9dc",
    width: 69,
    thickness: 13,
  },
  {
    id: "kinfolk",
    title: "Kinfolk Entrepreneur",
    author: "Nathan Williams",
    color: "#d9d4c9",
    textColor: "#1d1b18",
    width: 77,
    thickness: 16,
  },
  {
    id: "genius",
    title: "Genius Behind Apple",
    author: "Leander Kahney",
    color: "#1b1b1b",
    textColor: "#ece7db",
    width: 65,
    thickness: 14,
  },
  {
    id: "app-icon",
    title: "The iOS App Icon Book",
    author: "Michael Flarup",
    color: "#f1ece2",
    textColor: "#151515",
    accent: "#ff8ac8",
    width: 79,
    thickness: 15,
  },
  {
    id: "principles",
    title: "Universal Principles of UX",
    author: "Irene Pereyra",
    color: "#252525",
    textColor: "#f1ede3",
    width: 70,
    thickness: 17,
  },
  {
    id: "how-to",
    title: "How To",
    author: "Michael Bierut",
    color: "#e8e3d8",
    textColor: "#151515",
    width: 65,
    thickness: 13,
  },
] satisfies BookItem[];

export function BookshelfCardPreview() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex items-center justify-center overflow-hidden bg-black dark:bg-black"
    >
      <Bookshelf
        books={DEMO_BOOKS}
        initialIndex={1}
        bookHeight={150}
        gap={9}
        perspective={800}
        transitionDuration={1.2}
        autoplayInterval={4.5}
        decorative
        showHeader={false}
        showControls={false}
        className="max-w-[440px]"
      />
    </div>
  );
}
