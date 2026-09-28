import Link from "next/link"
import { Breadcrumbs } from "@/components/breadcrumbs"
export const metadata = { title: "Accessibility — Design System" }
export default function Page(){ return (<div className="mx-auto w-full max-w-[860px] px-4 py-8 sm:px-6 lg:px-8"><Breadcrumbs className="mb-4" /><h1 className="text-3xl font-semibold">Accessibility</h1><div className="mt-6 grid sm:grid-cols-3 gap-3">{["contrast","keyboard","focus"].map(s=> <Link key={s} href={`/design-system/accessibility/${s}`} className="rounded-xl border p-4 hover:bg-muted/30"><p className="text-sm font-medium capitalize">{s}</p></Link>)}</div></div>) }
