import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";

import { useProgress } from "../context/ProgressContext";
import { predictShape } from "../api/workingMemoryApi";
import { adaptShapeRecallConfig } from "../utils/adaptiveDifficulty";

import circleImage from "../assets/mlIMG/circle.jpg";
import squareImage from "../assets/mlIMG/square.webp";
import triangleImage from "../assets/mlIMG/triangle.avif";
import shapeSeahorseLevelBoard from "../assets/shape-seahorse-level-board-generated.png";
import shapeTimerCrab from "../assets/timer-crab-generated.png";
import shapeTimerTreasure from "../assets/timer-treasure-chest-generated.png";

const GAME_ID = "memory-shape-recall";

/* =========================================================
   SHAPES
========================================================= */

const SHAPES = [
  {
    id: "circle",
    label: "වෘත්තය",
    image: circleImage,
  },
  {
    id: "square",
    label: "චතුරස්‍රය",
    image: squareImage,
  },
  {
    id: "triangle",
    label: "ත්‍රිකෝණය",
    image: triangleImage,
  },
];

/* =========================================================
   LEVEL 1 - 3 GAMES
========================================================= */

const GAME_CONFIG = {
  1: {
    gameNumber: 1,
    cardCount: 3,
    revealTime: 8000,
    label: "හැඩ තුනක් මතක තබාගන්න",
  },

  2: {
    gameNumber: 2,
    cardCount: 4,
    revealTime: 10000,
    label: "හැඩ හතරක් මතක තබාගන්න",
  },

  3: {
    gameNumber: 3,
    cardCount: 6,
    revealTime: 12000,
    label: "හැඩ හයක් මතක තබාගන්න",
  },
};

/* =========================================================
   HELPERS
========================================================= */

const shuffle = (array) => {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
};

const normalizeShape = (shape) => {
  if (!shape || typeof shape !== "string") {
    return "";
  }

  return shape.trim().toLowerCase();
};

const getShape = (id) => {
  return SHAPES.find((shape) => shape.id === id);
};

const getConfidenceText = (confidence) => {
  if (confidence < 0.5) return "හඳුනාගත නොහැක";
  if (confidence < 0.6) return "අඩුයි";
  if (confidence < 0.7) return "මධ්‍යමයි";
  if (confidence < 0.8) return "හොඳයි";

  return "ඉතා හොඳයි";
};

/* =========================================================
   CARD
========================================================= */

const MemoryCard = ({
  card,
  index,
  flipped,
  selected,
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.8,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        delay: index * 0.08,
        type: "spring",
        stiffness: 250,
      }}
      className="perspective-[1000px]"
    >
      <motion.div
        animate={{
          rotateY: flipped ? 180 : 0,
          scale: selected ? 1.05 : 1,
        }}
        transition={{
          duration: 0.65,
          ease: "easeInOut",
        }}
        className="relative h-[150px] w-full"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* FRONT */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center rounded-[2rem] border-4 border-white bg-gradient-to-br from-white to-sky-50 shadow-xl ${
            selected ? "ring-4 ring-yellow-300" : ""
          }`}
          style={{
            backfaceVisibility: "hidden",
          }}
        >
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl bg-white shadow-md">
            <img
              src={card.image}
              alt={card.label}
              className="h-full w-full object-contain p-3"
            />
          </div>

          <div className="mt-2 text-xs font-black text-slate-500">
            හැඩය {index + 1}
          </div>
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-[2rem] border-4 border-white bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500 shadow-xl"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-lg">
            <span className="text-3xl font-black text-blue-600">
              {index + 1}
            </span>
          </div>

          <p className="mt-2 text-sm font-black text-white">
            කාඩ්පත {index + 1}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ShapePreviewSea = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-cyan-300 to-blue-500" />
    {[8,22,41,63,82].map((left,index) => (
      <motion.span key={left} className="absolute bottom-[-24px] rounded-full border-2 border-white/60 bg-white/20"
        style={{ left:`${left}%`, width:12 + index * 3, height:12 + index * 3 }}
        animate={{ y:[0,-620], x:[0,index % 2 ? 12 : -10,0], opacity:[0,.8,0] }}
        transition={{ duration:7 + index, delay:index * .7, repeat:Infinity, ease:"linear" }} />
    ))}
    {[0,1].map(index => (
      <motion.div key={index} className="absolute left-[-110px]" style={{ top:index ? "62%" : "22%" }}
        animate={{ x:[0,"115vw"], y:[0,-12,8,0] }} transition={{ duration:index ? 17 : 13, delay:index * 3, repeat:Infinity, ease:"linear" }}>
        <svg viewBox="0 0 90 52" width={index ? 64 : 82} height={index ? 38 : 48}>
          <ellipse cx="52" cy="26" rx="29" ry="18" fill={index ? "#F472B6" : "#FBBF24"}/><polygon points="24,26 5,8 5,44" fill={index ? "#EC4899" : "#F59E0B"}/><circle cx="68" cy="20" r="5" fill="white"/><circle cx="69" cy="20" r="2.5" fill="#075985"/>
        </svg>
      </motion.div>
    ))}
    <motion.div className="absolute -bottom-3 left-[-8%] h-20 w-[116%] rounded-[50%] bg-blue-600/30"
      animate={{ x:[-20,20,-20], y:[0,-5,0] }} transition={{ duration:5, repeat:Infinity, ease:"easeInOut" }} />
    <motion.div className="absolute bottom-6 left-[-8%] h-14 w-[116%] rounded-[50%] bg-white/20"
      animate={{ x:[18,-18,18], y:[0,5,0] }} transition={{ duration:4, repeat:Infinity, ease:"easeInOut" }} />
  </div>
);

const ShapeCrabTimer = ({ durationMs, seconds }) => (
  <div className="relative mx-auto mb-5 h-[100px] w-full max-w-2xl overflow-hidden rounded-[1.7rem] border-[3px] border-white/90 shadow-lg"
    style={{ background:"linear-gradient(180deg,#E0F2FE 0%,#BAE6FD 43%,#38BDF8 44%,#0369A1 100%)" }}
    aria-label={`හැඩ බැලීමට ඉතිරි කාලය තත්පර ${seconds}`}>
    <motion.div className="absolute left-[-45px] right-[-45px] top-10 h-10" animate={{ x:[0,-46] }} transition={{ duration:2.4, repeat:Infinity, ease:"linear" }} aria-hidden="true">
      <svg viewBox="0 0 720 44" width="140%" height="100%" preserveAspectRatio="none"><path d="M0 22 Q24 3 48 22 T96 22 T144 22 T192 22 T240 22 T288 22 T336 22 T384 22 T432 22 T480 22 T528 22 T576 22 T624 22 T672 22 T720 22 L720 44 L0 44 Z" fill="rgba(255,255,255,.58)"/></svg>
    </motion.div>
    <motion.div className="absolute left-[-55px] right-[-55px] top-[62px] h-9" animate={{ x:[-54,0] }} transition={{ duration:3.1, repeat:Infinity, ease:"linear" }} aria-hidden="true">
      <svg viewBox="0 0 720 44" width="140%" height="100%" preserveAspectRatio="none"><path d="M0 22 Q28 7 56 22 T112 22 T168 22 T224 22 T280 22 T336 22 T392 22 T448 22 T504 22 T560 22 T616 22 T672 22 T728 22 L728 44 L0 44 Z" fill="rgba(3,105,161,.38)"/></svg>
    </motion.div>
    <motion.div className="absolute left-2 top-6 z-10 h-16 w-16" initial={{ left:"2%" }} animate={{ left:"76%", y:[0,-5,0], rotate:[-5,5,-5] }} transition={{ left:{ duration:durationMs / 1000, ease:"linear" }, y:{ duration:.55, repeat:Infinity }, rotate:{ duration:.55, repeat:Infinity } }} aria-hidden="true">
      <img src={shapeTimerCrab} alt="" className="h-full w-full object-contain" style={{ filter:"drop-shadow(0 6px 8px rgba(3,105,161,.28))" }}/>
    </motion.div>
    <motion.img src={shapeTimerTreasure} alt="" className="absolute bottom-1 right-1 z-[9] h-[78px] w-[78px] object-contain" animate={{ scale:[1,1.07,1] }} transition={{ duration:1.6, repeat:Infinity }} aria-hidden="true"/>
    <div className="absolute left-3 top-2 z-20 rounded-full bg-white/90 px-3 py-1 text-sm font-black text-sky-800">තත්පර {seconds}</div>
    <div className="absolute bottom-1 left-3 z-20 rounded-full bg-white/85 px-3 py-1 text-[11px] font-black text-sky-800">කකුළුවා නිධානයට යනවා!</div>
  </div>
);

const ShapeRecallIntro = ({ level, onStart }) => (
  <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
    className="relative z-10 grid w-full overflow-x-hidden rounded-[2rem] border-4 border-white bg-white/95 shadow-2xl md:grid-cols-[.9fr_1.1fr]"
    style={{ maxHeight:"calc(100dvh - 128px)", overflowY:"auto", padding:"14px", gap:14 }}>
    <div className="flex min-h-[230px] items-center justify-center rounded-3xl bg-gradient-to-br from-yellow-50 via-sky-50 to-white">
      <motion.div className="relative w-[170px] md:w-[295px]" animate={{ y:[0,-6,0], rotate:[-1,1,-1] }} transition={{ duration:3, repeat:Infinity }}>
        <img src={shapeSeahorseLevelBoard} alt={`මුහුදු අශ්ව යාළුවා මට්ටම ${level} පුවරුව අල්ලාගෙන සිටී`} className="block h-auto w-full" style={{ filter:"drop-shadow(0 14px 20px rgba(2,132,199,.22))" }}/>
        <div className="absolute flex flex-col items-center justify-center text-center" style={{ left:"24%", right:"8%", top:"45%", bottom:"19%" }}>
          <span className="text-[9px] font-black text-slate-500 md:text-sm">හැඩ මතකය</span>
          <span className="text-4xl font-black leading-none text-sky-600 md:text-6xl">{level}</span>
          <span className="text-[9px] font-extrabold text-slate-700 md:text-sm">හැඩ පිළිවෙල මතකයි</span>
        </div>
      </motion.div>
    </div>
    <div className="flex min-w-0 flex-col justify-center gap-3 pb-16 text-center md:pb-0">
      <div><h2 className="text-3xl font-black text-slate-800">හැඩ මතකය</h2><p className="font-bold text-sky-700">දැක්ක හැඩ පිළිවෙල මතක තබාගමු!</p></div>
      <div className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-3 font-bold leading-relaxed text-slate-700">කාඩ්වල හැඩ හොඳින් බලන්න. පසුව අසන හැඩය තෝරා හෝ ඇඳලා පෙන්වන්න.</div>
      <div className="flex items-center justify-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-full bg-pink-400"></span><span className="text-xl font-black text-slate-400">›</span><span className="h-12 w-12 rotate-45 rounded-lg bg-violet-500"></span><span className="text-xl font-black text-slate-400">›</span><span className="h-0 w-0 border-x-[24px] border-b-[44px] border-x-transparent border-b-amber-400"></span></div>
      <div className="grid grid-cols-3 gap-2 text-xs font-black text-slate-700"><div className="rounded-xl bg-sky-100 p-2">1. බලන්න</div><div className="rounded-xl bg-violet-100 p-2">2. මතක තබන්න</div><div className="rounded-xl bg-emerald-100 p-2">3. උත්තර දෙන්න</div></div>
      <p className="text-sm font-bold text-amber-700">ඔයාට උත්සාහ තුනක් තියෙනවා</p>
      <motion.button type="button" onClick={onStart} whileTap={{ scale:.95 }} whileHover={{ scale:1.03 }} className="fixed bottom-3 left-5 right-5 z-40 rounded-full bg-gradient-to-r from-sky-500 to-violet-600 px-6 py-4 text-lg font-black text-white shadow-xl md:static">මුහුදු අශ්වයා එක්ක පටන් ගමු!</motion.button>
    </div>
  </motion.div>
);

/* =========================================================
   MAIN GAME
========================================================= */

const MemoryShapeRecallGame = ({
  level = 1,
  onComplete,
}) => {
  const safeLevel = Number(level) === 2 ? 2 : 1;

  const {
    initializeGame,
    completeLevel,
    updateLevelProgress,
    recordAdaptiveResult,
    getAdaptiveProfile,
  } = useProgress();

  const adaptiveProfile = getAdaptiveProfile(GAME_ID);
  const getGameConfig = useCallback(
    (game) => adaptShapeRecallConfig(GAME_CONFIG[game], adaptiveProfile, safeLevel),
    [adaptiveProfile.score, adaptiveProfile.tier, safeLevel],
  );

  /* =======================================================
     GAME STATE
  ======================================================= */

  const [gameNumber, setGameNumber] = useState(1);

  const [attempt, setAttempt] = useState(1);

  const [phase, setPhase] = useState("intro");

  const [cards, setCards] = useState([]);

  const [questionIndex, setQuestionIndex] = useState(null);

  const [timeLeft, setTimeLeft] = useState(5);

  const [message, setMessage] = useState("");

  const [score, setScore] = useState(0);

  /* =======================================================
     LEVEL RESULT
  ======================================================= */

  const [completedGames, setCompletedGames] = useState([]);

  const [gameAttempts, setGameAttempts] = useState({});

  const [finalResult, setFinalResult] = useState({
    correct: false,
    accuracy: 0,
    completedGames: 0,
    totalAttempts: 0,
    mistakes: 0,
  });

  /* =======================================================
     PREDICTION STATE
  ======================================================= */

  const [analysis, setAnalysis] = useState({
    status: "idle",
    predicted: null,
    confidence: 0,
    confidenceLevel: "හඳුනාගත නොහැක",
    matched: null,
  });

  /* =======================================================
     IMAGE INPUT
  ======================================================= */

  const [selectedFile, setSelectedFile] = useState(null);

  const [selectedPreview, setSelectedPreview] = useState("");

  const [drawingSource, setDrawingSource] = useState("canvas");

  const [hasDrawing, setHasDrawing] = useState(false);

  /* =======================================================
     CANVAS
  ======================================================= */

  const canvasRef = useRef(null);

  const canvasWrapperRef = useRef(null);

  const ctxRef = useRef(null);

  const lastPointRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);

  /* =======================================================
     INPUT REFS
  ======================================================= */

  const fileInputRef = useRef(null);

  const cameraInputRef = useRef(null);

  const timerRef = useRef(null);

  const previewUrlRef = useRef("");

  const answerStartTimeRef = useRef(null);
  const responseTimesRef = useRef([]);

  /* =======================================================
     INITIALIZE
  ======================================================= */

  useEffect(() => {
    initializeGame(GAME_ID);
  }, [initializeGame]);

  /* =======================================================
     RESET PREVIEW
  ======================================================= */

  const clearPreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }

    setSelectedFile(null);
    setSelectedPreview("");
  }, []);

  /* =======================================================
     RESET ANALYSIS
  ======================================================= */

  const resetAnalysis = useCallback(() => {
    setAnalysis({
      status: "idle",
      predicted: null,
      confidence: 0,
      confidenceLevel: "හඳුනාගත නොහැක",
      matched: null,
    });
  }, []);

  /* =======================================================
     CANVAS BACKGROUND
  ======================================================= */

  const drawCanvasBackground = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    if (!canvas || !ctx) {
      return;
    }

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "#ffffff";

    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "#dbeafe";

    ctx.lineWidth = 2;

    ctx.setLineDash([8, 8]);

    ctx.strokeRect(
      15,
      15,
      width - 30,
      height - 30
    );

    ctx.setLineDash([]);

    ctx.strokeStyle = "#0ea5e9";

    ctx.lineWidth = 10;

    ctx.lineCap = "round";

    ctx.lineJoin = "round";
  }, []);

  /* =======================================================
     RESIZE CANVAS
  ======================================================= */

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;

    const wrapper = canvasWrapperRef.current;

    if (!canvas || !wrapper) {
      return;
    }

    const rect = wrapper.getBoundingClientRect();

    const width = Math.max(
      280,
      rect.width
    );

    const height = Math.min(
      400,
      Math.max(
        280,
        window.innerHeight * 0.38
      )
    );

    const ratio =
      window.devicePixelRatio || 1;

    canvas.width = width * ratio;

    canvas.height = height * ratio;

    canvas.style.width = `${width}px`;

    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    ctx.setTransform(
      ratio,
      0,
      0,
      ratio,
      0,
      0
    );

    ctx.lineCap = "round";

    ctx.lineJoin = "round";

    ctx.strokeStyle = "#0ea5e9";

    ctx.lineWidth = 10;

    ctxRef.current = ctx;

    drawCanvasBackground();
  }, [drawCanvasBackground]);

  useEffect(() => {
    if (phase !== "answer") {
      return;
    }

    resizeCanvas();

    window.addEventListener(
      "resize",
      resizeCanvas
    );

    return () => {
      window.removeEventListener(
        "resize",
        resizeCanvas
      );
    };
  }, [phase, resizeCanvas]);

  /* =======================================================
     CLEAR DRAWING
  ======================================================= */

  const clearDrawing = useCallback(() => {
    drawCanvasBackground();

    setHasDrawing(false);

    resetAnalysis();

    setMessage("");
  }, [
    drawCanvasBackground,
    resetAnalysis,
  ]);

  /* =======================================================
     CREATE GAME CARDS
  ======================================================= */

  const createCardsForGame = useCallback(
    (game) => {
      const config = getGameConfig(game);
      const shapeOffset = Math.floor(Math.random() * SHAPES.length);
      const generatedCards = shuffle(
        Array.from(
          { length: config.cardCount },
          (_, index) => SHAPES[(index + shapeOffset) % SHAPES.length],
        ),
      ).map((shape) => ({ ...shape }));

      const randomQuestion =
        Math.floor(
          Math.random() *
            config.cardCount
        );

      setCards(generatedCards);

      setQuestionIndex(
        randomQuestion
      );

      setGameNumber(game);

      setAttempt(1);

      setTimeLeft(
        Math.ceil(
          config.revealTime / 1000
        )
      );

      resetAnalysis();

      clearPreview();

      setHasDrawing(false);

      setScore(0);

      setMessage("");

      answerStartTimeRef.current = null;

      setPhase("memorize");
    },
    [
      clearPreview,
      getGameConfig,
      resetAnalysis,
    ]
  );

  /* =======================================================
     START LEVEL 1
  ======================================================= */

  const startGame = useCallback(() => {
    setCompletedGames([]);

    setGameAttempts({});
    responseTimesRef.current = [];

    setFinalResult({
      correct: false,
      accuracy: 0,
      completedGames: 0,
      totalAttempts: 0,
      mistakes: 0,
    });

    createCardsForGame(1);
  }, [createCardsForGame]);

  /* =======================================================
     MEMORIZE TIMER
  ======================================================= */

  useEffect(() => {
    if (phase !== "memorize") {
      return;
    }

    const config = getGameConfig(gameNumber);

    let remaining =
      Math.ceil(
        config.revealTime / 1000
      );

    setTimeLeft(remaining);

    timerRef.current =
      setInterval(() => {
        remaining -= 1;

        setTimeLeft(
          Math.max(
            remaining,
            0
          )
        );

        if (remaining <= 0) {
          clearInterval(
            timerRef.current
          );

          setTimeout(() => {
            setPhase("question");

            setMessage(
              `කාඩ්පත ${
                questionIndex + 1
              } හි තිබුණු හැඩය මතකද?`
            );
          }, 250);
        }
      }, 1000);

    return () => {
      clearInterval(
        timerRef.current
      );
    };
  }, [
    phase,
    getGameConfig,
    gameNumber,
    questionIndex,
  ]);

  /* =======================================================
     START ANSWER
  ======================================================= */

  const startAnswer = () => {
    setPhase("answer");

    setMessage(
      `කාඩ්පත ${
        questionIndex + 1
      } හි තිබුණු හැඩය මතකයෙන් හඳුනාගන්න.`
    );

    answerStartTimeRef.current =
      Date.now();

    setTimeout(() => {
      resizeCanvas();
    }, 100);
  };

  /* =======================================================
     POINTER POSITION
  ======================================================= */

  const getPointerPosition = (
    event
  ) => {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return null;
    }

    const rect =
      canvas.getBoundingClientRect();

    return {
      x:
        event.clientX -
        rect.left,

      y:
        event.clientY -
        rect.top,
    };
  };

  /* =======================================================
     DRAW LINE
  ======================================================= */

  const drawLine = (point) => {
    const ctx = ctxRef.current;

    if (!ctx || !point) {
      return;
    }

    const previous =
      lastPointRef.current;

    if (!previous) {
      lastPointRef.current =
        point;

      return;
    }

    ctx.beginPath();

    ctx.moveTo(
      previous.x,
      previous.y
    );

    ctx.lineTo(
      point.x,
      point.y
    );

    ctx.stroke();

    lastPointRef.current =
      point;

    setHasDrawing(true);
  };

  /* =======================================================
     POINTER DOWN
  ======================================================= */

  const handlePointerDown = (
    event
  ) => {
    if (phase !== "answer") {
      return;
    }

    if (
      analysis.status ===
      "loading"
    ) {
      return;
    }

    event.preventDefault();

    const point =
      getPointerPosition(event);

    if (!point) {
      return;
    }

    setIsDrawing(true);

    lastPointRef.current =
      point;
  };

  /* =======================================================
     POINTER MOVE
  ======================================================= */

  const handlePointerMove = (
    event
  ) => {
    if (!isDrawing) {
      return;
    }

    event.preventDefault();

    const point =
      getPointerPosition(event);

    drawLine(point);
  };

  /* =======================================================
     POINTER UP
  ======================================================= */

  const handlePointerUp = () => {
    setIsDrawing(false);

    lastPointRef.current =
      null;
  };

  /* =======================================================
     FILE PICK
  ======================================================= */

  const handleFilePick = (
    event,
    source
  ) => {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    clearPreview();

    const url =
      URL.createObjectURL(file);

    previewUrlRef.current =
      url;

    setSelectedFile(file);

    setSelectedPreview(url);

    setDrawingSource(source);

    setHasDrawing(false);

    resetAnalysis();

    setMessage(
      source === "camera"
        ? "කැමරා පින්තූරය ලැබුණා! දැන් පරීක්ෂා කරමු."
        : "පින්තූරය ලැබුණා! දැන් පරීක්ෂා කරමු."
    );
  };

  /* =======================================================
     CANVAS TO BLOB
  ======================================================= */

  const canvasToBlob =
    useCallback(() => {
      const canvas =
        canvasRef.current;

      if (!canvas) {
        return Promise.resolve(
          null
        );
      }

      return new Promise(
        (
          resolve,
          reject
        ) => {
          const sourceCtx = canvas.getContext("2d");

          if (!sourceCtx) {
            reject(new Error("Canvas unavailable"));
            return;
          }

          const { width, height } = canvas;
          const pixels = sourceCtx.getImageData(0, 0, width, height).data;
          let minX = width;
          let minY = height;
          let maxX = -1;
          let maxY = -1;

          // Only preserve the strong blue pen stroke. This deliberately ignores
          // the pale-blue dashed guide frame and the white canvas background.
          const isDrawingPixel = (red, green, blue, alpha) => (
            alpha > 0
            && blue - red >= 60
            && green - red >= 70
            && ((red + green + blue) / 3) < 210
          );

          for (let y = 0; y < height; y += 1) {
            for (let x = 0; x < width; x += 1) {
              const offset = (y * width + x) * 4;
              if (!isDrawingPixel(
                pixels[offset],
                pixels[offset + 1],
                pixels[offset + 2],
                pixels[offset + 3],
              )) continue;

              minX = Math.min(minX, x);
              minY = Math.min(minY, y);
              maxX = Math.max(maxX, x);
              maxY = Math.max(maxY, y);
            }
          }

          if (maxX < minX || maxY < minY) {
            resolve(null);
            return;
          }

          const padding = Math.max(24, Math.round(Math.max(maxX - minX, maxY - minY) * 0.2));
          const cropX = Math.max(0, minX - padding);
          const cropY = Math.max(0, minY - padding);
          const cropWidth = Math.min(width - cropX, maxX - minX + (padding * 2));
          const cropHeight = Math.min(height - cropY, maxY - minY + (padding * 2));

          // A square, high-contrast image is much closer to a model-training
          // sample than the full responsive drawing canvas.
          const output = document.createElement("canvas");
          output.width = 640;
          output.height = 640;

          const ctx = output.getContext("2d");

          if (!ctx) {
            reject(
              new Error(
                "Canvas unavailable"
              )
            );

            return;
          }

          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, output.width, output.height);

          const scale = Math.min(output.width / cropWidth, output.height / cropHeight) * 0.84;
          const drawWidth = cropWidth * scale;
          const drawHeight = cropHeight * scale;
          const drawX = (output.width - drawWidth) / 2;
          const drawY = (output.height - drawHeight) / 2;

          ctx.drawImage(canvas, cropX, cropY, cropWidth, cropHeight, drawX, drawY, drawWidth, drawHeight);

          // Convert the blue pen to a bold black outline and remove any guide
          // pixels that were carried into the crop.
          const normalized = ctx.getImageData(0, 0, output.width, output.height);
          for (let offset = 0; offset < normalized.data.length; offset += 4) {
            const red = normalized.data[offset];
            const green = normalized.data[offset + 1];
            const blue = normalized.data[offset + 2];
            if (isDrawingPixel(red, green, blue, normalized.data[offset + 3])) {
              normalized.data[offset] = 0;
              normalized.data[offset + 1] = 0;
              normalized.data[offset + 2] = 0;
            } else {
              normalized.data[offset] = 255;
              normalized.data[offset + 1] = 255;
              normalized.data[offset + 2] = 255;
            }
          }
          ctx.putImageData(normalized, 0, 0);

          output.toBlob(
            (blob) => {
              if (blob) {
                resolve(new File([blob], "canvas-shape.png", { type: "image/png" }));
              } else {
                reject(
                  new Error(
                    "Image export failed"
                  )
                );
              }
            },
            "image/png"
          );
        }
      );
    }, []);

  /* =======================================================
     GET SUBMISSION
  ======================================================= */

  const getSubmissionFile =
    useCallback(
      async () => {
        if (selectedFile) {
          return selectedFile;
        }

        if (hasDrawing) {
          return canvasToBlob();
        }

        return null;
      },
      [
        canvasToBlob,
        hasDrawing,
        selectedFile,
      ]
    );

  const buildPerformanceMetrics = useCallback(
    (completedGameNumbers, attemptsByGame) => {
      const maxAttempts = getGameConfig(1).maxAttempts;
      const totalGames = 3;
      const totalAttempts = Object.values(attemptsByGame).reduce(
        (sum, value) => sum + Number(value || 0),
        0,
      );
      const masteryPoints = completedGameNumbers.reduce(
        (sum, game) => sum + Math.max(0, (maxAttempts - Number(attemptsByGame[game] || maxAttempts) + 1) / maxAttempts),
        0,
      );
      const responseTimes = responseTimesRef.current.filter(Number.isFinite);

      return {
        totalGames,
        completedCount: completedGameNumbers.length,
        totalAttempts,
        mistakes: Math.max(totalAttempts - completedGameNumbers.length, 0),
        // Passing after several retries is still a pass, but should not be
        // scored like a first-attempt success for adaptive difficulty.
        accuracy: Math.round((masteryPoints / totalGames) * 100),
        averageResponseMs: responseTimes.length
          ? Math.round(responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length)
          : null,
        targetResponseMs: getGameConfig(3).targetResponseMs,
      };
    },
    [getGameConfig],
  );

  /* =======================================================
     GAME OVER
  ======================================================= */

  const handleGameOver =
    useCallback((finalAttempts = gameAttempts) => {
      const metrics = buildPerformanceMetrics(completedGames, finalAttempts);
      const stats = {
        level: safeLevel,
        ...metrics,
        correct: metrics.completedCount,
        total: metrics.totalGames,
        difficulty: `${getGameConfig(1).cardCount}-${getGameConfig(2).cardCount}-${getGameConfig(3).cardCount}`,
        timestamp: new Date().toISOString(),
      };

      setFinalResult({
        correct: false,
        accuracy: metrics.accuracy,
        completedGames: metrics.completedCount,
        totalAttempts: metrics.totalAttempts,
        mistakes: metrics.mistakes,
      });

      // Failed levels must influence the next session too; otherwise the
      // profile only ever moves toward challenge after eventual success.
      updateLevelProgress(GAME_ID, safeLevel, metrics.accuracy, stats);
      recordAdaptiveResult(GAME_ID, stats);

      setPhase("gameover");
    }, [
      buildPerformanceMetrics,
      completedGames,
      gameAttempts,
      getGameConfig,
      recordAdaptiveResult,
      safeLevel,
      updateLevelProgress,
    ]);

  /* =======================================================
     COMPLETE LEVEL
  ======================================================= */

  const finishLevel = useCallback(
  async (finalGames, finalAttempts) => {
    const metrics = buildPerformanceMetrics(
      finalGames,
      finalAttempts
    );

    const stats = {
      level: safeLevel,

      gamesCompleted: metrics.completedCount,
      totalGames: metrics.totalGames,

      correct: metrics.completedCount,
      total: metrics.totalGames,

      accuracy: metrics.accuracy,

      totalAttempts: metrics.totalAttempts,
      mistakes: metrics.mistakes,

      averageResponseMs: metrics.averageResponseMs,
      targetResponseMs: metrics.targetResponseMs,

      game1Attempts: finalAttempts[1] || 0,
      game2Attempts: finalAttempts[2] || 0,
      game3Attempts: finalAttempts[3] || 0,

      difficulty: `${getGameConfig(1).cardCount}-${getGameConfig(2).cardCount}-${getGameConfig(3).cardCount}`,

      timestamp: new Date().toISOString(),
    };

    console.log("========== LEVEL FINISHED ==========");
    console.log("Level:", safeLevel);
    console.log("Stats:", stats);
    console.log("Accuracy:", metrics.accuracy);
    console.log("Attempts:", metrics.totalAttempts);
    console.log("Mistakes:", metrics.mistakes);
    console.log("====================================");

    setFinalResult({
      correct:
        metrics.completedCount === metrics.totalGames,

      accuracy: metrics.accuracy,

      completedGames:
        metrics.completedCount,

      totalAttempts:
        metrics.totalAttempts,

      mistakes:
        metrics.mistakes,
    });

    try {
      // 1️⃣ Save level performance
      await updateLevelProgress(
        GAME_ID,
        safeLevel,
        metrics.accuracy,
        stats
      );

      // 2️⃣ Update adaptive profile
      // THIS IS THE IMPORTANT CALL
      const adaptiveResult =
        await recordAdaptiveResult(
          GAME_ID,
          stats
        );

      console.log(
        "========== ADAPTIVE PROFILE UPDATED =========="
      );

      console.log(
        "Adaptive result:",
        adaptiveResult
      );

      console.log(
        "==============================================");

      // 3️⃣ Mark level as completed
      await completeLevel(
        GAME_ID,
        safeLevel,
        stats
      );

      console.log(
        "Level completed successfully."
      );

    } catch (error) {
      console.error(
        "Progress update failed:",
        error
      );
    }

    confetti({
      particleCount: 180,
      spread: 100,
      origin: {
        y: 0.55,
      },
    });

    setPhase("result");
  },
  [
    completeLevel,
    buildPerformanceMetrics,
    getGameConfig,
    recordAdaptiveResult,
    safeLevel,
    updateLevelProgress,
  ]
);

  /* =======================================================
     SUCCESSFUL GAME
  ======================================================= */

  const handleGameSuccess =
    useCallback(
      (attemptUsed) => {
        const updatedAttempts = {
          ...gameAttempts,
          [gameNumber]:
            attemptUsed,
        };

        const updatedCompletedGames =
          completedGames.includes(
            gameNumber
          )
            ? completedGames
            : [
                ...completedGames,
                gameNumber,
              ];

        setGameAttempts(
          updatedAttempts
        );

        setCompletedGames(
          updatedCompletedGames
        );

        setScore(1);

        /*
          GAME 3 COMPLETE
        */

        if (gameNumber === 3) {
          setMessage(
            `තෙවන වටයත් හරි! මට්ටම ${safeLevel} සම්පූර්ණයි!`
          );

          setTimeout(() => {
            finishLevel(
              updatedCompletedGames,
              updatedAttempts
            );
          }, 1200);

          return;
        }

        /*
          MOVE TO NEXT GAME
        */

        const nextGame =
          gameNumber + 1;

        setMessage(
          gameNumber === 1
            ? "නියමයි! දැන් හැඩ හතරක් තියෙන දෙවන වටයට යමු!"
            : "හරිම හොඳයි! දැන් හැඩ හයක් තියෙන අවසන් වටයට යමු!"
        );

        setTimeout(() => {
          createCardsForGame(
            nextGame
          );
        }, 1400);
      },
      [
        completedGames,
        createCardsForGame,
        finishLevel,
        gameAttempts,
        gameNumber,
        safeLevel,
      ]
    );

  /* =======================================================
     ATTEMPT FAILED
  ======================================================= */

  const handleAttemptFailed =
    useCallback(
      (attemptUsed) => {
        const maxAttempts = getGameConfig(gameNumber).maxAttempts;
        const updatedAttempts = {
          ...gameAttempts,
          [gameNumber]:
            attemptUsed,
        };

        setGameAttempts(
          updatedAttempts
        );

        /*
          ATTEMPT 1 FAILED
          → Motivation
        */

        if (attemptUsed === 1) {
          setPhase("feedback");

          setMessage(
            "🌟 හොඳ උත්සාහයක්! මේක කරන්න ඔයාට පුළුවන්. ආයෙත් උත්සාහ කරමු! 💪"
          );

          setTimeout(() => {
            setAttempt(2);

            clearPreview();

            clearDrawing();

            resetAnalysis();

            setMessage("");

            setPhase("memorize");
          }, 2200);

          return;
        }

        /*
          ATTEMPT 2 FAILED
          → Hint
        */

        if (attemptUsed === 2) {
          setPhase("feedback");

          setMessage(
            "පොඩි ඉඟියක්! හැඩවල පිළිවෙල හොඳින් මතක් කරගන්න. දැන් තව එක අවස්ථාවක් තියෙනවා!"
          );

          setTimeout(() => {
            setAttempt(3);

            clearPreview();

            clearDrawing();

            resetAnalysis();

            setMessage("");

            setPhase("memorize");
          }, 2500);

          return;
        }

        // Support mode provides one additional guided retry.
        if (attemptUsed === 3 && maxAttempts > 3) {
          setPhase("feedback");
          setMessage("💡 Look again at the shape and its card position before the final try.");

          setTimeout(() => {
            setAttempt(4);
            clearPreview();
            clearDrawing();
            resetAnalysis();
            setMessage("");
            setPhase("memorize");
          }, 2500);

          return;
        }

        /*
          ATTEMPT 3 FAILED
          → GAME OVER
        */

        if (attemptUsed === maxAttempts) {
          setTimeout(() => {
            handleGameOver(updatedAttempts);
          }, 1200);
        }
      },
      [
        clearDrawing,
        clearPreview,
        gameAttempts,
        getGameConfig,
        gameNumber,
        handleGameOver,
        resetAnalysis,
      ]
    );

  /* =======================================================
     CHECK PREDICTION
  ======================================================= */

  const handleCheck =
    useCallback(
      async () => {
        if (
          analysis.status ===
          "loading"
        ) {
          return;
        }

        const file =
          await getSubmissionFile();

        if (!file) {
          setMessage(
            "හැඩය අඳින්න හෝ පින්තූරයක් තෝරන්න."
          );

          return;
        }

        setAnalysis(
          (previous) => ({
            ...previous,
            status: "loading",
          })
        );

        setMessage(
          "හැඩය හඳුනාගනිමින්..."
        );

        try {
          const response =
            await predictShape(
              file
            );

          const predicted =
            normalizeShape(
              response?.shape
            );

          const confidence =
            Number(
              response?.confidence ??
                0
            );

          const confidenceLevel =
            response?.confidenceLevel ||
            getConfidenceText(
              confidence
            );

          const targetShape =
            cards[
              questionIndex
            ]?.id;

          const matched =
            predicted ===
              targetShape &&
            confidence >= 0.5;

          const responseTimeMs =
            answerStartTimeRef.current
              ? Date.now() -
                answerStartTimeRef.current
              : null;

          if (Number.isFinite(responseTimeMs)) {
            responseTimesRef.current.push(responseTimeMs);
          }

          console.log(
            "========== SHAPE CHECK =========="
          );

          console.log(
            "Game:",
            gameNumber
          );

          console.log(
            "Attempt:",
            attempt
          );

          console.log(
            "Backend response:",
            response
          );

          console.log(
            "Predicted shape:",
            predicted
          );

          console.log(
            "Target shape:",
            targetShape
          );

          console.log(
            "Confidence:",
            confidence
          );

          console.log(
            "Matched:",
            matched
          );

          console.log(
            "Response time:",
            responseTimeMs
          );

          console.log(
            "================================"
          );

          setAnalysis({
            status: "done",

            predicted,

            confidence,

            confidenceLevel,

            matched,
          });

          /*
            CORRECT
          */

          if (matched) {
            setMessage(
              attempt === 1
                ? "🎉 නියමයි! පළමු උත්සාහයෙන්ම හරි! 🚀"
                : attempt === 2
                  ? "🌟 Great Job! දෙවැනි උත්සාහයෙන් හරි!"
                  : "💪 නියමයි! තුන්වැනි උත්සාහයෙන් හරි!"
            );

            setScore(1);

            setTimeout(() => {
              handleGameSuccess(
                attempt
              );
            }, 1500);

            return;
          }

          /*
            WRONG
          */

          setMessage(
            attempt === 1
              ? "හ්ම්... ඒක හරි නෑ. කමක් නෑ! 😊"
              : attempt === 2
                ? "තව එක අවස්ථාවක් තියෙනවා! 💪"
                : "මේ වතාවේ හරි ගියේ නෑ. 💙"
          );

          setTimeout(() => {
            handleAttemptFailed(
              attempt
            );
          }, 1200);
        } catch (error) {
          console.error(
            "Prediction error:",
            error
          );

          setAnalysis({
            status: "done",

            predicted: null,

            confidence: 0,

            confidenceLevel:
              "හඳුනාගත නොහැක",

            matched: false,
          });

          setMessage(
            "හැඩය හඳුනාගන්න බැරි වුණා. නැවත උත්සාහ කරන්න."
          );
        }
      },
      [
        analysis.status,
        attempt,
        cards,
        gameNumber,
        getSubmissionFile,
        handleAttemptFailed,
        handleGameSuccess,
        questionIndex,
      ]
    );

  /* =======================================================
     TARGET SHAPE
  ======================================================= */

  const targetShape =
    cards[questionIndex]
      ? getShape(
          cards[questionIndex].id
        )
      : null;

  /* =======================================================
     GAME CONFIG
  ======================================================= */

  const currentConfig =
    getGameConfig(gameNumber);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6">

      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-cyan-50 to-yellow-50" />

      <ShapePreviewSea />

      <div className="pointer-events-none absolute -left-16 top-20 h-40 w-40 rounded-full bg-pink-200/40 blur-3xl" />

      <div className="pointer-events-none absolute -right-20 top-40 h-52 w-52 rounded-full bg-purple-200/40 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-yellow-200/40 blur-3xl" />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col gap-5">

        {/* =================================================
            HEADER
        ================================================= */}

        {phase !== "intro" && (
        <div className="rounded-[2rem] border-4 border-white bg-white/95 p-5 shadow-2xl">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-black tracking-widest text-sky-500">
                මතක පුහුණුව
              </p>

              <h1 className="mt-1 text-2xl font-black text-slate-800 sm:text-3xl">
                හැඩ මතකය
              </h1>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 px-5 py-3 text-center text-white shadow-lg">

              <p className="text-xs font-bold">
                මට්ටම
              </p>

              <p className="text-2xl font-black">
                {safeLevel}
              </p>

            </div>

          </div>

          {/* GAME PROGRESS */}

          <div className="mt-5 flex gap-2">

            {[1, 2, 3].map(
              (game) => (
                <div
                  key={game}
                  className={`h-3 flex-1 rounded-full transition-all ${
                    completedGames.includes(
                      game
                    )
                      ? "bg-emerald-500"
                      : game ===
                          gameNumber
                        ? "bg-purple-500"
                        : "bg-slate-200"
                  }`}
                />
              )
            )}

          </div>

          <div className="mt-2 flex justify-between text-xs font-bold text-slate-400">

            <span>
              පළමු වටය • හැඩ 3
            </span>

            <span>
              දෙවන වටය • හැඩ 4
            </span>

            <span>
              තෙවන වටය • හැඩ 6
            </span>

          </div>

        </div>
        )}

        {/* =================================================
            INTRO
        ================================================= */}

        {phase === "intro" && <ShapeRecallIntro level={safeLevel} onStart={startGame} />}

        {phase === "legacy-intro" && (

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="rounded-[2rem] border-4 border-white bg-white/95 p-6 text-center shadow-2xl"
          >

            <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 text-5xl shadow-xl">
              🧠
            </div>

            <h2 className="text-2xl font-black text-slate-800">
              Shapes මතක තියාගන්න! 🎯
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-base font-semibold leading-relaxed text-slate-500">
              Card වල තියෙන shapes හොඳින් බලන්න.
              පස්සේ cards වැහෙනවා.
              ඔයාට මතක shape එක අඳින්න හෝ photo එකක් upload කරන්න.
            </p>

            {/* 3 GAME STEPS */}

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">

              <div className="rounded-3xl bg-sky-50 p-4 shadow-md">
                <div className="text-3xl">
                  3️⃣
                </div>

                <p className="mt-2 font-black text-slate-700">
                  Game 1
                </p>

                <p className="text-sm font-bold text-slate-500">
                  Shapes 3ක්
                </p>
              </div>

              <div className="rounded-3xl bg-purple-50 p-4 shadow-md">
                <div className="text-3xl">
                  4️⃣
                </div>

                <p className="mt-2 font-black text-slate-700">
                  Game 2
                </p>

                <p className="text-sm font-bold text-slate-500">
                  Shapes 4ක්
                </p>
              </div>

              <div className="rounded-3xl bg-pink-50 p-4 shadow-md">
                <div className="text-3xl">
                  6️⃣
                </div>

                <p className="mt-2 font-black text-slate-700">
                  Game 3
                </p>

                <p className="text-sm font-bold text-slate-500">
                  Shapes 6ක්
                </p>
              </div>

            </div>

            <div className="mt-5 rounded-3xl bg-yellow-50 p-4">

              <p className="font-black text-yellow-700">
                🌟 උත්සාහ 3ක් තියෙනවා!
              </p>

              <p className="mt-1 text-sm font-semibold text-yellow-600">
                පළමු උත්සාහයෙන් බැරි වුණොත්
                අපි ඔයාට උදව් කරනවා.
              </p>

            </div>

            <button
              type="button"
              onClick={startGame}
              className="mt-7 w-full rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-4 text-lg font-black text-white shadow-xl transition hover:scale-[1.02]"
            >
              🚀 Game එක පටන් ගමු!
            </button>

          </motion.div>

        )}

        {/* =================================================
            MEMORIZE
        ================================================= */}

        {phase === "memorize" && (

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="rounded-[2rem] border-4 border-white bg-white/95 p-4 shadow-2xl sm:p-5"
          >

            {/* GAME / ATTEMPT */}

            <div className="mb-4 flex items-center justify-between">

              <div className="rounded-full bg-purple-100 px-4 py-2 text-sm font-black text-purple-700">
                වටය {gameNumber} / 3
              </div>

              <div className="rounded-full bg-orange-100 px-4 py-2 text-sm font-black text-orange-700">
                උත්සාහය {attempt} / {currentConfig.maxAttempts}
              </div>

            </div>

            <div className="mb-5 text-center">

              <div className="hidden items-center gap-2 rounded-full bg-orange-100 px-5 py-2 text-orange-700">

                <span className="text-xl">
                  ⏱️
                </span>

                <span className="text-lg font-black">
                  {timeLeft}
                </span>

              </div>

              <h2 className="mt-1 text-2xl font-black text-slate-800 sm:text-3xl">
                {currentConfig.label}
              </h2>

              <p className="mt-2 rounded-full bg-sky-50 px-4 py-2 font-bold text-sky-700">
                හැඩයත් එය තිබෙන තැනත් හොඳින් බලන්න
              </p>

            </div>

            <p className="mb-3 mt-2 text-center text-sm font-bold text-sky-700">
              {currentConfig.adaptiveHint}
            </p>

            {/* TIMER */}

            <ShapeCrabTimer key={`${safeLevel}-${gameNumber}-${attempt}`} durationMs={currentConfig.revealTime} seconds={timeLeft} />

            {/* CARDS */}

            <div
              className={`mx-auto grid w-full gap-3 sm:gap-4 ${
                gameNumber === 1
                  ? "grid-cols-3"
                  : "grid-cols-2 sm:grid-cols-3"
              }`}
            >

              {cards.map(
                (card, index) => (

                  <MemoryCard
                    key={`${card.id}-${index}`}
                    card={card}
                    index={index}
                    flipped={false}
                  />

                )
              )}

            </div>

          </motion.div>

        )}

        {/* =================================================
            QUESTION
        ================================================= */}

        {phase === "question" && (

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            className="rounded-[2rem] border-4 border-white bg-white/95 p-6 text-center shadow-2xl"
          >

            <div className="mb-4 flex items-center justify-between">

              <div className="rounded-full bg-purple-100 px-4 py-2 text-sm font-black text-purple-700">
                වටය {gameNumber} / 3
              </div>

              <div className="rounded-full bg-orange-100 px-4 py-2 text-sm font-black text-orange-700">
                උත්සාහය {attempt} / {currentConfig.maxAttempts}
              </div>

            </div>

            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-500 text-5xl shadow-xl">
              🤔
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-800">
              මතකද? 👀
            </h2>

            <div className="mt-4 rounded-3xl bg-gradient-to-r from-blue-50 to-purple-50 p-5">

              <p className="text-xl font-black text-slate-700">
                {questionIndex + 1} වන කාඩ්පතේ
              </p>

              <p className="mt-1 text-2xl font-black text-purple-600">
                තිබුණේ මොන හැඩයද?
              </p>

            </div>

            {/* HIDDEN CARDS */}

            <div
              className={`mt-6 grid gap-4 ${
                gameNumber === 1
                  ? "grid-cols-3"
                  : "grid-cols-2 sm:grid-cols-3"
              }`}
            >

              {cards.map(
                (card, index) => (

                  <MemoryCard
                    key={`${card.id}-${index}`}
                    card={card}
                    index={index}
                    flipped={true}
                    selected={
                      index ===
                      questionIndex
                    }
                  />

                )
              )}

            </div>

            <button
              type="button"
              onClick={startAnswer}
              className="mt-7 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-4 text-lg font-black text-white shadow-xl transition hover:scale-[1.02]"
            >
              මම හැඩය පෙන්වන්නම්
            </button>

          </motion.div>

        )}

        {/* =================================================
            FEEDBACK POPUP
        ================================================= */}

        {phase === "feedback" && (

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.85,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="rounded-[2rem] border-4 border-white bg-white/95 p-8 text-center shadow-2xl"
          >

            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 text-6xl shadow-xl">
              {attempt === 1
                ? "💪"
                : "💡"}
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-800">

              {attempt === 1
                ? "හොඳ උත්සාහයක්!"
                : "පොඩි ඉඟියක්!"}

            </h2>

            <p className="mx-auto mt-4 max-w-lg text-lg font-bold leading-relaxed text-slate-600">
              {message}
            </p>

            <div className="mt-6 rounded-3xl bg-sky-50 p-4">

              <p className="text-sm font-black text-sky-600">
                {attempt === 1
                  ? "තව අවස්ථා 2ක් තියෙනවා"
                  : "තව අවස්ථාවක් තියෙනවා"}
              </p>

            </div>

            <div className="mt-6">

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 to-purple-500"
                  initial={{
                    width: "0%",
                  }}
                  animate={{
                    width:
                      attempt === 1
                        ? "66%"
                        : "100%",
                  }}
                  transition={{
                    duration: 2,
                  }}
                />

              </div>

            </div>

          </motion.div>

        )}

        {/* =================================================
            ANSWER
        ================================================= */}

        {phase === "answer" && (

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="rounded-[2rem] border-4 border-white bg-white/95 p-5 shadow-2xl"
          >

            {/* GAME / ATTEMPT */}

            <div className="mb-4 flex items-center justify-between">

              <div className="rounded-full bg-purple-100 px-4 py-2 text-sm font-black text-purple-700">
                වටය {gameNumber} / 3
              </div>

              <div className="rounded-full bg-orange-100 px-4 py-2 text-sm font-black text-orange-700">
                උත්සාහය {attempt} / {currentConfig.maxAttempts}
              </div>

            </div>

            {/* QUESTION */}

            <div className="mb-5 rounded-3xl bg-gradient-to-r from-purple-50 to-pink-50 p-4 text-center">

              <p className="text-sm font-bold text-slate-500">
                ඔයාට අහන්නේ...
              </p>

              <p className="mt-1 text-xl font-black text-purple-700">
                {questionIndex + 1} වන කාඩ්පතේ තිබුණේ මොන හැඩයද?
              </p>

            </div>

            {/* CANVAS */}

            <div
              ref={canvasWrapperRef}
              className="overflow-hidden rounded-[2rem] border-4 border-dashed border-sky-200 bg-sky-50 p-2"
            >

              <div className="relative overflow-hidden rounded-[1.5rem] bg-white">

                <canvas
                  ref={canvasRef}
                  className="block w-full touch-none"
                  style={{
                    touchAction:
                      "none",
                    cursor:
                      "crosshair",
                  }}
                  onPointerDown={
                    handlePointerDown
                  }
                  onPointerMove={
                    handlePointerMove
                  }
                  onPointerUp={
                    handlePointerUp
                  }
                  onPointerLeave={
                    handlePointerUp
                  }
                />

                {!hasDrawing &&
                  !selectedPreview && (

                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center">

                      <div className="rounded-2xl bg-white/90 px-6 py-4 shadow-lg">

                        <div className="text-4xl">
                          ✏️
                        </div>

                        <p className="mt-2 font-black text-slate-700">
                          මෙතන හැඩය අඳින්න
                        </p>

                        <p className="text-sm font-semibold text-slate-400">
                          නැත්නම් පින්තූරයක් තෝරන්න
                        </p>

                      </div>

                    </div>

                  )}

                {selectedPreview && (

                  <div className="absolute inset-0 flex items-center justify-center bg-white">

                    <img
                      src={
                        selectedPreview
                      }
                      alt="Selected"
                      className="max-h-full max-w-full object-contain"
                    />

                  </div>

                )}

              </div>

            </div>

            {/* INPUT BUTTONS */}

            <div className="mt-4 grid grid-cols-3 gap-3">

              <button
                type="button"
                onClick={() => {
                  clearPreview();

                  clearDrawing();
                }}
                className="rounded-2xl bg-slate-100 px-3 py-3 font-black text-slate-600 transition hover:bg-slate-200"
              >
                මකන්න
              </button>

              <button
                type="button"
                onClick={() =>
                  cameraInputRef.current?.click()
                }
                className="rounded-2xl bg-sky-100 px-3 py-3 font-black text-sky-700 transition hover:bg-sky-200"
              >
                කැමරාව
              </button>

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="rounded-2xl bg-yellow-100 px-3 py-3 font-black text-yellow-700 transition hover:bg-yellow-200"
              >
                පින්තූරයක්
              </button>

            </div>

            {/* HIDDEN INPUTS */}

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(event) =>
                handleFilePick(
                  event,
                  "camera"
                )
              }
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) =>
                handleFilePick(
                  event,
                  "upload"
                )
              }
            />

            {/* CHECK */}

            <button
              type="button"
              onClick={handleCheck}
              disabled={
                analysis.status ===
                "loading"
              }
              className="mt-5 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-4 text-xl font-black text-white shadow-xl transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {analysis.status ===
              "loading"
                ? "🔍 බලනවා..."
                : "හැඩය පරීක්ෂා කරමු"}
            </button>

            {/* MESSAGE */}

            {message && (

              <AnimatePresence mode="wait">

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className={`mt-4 rounded-2xl p-4 text-center text-lg font-black ${
                    analysis.matched
                      ? "bg-emerald-100 text-emerald-700"
                      : analysis.status ===
                          "done"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-blue-50 text-blue-700"
                  }`}
                >
                  {message}
                </motion.div>

              </AnimatePresence>

            )}

            {/* PREDICTION INFO */}

            {analysis.status ===
              "done" &&
              analysis.predicted && (

                <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-center">

                  <p className="text-sm font-bold text-slate-400">
                    හඳුනාගත් හැඩය
                  </p>

                  <p className="mt-1 text-xl font-black text-slate-700">
                    {getShape(
                      analysis.predicted
                    )?.label ||
                      analysis.predicted}
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-500">
                    විශ්වාස මට්ටම:{" "}
                    {(
                      analysis.confidence *
                      100
                    ).toFixed(1)}
                    %
                  </p>

                </div>

              )}

          </motion.div>

        )}

        {/* =================================================
            GAME OVER
        ================================================= */}

        {phase === "gameover" && (

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.85,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="rounded-[2rem] border-4 border-white bg-white/95 p-7 text-center shadow-2xl"
          >

            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-blue-300 to-indigo-400 text-6xl shadow-xl">
              💙
            </div>

            <h2 className="mt-5 text-3xl font-black text-slate-800">
              හොඳ උත්සාහයක්! 🌟
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-lg font-bold leading-relaxed text-slate-500">
              මේ වතාවේ ක්‍රීඩාව සම්පූර්ණ කරන්න බැරි වුණා.
              කමක් නෑ! ආයෙත් මුල ඉඳන් උත්සාහ කරමු.
              ඔයාට මේක කරන්න පුළුවන්! 💪
            </p>

            <div className="mt-6 rounded-3xl bg-gradient-to-r from-sky-50 to-purple-50 p-5">

              <p className="text-sm font-bold text-slate-400">
                ක්‍රීඩාව නවතින්නේ මෙතනින්
              </p>

              <p className="mt-2 text-3xl font-black text-purple-600">
                වටය {gameNumber}
              </p>

              <p className="mt-1 font-bold text-slate-500">
                උත්සාහ 3ම භාවිතා කළා
              </p>

            </div>

            <button
              type="button"
              onClick={startGame}
              className="mt-7 w-full rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-4 text-xl font-black text-white shadow-xl transition hover:scale-[1.02]"
            >
              නැවත උත්සාහ කරමු
            </button>

          </motion.div>

        )}

        {/* =================================================
            LEVEL RESULT
        ================================================= */}

        {phase === "result" && (

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="rounded-[2rem] border-4 border-white bg-white/95 p-7 text-center shadow-2xl"
          >

            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 text-6xl shadow-xl">
              🎉
            </div>

            <h2 className="mt-5 text-3xl font-black text-slate-800">
              මට්ටම {safeLevel} ජය ගත්තා!
            </h2>

            <p className="mt-2 text-lg font-bold text-slate-500">
              ඔයා වට තුනම සාර්ථකව සම්පූර්ණ කළා!
            </p>

            {/* RESULT */}

            <div className="mt-6 rounded-3xl bg-gradient-to-r from-emerald-50 to-sky-50 p-5">

              <p className="text-sm font-bold text-slate-400">
                ඔයාගේ ප්‍රතිඵලය
              </p>

              <p className="mt-2 text-5xl font-black text-emerald-600">
                {finalResult.accuracy}%
              </p>

              <p className="mt-1 font-bold text-slate-500">
                හරිම හොඳ මතකයක්!
              </p>

            </div>

            {/* GAME RESULTS */}

            <div className="mt-5 grid grid-cols-3 gap-3">

              {[1, 2, 3].map(
                (game) => (

                  <div
                    key={game}
                    className="rounded-2xl bg-slate-50 p-4"
                  >

                    <p className="text-xs font-black text-slate-400">
                      වටය {game}
                    </p>

                    <p className="mt-1 text-xl font-black text-emerald-600">
                      {gameAttempts[
                        game
                      ] || 1}
                      x
                    </p>

                    <p className="text-xs font-bold text-slate-400">
                      උත්සාහ
                    </p>

                  </div>

                )
              )}

            </div>

            <div className="mt-5 rounded-2xl bg-blue-50 p-4">

              <p className="text-sm font-black text-blue-700">
                ඔයාට ගැළපෙන පුහුණුව
              </p>

              <p className="mt-1 text-sm font-semibold text-blue-600">
                ඔයාගේ ප්‍රගතිය සුරැකලා ඊළඟ පුහුණුව ඔයාට ගැළපෙන ලෙස සකස් කරනවා.
              </p>

            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">

              <button
                type="button"
                onClick={startGame}
                className="flex-1 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-4 font-black text-white shadow-lg"
              >
                නැවත ක්‍රීඩා කරමු
              </button>

              {finalResult.correct && safeLevel === 1 && (

                <button
                  type="button"
                  onClick={() =>
                    onComplete &&
                    onComplete({
                      passed: true,

                      nextLevel: 2,

                      accuracy:
                        finalResult.accuracy,

                      completedGames:
                        finalResult.completedGames,

                      totalAttempts:
                        finalResult.totalAttempts,

                      mistakes:
                        finalResult.mistakes,
                    })
                  }
                  className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-4 font-black text-white shadow-lg"
                >
                  දෙවන මට්ටමට යමු
                </button>

              )}

              {finalResult.correct && safeLevel === 2 && (
                <button
                  type="button"
                  onClick={() => onComplete && onComplete({ passed:true, accuracy:finalResult.accuracy, completedGames:finalResult.completedGames, totalAttempts:finalResult.totalAttempts, mistakes:finalResult.mistakes })}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-4 font-black text-white shadow-lg"
                >
                  මට්ටම් දෙකම ජය ගත්තා!
                </button>
              )}

            </div>

          </motion.div>

        )}

      </div>
    </div>
  );
};

export default MemoryShapeRecallGame;
