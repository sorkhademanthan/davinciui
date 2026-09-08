import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  MessageActionsPreview,
  MessageAttachmentPreview,
  MessageAvatarPreview,
  MessageBasicPreview,
  MessageGroupPreview,
  MessageHeaderFooterPreview,
  MessageStatusPreview,
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
      description="A conversation row with avatar, alignment, header, and footer around your message surface. Compose with Bubble, Attachment, and MessageScroller."
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
            in <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">MessageScroller</code>. The avatar
            is measured against the footer and lifted to stay aligned with the surface, at any footer height.
          </p>
          <pre className="overflow-x-auto rounded-lg border bg-muted/30 p-4 font-mono text-xs leading-6">
{`Message
├── MessageAvatar
└── MessageContent
    ├── MessageHeader
    ├── Bubble
    └── MessageFooter

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

// align="end" mirrors the whole row for sender messages.
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
        { name: "align", type: '"start" | "end"', default: '"start"', description: "Row alignment. End mirrors avatar, content, and footer." },
        { name: "aria-label", type: "string", default: "—", description: "Required on icon-only footer actions and textless triggers." },
        { name: "role", type: '"status"', default: "—", description: "Announce in-progress rows as live status updates." },
        { name: "className", type: "string", description: "Additional classes on any part." },
      ]}
    />
  );
}
