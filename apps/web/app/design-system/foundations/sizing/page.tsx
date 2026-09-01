import type { Metadata } from "next"
import DocsPage from "@/app/docs/foundations/sizing/page"
import { Breadcrumbs } from "@/components/breadcrumbs"

export const metadata: Metadata = {
  title: "sizing — Foundations | Design System",
}

export default function Page() {
  return (
    <div className="w-full max-w-[840px] px-6 lg:px-8 py-6">
      <Breadcrumbs className="mb-4" />
      <DocsPage />
    </div>
  )
}
