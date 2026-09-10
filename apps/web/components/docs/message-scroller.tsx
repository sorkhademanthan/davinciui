import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  MessageScrollerBasicPreview,
  MessageScrollerFollowingPreview,
  MessageScrollerHistoryPreview,
  MessageScrollerJumpPreview,
  MessageScrollerOpenPreview,
  MessageScrollerPeekPreview,
  MessageScrollerScrollStatePreview,
  MessageScrollerVisibilityPreview,
} from "@/components/docs/previews/message-scroller-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"`;
const defaultCode = `import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"

export function Chat({ messages }: { messages: { id: string; role: string }[] }) {
  return (
    <MessageScrollerProvider autoScroll>
      <MessageScroller>
        <MessageScrollerViewport>
          <MessageScrollerContent>
            {messages.map((message) => (
              <MessageScrollerItem
                key={message.id}
                messageId={message.id}
                scrollAnchor={message.role === "user"}
              >
                {/* your message UI */}
              </MessageScrollerItem>
            ))}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  )
}`;

export async function MessageScrollerDocs() {
  const sourceCode =
    (await readComponentSource("message-scroller")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Message Scroller"
      description="A chat scroll container that anchors turns, follows streamed replies, holds your place as history loads, and jumps to any message."
      preview={<MessageScrollerBasicPreview />}
      previewCode={defaultCode}
      installPackageName="message-scroller"
      installDependencies="lucide-react"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/message-scroller.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      usageNote={
        <div className="space-y-3">
          <p className="text-sm leading-6 text-muted-foreground">
            The provider owns scroll state and behavior; the scroller fills its parent, so place it in a
            height-constrained layout. It never owns messages, transport, or persistence — compose your own rows,
            markers, and inputs inside. Scroll position, anchoring, and follow-output are tracked imperatively and
            mirrored through <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">data-*</code> attributes,
            so scrolling never rerenders your rows.
          </p>
          <pre className="overflow-x-auto rounded-lg border bg-muted/30 p-4 font-mono text-xs leading-6">
{`MessageScrollerProvider
└── MessageScroller
    ├── MessageScrollerViewport
    │   └── MessageScrollerContent
    │       └── MessageScrollerItem
    └── MessageScrollerButton`}
          </pre>
        </div>
      }
      examples={[
        {
          title: "Anchoring Turns",
          preview: <MessageScrollerBasicPreview />,
          code: `import { MessageScrollerItem } from "@/components/ui/message-scroller"

// Mark the row that starts a turn. When a new anchor
// appends, it settles near the top with a peek above it.
<MessageScrollerItem messageId={message.id} scrollAnchor={message.role === "user"}>
  {/* message */}
</MessageScrollerItem>

// autoScroll follows streamed output only while the
// reader is already at the live edge.
<MessageScrollerProvider autoScroll>
  {/* transcript */}
</MessageScrollerProvider>`,
        },
        {
          title: "Keeping Context Visible",
          preview: <MessageScrollerPeekPreview />,
          code: `import { MessageScrollerProvider } from "@/components/ui/message-scroller"

// Keep a slice of the previous turn visible above
// the newly anchored row.
<MessageScrollerProvider scrollPreviousItemPeek={64}>
  {/* anchored turns */}
</MessageScrollerProvider>`,
        },
        {
          title: "Opening Saved Threads",
          preview: <MessageScrollerOpenPreview />,
          code: `import { MessageScrollerProvider } from "@/components/ui/message-scroller"

// "last-anchor" reopens at the last meaningful turn
// and falls back to "end" when it fits or is missing.
<MessageScrollerProvider defaultScrollPosition="last-anchor">
  {/* transcript */}
</MessageScrollerProvider>`,
        },
        {
          title: "Loading Earlier Messages",
          preview: <MessageScrollerHistoryPreview />,
          code: `import { MessageScrollerItem } from "@/components/ui/message-scroller"

// Prepended rows keep the reader's place automatically.
// Stable messageId values give the scroller a row to preserve.
<MessageScrollerItem messageId="msg-41" scrollAnchor>
  {/* older message */}
</MessageScrollerItem>`,
        },
        {
          title: "Jumping to Messages",
          preview: <MessageScrollerJumpPreview />,
          code: `import { useMessageScroller } from "@/components/ui/message-scroller"

// Hooks work anywhere inside the provider,
// including controls outside the frame.
const { scrollToMessage, scrollToEnd, scrollToStart } = useMessageScroller()

scrollToMessage("msg-42", { align: "start", behavior: "smooth" })`,
        },
        {
          title: "Tracking the Reader's Position",
          preview: <MessageScrollerVisibilityPreview />,
          code: `import { useMessageScrollerVisibility } from "@/components/ui/message-scroller"

// Pay-for-what-you-use: tracking runs only while subscribed.
const { currentAnchorId, visibleMessageIds } = useMessageScrollerVisibility()`,
        },
        {
          title: "Following the Live Edge",
          preview: <MessageScrollerFollowingPreview />,
          code: `import { useMessageScrollerFollowing } from "@/components/ui/message-scroller"

// True while streamed output is pinning to the edge.
// Style with data-following or render a LIVE badge.
const following = useMessageScrollerFollowing()`,
        },
        {
          title: "Reading Scroll State",
          preview: <MessageScrollerScrollStatePreview />,
          code: `import { useMessageScrollerScrollable } from "@/components/ui/message-scroller"

// Edges the viewport can scroll toward.
// Prefer data-scrollable for styling the scroller itself.
const { start, end } = useMessageScrollerScrollable()`,
        },
      ]}
      props={[
        { name: "autoScroll", type: "boolean", default: "false", description: "Follow new content only while the reader is at the live edge." },
        { name: "defaultScrollPosition", type: '"start" | "end" | "last-anchor"', default: '"end"', description: "Opening position on first non-empty render, applied once." },
        { name: "scrollEdgeThreshold", type: "number", default: "8", description: "Distance from either edge that counts as at the edge." },
        { name: "scrollMargin", type: "number", default: "0", description: "Margin on the aligned edge for jumps and visibility." },
        { name: "scrollPreviousItemPeek", type: "number", default: "64", description: "Previous-item peek kept above a newly anchored row." },
        { name: "messageId", type: "string", default: "—", description: "Stable row id for jumps, visibility, and prepend preservation." },
        { name: "scrollAnchor", type: "boolean", default: "false", description: "Turn boundary that can anchor newly appended turns." },
        { name: "preserveScrollOnPrepend", type: "boolean", default: "true", description: "Keep the visible row stable when history prepends." },
        { name: "direction", type: '"start" | "end"', default: '"end"', description: "Transcript edge the button scrolls toward." },
        { name: "behavior", type: "ScrollBehavior", default: '"smooth" (button) / "auto" (commands)', description: "Native scroll behavior. Forced to auto under prefers-reduced-motion." },
        { name: "scrollToMessage", type: "(id, options?) => boolean", default: "—", description: "Jump to a mounted id; queues pre-mount targets." },
        { name: "useMessageScrollerFollowing", type: "() => boolean", default: "—", description: "Live-edge follow state for badges. Mirrored as data-following." },
        { name: "data-scrollable", type: '"start" | "end" | "start end"', default: "—", description: "Edges the viewport can scroll toward, on frame + viewport." },
        { name: "data-autoscrolling", type: "present while scrolling", default: "—", description: "Set during programmatic scrolls to the latest message." },
        { name: "data-following", type: "present while following", default: "—", description: "Set while streamed output is pinning to the live edge." },
      ]}
    />
  );
}
