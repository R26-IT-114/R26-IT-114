import { motion } from "framer-motion";

const LetterTracing = () => {
  return (
    <motion.svg width="200" height="200">
      <motion.path
        d="M20 20 L150 150" // replace later with Sinhala SVG
        stroke="black"
        strokeWidth="4"
        fill="transparent"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2 }}
      />
    </motion.svg>
  );
};

export default LetterTracing;