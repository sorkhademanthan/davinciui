import Link from "next/link"
import { Breadcrumbs } from "@/components/breadcrumbs"
export const metadata = { title: "scroll — Experience" }
export default function Page(){ return (<div className="w-full max-w-[840px] px-6 lg:px-8 py-6"><Breadcrumbs className="mb-4" /><h1 className="text-3xl font-semibold capitalize">scroll</h1><p className="mt-2 text-sm text-muted-foreground">Experience scroll — premium scroll showcase.</p><Link href="/experience/components" className="mt-6 inline-flex text-sm rounded-full border px-3 py-1.5">Back to components</Link></div>) }
