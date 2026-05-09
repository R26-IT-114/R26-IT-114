import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useAuth from "../hooks/useAuth";
import logoImg from "../assets/images/logo without back.png";

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
  },
  {
    id: 4,
    title: "අමතකය වර්ධනය කරමු",
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
  const { title, description, path, Icon, gradient, shadowColor, badge, badgeBg, numeral } = mod;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.88 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.15 + index * 0.13, type: "spring", stiffness: 180, damping: 20 }}
      whileHover={{ y: -10, scale: 1.03, boxShadow: `0 24px 60px ${shadowColor}` }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onNavigate(path)}
      style={{
        background: "#fff",
        borderRadius: 28,
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: `0 8px 32px ${shadowColor}, 0 2px 8px rgba(0,0,0,0.06)`,
        display: "flex",
        flexDirection: "column",
        border: "2px solid rgba(255,255,255,0.8)",
        position: "relative",
      }}
    >
      {/* Card top colored band with icon */}
      <div style={{ background: gradient, padding: "32px 28px 28px", position: "relative", overflow: "hidden" }}>
        {/* Shine sweep */}
        <motion.div
          animate={{ x: ["-120%", "240%"] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut", delay: index * 0.5 }}
          style={{ position: "absolute", top: 0, left: 0, width: "50%", height: "100%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)", transform: "skewX(-12deg)", pointerEvents: "none" }}
        />

        {/* Badge */}
        <div style={{ position: "absolute", top: 14, right: 14, background: badgeBg, backdropFilter: "blur(8px)", borderRadius: 50, padding: "4px 12px", fontSize: "0.7rem", fontWeight: 800, color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}>
          {badge}
        </div>

        {/* Numeral */}
        <div style={{ position: "absolute", bottom: 12, right: 18, fontWeight: 900, fontSize: "3.5rem", color: "rgba(255,255,255,0.12)", lineHeight: 1, fontFamily: "Poppins, Arial, sans-serif", userSelect: "none" }}>
          {numeral}
        </div>

        {/* Icon */}
        <motion.div
          animate={{ rotate: [0, 4, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: index * 0.4 }}
          style={{ display: "inline-block", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.2))" }}
        >
          <Icon />
        </motion.div>

        {/* Title */}
        <h2 style={{ color: "#fff", fontWeight: 900, fontSize: "clamp(1.3rem, 3vw, 1.6rem)", margin: "18px 0 0", textShadow: "0 2px 10px rgba(0,0,0,0.25)", fontFamily: "'Nunito', 'Poppins', Arial, sans-serif", lineHeight: 1.2 }}>
          {title}
        </h2>
      </div>

      {/* Card bottom — description + CTA */}
      <div style={{ padding: "20px 24px 22px", display: "flex", flexDirection: "column", gap: 16, flexGrow: 1 }}>
        <p style={{ color: "#555", fontSize: "clamp(0.88rem, 2vw, 0.98rem)", lineHeight: 1.65, margin: 0, fontWeight: 600 }}>
          {description}
        </p>

        {/* Play button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ background: gradient, color: "#fff", borderRadius: 50, padding: "12px 24px", fontWeight: 800, fontSize: "0.95rem", display: "inline-flex", alignItems: "center", gap: 8, alignSelf: "flex-start", boxShadow: `0 6px 20px ${shadowColor}`, fontFamily: "inherit", cursor: "pointer" }}
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const canManage = user?.role === "therapist" || user?.role === "admin";
  const firstName = user?.displayName?.split(" ")[0] || "ශිෂ්‍ය";

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #f0f4ff 0%, #fce4f8 35%, #fff9e6 70%, #e4fdf0 100%)", fontFamily: "'Nunito', 'Poppins', Arial, sans-serif", position: "relative", overflowX: "hidden" }}>

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

      {/* ── Top Navigation Bar ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.78)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", borderBottom: "1.5px solid rgba(255,255,255,0.7)", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo + name */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => navigate("/")}>
            <img src={logoImg} alt="Smart Learn" style={{ height: 42, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.12))" }} />
            <span style={{ fontWeight: 900, fontSize: "1.3rem", background: "linear-gradient(135deg, #d63384, #7952b3)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Smart Learn</span>
          </div>

          {/* User greeting */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {canManage && (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} onClick={() => navigate("/admin/recommendations")}
                style={{ background: "linear-gradient(135deg, #4776e6, #8e54e9)", color: "#fff", border: "none", borderRadius: 50, padding: "8px 20px", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer", fontFamily: "inherit" }}>
                ⚙️ Admin
              </motion.button>
            )}
            <div style={{ background: "linear-gradient(135deg, #FF6B9D, #C44BE8)", borderRadius: 50, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", boxShadow: "0 4px 14px rgba(196,75,232,0.35)" }}>
              👤
            </div>
          </div>
        </div>
      </motion.header>

      {/* ── Page body ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px 60px" }}>

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

          {/* Greeting chip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg, #FF6B9D22, #C44BE822)", border: "1.5px solid rgba(196,75,232,0.3)", borderRadius: 50, padding: "8px 22px", marginBottom: 20 }}
          >
            <span style={{ fontSize: "1.2rem" }}>👋</span>
            <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#8841c8" }}>ආයුබෝවන්, {firstName}!</span>
          </motion.div>

          <h1 style={{ fontWeight: 900, fontSize: "clamp(2rem, 5vw, 3.2rem)", color: "#1a1035", margin: "0 0 16px", lineHeight: 1.2, textShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            අද ඉගෙනගන්න ඇරඹෙමු! 🎉
          </h1>
          <p style={{ color: "#6b6080", fontSize: "clamp(0.95rem, 2.5vw, 1.15rem)", maxWidth: 520, margin: "0 auto", lineHeight: 1.7, fontWeight: 600 }}>
            ඔබ කැමති ඉගෙනීමේ ඒකකය තෝරාගෙන ක්‍රීඩා ආරම්භ කරන්න. 🚀<br />
            <span style={{ color: "#a080c0", fontSize: "0.9em" }}>ඒකෙ ළමා ශූරතාව ඔබ ළඟ තිබෙනවා!</span>
          </p>
        </motion.div>

        {/* Progress badges row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}
        >
          {[
            { emoji: "⚡", label: "ශක්ති ලකුණු", value: "0", color: "#FF6B9D" },
            { emoji: "⭐", label: "ජ්‍යෝති", value: "0", color: "#FFB800" },
            { emoji: "🔥", label: "දිනක් ගත", value: "1", color: "#FF5722" },
            { emoji: "🏆", label: "ත්‍යාග", value: "0", color: "#8e54e9" },
          ].map(({ emoji, label, value, color }) => (
            <motion.div
              key={label}
              whileHover={{ y: -4, scale: 1.06 }}
              style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", border: `2px solid ${color}33`, borderRadius: 18, padding: "12px 22px", textAlign: "center", minWidth: 90, boxShadow: `0 4px 18px ${color}22` }}
            >
              <div style={{ fontSize: "1.5rem" }}>{emoji}</div>
              <div style={{ fontWeight: 900, fontSize: "1.3rem", color: color }}>{value}</div>
              <div style={{ fontSize: "0.72rem", color: "#888", fontWeight: 700 }}>{label}</div>
            </motion.div>
          ))}
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 28, marginBottom: 60 }}>
          {MODULES.map((mod, i) => (
            <ModuleCard key={mod.id} mod={mod} index={i} onNavigate={navigate} />
          ))}
        </div>

        {/* Footer tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          style={{ textAlign: "center", padding: "20px 0" }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", border: "1.5px solid rgba(196,75,232,0.2)", borderRadius: 50, padding: "12px 28px" }}>
            <span style={{ fontSize: "1.3rem" }}>💬</span>
            <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#7952b3" }}>ඔබේ ඉගෙනීමේ ගමන නිරන්තරව දිගු කරන්න! 🌈</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ModuleSelection;
