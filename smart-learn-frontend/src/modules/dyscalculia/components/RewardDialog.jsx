import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import '../styles/game-result-card.css';

export default function RewardDialog({ label, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const dialog = dialogRef.current;
    dialog?.focus({ preventScroll: true });
    const keepFocusInside = (event) => {
      if (event.key !== 'Tab' || !dialog) return;
      const controls = Array.from(dialog.querySelectorAll('button:not(:disabled), a[href], [tabindex="0"]'));
      const first = controls[0], last = controls[controls.length - 1];
      if (!first) { event.preventDefault(); dialog.focus(); }
      else if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    dialog?.addEventListener('keydown', keepFocusInside);
    return () => {
      dialog?.removeEventListener('keydown', keepFocusInside);
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  const modal = <div className="dc-reward-modal">
    <div ref={dialogRef} className="dc-reward-dialog-card" tabIndex={-1} role="dialog" aria-modal="true" aria-label={label}>
      {children}
    </div>
  </div>;
  return typeof document === 'undefined' ? modal : createPortal(modal, document.body);
}
