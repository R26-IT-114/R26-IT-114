/**
 * useDyslexiaProgress
 *
 * Manages the pre-assessment result and section-unlock state.
 *
 * Strategy:
 *  - localStorage is the primary UI source (instant, no flicker).
 *  - When a userId is provided the hook syncs reads/writes with the backend.
 *    Backend is the source of truth for multi-device / admin views.
 *
 * Stored localStorage key: 'dyslexia_progress'
 * Shape: { assessmentDone, scores, unlockedSections }
 */

import { useState, useCallback, useEffect } from 'react';
import { dyslexiaService } from '../services/dyslexiaService';

const STORAGE_KEY = 'dyslexia_progress';

// ── Unlock logic (must mirror assessmentController.js) ────────────────────────

/** Sections 1,2,5,6 always unlocked. Section 3 needs letters===3, Section 4 needs twoLetter===2. */
export function computeUnlockedSections({ letters = 0, twoLetter = 0 } = {}) {
  const unlocked = [1, 2, 5, 6];
  if (letters === 3) unlocked.push(3);
  if (twoLetter === 2) unlocked.push(4);
  return unlocked.sort((a, b) => a - b);
}

// ── localStorage helpers ──────────────────────────────────────────────────────

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLocal(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore quota / private-browsing errors
  }
}

function clearLocal() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * @param {string|null} userId  Firebase/auth user ID. When provided, syncs with backend.
 */
export default function useDyslexiaProgress(userId = null) {
  const [progress, setProgress] = useState(() => loadLocal());
  const [syncing,  setSyncing]  = useState(false);

  // On mount (or when userId changes): if localStorage is empty, try fetching from backend
  useEffect(() => {
    if (!userId || progress) return;

    let cancelled = false;
    setSyncing(true);

    dyslexiaService.getAssessment(userId)
      .then((res) => {
        if (cancelled || !res.data) return;
        const data = {
          assessmentDone: true,
          scores: res.data.scores,
          unlockedSections: res.data.unlockedSections,
        };
        saveLocal(data);
        setProgress(data);
      })
      .catch(() => { /* backend unavailable — stay with local state */ })
      .finally(() => { if (!cancelled) setSyncing(false); });

    return () => { cancelled = true; };
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Call after assessment completes with sub-scores. */
  const completeAssessment = useCallback(async (scores) => {
    const unlockedSections = computeUnlockedSections(scores);
    const data = { assessmentDone: true, scores, unlockedSections };

    // Optimistic local update first
    saveLocal(data);
    setProgress(data);

    // Background sync to backend
    if (userId) {
      try {
        await dyslexiaService.saveAssessment(userId, scores);
      } catch {
        // Backend unavailable — local state is still usable
      }
    }

    return unlockedSections;
  }, [userId]);

  /** Reset so the child can retake the assessment. */
  const resetAssessment = useCallback(async () => {
    clearLocal();
    setProgress(null);

    if (userId) {
      try {
        await dyslexiaService.deleteAssessment(userId);
      } catch {
        // ignore
      }
    }
  }, [userId]);

  const assessmentDone    = progress?.assessmentDone  ?? false;
  const unlockedSections  = progress?.unlockedSections ?? [];
  const scores            = progress?.scores ?? { letters: 0, twoLetter: 0, threeLetter: 0 };

  const isSectionUnlocked = useCallback(
    (sectionId) => !assessmentDone || unlockedSections.includes(sectionId),
    [assessmentDone, unlockedSections]
  );

  return {
    assessmentDone,
    unlockedSections,
    scores,
    syncing,
    isSectionUnlocked,
    completeAssessment,
    resetAssessment,
  };
}
