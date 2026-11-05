import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  BookshelfPersonalizePanel,
  BookshelfPlayground,
} from "@/components/docs/previews/bookshelf-preview";
import { LiveCodeBlock } from "@/components/live-code-block";
import { readComponentSource } from "@/lib/source-code";

const defaultCode = `import { Bookshelf, type BookItem } from "@/components/ui/bookshelf"

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

<Bookshelf
  books={books}
  initialIndex={1}
  bookHeight={340}
  gap={18}
  perspective={1400}
  transitionDuration={1.1}
  autoplay
  autoplayInterval={4}
/>`;

export async function BookshelfDocs() {
  const sourceCode =
    (await readComponentSource("bookshelf")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Bookshelf"
      description="A cinematic 3D bookshelf showcase where physical-looking books rotate into view, bringing different front covers to the foreground while surrounding spines remain visible."
      preview={<BookshelfPlayground />}
      personalizeContent={<BookshelfPersonalizePanel />}
      previewCode={defaultCode}
      installPackageName="bookshelf"
      installDependencies="gsap"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/bookshelf.tsx"
      usageCode={<LiveCodeBlock slug="bookshelf" defaultCode={defaultCode} />}
      fullWidthPreview
      props={[
        {
          name: "books",
          type: "BookItem[]",
          description:
            "Books in shelf order. Each item accepts id, title, optional subtitle, author, cover image URL, color, coverColor, textColor, accent, width, and thickness.",
          default: "[]",
        },
        {
          name: "initialIndex",
          type: "number",
          default: "0",
          description: "The initially featured (cover-facing) book index.",
        },
        {
          name: "autoplay",
          type: "boolean",
          default: "true",
          description: "Auto-advance through books on a timer.",
        },
        {
          name: "autoplayInterval",
          type: "number",
          default: "3.5",
          description: "Seconds between automatic book advances.",
        },
        {
          name: "transitionDuration",
          type: "number",
          default: "1",
          description: "Cover rotation and shelf travel duration in seconds.",
        },
        {
          name: "perspective",
          type: "number",
          default: "1400",
          description: "CSS perspective of the shelf stage in px.",
        },
        {
          name: "bookHeight",
          type: "number",
          default: "340",
          description: "Height of each book in px.",
        },
        {
          name: "gap",
          type: "number",
          default: "18",
          description: "Horizontal gap between books in px.",
        },
        {
          name: "title",
          type: "string",
          default: '"Favorite Books"',
          description: "Heading shown above the shelf.",
        },
        {
          name: "showHeader",
          type: "boolean",
          default: "true",
          description: "Render the serif heading and rule above the shelf.",
        },
        {
          name: "showControls",
          type: "boolean",
          default: "true",
          description: "Render the previous/next buttons and index readout.",
        },
        {
          name: "decorative",
          type: "boolean",
          default: "false",
          description:
            "Render books as non-interactive divs for card previews instead of buttons.",
        },
        {
          name: "label",
          type: "string",
          default: '"Favorite books bookshelf"',
          description: "Accessible name for the bookshelf group.",
        },
        {
          name: "onActiveBookChange",
          type: "(index: number) => void",
          description: "Fired when the featured book changes.",
        },
        {
          name: "className",
          type: "string",
          description: "Extra classes for the outer wrapper.",
        },
      ]}
    />
  );
}
