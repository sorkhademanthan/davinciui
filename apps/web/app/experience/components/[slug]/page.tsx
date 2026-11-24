import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { getComponent } from "@/registry"
import { absoluteUrl } from "@/lib/site"
import { getDocsImporter, getDocsSlugs } from "@/components/docs/lazy-registry"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { ComponentDetailShell } from "@/components/component-detail-shell"
import { ExperienceSidebarNav } from "@/components/experience-sidebar-nav"
import { NavDrawer } from "@/components/nav-drawer"
import { Suspense } from "react"
import { isHiddenComponentSlug } from "@/lib/hidden-components"

// Aliases for renamed / shortened slugs (e.g. /dropdown → /dropdown-menu)
const SLUG_ALIASES: Record<string, string> = {
  dropdown: "dropdown-menu",
}

export const dynamicParams = true
export async function generateStaticParams(){ const slugs = getDocsSlugs(); return slugs.map(slug=>({slug})) }
export async function generateMetadata({params}:{params: Promise<{slug:string}>}): Promise<Metadata>{
  const {slug: raw}=await params; const slug = SLUG_ALIASES[raw] ?? raw; if (isHiddenComponentSlug(slug)) return { title: "Components — DavinciUI" };
  const c=getComponent(slug); if(!c) {
    const imp=getDocsImporter(slug); if(imp) return { title: `${slug} — DavinciUI`, description: `${slug} component` };
    return {};
  } return { title: `${c.title} — Experience`, description: c.description, alternates: { canonical: absoluteUrl(`/experience/components/${slug}`) } }
}
async function DocsContent({slug}:{slug:string}){
  const imp=getDocsImporter(slug); if(!imp) return null; const m=await imp(); return "default" in m ? (m.default as any)() : null
}
export default async function Page({params}:{params: Promise<{slug:string}>}){
  const {slug}=await params;
  const alias = SLUG_ALIASES[slug];
  if (alias) redirect(`/experience/components/${alias}`);
  if (isHiddenComponentSlug(slug)) redirect("/experience/components");
  const c=getComponent(slug); const imp=getDocsImporter(slug)
  if(imp){
    return (
      <ComponentDetailShell
        nav={<ExperienceSidebarNav />}
        drawer={
          <NavDrawer label="Components">
            <ExperienceSidebarNav />
          </NavDrawer>
        }
        homeHref="/experience/components"
        homeLabel="Components"
        hideMobileRow
      >
        <Suspense><DocsContent slug={slug} /></Suspense>
      </ComponentDetailShell>
    )
  }
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Components", href: "/experience/components" },
    { label: c?.title ?? slug },
  ]
  if(!c) return notFound();
  return (
    <ComponentDetailShell
      nav={<ExperienceSidebarNav />}
      drawer={
        <NavDrawer label="Components">
          <ExperienceSidebarNav />
        </NavDrawer>
      }
      homeHref="/experience/components"
      homeLabel="Components"
      hideMobileRow
    >
      <div className="w-full max-w-none min-w-0 px-6 py-6"><Breadcrumbs className="mb-4" items={crumbs} /><h1 className="text-2xl font-semibold">{c.title}</h1><p className="text-sm text-muted-foreground">{c.description}</p></div>
    </ComponentDetailShell>
  )
}
