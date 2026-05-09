# TODO - UI/UX Fixes (Dyscalculia)

## Completed
- [ ] Started UI/UX fix work

## Planned (approved)
1. Update DyscalculiaDashboard UI/UX (in progress)
   - [ ] Fix background/spacing consistency with dyscalculia-cartoon theme
   - [ ] Improve typography hierarchy and card layout responsiveness
   - [ ] Fix any missing class styles (dashboard container, header, sections)

2. Fix NumberSortingGame sortable UX (in progress)
   - [ ] Ensure SortableItem ids are unique/stable and match cardOrder values
   - [ ] Fix SortableContext item mapping and correct drag evaluation trigger
   - [ ] Improve accessibility: aria-labels, keyboard/focus hints, tap target sizing

3. Improve BalloonPopGame UX (in progress)
   - [ ] Increase tap target size/spacing for balloon buttons
   - [ ] Improve feedback overlay spacing and ensure it doesn’t block interactions unexpectedly
   - [ ] Add/adjust aria-live/roles where needed

4. Align responsive breakpoints for Dyscalculia theme
   - [ ] Make sure dyscalculia-cartoon responsive rules don’t conflict with other modules
   - [ ] Use narrowly-scoped selectors (dg-*/dc-*) and avoid global changes

## Follow-ups
- [ ] Run frontend tests/build (if scripts available)
- [ ] Manual UI smoke-check: dyscalculia home, dashboard, number sorting, balloon pop

