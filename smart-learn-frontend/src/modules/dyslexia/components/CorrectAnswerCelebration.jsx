import { AnimatePresence, motion } from 'framer-motion';

const PARTICLES = Array.from({ length: 18 }, (_, index) => index);
const COLORS = ['#FF6B6B', '#FFD166', '#52B788', '#4AA8D8', '#A855F7', '#F97316'];

/** Twin confetti cannons matching the Two-Letter Word Match celebration. */
export default function CorrectAnswerCelebration({ active }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 z-[80] pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          aria-hidden="true"
        >
          {['left', 'right'].map((side) => {
            const direction = side === 'left' ? 1 : -1;
            return (
              <div key={side} className={`absolute bottom-3 ${side === 'left' ? 'left-3 sm:left-10' : 'right-3 sm:right-10'}`}>
                {PARTICLES.map((index) => {
                  const spread = 22 + (index % 6) * 18;
                  const rise = 135 + (index % 5) * 45;
                  const isRound = index % 4 === 0;
                  return (
                    <motion.i
                      key={`${side}-${index}`}
                      className="absolute z-20 left-1/2 top-2 block"
                      style={{
                        width: isRound ? 9 : 7 + (index % 3) * 3,
                        height: isRound ? 9 : 15 + (index % 2) * 5,
                        borderRadius: isRound ? '50%' : 2,
                        background: COLORS[index % COLORS.length],
                        boxShadow: '0 2px 3px rgba(0,0,0,0.18)',
                      }}
                      initial={{ x: 0, y: 10, opacity: 1, scale: 0.2, rotateX: 0, rotateZ: 0 }}
                      animate={{
                        x: direction * spread + direction * (index % 2 ? 34 : -18),
                        y: [10, -rise, -(rise - 55)],
                        opacity: [0, 1, 1, 0],
                        scale: [0.2, 1.15, 1, 0.75],
                        rotateX: 360 + index * 50,
                        rotateZ: direction * (160 + index * 47),
                      }}
                      transition={{ duration: 1.45 + (index % 3) * 0.12, delay: index * 0.018, ease: 'easeOut' }}
                    />
                  );
                })}

                {[0, 1, 2].map((index) => (
                  <motion.div key={`smoke-${index}`}
                    className="absolute z-10 left-1/2 top-0 rounded-full bg-white/80 blur-[1px]"
                    style={{ width: 30 + index * 10, height: 30 + index * 10 }}
                    initial={{ x: -15, y: 4, opacity: 0, scale: 0.2 }}
                    animate={{ x: direction * index * 24, y: -55 - index * 22, opacity: [0, 0.85, 0], scale: [0.2, 1.2, 1.7] }}
                    transition={{ duration: 0.75, delay: index * 0.06, ease: 'easeOut' }}
                  />
                ))}

                <motion.div
                  initial={{ scale: 0.5, y: 35 }}
                  animate={{ scale: [0.5, 1.08, 1], y: 0, rotate: [direction * -8, direction * 25, direction * 18] }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 240, damping: 15 }}
                  style={{ position: 'relative', width: 76, height: 112,
                           transformOrigin: '50% 100%', filter: 'drop-shadow(0 8px 7px rgba(0,0,0,0.28))' }}
                >
                  <div style={{ position: 'absolute', inset: '8px 10px 0',
                                clipPath: 'polygon(8% 0, 92% 0, 68% 100%, 32% 100%)',
                                background: 'repeating-linear-gradient(135deg, #ef4444 0 15px, #fbbf24 15px 30px, #3b82f6 30px 45px)',
                                border: '3px solid rgba(120,55,20,0.55)' }} />
                  <div style={{ position: 'absolute', left: 8, right: 8, top: 0, height: 22,
                                borderRadius: '50%', background: 'radial-gradient(ellipse, #2b1a12 0 45%, #f59e0b 50% 68%, #fde68a 72%)',
                                boxShadow: 'inset 0 3px 5px rgba(0,0,0,0.6), 0 2px 3px rgba(0,0,0,0.3)' }} />
                  <div style={{ position: 'absolute', left: 28, right: 28, bottom: -3, height: 13,
                                borderRadius: 5, background: 'linear-gradient(#f8fafc, #94a3b8)', border: '2px solid #64748b' }} />
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
