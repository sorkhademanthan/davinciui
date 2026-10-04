import { redirect } from "next/navigation"

export const metadata = { title: "Motion — DavinciUI" }

// Motion content lives in the live gallery — the stub page redirects there
// so no dead-end showcase route ever ships.
export default function Page() {
  redirect("/experience/components?tab=Motion")
}
