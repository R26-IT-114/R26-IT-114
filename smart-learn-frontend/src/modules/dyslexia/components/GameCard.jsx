import { motion } from "framer-motion";
import { Lock } from "lucide-react";

const CIRCLE_COLORS = [
  "#1A5C9A",
  "#1A7A9A",
  "#1A4A8A",
];

const GameCard = ({ game, index, onPlay, locked = false }) => {
  const color = locked ? "#6b7280" : CIRCLE_COLORS[(game.num - 1) % CIRCLE_COLORS.length];
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.35, ease: "easeOut" }}
      whileHover={locked ? {} : { scale: 1.08, y: -4 }}
      whileTap={locked ? {} : { scale: 0.94 }}
      onClick={() => !locked && onPlay(game.route)}
      disabled={locked}
      aria-label={locked ? `ක්‍රීඩාව ${game.num} අගුලු දමා ඇත` : `ක්‍රීඩාව ${game.num} ආරම්භ කරන්න`}
      className="dyslexia-game-card flex flex-col items-center justify-center focus:outline-none
                 focus-visible:ring-4 focus-visible:ring-white/60
                 disabled:cursor-not-allowed"
    >
      <div className="relative">
        <div
          className="dyslexia-game-card__circle w-28 h-28 rounded-full flex items-center justify-center
                     text-white font-black text-5xl leading-none
                     shadow-[0_6px_18px_rgba(0,0,0,0.25)]
                     border-4 border-white/30"
          style={{
            background: color,
            fontFamily: "Poppins, Arial, sans-serif",
            opacity: locked ? 0.6 : 1,
          }}
        >
          {locked ? <Lock size={36} className="opacity-90" /> : game.num}
        </div>
        {locked && (
          <div className="absolute inset-0 rounded-full bg-black/10 flex items-end justify-center pb-1">
            <span className="text-[10px] text-white/80 font-bold"> අගුලු දමා ඇත</span>
          </div>
        )}
      </div>
    </motion.button>
  );
};

export default GameCard;
