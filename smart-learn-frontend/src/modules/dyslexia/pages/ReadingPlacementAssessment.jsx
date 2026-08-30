import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Mic,
  RotateCcw,
  Sparkles,
  Star,
  Volume2,
  RefreshCcw,
} from 'lucide-react';

import AnimatedJungleBackground from '../components/AnimatedJungleBackground';
import preAssessmentChildImg from '../../../assets/images/dyslexia-preassessment-child.png';
import elephantLetterBoardImg from '../../../assets/images/dyslexia-elephant-letter-board.png';
import resultElephantBoardImg from '../../../assets/images/dyslexia-result-elephant-board.png';
import InstructionButton from '../components/InstructionButton';
import DyslexiaConfettiBurst from '../components/DyslexiaConfettiBurst';
import useInstructionAudio from '../../../hooks/useInstructionAudio';
import useDyslexiaProgress from '../hooks/useDyslexiaProgress';
import {
  PRE_TEST_BANK,
  PRE_TEST_SECTIONS,
} from '../data/preTestQuestions';
import {
  getStartingGameLevel,
  matchesSinhalaAnswer,
  normalizeSinhalaText,
  shuffleArray,
  summarizePlacementAssessment,
} from '../utils/readingPlacement';

const POSITIVE_MESSAGES = ['හොඳයි! 🌟', 'නියමයි! 🎉', 'සුපිරි! 👏', 'මරු වැඩක්! 🥳'];
const ENCOURAGING_MESSAGES = ['කමක් නැහැ — නැවත උත්සාහ කරමු! 💪', 'ඔයාට පුළුවන්! තව එක වරක් බලමු 🌱', 'හොඳින් බලලා ආයෙත් උත්සාහ කරමු 😊'];
const MAX_ATTEMPTS = 2;

const playTone = (success = true) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.22, ctx.currentTime);
    master.connect(ctx.destination);

    const notes = success
      ? [523, 659, 784]
      : [330, 262];

    notes.forEach((frequency, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      oscillator.connect(gainNode);
      gainNode.connect(master);
      const startTime = ctx.currentTime + index * 0.12 + 0.02;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(1, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.24);
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.26);
    });

    setTimeout(() => ctx.close().catch(() => {}), 1200);
  } catch (_) {
    // Ignore audio failures.
  }
};

const playPronunciationAudio = (audioSrc) => {
  if (!audioSrc) return;
  try {
    const audio = new Audio(audioSrc);
    audio.play().catch(() => {});
  } catch (_) {
    // Ignore audio failures.
  }
};

const ProgressBar = ({ current, total }) => {
  const percentage = total ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between text-white/85 text-sm font-bold mb-2 px-1">
        <span>ප්‍රශ්නය {current} / {total}</span>
        <span>{percentage}%</span>
      </div>
      <div className="h-3 rounded-full bg-white/20 overflow-hidden shadow-inner">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          style={{ background: 'linear-gradient(90deg, #8B5CF6, #22C55E, #F59E0B)' }}
        />
      </div>
    </div>
  );
};

const SectionPill = ({ section }) => (
  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/85 text-slate-700 font-bold text-sm shadow-lg">
    <Sparkles size={14} className="text-emerald-500" />
    {section.shortTitle}
  </span>
);

const ChoiceButton = ({ option, selected, correct, locked, onSelect }) => {
  const isSelected = selected === option;
  const isCorrect = locked && option === correct;
  const isWrong = locked && isSelected && option !== correct;

  let baseClasses = 'border-white/30 bg-white/95 text-slate-800';
  if (isCorrect) baseClasses = 'border-emerald-400 bg-emerald-100 text-emerald-900';
  if (isWrong) baseClasses = 'border-rose-400 bg-rose-100 text-rose-900';
  if (!locked && isSelected) baseClasses = 'border-sky-400 bg-sky-100 text-sky-900 ring-4 ring-sky-200';

  return (
    <motion.button
      whileHover={{ scale: locked ? 1 : 1.03 }}
      whileTap={{ scale: locked ? 1 : 0.97 }}
      onClick={() => !locked && onSelect(option)}
      className={`min-h-[88px] rounded-[28px] border-4 shadow-xl px-4 py-4 font-black transition-colors ${baseClasses}`}
      style={{ fontSize: 'clamp(1.75rem, 5vw, 3.1rem)', fontFamily: "'Noto Sans Sinhala', 'Poppins', sans-serif" }}
    >
      {option}
    </motion.button>
  );
};

const FeedbackBanner = ({ status, text }) => {
  if (!status) return null;

  const palette = status === 'correct'
    ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
    : 'bg-amber-100 border-amber-300 text-amber-900';
  const cheerEmojis = status === 'correct' ? ['🌟', '🎉', '👏'] : ['🌱', '💪', '😊'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`relative overflow-hidden rounded-[24px] border-4 px-5 py-4 text-center shadow-lg ${palette}`}
      role="status"
      aria-live="polite"
    >
      <div className="mb-1 flex justify-center gap-3" aria-hidden="true">
        {cheerEmojis.map((emoji, index) => (
          <motion.span
            key={emoji}
            initial={{ opacity: 0, scale: 0.4, y: 8 }}
            animate={{ opacity: 1, scale: [0.8, 1.25, 1], y: [8, -5, 0], rotate: [0, index % 2 ? 10 : -10, 0] }}
            transition={{ duration: 0.55, delay: index * 0.08 }}
            className="text-2xl sm:text-3xl"
          >
            {emoji}
          </motion.span>
        ))}
      </div>
      <p className="font-black text-lg sm:text-xl">{text}</p>
    </motion.div>
  );
};

const SpeechCard = ({ question, onSubmit, attempts, feedback }) => {
  const [speechError, setSpeechError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setSpeechError('ඔබගේ browser එකේ SpeechRecognition නොමැත.');
      return undefined;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'si-LK';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;

    recognition.onresult = (event) => {
      const result = event.results?.[0];
      const alternatives = result
        ? Array.from({ length: result.length }, (_, index) => result[index]?.transcript?.trim()).filter(Boolean)
        : [];
      const heard = alternatives.find((transcript) =>
        matchesSinhalaAnswer(question.target, transcript, question.acceptedAnswers)
      ) || alternatives[0] || '';
      setIsListening(false);
      onSubmit(heard);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setSpeechError('නැවත උත්සාහ කරමු!');
    };

    recognition.onend = () => {
      setIsListening(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    recognitionRef.current = recognition;
    setSpeechSupported(true);

    return () => {
      recognition.abort();
      if (recognitionRef.current === recognition) recognitionRef.current = null;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [onSubmit, question.acceptedAnswers, question.target]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;

    setSpeechError('');
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (_) {
      setIsListening(false);
      setSpeechError('මයික්‍රෆෝනය ආරම්භ කළ නොහැක. නැවත උත්සාහ කරන්න.');
      return;
    }
    timeoutRef.current = setTimeout(() => {
      recognitionRef.current?.abort();
      setIsListening(false);
      onSubmit('');
    }, 15000);
  }, [isListening, onSubmit]);

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="rounded-[34px] bg-white/92 backdrop-blur-md border border-white/60 shadow-2xl overflow-hidden"
    >
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 px-6 py-5 text-white text-center">
        <SectionPill section={question.sectionMeta} />
        <p className="mt-2 text-white/90 text-lg font-bold">{question.prompt}</p>
      </div>

      <div className="px-5 py-6 md:px-8 md:py-8">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1, y: [0, -4, 0] }}
            transition={{ opacity: { duration: 0.25 }, scale: { duration: 0.25 }, y: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' } }}
            className="relative h-52 w-44 sm:h-64 sm:w-56 drop-shadow-xl"
          >
            <img
              src={elephantLetterBoardImg}
              alt={`Friendly elephant holding the word ${question.target}`}
              className="h-full w-full object-contain"
            />
            <span
              className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-3xl sm:text-4xl font-black text-emerald-900"
              style={{ fontFamily: "'Noto Sans Sinhala', 'Poppins', sans-serif" }}
            >
              {question.target}
            </span>
          </motion.div>

          <div className="flex items-center gap-3">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              className="w-24 h-24 rounded-[30px] bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center shadow-xl border-4 border-white"
            >
              <Mic size={44} className="text-orange-900" />
            </motion.div>
            {question.audio ? (
              <button
                type="button"
                onClick={() => playPronunciationAudio(question.audio)}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-slate-900 text-white font-black shadow-lg"
              >
                <Volume2 size={18} /> ශබ්දය අසන්න
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-slate-900 text-white font-black shadow-lg">
                <Volume2 size={18} /> කියවන්න
              </div>
            )}
          </div>

          {speechError && (
            <div className="rounded-3xl border-4 border-amber-300 bg-amber-100 px-5 py-4 text-center text-amber-900 font-bold">
              {speechError}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={startListening}
            disabled={isListening || feedback.locked || !speechSupported}
            className="w-full max-w-sm min-h-[92px] rounded-[30px] bg-gradient-to-br from-fuchsia-500 via-rose-500 to-orange-500 text-white font-black shadow-2xl border-4 border-white disabled:opacity-50"
            style={{ fontSize: 'clamp(1.5rem, 4vw, 2.1rem)' }}
          >
            {isListening ? 'අහනවා...' : 'මයික්‍රෆෝනය ඔබන්න'}
          </motion.button>

          <div className="w-full max-w-md grid gap-3">
            <button
              type="button"
              onClick={feedback.onRetry}
              disabled={!feedback.canRetry}
              className="min-h-[58px] rounded-[22px] bg-amber-400 text-amber-950 font-black shadow-lg disabled:opacity-40"
            >
              නැවත උත්සාහ කරමු
            </button>
            <button
              type="button"
              onClick={feedback.onContinue}
              disabled={!feedback.canContinue}
              className="min-h-[58px] rounded-[22px] bg-emerald-500 text-white font-black shadow-lg disabled:opacity-40"
            >
              {feedback.isLast ? 'ප්‍රතිඵල බලමු' : 'ඊළඟ ප්‍රශ්නය'}
            </button>
          </div>

          <div className="text-center text-sm text-slate-500 font-semibold">
            උත්සාහයන් {attempts} / {MAX_ATTEMPTS}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ResultCard = ({ result, onContinue, syncStatus, syncError, onRetrySync }) => {
  const startingGameLevel = getStartingGameLevel(result.recommendedLevel);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 180, damping: 18 }}
      className="w-full max-w-4xl mx-auto rounded-[36px] overflow-hidden shadow-2xl bg-white/92 backdrop-blur-md"
    >
      <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 px-6 py-8 text-center text-white">
        <motion.div
          animate={{ scale: [1, 1.08, 1], rotate: [0, -2, 2, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="mx-auto mb-4 w-20 h-20 rounded-full bg-white/20 flex items-center justify-center"
        >
          <Star size={38} className="fill-white" />
        </motion.div>
        <h2 className="text-4xl md:text-5xl font-black" style={{ fontFamily: "'Noto Sans Sinhala', 'Poppins', sans-serif" }}>
          නියමයි! 🎉
        </h2>
        <p className="mt-3 text-lg md:text-xl font-semibold">
          ඔයාගේ කියවීමේ ගමන ආරම්භ කරමු.
        </p>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: [0, -5, 0] }}
          transition={{ opacity: { duration: 0.35 }, scale: { duration: 0.35 }, y: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' } }}
          className="relative mx-auto mt-5 w-56 sm:w-64 md:w-72"
        >
          <img
            src={resultElephantBoardImg}
            alt={`Cheerful elephant holding the recommended Level ${startingGameLevel}`}
            className="h-auto w-full object-contain drop-shadow-2xl"
          />
          <div
            className="absolute left-1/2 top-[63%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-2xl font-black text-orange-900 sm:text-3xl"
            aria-label={`Recommended Level ${startingGameLevel}`}
          >
            🌱 Level {startingGameLevel}
          </div>
        </motion.div>
      </div>

      <div className="flex flex-col items-center gap-4 px-5 py-8 md:px-8 md:py-10">
        {syncStatus === 'error' && (
          <div className="w-full max-w-xl rounded-2xl bg-rose-100 px-4 py-3 text-center font-bold text-rose-800">
            ප්‍රතිඵල සුරැකීමට නොහැකි විය: {syncError}
            <button type="button" onClick={onRetrySync} className="ml-2 underline font-black">නැවත උත්සාහ කරන්න</button>
          </div>
        )}
        <button
          type="button"
          onClick={onContinue}
          disabled={syncStatus !== 'saved'}
          className="inline-flex min-h-[64px] w-full max-w-md items-center justify-center gap-2 rounded-[24px] bg-emerald-500 px-6 py-4 text-xl font-black text-white shadow-xl disabled:opacity-50"
        >
          <CheckCircle2 size={22} /> {syncStatus === 'saving' ? 'ප්‍රතිඵල සුරකිමින්…' : 'ක්‍රීඩා පිටුවට යමු'}
        </button>
      </div>
    </motion.div>
  );
};

const buildAssessmentRun = () => {
  const sectionDefinitions = PRE_TEST_SECTIONS.map((section) => ({
    ...section,
    questions: shuffleArray(PRE_TEST_BANK[section.key] ?? []).map((question) => ({
      ...question,
      options: question.options ? shuffleArray(question.options) : question.options,
      sectionMeta: section,
    })),
  }));

  const questions = sectionDefinitions.flatMap((section) => section.questions);
  return { sectionDefinitions, questions };
};

const ReadingPlacementAssessment = () => {
  const navigate = useNavigate();
  const { replay, stop } = useInstructionAudio();
  const { assessmentDone, completeAssessment, resetAssessment, syncing } = useDyslexiaProgress();

  const [assessmentRun, setAssessmentRun] = useState(() => buildAssessmentRun());
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [questionStatus, setQuestionStatus] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [submissionLocked, setSubmissionLocked] = useState(false);
  const [result, setResult] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [syncError, setSyncError] = useState('');
  const [showConfettiPopup, setShowConfettiPopup] = useState(false);

  const questionStartRef = useRef(Date.now());
  const assessmentStartedAtRef = useRef(null);
  const currentQuestion = assessmentRun.questions[currentIndex];
  const totalQuestions = assessmentRun.questions.length;

  // Returning learners should not see the pre-assessment again. Wait until
  // their email-linked progress has been restored before deciding where to go.
  useEffect(() => {
    if (!syncing && assessmentDone && !started) {
      navigate('/dyslexia', { replace: true });
    }
  }, [assessmentDone, navigate, started, syncing]);

  const resetFlow = useCallback(async () => {
    await resetAssessment();
    const nextRun = buildAssessmentRun();
    setAssessmentRun(nextRun);
    setStarted(false);
    setFinished(false);
    setCurrentIndex(0);
    setResponses([]);
    setSelectedAnswer('');
    setAttempts(0);
    setQuestionStatus('');
    setFeedbackText('');
    setCurrentTranscript('');
    setListening(false);
    setSubmissionLocked(false);
    setResult(null);
    setSyncStatus('idle');
    setSyncError('');
    setShowConfettiPopup(false);
    questionStartRef.current = Date.now();
    assessmentStartedAtRef.current = null;
  }, [resetAssessment]);

  useEffect(() => {
    if (!started) return;
    questionStartRef.current = Date.now();
    setSelectedAnswer('');
    setAttempts(0);
    setQuestionStatus('');
    setFeedbackText('');
    setCurrentTranscript('');
    setSubmissionLocked(false);

    if (currentQuestion?.type === 'letter-sound' && currentQuestion.audio) {
      playPronunciationAudio(currentQuestion.audio);
    }
  }, [currentIndex, started]);

  useEffect(() => () => stop(), [stop]);

  useEffect(() => {
    if (!showConfettiPopup) return undefined;
    const timer = setTimeout(() => setShowConfettiPopup(false), 1700);
    return () => clearTimeout(timer);
  }, [showConfettiPopup]);

  useEffect(() => {
    if (!started || finished || !submissionLocked) return undefined;

    const answeredCorrectly = questionStatus === 'correct';
    const attemptsExhausted = questionStatus === 'wrong' && attempts >= MAX_ATTEMPTS;
    if (!answeredCorrectly && !attemptsExhausted) return undefined;

    const timer = setTimeout(() => {
      setCurrentIndex((previous) => Math.min(previous + 1, totalQuestions - 1));
    }, answeredCorrectly ? 1500 : 0);

    return () => clearTimeout(timer);
  }, [attempts, finished, questionStatus, started, submissionLocked, totalQuestions]);

  const syncResult = useCallback(async (assessmentResult) => {
    setSyncStatus('saving');
    setSyncError('');
    try {
      await completeAssessment(assessmentResult);
      setSyncStatus('saved');
    } catch (error) {
      setSyncStatus('error');
      setSyncError(error?.response?.data?.message || error?.message || 'Backend unavailable');
    }
  }, [completeAssessment]);

  const completeQuestion = useCallback((response) => {
    setResponses((previous) => [...previous, response]);
    setSubmissionLocked(true);

    const nextIndex = currentIndex + 1;
    if (nextIndex >= totalQuestions) {
      const finalResult = summarizePlacementAssessment({
        assessmentId: `assessment_${Date.now()}`,
        childId: 'unknown-child',
        startedAt: assessmentStartedAtRef.current ?? new Date().toISOString(),
        completedAt: new Date().toISOString(),
        responses: [...responses, response],
      });
      setResult(finalResult);
      setFinished(true);
      syncResult(finalResult);
    }
  }, [assessmentRun.questions.length, currentIndex, responses, syncResult, totalQuestions]);

  const evaluateMultipleChoice = useCallback((option) => {
    if (!currentQuestion || submissionLocked) return;

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setSelectedAnswer(option);

    const correct = option === currentQuestion.target;
    const responseTimeMs = Date.now() - questionStartRef.current;

    if (correct) {
      playTone(true);
      setShowConfettiPopup(true);
      setQuestionStatus('correct');
      setFeedbackText(POSITIVE_MESSAGES[Math.floor(Math.random() * POSITIVE_MESSAGES.length)]);
      completeQuestion({
        questionId: currentQuestion.id,
        sectionKey: currentQuestion.sectionKey,
        type: currentQuestion.type,
        target: currentQuestion.target,
        selectedAnswer: option,
        correct: true,
        responseTimeMs,
        attempts: nextAttempts,
        mode: currentQuestion.mode ?? 'visual',
      });
      return;
    }

    playTone(false);
    setQuestionStatus('wrong');
    setFeedbackText(ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)]);

    if (nextAttempts >= MAX_ATTEMPTS) {
      completeQuestion({
        questionId: currentQuestion.id,
        sectionKey: currentQuestion.sectionKey,
        type: currentQuestion.type,
        target: currentQuestion.target,
        selectedAnswer: option,
        correct: false,
        responseTimeMs,
        attempts: nextAttempts,
        mode: currentQuestion.mode ?? 'visual',
      });
    }
  }, [attempts, completeQuestion, currentQuestion, submissionLocked]);

  const evaluateSpeech = useCallback((transcript) => {
    if (!currentQuestion || submissionLocked) return;

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    const responseTimeMs = Date.now() - questionStartRef.current;
    const normalizedTranscript = normalizeSinhalaText(transcript);
    setCurrentTranscript(transcript);
    setListening(false);

    const correct = matchesSinhalaAnswer(currentQuestion.target, transcript, currentQuestion.acceptedAnswers);
    if (correct) {
      playTone(true);
      setShowConfettiPopup(true);
      setQuestionStatus('correct');
      setFeedbackText(POSITIVE_MESSAGES[Math.floor(Math.random() * POSITIVE_MESSAGES.length)]);
      completeQuestion({
        questionId: currentQuestion.id,
        sectionKey: currentQuestion.sectionKey,
        type: currentQuestion.type,
        target: currentQuestion.target,
        selectedAnswer: normalizedTranscript || transcript,
        correct: true,
        responseTimeMs,
        attempts: nextAttempts,
        recognizedWord: transcript,
        normalizedRecognizedWord: normalizedTranscript,
      });
      return;
    }

    playTone(false);
    setQuestionStatus('wrong');
    setFeedbackText(ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)]);

    if (nextAttempts >= MAX_ATTEMPTS) {
      completeQuestion({
        questionId: currentQuestion.id,
        sectionKey: currentQuestion.sectionKey,
        type: currentQuestion.type,
        target: currentQuestion.target,
        selectedAnswer: normalizedTranscript || transcript,
        correct: false,
        responseTimeMs,
        attempts: nextAttempts,
        recognizedWord: transcript,
        normalizedRecognizedWord: normalizedTranscript,
      });
    }
  }, [attempts, completeQuestion, currentQuestion, submissionLocked]);

  const currentSection = currentQuestion?.sectionMeta ?? PRE_TEST_SECTIONS[0];
  const overallProgress = totalQuestions ? ((currentIndex + (submissionLocked ? 1 : 0)) / totalQuestions) * 100 : 0;

  const handleRetryQuestion = useCallback(() => {
    setSelectedAnswer('');
    setQuestionStatus('');
    setFeedbackText('');
    setCurrentTranscript('');
    setSubmissionLocked(false);
    questionStartRef.current = Date.now();
  }, []);

  const handleContinue = useCallback(() => {
    if (!result) return;
    navigate('/dyslexia', { replace: true });
  }, [navigate, result]);

  const handleStart = useCallback(() => {
    stop();
    setStarted(true);
    assessmentStartedAtRef.current = new Date().toISOString();
    questionStartRef.current = Date.now();
  }, [stop]);

  const currentQuestionIsSpeech = currentQuestion?.type === 'speech';
  const currentQuestionIsMultipleChoice = currentQuestion?.type !== 'speech';
  const selectedOption = selectedAnswer;
  const canContinue = submissionLocked;
  const canRetry = Boolean(questionStatus === 'wrong' && !submissionLocked && attempts > 0 && attempts < MAX_ATTEMPTS);
  const isLastQuestion = currentIndex + 1 >= totalQuestions;

  const onSpeechSubmit = useCallback((transcript) => {
    if (submissionLocked) return;
    if (transcript === '') {
      setListening(false);
      playTone(false);
      setQuestionStatus('wrong');
      setFeedbackText('හඬ ඇසුණේ නැහැ — නැවත සෙමින් කියමු 🎤😊');
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      if (nextAttempts >= MAX_ATTEMPTS) {
        const responseTimeMs = Date.now() - questionStartRef.current;
        completeQuestion({
          questionId: currentQuestion.id,
          sectionKey: currentQuestion.sectionKey,
          type: currentQuestion.type,
          target: currentQuestion.target,
          selectedAnswer: '',
          correct: false,
          responseTimeMs,
          attempts: nextAttempts,
        });
      }
      return;
    }

    evaluateSpeech(transcript);
  }, [attempts, completeQuestion, currentQuestion, evaluateSpeech, submissionLocked]);

  useEffect(() => {
    if (!currentQuestion || finished) return;
    if (currentQuestion.type === 'speech') {
      const timer = setTimeout(() => setListening(false), 0);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [currentQuestion, finished]);

  const renderedQuestion = useMemo(() => {
    if (!currentQuestion) return null;

    if (currentQuestion.type === 'speech') {
      const feedback = {
        canRetry: !submissionLocked && questionStatus === 'wrong' && attempts < MAX_ATTEMPTS,
        canContinue,
        onRetry: handleRetryQuestion,
        onContinue: () => {
          if (!submissionLocked) return;
          if (isLastQuestion) {
            handleContinue();
            return;
          }
          setCurrentIndex((previous) => previous + 1);
          setSelectedAnswer('');
          setQuestionStatus('');
          setFeedbackText('');
          setCurrentTranscript('');
          setAttempts(0);
          setSubmissionLocked(false);
          questionStartRef.current = Date.now();
        },
        isLast: isLastQuestion,
        locked: submissionLocked,
      };

      return (
        <SpeechCard
          question={currentQuestion}
          onSubmit={onSpeechSubmit}
          attempts={attempts}
          listening={listening}
          feedback={feedback}
        />
      );
    }

    return (
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -60 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="rounded-[34px] bg-white/92 backdrop-blur-md border border-white/60 shadow-2xl overflow-hidden"
      >
        <div className={`${currentQuestion.type === 'letter-recognition'
          ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-white border-b border-emerald-200'
          : 'bg-gradient-to-r from-indigo-600 via-sky-500 to-cyan-400 text-white'
        } px-6 py-5 text-center`}>
          <SectionPill section={currentSection} />
          {!['letter-recognition', 'letter-sound'].includes(currentQuestion.type) && (
            <h2 className="mt-3 text-3xl md:text-4xl font-black" style={{ fontFamily: "'Noto Sans Sinhala', 'Poppins', sans-serif" }}>
              {currentQuestion.target}
            </h2>
          )}
          <p className="mt-2 text-lg font-bold text-white/95">
            {currentQuestion.prompt}
          </p>
        </div>

        <div className="px-5 py-6 md:px-8 md:py-8">
          <div className="flex flex-col items-center gap-4">
            {currentQuestion.type === 'letter-recognition' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1, y: [0, -4, 0] }}
                transition={{ opacity: { duration: 0.25 }, scale: { duration: 0.25 }, y: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' } }}
                className="relative h-52 w-44 sm:h-64 sm:w-56 drop-shadow-xl"
              >
                <img
                  src={elephantLetterBoardImg}
                  alt={`Friendly elephant holding the letter ${currentQuestion.target}`}
                  className="h-full w-full object-contain"
                />
                <span
                  className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 text-5xl sm:text-6xl font-black text-emerald-900"
                  style={{ fontFamily: "'Noto Sans Sinhala', 'Poppins', sans-serif" }}
                  aria-hidden="true"
                >
                  {currentQuestion.target}
                </span>
              </motion.div>
            )}
            {currentQuestion.type !== 'letter-recognition' && (currentQuestion.type === 'letter-sound' || currentQuestion.mode === 'audio' ? (
              <div className="w-24 h-24 rounded-[30px] bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center shadow-xl border-4 border-white">
                <button
                  type="button"
                  onClick={() => playPronunciationAudio(currentQuestion.audio)}
                  className="w-full h-full rounded-[26px] flex items-center justify-center"
                >
                  <Volume2 size={44} className="text-orange-900" />
                </button>
              </div>
            ) : (
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                className="w-24 h-24 rounded-[30px] bg-gradient-to-br from-emerald-200 to-teal-300 flex items-center justify-center shadow-xl border-4 border-white"
                style={{ fontFamily: "'Noto Sans Sinhala', 'Poppins', sans-serif", fontSize: '3.4rem', fontWeight: 900, color: '#0F4C5C' }}
              >
                {currentQuestion.target}
              </motion.div>
            ))}

            <p className="text-slate-600 font-semibold text-center max-w-xl">නිවැරදි පිළිතුර තෝරන්න. උත්සාහ කිහිපයක් ගන්න පුළුවන්.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
              {currentQuestion.options.map((option) => (
                <ChoiceButton
                  key={option}
                  option={option}
                  selected={selectedOption}
                  correct={currentQuestion.target}
                  locked={submissionLocked}
                  onSelect={evaluateMultipleChoice}
                />
              ))}
            </div>

            <FeedbackBanner status={questionStatus} text={feedbackText} />

            <div className="flex w-full max-w-2xl gap-3">
              <button
                type="button"
                onClick={handleRetryQuestion}
                className="flex-1 min-h-[58px] rounded-[22px] bg-amber-400 text-amber-950 font-black shadow-lg inline-flex items-center justify-center gap-2"
                disabled={!questionStatus}
              >
                <RefreshCcw size={18} /> නැවත
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!submissionLocked) return;
                  if (isLastQuestion) {
                    handleContinue();
                    return;
                  }
                  setCurrentIndex((previous) => previous + 1);
                  setSelectedAnswer('');
                  setQuestionStatus('');
                  setFeedbackText('');
                  setAttempts(0);
                  setSubmissionLocked(false);
                  questionStartRef.current = Date.now();
                }}
                disabled={!canContinue}
                className="flex-1 min-h-[58px] rounded-[22px] bg-emerald-500 text-white font-black shadow-lg inline-flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLastQuestion ? 'ප්‍රතිඵල බලමු' : 'ඊළඟ ප්‍රශ්නය'} <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }, [attempts, canContinue, currentQuestion, currentSection, feedbackText, handleContinue, handleRetryQuestion, isLastQuestion, onSpeechSubmit, questionStatus, selectedOption, submissionLocked, currentTranscript, listening, evaluateMultipleChoice]);

  if (!started && (syncing || assessmentDone)) {
    return (
      <main className="dyslexia-game-responsive min-h-screen relative grid place-items-center overflow-hidden">
        <AnimatedJungleBackground />
        <div className="relative z-10 rounded-3xl border-2 border-white/70 bg-white/90 px-7 py-5 text-center text-lg font-black text-emerald-900 shadow-2xl backdrop-blur-md">
          ඔබගේ ඉගෙනුම් ගමන පූරණය වෙමින්...
        </div>
      </main>
    );
  }

  if (finished && result) {
    return (
      <main className="dyslexia-game-responsive min-h-screen relative overflow-x-hidden overflow-y-auto" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
        <AnimatedJungleBackground />
        <div className="relative z-10 px-4 py-8 md:py-12">
          <ResultCard
            result={result}
            onContinue={handleContinue}
            syncStatus={syncStatus}
            syncError={syncError}
            onRetrySync={() => syncResult(result)}
          />
        </div>
        <InstructionButton onReplay={replay} />
      </main>
    );
  }

  if (!started) {
    return (
      <main className="dyslexia-game-responsive min-h-screen relative overflow-x-hidden overflow-y-auto" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
        <AnimatedJungleBackground />
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 190, damping: 18 }}
            className="w-full max-w-xl rounded-[36px] bg-white/92 backdrop-blur-md shadow-2xl border border-white/70 overflow-hidden text-center"
          >
            <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 px-6 py-8 text-white">
              <motion.img
                src={preAssessmentChildImg}
                alt="Child happily reading a picture book"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="mx-auto mb-3 h-36 w-36 sm:h-44 sm:w-44 object-contain drop-shadow-2xl"
              />
              <h1 className="text-4xl md:text-5xl font-black" style={{ fontFamily: "'Noto Sans Sinhala', 'Poppins', sans-serif" }}>
                මගේ කියවීමේ මට්ටම බලමු!
              </h1>
              <p className="mt-3 text-lg font-semibold text-white/90">
                Let's find my reading level!
              </p>
            </div>

            <div className="px-6 py-7 md:px-8 md:py-8">
              <p className="text-xl md:text-2xl font-black text-slate-800 leading-relaxed" style={{ fontFamily: "'Noto Sans Sinhala', 'Poppins', sans-serif" }}>
                අකුරු, හඬ සහ වචන එක්ක සෙල්ලම් කරලා බලමු.
              </p>
              <p className="mt-4 text-slate-600 font-semibold">
                එක් එක් ප්‍රශ්නයට එකින් එක උත්තර දෙන්න. හොඳ උත්සාහයක් දුන්නට පසු නියම starting level එක ලැබේවි.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {PRE_TEST_SECTIONS.map((section) => (
                  <div key={section.key} className="rounded-[22px] border-2 border-emerald-100 bg-emerald-50 px-4 py-3 text-left">
                    <div className="text-lg font-black text-emerald-900" style={{ fontFamily: "'Noto Sans Sinhala', 'Poppins', sans-serif" }}>
                      {section.title}
                    </div>
                    <div className="text-sm text-emerald-700 font-semibold mt-1">{section.shortTitle}</div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleStart}
                className="mt-8 w-full min-h-[64px] rounded-[24px] bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 text-white text-2xl font-black shadow-2xl"
              >
                ආරම්භ කරන්න 🎮
              </button>

              <button
                type="button"
                onClick={() => navigate('/dyslexia')}
                className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-slate-500 font-semibold"
              >
                <RotateCcw size={16} /> පෙර මොඩියුලයට යන්න
              </button>
            </div>
          </motion.div>
        </div>
        <InstructionButton onReplay={replay} />
      </main>
    );
  }

  return (
    <main className="dyslexia-game-responsive min-h-screen relative overflow-x-hidden overflow-y-auto" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
      <AnimatedJungleBackground />
      <div className="relative z-10 px-4 py-8 md:py-10">
        <div className="mx-auto flex max-w-4xl flex-col gap-5">
          <motion.header
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white"
          >
            <h1 className="text-3xl md:text-5xl font-black" style={{ fontFamily: "'Noto Sans Sinhala', 'Poppins', sans-serif" }}>
              මගේ කියවීමේ මට්ටම බලමු!
            </h1>
            <p className="mt-2 text-white/85 font-semibold">ප්‍රශ්නයක් එකවර. හොඳින් බලන්න, හොඳින් අහන්න.</p>
          </motion.header>

          <ProgressBar current={currentIndex + 1} total={totalQuestions} />

          <AnimatePresence mode="wait">
            {renderedQuestion}
          </AnimatePresence>

          {questionStatus && (
            <FeedbackBanner
              status={questionStatus}
              text={feedbackText}
            />
          )}
        </div>
      </div>
      <InstructionButton onReplay={replay} />
      <DyslexiaConfettiBurst active={showConfettiPopup} />
    </main>
  );
};

export default ReadingPlacementAssessment;
