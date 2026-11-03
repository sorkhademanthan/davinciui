// Source-grounded notes for every component page. Keep entries alphabetical.
export const motion: Record<string, string> = {
  accordion:
    "Panel height animates via grid-template-rows: 300ms ease-out opening and 200ms closing, while inner content fades and shifts with a 75ms open delay. The chevron rotates 300ms. The motion-reduce variant disables these transitions.",
  alert:
    "Alert is a static wrapper with no entrance, exit, or state animation; only child controls animate. It does not detect prefers-reduced-motion because there is no motion to suppress.",
  "alert-dialog":
    "The dialog has no open or close animation in this implementation; overlay and popup appear instantly with backdrop blur. No prefers-reduced-motion handling exists because nothing transitions.",
  "ambient-audio-toggle":
    "While playing, waveform dash-offset or bar scale animates; animationSpeed sets duration and intensity amplitude. transition sets color and height crossfades. An inline prefers-reduced-motion media query stops the keyframes but keeps property transitions.",
  "ambient-strip":
    "Expansion and ambient crossfades use spring and ease-out motion. When the user prefers reduced motion, transitions shorten to near-instant fades and the ambient drift is disabled.",
  "animated-metric":
    "The count eases with a cubic-bezier(0.22,1,0.36,1) curve over duration, staggered by delay; value and label fade up over 600ms and 500ms. A matchMedia check and CSS media query skip counting and transitions under reduced motion.",
  "animated-pill-button":
    "Hover or focus expands a circular cyan fill over 620ms, masks a duplicate label, and morphs the dot into an arrow; a scroll entrance also plays. No timing props are exposed. CSS and JS both honor prefers-reduced-motion by removing the wipe.",
  "arc-carousel":
    "Drag release decays by friction, then snap settles on a critically damped spring; autoPlay adds a slow drift and arrow or wheel input eases over 240ms. A matchMedia listener disables drift and shortens jumps under reduced motion.",
  "arcwave-carousel":
    "One requestAnimationFrame loop eases position toward a target with a stiffness/damping spring; drag release feeds velocity into momentum, optional snap rounds to whole slots after interaction, and continuous or step autoplay advances the target. Per-frame geometry is written straight to element refs, and the loop stops once settled with no autoplay pending. prefers-reduced-motion is watched live: autoplay and spring settling are disabled, and position jumps directly to the target.",
  "tilt-flip-polaroid":
    "Pointer tilt retargets rotateX and rotateY motion values through a stiffness 100 / damping 18 spring, and the flip retargets a stiffness 400 / damping 40 spring so rapid clicks reverse without a jump. Reduced motion disables tilt and replaces the 180deg flip with a 150ms opacity crossfade.",
  "aspect-ratio":
    "Static wrapper primitive with no animation or transitions. It does not read prefers-reduced-motion because there is no motion.",
  attachment:
    "The card transitions border colors over 200ms, and uploading or processing states apply animate-pulse to the title. The pulse has no motion-reduce guard, so reduced-motion preference is not detected or honored.",
  avatar:
    "Only the group overlap spacing transitions on hover, and badges do not animate. There is no prefers-reduced-motion detection, though the hover spacing change is minor and non-essential.",
  badge:
    "BadgeDot with pulse renders an animate-ping halo; all other motion is a color transition. There is no prefers-reduced-motion check, so the ping continues when reduced motion is requested.",
  breadcrumb:
    "Motion is limited to color transitions on links and the expander; separators and layout do not animate. No prefers-reduced-motion handling is needed or present.",
  bubble:
    "Only color transitions are used for variant changes; bubbles, tails, grouping, and reactions do not animate. The component is static and does not reference prefers-reduced-motion.",
  "burn-plus":
    "Time-based triggers tween burn progress using duration, transition and transitionBezier, while scroll mode uses scrollSmoothing. prefers-reduced-motion is watched live and jumps straight to the final endpoint without a tween.",
  button:
    "Hover lift, 0.97 press scale, cursor spotlight and gradient sheen animate through 150ms cubic-bezier transitions. motion-reduce removes transitions, hides the pseudo-element effects and cancels the press scale.",
  "button-group":
    "Static layout primitive with no animation of its own. Hover and focus only raise a child's z-index, and the lone motion-reduce:transition-none class has no transition to disable.",
  calendar:
    "Changing months replays a keyed slide using motion-safe animation classes, and day buttons scale on hover over 150ms. CSS motion-reduce disables the slide, transitions and hover/active scaling.",
  card: "Elevated and interactive cards lift with 300ms cubic-bezier shadow transitions, the spotlight fades over 300ms, and CardMedia zooms images over 500ms. motion-reduce removes transitions, spotlight layers, lift and image zoom.",
  carousel:
    "Embla animates slide position from its opts, while dot and progress indicators transition width over 300ms. Autoplay is disabled when prefers-reduced-motion matches at mount, but that check does not update on change.",
  "character-field":
    "A requestAnimationFrame loop mutates glyphs using mutationSpeed plus min and max update delays, with smoothFade and flickerIntensity shaping opacity. prefers-reduced-motion is watched live and renders one static frame when respectReducedMotion is enabled.",
  chart:
    "The wrapper adds no motion. Any animation comes from Recharts itself, such as isAnimationActive on series, and this file has no prefers-reduced-motion handling.",
  checkbox:
    "The box transitions border, background and shadow over 150ms ease-out while the check icon scales and fades in over 150ms. motion-reduce sets transition-none on both.",
  "chromatic-cursor":
    "A pointer-driven canvas trail eases toward the target using tension, with trailLength, fadeSpeed and splitDistance shaping persistence and channel separation. prefers-reduced-motion is checked on pointermove and clears the trail, effectively stopping the effect.",
  "cinematic-card-carousel":
    "Cards move with a Framer Motion spring at stiffness 170 and damping 26, driven by drag, wheel, arrows or autoplay. useReducedMotion swaps the spring for a 200ms tween, removes blur and brightness depth, and disables autoplay.",
  "crumpled-paper-reveal":
    "A hand-integrated spring with a time warp and settle blend drives the unfold, while eased out-of-plane billow and corner curl add paper memory; duration, easing, shape, creaseDepth, ballSize, shadow, and curl tune it. Pointer light eases toward the cursor. prefers-reduced-motion skips the RAF work and renders the finished sheet; autoPlayInterval also disables.",
  "circle-cursor":
    "A requestAnimationFrame loop interpolates position using followSpeed, while opacity and color transition over 120ms and 200ms. prefers-reduced-motion is watched live and disables the follower, restoring the native cursor.",
  "cms-scroll-gallery":
    "Page scroll drives Framer Motion opacity, scale, slide and blur presets, smoothed by a spring derived from transitionSmoothing. useReducedMotion or the reducedMotion prop removes the transforms, but the opacity crossfade remains.",
  collapsible:
    "Panel height animates via grid-template-rows: 300ms ease-out cubic-bezier(0.22,1,0.36,1) on open, 200ms cubic-bezier(0.4,0,0.2,1) on close. motion-reduce:transition-none disables both; no timing props are exposed.",
  combobox:
    "The popup opens and closes instantly with no animation; only the control border, chips, and icons use short CSS color transitions. prefers-reduced-motion is not queried because no motion is present.",
  "context-menu":
    "The popup enters and exits over 150ms with opacity, 4px translate, and 0.96 scale using cubic-bezier(0.23,1,0.32,1). Items press to 0.99 scale in 75ms. motion-reduce:transition-none removes the popup transition and starting transform; no easing props are exposed.",
  "date-picker":
    "The popup animates 150ms opacity, translate, and 0.96 to 0.97 scale with cubic-bezier(0.23,1,0.32,1); calendar month changes use motion-safe keyframe animations, and day buttons use short scale transitions. Reduced motion disables the popup transition and transform via motion-reduce utilities.",
  dialog:
    "The popup rises 16px and scales from 0.98 over 220ms ease-out, exits in 120ms with accelerating easing, and the overlay fades over 200ms. motion-reduce:transition-none disables both, and no duration or easing props are exposed.",
  drawer:
    "Vaul's internal spring physics drive slide-in, drag, snap, and background scaling; the overlay uses a 200ms opacity fade disabled by motion-reduce. No duration or easing props are forwarded, and vaul does not detect prefers-reduced-motion, so sheet movement continues for reduced-motion users.",
  "dropdown-menu":
    "The popup fades, translates 4px, and scales 0.96 over 150ms with cubic-bezier(0.23,1,0.32,1). Check and radio indicators scale in over 150ms, and items press to 0.99. motion-reduce:transition-none disables these transitions and the starting transform.",
  "editorial-image-stack":
    "A single requestAnimationFrame tick drives both layers. Every switchIntervalMs (1100ms default) the fixed center card changes through a 300ms GSAP blur-crossfade with a brief color tint while the seven background cards shuffle to new positions over 360ms ease-out. The stack also drifts slowly through a +/-4.5-degree rotation over nine seconds. Background photographs sit at 0.7 opacity with dark, desaturated filters. The tick stops offscreen and in hidden tabs, and prefers-reduced-motion disables the drift, shuffle, and blur while slowing the image cadence.",
  "editorial-wipe-preloader":
    "A framer-motion progress value drives the wipe, counter, and mask; duration, completionHold, and exitDuration control a 3.8s simulated load and cubic-bezier(0.76,0,0.24,1) vertical exit. useReducedMotion caps loading at 450ms and exit at 250ms when respectReducedMotion is true.",
  "elastic-blob-cursor":
    "A requestAnimationFrame loop interpolates position and deformation, tuned by followStrength, maxStretch, compression, velocitySensitivity, and the smoothing props; only opacity and color use short CSS transitions. It detects prefers-reduced-motion and disables itself entirely, restoring the native cursor.",
  "electric-vijdi-cursor":
    "RequestAnimationFrame draws the bolt from pointer samples; trailLifetime, jitter, speedResponse, branchIntensity, sparkIntensity, and quality tune it, with no easing props. It checks prefers-reduced-motion, ignores pointer input, and clears the trail and sparks when reduction is active.",
  empty:
    "On mount it fades in and rises 8px over 200ms using motion-safe animate utilities; there is no exit animation and no timing props. When prefers-reduced-motion is set, motion-safe suppresses the entrance entirely.",
  "encrypted-text":
    "A requestAnimationFrame loop rewrites characters about every 42ms; scrambleDuration, revealDuration, holdDuration, and loop control the cycle with no easing options. It checks prefers-reduced-motion and immediately renders the resolved text, resuming when the preference clears.",
  field:
    "Field is a static layout primitive with no animation; its parts only apply spacing, borders, and typography. No transitions are defined and reduced-motion handling is unnecessary.",
  "fill-preloader":
    "Framer Motion animates the blue fill via scaleY and slides the overlay up on exit using a fixed cubic-bezier ease. duration, completionHold and exitDuration set timing; useReducedMotion caps progress at 400ms and exit at 250ms while keeping the same sequence.",
  "fluid-cursor":
    "A WebGL fluid simulation injects velocity and dye along pointer movement, controlled by intensity, force, curl, velocityDissipation, dyeDissipation and pointerSmoothing. When prefers-reduced-motion matches at initialization, the loop renders one static frame and skips all simulation; changes to the preference are not observed live.",
  "fluid-particle-text":
    "Particles advect along the cursor path and spring home, tuned by pointerFollow, advectionStrength, pressureStrength, shearStrength, homeStrength, trailLifetime and trailLength. prefers-reduced-motion is detected via matchMedia; when it matches, the canvas shows the resting glyph and the simulation loop does not run.",
  form: "Static composition primitive with no animation, transitions or timing props. It does not check prefers-reduced-motion because it has no motion to reduce.",
  "geometric-preloader":
    "Nine nested squares counter-rotate continuously while a staged progress value ignites them, then the overlay exits through an eased diamond clip-path. duration, holdDuration and exitDuration control timing. prefers-reduced-motion shortens each phase, replaces the clip-path reveal with a fade, and disables square rotation through CSS.",
  "geometric-trail-cursor":
    "Polygons spawn along the pointer path, inflate with speed, settle rotation and scale, then fade from activeColor through hue cycling to ghostColor. activeDuration, colorFadeDuration, ghostDuration, persistence and colorCycleSpeed control timing. With respectReducedMotion enabled, a static background is painted once and no trail is generated.",
  "glass-scene-dock":
    "Scroll progress drives scene opacity and small scale and translate through a spring tuned by transitionDuration, while the highlight glides with a layout spring. useReducedMotion makes the spring near-instant, removes scale and translate drift, disables hover and smooth scrolling, and a media query removes icon transitions.",
  "glitch-liquid-text":
    "The shader distorts glyphs around the pointer, with velocity smear, noise, chromatic separation and glitch slices tuned by distortionStrength, distortionDecay, noiseSpeed and autoAnimate. prefers-reduced-motion disables autoAnimate and glitch, scales down chromatic and light intensity, and slows the shader clock, though direct hover distortion stays active.",
  "gsap-text":
    "Each layer runs an infinite GSAP timeline that translates cloned text vertically with power3.out easing, offset by layerCount and duration. distance sets travel and direction sets flow. The source does not check prefers-reduced-motion and provides no way to disable the looping animation.",
  "hover-card":
    "The panel animates opacity, scale and translate over 150ms with cubic-bezier(0.23,1,0.32,1) using starting and ending styles. openDelay and closeDelay control hover intent rather than animation; motion-reduce removes the transition, translation and scale.",
  "hover-cards":
    "The active card grows via flex-grow and the blurred backdrop crossfades opacity and scale over 680ms with cubic-bezier(0.22,1,0.36,1). useReducedMotion sets all transition durations to 0ms and disables auto-play; the image scale also has motion-reduce:transition-none.",
  "hover-transition":
    "Eight effects transition clip-path, transform, opacity and filter using CSS timing from duration and easing. usePrefersReducedMotion sets the duration to zero and disables tilt, glare and pointer tracking; the controlled active prop can drive changes without hover.",
  "infinite-image-gallery":
    "One requestAnimationFrame loop advances a single rotor rotation by speed degrees per second; React never re-renders per frame. Only the rotor transform changes, with backface-hidden tiles on a preserve-3d cylinder. The loop stops offscreen, while paused, and whenever prefers-reduced-motion matches, leaving the static arrangement intact.",
  "ink-flow":
    "Ink animates continuously through a WebGL fragment shader driven by requestAnimationFrame; the speed prop sets evolution rate, and speed 0 freezes the frame. It detects prefers-reduced-motion, stops the loop, and draws a static frame.",
  input:
    "Border color, background, and focus halo transition over 150ms with ease-out; the caret and text do not animate. motion-reduce:transition-none disables the frame transition when the OS prefers reduced motion.",
  "input-group":
    "Frame border, box-shadow, and background transition over 150ms ease-out, with motion-reduce:transition-none disabling them. Addon buttons also use a 150ms color transition; there is no movement or keyframe animation.",
  "input-otp":
    "This is a static input group; only a CSS color transition on each slot changes state. There is no animation loop or transform motion, so prefers-reduced-motion needs no special handling.",
  "interaction-sound-kit":
    "Only hover lift, icon scale, and the temporary active border animate through CSS transitions; no timing or easing props exist. prefers-reduced-motion is not detected, so hover and active micro-motion still run.",
  "interactive-media-accordion":
    "Card width, radius, media filter, gradient opacity, and text position transition using duration and easing; system reduced motion or the reducedMotion prop shortens duration to zero and caps radius. Autoplay pauses under reduced motion.",
  item: "There is no meaningful motion. Only a CSS transition-colors hover treatment on links and variants changes; no timing or easing props or reduced-motion checks are present because nothing moves.",
  "keyboard-command-sounds":
    "The card is static apart from CSS color transitions and button active scale; no animation loop or timing props exist. prefers-reduced-motion is not detected, so the small press scale still occurs.",
  label:
    "Static wrapper primitive with no animation, timing props, or motion logic. No prefers-reduced-motion handling is needed because nothing animates at all.",
  "lens-drift-grid":
    "Drag inertia, wheel panning, hover nudge, keyboard steps, and optional autoDrift animate the WebGL grid; inertia, wheelSensitivity, hoverNudge, autoDrift, and driftResumeMs control response. prefers-reduced-motion stops inertia, hover nudge, and autoDrift, while drag and arrow keys still redraw.",
  link: "Static link primitive with only a CSS color transition and hover underline; no timing props, keyframes, or animation loop exist. prefers-reduced-motion is not detected because there is no transform or continuous motion.",
  "liquid-chrome":
    "A continuous WebGL shader runs on requestAnimationFrame; speed scales elapsed time and amplitude controls warp detail, while pointer movement offsets distortion when interactive. There is no prefers-reduced-motion detection, so the shader keeps animating.",
  "liquid-chrome-button":
    "The WebGL chrome ring animates continuously and speed scales its motion; speed 0 freezes it. Rendering pauses offscreen, and prefers-reduced-motion stops the loop on a static frame. The 300ms hover and press scale is disabled under motion-reduce.",
  "liquid-reveal-button":
    "A pointer-driven circle clip-path expands and retracts through requestAnimationFrame lerping with fixed rates, not configurable timing props. prefers-reduced-motion is checked and jumps the mask instantly, disables demo-cursor easing, and turns off CSS transitions.",
  "magic-cursor-pro":
    "A spring loop follows the pointer, controlled by stiffness, damping, and mass, while clickSquish adds a 130ms cubic-bezier icon compression. prefers-reduced-motion disables the effect entirely, restores the system cursor, and removes click feedback.",
  marker:
    "Interactive markers and icon chips use 150ms ease-out colour transitions, and the live dot pings via animate-ping. Both are suppressed with motion-reduce, and the marker disables its transition. There are no timing or easing props.",
  "media-text-hover":
    "The media window animates width, margin, opacity, and blur with a Framer Motion spring tuned by springStiffness and springDamping. useReducedMotion forces the window open and sets duration 0, so reduced-motion users see a static reveal.",
  menubar:
    "Menubar popups fade and scale from 95 percent over 150ms using starting and ending style transitions. The component does not detect prefers-reduced-motion, so that animation still runs for reduced-motion users; no timing or easing props are exposed.",
  message:
    "MessageActions fade in over 150ms ease-out on hover or focus and remain visible on touch devices. motion-reduce disables that transition, and the rest of the row is static; there are no animation timing props.",
  "message-scroller":
    "Programmatic scrolling uses native smooth behavior by default, tunable per command or button via behavior. prefers-reduced-motion forces auto scrolling, and the button's 200ms fade and translate are removed with motion-reduce.",
  "motion-hamburger":
    "Top and bottom SVG paths redraw with 620ms stroke-dash transitions, the icon rotates with an overshoot easing, and the middle line collapses. prefers-reduced-motion reduces transition durations to near zero; no timing props are exposed beyond hoverGrowth.",
  "native-select":
    "Only CSS state transitions animate: border, shadow, and background colours over 150ms ease-out, plus the chevron colour. motion-reduce disables them. There is no JavaScript motion or timing prop.",
  "navigation-menu":
    "Popups fade, zoom, and slide over 200ms, the chevron rotates 200ms, and the viewport animates width and height. All these use motion-reduce animate-none or transition-none; timings are fixed rather than prop-controlled.",
  "neon-mesh-bg":
    "The WebGL ribbon evolves using speed and animate, pauses offscreen and when the tab is hidden, and respectReducedMotion defaults true so prefers-reduced-motion renders a single static frame. quality and maxDpr trade resolution for performance.",
  noiser:
    "The turbulence seed advances at the fps rate while animated is true, pausing offscreen and when the page is hidden. If prefers-reduced-motion matches at mount, the effect returns early and grain stays static; later preference changes are not observed.",
  "nudge-button":
    "Four aria-hidden rings scale outward with staggered delays on hover, press, or keyboard focus, and duration scales the 850ms base timeline. matchMedia detects prefers-reduced-motion and replaces rings with a 220ms background tint.",
  "orbit-spiral-gallery":
    "The spiral advances via autoSpeed, follows wheel and page scroll scaled by scrollSensitivity, and eases toward its target using smoothing. matchMedia reduced motion stops auto-rotation and removes smoothing while scroll movement remains.",
  pagination:
    "Static layout primitives with no animation of their own. Only the shared Button styles provide short hover and focus color transitions, and this file implements no reduced-motion handling.",
  "pixel-flow":
    "A requestAnimationFrame loop advances noise time, with speed setting the rate, flowStrength and warpStrength shaping movement, and animate freezing it. respectReducedMotion uses matchMedia to draw one static frame, and offscreen rendering pauses by default.",
  "pixel-preloader":
    "The column frontier, spikes, percentage, and fade exit animate; duration, completionHold, and exitDuration control timing. matchMedia reduced motion caps loading at 500ms, skips column simulation, and shortens the fade, though HUD bars still pulse.",
  "pixel-wipe-carousel":
    "A rightward reveal wipes in a mosaic that resolves from pixelSize blocks to sharp imagery, timed by interval and transitionDuration with an ease-out quint curve. matchMedia reduced motion disables autoplay entirely and leaves a static first frame.",
  popover:
    "The popup animates 150ms ease-out opacity and scale from 95 percent with a side-dependent slide, driven by Base UI starting and ending data attributes. No timing props exist, and motion-reduce transition-none removes the animation.",
  "preloader-pro":
    "A piecewise curve drives the counter and scaleX line, then the panel slides away and the hero settles with ambient drift. duration, completionHold, exitDuration, and loopHold set timing; matchMedia reduced motion shortens phases and swaps the slide for a fade.",
  "profile-carousel":
    "The track translates with a cubic-bezier ease over transitionDuration and snaps back below the 22 percent drag threshold, while autoplay steps on autoplayInterval. matchMedia reduced motion sets duration to zero, normalizes loop position instantly, and disables autoplay.",
  progress:
    "Determinate fills transition width over 300ms ease-out, and a null value runs a 1.2s infinite horizontal sweep. motion-reduce utilities disable both the width transition and the keyframe animation, and no timing props are exposed.",
  questionnaire:
    "Steps switch instantly through the hidden attribute; only short color transitions on choices and buttons plus an unconfigured width transition on the progress bar animate. The file contains no prefers-reduced-motion detection.",
  "radial-fan-deck":
    "Card rotation and translation interpolate directly from scrollProgress or viewport scroll position with no easing props or transitions. matchMedia reduced motion forces progress to 1, showing the fully fanned, static deck.",
  radio:
    "The checked dot animates scale from 50 to 100 percent and fades opacity, while border and background colors transition over 150ms ease-out. There are no timing props; motion-reduce transition-none makes the state change instant.",
  "random-text-reveal":
    "Characters animate opacity plus optional x, y, scale, and rotation through GSAP; duration, minDelay, maxDelay, ease, animationMode, replay, and loop control timing and order. A matchMedia listener disables the timeline and renders the final state when prefers-reduced-motion is set.",
  "rolling-text":
    "Each character track rolls vertically with WAAPI transforms and an optional blur; rollDuration, staggerDelay, blurIntensity, pattern, and autoPlay control the sequence. Reduced motion is detected with matchMedia, which skips playback and renders still characters.",
  "scroll-area":
    "A static wrapper primitive with no choreographed motion. Only CSS color and box-shadow transitions occur on viewport focus and scrollbar hover, and there is no prefers-reduced-motion handling beyond those brief color transitions.",
  "scroll-media-expand":
    "Scroll progress drives width, height, border radius, image scale, label offsets, fades, and CTA reveal with smootherstep easing; sectionHeight and smoothing control the mapping. When prefers-reduced-motion is set, the component renders a static accessible card instead.",
  "scroll-reveal-image":
    "Scroll progress, smoothed by useSpring, drives clip-path reveals of each image; scrub sets spring mass while backgroundScale and imageScale are static transforms. useReducedMotion renders only the last image as a static section.",
  "scroll-sync-gallery":
    "Columns translate on the y axis from one normalized scroll progress with optional smoothing, and introZoom briefly scales the wall; presets and travel set directions and distance. A matchMedia check replaces the effect with a static grid for prefers-reduced-motion.",
  "scroll-timeline":
    "Panels collapse horizontally via clip-path and the oversized year rotates around its bottom-left anchor as scroll progress changes; scrollPerItem, easing, rotationAmount, and smoothing tune it. prefers-reduced-motion or disableAnimation renders a static accessible list.",
  "segmented-image-carousel":
    "The canvas redraws a shuffled grid of slices with smootherStep easing; interval, transitionDuration, rows, and columns control pacing and granularity, and pauseOnHover pauses advancement. Reduced motion is detected via matchMedia, which cancels work and draws a still frame.",
  select:
    "The popup fades, zooms, and slides over 150ms using data-state animation classes, while trigger, icon, and item color transitions are CSS-only. motion-reduce classes disable the popup animation and the color transitions when prefers-reduced-motion is set.",
  separator:
    "A static divider primitive with no meaningful motion. It has no animation or transition logic, and no prefers-reduced-motion handling is needed.",
  "services-showcase":
    "Cards unfold with 680ms cubic-bezier transforms and staggered delays, fine-pointer movement adds a damped perspective tilt, and autoPlay runs a 5.8s CSS loop. A reduced-motion media query removes transitions and animations, and the tilt script also checks the preference.",
  "shader-text":
    "A continuous WebGL fragment shader animates inside the glyph mask; speed scales shader time, while preset, scale, and softness change the pattern. A matchMedia listener freezes rendering to a static frame for prefers-reduced-motion, and animation pauses offscreen or in hidden tabs.",
  "shake-text":
    "Four ghost layers translate, rotate, and skew through GSAP sine.inOut timelines behind a stationary front layer; shakeIntensity, shakeDuration, shakeRepeat, trigger, and autoPlay control it. A matchMedia listener stops autoplay and makes shake a no-op when prefers-reduced-motion is set.",
  sheet:
    "The overlay fades over 200ms and the panel slides from its chosen side over 300ms using CSS transitions driven by starting and ending data styles. There is no prefers-reduced-motion handling, so the directional slide always runs.",
  sidebar:
    "Uses framer-motion with useReducedMotion for the spring width morph, 0.36s drawer, staggered submenus, and label fades. Reduced motion makes width instant and shortens transitions. Expand on hover is pointer only.",
  "silk-aurora":
    "The shader continuously evolves using speed, intensity, grain, vignette, and mouseInfluence. On mount it checks prefers-reduced-motion, then freezes shader time, sets speed and mouse influence to zero, but does not listen for later changes.",
  skeleton:
    "Only the Tailwind animate-pulse opacity cycle runs. There are no timing or easing props and no prefers-reduced-motion check, so the pulse continues when reduced motion is requested.",
  slider:
    "Only the thumb press scale and transform transition animate; the fill and thumb position change instantly with the value. Timing comes from CSS defaults, and prefers-reduced-motion is not detected.",
  "soft-fluid-gradient":
    "A single WebGL shader advances simulation time at speed and reshapes loops with density; speed zero freezes the field. It detects prefers-reduced-motion on mount and on change, stopping the frame loop while keeping the current static frame.",
  "spectra-noise":
    "Shader time advances by animationSpeed; paused or zero speed freezes the field, and rendering also stops offscreen or on hidden tabs. prefers-reduced-motion is detected initially and on change, halting the loop at a static frame.",
  spinner:
    "Both the wrapper and Loader2 icon use the Tailwind animate-spin rotation, with no duration, easing, or reduced-motion handling. Size does not change animation timing.",
  "stacked-scroll-gallery":
    "Card transforms and dimming follow scroll progress, with smoothing, easing, dimming, and dimStrength props; videos pause when offscreen. prefers-reduced-motion disables smoothing and autoplay but not the stacked movement itself.",
  "staircase-preloader":
    "Columns lift upward with a cubic-bezier(0.76,0,0.24,1) ease, controlled by holdDuration, exitDuration, and stagger. useReducedMotion caps the hold, removes stagger, and shortens exit to 250ms while still moving the strips.",
  "sunlight-effect":
    "Shader time advances by speed while intensity, density, spotty, bloom, and transform props shape the rays. prefers-reduced-motion is checked on mount and on change; the frame loop stops and holds a static frame.",
  switch:
    "The thumb translates horizontally and the track changes color through CSS transitions. No timing or easing props exist and prefers-reduced-motion is not detected, so the thumb movement remains under reduced motion.",
  tabs: "Triggers animate background, text, shadow, and border color through transition-all; TabsContent swaps instantly and there is no panel animation. No timing props or prefers-reduced-motion handling are present.",
  "team-slide-reveal":
    "The portrait image scales and the story sheet slides up over duration milliseconds (default 480) with a cubic-bezier ease. Text fades and lifts; motion-reduce:transition-none disables all transitions.",
  "text-morph":
    "The fluid morph runs on a per-word timer controlled by the interval and morphDuration props. When the visitor prefers reduced motion, the component swaps words instantly with no blur or morph transition.",
  "text-reveal":
    "GSAP ScrollTrigger scrubs per-unit opacity, color, and optional x, y, scale, or blur between startPosition and endPosition; revealSoftness sets stagger and scrubSmoothness sets lag. respectReducedMotion (default true) renders the final state when prefers-reduced-motion matches.",
  "text-video-mask":
    "Video playback animates, not CSS; autoplay, loop, muted, and preload props control it, with no timing or easing props. It listens to prefers-reduced-motion and either shows the solid fallback or pauses, per reducedMotion.",
  textarea:
    "Static wrapper primitive with no meaningful motion; styling only smooths color and shadow, with no keyframes, transitions, or reduced-motion handling.",
  toast:
    "Toasts fade and slide in over 200ms, exit with a 200ms opacity and translate transition, and the loading icon spins. motion-reduce:animate-none and motion-reduce:transition-none suppress these; duration controls auto-dismiss timing.",
  toggle:
    "No meaningful motion; transition-all only smooths background, border, and text colors on state change. There is no duration or easing prop and no prefers-reduced-motion handling.",
  "toggle-group":
    "No meaningful motion; transition-all only smooths color and border changes. There is no timing or easing prop and no prefers-reduced-motion detection.",
  tooltip:
    "The popup fades and scales from 95 percent with a 100ms CSS transition and animate-in classes. There is no reduced-motion handling, so the fade and zoom still run under prefers-reduced-motion.",
  "tubes-cursor":
    "The engine animates tubes chasing the pointer with inertia and bloom; idleMotion controls ambient drift and clicks can randomize colors. No timing props exist, and prefers-reduced-motion is checked once at mount, skipping the renderer entirely.",
  "upload-sound-status":
    "While uploading the progress fill shows 0.7s linear diagonal stripes; otherwise width changes with a 0.2s transition. A prefers-reduced-motion media query disables the stripes, but the width transition still applies.",
  "vertical-image-marquee":
    "The duplicated column scrolls one sequence height with a linear infinite CSS animation; duration sets seconds per sequence and pauseOnHover pauses on pointer. prefers-reduced-motion pauses the track via animation-play-state.",
  "voice-recorder":
    "A red status dot pulses while recording and the button scales on hover and press; the waveform bars are static, not animated. No duration or easing props exist and prefers-reduced-motion is not detected.",
  "wave-bars-loader":
    "Four bars morph height through keyframes with linear easing; speed divides a 1.8s base duration, and paused freezes playback. A prefers-reduced-motion media query disables the animation, leaving static staircase heights.",
};
