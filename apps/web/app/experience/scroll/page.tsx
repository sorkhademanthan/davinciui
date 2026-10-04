import { redirect } from "next/navigation"

export const metadata = { title: "Scroll — DavinciUI" }

// Scroll content lives in the live gallery — the stub page redirects there
// so no dead-end showcase route ever ships.
export default function Page() {
  redirect("/experience/components?tab=Scroll")
}
