import { motion } from "framer-motion";

const CIRCLE_COLORS = [
  "#1A5C9A",
  "#1A7A9A",
  "#1A4A8A",
];

const GameCard = ({ game, index, onPlay }) => {
  const color = CIRCLE_COLORS[(game.num - 1) % CIRCLE_COLORS.length];
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.35, ease: "easeOut" }}
      whileHover={{ scale: 1.08, y: -4 }}
      whileTap={{ scale: 0.94 }}
      onClick={() => onPlay(game.route)}
      aria-label={`Game ${game.num}`}
      className="flex flex-col items-center justify-center focus:outline-none
                 focus-visible:ring-4 focus-visible:ring-white/60"
    >
      <div
        className="w-28 h-28 rounded-full flex items-center justify-center
                   text-white font-black text-5xl leading-none
                   shadow-[0_6px_18px_rgba(0,0,0,0.25)]
                   border-4 border-white/30"
        style={{ background: color, fontFamily: "Poppins, Arial, sans-serif" }}
      >
        {game.num}
      </div>
    </motion.button>
  );
};

export default GameCard;