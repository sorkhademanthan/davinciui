import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  SidebarControlledPreview,
  SidebarHoverPreview,
  SidebarPreview,
  SidebarRtlPreview,
  SidebarThemingPreview,
  SidebarWidthPreview,
} from "@/components/docs/previews/sidebar-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { SidebarProvider, Sidebar, SidebarTrigger, SidebarHeader, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuButton } from "@/components/ui/sidebar"`;
const defaultCode = `<SidebarProvider>
  <Sidebar>
    <SidebarHeader>Header</SidebarHeader>
    <SidebarContent>
      <SidebarMenu>
        <SidebarMenuButton>Home</SidebarMenuButton>
      </SidebarMenu>
    </SidebarContent>
  </Sidebar>
  <SidebarInset>
    <SidebarTrigger />
  </SidebarInset>
</SidebarProvider>`;

export async function SidebarDocs() {
  const sourceCode = (await readComponentSource("sidebar")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Sidebar"
      description="An app shell sidebar with icon rail, submenus, hover actions, rail tooltips, skeletons, and a mobile drawer — spring-animated and themeable."
      preview={<SidebarPreview />}
      previewCode={defaultCode}
      installPackageName="sidebar"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/sidebar.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      examples={[
        { title: "Width", preview: <SidebarWidthPreview />, code: `<SidebarProvider style={{ "--sidebar-width": "200px" }}>` },
        { title: "Controlled Sidebar", preview: <SidebarControlledPreview />, code: `<SidebarProvider defaultOpen={false}>` },
        { title: "Hover to Expand", preview: <SidebarHoverPreview />, code: `<Sidebar collapsible="icon" expandOnHover>` },
        { title: "Theming", preview: <SidebarThemingPreview />, code: `<Sidebar className="bg-zinc-900 text-white">` },
        { title: "RTL", preview: <SidebarRtlPreview />, code: `<div dir="rtl"><SidebarProvider>...</SidebarProvider></div>` },
      ]}
      props={[
        { name: "SidebarProvider", type: "Component", description: "Provides context for sidebar state." },
        { name: "Sidebar", type: "Component", description: "Sidebar container." },
        { name: "SidebarTrigger", type: "Component", description: "Button to toggle sidebar with state-morphing icon." },
        { name: "Sidebar · expandOnHover", type: "boolean", default: "false", description: "Icon rail expands on hover, settles back on leave (desktop)." },
        { name: "SidebarProvider · persistKey", type: "string", default: "—", description: "Persist open state in a 7-day cookie under this name." },
        { name: "SidebarHeader", type: "Component", description: "Header section." },
        { name: "SidebarFooter", type: "Component", description: "Footer section." },
        { name: "SidebarContent", type: "Component", description: "Main content area." },
        { name: "SidebarGroup", type: "Component", description: "Group container." },
        { name: "SidebarMenu", type: "Component", description: "Menu list." },
        { name: "SidebarMenuButton", type: "Component", description: "Menu item button with active pill, badge, and submenu chevron." },
        { name: "SidebarMenuButton · tooltip", type: "ReactNode", description: "Rail tooltip, auto from text labels. Shows only when collapsed on desktop." },
        { name: "SidebarMenuAction · showOnHover", type: "boolean", default: "false", description: "Reveal the row action on hover/focus; always visible on touch." },
        { name: "SidebarMenuSub", type: "Component", description: "Submenu." },
        { name: "SidebarMenuBadge", type: "Component", description: "Badge for menu item." },
        { name: "SidebarMenuSkeleton", type: "Component", description: "Loading skeleton." },
        { name: "SidebarRail", type: "Component", description: "Rail for resizing/collapse." },
        { name: "useSidebar", type: "hook", description: "Hook to access sidebar context." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
