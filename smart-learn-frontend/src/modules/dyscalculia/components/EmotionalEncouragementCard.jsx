import '../styles/dyscalculia-cartoon.css';

const EmotionalEncouragementCard = ({ message, emoji = '🎈' }) => {
  return (
    <section className="dg-encourage-card" aria-label="Encouragement">
      <div className="dg-encourage-emoji" aria-hidden="true">
        {emoji}
      </div>
      <div className="dg-encourage-text">
        <div className="dg-encourage-title">ඔයාට පුළුවන් ⭐</div>
        <div className="dg-encourage-message">{message}</div>
      </div>
    </section>
  );
};

export default EmotionalEncouragementCard;

