export default function GameRoundProgress({ current, total, correct }) {
  const value = Math.max(0, Math.min(total, current));
  return <div className="dc-round-progress">
    <div className="dc-round-progress__meta" aria-live="polite" aria-atomic="true">
      <strong>{value} / {total}</strong>
      <span>ඉතිරි {Math.max(0, total - value)}</span>
      {correct !== undefined && <span aria-label={`නිවැරදි පිළිතුරු ${correct}`}>✓ {correct}</span>}
    </div>
    <div className="dc-round-progress__bar" role="progressbar" aria-label="ප්‍රශ්න ප්‍රගතිය" aria-valuemin={0} aria-valuemax={total} aria-valuenow={value}>
      <span style={{ width: `${total > 0 ? (value / total) * 100 : 0}%` }} />
    </div>
  </div>;
}
