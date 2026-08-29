import { AnimatePresence, motion } from 'framer-motion';

const COLORS = ['#ff4d6d', '#ffbe0b', '#3ad66f', '#00b4d8', '#7b61ff', '#ff70c7'];
const PARTICLES = Array.from({ length: 42 }, (_, index) => ({
  id: index,
  color: COLORS[index % COLORS.length],
  angle: (index / 42) * Math.PI * 2,
  distance: 135 + ((index * 37) % 210),
  width: 7 + ((index * 5) % 8),
  height: index % 4 === 0 ? 10 : 16 + ((index * 3) % 8),
  delay: (index % 7) * 0.018,
  round: index % 5 === 0,
}));

/** A bright center burst followed by a soft rainbow confetti shower. */
export default function DyslexiaConfettiBurst({ active }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 z-[80] pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-hidden="true"
        >
          <motion.div
            className="absolute left-1/2 top-[42%] h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,246,153,.9), rgba(255,255,255,.35) 42%, transparent 72%)' }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.8, 3.8], opacity: [0, 0.9, 0] }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />

          {PARTICLES.map((particle) => {
            const x = Math.cos(particle.angle) * particle.distance;
            const y = Math.sin(particle.angle) * particle.distance;
            return (
              <motion.i
                key={particle.id}
                className="absolute left-1/2 top-[42%] block"
                style={{
                  width: particle.width,
                  height: particle.round ? particle.width : particle.height,
                  borderRadius: particle.round ? '50%' : 3,
                  background: particle.color,
                  boxShadow: `0 0 7px ${particle.color}88`,
                }}
                initial={{ x: 0, y: 0, scale: 0.2, opacity: 0, rotate: 0 }}
                animate={{
                  x: [0, x * 0.72, x],
                  y: [0, y - 55, y + 115],
                  scale: [0.2, 1.25, 0.9],
                  opacity: [0, 1, 1, 0],
                  rotate: 540 + (particle.id * 31),
                }}
                transition={{
                  duration: 1.58,
                  delay: particle.delay,
                  times: [0, 0.18, 0.72, 1],
                  ease: [0.18, 0.8, 0.28, 1],
                }}
              />
            );
          })}

          {[0, 1, 2].map((ring) => (
            <motion.div
              key={ring}
              className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full border-4"
              style={{ borderColor: COLORS[(ring + 1) * 2] }}
              initial={{ width: 24, height: 24, opacity: 0 }}
              animate={{ width: 190 + (ring * 100), height: 190 + (ring * 100), opacity: [0, 0.7, 0] }}
              transition={{ duration: 0.82, delay: ring * 0.08, ease: 'easeOut' }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
