import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DysgraphiaRewardBox from '../components/DysgraphiaRewardBox';
import { useDysgraphiaRewards } from '../hooks/useDysgraphiaRewards';
import { NODE_LETTERS } from '../data/nodeLetterCatalog';
import backImage from '../../../assets/images/dysgraphia/back.png';
import dragBoxImage from '../../../assets/images/dysgraphia/dragbox.png';
import leavesBg from '../../../assets/images/dysgraphia/bgletter04.png';
import monkey from '../../../assets/images/dysgraphia/monkey.png';
import mirrorImage from '../../../assets/images/dysgraphia/mirror01.png';
import letterAImage from '../../../assets/images/dysgraphia/AL.png';
import letterBaImage from '../../../assets/images/dysgraphia/BaL.png';
import letterDhaImage from '../../../assets/images/dysgraphia/DhaL.png';
import letterGaImage from '../../../assets/images/dysgraphia/GaL.png';
import letterHaImage from '../../../assets/images/dysgraphia/HaL.png';
import letterKaImage from '../../../assets/images/dysgraphia/KaL.png';
import letterLaImage from '../../../assets/images/dysgraphia/LaL.png';
import letterMaImage from '../../../assets/images/dysgraphia/MaL.png';
import letterNaImage from '../../../assets/images/dysgraphia/NaL.png';
import letterPaImage from '../../../assets/images/dysgraphia/PaL.png';
import letterRaImage from '../../../assets/images/dysgraphia/RaL.png';
import letterSaImage from '../../../assets/images/dysgraphia/SaL.png';
import letterTaImage from '../../../assets/images/dysgraphia/TaL.png';
import letterThaImage from '../../../assets/images/dysgraphia/ThaL.png';
import letterUImage from '../../../assets/images/dysgraphia/UL.png';
import letterYaImage from '../../../assets/images/dysgraphia/YaL.png';
import correctAudio from '../../../assets/audio/dysgraphia/correct.mp3';
import rewardAudio from '../../../assets/audio/dysgraphia/reward.mp3';
import tryAgainAudio from '../../../assets/audio/dysgraphia/tryagain.wav';
import '../styles/dysgraphia-common.css';
import '../styles/dysgraphia-home.css';
import '../styles/mirror-letter-drag-challenge.css';

const LETTER_IMAGES = {
  a: letterAImage, ba: letterBaImage, dha: letterDhaImage, ga: letterGaImage,
  ha: letterHaImage, ka: letterKaImage, la: letterLaImage, ma: letterMaImage,
  na: letterNaImage, pa: letterPaImage, ra: letterRaImage, sa: letterSaImage,
  ta: letterTaImage, tha: letterThaImage, u: letterUImage, ya: letterYaImage,
};

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
    return { id: `${round}-${wordIndex}-correct`, letter, image: LETTER_IMAGES[letterId], mirrored: false, wordIndex };
  });
  const mirroredLetterIds = [
    ...wordLetterIds,
    ...Object.keys(NODE_LETTERS).filter((letterId) => !wordLetterIds.includes(letterId)),
  ].slice(0, 8 - correctChoices.length);
  const mirroredChoices = mirroredLetterIds
    .map((letterId, wordIndex) => ({
    id: `${round}-${wordIndex}-mirror`,
    letter: NODE_LETTERS[letterId].letter,
    image: LETTER_IMAGES[letterId],
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
  const { totalStars, rewardPulse, awardStars } = useDysgraphiaRewards();
  const [round, setRound] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [complete, setComplete] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [correctDropPulse, setCorrectDropPulse] = useState(0);
  const choices = useMemo(() => makeChoices(round), [round]);
  const correctTotal = choices.filter((choice) => !choice.mirrored).length;
  const collectedLetters = choices
    .filter((choice) => selectedIds.has(choice.id))
    .sort((a, b) => a.wordIndex - b.wordIndex);

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

  const TopMonkeys = () => (
    <>
      <div className="dg-monkey-top dg-monkey-top--left" aria-hidden="true">
        <img src={monkey} alt="" className="dg-monkey-img" />
      </div>
      <div className="dg-monkey-top dg-monkey-top--right" aria-hidden="true">
        <img src={monkey} alt="" className="dg-monkey-img" />
      </div>
    </>
  );


  const LeavesBackground = () => (
    <div className="dg-leaves-bg-wrap" aria-hidden="true">
      {/* Hidden SVG that defines the wave-distortion filter */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id="dgLeafWave" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.009 0.014"
            numOctaves="2"
            seed="7"
            result="dgNoise"
          >
            <animate
              attributeName="baseFrequency"
              values="0.009 0.014;0.013 0.018;0.007 0.011;0.011 0.016;0.009 0.014"
              dur="16s"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="dgNoise"
            scale="22"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
  
      <div className="dg-leaves-bg" style={{ backgroundImage: `url(${leavesBg})` }} />
      <div className="dg-leaves-overlay" />
    </div>
  );

  const retryRound = () => {
    setFeedback(null);
    setWrongAttempts(0);
    setDraggingId(null);
    setComplete(false);
    setSelectedIds(new Set());
    setRound((value) => value + 1);
  };

  return (
    <main className="mld-page">
      <LeavesBackground />
      <TopMonkeys />
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
              <img className={choice.mirrored ? 'is-mirrored' : ''} src={choice.image} alt={`${choice.letter}${choice.mirrored ? ' mirrored' : ''}`} draggable="false" />
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
