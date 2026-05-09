# Phase 1

✅ Home UI/UX + visual polish (CSS-only)

- Updated `dyscalculia-cartoon.css` to improve DyscalculiaHome layout rhythm:
  - Added/standardized stack spacing for `.dg-home-journey-stack`
  - Improved quick-actions layout for `.dg-home-quick-actions` + `.dg-home-action-btn` hover/focus/active
  - Polished profile header structure visually via `.dg-profile-header`, `.dg-profile-left/right`, avatar/name/badge sizing
  - Enhanced dashboard access button styling via `.dg-profile-dashboard-btn` (hover/focus/active)

- Responsive design improvements (no JS/route changes):
  - Added breakpoints at `900px` and `480px` to adjust padding, gaps, and make dashboard button full-width on mobile

- Animations / motion accessibility:
  - Added `prefers-reduced-motion: reduce` support to disable key animations/transitions for home elements

🚫 Not touched:
- routes
- dashboard logic
- tracing/game logic
- component names / JSX structure



