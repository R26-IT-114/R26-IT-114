import { motion } from 'framer-motion';

/**
 * AnimalCard — nature-themed card used in GardenJourney.
 * Props:
 *   animal        — { id, name, image, sinhalaDesc }
 *   onClick       — (animal) => void
 *   isSelected    — bool
 *   isCorrect     — bool (only meaningful when isSelected)
 *   showAsCorrect — bool (highlight the correct card when player was wrong)
 *   disabled      — bool
 */
const AnimalCard = ({ animal, onClick, isSelected, isCorrect, showAsCorrect, disabled }) => {
  const isWrong = isSelected && !isCorrect;
  const isRight = (isSelected && isCorrect) || (showAsCorrect && !isSelected);

  const borderClass = isRight
    ? 'border-[#52B788] ring-4 ring-[#A8D5BA]'
    : isWrong
    ? 'border-[#FF6B6B] ring-4 ring-[#FFB3B3]'
    : 'border-white/60';

  const bgClass = isRight
    ? 'bg-[#E8F8EF]'
    : isWrong
    ? 'bg-[#FFF0EF]'
    : 'bg-white/85';

  return (
    <motion.button
      onClick={(event) => !disabled && onClick(animal, event.currentTarget.getBoundingClientRect())}
      className={`relative rounded-3xl overflow-hidden border-4 shadow-lg w-full text-left select-none
                  focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFD166]
                  ${borderClass} ${bgClass}`}
      style={{ cursor: disabled && !isSelected ? 'not-allowed' : 'pointer' }}
      whileHover={!disabled ? { scale: 1.05, y: -4 } : {}}
      whileTap={!disabled ? { scale: 0.93 } : {}}
      animate={
        isWrong
          ? { x: [-7, 7, -5, 5, -3, 3, 0] }
          : isRight && isSelected
          ? { scale: [1, 1.08, 1] }
          : {}
      }
      transition={
        isWrong
          ? { duration: 0.4 }
          : isRight && isSelected
          ? { duration: 0.45, ease: 'easeOut' }
          : { type: 'spring', stiffness: 280, damping: 18 }
      }
      aria-label={animal.name}
      aria-pressed={isSelected}
      disabled={disabled && !isSelected}
    >
      {/* Image */}
      <div className="aspect-square w-full overflow-hidden bg-[#F0FAF4]">
        <img
          src={animal.image}
          alt={animal.name}
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>

      {/* Name label */}
      <div className="py-2 px-1 text-center">
        <span
          className="text-[#1A4A2A] font-bold leading-snug"
          style={{ fontSize: 'clamp(13px, 3vw, 16px)' }}
        >
          {animal.name}
        </span>
      </div>

      {/* Correct overlay */}
      {isRight && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-[#A8D5BA]/45 rounded-3xl"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-5xl drop-shadow-md">✅</span>
        </motion.div>
      )}

      {/* Wrong overlay */}
      {isWrong && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-[#FF6B6B]/35 rounded-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="text-5xl drop-shadow-md">❌</span>
        </motion.div>
      )}
    </motion.button>
  );
};

export default AnimalCard;
