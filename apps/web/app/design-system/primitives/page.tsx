import Link from "next/link"
import { Breadcrumbs } from "@/components/breadcrumbs"
export const metadata = { title: "Primitives — Design System" }
export default function Page(){ return (<div className="mx-auto w-full max-w-[860px] px-4 py-8 sm:px-6 lg:px-8"><Breadcrumbs className="mb-4" /><h1 className="text-3xl font-semibold">Primitives</h1><div className="mt-6 grid sm:grid-cols-3 gap-3">{["box","stack","flex","grid","container"].map(s=> <Link key={s} href={`/design-system/primitives/${s}`} className="rounded-xl border p-4 hover:bg-muted/30"><p className="text-sm font-medium capitalize">{s}</p></Link>)}</div></div>) }
