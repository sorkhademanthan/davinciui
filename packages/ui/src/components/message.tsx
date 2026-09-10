"use client";

import { cn } from "@workspace/ui/lib/utils";
import * as React from "react";

export type MessageAlign = "start" | "end";

interface MessageContextValue {
  align: MessageAlign;
  footerHeight: number;
  setFooterNode: (node: HTMLDivElement | null) => void;
}

const MessageContext = React.createContext<MessageContextValue>({
  align: "start",
  footerHeight: 0,
  setFooterNode: () => {},
});

export interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Row alignment. End mirrors the row and docks bubbles, header, footer, and actions to the right. @default "start" */
  align?: MessageAlign;
}

function Message({ align = "start", className, children, ...props }: MessageProps) {
  const [footerEl, setFooterEl] = React.useState<HTMLDivElement | null>(null);
  const [footerHeight, setFooterHeight] = React.useState(0);

  // Keep the avatar aligned with the message surface: measure the footer
  // and lift the avatar by exactly that amount, whatever it wraps to.
  React.useLayoutEffect(() => {
    if (!footerEl) {
      setFooterHeight(0);
      return;
    }
    const measure = () => {
      const next = Math.ceil(footerEl.getBoundingClientRect().height);
      setFooterHeight((prev) => (prev === next ? prev : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(footerEl);
    return () => ro.disconnect();
  }, [footerEl]);

  const setFooterNode = React.useCallback((node: HTMLDivElement | null) => {
    setFooterEl(node);
  }, []);

  return (
    <MessageContext.Provider value={{ align, footerHeight, setFooterNode }}>
      <div
        data-slot="message"
        data-align={align}
        className={cn(
          "group/message flex w-full scroll-mt-4 gap-2",
          align === "end" && "flex-row-reverse",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </MessageContext.Provider>
  );
}

function MessageGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="message-group" className={cn("flex w-full flex-col gap-1", className)} {...props} />
  );
}

function MessageAvatar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { footerHeight } = React.useContext(MessageContext);
  return (
    <div
      data-slot="message-avatar"
      className={cn("flex shrink-0 flex-col justify-end", className)}
      style={{ marginBottom: footerHeight || undefined }}
      {...props}
    />
  );
}

function MessageContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { align } = React.useContext(MessageContext);
  return (
    <div
      data-slot="message-content"
      className={cn(
        "flex min-w-0 flex-1 flex-col gap-1",
        // End rows dock their surfaces to the right: bubbles (and grouped
        // bubbles) justify to the end, anything else hugs the edge.
        align === "end" && "items-end [&_[data-slot=bubble]]:justify-end",
        className
      )}
      {...props}
    />
  );
}

function MessageHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { align } = React.useContext(MessageContext);
  return (
    <div
      data-slot="message-header"
      className={cn(
        "flex items-center gap-1.5 text-xs font-medium text-muted-foreground select-none",
        align === "end" ? "self-end text-end" : "self-start",
        className
      )}
      {...props}
    />
  );
}

function MessageFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { align, setFooterNode } = React.useContext(MessageContext);
  return (
    <div
      ref={setFooterNode}
      data-slot="message-footer"
      className={cn(
        "flex min-h-6 items-center gap-1 text-xs text-muted-foreground empty:hidden",
        align === "end" ? "justify-end text-end" : "justify-start",
        className
      )}
      {...props}
    />
  );
}

function MessageActions({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { align } = React.useContext(MessageContext);
  return (
    <div
      data-slot="message-actions"
      className={cn(
        "flex items-center gap-0.5",
        align === "end" ? "justify-end" : "justify-start",
        // Hover-reveal like premium chat apps: visible on row hover,
        // keyboard focus, touch devices, and reduced-motion-safe.
        "opacity-0 transition-opacity duration-150 ease-out motion-reduce:transition-none",
        "group-hover/message:opacity-100 group-focus-within/message:opacity-100 focus-within:opacity-100",
        "[@media(hover:none)]:opacity-100",
        className
      )}
      {...props}
    />
  );
}

function MessageTime({ className, ...props }: React.TimeHTMLAttributes<HTMLElement>) {
  return (
    <time
      data-slot="message-time"
      className={cn(
        "shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground/70 select-none",
        className
      )}
      {...props}
    />
  );
}

export { Message, MessageGroup, MessageAvatar, MessageContent, MessageHeader, MessageFooter, MessageActions, MessageTime };

export default Message;
