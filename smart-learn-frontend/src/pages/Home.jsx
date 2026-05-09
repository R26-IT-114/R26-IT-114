import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuth from '../hooks/useAuth';
import logoImg from '../assets/images/logo without back.png';

/* ── Floating background element ── */
const FloatEl = ({ children, style, duration = 4, delay = 0 }) => (
  <motion.div
    animate={{ y: [0, -18, 0] }}
    transition={{ duration, repeat: Infinity, delay, ease: 'easeInOut' }}
    style={{ position: 'absolute', pointerEvents: 'none', userSelect: 'none', ...style }}
  >
    {children}
  </motion.div>
);

/* ── Wave SVG ── */
const Wave = ({ fill = '#ffffff', flip = false }) => (
  <div style={{ lineHeight: 0, transform: flip ? 'scaleY(-1)' : 'none' }}>
    <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
      <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill={fill} />
    </svg>
  </div>
);

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ fontFamily: "'Nunito', 'Poppins', Arial, sans-serif", overflowX: 'hidden' }}>

      {/* ══════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════ */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 30%, #f093fb 60%, #f5576c 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px 40px',
        overflow: 'hidden',
      }}>
        {/* Floating background blobs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <FloatEl style={{ top: '8%', left: '5%', fontSize: 60, opacity: 0.25 }} duration={5} delay={0}>🌿</FloatEl>
          <FloatEl style={{ top: '15%', right: '8%', fontSize: 50, opacity: 0.3 }} duration={4} delay={1}>⭐</FloatEl>
          <FloatEl style={{ top: '40%', left: '3%', fontSize: 45, opacity: 0.2 }} duration={6} delay={2}>🍃</FloatEl>
          <FloatEl style={{ top: '60%', right: '5%', fontSize: 55, opacity: 0.25 }} duration={5} delay={0.5}>🌸</FloatEl>
          <FloatEl style={{ bottom: '20%', left: '10%', fontSize: 65, opacity: 0.2 }} duration={4.5} delay={1.5}>🦋</FloatEl>
          <FloatEl style={{ top: '25%', left: '18%', fontSize: 40, opacity: 0.3 }} duration={3.5} delay={0.8}>✨</FloatEl>
          <FloatEl style={{ bottom: '30%', right: '12%', fontSize: 48, opacity: 0.25 }} duration={5.5} delay={2.5}>🌟</FloatEl>
          <FloatEl style={{ top: '70%', left: '40%', fontSize: 35, opacity: 0.2 }} duration={4} delay={3}>🍀</FloatEl>
          {/* Glowing circles */}
          <div style={{ position: 'absolute', top: '10%', right: '20%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', bottom: '15%', left: '15%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,200,100,0.08)', filter: 'blur(80px)' }} />
        </div>

        {/* Logo */}
        <motion.img
          src={logoImg}
          alt='SmartLearn logo'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          style={{ width: 'clamp(140px, 22vw, 220px)', marginBottom: 8, filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.25))' }}
        />

        {/* Mascot */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          style={{ fontSize: 120, marginBottom: 16, filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.3))' }}
        >
          🦁
        </motion.div>

        {/* Floating animals around mascot */}
        <div style={{ position: 'absolute', top: '12%', left: '22%' }}>
          <motion.span animate={{ rotate: [0, 15, -15, 0], y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }} style={{ fontSize: 48, display: 'block' }}>🦜</motion.span>
        </div>
        <div style={{ position: 'absolute', top: '18%', right: '22%' }}>
          <motion.span animate={{ rotate: [0, -10, 10, 0], y: [0, -8, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 1 }} style={{ fontSize: 44, display: 'block' }}>🐢</motion.span>
        </div>
        <div style={{ position: 'absolute', top: '35%', right: '15%' }}>
          <motion.span animate={{ y: [0, -12, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }} style={{ fontSize: 40, display: 'block' }}>🦊</motion.span>
        </div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          style={{
            color: '#fff',
            fontSize: 'clamp(2.2rem, 7vw, 4.5rem)',
            fontWeight: 900,
            textAlign: 'center',
            margin: '0 0 16px',
            textShadow: '0 4px 20px rgba(0,0,0,0.25)',
            lineHeight: 1.15,
            maxWidth: 700,
          }}
        >
          ක්‍රීඩාවෙන් ඉගෙන ගනිමු! 🎉
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          style={{
            color: 'rgba(255,255,255,0.92)',
            fontSize: 'clamp(1rem, 3vw, 1.35rem)',
            textAlign: 'center',
            maxWidth: 560,
            marginBottom: 40,
            lineHeight: 1.6,
          }}
        >
          සෑම දරුවෙකුටම සුදුසු විනෝදජනක අධ්‍යාපනික ක්‍රීඩා — ඩිස්ලෙක්සියා, ඩිස්කැල්කුලියා, ඩිස්ග්‍රැෆියා සහ වැඩකරන මතකය සඳහා.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 60 }}
        >
          <Link to={isAuthenticated ? '/modules' : '/register'}>
            <motion.div
              whileHover={{ scale: 1.07, y: -3 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: 'linear-gradient(135deg, #FFD166, #FF6B6B)',
                color: '#1a0a00',
                fontWeight: 900,
                fontSize: '1.15rem',
                padding: '16px 40px',
                borderRadius: 50,
                boxShadow: '0 8px 32px rgba(255,107,107,0.45)',
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              🚀 දැන් ඉගෙනීම ආරම්භ කරන්න
            </motion.div>
          </Link>
          <Link to="/login">
            <motion.div
              whileHover={{ scale: 1.07, y: -3 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(12px)',
                color: '#fff',
                fontWeight: 800,
                fontSize: '1.1rem',
                padding: '16px 40px',
                borderRadius: 50,
                border: '2px solid rgba(255,255,255,0.5)',
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              🔑 Sign In
            </motion.div>
          </Link>
        </motion.div>

        {/* Stats cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 2 }}
        >
          {[
            { emoji: '🎮', num: '4', label: 'ඉගෙනුම් ඒකක' },
            { emoji: '🧠', num: '100+', label: 'විනෝදජනක ක්‍රියාකාරකම්' },
            { emoji: '⭐', num: '5K+', label: 'සතුටු දරුවන්' },
            { emoji: '🏆', num: '98%', label: 'දෙමාපිය අනුමැතිය' },
          ].map(({ emoji, num, label }) => (
            <motion.div
              key={label}
              whileHover={{ y: -5, scale: 1.05 }}
              style={{
                background: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(16px)',
                border: '1.5px solid rgba(255,255,255,0.35)',
                borderRadius: 20,
                padding: '16px 24px',
                textAlign: 'center',
                minWidth: 110,
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 4 }}>{emoji}</div>
              <div style={{ color: '#fff', fontWeight: 900, fontSize: '1.5rem' }}>{num}</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontWeight: 600 }}>{label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ position: 'absolute', bottom: 100, color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', textAlign: 'center' }}
        >
          ↓ තව දැන ගැනීමට පහළ අනුචලනය කරන්න
        </motion.div>
      </section>

      <Wave fill="#fff" />

      {/* ══════════════════════════════════════════════
          FEATURES SECTION
      ══════════════════════════════════════════════ */}
      <section style={{ background: '#fff', padding: '80px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: 60 }}
          >
            <span style={{ background: '#FFE8F0', color: '#E8567A', borderRadius: 50, padding: '6px 20px', fontWeight: 800, fontSize: '0.9rem' }}>✨ ස්මාට්ලර්න් ඇයි?</span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, color: '#1a1a2e', marginTop: 16, marginBottom: 12 }}>
              ඉගෙනීම <span style={{ color: '#7C3AED' }}>විශ්මිත</span> කළා 🌈
            </h2>
            <p style={{ color: '#6b7280', fontSize: '1.1rem', maxWidth: 520, margin: '0 auto' }}>
              සෑම දරුවෙකුම ඉගෙන ගන්නේ වෙනස් ආකාරයකින්. අපගේ වේදිකාව සෑම දරුවෙකුගේ අද්විතීය අවශ්‍යතාවලට අනුගත වේ.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 28 }}>
            {[
              { emoji: '🎯', title: 'පුද්ගලීකරණය කළ මාර්ගය', desc: 'සෑම දරුවෙකුගේ ඉගෙනීමේ වේගයට හා රටාවට අනුගත AI ක්‍රියාකාරකම්.', bg: 'linear-gradient(135deg, #667eea22, #764ba222)', border: '#667eea' },
              { emoji: '🎵', title: 'බහු-සංවේදී ඉගෙනීම', desc: 'ශබ්දය, දෘශ්‍යය සහ ස්පර්ශය එකට ක්‍රියා කරමින් ගැඹුරු අවබෝධයක් ලබා දේ.', bg: 'linear-gradient(135deg, #f093fb22, #f5576c22)', border: '#f5576c' },
              { emoji: '🏅', title: 'ත්‍යාග පද්ධතිය', desc: 'තරු, බැජ් සහ සෙල්ලම් දරුවන් සෑම දිනකම දිරිගන්වමින් තබා ගනී.', bg: 'linear-gradient(135deg, #4facfe22, #00f2fe22)', border: '#4facfe' },
              { emoji: '👨‍👩‍👧', title: 'දෙමාපිය උපකරණ පුවරුව', desc: 'ඔබේ දරුවාගේ ප්‍රගතිය නිරීක්ෂණය කරන්න සහ සන්ධිස්ථාන සමරන්න.', bg: 'linear-gradient(135deg, #43e97b22, #38f9d722)', border: '#43e97b' },
              { emoji: '🔒', title: 'ආරක්ෂිත පරිසරය', desc: 'දැන්වීම් නැති, අවධානය වෙනතකට යොමු කරන දේ නැති, පිරිසිදු ඉගෙනීමක් සඳහා.', bg: 'linear-gradient(135deg, #fa709a22, #fee14022)', border: '#fa709a' },
              { emoji: '📱', title: 'ඕනෑම තැනකින් ක්‍රියා කරයි', desc: 'ජංගම දුරකථනය, ටැබ්ලටය හෝ ඩෙස්ක්ටොප් — ඕනෑම උපාංගයකින් ඉගෙනෙන්න.', bg: 'linear-gradient(135deg, #a18cd122, #fbc2eb22)', border: '#a18cd1' },
            ].map(({ emoji, title, desc, bg, border }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -8, boxShadow: `0 20px 40px ${border}44` }}
                style={{
                  background: bg,
                  border: `2px solid ${border}55`,
                  borderRadius: 24,
                  padding: '32px 24px',
                  cursor: 'default',
                  transition: 'box-shadow 0.3s',
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>{emoji}</div>
                <h3 style={{ color: '#1a1a2e', fontWeight: 800, fontSize: '1.15rem', marginBottom: 8 }}>{title}</h3>
                <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.6 }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Wave fill="#f0f9ff" flip />
      {/* ══════════════════════════════════════════════
          MODULES PREVIEW
      ══════════════════════════════════════════════ */}
      <section style={{ background: '#f0f9ff', padding: '80px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 60 }}
          >
            <span style={{ background: '#E0F2FE', color: '#0369A1', borderRadius: 50, padding: '6px 20px', fontWeight: 800, fontSize: '0.9rem' }}>🎮 ඉගෙනුම් ඒකක</span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, color: '#1a1a2e', marginTop: 16, marginBottom: 12 }}>
              ඔබේ වික්‍රමාන්විතය තෝරන්න 🗺️
            </h2>
            <p style={{ color: '#6b7280', fontSize: '1.1rem', maxWidth: 520, margin: '0 auto' }}>
              සෑම ඒකකයක්ම විශේෂ ඉගෙනීමේ ශක්තියක් සඳහා නිර්මාණය කළ ලෝකයකි.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 28 }}>
            {[
              { emoji: '📚', title: 'ඩිස්ලෙක්සියා', desc: 'අකුරු ගැළපීම, ශබ්ද හා කියවීමේ ක්‍රීඩා', bg: 'linear-gradient(135deg, #52B788, #74C69D)', path: '/dyslexia', badge: '🌟 ජනප්‍රිය' },
              { emoji: '🔢', title: 'ඩිස්කැල්කුලියා', desc: 'සංඛ්‍යා ක්‍රීඩා, ගැනීම් හා ගණිත ප්‍රහේලිකා', bg: 'linear-gradient(135deg, #f77f00, #fca311)', path: '/dyscalculia', badge: '🔥 විනෝදජනක' },
              { emoji: '✏️', title: 'ඩිස්ග්‍රැෆියා', desc: 'ලිවීම, ඇඳීම හා සියුම් මෝටර් ක්‍රියාකාරකම්', bg: 'linear-gradient(135deg, #e63946, #f4a261)', path: '/dysgraphia', badge: '🎨 නිර්මාණශීලී' },
              { emoji: '🧠', title: 'වැඩකරන මතකය', desc: 'අවධානය, ඇල්ම හා මතක ශිල්පීය ක්‍රීඩා', bg: 'linear-gradient(135deg, #4361ee, #4cc9f0)', path: '/working-memory', badge: '💡 බුද්ධිමත්' },
            ].map(({ emoji, title, desc, bg, path, badge }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                whileHover={{ y: -10, scale: 1.03 }}
              >
                <Link to={path} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: bg,
                    borderRadius: 28,
                    padding: '36px 24px',
                    color: '#fff',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                  }}>
                    <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)', borderRadius: 50, padding: '4px 12px', fontSize: '0.75rem', fontWeight: 700 }}>{badge}</div>
                    <div style={{ fontSize: 64, marginBottom: 16, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}>{emoji}</div>
                    <h3 style={{ fontWeight: 900, fontSize: '1.4rem', marginBottom: 8 }}>{title}</h3>
                    <p style={{ opacity: 0.9, fontSize: '0.95rem', lineHeight: 1.5, marginBottom: 20 }}>{desc}</p>
                    <div style={{
                      background: 'rgba(255,255,255,0.25)',
                      backdropFilter: 'blur(8px)',
                      border: '2px solid rgba(255,255,255,0.4)',
                      borderRadius: 50,
                      padding: '10px 24px',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      display: 'inline-block',
                    }}>
                      දැන් සෙල්ලම් කරන්න →
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Wave fill="#fff" />

      {/* ══════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════ */}
      <section style={{ background: '#fff', padding: '80px 20px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 60 }}
          >
            <span style={{ background: '#FFF7ED', color: '#C2410C', borderRadius: 50, padding: '6px 20px', fontWeight: 800, fontSize: '0.9rem' }}>💬 දෙමාපියන් කියන දේ</span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, color: '#1a1a2e', marginTop: 16 }}>
              වර්ධනයේ කතා 🌱
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {[
              { text: '"මගේ දුව කියවීමෙදී ගැටලු ගොඩාක් ඇති කළා. ස්මාට්ලර්න් සති 2ක් ගත් පසු ඇය සම්පූර්ණ වාක්‍ය කියවනවා! ක්‍රීඩා නිසා ඒ සියල්ල සැලසුම් ගත වුණා."', name: 'සාරා එම්.', role: 'අවුරුදු 7 ළමයාගේ මව', emoji: '👩', stars: '⭐⭐⭐⭐⭐' },
              { text: '"ඩිස්කැල්කුලියා ඒකකය ඉතා විශිෂ්ටයි. මගේ පුතා ඉලක්කම් ඔහුට ගැළපෙන ආකාරයකින් අවසානයේ තේරුම් ගත්තා. සජීවීකරණ එතරම් ආකර්ෂණීයයි!"', name: 'ඩේවිඩ් කේ.', role: 'අවුරුදු 9 ළමයාගේ පියා', emoji: '👨', stars: '⭐⭐⭐⭐⭐' },
              { text: '"චිකිත්සකයෙකු ලෙස, මම ස්මාට්ලර්න් මගේ සියලු කුඩා රෝගීන්ට නිර්දේශ කරනවා. අනුකූලන ප්‍රවේශය සෑම දරුවෙකුගේ මට්ටමට ඇත්තෙන්ම ලඟා වේ."', name: 'වෛද්‍ය ප්‍රියා ආර්.', role: 'ළමා චිකිත්සක', emoji: '👩‍⚕️', stars: '⭐⭐⭐⭐⭐' },
            ].map(({ text, name, role, emoji, stars }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -6 }}
                style={{
                  background: 'linear-gradient(135deg, #f8f0ff, #fff0f8)',
                  border: '2px solid #e9d5ff',
                  borderRadius: 24,
                  padding: '32px 28px',
                  boxShadow: '0 8px 32px rgba(139,92,246,0.1)',
                }}
              >
                <div style={{ fontSize: '1rem', color: '#6b7280', lineHeight: 1.7, marginBottom: 24, fontStyle: 'italic' }}>{text}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 40 }}>{emoji}</div>
                  <div>
                    <div style={{ fontWeight: 800, color: '#1a1a2e' }}>{name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#7C3AED' }}>{role}</div>
                    <div style={{ fontSize: '0.85rem' }}>{stars}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CTA SECTION
      ══════════════════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 50%, #0EA5E9 100%)',
        padding: '100px 20px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <FloatEl style={{ top: '10%', left: '5%', fontSize: 50, opacity: 0.2 }} duration={4}>🌟</FloatEl>
        <FloatEl style={{ top: '20%', right: '8%', fontSize: 55, opacity: 0.2 }} duration={5} delay={1}>✨</FloatEl>
        <FloatEl style={{ bottom: '15%', left: '15%', fontSize: 45, opacity: 0.2 }} duration={4.5} delay={2}>🎈</FloatEl>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 180 }}
        >
          <div style={{ fontSize: 80, marginBottom: 20 }}>🚀</div>
          <h2 style={{ color: '#fff', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, marginBottom: 20, textShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            වික්‍රමාන්විතය ආරම්භ කිරීමට සූදානම්ද?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.2rem', maxWidth: 500, margin: '0 auto 40px' }}>
            සෑම දිනකම ඉගෙනීමේ සතුට සොයා ගන්නා දහස් ගණනක් දරුවන් සමඟ එක් වන්න!
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register">
              <motion.div
                whileHover={{ scale: 1.08, y: -3 }}
                whileTap={{ scale: 0.95 }}
                style={{ background: 'linear-gradient(135deg, #FFD166, #FF6B6B)', color: '#1a0a00', fontWeight: 900, fontSize: '1.1rem', padding: '16px 44px', borderRadius: 50, cursor: 'pointer', textDecoration: 'none', display: 'inline-block', boxShadow: '0 8px 30px rgba(255,107,107,0.5)' }}
              >
                🎯 නොමිලේ ගිණුමක් සාදන්න
              </motion.div>
            </Link>
            <Link to="/login">
              <motion.div
                whileHover={{ scale: 1.08, y: -3 }}
                whileTap={{ scale: 0.95 }}
                style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', color: '#fff', fontWeight: 800, fontSize: '1.1rem', padding: '16px 44px', borderRadius: 50, border: '2px solid rgba(255,255,255,0.4)', cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }}
              >
                🔑 පිවිසෙන්න
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════ */}
      <footer style={{
        background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
        color: 'rgba(255,255,255,0.7)',
        padding: '60px 20px 30px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🦁</div>
          <h3 style={{ color: '#fff', fontWeight: 900, fontSize: '1.8rem', marginBottom: 8 }}>ස්මාට්ලර්න්</h3>
          <p style={{ marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
            ක්‍රීඩාවේ මායාව හරහා සෑම දරුවෙකුම ඔවුන්ගේ සම්පූර්ණ හැකියාව වෙත ළඟා කරවීම.
          </p>

          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
            {[
              { emoji: '📚', label: 'ඩිස්ලෙක්සියා', path: '/dyslexia' },
              { emoji: '🔢', label: 'ඩිස්කැල්කුලියා', path: '/dyscalculia' },
              { emoji: '✏️', label: 'ඩිස්ග්‍රැෆියා', path: '/dysgraphia' },
              { emoji: '🧠', label: 'වැඩකරන මතකය', path: '/working-memory' },
            ].map(({ emoji, label, path }) => (
              <Link key={label} to={path} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                {emoji} {label}
              </Link>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, fontSize: '0.85rem' }}>
            © 2026 ස්මාට්ලර්න් · සෑම දරුවෙකුගේ ගමනට ❤️ සමඟ සාදන ලදී
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;

