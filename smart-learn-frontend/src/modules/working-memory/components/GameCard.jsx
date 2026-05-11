import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useProgress } from '../context/ProgressContext';

/**
 * Duolingo-style lesson node.
 * Renders a circular quest button + bubble card for each game.
 */
const GameCard = ({
  index = 0,
  gameId,
  titleSinhala,
  descriptionSinhala,
  icon,
  theme = 'green',
  maxLevels = 4,
  isLast = false,
  onPlay,
}) => {
  const { getUnlockedLevels, getCompletedLevels } = useProgress();
  const unlockedLevels = getUnlockedLevels(gameId);
  const completedLevels = getCompletedLevels(gameId);

  const themes = {
    green: {
      node: 'from-lime-400 to-green-500 border-green-700',
      bubble: 'bg-lime-50 border-lime-200',
      badge: 'bg-lime-100 text-lime-700',
      button: 'bg-green-500 border-green-700 hover:bg-green-600'
    },
    blue: {
      node: 'from-sky-400 to-blue-500 border-blue-700',
      bubble: 'bg-sky-50 border-sky-200',
      badge: 'bg-sky-100 text-sky-700',
      button: 'bg-blue-500 border-blue-700 hover:bg-blue-600'
    },
    yellow: {
      node: 'from-yellow-300 to-amber-500 border-amber-700',
      bubble: 'bg-yellow-50 border-yellow-200',
      badge: 'bg-yellow-100 text-yellow-700',
      button: 'bg-amber-500 border-amber-700 hover:bg-amber-600'
    },
    purple: {
      node: 'from-fuchsia-300 to-purple-500 border-purple-700',
      bubble: 'bg-purple-50 border-purple-200',
      badge: 'bg-purple-100 text-purple-700',
      button: 'bg-purple-500 border-purple-700 hover:bg-purple-600'
    },
    orange: {
      node: 'from-orange-300 to-orange-500 border-orange-700',
      bubble: 'bg-orange-50 border-orange-200',
      badge: 'bg-orange-100 text-orange-700',
      button: 'bg-orange-500 border-orange-700 hover:bg-orange-600'
    },
  };
  const palette = themes[theme] || themes.green;

  const nextPlayableLevel = Array.from({ length: maxLevels }, (_, idx) => idx + 1).find(
    (level) => unlockedLevels.includes(level) && !completedLevels.includes(level)
  ) || Math.max(...unlockedLevels);

  const completionRate = Math.round((completedLevels.length / maxLevels) * 100);
  const finishedAll = completedLevels.length >= maxLevels;
  const xOffsetClass = index % 2 === 0 ? '-ml-14 sm:-ml-20' : 'ml-14 sm:ml-20';

  const handlePlayClick = (level) => {
    if (unlockedLevels.includes(level)) {
      onPlay(gameId, level);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`relative mb-4 flex flex-col items-center ${xOffsetClass}`}
    >
      {!isLast && (
        <div className="absolute left-1/2 top-[84px] h-24 w-1 -translate-x-1/2 rounded-full bg-green-200" />
      )}

      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handlePlayClick(nextPlayableLevel)}
        className={`
          relative z-10 h-28 w-28 rounded-full border-b-[8px]
          bg-gradient-to-b ${palette.node}
          text-white shadow-2xl transition-transform
          focus:outline-none focus:ring-4 focus:ring-white
        `}
      >
        <span className="text-4xl">{icon}</span>
        <span className="absolute -right-2 -top-2 rounded-full bg-white px-2 py-1 text-xs font-black text-slate-700 shadow-md">
          Lv {nextPlayableLevel}
        </span>
      </motion.button>

      <div className={`mt-4 w-[270px] rounded-3xl border px-4 py-4 shadow-md ${palette.bubble}`}>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-800">{titleSinhala}</h3>
          <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${palette.badge}`}>
            {finishedAll ? 'සම්පූර්ණයි' : `ප්‍රගතිය ${completionRate}%`}
          </span>
        </div>
        <p className="mb-3 text-sm text-slate-600">
          {descriptionSinhala}
        </p>
        <div className="mb-3 flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>ප්‍රගතිය</span>
          <span>
            {completedLevels.length}/{maxLevels}
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-white/80">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${completionRate}%` }}
            transition={{ duration: 0.5 }}
            className={`h-full rounded-full bg-gradient-to-r ${palette.node}`}
          />
        </div>

        <button
          onClick={() => handlePlayClick(nextPlayableLevel)}
          className={`
            mt-4 w-full rounded-2xl border-b-4 px-4 py-2 text-sm font-extrabold text-white
            transition-transform active:translate-y-[1px] ${palette.button}
          `}
        >
          {finishedAll ? 'නැවත පුහුණු වෙමු' : 'ආරම්භ කරන්න'}
        </button>
      </div>
    </motion.div>
  );
};

GameCard.propTypes = {
  index: PropTypes.number,
  gameId: PropTypes.string.isRequired,
  titleSinhala: PropTypes.string.isRequired,
  descriptionSinhala: PropTypes.string.isRequired,
  icon: PropTypes.string,
  theme: PropTypes.oneOf(['green', 'blue', 'yellow', 'purple', 'orange']),
  maxLevels: PropTypes.number,
  isLast: PropTypes.bool,
  onPlay: PropTypes.func.isRequired,
};

export default GameCard;
