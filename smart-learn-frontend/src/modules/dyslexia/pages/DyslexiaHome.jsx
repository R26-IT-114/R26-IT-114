import { useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Volume2, Lock, RotateCcw } from "lucide-react";
import useDyslexiaProgress from "../hooks/useDyslexiaProgress";
import eleImg from "../../../assets/images/background/ele.png";
import giraImg from "../../../assets/images/background/gira.png";
import lionImg from "../../../assets/images/background/lion.png";
import monkImg from "../../../assets/images/background/monk.png";
import pandaImg from "../../../assets/images/background/panda.png";
import section1Audio from "../../../assets/instructions/1.mp3";
import section2Audio from "../../../assets/instructions/2.mp4";
import section3Audio from "../../../assets/instructions/3.mpeg";
import section4Audio from "../../../assets/instructions/4.mpeg";
import section5Audio from "../../../assets/instructions/5.mpeg";
import section6Audio from "../../../assets/instructions/6.mpeg";
import GameCard from "../components/GameCard";
import AnimatedJungleBackground from "../components/AnimatedJungleBackground";
import InstructionButton from "../components/InstructionButton";
import useInstructionAudio from "../../../hooks/useInstructionAudio";

// ── Sections ──────────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: 1,
    title: "ගෙවත්තේ චාරිකාව",
    gradient: "linear-gradient(135deg, #1A5C2A 0%, #2D8A52 55%, #7CC49A 100%)",
    isStandalone: true,
    route: "/dyslexia/garden-journey",
    cardImg: eleImg,
    instructionAudio: section1Audio,
  },
  {
    id: 2,
    title: "අකුරු කියමු",
    gradient: "linear-gradient(135deg, #0D3B6E 0%, #1A6FA8 60%, #4AA8D8 100%)",
    cardImg: giraImg,
    instructionAudio: section2Audio,
    games: [
      { num: 1, route: "/dyslexia/letter-listening" },
      { num: 2, route: "/dyslexia/letter-pronunciation" },
    ],
  },
  {
    id: 3,
    title: "අකුරු 2 වචන කියමු",
    gradient: "linear-gradient(135deg, #6B2D00 0%, #B05020 60%, #E07A20 100%)",
    cardImg: lionImg,
    instructionAudio: section3Audio,
    games: [
      { num: 1, route: "/dyslexia/two-letter-word-match" },
      { num: 2, route: "/dyslexia/letter-sound-match" },
      { num: 3, route: "/dyslexia/two-letter-speak" },
    ],
  },
  {
    id: 4,
    title: "අකුරු තුනේ වචන කියමු",
    gradient: "linear-gradient(135deg, #1A3A5C 0%, #2D5C8A 60%, #4A80B8 100%)",
    cardImg: pandaImg,
    instructionAudio: section4Audio,
    games: [
      { num: 1, route: "/dyslexia/word-listen-match" },
      { num: 2, route: "/dyslexia/word-image-match" },
      { num: 3, route: "/dyslexia/word-speak" },
    ],
  },
  {
    id: 5,
    title: "හපනෙක් වෙමු",
    gradient: "linear-gradient(135deg, #6B1040 0%, #A82060 60%, #D4507A 100%)",
    cardImg: monkImg,
    instructionAudio: section5Audio,
    games: [
      { num: 1, route: "/dyslexia/first-letter" },
      { num: 2, route: "/dyslexia/rhyme-odd-one-out" },
    ],
  },
  {
    id: 6,
    title: "වචන හදමු",
    gradient: "linear-gradient(135deg, #065f46 0%, #059669 60%, #34d399 100%)",
    cardImg: pandaImg,
    instructionAudio: section6Audio,
    games: [
      { num: 1, route: "/dyslexia/word-builder" },
    ],
  },
];

// ── SectionCard ───────────────────────────────────────────────────────────────

const SectionCard = ({ section, gameOffset, onPlay, onPlayInstruction, locked = false }) => {
  const imgOnRight = section.id % 2 === 1;
  const gameCount = section.games?.length ?? 0;

  return (
    <div className="relative">
      <motion.article
        initial={{ opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: section.id * 0.1, duration: 0.45, ease: "easeOut" }}
        whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(0,0,0,0.22)" }}
        className="rounded-3xl overflow-hidden shadow-[0_6px_28px_rgba(0,0,0,0.16)]
                   border border-white/50 relative"
        style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(2px)" }}
      >
        {/* Header */}
        <div
          className="relative flex items-center gap-3 px-5 py-4 overflow-hidden"
          style={{ background: section.gradient }}
        >
          {/* subtle shine strip */}
          <div className="absolute inset-0 pointer-events-none"
               style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 60%)" }} />

          {/* Section number badge */}
          <div className="shrink-0 w-12 h-12 rounded-2xl bg-white/20 border border-white/40
                          flex items-center justify-center">
            <span className="text-white font-black text-xl leading-none">{section.id}</span>
          </div>

          <h2 className="flex-1 text-white font-black leading-snug drop-shadow"
              style={{ fontSize: "1.65rem", fontFamily: "Poppins, Arial, sans-serif" }}>
            {section.title}
          </h2>

          {/* Game count pill */}
          {!section.isStandalone && gameCount > 0 && (
            <span className="shrink-0 px-3 py-1 rounded-full bg-white/25 border border-white/40
                             text-white text-base font-bold">
              {gameCount} games
            </span>
          )}

          {/* Play button for standalone */}
          {section.isStandalone && !locked && (
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
              onClick={() => onPlay(section.route)}
              aria-label={`Start ${section.title}`}
              className="shrink-0 w-12 h-12 rounded-2xl bg-white/90 shadow-lg
                         flex items-center justify-center
                         focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
              style={{ color: "inherit" }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <polygon points="5,3 17,10 5,17" fill="currentColor" opacity="0.85"
                         style={{ fill: section.gradient.includes("#1A5C2A") ? "#1A5C2A" : "#1A3A5C" }} />
              </svg>
            </motion.button>
          )}
          {/* Lock badge for standalone locked sections */}
          {section.isStandalone && locked && (
            <div className="shrink-0 w-12 h-12 rounded-2xl bg-black/20 flex items-center justify-center">
              <Lock size={22} className="text-white/80" />
            </div>
          )}

          {/* Section instruction audio */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => onPlayInstruction(section.instructionAudio)}
            aria-label={`Play instructions for ${section.title}`}
            className="shrink-0 w-11 h-11 rounded-2xl bg-white/90 shadow-lg
                       flex items-center justify-center
                       focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
            style={{ color: "#1f2937" }}
          >
            <Volume2 size={20} />
          </motion.button>
        </div>

        {/* Games list */}
        {!section.isStandalone && (
          <div
            className="flex flex-row items-center justify-center gap-6 px-5 py-6
                        bg-[#E8EEF5]/80 backdrop-blur-sm relative"
            style={section.cardImg
              ? { [imgOnRight ? "paddingRight" : "paddingLeft"]: 100 }
              : {}}
          >
            {locked && (
              <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] rounded-b-3xl
                              flex items-center justify-center z-10">
                <div className="flex items-center gap-2 bg-black/50 text-white px-4 py-2 rounded-full">
                  <Lock size={18} />
                  <span className="font-bold text-sm">ප්‍රශ්නාවලිය සම්පූර්ණ කරන්න</span>
                </div>
              </div>
            )}
            {section.games.map((game, i) => (
              <GameCard key={game.num} game={game} index={gameOffset + i} onPlay={onPlay} locked={locked} />
            ))}
          </div>
        )}

        {/* Animal sticker — inside card */}
        {section.cardImg && (
          <img
            src={section.cardImg}
            alt=""
            aria-hidden="true"
            className="absolute pointer-events-none select-none"
            style={{
              bottom: 0,
              [imgOnRight ? "right" : "left"]: 0,
              width: 92,
              objectFit: "contain",
              zIndex: 5,
              filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.28))",
            }}
          />
        )}
      </motion.article>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────

const DyslexiaHome = () => {
  const navigate = useNavigate();
  const { replay } = useInstructionAudio();
  const sectionAudioRef = useRef(null);
  const { assessmentDone, isSectionUnlocked, resetAssessment, recommendedLevel, weakLetters } = useDyslexiaProgress();
  const startingGameLevel = useMemo(() => {
    if (recommendedLevel >= 4) return 3;
    if (recommendedLevel >= 1) return recommendedLevel;
    return 1;
  }, [recommendedLevel]);

  // Redirect to assessment if not yet done
  useEffect(() => {
    if (!assessmentDone) {
      navigate('/dyslexia/pre-assessment', { replace: true });
    }
  }, [assessmentDone, navigate]);

  useEffect(() => {
    return () => {
      if (sectionAudioRef.current) {
        sectionAudioRef.current.pause();
        sectionAudioRef.current.currentTime = 0;
        sectionAudioRef.current = null;
      }
    };
  }, []);

  const handlePlaySectionInstruction = useCallback((audioSrc) => {
    if (!audioSrc) return;

    if (sectionAudioRef.current) {
      sectionAudioRef.current.pause();
      sectionAudioRef.current.currentTime = 0;
    }

    const audio = new Audio(audioSrc);
    sectionAudioRef.current = audio;
    audio.play().catch(() => {
      // Ignore playback failures from browser audio policy/device state.
    });
  }, []);

  const handlePlay = useCallback((route) => navigate(route, { state: { level: startingGameLevel } }), [navigate, startingGameLevel]);
  let offset = 0;

  return (
    <main
      className="min-h-screen relative overflow-hidden"
      style={{ fontFamily: "Poppins, Arial, sans-serif" }}
    >
      {/* ── Animated jungle background ── */}
      <AnimatedJungleBackground />

      {/* ── Page content ── */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-10">

        {/* Page heading */}
        <motion.header
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-7 text-center"
        >
          <h1
            className="font-black drop-shadow-lg whitespace-nowrap"
            style={{
              fontSize: "3rem",
              fontFamily: "Poppins, Arial, sans-serif",
              color: "#FFFFFF",
              textShadow: "0 3px 14px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.65)",
              lineHeight: 1.2,
            }}
          >
            කැලේ යාළුවෝ සමඟ අකුරු කියමු
          </h1>

          {assessmentDone && (
            <div className="mt-4 mx-auto max-w-xl rounded-3xl bg-white/15 border border-white/30 px-5 py-4 text-left text-white shadow-lg">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-wide text-white/70 font-bold">Recommended starting level</p>
                  <p className="text-2xl font-black">Level {recommendedLevel}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white/70 font-semibold">Weak letters</p>
                  <p className="font-black">{weakLetters.length > 0 ? weakLetters.join(' · ') : 'None yet'}</p>
                </div>
              </div>
            </div>
          )}
        </motion.header>

        {/* Sections */}
        <section aria-label="Games" className="flex flex-col gap-5">
          {SECTIONS.map(sec => {
            const cur = offset;
            offset += sec.games ? sec.games.length : 0;
            return (
              <SectionCard
                key={sec.id}
                section={sec}
                gameOffset={cur}
                onPlay={handlePlay}
                onPlayInstruction={handlePlaySectionInstruction}
                locked={!isSectionUnlocked(sec.id)}
              />
            );
          })}
        </section>

        {/* Retake assessment button */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 flex justify-center"
        >
          <button
            onClick={() => { resetAssessment(); navigate('/dyslexia/pre-assessment'); }}
            className="flex items-center gap-2 px-5 py-2 rounded-full
                       bg-white/20 hover:bg-white/30 border border-white/40
                       text-white text-sm font-semibold transition-colors
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <RotateCcw size={14} />
            <span>ප්‍රශ්නාවලිය නැවත කරන්න</span>
          </button>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="mt-10 text-center" aria-hidden="true"
        >
          <div className="h-3 rounded-full bg-gradient-to-r from-[#1A4A2A]/40 via-[#52B788]/60 to-[#1A4A2A]/40" />
        </motion.footer>
      </div>

      <InstructionButton onReplay={replay} />
    </main>
  );
};

export default DyslexiaHome;