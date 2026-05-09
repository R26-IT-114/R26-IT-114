import { motion } from 'framer-motion';

const VARIANTS = {
  primary:  'bg-[#A8D5BA] text-[#1A3A2A] border-2 border-[#7CB89A] hover:bg-[#90CCА6]',
  accent:   'bg-[#FFD166] text-[#4A3000] border-2 border-[#E6B800] hover:bg-[#FFC533]',
  sky:      'bg-[#BDE0FE] text-[#1A3060] border-2 border-[#8EC8FF] hover:bg-[#A0D4FE]',
  ghost:    'bg-white/70 text-[#2D4A3E]  border-2 border-[#A8D5BA] hover:bg-white/90',
};

/**
 * NatureButton — calm, dyslexia-friendly button component
 *
 * Props:
 *   variant   – 'primary' | 'accent' | 'sky' | 'ghost'  (default: 'primary')
 *   onClick   – click handler
 *   disabled  – disables the button
 *   className – extra Tailwind classes
 *   children  – button label / content
 */
const NatureButton = ({
  children,
  variant = 'primary',
  onClick,
  className = '',
  disabled = false,
  type = 'button',
}) => (
  <motion.button
    type={type}
    onClick={onClick}
    disabled={disabled}
    whileHover={disabled ? {} : { scale: 1.04 }}
    whileTap={disabled  ? {} : { scale: 0.96 }}
    className={[
      'inline-flex items-center justify-center gap-2',
      'rounded-[22px] font-bold text-lg leading-relaxed',
      'px-6 py-3 cursor-pointer outline-none',
      'shadow-[0_4px_14px_rgba(0,0,0,0.10)]',
      'transition-shadow duration-200',
      'hover:shadow-[0_6px_22px_rgba(0,0,0,0.16)]',
      'focus-visible:ring-4 focus-visible:ring-[#A8D5BA]/60',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      VARIANTS[variant] ?? VARIANTS.primary,
      className,
    ].join(' ')}
  >
    {children}
  </motion.button>
);

export default NatureButton;
