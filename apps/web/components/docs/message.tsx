import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  MessageActionsPreview,
  MessageAttachmentPreview,
  MessageAvatarPreview,
  MessageBasicPreview,
  MessageGroupPreview,
  MessageHeaderFooterPreview,
  MessageHoverActionsPreview,
  MessageStatusPreview,
  MessageTimestampsPreview,
} from "@/components/docs/previews/message-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Message, MessageAvatar, MessageContent } from "@/components/ui/message"`;
const defaultCode = `<Message>
  <MessageAvatar>
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  </MessageAvatar>
  <MessageContent>
    <Bubble>
      <BubbleContent>How can I help you today?</BubbleContent>
    </Bubble>
  </MessageContent>
</Message>`;

export async function MessageDocs() {
  const sourceCode =
    (await readComponentSource("message")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Message"
      description="A conversation row with avatar, alignment, header, footer, hover-reveal actions, and timestamps around your message surface. Compose with Bubble, Attachment, and MessageScroller."
      preview={<MessageBasicPreview />}
      previewCode={defaultCode}
      installPackageName="message"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/message.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      usageNote={
        <div className="space-y-3">
          <p className="text-sm leading-6 text-muted-foreground">
            Message owns the row layout only — render the visible surface inside it with{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">Bubble</code>, and wrap the thread
            in <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">MessageScroller</code>.{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">align=&quot;end&quot;</code> mirrors
            the whole row and docks bubbles, header, footer, and actions to the right — no{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">align</code> needed on{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">Bubble</code>. The avatar
            is measured against the footer and lifted to stay aligned with the surface, at any footer height.
          </p>
          <pre className="overflow-x-auto rounded-lg border bg-muted/30 p-4 font-mono text-xs leading-6">
{`Message
├── MessageAvatar
└── MessageContent
    ├── MessageHeader
    ├── Bubble
    ├── MessageFooter
    └── MessageActions

MessageGroup
├── Message
└── Message`}
          </pre>
        </div>
      }
      examples={[
        {
          title: "Avatar",
          preview: <MessageAvatarPreview />,
          code: `import { Message, MessageAvatar } from "@/components/ui/message"

// align="end" mirrors the row and docks the bubble right.
<Message>
  <MessageAvatar>
    <Avatar>
      <AvatarFallback>R</AvatarFallback>
    </Avatar>
  </MessageAvatar>
  <MessageContent>{/* bubble */}</MessageContent>
</Message>`,
        },
        {
          title: "Group",
          preview: <MessageGroupPreview />,
          code: `import { Message, MessageGroup } from "@/components/ui/message"

// Stack consecutive messages from the same sender.
// Render an empty MessageAvatar on earlier rows to
// keep them aligned with the avatar on the last one.
<MessageGroup>
  <Message>
    <MessageAvatar className="w-8" />
    <MessageContent>{/* earlier message */}</MessageContent>
  </Message>
  <Message>
    <MessageAvatar>
      <Avatar>{/* … */}</Avatar>
    </MessageAvatar>
    <MessageContent>{/* latest message */}</MessageContent>
  </Message>
</MessageGroup>`,
        },
        {
          title: "Header and Footer",
          preview: <MessageHeaderFooterPreview />,
          code: `import { Message, MessageFooter, MessageHeader } from "@/components/ui/message"

// Header stays start-aligned; footer follows the side.
<Message>
  <MessageAvatar>{/* … */}</MessageAvatar>
  <MessageContent>
    <MessageHeader>Olivia</MessageHeader>
    <Bubble>{/* … */}</Bubble>
    <MessageFooter>Read · Yesterday</MessageFooter>
  </MessageContent>
</Message>`,
        },
        {
          title: "Hover Actions",
          preview: <MessageHoverActionsPreview />,
          code: `import { Message, MessageActions } from "@/components/ui/message"

// Actions reveal on row hover, stay visible for
// keyboard focus and touch devices.
<Message>
  <MessageAvatar>{/* … */}</MessageAvatar>
  <MessageContent>
    <Bubble>{/* … */}</Bubble>
    <MessageActions>
      <button type="button" aria-label="Copy message">
        <CopyIcon />
      </button>
      <button type="button" aria-label="Retry request">
        <RefreshCcwIcon />
      </button>
    </MessageActions>
  </MessageContent>
</Message>`,
        },
        {
          title: "Timestamps",
          preview: <MessageTimestampsPreview />,
          code: `import { Message, MessageFooter, MessageHeader, MessageTime } from "@/components/ui/message"

<Message>
  <MessageAvatar>{/* … */}</MessageAvatar>
  <MessageContent>
    <MessageHeader>
      Olivia <MessageTime>09:41</MessageTime>
    </MessageHeader>
    <Bubble>{/* … */}</Bubble>
  </MessageContent>
</Message>`,
        },
        {
          title: "Actions",
          preview: <MessageActionsPreview />,
          code: `import { MessageFooter } from "@/components/ui/message"

// Icon-only footer actions need aria-labels.
<MessageFooter>
  <button type="button" aria-label="Copy message">
    <CopyIcon />
  </button>
  <button type="button" aria-label="Retry request">
    <RefreshCcwIcon />
  </button>
</MessageFooter>`,
        },
        {
          title: "Attachment",
          preview: <MessageAttachmentPreview />,
          code: `import { Message } from "@/components/ui/message"
import { Attachment } from "@/components/ui/attachment"

// Any surface composes inside the row —
// bubbles, images, attachments, reactions.
<Message align="end">
  <MessageContent>
    <Attachment>{/* file row */}</Attachment>
    <MessageFooter>Delivered</MessageFooter>
  </MessageContent>
</Message>`,
        },
        {
          title: "Status Updates",
          preview: <MessageStatusPreview />,
          code: `import { Message } from "@/components/ui/message"

// role="status" announces streaming updates as they appear.
<Message role="status">
  <MessageAvatar>{/* … */}</MessageAvatar>
  <MessageContent>
    <Spinner /> Checking the logs…
  </MessageContent>
</Message>`,
        },
      ]}
      props={[
        { name: "align", type: '"start" | "end"', default: '"start"', description: "Row alignment. End mirrors the row and docks bubbles, header, footer, and actions right." },
        { name: "MessageActions", type: "div element", description: "Hover-reveal action row. Visible on hover, keyboard focus, and touch." },
        { name: "MessageTime", type: "time element", description: "Mono tabular timestamp for headers and footers." },
        { name: "aria-label", type: "string", default: "—", description: "Required on icon-only footer actions and textless triggers." },
        { name: "role", type: '"status"', default: "—", description: "Announce in-progress rows as live status updates." },
        { name: "className", type: "string", description: "Additional classes on any part." },
      ]}
    />
  );
}
