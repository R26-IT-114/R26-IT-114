/**
 * useDyslexiaProgress
 *
 * Manages the placement assessment result and section-unlock state.
 *
 * Strategy:
 *  - localStorage is the primary UI source (instant, no flicker).
 *  - When a userId is provided the hook syncs reads/writes with the backend.
 *    Backend is the source of truth for multi-device / admin views.
 *
 * Stored localStorage key: 'dyslexia_progress'
 * Shape: { assessmentDone, scores, unlockedSections, recommendedLevel, assessmentResult }
 */

import { useState, useCallback, useEffect } from 'react';
import { dyslexiaService } from '../services/dyslexiaService';

const STORAGE_KEY = 'dyslexia_progress';
const ALL_SECTION_IDS = [1, 2, 3, 4, 5, 6];

// ── Unlock logic (must mirror assessmentController.js) ────────────────────────

/** Sections 1,2,5,6 always unlocked. Section 3 needs letters===3, Section 4 needs twoLetter===2. */
export function computeUnlockedSections({ letters = 0, twoLetter = 0 } = {}) {
  const unlocked = [1, 2, 5, 6];
  if (letters === 3) unlocked.push(3);
  if (twoLetter === 2) unlocked.push(4);
  return unlocked.sort((a, b) => a - b);
}

function deriveLegacyScoresFromAssessment(assessment = {}) {
  const sections = assessment.sections ?? {};
  const letterRecognition = sections.letterRecognition?.score ?? assessment.scores?.letterRecognition ?? 0;
  const twoLetterReading = sections.twoLetterReading?.score ?? assessment.scores?.twoLetterReading ?? 0;
  const threeLetterReading = sections.threeLetterReading?.score ?? assessment.scores?.threeLetterReading ?? 0;

  return {
    letters: Math.round((Number(letterRecognition) / 100) * 3),
    twoLetter: Math.round((Number(twoLetterReading) / 100) * 2),
    threeLetter: Math.round((Number(threeLetterReading) / 100) * 2),
  };
}

function normalizeProgressPayload(payload) {
  if (!payload) return null;

  const assessmentResult = payload.assessmentResult ?? payload.assessment ?? null;
  const recommendedLevel = payload.recommendedLevel ?? assessmentResult?.recommendedLevel ?? 1;
  const weakLetters = payload.weakLetters ?? assessmentResult?.weakLetters ?? [];
  const scores = payload.scores ?? (assessmentResult ? deriveLegacyScoresFromAssessment(assessmentResult) : null) ?? { letters: 0, twoLetter: 0, threeLetter: 0 };
  const unlockedSections = payload.unlockedSections
    ?? (assessmentResult ? ALL_SECTION_IDS : computeUnlockedSections(scores))
    ?? [1, 2, 5, 6];

  return {
    ...payload,
    assessmentDone: payload.assessmentDone ?? Boolean(assessmentResult || payload.scores),
    assessmentResult,
    recommendedLevel,
    weakLetters,
    scores,
    unlockedSections,
  };
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
        const data = normalizeProgressPayload({
          assessmentDone: true,
          scores: res.data.scores,
          unlockedSections: res.data.unlockedSections,
          recommendedLevel: res.data.recommendedLevel,
          weakLetters: res.data.weakLetters,
          assessmentResult: res.data.assessment,
        });
        saveLocal(data);
        setProgress(data);
      })
      .catch(() => { /* backend unavailable — stay with local state */ })
      .finally(() => { if (!cancelled) setSyncing(false); });

    return () => { cancelled = true; };
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Call after assessment completes with the rich placement result. */
  const completeAssessment = useCallback(async (assessmentOrScores) => {
    const assessmentResult = assessmentOrScores?.sections
      ? assessmentOrScores
      : null;

    const legacyScores = assessmentResult
      ? deriveLegacyScoresFromAssessment(assessmentResult)
      : assessmentOrScores;

    const normalized = normalizeProgressPayload({
      assessmentDone: true,
      scores: legacyScores,
      unlockedSections: assessmentResult ? ALL_SECTION_IDS : computeUnlockedSections(legacyScores),
      recommendedLevel: assessmentResult?.recommendedLevel ?? assessmentOrScores?.recommendedLevel ?? 1,
      weakLetters: assessmentResult?.weakLetters ?? assessmentOrScores?.weakLetters ?? [],
      assessmentResult,
    });

    // Optimistic local update first
    saveLocal(normalized);
    setProgress(normalized);

    // Background sync to backend
    if (userId) {
      try {
        await dyslexiaService.saveAssessment(userId, assessmentResult ?? assessmentOrScores);
      } catch {
        // Backend unavailable — local state is still usable
      }
    }

    return normalized.unlockedSections;
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
  const recommendedLevel  = progress?.recommendedLevel ?? 1;
  const assessmentResult  = progress?.assessmentResult ?? null;
  const weakLetters       = progress?.weakLetters ?? [];

  const isSectionUnlocked = useCallback(
    (sectionId) => !assessmentDone || unlockedSections.includes(sectionId),
    [assessmentDone, unlockedSections]
  );

  return {
    assessmentDone,
    unlockedSections,
    scores,
    assessmentResult,
    recommendedLevel,
    weakLetters,
    syncing,
    isSectionUnlocked,
    completeAssessment,
    resetAssessment,
  };
}
