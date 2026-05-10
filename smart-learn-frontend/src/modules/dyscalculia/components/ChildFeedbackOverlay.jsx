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
  if (!open) return null;

  const variant = getFeedbackVariants({ correct, mode });

  useEffect(() => {
    if (autoCloseMs && open) {
      const timer = setTimeout(() => {
        if (onDone) onDone();
      }, autoCloseMs);
      return () => clearTimeout(timer);
    }
  }, [autoCloseMs, open, onDone]);

  return (
    <div className={`feedback-overlay ${correct ? 'success' : 'wrong'}`}>
      <div className="feedback-content">
        <div className="feedback-emoji">{correct ? '🎉✨🌟' : '💪🎈✨'}</div>
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