# Production Completed

## All Basic Gallery Cards

All 59 basic gallery cards are code-complete. No basic card requires cover
imagery, video, or CDN media.

### Tier C — live previews (33)

These keep the existing live miniature behavior. They are audited as
lightweight and do not add timers, RAF loops, observers, portals, canvases, or
running CSS animations to the gallery.

- accordion
- alert
- aspect-ratio
- attachment
- avatar
- badge
- bubble
- button
- button-group
- card
- checkbox
- collapsible
- empty
- field
- input
- input-group
- input-otp
- item
- label
- marker
- menubar
- message
- native-select
- pagination
- radio
- select
- separator
- slider
- switch
- tabs
- textarea
- toggle
- toggle-group

### Static previews (26)

These render hand-built stills instead of mounting the real component. They
are inert in the gallery, have no pointer interaction, and add no runtime
timers, RAF loops, observers, portals, canvases, or CSS animations.

- link — spans replace nested anchors
- form
- questionnaire
- calendar
- combobox
- date-picker
- toast
- progress
- spinner
- skeleton
- breadcrumb — spans replace nested anchors
- sidebar
- navigation-menu
- dialog
- alert-dialog
- drawer
- popover
- tooltip
- dropdown-menu
- context-menu
- hover-card
- sheet
- chart
- message-scroller
- carousel
- scroll-area

## Shared Gallery Shell

- One shared `IntersectionObserver` serves every gallery card. Cards mount
  when they are within the existing 300px viewport margin.
- One shared `matchMedia` listener serves reduced-motion preferences for every
  card.
- Static basic previews are inert and non-focusable.
- Live basic previews stay interactive; their `aria-hidden` state lifts while
  keyboard focus is inside the preview, so hidden controls are not left in the
  tab order as offscreen duplicates.
- The 33 Tier C cases remain unchanged from `main`.

## Remaining Work

- Manual light/dark and zoom QA of the gallery cards.
- Optional bundle profiling before deciding whether to split the Tier C live
  preview chunk further.
