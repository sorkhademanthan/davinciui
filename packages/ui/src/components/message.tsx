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
  /** Row alignment in the conversation. @default "start" */
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
        className={cn("flex w-full gap-2", align === "end" && "flex-row-reverse", className)}
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
  return (
    <div
      data-slot="message-content"
      className={cn("flex min-w-0 flex-1 flex-col gap-1", className)}
      {...props}
    />
  );
}

function MessageHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="message-header"
      className={cn("self-start text-xs font-medium text-muted-foreground", className)}
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
        "flex items-center gap-1 text-xs text-muted-foreground",
        align === "end" ? "justify-end text-end" : "justify-start",
        className
      )}
      {...props}
    />
  );
}

export { Message, MessageGroup, MessageAvatar, MessageContent, MessageHeader, MessageFooter };

export default Message;
