import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getComponent } from "@/registry"
import { getDocsImporter, getDocsSlugs } from "@/components/docs/lazy-registry"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Suspense } from "react"

export const dynamicParams = false
export async function generateStaticParams(){ const slugs = getDocsSlugs(); return slugs.map(slug=>({slug})) }
export async function generateMetadata({params}:{params: Promise<{slug:string}>}): Promise<Metadata>{
  const {slug}=await params; const c=getComponent(slug); if(!c) {
    const imp=getDocsImporter(slug); if(imp) return { title: `${slug} — DavinciUI`, description: `${slug} component` };
    return {};
  } return { title: `${c.title} — Experience`, description: c.description }
}
async function DocsContent({slug}:{slug:string}){
  const imp=getDocsImporter(slug); if(!imp) return null; const m=await imp(); return "default" in m ? (m.default as any)() : null
}
export default async function Page({params}:{params: Promise<{slug:string}>}){
  const {slug}=await params; const c=getComponent(slug); const imp=getDocsImporter(slug)
  if(imp){
    return (<div className="w-full max-w-none m-0 p-0 min-w-0"><Suspense><DocsContent slug={slug} /></Suspense></div>)
  }
  if(!c) return notFound();
  return (<div className="w-full max-w-none m-0 p-0 min-w-0 px-6 py-6"><Breadcrumbs className="mb-4" /><h1 className="text-2xl font-semibold">{c.title}</h1><p className="text-sm text-muted-foreground">{c.description}</p></div>)
}
