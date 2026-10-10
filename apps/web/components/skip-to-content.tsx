"use client";

import * as React from "react";

/**
 * Skip-to-content link for keyboard and screen-reader users.
 * Rendered first in <body> so it's the first Tab stop. On activation it
 * moves focus to the page's primary <main> landmark, so per-page ids
 * aren't required across 40+ main elements.
 */
export function SkipToContent() {
  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      const main = document.querySelector("main");
      if (!main) return; // fall back to default anchor behavior
      event.preventDefault();
      if (!main.hasAttribute("tabindex")) {
        main.setAttribute("tabindex", "-1");
      }
      main.focus({ preventScroll: true });
      main.scrollIntoView({ block: "start" });
    },
    [],
  );

  return (
    <a
      href="#main-content"
      onClick={handleClick}
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      Skip to content
    </a>
  );
}
