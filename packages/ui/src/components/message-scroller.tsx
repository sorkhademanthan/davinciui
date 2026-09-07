"use client";

import { cn } from "@workspace/ui/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";
import * as React from "react";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type MessageScrollerPosition = "start" | "end" | "last-anchor";
export type ScrollToAlign = "start" | "center" | "end" | "nearest";

export interface ScrollCommandOptions {
  align?: ScrollToAlign;
  behavior?: ScrollBehavior;
  scrollMargin?: number;
}

export interface MessageScrollerControls {
  scrollToMessage: (messageId: string, options?: ScrollCommandOptions) => boolean;
  scrollToEnd: (options?: Omit<ScrollCommandOptions, "align">) => boolean;
  scrollToStart: (options?: Omit<ScrollCommandOptions, "align">) => boolean;
}

export interface ScrollableState {
  start: boolean;
  end: boolean;
}

export interface VisibilityState {
  currentAnchorId: string | null;
  visibleMessageIds: string[];
}

interface ProviderOptions {
  autoScroll: boolean;
  defaultScrollPosition: MessageScrollerPosition;
  scrollEdgeThreshold: number;
  scrollMargin: number;
  scrollPreviousItemPeek: number;
}

// ─────────────────────────────────────────────────────────────
// Store (imperative hot path — scrolling never rerenders rows)
// ─────────────────────────────────────────────────────────────

interface PendingTarget {
  id: string;
  align: ScrollToAlign;
  behavior: ScrollBehavior;
  scrollMargin: number;
}

interface ScrollerStore {
  opts: ProviderOptions;
  rootEl: HTMLDivElement | null;
  viewportEl: HTMLDivElement | null;
  contentEl: HTMLDivElement | null;
  spacerEl: HTMLDivElement | null;
  items: Map<string, { el: HTMLElement; anchor: boolean }>;
  order: string[];
  appliedInitial: boolean;
  following: boolean;
  pendingTarget: PendingTarget | null;
  lastAnchorTop: number | null;
  version: number;
  visibilityVersion: number;
  scrollableSubs: number;
  visibilitySubs: number;
  listeners: Set<() => void>;
  visibility: VisibilityState;
  atStart: boolean;
  atEnd: boolean;
  autoscrolling: boolean;
  autoTimer: ReturnType<typeof setTimeout> | null;
  ro: ResizeObserver | null;
  io: IntersectionObserver | null;
}

function createStore(opts: ProviderOptions): ScrollerStore {
  return {
    opts,
    rootEl: null,
    viewportEl: null,
    contentEl: null,
    spacerEl: null,
    items: new Map(),
    order: [],
    appliedInitial: false,
    following: false,
    pendingTarget: null,
    lastAnchorTop: null,
    version: 0,
    visibilityVersion: 0,
    scrollableSubs: 0,
    visibilitySubs: 0,
    listeners: new Set(),
    visibility: { currentAnchorId: null, visibleMessageIds: [] },
    atStart: true,
    atEnd: true,
    autoscrolling: false,
    autoTimer: null,
    ro: null,
    io: null,
  };
}

function emit(store: ScrollerStore) {
  store.version += 1;
  store.listeners.forEach((l) => l());
}

function setAttrs(store: ScrollerStore) {
  const { viewportEl, rootEl, atStart, atEnd, autoscrolling } = store;
  const scrollable = atStart && atEnd ? null : [atStart ? "start" : null, atEnd ? "end" : null].filter(Boolean).join(" ");
  for (const el of [viewportEl, rootEl]) {
    if (!el) continue;
    if (scrollable) el.setAttribute("data-scrollable", scrollable);
    else el.removeAttribute("data-scrollable");
    if (autoscrolling) el.setAttribute("data-autoscrolling", "");
    else el.removeAttribute("data-autoscrolling");
  }
}

function metrics(store: ScrollerStore) {
  const vp = store.viewportEl!;
  const t = store.opts.scrollEdgeThreshold;
  return {
    atStart: vp.scrollTop <= t,
    atEnd: vp.scrollHeight - vp.scrollTop - vp.clientHeight <= t,
  };
}

function refreshScrollable(store: ScrollerStore) {
  if (!store.viewportEl) return;
  const { atStart, atEnd } = metrics(store);
  if (atStart === store.atStart && atEnd === store.atEnd) return;
  store.atStart = atStart;
  store.atEnd = atEnd;
  store.following = store.opts.autoScroll && atEnd;
  setAttrs(store);
  emit(store);
}

function updateSpacer(store: ScrollerStore) {
  const { viewportEl, contentEl, spacerEl, lastAnchorTop } = store;
  if (!viewportEl || !contentEl || !spacerEl) return;
  if (lastAnchorTop == null) {
    spacerEl.style.height = "0px";
    return;
  }
  const need = viewportEl.clientHeight + store.opts.scrollPreviousItemPeek - (contentEl.scrollHeight - lastAnchorTop);
  spacerEl.style.height = `${Math.max(0, Math.ceil(need))}px`;
}

function itemTop(store: ScrollerStore, el: HTMLElement): number {
  const vp = store.viewportEl!;
  const r = el.getBoundingClientRect();
  const v = vp.getBoundingClientRect();
  return vp.scrollTop + (r.top - v.top);
}

function scrollViewportTo(store: ScrollerStore, top: number, behavior: ScrollBehavior) {
  const vp = store.viewportEl;
  if (!vp) return false;
  vp.scrollTo({ top: Math.max(0, Math.round(top)), behavior });
  return true;
}

function anchorItem(store: ScrollerStore, id: string, behavior: ScrollBehavior = "auto") {
  const entry = store.items.get(id);
  if (!entry) return false;
  const top = itemTop(store, entry.el);
  store.lastAnchorTop = top;
  updateSpacer(store);
  return scrollViewportTo(store, top - store.opts.scrollPreviousItemPeek, behavior);
}

function applyInitial(store: ScrollerStore) {
  if (store.appliedInitial || !store.viewportEl || store.order.length === 0) return;
  const pos = store.opts.defaultScrollPosition;
  store.viewportEl.removeAttribute("data-pending-scroll");
  if (pos === "start") {
    store.viewportEl.scrollTop = 0;
  } else if (pos === "end") {
    scrollViewportTo(store, store.viewportEl.scrollHeight, "auto");
  } else {
    const anchors = store.order.filter((oid) => store.items.get(oid)?.anchor);
    const last = anchors[anchors.length - 1];
    const vp = store.viewportEl;
    if (last && vp.scrollHeight - vp.clientHeight > store.opts.scrollEdgeThreshold) {
      anchorItem(store, last, "auto");
    } else {
      scrollViewportTo(store, vp.scrollHeight, "auto");
    }
  }
  store.appliedInitial = true;
  refreshScrollable(store);
}

function markAutoscrolling(store: ScrollerStore) {
  store.autoscrolling = true;
  setAttrs(store);
  if (store.autoTimer) clearTimeout(store.autoTimer);
  store.autoTimer = setTimeout(() => {
    store.autoscrolling = false;
    setAttrs(store);
    emit(store);
  }, 600);
}

// ─────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────

const ScrollerContext = React.createContext<ScrollerStore | null>(null);

function useStore() {
  const store = React.useContext(ScrollerContext);
  if (!store) throw new Error("MessageScroller parts must be used inside <MessageScrollerProvider>.");
  return store;
}

// ─────────────────────────────────────────────────────────────
// Provider (headless root — renders no DOM)
// ─────────────────────────────────────────────────────────────

export interface MessageScrollerProviderProps {
  children?: React.ReactNode;
  /** Follow new content only while the reader is at the live edge. @default false */
  autoScroll?: boolean;
  /** Opening position on first non-empty render. @default "end" */
  defaultScrollPosition?: MessageScrollerPosition;
  /** Distance from either edge that counts as at the edge. @default 8 */
  scrollEdgeThreshold?: number;
  /** Margin on the aligned edge for jumps and visibility. @default 0 */
  scrollMargin?: number;
  /** Previous-item peek kept above a newly anchored row. @default 64 */
  scrollPreviousItemPeek?: number;
}

function MessageScrollerProvider({
  children,
  autoScroll = false,
  defaultScrollPosition = "end",
  scrollEdgeThreshold = 8,
  scrollMargin = 0,
  scrollPreviousItemPeek = 64,
}: MessageScrollerProviderProps) {
  const ref = React.useRef<ScrollerStore | null>(null);
  if (!ref.current) {
    ref.current = createStore({ autoScroll, defaultScrollPosition, scrollEdgeThreshold, scrollMargin, scrollPreviousItemPeek });
  } else {
    Object.assign(ref.current.opts, { autoScroll, defaultScrollPosition, scrollEdgeThreshold, scrollMargin, scrollPreviousItemPeek });
  }
  React.useEffect(() => () => {
    const s = ref.current!;
    if (s.autoTimer) clearTimeout(s.autoTimer);
    s.ro?.disconnect();
    s.io?.disconnect();
  }, []);
  return <ScrollerContext.Provider value={ref.current}>{children}</ScrollerContext.Provider>;
}

// ─────────────────────────────────────────────────────────────
// Root (styled frame)
// ─────────────────────────────────────────────────────────────

function MessageScroller({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const store = useStore();
  return (
    <div
      ref={(node) => {
        store.rootEl = node;
      }}
      data-slot="message-scroller"
      className={cn("relative flex min-h-0 flex-1 flex-col overflow-hidden", className)}
      {...props}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// Viewport (scroll engine lives here)
// ─────────────────────────────────────────────────────────────

export interface MessageScrollerViewportProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Keep the first visible row stable when older rows prepend. @default true */
  preserveScrollOnPrepend?: boolean;
}

function MessageScrollerViewport({
  preserveScrollOnPrepend = true,
  className,
  children,
  onScroll,
  ...props
}: MessageScrollerViewportProps) {
  const store = useStore();

  React.useEffect(() => {
    const vp = store.viewportEl;
    if (!vp) return;

    // Open hidden until the initial position lands (end / last-anchor only).
    if (!store.appliedInitial && store.opts.defaultScrollPosition !== "start" && store.order.length > 0) {
      vp.setAttribute("data-pending-scroll", "");
    }

    const onScrollNative = () => refreshScrollable(store);
    vp.addEventListener("scroll", onScrollNative, { passive: true });

    // Follow streamed output while the reader is at the live edge.
    const content = store.contentEl;
    let lastHeight = content?.scrollHeight ?? 0;
    const ro = new ResizeObserver(() => {
      if (!store.contentEl || !store.viewportEl) return;
      const next = store.contentEl.scrollHeight;
      const grew = next - lastHeight;
      lastHeight = next;
      if (grew <= 0) return;
      if (store.opts.autoScroll && store.following) {
        markAutoscrolling(store);
        scrollViewportTo(store, store.viewportEl.scrollHeight, "auto");
      }
      updateSpacer(store);
    });
    if (content) ro.observe(content);
    store.ro = ro;

    // Preserve the reading position when history prepends above:
    // shift by the scroll-height delta while the reader is off the top.
    const preHeight = { value: content?.scrollHeight ?? 0 };
    const mo2 = new MutationObserver(() => {
      if (!preserveScrollOnPrepend || !store.viewportEl || !store.contentEl) return;
      const now = store.contentEl.scrollHeight;
      const delta = now - preHeight.value;
      preHeight.value = now;
      if (delta > 0 && store.viewportEl.scrollTop > store.opts.scrollEdgeThreshold) {
        store.viewportEl.scrollTop += delta;
      }
    });
    if (content) mo2.observe(content, { childList: true });

    refreshScrollable(store);
    applyInitial(store);

    const onScrollEnd = () => {
      updateSpacer(store);
      refreshScrollable(store);
    };
    vp.addEventListener("scrollend", onScrollEnd);

    return () => {
      vp.removeEventListener("scroll", onScrollNative);
      vp.removeEventListener("scrollend", onScrollEnd);
      ro.disconnect();
      mo2.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={(node) => {
        store.viewportEl = node;
      }}
      data-slot="message-scroller-viewport"
      role={props.role ?? "region"}
      aria-label={props["aria-label"] ?? "Messages"}
      tabIndex={props.tabIndex ?? 0}
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset data-[pending-scroll]:invisible",
        className
      )}
      onScroll={(e) => {
        onScroll?.(e);
      }}
      {...props}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Content
// ─────────────────────────────────────────────────────────────

export interface MessageScrollerContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Class name for the internal spacer that makes room for anchored rows. */
  spacerClassName?: string;
}

function MessageScrollerContent({ spacerClassName, className, children, ...props }: MessageScrollerContentProps) {
  const store = useStore();
  return (
    <div
      ref={(node) => {
        store.contentEl = node;
      }}
      data-slot="message-scroller-content"
      role={props.role ?? "log"}
      aria-relevant={props["aria-relevant"] ?? "additions"}
      className={cn("flex min-h-full flex-col gap-4 p-4", className)}
      {...props}
    >
      {children}
      <div
        ref={(node) => {
          store.spacerEl = node;
        }}
        data-slot="message-scroller-spacer"
        aria-hidden
        style={{ height: 0 }}
        className={spacerClassName}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Item
// ─────────────────────────────────────────────────────────────

export interface MessageScrollerItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Stable row id for jumps, visibility, and prepend preservation. */
  messageId?: string;
  /** Turn boundary that can anchor newly appended turns. @default false */
  scrollAnchor?: boolean;
}

function MessageScrollerItem({ messageId, scrollAnchor = false, className, children, ...props }: MessageScrollerItemProps) {
  const store = useStore();
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (messageId) {
      store.items.set(messageId, { el, anchor: scrollAnchor });
      if (!store.order.includes(messageId)) store.order.push(messageId);
    }

    // Queued jump target just mounted.
    if (messageId && store.pendingTarget?.id === messageId) {
      const t = store.pendingTarget;
      store.pendingTarget = null;
      scrollToId(store, t.id, t);
    }

    // First non-empty render: settle the opening position.
    if (!store.appliedInitial && store.order.length > 0) {
      if (store.opts.defaultScrollPosition !== "start" && store.viewportEl) {
        store.viewportEl.setAttribute("data-pending-scroll", "");
      }
      applyInitial(store);
    } else if (store.appliedInitial && scrollAnchor && messageId) {
      // A new anchor appended mid-session: settle it near the top when the
      // reader is already following the thread.
      const isLast = store.order[store.order.length - 1] === messageId;
      if (isLast && (store.following || store.atEnd)) {
        anchorItem(store, messageId, "auto");
        refreshScrollable(store);
      }
    }

    attachVisibility(store);

    return () => {
      if (messageId) {
        store.items.delete(messageId);
        store.order = store.order.filter((oid) => oid !== messageId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageId, scrollAnchor]);

  return (
    <div
      ref={ref}
      data-slot="message-scroller-item"
      data-message-id={messageId}
      data-scroll-anchor={scrollAnchor}
      className={cn("[content-visibility:auto] [contain-intrinsic-size:auto_72px]", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Button
// ─────────────────────────────────────────────────────────────

export interface MessageScrollerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Transcript edge the button scrolls toward. @default "end" */
  direction?: "start" | "end";
  /** Native scroll behavior. @default "smooth" */
  behavior?: ScrollBehavior;
  /** Render as a different element. */
  render?: React.ReactElement | ((props: React.ButtonHTMLAttributes<HTMLButtonElement>) => React.ReactElement);
}

function MessageScrollerButton({ direction = "end", behavior = "smooth", render, className, children, onClick, ...props }: MessageScrollerButtonProps) {
  const store = useStore();
  const [, force] = React.useReducer((v: number) => v + 1, 0);

  React.useEffect(() => {
    const listener = () => force();
    store.listeners.add(listener);
    return () => {
      store.listeners.delete(listener);
    };
  }, [store]);

  const canScroll = direction === "end" ? store.atEnd === false : store.atStart === false;
  const Icon = direction === "end" ? ArrowDown : ArrowUp;

  const buttonProps = {
    type: "button" as const,
    "data-slot": "message-scroller-button",
    "data-direction": direction,
    "data-active": canScroll,
    inert: !canScroll,
    tabIndex: canScroll ? 0 : -1,
    "aria-label": props["aria-label"] ?? (direction === "end" ? "Scroll to latest" : "Scroll to start"),
    className: cn(
      "absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs font-medium shadow-md transition-opacity outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/40 data-[active=false]:pointer-events-none data-[active=false]:opacity-0",
      className
    ),
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;
      if (direction === "end") {
        if (store.opts.autoScroll) {
          store.following = true;
          markAutoscrolling(store);
        }
        scrollToEndImpl(store, { behavior });
      } else {
        store.following = false;
        scrollToStartImpl(store, { behavior });
      }
      refreshScrollable(store);
    },
    ...props,
  } as React.ButtonHTMLAttributes<HTMLButtonElement> & { "data-slot": string };

  const content = children ?? (
    <>
      <Icon className="size-3.5" />
      <span>{direction === "end" ? "Jump to latest" : "Back to start"}</span>
    </>
  );

  if (render) {
    if (React.isValidElement(render)) {
      const element = render as React.ReactElement<{ className?: string; children?: React.ReactNode }>;
      return React.cloneElement(element, {
        ...buttonProps,
        ...element.props,
        className: cn(buttonProps.className, element.props.className),
        children: content,
      });
    }
    return render({ ...buttonProps, children: content });
  }
  return <button {...buttonProps}>{content}</button>;
}

// ─────────────────────────────────────────────────────────────
// Commands
// ─────────────────────────────────────────────────────────────

function scrollToId(
  store: ScrollerStore,
  id: string,
  opts: { align: ScrollToAlign; behavior: ScrollBehavior; scrollMargin: number }
): boolean {
  const entry = store.items.get(id);
  if (!entry || !store.viewportEl) {
    // Queue for client-resolved targets mounting shortly.
    store.pendingTarget = { id, ...opts };
    return false;
  }
  const vp = store.viewportEl;
  const margin = opts.scrollMargin ?? store.opts.scrollMargin;
  const top = itemTop(store, entry.el);
  const height = entry.el.getBoundingClientRect().height;
  let dest = top;
  if (opts.align === "end") dest = top + height - vp.clientHeight + margin;
  else if (opts.align === "center") dest = top + height / 2 - vp.clientHeight / 2;
  else if (opts.align === "nearest") {
    const cur = vp.scrollTop;
    const startDest = top - margin;
    const endDest = top + height - vp.clientHeight + margin;
    dest = Math.abs(startDest - cur) <= Math.abs(endDest - cur) ? startDest : endDest;
    if (top - margin >= cur && top + height + margin <= cur + vp.clientHeight) return true;
  } else dest = top - margin;
  store.following = false;
  return scrollViewportTo(store, dest, opts.behavior);
}

function scrollToEndImpl(store: ScrollerStore, opts?: { behavior?: ScrollBehavior }): boolean {
  if (!store.viewportEl) return false;
  markAutoscrolling(store);
  return scrollViewportTo(store, store.viewportEl.scrollHeight, opts?.behavior ?? "auto");
}

function scrollToStartImpl(store: ScrollerStore, opts?: { behavior?: ScrollBehavior }): boolean {
  store.following = false;
  return scrollViewportTo(store, 0, opts?.behavior ?? "auto");
}

function useControls(): MessageScrollerControls {
  const store = useStore();
  return React.useMemo(
    () => ({
      scrollToMessage: (messageId, options) =>
        scrollToId(store, messageId, {
          align: options?.align ?? "start",
          behavior: options?.behavior ?? "auto",
          scrollMargin: options?.scrollMargin ?? store.opts.scrollMargin,
        }),
      scrollToEnd: (options) => {
        if (store.opts.autoScroll) {
          store.following = true;
          markAutoscrolling(store);
        }
        return scrollToEndImpl(store, options);
      },
      scrollToStart: (options) => scrollToStartImpl(store, options),
    }),
    [store]
  );
}

function useMessageScroller(): MessageScrollerControls {
  return useControls();
}

function subscribeVisible(store: ScrollerStore, onChange: () => void): () => void {
  store.listeners.add(onChange);
  return () => {
    store.listeners.delete(onChange);
  };
}

function useMessageScrollerScrollable(): ScrollableState {
  const store = useStore();
  const snapshot = React.useSyncExternalStore(
    (cb) => subscribeVisible(store, cb),
    () => store.version,
    () => store.version
  );
  void snapshot;
  return { start: store.atStart === false, end: store.atEnd === false };
}

// Visibility engine (pay-for-what-you-use: only while subscribed).
function attachVisibility(store: ScrollerStore) {
  if (store.io || store.visibilitySubs <= 0 || !store.viewportEl) return;
  const vp = store.viewportEl;
  store.io = new IntersectionObserver(
    (entries) => {
      let changed = false;
      const visible = new Set(store.visibility.visibleMessageIds);
      for (const entry of entries) {
        const id = (entry.target as HTMLElement).dataset.messageId;
        if (!id) continue;
        if (entry.isIntersecting) {
          if (!visible.has(id)) {
            visible.add(id);
            changed = true;
          }
        } else if (visible.delete(id)) {
          changed = true;
        }
      }
      if (!changed) return;
      const ordered = store.order.filter((oid) => visible.has(oid));
      // Current anchor: last anchor at/above the reading line.
      const line = vp.scrollTop + 80;
      let current: string | null = null;
      for (const oid of store.order) {
        const item = store.items.get(oid);
        if (!item?.anchor) continue;
        if (itemTop(store, item.el) <= line) current = oid;
        else break;
      }
      store.visibility = { currentAnchorId: current, visibleMessageIds: ordered };
      store.visibilityVersion += 1;
      emit(store);
    },
    { root: vp, threshold: 0 }
  );
  store.items.forEach((item) => {
    if (item.el) store.io!.observe(item.el);
  });
}

function useMessageScrollerVisibility(): VisibilityState {
  const store = useStore();
  React.useEffect(() => {
    store.visibilitySubs += 1;
    attachVisibility(store);
    // Observe items that mounted before subscribing.
    if (store.io) {
      store.items.forEach((item) => {
        try {
          store.io!.observe(item.el);
        } catch {
          /* already observed */
        }
      });
    }
    return () => {
      store.visibilitySubs -= 1;
      if (store.visibilitySubs <= 0) {
        store.io?.disconnect();
        store.io = null;
      }
    };
  }, [store]);
  const snapshot = React.useSyncExternalStore(
    (cb) => subscribeVisible(store, cb),
    () => store.version + store.visibilityVersion,
    () => store.version + store.visibilityVersion
  );
  void snapshot;
  return store.visibility;
}

export {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
  useMessageScroller,
  useMessageScrollerScrollable,
  useMessageScrollerVisibility,
};

export default MessageScrollerProvider;
