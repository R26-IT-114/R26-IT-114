import { LEVELS } from '../utils/gameLevelProgress';
import DyscalculiaBackButton from './DyscalculiaBackButton';
import '../styles/level-system.css';
import '../styles/unified-level-picker.css';
import easyBoard from '../../working-memory/assets/reward-turtle-board-v2.png';
import mediumBoard from '../../working-memory/assets/nback-fish-level-board-generated.png';
import hardBoard from '../../../assets/images/dyscalculiaimages/level-board-animals/hard-octopus-board.webp';

const levelBoards = { easy: easyBoard, medium: mediumBoard, hard: hardBoard };

const copy = {
  easy: ['🟢', 'Easy', 'පහසු', "Let's start slowly!"],
  medium: ['🟡', 'Medium', 'මධ්‍යම', 'Ready for a challenge?'],
  hard: ['🔴', 'Hard', 'අමාරු', "Let's become a number expert!"],
};

const DifficultySelector = ({
  levels = {},
  selected,
  onSelect,
  onBack,
  fullScreen = false,
  language = 'en',
}) => (
  <section className={`dc-level-screen ocean-level-screen dc-unified-levels dc-animal-board-levels ${fullScreen ? 'is-full-screen' : ''}`}>
    {onBack && (
      <DyscalculiaBackButton
        onClick={onBack}
        variant="aqua"
        className="dc-level-screen__back"
      />
    )}

    {fullScreen && (
      <>
        <p className="dc-level-kicker">🌊 OCEAN NUMBER ADVENTURE</p>
        <h1>ඔබගේ මට්ටම තෝරන්න</h1>
        {language !== 'si' && <p>Choose Your Ocean Level</p>}
      </>
    )}

    <div className="dc-level-selector">
      {LEVELS.map((level) => {
        const info = levels[level] || {};
        const locked = info.unlocked === false;
        const [, english, sinhala] = copy[level];
        const isSinhala = language === 'si';

        return (
          <button
            key={level}
            type="button"
            disabled={locked}
            aria-label={`${isSinhala ? sinhala : english}${locked ? (isSinhala ? ' අගුළු දමා ඇත' : ' locked') : ''}`}
            onClick={() => !locked && onSelect(level)}
            className={`dc-level-button ocean-level-${level} ${selected === level ? 'is-selected' : ''} ${info.completed ? 'is-complete' : ''} ${locked ? 'is-locked' : ''}`}
          >
            <img className="dc-animal-level-board" src={levelBoards[level]} alt="" aria-hidden="true" />
            <span className="dc-animal-level-label">
              <b>{sinhala}</b>
              {locked && <small>🔒 {isSinhala ? 'අගුළු දමා ඇත' : 'Locked'}</small>}
              {!locked && info.completed && <small>✓ {isSinhala ? 'සම්පූර්ණයි' : 'Completed'}</small>}
            </span>
          </button>
        );
      })}
    </div>
  </section>
);

export default DifficultySelector;
