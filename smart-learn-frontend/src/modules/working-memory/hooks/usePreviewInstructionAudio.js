import { useCallback, useEffect, useRef, useState } from "react";

export default function usePreviewInstructionAudio(audioRef, enabled, source) {
  const [playing, setPlaying] = useState(false);
  const requestRef = useRef(0);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const request = ++requestRef.current;
    setPlaying(true);
    audio.play().catch(() => {
      if (requestRef.current === request) setPlaying(false);
    });
  }, [audioRef]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!enabled || !audio) return undefined;
    const stopped = () => setPlaying(false);
    audio.addEventListener("pause", stopped);
    audio.addEventListener("ended", stopped);
    audio.addEventListener("error", stopped);
    play();
    return () => {
      ++requestRef.current;
      audio.removeEventListener("pause", stopped);
      audio.removeEventListener("ended", stopped);
      audio.removeEventListener("error", stopped);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audioRef, enabled, source, play]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio || !enabled) return;
    if (playing) {
      ++requestRef.current;
      audio.pause();
      audio.currentTime = 0;
      setPlaying(false);
    } else {
      audio.currentTime = 0;
      play();
    }
  };

  return { playing, setPlaying, toggle };
}
