import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { createGameAudio, createGameAudioContext, isGameSoundEnabled, setGameSoundEnabled, speakGameUtterance } from './gameAudio';

class MockAudio extends EventTarget {
  muted = false;
  play() { this.dispatchEvent(new Event('play')); return Promise.resolve(); }
  pause() { this.dispatchEvent(new Event('pause')); }
}
const resume = vi.fn();
class MockContext {
  state = 'running';
  suspend() { this.state = 'suspended'; return Promise.resolve(); }
  resume() { resume(); this.state = 'running'; return Promise.resolve(); }
}

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('Audio', MockAudio);
  vi.stubGlobal('AudioContext', MockContext);
  vi.stubGlobal('speechSynthesis', { cancel: vi.fn(), speak: vi.fn() });
  setGameSoundEnabled(true);
  resume.mockClear();
});
afterEach(() => { setGameSoundEnabled(true); vi.unstubAllGlobals(); });

describe('module sound preference', () => {
  it('mutes a currently playing clip and newly created clips', async () => {
    const playing = createGameAudio('number.mp3');
    await playing.play();
    setGameSoundEnabled(false);
    expect(playing.muted).toBe(true);
    expect(createGameAudio('intro.mp3').muted).toBe(true);
    expect(isGameSoundEnabled()).toBe(false);
    expect(localStorage.getItem('smartlearn:dyscalculia:sound')).toBe('off');
    setGameSoundEnabled(true);
    expect(playing.muted).toBe(false);
  });
  it('reapplies mute when a paused clip is replayed', async () => {
    const clip = createGameAudio('intro.mp3');
    await clip.play(); clip.pause();
    setGameSoundEnabled(false);
    await clip.play();
    expect(clip.muted).toBe(true);
  });
  it('cancels current speech and blocks new speech while muted', () => {
    setGameSoundEnabled(false);
    const utterance = { text: 'එක' };
    speakGameUtterance(utterance);
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
    expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
    setGameSoundEnabled(true);
    speakGameUtterance(utterance);
    expect(window.speechSynthesis.speak).toHaveBeenCalledWith(utterance);
  });
  it('prevents a game from resuming muted Web Audio effects', async () => {
    setGameSoundEnabled(false);
    const context = createGameAudioContext();
    await context.resume();
    expect(resume).not.toHaveBeenCalled();
    expect(context.state).toBe('suspended');
    setGameSoundEnabled(true);
    expect(context.state).toBe('running');
    context.state = 'closed';
  });
  it('suspends an existing effect immediately on mute', () => {
    const context = createGameAudioContext();
    setGameSoundEnabled(false);
    expect(context.state).toBe('suspended');
    context.state = 'closed';
  });
});
