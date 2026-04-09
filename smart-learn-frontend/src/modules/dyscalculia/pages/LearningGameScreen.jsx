import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDyscalculiaFlow } from '../context/DyscalculiaFlowContext';
import ChoiceButton from '../components/ChoiceButton';
import AudioInstructionButton from '../components/AudioInstructionButton';
import RewardPopup from '../components/RewardPopup';
import { speakSinhala } from '../utils/audioGuide';
import '../styles/dyscalculia.css';

const activityTaskBank = {
  'number-recognition': [
    { prompt: 'Tap number 6', instructionSi: '6 අංකය තෝරන්න', options: ['6', '8', '3'], answer: '6' },
    { prompt: 'Tap number 2', instructionSi: '2 අංකය තෝරන්න', options: ['5', '2', '9'], answer: '2' },
  ],
  counting: [
    { prompt: 'How many ducks? 🦆🦆🦆', instructionSi: 'බත්තු ගණන කීයද?', options: ['2', '3', '4'], answer: '3' },
    { prompt: 'How many books? 📘📘', instructionSi: 'පොත් ගණන කීයද?', options: ['1', '2', '3'], answer: '2' },
  ],
  'magnitude-comparison': [
    { prompt: 'Which is bigger? 9 or 4', instructionSi: 'ලොකු අගය තෝරන්න', options: ['9', '4'], answer: '9' },
    { prompt: 'Which is smaller? 3 or 7', instructionSi: 'කුඩා අගය තෝරන්න', options: ['3', '7'], answer: '3' },
  ],
  'simple-arithmetic': [
    { prompt: '1 + 2 = ?', instructionSi: '1 + 2 = ?', options: ['2', '3', '4'], answer: '3' },
    { prompt: '4 - 1 = ?', instructionSi: '4 - 1 = ?', options: ['2', '3', '4'], answer: '3' },
  ],
};

const LearningGameScreen = () => {
  const navigate = useNavigate();
  const { activityId } = useParams();
  const { recommendations, markLearningGameComplete } = useDyscalculiaFlow();

  const activity = recommendations.find((item) => item.id === activityId);
  const tasks = useMemo(() => {
    if (!activity) return [];
    return activityTaskBank[activity.skillType] || [];
  }, [activity]);

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [startTime, setStartTime] = useState(Date.now());
  const [timeTotals, setTimeTotals] = useState([]);
  const [showReward, setShowReward] = useState(false);

  if (!activity || tasks.length === 0) {
    return (
      <main className='dys-shell'>
        <section className='dys-card'>
          <h2 className='dys-title'>Activity not found</h2>
          <button className='dys-btn dys-btn-primary' onClick={() => navigate('/dyscalculia/recommendation')}>
            Back to Recommendations
          </button>
        </section>
      </main>
    );
  }

  const currentTask = tasks[index];

  const handleAnswer = (answer) => {
    const elapsed = Date.now() - startTime;
    setTimeTotals((prev) => [...prev, elapsed]);

    const correct = answer === currentTask.answer;
    if (correct) setScore((prev) => prev + 1);

    setFeedback(correct ? '✅ Awesome!' : '❌ Oops, next one!');

    window.setTimeout(() => {
      if (index + 1 >= tasks.length) {
        const finalScore = correct ? score + 1 : score;
        const accuracy = finalScore / tasks.length;
        const avgTime = [...timeTotals, elapsed].reduce((s, n) => s + n, 0) / tasks.length;

        markLearningGameComplete({
          activityId: activity.id,
          accuracy,
          averageResponseTimeMs: avgTime,
        });
        setShowReward(true);
        return;
      }

      setIndex((prev) => prev + 1);
      setStartTime(Date.now());
      setFeedback('');
    }, 350);
  };

  const earnedStars = Math.max(1, Math.round(((score + 1) / tasks.length) * 3));

  return (
    <main className='dys-shell'>
      <section className='dys-card'>
        <p className='dys-chip'>{activity.title}</p>
        <h2 className='dys-title'>{currentTask.prompt}</h2>
        <AudioInstructionButton onClick={() => speakSinhala(currentTask.instructionSi)} />

        <div className='dys-choice-grid'>
          {currentTask.options.map((opt) => (
            <ChoiceButton key={opt} onClick={() => handleAnswer(opt)}>
              {opt}
            </ChoiceButton>
          ))}
        </div>

        {feedback ? <p className='dys-feedback'>{feedback}</p> : null}
      </section>

      <RewardPopup
        open={showReward}
        stars={earnedStars}
        badge='Math Champion'
        onClose={() => navigate('/dyscalculia/progress-dashboard')}
      />
    </main>
  );
};

export default LearningGameScreen;
