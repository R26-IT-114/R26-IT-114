import { useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DysgraphiaRewardBox from '../components/DysgraphiaRewardBox';
import { useDysgraphiaRewards } from '../hooks/useDysgraphiaRewards';
import { NODE_LETTERS } from '../data/nodeLetterCatalog';
import { dysgraphiaService } from '../services/dysgraphiaService';
import backImage from '../../../assets/images/dysgraphia/back.png';
import dragBoxImage from '../../../assets/images/dysgraphia/dinosaurs/dinosaur-letter-drop-box.png';
import mirrorImage from '../../../assets/images/dysgraphia/mirror01.png';
import trexLetterBoard from '../../../assets/images/dysgraphia/dinosaurs/letter-boards/baby-trex-letter-board.png';
import triceratopsLetterBoard from '../../../assets/images/dysgraphia/dinosaurs/letter-boards/baby-triceratops-letter-board.png';
import stegosaurusLetterBoard from '../../../assets/images/dysgraphia/dinosaurs/letter-boards/baby-stegosaurus-letter-board.png';
import brachiosaurusLetterBoard from '../../../assets/images/dysgraphia/dinosaurs/letter-boards/baby-brachiosaurus-letter-board.png';
import correctAudio from '../../../assets/audio/dysgraphia/correct.mp3';
import rewardAudio from '../../../assets/audio/dysgraphia/reward.mp3';
import tryAgainAudio from '../../../assets/audio/dysgraphia/tryagain.wav';
import '../styles/dysgraphia-common.css';
import '../styles/dysgraphia-home.css';
import '../styles/mirror-letter-drag-challenge.css';

const DINO_LETTER_BOARDS = [trexLetterBoard, triceratopsLetterBoard, stegosaurusLetterBoard, brachiosaurusLetterBoard];

const WORD_ROUNDS = [
  ['ga', 'ma', 'na'], // ගමන
  ['ka', 'ma', 'la'], // කමල
  ['sa', 'ra', 'la'], // සරල
  ['sa', 'ma', 'na', 'la'], // සමනල
  ['a', 'ma', 'tha', 'ka'], // අමතක
  ['pa', 'ha', 'na'], // පහන
];

const makeChoices = (round) => {
  const wordLetterIds = WORD_ROUNDS[round % WORD_ROUNDS.length];
  const correctChoices = wordLetterIds.map((letterId, wordIndex) => {
    const letter = NODE_LETTERS[letterId].letter;
    return { id: `${round}-${wordIndex}-correct`, letter, board: DINO_LETTER_BOARDS[(wordIndex + round) % DINO_LETTER_BOARDS.length], mirrored: false, wordIndex };
  });
  const mirroredLetterIds = [
    ...wordLetterIds,
    ...Object.keys(NODE_LETTERS).filter((letterId) => !wordLetterIds.includes(letterId)),
  ].slice(0, 8 - correctChoices.length);
  const mirroredChoices = mirroredLetterIds
    .map((letterId, wordIndex) => ({
    id: `${round}-${wordIndex}-mirror`,
    letter: NODE_LETTERS[letterId].letter,
    board: DINO_LETTER_BOARDS[(wordIndex + correctChoices.length + round) % DINO_LETTER_BOARDS.length],
    mirrored: true,
    wordIndex,
  }));
  const choices = [...correctChoices, ...mirroredChoices];

  // A deterministic shuffle keeps the layout stable while the child is playing.
  return choices
    .map((choice, index) => ({ choice, order: (index * 7 + round * 3) % choices.length }))
    .sort((a, b) => a.order - b.order)
    .map(({ choice }) => choice);
};

const playSound = (source) => {
  const audio = new Audio(source);
  audio.volume = 0.9;
  audio.play().catch(() => {});
};

const MirrorLetterDragChallenge = () => {
  const navigate = useNavigate();
  const { letterId = 'ta' } = useParams();
  const { totalStars, rewardPulse, awardStars } = useDysgraphiaRewards();
  const [round, setRound] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [complete, setComplete] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [correctDropPulse, setCorrectDropPulse] = useState(0);
  const sessionIdRef = useRef(globalThis.crypto?.randomUUID?.() || `mirror-${Date.now()}`);
  const roundStartedAtRef = useRef(Date.now());
  const submittedRoundsRef = useRef(new Set());
  const choices = useMemo(() => makeChoices(round), [round]);
  const correctTotal = choices.filter((choice) => !choice.mirrored).length;
  const collectedLetters = choices
    .filter((choice) => selectedIds.has(choice.id))
    .sort((a, b) => a.wordIndex - b.wordIndex);

  const recordCompletedRound = (roundWrongAttempts) => {
    const completionId = `${sessionIdRef.current}-round-${round}`;
    if (submittedRoundsRef.current.has(completionId)) return;
    submittedRoundsRef.current.add(completionId);
    const totalSelections = correctTotal + roundWrongAttempts;
    const accuracy = totalSelections > 0 ? correctTotal / totalSelections : 0;
    const targetWord = WORD_ROUNDS[round % WORD_ROUNDS.length]
      .map((id) => NODE_LETTERS[id]?.letter || '')
      .join('');
    dysgraphiaService.recordInterventionResult({
      completionId,
      gameType: 'mirror-letter-drag',
      targetLetterId: NODE_LETTERS[letterId] ? letterId : 'ta',
      targetLetter: NODE_LETTERS[letterId]?.letter || NODE_LETTERS.ta.letter,
      targetWord,
      correct: true,
      score: Math.round(accuracy * 100),
      accuracy,
      attempts: totalSelections,
      mistakes: roundWrongAttempts,
      completed: true,
      durationSeconds: Math.max(0, Math.round((Date.now() - roundStartedAtRef.current) / 1000)),
    }).catch((error) => console.error('Could not save mirror intervention result.', error));
  };

  const checkChoice = (choice) => {
    if (complete || !choice || selectedIds.has(choice.id)) return;
    if (choice && !choice.mirrored) {
      const nextSelected = new Set(selectedIds).add(choice.id);
      setSelectedIds(nextSelected);
      setCorrectDropPulse((value) => value + 1);
      playSound(correctAudio);
      if (nextSelected.size === correctTotal) {
        setFeedback('correct');
        playSound(rewardAudio);
        const stars = wrongAttempts === 0 ? 3 : wrongAttempts <= 2 ? 2 : 1;
        awardStars(stars);
        setComplete(true);
        recordCompletedRound(wrongAttempts);
      } else {
        setFeedback('progress');
        window.setTimeout(() => setFeedback(null), 650);
      }
    } else {
      setWrongAttempts((count) => count + 1);
      setFeedback('wrong');
      playSound(tryAgainAudio);
      window.setTimeout(() => setFeedback(null), 1200);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const choice = choices.find((item) => item.id === draggingId);
    setDraggingId(null);
    checkChoice(choice);
  };

  const retryRound = () => {
    setFeedback(null);
    setWrongAttempts(0);
    setDraggingId(null);
    setComplete(false);
    setSelectedIds(new Set());
    roundStartedAtRef.current = Date.now();
    setRound((value) => value + 1);
  };

  return (
    <main className="mld-page">
      <DysgraphiaRewardBox totalStars={totalStars} rewardPulse={rewardPulse} />
      <button type="button" className="mld-back" aria-label="ආපහු" onClick={() => navigate('/dysgraphia/progress')}><img src={backImage} alt="" /></button>

      <section className="mld-card">
        <header className="mld-header"><img src={mirrorImage} alt="" className="mld-header-mirror" /><div><h1>හරි අකුරු සියල්ල ඇදගෙන යමු!</h1></div></header>
    
     <div className="mld-status"><span>උත්සාහ: {wrongAttempts + 1}</span><span>වැරදි: {wrongAttempts}</span></div>

          <div className="mld-choices" aria-label="අකුරු තේරීම්">
          {choices.map((choice) => (
            <button
              type="button"
              draggable={!complete && !selectedIds.has(choice.id)}
              key={choice.id}
              className={`mld-letter-tile ${draggingId === choice.id ? 'is-dragging' : ''} ${selectedIds.has(choice.id) ? 'is-selected' : ''}`}
              onDragStart={(event) => { setDraggingId(choice.id); event.dataTransfer.effectAllowed = 'move'; }}
              onDragEnd={() => setDraggingId(null)}
              onClick={() => checkChoice(choice)}
              aria-label="අකුරු තේරීම"
            >
              <img src={choice.board} alt="" draggable="false" />
              <span className={`mld-board-letter ${choice.mirrored ? 'is-mirrored' : ''}`}>{choice.letter}</span>
            </button>
          ))}
        </div>

        <div className={`mld-drop-zone ${draggingId ? 'is-ready' : ''} ${feedback === 'correct' ? 'is-correct' : ''} ${feedback === 'wrong' ? 'is-wrong' : ''}`} onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
          <div className={`mld-box-stage ${draggingId ? 'is-waiting' : ''} ${feedback === 'progress' || feedback === 'correct' ? 'is-celebrating' : ''}`}>
            <img src={dragBoxImage} alt="හරි අකුරු දමන පෙට්ටිය" />
            {(feedback === 'progress' || feedback === 'correct') && (
              <div className="mld-firework" key={correctDropPulse} aria-hidden="true">
                {Array.from({ length: 12 }, (_, index) => <i key={index} style={{ '--spark-angle': `${index * 30}deg` }} />)}
              </div>
            )}
          
          </div>
        </div>

        <div className="mld-result-section">
          <div className="mld-collected">
            {Array.from({ length: correctTotal }, (_, index) => {
              const selectedLetter = collectedLetters.find((choice) => choice.wordIndex === index);
              return <span className={selectedLetter ? '' : 'is-empty'} key={index}>{selectedLetter?.letter || '•'}</span>;
            })}
          </div>
        </div>

        <br></br>

        {complete && (
          <div className="mld-actions">
            {round < WORD_ROUNDS.length - 1 ? (
              <button type="button" onClick={retryRound}>අලුත් වචනයක්</button>
            ) : (
              <button type="button" onClick={() => navigate('/dysgraphia/progress')}>සම්පූර්ණයි</button>
            )}
          </div>
        )}
        </section>
    </main>
  );
};

export default MirrorLetterDragChallenge;
