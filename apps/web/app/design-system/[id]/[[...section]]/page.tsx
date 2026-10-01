import { Builder } from "@/components/design-system/builder"
import { redirect } from "next/navigation"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; section?: string[] }>
}) {
  const { id, section } = await params

  // The component catalog is a single shared workspace. Keep old bookmarked
  // builder URLs useful instead of rendering a removed duplicate editor.
  if (section?.[0] === "components") redirect("/experience/components")

  return <Builder id={id} section={section?.[0] || "colors"} />
}
