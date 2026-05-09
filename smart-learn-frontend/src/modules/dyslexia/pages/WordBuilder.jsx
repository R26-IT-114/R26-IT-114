import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ArrowLeft, Volume2, VolumeX, Lightbulb, ChevronRight, Flame, BookOpen, Star, Hand } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import FloatingJungleAnimals from '../components/FloatingJungleAnimals';
import helicopterImg from '../../../assets/images/helicopter.png';
import introImg      from '../../../assets/images/background/ele.png';

/* ─── Word audio files ─── */
import gasaAudio   from '../../../assets/voice/gasa.wav';
import hayaAudio   from '../../../assets/voice/haya.wav';
import hathaAudio  from '../../../assets/voice/hatha.wav';
import kahaAudio   from '../../../assets/voice/kaha.wav';
import iraAudio    from '../../../assets/voice/ira.wav';
import malaAudio   from '../../../assets/voice/mala.wav';
import rataAudio   from '../../../assets/voice/rata.wav';
import pahaAudio   from '../../../assets/voice/paha.wav';
import kayaAudio   from '../../../assets/voice/kaya.wav';
import yataAudio   from '../../../assets/voice/yata.wav';
import payaAudio   from '../../../assets/voice/paya.wav';
import daraAudio   from '../../../assets/voice/dara.wav';
import yahanaAudio from '../../../assets/voice/yahana.wav';
import pahanaAudio from '../../../assets/voice/pahana.wav';
import nayanaAudio from '../../../assets/voice/nayana.wav';
import gaganaAudio from '../../../assets/voice/gagana.wav';
import pasaAudio   from '../../../assets/voice/pasa.wav';
import kadayaAudio from '../../../assets/voice/kadaya.wav';

/* ─── Letter audio files ─── */
import gaLetterAudio  from '../../../assets/voice/ga.wav';
import yaLetterAudio  from '../../../assets/voice/ya.wav';
import saLetterAudio  from '../../../assets/voice/sa.wav';
import paLetterAudio  from '../../../assets/voice/pa.mp3';
import naLetterAudio  from '../../../assets/voice/na.wav';
import thaLetterAudio from '../../../assets/voice/tha.wav';
import kaLetterAudio  from '../../../assets/voice/ka.wav';
import aLetterAudio   from '../../../assets/voice/a.wav';
import uLetterAudio   from '../../../assets/voice/u.wav';
import raLetterAudio  from '../../../assets/voice/ra.wav';
import daLetterAudio  from '../../../assets/voice/da.wav';
import taLetterAudio  from '../../../assets/voice/ta.wav';
import maLetterAudio  from '../../../assets/voice/ma.wav';
import baLetterAudio  from '../../../assets/voice/ba.wav';

/* ─── Word data ─────────────────────────────────────────────────────────────── */
const WORDS = [
  { word: 'ගස',   letters: ['ග', 'ස'],        hint: 'ගහ 🌳',              audio: gasaAudio   },
  { word: 'හය',   letters: ['හ', 'ය'],        hint: 'ගණනය 🔢',              audio: hayaAudio   },
  { word: 'හත',   letters: ['හ', 'ත'],        hint: 'ගණනය 🔢',              audio: hathaAudio  },
  { word: 'කහ',   letters: ['ක', 'හ'],        hint: 'කහ පාට 🌻',          audio: kahaAudio   },
  { word: 'ඉර',   letters: ['ඉ', 'ර'],        hint: 'ආලොකය ☀️',           audio: iraAudio    },
  { word: 'මල',   letters: ['ම', 'ල'],        hint: 'සුන්දර 🌸',            audio: malaAudio   },
  { word: 'රට',   letters: ['ර', 'ට'],        hint: 'රටක් 🌍',             audio: rataAudio   },
  { word: 'පහ',   letters: ['ප', 'හ'],        hint: 'ගණනය 🖐️',             audio: pahaAudio   },
  { word: 'කය',   letters: ['ක', 'ය'],        hint: 'ශරේරය 🏃',             audio: kayaAudio   },
  { word: 'යට',   letters: ['ය', 'ට'],        hint: 'පහල ↓',               audio: yataAudio   },
  { word: 'පය',   letters: ['ප', 'ය'],        hint: 'ගමන් කරයි 🦶',      audio: payaAudio   },
  { word: 'දර',   letters: ['ද', 'ර'],        hint: 'ලී ✴️',                audio: daraAudio   },
  { word: 'යහන',  letters: ['ය', 'හ', 'න'],    hint: 'නිදාගන්නා 🛏️',      audio: yahanaAudio },
  { word: 'පහන',  letters: ['ප', 'හ', 'න'],    hint: 'ආලොකය දේන 🕯️',      audio: pahanaAudio },
  { word: 'නයන',  letters: ['න', 'ය', 'න'],    hint: 'දේස බලන 👁️',        audio: nayanaAudio },
  { word: 'පස',   letters: ['ප', 'ස'],        hint: 'සංක්‍යා 5 🖐️',          audio: pasaAudio   },
  { word: 'කඩය',  letters: ['ක', 'ඩ', 'ය'],    hint: 'ව්‍යාපාරය 🏪',        audio: kadayaAudio },
];

const LETTER_POOL = ['ග', 'හ', 'ය', 'ස', 'ප', 'න', 'ත', 'ක', 'අ', 'උ', 'ර', 'ද', 'ට', 'ල', 'ම', 'බ', 'ඩ', 'ඉ'];

const LETTER_AUDIO = {
  'ග': gaLetterAudio,
  'ය': yaLetterAudio,
  'ස': saLetterAudio,
  'ප': paLetterAudio,
  'න': naLetterAudio,
  'ත': thaLetterAudio,
  'ක': kaLetterAudio,
  'අ': aLetterAudio,
  'උ': uLetterAudio,
  'ර': raLetterAudio,
  'ද': daLetterAudio,
  'ට': taLetterAudio,
  'ම': maLetterAudio,
  'බ': baLetterAudio,
};

const TOTAL_ROUNDS = 8;

const TILE_COLORS = [
  '#f97316','#ef4444','#a855f7','#3b82f6','#10b981',
  '#ec4899','#f59e0b','#06b6d4','#84cc16','#6366f1',
];

const ENCOURAGE = [
  'නිවැර්දිම්!', 'ගෝද හොද්!', 'ශූරයා!', 'Excellent!',
  'Great Job!', 'Perfect!', 'Amazing!', 
];

/* ─── Audio helpers ─────────────────────────────────────────────────────────── */
function playTone(freq = 440, type = 'sine', duration = 0.12, vol = 0.18) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(); osc.stop(ctx.currentTime + duration);
  } catch {}
}

function playSuccess() {
  [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 'sine', 0.18, 0.22), i * 80));
}

function playError() {
  playTone(200, 'sawtooth', 0.18, 0.14);
  setTimeout(() => playTone(150, 'sawtooth', 0.18, 0.14), 100);
}

function playDrop() { playTone(660, 'sine', 0.08, 0.1); }
function playDrag() { playTone(440, 'triangle', 0.06, 0.08); }

function speakWord(word, soundOn, audioFile) {
  if (!soundOn) return;
  if (audioFile) {
    const audioEl = new Audio(audioFile);
    audioEl.play().catch(() => {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(word);
      utt.lang = 'si-LK'; utt.rate = 0.75; utt.pitch = 1.1;
      window.speechSynthesis.speak(utt);
    });
  } else {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(word);
    utt.lang = 'si-LK'; utt.rate = 0.75; utt.pitch = 1.1;
    window.speechSynthesis.speak(utt);
  }
}

/* ─── DraggableTile ─────────────────────────────────────────────────────────── */
function DraggableTile({ id, letter, color, disabled, small, onTap }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id, disabled });
  return (
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => !disabled && onTap?.(letter)}
      whileHover={!disabled ? { scale: 1.15, y: -4 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      style={{
        width: small ? 62 : 78,
        height: small ? 62 : 78,
        background: isDragging ? 'rgba(255,255,255,0.3)' : color,
        borderRadius: 18,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: small ? 30 : 42,
        fontWeight: 900,
        color: '#fff',
        cursor: disabled ? 'default' : 'grab',
        opacity: isDragging ? 0.4 : disabled ? 0.35 : 1,
        boxShadow: isDragging ? 'none' : '0 4px 14px rgba(0,0,0,0.2)',
        userSelect: 'none',
        touchAction: 'none',
        fontFamily: "'Noto Sans Sinhala', 'Noto Serif Sinhala', sans-serif",
        letterSpacing: '0.03em',
        border: '3px solid rgba(255,255,255,0.5)',
        transition: 'box-shadow 0.15s',
      }}
    >
      {letter}
    </motion.div>
  );
}

/* ─── DropBucket ─────────────────────────────────────────────────────────────── */
function DropBucket({ id, letter, status }) {
  const { isOver, setNodeRef } = useDroppable({ id });

  const bgMap = {
    correct: 'linear-gradient(135deg, #bbf7d0, #86efac)',
    wrong:   'linear-gradient(135deg, #fecaca, #f87171)',
    empty:   isOver ? 'linear-gradient(135deg, #bfdbfe, #93c5fd)' : 'rgba(255,255,255,0.25)',
  };

  return (
    <motion.div
      ref={setNodeRef}
      animate={status === 'wrong' ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        width: 88, height: 88,
        borderRadius: 24,
        background: bgMap[status || 'empty'],
        border: `3px solid ${isOver ? '#3b82f6' : status === 'correct' ? '#22c55e' : status === 'wrong' ? '#ef4444' : 'rgba(255,255,255,0.5)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 42, fontWeight: 900,
        color: status === 'correct' ? '#15803d' : status === 'wrong' ? '#b91c1c' : '#94a3b8',
        boxShadow: isOver ? '0 0 0 4px #bfdbfe' : status === 'correct' ? '0 0 0 3px #86efac' : '0 4px 14px rgba(0,0,0,0.12)',
        transition: 'all 0.2s',
        fontFamily: "'Noto Sans Sinhala', 'Noto Serif Sinhala', sans-serif",
        letterSpacing: '0.03em',
        position: 'relative',
      }}
    >
      {letter || (isOver ? '↓' : '＿')}
      {status === 'correct' && (
        <motion.div className="absolute inset-0 rounded-full bg-[#BDE0FE]/60"
            animate={{ scale: [0, 1.5, 1], y: -24, opacity: [1, 1, 0] }}
            transition={{ duration: 0.7 }}
            style={{ position: 'absolute', top: -10, pointerEvents: 'none',
                     display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Star size={18} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
        </motion.div>
      )}
    </motion.div>
  );
}

/* ─── ConfettiBurst ──────────────────────────────────────────────────────────── */
function ConfettiBurst({ active }) {
  const items = Array.from({ length: 18 }, (_, i) => i);
  if (!active) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 50 }}>
      {items.map(i => (
        <motion.div
          key={i}
          initial={{ x: '50vw', y: '40vh', scale: 0, opacity: 1 }}
          animate={{ x: `${Math.random() * 100}vw`, y: `${Math.random() * -60 - 10}vh`, scale: [0, 1.2, 0.8], opacity: [1, 1, 0] }}
          transition={{ duration: 1.1 + Math.random() * 0.6, delay: Math.random() * 0.2 }}
          style={{
            position: 'absolute', width: 12, height: 12,
            borderRadius: Math.random() > 0.5 ? '50%' : 3,
            background: TILE_COLORS[i % TILE_COLORS.length],
          }}
        />
      ))}
    </div>
  );
}

/* ─── AnimatedBackground ─────────────────────────────────────────────────────── */
function JungleBg() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {/* Sky gradient */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #1a6fa8 0%, #1a8060 55%, #52b788 100%)' }} />
      {/* Stars */}
      {Array.from({ length: 28 }, (_, i) => (
        <motion.div key={i}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 3 }}
          style={{ position: 'absolute', width: 3, height: 3, borderRadius: '50%', background: '#fff',
                   top: `${Math.random() * 45}%`, left: `${Math.random() * 100}%` }} />
      ))}
      {/* Clouds */}
      {[15, 45, 70].map((left, i) => (
        <motion.div key={i}
          animate={{ x: [0, 30, 0] }} transition={{ duration: 10 + i * 4, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', top: `${8 + i * 7}%`, left: `${left}%`,
                   width: 80 + i * 30, height: 28, borderRadius: 40,
                   background: 'rgba(255,255,255,0.18)', filter: 'blur(4px)' }} />
      ))}
      {/* Trees silhouette */}
      {[5, 12, 88, 95].map((l, i) => (
        <div key={i} style={{ position: 'absolute', bottom: 0, left: `${l}%`,
                              width: 40, height: 110 + i * 20, background: '#1a4c2a',
                              borderRadius: '50% 50% 0 0', opacity: 0.7 }} />
      ))}
      {/* Floating leaves */}
      {Array.from({ length: 8 }, (_, i) => (
        <motion.div key={i}
          animate={{ y: ['0vh', '100vh'], x: [0, Math.sin(i) * 40, 0], rotate: [0, 360] }}
          transition={{ duration: 8 + Math.random() * 6, repeat: Infinity, delay: Math.random() * 8, ease: 'linear' }}
          style={{ position: 'absolute', top: '-5%', left: `${10 + i * 11}%`,
                   width: 10, height: 10, borderRadius: '50%', background: '#4ade80',
                   opacity: 0.55 }}>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Main Game Component ─────────────────────────────────────────────────────── */
export default function WordBuilder() {
  const navigate = useNavigate();
  const [wordIndex, setWordIndex] = useState(() => Math.floor(Math.random() * WORDS.length));
  const [buckets, setBuckets] = useState(() => Array(WORDS[wordIndex].letters.length).fill(null));
  const [bucketStatus, setBucketStatus] = useState(() => Array(WORDS[wordIndex].letters.length).fill(null));
  const [usedTileIds, setUsedTileIds] = useState(new Set());
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [showConf, setShowConf] = useState(false);
  const [wordComplete, setWordComplete] = useState(false);
  const [encouragement, setEncouragement] = useState('');
  const [soundOn, setSoundOn] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [streak, setStreak] = useState(0);
  const [usedWords, setUsedWords] = useState(() => new Set([wordIndex]));
  const [gameOver, setGameOver] = useState(false);
  const autoAdvanceTimer = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);

  /* load dyslexia-friendly font */
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch {} };
  }, []);

  const currentWord = WORDS[wordIndex];

  /* Always show all 18 letters shuffled, plus extra copies for repeated letters in the word */
  const buildPool = useCallback((word) => {
    const needed = word.letters.reduce((acc, l) => { acc[l] = (acc[l] || 0) + 1; return acc; }, {});
    const extras = [];
    Object.entries(needed).forEach(([l, count]) => {
      for (let i = 1; i < count; i++) extras.push(l);
    });
    const all = [...LETTER_POOL, ...extras].sort(() => Math.random() - 0.5);
    return all.map((letter, i) => ({
      id: `tile-${letter}-${i}-${Math.random().toString(36).slice(2)}`,
      letter,
      color: TILE_COLORS[i % TILE_COLORS.length],
      audio: LETTER_AUDIO[letter] ?? null,
    }));
  }, []);

  const [tilePool, setTilePool] = useState(() => buildPool(WORDS[wordIndex]));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 80, tolerance: 8 } })
  );

  /* speak on load */
  useEffect(() => {
    if (!gameStarted) return;
    const t = setTimeout(() => speakWord(currentWord.word, soundOn, currentWord.audio), 600);
    return () => clearTimeout(t);
  }, [wordIndex]); // eslint-disable-line

  /* cleanup timer */
  useEffect(() => () => clearTimeout(autoAdvanceTimer.current), []);

  function resetRound(newIdx) {
    clearTimeout(autoAdvanceTimer.current);
    const w = WORDS[newIdx];
    setBuckets(Array(w.letters.length).fill(null));
    setBucketStatus(Array(w.letters.length).fill(null));
    setUsedTileIds(new Set());
    setTilePool(buildPool(w));
    setWordComplete(false);
    setEncouragement('');
    setShowHint(false);
    setWordIndex(newIdx);
  }

  function handleNextWord() {
    if (round >= TOTAL_ROUNDS) {
      setGameOver(true);
      return;
    }
    const remaining = WORDS.map((_, i) => i).filter(i => !usedWords.has(i));
    const pool = remaining.length > 0 ? remaining : WORDS.map((_, i) => i);
    const next = pool[Math.floor(Math.random() * pool.length)];
    setUsedWords(s => new Set([...s, next]));
    setRound(r => r + 1);
    resetRound(next);
  }

  function restartGame() {
    clearTimeout(autoAdvanceTimer.current);
    const newIdx = Math.floor(Math.random() * WORDS.length);
    const w = WORDS[newIdx];
    setGameOver(false);
    setRound(1);
    setScore(0);
    setStreak(0);
    setUsedWords(new Set([newIdx]));
    setWordComplete(false);
    setEncouragement('');
    setShowHint(false);
    setBuckets(Array(w.letters.length).fill(null));
    setBucketStatus(Array(w.letters.length).fill(null));
    setUsedTileIds(new Set());
    setTilePool(buildPool(w));
    setWordIndex(newIdx);
  }

  function handleDragStart({ active }) {
    setActiveId(active.id);
    if (soundOn) playDrag();
  }

  function handleDragEnd({ active, over }) {
    setActiveId(null);
    if (!over) return;

    const bucketIdx = parseInt(over.id.replace('bucket-', ''), 10);
    if (isNaN(bucketIdx)) return;

    // Already filled correctly
    if (bucketStatus[bucketIdx] === 'correct') return;

    const tile = tilePool.find(t => t.id === active.id);
    if (!tile) return;

    const isCorrect = tile.letter === currentWord.letters[bucketIdx];

    if (soundOn) isCorrect ? playDrop() : playError();

    const newBuckets = [...buckets];
    const newStatus = [...bucketStatus];
    const newUsed = new Set(usedTileIds);

    if (isCorrect) {
      newBuckets[bucketIdx] = tile.letter;
      newStatus[bucketIdx] = 'correct';
      newUsed.add(active.id);
    } else {
      newBuckets[bucketIdx] = tile.letter;
      newStatus[bucketIdx] = 'wrong';
      // Auto-clear wrong after shake
      setTimeout(() => {
        setBuckets(b => { const nb = [...b]; if (nb[bucketIdx] === tile.letter) nb[bucketIdx] = null; return nb; });
        setBucketStatus(s => { const ns = [...s]; if (ns[bucketIdx] === 'wrong') ns[bucketIdx] = null; return ns; });
      }, 600);
    }

    setBuckets(newBuckets);
    setBucketStatus(newStatus);
    setUsedTileIds(newUsed);

    // Check if word complete
    if (isCorrect) {
      const allCorrect = newStatus.every(s => s === 'correct');
      if (allCorrect) {
        const msg = ENCOURAGE[Math.floor(Math.random() * ENCOURAGE.length)];
        setEncouragement(msg);
        setWordComplete(true);
        setScore(s => s + 1);
        setStreak(s => s + 1);
        setShowConf(true);
        if (soundOn) setTimeout(playSuccess, 100);
        setTimeout(() => setShowConf(false), 2000);
        autoAdvanceTimer.current = setTimeout(handleNextWord, 2800);
      }
    } else {
      setStreak(0);
    }
  }

  /* Active drag overlay tile */
  const activeTile = tilePool.find(t => t.id === activeId);

  const progress = ((round - 1) / (round - 1 + WORDS.length - score)) * 100 || 0;

  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', fontFamily: "'Nunito', 'Noto Sans Sinhala', 'Baloo 2', sans-serif",
                  overflowX: 'hidden' }}>
      <JungleBg />
      <FloatingJungleAnimals />
      <ConfettiBurst active={showConf} />

      {/* ── Game Over Screen ── */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex',
                     alignItems: 'center', justifyContent: 'center',
                     background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)' }}>
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.85 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 18, stiffness: 200 }}
              style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d6a4f 100%)',
                       borderRadius: 36, padding: '44px 40px', textAlign: 'center',
                       border: '3px solid rgba(255,255,255,0.35)', maxWidth: 420, width: '90%',
                       boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
              <div style={{ fontSize: 72, marginBottom: 8, lineHeight: 1 }}>🏆</div>
              <h2 style={{ fontSize: 38, fontWeight: 900, color: '#fbbf24', margin: '0 0 10px',
                           fontFamily: "'Noto Sans Sinhala', 'Nunito', sans-serif",
                           textShadow: '0 2px 14px rgba(0,0,0,0.5)' }}>
                            
              </h2>
              <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.9)', margin: '0 0 18px',
                          fontFamily: "'Noto Sans Sinhala', 'Nunito', sans-serif", lineHeight: 1.6 }}>
                ඔබ සියලු {TOTAL_ROUNDS}ම වචන හදා ගත්ත!
              </p>
              <div style={{ fontSize: 56, fontWeight: 900, color: '#4ade80', marginBottom: 28,
                            fontFamily: "'Nunito', sans-serif" }}>
                {score} <span style={{ fontSize: 30, color: 'rgba(255,255,255,0.5)' }}>/ {TOTAL_ROUNDS}</span>
              </div>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                <motion.button
                  whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.93 }}
                  onClick={restartGame}
                  style={{ padding: '16px 32px', borderRadius: 20, fontSize: 19, fontWeight: 800,
                           background: 'linear-gradient(135deg, #10b981, #059669)',
                           color: '#fff', border: 'none', cursor: 'pointer',
                           fontFamily: "'Noto Sans Sinhala', 'Nunito', sans-serif",
                           boxShadow: '0 4px 20px rgba(16,185,129,0.5)' }}>
                  නැවත ක්‍රීඩා කරන්න
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.93 }}
                  onClick={() => navigate('/dyslexia')}
                  style={{ padding: '16px 32px', borderRadius: 20, fontSize: 19, fontWeight: 800,
                           background: 'rgba(255,255,255,0.18)',
                           color: '#fff', border: '2px solid rgba(255,255,255,0.45)', cursor: 'pointer',
                           fontFamily: "'Noto Sans Sinhala', 'Nunito', sans-serif" }}>
                  ආපසු
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Intro Screen ── */}
      <AnimatePresence>
        {!gameStarted && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 99, display: 'flex',
                     alignItems: 'center', justifyContent: 'center',
                     background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }}>
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.85 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -30, opacity: 0, scale: 0.88 }}
              transition={{ type: 'spring', damping: 20, stiffness: 220 }}
              style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d6a4f 100%)',
                       borderRadius: 36, overflow: 'hidden', maxWidth: 360, width: '90%',
                       border: '3px solid rgba(255,255,255,0.25)',
                       boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
              {/* Image banner */}
              <div style={{ width: '100%', height: 160, overflow: 'hidden' }}>
                <img src={introImg} alt="" draggable={false}
                     style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              {/* Content */}
              <div style={{ padding: '28px 32px', textAlign: 'center' }}>
                <h2 style={{ fontSize: 32, fontWeight: 900, color: '#fbbf24', margin: '0 0 8px',
                             fontFamily: "'Noto Sans Sinhala', 'Nunito', sans-serif",
                             textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
                  වචන හදමු!
                </h2>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
                              background: 'rgba(255,255,255,0.12)', borderRadius: 12,
                              padding: '6px 16px', marginBottom: 16,
                              border: '2px solid rgba(255,255,255,0.2)' }}>
                  <span style={{ color: '#4ade80', fontWeight: 800, fontSize: 15,
                                 fontFamily: "'Noto Sans Sinhala', 'Nunito', sans-serif" }}>
                    වට {TOTAL_ROUNDS}ක්
                  </span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: 16, fontWeight: 700,
                            margin: '0 0 28px', lineHeight: 1.6,
                            fontFamily: "'Noto Sans Sinhala', 'Nunito', sans-serif" }}>
                  අකුරු ඇදලා bucket එකට දාන්න! නිවැරදි වචන හදා ගන්න!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setGameStarted(true);
                    setTimeout(() => speakWord(currentWord.word, soundOn, currentWord.audio), 400);
                  }}
                  style={{ width: '100%', padding: '18px', borderRadius: 20, fontSize: 20,
                           fontWeight: 900, background: 'linear-gradient(135deg, #10b981, #059669)',
                           color: '#fff', border: '2px solid rgba(255,255,255,0.3)', cursor: 'pointer',
                           fontFamily: "'Noto Sans Sinhala', 'Nunito', sans-serif",
                           boxShadow: '0 4px 20px rgba(16,185,129,0.5)' }}>
                  ආරම්භ කරන්න 🎮
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 720,
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 20px 0' }}>
        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/dyslexia')}
          style={{ background: 'rgba(255,255,255,0.18)', border: '2px solid rgba(255,255,255,0.4)',
                   borderRadius: 14, padding: '8px 14px', color: '#fff',
                   fontSize: 20, cursor: 'pointer', backdropFilter: 'blur(4px)',
                   display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={20} strokeWidth={2} />
        </motion.button>

        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1.2,
                       textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                       display: 'flex', alignItems: 'center', gap: 6 }}>
            <BookOpen size={22} strokeWidth={2} /> වචන හදමු!
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.9)', margin: 0,
                      fontFamily: "'Nunito', sans-serif",
                      display: 'flex', alignItems: 'center', gap: 4 }}>
            Round {round} / {TOTAL_ROUNDS} &nbsp;·&nbsp; Score: {score} {streak >= 3 ? <><Flame size={14} style={{ color: '#fb923c' }} /> {streak}x!</> : ''}
          </p>
        </div>

        {/* Sound toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={() => setSoundOn(s => !s)}
          style={{ background: 'rgba(255,255,255,0.18)', border: '2px solid rgba(255,255,255,0.4)',
                   borderRadius: 14, padding: '8px 14px', color: '#fff',
                   fontSize: 20, cursor: 'pointer', backdropFilter: 'blur(4px)',
                   display: 'flex', alignItems: 'center' }}>
          {soundOn ? <Volume2 size={22} strokeWidth={2} /> : <VolumeX size={22} strokeWidth={2} />}
        </motion.button>
      </div>

      {/* ── Progress Bar ── */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 720,
                    padding: '8px 20px' }}>
        <div style={{ height: 10, borderRadius: 8, background: 'rgba(255,255,255,0.2)' }}>
          <motion.div
            animate={{ width: `${Math.round((round - 1) / TOTAL_ROUNDS * 100)}%` }}
            style={{ height: '100%', borderRadius: 8,
                     background: 'linear-gradient(90deg, #fbbf24, #f97316)' }} />
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 720,
                      padding: '0 16px', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: 16 }}>

          {/* ── Word card ── */}
          <motion.div
            key={wordIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ width: '100%', background: '#ffffff',
                     backdropFilter: 'blur(12px)', borderRadius: 28,
                     border: '2px solid rgba(0,0,0,0.1)',
                     padding: '24px 28px', textAlign: 'center',
                     boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>

            {/* Card inner: helicopter on side + content */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>

              {/* Animated helicopter on the left */}
              <motion.img
                src={helicopterImg}
                alt="helicopter"
                animate={{ y: [0, -12, 0], rotate: [0, 3, -3, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: 140, height: 140, objectFit: 'contain', flexShrink: 0,
                         filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.18))' }}
              />

              {/* Right side: buttons + content */}
              <div style={{ flex: 1 }}>
                {/* Speak button + Hint */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 12 }}>
                  <motion.button
                    whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
                    onClick={() => speakWord(currentWord.word, soundOn, currentWord.audio)}
                    style={{ padding: '14px 32px', borderRadius: 20, fontSize: 18, fontWeight: 800,
                             background: 'linear-gradient(135deg, #f97316, #ef4444)',
                             color: '#fff', border: 'none', cursor: 'pointer',
                             boxShadow: '0 4px 16px rgba(239,68,68,0.4)',
                             display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Volume2 size={20} strokeWidth={2} /> <span style={{ fontFamily: "'Noto Sans Sinhala', sans-serif" }}>ශබ්දය අසන්න</span>
                  </motion.button>

                  {/* Hint */}
                  <motion.button
                    whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
                    onClick={() => setShowHint(h => !h)}
                    style={{ padding: '12px 18px', borderRadius: 20, fontSize: 18, fontWeight: 800,
                             background: showHint
                               ? 'linear-gradient(135deg, #8b5cf6, #6366f1)'
                               : 'rgba(139,92,246,0.12)',
                             color: showHint ? '#fff' : '#7c3aed',
                             border: '2px solid rgba(139,92,246,0.4)', cursor: 'pointer',
                             display: 'flex', alignItems: 'center' }}>
                    <Lightbulb size={22} strokeWidth={2} />
                  </motion.button>
                </div>

                {/* Hint text */}
                <AnimatePresence>
                  {showHint && (
                    <motion.p
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      style={{ fontSize: 20, color: '#7c3aed', fontWeight: 800, marginBottom: 10,
                               background: 'rgba(139,92,246,0.1)', borderRadius: 12, padding: '8px 16px',
                               display: 'inline-block' }}>
                      {currentWord.hint}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Letter count hint */}
                <p style={{ color: '#374151', fontSize: 18, fontWeight: 700,
                            fontFamily: "'Noto Sans Sinhala', sans-serif",
                            letterSpacing: '0.03em', marginBottom: 18 }}>
                  අකුරු {currentWord.letters.length}ක් ඇත
                </p>

                {/* ── Drop Buckets ── */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
                  {buckets.map((letter, i) => (
                    <DropBucket
                      key={i}
                      id={`bucket-${i}`}
                      letter={letter}
                      status={bucketStatus[i]}
                    />
                  ))}
                </div>

                {/* Encouragement */}
                <AnimatePresence>
                  {encouragement && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [0, 1.3, 1], opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      style={{ marginTop: 16, fontSize: 36, fontWeight: 900, color: '#fbbf24',
                               fontFamily: "'Nunito', 'Noto Sans Sinhala', sans-serif",
                               textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                      {encouragement}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Next Word Button */}
                {wordComplete && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={handleNextWord}
                    style={{ marginTop: 16, padding: '12px 32px', borderRadius: 20, fontSize: 18,
                             fontWeight: 800, background: 'linear-gradient(135deg, #10b981, #059669)',
                             color: '#fff', border: 'none', cursor: 'pointer',
                             boxShadow: '0 4px 16px rgba(16,185,129,0.5)',
                             display: 'flex', alignItems: 'center', gap: 8, margin: '16px auto 0' }}>
                    <ChevronRight size={20} strokeWidth={2.5} /> ඊළග වචනය
                  </motion.button>
                )}
              </div>{/* end right side */}
            </div>{/* end inner flex */}
          </motion.div>

          {/* ── Letter Tile Pool ── */}
          <motion.div
            key={`pool-${wordIndex}`}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ width: '100%', background: '#ffffff',
                     backdropFilter: 'blur(10px)', borderRadius: 24,
                     border: '2px solid rgba(0,0,0,0.1)',
                     padding: '18px 16px',
                     boxShadow: '0 6px 24px rgba(0,0,0,0.15)' }}>
            <p style={{ textAlign: 'center', color: '#374151',
                        fontSize: 17, fontWeight: 700, marginBottom: 16,
                        fontFamily: "'Noto Sans Sinhala', 'Nunito', sans-serif",
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Hand size={16} strokeWidth={2} /> අකුරු ඇදලා bucket එකට දාන්න!
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              {tilePool.map(tile => (
                <DraggableTile
                  key={tile.id}
                  id={tile.id}
                  letter={tile.letter}
                  color={tile.color}
                  disabled={usedTileIds.has(tile.id) || wordComplete}
                  small={tilePool.length > 10}
                  onTap={(letter) => {
                    if (!soundOn) return;
                    const audio = tile.audio;
                    if (audio) { new Audio(audio).play().catch(() => {}); }
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* ── Score / Stats card ── */}
          <div style={{ display: 'flex', gap: 12, width: '100%', justifyContent: 'center',
                        flexWrap: 'wrap', paddingBottom: 24 }}>
            {[
              { label: 'ලකුණු', value: score },
              { label: 'වට', value: `${round}/${TOTAL_ROUNDS}` },
              { label: 'Streak', value: streak },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: '#ffffff',
                                        backdropFilter: 'blur(8px)', borderRadius: 18,
                                        border: '2px solid rgba(0,0,0,0.1)',
                                        padding: '12px 26px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#111827',
                               fontFamily: "'Nunito', 'Noto Sans Sinhala', sans-serif" }}>{value}</div>
                <div style={{ fontSize: 14, color: '#6b7280', fontWeight: 700,
                               fontFamily: "'Noto Sans Sinhala', 'Nunito', sans-serif" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTile && (
            <div style={{ width: 78, height: 78, borderRadius: 18, background: activeTile.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 42, fontWeight: 900, color: '#fff',
                          boxShadow: '0 8px 28px rgba(0,0,0,0.35)',
                          border: '3px solid rgba(255,255,255,0.7)',
                  fontFamily: "'Noto Sans Sinhala', sans-serif",
                          letterSpacing: '0.03em',
                          transform: 'rotate(5deg) scale(1.12)' }}>
              {activeTile.letter}
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
