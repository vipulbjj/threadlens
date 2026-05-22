# ThreadLens design system

Audience: young adults (18–28) analyzing personal and group chat exports.

## Voice
- Dark-first, high contrast, one accent (emerald/teal)
- Short sentences, no corporate “unlock the power of…” copy
- Honest microcopy over security theater

## Typography
- Display: system-ui stack avoided on marketing surfaces; prefer **DM Sans** or **Outfit** via `next/font`
- Body: 16px minimum, 1.5 line-height

## Color
- Background: zinc-950
- Surface: zinc-900 / zinc-800 borders
- Text: zinc-50 primary, zinc-400 secondary
- Accent: emerald-500 (CTAs, links, chart highlights)
- Warning: amber-400 (sorry counts, soft flags)

## Layout
- Mobile bottom nav on main app routes (hidden on marketing home)
- Max content width 5xl on landing, 4xl in app
- Touch targets ≥ 44px on primary actions

## Components
- Cards: rounded-2xl, subtle border, no decorative gradient blobs on app chrome
- Primary button: filled emerald, rounded-xl
- Secondary: zinc-800 border
