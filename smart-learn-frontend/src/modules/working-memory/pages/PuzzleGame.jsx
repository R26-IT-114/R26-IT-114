import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

import turtleRoundImage from "../assets/New folder/turtulenew.png";
import starfishRoundImage from "../assets/New folder/starfishnew.png";
import fishRoundImage from "../assets/New folder/fishnew.png";
import shellRoundImage from "../assets/New folder/shellnew.png";
import crabRoundImage from "../assets/New folder/crabnew.png";
import octopusRoundImage from "../assets/New folder/octupusnew.png";
import dolphinImage from "../assets/dolphin.png";
import swimmingFishImage from "../assets/fish.png";
import RewardPanel from "../components/RewardPanel";
import { useProgress } from "../context/ProgressContext";

const PREVIEW_MS = 5000;

const getPuzzleLayout = (gameLevel) => (Number(gameLevel) === 2 ? { rows: 2, cols: 3 } : { rows: 2, cols: 2 });

const LEVEL_ONE_ROUNDS = [
  { id: "round-1", image: turtleRoundImage, label: "කැස්බෑවා" },
  { id: "round-2", image: starfishRoundImage, label: "ස්ටාර් ෆිෂ්" },
  { id: "round-3", image: fishRoundImage, label: "මාළු" },
];

const LEVEL_TWO_ROUNDS = [
  { id: "round-1", image: shellRoundImage, label: "ශෙල්" },
  { id: "round-2", image: crabRoundImage, label: "කකුළුවා" },
  { id: "round-3", image: octopusRoundImage, label: "ඔක්ටෝපස්" },
];

const shuffle = (items) => {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
};

const roundPieces = (image, rows, cols) =>
  Array.from({ length: rows * cols }, (_, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    const bgPosX = cols === 1 ? 0 : (col / (cols - 1)) * 100;
    const bgPosY = rows === 1 ? 0 : (row / (rows - 1)) * 100;

    return {
      id: `piece-${index}`,
      correctSlot: index,
      image,
      rows,
      cols,
      bgPosX: `${bgPosX}%`,
      bgPosY: `${bgPosY}%`,
    };
  });

const speakSinhala = (text) => {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "si-LK";
  utterance.rate = 0.92;
  utterance.pitch = 1.04;
  utterance.volume = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
};

const PuzzlePiece = ({ piece, onPointerDown, isGhost = false }) => (
  <motion.button
    type="button"
    onPointerDown={onPointerDown}
    whileHover={!isGhost ? { scale: 1.03 } : undefined}
    whileTap={!isGhost ? { scale: 0.96 } : undefined}
    style={{
      width: "100%",
      height: "100%",
      borderRadius: "14px",
      border: "2px solid #e0f2fe",
      cursor: isGhost ? "grabbing" : "grab",
      boxShadow: "0 6px 16px rgba(14, 116, 144, 0.24)",
      backgroundImage: `url(${piece.image})`,
      backgroundSize: `${piece.cols * 100}% ${piece.rows * 100}%`,
      backgroundPositionX: piece.bgPosX,
      backgroundPositionY: piece.bgPosY,
      backgroundRepeat: "no-repeat",
      touchAction: "none",
      overflow: "hidden",
    }}
  />
);

const PuzzleGame = ({ level = 1, onComplete }) => {
  const { completeLevel, updateLevelProgress, recordAdaptiveResult } = useProgress();
  const rounds = Number(level) === 2 ? LEVEL_TWO_ROUNDS : LEVEL_ONE_ROUNDS;
  const { rows, cols } = getPuzzleLayout(level);
  const totalPieces = rows * cols;
  const [isMobile, setIsMobile] = useState(false);
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState("intro");
  const [countdown, setCountdown] = useState(5);
  const [barPercent, setBarPercent] = useState(100);
  const [pieceMap, setPieceMap] = useState({});
  const [trayIds, setTrayIds] = useState([]);
  const [slots, setSlots] = useState(Array(totalPieces).fill(null));
  const [dragState, setDragState] = useState(null);
  const [returnGhost, setReturnGhost] = useState(null);
  const [wrongPulseSlot, setWrongPulseSlot] = useState(null);
  const [showRoundCelebrate, setShowRoundCelebrate] = useState(false);

  const slotRefs = useRef([]);
  const activeRound = rounds[roundIndex] || rounds[0];

  const completionCount = useMemo(
    () => slots.filter((pieceId) => pieceId !== null).length,
    [slots]
  );

  const resetRoundPuzzle = useCallback((roundImage) => {
    const generated = roundPieces(roundImage, rows, cols);
    const map = generated.reduce((acc, piece) => {
      acc[piece.id] = piece;
      return acc;
    }, {});

    setPieceMap(map);
    setTrayIds(shuffle(generated.map((piece) => piece.id)));
    setSlots(Array(totalPieces).fill(null));
    setWrongPulseSlot(null);
  }, [rows, cols, totalPieces]);

  useEffect(() => {
    setRoundIndex(0);
    setPhase("intro");
    setCountdown(5);
    setBarPercent(100);
    setPieceMap({});
    setTrayIds([]);
    setSlots(Array(totalPieces).fill(null));
    setDragState(null);
    setReturnGhost(null);
    setWrongPulseSlot(null);
    setShowRoundCelebrate(false);
  }, [level, totalPieces]);

  // Responsive: track small viewports and adapt sizes
  useEffect(() => {
    const update = () => setIsMobile(typeof window !== 'undefined' ? window.innerWidth <= 640 : false);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (phase !== "intro") return;
    speakSinhala("මතක ප්‍රහේලිකාවට සාදරයෙන් පිළිගනිමු. ආරම්භ කරන්න ඔබන්න.");
  }, [phase]);

  useEffect(() => {
    if (phase !== "preview") return undefined;

    const speech = `හොඳින් බලන්න. මෙම පින්තූරය මතක තබා ගැනීමට තත්පර පහක් තිබේ.`;
    speakSinhala(speech);

    const startTs = Date.now();
    setCountdown(5);
    setBarPercent(100);

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startTs;
      const remaining = Math.max(PREVIEW_MS - elapsed, 0);
      const remainingSeconds = Math.max(Math.ceil(remaining / 1000), 1);

      setCountdown(remaining === 0 ? 1 : remainingSeconds);
      setBarPercent((remaining / PREVIEW_MS) * 100);

      if (remaining === 0) {
        window.clearInterval(interval);
        setBarPercent(0);
        resetRoundPuzzle(activeRound.image);
        setPhase("play");
      }
    }, 100);

    return () => {
      window.clearInterval(interval);
    };
  }, [phase, activeRound.image, resetRoundPuzzle]);

  useEffect(() => {
    if (phase === "play") {
      speakSinhala("පින්තූරය නැවත සකස් කරන්න.");
    }

    if (phase === "round-done") {
      speakSinhala("නියමයි.");
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== "round-done") return undefined;

    setShowRoundCelebrate(true);
    const timer = window.setTimeout(() => {
      setShowRoundCelebrate(false);
      if (roundIndex < rounds.length - 1) {
        setRoundIndex((prev) => prev + 1);
        setPhase("preview");
      } else {
        setPhase("level-done");
      }
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [phase, roundIndex, rounds.length]);

  // When the level is done, persist progress/unlock next level once
  useEffect(() => {
    if (phase !== 'level-done') return undefined;
    // Prepare stats
    const lvl = Number(level) === 2 ? 2 : 1;
    const totalRounds = rounds.length;
    const correct = totalRounds; // all rounds completed
    const accuracy = 100;

    try {
      completeLevel('puzzle-game', lvl, { correct, total: totalRounds, accuracy, level: lvl });
      updateLevelProgress('puzzle-game', lvl, 100, { correct, total: totalRounds, accuracy });
      recordAdaptiveResult && recordAdaptiveResult('puzzle-game', { correct, total: totalRounds, accuracy, level: lvl });
    } catch {
      // ignore errors; optimistic UI already handled
    }

    return undefined;
  }, [phase, completeLevel, updateLevelProgress, recordAdaptiveResult, level, rounds.length]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    return () => window.speechSynthesis.cancel();
  }, []);

  useEffect(() => {
    if (!dragState) return undefined;

    const handleMove = (event) => {
      setDragState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          x: event.clientX - prev.offsetX,
          y: event.clientY - prev.offsetY,
        };
      });
    };

    const handleUp = (event) => {
      let targetSlot = null;

      slotRefs.current.forEach((slotEl, idx) => {
        if (!slotEl) return;
        const rect = slotEl.getBoundingClientRect();
        const insideX = event.clientX >= rect.left && event.clientX <= rect.right;
        const insideY = event.clientY >= rect.top && event.clientY <= rect.bottom;
        if (insideX && insideY) targetSlot = idx;
      });

      const piece = pieceMap[dragState.pieceId];
      if (!piece) {
        setDragState(null);
        return;
      }

      const isCorrectTarget =
        targetSlot !== null &&
        targetSlot === piece.correctSlot &&
        slots[targetSlot] === null;

      if (isCorrectTarget) {
        setSlots((prev) => {
          const next = [...prev];
          next[targetSlot] = piece.id;
          return next;
        });
        setTrayIds((prev) => prev.filter((id) => id !== piece.id));
      } else if (targetSlot !== null) {
        setReturnGhost({
          pieceId: piece.id,
          fromX: dragState.x,
          fromY: dragState.y,
          toX: dragState.originX,
          toY: dragState.originY,
          width: dragState.width,
          height: dragState.height,
        });
        setWrongPulseSlot(targetSlot);
        window.setTimeout(() => setWrongPulseSlot(null), 420);
      } else {
        setReturnGhost({
          pieceId: piece.id,
          fromX: dragState.x,
          fromY: dragState.y,
          toX: dragState.originX,
          toY: dragState.originY,
          width: dragState.width,
          height: dragState.height,
        });
      }

      setDragState(null);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp, { once: true });

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [dragState, pieceMap, slots]);

  useEffect(() => {
    if (phase !== "play") return;
    const solved = slots.every((pieceId, slotIndex) => {
      if (!pieceId) return false;
      return pieceMap[pieceId]?.correctSlot === slotIndex;
    });

    if (solved) {
      setPhase("round-done");
    }
  }, [slots, pieceMap, phase]);

  const onPiecePointerDown = (event, pieceId) => {
    if (phase !== "play") return;
    event.preventDefault();

    const rect = event.currentTarget.getBoundingClientRect();

    setDragState({
      pieceId,
      x: rect.left,
      y: rect.top,
      originX: rect.left,
      originY: rect.top,
      width: rect.width,
      height: rect.height,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    });
  };

  const handleStartGame = () => {
    setRoundIndex(0);
    setCountdown(5);
    setBarPercent(100);
    setShowRoundCelebrate(false);
    setWrongPulseSlot(null);
    setDragState(null);
    setReturnGhost(null);
    setPhase("preview");
  };

  if (phase === "level-done") {
    const currentLevel = Number(level) === 2 ? 2 : 1;
    const totalRounds = rounds.length;
    const correct = totalRounds; // all rounds completed
    const accuracy = 100;
    const passed = accuracy >= 60;
    const nextLevel = currentLevel === 1 ? 2 : null;
    const stars = accuracy >= 90 ? 3 : accuracy >= 60 ? 2 : 1;

    return (
      <main style={{ minHeight: '100vh', padding: 22, background: 'linear-gradient(180deg, #dbeafe 0%, #7dd3fc 45%, #38bdf8 100%)' }}>
        <section style={{ width: 'min(980px,96vw)', margin: '40px auto', zIndex: 1 }}>
          <RewardPanel
            variant="n-back"
            stars={stars}
            accuracy={accuracy}
            correct={correct}
            total={totalRounds}
            partyLevel={stars}
            unlockText={passed && currentLevel === 1 ? 'Level 2 unlock වුණා! 🎉' : null}
            nextLabel="ඊළඟ මට්ටමට"
            onNext={passed && currentLevel === 1 ? () => { if (onComplete) onComplete({ passed: true, nextLevel, accuracy }); } : null}
            onRetry={null}
            onHome={() => { if (onComplete) onComplete({ goHome: true, accuracy }); }}
            showNext={passed && currentLevel === 1}
            showRetry={false}
            showHome={true}
          />
        </section>
      </main>
    );
  }

  if (phase === "intro") {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "22px 14px 26px 14px",
          background: "linear-gradient(180deg, #e0f2fe 0%, #7dd3fc 42%, #38bdf8 100%)",
          position: "relative",
          overflow: "hidden",
          display: "grid",
          placeItems: "center",
        }}
      >
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`intro-bubble-${i}`}
            aria-hidden="true"
            style={{
              position: "absolute",
              left: `${6 + i * 9}%`,
              bottom: "-28px",
              width: `${10 + (i % 5) * 3}px`,
              height: `${10 + (i % 5) * 3}px`,
              borderRadius: "999px",
              background: "rgba(255,255,255,0.34)",
              border: "1px solid rgba(255,255,255,0.75)",
            }}
            animate={{ y: [0, -640], opacity: [0, 0.8, 0] }}
            transition={{ duration: 7 + i * 0.45, delay: i * 0.3, repeat: Infinity, ease: "easeOut" }}
          />
        ))}

        <motion.div
          aria-hidden="true"
          style={{ position: "absolute", top: "9%", right: "8%", width: "110px" }}
          animate={{ y: [0, -10, 0], rotate: [-5, 5, -5] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 14, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45 }}
          style={{
            width: "min(760px, 96vw)",
            borderRadius: "30px",
            background: "rgba(255,255,255,0.93)",
            border: "3px solid rgba(125,211,252,0.9)",
            boxShadow: "0 20px 54px rgba(14,116,144,0.24)",
            padding: "24px 20px",
            textAlign: "center",
            position: "relative",
          }}
        >
          <div style={{ color: "#0c4a6e", fontWeight: 900, fontSize: "20px", letterSpacing: "0.03em" }}>
            මුහුදු මතක ක්‍රීඩාව
          </div>

          <h1 style={{ margin: "8px 0 10px 0", color: "#075985", fontSize: "44px", fontWeight: 900, lineHeight: 1.1 }}>
            මතකය පරීක්ෂා කරමුද? 🧠✨
          </h1>

          <p style={{ margin: 0, color: "#0f766e", fontSize: "23px", fontWeight: 800 }}>
  පින්තූරය හොඳින් මතක තබාගන්න! 👀
  <br />
  ඉන්පසු කොටස් එකතු කරලා
  <br />
  පින්තූරය නැවත හදන්න! 🧩
</p>

          <div style={{ display: "flex", justifyContent: "center", marginTop: "18px" }}>
  <motion.img
    src={dolphinImage}
    alt="Cute dolphin"
    animate={{
      y: [0, -12, 0],
      rotate: [-3, 3, -3],
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    style={{
      width: "min(380px, 88vw)",
      borderRadius: "24px",
      border: "4px solid #dbeafe",
      boxShadow: "0 16px 35px rgba(14,116,144,0.25)",
    }}
  />
</div>
         

          <div
            style={{
              margin: "18px auto 0 auto",
              maxWidth: "560px",
              borderRadius: "18px",
              background: "rgba(224,242,254,0.8)",
              border: "2px solid #bae6fd",
              padding: "12px 14px",
              color: "#1e293b",
              fontWeight: 700,
              fontSize: "20px",
              lineHeight: 1.45,
              textAlign: "left",
            }}
          >
            <div>1. පින්තූරය තත්පර 5ක් හොඳින් බලන්න.</div>
            <div>2. පින්තූර කොටස් ඇදගෙන හරි තැනට දමන්න.</div>
            <div>3. රවුම් 3ම සම්පූර්ණ කර මට්ටම ජයගන්න.</div>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleStartGame}
            style={{
              marginTop: "18px",
              border: "none",
              borderRadius: "18px",
              padding: "14px 34px",
              background: "linear-gradient(135deg, #16a34a, #22c55e)",
              color: "white",
              fontSize: "31px",
              fontWeight: 900,
              cursor: "pointer",
              boxShadow: "0 12px 24px rgba(22,163,74,0.3)",
            }}
          >
            ආරම්භ කරන්න
          </motion.button>
        </motion.section>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "22px 14px 26px 14px",
        background: "linear-gradient(180deg, #e0f2fe 0%, #7dd3fc 42%, #38bdf8 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {[...Array(9)].map((_, i) => (
        <motion.div
          key={`bubble-${i}`}
          aria-hidden="true"
          style={{
            position: "absolute",
            left: `${8 + i * 10}%`,
            bottom: "-30px",
            width: `${10 + (i % 4) * 3}px`,
            height: `${10 + (i % 4) * 3}px`,
            borderRadius: "999px",
            background: "rgba(255,255,255,0.35)",
            border: "1px solid rgba(255,255,255,0.8)",
            zIndex: 0,
          }}
          animate={{ y: [0, -640], opacity: [0, 0.85, 0] }}
          transition={{ duration: 7 + i * 0.4, delay: i * 0.35, repeat: Infinity, ease: "easeOut" }}
        />
      ))}

      <motion.div
        aria-hidden="true"
        style={{ position: "absolute", top: "7%", right: "4%", width: "98px", zIndex: 0 }}
        animate={{ y: [0, -11, 0], rotate: [-4, 4, -4] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
      </motion.div>

      <section
        style={{
          width: "min(980px, 96vw)",
          margin: "0 auto",
          borderRadius: "28px",
          background: "rgba(255,255,255,0.92)",
          border: "3px solid rgba(125,211,252,0.9)",
          boxShadow: "0 18px 52px rgba(14,116,144,0.24)",
          padding: "20px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: "center", color: "#0c4a6e", fontWeight: 800, fontSize: "20px" }}>
          මතක ප්‍රහේලිකාව - මට්ටම {level}
        </div>

        <h1 style={{ textAlign: "center", margin: "6px 0 0 0", color: "#075985", fontSize: "34px", fontWeight: 900 }}>
          හොඳින් බලන්න!
        </h1>

        <p style={{ textAlign: "center", margin: "8px 0 0 0", color: "#0f766e", fontSize: "21px", fontWeight: 700 }}>
          රවුම {roundIndex + 1} / 3
        </p>

        {phase === "preview" && (
          <div style={{ marginTop: "18px" }}>
            <p style={{ textAlign: "center", margin: 0, color: "#334155", fontSize: "22px", fontWeight: 700 }}>
              මෙම පින්තූරය මතක තබා ගැනීමට තත්පර 5ක් තිබේ.
            </p>

            <div style={{ marginTop: "14px", textAlign: "center", color: "#1d4ed8", fontSize: isMobile ? 40 : 62, fontWeight: 900, lineHeight: 1 }}>
              {countdown}
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginTop: "12px" }}>
              <img
                src={activeRound.image}
                alt={activeRound.label}
                style={{
                  width: isMobile ? 'min(320px, 88vw)' : 'min(450px, 92vw)',
                  borderRadius: "24px",
                  border: "4px solid #dbeafe",
                  boxShadow: "0 14px 30px rgba(14,116,144,0.24)",
                }}
              />
            </div>

            <div
              style={{
                margin: "18px auto 6px auto",
                width: "min(760px, 92vw)",
                height: "34px",
                borderRadius: "999px",
                background: "linear-gradient(180deg,#eff6ff,#dbeafe 55%,#bfdbfe)",
                border: "3px solid rgba(14,116,144,0.28)",
                boxShadow: "inset 0 2px 10px rgba(255,255,255,0.6), 0 8px 18px rgba(14,116,144,0.12)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "repeating-linear-gradient(90deg, rgba(255,255,255,0.22) 0 18px, rgba(255,255,255,0.06) 18px 36px)",
                  opacity: 0.8,
                }}
              />

              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: `${barPercent}%`,
                  background: "linear-gradient(90deg,#38bdf8,#0ea5e9,#0284c7)",
                  transition: "width 0.1s linear",
                }}
              />

              <motion.div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: "-38px",
                  left: `calc(${100 - barPercent}% - 34px)`,
                  width: "84px",
                  height: "84px",
                  zIndex: 10,
                }}
                animate={{
                  y: [0, -8, 0],
                  rotate: [-2, 2, -2],
                  x: [0, 2, 0],
                }}
                transition={{
                  duration: 0.95,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <img
                  src={swimmingFishImage}
                  alt="swimming fish"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    transform: "scaleX(-1)",
                    filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.28)) drop-shadow(0 0 10px rgba(255,255,255,0.45))",
                  }}
                />
              </motion.div>

              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: 12,
                  top: 8,
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                  color: "#0369a1",
                  fontSize: 13,
                  fontWeight: 900,
                  textShadow: "0 1px 0 rgba(255,255,255,0.7)",
                }}
              >
                <span>5</span>
                <span>4</span>
                <span>3</span>
                <span>2</span>
                <span>1</span>
              </div>

            </div>
          </div>
        )}

        {phase === "play" && (
          <div style={{ marginTop: "16px" }}>
            <p style={{ margin: "0 0 14px 0", textAlign: "center", fontSize: "26px", color: "#0f766e", fontWeight: 900 }}>
              පින්තූරය නැවත සකස් කරන්න!
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${cols}, minmax(0, ${isMobile ? 1 : 220}px))`,
                gap: "12px",
                justifyContent: "center",
                marginBottom: "18px",
              }}
            >
              {Array.from({ length: totalPieces }, (_, slotIndex) => {
                const pieceId = slots[slotIndex];
                const piece = pieceId ? pieceMap[pieceId] : null;
                return (
                  <motion.div
                    key={`slot-${slotIndex}`}
                    ref={(node) => {
                      slotRefs.current[slotIndex] = node;
                    }}
                    animate={wrongPulseSlot === slotIndex ? { x: [0, -6, 6, -5, 5, 0] } : { x: 0 }}
                    transition={{ duration: 0.35 }}
                      style={{
                      width: isMobile ? `min(${cols === 3 ? 120 : 160}px, ${cols === 3 ? 36 : 46}vw)` : `min(${cols === 3 ? 160 : 220}px, ${cols === 3 ? 28 : 41}vw)`,
                      aspectRatio: "1 / 1",
                      borderRadius: "16px",
                      border: "3px dashed #38bdf8",
                      background: "rgba(186,230,253,0.4)",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {piece ? (
                      <div style={{ width: "100%", height: "100%", borderRadius: "14px", overflow: "hidden" }}>
                        <PuzzlePiece piece={piece} isGhost />
                      </div>
                    ) : (
                      <span style={{ color: "#0369a1", fontWeight: 800, fontSize: "16px" }}>
                        තැන {slotIndex + 1}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>

                    <div
                      style={{
                        borderRadius: "18px",
                        border: "2px solid #bfdbfe",
                        background: "rgba(239,246,255,0.85)",
                        padding: "14px",
                      }}
            >
              <div style={{ textAlign: "center", color: "#1d4ed8", fontWeight: 900, fontSize: "20px", marginBottom: "10px" }}>
                කොටස් (ඇදගෙන දමන්න)
              </div>
              <div
                style={{
                          display: "grid",
                          gridTemplateColumns: `repeat(${cols}, minmax(0, ${isMobile ? 1 : 190}px))`,
                          gap: "10px",
                          justifyContent: "center",
                }}
              >
                {trayIds.map((pieceId) => {
                  const piece = pieceMap[pieceId];
                  if (!piece) return null;
                  return (
                    <div
                      key={pieceId}
                              style={{
                                width: isMobile ? `min(${cols === 3 ? 120 : 150}px, ${cols === 3 ? 36 : 44}vw)` : `min(${cols === 3 ? 150 : 190}px, ${cols === 3 ? 30 : 40}vw)`,
                                aspectRatio: "1 / 1",
                              }}
                    >
                      <PuzzlePiece piece={piece} onPointerDown={(event) => onPiecePointerDown(event, pieceId)} />
                    </div>
                  );
                })}
              </div>
            </div>

            <p style={{ margin: "12px 0 0 0", textAlign: "center", fontSize: isMobile ? 16 : 20, color: "#0c4a6e", fontWeight: 800 }}>
              සම්පූර්ණ කළ කොටස්: {completionCount} / {totalPieces}
            </p>
          </div>
        )}

        {phase === "round-done" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: [1, 1.06, 1] }}
            transition={{ duration: 0.6 }}
            style={{
              marginTop: "22px",
              borderRadius: "22px",
              background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
              border: "3px solid #34d399",
              textAlign: "center",
              padding: "26px 14px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {showRoundCelebrate &&
              Array.from({ length: 10 }, (_, i) => (
                <motion.div
                  key={`star-${i}`}
                  style={{
                    position: "absolute",
                    left: `${8 + i * 9}%`,
                    top: "58%",
                    color: "#f59e0b",
                    fontSize: "20px",
                    fontWeight: 900,
                  }}
                  animate={{ y: [0, -80], opacity: [1, 0] }}
                  transition={{ duration: 0.9, delay: i * 0.05 }}
                >
                  ✨
                </motion.div>
              ))}
            <div style={{ fontSize: "44px", fontWeight: 900, color: "#047857" }}>නියමයි! 🎉</div>
          </motion.div>
        )}
      </section>

      {dragState && pieceMap[dragState.pieceId] && (
        <div
          style={{
            position: "fixed",
            left: dragState.x,
            top: dragState.y,
            width: dragState.width,
            height: dragState.height,
            zIndex: 999,
            pointerEvents: "none",
          }}
        >
          <PuzzlePiece piece={pieceMap[dragState.pieceId]} isGhost />
        </div>
      )}

      {returnGhost && pieceMap[returnGhost.pieceId] && (
        <motion.div
          initial={{ x: returnGhost.fromX, y: returnGhost.fromY, opacity: 1 }}
          animate={{ x: returnGhost.toX, y: returnGhost.toY, opacity: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          onAnimationComplete={() => setReturnGhost(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: returnGhost.width,
            height: returnGhost.height,
            zIndex: 998,
            pointerEvents: "none",
          }}
        >
          <PuzzlePiece piece={pieceMap[returnGhost.pieceId]} isGhost />
        </motion.div>
      )}
    </main>
  );
};

export default PuzzleGame;
