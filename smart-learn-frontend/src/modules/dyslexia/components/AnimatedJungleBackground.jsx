import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import cuteElephantImg from "../../../assets/images/background/cute-elephant.png";
import cuteFrogImg from "../../../assets/images/background/cute-frog.png";
import cuteLionImg from "../../../assets/images/background/cute-lion.png";
import cuteGiraffeImg from "../../../assets/images/background/cute-giraffe.png";
import cuteJungleFoliageImg from "../../../assets/images/background/cute-jungle-foliage.png";
import cuteJungleLandscapeImg from "../../../assets/images/background/cute-jungle-landscape.png";
import cuteSunImg from "../../../assets/images/background/cute-sun.png";
import cuteCloudsImg from "../../../assets/images/background/cute-clouds.png";
import cuteFlyingParrotImg from "../../../assets/images/background/cute-flying-parrot.png";
import cuteFlyingBirdsImg from "../../../assets/images/background/cute-flying-birds.png";
import generatedHangingMonkeyVineImg from "../../../assets/images/background/generated-hanging-monkey-vine.png";
import FireflyOverlay from "./FireflyOverlay";

// ─── Parallax mouse hook ──────────────────────────────────────────────────────
function useMouseParallax() {
  const [p, setP] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const h = (e) => {
      const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
      setP({ x: (e.clientX - cx) / cx, y: (e.clientY - cy) / cy });
    };
    window.addEventListener("mousemove", h, { passive: true });
    return () => window.removeEventListener("mousemove", h);
  }, []);
  return p;
}

// ─── Floating Leaf (many shapes) ─────────────────────────────────────────────
const LEAF_SHAPES = [
  (c) => <ellipse cx="12" cy="12" rx="10" ry="12" fill={c} />,
  (c) => <path d="M12 2 L16 8 L22 6 L18 11 L22 14 L16 13 L14 20 L12 22 L10 20 L8 13 L2 14 L6 11 L2 6 L8 8Z" fill={c} />,
  (c) => <ellipse cx="12" cy="12" rx="7" ry="11" fill={c} transform="rotate(-20 12 12)" />,
  (c) => <path d="M12 20 C4 14 2 8 6 5 C8 3 10 4 12 6 C14 4 16 3 18 5 C22 8 20 14 12 20Z" fill={c} />,
];

const Leaf = ({ x, delay, duration, size, color, shapeIdx, rotate }) => {
  const shape = LEAF_SHAPES[shapeIdx % LEAF_SHAPES.length];
  return (
    <motion.div
      aria-hidden="true"
      className="absolute pointer-events-none select-none"
      style={{ left: `${x}%`, top: -size - 10, zIndex: 2 }}
      animate={{ y: ["0vh", "108vh"], x: [0, 40, -25, 20, -10, 0], rotate: [rotate, rotate + 270, rotate + 360], opacity: [0, 1, 1, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" opacity={0.92}>
        {shape(color)}
        <line x1="12" y1="4" x2="12" y2="20" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
      </svg>
    </motion.div>
  );
};

// ─── Butterfly ────────────────────────────────────────────────────────────────
const Butterfly = ({ x, y, color1, color2, delay, size = 44 }) => (
  <motion.div
    aria-hidden="true"
    className="absolute pointer-events-none select-none"
    style={{ left: `${x}%`, top: `${y}%`, zIndex: 6 }}
    animate={{ x: [0, 60, 120, 80, 0], y: [0, -30, 10, -20, 0] }}
    transition={{ duration: 12, delay, repeat: Infinity, ease: "easeInOut" }}
  >
    <motion.svg width={size} height={size * 0.7} viewBox="0 0 60 42" fill="none"
      animate={{ scaleX: [1, 0.15, 1, 0.15, 1] }}
      transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <ellipse cx="18" cy="16" rx="16" ry="12" fill={color1} opacity="0.9" />
      <ellipse cx="14" cy="30" rx="11" ry="8"  fill={color1} opacity="0.75" />
      <ellipse cx="42" cy="16" rx="16" ry="12" fill={color2} opacity="0.9" />
      <ellipse cx="46" cy="30" rx="11" ry="8"  fill={color2} opacity="0.75" />
      <ellipse cx="30" cy="21" rx="3" ry="11" fill="#3A2A1A" />
      <path d="M28 10 Q22 2 20 0" stroke="#3A2A1A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="20" cy="0" r="2" fill="#FF6B9D" />
      <path d="M32 10 Q38 2 40 0" stroke="#3A2A1A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="40" cy="0" r="2" fill="#FF6B9D" />
    </motion.svg>
  </motion.div>
);

// ─── Sparkle ─────────────────────────────────────────────────────────────────
const Sparkle = ({ x, y, delay, color = "#FFE566" }) => (
  <motion.div
    aria-hidden="true"
    className="absolute pointer-events-none select-none"
    style={{ left: `${x}%`, top: `${y}%`, zIndex: 7 }}
    animate={{ scale: [0, 1.4, 0], opacity: [0, 1, 0], y: [0, -22, 0], x: [0, 8, -6, 0] }}
    transition={{ duration: 2.8, delay, repeat: Infinity, ease: "easeInOut" }}
  >
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3" fill={color} />
      <path d="M8 1V4 M8 12V15 M1 8H4 M12 8H15 M3 3L5 5 M11 11L13 13 M13 3L11 5 M5 11L3 13"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  </motion.div>
);

// ─── Floating Bubble ─────────────────────────────────────────────────────────
const Bubble = ({ x, delay }) => (
  <motion.div
    aria-hidden="true"
    className="absolute pointer-events-none select-none"
    style={{ left: `${x}%`, bottom: "5%", zIndex: 3 }}
    animate={{ y: [0, -200, -400], opacity: [0, 0.7, 0], x: [0, 15, -10, 0] }}
    transition={{ duration: 7, delay, repeat: Infinity, ease: "linear" }}
  >
    <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.12)" }} />
  </motion.div>
);

// ─── Cloud ────────────────────────────────────────────────────────────────────
const Cloud = ({ top, startX, duration, width, opacity }) => (
  <motion.div
    aria-hidden="true"
    className="absolute pointer-events-none select-none"
    style={{ top, left: startX, zIndex: 2 }}
    animate={{ x: [0, 55, 0], y: [0, -5, 0] }}
    transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
  >
    <img
      src={cuteCloudsImg}
      alt=""
      draggable={false}
      style={{ width, height: "auto", opacity, filter: "drop-shadow(0 8px 14px rgba(31, 132, 181, 0.16))" }}
    />
  </motion.div>
);

const FlyingBirdImage = ({ src, top, delay, duration, width, reverse = false }) => (
  <motion.img
    aria-hidden="true"
    src={src}
    alt=""
    draggable={false}
    className="absolute h-auto pointer-events-none select-none"
    style={{ top, width, zIndex: 3 }}
    initial={{ x: reverse ? "108vw" : "-18vw" }}
    animate={{
      x: reverse ? ["108vw", "-24vw"] : ["-18vw", "108vw"],
      y: [0, -12, 4, -8, 0],
      rotate: reverse ? [1, -2, 1] : [-1, 2, -1],
    }}
    transition={{
      x: { duration, delay, repeat: Infinity, ease: "linear" },
      y: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
      rotate: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
    }}
  />
);

// ─── Parrot (flies left→right) ──────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
const Parrot = ({ top, delay, scale = 1 }) => (
  <motion.div aria-hidden="true" className="absolute pointer-events-none select-none"
    style={{ top, zIndex: 5 }}
    animate={{ x: ["-8vw", "112vw"] }}
    transition={{ duration: 15, delay, repeat: Infinity, ease: "linear" }}
  >
    <motion.svg width={58 * scale} height={44 * scale} viewBox="0 0 58 44" fill="none"
      animate={{ y: [0, -8, 0] }} transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* body */}
      <ellipse cx="29" cy="28" rx="13" ry="9" fill="#2DC653" />
      <ellipse cx="29" cy="32" rx="8" ry="5" fill="#A8F060" />
      {/* tail */}
      <path d="M16 28 Q4 36 2 44 Q8 38 16 34Z" fill="#1A9E3A" />
      <path d="M16 30 Q6 40 6 48 Q12 41 18 36Z" fill="#FFB830" opacity="0.9" />
      {/* head */}
      <circle cx="43" cy="22" r="11" fill="#2DC653" />
      <ellipse cx="43" cy="28" rx="6" ry="4" fill="#A8F060" />
      {/* wing up/down */}
      <motion.path d="M17 26 Q12 12 8 16 Q12 22 17 26Z" fill="#FFB830"
        animate={{ d: ["M17 26 Q12 12 8 16 Q12 22 17 26Z", "M17 26 Q10 20 6 22 Q11 24 17 26Z", "M17 26 Q12 12 8 16 Q12 22 17 26Z"] }}
        transition={{ duration: 0.45, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.path d="M41 26 Q48 12 52 16 Q48 22 41 26Z" fill="#FFB830"
        animate={{ d: ["M41 26 Q48 12 52 16 Q48 22 41 26Z", "M41 26 Q50 20 54 22 Q49 24 41 26Z", "M41 26 Q48 12 52 16 Q48 22 41 26Z"] }}
        transition={{ duration: 0.45, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* beak */}
      <path d="M54 20 Q60 22 58 26 Q55 27 52 24Z" fill="#FF8800" />
      {/* eye */}
      <circle cx="50" cy="20" r="3.5" fill="white" />
      <circle cx="50.5" cy="20" r="2" fill="#1A1A1A" />
      <circle cx="51" cy="19.5" r="0.8" fill="white" />
      {/* red cheek */}
      <ellipse cx="47" cy="24" rx="3" ry="2" fill="#FF4444" opacity="0.7" />
    </motion.svg>
  </motion.div>
);

// ─── Flamingo (flies left→right) ─────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
const Flamingo = ({ top, delay, scale = 1 }) => (
  <motion.div aria-hidden="true" className="absolute pointer-events-none select-none"
    style={{ top, zIndex: 5 }}
    animate={{ x: ["-8vw", "112vw"] }}
    transition={{ duration: 19, delay, repeat: Infinity, ease: "linear" }}
  >
    <motion.svg width={62 * scale} height={40 * scale} viewBox="0 0 62 40" fill="none"
      animate={{ y: [0, -9, 0] }} transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* body */}
      <ellipse cx="31" cy="26" rx="16" ry="10" fill="#FF8EC7" />
      {/* neck */}
      <path d="M44 22 Q52 14 50 8 Q48 4 46 6 Q48 10 46 16 Q44 20 44 22Z" fill="#FF6BAE" />
      {/* head */}
      <circle cx="46" cy="5" r="7" fill="#FF8EC7" />
      {/* beak */}
      <path d="M53 4 Q60 6 58 10 Q55 10 52 8Z" fill="#FF8800" />
      <path d="M53 4 Q60 6 58 10" stroke="#222" strokeWidth="0.8" fill="none" />
      {/* eye */}
      <circle cx="50" cy="4" r="2.8" fill="white" />
      <circle cx="50" cy="4" r="1.5" fill="#222" />
      <circle cx="50.5" cy="3.5" r="0.6" fill="white" />
      {/* wings */}
      <motion.path d="M16 24 Q8 10 4 14 Q8 20 16 24Z" fill="#FF6BAE"
        animate={{ d: ["M16 24 Q8 10 4 14 Q8 20 16 24Z", "M16 24 Q6 18 2 20 Q8 23 16 24Z", "M16 24 Q8 10 4 14 Q8 20 16 24Z"] }}
        transition={{ duration: 0.55, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.path d="M46 24 Q54 10 58 14 Q54 20 46 24Z" fill="#FF6BAE"
        animate={{ d: ["M46 24 Q54 10 58 14 Q54 20 46 24Z", "M46 24 Q56 18 60 20 Q54 23 46 24Z", "M46 24 Q54 10 58 14 Q54 20 46 24Z"] }}
        transition={{ duration: 0.55, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* tail feathers */}
      <path d="M15 28 Q6 34 4 40 Q10 35 16 31Z" fill="#FF4499" />
      <path d="M15 30 Q8 38 8 44 Q14 37 18 33Z" fill="#FFB8DC" opacity="0.85" />
    </motion.svg>
  </motion.div>
);

// ─── Macaw (flies left→right) ─────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
const Macaw = ({ top, delay, scale = 1 }) => (
  <motion.div aria-hidden="true" className="absolute pointer-events-none select-none"
    style={{ top, zIndex: 5 }}
    animate={{ x: ["-8vw", "112vw"] }}
    transition={{ duration: 13, delay, repeat: Infinity, ease: "linear" }}
  >
    <motion.svg width={64 * scale} height={46 * scale} viewBox="0 0 64 46" fill="none"
      animate={{ y: [0, -10, 0] }} transition={{ duration: 0.48, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* body */}
      <ellipse cx="30" cy="30" rx="14" ry="9" fill="#3B60E4" />
      <ellipse cx="30" cy="35" rx="8" ry="5" fill="#FFE566" />
      {/* tail */}
      <path d="M16 30 Q2 38 0 46 Q8 40 16 36Z" fill="#E43B60" />
      <path d="M18 33 Q6 44 8 52 Q14 44 20 38Z" fill="#3B60E4" opacity="0.85" />
      <path d="M14 28 Q0 32 -2 40 Q6 36 14 32Z" fill="#FFE566" opacity="0.8" />
      {/* head */}
      <circle cx="45" cy="24" r="12" fill="#E43B60" />
      <ellipse cx="45" cy="30" rx="7" ry="5" fill="#FFE566" />
      {/* white face patch */}
      <ellipse cx="50" cy="26" rx="5" ry="4" fill="white" opacity="0.9" />
      {/* beak */}
      <path d="M56 22 Q64 24 62 30 Q58 30 55 26Z" fill="#222" />
      <path d="M56 22 Q64 24 62 30" stroke="#555" strokeWidth="0.8" fill="none" />
      {/* eye */}
      <circle cx="52" cy="22" r="3.5" fill="#FFE566" />
      <circle cx="52" cy="22" r="2" fill="#222" />
      <circle cx="52.5" cy="21.5" r="0.7" fill="white" />
      {/* wings */}
      <motion.path d="M17 28 Q10 12 6 16 Q10 22 17 28Z" fill="#3B60E4"
        animate={{ d: ["M17 28 Q10 12 6 16 Q10 22 17 28Z", "M17 28 Q8 20 4 22 Q10 25 17 28Z", "M17 28 Q10 12 6 16 Q10 22 17 28Z"] }}
        transition={{ duration: 0.42, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.path d="M43 28 Q50 12 54 16 Q50 22 43 28Z" fill="#E43B60"
        animate={{ d: ["M43 28 Q50 12 54 16 Q50 22 43 28Z", "M43 28 Q52 20 56 22 Q50 25 43 28Z", "M43 28 Q50 12 54 16 Q50 22 43 28Z"] }}
        transition={{ duration: 0.42, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.svg>
  </motion.div>
);

// ─── Hummingbird (flies left→right, fast wings) ───────────────────────────────
// eslint-disable-next-line no-unused-vars
const Hummingbird = ({ top, delay, scale = 1 }) => (
  <motion.div aria-hidden="true" className="absolute pointer-events-none select-none"
    style={{ top, zIndex: 5 }}
    animate={{ x: ["-8vw", "112vw"] }}
    transition={{ duration: 11, delay, repeat: Infinity, ease: "linear" }}
  >
    <motion.svg width={46 * scale} height={30 * scale} viewBox="0 0 46 30" fill="none"
      animate={{ y: [0, -5, 0] }} transition={{ duration: 0.35, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* body */}
      <ellipse cx="22" cy="18" rx="10" ry="6" fill="#22CCAA" />
      <ellipse cx="22" cy="21" rx="6" ry="4" fill="#A8F5E8" />
      {/* tail */}
      <path d="M12 18 Q4 22 2 28 Q8 24 12 20Z" fill="#1A9E8A" />
      {/* head */}
      <circle cx="33" cy="14" r="8" fill="#22CCAA" />
      {/* iridescent throat */}
      <ellipse cx="33" cy="18" rx="4" ry="3" fill="#FF4488" />
      {/* beak — long and thin */}
      <rect x="41" y="13" width="14" height="2.5" rx="1.2" fill="#333" />
      {/* eye */}
      <circle cx="38" cy="13" r="2.5" fill="white" />
      <circle cx="38" cy="13" r="1.4" fill="#111" />
      <circle cx="38.5" cy="12.5" r="0.55" fill="white" />
      {/* fast-blurring wings */}
      <motion.ellipse cx="22" cy="12" rx="12" ry="5" fill="#A8F5E8" opacity="0.7"
        animate={{ ry: [5, 2, 5], opacity: [0.7, 0.35, 0.7] }}
        transition={{ duration: 0.12, repeat: Infinity, ease: "linear" }}
      />
      <motion.ellipse cx="22" cy="22" rx="10" ry="4" fill="#22CCAA" opacity="0.5"
        animate={{ ry: [4, 1.5, 4], opacity: [0.5, 0.2, 0.5] }}
        transition={{ duration: 0.12, repeat: Infinity, ease: "linear" }}
      />
    </motion.svg>
  </motion.div>
);

// ─── Frog ─────────────────────────────────────────────────────────────────────
const Frog = ({ style, imageSrc }) => imageSrc ? (
  <motion.img aria-hidden="true" src={imageSrc} alt="" draggable={false}
    className="absolute pointer-events-none select-none w-[115px] h-auto object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.22)]" style={style}
    animate={{ y: [0, -20, 0] }}
    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
  />
) : (
  <motion.div aria-hidden="true" className="absolute pointer-events-none select-none" style={style}
    animate={{ y: [0, -20, 0] }}
    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
  >
    <svg width="100" height="88" viewBox="0 0 100 88" fill="none">
      <ellipse cx="18" cy="70" rx="18" ry="9" fill="#3AB840" transform="rotate(-15 18 70)" />
      <ellipse cx="82" cy="70" rx="18" ry="9" fill="#3AB840" transform="rotate(15 82 70)" />
      <ellipse cx="50" cy="58" rx="32" ry="24" fill="#4ECC5A" />
      <ellipse cx="50" cy="62" rx="20" ry="14" fill="#A8F0B0" />
      <ellipse cx="22" cy="74" rx="11" ry="7" fill="#4ECC5A" transform="rotate(20 22 74)" />
      <ellipse cx="78" cy="74" rx="11" ry="7" fill="#4ECC5A" transform="rotate(-20 78 74)" />
      <ellipse cx="50" cy="35" rx="28" ry="22" fill="#4ECC5A" />
      <circle cx="32" cy="24" r="11" fill="#4ECC5A" />
      <circle cx="68" cy="24" r="11" fill="#4ECC5A" />
      <circle cx="32" cy="24" r="8"  fill="#FFE566" />
      <circle cx="68" cy="24" r="8"  fill="#FFE566" />
      <circle cx="32" cy="24" r="4.5" fill="#222" />
      <circle cx="68" cy="24" r="4.5" fill="#222" />
      <circle cx="33" cy="23" r="1.8" fill="white" />
      <circle cx="69" cy="23" r="1.8" fill="white" />
      <motion.g animate={{ opacity: [0,0,1,0] }} transition={{ duration: 4, repeat: Infinity, times:[0,0.87,0.92,1] }}>
        <ellipse cx="32" cy="24" rx="8" ry="4.5" fill="#4ECC5A" />
        <ellipse cx="68" cy="24" rx="8" ry="4.5" fill="#4ECC5A" />
      </motion.g>
      <path d="M38 46 Q50 56 62 46" stroke="#2A8A32" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="56" cy="60" r="4" fill="#3AB840" opacity="0.5" />
      <circle cx="42" cy="64" r="3" fill="#3AB840" opacity="0.5" />
    </svg>
  </motion.div>
);

// ─── Elephant ────────────────────────────────────────────────────────────────
const Elephant = ({ style, imageSrc }) => imageSrc ? (
  <motion.img aria-hidden="true" src={imageSrc} alt="" draggable={false}
    className="absolute pointer-events-none select-none w-[180px] h-auto object-contain drop-shadow-[0_10px_14px_rgba(0,0,0,0.24)]" style={style}
    animate={{ y: [0, -8, 0] }}
    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
  />
) : (
  <motion.div aria-hidden="true" className="absolute pointer-events-none select-none" style={style}
    animate={{ y: [0, -8, 0] }}
    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
  >
    <svg width="170" height="150" viewBox="0 0 170 150" fill="none">
      <motion.path d="M140 88 Q155 96 150 108 Q145 118 152 124"
        stroke="#94B8D8" strokeWidth="6" fill="none" strokeLinecap="round"
        animate={{ d: ["M140 88 Q155 96 150 108 Q145 118 152 124","M140 88 Q158 92 153 106 Q148 118 155 126","M140 88 Q155 96 150 108 Q145 118 152 124"] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <ellipse cx="95" cy="95" rx="58" ry="44" fill="#A8C8E8" />
      <ellipse cx="95" cy="110" rx="42" ry="18" fill="#90B4D8" opacity="0.5" />
      <circle cx="50" cy="76" r="38" fill="#B8D4EC" />
      <ellipse cx="24" cy="72" rx="20" ry="28" fill="#C8DCEE" />
      <ellipse cx="24" cy="72" rx="14" ry="18" fill="#F0B8C8" />
      <motion.path d="M36 98 Q20 118 28 132 Q34 144 26 150"
        stroke="#A8C8E8" strokeWidth="15" fill="none" strokeLinecap="round"
        animate={{ d: ["M36 98 Q20 118 28 132 Q34 144 26 150","M36 98 Q16 115 24 130 Q30 142 22 150","M36 98 Q20 118 28 132 Q34 144 26 150"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <rect x="62"  y="132" width="20" height="22" rx="10" fill="#90B4D0" />
      <rect x="86"  y="132" width="20" height="22" rx="10" fill="#90B4D0" />
      <rect x="108" y="132" width="20" height="22" rx="10" fill="#90B4D0" />
      <circle cx="44" cy="68" r="7"   fill="white" />
      <circle cx="45" cy="68" r="3.5" fill="#2A2A2A" />
      <circle cx="46" cy="67" r="1.5" fill="white" />
      <motion.line x1="37" y1="68" x2="52" y2="68" stroke="#B8D4EC" strokeWidth="5.5"
        animate={{ opacity: [0,0,1,0] }} transition={{ duration: 5, repeat: Infinity, times:[0,0.88,0.93,1] }}
      />
      <path d="M36 88 Q24 92 20 100" stroke="#F0E6C0" strokeWidth="6" fill="none" strokeLinecap="round" />
      <circle cx="112" cy="84" r="9" fill="#90B4D8" opacity="0.3" />
      <circle cx="128" cy="100" r="7" fill="#90B4D8" opacity="0.3" />
    </svg>
  </motion.div>
);

// ─── Monkey ───────────────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
const Monkey = ({ style, imageSrc }) => (
  <motion.div aria-hidden="true" className="absolute pointer-events-none select-none" style={style}
    animate={{ rotate: [-5, 5, -5] }}
    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
  >
    {imageSrc ? (
      <img
        src={imageSrc}
        alt=""
        className="block w-[150px] h-auto object-contain drop-shadow-[0_10px_14px_rgba(0,0,0,0.24)]"
        draggable={false}
      />
    ) : (
    <svg width="130" height="170" viewBox="0 0 130 170" fill="none">
      <motion.path d="M65 0 Q65 20 65 30"
        stroke="#5A8A30" strokeWidth="6" fill="none" strokeLinecap="round"
        animate={{ d: ["M65 0 Q65 20 65 30","M65 0 Q70 18 65 30","M65 0 Q65 20 65 30"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.path d="M90 130 Q115 120 112 100 Q108 82 118 72"
        stroke="#C07830" strokeWidth="8" fill="none" strokeLinecap="round"
        animate={{ d: ["M90 130 Q115 120 112 100 Q108 82 118 72","M90 130 Q118 118 114 96 Q110 78 122 68","M90 130 Q115 120 112 100 Q108 82 118 72"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <ellipse cx="65" cy="118" rx="36" ry="32" fill="#D4944E" />
      <ellipse cx="65" cy="124" rx="22" ry="18" fill="#F0C080" />
      <circle cx="65" cy="68" r="32" fill="#D4944E" />
      <circle cx="33" cy="68" r="14" fill="#C07830" />
      <circle cx="33" cy="68" r="9"  fill="#F0A090" />
      <circle cx="97" cy="68" r="14" fill="#C07830" />
      <circle cx="97" cy="68" r="9"  fill="#F0A090" />
      <ellipse cx="65" cy="78" rx="18" ry="13" fill="#F0C080" />
      <circle cx="54" cy="62" r="7" fill="white" />
      <circle cx="76" cy="62" r="7" fill="white" />
      <circle cx="55" cy="62" r="4" fill="#2A1A0A" />
      <circle cx="77" cy="62" r="4" fill="#2A1A0A" />
      <circle cx="56" cy="61" r="1.8" fill="white" />
      <circle cx="78" cy="61" r="1.8" fill="white" />
      <motion.g animate={{ opacity: [0,0,1,0] }} transition={{ duration: 3.8, repeat: Infinity, times:[0,0.88,0.93,1] }}>
        <line x1="47" y1="62" x2="62" y2="62" stroke="#D4944E" strokeWidth="5" strokeLinecap="round" />
        <line x1="69" y1="62" x2="84" y2="62" stroke="#D4944E" strokeWidth="5" strokeLinecap="round" />
      </motion.g>
      <ellipse cx="65" cy="74" rx="5" ry="3" fill="#C07830" />
      <circle cx="63" cy="74" r="1.5" fill="#A06020" />
      <circle cx="67" cy="74" r="1.5" fill="#A06020" />
      <path d="M55 82 Q65 92 75 82" stroke="#A06030" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <motion.path d="M30 108 Q16 94 20 78"
        stroke="#D4944E" strokeWidth="12" fill="none" strokeLinecap="round"
        animate={{ d: ["M30 108 Q16 94 20 78","M30 108 Q12 96 16 80","M30 108 Q16 94 20 78"] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <circle cx="20" cy="76" r="8" fill="#D4944E" />
      <path d="M100 108 Q114 94 110 78" stroke="#D4944E" strokeWidth="12" fill="none" strokeLinecap="round" />
      <circle cx="110" cy="76" r="8" fill="#D4944E" />
      <ellipse cx="52" cy="150" rx="10" ry="22" fill="#C07830" />
      <ellipse cx="78" cy="150" rx="10" ry="22" fill="#C07830" />
    </svg>
    )}
  </motion.div>
);

// ─── Giraffe ─────────────────────────────────────────────────────────────────
const Giraffe = ({ style, imageSrc }) => imageSrc ? (
  <motion.img aria-hidden="true" src={imageSrc} alt="" draggable={false}
    className="absolute pointer-events-none select-none w-[195px] h-auto object-contain drop-shadow-[0_10px_14px_rgba(0,0,0,0.24)]" style={style}
    animate={{ y: [0, -7, 0] }}
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
  />
) : (
  <motion.div aria-hidden="true" className="absolute pointer-events-none select-none" style={style}
    animate={{ y: [0, -7, 0] }}
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
  >
    <svg width="110" height="200" viewBox="0 0 110 200" fill="none">
      <rect x="38" y="18" width="30" height="90" rx="15" fill="#F5C842" />
      <ellipse cx="44" cy="35" rx="7" ry="5" fill="#D4902A" opacity="0.65" />
      <ellipse cx="56" cy="55" rx="6" ry="8" fill="#D4902A" opacity="0.65" />
      <ellipse cx="42" cy="75" rx="6" ry="5" fill="#D4902A" opacity="0.65" />
      <ellipse cx="58" cy="90" rx="5" ry="6" fill="#D4902A" opacity="0.65" />
      <ellipse cx="53" cy="14" rx="18" ry="15" fill="#F5C842" />
      <rect x="44" y="1" width="6" height="14" rx="3" fill="#C87820" />
      <circle cx="47" cy="1" r="3.5" fill="#A06010" />
      <rect x="57" y="1" width="6" height="14" rx="3" fill="#C87820" />
      <circle cx="60" cy="1" r="3.5" fill="#A06010" />
      <ellipse cx="35" cy="14" rx="7" ry="10" fill="#F5C842" />
      <ellipse cx="35" cy="14" rx="4" ry="6" fill="#E8A030" />
      <ellipse cx="71" cy="14" rx="7" ry="10" fill="#F5C842" />
      <ellipse cx="71" cy="14" rx="4" ry="6" fill="#E8A030" />
      <circle cx="44" cy="12" r="5" fill="white" />
      <circle cx="44" cy="12" r="2.8" fill="#2A1A00" />
      <circle cx="45" cy="11" r="1.2" fill="white" />
      <motion.line x1="39" y1="12" x2="50" y2="12" stroke="#F5C842" strokeWidth="4"
        animate={{ opacity: [0,0,1,0] }} transition={{ duration: 5.5, repeat: Infinity, times:[0,0.89,0.93,1] }}
      />
      <path d="M48 20 Q53 24 58 20" stroke="#C87820" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <ellipse cx="55" cy="140" rx="34" ry="42" fill="#F5C842" />
      <ellipse cx="42" cy="128" rx="9" ry="7"   fill="#D4902A" opacity="0.55" />
      <ellipse cx="66" cy="140" rx="11" ry="9"  fill="#D4902A" opacity="0.55" />
      <ellipse cx="44" cy="152" rx="8" ry="6"   fill="#D4902A" opacity="0.55" />
      <ellipse cx="68" cy="158" rx="7" ry="8"   fill="#D4902A" opacity="0.55" />
      <rect x="28" y="176" width="14" height="28" rx="7" fill="#E8B030" />
      <rect x="44" y="176" width="14" height="28" rx="7" fill="#E8B030" />
      <rect x="58" y="176" width="14" height="28" rx="7" fill="#E8B030" />
      <rect x="74" y="176" width="14" height="28" rx="7" fill="#E8B030" />
      <motion.path d="M87 140 Q98 134 96 150"
        stroke="#E8B030" strokeWidth="5" fill="none" strokeLinecap="round"
        animate={{ d: ["M87 140 Q98 134 96 150","M87 140 Q100 138 98 152","M87 140 Q98 134 96 150"] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <ellipse cx="96" cy="154" rx="4" ry="7" fill="#C87820" />
    </svg>
  </motion.div>
);

// ─── Lion ─────────────────────────────────────────────────────────────────────
const Lion = ({ style, imageSrc }) => imageSrc ? (
  <motion.img aria-hidden="true" src={imageSrc} alt="" draggable={false}
    className="absolute pointer-events-none select-none w-[155px] h-auto object-contain drop-shadow-[0_10px_14px_rgba(0,0,0,0.24)]" style={style}
    animate={{ y: [0, -6, 0] }}
    transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
  />
) : (
  <motion.div aria-hidden="true" className="absolute pointer-events-none select-none" style={style}
    animate={{ y: [0, -6, 0] }}
    transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
  >
    <svg width="160" height="138" viewBox="0 0 160 138" fill="none">
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((angle, i) => (
        <ellipse key={i} cx="60" cy="64" rx="38" ry="14"
          fill={i % 2 === 0 ? "#E8841A" : "#D4702A"}
          transform={`rotate(${angle} 60 64)`} opacity="0.85"
        />
      ))}
      <ellipse cx="100" cy="95" rx="50" ry="34" fill="#F0B84A" />
      <ellipse cx="100" cy="104" rx="30" ry="19" fill="#F8D880" />
      <motion.path d="M148 94 Q165 83 162 68 Q158 58 168 50"
        stroke="#E8A030" strokeWidth="8" fill="none" strokeLinecap="round"
        animate={{ d: ["M148 94 Q165 83 162 68 Q158 58 168 50","M148 94 Q167 80 164 64 Q160 54 170 46","M148 94 Q165 83 162 68 Q158 58 168 50"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <ellipse cx="168" cy="48" rx="11" ry="9" fill="#C06020" />
      <circle cx="60" cy="62" r="40" fill="#F0B84A" />
      <ellipse cx="60" cy="74" rx="22" ry="15" fill="#F8D880" />
      <circle cx="45" cy="55" r="9"  fill="#88CC44" />
      <circle cx="75" cy="55" r="9"  fill="#88CC44" />
      <circle cx="46" cy="55" r="5"  fill="#1A1A1A" />
      <circle cx="76" cy="55" r="5"  fill="#1A1A1A" />
      <circle cx="47" cy="54" r="2.2" fill="white" />
      <circle cx="77" cy="54" r="2.2" fill="white" />
      <motion.g animate={{ opacity: [0,0,1,0] }} transition={{ duration: 4.5, repeat: Infinity, times:[0,0.88,0.93,1] }}>
        <ellipse cx="45" cy="55" rx="9" ry="4.5" fill="#F0B84A" />
        <ellipse cx="75" cy="55" rx="9" ry="4.5" fill="#F0B84A" />
      </motion.g>
      <ellipse cx="60" cy="68" rx="7" ry="5" fill="#D46040" />
      <line x1="28" y1="70" x2="52" y2="72" stroke="white" strokeWidth="1.5" opacity="0.8" />
      <line x1="26" y1="74" x2="52" y2="74" stroke="white" strokeWidth="1.5" opacity="0.8" />
      <line x1="68" y1="72" x2="92" y2="70" stroke="white" strokeWidth="1.5" opacity="0.8" />
      <line x1="68" y1="74" x2="94" y2="74" stroke="white" strokeWidth="1.5" opacity="0.8" />
      <path d="M53 76 Q60 84 67 76" stroke="#C04030" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="28" cy="30" r="16" fill="#E8841A" />
      <circle cx="28" cy="30" r="9"  fill="#F0B84A" />
      <circle cx="92" cy="30" r="16" fill="#E8841A" />
      <circle cx="92" cy="30" r="9"  fill="#F0B84A" />
      <rect x="66"  y="122" width="18" height="18" rx="9" fill="#E8A030" />
      <rect x="88"  y="122" width="18" height="18" rx="9" fill="#E8A030" />
      <rect x="108" y="122" width="18" height="18" rx="9" fill="#E8A030" />
    </svg>
  </motion.div>
);

// ─── Palm Tree ────────────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
const PalmTree = ({ x, flip = false, scale = 1 }) => (
  <motion.div
    aria-hidden="true"
    className="absolute bottom-0 pointer-events-none select-none"
    style={{ left: `${x}%`, zIndex: 1, transform: `scaleX(${flip ? -1 : 1}) scale(${scale})`, transformOrigin: "bottom center" }}
    animate={{ rotate: [-1.5, 2, -1.5] }}
    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
  >
    <svg width="90" height="170" viewBox="0 0 90 170" fill="none">
      <path d="M44 170 Q38 140 40 110 Q42 80 45 50" stroke="#8B5E2A" strokeWidth="12" fill="none" strokeLinecap="round" />
      <path d="M46 170 Q52 140 50 110 Q48 80 45 50" stroke="#A67040" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.5" />
      <circle cx="40" cy="56" r="6" fill="#8B4513" />
      <circle cx="50" cy="52" r="6" fill="#8B4513" />
      <motion.path d="M45 48 Q20 30 2 38" stroke="#3DA850" strokeWidth="8" fill="none" strokeLinecap="round"
        animate={{ d: ["M45 48 Q20 30 2 38","M45 48 Q20 26 2 34","M45 48 Q20 30 2 38"] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.path d="M45 48 Q60 18 74 14" stroke="#52C060" strokeWidth="8" fill="none" strokeLinecap="round"
        animate={{ d: ["M45 48 Q60 18 74 14","M45 48 Q62 15 76 11","M45 48 Q60 18 74 14"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
      <motion.path d="M45 48 Q45 15 50 2" stroke="#4ABB54" strokeWidth="8" fill="none" strokeLinecap="round"
        animate={{ d: ["M45 48 Q45 15 50 2","M45 48 Q48 13 53 0","M45 48 Q45 15 50 2"] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.path d="M45 48 Q68 34 82 40" stroke="#3DA850" strokeWidth="7" fill="none" strokeLinecap="round"
        animate={{ d: ["M45 48 Q68 34 82 40","M45 48 Q70 30 84 36","M45 48 Q68 34 82 40"] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      />
      <motion.path d="M45 48 Q22 20 10 10" stroke="#52C060" strokeWidth="7" fill="none" strokeLinecap="round"
        animate={{ d: ["M45 48 Q22 20 10 10","M45 48 Q20 17 8 7","M45 48 Q22 20 10 10"] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />
    </svg>
  </motion.div>
);

// ─── Jungle Bush ──────────────────────────────────────────────────────────────
const JungleBush = ({ x, color = "#2D7A3A" }) => (
  <div aria-hidden="true" className="absolute bottom-0 pointer-events-none select-none" style={{ left: `${x}%`, zIndex: 2 }}>
    <svg width="100" height="60" viewBox="0 0 100 60" fill="none">
      <ellipse cx="50" cy="40" rx="46" ry="24" fill={color} />
      <ellipse cx="28" cy="34" rx="26" ry="22" fill={color} opacity="0.9" />
      <ellipse cx="72" cy="32" rx="24" ry="20" fill={color} opacity="0.9" />
      <ellipse cx="50" cy="24" rx="20" ry="18" fill="#3DA850" />
      <circle cx="22" cy="20" r="6" fill="#FFD6E0" />
      <circle cx="22" cy="20" r="3.5" fill="#FF8FAB" />
      <circle cx="70" cy="17" r="6" fill="#FFE566" />
      <circle cx="70" cy="17" r="3.5" fill="#FFB830" />
      <circle cx="46" cy="14" r="5" fill="#C0E0FF" />
      <circle cx="46" cy="14" r="2.5" fill="#5BB8F5" />
    </svg>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AnimatedJungleBackground = () => {
  const mouse = useMouseParallax();

  const leaves = [
    { x: 5,  delay: 0,   duration: 10, size: 22, color: "#52D060", shapeIdx: 0, rotate: 0   },
    { x: 14, delay: 3,   duration: 13, size: 18, color: "#A8E840", shapeIdx: 1, rotate: 45  },
    { x: 22, delay: 1,   duration: 9,  size: 26, color: "#3DB850", shapeIdx: 2, rotate: 20  },
    { x: 32, delay: 5.5, duration: 12, size: 20, color: "#FFD580", shapeIdx: 3, rotate: 90  },
    { x: 44, delay: 2,   duration: 11, size: 16, color: "#FF8FAB", shapeIdx: 0, rotate: 135 },
    { x: 55, delay: 4,   duration: 14, size: 24, color: "#52D060", shapeIdx: 1, rotate: 60  },
    { x: 64, delay: 0.5, duration: 10, size: 18, color: "#A8E840", shapeIdx: 2, rotate: 30  },
    { x: 74, delay: 6,   duration: 12, size: 22, color: "#5BB8F5", shapeIdx: 3, rotate: 75  },
    { x: 83, delay: 2.8, duration: 9,  size: 20, color: "#FFE566", shapeIdx: 0, rotate: 15  },
    { x: 91, delay: 1.5, duration: 11, size: 16, color: "#3DB850", shapeIdx: 1, rotate: 50  },
    { x: 97, delay: 7,   duration: 13, size: 24, color: "#FF8FAB", shapeIdx: 2, rotate: 110 },
  ];

  const sparkles = [
    { x: 12, y: 28, delay: 0,   color: "#FFE566" },
    { x: 28, y: 52, delay: 1.3, color: "#A8F050" },
    { x: 48, y: 18, delay: 0.7, color: "#FFE566" },
    { x: 62, y: 42, delay: 2.2, color: "#FF8FAB" },
    { x: 76, y: 62, delay: 1.6, color: "#5BB8F5" },
    { x: 88, y: 34, delay: 0.4, color: "#FFE566" },
    { x: 38, y: 70, delay: 3,   color: "#A8F050" },
    { x: 55, y: 80, delay: 1,   color: "#FFE566" },
    { x: 20, y: 75, delay: 2.5, color: "#FF8FAB" },
  ];

  const bubbles = [2, 12, 25, 38, 50, 62, 75, 88].map((x, i) => ({ x, delay: i * 1.1 }));

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>

      {/* Matching 3D jungle landscape */}
      <motion.img
        src={cuteJungleLandscapeImg}
        alt=""
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none select-none"
        style={{ x: mouse.x * -2, scale: 1.015 }}
        animate={{ scale: [1.015, 1.025, 1.015] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Soft blue tint keeps the upper landscape reading as a bright sky. */}
      <div
        className="absolute inset-x-0 top-0 h-[62%] pointer-events-none"
        style={{
          zIndex: 1,
          background: "linear-gradient(180deg, rgba(70, 176, 238, 0.48) 0%, rgba(112, 204, 245, 0.28) 48%, rgba(165, 225, 248, 0.08) 78%, transparent 100%)",
          mixBlendMode: "soft-light",
        }}
      />

      {/* Sun */}
      <motion.img
        src={cuteSunImg}
        alt=""
        draggable={false}
        className="absolute h-auto w-[clamp(110px,9vw,165px)] pointer-events-none select-none"
        style={{ top: "2%", right: "20%", x: mouse.x * -10, y: mouse.y * -6, zIndex: 2 }}
        animate={{ rotate: [-3, 3, -3], scale: [1, 1.04, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Back clouds */}
      <motion.div className="absolute inset-0" style={{ x: mouse.x * -6 }}>
        <Cloud top="8%" startX="4%" duration={30} width={250} opacity={0.78} />
        <Cloud top="20%" startX="69%" duration={38} width={210} opacity={0.62} />
      </motion.div>

      {/* Birds */}
      <FlyingBirdImage src={cuteFlyingParrotImg} top="12%" delay={0} duration={24} width="clamp(105px, 9vw, 165px)" />
      <FlyingBirdImage src={cuteFlyingBirdsImg} top="24%" delay={7} duration={31} width="clamp(150px, 14vw, 245px)" reverse />

      {/* Leaves */}
      {leaves.map((l, i) => <Leaf key={i} {...l} />)}

      {/* Sparkles */}
      {sparkles.map((s, i) => <Sparkle key={i} {...s} />)}

      {/* Bubbles */}
      {bubbles.map((b, i) => <Bubble key={i} {...b} />)}

      {/* Butterflies */}
      <Butterfly x={20} y={30} color1="#FF6BD6" color2="#FFB8EA" delay={0}   />
      <Butterfly x={65} y={20} color1="#5BB8F5" color2="#A8D8FF" delay={4}   size={36} />
      <Butterfly x={45} y={55} color1="#FFE566" color2="#FFB830" delay={8}   size={30} />

      {/* Bushes */}
      <JungleBush x={8}  color="#2D8A3A" />
      <JungleBush x={20} color="#3A9844" />
      <JungleBush x={38} color="#268A30" />
      <JungleBush x={54} color="#3A9040" />
      <JungleBush x={70} color="#2D8A3A" />

      {/* Matching 3D grass and trees frame the content without covering its center */}
      <motion.img
        src={cuteJungleFoliageImg}
        alt=""
        draggable={false}
        className="absolute bottom-0 left-0 w-full pointer-events-none select-none"
        style={{
          height: "clamp(260px, 52vh, 520px)",
          objectFit: "fill",
          objectPosition: "bottom center",
          zIndex: 3,
          x: mouse.x * -3,
        }}
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Frog mid left */}
      <motion.div
        className="absolute"
        style={{ bottom: "5%", left: "17%", width: 115, zIndex: 5, x: mouse.x * -10 }}
      >
        <Frog imageSrc={cuteFrogImg} style={{ position: "relative" }} />
      </motion.div>

      {/* Elephant bottom left */}
      <motion.div
        className="absolute"
        style={{ bottom: "-1%", left: "2%", width: 180, zIndex: 5, x: mouse.x * -8 }}
      >
        <Elephant imageSrc={cuteElephantImg} style={{ position: "relative" }} />
      </motion.div>

      {/* Generated hanging monkey with its full-length vine */}
      <motion.img
        src={generatedHangingMonkeyVineImg}
        alt=""
        draggable={false}
        className="absolute right-[2%] top-0 h-[clamp(430px,72vh,720px)] w-auto pointer-events-none select-none"
        style={{ zIndex: 4, x: mouse.x * -8, y: mouse.y * -4 }}
        animate={{ rotate: [-0.8, 0.8, -0.8] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Giraffe right */}
      <motion.div
        className="absolute"
        style={{ bottom: "1%", right: "2%", width: 195, zIndex: 5, x: mouse.x * -7 }}
      >
        <Giraffe imageSrc={cuteGiraffeImg} style={{ position: "relative" }} />
      </motion.div>

      {/* Lion mid right */}
      <motion.div className="absolute" style={{ bottom: "0%", right: "18%", zIndex: 5, x: mouse.x * -9 }}>
        <Lion imageSrc={cuteLionImg} style={{ position: "relative" }} />
      </motion.div>

      {/* Gradient overlay for readability */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{
        background: "linear-gradient(180deg, rgba(10,40,80,0.08) 0%, transparent 30%, transparent 60%, rgba(0,60,10,0.22) 85%, rgba(0,50,10,0.40) 100%)",
        zIndex: 8,
      }} />

      <FireflyOverlay />

    </div>
  );
};

export default AnimatedJungleBackground;
