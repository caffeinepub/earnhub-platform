# EarnHub Platform

## Current State
The app uses a dark theme with OKLCH-based CSS variables. The `--muted-foreground` is set to `oklch(0.6 0.01 262)` which renders as a mid-gray that is too low contrast (~3:1) against dark card backgrounds (`oklch(0.17)`). Several sections have additional black/near-black text on dark backgrounds:
- ReferralPage: Terms & Conditions list items use `text-muted-foreground` (too dim)
- ReferralPage: Copy button uses `color: '#0D1117'` (near-black) on teal background when copied
- Various pages: inactive tab labels use `rgba(255,255,255,0.6)` which is borderline
- Terms section text needs higher visibility

## Requested Changes (Diff)

### Add
- Nothing new to add

### Modify
- `index.css`: Raise `--muted-foreground` from `oklch(0.6 0.01 262)` to `oklch(0.75 0.01 262)` for better contrast
- `index.css`: Set consistent dark theme: `--background` stays at `oklch(0.13 0.012 262)` (matches `#0f172a`), `--foreground` stays at `oklch(0.95 0.005 262)` (matches `#ffffff`/`#e5e7eb`)
- `ReferralPage.tsx`: Terms list items — change from `text-muted-foreground` to explicit `#e5e7eb` color for full readability
- `ReferralPage.tsx`: Copied state button — change `color: '#0D1117'` on teal background to `color: '#ffffff'` for better contrast
- All pages: Replace any `text-white/40`, `text-white/50`, `text-white/55` with at least `text-white/70` so all secondary text is readable
- All cards: Ensure body text uses `#e5e7eb` or `text-foreground` (not dim muted variants) for primary content
- Fix any remaining black text on dark backgrounds

### Remove
- No features to remove

## Implementation Plan
1. Update `index.css` CSS variables: raise `--muted-foreground` lightness to improve contrast ratio
2. In `ReferralPage.tsx`: fix Terms list item text color and copied-state button text
3. In all pages: audit and replace any text that uses opacity lower than 0.65 on dark backgrounds — raise to minimum 0.75 or use `#e5e7eb` directly
4. Ensure all cards, sections, and buttons have white or near-white text on dark backgrounds
5. Validate and build
