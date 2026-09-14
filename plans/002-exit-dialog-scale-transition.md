# 002 — Smooth the exit-dialog button scale so it doesn't snap

- **Status**: DONE
- **Commit**: fe27d3a
- **Severity**: MEDIUM
- **Category**: Physicality & origin / Interruptibility
- **Estimated scope**: 1 file (`styles/main.css`), 1 rule touched (one line added).

## Problem

The app-exit confirmation dialog's buttons (Cancel / Exit, rendered by
`App.showExitDialog` in `src/app.js`) scale up slightly when D-pad-focused:

```css
/* src/app.js creates these buttons with data-focusable="true" (lines 184, 191) */

/* styles/main.css:90-96 — current */
.exit-btn {
  padding: 12px 32px;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 500;
  border: 2px solid transparent;
}

/* styles/main.css:108-112 — current */
.exit-btn.focused {
  box-shadow: 0 0 0 4px rgba(240, 78, 92, 0.5);
  outline: none !important;
  transform: scale(1.05);
}
```

Because both buttons have `data-focusable="true"`, they already inherit
this app-wide base rule (`styles/main.css:50-52`):

```css
[data-focusable] {
  transition: box-shadow 0.15s ease-out, background-color 0.15s ease-out;
}
```

That base rule's `transition` property does **not** include `transform`.
Since `.exit-btn` itself declares no `transition` of its own, the inherited
one from `[data-focusable]` is all that's active on these buttons. The
result: when focus moves onto Cancel/Exit, the pink focus ring
(`box-shadow`) fades in smoothly over 150ms, but the `scale(1.05)` snaps
instantly with no interpolation at all — two properties changing at the
same moment, one animated and one not, which reads as broken/jerky. This is
the app's exit-confirmation screen — the one place a snap is most likely to
be noticed since the user is making a deliberate, higher-stakes choice.

## Target

Add `transform` to a `transition` declared directly on `.exit-btn` (its
always-present base state, not `.exit-btn.focused`) so the scale animates
smoothly in **both** directions — focusing in and blurring back out. Putting
the transition only on `.focused` would only guarantee smooth motion when
the class is *added*; when it's removed on blur, the `transition` property
would disappear from the computed style at the same instant the `transform`
reverts, and the un-scale would snap back instead. This exact
base-class-always-has-the-transition pattern is how every other
focusable element in this codebase avoids that problem — see Repo
conventions below.

```css
/* target — styles/main.css:90-96 */
.exit-btn {
  padding: 12px 32px;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 500;
  border: 2px solid transparent;
  transition: box-shadow 0.15s ease-out, background-color 0.15s ease-out, transform 0.15s ease-out;
}
```

`styles/main.css:108-112` (`.exit-btn.focused`) stays **exactly as-is** —
no change needed there; it already has the `transform: scale(1.05);` value
that will now animate correctly because of the base-rule change above.

## Repo conventions to follow

- This codebase's established pattern for "a focusable element needs its
  own extra transitioned property beyond the base box-shadow/background"
  is to restate the *full* transition list on the component's own base
  rule (not on `.focused`), appending the extra property at the end. The
  cleanest existing exemplar is `.home-tab` at `styles/main.css:606`:
  ```css
  .home-tab {
    /* ...other declarations... */
    transition: background 0.2s, color 0.2s, box-shadow 0.15s ease-out;
  }
  ```
  Follow this exact shape: keep `box-shadow 0.15s ease-out,
  background-color 0.15s ease-out` verbatim (matching the base
  `[data-focusable]` rule's values so nothing changes for those two
  properties), then append `, transform 0.15s ease-out`.
- Every focus-ring transition in this file uses `0.15s ease-out` — do not
  introduce a different duration or curve for the transform.

## Steps

1. Open `styles/main.css`. Locate the `.exit-btn { ... }` rule (search for
   `.exit-btn {` — this is the base rule, distinct from `.exit-btn-cancel`,
   `.exit-btn-confirm`, and `.exit-btn.focused`, all of which are separate
   rules nearby).
2. Add one new declaration as the last line inside that rule's body, after
   `border: 2px solid transparent;`:
   ```css
   transition: box-shadow 0.15s ease-out, background-color 0.15s ease-out, transform 0.15s ease-out;
   ```
3. Do not modify `.exit-btn-cancel`, `.exit-btn-confirm`, or
   `.exit-btn.focused` — they are unaffected by this fix and must stay
   byte-identical.
4. Do not touch any other file.

## Boundaries

- Do NOT change the scale value (`1.05`) or the box-shadow value on
  `.exit-btn.focused` — only the base `.exit-btn` rule gets the new
  `transition` line.
- Do NOT add a transition to `.exit-btn.focused` itself — it must go on the
  base `.exit-btn` rule, per the Target/Repo-conventions reasoning above,
  or the fix won't work symmetrically on blur.
- Do NOT touch `src/app.js` — no JS change is needed for this fix.
- If `styles/main.css:90-96` doesn't match the Problem section's current
  code verbatim (drift since commit `fe27d3a`), STOP and report instead of
  guessing where to add the line.

## Verification

- **Mechanical**: confirm brace balance after the edit:
  `python3 -c "s=open('styles/main.css').read(); print(s.count('{'), s.count('}'))"` — the two numbers must be equal.
- **Feel check** (on the real Tizen TV, or by inspecting in a desktop
  browser's DevTools if the TV isn't reachable — see recent `git log`
  commit messages for the docker build/install/CDP workflow used
  throughout this project):
  - Trigger the exit dialog (press Back from the Home screen with no
    screen history) and D-pad left/right between Cancel and Exit several
    times.
  - Confirm the button smoothly grows to 105% size at the same rate the
    pink ring fades in — no visible "jump" the instant focus lands.
  - Confirm moving focus *away* from a button also smoothly shrinks it
    back to 100% (not an instant snap) — this is the direction that was
    broken before the fix and is the one most likely to still be wrong if
    the transition was mistakenly placed on `.focused` instead of the base
    rule.
  - In DevTools' Animations panel (if inspecting on desktop), set playback
    to 10% and confirm `transform` and `box-shadow` visibly interpolate
    over the same ~150ms window, moving in lockstep.
- **Done when**: focusing and un-focusing either exit-dialog button
  animates the scale smoothly in both directions, matching the existing
  box-shadow ring's timing, with no other rule in the file changed.
