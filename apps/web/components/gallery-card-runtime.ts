"use client";

import {
  useEffect,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";

type VisibilityCallback = (visible: boolean) => void;

const visibilityCallbacks = new WeakMap<Element, VisibilityCallback>();
let sharedVisibilityObserver: IntersectionObserver | null = null;

function getSharedVisibilityObserver() {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    return null;
  }

  if (!sharedVisibilityObserver) {
    sharedVisibilityObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibilityCallbacks.get(entry.target)?.(entry.isIntersecting);
        }
      },
      { rootMargin: "300px 0px", threshold: 0.01 },
    );
  }

  return sharedVisibilityObserver;
}

/**
 * Registers a gallery card with one shared viewport observer.
 *
 * The observer is created lazily in the browser and reused by every card, so
 * the basic-components grid no longer creates one IntersectionObserver per
 * card. Cards still mount only while they are near the viewport.
 */
export function useGalleryCardVisibility(
  ref: RefObject<Element | null>,
): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = getSharedVisibilityObserver();
    if (!observer) {
      setVisible(true);
      return;
    }

    visibilityCallbacks.set(element, setVisible);
    observer.observe(element);

    return () => {
      visibilityCallbacks.delete(element);
      observer.unobserve(element);
    };
  }, [ref]);

  return visible;
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const reducedMotionSubscribers = new Set<() => void>();
let sharedMotionQuery: MediaQueryList | null = null;
let motionListenerAttached = false;

function getSharedMotionQuery() {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return null;
  }

  if (!sharedMotionQuery) {
    sharedMotionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  }

  return sharedMotionQuery;
}

function notifyMotionSubscribers() {
  for (const subscriber of reducedMotionSubscribers) {
    subscriber();
  }
}

function subscribeToReducedMotion(callback: () => void) {
  const query = getSharedMotionQuery();
  if (!query) return () => {};

  reducedMotionSubscribers.add(callback);

  if (!motionListenerAttached) {
    query.addEventListener("change", notifyMotionSubscribers);
    motionListenerAttached = true;
  }

  return () => {
    reducedMotionSubscribers.delete(callback);

    if (reducedMotionSubscribers.size === 0 && motionListenerAttached) {
      query.removeEventListener("change", notifyMotionSubscribers);
      motionListenerAttached = false;
    }
  };
}

function getReducedMotionSnapshot() {
  return getSharedMotionQuery()?.matches ?? false;
}

function getReducedMotionServerSnapshot() {
  return false;
}

/**
 * Reads the user's reduced-motion preference through one shared matchMedia
 * listener. Every gallery card subscribes to the same store instead of
 * creating its own MediaQueryList.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
}
