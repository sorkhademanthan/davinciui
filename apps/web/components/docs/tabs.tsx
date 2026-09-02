import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  TabsPreview,
  TabsLinePreview,
  TabsVerticalPreview,
  TabsDisabledPreview,
  TabsIconsPreview,
  TabsRtlPreview,
} from "@/components/docs/previews/tabs-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"`;
const defaultCode = `<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">Account content.</TabsContent>
</Tabs>`;

export async function TabsDocs() {
  const sourceCode = (await readComponentSource("tabs")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Tabs"
      description="A set of layered sections of content—known as tab panels—that are displayed one at a time."
      preview={<TabsPreview />}
      previewCode={defaultCode}
      installPackageName="tabs"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/tabs.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      examples={[
        { title: "Line", preview: <TabsLinePreview />, code: `<TabsTrigger variant="line">Account</TabsTrigger>` },
        { title: "Vertical", preview: <TabsVerticalPreview />, code: `<Tabs orientation="vertical">...</Tabs>` },
        { title: "Disabled", preview: <TabsDisabledPreview />, code: `<TabsTrigger disabled>Disabled</TabsTrigger>` },
        { title: "Icons", preview: <TabsIconsPreview />, code: `<TabsTrigger><User /> Account</TabsTrigger>` },
        { title: "RTL", preview: <TabsRtlPreview />, code: `<div dir="rtl">\n  <Tabs>...</Tabs>\n</div>` },
      ]}
      props={[
        { name: "Tabs", type: "Component", description: "Root container." },
        { name: "TabsList", type: "Component", description: "Container for triggers." },
        { name: "TabsTrigger", type: "Component", description: "Button that activates content." },
        { name: "TabsContent", type: "Component", description: "Content for each tab." },
        { name: "variant", type: '"default" | "line"', default: '"default"', description: "Trigger variant (TabsTrigger)." },
        { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Orientation of tabs." },
        { name: "disabled", type: "boolean", default: "false", description: "Disables the trigger." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
