import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  AttachmentBasicPreview,
  AttachmentGroupPreview,
  AttachmentImagePreview,
  AttachmentSizesPreview,
  AttachmentStatesPreview,
  AttachmentTriggerPreview,
} from "@/components/docs/previews/attachment-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"`;
const defaultCode = `<Attachment>
  <AttachmentMedia>
    <FileTextIcon />
  </AttachmentMedia>
  <AttachmentContent>
    <AttachmentTitle>sales-dashboard.pdf</AttachmentTitle>
    <AttachmentDescription>PDF · 2.4 MB</AttachmentDescription>
  </AttachmentContent>
  <AttachmentActions>
    <AttachmentAction aria-label="Remove sales-dashboard.pdf">
      <XIcon />
    </AttachmentAction>
  </AttachmentActions>
</Attachment>`;

export async function AttachmentDocs() {
  const sourceCode =
    (await readComponentSource("attachment")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Attachment"
      description="Displays a file or image attachment with media, metadata, upload state, and actions. For chat composers, threads, and upload lists."
      preview={<AttachmentBasicPreview />}
      previewCode={defaultCode}
      installPackageName="attachment"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/attachment.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      usageNote={
        <div className="space-y-3">
          <p className="text-sm leading-6 text-muted-foreground">
            Attachment is presentational: it renders upload state but never uploads. Own file selection, transport,
            and removal in the host, and reflect progress through <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">state</code> and
            the description text.
          </p>
          <pre className="overflow-x-auto rounded-lg border bg-muted/30 p-4 font-mono text-xs leading-6">
{`Attachment
├── AttachmentMedia
├── AttachmentContent
│   ├── AttachmentTitle
│   └── AttachmentDescription
├── AttachmentActions
│   └── AttachmentAction
└── AttachmentTrigger

AttachmentGroup
├── Attachment
└── Attachment`}
          </pre>
        </div>
      }
      examples={[
        {
          title: "Image",
          preview: <AttachmentImagePreview />,
          code: `import { Attachment, AttachmentMedia } from "@/components/ui/attachment"

// variant="image" renders an <img>; orientation="vertical"
// stacks the media above the content.
<Attachment>
  <AttachmentMedia variant="image">
    <img src="/workspace.png" alt="Workspace" />
  </AttachmentMedia>
  {/* content + actions */}
</Attachment>

<Attachment orientation="vertical">
  <AttachmentMedia variant="image">
    <img src="/desk.jpg" alt="Desk" />
  </AttachmentMedia>
  {/* content + actions */}
</Attachment>`,
        },
        {
          title: "States",
          preview: <AttachmentStatesPreview />,
          code: `import { Attachment } from "@/components/ui/attachment"

// uploading + processing shimmer the title;
// error switches to a destructive treatment with
// the reason kept in the description text.
<Attachment state="idle">{/* Ready to upload */}</Attachment>
<Attachment state="uploading">{/* Uploading · 64% */}</Attachment>
<Attachment state="processing">{/* Processing document */}</Attachment>
<Attachment state="error">{/* Upload failed. Try again. */}</Attachment>
<Attachment state="done">{/* Uploaded · 1.8 MB */}</Attachment>`,
        },
        {
          title: "Sizes",
          preview: <AttachmentSizesPreview />,
          code: `import { Attachment } from "@/components/ui/attachment"

<Attachment size="default">{/* title + description */}</Attachment>
<Attachment size="sm">{/* compact title + description */}</Attachment>
<Attachment size="xs">{/* title only */}</Attachment>`,
        },
        {
          title: "Group",
          preview: <AttachmentGroupPreview />,
          code: `import { Attachment, AttachmentGroup } from "@/components/ui/attachment"

// Horizontally scrollable, snapping row with an edge fade.
// For presentational rows add tabIndex={0} role="group"
// with an aria-label so keyboard users can scroll it.
<AttachmentGroup aria-label="Message attachments">
  <Attachment>{/* … */}</Attachment>
  <Attachment>{/* … */}</Attachment>
</AttachmentGroup>`,
        },
        {
          title: "Trigger",
          preview: <AttachmentTriggerPreview />,
          code: `import { Attachment, AttachmentTrigger } from "@/components/ui/attachment"

// The trigger fills the card behind the actions,
// so both stay independently clickable.
<Attachment>
  {/* media, content, actions */}
  <AttachmentTrigger aria-label="Open preview dialog" onClick={openPreview} />
</Attachment>

// Render as a link with render:
<AttachmentTrigger
  render={<a href={url} target="_blank" rel="noreferrer" aria-label="Open workspace.png" />}
/>`,
        },
      ]}
      props={[
        { name: "state", type: '"idle" | "uploading" | "processing" | "error" | "done"', default: '"done"', description: "Upload lifecycle state. Busy states shimmer the title." },
        { name: "size", type: '"default" | "sm" | "xs"', default: '"default"', description: "Attachment size." },
        { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Media beside or above the content." },
        { name: "variant", type: '"icon" | "image"', default: '"icon"', description: "Media slot content (AttachmentMedia)." },
        { name: "render", type: "ReactElement", default: "—", description: "Render the trigger as a link or custom element (AttachmentTrigger)." },
        { name: "aria-label", type: "string", default: "—", description: "Required on icon-only actions and textless triggers." },
        { name: "className", type: "string", description: "Additional classes on any part." },
      ]}
    />
  );
}
