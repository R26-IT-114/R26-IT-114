import { LEVELS } from '../utils/gameLevelProgress';
import DyscalculiaBackButton from './DyscalculiaBackButton';
import '../styles/level-system.css';

const copy = {
  easy: ['🟢', 'Easy', 'පහසු', "Let's start slowly!"],
  medium: ['🟡', 'Medium', 'මධ්‍යම', 'Ready for a challenge?'],
  hard: ['🔴', 'Hard', 'අමාරු', "Let's become a number expert!"],
};

const sinhalaDescriptions = {
  easy: 'හෙමින් පටන් ගමු!',
  medium: 'අභියෝගයකට සූදානම්ද?',
  hard: 'සංඛ්‍යා විශේෂඥයෙක් වෙමු!',
};

const DifficultySelector = ({
  levels = {},
  selected,
  onSelect,
  onBack,
  fullScreen = false,
  language = 'en',
  mascotImages = {},
}) => (
  <section className={`dc-level-screen ocean-level-screen ${fullScreen ? 'is-full-screen' : ''}`}>
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
        const [icon, english, sinhala, description] = copy[level];
        const isSinhala = language === 'si';
        const mascotImage = mascotImages[level];

        return (
          <button
            key={level}
            type="button"
            disabled={locked}
            aria-label={`${isSinhala ? sinhala : english}${locked ? (isSinhala ? ' අගුළු දමා ඇත' : ' locked') : ''}`}
            onClick={() => !locked && onSelect(level)}
            className={`dc-level-button ocean-level-${level} ${selected === level ? 'is-selected' : ''} ${info.completed ? 'is-complete' : ''} ${locked ? 'is-locked' : ''}`}
          >
            {mascotImage && (
              <img
                className="dc-level-starfish"
                src={mascotImage}
                alt=""
                aria-hidden="true"
              />
            )}
            <span className="dc-level-card-content">
              <span className="dc-level-status-icon">{locked ? '🔒' : icon}</span>
              <b>{isSinhala ? sinhala : english}</b>
              {!isSinhala && <small>{sinhala}</small>}
              <em>
                {locked
                  ? (isSinhala ? 'පෙර මට්ටම සම්පූර්ණ කර විවෘත කරන්න' : 'Complete the previous level to unlock')
                  : (isSinhala ? sinhalaDescriptions[level] : description)}
              </em>
            </span>
          </button>
        );
      })}
    </div>
  </section>
);

export default DifficultySelector;
