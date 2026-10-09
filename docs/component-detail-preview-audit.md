# Component Detail Preview Audit

Date: 2026-10-09  
Scope: `/docs/components/[slug]` and `/experience/components/[slug]`

## Goal

Keep the current vertical component-detail structure—component preview first, documentation below—while making preview behavior consistent, personalizable, responsive, accessible, and shared across every component surface.

## Findings

### Critical

1. **Fullscreen broke after the vertical layout restructure.**
   - The expand control changes state, hides the site header, and locks body scrolling, but the preview does not expand.
   - Root cause: `DocsPreviewWrapper` still searches for the removed `data-docs-preview-shell` and `data-docs-right-column` elements from the old split layout.
   - Required fix: fullscreen must be owned by the preview wrapper and must not depend on page-column selectors.
   - Status: **implemented and browser-validated on 2026-10-09.**

2. **Personalization is not a complete product pipeline.**
   - Only a subset of component docs exposes Personalize.
   - Several personalized previews still show static Usage code, so copied code can disagree with the configured preview.
   - Personalization does not consistently propagate to variants, gallery cards, registry examples, or exported code.

3. **There is no single preview contract.**
   - Gallery card, component-detail preview, example variant, fullscreen, and personalized preview are separate implementations.
   - A component can be correct on one surface but differently sized, themed, clipped, or interactive on another.

4. **Some preview-formatting APIs are dead or incomplete.**
   - `unstyledPreview` was passed by many docs pages but was not consumed by `DocsPageLayout`.
   - `previewCode` is required by the layout API but is not used by the main preview.
   - Component authors therefore configure options that do not reliably affect the rendered result.
   - Status: **`unstyledPreview` is now wired through the shared layout; `previewCode` remains unresolved.**

### Structure and consistency

5. **A fixed preview height is applied to components with very different needs.**
   - Small controls and immersive visual components both receive approximately the same 420–480px frame.
   - This creates empty space for simple components and clipping or constrained motion for tall, portrait, scroll-driven, and fullscreen components.
   - The shared stage previously exposed only a `min-height`, so `h-full` canvas/WebGL previews collapsed to 0px and `h-full` iframes fell back to 150px.
   - Status: **the collapsed-stage defect is fixed; a capability-driven height/aspect-ratio contract is still needed.**

6. **Scrollable-preview behavior is a component-specific exception.**
   - The current implementation is coupled to Text Reveal rather than describing a reusable overflow mode.
   - Other scroll-based or tall components do not share a consistent scrolling policy.

7. **Examples are mounted twice.**
   - `examples` appear as tabs in the main preview and again as full vertical sections below it.
   - This duplicates content and can mount expensive animations, canvases, media, or WebGL scenes more than once.

8. **Personalization ownership becomes ambiguous when examples exist.**
   - The main preview and every example wrapper receive the same `personalizeContent`.
   - Multiple wrappers can register against the global doc store and create multiple drawer portals instead of one page-owned controller.

9. **Docs and Experience use different component-detail shells.**
   - `/docs/components` includes left navigation plus an On This Page rail.
   - `/experience/components` includes only the left navigation.
   - The same component changes width and navigation behavior depending on its entry route.

10. **The On This Page rail is missing on Experience component pages.**
    - The documentation is now vertically long, so losing section navigation makes the Experience route harder to scan.

11. **The preview toolbar is not capability-driven.**
    - Search, source, personalization, reload, fullscreen, theme, and variant controls compete for space.
    - Components do not declare which controls or behaviors they support, and the toolbar becomes crowded on narrow screens.

12. **Reload does not reset personalized state.**
    - Reload remounts the preview subtree but keeps the component's external Zustand configuration.
    - Users can reasonably interpret Reload as returning to the default preview, but it currently replays the customized state.

### Accessibility and performance

13. **Fullscreen and drawers need complete modal behavior.**
    - Fullscreen previously had no Escape handling, focus containment, or focus restoration.
    - Personalize and Source drawers still need a separate pass for `aria-modal`, focus trapping, Escape dismissal, and focus return.

14. **Some drawer controls suppress focus outlines without a replacement.**
    - Keyboard users can lose the visible focus indicator on close/back controls.

15. **Preview toolbar controls are undersized for touch.**
    - The current 32×32px icon buttons should receive a larger effective touch target on mobile.

16. **Heavy previews are not centrally paused or deferred offscreen.**
    - Duplicated examples can keep animation loops, media, audio, canvases, or WebGL work alive farther down the page.
    - The shared preview layer needs visibility-aware mounting or pausing.

## Recommended implementation order

1. Repair fullscreen against the current vertical layout.
2. Define one preview contract for height, aspect ratio, overflow, background, theme, fullscreen, controls, and personalization.
3. Move personalization to one page-owned state source and generate Usage/copy output from the same state.
4. Consolidate Docs and Experience onto one component-detail shell.
5. Remove duplicate example mounting and pause or defer heavy offscreen previews.
6. Complete drawer, toolbar, keyboard, focus, and touch-target accessibility.

## Fullscreen acceptance criteria

- Expands the selected preview to the complete viewport on Docs and Experience routes.
- Uses the preview's exact on-page rectangle as the fullscreen enter and exit origin, without remounting the active component.
- Uses transform-only spatial motion, a faster exit than entry, and no transition when reduced motion is requested.
- Does not depend on removed split-layout or right-column DOM markers.
- Keeps the active component and selected variant mounted while expanding.
- Hides the site header, locks background scrolling, and restores the exact previous styles on exit.
- Closes from the toolbar and with `Escape`.
- Keeps keyboard focus inside the expanded preview and restores focus to the trigger after exit.
- Fits desktop and mobile viewports without horizontal overflow.
- Preserves interactive, scrollable, animated, light-theme, and dark-theme previews.
- Does not prevent Source, Personalize, Search, Reload, or Theme controls from working.

## Fullscreen validation record

- Experience route: Pixel Flow expanded to the complete 1280×720 viewport.
- Docs route: Pixel Flow expanded to the complete 1280×720 viewport with the docs right rail underneath the modal layer.
- Mobile viewport: the expanded preview measured exactly 390×844 with no document-level horizontal overflow.
- `Escape` closed fullscreen, restored body scrolling and the site header, and returned focus to the expand trigger.
- Opening Source from fullscreen closed fullscreen cleanly and displayed the source drawer.
- Search opened above fullscreen without collapsing the preview.
- Fullscreen now expands from the preview rectangle over 420ms and returns to the same rectangle over 320ms. Sampled desktop frames progressed from 626×420 at `(24, 340)` through 662×661 at `(6, 87)` to the complete 674×745 test viewport; collapse followed the same path in reverse.
- `Escape` uses the animated collapse path, then restores body scrolling and focus to the expand trigger.
- At 390×844, the transition completed at exactly 390×844 without document-level horizontal overflow and returned to the 358×420 inline preview.

## Preview structure validation record

Validated on 2026-10-09 after changing the shared preview surface to a stretching grid container and making embedded demo iframes fill that surface:

- Lens Drift Grid: preview shell 996×480, stage 994×434, rendered canvas 994×434.
- Text Video Mask: preview shell 996×606, stage 994×560, with its masked typography visible and centered in the component-owned stage.
- Pixel Preloader: stage and iframe now both use the standardized 600px preloader height instead of the earlier browser-default 150px iframe height.
- Horizontal Scroll Gallery: preview shell 996×686, stage and iframe both 994×640.
- Scroll Sync Gallery: preview shell 996×646, stage and iframe both 994×600.
- Silk Aurora: preview shell 996×480, stage and WebGL canvas both 994×434.
- Narrow mobile at 390×844: Lens Drift Grid measured 356×374 inside a 358×420 shell; Scroll Sync Gallery's stage and iframe both measured 356×600; neither route introduced document-level horizontal overflow.
- Fullscreen regression check: Silk Aurora expanded to exactly 1280×720, with a 1280×676 preview stage below the 44px toolbar and background scrolling locked.
- Hover Cards follow-up: its `size` query container combined with a `min-height` made all block-axis container units resolve to 0px in the detail preview. The component now keeps inline-size queries for responsive width and derives vertical composition from its observed rendered height. A real pointer hover changed the third card to `aria-pressed="true"` and expanded it from 220px to 361px; fullscreen measures 701px tall with a 452px active portrait; the 289×190 catalog preview continues to autoplay; and the 390px viewport has no document overflow.
- Preloader height follow-up: Fill, Staircase, Pixel, Editorial Wipe, Geometric, and Preloader Pro now use the same 600px detail-preview stage as the Cursor Effects previews. Each measured 646px including the shared 46px toolbar, with its iframe filling the complete 600px stage.
- Orbit Spiral Gallery card follow-up: live catalog previews now remain mounted only while inside a 300px viewport margin. Before this change, scrolling through the catalog retained 14 canvases and 9 WebGL contexts; afterward, only the nearby card canvases remain mounted. Orbit remounted its 305×190 canvas after leaving and re-entering the viewport, and screenshots taken one second apart confirmed its autoplay continued rendering distinct frames.
