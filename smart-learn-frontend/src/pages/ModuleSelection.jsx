import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useAuth from "../hooks/useAuth";
import useDyslexia from "../modules/dyslexia/hooks/useDyslexia";
import animalImg from "../assets/images/background/anaimals.jpg";
import spaceImg from "../assets/images/background/space.jpg";
import mathImg from "../assets/images/background/math.jpeg";
import seaImg from "../assets/images/background/sea.jpg";
import homeInstructionAudio from "../assets/audio/home_clean.mp3";

/* ═══════════════════════════════════════════════
   SVG Icons for each module
═══════════════════════════════════════════════ */

/* Alphabet / Speaking icon */
const IconLetters = () => (
  <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
    <circle cx="34" cy="34" r="34" fill="rgba(255,255,255,0.2)" />
    <text x="34" y="30" textAnchor="middle" fontSize="22" fontWeight="900" fill="#fff" fontFamily="serif">අ</text>
    <text x="34" y="52" textAnchor="middle" fontSize="16" fontWeight="800" fill="rgba(255,255,255,0.85)" fontFamily="serif">ආ ඉ</text>
    {/* Sound waves */}
    <path d="M50 28 Q56 34 50 40" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    <path d="M54 24 Q63 34 54 44" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" fill="none"/>
  </svg>
);

/* Pencil / Writing icon */
const IconWriting = () => (
  <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
    <circle cx="34" cy="34" r="34" fill="rgba(255,255,255,0.2)" />
    <rect x="30" y="14" width="12" height="28" rx="4" fill="rgba(255,255,255,0.9)" />
    <polygon points="30,42 42,42 36,54" fill="rgba(255,220,100,0.95)" />
    <rect x="30" y="14" width="12" height="6" rx="3" fill="rgba(255,180,150,0.9)" />
    {/* Lines suggesting writing */}
    <line x1="18" y1="57" x2="50" y2="57" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="22" y1="52" x2="46" y2="52" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

/* Math / Numbers icon */
const IconNumbers = () => (
  <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
    <circle cx="34" cy="34" r="34" fill="rgba(255,255,255,0.2)" />
    <text x="20" y="30" fontSize="18" fontWeight="900" fill="#fff">1</text>
    <text x="36" y="30" fontSize="18" fontWeight="900" fill="rgba(255,255,255,0.8)">2</text>
    <text x="20" y="50" fontSize="18" fontWeight="900" fill="rgba(255,255,255,0.8)">3</text>
    <text x="36" y="50" fontSize="18" fontWeight="900" fill="#fff">+</text>
    {/* Plus symbol overlay */}
    <circle cx="52" cy="18" r="10" fill="rgba(255,255,255,0.25)" />
    <line x1="47" y1="18" x2="57" y2="18" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="52" y1="13" x2="52" y2="23" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

/* Brain / Memory icon */
const IconBrain = () => (
  <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
    <circle cx="34" cy="34" r="34" fill="rgba(255,255,255,0.2)" />
    {/* Brain shape */}
    <path d="M34 20 C28 20 22 24 22 30 C20 30 16 33 18 38 C16 42 20 46 24 46 C24 50 28 52 32 50 L36 50 C40 52 44 50 44 46 C48 46 52 42 50 38 C52 33 48 30 46 30 C46 24 40 20 34 20 Z" fill="rgba(255,255,255,0.85)" />
    {/* Memory dots */}
    <circle cx="28" cy="34" r="3" fill="rgba(180,120,220,0.9)" />
    <circle cx="34" cy="30" r="3" fill="rgba(100,180,255,0.9)" />
    <circle cx="40" cy="34" r="3" fill="rgba(255,150,100,0.9)" />
    <circle cx="34" cy="38" r="3" fill="rgba(100,220,160,0.9)" />
    {/* Connecting lines */}
    <line x1="28" y1="34" x2="34" y2="30" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
    <line x1="34" y1="30" x2="40" y2="34" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
    <line x1="28" y1="34" x2="34" y2="38" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
    <line x1="40" y1="34" x2="34" y2="38" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
  </svg>
);

/* ═══════════════════════════════════════════════
   Module data
═══════════════════════════════════════════════ */
const MODULES = [
  {
    id: 1,
    title: "අකුරු කියමු",
    description: "ශබ්ද, අකුරු හා කියවීමේ ක්‍රීඩා හරහා භාෂාව ඉගෙනගනිමු",
    path: "/dyslexia",
    Icon: IconLetters,
    gradient: "linear-gradient(145deg, #11998e 0%, #38ef7d 100%)",
    shadowColor: "rgba(17,153,142,0.45)",
    badge: "🌟 ජනප්‍රිය",
    badgeBg: "rgba(0,0,0,0.2)",
    accent: "#11998e",
    bg: "linear-gradient(135deg, #e0fff6 0%, #b2f5ea 100%)",
    numeral: "01",
    image: animalImg,
  },
  {
    id: 2,
    title: "අකුරු ලියමු",
    description: "ලිවීම, ඇඳීම හා සියුම් ශිල්ප නිවැරදිව ප්‍රගුණ කරමු",
    path: "/dysgraphia",
    Icon: IconWriting,
    gradient: "linear-gradient(145deg, #f7971e 0%, #ffd200 100%)",
    shadowColor: "rgba(247,151,30,0.45)",
    badge: "🎨 නිර්මාණශීලී",
    badgeBg: "rgba(0,0,0,0.18)",
    accent: "#e07b00",
    bg: "linear-gradient(135deg, #fffbe0 0%, #ffeaa7 100%)",
    numeral: "02",
    image: spaceImg,
  },
  {
    id: 3,
    title: "ගණන් හදමු",
    description: "සංඛ්‍යා, ගණිතය හා ගනන් ක්‍රීඩා හරහා ගණිතය ප්‍රිය කරමු",
    path: "/dyscalculia",
    Icon: IconNumbers,
    gradient: "linear-gradient(145deg, #ee0979 0%, #ff6a00 100%)",
    shadowColor: "rgba(238,9,121,0.4)",
    badge: "🔥 විනෝදජනක",
    badgeBg: "rgba(0,0,0,0.2)",
    accent: "#cc0066",
    bg: "linear-gradient(135deg, #ffe0f0 0%, #ffc0d0 100%)",
    numeral: "03",
    image: mathImg,
  },
  {
    id: 4,
    title: "මතකය වර්ධනය කරමු",
    description: "මතකය, අවධානය හා චිත්තවේගීය ශක්තිය ශක්තිමත් කරමු",
    path: "/working-memory",
    Icon: IconBrain,
    gradient: "linear-gradient(145deg, #4776e6 0%, #8e54e9 100%)",
    shadowColor: "rgba(71,118,230,0.45)",
    badge: "💡 බුද්ධිමත්",
    badgeBg: "rgba(0,0,0,0.2)",
    accent: "#4c5bd4",
    bg: "linear-gradient(135deg, #e8e0ff 0%, #d0c5f5 100%)",
    numeral: "04",
    image: seaImg,
  },
];

/* ═══════════════════════════════════════════════
   Floating dot
═══════════════════════════════════════════════ */
const Dot = ({ style, color, size, delay }) => (
  <motion.div
    animate={{ y: [0, -18, 0], opacity: [0.4, 0.9, 0.4] }}
    transition={{ duration: 3.5, repeat: Infinity, delay, ease: "easeInOut" }}
    style={{ position: "absolute", width: size, height: size, borderRadius: "50%", background: color, pointerEvents: "none", ...style }}
  />
);

/* ═══════════════════════════════════════════════
   Module Card
═══════════════════════════════════════════════ */
const ModuleCard = ({ mod, index, onNavigate }) => {
  const { title, description, path, Icon, gradient, shadowColor, badge, badgeBg, numeral, image } = mod;
  const liveOverview = mod.liveOverview;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.88 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.15 + index * 0.13, type: "spring", stiffness: 180, damping: 20 }}
      whileHover={{ y: -6, scale: 1.01, boxShadow: `0 20px 48px ${shadowColor}` }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onNavigate(path)}
      style={{
        background: "#fff",
        borderRadius: 24,
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: `0 8px 26px ${shadowColor}, 0 2px 8px rgba(0,0,0,0.06)`,
        display: "flex",
        flexDirection: "column",
        border: "2px solid rgba(255,255,255,0.8)",
        position: "relative",
      }}
    >
      {/* Card top colored band with aligned background image */}
      <div style={{ background: gradient, padding: "26px 22px 22px", position: "relative", overflow: "hidden" }}>
        {image && (
          <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
            <img
              src={image}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center", display: "block" }}
            />
          </div>
        )}

        {/* Dark overlay for better text contrast */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.28)", zIndex: 1 }} />
        
        {/* Shine sweep */}
        <motion.div
          animate={{ x: ["-120%", "240%"] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut", delay: index * 0.5 }}
          style={{ position: "absolute", top: 0, left: 0, width: "50%", height: "100%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)", transform: "skewX(-12deg)", pointerEvents: "none", zIndex: 2 }}
        />

        {/* Badge */}
        <div style={{ position: "absolute", top: 14, right: 14, background: badgeBg, backdropFilter: "blur(8px)", borderRadius: 50, padding: "4px 12px", fontSize: "0.7rem", fontWeight: 800, color: "#fff", border: "1px solid rgba(255,255,255,0.3)", zIndex: 3 }}>
          {badge}
        </div>

        {/* Numeral */}
        <div style={{ position: "absolute", bottom: 12, right: 18, fontWeight: 900, fontSize: "3.5rem", color: "rgba(255,255,255,0.12)", lineHeight: 1, fontFamily: "Poppins, Arial, sans-serif", userSelect: "none", zIndex: 2 }}>
          {numeral}
        </div>

        {/* Icon */}
        <motion.div
          animate={{ rotate: [0, 4, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: index * 0.4 }}
          style={{ display: "inline-block", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.2))", position: "relative", zIndex: 3 }}
        >
          <Icon />
        </motion.div>

        {/* Title */}
        <h2 style={{ color: "#fff", fontWeight: 900, fontSize: "clamp(1.15rem, 2.5vw, 1.42rem)", margin: "16px 0 0", textShadow: "0 2px 10px rgba(0,0,0,0.25)", fontFamily: "'Nunito', 'Poppins', Arial, sans-serif", lineHeight: 1.2, position: "relative", zIndex: 3 }}>
          {title}
        </h2>
      </div>

      {/* Card bottom — description + CTA */}
      <div style={{ padding: "16px 20px 18px", display: "flex", flexDirection: "column", gap: 14, flexGrow: 1 }}>
        <p style={{ color: "#555", fontSize: "clamp(0.84rem, 1.9vw, 0.94rem)", lineHeight: 1.6, margin: 0, fontWeight: 600 }}>
          {description}
        </p>

        {liveOverview && (
          <div
            style={{
              borderRadius: 18,
              padding: "12px 14px",
              background: "linear-gradient(135deg, rgba(17,153,142,0.08), rgba(56,239,125,0.14))",
              border: "1px solid rgba(17,153,142,0.16)",
            }}
          >
            <div style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", color: "#0f766e", textTransform: "uppercase", marginBottom: 6 }}>
              Live backend status
            </div>
            <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "#134e4a", lineHeight: 1.4 }}>
              {liveOverview.title}
            </div>
            <div style={{ fontSize: "0.8rem", color: "#0f766e", marginTop: 4, lineHeight: 1.5 }}>
              {liveOverview.totalSections} sections · {liveOverview.totalGames} games
            </div>
          </div>
        )}

        {/* Play button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ background: gradient, color: "#fff", borderRadius: 50, padding: "10px 20px", fontWeight: 800, fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: 8, alignSelf: "flex-start", boxShadow: `0 6px 20px ${shadowColor}`, fontFamily: "inherit", cursor: "pointer" }}
        >
          <span>▶</span>
          <span>දැන් සෙල්ලම් කරන්න</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════
   Main Page
═══════════════════════════════════════════════ */
const ModuleSelection = () => {
  useAuth();
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const { data: dyslexiaOverview } = useDyslexia();

  useEffect(() => {
    const key = "modules_home_voice_played_once";
    const hasPlayed = localStorage.getItem(key) === "true";
    if (hasPlayed) return;
    if (!audioRef.current) return;

    const tryPlayOnce = () => audioRef.current
      .play()
      .then(() => {
        setIsAudioPlaying(true);
        localStorage.setItem(key, "true");
      })
      .catch(() => {
        setIsAudioPlaying(false);
      });

    tryPlayOnce();

    // If autoplay is blocked, play once on first user interaction.
    const playOnFirstInteraction = () => {
      if (localStorage.getItem(key) === "true") return;
      tryPlayOnce();
      window.removeEventListener("pointerdown", playOnFirstInteraction);
      window.removeEventListener("keydown", playOnFirstInteraction);
      window.removeEventListener("touchstart", playOnFirstInteraction);
    };

    window.addEventListener("pointerdown", playOnFirstInteraction, { once: true });
    window.addEventListener("keydown", playOnFirstInteraction, { once: true });
    window.addEventListener("touchstart", playOnFirstInteraction, { once: true });

    return () => {
      window.removeEventListener("pointerdown", playOnFirstInteraction);
      window.removeEventListener("keydown", playOnFirstInteraction);
      window.removeEventListener("touchstart", playOnFirstInteraction);
    };
  }, []);

  const handleVoiceInstruction = () => {
    if (!audioRef.current) return;

    if (isAudioPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsAudioPlaying(false);
      return;
    }

    audioRef.current
      .play()
      .then(() => setIsAudioPlaying(true))
      .catch(() => setIsAudioPlaying(false));
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #f0f4ff 0%, #fce4f8 35%, #fff9e6 70%, #e4fdf0 100%)", fontFamily: "'Nunito', 'Poppins', Arial, sans-serif", position: "relative", overflowX: "hidden" }}>
      <audio ref={audioRef} src={homeInstructionAudio} onEnded={() => setIsAudioPlaying(false)} />

      <button
        type="button"
        onClick={handleVoiceInstruction}
        title="උපදෙස් අසන්න"
        aria-label={isAudioPlaying ? "Stop instructions" : "Play instructions"}
        style={{
          position: "fixed",
          right: "1.25rem",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 1200,
          width: "4rem",
          height: "4rem",
          borderRadius: "50%",
          border: "3px solid #fff",
          background: isAudioPlaying
            ? "linear-gradient(135deg,#EF4444,#F87171)"
            : "linear-gradient(135deg,#7C3AED,#A78BFA)",
          color: "#fff",
          fontSize: "1.6rem",
          cursor: "pointer",
          boxShadow: isAudioPlaying
            ? "0 0 0 6px rgba(239,68,68,0.22), 0 8px 24px rgba(0,0,0,0.24)"
            : "0 8px 24px rgba(124,58,237,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isAudioPlaying ? "⏹" : "🔊"}
      </button>

      {/* Background floating dots */}
      {[
        { top: "8%", left: "3%", color: "rgba(255,180,200,0.5)", size: 50, delay: 0 },
        { top: "20%", right: "4%", color: "rgba(160,200,255,0.5)", size: 40, delay: 1 },
        { top: "45%", left: "1%", color: "rgba(180,255,200,0.45)", size: 35, delay: 2 },
        { top: "65%", right: "2%", color: "rgba(255,230,130,0.5)", size: 55, delay: 0.5 },
        { bottom: "15%", left: "5%", color: "rgba(210,180,255,0.5)", size: 45, delay: 1.5 },
        { bottom: "8%", right: "6%", color: "rgba(255,190,140,0.45)", size: 38, delay: 3 },
        { top: "35%", right: "0%", color: "rgba(180,255,240,0.4)", size: 65, delay: 0.8 },
      ].map((d, i) => <Dot key={i} style={{ top: d.top, left: d.left, right: d.right, bottom: d.bottom }} color={d.color} size={d.size} delay={d.delay} />)}

      {/* ── Page body ── */}
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "40px 20px 60px" }}>

        {/* Welcome banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ textAlign: "center", marginBottom: 52, position: "relative" }}
        >
          {/* Decorative floating emojis near heading */}
          <motion.span animate={{ y: [0,-12,0], rotate: [0,10,-10,0] }} transition={{ duration: 3, repeat: Infinity }} style={{ position: "absolute", top: -10, left: "10%", fontSize: 36, pointerEvents: "none" }}>🌟</motion.span>
          <motion.span animate={{ y: [0,-10,0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 1 }} style={{ position: "absolute", top: -8, right: "10%", fontSize: 32, pointerEvents: "none" }}>✨</motion.span>

         

          <h1 style={{ fontWeight: 900, fontSize: "clamp(2rem, 5vw, 3.2rem)", color: "#1a1035", margin: "0 0 16px", lineHeight: 1.2, textShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            එන්න අපි සෙල්ලම් කරමු  ! 🎉
          </h1>
          <p style={{ color: "#6b6080", fontSize: "clamp(0.95rem, 2.5vw, 1.15rem)", maxWidth: 520, margin: "0 auto", lineHeight: 1.7, fontWeight: 600 }}>
            ඔබ කැමති ඉගෙනීමේ ඒකකය තෝරාගෙන ක්‍රීඩා ආරම්භ කරන්න. <br />
            
          </p>
        </motion.div>



        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}
        >
          <div style={{ height: 4, flex: 1, borderRadius: 2, background: "linear-gradient(90deg, transparent, rgba(196,75,232,0.25))" }} />
          <span style={{ fontWeight: 900, fontSize: "1.05rem", color: "#7952b3", whiteSpace: "nowrap" }}>🎮 ඉගෙනුම් ඒකක</span>
          <div style={{ height: 4, flex: 1, borderRadius: 2, background: "linear-gradient(90deg, rgba(196,75,232,0.25), transparent)" }} />
        </motion.div>

        {/* Module Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18, marginBottom: 60 }}>
          {MODULES.map((mod, i) => (
            <ModuleCard
              key={mod.id}
              mod={mod.id === 1 ? { ...mod, liveOverview: dyslexiaOverview } : mod}
              index={i}
              onNavigate={navigate}
            />
          ))}
        </div>

        {/* Footer tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          style={{ textAlign: "center", padding: "20px 0" }}
        >
          
        </motion.div>
      </div>
    </div>
  );
};

export default ModuleSelection;
