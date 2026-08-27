import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

import turtleRoundImage from "../assets/New folder/turtle-transparent.png";
import starfishRoundImage from "../assets/New folder/starfish-transparent.png";
import fishRoundImage from "../assets/New folder/fish-transparent.png";
import shellRoundImage from "../assets/New folder/shell-transparent.png";
import crabRoundImage from "../assets/New folder/crab-transparent.png";
import octopusRoundImage from "../assets/New folder/octopus-transparent.png";
import dolphinImage from "../assets/dolphin.png";
import swimmingFishImage from "../assets/fish.png";
import puzzleTurtleLevelBoard from "../assets/puzzle-turtle-level-board.png";
import timerCrabImage from "../assets/timer-crab-generated.png";
import timerTreasureChestImage from "../assets/timer-treasure-chest-generated.png";
import RewardPanel from "../components/RewardPanel";
import { useProgress } from "../context/ProgressContext";
import { awardStar } from "../components/StarRewardSystem";
import { AnimatedSeaBg } from "./SequenceRecallGame";

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

const PuzzleIntroScreen = ({ level, rounds, rows, cols, isMobile, onStart }) => {
  const currentLevel = Number(level) === 2 ? 2 : 1;
  const exampleImage = rounds[0]?.image;

  return (
    <main style={{ minHeight:"calc(100dvh - 104px)", padding:"12px 14px", background:"transparent", position:"relative", overflow:"hidden", display:"grid", placeItems:"center" }}>
      <AnimatedSeaBg />
      {[...Array(10)].map((_, index) => (
        <motion.span key={`puzzle-intro-bubble-${index}`} aria-hidden="true"
          style={{ position:"absolute", left:`${7 + index * 9}%`, bottom:-24, width:10 + (index % 4) * 4, height:10 + (index % 4) * 4, borderRadius:"50%", background:"rgba(255,255,255,0.4)", border:"1px solid rgba(255,255,255,0.7)" }}
          animate={{ y:[0,-700], opacity:[0,0.8,0] }}
          transition={{ duration:7 + index * 0.3, delay:index * 0.25, repeat:Infinity, ease:"easeOut" }} />
      ))}

      <motion.section initial={{ opacity:0, y:20, scale:0.96 }} animate={{ opacity:1, y:0, scale:1 }}
        style={{ width:"min(100%,980px)", maxHeight:"calc(100dvh - 128px)", padding:isMobile ? "12px 12px 84px" : 22, borderRadius:32, background:"rgba(255,255,255,0.95)", border:"3px solid rgba(186,230,253,0.95)", boxShadow:"0 24px 64px rgba(14,116,144,0.26)", display:"grid", gridTemplateColumns:isMobile ? "1fr" : "minmax(320px,0.95fr) minmax(0,1.05fr)", alignItems:"center", gap:isMobile ? 8 : 22, overflowY:"auto", overflowX:"hidden", position:"relative", zIndex:2 }}>

        <div style={{ position:"relative", display:"flex", justifyContent:"center", alignItems:"center", minHeight:isMobile ? 255 : 0, width:"100%", zIndex:4, flexShrink:0 }}>
          {!isMobile && (
            <motion.div animate={{ scale:[1,1.04,1] }} transition={{ duration:2, repeat:Infinity, ease:"easeInOut" }}
              style={{ position:"absolute", right:-4, top:6, zIndex:3, maxWidth:150, padding:"9px 12px", borderRadius:"18px 18px 18px 4px", background:"#fff", border:"2px solid #86EFAC", color:"#047857", fontSize:14, fontWeight:900, textAlign:"center", boxShadow:"0 8px 20px rgba(5,150,105,0.18)" }}>
              හායි යාළුවා! පින්තූරය එකට හදමු!
            </motion.div>
          )}
          <motion.div animate={{ y:[0,-5,0], rotate:[-1,1,-1] }} transition={{ duration:3, repeat:Infinity, ease:"easeInOut" }}
            style={{ position:"relative", width:isMobile ? 210 : 390, maxWidth:"100%", flex:"0 0 auto", zIndex:5 }}>
            <img src={puzzleTurtleLevelBoard} alt={`කැස්බෑ යාළුවා මට්ටම ${currentLevel} පුවරුව අල්ලාගෙන සිටී`}
              style={{ display:"block", width:"100%", height:"auto", maxHeight:isMobile ? 320 : "calc(100dvh - 170px)", objectFit:"contain", opacity:1, visibility:"visible", filter:"drop-shadow(0 14px 22px rgba(15,118,110,0.22))" }} />
            <div style={{ position:"absolute", left:"12%", right:"12%", top:"45%", bottom:"20%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center" }}>
              <span style={{ color:"#0F766E", fontSize:isMobile ? 11 : 17, fontWeight:900 }}>මට්ටම</span>
              <span style={{ color:"#0284C7", fontSize:isMobile ? 30 : 58, fontWeight:1000, lineHeight:1 }}>{currentLevel}</span>
              <span style={{ color:"#334155", fontSize:isMobile ? 11 : 19, fontWeight:900, lineHeight:1.15, marginTop:5 }}>{rows} × {cols} ප්‍රහේලිකාව</span>
            </div>
          </motion.div>
        </div>

        <div style={{ display:"flex", minWidth:0, flexDirection:"column", gap:isMobile ? 8 : 13, textAlign:"center" }}>
          <div style={{ padding:isMobile ? 10 : 14, borderRadius:20, background:"linear-gradient(135deg,#ECFDF5,#D1FAE5)", border:"2px solid #A7F3D0" }}>
            <h1 style={{ margin:0, color:"#047857", fontSize:isMobile ? 22 : 34, fontWeight:1000, lineHeight:1.1 }}>මතක ප්‍රහේලිකාව</h1>
            <p style={{ margin:"6px 0 0", color:"#475569", fontSize:isMobile ? 13 : 17, fontWeight:800 }}>පින්තූරය මතක තියාගෙන කොටස් හරි තැනට දමමු!</p>
          </div>

          <div style={{ padding:isMobile ? 8 : 12, borderRadius:20, background:"#F8FAFC", border:"2px solid #E2E8F0" }}>
            <p style={{ margin:"0 0 7px", color:"#0F766E", fontSize:isMobile ? 13 : 16, fontWeight:900 }}>අද හදන පින්තූරය</p>
            <motion.div animate={{ scale:[1,1.025,1] }} transition={{ duration:2, repeat:Infinity, ease:"easeInOut" }}
              style={{ position:"relative", width:isMobile ? 112 : 168, aspectRatio:`${cols}/${rows}`, margin:"0 auto", borderRadius:16, overflow:"hidden", backgroundImage:`url(${exampleImage})`, backgroundSize:"cover", backgroundPosition:"center", border:"4px solid #38BDF8", boxShadow:"0 8px 20px rgba(2,132,199,0.2)" }}>
              {Array.from({ length:cols - 1 }, (_, index) => <span key={`v-${index}`} style={{ position:"absolute", top:0, bottom:0, left:`${((index + 1) / cols) * 100}%`, width:3, background:"rgba(255,255,255,0.9)", transform:"translateX(-50%)" }} />)}
              {Array.from({ length:rows - 1 }, (_, index) => <span key={`h-${index}`} style={{ position:"absolute", left:0, right:0, top:`${((index + 1) / rows) * 100}%`, height:3, background:"rgba(255,255,255,0.9)", transform:"translateY(-50%)" }} />)}
            </motion.div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:7, color:"#334155", fontSize:isMobile ? 11 : 14, fontWeight:900 }}>
            {["1. තත්පර 5ක් බලන්න","2. කොටස් මතක තබාගන්න","3. හරි තැනට දමන්න"].map((text,index) => (
              <div key={text} style={{ padding:isMobile ? 7 : 10, borderRadius:14, background:["#E0F2FE","#EDE9FE","#D1FAE5"][index], border:`2px solid ${["#7DD3FC","#C4B5FD","#6EE7B7"][index]}` }}>{text}</div>
            ))}
          </div>

          <div style={{ display:"flex", justifyContent:"center", gap:10, fontSize:isMobile ? 12 : 15, fontWeight:900 }}>
            <span style={{ padding:"6px 13px", borderRadius:999, background:"#EDE9FE", color:"#6D28D9" }}>වට {rounds.length}</span>
            <span style={{ padding:"6px 13px", borderRadius:999, background:"#D1FAE5", color:"#047857" }}>කොටස් {rows * cols}</span>
          </div>

          <motion.button type="button" onClick={onStart} whileHover={{ scale:1.04 }} whileTap={{ scale:0.95 }}
            style={{ position:isMobile ? "fixed" : "static", left:isMobile ? 16 : "auto", right:isMobile ? 16 : "auto", bottom:isMobile ? 12 : "auto", zIndex:30, width:isMobile ? "auto" : "100%", padding:"14px 24px", borderRadius:999, border:"none", background:"linear-gradient(135deg,#10B981,#0EA5E9)", color:"#fff", fontSize:isMobile ? 18 : 22, fontWeight:900, cursor:"pointer", boxShadow:"0 12px 28px rgba(5,150,105,0.3)" }}>
            කැස්බෑ යාළුවා එක්ක පටන් ගමු!
          </motion.button>
        </div>
      </motion.section>
    </main>
  );
};

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

  // Performance tracking for dashboard
  const levelStartTimeRef = useRef(null);
  const playStartTimeRef = useRef(null);
  const roundPlayTimesRef = useRef([]);
  const wrongAttemptsRef = useRef(0);
  const correctPlacementsRef = useRef(0);
  const savedCompletionRef = useRef(false);

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

    levelStartTimeRef.current = null;
    playStartTimeRef.current = null;
    roundPlayTimesRef.current = [];
    wrongAttemptsRef.current = 0;
    correctPlacementsRef.current = 0;
    savedCompletionRef.current = false;
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
        playStartTimeRef.current = Date.now();
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
    if (savedCompletionRef.current) return undefined;

    // Progress context updates recreate its action functions. Without this
    // guard, those new function references can rerun this effect and save the
    // same completed session hundreds of times.
    savedCompletionRef.current = true;

    const lvl = Number(level) === 2 ? 2 : 1;
    const totalRounds = rounds.length;

    // The puzzle is fully completed only after all rounds are solved.
    // Keep round completion stats for the existing progress flow.
    const correct = totalRounds;

    // Dashboard performance is based on actual piece-placement attempts.
    const mistakes = wrongAttemptsRef.current;
    const correctPlacements = correctPlacementsRef.current;
    const attempts = correctPlacements + mistakes;

    const accuracy =
      attempts > 0
        ? Math.round((correctPlacements / attempts) * 100)
        : 0;

    const averageResponseMs =
      roundPlayTimesRef.current.length > 0
        ? Math.round(
            roundPlayTimesRef.current.reduce((sum, time) => sum + time, 0) /
              roundPlayTimesRef.current.length,
          )
        : null;

    const totalResponseMs =
      levelStartTimeRef.current
        ? Date.now() - levelStartTimeRef.current
        : null;

    const stats = {
      correct,
      total: totalRounds,
      accuracy,
      level: lvl,

      // Piece-placement performance
      correctPlacements,
      correctAttempts: correctPlacements,
      mistakes,
      wrongAttempts: mistakes,
      attempts,
      totalAttempts: attempts,

      // Timing
      averageResponseMs,
      totalResponseMs,
    };

    try {
      // Preserve the existing level-completion/unlock behaviour:
      // reaching level-done means all puzzle rounds were successfully solved.
      completeLevel('puzzle-game', lvl, stats);
      updateLevelProgress('puzzle-game', lvl, 100, stats);

      // Save the complete game result so the report can use its own
      // correct-rounds measure rather than comparing raw attempts.
      recordAdaptiveResult &&
        recordAdaptiveResult('puzzle-game', stats);
    } catch {
      // ignore errors; optimistic UI already handled
    }

    onComplete?.({
      ...stats,
      passed: true,
      nextLevel: lvl === 1 ? 2 : null,
    });

    return undefined;
  }, [phase, completeLevel, updateLevelProgress, recordAdaptiveResult, level, onComplete, rounds.length]);

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
        awardStar();
        setSlots((prev) => {
          const next = [...prev];
          next[targetSlot] = piece.id;
          return next;
        });
        setTrayIds((prev) => prev.filter((id) => id !== piece.id));
        correctPlacementsRef.current += 1;
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
        wrongAttemptsRef.current += 1;
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
      if (playStartTimeRef.current) {
        const roundTime = Date.now() - playStartTimeRef.current;
        roundPlayTimesRef.current.push(roundTime);
        playStartTimeRef.current = null;
      }

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

    // Reset performance tracking for this level attempt.
    levelStartTimeRef.current = Date.now();
    playStartTimeRef.current = null;
    roundPlayTimesRef.current = [];
    wrongAttemptsRef.current = 0;
    correctPlacementsRef.current = 0;

    setPhase("preview");
  };

  if (phase === "level-done") {
    const currentLevel = Number(level) === 2 ? 2 : 1;
    const totalRounds = rounds.length;
    const correct = totalRounds; // all rounds completed

    const mistakes = wrongAttemptsRef.current;
    const correctPlacements = correctPlacementsRef.current;
    const attempts = correctPlacements + mistakes;

    const accuracy =
      attempts > 0
        ? Math.round((correctPlacements / attempts) * 100)
        : 0;

    // Reaching level-done means every puzzle round has been solved.
    // Keep the original unlock/completion behaviour.
    const passed = true;

    const nextLevel = currentLevel === 1 ? 2 : null;
    const stars = accuracy >= 90 ? 3 : accuracy >= 60 ? 2 : 1;

    return (
      <main style={{ minHeight: '100vh', padding: 22, background: 'transparent', position: 'relative' }}>
        <AnimatedSeaBg />
        <section style={{ width: 'min(980px,96vw)', margin: '40px auto', position: 'relative', zIndex: 1 }}>
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
      <PuzzleIntroScreen
        level={level}
        rounds={rounds}
        rows={rows}
        cols={cols}
        isMobile={isMobile}
        onStart={handleStartGame}
      />
    );
  }

  // Legacy preview fallback; the active intro uses PuzzleIntroScreen above.
  if (phase === "legacy-intro") {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "22px 14px 26px 14px",
          background: "transparent",
          position: "relative",
          overflow: "hidden",
          display: "grid",
          placeItems: "center",
        }}
      >
        <AnimatedSeaBg />
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
        background: "transparent",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <AnimatedSeaBg />
      {/* Friendly sea friends */}
      <motion.img
        src={dolphinImage}
        alt=""
        aria-hidden="true"
        animate={{ y: [0, -12, 0], rotate: [-4, 4, -4] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: isMobile ? "2%" : "5%",
          right: isMobile ? "-26px" : "2%",
          width: isMobile ? "115px" : "155px",
          opacity: 0.72,
          pointerEvents: "none",
          zIndex: 0,
          filter: "drop-shadow(0 10px 16px rgba(14,116,144,0.22))",
        }}
      />

      <motion.img
        src={swimmingFishImage}
        alt=""
        aria-hidden="true"
        animate={{
          x: ["-12vw", "108vw"],
          y: [0, -12, 8, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          left: "-100px",
          bottom: "7%",
          width: isMobile ? "80px" : "110px",
          opacity: 0.55,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
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
          padding: isMobile ? "14px" : "16px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ display:"none", textAlign: "center", color: "#0c4a6e", fontWeight: 800, fontSize: "20px" }}>
          මතක ප්‍රහේලිකාව - මට්ටම {level}
        </div>

        <h1 style={{ display:"none", textAlign: "center", margin: "4px 0 0 0", color: "#075985", fontSize: isMobile ? "27px" : "31px", fontWeight: 900 }}>
          හොඳින් බලන්න!
        </h1>

        <p style={{ display:"none", textAlign: "center", margin: "5px 0 0 0", color: "#0f766e", fontSize: isMobile ? "17px" : "19px", fontWeight: 800 }}>
          රවුම {roundIndex + 1} / 3
        </p>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, flexWrap:"wrap" }}>
          <span style={{ padding:"7px 14px", borderRadius:999, background:"#E0F2FE", color:"#075985", border:"2px solid #7DD3FC", fontWeight:900, fontSize:isMobile ? 14 : 17 }}>
            මතක ප්‍රහේලිකාව • මට්ටම {level}
          </span>
          <span style={{ padding:"7px 14px", borderRadius:999, background:"#D1FAE5", color:"#047857", border:"2px solid #6EE7B7", fontWeight:900, fontSize:isMobile ? 14 : 17 }}>
            වටය {roundIndex + 1} / {rounds.length}
          </span>
        </div>

        <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:10 }} aria-label={`වටය ${roundIndex + 1} / ${rounds.length}`}>
          {rounds.map((round, index) => (
            <motion.span key={round.id} animate={index === roundIndex ? { scale:[1,1.2,1] } : { scale:1 }} transition={{ duration:1.2, repeat:index === roundIndex ? Infinity : 0 }}
              style={{ width:index === roundIndex ? 34 : 14, height:14, borderRadius:999, background:index < roundIndex ? "#22C55E" : index === roundIndex ? "#0EA5E9" : "#CBD5E1", boxShadow:index === roundIndex ? "0 0 0 4px rgba(14,165,233,0.16)" : "none", transition:"width 0.25s ease" }} />
          ))}
        </div>

        {phase === "preview" && (
          <div style={{ marginTop: "18px" }}>
            <p style={{ display:"none", textAlign: "center", margin: 0, color: "#334155", fontSize: "22px", fontWeight: 700 }}>
              මෙම පින්තූරය මතක තබා ගැනීමට තත්පර 5ක් තිබේ.
            </p>

            <p style={{ textAlign:"center", margin:0, color:"#334155", fontSize:isMobile ? 18 : 22, fontWeight:900 }}>
              පින්තූරය හොඳින් බලලා මතක තබාගන්න!
            </p>

            <motion.div key={countdown} initial={{ scale:0.72, opacity:0 }} animate={{ scale:1, opacity:1 }}
              style={{ width:isMobile ? 76 : 94, height:isMobile ? 76 : 94, margin:"12px auto 0", borderRadius:"50%", display:"grid", placeItems:"center", textAlign:"center", color:"white", fontSize:isMobile ? 38 : 50, fontWeight:1000, lineHeight:1, background:countdown <= 1 ? "linear-gradient(135deg,#FB7185,#EF4444)" : countdown <= 3 ? "linear-gradient(135deg,#FBBF24,#F97316)" : "linear-gradient(135deg,#34D399,#0EA5E9)", border:"5px solid rgba(255,255,255,0.9)", boxShadow:`0 0 0 7px ${countdown <= 1 ? "rgba(251,113,133,0.2)" : "rgba(14,165,233,0.18)"}, 0 12px 28px rgba(14,116,144,0.22)` }}>
              {countdown}
            </motion.div>

            <div style={{ display:"flex", justifyContent:"center", width:"fit-content", maxWidth:"94%", margin:"12px auto 0", padding:isMobile ? 10 : 14, borderRadius:26, background:"linear-gradient(135deg,#ECFEFF,#DBEAFE)", border:"3px solid #7DD3FC", boxShadow:"0 14px 30px rgba(14,116,144,0.18)" }}>
              <img
                src={activeRound.image}
                alt={activeRound.label}
                style={{
                  width: isMobile ? 'min(320px, 88vw)' : 'min(450px, 92vw)',
                  maxHeight: isMobile ? "34vh" : "42vh",
                  objectFit: "contain",
                  filter: "drop-shadow(0 12px 16px rgba(14,116,144,0.2))",
                }}
              />
            </div>

            <div
              style={{
                margin: "18px auto 6px auto",
                width: "min(760px, 92vw)",
                height: isMobile ? "92px" : "118px",
                borderRadius: "26px",
                background: "linear-gradient(180deg,#E0F2FE 0%,#BAE6FD 48%,#38BDF8 49%,#0284C7 100%)",
                border: "3px solid rgba(255,255,255,0.85)",
                boxShadow: "inset 0 3px 12px rgba(255,255,255,0.52), 0 12px 26px rgba(14,116,144,0.2)",
                position: "relative",
                overflow: "hidden",
              }}
              aria-label={`කකුළුවා නිධන් පෙට්ටියට ළඟා වීමට ඉතිරි කාලය තත්පර ${countdown}`}
            >
              <motion.div aria-hidden="true" animate={{ x:[0,-48] }} transition={{ duration:2.4, repeat:Infinity, ease:"linear" }}
                style={{ position:"absolute", left:-48, right:-48, top:isMobile ? 38 : 50, height:38 }}>
                <svg viewBox="0 0 720 44" width="140%" height="100%" preserveAspectRatio="none">
                  <path d="M0 22 Q24 3 48 22 T96 22 T144 22 T192 22 T240 22 T288 22 T336 22 T384 22 T432 22 T480 22 T528 22 T576 22 T624 22 T672 22 T720 22 L720 44 L0 44 Z" fill="rgba(255,255,255,0.58)" />
                </svg>
              </motion.div>
              <motion.div aria-hidden="true" animate={{ x:[-56,0] }} transition={{ duration:3.1, repeat:Infinity, ease:"linear" }}
                style={{ position:"absolute", left:-56, right:-56, top:isMobile ? 57 : 76, height:35 }}>
                <svg viewBox="0 0 720 44" width="140%" height="100%" preserveAspectRatio="none">
                  <path d="M0 22 Q28 7 56 22 T112 22 T168 22 T224 22 T280 22 T336 22 T392 22 T448 22 T504 22 T560 22 T616 22 T672 22 T728 22 L728 44 L0 44 Z" fill="rgba(3,105,161,0.38)" />
                </svg>
              </motion.div>

              <div aria-hidden="true" style={{ position:"absolute", left:12, right:isMobile ? 70 : 92, top:8, height:8, borderRadius:999, background:"rgba(255,255,255,0.45)", overflow:"hidden" }}>
                <div style={{ width:`${100 - barPercent}%`, height:"100%", borderRadius:999, background:"linear-gradient(90deg,#34D399,#FBBF24,#FB7185)", transition:"width 0.1s linear" }} />
              </div>

              <motion.div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: isMobile ? 27 : 35,
                  left: `calc(${Math.min(80, (100 - barPercent) * 0.8)}% - ${isMobile ? 25 : 34}px)`,
                  width: isMobile ? 62 : 82,
                  height: isMobile ? 62 : 82,
                  zIndex: 10,
                  transition: "left 0.1s linear",
                }}
                animate={{
                  y: [0, -5, 0],
                  rotate: [-5, 5, -5],
                  scaleX: [1, 0.96, 1],
                }}
                transition={{
                  duration: 0.55,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <img
                  src={timerCrabImage}
                  alt="නිධන් පෙට්ටිය දෙසට යන කකුළුවා"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    filter: "drop-shadow(0 7px 10px rgba(3,105,161,0.28))",
                  }}
                />
              </motion.div>

              <motion.img src={timerTreasureChestImage} alt="සතුටු නිධන් පෙට්ටිය" aria-hidden="true"
                animate={{ scale:[1,1.08,1], rotate:[-2,2,-2] }} transition={{ duration:1.8, repeat:Infinity, ease:"easeInOut" }}
                style={{ position:"absolute", right:isMobile ? 5 : 8, bottom:isMobile ? 5 : 7, width:isMobile ? 66 : 88, height:isMobile ? 66 : 88, objectFit:"contain", filter:"drop-shadow(0 7px 10px rgba(3,105,161,0.25))", zIndex:9 }} />

              <span style={{ position:"absolute", left:12, bottom:7, padding:"4px 9px", borderRadius:999, background:"rgba(255,255,255,0.8)", color:"#075985", fontSize:isMobile ? 11 : 13, fontWeight:900, zIndex:12 }}>
                කකුළුවා නිධන් පෙට්ටියට යනවා!
              </span>

            </div>
          </div>
        )}

        {phase === "play" && (
          <div style={{ marginTop: isMobile ? "10px" : "14px" }}>
            <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
              style={{ margin:"0 auto 12px", width:"fit-content", maxWidth:"94%", borderRadius:999, padding:isMobile ? "8px 14px" : "9px 18px", background:"linear-gradient(135deg,#D1FAE5,#E0F2FE)", border:"2px solid #6EE7B7", color:"#065F46", fontSize:isMobile ? 16 : 19, fontWeight:900, textAlign:"center", boxShadow:"0 8px 18px rgba(5,150,105,0.14)" }}>
              කොටස අල්ලාගෙන හරි තැනට දමන්න
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: "none",
                margin: "0 auto 12px auto",
                width: "fit-content",
                maxWidth: "94%",
                borderRadius: "999px",
                padding: isMobile ? "8px 14px" : "9px 18px",
                background: "rgba(224,242,254,0.92)",
                border: "2px solid #7dd3fc",
                color: "#0c4a6e",
                fontSize: isMobile ? "16px" : "19px",
                fontWeight: 900,
                textAlign: "center",
                boxShadow: "0 8px 18px rgba(14,116,144,0.12)",
              }}
            >
              කොටස අල්ලාගෙන වම් පැත්තේ හරි තැනට දමන්න
            </motion.div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1.08fr) minmax(0, 0.92fr)",
                gap: isMobile ? "14px" : "18px",
                alignItems: "start",
                width: "100%",
              }}
            >
              {/* LEFT / TOP: PUZZLE BOARD */}
              <motion.section
                initial={{ opacity: 0, x: isMobile ? 0 : -18, y: isMobile ? 10 : 0 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.35 }}
                style={{
                  borderRadius: "22px",
                  border: "3px solid #7dd3fc",
                  background: "linear-gradient(180deg,rgba(240,249,255,0.96),rgba(224,242,254,0.94))",
                  padding: isMobile ? "12px" : "16px",
                  boxShadow: "0 14px 30px rgba(14,116,144,0.16)",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    marginBottom: "12px",
                    color: "#075985",
                    fontWeight: 900,
                    fontSize: 0,
                  }}
                >
                  <span style={{ fontSize:isMobile ? 18 : 21 }}>පින්තූරය හදමු</span>
                  <span aria-hidden="true" style={{ fontSize: isMobile ? 22 : 26 }}>🧩</span>
                  <span>පින්තූරය හදමු</span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                    gap: isMobile ? "8px" : "10px",
                    justifyContent: "center",
                    width: "100%",
                    maxWidth:
                      cols === 3
                        ? isMobile
                          ? "350px"
                          : "500px"
                        : isMobile
                          ? "330px"
                          : "430px",
                    margin: "0 auto",
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
                        animate={
                          wrongPulseSlot === slotIndex
                            ? {
                                x: [0, -5, 5, -4, 4, 0],
                                scale: [1, 0.98, 1],
                                borderColor: ["#38bdf8", "#fb923c", "#38bdf8"],
                              }
                            : { x: 0, scale: 1 }
                        }
                        transition={{ duration: 0.35 }}
                        style={{
                          width: "100%",
                          aspectRatio: "1 / 1",
                          borderRadius: isMobile ? "12px" : "15px",
                          border: piece ? "3px solid #22c55e" : "3px dashed #38bdf8",
                          background: piece
                            ? "rgba(220,252,231,0.55)"
                            : "rgba(186,230,253,0.48)",
                          display: "grid",
                          placeItems: "center",
                          overflow: "hidden",
                          boxShadow: piece
                            ? "0 8px 18px rgba(34,197,94,0.14)"
                            : "inset 0 2px 8px rgba(14,116,144,0.08)",
                        }}
                      >
                        {piece ? (
                          <motion.div
                            initial={{ scale: 0.88, opacity: 0 }}
                            animate={{ scale: [0.88, 1.05, 1], opacity: 1 }}
                            transition={{ duration: 0.35 }}
                            style={{
                              width: "100%",
                              height: "100%",
                              borderRadius: isMobile ? "10px" : "13px",
                              overflow: "hidden",
                            }}
                          >
                            <PuzzlePiece piece={piece} isGhost />
                          </motion.div>
                        ) : (
                          <span
                            style={{
                              color: "#0369a1",
                              fontWeight: 900,
                              fontSize: isMobile ? "13px" : "15px",
                            }}
                          >
                            තැන {slotIndex + 1}
                          </span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                <div
                  style={{
                    marginTop: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    color: "#0f766e",
                    fontWeight: 900,
                    fontSize: 0,
                  }}
                >
                  <span style={{ fontSize:isMobile ? 15 : 18 }}>සම්පූර්ණ කළ කොටස්: {completionCount} / {totalPieces}</span>
                  <span aria-hidden="true">🌊</span>
                  <span>
                    සම්පූර්ණ කළ කොටස්: {completionCount} / {totalPieces}
                  </span>
                </div>
                <div style={{ width:"min(100%,420px)", height:14, margin:"8px auto 0", borderRadius:999, overflow:"hidden", background:"#E2E8F0", border:"2px solid #BAE6FD" }}>
                  <motion.div animate={{ width:`${(completionCount / totalPieces) * 100}%` }} transition={{ duration:0.35, ease:"easeOut" }}
                    style={{ height:"100%", borderRadius:999, background:"linear-gradient(90deg,#34D399,#0EA5E9)" }} />
                </div>
              </motion.section>

              {/* RIGHT / BOTTOM: PIECES TRAY */}
              <motion.section
                initial={{ opacity: 0, x: isMobile ? 0 : 18, y: isMobile ? 10 : 0 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
                style={{
                  borderRadius: "22px",
                  border: "3px solid #bfdbfe",
                  background: "linear-gradient(180deg,rgba(239,246,255,0.98),rgba(219,234,254,0.94))",
                  padding: isMobile ? "12px" : "16px",
                  boxShadow: "0 14px 30px rgba(29,78,216,0.12)",
                  minWidth: 0,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <motion.div
                  aria-hidden="true"
                  animate={{ y: [0, -7, 0], rotate: [-3, 3, -3] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    position: "absolute",
                    right: isMobile ? "-12px" : "-8px",
                    top: isMobile ? "-8px" : "-12px",
                    width: isMobile ? "70px" : "86px",
                    opacity: 0.2,
                    pointerEvents: "none",
                  }}
                >
                  <img
                    src={dolphinImage}
                    alt=""
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                </motion.div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    marginBottom: "12px",
                    color: "#1d4ed8",
                    fontWeight: 900,
                    fontSize: 0,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <span style={{ fontSize:isMobile ? 18 : 21 }}>කොටස් මෙතනින් ගන්න</span>
                  <span aria-hidden="true" style={{ fontSize: isMobile ? 22 : 26 }}>🐠</span>
                  <span>කොටස් මෙතනින් ගන්න</span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                    gap: isMobile ? "8px" : "10px",
                    justifyContent: "center",
                    width: "100%",
                    maxWidth:
                      cols === 3
                        ? isMobile
                          ? "350px"
                          : "450px"
                        : isMobile
                          ? "330px"
                          : "390px",
                    margin: "0 auto",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {trayIds.map((pieceId) => {
                    const piece = pieceMap[pieceId];
                    if (!piece) return null;

                    return (
                      <motion.div
                        key={pieceId}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={!isMobile ? { y: -3, scale: 1.02 } : undefined}
                        style={{
                          width: "100%",
                          aspectRatio: "1 / 1",
                          minWidth: 0,
                        }}
                      >
                        <PuzzlePiece
                          piece={piece}
                          onPointerDown={(event) =>
                            onPiecePointerDown(event, pieceId)
                          }
                        />
                      </motion.div>
                    );
                  })}
                </div>

                {trayIds.length > 0 && (
                  <p
                    style={{
                      display: "none",
                      margin: "12px 0 0 0",
                      textAlign: "center",
                      color: "#475569",
                      fontSize: isMobile ? "13px" : "15px",
                      fontWeight: 800,
                      lineHeight: 1.35,
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    වැරදි තැනකට දැම්මොත් කොටස ආපහු මෙතනට එයි.
                  </p>
                )}
                {trayIds.length > 0 && (
                  <p style={{ margin:"12px 0 0", textAlign:"center", color:"#475569", fontSize:isMobile ? 13 : 15, fontWeight:800, lineHeight:1.35, position:"relative", zIndex:1 }}>
                    වැරදි තැනකට දැම්මොත් කොටස නැවත මෙතැනට එයි. ආයෙත් උත්සාහ කරමු!
                  </p>
                )}
              </motion.section>
            </div>
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
