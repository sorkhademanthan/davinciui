import Link from "next/link"
import { Breadcrumbs } from "@/components/breadcrumbs"
export const metadata = { title: "Themes — Design System" }
export default function Page(){ return (<div className="w-full max-w-[840px] px-6 lg:px-8 py-6"><Breadcrumbs className="mb-4" /><h1 className="text-3xl font-semibold">Themes</h1><p className="mt-2 text-sm text-muted-foreground">Light, dark, and custom themes.</p><div className="mt-6 grid sm:grid-cols-2 gap-3">{["light","dark","custom","overrides"].map(s=> <Link key={s} href={`/design-system/themes/${s}`} className="rounded-xl border p-4 hover:bg-muted/30"><p className="text-sm font-medium capitalize">{s}</p></Link>)}</div></div>) }
