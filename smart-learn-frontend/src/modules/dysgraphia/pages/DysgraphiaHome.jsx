// DysgraphiaHome.jsx
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import wordshomeAudio from '../../../assets/audio/dysgraphia/wordshome.mp3';
import homepageAudio from '../../../assets/audio/dysgraphia/welcome.wav';
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
import dinosaurBackground from '../../../assets/images/dysgraphia/dinosaurs/dinosaur-learning-background.png'
import babyTriceratops from '../../../assets/images/dysgraphia/dinosaurs/baby-triceratops.png'
import babyBrachiosaurus from '../../../assets/images/dysgraphia/dinosaurs/baby-brachiosaurus.png'
import babyPterodactyl from '../../../assets/images/dysgraphia/dinosaurs/baby-pterodactyl.png'


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
    animClass: 'dg-alien-float-1',
    colors: { body:'#5dcc3a', shadow:'#3ea820', eye:'#2a1a5e', ufoRing:'#9b3fcf', ufoTop:'#c5e8ff', ufoLight1:'#ffe04a', ufoLight2:'#ff6b6b', ufoLight3:'#4af0ff' },
  },
  {
    id: 2, number: '02',
    title: 'අපි දැන් අකුරු ලියමු',
    cta: ' අකුරු පුහුණුව',
    side: 'right',
    animClass: 'dg-alien-float-2',
    colors: { body:'#ff8c42', shadow:'#cc5a10', eye:'#1a0a40', ufoRing:'#2563eb', ufoTop:'#bfedff', ufoLight1:'#ff4af0', ufoLight2:'#ffe04a', ufoLight3:'#69f0ae' },
  },
  {
    id: 3, number: '03',
    title: 'දර්පණ අකුරු ඉගෙන ගමු',
    cta: ' මතක් කරමු',
    side: 'left',
    animClass: 'dg-alien-float-3',
    colors: { body:'#40c4ff', shadow:'#0086b3', eye:'#1a1a3a', ufoRing:'#e040fb', ufoTop:'#e8fff0', ufoLight1:'#ff6b6b', ufoLight2:'#b2ff59', ufoLight3:'#ffd740' },
  },
  {
    id: 4, number: '04',
    title: 'අපි දැන් වචනත් ලියමුද',
    cta: ' වචන ගමන',
    side: 'right',
    animClass: 'dg-alien-float-4',
    colors: { body:'#f06292', shadow:'#ad1457', eye:'#1a0030', ufoRing:'#00bcd4', ufoTop:'#fff9c4', ufoLight1:'#69f0ae', ufoLight2:'#40c4ff', ufoLight3:'#ff6b6b' },
  },
  {
    id: 5, number: '05',
    title: 'දැන් අපි ලස්සනට පේළියට වචන ලියමු.',
    cta: ' වචන ගමන',
    side: 'left',
    animClass: 'dg-alien-float-5',
    colors: { body:'#dfff40', shadow:'#0086b3', eye:'#1a1a3a', ufoRing:'#e040fb', ufoTop:'#e8fff0', ufoLight1:'#ff6b6b', ufoLight2:'#b2ff59', ufoLight3:'#ffd740' },
  },
];

const DINO_LEVEL_GRADIENTS = [
  'linear-gradient(135deg, #166534 0%, #16a34a 48%, #4ade80 100%)',
  'linear-gradient(135deg, #b45309 0%, #f97316 50%, #fbbf24 100%)',
  'linear-gradient(135deg, #0f766e 0%, #0891b2 48%, #22d3ee 100%)',
  'linear-gradient(135deg, #6b21a8 0%, #9333ea 50%, #d946ef 100%)',
  'linear-gradient(135deg, #9f1239 0%, #e11d48 48%, #fb7185 100%)',
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

// Calm dinosaur scene for the letter picker: one landscape and two friends only.
const DinoLettersBackground = () => (
  <div className="dg-dino-letters-background" aria-hidden="true">
    <img src={dinosaurBackground} alt="" className="dg-dino-letters-scene" />
    <div className="dg-dino-letters-glaze" />
    <img
      src={babyPterodactyl}
      alt=""
      className="dg-dino-letters-friend dg-dino-letters-friend--flying"
    />
    <img
      src={babyTriceratops}
      alt=""
      className="dg-dino-letters-friend dg-dino-letters-friend--ground"
    />
  </div>
);

//  Main page
const DysgraphiaHome = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isWordSelectionPath = location.pathname === '/dysgraphia/word-game';
  const suppressAutoAudio = Boolean(location.state?.suppressAutoAudio);
  const audioRef = useRef(null);
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
       <main className="dg-home-shell dg-word-dino">
        <DinoLettersBackground />
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
            <h1 className="dg-home-title dg-word-dino-title">
              ඩයිනෝ සමඟ වචන ලියමු
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

  if (mode === 'levels') {
    return (
      <main className="dg-jungle-home dg-dino-home">
        <img
          src={dinosaurBackground}
          alt=""
          aria-hidden="true"
          className="dg-dino-background"
        />
        <div className="dg-dino-glaze" aria-hidden="true" />
        <div className="dg-dino-animals" aria-hidden="true">
          <img src={babyPterodactyl} alt="" className="dg-dino-animal dg-dino-animal--pterodactyl" />
          <img src={babyBrachiosaurus} alt="" className="dg-dino-animal dg-dino-animal--brachiosaurus" />
          <img src={babyTriceratops} alt="" className="dg-dino-animal dg-dino-animal--triceratops" />
        </div>
        <div className="dg-dino-particles" aria-hidden="true">
          {Array.from({ length: 18 }, (_, index) => (
            <span
              key={index}
              style={{
                left: `${(index * 37) % 100}%`,
                width: `${4 + (index % 3) * 2}px`,
                height: `${4 + (index % 3) * 2}px`,
                animationDelay: `-${(index % 8) * 0.9}s`,
                animationDuration: `${8 + (index % 6)}s`,
              }}
            />
          ))}
        </div>

        <div className="dg-jungle-content">
          <header className="dg-jungle-heading">
            <h1>ඩයිනෝ යාළුවෝ සමඟ අකුරු ලියමු</h1>
          </header>

   
          <section className="dg-jungle-levels" aria-label="Dysgraphia learning levels">
            {LEVELS.map((level, index) => (
              <button
                type="button"
                key={level.id}
                className={`dg-jungle-level-card dg-jungle-level-card--${level.side}`}
                style={{ '--dg-level-gradient': DINO_LEVEL_GRADIENTS[index] }}
                onClick={() => handleLevelClick(level.id)}
                aria-label={`${level.number} ${level.title} - ${level.cta}`}
              >
                <span className="dg-jungle-level-shine" aria-hidden="true" />
                <span className="dg-jungle-level-number">{level.id}</span>
                <span className="dg-jungle-level-copy">
                  <strong>{level.title}</strong>
                  <small>{level.cta}</small>
                </span>
                <span className="dg-jungle-play" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="28" height="28">
                    <path d="M8 5v14l11-7z" fill="currentColor" />
                  </svg>
                </span>
              </button>
            ))}
          </section>
        </div>

        <AudioToggleButton
          isPlaying={isVoicePlaying}
          onToggle={handleVoiceToggle}
          className="dg-jungle-audio-toggle"
        />
      </main>
    );
  }

  // Normal levels or letters view
  return (
    <main className={`dg-home-shell relative min-h-screen overflow-hidden px-3 py-5 sm:px-6 ${isLettersPage ? 'dg-dino-letters' : ''}`}>
      {isLettersPage ? <DinoLettersBackground /> : <><LeavesBackground /><TopMonkeys /></>}
      <div className="dg-letters-controls-row dg-letters-background-controls">
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
      <section className="dg-home-card !rounded-[2.5rem] !border-4 !border-white/70 !bg-white/95 !p-4 shadow-[0_20px_60px_rgba(0,0,0,.38)] sm:!p-7">
        <div className="dg-letters-panel">
            <h1 className="dg-dino-letters-title">ඩයිනෝ සමඟ අකුරු තෝරමු</h1>

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
      </section>
    </main>
  );
};

export default DysgraphiaHome;
