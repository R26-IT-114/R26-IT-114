import turtleBoard from '../../working-memory/assets/reward-turtle-board-v2.png';

// Pure presentation: callers supply the saved reward, never calculate it here.
export default function RewardArtwork({ value, label = 'මේ සෙල්ලමේ තරු', symbol = '⭐' }) {
  return <figure className="dc-reward-art">
    <img src={turtleBoard} alt="" aria-hidden="true" draggable={false} />
    <figcaption>
      <span className="dc-reward-art__symbol" aria-hidden="true">{symbol}</span>
      <strong className="dc-reward-art__value">{value}</strong>
      <span className="dc-reward-art__label">{label}</span>
    </figcaption>
  </figure>;
}
