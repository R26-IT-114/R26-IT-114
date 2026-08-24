// DysgraphiaHome.jsx
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import wordshomeAudio from '../../../assets/audio/dysgraphia/wordshome.mp3';
import homepageAudio from '../../../assets/audio/dysgraphia/homepage.mp3';
import letterListAudio from '../../../assets/audio/letter_llist_page.mp3';
import '../styles/dysgraphia-common.css';
import '../styles/dysgraphia-home.css';

import letterA from '../../../assets/images/dysgraphia/ALetter01.png'
import letterBa from '../../../assets/images/dysgraphia/BaLetter01.png'
import letterDha from '../../../assets/images/dysgraphia/DhaLetter01.png'
import letterGa from '../../../assets/images/dysgraphia/GaLetter01.png'
import letterHa from '../../../assets/images/dysgraphia/HaLetter01.png'
import letterKa from '../../../assets/images/dysgraphia/KaLetter01.png'
import letterLa from '../../../assets/images/dysgraphia/LaLetter01.png'
import letterMa from '../../../assets/images/dysgraphia/MaLetter01.png'
import letterNa from '../../../assets/images/dysgraphia/NaLetter01.png'
import letterPa from '../../../assets/images/dysgraphia/PaLetter01.png'
import letterRa from '../../../assets/images/dysgraphia/RaLetter01.png'
import letterSa from '../../../assets/images/dysgraphia/SaLetter01.png'
import letterTa from '../../../assets/images/dysgraphia/TaLetter01.png'
import letterTha from '../../../assets/images/dysgraphia/ThaLetter01.png'
import letterU from '../../../assets/images/dysgraphia/ULetter01.png'
import letterYa from '../../../assets/images/dysgraphia/YaLetter01.png'
import leavesBg  from '../../../assets/images/dysgraphia/bgletter04.png'
import monkey  from '../../../assets/images/dysgraphia/monkey.png'
import back  from '../../../assets/images/dysgraphia/back.png'
import wordbutton2  from '../../../assets/images/dysgraphia/wb2.png'
import wordbutton1  from '../../../assets/images/dysgraphia/wb1.png'
import character1 from '../../../assets/images/dysgraphia/c1.png'
import character2 from '../../../assets/images/dysgraphia/c2.png'
import character3 from '../../../assets/images/dysgraphia/c3.png'
import character4 from '../../../assets/images/dysgraphia/c4.png'
import character5 from '../../../assets/images/dysgraphia/c5.png'


  //  Waving Leaves Background — per-leaf ripple via SVG filter
const LeavesBackground = () => (
  <div className="dg-leaves-bg-wrap" aria-hidden="true">
    {/* Hidden SVG that defines the wave-distortion filter */}
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <filter id="dgLeafWave" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.009 0.014"
          numOctaves="2"
          seed="7"
          result="dgNoise"
        >
          <animate
            attributeName="baseFrequency"
            values="0.009 0.014;0.013 0.018;0.007 0.011;0.011 0.016;0.009 0.014"
            dur="16s"
            repeatCount="indefinite"
          />
        </feTurbulence>
        <feDisplacementMap
          in="SourceGraphic"
          in2="dgNoise"
          scale="22"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>

    <div className="dg-leaves-bg" style={{ backgroundImage: `url(${leavesBg})` }} />
    <div className="dg-leaves-overlay" />
  </div>
);



/* ─────────────────────────────────────────────────────────
   Level data — 4 unique aliens, alternating sides
───────────────────────────────────────────────────────── */
const LEVELS = [
  {
    id: 1, number: '01',
    title: 'හැඩතල ඇදීම ඉගෙන ගමු',
    cta: ' ගවේෂණය අරඹන්න',
    side: 'left',
    character: character1,
    animClass: 'dg-alien-float-1',
    colors: { body:'#5dcc3a', shadow:'#3ea820', eye:'#2a1a5e', ufoRing:'#9b3fcf', ufoTop:'#c5e8ff', ufoLight1:'#ffe04a', ufoLight2:'#ff6b6b', ufoLight3:'#4af0ff' },
  },
  {
    id: 2, number: '02',
    title: 'අපි දැන් අකුරු ලියමු',
    cta: ' අකුරු පුහුණුව',
    side: 'right',
    character: character2,
    animClass: 'dg-alien-float-2',
    colors: { body:'#ff8c42', shadow:'#cc5a10', eye:'#1a0a40', ufoRing:'#2563eb', ufoTop:'#bfedff', ufoLight1:'#ff4af0', ufoLight2:'#ffe04a', ufoLight3:'#69f0ae' },
  },
  {
    id: 3, number: '03',
    title: 'දර්පණ අකුරු ඉගෙන ගමු',
    cta: ' මතක් කරමු',
    side: 'left',
    character: character3,
    animClass: 'dg-alien-float-3',
    colors: { body:'#40c4ff', shadow:'#0086b3', eye:'#1a1a3a', ufoRing:'#e040fb', ufoTop:'#e8fff0', ufoLight1:'#ff6b6b', ufoLight2:'#b2ff59', ufoLight3:'#ffd740' },
  },
  {
    id: 4, number: '04',
    title: 'අපි දැන් වචනත් ලියමුද',
    cta: ' වචන ගමන',
    side: 'right',
    character: character4,
    animClass: 'dg-alien-float-4',
    colors: { body:'#f06292', shadow:'#ad1457', eye:'#1a0030', ufoRing:'#00bcd4', ufoTop:'#fff9c4', ufoLight1:'#69f0ae', ufoLight2:'#40c4ff', ufoLight3:'#ff6b6b' },
  },
  {
    id: 5, number: '05',
    title: 'වචනත් ලියමුද',
    cta: ' වචන ගමන',
    side: 'left',
    character: character5,
    animClass: 'dg-alien-float-5',
    colors: { body:'#dfff40', shadow:'#0086b3', eye:'#1a1a3a', ufoRing:'#e040fb', ufoTop:'#e8fff0', ufoLight1:'#ff6b6b', ufoLight2:'#b2ff59', ufoLight3:'#ffd740' },
  },
];

const LEVEL_CARD_STYLES = [
  '!border-sky-300 !bg-gradient-to-r !from-sky-100 !to-blue-50 shadow-[0_8px_0_#7dd3fc]',
  '!border-emerald-300 !bg-gradient-to-r !from-emerald-100 !to-teal-50 shadow-[0_8px_0_#6ee7b7]',
  '!border-violet-300 !bg-gradient-to-r !from-violet-100 !to-fuchsia-50 shadow-[0_8px_0_#c4b5fd]',
  '!border-rose-300 !bg-gradient-to-r !from-rose-100 !to-pink-50 shadow-[0_8px_0_#fda4af]',
  '!border-amber-300 !bg-gradient-to-r !from-amber-100 !to-orange-50 shadow-[0_8px_0_#fcd34d]',
];


const AudioToggleButton = ({ isPlaying, onToggle, className = '' }) => (
  <button
    type="button"
    className={`dg-audio-toggle-btn ${isPlaying ? 'is-playing' : ''} ${className}`.trim()}
    onClick={onToggle}
    aria-label={isPlaying ? 'Stop instructions' : 'Play instructions'}
    title="උපදෙස් අසන්න (Listen to instructions)"
  >
    <span className="dg-audio-toggle-icon" aria-hidden="true">
      {isPlaying ? (
        <svg viewBox="0 0 24 24" width="28" height="28" focusable="false">
          <path d="M3 9v6h4l5 4V5L7 9H3z" fill="currentColor" />
          <path d="M16 8l5 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M21 8l-5 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="28" height="28" focusable="false">
          <path d="M3 9v6h4l5 4V5L7 9H3z" fill="currentColor" />
          <path d="M16 9.5a4 4 0 010 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M18.5 7a8 8 0 010 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
    </span>
  </button>
);

// Swinging Monkey
const TopMonkeys = () => (
  <>
    <div className="dg-monkey-top dg-monkey-top--left" aria-hidden="true">
      <img src={monkey} alt="" className="dg-monkey-img" />
    </div>
    <div className="dg-monkey-top dg-monkey-top--right" aria-hidden="true">
      <img src={monkey} alt="" className="dg-monkey-img" />
    </div>
  </>
);

//  Main page
const DysgraphiaHome = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isWordSelectionPath = location.pathname === '/dysgraphia/word-game';
  const suppressAutoAudio = Boolean(location.state?.suppressAutoAudio);
  const audioRef = useRef(null);
  const [feedback, setFeedback] = useState('');
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const [showWordSelection, setShowWordSelection] = useState(isWordSelectionPath); // true = level 4 word options
  const mode = new URLSearchParams(location.search).get('view') === 'letters' ? 'letters' : 'levels';

  useEffect(() => {
    setShowWordSelection(isWordSelectionPath);
  }, [isWordSelectionPath]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = 0.9;
    }

    const audio = audioRef.current;
    const activeAudioSrc = showWordSelection
      ? wordshomeAudio
      : mode === 'letters'
        ? letterListAudio
        : homepageAudio;

    audio.pause();
    audio.currentTime = 0;
    audio.src = activeAudioSrc;

    if (suppressAutoAudio) {
      setIsVoicePlaying(false);
      return undefined;
    }

    const playPromise = audio.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise
        .then(() => setIsVoicePlaying(true))
        .catch(() => setIsVoicePlaying(false));
    } else {
      setIsVoicePlaying(!audio.paused);
    }

    return undefined;
  }, [mode, showWordSelection, suppressAutoAudio]);

  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
    };
  }, []);

  const handleVoiceToggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio
        .play()
        .then(() => setIsVoicePlaying(true))
        .catch(() => setIsVoicePlaying(false));
      return;
    }

    audio.pause();
    setIsVoicePlaying(false);
  };

  const showFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 2500);
  };

  const handleLevelClick = (level) => {
    if (level === 1) {
      navigate('/dysgraphia/shapes');
    } else if (level === 2) {
      navigate('/dysgraphia?view=letters');
    } else if (level === 3) {
      navigate('/dysgraphia/letter-review');
    } else if (level === 4) {
      navigate('/dysgraphia/word-game');
    } else if (level === 5) {
      navigate('/dysgraphia/writing-lines');
    }
  };

  const handleWordLevelSelect = (type) => {
    if (type === '2-letter') {
      navigate('/dysgraphia/word-game/two-letters');
    } else if (type === '3-letter') {
      navigate('/dysgraphia/word-game/three-letters');
    }
  };

  const backToLevels = () => {
    setShowWordSelection(false);
    navigate('/dysgraphia', { state: { suppressAutoAudio: true } });
  };

  const lettersList = [
    { id:'ta',  level:1, char:'ට', name:'අකුර', path:'/dysgraphia/letter-ta',  gradient:'dg-ctl-blue' , image: letterTa  },
    { id:'ra',  level:1, char:'ර', name:'අකුර', path:'/dysgraphia/letter-ra',  gradient:'dg-ctl-teal' , image: letterRa  },
    { id:'ya',  level:1, char:'ය', name:'අකුර', path:'/dysgraphia/letter-ya',  gradient:'dg-ctl-purple' ,image:letterYa},
    { id:'ga',  level:1, char:'ග', name:'අකුර', path:'/dysgraphia/letter-ga',  gradient:'dg-ctl-indigo' , image: letterGa},
    { id:'la',  level:1, char:'ල', name:'අකුර', path:'/dysgraphia/letter-la',  gradient:'dg-ctl-sky'   , image: letterLa },
    { id:'pa',  level:2, char:'ප', name:'අකුර', path:'/dysgraphia/letter-pa',  gradient:'dg-ctl-green' , image: letterPa },
    { id:'u',   level:2, char:'උ', name:'අකුර', path:'/dysgraphia/letter-u',   gradient:'dg-ctl-violet' , image: letterU},
    { id:'na',  level:2, char:'න', name:'අකුර', path:'/dysgraphia/letter-na',  gradient:'dg-ctl-mint'  , image: letterNa },
    { id:'tha', level:2, char:'ත', name:'අකුර', path:'/dysgraphia/letter-tha', gradient:'dg-ctl-pink'   , image: letterTha},
    { id:'ha',  level:2, char:'හ', name:'අකුර', path:'/dysgraphia/letter-ha',  gradient:'dg-ctl-lemon'  , image: letterHa},
    { id:'ba',  level:3, char:'බ', name:'අකුර', path:'/dysgraphia/letter-ba',  gradient:'dg-ctl-coral'  , image: letterBa},
    { id:'dha', level:3, char:'ද', name:'අකුර', path:'/dysgraphia/letter-dha', gradient:'dg-ctl-yellow', image: letterDha},
    { id:'ka',  level:3, char:'ක', name:'අකුර', path:'/dysgraphia/letter-ka',  gradient:'dg-ctl-red'   , image: letterKa },
    { id:'a',   level:3, char:'අ', name:'අකුර', path:'/dysgraphia/letter-a',   gradient:'dg-ctl-orange', image: letterA },
    { id:'ma',  level:3, char:'ම', name:'අකුර', path:'/dysgraphia/letter-ma',  gradient:'dg-ctl-coral' , image: letterMa },
    { id:'sa',  level:3, char:'ස', name:'අකුර', path:'/dysgraphia/letter-sa',  gradient:'dg-ctl-rose'  , image: letterSa },
  ];

  const LETTER_LEVEL_META = [
    { num:'01', emoji:'', label:'', theme:'dg-lg-blue', tailwindTheme:'!border-sky-300 !bg-sky-100/95' },
    { num:'02', emoji:'', label:'', theme:'dg-lg-green', tailwindTheme:'!border-emerald-300 !bg-emerald-100/95' },
    { num:'03', emoji:'', label:'', theme:'dg-lg-purple', tailwindTheme:'!border-violet-300 !bg-violet-100/95' },
  ];

  const isLettersPage = mode === 'letters' && !showWordSelection;

  // If word selection screen is active, render it
  if (showWordSelection) {
    return (
       <main className="dg-home-shell">
        <LeavesBackground />
        <TopMonkeys />
        <div className="dg-word-top-controls">
           <button
            type="button"  className="dg-word-back-img-btn" onClick={backToLevels} aria-label="මට්ටම් වෙත" title="මට්ටම් වෙත"
          >
            <img src={back} alt="මට්ටම් වෙත" className="dg-word-back-img" />
          </button>
          <AudioToggleButton isPlaying={isVoicePlaying} onToggle={handleVoiceToggle} />
        </div>
        <section className="dg-home-card dg-home-card--transparent">
          {/* Header */}
          <div className="dg-home-header mb-2">
            <h1 className="dg-home-title flex items-center gap-2">
             
            </h1>
          </div>



          {/* Word cards grid */}
          <div className="dg-word-selection-grid">
            <button
              type="button"
              className="dg-word-image-btn"
              onClick={() => handleWordLevelSelect('2-letter')}
              aria-label="අකුරු දෙකේ වචන"
            >
              <img src={wordbutton1} alt="අකුරු දෙකේ වචන" className="dg-word-image" />
            </button>

            <button
              type="button"
              className="dg-word-image-btn"
              onClick={() => handleWordLevelSelect('3-letter')}
              aria-label="අකුරු තුනේ වචන"
            >
              <img src={wordbutton2} alt="අකුරු තුනේ වචන" className="dg-word-image" />
            </button>
          </div>
        </section>
      </main>
    );
  }

  // Normal levels or letters view
  return (
    <main className={`dg-home-shell relative min-h-screen overflow-hidden px-3 py-5 sm:px-6 ${isLettersPage ? 'dg-leaves-mode' : ''}`}>
      <LeavesBackground /> 
     <TopMonkeys />
      {!isLettersPage && (
      <AudioToggleButton isPlaying={isVoicePlaying} onToggle={handleVoiceToggle} />
    )}

      <section className="dg-home-card !rounded-[2.5rem] !border-4 !border-white/70 !bg-white/95 !p-4 shadow-[0_20px_60px_rgba(0,0,0,.38)] sm:!p-7">
        {mode === 'levels' && (
          <>
            {/* ── Header ── */}
            <div className="dg-home-header !items-center rounded-3xl bg-gradient-to-r from-sky-100 via-violet-100 to-pink-100 p-4 shadow-inner sm:p-5">
              <h1 className="dg-home-title flex flex-wrap items-center gap-2 !text-xl !font-black !text-indigo-800 sm:!text-2xl">
                <span>දැන් අපි අකුරු ලියන්න ඉගෙන ගන්නයි යන්නේ.</span>
              </h1>
              <button
                type="button"
                className="dg-progress-btn !rounded-2xl !border-2 !border-white !bg-gradient-to-r !from-cyan-400 !to-blue-500 !px-4 !py-3 !font-black !text-white shadow-[0_5px_0_#2563eb] transition hover:-translate-y-1 hover:shadow-[0_8px_0_#2563eb] focus:outline-none focus:ring-4 focus:ring-cyan-200"
                onClick={() => navigate('/dysgraphia/progress')}
                aria-label="Open progress dashboard"
              >
                📊 මගේ දියුණුව
              </button>
            </div>

            {/* Gradient rule below header */}
            <div className="w-full h-1 rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-60 my-3" />
          </>
        )}

        {feedback && <div className="dg-feedback-toast">{feedback}</div>}

        {mode === 'levels' ? (
          <>

            <div className="dg-levels-grid !mt-5 !gap-5">
              {LEVELS.map((lv, index) => (
                <button
                  type="button"
                  key={lv.id}
                  className={`dg-level-card group !min-h-32 !w-full !cursor-pointer !overflow-hidden !rounded-[2rem] !border-2 text-center transition duration-300 hover:!translate-y-[-6px] hover:!scale-[1.015] focus:outline-none focus:ring-4 focus:ring-white ${LEVEL_CARD_STYLES[index]}`}
                  onClick={() => handleLevelClick(lv.id)}
                  aria-label={`${lv.number} ${lv.title} - ${lv.cta}`}
                >
                  <div className={`dg-corner-wrap dg-corner-wrap--${lv.side}`}>
                    <img
                      src={lv.character}
                      alt=""
                      aria-hidden="true"
                      className={`dg-corner-character ${lv.animClass}`}
                    />
                  </div>
                  <div className={`dg-level-body dg-level-body--${lv.side}`}>
                    <div className="dg-level-number !font-black !text-orange-500 drop-shadow-sm">{lv.number}</div>
                    <div className="dg-level-title !font-black !text-slate-800">{lv.title}</div>
                    {/* Enhanced CTA badge */}
                    <div className="dg-level-btn-glow !rounded-full !border-2 !border-violet-200 !bg-white/75 !px-5 !py-2 !font-black !text-violet-700 transition-transform duration-200 group-hover:scale-105">
                      {lv.cta}
                    </div>
                    {/* Progress dots decoration */}
                    <div className="flex justify-center gap-1 mt-2">
                      {[...Array(3)].map((_, i) => (
                        <span
                          key={i}
                          className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-300 opacity-60"
                        />
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Bottom motivational tag */}
            <div className="flex justify-center mt-4">
              <span className="text-xs font-semibold text-purple-400 tracking-widest uppercase opacity-70">
                ✦ ඔබට හැකියාව ඇත! Keep going! ✦
              </span>
            </div>
          </>
        ) : (
          <div className="dg-letters-panel">
            {/* Fun controls row: back button + audio button, kid-friendly */}
            <div className="dg-letters-controls-row mb-4">
              <button
                className="dg-fun-back-img-btn"
                onClick={() => navigate('/dysgraphia', { state: { suppressAutoAudio: true } })}
                aria-label="ආපසු මට්ටම් වෙත"
                title="ආපසු මට්ටම් වෙත"
              >
                <img src={back} alt="ආපසු" className="dg-fun-back-img" />
              </button>

              <AudioToggleButton
                isPlaying={isVoicePlaying}
                onToggle={handleVoiceToggle}
                className="dg-audio-toggle-btn--fun"
              />
            </div>

            {/* Letters intro badge */}
            <div className="flex justify-center mb-4">
              {/* <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-sky-100 to-purple-100 border border-purple-200 text-purple-700 text-sm font-bold shadow-sm">
                ✏️ ඔබට ඕනෑ අකුරක් තෝරන්න!
              </span> */}
            </div>

            {LETTER_LEVEL_META.map((meta, idx) => {
              const lvNum = idx + 1;
              const letters = lettersList.filter(l => l.level === lvNum);
              // const monkeySide = idx % 2 === 0 ? 'right' : 'left';
              // const monkeyDelay = `${idx * 0.6}s`;

              return (
                <div key={lvNum} className={`dg-level-group ${meta.theme} ${meta.tailwindTheme} mb-5 !rounded-[2rem] !border-2 !p-4 shadow-[0_8px_0_rgba(15,23,42,.12)] sm:!p-5`}>
                  <div className="dg-level-group-header">
                    <span className="dg-lg-badge">අදියර {meta.num}</span>
                  </div>
                  <div className="dg-letters-flex">
                    {letters.map((letter) => (
                      <button
                        key={letter.id}
                        className={letter.image ? 'dg-letter-image-btn' : `dg-letter-big-btn ${letter.gradient}`}
                        onClick={() => navigate(letter.path)}
                      >
                        {letter.image ? (
                          <img
                            src={letter.image}
                            alt={letter.char}
                            className="dg-letter-char-img"
                          />
                        ) : (
                          <span className="dg-letter-char">{letter.char}</span>
                        )}
                      </button>
                    ))}
                  </div>
                  {/* <MonkeyCorner side={monkeySide} delay={monkeyDelay} /> */}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

export default DysgraphiaHome;
