const STORAGE_KEY = 'smartlearn:dyscalculia:sound';
export const AUDIO_CHANGE_EVENT = 'dyscalculia:sound-change';
export const REPLAY_EVENT = 'dyscalculia:replay';
const media = new Set();
const contexts = new Set();
const suspendedByMute = new Set();
let enabled = true;
try { enabled = localStorage.getItem(STORAGE_KEY) !== 'off'; } catch { /* Storage is optional. */ }

export const isGameSoundEnabled = () => enabled;

export const setGameSoundEnabled = (value) => {
  enabled = Boolean(value);
  try { localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off'); } catch { /* Storage is optional. */ }
  for (const audio of media) audio.muted = !enabled;
  if (!enabled) window.speechSynthesis?.cancel();
  for (const context of contexts) {
    if (context.state === 'closed') { contexts.delete(context); suspendedByMute.delete(context); continue; }
    if (!enabled && context.state === 'running') {
      suspendedByMute.add(context);
      context.suspend().catch(() => {});
    } else if (enabled && suspendedByMute.has(context)) {
      suspendedByMute.delete(context);
      context.resume().catch(() => {});
    }
  }
  window.dispatchEvent(new Event(AUDIO_CHANGE_EVENT));
};

export const createGameAudio = (src) => {
  const audio = new Audio(src);
  audio.muted = !enabled;
  media.add(audio);
  // Release inactive clips; replay registers them again and reapplies mute.
  audio.addEventListener('play', () => { audio.muted = !enabled; media.add(audio); });
  audio.addEventListener('ended', () => media.delete(audio));
  audio.addEventListener('pause', () => media.delete(audio));
  return audio;
};

export const createGameAudioContext = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const context = new AudioContext();
  contexts.add(context);
  const resume = context.resume.bind(context);
  context.resume = () => enabled ? resume() : Promise.resolve();
  if (!enabled) {
    suspendedByMute.add(context);
    context.suspend().catch(() => {});
  }
  return context;
};

export const speakGameUtterance = (utterance) => {
  if (enabled) window.speechSynthesis?.speak(utterance);
};
