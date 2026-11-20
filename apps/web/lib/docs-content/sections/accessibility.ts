// Source-grounded notes for every component page. Keep entries alphabetical.
export const accessibility: Record<string, string> = {
  "3d-flow-gallery":
    "The host is exposed as a labelled role='img' and the generated canvas is not focusable, so the tunnel adds no keyboard surface. Wheel and drag are pointer-only and have no keyboard equivalent; the image panels are decorative and are not announced individually.",
  accordion:
    "Triggers are native buttons in headings with aria-expanded; arrow keys move focus between them and panels are labelled. Focus-visible rings are provided, and disabled items are skipped. Content remains mounted only when keepMounted is set.",
  alert:
    "The root renders role='alert' by default, so additions announce to screen readers; pass role='status' for quieter updates. Icons are aria-hidden. Dismiss controls need their own aria-label, as the docs example shows.",
  "alert-dialog":
    "Base UI Dialog traps focus, closes on Escape, and restores focus on close, with Title and Description wired for labelling. AlertDialogAction and Cancel are plain Buttons, so they do not close the dialog automatically.",
  "ambient-audio-toggle":
    "Renders a native button with a dynamic aria-label, aria-pressed playback state, and a visible focus ring; Enter and Space work natively. The waveform is aria-hidden, so status is conveyed by label text unless hideLabel removes it.",
  "ambient-strip":
    "Each frame is a labelled group with a screen-reader caption built from its title and subtitle (falling back to alt). Only one tiled set stays in the tab order, arrow keys move between frames, and focus outlines stay visible against the ambient artwork.",
  "animated-metric":
    "The root exposes role='img' with an aria-label combining the final value and label, while the animated figure is aria-hidden, so screen readers get the exact result once. No keyboard interaction is involved.",
  "animated-pill-button":
    "Renders a native button, or an anchor when href is supplied, so activation works normally. A focus-visible outline appears, and keyboard focus opens the wipe only after Tab; aria-label can override the visible text. Disabled removes link behavior.",
  "arc-carousel":
    "The section is a focusable region labelled by the heading with aria-roledescription='carousel'; Left and Right arrows move tiles and a polite live region announces position. Tiles sit in an aria-hidden container, so image alt text is not exposed to screen readers.",
  "arcwave-carousel":
    "The section is a focusable region with aria-roledescription='carousel' and an aria-label (default 'Card carousel'); Left and Right arrows step one slot. Each slide is role='button' with aria-roledescription='slide', labelled from its title and description, and is tabbable only within 75 degrees of centre; off-axis slides drop from the tab order and become aria-hidden once opacity falls below 0.1. Enter or Space centres a side slide, and on the centre slide activates its link; links themselves stay tabIndex -1.",
  "streamline-carousel":
    "The root is a labelled region with aria-roledescription='media carousel', containing a single focusable canvas (aria-label 'Drag or use the arrow keys to browse') and a visually hidden ordered list naming every slide. ArrowLeft and ArrowRight tween focus between cards along the shortest wrapped path; clicking a side card centres it, and a centred card's link opens in a new tab with noopener (or same tab). Plain vertical scrolling is never intercepted. Media is drawn, not DOM-rendered, so images and videos carry no alt text or captions; convey meaning in surrounding copy. Reduced motion disables autoplay and entrance animation.",
  "depth-carousel-3d":
    "The root is a labelled region with aria-roledescription='carousel'; each virtual slide is role='group' labelled 'n of N', and aria-hidden is set on every non-active slide as you navigate. The drag layer is focusable with an aria-label ('Drag, swipe, or use arrow keys to browse'); ArrowLeft and ArrowRight move one slot with a spring, Home and End jump to the first and last slot. Clicking a side card springs it to the centre; the active card follows its link in a new tab with noopener (or same tab). Keyboard focus is on the layer, not per-card. Reduced motion replaces springs with a short tween and disables autoplay.",
  "tilt-flip-polaroid":
    "The static hit area is a role='button' with tabIndex 0, aria-pressed reflecting the flipped state, and a label built from the photo alt text. Space and Enter flip, a focus-visible ring is shown, and the face that is not visible is aria-hidden. Tilt is pointer-only and disabled for coarse pointers; touch and keyboard still flip.",
  "aspect-ratio":
    "A presentational div using padding-bottom to reserve space; it adds no roles, labels, or keyboard behavior. Children keep their own semantics, and images still need meaningful alt text.",
  attachment:
    "AttachmentAction is a native button with a focus-visible ring, and AttachmentTrigger is a button or link needing aria-label when icon-only. The scrollable AttachmentGroup is not keyboard focusable by default; add tabIndex, role='group', and a label.",
  avatar:
    "Base UI Avatar renders image and fallback content; pass alt on AvatarImage and name or text in AvatarFallback for a readable identity. Presence badges are unlabeled colored spans, so status is conveyed by color alone; avatars are not focusable unless wrapped in a trigger.",
  badge:
    "The badge is a span unless asChild renders a link; the removable chip adds a native button labelled by removeLabel and stops click propagation. Focus-visible rings are present, but BadgeDot is aria-hidden, so status needs adjacent text.",
  breadcrumb:
    "The nav is labelled 'breadcrumb', items are list entries, separators are presentation-only, and the current page uses aria-current='page'. The collapse expander is a button with a count label, though its aria-expanded stays false after expanding.",
  bubble:
    "Bubble is presentational markup with no implicit role; BubbleContent can render as a button or link and then gains a focus-visible ring. Reactions remain unlabeled unless you add role='img' and aria-label, as the docs example does.",
  "burn-plus":
    "Exposes the effect as a role img host with a configurable aria label while the canvas is aria-hidden. Tap mode listens only to pointerup, so its reveal has no keyboard equivalent.",
  button:
    "Renders a native button with a visible focus-visible ring; loading sets aria-busy and blocks clicks. The asChild path uses aria-disabled because anchors cannot be disabled, and the spinner is aria-hidden.",
  "button-group":
    "The wrapper is a role group with aria-orientation for vertical layouts and aria-hidden separators. Keyboard behavior is inherited entirely from child buttons; the group adds no roving focus or key handling.",
  calendar:
    "Day cells are buttons with full-date aria-labels, aria-pressed and aria-current, navigated by roving tabindex with arrows, Home/End and PageUp/PageDown. Month titles use aria-live, though the grid exposes no role=grid.",
  card: "Cards are plain divs unless asChild renders a real link or button. Interactive mode adds a focus-visible ring and the base card shows a focus-within ring, while CardTitle defaults to h3.",
  carousel:
    "The root is a labeled carousel region that captures left and right arrows, slides are groups labeled Slide X of Y, and a polite live region announces changes. Dots use tablist semantics, though vertical carousels still respond only to left and right.",
  "character-field":
    "It is presentational: the host is role img with a fixed decorative aria-label and the canvas is aria-hidden, so no glyph content reaches assistive technology.",
  chart:
    "ChartContainer only provides theming and sizing, so keyboard and screen-reader support depends on passing Recharts accessibilityLayer. The custom tooltip and legend render as unlabeled divs without ARIA roles.",
  checkbox:
    "A native checkbox stays in the DOM, visually hidden inside its label, so Space toggles it and focus-visible styling shows. Indeterminate sets aria-checked mixed, and CheckboxGroup uses fieldset and legend with aria-describedby.",
  "chromatic-cursor":
    "It is a decorative canvas marked aria-hidden and pointer-events-none, so it adds nothing for assistive technology. The effect is mouse-only, and the optional custom cursor hides the native one only while active.",
  "cinematic-card-carousel":
    "The deck is a focusable carousel region with left and right arrows. Only the active card is tabbable and can be promoted with Enter or Space, and a polite live region announces card and title.",
  "crumpled-paper-reveal":
    "The interactive sheet is a labelled role img with tabIndex 0, and Enter or Space toggles the reveal; the canvas and flat fallback are aria-hidden. When a link is supplied the overlay is a real anchor whose label is the alt text. previewMode removes the overlay from the tab order and pointer events, and reduced motion renders the finished print instead of animating.",
  "circular-gallery":
    "A labeled region contains an aria-hidden WebGL canvas and a visually hidden list of links that repeats every alt text. Each link is keyboard focusable, focuses its panel to the front, and ArrowLeft or ArrowRight rotates the ring. Panels without an href remain focusable text-only links.",
  "curve-wall":
    "Every tile is a labeled button with aria-expanded, and the active tile is the only one reachable while its viewer is open because the rest become inert. Enter or Space opens and closes the viewer, Escape and outside clicks close it, focus returns to the tile, and ArrowLeft, ArrowRight, ArrowUp, and ArrowDown pan the closed wall.",
  "circle-cursor":
    "It is a decorative aria-hidden, pointer-events-none div that never receives focus. The effect runs only on fine pointers and disables itself for coarse pointers or reduced motion, restoring the native cursor.",
  "cms-media-bento":
    "Each tile is a native button, so Enter and Space open the lightbox without custom key handling; the bento itself adds no roving tabindex and every tile is reachable in source order. Lightbox dialogs use aria-modal, focus the close control on open, cycle Tab inside, close on Escape, and restore focus to the tile. Images keep meaningful alt text and honor lazy loading outside the first five tiles.",
  collapsible:
    "CollapsibleTrigger renders a native button with aria-expanded and aria-controls tied to the panel id; Enter and Space toggle it. The closed panel unmounts by default, so its content leaves the accessibility tree. Focus stays on the trigger.",
  combobox:
    "The text input uses role='combobox' with aria-expanded, aria-controls, aria-activedescendant, and aria-autocomplete='list'; the popup is a listbox of options. Arrow keys, Home, End, Enter, Escape, and Backspace work. The input has no label prop, so the placeholder is the only accessible name.",
  "context-menu":
    "Base UI supplies role='menu', roving focus, type-ahead, Escape dismissal, and focus return. Right-click, Ctrl+click, long-press, and Shift+F10 open it while focus is inside. The trigger wrapper is a plain non-tabbable div, so add tabIndex for keyboard-only access; section labels and shortcuts are aria-hidden.",
  "curved-inline-type":
    "The stage is decorative: all lines rotate on an aria-hidden track, inline images use empty alt text, and the fixed caption is aria-hidden. The page itself remains keyboard-scrollable, so PageUp, PageDown, Space, and arrow keys still drive the ring through native scroll. Videos are muted, looping, and never focusable.",
  "wavy-flow-carousel":
    "A decorative, canvas-rendered stage: the ribbon and its imagery are not exposed as interactive content and add no focusable elements. The wheel moves the ribbon only while the pointer is over it, prefers-reduced-motion stops the auto-scroll, and the stage stays in place while the page scrolls normally. Videos, when used, are muted and play inline without controls.",
  "date-picker":
    "The trigger exposes an aria-label describing the current date and opens a popup with role='dialog' and aria-label 'Choose date'. Calendar days are buttons with full-date labels, aria-pressed, and roving tabindex; arrow keys and live month and selection announcements work. Escape closes and focus returns.",
  dialog:
    "Base UI traps focus, makes the background inert, closes on Escape, and returns focus to the trigger. The popup is role='dialog' with aria-labelledby and aria-describedby wired to DialogTitle and DialogDescription, so both parts should be present. The default close button has an aria-label.",
  drawer:
    "Vaul supplies focus trapping, Escape dismissal, aria-modal dialog semantics, and focus return, with DrawerTitle and DrawerDescription wired for labelling. The grabber is aria-hidden and pointer-only, so swipe dismissal has no keyboard equivalent beyond Escape. Add your own labelled close control.",
  "dropdown-menu":
    "Base UI provides role='menu', arrow-key roving focus, type-ahead, Escape dismissal, submenu handling, and focus return. Checkbox and radio items expose checked state through the primitive. DropdownMenuLabel and DropdownMenuShortcut are aria-hidden, so section headings and shortcut hints are not announced.",
  "editorial-wipe-preloader":
    "The overlay is role='status' with an aria-label like 'Page loading, LOADING'; all visual counters and the wipe are aria-hidden. A polite live region announces only 0, 25, 50, 75, and 100 percent milestones. Page scroll is locked while the overlay is mounted.",
  "elastic-blob-cursor":
    "The blob is purely decorative: aria-hidden, pointer-events none, and never focusable, so it adds no keyboard or screen-reader surface. It runs only for fine pointers, and hiding the native cursor is scoped to that active state.",
  "electric-vijdi-cursor":
    "The canvas is aria-hidden and pointer-events none, so it contributes nothing to focus order or the accessibility tree and never intercepts interactions. The effect is skipped entirely on coarse pointers.",
  empty:
    "Empty renders role='status' by default, so its title and description are announced politely when the state appears. Icon and dashed media variants are aria-hidden as decorative; default media is exposed, so provide alt text or labels for meaningful custom content.",
  "encrypted-text":
    "The outer span carries aria-label with the final text while the scrambling characters are aria-hidden, so screen readers never hear cipher noise. The value is not a live region, so the resolved message is not re-announced when a cycle completes.",
  field:
    "FieldControl wires a child control's id, aria-invalid, and aria-describedby to the Field-generated description and error ids; FieldLabel falls back to that id. FieldError renders role='alert' with an icon, and FieldSeparator exposes role='separator'. FieldSet uses native fieldset and legend.",
  "fill-preloader":
    "The overlay exposes role=progressbar with aria-label Page loading and aria-valuenow updated as progress changes. The visible percentage counter and fill are aria-hidden, scroll is locked, and there is no keyboard dismiss or skip control.",
  "fluid-particle-text":
    "The container exposes role=img with aria-label defaulting to the text, while the canvas is aria-hidden. Pointer movement drives the effect and touch is ignored; there is no focusable control or keyboard alternative, so the deformation is purely decorative.",
  form: "FieldContext generates stable ids and auto-wires labels via htmlFor, plus aria-invalid and aria-describedby on the control. FormMessage renders role=alert with an icon, so errors are announced; behavior otherwise relies on native form and input semantics.",
  "geometric-preloader":
    "The overlay is a role=progressbar labelled Page loading, with aria-valuenow updated in 25 percent milestones; decorative squares and the counter are aria-hidden. Page scroll is locked during the sequence, and there is no keyboard dismissal or skip action.",
  "geometric-trail-cursor":
    "The host and canvas are aria-hidden and pointer-events-none, so the trail is purely decorative and does not intercept clicks. Only pointer movement and pointer down create geometry; there is no focus or keyboard interaction and touch is opt-in via enableTouch.",
  "glass-scene-dock":
    "Dock items are native buttons with aria-label and aria-current inside a nav labelled Scene navigation; focus-visible rings are provided and focus moves the glass highlight. Inactive scenes are aria-hidden and an aria-live region announces the active scene title.",
  "glitch-liquid-text":
    "A visually hidden semantic element carries aria-label and the text content, while the canvas and custom cursor are aria-hidden. Interaction is pointer-only with no focus or keyboard path; the container is not focusable, so keyboard users see the static render.",
  "gsap-text":
    "The main text renders in the semantic tag chosen by htmlTag, and every animated clone is aria-hidden. There are no keyboard controls or pause mechanism; motion runs continuously, which is a caveat for users who need to stop movement.",
  "hover-card":
    "Built on Base UI Preview Card: the trigger is focusable and opens the panel on focus, Escape dismisses it, and the popup uses role=dialog with a fixed aria-label of Preview. The trigger has a focus-visible ring, and a safe polygon lets pointer travel reach the panel.",
  "hover-cards":
    "Cards are buttons inside a labelled list, with aria-pressed and an aria-label combining label and description. Focus activates a card, focus-visible rings are shown, and auto-play pauses on hover, focus, background tabs and offscreen; background art is aria-hidden.",
  "hover-transition":
    "The wrapper is a focusable role=group with an aria-label prop, and focus reveals the hover content with a focus-visible ring. Animated layers are aria-hidden, so assistive technology reads only the default content; there is no Escape or Enter handling.",
  "infinite-image-gallery":
    "The root is a labelled region with a visually hidden description of the loop. The rotating cylinder is aria-hidden because the same images repeat around the surface, so image alt text is not announced dozens of times. A Pause/Play button becomes visible on keyboard focus, and motion stops automatically when reduced motion is requested.",
  "ink-flow":
    "The component is purely decorative: the wrapper is aria-hidden and pointer-events-none, with no focus targets. Screen readers skip the ink field, so supply any needed text in surrounding content.",
  input:
    "Uses a native input or Base UI input primitive, so browser semantics, keyboard editing, and focus behavior apply. aria-invalid is set from the invalid prop, and the wrapper paints a focus-visible ring; consumers must associate a label.",
  "input-group":
    "Renders a real input or textarea with aria-invalid cascading from the group, plus native button semantics for addon buttons. Addons are plain divs with no roles; label the inner field and mark decorative addon icons aria-hidden yourself.",
  "input-otp":
    "A role group labelled 'One-time code' contains per-slot inputs labelled 'Digit n of N'. Arrow keys, Home, End, Backspace, Delete, and paste are handled, focus auto-advances, and disabled or aria-invalid states follow the props.",
  "interaction-sound-kit":
    "Action buttons are native buttons with visible labels; compact mode adds aria-label, and the mute toggle exposes aria-pressed and a changing label. Focus-visible rings are defined. Sounds are user-triggered, and decorative SVG icons are aria-hidden.",
  "interactive-media-accordion":
    "Each card is a button with aria-expanded, aria-current, and a label from title or alt, inside a group labelled 'Interactive media gallery'. Focus activates a card and focus-visible rings are provided; focus activation does not scroll the page in scroll mode.",
  item: "Item is a presentational flex container of divs with no roles; the optional render prop can turn it into an anchor or custom element with native semantics. Interactive controls in ItemActions keep their own keyboard behavior; title and description are not associated semantically.",
  "keyboard-command-sounds":
    "Controls are native buttons: the On/Off toggle exposes aria-pressed, the sample input has a label, and the Run button has an aria-label. Status text uses aria-live polite outside compact mode; the global key listener only runs after the user enables sound.",
  label:
    "A native label element, so association works through htmlFor or nesting and screen readers announce it with the control. It adds no ARIA and is not focusable; disabled styling depends on the peer-disabled class.",
  "lens-drift-grid":
    "The root is a labelled region, focusable when interactive, with arrow-key panning and a screen-reader instruction. The canvas is aria-hidden, so individual images, titles, and alt text are not exposed to assistive technology.",
  link: "A native anchor, so keyboard activation and link semantics come from the browser. focus-visible adds a ring, but meaningful link text and any external-link icon labeling remain the consumer responsibility.",
  "liquid-chrome":
    "A bare canvas with no role, accessible name, or aria-hidden marker, so screen readers encounter an unlabeled canvas. There are no focusable controls, and mouse distortion is pointer-only.",
  "liquid-chrome-button":
    "Renders a native button or anchor with a default 'Liquid chrome button' label, so Enter and Space work and focus-visible shows a ring. Pass a descriptive ariaLabel; decorative mode is aria-hidden and non-interactive. The WebGL canvas is hidden from assistive tech.",
  "liquid-reveal-button":
    "The native button or anchor keeps its label and keyboard activation, and ariaLabel sets an accessible name. Focus expands the reveal and focus-visible draws a 2px outline. The duplicate reveal label and demo cursor are aria-hidden; disabled is not forwarded to anchors.",
  "magic-cursor-pro":
    "The cursor overlay is aria-hidden and pointer-events none, so it adds no semantics. It disables itself on coarse pointers and prefers-reduced-motion, but hiding the system cursor can still disorient users; the effect has no keyboard interaction.",
  marker:
    "Marker is a presentational div by default, so consumers choose semantics; render as an anchor or button adds focusability and a focus-visible ring. Icons and dots are aria-hidden, and lines in separators are decorative. Icon-only markers need aria-label.",
  "media-text-hover":
    "The root is a focusable group labelled '<text> media reveal', and focusing or hovering opens the media. All visible text fragments and the media are aria-hidden, so the group label is the only announced content; touch toggles on tap.",
  menubar:
    "Built on Base UI menubar and menu primitives, which provide roving focus, arrow-key navigation, typeahead, and Escape handling; triggers and items show focus styling. The component adds no roles itself, and MenubarLabel is only a styled div.",
  message:
    "Message is a layout-only div with no ARIA roles; consumers add role status for streaming rows. Actions start at opacity 0 but stay in the tab order and reveal via group-focus-within on keyboard focus. Icon-only actions need aria-label.",
  "message-scroller":
    "The viewport is a focusable region labelled Messages, and content is a log with aria-relevant additions for streamed rows. The jump button has a default aria-label, and becomes inert and untabbable when nothing can scroll. Labels are overridable.",
  "motion-hamburger":
    "The control is a real button with aria-expanded and a dynamic Open menu or Close menu label, so Enter and Space work natively. focus-visible shows a 2px outline; consumers can override the label or add their own.",
  "native-select":
    "Renders a native select, so keyboard behavior and the OS picker come from the browser. aria-invalid is set for the invalid prop, and the chevron is aria-hidden. There is no built-in label; consumers must supply one.",
  "navigation-menu":
    "Built on Base UI navigation-menu primitives, which provide menu semantics, keyboard navigation, and focus management. Triggers show focus-visible rings, the chevron is aria-hidden, and active links set aria-current to page.",
  "neon-mesh-bg":
    "The background is aria-hidden and pointer-events none, so it contributes no content or focus targets. A CSS radial-gradient fallback renders when WebGL is unavailable, and the component is safe behind foreground content.",
  noiser:
    "Noiser is a decorative overlay marked aria-hidden with pointer-events none, and its SVG is focusable false, so it adds no content or focus targets. Foreground content remains fully accessible.",
  "nudge-button":
    "A native button keeps Enter and Space activation; keyboard focus triggers the ring burst from center while pointer use uses the entry point. Decorative rings are aria-hidden and focus-visible draws a 2px outline.",
  "orbit-spiral-gallery":
    "A region with aria-label wraps the WebGL canvas, and every slide alt is duplicated into an sr-only list. There are no focusable controls or keyboard paging, and auto-rotation cannot be paused from the UI.",
  pagination:
    "A nav with aria-label pagination holds Button elements; the active link sets aria-current page, edge controls carry descriptive aria-labels, and the ellipsis is aria-hidden with sr-only More pages. Keyboard behavior comes from native buttons.",
  "pixel-flow":
    "Purely decorative: the host and fallback both set aria-hidden and pointer-events none, so the shader exposes no text, controls, or keyboard interaction to assistive technology.",
  "pixel-preloader":
    "The overlay exposes role progressbar with aria-label Page loading and aria-valuenow updated on integer changes; canvas and HUD are aria-hidden and scroll is locked. It is not marked modal and moves no focus.",
  "pixel-wipe-carousel":
    "A region with carousel roledescription and aria-label contains an aria-hidden canvas, while the current alt is announced through an aria-live polite span. There are no keyboard controls, and autoplay pauses only on hover when pauseOnHover is set.",
  popover:
    "Base UI supplies trigger aria-expanded and aria-controls, dialog semantics, portal focus handling, Escape to close, and focus return. The wrapper adds no accessible name, so pass aria-label or render PopoverTitle inside.",
  "cinematic-panel-preloader":
    "role progressbar with aria-label Page loading reports aria-valuenow only in 25 percent milestones, while the visual counter and hero are aria-hidden. The loader does not move focus or expose a skip control.",
  "glitch-shred-preloader":
    "A role status with aria-live polite announces 0, 25, 50, 75, and 100 percent loaded, while the drifting cards, counter, and progress bar are aria-hidden. Scroll is locked while active, but the overlay is not modal, traps no focus, and offers no skip control; reduced-motion users get a short fade.",
  "editorial-card-arc-preloader":
    "A role status with aria-live polite announces 0, 25, 50, 75, and 100 percent loaded, while the fan, counter, label, and expanding image are aria-hidden. Scroll is locked and the underlying main is marked inert while active, but the overlay is not modal, traps no focus, and offers no skip control; reduced-motion users get a static frame and a short fade.",
  "masked-arc-preloader":
    "A role status with aria-live polite announces the intro, brand, and reveal phases while the arc cards and image title are aria-hidden. Scroll is locked while active, Escape skips the loader, and the overlay is not modal and moves no focus. Reduced-motion users get a static composed arc with a short fade.",
  "editorial-curtain-preloader":
    "A role status with aria-label Loading announces only the overlay state; the tagline, wordmark, marks, and cards are aria-hidden decoration. Fullscreen mode locks scroll and marks background branches inert until the reveal, then restores them exactly. There are no focusable controls, and reduced-motion users get a short fade instead of the sequence.",
  "profile-carousel":
    "A focusable region with carousel roledescription and the fixed label Team profiles supports Left and Right arrow navigation and labeled previous and next buttons. A polite live region announces Profile X of N, and hover or focus pauses autoplay.",
  progress:
    "Base UI renders a progressbar with min, max, and now from value, min, and max, linking ProgressLabel and ProgressValue; format and getAriaValueText customize spoken output. A null value produces indeterminate semantics without a numeric now.",
  questionnaire:
    "Native fieldsets, legends, radios, checkboxes, and inputs provide semantics; inactive items are hidden and the active fieldset receives focus on navigation. Errors use role alert and aria-invalid, but the fieldset focus outline is suppressed.",
  "radial-fan-deck":
    "The host is role img with aria-label, while the entire card stage is aria-hidden, so cover titles and images are not announced individually. There are no focusable elements or keyboard controls for the scroll-driven fan.",
  radio:
    "Each item wraps a native radio in its label inside a role radiogroup, so arrow keys, naming, and form submission work natively. Focus-visible styling sits on the visual dot; invalid is set on the group and label, not the input.",
  "random-text-reveal":
    "The animated glyph tree is aria-hidden while an sr-only span exposes the full text once. There is no focusable UI or keyboard control, and reduced-motion users get the final readable state.",
  "rolling-text":
    "An sr-only span exposes the complete text while the rolling glyph copies are aria-hidden. The component has no built-in keyboard controls; autoPlay and the imperative play and reset ref methods are not focusable, and reduced-motion users see plain characters.",
  "scroll-area":
    "Base UI gives the viewport role presentation and tabIndex 0 whenever content overflows, so arrow and Page keys scroll it natively. The wrapper adds a visible focus-visible ring; scrollbar thumbs are decorative visuals rather than separately announced controls.",
  "scroll-media-expand":
    "The section is labelled, but in animated mode the image is alt empty and aria-hidden while the labels, scroll hint, and CTA are hidden from assistive tech. The CTA is not focusable. Setting enabled false renders a static card with real alt text.",
  "scroll-reveal-image":
    "The section has an aria-label, but each animated reveal layer is aria-hidden, so its alt text is not announced; only the reduced-motion fallback exposes the final image alt. The effect is scroll-only with no keyboard controls.",
  "scroll-sync-gallery":
    "Images keep their alt text and the section is labelled, but repeated duplicate copies can expose the same alt text more than once to screen readers. The gallery is scroll-driven with no focusable controls; the disabled-animation fallback renders a static grid.",
  "scroll-timeline":
    "The section accepts ariaLabel, panels after the first are aria-hidden when inactive, and a polite live region announces the active year and title. Each panel includes sr-only full text while the oversized year is aria-hidden; there are no keyboard controls beyond native scrolling.",
  select:
    "Base UI supplies combobox and listbox semantics with arrow-key navigation, typeahead, Escape dismissal, and focus return to the trigger. The trigger sets aria-expanded, aria-haspopup, aria-controls, and aria-invalid; consumers must still provide an accessible name via a label or aria-label.",
  separator:
    "By default it renders role presentation with aria-hidden, so screen readers ignore it. Setting decorative false exposes role separator plus aria-orientation for the chosen orientation; it is never focusable and has no keyboard behavior.",
  "services-showcase":
    "When interactive, the stack is a button labelled Service image stack with aria-expanded; click or keyboard activation toggles it and Escape closes it, plus a focus-visible outline. Pointer hover opens it, but focus alone does not. When interactive is false it is a plain div.",
  "shader-text":
    "The root is role img with an aria-label defaulting to the text, while the canvas and sizing node are aria-hidden. There is no keyboard interaction, and WebGL failure falls back to readable static text with the same role and label.",
  "shake-text":
    "The semantic front layer, such as h1 or span, is exposed with the text, while all four colored depth copies are aria-hidden. There are no keyboard controls; the continuous loop and imperative shake handle are motion-only, and reduced-motion users get a static front layer.",
  sheet:
    "Built on Base UI Dialog, so focus is trapped while open, Escape closes the panel, focus returns to the trigger, and SheetTitle and SheetDescription provide the accessible name and description. The default close button has an aria-label of Close.",
  sidebar:
    "SidebarTrigger exposes aria-expanded, Cmd or Ctrl+B toggles the rail, and the mobile drawer is a modal dialog with focus trapping, Escape to close, inert background, and trigger focus restoration. Collapsed group labels become aria-hidden.",
  "silk-aurora":
    "The canvas is aria-hidden and pointer-events-none, while title, subtitle, description, and children render as normal DOM content. Cursor depth is decorative and has no keyboard equivalent, and WebGL failure falls back to a static gradient.",
  skeleton:
    "A plain placeholder div with no role, aria-hidden, or live-region announcement, so screen readers may encounter an unlabeled empty element. Consumers should hide it or label it according to the content it represents.",
  slider:
    "Each thumb is a focusable role slider with aria-valuemin, aria-valuemax, aria-valuenow, orientation, and configurable labels. Arrow keys step, PageUp and PageDown move ten steps, Home and End jump to bounds, and RTL reverses horizontal arrows.",
  "soft-fluid-gradient":
    "The whole effect is aria-hidden with pointer-events-none, including canvas and fallback, so assistive technology ignores it. It is a purely decorative background and contributes no focusable controls or text.",
  "spectra-noise":
    "The effect container and fallback gradient are aria-hidden with pointer-events-none, so screen readers skip the canvas entirely. It is decorative only and exposes no labels, focus targets, or content.",
  spinner:
    "The wrapper exposes role status with aria-label Loading and also renders hidden Loading text. The Lucide icon is decorative. The duplicated label may be announced twice, and callers can override aria-label but not the hidden text.",
  "spiral-media-gallery":
    "The root is a labelled region with aria-roledescription gallery. The 3D card stage is aria-hidden, and passing imageAlts adds a screen-reader-only list describing the source images. The region is focusable: ArrowUp and ArrowDown step one card, PageUp and PageDown step four, and Home resets. Drag and wheel are pointer-only, so the arrow keys provide an equivalent rotation path.",
  "stacked-scroll-gallery":
    "The section has an aria-label, inactive cards are aria-hidden, each image or video has alt or aria-label, and a polite live region announces the active item. There is no keyboard control beyond normal scrolling.",
  "staircase-preloader":
    "The overlay exposes role status with aria-label Page loading, and strips are aria-hidden. Scroll is locked, but focus is not trapped or moved, so keyboard users can tab to content behind the curtain until it exits.",
  "sunlight-effect":
    "The canvas and fallback are aria-hidden with pointer-events-none, so the effect is excluded from the accessibility tree. It is decorative and provides no focusable elements, labels, or content.",
  switch:
    "A native button with role switch, aria-checked, optional aria-invalid, disabled support, and a focus-visible ring. Space and Enter toggle it, but no label or description is generated, so callers must associate visible text or aria-label.",
  tabs: "Triggers are plain buttons with no tablist, tab, tabpanel, aria-selected, or arrow-key navigation. Keyboard users tab through each trigger, activate with Enter or Space, and only the active TabsContent is rendered.",
  "team-slide-reveal":
    "The portrait is a role=button with aria-expanded and aria-controls; Enter or Space opens, Escape closes, and focus moves to the Back button then returns. The story sheet is aria-hidden while closed.",
  "text-morph":
    "Text Morph cycles visible words on a timer and renders plain text with no live-region announcements. Treat the animation as enhancement: keep the surrounding heading meaningful on its own, and don't put the only instance of critical information inside the morph sequence.",
  "text-reveal":
    "A visually hidden span exposes the full text as one readable string while the animated units are aria-hidden, so screen readers do not announce split words. There is no interactive or focus behavior.",
  "text-video-mask":
    "The root exposes role=img with aria-label equal to the text, and the video and mask layers are aria-hidden. With controls enabled those native controls remain hidden from assistive tech and keyboard users.",
  textarea:
    "A native textarea keeps standard keyboard and screen-reader behavior, with a visible focus-visible ring, aria-invalid destructive styling, and disabled opacity. Labels and descriptions must be supplied by the consumer.",
  toast:
    "Error toasts use role=alert and other types role=status; the dismiss button has an aria-label and actions are buttons. Focus is not moved or trapped, Escape is not handled, and auto-dismiss pauses on hover or focus.",
  toggle:
    "Renders a native button with aria-pressed reflecting state, so Enter and Space toggle it and screen readers announce pressed or not pressed. Focus-visible ring and disabled styling are included.",
  "toggle-group":
    "Base UI manages a group with roving tabindex: arrow keys move focus along the orientation axis and loop, while each item exposes aria-pressed. Tab enters and leaves the group; disabled items are skipped.",
  tooltip:
    "Base UI opens the tooltip on pointer hover and keyboard focus, links it to the trigger with aria-describedby, gives the popup role=tooltip, and closes on Escape. Content should stay short and non-interactive because it is not focusable.",
  "tubes-cursor":
    "The WebGL overlay is aria-hidden and pointer-events none, so it exposes nothing to assistive tech and takes no focus or keyboard input. It is purely decorative; interactive content must sit above it.",
  "upload-sound-status":
    "Buttons have visible text and focus-visible rings, but the progress bar lacks role=progressbar and aria-valuenow, and status text is not a live region, so updates are not announced. Completion plays an oscillator ping unless muted.",
  "vertical-image-marquee":
    "The stage exposes role=img with a fixed aria-label, and the duplicated track and all images are hidden from assistive tech. Alt text on items is ignored because each img uses alt empty.",
  "voice-recorder":
    "The record control is a button with a dynamic Start or Stop recording aria-label and aria-pressed, errors use role=status, and playback uses native audio controls. Timer and waveform changes are not announced, and the waveform is decorative.",
  "wave-bars-loader":
    "The wrapper uses role=status with aria-label, defaulting to Loading, and the bars are aria-hidden, so screen readers get one status announcement. The ariaLabel prop customizes the announced text.",
};
