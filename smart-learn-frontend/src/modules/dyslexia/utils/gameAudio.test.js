import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createGameAudio, setGameAudioTimeout, speakGameAudio, startGameAudioSession } from './gameAudio';

let audio;
let stop;
beforeEach(() => {
  vi.useFakeTimers();
  audio = { play: vi.fn().mockResolvedValue(), pause: vi.fn(), currentTime: 12 };
  vi.stubGlobal('Audio', vi.fn(function () { return audio; }));
  vi.stubGlobal('speechSynthesis', { speak: vi.fn(), cancel: vi.fn() });
  stop = startGameAudioSession();
});
afterEach(() => {
  stop();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it('stops recorded audio and queued browser speech when a game exits', async () => {
  const recording = createGameAudio('animal.mp3');
  await recording.play();
  const utterance = { onend: vi.fn(), onerror: vi.fn() };
  speakGameAudio(utterance);
  stop();
  expect(audio.pause).toHaveBeenCalled();
  expect(audio.currentTime).toBe(0);
  expect(window.speechSynthesis.cancel).toHaveBeenCalled();
  expect(utterance.onend).toBeNull();
  expect(utterance.onerror).toBeNull();
});

it('cancels delayed playback and prevents stopped audio from restarting', async () => {
  const originalPlay = audio.play;
  const recording = createGameAudio('word.mp3');
  const callback = vi.fn(() => recording.play());
  setGameAudioTimeout(callback, 120);
  stop();
  vi.runAllTimers();
  await recording.play();
  expect(callback).not.toHaveBeenCalled();
  expect(originalPlay).not.toHaveBeenCalled();
});

it('does not start fallback speech from a playback failure arriving after exit', async () => {
  let rejectPlay;
  audio.play = vi.fn(() => new Promise((resolve, reject) => { rejectPlay = reject; }));
  const fallback = vi.fn();
  const playback = createGameAudio('word.mp3').play().catch(fallback);
  stop();
  rejectPlay(new Error('late playback rejection'));
  await playback;
  expect(fallback).not.toHaveBeenCalled();
});

it('allows the next game to play without reviving the previous game timers', () => {
  const previousCallback = vi.fn();
  setGameAudioTimeout(previousCallback, 100);
  stop();
  stop = startGameAudioSession();
  const nextCallback = vi.fn();
  setGameAudioTimeout(nextCallback, 100);
  vi.runAllTimers();
  expect(previousCallback).not.toHaveBeenCalled();
  expect(nextCallback).toHaveBeenCalledOnce();
  const nextUtterance = {};
  speakGameAudio(nextUtterance);
  expect(window.speechSynthesis.speak).toHaveBeenCalledWith(nextUtterance);
});
