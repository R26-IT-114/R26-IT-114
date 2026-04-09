import { createContext, useContext, useMemo, useState } from 'react';
import { questionBank } from '../data/questionBank';
import { evaluateAssessment } from '../utils/assessmentEngine';
import { getRecommendationsByPerformance } from '../data/recommendationBank';

const DyscalculiaFlowContext = createContext(null);

const DEFAULT_RESULT = null;

export const DyscalculiaFlowProvider = ({ children }) => {
  const [questions] = useState(questionBank);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [attempts, setAttempts] = useState([]);
  const [assessmentResult, setAssessmentResult] = useState(DEFAULT_RESULT);
  const [completedActivities, setCompletedActivities] = useState(0);
  const [activitySessions, setActivitySessions] = useState([]);

  const currentQuestion = questions[currentQuestionIndex] || null;
  const assessmentProgress = questions.length ? currentQuestionIndex / questions.length : 0;

  const submitAssessmentAnswer = ({ selectedAnswer, responseTimeMs }) => {
    if (!currentQuestion) {
      return { completed: true };
    }

    const attempt = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect: selectedAnswer === currentQuestion.correctAnswer,
      responseTimeMs,
      skillType: currentQuestion.skillType,
    };

    const nextAttempts = [...attempts, attempt];
    setAttempts(nextAttempts);

    const isLast = currentQuestionIndex + 1 >= questions.length;
    if (isLast) {
      const result = evaluateAssessment(nextAttempts);
      setAssessmentResult(result);
      return { completed: true, attempt, result };
    }

    setCurrentQuestionIndex((prev) => prev + 1);
    return { completed: false, attempt };
  };

  const recommendations = useMemo(() => {
    if (!assessmentResult) return [];
    return getRecommendationsByPerformance(assessmentResult.weakAreas, assessmentResult.severityLevel);
  }, [assessmentResult]);

  const markLearningGameComplete = ({ activityId, accuracy, averageResponseTimeMs }) => {
    setCompletedActivities((prev) => prev + 1);
    setActivitySessions((prev) => [
      ...prev,
      { activityId, accuracy, averageResponseTimeMs, completedAt: Date.now() },
    ]);
  };

  const progressMetrics = useMemo(() => {
    if (!assessmentResult) return null;

    const gameCount = activitySessions.length;
    const gameAverageAccuracy = gameCount
      ? activitySessions.reduce((sum, item) => sum + item.accuracy, 0) / gameCount
      : assessmentResult.accuracy;

    const gameAverageResponseTime = gameCount
      ? activitySessions.reduce((sum, item) => sum + item.averageResponseTimeMs, 0) / gameCount
      : assessmentResult.averageResponseTimeMs;

    let summary = 'Great progress. Continue short daily practice.';
    if (assessmentResult.severityLevel === 'Moderate') {
      summary = 'Needs focused practice on weak areas with guided help.';
    }
    if (assessmentResult.severityLevel === 'Severe') {
      summary = 'Recommend regular guided sessions with parent or teacher support.';
    }

    return {
      completedActivities,
      averageAccuracy: gameAverageAccuracy,
      averageResponseTimeMs: gameAverageResponseTime,
      weakSkillAreas: assessmentResult.weakAreas,
      improvementSummary: summary,
    };
  }, [assessmentResult, completedActivities, activitySessions]);

  const resetModule = () => {
    setCurrentQuestionIndex(0);
    setAttempts([]);
    setAssessmentResult(DEFAULT_RESULT);
    setCompletedActivities(0);
    setActivitySessions([]);
  };

  const value = {
    questions,
    currentQuestion,
    currentQuestionIndex,
    assessmentProgress,
    attempts,
    assessmentResult,
    recommendations,
    progressMetrics,
    submitAssessmentAnswer,
    markLearningGameComplete,
    resetModule,
  };

  return <DyscalculiaFlowContext.Provider value={value}>{children}</DyscalculiaFlowContext.Provider>;
};

export const useDyscalculiaFlow = () => {
  const context = useContext(DyscalculiaFlowContext);
  if (!context) {
    throw new Error('useDyscalculiaFlow must be used inside DyscalculiaFlowProvider.');
  }
  return context;
};
