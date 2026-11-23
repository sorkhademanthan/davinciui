import {
  createHighlighter,
  type Highlighter,
  type BundledLanguage,
  type BundledTheme,
} from "shiki";
import { dvDark, dvLight } from "@/lib/code-themes";

// Singleton pattern - cache the highlighter instance
let highlighterPromise: Promise<Highlighter> | null = null;

// Pre-load only the languages we actually use
const LANGS: BundledLanguage[] = ["tsx", "typescript", "bash", "json", "js", "jsx", "css", "html", "shell", "mdx", "diff"];
const THEMES = [dvLight, dvDark];

/**
 * Get or create a cached Shiki highlighter instance.
 * This is a CRITICAL performance optimization - creating a highlighter
 * is expensive (~200-500ms), so we only do it once.
 */
export async function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: THEMES,
      langs: LANGS,
    });
  }
  return highlighterPromise;
}

/**
 * Shared HTML cache for code blocks.
 * In development, this provides instant re-renders.
 * In production, this works alongside Next.js page caching.
 */
const htmlCache = new Map<string, string>();

/**
 * Highlight code with caching.
 * Uses a content-addressable cache key to avoid redundant highlighting.
 */
export async function highlightCode(
  code: string,
  lang: BundledLanguage = "tsx",
  options: {
    lightTheme?: BundledTheme | typeof dvLight;
    darkTheme?: BundledTheme | typeof dvDark;
  } = {},
): Promise<string> {
  const lightTheme = options.lightTheme ?? dvLight;
  const darkTheme = options.darkTheme ?? dvDark;
  const cacheKey = `${lang}:${lightTheme}:${darkTheme}:${code}`;

  const cached = htmlCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const highlighter = await getHighlighter();

  const html = highlighter.codeToHtml(code.trim(), {
    lang,
    themes: {
      light: lightTheme as never,
      dark: darkTheme as never,
    },
    defaultColor: false,
    transformers: [
      {
        name: "line-classes",
        line(node, line) {
          this.addClassToHast(node, "line")
          node.properties["data-line"] = line
        },
      },
    ],
  });

  // Cache the result (limit cache size to prevent memory issues)
  if (htmlCache.size > 500) {
    // Clear oldest entries (simple LRU approximation)
    const firstKey = htmlCache.keys().next().value;
    if (firstKey) htmlCache.delete(firstKey);
  }
  htmlCache.set(cacheKey, html);

  return html;
}
