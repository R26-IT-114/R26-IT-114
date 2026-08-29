import React, { useEffect } from 'react';
import { MODE, getFeedbackVariants } from '../utils/childEngagement';

const ChildFeedbackOverlay = ({
  open,
  correct,
  mode = MODE.DEFAULT,
  message,
  onDone,
  autoCloseMs = 2000,
}) => {
  useEffect(() => {
    if (!open || !autoCloseMs) return undefined;

    const timer = setTimeout(() => {
      onDone?.();
    }, autoCloseMs);

    return () => clearTimeout(timer);
  }, [autoCloseMs, open, onDone]);

  if (!open) return null;

  const variant = getFeedbackVariants({ correct, mode });

  return (
    <div className={`feedback-overlay ${variant.overlayClass}`}>
      <div className="feedback-content">
        <div className="feedback-emoji">{variant.overlayEmoji}</div>
        <div className="feedback-message">
          {message || (correct ? 'හොඳයි! 🎉' : 'නැවත උත්සාහ කරන්න! 💪')}
        </div>
        <div className="feedback-progress">
          <div className="progress-bar" style={{ animationDuration: `${autoCloseMs}ms` }} />
        </div>
      </div>
    </div>
  );
};

export default ChildFeedbackOverlay;
