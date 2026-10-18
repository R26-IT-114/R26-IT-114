import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import usePreviewInstructionAudio from "./usePreviewInstructionAudio";

function setup(play = vi.fn().mockResolvedValue(undefined)) {
  const audio = Object.assign(new EventTarget(), {
    play, pause: vi.fn(), currentTime: 0,
  });
  const ref = { current: audio };
  const hook = renderHook(({ enabled }) => usePreviewInstructionAudio(ref, enabled, "instructions.mp3"), {
    initialProps: { enabled: true },
  });
  return { audio, ...hook };
}

describe("preview voice instructions", () => {
  it("autoplays, stops with the same control, and replays on another press", () => {
    const { audio, result } = setup();
    expect(audio.play).toHaveBeenCalledTimes(1);
    expect(result.current.playing).toBe(true);
    act(() => result.current.toggle());
    expect(audio.pause).toHaveBeenCalledTimes(1);
    expect(result.current.playing).toBe(false);
    act(() => result.current.toggle());
    expect(audio.play).toHaveBeenCalledTimes(2);
  });

  it("allows manual playback after autoplay is blocked", async () => {
    const play = vi.fn().mockRejectedValueOnce(new Error("blocked")).mockResolvedValue(undefined);
    const { result } = setup(play);
    await waitFor(() => expect(result.current.playing).toBe(false));
    act(() => result.current.toggle());
    expect(result.current.playing).toBe(true);
  });

  it("stops when leaving the preview and when unmounted", () => {
    const { audio, rerender, unmount } = setup();
    rerender({ enabled: false });
    expect(audio.pause).toHaveBeenCalledTimes(1);
    expect(audio.currentTime).toBe(0);
    rerender({ enabled: true });
    unmount();
    expect(audio.pause).toHaveBeenCalledTimes(2);
  });
});
