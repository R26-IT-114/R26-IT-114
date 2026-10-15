let currentSession = null;

// A session belongs to one mounted game, never to the next route.
export function startGameAudioSession() {
  const session = { active: true, audio: new Set(), speech: new Set(), timers: new Set() };
  currentSession = session;
  return () => {
    session.active = false;
    for (const timer of session.timers) window.clearTimeout(timer);
    for (const audio of session.audio) {
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      audio.currentTime = 0;
    }
    for (const utterance of session.speech) {
      utterance.onend = null;
      utterance.onerror = null;
    }
    if (currentSession === session) {
      window.speechSynthesis?.cancel();
      currentSession = null;
    }
    session.audio.clear();
    session.speech.clear();
    session.timers.clear();
  };
}

export function createGameAudio(source) {
  const session = currentSession;
  const audio = new Audio(source);
  const play = audio.play.bind(audio);
  session?.audio.add(audio);
  audio.play = () => {
    if (!session?.active) return Promise.resolve();
    return play().catch((error) => {
      // A rejected playback promise must not start fallback speech after exit.
      if (session.active) throw error;
    });
  };
  return audio;
}

export function speakGameAudio(utterance) {
  if (!currentSession?.active) return;
  currentSession.speech.add(utterance);
  window.speechSynthesis?.speak(utterance);
}

export function setGameAudioTimeout(callback, delay) {
  const session = currentSession;
  if (!session?.active) return undefined;
  const timer = window.setTimeout(() => {
    session.timers.delete(timer);
    if (session.active) callback();
  }, delay);
  session.timers.add(timer);
  return timer;
}
