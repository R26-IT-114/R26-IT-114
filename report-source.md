# Working Memory Dashboard Metric Consistency Audit

Audience: Smart Learn development team  
Date: 2026-08-29  
Scope: Working Memory dashboard summary metrics, durable progress history, Home progress, and legacy completion reconciliation. Gameplay scoring and pass thresholds are excluded from behavioral changes.

## Executive answer

The visible values used different populations and storage sources. Stars came from device-local storage; overall accuracy and response time used only each game's latest session; session deduplication compared embedded timestamps and therefore missed timestamp-only duplicates; completed levels correctly used MongoDB but old successful Shape Memory sessions could lack the separate completion write. The implemented fix derives dashboard aggregates from durable backend session history, removes timestamp fields when identifying near-simultaneous duplicates, and conservatively repairs only unambiguous passed/perfect legacy completion records.

## Evidence and resolution

- Device-local stars: `WorkingMemoryDashboard.jsx` read `working-memory:total-stars:${userId}` from localStorage. The dashboard now reconstructs the same first-run-per-game-level reward scope from backend session results.
- Accuracy population mismatch: `HomePage.jsx` previously averaged the latest session of each played game. It now question-weights every durable session.
- Response-time population mismatch: `HomePage.jsx` previously weighted only latest per-game rows. It now question-weights every session with a valid response time.
- Duplicate sessions: the old JSON equality included `timestamp`, defeating the intended 15-second duplicate filter. `performanceMetrics.js` excludes volatile timestamps from the fingerprint while preserving genuine later replays.
- Completion mismatch: Shape Memory can save performance before its separate completion request. `workingMemoryService.js` now repairs only history records explicitly marked passed or having unambiguous `correct >= total > 0`; partial/failed results remain incomplete.
- Source of truth: `ProgressContext.jsx` replaces online state with the complete backend response and uses per-Firebase-UID localStorage only after a failed fetch.

## Metric definitions after the fix

- Collected stars: correct-action rewards from the first durable session for each game/level scope.
- Average game accuracy: accuracy across all durable, deduplicated sessions, weighted by question/round count.
- Played sessions: number of durable, deduplicated performance-history records.
- Completed levels: unique backend `completedLevels`, including conservative repair of unambiguous legacy successes.
- Average response time: all valid durable sessions, weighted by question/round count.

## Limitations

Old sessions that do not contain correct/total, passed, or equivalent completion evidence cannot safely be promoted. Existing local-only star totals cannot be migrated exactly when no corresponding durable session fields exist. The reconstruction deliberately prioritizes reproducible backend evidence over device-local counters.

## Claim-to-source ledger

- Progress load/cache behavior — project source: `smart-learn-frontend/src/modules/working-memory/context/ProgressContext.jsx`, accessed 2026-08-29.
- Dashboard aggregation and display — project source: `smart-learn-frontend/src/modules/working-memory/components/HomePage.jsx`, accessed 2026-08-29.
- Device-local reward behavior — project source: `smart-learn-frontend/src/modules/working-memory/components/StarRewardSystem.jsx`, accessed 2026-08-29.
- Shape completion payload — project source: `smart-learn-frontend/src/modules/working-memory/pages/MemoryShapeRecallGame.jsx`, accessed 2026-08-29.
- Durable progress schema and update behavior — project sources: `working-memory-backend/src/models/WorkingMemoryProgress.js` and `working-memory-backend/src/services/workingMemoryService.js`, accessed 2026-08-29.
