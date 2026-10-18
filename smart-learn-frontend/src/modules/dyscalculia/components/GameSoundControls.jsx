import { speakSinhala } from '../utils/audioGuide';
import { useEffect, useState } from 'react';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { AUDIO_CHANGE_EVENT, REPLAY_EVENT, isGameSoundEnabled, setGameSoundEnabled } from '../utils/gameAudio';

export default function GameSoundControls() {
  const [enabled, setEnabled] = useState(isGameSoundEnabled);
  useEffect(() => {
    const update = () => setEnabled(isGameSoundEnabled());
    window.addEventListener(AUDIO_CHANGE_EVENT, update);
    return () => window.removeEventListener(AUDIO_CHANGE_EVENT, update);
  }, []);
  return <div className="dc-sound-controls" role="group" aria-label="හඬ පාලනය">
    <button type="button" onClick={() => setGameSoundEnabled(!enabled)} aria-pressed={enabled} aria-label={enabled ? 'හඬ නවත්වන්න' : 'හඬ සක්‍රිය කරන්න'} title={enabled ? 'හඬ නවත්වන්න' : 'හඬ සක්‍රිය කරන්න'}>
      {enabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
    </button>
    <button type="button" disabled={!enabled} onClick={() => {
      const handled = !window.dispatchEvent(new Event(REPLAY_EVENT, { cancelable: true }));
      if (!handled) speakSinhala('ක්‍රීඩාවක් තෝරා අංක ඉගෙන ගමු.');
    }} aria-label="උපදෙස් නැවත අසන්න" title="උපදෙස් නැවත අසන්න"><RotateCcw size={20} /></button>
  </div>;
}
