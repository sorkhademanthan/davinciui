# Gallery Card Tiers

The gallery card tier decides how `/experience/components` renders a slug.
Inside component pages and fullscreen mode are not affected.

## Tier A

Cover image plus a short muted looping video. Intended for heavy showcase
components.

_List to be populated after Tier A media is selected._

## Tier B

Cover image, with the real component mounting on hover or tap. Intended for
interactive heavy components.

_List to be populated after Tier B media is selected._

## Tier C

Unchanged behavior. These cards keep the current live miniature path and need
no cover image, video, or CDN media.

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

## Not in Tier C

These are intentionally excluded and need separate work:

- breadcrumb — nested anchors inside the card link
- link — nested anchors inside the card link
- scroll-area — Base UI mount timer and resize subscription
