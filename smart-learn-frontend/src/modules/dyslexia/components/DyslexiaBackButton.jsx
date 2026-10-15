import { ArrowLeft } from 'lucide-react';

export default function DyslexiaBackButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="dyslexia-back-button"
      aria-label="ආපසු යන්න"
      title="ආපසු යන්න"
    >
      <ArrowLeft size={24} strokeWidth={2.5} aria-hidden="true" />
    </button>
  );
}
