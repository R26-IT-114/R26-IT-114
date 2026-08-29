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
 * Stored localStorage key: 'dyslexia_progress:<userId>'
 * Shape: { assessmentDone, scores, unlockedSections, recommendedLevel, assessmentResult }
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import useAuth from '../../../hooks/useAuth';
import { dyslexiaService } from '../services/dyslexiaService';

const STORAGE_KEY_PREFIX = 'dyslexia_progress';
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

function getStorageKey(userId) {
  return userId ? `${STORAGE_KEY_PREFIX}:${userId}` : null;
}

function loadLocal(userId) {
  const storageKey = getStorageKey(userId);
  if (!storageKey) return null;
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLocal(userId, data) {
  const storageKey = getStorageKey(userId);
  if (!storageKey) return;
  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch {
    // ignore quota / private-browsing errors
  }
}

function clearLocal(userId) {
  const storageKey = getStorageKey(userId);
  if (!storageKey) return;
  try {
    localStorage.removeItem(storageKey);
  } catch {
    // ignore
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * @param {string|null} userId  Firebase/auth user ID. When provided, syncs with backend.
 */
export default function useDyslexiaProgress(userId = null) {
  const { user, isAuthLoading } = useAuth();
  const effectiveUserId = userId || user?.uid || user?.id || null;
  const [progress, setProgress] = useState(null);
  const [syncing,  setSyncing]  = useState(true);
  const unlockedSections = useMemo(() => progress?.unlockedSections ?? [], [progress]);

  // Resolve progress separately for each authenticated learner. Waiting for this
  // lookup prevents returning users from briefly being sent to the pre-test.
  useEffect(() => {
    if (isAuthLoading) return undefined;

    if (!effectiveUserId) {
      setProgress(null);
      setSyncing(false);
      return undefined;
    }

    let cancelled = false;
    const localProgress = normalizeProgressPayload(loadLocal(effectiveUserId));
    setProgress(localProgress);

    if (localProgress) {
      setSyncing(false);
      return undefined;
    }

    setSyncing(true);
    dyslexiaService.getAssessment(effectiveUserId)
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
        saveLocal(effectiveUserId, data);
        setProgress(data);
      })
      .catch(() => { /* backend unavailable — stay with local state */ })
      .finally(() => { if (!cancelled) setSyncing(false); });

    return () => { cancelled = true; };
  }, [effectiveUserId, isAuthLoading]);

  /** Call after assessment completes with the rich placement result. */
  const completeAssessment = useCallback(async (assessmentOrScores) => {
    if (!effectiveUserId) {
      throw new Error('No authenticated user ID is available. Please sign in again.');
    }

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

    // For authenticated learners, MongoDB must confirm the assessment before
    // local progress is marked complete. Otherwise the learning home and the
    // dashboard can disagree about whether the pre-test exists.
    // Errors propagate to the assessment screen so it can offer a retry.
    await dyslexiaService.saveAssessment(effectiveUserId, assessmentResult ?? assessmentOrScores);

    saveLocal(effectiveUserId, normalized);
    setProgress(normalized);

    return normalized.unlockedSections;
  }, [effectiveUserId]);

  /** Reset so the child can retake the assessment. */
  const resetAssessment = useCallback(async () => {
    clearLocal(effectiveUserId);
    setProgress(null);

    if (effectiveUserId) {
      try {
        await dyslexiaService.deleteAssessment(effectiveUserId);
      } catch {
        // ignore
      }
    }
  }, [effectiveUserId]);

  const assessmentDone    = progress?.assessmentDone  ?? false;
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
