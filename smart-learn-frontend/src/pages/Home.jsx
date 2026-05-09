import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useAuth from "../hooks/useAuth";
import logoImg from "../assets/images/logo without back.png";

/* ── Floating element wrapper ── */
const Float = ({ children, style, y = 20, duration = 5, delay = 0 }) => (
  <motion.div
    animate={{ y: [0, -y, 0] }}
    transition={{ duration, repeat: Infinity, delay, ease: "easeInOut" }}
    style={{ position: "absolute", pointerEvents: "none", userSelect: "none", ...style }}
  >
    {children}
  </motion.div>
);

/* ── SVG Cloud ── */
const Cloud = ({ width = 120, color = "rgba(255,255,255,0.85)", style }) => (
  <svg width={width} height={width * 0.55} viewBox="0 0 120 66" style={style}>
    <ellipse cx="60" cy="42" rx="50" ry="24" fill={color} />
    <ellipse cx="38" cy="36" rx="28" ry="22" fill={color} />
    <ellipse cx="78" cy="34" rx="24" ry="20" fill={color} />
    <ellipse cx="58" cy="28" rx="22" ry="18" fill={color} />
  </svg>
);

/* ── Bubble ── */
const Bubble = ({ size, color, style, delay = 0 }) => (
  <motion.div
    animate={{ y: [0, -25, 0], scale: [1, 1.12, 1], opacity: [0.5, 0.9, 0.5] }}
    transition={{ duration: 3.5 + size / 35, repeat: Infinity, delay, ease: "easeInOut" }}
    style={{ position: "absolute", width: size, height: size, borderRadius: "50%", background: color, border: "2px solid rgba(255,255,255,0.6)", pointerEvents: "none", ...style }}
  />
);

/* ── Spinning star ── */
const SpinningStar = ({ size = 28, color = "#FFD166", style, delay = 0 }) => (
  <motion.div
    animate={{ rotate: [0, 360], scale: [1, 1.25, 1] }}
    transition={{ rotate: { duration: 8, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity, delay } }}
    style={{ position: "absolute", pointerEvents: "none", ...style }}
  >
    <svg width={size} height={size} viewBox="0 0 24 24">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill={color} stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" />
    </svg>
  </motion.div>
);

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const handleStart = () => navigate(isAuthenticated ? "/modules" : "/login");

  return (
    <div style={{ minHeight: "100vh", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", fontFamily: "'Nunito', 'Poppins', Arial, sans-serif", background: "linear-gradient(160deg, #FFF1C9 0%, #FFD6A5 25%, #FFAFCC 55%, #C3B1E1 80%, #B5EAD7 100%)" }}>

      {/* Glow overlays */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "55vw", height: "55vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,220,130,0.35) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-15%", right: "-10%", width: "60vw", height: "60vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(200,180,255,0.3) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", top: "40%", left: "50%", width: "40vw", height: "40vw", transform: "translate(-50%,-50%)", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,175,204,0.25) 0%, transparent 70%)" }} />
      </div>

      {/* Clouds */}
      <Float style={{ top: "6%", left: "-2%" }} y={12} duration={7}><Cloud width={160} color="rgba(255,255,255,0.75)" /></Float>
      <Float style={{ top: "12%", right: "-3%" }} y={10} duration={8} delay={1.5}><Cloud width={130} color="rgba(255,255,255,0.65)" /></Float>
      <Float style={{ top: "2%", left: "30%" }} y={8} duration={9} delay={3}><Cloud width={100} color="rgba(255,255,255,0.5)" /></Float>
      <Float style={{ bottom: "8%", left: "5%" }} y={10} duration={7.5} delay={0.5}><Cloud width={110} color="rgba(255,255,255,0.55)" /></Float>
      <Float style={{ bottom: "4%", right: "8%" }} y={12} duration={6.5} delay={2}><Cloud width={140} color="rgba(255,255,255,0.6)" /></Float>

      {/* Stars */}
      <SpinningStar size={32} color="#FFD166" style={{ top: "18%", left: "8%" }} delay={0} />
      <SpinningStar size={24} color="#FF6B9D" style={{ top: "28%", right: "10%" }} delay={1} />
      <SpinningStar size={28} color="#A0E7E5" style={{ bottom: "22%", left: "12%" }} delay={2} />
      <SpinningStar size={20} color="#B5EAD7" style={{ top: "65%", right: "8%" }} delay={0.5} />
      <SpinningStar size={36} color="#FFD166" style={{ bottom: "30%", right: "18%" }} delay={1.5} />
      <SpinningStar size={22} color="#C3B1E1" style={{ top: "45%", left: "6%" }} delay={3} />

      {/* Floating emojis */}
      <Float style={{ top: "20%", left: "4%", fontSize: 38 }} y={18} duration={4.5} delay={0.2}>🌈</Float>
      <Float style={{ top: "15%", right: "5%", fontSize: 34 }} y={14} duration={5} delay={1.2}>🎈</Float>
      <Float style={{ bottom: "25%", left: "3%", fontSize: 32 }} y={16} duration={6} delay={2.5}>🌸</Float>
      <Float style={{ bottom: "18%", right: "4%", fontSize: 36 }} y={20} duration={4.8} delay={0.8}>✨</Float>
      <Float style={{ top: "50%", left: "2%", fontSize: 30 }} y={12} duration={5.5} delay={3.5}>🦋</Float>
      <Float style={{ top: "55%", right: "3%", fontSize: 28 }} y={15} duration={4.2} delay={1.8}>🌟</Float>
      <Float style={{ top: "80%", left: "20%", fontSize: 26 }} y={10} duration={5.8} delay={4}>🍀</Float>
      <Float style={{ top: "8%", right: "30%", fontSize: 24 }} y={14} duration={6.2} delay={0.4}>⭐</Float>

      {/* Bubbles */}
      <Bubble size={60} color="rgba(255,175,204,0.45)" style={{ top: "30%", left: "2%" }} delay={0} />
      <Bubble size={44} color="rgba(165,216,255,0.5)" style={{ top: "60%", right: "3%" }} delay={1} />
      <Bubble size={36} color="rgba(181,234,215,0.55)" style={{ bottom: "35%", left: "7%" }} delay={2} />
      <Bubble size={52} color="rgba(255,220,130,0.45)" style={{ top: "42%", right: "2%" }} delay={0.5} />
      <Bubble size={28} color="rgba(195,177,225,0.6)" style={{ bottom: "15%", right: "20%" }} delay={3} />

      {/* Geometric shapes */}
      <Float style={{ top: "35%", right: "3%" }} y={15} duration={5} delay={1}>
        <svg width="48" height="48" viewBox="0 0 48 48"><rect x="6" y="6" width="36" height="36" rx="10" fill="rgba(255,182,193,0.6)" stroke="rgba(255,255,255,0.7)" strokeWidth="2" /></svg>
      </Float>
      <Float style={{ top: "70%", right: "4%" }} y={18} duration={6} delay={2.5}>
        <svg width="40" height="40" viewBox="0 0 40 40"><polygon points="20,2 38,38 2,38" fill="rgba(160,231,229,0.6)" stroke="rgba(255,255,255,0.6)" strokeWidth="2" /></svg>
      </Float>
      <Float style={{ top: "15%", left: "0%" }} y={14} duration={5.5} delay={1.8}>
        <svg width="44" height="44" viewBox="0 0 44 44"><rect x="6" y="6" width="32" height="32" rx="16" fill="rgba(195,177,225,0.55)" stroke="rgba(255,255,255,0.6)" strokeWidth="2" /></svg>
      </Float>

      {/* CENTER CONTENT */}
      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "20px 24px", maxWidth: 560, width: "100%" }}>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: -30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.85, type: "spring", stiffness: 160, damping: 18 }}
          style={{ marginBottom: 8 }}
        >
          <img src={logoImg} alt="Smart Learn" style={{ width: "clamp(140px, 28vw, 220px)", filter: "drop-shadow(0 8px 28px rgba(0,0,0,0.18)) drop-shadow(0 2px 8px rgba(255,150,100,0.25))" }} />
        </motion.div>

        {/* App name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          style={{ fontSize: "clamp(2.4rem, 7vw, 3.6rem)", fontWeight: 900, margin: "0 0 10px", background: "linear-gradient(135deg, #d63384, #7952b3, #0d6efd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", lineHeight: 1.1 }}
        >
          Smart Learn
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          style={{ fontSize: "clamp(1.05rem, 3vw, 1.3rem)", fontWeight: 700, color: "#5a4a6a", margin: "0 0 40px", lineHeight: 1.55, textShadow: "0 1px 4px rgba(255,255,255,0.8)" }}
        >
          ක්‍රීඩාවෙන් ඉගෙන ගනිමු! 🎉
          <br />
          <span style={{ fontWeight: 600, fontSize: "0.9em", color: "#7a6a8a" }}>සෑම දරුවෙකුටම සුදුසු විනෝදජනක ඉගෙනීමකි</span>
        </motion.p>

        {/* Start Learning Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.55, type: "spring", stiffness: 200, damping: 16 }}
          whileHover={{ scale: 1.08, y: -4, boxShadow: "0 20px 50px rgba(214,51,132,0.45)" }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStart}
          style={{ background: "linear-gradient(135deg, #FF6B9D 0%, #C44BE8 50%, #7C3AED 100%)", color: "#fff", border: "none", borderRadius: 60, padding: "18px 56px", fontSize: "clamp(1.1rem, 3vw, 1.35rem)", fontWeight: 900, cursor: "pointer", boxShadow: "0 12px 40px rgba(196,75,232,0.4), 0 4px 16px rgba(0,0,0,0.1)", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 12, position: "relative", overflow: "hidden" }}
        >
          <motion.div animate={{ x: ["-120%", "220%"] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }} style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)", width: "60%", pointerEvents: "none" }} />
          <span style={{ fontSize: "1.4em" }}>🚀</span>
          <span>ඉගෙනීම ආරම්භ කරන්න</span>
        </motion.button>

        {/* Sub hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          style={{ marginTop: 20, fontSize: "0.88rem", color: "#8a7a9a", fontWeight: 600 }}
        >
          ✅ නොමිලේ &nbsp;·&nbsp; 🔒 ආරක්ෂිත &nbsp;·&nbsp; 🎮 විනෝදජනක
        </motion.p>
      </div>

      {/* Corner animals */}
      <motion.div animate={{ y: [0, -14, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }} style={{ position: "absolute", bottom: 20, left: 20, fontSize: 52, pointerEvents: "none" }}>🐘</motion.div>
      <motion.div animate={{ y: [0, -18, 0], rotate: [0, -6, 6, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.8 }} style={{ position: "absolute", bottom: 20, right: 20, fontSize: 48, pointerEvents: "none" }}>🦒</motion.div>
      <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 1.5 }} style={{ position: "absolute", bottom: 24, left: "42%", fontSize: 40, pointerEvents: "none" }}>🦋</motion.div>
    </div>
  );
};

export default Home;
