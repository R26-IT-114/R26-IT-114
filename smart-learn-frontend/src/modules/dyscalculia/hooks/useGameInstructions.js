import { useEffect, useRef } from 'react';
import { REPLAY_EVENT } from '../utils/gameAudio';

export default function useGameInstructions(replay) {
  const replayRef = useRef(replay);
  useEffect(() => { replayRef.current = replay; });
  useEffect(() => {
    const handleReplay = (event) => {
      event.preventDefault();
      replayRef.current?.();
    };
    window.addEventListener(REPLAY_EVENT, handleReplay);
    return () => window.removeEventListener(REPLAY_EVENT, handleReplay);
  }, []);
}
