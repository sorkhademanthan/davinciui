"use client";

import * as React from "react";
import { Send } from "lucide-react";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
  useMessageScrollerFollowing,
  useMessageScrollerScrollable,
  useMessageScrollerVisibility,
  type MessageScrollerPosition,
} from "@workspace/ui/components/message-scroller";
import { Bubble, BubbleContent } from "@workspace/ui/components/bubble";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

let seq = 0;
const nid = (prefix: string) => `${prefix}-${Date.now()}-${(seq += 1)}`;

const ASSISTANT_REPLIES = [
  "That's the classic streaming scroll problem. The viewport pins to the live edge while you stay there, and backs off the moment you scroll up.",
  "Anchoring settles your new turn near the top with a peek of the previous reply, so the thread never feels detached.",
  "History prepends above without moving your place, and you can jump to any message by id.",
];

function useScriptedChat(seed: ChatMessage[]) {
  const [messages, setMessages] = React.useState<ChatMessage[]>(seed);
  const [draft, setDraft] = React.useState("");
  const [streaming, setStreaming] = React.useState(false);
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  const send = React.useCallback(
    (text: string) => {
      const clean = text.trim();
      if (!clean || streaming) return;
      const userId = nid("user");
      const replyId = nid("assistant");
      const reply = ASSISTANT_REPLIES[messages.length % ASSISTANT_REPLIES.length] ?? ASSISTANT_REPLIES[0] ?? "";
      setMessages((prev) => [...prev, { id: userId, role: "user", text: clean }]);
      setDraft("");
      setStreaming(true);
      const words = reply.split(" ");
      let shown = 0;
      setMessages((prev) => [...prev, { id: replyId, role: "assistant", text: "" }]);
      const tick = () => {
        shown += 1;
        const done = shown >= words.length;
        setMessages((prev) => prev.map((m) => (m.id === replyId ? { ...m, text: words.slice(0, shown).join(" ") } : m)));
        if (done) setStreaming(false);
        else timers.current.push(setTimeout(tick, 40));
      };
      timers.current.push(setTimeout(tick, 300));
    },
    [messages.length, streaming]
  );

  React.useEffect(() => () => timers.current.forEach(clearTimeout), []);

  return { messages, setMessages, draft, setDraft, send, streaming };
}

function ChatRow({ message }: { message: ChatMessage }) {
  return (
    <Bubble variant={message.role === "user" ? "default" : "secondary"} align={message.role === "user" ? "end" : "start"}>
      <BubbleContent>{message.text || "…"}</BubbleContent>
    </Bubble>
  );
}

function Composer({
  draft,
  setDraft,
  send,
  streaming,
}: {
  draft: string;
  setDraft: (v: string) => void;
  send: (text: string) => void;
  streaming: boolean;
}) {
  return (
    <form
      className="flex shrink-0 items-center gap-2 border-t bg-background p-3"
      onSubmit={(e) => {
        e.preventDefault();
        send(draft);
      }}
    >
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Type a message…"
        aria-label="Type a message"
        className="h-9 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring/40"
      />
      <button
        type="submit"
        disabled={streaming}
        aria-label="Send message"
        className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        <Send className="size-4" />
      </button>
    </form>
  );
}

function Frame({ children, readout }: { children: React.ReactNode; readout?: string }) {
  return (
    <div className="flex min-h-[480px] w-full flex-col items-center justify-center gap-3 overflow-auto bg-background p-6">
      <div className="flex h-[420px] w-full max-w-md flex-col overflow-hidden rounded-xl border bg-card shadow-sm">{children}</div>
      {readout !== undefined && (
        <p className="font-mono text-xs text-muted-foreground" aria-live="polite">
          {readout}
        </p>
      )}
    </div>
  );
}

const SEED: ChatMessage[] = [
  { id: "seed-1", role: "user", text: "Morning! Every time the AI streams a reply, the whole thread jumps around." },
  { id: "seed-2", role: "assistant", text: "Wrap the list in a MessageScroller with autoScroll. It pins to the live edge while you stay there, and holds your place the moment you scroll up." },
];

export function MessageScrollerBasicPreview() {
  const chat = useScriptedChat(SEED);
  return (
    <Frame readout="autoScroll follows the live edge · scroll up to release it">
      <MessageScrollerProvider autoScroll>
        <MessageScroller>
          <MessageScrollerViewport>
            <MessageScrollerContent>
              {chat.messages.map((m) => (
                <MessageScrollerItem key={m.id} messageId={m.id} scrollAnchor={m.role === "user"}>
                  <ChatRow message={m} />
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
        <Composer {...chat} />
      </MessageScrollerProvider>
    </Frame>
  );
}

export function MessageScrollerPeekPreview() {
  const chat = useScriptedChat(SEED);
  const [peek, setPeek] = React.useState(64);
  return (
    <Frame readout={`scrollPreviousItemPeek: ${peek}px — send and watch the previous reply`}>
      <MessageScrollerProvider key={peek} autoScroll scrollPreviousItemPeek={peek}>
        <MessageScroller>
          <MessageScrollerViewport>
            <MessageScrollerContent>
              {chat.messages.map((m) => (
                <MessageScrollerItem key={m.id} messageId={m.id} scrollAnchor={m.role === "user"}>
                  <ChatRow message={m} />
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
        <div className="flex shrink-0 items-center gap-3 border-t bg-background px-4 py-2.5">
          <input
            type="range"
            min={0}
            max={160}
            step={16}
            value={peek}
            onChange={(e) => setPeek(Number(e.target.value))}
            aria-label="Previous item peek"
            className="flex-1"
          />
          <span className="w-14 text-right font-mono text-xs text-muted-foreground">{peek}px</span>
        </div>
        <Composer {...chat} />
      </MessageScrollerProvider>
    </Frame>
  );
}

const SAVED: ChatMessage[] = [
  { id: "saved-1", role: "user", text: "Workspace creation rose 8%, but first invite completion only rose 2%." },
  { id: "saved-2", role: "assistant", text: "Start with the invite step. Teams create workspaces but wait to add collaborators." },
  { id: "saved-3", role: "user", text: "What should we compare before changing onboarding?" },
  { id: "saved-4", role: "assistant", text: "Compare template users, blank workspaces, and invite skippers on 24-hour return." },
  { id: "saved-5", role: "user", text: "Turn that into an experiment." },
  { id: "saved-6", role: "assistant", text: "Variant: short checklist after workspace creation. Measure first-invite completion and second-project creation." },
];

export function MessageScrollerOpenPreview() {
  const [position, setPosition] = React.useState<MessageScrollerPosition>("last-anchor");
  return (
    <Frame readout={`defaultScrollPosition: ${position}`}>
      <MessageScrollerProvider key={position} defaultScrollPosition={position}>
        <MessageScroller>
          <MessageScrollerViewport>
            <MessageScrollerContent>
              {SAVED.map((m) => (
                <MessageScrollerItem key={m.id} messageId={m.id} scrollAnchor={m.role === "user"}>
                  <ChatRow message={m} />
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
        <div className="flex shrink-0 items-center justify-center gap-1 border-t bg-background p-2.5" role="group" aria-label="Opening position">
          {(["start", "end", "last-anchor"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPosition(p)}
              aria-pressed={position === p}
              className="rounded-md px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:bg-accent aria-pressed:bg-primary aria-pressed:text-primary-foreground"
            >
              {p}
            </button>
          ))}
        </div>
      </MessageScrollerProvider>
    </Frame>
  );
}

const HISTORY_SEED: ChatMessage[] = [
  { id: "h-5", role: "user", text: "Do we need to roll back?" },
  { id: "h-6", role: "assistant", text: "Not yet. Queue depth is recovering and the oldest pending job is under five minutes old." },
];

const EARLIER: ChatMessage[] = [
  { id: "h-1", role: "user", text: "Only the export queue worker changed in this deploy." },
  { id: "h-2", role: "assistant", text: "The app deploy did not include checkout, pricing, or billing changes." },
  { id: "h-3", role: "user", text: "Keep watching for customer-visible issues." },
  { id: "h-4", role: "assistant", text: "Watching the queue and support tags for another 15 minutes." },
];

export function MessageScrollerHistoryPreview() {
  const [messages, setMessages] = React.useState(HISTORY_SEED);
  const [loaded, setLoaded] = React.useState(false);
  return (
    <Frame readout={loaded ? "history prepended — your place held" : "press Load earlier, scrolled mid-thread"}>
      <MessageScrollerProvider>
        <MessageScroller>
          <MessageScrollerViewport>
            <MessageScrollerContent>
              {messages.map((m) => (
                <MessageScrollerItem key={m.id} messageId={m.id} scrollAnchor={m.role === "user"}>
                  <ChatRow message={m} />
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
        <div className="shrink-0 border-t bg-background p-3">
          <button
            type="button"
            disabled={loaded}
            onClick={() => {
              setMessages((prev) => [...EARLIER, ...prev]);
              setLoaded(true);
            }}
            className="h-9 w-full rounded-md border bg-background text-sm font-medium shadow-xs transition-colors hover:bg-accent disabled:opacity-50"
          >
            {loaded ? "History loaded" : "Load earlier messages"}
          </button>
        </div>
      </MessageScrollerProvider>
    </Frame>
  );
}

function JumpControls({ ids }: { ids: string[] }) {
  const { scrollToMessage, scrollToEnd, scrollToStart } = useMessageScroller();
  const [target, setTarget] = React.useState(ids[0] ?? "");
  const [result, setResult] = React.useState<string | null>(null);
  React.useEffect(() => setTarget(ids[0] ?? ""), [ids]);
  return (
    <div className="flex shrink-0 flex-col gap-2 border-t bg-background p-3">
      <div className="flex items-center gap-2">
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          aria-label="Jump to message"
          className="h-9 min-w-0 flex-1 rounded-md border bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          {ids.map((id, i) => (
            <option key={id} value={id}>
              Message {i + 1} · {id}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setResult(scrollToMessage(target, { align: "start", behavior: "smooth" }) ? `jumped to ${target}` : `queued ${target}`)}
          className="h-9 shrink-0 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90"
        >
          Jump
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => scrollToStart({ behavior: "smooth" })}
          className="h-8 flex-1 rounded-md border text-xs font-medium hover:bg-accent"
        >
          Scroll to start
        </button>
        <button
          type="button"
          onClick={() => scrollToEnd({ behavior: "smooth" })}
          className="h-8 flex-1 rounded-md border text-xs font-medium hover:bg-accent"
        >
          Scroll to end
        </button>
      </div>
      {result ? (
        <p className="font-mono text-[11px] text-muted-foreground" aria-live="polite">
          {result}
        </p>
      ) : null}
    </div>
  );
}

export function MessageScrollerJumpPreview() {
  const chat = useScriptedChat(SAVED.slice(0, 4));
  return (
    <Frame readout="driven from outside the frame via useMessageScroller">
      <MessageScrollerProvider>
        <MessageScroller>
          <MessageScrollerViewport>
            <MessageScrollerContent>
              {chat.messages.map((m) => (
                <MessageScrollerItem key={m.id} messageId={m.id} scrollAnchor={m.role === "user"}>
                  <ChatRow message={m} />
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
        <JumpControls ids={chat.messages.map((m) => m.id)} />
        <Composer {...chat} />
      </MessageScrollerProvider>
    </Frame>
  );
}

function OutlinePanel() {
  const { currentAnchorId, visibleMessageIds } = useMessageScrollerVisibility();
  const { scrollToMessage } = useMessageScroller();
  const anchors = visibleMessageIds;
  return (
    <div className="flex max-h-28 shrink-0 flex-col gap-1 overflow-y-auto border-t bg-background p-3 text-xs">
      <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Outline · anchor: {currentAnchorId ?? "—"}</p>
      {anchors.length === 0 ? (
        <p className="text-muted-foreground">Nothing visible yet.</p>
      ) : (
        anchors.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => scrollToMessage(id, { behavior: "smooth" })}
            className="truncate rounded px-1.5 py-1 text-left font-mono hover:bg-accent"
          >
            {id === currentAnchorId ? "● " : "○ "}{id}
          </button>
        ))
      )}
    </div>
  );
}

export function MessageScrollerVisibilityPreview() {
  const chat = useScriptedChat(SAVED);
  return (
    <Frame readout="outline highlights the current anchored turn as you read">
      <MessageScrollerProvider>
        <MessageScroller>
          <MessageScrollerViewport>
            <MessageScrollerContent>
              {chat.messages.map((m) => (
                <MessageScrollerItem key={m.id} messageId={m.id} scrollAnchor={m.role === "user"}>
                  <ChatRow message={m} />
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
        <OutlinePanel />
      </MessageScrollerProvider>
    </Frame>
  );
}

function ScrollStatusFooter() {
  const { start, end } = useMessageScrollerScrollable();
  return (
    <p className="shrink-0 border-t bg-background px-4 py-2.5 text-center font-mono text-[11px] text-muted-foreground" aria-live="polite">
      {!start && !end ? "All messages fit in the viewport." : !start ? "At the first message — scroll down for more." : !end ? "At the latest message." : "Mid-thread — both directions available."}
    </p>
  );
}

function FollowingBadge() {
  const following = useMessageScrollerFollowing();
  return (
    <div className="flex shrink-0 items-center justify-between border-t bg-background px-4 py-2.5" aria-live="polite">
      <span className="font-mono text-[11px] text-muted-foreground">live edge</span>
      {following ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:animate-none" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
          </span>
          LIVE
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          paused — scroll down to resume
        </span>
      )}
    </div>
  );
}

export function MessageScrollerFollowingPreview() {
  const chat = useScriptedChat(SEED);
  return (
    <Frame readout="scroll up to pause · Jump to latest resumes">
      <MessageScrollerProvider autoScroll>
        <MessageScroller>
          <MessageScrollerViewport>
            <MessageScrollerContent>
              {chat.messages.map((m) => (
                <MessageScrollerItem key={m.id} messageId={m.id} scrollAnchor={m.role === "user"}>
                  <ChatRow message={m} />
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
        <FollowingBadge />
        <Composer {...chat} />
      </MessageScrollerProvider>
    </Frame>
  );
}

export function MessageScrollerScrollStatePreview() {
  const long = React.useMemo<ChatMessage[]>(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: `checkpoint-${i + 1}`,
        role: i % 2 === 0 ? "user" : "assistant",
        text: i % 2 === 0 ? `Review scroll checkpoint ${i + 1}.` : `Checkpoint ${i + 1} is synced. The scrollable hook updates as the viewport moves.`,
      })) as ChatMessage[],
    []
  );
  return (
    <Frame readout="useMessageScrollerScrollable in JavaScript — data-scrollable in CSS">
      <MessageScrollerProvider>
        <MessageScroller>
          <MessageScrollerViewport>
            <MessageScrollerContent>
              {long.map((m) => (
                <MessageScrollerItem key={m.id} messageId={m.id} scrollAnchor={m.role === "user"}>
                  <ChatRow message={m} />
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
        <ScrollStatusFooter />
      </MessageScrollerProvider>
    </Frame>
  );
}
