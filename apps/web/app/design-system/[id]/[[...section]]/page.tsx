import { Builder } from "@/components/design-system/builder"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; section?: string[] }>
}) {
  const { id, section } = await params

  return <Builder id={id} section={section?.[0] || "colors"} />
}
