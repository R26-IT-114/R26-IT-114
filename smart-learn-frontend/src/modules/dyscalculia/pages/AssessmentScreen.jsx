import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDyscalculiaFlow } from '../context/DyscalculiaFlowContext';
import { speakSinhala } from '../utils/audioGuide';
import AudioInstructionButton from '../components/AudioInstructionButton';
import ChoiceButton from '../components/ChoiceButton';
import ProgressBar from '../components/ProgressBar';
import '../styles/dyscalculia.css';

const AssessmentScreen = () => {
  const navigate = useNavigate();
  const {
    currentQuestion,
    currentQuestionIndex,
    questions,
    assessmentProgress,
    submitAssessmentAnswer,
  } = useDyscalculiaFlow();

  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  useEffect(() => {
    setQuestionStartTime(Date.now());
    setSelectedAnswer('');
    setFeedback('');
  }, [currentQuestionIndex]);

  const questionNumber = useMemo(
    () => Math.min(currentQuestionIndex + 1, questions.length),
    [currentQuestionIndex, questions.length]
  );

  if (!currentQuestion) {
    return (
      <main className='dys-shell'>
        <section className='dys-card'>
          <h2 className='dys-title'>Assessment Finished</h2>
          <button
            type='button'
            className='dys-btn dys-btn-primary'
            onClick={() => navigate('/dyscalculia/result-summary')}
          >
            See Result
          </button>
        </section>
      </main>
    );
  }

  const handleSubmit = () => {
    if (!selectedAnswer) return;

    const responseTimeMs = Date.now() - questionStartTime;
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    setFeedback(isCorrect ? '✅ Great!' : '❌ Try next one!');

    window.setTimeout(() => {
      const outcome = submitAssessmentAnswer({ selectedAnswer, responseTimeMs });
      if (outcome.completed) {
        navigate('/dyscalculia/result-summary');
      }
    }, 350);
  };

  return (
    <main className='dys-shell'>
      <section className='dys-card'>
        <div className='dys-row-between'>
          <p className='dys-chip'>Question {questionNumber}</p>
          <AudioInstructionButton
            label='Sinhala Guide'
            onClick={() => speakSinhala(currentQuestion.instructionSi)}
          />
        </div>

        <ProgressBar value={assessmentProgress} />

        <h2 className='dys-title'>{currentQuestion.prompt}</h2>
        <p className='dys-visual'>{currentQuestion.visual}</p>

        <div className='dys-choice-grid'>
          {currentQuestion.options.map((option) => (
            <ChoiceButton
              key={option}
              selected={selectedAnswer === option}
              onClick={() => setSelectedAnswer(option)}
            >
              {option}
            </ChoiceButton>
          ))}
        </div>

        {feedback ? <p className='dys-feedback'>{feedback}</p> : null}

        <button
          type='button'
          className='dys-btn dys-btn-primary'
          onClick={handleSubmit}
          disabled={!selectedAnswer}
        >
          Next
        </button>
      </section>
    </main>
  );
};

export default AssessmentScreen;
