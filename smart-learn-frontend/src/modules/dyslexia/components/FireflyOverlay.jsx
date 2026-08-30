import { motion } from 'framer-motion';

const FIREFLIES = [
  ['4%', '22%', 0, 3.8], ['7%', '48%', 2.8, 4.2], ['10%', '73%', 4.1, 5.1],
  ['15%', '35%', 2.2, 3.5], ['18%', '86%', 3.4, 3.7], ['24%', '62%', 1.2, 4.4],
  ['29%', '17%', 2.1, 3.6], ['34%', '82%', 1.8, 4.7], ['39%', '31%', 3.6, 4.1],
  ['45%', '91%', 0.5, 4.8], ['56%', '12%', 2.5, 4.9], ['62%', '89%', 4.4, 3.6],
  ['68%', '25%', 0.8, 4.1], ['73%', '76%', 3.1, 4.5], ['78%', '43%', 0.3, 5],
  ['83%', '65%', 2.6, 3.9], ['87%', '18%', 1.4, 4.3], ['91%', '54%', 3.3, 4.6],
  ['95%', '34%', 1.7, 4.6], ['96%', '82%', 3.8, 3.8],
];

export default function FireflyOverlay() {
  return (
    <div aria-hidden="true" className="dyslexia-firefly-overlay">
      {FIREFLIES.map(([left, top, delay, duration], index) => (
        <motion.span
          key={`${left}-${top}`}
          className="dyslexia-firefly"
          style={{ left, top, width: index % 3 === 0 ? 11 : 9, height: index % 3 === 0 ? 11 : 9 }}
          animate={{
            x: [0, 16, -9, 0],
            y: [0, -18, 8, 0],
            opacity: [0.2, 1, 0.45, 0.2],
            scale: [0.65, 1.2, 0.8, 0.65],
          }}
          transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}
