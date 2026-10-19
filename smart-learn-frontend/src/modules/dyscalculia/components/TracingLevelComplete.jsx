import AccuracyStars from './AccuracyStars';
import RewardArtwork from './RewardArtwork';
import RewardDialog from './RewardDialog';
import rewardTrophy from '../../working-memory/assets/reward-trophy-cartoon-v2.png';

const LEVEL_LABELS = { easy: 'පහසු', medium: 'මධ්‍යම', hard: 'අමාරු' };

const TracingLevelComplete = ({ level, averageAccuracy, onNext }) => {
  const accuracy = Number.isFinite(Number(averageAccuracy)) ? Math.max(0, Math.min(100, Math.round(Number(averageAccuracy)))) : null;
  const rewardCard = <section className='dc-level-complete dc-tracing-celebration'>
    <header className="dc-tracing-celebration__header">
      <img className="dc-tracing-celebration__trophy" src={rewardTrophy} alt="" aria-hidden="true" draggable={false} />
      <h2 className="dc-reward-heading">මට්ටම සම්පූර්ණයි!</h2>
    </header>
    <div className="dc-tracing-celebration__layout">
      <RewardArtwork value={accuracy === null ? '✓' : `${accuracy}%`} label="ලිවීමේ ප්‍රගතිය" symbol="🎯" />
      <div className="dc-tracing-celebration__summary">
        <p>{LEVEL_LABELS[level] || ''} මට්ටමේ අංක ඔක්කොම ලියා අවසන්!</p>
        <strong>අපූරුයි! ඔයා හරිම දක්ෂයි!</strong>
        {accuracy !== null && <AccuracyStars confidence={accuracy / 100} label="මේ මට්ටමේ ලිවීමේ ප්‍රගතිය" />}
      </div>
    </div>
    <div className="dc-reward-actions">
      {onNext && <button type='button' className='dc-reward-action dc-reward-action--primary' onClick={onNext}>තව අංක ලියමු →</button>}
      <a className="dc-reward-action" href="/dyscalculia/dashboard">මගේ ඉගෙනුම් ගමනට යමු</a>
    </div>
  </section>;

  return <RewardDialog label="මට්ටම සම්පූර්ණයි!">{rewardCard}</RewardDialog>;
};

export default TracingLevelComplete;
