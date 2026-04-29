import { motion } from "framer-motion";

const AnimatedLetter = ({ letter, onClick }) => {
  return (
    <motion.div
      className="letter-card"
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
    >
      <motion.h1
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {letter}
      </motion.h1>
    </motion.div>
  );
};

export default AnimatedLetter;