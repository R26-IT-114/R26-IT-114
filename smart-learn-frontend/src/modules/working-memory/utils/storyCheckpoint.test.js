import { beforeEach, expect, it, vi } from 'vitest';
import { clearStoryCheckpoint, readStoryCheckpoint, saveStoryCheckpoint } from './storyCheckpoint';

beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });
const result = { score: 3, totalWrong: 4, totalResponseMs: 12000, responseCount: 7 };

it('restores all part one counts needed for unchanged final accuracy and response time', () => {
  saveStoryCheckpoint('child-a', result);
  expect(readStoryCheckpoint('child-a')).toEqual({ version: 1, ...result });
});

it('keeps checkpoints separate for children and guests', () => {
  saveStoryCheckpoint('child-a', result);
  expect(readStoryCheckpoint('child-b')).toBeNull();
  expect(readStoryCheckpoint(null)).toBeNull();
  saveStoryCheckpoint('child-b', { ...result, score: 1 });
  clearStoryCheckpoint('child-a');
  expect(readStoryCheckpoint('child-a')).toBeNull();
  expect(readStoryCheckpoint('child-b').score).toBe(1);
});

it('ignores malformed checkpoints', () => {
  localStorage.setItem('wm_story_checkpoint:child-a', '{');
  expect(readStoryCheckpoint('child-a')).toBeNull();
  localStorage.setItem('wm_story_checkpoint:child-a', JSON.stringify({ version: 1, score: -1 }));
  expect(readStoryCheckpoint('child-a')).toBeNull();
});

it('continues the session if browser storage is unavailable', () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage blocked'); });
  expect(saveStoryCheckpoint('child-a', result)).toEqual({ version: 1, ...result });
});
