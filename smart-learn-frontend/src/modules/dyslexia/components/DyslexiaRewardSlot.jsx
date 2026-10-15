import { createContext, useContext } from 'react';

export const DyslexiaRewardSlotContext = createContext(null);

// Each game reserves a place below its heading for the small-screen counter.
export default function DyslexiaRewardSlot() {
  const registerSlot = useContext(DyslexiaRewardSlotContext);
  return <div ref={registerSlot} className="dyslexia-reward-slot" />;
}
