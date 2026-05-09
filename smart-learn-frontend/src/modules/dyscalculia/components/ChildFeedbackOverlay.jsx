import React from 'react';
import { MODE, getFeedbackVariants } from '../utils/childEngagement';

const ChildFeedbackOverlay = ({
  open,
  correct,
  mode = MODE.DEFAULT,
  message,
  onDone,
  autoCloseMs,
}) => {
  if (!open) return null;

  const variant = getFeedbackVariants({ correct, mode });

  return (
    <div className={`dg-feedback-overlay ${variant.overlayClass}`} role="status" aria-live="polite">
      <div className="dg-feedback-card">
        <div className="dg-feedback-emoji" aria-hidden="true">
          {variant.overlayEmoji}
        </div>
        <div className="dg-feedback-message">{message}</div>
        {/* Visual cue: dots animation for reduced-motion off */}
        <div className={`dg-feedback-cues ${mode === MODE.CALM ? 'calm' : ''}`} aria-hidden="true" />
        {autoCloseMs ? (
          <button type="button" className="dg-btn dg-btn-primary" onClick={onDone}>
            Continue
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default ChildFeedbackOverlay;

