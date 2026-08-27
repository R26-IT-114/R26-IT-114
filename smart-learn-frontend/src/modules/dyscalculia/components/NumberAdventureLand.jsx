import '../styles/number-adventure-land.css';
import DyscalculiaBackButton from './DyscalculiaBackButton';

export const AdventureBackdrop = ({ station = '', message }) => (
  <>
    <div className={`nal-backdrop ${station}`} aria-hidden='true'>
      <span className='nal-light-ray nal-ray-one' />
      <span className='nal-light-ray nal-ray-two' />
      <span className='nal-bubble nal-bubble-one' />
      <span className='nal-bubble nal-bubble-two' />
      <span className='nal-bubble nal-bubble-three' />
      <span className='nal-fish nal-fish-one'>🐠</span>
      <span className='nal-fish nal-fish-two'>🐟</span>
      <span className='nal-starfish nal-star-one'>⭐</span>
      <span className='nal-coral nal-coral-one'>🪸</span>
      <span className='nal-coral nal-coral-two'>🌿</span>
    </div>
    <MascotMessage className='nal-floating-mascot' message={message} />
  </>
);

export const MascotMessage = ({ message = 'ඔයාට පුළුවන්! 💪', className = '' }) => (
  <aside className={`nal-mascot-message ${className}`} aria-live='polite'>
    <span className='nal-mascot' aria-hidden='true'>🐢</span>
    <span><b>Tiki:</b> {message}</span>
  </aside>
);

export const GameHeader = ({ station, title, subtitle, score, onBack, backVariant = 'aqua' }) => (
  <header className='nal-game-header'>
    {onBack && <DyscalculiaBackButton onClick={onBack} variant={backVariant} className='dc-ocean-back-button--in-header' />}
    <div>
      <p>{station}</p>
      <h1>{title}</h1>
      {subtitle && <small>{subtitle}</small>}
    </div>
    {score !== undefined && <div className='nal-score-badge'>⭐ {score}</div>}
  </header>
);

export const AdventureProgressBar = ({ value = 0, label }) => (
  <div className='nal-progress-wrap ocean-progress-wrap'>
    {label && <span>{label}</span>}
    <div className='nal-progress'><span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /><i aria-hidden='true'>🐢</i></div>
  </div>
);

export const RewardStars = ({ count = 0, total = 3 }) => (
  <div className='nal-reward-stars' aria-label={`${count} stars earned`}>
    {Array.from({ length: total }, (_, index) => <span className={index < count ? 'is-earned' : ''} key={index}>⭐</span>)}
  </div>
);

export const AdventureResultScreen = ({ icon = '🏝️', title, message, children, actions }) => (
  <section className='nal-result-screen'>
    <div className='nal-result-icon' aria-hidden='true'>{icon}</div>
    <h1>{title}</h1>
    {message && <p>{message}</p>}
    {children}
    {actions && <div className='nal-result-actions'>{actions}</div>}
  </section>
);

export const AdventureGameCard = ({ game, onPlay }) => {
  const openGame = () => onPlay(game.route);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openGame();
    }
  };

  return (
    <article
      className='game-card nal-game-card ocean-game-card'
      style={{ borderLeftColor: game.color, '--card-gradient': game.bgGradient, '--card-accent': game.color }}
      role='link'
      tabIndex={0}
      aria-label={`Play ${game.subName}`}
      onClick={openGame}
      onKeyDown={handleKeyDown}
    >
      <div className='game-card-glow' style={{ background: game.bgGradient }} />
      {game.cardImage ? <img className='game-card-corner-image' src={game.cardImage} alt={game.cardImageAlt || ''} loading='lazy' /> : <span className='game-card-corner-art' aria-hidden='true'>{game.cardArt || game.icon}</span>}
      <div className='game-card-icon' style={{ background: game.bgGradient }}><span className='game-icon'>{game.icon}</span></div>
      <div className='game-card-content'>
        <p className='nal-station-label'>{game.station}</p>
        <h4 className='game-card-title'>{game.name}</h4>
        <p className='game-card-subtitle'>{game.subName}</p>
      </div>
      <button type='button' className='game-play-btn' style={{ background: game.bgGradient }} tabIndex={-1} aria-hidden='true'>
        <span>සෙල්ලම් කරමු</span><span className='play-arrow'>🏖️</span>
      </button>
    </article>
  );
};
