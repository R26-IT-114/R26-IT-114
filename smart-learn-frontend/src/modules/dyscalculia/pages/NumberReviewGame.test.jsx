import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NumberReviewGame from './NumberReviewGame';
import { predictNumber } from '../api/numberPredictionApi';
import { triggerDyscalculiaReward } from '../components/DyscalculiaRewardBurst';
import { speakGameUtterance } from '../utils/gameAudio';

vi.mock('../api/numberPredictionApi', () => ({ predictNumber: vi.fn() }));
vi.mock('../components/DyscalculiaRewardBurst', () => ({ triggerDyscalculiaReward: vi.fn() }));
vi.mock('../utils/gameAudio', () => ({
  REPLAY_EVENT: 'dyscalculia:replay-instructions',
  speakGameUtterance: vi.fn(),
}));
vi.mock('react-sketch-canvas', async () => {
  const { forwardRef, useImperativeHandle } = await import('react');
  return {
    ReactSketchCanvas: forwardRef(function DrawingCanvas({ onStroke }, ref) {
      useImperativeHandle(ref, () => ({
        exportPaths: async () => [{ paths: [{ x: 10, y: 10 }, { x: 20, y: 20 }] }],
        exportImage: async () => 'data:image/png;base64,drawing',
        clearCanvas: vi.fn(),
      }), []);
      return <button type="button" onClick={onStroke}>අංකය අඳිමු</button>;
    }),
  };
});

const numberNames = ['බිංදුව', 'එක', 'දෙක', 'තුන', 'හතර', 'පහ', 'හය', 'හත', 'අට', 'නවය'];

function hearTarget() {
  const [utterance] = speakGameUtterance.mock.calls.at(-1);
  return String(numberNames.indexOf(utterance.text));
}

function finishFeedback() {
  act(() => vi.advanceTimersByTime(1100));
}

async function flushPrediction() {
  // Flush canvas export and prediction promises while keeping feedback timers pending.
  await act(async () => {});
}

async function openWritingRound(mode) {
  const view = render(<MemoryRouter><NumberReviewGame /></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: hearTarget(), exact: true }));
  finishFeedback();
  fireEvent.click(screen.getByRole('button', { name: 'අංකය අඳිමු' }));
  if (mode === 'mirror') {
    fireEvent.click(screen.getByRole('button', { name: '✅ අගයන්න' }));
    await flushPrediction();
    finishFeedback();
    expect(screen.getByText('2 / 7')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'correct number' }));
    finishFeedback();
    fireEvent.click(screen.getByRole('button', { name: 'අංකය අඳිමු' }));
    predictNumber.mockClear();
    triggerDyscalculiaReward.mockClear();
  }
  return view;
}

function tapCheckTwice() {
  const check = screen.getByRole('button', { name: '✅ අගයන්න' });
  act(() => {
    check.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    check.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  vi.stubGlobal('SpeechSynthesisUtterance', class {
    constructor(text) { this.text = text; }
  });
  vi.stubGlobal('speechSynthesis', { cancel: vi.fn() });
  predictNumber.mockImplementation(async ({ actualNumber }) => ({ isCorrect: true, predictedNumber: actualNumber, confidence: 0.98 }));
});

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe.each(['find-write', 'mirror'])('%s review round', (mode) => {
  const round = mode === 'mirror' ? 2 : 1;

  it('shows successful drawing feedback before automatically moving to the next round', async () => {
    await openWritingRound(mode);
    fireEvent.click(screen.getByRole('button', { name: '✅ අගයන්න' }));
    await flushPrediction();

    expect(triggerDyscalculiaReward).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toHaveTextContent('අපූරුයි');
    expect(screen.getByText(`${round} / 7`)).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1099));
    expect(screen.getByText(`${round} / 7`)).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByText(`${round + 1} / 7`)).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('sends one prediction for rapid Check taps while a request is pending', async () => {
    await openWritingRound(mode);
    let resolvePrediction;
    predictNumber.mockImplementationOnce(() => new Promise((resolve) => { resolvePrediction = resolve; }));
    tapCheckTwice();
    await flushPrediction();

    expect(predictNumber).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: '⏳ ...' })).toBeDisabled();
    expect(triggerDyscalculiaReward).not.toHaveBeenCalled();
    await act(async () => { resolvePrediction({ isCorrect: true, predictedNumber: Number(hearTarget()) }); });
    expect(triggerDyscalculiaReward).toHaveBeenCalledTimes(1);
    // The synchronous lock also remains in force during positive feedback.
    tapCheckTwice();
    await flushPrediction();
    expect(predictNumber).toHaveBeenCalledTimes(1);
    finishFeedback();
    expect(screen.getByText(`${round + 1} / 7`)).toBeInTheDocument();
  });

  it('ignores a successful response that arrives after leaving the game', async () => {
    const view = await openWritingRound(mode);
    let resolvePrediction;
    predictNumber.mockImplementationOnce(() => new Promise((resolve) => { resolvePrediction = resolve; }));
    fireEvent.click(screen.getByRole('button', { name: '✅ අගයන්න' }));
    await flushPrediction();
    expect(predictNumber).toHaveBeenCalledTimes(1);
    view.unmount();
    await act(async () => { resolvePrediction({ isCorrect: true, predictedNumber: 1 }); });
    expect(triggerDyscalculiaReward).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
    act(() => vi.advanceTimersByTime(10000));
    expect(triggerDyscalculiaReward).not.toHaveBeenCalled();
  });

  it('keeps an incorrect drawing on the current round for another attempt', async () => {
    await openWritingRound(mode);
    predictNumber.mockResolvedValueOnce({ isCorrect: false, predictedNumber: 9 });
    fireEvent.click(screen.getByRole('button', { name: '✅ අගයන්න' }));
    await flushPrediction();
    expect(screen.getByText(/හරි නැහැ\. නැවත අඳින්න/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '✅ අගයන්න' })).toBeEnabled();
    expect(triggerDyscalculiaReward).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByText(`${round} / 7`)).toBeInTheDocument();
  });
});

it('shows the frozen elapsed time after the seven review rounds without inventing attempt totals', async () => {
  await openWritingRound('find-write');
  for (let round = 0; round < 7; round += 1) {
    fireEvent.click(screen.getByRole('button', { name: '✅ අගයන්න' }));
    await flushPrediction();
    finishFeedback();
    if (round < 6) {
      const mirrorChoice = screen.queryByRole('button', { name: 'correct number' });
      fireEvent.click(mirrorChoice || screen.getByRole('button', { name: hearTarget(), exact: true }));
      finishFeedback();
      fireEvent.click(screen.getByRole('button', { name: 'අංකය අඳිමු' }));
    }
  }
  expect(screen.getByText('7 / 7')).toBeInTheDocument();
  expect(screen.queryByText('උත්සාහ කළ වාර')).not.toBeInTheDocument();
  expect(screen.queryByText('නැවත උත්සාහ කළ වාර')).not.toBeInTheDocument();
  const duration = screen.getByText('සෙල්ලම් කළ කාලය').parentElement.querySelector('strong');
  expect(duration).toHaveTextContent(/^15.4 තත්\.$/);
  act(() => vi.advanceTimersByTime(10000));
  expect(duration).toHaveTextContent(/^15.4 තත්\.$/);
});
