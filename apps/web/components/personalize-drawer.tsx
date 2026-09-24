"use client"

import * as React from "react"
import * as ReactDOM from "react-dom"
import { motion, AnimatePresence, type PanInfo } from "framer-motion"
import { ChevronLeft } from "lucide-react"
import { useDocStore } from "@/hooks/use-doc-store"

/**
 * PersonalizeDrawer — the slide-over panel for per-component playground
 * controls. Content and open state live in the doc store so both the
 * preview toolbar pill and the site header can open the same drawer.
 * Portaled to `document.body`, so it survives the fullscreen preview
 * hiding the site header.
 */
export function PersonalizeDrawer() {
  const [mounted, setMounted] = React.useState(false)
  const personalizeContent = useDocStore((state) => state.personalizeContent)
  const personalizeOpen = useDocStore((state) => state.personalizeOpen)
  const setPersonalizeOpen = useDocStore((state) => state.setPersonalizeOpen)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
    ? ReactDOM.createPortal(
        <AnimatePresence>
          {personalizeOpen && personalizeContent && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.4 }}
              onDragEnd={(_: unknown, info: PanInfo) => {
                if (info.offset.y > 100 || info.velocity.y > 500) {
                  setPersonalizeOpen(false)
                }
              }}
              role="dialog"
              aria-label="Personalize"
              className="fixed bottom-0 left-0 z-50 flex flex-col outline-none h-[80vh] w-full rounded-t-lg border-t border-border/20 bg-transparent shadow-none pointer-events-none lg:top-0 lg:bottom-0 lg:h-screen lg:max-h-screen lg:w-1/2 lg:rounded-none lg:border-none lg:pt-3 lg:pb-3 lg:pl-3 lg:pr-1.5"
            >
              <div className="relative h-full bg-white dark:bg-[#171717] lg:rounded-2xl overflow-hidden border border-border/20 shadow-2xl pointer-events-auto">
                <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
                  <div className="absolute inset-0 h-32 bg-gradient-to-b from-white to-transparent dark:from-[#171717] [mask-image:linear-gradient(to_bottom,black_20%,transparent)]" />
                  <div className="relative z-10 flex flex-col pointer-events-auto">
                    <div className="flex items-center justify-center pt-2 pb-1">
                      <div className="w-10 h-1 rounded-full bg-zinc-900/[0.08] dark:bg-white/[0.08] transition-colors hover:bg-zinc-900/[0.15] dark:hover:bg-white/[0.15]" />
                    </div>

                    <div className="flex items-center justify-between px-4 py-1">
                      <button
                        onClick={() => setPersonalizeOpen(false)}
                        className="inline-flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white focus-visible:outline-none"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="text-xs font-mono tracking-wide">Personalize</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="relative h-full min-h-0">
                  <div className="absolute bottom-0 left-0 right-0 z-10 h-16 bg-gradient-to-t from-white to-transparent dark:from-[#171717] pointer-events-none [mask-image:linear-gradient(to_top,black_30%,transparent)]" />
                  <div className="h-full">{personalizeContent}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )
    : null
}
