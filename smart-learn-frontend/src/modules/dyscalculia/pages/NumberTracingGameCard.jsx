import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import '../styles/dyscalculia-cartoon.css';
import '../styles/dyscalculia-cartoon2.css';
import { AdventureBackdrop } from '../components/NumberAdventureLand';
import DyscalculiaBackButton from '../components/DyscalculiaBackButton';
import DifficultySelector from '../components/DifficultySelector';
import OceanAnimalFriends from '../components/OceanAnimalFriends';
import { getGameLevels } from '../utils/gameLevelProgress';
import { getNumberTracingCompletedDigits } from '../utils/numberTracingProgress';
import miniMouseImg from '../../../assets/images/dyscalculiaimages/minimouse.png';
import scoobyImg from '../../../assets/images/dyscalculiaimages/scooby.png';
import genieImg from '../../../assets/images/dyscalculiaimages/Genie Aladdin 01.svg';
import lionImg from '../../../assets/images/dyscalculiaimages/lion.png';
import shellTracingBackground from '../../../assets/images/dyscalculia-backgrounds/shell-tracing-shore-realistic-shells.webp';
import easyStarfish from '../../../assets/images/dyscalculiaimages/difficulty-starfish/easy-starfish.webp';
import mediumStarfish from '../../../assets/images/dyscalculiaimages/difficulty-starfish/medium-starfish.webp';
import hardStarfish from '../../../assets/images/dyscalculiaimages/difficulty-starfish/hard-starfish.webp';
import tracingIntroAudio from '../../../assets/audio/dyscalculia/G01.wav';

const LEVEL_DIGITS = { easy: [0, 1, 2, 7], medium: [9, 3, 6], hard: [5, 8, 4] };
const DIGIT_WORDS_SI = ['බිංදුව', 'එක', 'දෙක', 'තුන', 'හතර', 'පහ', 'හය', 'හත', 'අට', 'නවය'];

/* Emoji mascots — one per digit card */
const DIGIT_EMOJIS = ['🐚', '🐢', '🐠', '🦀', '⭐', '🐙', '🐳', '🪸', '🫧', '🐬'];

const TRACING_INTRO_PLAYED_KEY = 'smartlearn:number-tracing:intro-played';
let tracingIntroPlayedInSession = false;

const hasTracingIntroPlayed = () => {
  if (tracingIntroPlayedInSession) return true;

  try {
    return sessionStorage.getItem(TRACING_INTRO_PLAYED_KEY) === 'true';
  } catch {
    return false;
  }
};

const markTracingIntroPlayed = () => {
  tracingIntroPlayedInSession = true;
  try {
    sessionStorage.setItem(TRACING_INTRO_PLAYED_KEY, 'true');
  } catch {
    // The in-memory flag still prevents repeated autoplay in this session.
  }
};

const NumberTracingGameCard = () => {
  const navigate = useNavigate();
  const introAudioRef = useRef(null);
  const pendingInteractionRef = useRef(null);
  const [isIntroPlaying, setIsIntroPlaying] = useState(false);
  // Show playable cards immediately when this route opens. The selector in the
  // page header still lets the learner switch to Medium or Hard.
  const [level, setLevel] = useState('easy');
  const [levels] = useState(() => getGameLevels('NumberTracingGame'));
  const completedDigits = new Set(getNumberTracingCompletedDigits(level));

  useEffect(() => {
    const audio = new Audio(tracingIntroAudio);
    audio.preload = 'auto';
    introAudioRef.current = audio;
    let autoplayTimer = null;

    const handlePlay = () => setIsIntroPlaying(true);
    const handleStop = () => setIsIntroPlaying(false);
    const playAfterInteraction = () => {
      pendingInteractionRef.current = null;
      audio.play().then(markTracingIntroPlayed).catch(() => {});
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handleStop);
    audio.addEventListener('ended', handleStop);

    if (!hasTracingIntroPlayed()) {
      autoplayTimer = window.setTimeout(() => {
        if (introAudioRef.current !== audio) return;

        audio.play().then(markTracingIntroPlayed).catch(() => {
          pendingInteractionRef.current = playAfterInteraction;
          document.addEventListener('pointerdown', playAfterInteraction, { once: true });
        });
      }, 0);
    }

    return () => {
      if (autoplayTimer !== null) window.clearTimeout(autoplayTimer);
      document.removeEventListener('pointerdown', playAfterInteraction);
      if (pendingInteractionRef.current === playAfterInteraction) {
        pendingInteractionRef.current = null;
      }
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handleStop);
      audio.removeEventListener('ended', handleStop);
      audio.pause();
      audio.currentTime = 0;
      introAudioRef.current = null;
    };
  }, []);

  const replayIntro = () => {
    const audio = introAudioRef.current;
    if (!audio) return;

    const pendingInteraction = pendingInteractionRef.current;
    if (pendingInteraction) {
      document.removeEventListener('pointerdown', pendingInteraction);
      pendingInteractionRef.current = null;
    }

    audio.muted = false;
    audio.currentTime = 0;
    audio.play().then(markTracingIntroPlayed).catch(() => {});
  };

  return (
    <main className="dc-shell dc-cartoon-bg ntc-theme adventure-land station-shell-shore">
      <AdventureBackdrop station='shell-tracing-shore' message='Shell Tracing Shore එකේ අංකයක් තෝරමු! 🐚' />
      <OceanAnimalFriends scene="tracing" />

      {/* ── Back Button ── */}
      <DyscalculiaBackButton onClick={() => navigate('/dyscalculia')} variant='aqua' />

      <div className="ntc-deco-layer" aria-hidden="true">
        <span className="ntc-orb orb-1" />
        <span className="ntc-orb orb-2" />
        <span className="ntc-orb orb-3" />
        <span className="ntc-orb orb-4" />
      </div>

      <img src={miniMouseImg} alt="" aria-hidden="true" className="ntc-mascot ntc-mascot--left" />
      <img src={scoobyImg} alt="" aria-hidden="true" className="ntc-mascot ntc-mascot--right" />
      <img src={genieImg} alt="" aria-hidden="true" className="ntc-mascot ntc-mascot--bottom" />
      <img src={lionImg} alt="" aria-hidden="true" className="ntc-mascot ntc-mascot--top" />

      {/* ── Floating balloon decorations ── */}
      <span className="dc-balloon dc-balloon--1" aria-hidden="true">🎈</span>
      <span className="dc-balloon dc-balloon--2" aria-hidden="true">🎈</span>
      <span className="dc-balloon dc-balloon--3" aria-hidden="true">🎈</span>

      <section className="dc-stage ntc-stage">

        {/* ── Header ── */}
        <header className="dc-header-box ntc-header-box">
          <button
            type="button"
            className={`ntc-speaker-button ${isIntroPlaying ? 'is-playing' : ''}`}
            onClick={replayIntro}
            aria-label="හඬ නැවත අසන්න"
            title="හඬ නැවත අසන්න"
          >
            <span aria-hidden="true">🔊</span>
            <span className="ntc-speaker-waves" aria-hidden="true"><i /><i /><i /></span>
          </button>
          <div className="dc-header-stars" aria-hidden="true">⭐ ✨ 🌟 ⭐ ✨ 🌟 ⭐</div>
          <h1 className="dc-title">
            <span className="dc-title-icon" aria-hidden="true">🐚</span>
            අංක ඉගෙනීම සහ ඇඳීම
            <span className="dc-title-range"> (0 – 9)</span>
          </h1>
          <p className="dc-subtitle ntc-subtitle">
            🐢 අංක 2ක් නිවැරදිව සම්පූර්ණ කර ඊළඟ මට්ටම විවෘත කරමු! 🫧
          </p>
          <DifficultySelector
            levels={levels}
            selected={level}
            onSelect={setLevel}
            language="si"
            mascotImages={{
              easy: easyStarfish,
              medium: mediumStarfish,
              hard: hardStarfish,
            }}
          />
        </header>

        {/* ── Digit Grid ── */}
        <div className="dc-grid ntc-grid" role="list" aria-label="පුහුණුව සඳහා අංකයක් තෝරන්න">
          {(level ? LEVEL_DIGITS[level] : []).map((d) => {
            const isCompleted = completedDigits.has(d);

            return (
              <button
              key={d}
              type="button"
              role="listitem"
              onClick={() => navigate(`/dyscalculia/number-tracing/${d}?level=${level}`)}
              className={`dc-digit-card dc-digit-card--${d} ${isCompleted ? 'is-completed' : ''}`}
              aria-label={`අංක ${d} ඇඳීම පුහුණු කරන්න${isCompleted ? ' — සම්පූර්ණයි' : ''}`}
            >
              {/* Emoji mascot top-right */}
              <span className="dc-card-emoji" aria-hidden="true">
                {DIGIT_EMOJIS[d]}
              </span>

              {/* The big digit */}
              <span className="dc-card-num">{d}</span>
              {/* <img
                src={NUMBER_IMAGES[d]}
                alt={DIGIT_WORDS_SI[d]}
                className="dc-card-number-image"
              /> */}

              {/* Word label */}
              <span className="dc-card-word">
                {DIGIT_WORDS_SI[d]}
              </span>
              {isCompleted && (
                <span className="ntc-complete-badge" aria-label="සම්පූර්ණයි" title="සම්පූර්ණයි">
                  <span aria-hidden="true">✓</span>
                </span>
              )}
            </button>
            );
          })}
        </div>

        {/* ── Bottom cheer line ── */}
        <p className="dc-cheer" aria-live="polite">{level ? '🐢 ඔබට පුළුවන්! දිගටම පුහුණු වෙමු! ⭐' : '🐢 Tiki: ආරම්භ කිරීමට Easy, Medium, හෝ Hard තෝරන්න!'}</p>

      </section>

      <style>{`
        .ntc-header-box {
          position: relative;
        }

        .ntc-speaker-button {
          position: absolute;
          top: 16px;
          right: 18px;
          z-index: 8;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          width: 58px;
          height: 50px;
          padding: 0;
          border: 3px solid #ffffff;
          border-radius: 18px;
          color: #075d79;
          background: linear-gradient(145deg, #fff8c7, #70e2ed);
          box-shadow: 0 5px 0 #2d9ab4, 0 10px 18px rgba(10, 107, 136, 0.2);
          cursor: pointer;
          transition: transform 180ms ease, box-shadow 180ms ease;
        }

        .ntc-speaker-button > span:first-child {
          font-size: 1.45rem;
          line-height: 1;
        }

        .ntc-speaker-button:hover,
        .ntc-speaker-button:focus-visible {
          transform: translateY(-2px) scale(1.04);
          box-shadow: 0 7px 0 #2d9ab4, 0 13px 21px rgba(10, 107, 136, 0.24);
          outline: 3px solid rgba(255, 191, 62, 0.72);
          outline-offset: 3px;
        }

        .ntc-speaker-button:active {
          transform: translateY(3px);
          box-shadow: 0 2px 0 #2d9ab4, 0 6px 12px rgba(10, 107, 136, 0.2);
        }

        .ntc-speaker-waves {
          display: flex;
          align-items: center;
          gap: 2px;
          height: 20px;
        }

        .ntc-speaker-waves i {
          display: block;
          width: 3px;
          height: 7px;
          border-radius: 999px;
          background: #087d9d;
        }

        .ntc-speaker-button.is-playing .ntc-speaker-waves i {
          animation: ntcSpeakerWave 0.65s ease-in-out infinite alternate;
        }

        .ntc-speaker-button.is-playing .ntc-speaker-waves i:nth-child(2) {
          height: 15px;
          animation-delay: -0.25s;
        }

        .ntc-speaker-button.is-playing .ntc-speaker-waves i:nth-child(3) {
          height: 11px;
          animation-delay: -0.45s;
        }

        @keyframes ntcSpeakerWave {
          from { transform: scaleY(0.65); }
          to { transform: scaleY(1.35); }
        }

        .ntc-theme {
          display: block !important;
          width: 100%;
          min-height: 100dvh;
          padding: 72px 16px 60px;
          overflow-x: hidden;
          overflow-y: auto;
          background:
            radial-gradient(circle at 8% 16%, rgba(220, 252, 255, 0.9), transparent 33%),
            radial-gradient(circle at 86% 14%, rgba(99, 225, 235, 0.82), transparent 35%),
            radial-gradient(circle at 83% 88%, rgba(74, 179, 218, 0.58), transparent 33%),
            linear-gradient(145deg, #e5fcff 0%, #8ce3eb 45%, #3aa7d1 100%) !important;
          background-size: 145% 145% !important;
          animation: ntcBgMove 16s ease infinite;
        }

        @keyframes ntcBgMove {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
          100% { background-position: 0% 0%; }
        }

        .ntc-deco-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          overflow: hidden;
        }

        .ntc-orb {
          position: absolute;
          border-radius: 999px;
          opacity: 0.46;
          filter: blur(1px);
          animation: ntcFloat 8s ease-in-out infinite;
        }

        .ntc-orb.orb-1 {
          width: 220px;
          height: 220px;
          left: -44px;
          top: 60px;
          background: radial-gradient(circle, rgba(255, 155, 86, 0.92), rgba(255, 155, 86, 0.08));
        }

        .ntc-orb.orb-2 {
          width: 180px;
          height: 180px;
          right: -34px;
          top: 220px;
          background: radial-gradient(circle, rgba(106, 210, 255, 0.9), rgba(106, 210, 255, 0.08));
          animation-delay: 1.2s;
        }

        .ntc-orb.orb-3 {
          width: 240px;
          height: 240px;
          left: 16%;
          bottom: -120px;
          background: radial-gradient(circle, rgba(255, 136, 196, 0.88), rgba(255, 136, 196, 0.05));
          animation-delay: 0.6s;
        }

        .ntc-orb.orb-4 {
          width: 190px;
          height: 190px;
          right: 10%;
          bottom: -70px;
          background: radial-gradient(circle, rgba(255, 220, 98, 0.88), rgba(255, 220, 98, 0.06));
          animation-delay: 1.8s;
        }

        @keyframes ntcFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }

        .ntc-mascot {
          position: fixed;
          z-index: 2;
          pointer-events: none;
          filter: drop-shadow(0 12px 20px rgba(0, 0, 0, 0.2));
          animation: ntcBuddy 3.2s ease-in-out infinite;
        }

        .ntc-mascot--left {
          width: clamp(72px, 10vw, 118px);
          left: 16px;
          top: 116px;
        }

        .ntc-mascot--right {
          width: clamp(82px, 12vw, 132px);
          right: 16px;
          top: 112px;
          animation-delay: 0.6s;
        }

        .ntc-mascot--bottom {
          width: clamp(74px, 11vw, 120px);
          right: 22px;
          bottom: 22px;
          animation-delay: 1.2s;
        }

        .ntc-mascot--top {
          width: clamp(68px, 10vw, 106px);
          left: 18px;
          bottom: 20px;
          animation-delay: 1.7s;
        }

        @keyframes ntcBuddy {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
        }

        .dc-card-number-image {
          width: 70px;
          height: 70px;
          object-fit: contain;
          margin: 8px auto;
          display: block;
          transition: transform 0.3s ease;
        }

        .dc-digit-card:hover .dc-card-number-image {
          transform: scale(1.08);
        }
        .ntc-stage {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          position: relative;
          z-index: 5;
          width: min(980px, 100%);
          min-height: 320px;
          margin: 18px auto 0;
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.62);
          border-radius: 28px;
          padding: 16px 14px 22px;
          box-shadow: 0 16px 30px rgba(0, 0, 0, 0.16);
          backdrop-filter: blur(6px);
        }

        .ntc-stage > * {
          visibility: visible !important;
          opacity: 1 !important;
        }

        .ntc-header-box,
        .ntc-grid {
          display: grid !important;
        }

        .ntc-header-box {
          justify-items: center;
        }

        .ntc-header-box {
          background: linear-gradient(135deg, #ff6e7a 0%, #ff9f1a 38%, #4acb66 100%);
          border-color: rgba(255, 239, 138, 0.95);
        }

        .ntc-subtitle {
          color: #fff8c4;
          font-size: clamp(0.95rem, 2.3vw, 1.1rem);
        }

        .ntc-grid .dc-digit-card {
          min-height: 126px;
          border: 2px solid rgba(255, 255, 255, 0.22);
        }

        .ntc-grid .dc-card-word {
          font-size: 0.76rem;
          text-transform: none;
          letter-spacing: 0.4px;
        }

        .ntc-complete-badge {
          position: absolute;
          right: 9px;
          bottom: 9px;
          z-index: 5;
          display: grid;
          place-items: center;
          width: 29px;
          height: 29px;
          border: 3px solid #fff;
          border-radius: 50%;
          background: linear-gradient(145deg, #79e5a8, #159957);
          color: #fff;
          font-size: 1rem;
          font-weight: 950;
          box-shadow: 0 4px 0 rgba(10, 105, 70, .2), 0 7px 12px rgba(7, 99, 75, .2);
          animation: ntcBadgeIn .35s cubic-bezier(.2, .9, .3, 1.3);
        }

        .dc-digit-card.is-completed {
          border-color: #54c994 !important;
        }

        @keyframes ntcBadgeIn {
          from { opacity: 0; transform: scale(.35) rotate(-18deg); }
          to { opacity: 1; transform: scale(1) rotate(0); }
        }

        /* Keep the tracing picker as one compact page. Shared beach and level
           styles also support full-screen selectors, so this page explicitly
           opts its embedded selector back into an inline header layout. */
        main.dc-shell.dc-cartoon-bg.ntc-theme {
          min-height: calc(100dvh - 52px);
          padding: clamp(18px, 3vw, 36px) clamp(12px, 3vw, 32px) 44px;
          background:
            linear-gradient(rgba(225, 249, 255, 0.2), rgba(255, 246, 218, 0.16)),
            url(${shellTracingBackground}) center center / cover no-repeat fixed !important;
          background-size: cover !important;
          background-position: center center !important;
          background-repeat: no-repeat !important;
          animation: none !important;
        }

        .ntc-theme > .nal-backdrop,
        .ntc-theme > .nal-floating-mascot,
        .ntc-theme > .ntc-deco-layer,
        .ntc-theme > .ntc-mascot,
        .ntc-theme > .dc-balloon {
          display: none !important;
        }

        .ntc-theme::after {
          display: none !important;
        }

        @media (max-width: 700px) {
          main.dc-shell.dc-cartoon-bg.ntc-theme {
            background-position: center top !important;
            background-attachment: scroll !important;
          }
        }

        .ntc-stage {
          width: min(1120px, 100%);
          min-height: 0;
          margin: 0 auto;
          padding: clamp(16px, 2.5vw, 28px);
          border: 2px solid rgba(255, 255, 255, 0.92) !important;
          border-radius: 30px;
          background: rgba(248, 254, 255, 0.93) !important;
          box-shadow: 0 22px 55px rgba(8, 87, 124, 0.22) !important;
          backdrop-filter: blur(10px);
        }

        .ntc-header-box {
          display: block !important;
          margin: 0 0 clamp(18px, 2.5vw, 28px);
          padding: clamp(18px, 2.5vw, 28px);
          overflow: visible;
          border: 2px solid rgba(93, 204, 219, 0.7) !important;
          border-radius: 24px;
          background: linear-gradient(145deg, #fffdf4, #e5faff) !important;
          box-shadow: 0 10px 28px rgba(15, 126, 158, 0.13) !important;
        }

        .ntc-header-box::before,
        .ntc-header-stars {
          display: none;
        }

        .ntc-header-box .dc-title {
          margin: 0 0 8px;
          padding-inline: 64px;
          color: #164663;
          font-size: clamp(1.55rem, 3vw, 2.25rem);
          text-shadow: none;
        }

        .ntc-header-box .ntc-subtitle {
          margin: 0;
          color: #3b718a;
          text-shadow: none;
        }

        .ntc-header-box .dc-level-screen {
          min-height: 0;
          margin: 18px 0 0;
          padding: 0;
          overflow: visible;
          background: transparent !important;
        }

        .ntc-header-box .dc-level-screen::before,
        .ntc-header-box .dc-level-screen::after {
          display: none !important;
          content: none !important;
        }

        .ntc-header-box .dc-level-selector {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          width: 100%;
          gap: 22px;
          margin: 0;
          padding-top: 46px;
        }

        .ntc-header-box .dc-level-button {
          position: relative;
          isolation: isolate;
          overflow: visible;
          width: 100%;
          min-height: 152px;
          padding: 54px 5px 0;
          border: 0;
          border-radius: 24px;
          background: transparent !important;
          box-shadow: none;
          transition: transform 180ms ease, box-shadow 180ms ease, filter 180ms ease;
        }

        .ntc-header-box .dc-level-button::before {
          display: none;
        }

        .ntc-header-box .dc-level-button:hover:not(:disabled) {
          transform: translateY(-5px) rotate(-0.5deg);
          box-shadow: none;
        }

        .ntc-header-box .dc-level-card-content {
          position: relative;
          z-index: 2;
          display: flex;
          min-height: 98px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 12px 10px 10px;
          border: 4px solid #1aa9be;
          border-radius: 18px;
          background: linear-gradient(145deg, #fffdf1 0%, #fff5cf 100%);
          box-shadow:
            inset 0 0 0 3px rgba(255, 255, 255, 0.92),
            0 8px 0 rgba(17, 128, 148, 0.28),
            0 13px 20px rgba(30, 104, 127, 0.2);
          color: #14516e;
        }

        .ntc-header-box .ocean-level-easy .dc-level-card-content {
          border-color: #22b99f;
        }

        .ntc-header-box .ocean-level-medium .dc-level-card-content {
          border-color: #ef9c25;
        }

        .ntc-header-box .ocean-level-hard .dc-level-card-content {
          border-color: #4b8ed8;
        }

        .ntc-header-box .dc-level-card-content b {
          color: #087b87;
          font-size: clamp(1.08rem, 2vw, 1.42rem);
          line-height: 1.15;
        }

        .ntc-header-box .dc-level-card-content em {
          margin-top: 5px;
          color: #355c70;
          font-size: clamp(0.68rem, 1.1vw, 0.82rem);
          font-weight: 800;
        }

        .ntc-header-box .dc-level-status-icon {
          position: absolute;
          top: 8px;
          left: 10px;
          font-size: 1.15rem;
        }

        .ntc-header-box .dc-level-starfish {
          position: absolute;
          z-index: 1;
          top: -44px;
          left: 50%;
          width: clamp(148px, 14vw, 190px);
          height: clamp(148px, 14vw, 190px);
          object-fit: contain;
          transform: translateX(-50%);
          filter: drop-shadow(0 7px 5px rgba(24, 91, 112, 0.28));
          animation: ntc-starfish-hold 3s ease-in-out infinite;
          pointer-events: none;
        }

        .ntc-header-box .ocean-level-medium .dc-level-starfish {
          animation-delay: -1s;
        }

        .ntc-header-box .ocean-level-hard .dc-level-starfish {
          animation-delay: -2s;
        }

        .ntc-header-box .dc-level-button.is-locked .dc-level-starfish {
          opacity: 0.76;
          filter: grayscale(0.18) drop-shadow(0 6px 4px rgba(24, 91, 112, 0.2));
        }

        @keyframes ntc-starfish-hold {
          0%, 100% { transform: translateX(-50%) translateY(0) rotate(-1.2deg); }
          50% { transform: translateX(-50%) translateY(-5px) rotate(1.2deg); }
        }

        .ntc-grid {
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: clamp(12px, 2vw, 20px);
        }

        .ntc-grid .dc-digit-card {
          min-height: 150px;
          padding: 18px 12px;
          border: 2px solid #65cbd7 !important;
          border-radius: 22px;
        }

        .ntc-grid .dc-card-num {
          color: #164663;
          font-size: clamp(3rem, 6vw, 4.7rem);
          line-height: 1;
          text-shadow: 0 3px 0 rgba(255, 255, 255, 0.9);
        }

        .ntc-grid .dc-card-word {
          color: #466c7d;
          font-size: 0.9rem;
          font-weight: 900;
        }

        .ntc-theme .dc-cheer {
          margin: 24px 0 0;
          color: #167fa5 !important;
          font-size: clamp(0.95rem, 2vw, 1.15rem);
        }

        @media (max-width: 1024px) {
          main.dc-shell.dc-cartoon-bg.ntc-theme {
            padding: 72px 14px 36px;
          }

          .ntc-stage {
            width: 100%;
            padding: 18px;
            border-radius: 24px;
          }

          .ntc-header-box {
            padding: 20px 16px;
          }

          .ntc-header-box .dc-level-selector {
            gap: 12px;
            padding-top: 36px;
          }

          .ntc-header-box .dc-level-button {
            min-height: 126px;
            padding-top: 44px;
          }

          .ntc-header-box .dc-level-starfish {
            top: -34px;
            width: clamp(112px, 15vw, 145px);
            height: clamp(112px, 15vw, 145px);
          }

          .ntc-header-box .dc-level-card-content {
            min-height: 82px;
            padding-inline: 6px;
          }

          .ntc-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .ntc-grid .dc-digit-card {
            min-height: 128px;
          }
        }

        @media (max-width: 760px) {
          main.dc-shell.dc-cartoon-bg.ntc-theme {
            padding: 68px 8px 28px;
          }

          .ntc-mascot {
            display: none;
          }

          .ntc-stage {
            margin-top: 0;
            padding: 10px;
            border-radius: 18px;
          }

          .ntc-header-box {
            margin-bottom: 14px;
            padding: 16px 10px;
            border-radius: 18px;
          }

          .ntc-speaker-button {
            top: 10px;
            right: 10px;
            width: 48px;
            height: 44px;
            border-radius: 15px;
          }

          .ntc-header-box .dc-title {
            padding: 48px 0 0;
            font-size: clamp(1.25rem, 6vw, 1.65rem);
            line-height: 1.25;
          }

          .ntc-header-box .ntc-subtitle {
            font-size: .78rem;
            line-height: 1.4;
          }

          .ntc-grid .dc-card-word {
            font-size: .72rem;
          }

          .ntc-header-box .dc-level-selector {
            grid-template-columns: 1fr;
            gap: 30px;
            padding-top: 40px;
          }

          .ntc-header-box .dc-level-button {
            min-height: 118px;
            padding: 42px 2px 0;
          }

          .ntc-header-box .dc-level-starfish {
            top: -31px;
            width: 122px;
            height: 122px;
          }

          .ntc-header-box .dc-level-card-content {
            min-height: 78px;
          }

          .ntc-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .ntc-grid .dc-digit-card {
            min-height: 106px;
            padding: 12px 8px;
            border-radius: 16px;
          }

          .ntc-grid .dc-card-num {
            font-size: clamp(2.5rem, 15vw, 3.5rem);
          }

          .ntc-theme .dc-cheer {
            margin-top: 15px;
            font-size: .82rem;
          }
        }

        @media (max-width: 420px) {
          .ntc-header-box .dc-title-range {
            display: block;
          }

          .ntc-header-box .dc-level-selector {
            gap: 24px;
            padding-top: 34px;
          }

          .ntc-grid {
            gap: 8px;
          }

          .ntc-grid .dc-digit-card {
            min-height: 94px;
          }

          .ntc-grid .dc-card-emoji {
            font-size: 1rem;
          }
        }

        @media (max-width: 760px) {
        .dc-card-number-image {
          width: 50px;
          height: 50px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .ntc-header-box .dc-level-starfish,
        .ntc-speaker-button.is-playing .ntc-speaker-waves i {
          animation: none;
        }
      }
      `}</style>
    </main>
  );
};

export default NumberTracingGameCard;
