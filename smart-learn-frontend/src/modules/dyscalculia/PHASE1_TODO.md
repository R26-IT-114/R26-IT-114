# Dyscalculia - Phase 1 (SAFE) TODO

## Goals (approved)
- Memoize star rendering (avoid reshuffle on each render)
- Introduce lightweight audio manager to prevent overlapping audio
- Refactor duplicated feedback-variant decisions to use existing `getFeedbackVariants`
- Move magic numbers to constants (without changing behavior)

## Steps
1. Memoize floating star arrays in `DyscalculiaDashboard.jsx` (use `useMemo`).
2. Add `utils/audioManager.js` wrapper (single active playback + speech synthesis cancel).
3. Update `BalloonPopGame.jsx` to use `audioManager` for number/positive/retry audio.
4. Update `BalloonPopGame.jsx` to use `getFeedbackVariants({correct, mode})` instead of local showConfetti/showShake + retry delay.
5. Move constants: weak area threshold (70), retry delay numbers (1400/2000) and confetti piece counts where applicable into utils constants.
6. Run `npm run build` (or `npm test` if available) inside `smart-learn-frontend`.
7. Summarize exact files changed.

