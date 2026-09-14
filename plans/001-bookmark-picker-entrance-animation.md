# 001 — Animate the entrance of every `.bookmark-picker` dialog

- **Status**: DONE
- **Commit**: fe27d3a
- **Severity**: MEDIUM
- **Category**: Missed opportunities / Purpose & frequency
- **Estimated scope**: 1 file (`styles/main.css`), 2 rules touched, 2 new `@keyframes` blocks added. No JS changes required.

## Problem

`.bookmark-picker` (full-screen dimmed backdrop) and `.bookmark-picker-sheet`
(the centered card inside it) are the shared building blocks for every modal
dialog in the app: the watch-status picker, the tab-settings single/multi
field pickers, the rating star picker, the comment editor, the collection
picker, and the share dialog. All of them are built the same way in JS —
`document.createElement('div')`, set `className = 'bookmark-picker'` (or a
combined class like `'bookmark-picker-sheet tab-settings-picker-sheet'`),
then `appendChild` it straight into the DOM. There is currently **zero**
entrance animation anywhere in this shared CSS — the dialog simply pops into
existence instantly.

Current code, `styles/main.css:4049-4072`:

```css
.bookmark-picker {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.bookmark-picker-sheet {
  width: 560px;
  background: #262626;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
}
```

This is one of the most-used interaction surfaces in the whole app (every
"pick a status", "rate this title", "write a comment" flow goes through it),
so fixing it once here fixes the feel of ~7 different flows at once.

## Target

Use plain CSS `@keyframes` that auto-play on mount — **not** a
`transition` + class-toggle dance. `@keyframes` on an element plays
automatically the instant that element is inserted into the DOM, so this
requires **no JS changes at all**: every one of the ~7 places that already
does `document.createElement(...); el.className = 'bookmark-picker'; ...;
container.appendChild(el);` keeps working unmodified and just starts
animating in. This also matches the existing repo convention of using a
`@keyframes` class for a one-shot reveal (see `.popular-desc-updated` /
`@keyframes popular-desc-fade-in` in the same file).

The backdrop only fades (no scale — it's full-bleed, there's nothing to
scale from). The sheet fades **and** scales up from `0.95`, never from `0`
(per this project's motion rules: nothing in the real world appears from
nothing). Both are centered dialogs, so `transform-origin: center` — the
default — is correct here and must **not** be changed to a trigger-anchored
origin (that rule only applies to popovers/dropdowns anchored to a button;
modals are explicitly exempt).

```css
/* target — styles/main.css:4049-4072 */
@keyframes bookmark-picker-backdrop-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.bookmark-picker {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  animation: bookmark-picker-backdrop-in 150ms ease-out;
}

@keyframes bookmark-picker-sheet-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.bookmark-picker-sheet {
  width: 560px;
  background: #262626;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
  animation: bookmark-picker-sheet-in 200ms cubic-bezier(0.23, 1, 0.32, 1);
}
```

Duration/easing sourced from AUDIT.md §2 (modals: 200–500ms budget, using
the low end since this is a fast TV D-pad UI where snappier already reads
correctly elsewhere) and §3 (scale from 0.9–0.97, never 0).

## Repo conventions to follow

- Keyframe-based one-shot reveal on mount is an established pattern already
  used in this file for `.popular-desc-updated` /
  `@keyframes popular-desc-fade-in` (search for that name in
  `styles/main.css`) — follow the same shape: a small `@keyframes` block
  placed directly above the rule that uses it, named
  `<component>-in`/`<component>-fade-in`.
- This app has no CSS custom-property tokens yet (durations/curves are
  hand-typed per rule everywhere in this file) — do not introduce new
  tokens as part of this plan; just hand-type the values above, matching
  every other rule in the file.
- Do not touch any `[data-focusable]` or `.focused` rules — this plan is
  about the dialog container's own mount animation, not D-pad focus rings.

## Steps

1. Open `styles/main.css`. Locate the `.bookmark-picker { ... }` rule
   (search for `.bookmark-picker {` — do not match `.bookmark-picker-sheet`,
   `.bookmark-picker-title`, `.bookmark-picker-item`, etc., only the exact
   base selector).
2. Immediately above that rule, insert the `@keyframes
   bookmark-picker-backdrop-in { ... }` block shown in Target.
3. Inside the `.bookmark-picker { ... }` rule body, add the line
   `animation: bookmark-picker-backdrop-in 150ms ease-out;` as the last
   declaration (after `-webkit-backdrop-filter`). Do not remove or reorder
   any existing declaration.
4. Locate the `.bookmark-picker-sheet { ... }` rule directly below it.
5. Immediately above that rule, insert the `@keyframes
   bookmark-picker-sheet-in { ... }` block shown in Target.
6. Inside the `.bookmark-picker-sheet { ... }` rule body, add the line
   `animation: bookmark-picker-sheet-in 200ms cubic-bezier(0.23, 1, 0.32, 1);`
   as the last declaration (after `box-shadow`). Do not remove or reorder
   any existing declaration.
7. Do not touch any other file. Do not add or change any JavaScript.

## Boundaries

- Do NOT touch any JS file (`src/screens/*.js`, `src/app.js`) — this is a
  pure-CSS, mount-triggered animation and needs no JS changes.
- Do NOT implement an exit/close animation in this pass. `.remove()` is
  called directly from ~20 scattered click handlers across
  `src/screens/details.js` and `src/screens/tab-settings.js` (confirmed via
  `grep -rn "picker.remove()\|overlay.remove()" src/`); safely intercepting
  all of them to delay removal for an exit transition is a separate,
  larger piece of work and explicitly out of scope here. If asked to add
  exit animation later, that should be its own plan.
- Do NOT add `transform-origin` overrides — the default `center` origin is
  correct for these centered dialogs.
- Do NOT change `.bookmark-picker`'s or `.bookmark-picker-sheet`'s any
  other property (background, blur, border-radius, box-shadow, sizing).
- Do NOT touch combined-class variants like `.tab-settings-picker-sheet`,
  `.rating-picker-sheet`, `.comment-editor-sheet` — they inherit the base
  `.bookmark-picker-sheet` animation automatically since every dialog sheet
  element carries the `bookmark-picker-sheet` class alongside its modifier
  class (confirmed via `grep -rn "className = 'bookmark-picker" src/`).
- If the current code at `styles/main.css:4049-4072` doesn't match the
  Problem section verbatim (drift since commit `fe27d3a`), STOP and report
  instead of improvising — do not guess at how to adapt the animation to
  changed markup.

## Verification

- **Mechanical**: no build step in this project (`index.html` loads
  `styles/main.css` directly) — just confirm the file has no CSS syntax
  errors by counting braces: `python3 -c "s=open('styles/main.css').read(); print(s.count('{'), s.count('}'))"` should print two equal numbers, and the count should be exactly 2 higher than before this change (one new rule pair for each of the two new `@keyframes` blocks... actually `@keyframes` blocks contain nested rule blocks too — just confirm the two counts are equal to each other, that's sufficient to catch a syntax slip).
- **Feel check** (requires deploying to the real Tizen TV per this repo's
  own workflow — see any recent commit message in `git log` for the
  docker-based build/install/CDP steps, or ask the user to check on their
  PC):
  - Open any dialog that uses `.bookmark-picker` (e.g. press OK on a
    title's watch-status button on the Details screen) and confirm the
    dimmed backdrop fades in and the white/dark card scales up from
    slightly smaller than full size — it should **not** pop in at full
    size instantly, and should **not** appear to grow from nothing
    (`scale(0)`).
  - Confirm the card's growth is centered (it should get bigger evenly in
    all directions, not slide in from one edge) — this is what the default
    `transform-origin: center` gives you for free.
  - Open and close the same dialog rapidly several times in a row (spam
    OK then Back) and confirm each fresh open still plays the animation
    correctly from the start — since each open creates a brand-new DOM
    element, there is no interruption/restart concern here, but confirm
    nothing looks broken/flickery under rapid repeat opens.
  - Repeat for at least 3 different dialogs — e.g. the tab-settings genre
    picker (`TabSettingsScreen.openMulti`), the rating picker
    (`DetailsScreen.showRatingPicker`), and the collection picker
    (`DetailsScreen.showCollectionPicker`) — to confirm the shared class
    genuinely covers all of them without a per-dialog fix.
- **Done when**: every dialog built on `.bookmark-picker` /
  `.bookmark-picker-sheet` visibly fades+scales in on open, using exactly
  the durations/curves specified above, with no JS files modified.
