import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { saveGameSession } from '../utils/dyscalculiaProgress';
import {
  NUMBER_TRACING_LEVEL_ROUTE,
  accuracyStarsFromConfidence,
  getTracingLevelForDigit,
  normalizeConfidencePercent,
  recordNumberTracingPrediction,
} from '../utils/numberTracingProgress';
import { triggerDyscalculiaReward } from '../components/DyscalculiaRewardBurst';

const useNumberTracingProgress = (targetNumber) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [levelCompletion, setLevelCompletion] = useState(null);
  const requestedLevel = useMemo(() => new URLSearchParams(location.search).get('level'), [location.search]);
  const level = getTracingLevelForDigit(targetNumber, requestedLevel);

  const savePrediction = useCallback((result, attempts, responseTime) => {
    const predictedNumber = result?.predictedNumber ?? result?.predicted_digit ?? null;
    const confidence = result?.confidence;
    const correct = result?.isCorrect === true;
    if (correct) triggerDyscalculiaReward();
    const accuracyPercent = normalizeConfidencePercent(confidence);
    const tracingAccuracyStars = accuracyStarsFromConfidence(confidence);

    saveGameSession({
      gameType: 'TracingNumbers',
      targetNumber,
      predictedNumber,
      confidence,
      accuracyPercent,
      tracingAccuracyStars,
      correct,
      attempts,
      responseTime,
      timeSpent: responseTime,
      level,
      score: correct ? 15 : 0,
      completed: correct,
    });

    const completion = recordNumberTracingPrediction({
      level,
      targetNumber,
      predictedNumber,
      confidence,
      correct,
    });

    if (correct && completion.levelComplete) setLevelCompletion(completion);
    return completion;
  }, [level, targetNumber]);

  const goToLevelSelection = useCallback(() => navigate(NUMBER_TRACING_LEVEL_ROUTE), [navigate]);

  return { level, levelCompletion, savePrediction, goToLevelSelection };
};

export default useNumberTracingProgress;
