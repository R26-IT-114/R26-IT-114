import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export const DYSLEXIA_REWARD_EVENT = 'dyslexia:correct-answer';

const REWARD_MESSAGES = [
  '✅ හරිම හරි! ඉතා හොඳයි! 🌟',
  '🌟 නියමයි! දිගටම කරගෙන යමු! 👏',
  '🎉 අගෙයි! ඔයා හොඳට කළා! 💚',
  '🏆 සුපිරියි! තවත් එකක් කරමු! ✨',
];

/** Displays the same positive-feedback style used by Garden Journey. */
export default function DyslexiaRewardPopup({ children }) {
  const [reward, setReward] = useState(null);
  const timerRef = useRef(null);
  const messageIndexRef = useRef(0);

  useEffect(() => {
    const showReward = (event) => {
      // Garden Journey already renders this feedback inside its own game UI.
      if (event.detail?.gameKey === 'garden-journey') return;

      clearTimeout(timerRef.current);
      const message = REWARD_MESSAGES[messageIndexRef.current % REWARD_MESSAGES.length];
      messageIndexRef.current += 1;
      setReward({ id: Date.now(), message });
      timerRef.current = setTimeout(() => setReward(null), 1350);
    };

    window.addEventListener(DYSLEXIA_REWARD_EVENT, showReward);
    return () => {
      window.removeEventListener(DYSLEXIA_REWARD_EVENT, showReward);
      clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <>
      {children}
      <AnimatePresence>
        {reward && (
          <motion.div
            key={reward.id}
            initial={{ opacity: 0, y: 24, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="fixed z-[200] left-1/2 -translate-x-1/2 bottom-7
                       w-[min(92vw,430px)] rounded-[24px] p-5 text-center border-4 shadow-2xl
                       bg-[#E8F8EF] border-[#52B788] pointer-events-none"
            role="status"
            aria-live="polite"
          >
            <p className="text-xl sm:text-2xl font-black text-[#1A4A2A]">
              {reward.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
