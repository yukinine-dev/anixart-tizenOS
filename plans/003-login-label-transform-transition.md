# 003 — Replace the login floating label's `transition: all` with a transform-only animation

- **Status**: DONE
- **Commit**: fe27d3a
- **Severity**: MEDIUM
- **Category**: Performance
- **Estimated scope**: 1 file (`styles/main.css`), 2 rules touched.

## Problem

The login screen's floating field labels (`src/screens/login.js` renders a
`.login-field-label` sibling next to each `.login-field` input) animate
between a "resting" state (inside the empty input) and a "floated" state
(shrunk, above the input) by directly transitioning `top` and `font-size`:

```css
/* styles/main.css:210-218 — current */
.login-field-label {
  position: absolute;
  left: 14px;
  top: 18px;
  font-size: 16px;
  color: #9e9e9e;
  pointer-events: none;
  transition: all 0.2s;
}

/* styles/main.css:220-225 — current */
.login-field:focus + .login-field-label,
.login-field:not(:placeholder-shown) + .login-field-label {
  top: 6px;
  font-size: 11px;
  color: #f04e5c;
}
```

Two problems:

1. `transition: all 0.2s;` animates *every* property that changes on this
   element, not just the intended `top`/`font-size`/`color` — an
   unbounded, always-a-finding pattern per this project's motion rules,
   since it silently starts animating whatever anyone adds to this rule
   later too.
2. `top` and `font-size` both trigger layout + paint + composite on every
   animation frame (`top` because it's a positioned offset, `font-size`
   because it reflows the text metrics) — neither is GPU-composited.
   `transform` and `opacity` are the only properties that animate cheaply.

This is low-frequency (the login screen is seen once, rarely revisited),
so it's not a feel-breaking issue, but it's a clean, contained fix with no
behavioral risk.

## Target

Keep `top`/`left`/`font-size` fixed at their natural resting values in both
states, and express the "floated" state purely as a `transform`: the label
moves up by the same 12px the old `top: 18px → 6px` produced
(`18 - 6 = 12`), and shrinks by the same ratio the old
`font-size: 16px → 11px` produced (`11 / 16 = 0.6875`). Anchor the scale to
the label's own top-left corner (`transform-origin: left top`) so it
shrinks in place instead of drifting, matching how the original
`top`/`font-size` version visually stayed left-aligned.

```css
/* target — styles/main.css:210-218 */
.login-field-label {
  position: absolute;
  left: 14px;
  top: 18px;
  font-size: 16px;
  color: #9e9e9e;
  pointer-events: none;
  transform-origin: left top;
  transition: transform 0.2s ease-out, color 0.2s;
}

/* target — styles/main.css:220-225 */
.login-field:focus + .login-field-label,
.login-field:not(:placeholder-shown) + .login-field-label {
  transform: translateY(-12px) scale(0.6875);
  color: #f04e5c;
}
```

Note the `color` transition keeps its own separate, unscaled `0.2s` (no
easing specified, matching the original's implicit default and this
project's convention of using bare `ease` for color changes per this
codebase's own motion rules) — only the movement/sizing moves to
`transform`.

## Repo conventions to follow

- This codebase always hand-types explicit transition property lists
  (`property duration curve, property duration`) rather than `all` —
  every other transition in `styles/main.css` names its properties
  explicitly except this one, which is the only `transition: all` in the
  entire file (confirmed via `grep -n "transition: all" styles/main.css`).
  This fix brings it in line with that convention, not introducing a new
  one.
- `ease-out` for a value that "enters" (the label snapping into its final
  floated position) is this project's default choice per its own motion
  rules; a bare `ease`/no-curve is reserved for simple color changes,
  which is why `color` keeps its own untouched `0.2s` with no explicit
  curve, same as before.

## Steps

1. Open `styles/main.css`. Locate the `.login-field-label { ... }` rule
   (search for `.login-field-label {`).
2. Inside that rule, add one new declaration, `transform-origin: left
   top;`, placed anywhere after `pointer-events: none;` and before
   `transition:`.
3. In that same rule, replace the existing line
   `transition: all 0.2s;`
   with
   `transition: transform 0.2s ease-out, color 0.2s;`
4. Locate the combined selector rule directly below it:
   `.login-field:focus + .login-field-label,`
   `.login-field:not(:placeholder-shown) + .login-field-label { ... }`
5. Inside that rule, delete the two lines `top: 6px;` and
   `font-size: 11px;`. Keep `color: #f04e5c;` unchanged.
6. In their place, add one new declaration:
   `transform: translateY(-12px) scale(0.6875);`
7. Do not touch any other file — `src/screens/login.js` needs no changes,
   since it doesn't set `top`/`font-size`/`transform` inline anywhere
   (confirmed via `grep -n "top\|fontSize\|transform" src/screens/login.js`
   returning no matches for this element).

## Boundaries

- Do NOT change the base (resting) state's `left`, `top`, or `font-size`
  values (`14px`, `18px`, `16px`) — they stay exactly as declared, since
  the transform is computed relative to them.
- Do NOT change the `-12px` or `0.6875` values — they are derived
  precisely from the original `top: 18px→6px` and `font-size: 16px→11px`
  deltas; do not round or approximate differently.
- Do NOT touch `.login-field` (the input itself), `.login-field.focused`,
  or `.login-field:focus` rules — only the two `.login-field-label`-related
  rules listed above.
- Do NOT touch `src/screens/login.js`.
- If either rule at `styles/main.css:210-225` doesn't match the Problem
  section's current code verbatim (drift since commit `fe27d3a`), STOP and
  report instead of guessing at the replacement.

## Verification

- **Mechanical**: confirm brace balance after the edit:
  `python3 -c "s=open('styles/main.css').read(); print(s.count('{'), s.count('}'))"` — the two numbers must be equal (this edit adds/removes lines but no braces, so the count should be unchanged from before the edit).
  Also confirm no other rule references `.login-field-label`'s `top` or
  `font-size` afterward: `grep -n "login-field-label" styles/main.css`
  should show only the two edited rules plus nothing else touching those
  properties.
- **Feel check** (on the real Tizen TV, or a desktop browser if the TV
  isn't reachable — see recent `git log` commit messages for this
  project's docker build/install/CDP workflow):
  - Open the login screen, focus the login field (D-pad down/OK into it)
    and type a character.
  - Confirm the label shrinks and moves up smoothly over ~200ms, ending in
    visually the same position and size as before this change (upper-left
    of the field, small red text) — this is a refactor, not a redesign, so
    the *end state* must look identical to the pre-change screenshot, only
    the animation mechanism changed.
  - Confirm the label's left edge does not drift sideways during the
    animation — it should shrink in place from its top-left corner, not
    from its center.
  - Clear the field back to empty and confirm the label smoothly returns
    to its full size/resting position (not an instant snap) — this was
    already working before (the bug was performance/correctness of the
    *mechanism*, not the direction), so this is a regression check.
  - In DevTools' Animations panel (if inspecting on desktop), set playback
    to 10% and confirm only `transform` and `color` are listed as
    animating — no `top` or `font-size` entries should appear.
- **Done when**: the label's floated/resting transition uses only
  `transform`/`color`, ends up pixel-equivalent to the pre-change visual
  result, and no `transition: all` remains anywhere in `styles/main.css`.
