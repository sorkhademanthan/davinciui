import * as React from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusablesIn(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) =>
      element.getClientRects().length > 0 &&
      element.getAttribute("aria-hidden") !== "true",
  );
}

/**
 * Complete modal behavior for bottom-sheet drawers: Escape dismisses, Tab
 * cycles inside, focus returns to the trigger on close, and background
 * scrolling locks while open. Scroll-lock save/restore is symmetric, so
 * drawers opened above fullscreen (or stacked) restore correctly.
 */
export function useModalDialog(
  open: boolean,
  options: {
    dialogRef: React.RefObject<HTMLElement | null>;
    onClose: () => void;
    lockScroll?: boolean;
  },
): void {
  const { dialogRef, onClose } = options;
  const lockScroll = options.lockScroll ?? true;
  const previousFocusRef = React.useRef<HTMLElement | null>(null);
  // Always-fresh close without re-running the effect: call sites pass
  // inline arrows, and re-running would steal focus on every render.
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  React.useEffect(() => {
    if (!open) return;
    const node = dialogRef.current;
    const close = () => onCloseRef.current();
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    // Move focus inside on open (close control first, container fallback).
    const initial = node ? focusablesIn(node)[0] ?? node : null;
    initial?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const activeOverlay =
        activeElement instanceof Element
          ? activeElement.closest('[role="dialog"], [role="menu"], [role="listbox"]')
          : null;
      // A portaled overlay above this dialog (command menu, select popup)
      // owns keyboard interaction until dismissed.
      if (
        activeOverlay &&
        activeOverlay !== node &&
        !node?.contains(activeOverlay)
      ) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      if (event.key !== "Tab" || !node) return;
      const focusable = focusablesIn(node);
      if (focusable.length === 0) {
        event.preventDefault();
        node.focus();
        return;
      }
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !node.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !node.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    if (lockScroll) document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (lockScroll && document.body.style.overflow === "hidden") {
        document.body.style.overflow = previousOverflow;
      }
      // Return focus to the trigger — unless something else already
      // claimed it (e.g. a follow-up dialog opened synchronously).
      const stillInside =
        document.activeElement instanceof Node &&
        (node?.contains(document.activeElement) || document.activeElement === document.body);
      if (stillInside) previousFocusRef.current?.focus({ preventScroll: true });
    };
  }, [open, dialogRef, lockScroll]);
}
