import { motion } from "framer-motion";

// ─── Tiny Monkey ─────────────────────────────────────────────────────────────
const MiniMonkey = () => (
  <motion.div
    aria-hidden="true"
    className="pointer-events-none select-none"
    animate={{ rotate: [-6, 6, -6], y: [0, -6, 0] }}
    transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
  >
    <svg width="72" height="90" viewBox="0 0 72 90" fill="none">
      {/* vine */}
      <line x1="36" y1="0" x2="36" y2="18" stroke="#5A8A30" strokeWidth="4" strokeLinecap="round" />
      {/* tail */}
      <motion.path d="M52 68 Q66 60 64 48 Q62 40 68 36"
        stroke="#C07830" strokeWidth="5" fill="none" strokeLinecap="round"
        animate={{ d: ["M52 68 Q66 60 64 48 Q62 40 68 36","M52 68 Q68 58 66 46 Q64 38 70 34","M52 68 Q66 60 64 48 Q62 40 68 36"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* body */}
      <ellipse cx="36" cy="62" rx="19" ry="17" fill="#D4944E" />
      <ellipse cx="36" cy="67" rx="12" ry="10" fill="#F0C080" />
      {/* head */}
      <circle cx="36" cy="36" r="18" fill="#D4944E" />
      {/* ears */}
      <circle cx="18" cy="36" r="8" fill="#C07830" /><circle cx="18" cy="36" r="5" fill="#F0A090" />
      <circle cx="54" cy="36" r="8" fill="#C07830" /><circle cx="54" cy="36" r="5" fill="#F0A090" />
      {/* face */}
      <ellipse cx="36" cy="43" rx="10" ry="7" fill="#F0C080" />
      {/* eyes */}
      <circle cx="29" cy="32" r="4" fill="white" /><circle cx="30" cy="32" r="2.2" fill="#1A0A00" /><circle cx="30.5" cy="31.5" r="1" fill="white" />
      <circle cx="43" cy="32" r="4" fill="white" /><circle cx="44" cy="32" r="2.2" fill="#1A0A00" /><circle cx="44.5" cy="31.5" r="1" fill="white" />
      {/* nose */}
      <ellipse cx="36" cy="40" rx="3" ry="2" fill="#C07830" />
      {/* smile */}
      <path d="M30 45 Q36 51 42 45" stroke="#A06030" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* arms */}
      <motion.path d="M17 60 Q8 50 10 40"
        stroke="#D4944E" strokeWidth="7" fill="none" strokeLinecap="round"
        animate={{ d: ["M17 60 Q8 50 10 40","M17 60 Q6 52 8 42","M17 60 Q8 50 10 40"] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.path d="M55 60 Q64 50 62 40"
        stroke="#D4944E" strokeWidth="7" fill="none" strokeLinecap="round"
        animate={{ d: ["M55 60 Q64 50 62 40","M55 60 Q66 52 64 42","M55 60 Q64 50 62 40"] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* legs */}
      <ellipse cx="28" cy="80" rx="6" ry="12" fill="#C07830" />
      <ellipse cx="44" cy="80" rx="6" ry="12" fill="#C07830" />
    </svg>
  </motion.div>
);

// ─── Tiny Frog ───────────────────────────────────────────────────────────────
const MiniFrog = () => (
  <motion.div
    aria-hidden="true"
    className="pointer-events-none select-none"
    animate={{ y: [0, -14, 0] }}
    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", repeatDelay: 2.5 }}
  >
    <svg width="64" height="56" viewBox="0 0 64 56" fill="none">
      {/* back legs */}
      <ellipse cx="10" cy="44" rx="11" ry="6" fill="#3AB840" transform="rotate(-15 10 44)" />
      <ellipse cx="54" cy="44" rx="11" ry="6" fill="#3AB840" transform="rotate(15 54 44)" />
      {/* body */}
      <ellipse cx="32" cy="36" rx="20" ry="15" fill="#4ECC5A" />
      <ellipse cx="32" cy="40" rx="13" ry="9" fill="#A8F0B0" />
      {/* head */}
      <ellipse cx="32" cy="22" rx="18" ry="14" fill="#4ECC5A" />
      {/* eyes */}
      <circle cx="20" cy="14" r="7" fill="#4ECC5A" /><circle cx="20" cy="14" r="5" fill="#FFE566" /><circle cx="20" cy="14" r="3" fill="#222" /><circle cx="20.8" cy="13.2" r="1.2" fill="white" />
      <circle cx="44" cy="14" r="7" fill="#4ECC5A" /><circle cx="44" cy="14" r="5" fill="#FFE566" /><circle cx="44" cy="14" r="3" fill="#222" /><circle cx="44.8" cy="13.2" r="1.2" fill="white" />
      {/* smile */}
      <path d="M24 28 Q32 36 40 28" stroke="#2A8A32" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* spots */}
      <circle cx="36" cy="38" r="3" fill="#3AB840" opacity="0.5" />
      <circle cx="26" cy="40" r="2" fill="#3AB840" opacity="0.5" />
    </svg>
  </motion.div>
);

// ─── Tiny Parrot ─────────────────────────────────────────────────────────────
const MiniParrot = () => (
  <motion.div
    aria-hidden="true"
    className="pointer-events-none select-none"
    animate={{ y: [0, -5, 0], rotate: [-4, 4, -4] }}
    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
  >
    <svg width="60" height="76" viewBox="0 0 60 76" fill="none">
      {/* branch */}
      <rect x="4" y="64" width="52" height="7" rx="3.5" fill="#7B4F2E" />
      {/* tail */}
      <path d="M18 58 Q8 68 6 76" stroke="#1A9E3A" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M16 60 Q10 72 12 78" stroke="#FFB830" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* body */}
      <ellipse cx="30" cy="46" rx="16" ry="18" fill="#2DC653" />
      <ellipse cx="30" cy="52" rx="10" ry="11" fill="#A8F060" />
      {/* head */}
      <circle cx="30" cy="26" r="16" fill="#2DC653" />
      {/* cheek */}
      <ellipse cx="24" cy="30" rx="5" ry="4" fill="#FF4444" opacity="0.7" />
      {/* beak */}
      <path d="M38 24 Q46 26 44 32 Q41 32 38 28Z" fill="#FF8800" />
      {/* eye */}
      <circle cx="36" cy="22" r="5" fill="white" />
      <circle cx="36" cy="22" r="3" fill="#1A1A1A" />
      <circle cx="37" cy="21" r="1.2" fill="white" />
      {/* wing accent */}
      <path d="M16 46 Q8 38 10 28" stroke="#1A9E3A" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.6" />
      {/* feet */}
      <line x1="24" y1="64" x2="20" y2="70" stroke="#7B4F2E" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="36" y1="64" x2="40" y2="70" stroke="#7B4F2E" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  </motion.div>
);

// ─── Tiny Lion ───────────────────────────────────────────────────────────────
const MiniLion = () => (
  <motion.div
    aria-hidden="true"
    className="pointer-events-none select-none"
    animate={{ y: [0, -5, 0] }}
    transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
  >
    <svg width="80" height="68" viewBox="0 0 80 68" fill="none">
      {/* mane */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
        <ellipse key={i} cx="30" cy="32" rx="24" ry="9"
          fill={i % 2 === 0 ? "#E8841A" : "#D4702A"}
          transform={`rotate(${angle} 30 32)`} opacity="0.85"
        />
      ))}
      {/* body */}
      <ellipse cx="52" cy="46" rx="24" ry="17" fill="#F0B84A" />
      <ellipse cx="52" cy="52" rx="16" ry="10" fill="#F8D880" />
      {/* tail */}
      <motion.path d="M74 46 Q84 40 82 30"
        stroke="#E8A030" strokeWidth="5" fill="none" strokeLinecap="round"
        animate={{ d: ["M74 46 Q84 40 82 30","M74 46 Q86 38 84 28","M74 46 Q84 40 82 30"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <ellipse cx="82" cy="28" rx="6" ry="5" fill="#C06020" />
      {/* head */}
      <circle cx="30" cy="30" r="24" fill="#F0B84A" />
      <ellipse cx="30" cy="38" rx="14" ry="10" fill="#F8D880" />
      {/* eyes */}
      <circle cx="22" cy="26" r="5.5" fill="#88CC44" /><circle cx="22.5" cy="26" r="3" fill="#1A1A1A" /><circle cx="23" cy="25.5" r="1.2" fill="white" />
      <circle cx="38" cy="26" r="5.5" fill="#88CC44" /><circle cx="38.5" cy="26" r="3" fill="#1A1A1A" /><circle cx="39" cy="25.5" r="1.2" fill="white" />
      {/* nose */}
      <ellipse cx="30" cy="34" rx="4.5" ry="3" fill="#D46040" />
      {/* whiskers */}
      <line x1="10" y1="34" x2="26" y2="36" stroke="white" strokeWidth="1.2" opacity="0.8" />
      <line x1="8"  y1="38" x2="26" y2="38" stroke="white" strokeWidth="1.2" opacity="0.8" />
      <line x1="34" y1="36" x2="50" y2="34" stroke="white" strokeWidth="1.2" opacity="0.8" />
      <line x1="34" y1="38" x2="52" y2="38" stroke="white" strokeWidth="1.2" opacity="0.8" />
      {/* smile */}
      <path d="M25 40 Q30 46 35 40" stroke="#C04030" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* ears */}
      <circle cx="10" cy="12" r="10" fill="#E8841A" /><circle cx="10" cy="12" r="6" fill="#F0B84A" />
      <circle cx="50" cy="12" r="10" fill="#E8841A" /><circle cx="50" cy="12" r="6" fill="#F0B84A" />
      {/* legs */}
      <rect x="34" y="60" width="10" height="9" rx="5" fill="#E8A030" />
      <rect x="46" y="60" width="10" height="9" rx="5" fill="#E8A030" />
      <rect x="58" y="60" width="10" height="9" rx="5" fill="#E8A030" />
    </svg>
  </motion.div>
);

// ─── Drifting Leaf ────────────────────────────────────────────────────────────
const DriftLeaf = ({ x, delay, dur, size, color, rot }) => (
  <motion.div
    aria-hidden="true"
    className="absolute pointer-events-none select-none"
    style={{ left: `${x}%`, top: -size }}
    animate={{ y: ["0vh", "108vh"], x: [0, 30, -20, 10, 0], rotate: [rot, rot + 260, rot + 360], opacity: [0, 0.85, 0.85, 0] }}
    transition={{ duration: dur, delay, repeat: Infinity, ease: "linear" }}
  >
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 20 C4 14 2 8 6 5 C8 3 10 4 12 6 C14 4 16 3 18 5 C22 8 20 14 12 20Z" fill={color} />
      <line x1="12" y1="6" x2="12" y2="19" stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" />
    </svg>
  </motion.div>
);

// ─── Mini Butterfly ───────────────────────────────────────────────────────────
const MiniButterfly = ({ x, y, delay, c1, c2 }) => (
  <motion.div
    aria-hidden="true"
    className="absolute pointer-events-none select-none"
    style={{ left: `${x}%`, top: `${y}%` }}
    animate={{ x: [0, 40, 80, 50, 0], y: [0, -20, 5, -15, 0] }}
    transition={{ duration: 10, delay, repeat: Infinity, ease: "easeInOut" }}
  >
    <motion.svg width="30" height="22" viewBox="0 0 60 42" fill="none"
      animate={{ scaleX: [1, 0.15, 1, 0.15, 1] }}
      transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <ellipse cx="18" cy="16" rx="16" ry="12" fill={c1} opacity="0.9" />
      <ellipse cx="14" cy="30" rx="11" ry="8" fill={c1} opacity="0.75" />
      <ellipse cx="42" cy="16" rx="16" ry="12" fill={c2} opacity="0.9" />
      <ellipse cx="46" cy="30" rx="11" ry="8" fill={c2} opacity="0.75" />
      <ellipse cx="30" cy="21" rx="3" ry="11" fill="#3A2A1A" />
    </motion.svg>
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const FloatingJungleAnimals = () => {
  const leaves = [
    { x: 6,  delay: 0,   dur: 10, size: 20, color: "#52D060", rot: 0   },
    { x: 22, delay: 3,   dur: 13, size: 16, color: "#A8E840", rot: 45  },
    { x: 45, delay: 1.5, dur: 11, size: 22, color: "#FFD580", rot: 20  },
    { x: 67, delay: 5,   dur: 12, size: 18, color: "#FF8FAB", rot: 90  },
    { x: 84, delay: 2,   dur: 9,  size: 20, color: "#5BB8F5", rot: 135 },
    { x: 93, delay: 7,   dur: 14, size: 16, color: "#52D060", rot: 60  },
  ];

  return (
    <div aria-hidden="true" className="floating-jungle-animals absolute inset-0 overflow-hidden pointer-events-none select-none" style={{ zIndex: 1 }}>

      {/* Drifting leaves */}
      {leaves.map((l, i) => <DriftLeaf key={i} {...l} />)}

      {/* Butterflies */}
      <MiniButterfly x={10} y={25} delay={0}  c1="#FF6BD6" c2="#FFB8EA" />
      <MiniButterfly x={72} y={15} delay={5}  c1="#FFE566" c2="#FFB830" />

      {/* Monkey — top right */}
      <motion.div
        className="absolute"
        style={{ top: "3%", right: "2%", zIndex: 2 }}
        animate={{ x: [0, 5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <MiniMonkey />
      </motion.div>

      {/* Frog — bottom left */}
      <motion.div
        className="absolute"
        style={{ bottom: "6%", left: "2%", zIndex: 2 }}
        animate={{ x: [0, -4, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <MiniFrog />
      </motion.div>

      {/* Parrot — mid left */}
      <motion.div
        className="absolute"
        style={{ top: "35%", left: "1%", zIndex: 2 }}
        animate={{ x: [0, 4, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <MiniParrot />
      </motion.div>

      {/* Lion — bottom right */}
      <motion.div
        className="absolute"
        style={{ bottom: "5%", right: "1%", zIndex: 2 }}
        animate={{ x: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <MiniLion />
      </motion.div>

    </div>
  );
};

export default FloatingJungleAnimals;
