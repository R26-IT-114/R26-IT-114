import { useEffect, useRef, useState } from 'react';
import useAuth from '../../../hooks/useAuth';
import { dyslexiaService } from '../services/dyslexiaService';
import { DYSLEXIA_REWARD_EVENT } from '../components/DyslexiaRewardPopup';

/**
 * Connects a dyslexia game lifecycle to the session backend.
 * Tracking is deliberately best-effort: a backend outage must never block a child from playing.
 */
export default function useDyslexiaGameSession({
  gameKey,
  level = 1,
  totalQuestions = 0,
  started,
  finished,
  score = 0,
}) {
  const { user } = useAuth();
  const userId = user?.uid || user?.id;
  const [sessionId, setSessionId] = useState(null);
  const startingRef = useRef(false);
  const completedRef = useRef(false);
  const startedAtRef = useRef(null);
  const previousScoreRef = useRef(0);

  // A retry normally returns the game to its intro/start state before beginning again.
  // Clear the previous run so the next play creates a distinct backend session.
  useEffect(() => {
    if (started) return;
    setSessionId(null);
    startingRef.current = false;
    completedRef.current = false;
    startedAtRef.current = null;
    previousScoreRef.current = 0;
  }, [started]);

  // A score increase represents a positive action in every Dyslexia game.
  useEffect(() => {
    const safeScore = Number.isFinite(Number(score)) ? Number(score) : 0;
    if (started && safeScore > previousScoreRef.current) {
      window.dispatchEvent(new CustomEvent(DYSLEXIA_REWARD_EVENT, {
        detail: { gameKey, score: safeScore },
      }));
    }
    previousScoreRef.current = safeScore;
  }, [gameKey, score, started]);

  useEffect(() => {
    if (!started || finished || !userId || sessionId || startingRef.current) return;

    startingRef.current = true;
    startedAtRef.current = Date.now();
    dyslexiaService.startSession({ userId, gameKey, level, totalQuestions })
      .then((response) => setSessionId(response?.data?.id ?? null))
      .catch(() => { /* gameplay remains available offline */ })
      .finally(() => { startingRef.current = false; });
  }, [finished, gameKey, level, sessionId, started, totalQuestions, userId]);

  useEffect(() => {
    if (!finished || !sessionId || !userId || completedRef.current) return;

    completedRef.current = true;
    const safeScore = Number.isFinite(Number(score)) ? Number(score) : 0;
    const safeTotal = Number.isFinite(Number(totalQuestions)) ? Number(totalQuestions) : 0;
    const correctAnswers = Math.max(0, Math.min(safeTotal, safeScore));

    dyslexiaService.completeSession(sessionId, {
      userId,
      status: 'completed',
      score: safeTotal > 0 ? Math.round((correctAnswers / safeTotal) * 100) : safeScore,
      totalQuestions: safeTotal,
      correctAnswers,
      wrongAnswers: Math.max(0, safeTotal - correctAnswers),
      durationSeconds: startedAtRef.current
        ? Math.max(0, Math.round((Date.now() - startedAtRef.current) / 1000))
        : 0,
    }).catch(() => { /* gameplay remains available offline */ });
  }, [finished, score, sessionId, totalQuestions, userId]);

  return sessionId;
}
