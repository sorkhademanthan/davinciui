import type { Metadata } from "next"
import DocsPage from "@/app/docs/foundations/colors/page"
import { Breadcrumbs } from "@/components/breadcrumbs"

export const metadata: Metadata = {
  title: "colors — Foundations | Design System",
}

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[860px] px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs className="mb-4" />
      <DocsPage />
    </div>
  )
}
