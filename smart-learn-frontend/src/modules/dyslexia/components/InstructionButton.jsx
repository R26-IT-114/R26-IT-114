import { motion, AnimatePresence } from 'framer-motion';
import { Volume2 } from 'lucide-react';

/**
 * InstructionButton
 *
 * A fixed floating button (bottom-right) that replays the screen's
 * Sinhala instruction audio when pressed.
 *
 * Props:
 *   onReplay  {() => void}   – call replay() from useInstructionAudio
 *   playing   {boolean}      – optional pulsing indicator while audio plays
 */
const InstructionButton = ({ onReplay, playing = false }) => (
  <motion.button
    aria-label="උපදෙස් නැවත අසන්න"
    title="උපදෙස් නැවත අසන්න"
    onClick={onReplay}
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 0.6 }}
    whileHover={{ scale: 1.12 }}
    whileTap={{ scale: 0.92 }}
    style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.25rem',
      zIndex: 9999,
      width: '3.25rem',
      height: '3.25rem',
      borderRadius: '50%',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
      boxShadow: '0 4px 16px rgba(124,58,237,0.45), 0 1px 4px rgba(0,0,0,0.2)',
      outline: 'none',
    }}
  >
    {/* Pulse ring while playing */}
    <AnimatePresence>
      {playing && (
        <motion.span
          key="pulse"
          initial={{ scale: 0.85, opacity: 0.7 }}
          animate={{ scale: 1.6, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px solid #A855F7',
            pointerEvents: 'none',
          }}
        />
      )}
    </AnimatePresence>
    <Volume2 size={22} color="#fff" strokeWidth={2.2} />
  </motion.button>
);

export default InstructionButton;
