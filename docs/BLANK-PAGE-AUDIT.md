# Blank-Page Audit — 2026-10-01

A report that "some pages are completely blank" was investigated with visual
screenshots, DOM measurement, and a headless browser harness. This documents
what was actually wrong, what was fixed, and one measurement mistake worth
recording so it is not repeated.

## Summary

**One real bug was found and fixed** — a fail-hidden motion system that made
whole sections of every page invisible. **Two data defects** were also found and
fixed. Several other apparent anomalies turned out to be measurement artifacts,
not site defects.

| Finding | Severity | Status |
|---|---|---|
| Fail-hidden reveal system left sections permanently blank | **Critical** | Fixed |
| Motion observer could never fire for elements taller than the viewport | High | Fixed |
| Duplicate React keys from repeated finish values (2 SKUs) | Medium | Fixed |
| Duplicate/near-duplicate finish names in SKU data | Low | Fixed |
| "N" instead of "Tailored Fitment" in a screenshot | **Not a bug** | Measurement artifact |
| "hidden=4" on every page | **Not a bug** | Wrong metric — see below |

## The critical bug

### Symptom

Whole sections rendered as blank vertical space. The homepage showed its hero and
capability strip, then ~1700px of nothing, then the footer. The product
showcase, gallery band and closing CTA were missing entirely. Every page on the
site was affected to some degree.

### Root cause

The motion system was **fail-hidden**: CSS hid every `[data-reveal]` element by
default (`opacity: 0`), and JavaScript was responsible for revealing it. That
inverts the correct dependency. If the observer was slow, missed an element, or
errored, the content was not merely un-animated — it was **gone**, with its full
height still occupying the layout, producing exactly the blank gaps observed.

Two compounding defects made the missed reveal likely rather than rare:

1. **`threshold: 0.01` on the IntersectionObserver.** The threshold is a fraction
   of the *element's own area*. An element 4832px tall inside a 1000px viewport
   can never reach a meaningful ratio on all engines, so it could fail to fire
   at all. Combined with `rootMargin: "0px 0px -12% 0px"`, which further shrinks
   the trigger region, tall section wrappers were unreliable.
2. **`motion-ready` was applied before observers were attached.** The hidden
   state could be live while nothing was yet watching to reveal it.

### Fix

Inverted the system to **fail-visible**:

- Content is **visible by default**. The hidden state is scoped to a
  `[data-motion-armed]` attribute on `<html>`, which the hook sets **only after**
  its observers are attached and after everything currently on screen has already
  been revealed. If the hook never runs or throws, nothing is ever hidden.
- `threshold` changed from `0.01` to `0`, so a `0`-area-ratio intersection is
  sufficient. This is the correct threshold for elements larger than the viewport.
- Elements already within the viewport are revealed **before** arming, so the
  first paint never hides content the user is looking at.
- A settle pass at 350ms catches layout shift from web fonts and images.
- A 5s failsafe reveals everything outright as a last resort.

The animation is now opt-in. The content never is.

### Verification

| Test | Before | After |
|---|---|---|
| JS disabled entirely | content hidden | **0 hidden** |
| On load, content on screen hidden | yes | **0** |
| Scrolled mid-page, content on screen hidden | yes | **0** |
| Worst gap between visible sections | ~1700px | **0px** |
| Pages checked | 28 | 28 |

`hidden=0` while on screen is the metric that matters. Content below the fold
remaining unrevealed until scrolled to is **correct behaviour**, not a defect.

## The data defects

`/products/wheels/or-701b` emitted a React duplicate-key warning:

```
Encountered two children with the same key
```

Cause: `finishes: ["Matte Black", "Gunmetal", "Black", "Gunmetal"]` — `Gunmetal`
appears twice, and the page maps over the array using the value as the React key.
Duplicate keys can cause React to duplicate or drop children, so the finish list
was unreliable.

`OR-712M` had the same defect. Both were corrected to distinct values, and the
render was hardened with `[...new Set(sku.finishes)]` so a future data edit
cannot reintroduce it.

A scan of all 16 SKUs found no other instances.

**Note:** the initial correction used invented finish names (`Satin Black`,
`Satin Anthracite`) which failed typecheck — the `WheelFinish` union is the
canonical vocabulary. Corrected to real values (`Black`, `Brushed Silver`). The
type system caught this; it is the reason that union exists.

## Measurement mistakes (recorded so they are not repeated)

Two anomalies in the audit output looked like bugs and were not. Both are worth
knowing about because acting on them would have meant "fixing" working code.

**1. "hidden=N on every page" was the wrong metric.** The harness counted every
unrevealed `[data-reveal]` element. But elements below the fold *should* be
unrevealed — they reveal on scroll. Counting them produced `hidden=4` on a
healthy page and made all 28 pages look broken. Re-measuring with
`element is on screen AND opacity < 0.05` gave **0 across the site**. The correct
question is not "is anything hidden" but "is anything hidden *that the user can
see*".

**2. "N" instead of "Tailored Fitment" was a capture artifact.** A screenshot
showed the first capability cell rendering a bare `N`. The DOM was inspected
directly: all six titles render in full, at 397×23px, opacity 1. The screenshot
had caught the element mid-transition. Screenshots are evidence of a *moment*,
not of the DOM; a visual anomaly must be confirmed against the live DOM before
it is treated as a defect.

## Recommendations

- **Keep the fail-visible contract.** Any future motion work must preserve it:
  content visible without JS, animation strictly additive.
- **Prefer `threshold: 0`** for section-level reveal observers. A non-zero
  threshold is only appropriate for elements reliably smaller than the viewport.
- **De-duplicate before using data values as React keys.** Better, key on a
  stable id rather than a display string.
- **Add a visual regression check.** The blank sections survived nine prior
  green builds, `lint`, `typecheck` and 57 static pages — because none of those
  examine rendered pixels. A screenshot diff would have caught it immediately.
