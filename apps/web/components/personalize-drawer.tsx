"use client"

import * as React from "react"
import * as ReactDOM from "react-dom"
import { motion, AnimatePresence, useDragControls, type PanInfo } from "framer-motion"
import { SlidersHorizontal, X } from "lucide-react"
import { useDocStore } from "@/hooks/use-doc-store"
import { useIsDesktop } from "@/hooks/use-is-desktop"
import { useModalDialog } from "@/hooks/use-modal-dialog"

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
  const personalizeContentId = useDocStore((state) => state.personalizeContentId)
  const personalizeOpen = useDocStore((state) => state.personalizeOpen)
  const setPersonalizeOpen = useDocStore((state) => state.setPersonalizeOpen)
  const dialogRef = React.useRef<HTMLDivElement | null>(null)
  const dragControls = useDragControls()
  const isDesktop = useIsDesktop()
  const isOpen = personalizeOpen && personalizeContent !== null
  const close = React.useCallback(() => setPersonalizeOpen(false), [setPersonalizeOpen])
  useModalDialog(isOpen, {
    dialogRef,
    onClose: close,
  })

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
    ? ReactDOM.createPortal(
        <AnimatePresence>
          {personalizeOpen && personalizeContent && (
            <>
              <motion.div
                aria-hidden="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={close}
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] dark:bg-black/60"
              />

              <motion.div
                ref={dialogRef}
                initial={
                  isDesktop
                    ? { x: 40, opacity: 0 }
                    : { y: "100%", opacity: 1 }
                }
                animate={isDesktop ? { x: 0, opacity: 1 } : { y: 0, opacity: 1 }}
                exit={
                  isDesktop
                    ? { x: 40, opacity: 0 }
                    : { y: "100%", opacity: 1 }
                }
                transition={
                  isDesktop
                    ? { type: "spring", damping: 32, stiffness: 320 }
                    : { type: "spring", damping: 30, stiffness: 300 }
                }
                drag={isDesktop ? false : "y"}
                dragControls={dragControls}
                dragListener={false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.4 }}
                onDragEnd={(_: unknown, info: PanInfo) => {
                  if (info.offset.y > 100 || info.velocity.y > 500) {
                    close()
                  }
                }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="personalize-title"
                tabIndex={-1}
                className="fixed inset-x-0 bottom-0 z-50 flex h-[85svh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-background shadow-2xl outline-none lg:inset-y-4 lg:bottom-4 lg:left-auto lg:right-4 lg:h-auto lg:w-[min(760px,calc(100vw-2rem))] lg:rounded-2xl"
              >
                <div className="flex shrink-0 flex-col border-b border-border/70 bg-muted/20">
                  <div
                    className="flex touch-none items-center justify-center py-2 lg:hidden"
                    onPointerDown={(event) => dragControls.start(event)}
                  >
                    <div className="h-1 w-10 rounded-full bg-muted-foreground/25 transition-colors hover:bg-muted-foreground/40" />
                  </div>

                  <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background text-muted-foreground shadow-sm">
                        <SlidersHorizontal className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h2
                            id="personalize-title"
                            className="text-sm font-semibold tracking-tight text-foreground"
                          >
                            Personalize
                          </h2>
                          <span className="rounded-full border border-border/70 bg-muted/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                            Live
                          </span>
                        </div>
                        {personalizeContentId && (
                          <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                            {personalizeContentId}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={close}
                      aria-label="Close personalize panel"
                      className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-hidden">
                  <div className="h-full">{personalizeContent}</div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )
    : null
}
