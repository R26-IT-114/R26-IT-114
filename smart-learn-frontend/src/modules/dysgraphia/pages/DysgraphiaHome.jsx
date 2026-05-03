import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dysgraphia-common.css';
import '../styles/dysgraphia-home.css';

/* ─────────────────────────────────────────────────────────
   Star field – 160 stars
───────────────────────────────────────────────────────── */
const STAR_COLORS = ['#ffffff','#ffe4b5','#add8e6','#ffcccb','#b0e0e6','#fff176','#e0b0ff'];

const StarField = () => {
  const stars = Array.from({ length: 160 }, (_, i) => ({
    id: i,
    top:   `${Math.random() * 99}%`,
    left:  `${Math.random() * 100}%`,
    size:  Math.random() * 3 + 0.5,
    dur:   (Math.random() * 4 + 2).toFixed(1),
    delay: -(Math.random() * 7).toFixed(1),
    type:  i % 7 === 0 ? 'pulse' : i % 3 === 0 ? 'color' : 'dot',
    color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
  }));
  return (
    <div className="dg-stars-layer" aria-hidden="true">
      {stars.map(s => {
        const cls = s.type === 'pulse' ? 'dg-star-pulse' : s.type === 'color' ? 'dg-star-color' : 'dg-star-dot';
        return (
          <span key={s.id} className={cls} style={{
            top: s.top, left: s.left,
            width: `${s.size}px`, height: `${s.size}px`,
            '--dur': `${s.dur}s`, '--delay': `${s.delay}s`,
            ...(s.type !== 'dot' ? { '--c': s.color } : {}),
          }} />
        );
      })}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   Background flying UFOs
───────────────────────────────────────────────────────── */
const UFOBase = ({ animClass, alienColor, eyeColor, bodyFill, ringGlow, lights }) => (
  <svg className={`dg-ufo ${animClass}`} viewBox="0 0 120 70" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="60" cy="52" rx="44" ry="12" fill={ringGlow} />
    <ellipse cx="60" cy="30" rx="26" ry="18" fill="#b0bec5" opacity="0.92" />
    <ellipse cx="60" cy="30" rx="20" ry="13" fill="#e3f2fd" opacity="0.7" />
    <ellipse cx="54" cy="26" rx="7" ry="5" fill="white" opacity="0.5" />
    <ellipse cx="60" cy="48" rx="42" ry="11" fill={bodyFill} />
    <ellipse cx="60" cy="46" rx="38" ry="9" fill="#b0bec5" />
    {lights.map((l, i) => (
      <circle key={i} cx={l.cx} cy={l.cy} r="4" fill={l.fill}>
        <animate attributeName="opacity" values="1;0.2;1" dur={l.dur} begin={l.begin} repeatCount="indefinite" />
      </circle>
    ))}
    <ellipse cx="60" cy="27" rx="8" ry="9" fill={alienColor} opacity="0.9" />
    <circle cx="56.5" cy="25" r="2.2" fill={eyeColor} />
    <circle cx="63.5" cy="25" r="2.2" fill={eyeColor} />
    <path d="M56 30 Q60 33 64 30" stroke={eyeColor} strokeWidth="1.3" fill="none" />
    <line x1="55" y1="18" x2="50" y2="12" stroke={alienColor} strokeWidth="1.5" />
    <circle cx="50" cy="11" r="2.5" fill="#ef9a9a" />
    <line x1="65" y1="18" x2="70" y2="12" stroke={alienColor} strokeWidth="1.5" />
    <circle cx="70" cy="11" r="2.5" fill="#ef9a9a" />
  </svg>
);

const UFO1 = () => <UFOBase animClass="dg-ufo-1" alienColor="#a5d6a7" eyeColor="#1b5e20" bodyFill="#78909c" ringGlow="rgba(80,255,180,0.18)" lights={[{cx:30,cy:47,fill:'#ff5252',dur:'0.6s',begin:'0s'},{cx:45,cy:44,fill:'#ffeb3b',dur:'0.7s',begin:'0.1s'},{cx:60,cy:43,fill:'#69f0ae',dur:'0.5s',begin:'0.2s'},{cx:75,cy:44,fill:'#40c4ff',dur:'0.8s',begin:'0.05s'},{cx:90,cy:47,fill:'#ea80fc',dur:'0.6s',begin:'0.3s'}]} />;
const UFO2 = () => <UFOBase animClass="dg-ufo-2" alienColor="#ffcc80" eyeColor="#e65100" bodyFill="#ab47bc" ringGlow="rgba(180,130,255,0.15)" lights={[{cx:35,cy:47,fill:'#ffd740',dur:'0.5s',begin:'0s'},{cx:52,cy:44,fill:'#ff4081',dur:'0.7s',begin:'0.15s'},{cx:68,cy:44,fill:'#18ffff',dur:'0.6s',begin:'0.3s'},{cx:85,cy:47,fill:'#b2ff59',dur:'0.8s',begin:'0.1s'}]} />;
const UFO3 = () => <UFOBase animClass="dg-ufo-3" alienColor="#80deea" eyeColor="#006064" bodyFill="#607d8b" ringGlow="rgba(80,200,255,0.15)" lights={[{cx:32,cy:47,fill:'#ff9800',dur:'0.55s',begin:'0s'},{cx:48,cy:44,fill:'#00bcd4',dur:'0.65s',begin:'0.12s'},{cx:64,cy:43,fill:'#8bc34a',dur:'0.48s',begin:'0.25s'},{cx:80,cy:44,fill:'#ff5722',dur:'0.72s',begin:'0.08s'},{cx:90,cy:47,fill:'#9c27b0',dur:'0.58s',begin:'0.33s'}]} />;
const UFO4 = () => <UFOBase animClass="dg-ufo-4" alienColor="#f48fb1" eyeColor="#880e4f" bodyFill="#4db6ac" ringGlow="rgba(255,150,200,0.15)" lights={[{cx:30,cy:47,fill:'#ffeb3b',dur:'0.62s',begin:'0s'},{cx:50,cy:44,fill:'#ff1744',dur:'0.73s',begin:'0.18s'},{cx:70,cy:43,fill:'#76ff03',dur:'0.51s',begin:'0.28s'},{cx:90,cy:47,fill:'#40c4ff',dur:'0.68s',begin:'0.09s'}]} />;
const UFO5 = () => <UFOBase animClass="dg-ufo-5" alienColor="#fff176" eyeColor="#f57f17" bodyFill="#8d6e63" ringGlow="rgba(255,220,80,0.15)" lights={[{cx:35,cy:47,fill:'#e040fb',dur:'0.58s',begin:'0s'},{cx:52,cy:44,fill:'#00e5ff',dur:'0.69s',begin:'0.14s'},{cx:68,cy:44,fill:'#ff6d00',dur:'0.52s',begin:'0.22s'},{cx:85,cy:47,fill:'#69f0ae',dur:'0.77s',begin:'0.06s'}]} />;
const UFO6 = () => <UFOBase animClass="dg-ufo-6" alienColor="#ce93d8" eyeColor="#6a1b9a" bodyFill="#546e7a" ringGlow="rgba(200,100,255,0.15)" lights={[{cx:33,cy:47,fill:'#ff8a65',dur:'0.60s',begin:'0s'},{cx:50,cy:44,fill:'#40c4ff',dur:'0.71s',begin:'0.16s'},{cx:67,cy:43,fill:'#ffeb3b',dur:'0.49s',begin:'0.27s'},{cx:84,cy:47,fill:'#b2ff59',dur:'0.66s',begin:'0.11s'}]} />;

/* ─────────────────────────────────────────────────────────
   Asteroids
───────────────────────────────────────────────────────── */
const ASTEROID_PATHS = [
  'm0-8 3-5 6-1 5 3 4 6 0 8-3 5-6 2-5-3-4-6z',
  'm0-7 4-4 6 0 4 4 2 7-2 5-5 3-6 0-4-4-1-7z',
  'm0-6 5-3 5 1 3 5 0 7-4 4-6 1-4-3-2-6z',
];
const Asteroids = () => (
  <>
    {[{dur:'12s',delay:'0s',y:'15vh',scale:1},{dur:'16s',delay:'5s',y:'72vh',scale:1.3},{dur:'10s',delay:'9s',y:'40vh',scale:0.8},{dur:'14s',delay:'3s',y:'85vh',scale:1.1},{dur:'18s',delay:'14s',y:'28vh',scale:0.7}].map((a, i) => (
      <div key={i} className="dg-asteroid" style={{ '--dur': a.dur, '--delay': a.delay, '--y': a.y }} aria-hidden="true">
        <svg viewBox="-10 -10 20 20" width={30 * a.scale} height={30 * a.scale}>
          <path d={ASTEROID_PATHS[i % ASTEROID_PATHS.length]} fill="#8d6e63" stroke="#6d4c41" strokeWidth="0.5" opacity="0.85" />
        </svg>
      </div>
    ))}
  </>
);

/* ─────────────────────────────────────────────────────────
   CARTOON ALIEN ON UFO — SVG
   Inspired by the uploaded image: green alien standing on
   a purple saucer with glowing lights, big dark eyes,
   waving hand, orbit ring around body.
───────────────────────────────────────────────────────── */
const AlienOnUFO = ({ side = 'left', animClass = '', colors = {} }) => {
  const c = {
    body:      colors.body      || '#5dcc3a',
    shadow:    colors.shadow    || '#3ea820',
    eye:       colors.eye       || '#2a1a5e',
    ufoTop:    colors.ufoTop    || '#c5e8ff',
    ufoRing:   colors.ufoRing   || '#9b3fcf',
    ufoLight1: colors.ufoLight1 || '#ffe04a',
    ufoLight2: colors.ufoLight2 || '#ff6b6b',
    ufoLight3: colors.ufoLight3 || '#4af0ff',
  };

  /* Mirror the whole drawing for right-side aliens */
  const mirrorStyle = side === 'right'
    ? { transform: 'scaleX(-1)', transformOrigin: '50% 50%' }
    : {};

  return (
    <svg
      className={`dg-corner-alien-svg ${animClass}`}
      viewBox="0 0 110 135"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ overflow: 'visible', display: 'block' }}
    >
      <g style={mirrorStyle}>

        {/* ══ UFO SAUCER ══ */}
        {/* shadow cast on ground */}
        <ellipse cx="55" cy="124" rx="38" ry="5" fill="rgba(0,0,0,0.15)" />
        {/* lower hull */}
        <ellipse cx="55" cy="117" rx="42" ry="9" fill="#7c7c8a" />
        {/* main hull */}
        <ellipse cx="55" cy="114" rx="42" ry="9" fill="#c8c8d8" />
        {/* top plate */}
        <ellipse cx="55" cy="111" rx="42" ry="8" fill={c.ufoRing} />
        {/* inner ring highlight */}
        <ellipse cx="55" cy="109" rx="38" ry="6" fill="#c060ee" opacity="0.7" />
        {/* grid lines */}
        <line x1="13" y1="112" x2="97" y2="112" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
        <line x1="27" y1="103" x2="27" y2="120" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
        <line x1="55" y1="101" x2="55" y2="122" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
        <line x1="83" y1="103" x2="83" y2="120" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
        {/* hull outline */}
        <ellipse cx="55" cy="111" rx="42" ry="8" fill="none" stroke="#6a1a9a" strokeWidth="1.5" />
        {/* lights */}
        <circle cx="28" cy="111" r="5.5" fill={c.ufoLight1} stroke="#b8860a" strokeWidth="1.2">
          <animate attributeName="opacity" values="1;0.25;1" dur="0.65s" repeatCount="indefinite" />
          <animate attributeName="r" values="5.5;6.5;5.5" dur="0.65s" repeatCount="indefinite" />
        </circle>
        <circle cx="55" cy="109" r="5.5" fill={c.ufoLight2} stroke="#992020" strokeWidth="1.2">
          <animate attributeName="opacity" values="1;0.25;1" dur="0.85s" begin="0.22s" repeatCount="indefinite" />
          <animate attributeName="r" values="5.5;6.5;5.5" dur="0.85s" begin="0.22s" repeatCount="indefinite" />
        </circle>
        <circle cx="82" cy="111" r="5.5" fill={c.ufoLight3} stroke="#0a7080" strokeWidth="1.2">
          <animate attributeName="opacity" values="1;0.25;1" dur="0.55s" begin="0.44s" repeatCount="indefinite" />
          <animate attributeName="r" values="5.5;6.5;5.5" dur="0.55s" begin="0.44s" repeatCount="indefinite" />
        </circle>
        {/* dome */}
        <ellipse cx="55" cy="101" rx="27" ry="17" fill={c.ufoTop} opacity="0.92" />
        <ellipse cx="55" cy="100" rx="22" ry="13" fill="white" opacity="0.3" />
        <ellipse cx="46" cy="93" rx="9" ry="5" fill="white" opacity="0.4" transform="rotate(-18,46,93)" />

        {/* ══ ALIEN ══ */}
        {/* legs */}
        <rect x="49" y="94" width="9" height="13" rx="4.5" fill={c.body} />
        <rect x="49" y="96" width="9" height="5"  rx="2"   fill={c.shadow} opacity="0.35" />
        {/* leg outline */}
        <rect x="49" y="94" width="9" height="13" rx="4.5" fill="none" stroke="#1a6600" strokeWidth="1.2" />

        {/* torso */}
        <ellipse cx="55" cy="77" rx="16" ry="20" fill={c.body} />
        <ellipse cx="55" cy="86" rx="12" ry="9"  fill={c.shadow} opacity="0.22" />
        <ellipse cx="55" cy="77" rx="16" ry="20" fill="none" stroke="#1a6600" strokeWidth="1.5" />

        {/* belly button */}
        <circle cx="55" cy="83" r="2" fill={c.shadow} opacity="0.55" />

        {/* orbit ring */}
        <defs>
          <path id="dgOrbit1" d="M33,77 a22,8 0 1,1 44,0 a22,8 0 1,1 -44,0" />
          <path id="dgOrbit2" d="M33,77 a22,8 0 1,1 44,0 a22,8 0 1,1 -44,0" />
        </defs>
        <ellipse cx="55" cy="77" rx="22" ry="8" fill="none" stroke="#aaaaaa" strokeWidth="1.3" opacity="0.45" />
        {/* orbit planet earth */}
        <circle r="3.5" fill="#3a8fff" stroke="#1a60cc" strokeWidth="0.8">
          <animateMotion dur="3s" repeatCount="indefinite"><mpath href="#dgOrbit1" /></animateMotion>
        </circle>
        {/* orbit planet saturn */}
        <g>
          <circle r="3" fill="#f5a623" stroke="#c07010" strokeWidth="0.8">
            <animateMotion dur="3s" begin="1.5s" repeatCount="indefinite"><mpath href="#dgOrbit2" /></animateMotion>
          </circle>
        </g>

        {/* LEFT ARM — raised and waving */}
        <path d="M41 67 Q29 54 22 46" stroke={c.body} strokeWidth="9" strokeLinecap="round" fill="none" />
        <path d="M41 67 Q29 54 22 46" stroke={c.shadow} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.28" />
        <path d="M41 67 Q29 54 22 46" stroke="#1a6600" strokeWidth="9" strokeLinecap="round" fill="none" opacity="0.12" />
        {/* left hand */}
        <circle cx="22" cy="46" r="5.5" fill={c.body} stroke="#1a6600" strokeWidth="1.2" />
        <circle cx="16" cy="42" r="4"   fill={c.body} stroke="#1a6600" strokeWidth="1" />
        <circle cx="22" cy="40" r="4"   fill={c.body} stroke="#1a6600" strokeWidth="1" />
        <circle cx="28" cy="41" r="3.5" fill={c.body} stroke="#1a6600" strokeWidth="1" />

        {/* RIGHT ARM — relaxed */}
        <path d="M69 72 Q81 68 87 74" stroke={c.body} strokeWidth="9" strokeLinecap="round" fill="none" />
        <path d="M69 72 Q81 68 87 74" stroke={c.shadow} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.28" />
        <path d="M69 72 Q81 68 87 74" stroke="#1a6600" strokeWidth="9" strokeLinecap="round" fill="none" opacity="0.12" />
        {/* right hand */}
        <circle cx="87" cy="74" r="5.5" fill={c.body} stroke="#1a6600" strokeWidth="1.2" />
        <circle cx="93" cy="71" r="4"   fill={c.body} stroke="#1a6600" strokeWidth="1" />
        <circle cx="93" cy="77" r="3.5" fill={c.body} stroke="#1a6600" strokeWidth="1" />

        {/* ══ HEAD ══ */}
        <ellipse cx="55" cy="44" rx="23" ry="25" fill={c.body} />
        <ellipse cx="55" cy="60" rx="18" ry="8"  fill={c.shadow} opacity="0.28" />
        <ellipse cx="55" cy="44" rx="23" ry="25" fill="none" stroke="#1a6600" strokeWidth="2" />
        {/* head sheen */}
        <ellipse cx="45" cy="33" rx="9" ry="6" fill="white" opacity="0.16" transform="rotate(-20,45,33)" />

        {/* EYES — large dark anime-style */}
        <ellipse cx="44" cy="44" rx="10" ry="12" fill="white" />
        <ellipse cx="66" cy="44" rx="10" ry="12" fill="white" />
        <ellipse cx="44" cy="44" rx="10" ry="12" fill="none" stroke="#1a6600" strokeWidth="1.5" />
        <ellipse cx="66" cy="44" rx="10" ry="12" fill="none" stroke="#1a6600" strokeWidth="1.5" />
        {/* pupils */}
        <ellipse cx="45" cy="45" rx="7" ry="9" fill={c.eye} />
        <ellipse cx="67" cy="45" rx="7" ry="9" fill={c.eye} />
        {/* eye shine primary */}
        <circle cx="42" cy="41" r="3"   fill="white" opacity="0.75" />
        <circle cx="64" cy="41" r="3"   fill="white" opacity="0.75" />
        {/* eye shine secondary */}
        <circle cx="47" cy="49" r="1.5" fill="white" opacity="0.4" />
        <circle cx="69" cy="49" r="1.5" fill="white" opacity="0.4" />

        {/* MOUTH — happy open smile */}
        <path d="M46 59 Q55 68 64 59" stroke="#1a6600" strokeWidth="1.8" fill="white" />
        <path d="M48 60 Q55 65 62 60" fill="#ff9ab2" />
        <rect x="50" y="59" width="5" height="3.5" rx="1.2" fill="white" />
        <rect x="55" y="59" width="5" height="3.5" rx="1.2" fill="white" />

        {/* ANTENNA */}
        <line x1="55" y1="19" x2="55" y2="9" stroke={c.body} strokeWidth="3" strokeLinecap="round" />
        <line x1="55" y1="19" x2="55" y2="9" stroke="#1a6600" strokeWidth="3" strokeLinecap="round" opacity="0.25" />
        <circle cx="55" cy="7" r="5" fill={c.body} stroke="#1a6600" strokeWidth="1.5" />
        {/* antenna glow pulse */}
        <circle cx="55" cy="7" r="3" fill="#ff5588">
          <animate attributeName="r"       values="2.5;4.5;2.5"  dur="1.1s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.4;1"       dur="1.1s" repeatCount="indefinite" />
        </circle>

      </g>
    </svg>
  );
};

/* ─────────────────────────────────────────────────────────
   Space Background
───────────────────────────────────────────────────────── */
const SpaceBackground = () => (
  <>
    <StarField />
    {[1,2,3,4,5,6].map(n => <div key={n} className={`dg-nebula dg-nebula-${n}`} aria-hidden="true" />)}
    {Array.from({length:10},(_,i) => <div key={i} className={`dg-shoot dg-shoot-${i+1}`} aria-hidden="true" />)}
    {Array.from({length:12},(_,i) => <div key={i} className={`dg-planet dg-planet-${i+1}`} aria-hidden="true" />)}
    <div className="dg-saturn" aria-hidden="true"><div className="dg-saturn-body"><div className="dg-saturn-ring" /></div></div>
    <div className="dg-ringed-planet" aria-hidden="true"><div className="dg-ringed-body"><div className="dg-ringed-ring" /></div></div>
    <div className="dg-ringed-planet-2" aria-hidden="true"><div className="dg-ringed-body-2"><div className="dg-ringed-ring-2" /></div></div>
    <Asteroids />
    {[
      {s:'✦',cls:'dg-sparkle-1'},{s:'✧',cls:'dg-sparkle-2'},{s:'✦',cls:'dg-sparkle-3'},
      {s:'✧',cls:'dg-sparkle-4'},{s:'★',cls:'dg-sparkle-5'},{s:'✦',cls:'dg-sparkle-6'},
      {s:'✧',cls:'dg-sparkle-7'},{s:'✦',cls:'dg-sparkle-8'},{s:'★',cls:'dg-sparkle-9'},
      {s:'✧',cls:'dg-sparkle-10'},{s:'✦',cls:'dg-sparkle-11'},{s:'★',cls:'dg-sparkle-12'},
    ].map((item,i) => <div key={i} className={`dg-sparkle ${item.cls}`} aria-hidden="true">{item.s}</div>)}
    <UFO1 /><UFO2 /><UFO3 /><UFO4 /><UFO5 /><UFO6 />
  </>
);

/* ─────────────────────────────────────────────────────────
   Level data — 4 unique aliens, alternating sides
───────────────────────────────────────────────────────── */
const LEVELS = [
  {
    id: 1, number: '01',
    title: 'හෙඩත්තල ඇදීම ඉගෙන ගමු',
    cta: '✨ ගවේෂණය අරඹන්න',
    side: 'left',
    animClass: 'dg-alien-float-1',
    colors: { body:'#5dcc3a', shadow:'#3ea820', eye:'#2a1a5e', ufoRing:'#9b3fcf', ufoTop:'#c5e8ff', ufoLight1:'#ffe04a', ufoLight2:'#ff6b6b', ufoLight3:'#4af0ff' },
  },
  {
    id: 2, number: '02',
    title: 'අපි දැන් අකුරු ලියමු',
    cta: '✍️ අකුරු පුහුණුව',
    side: 'right',
    animClass: 'dg-alien-float-2',
    colors: { body:'#ff8c42', shadow:'#cc5a10', eye:'#1a0a40', ufoRing:'#2563eb', ufoTop:'#bfedff', ufoLight1:'#ff4af0', ufoLight2:'#ffe04a', ufoLight3:'#69f0ae' },
  },
  {
    id: 3, number: '03',
    title: 'කෝ බලන්න ඉගෙන ගත්ත අකුරු ටික',
    cta: '🔍 මතක් කරමු',
    side: 'left',
    animClass: 'dg-alien-float-3',
    colors: { body:'#40c4ff', shadow:'#0086b3', eye:'#1a1a3a', ufoRing:'#e040fb', ufoTop:'#e8fff0', ufoLight1:'#ff6b6b', ufoLight2:'#b2ff59', ufoLight3:'#ffd740' },
  },
  {
    id: 4, number: '04',
    title: 'අපි දැන් වචනත් ලියමුද',
    cta: '📝 වචන ගමන',
    side: 'right',
    animClass: 'dg-alien-float-4',
    colors: { body:'#f06292', shadow:'#ad1457', eye:'#1a0030', ufoRing:'#00bcd4', ufoTop:'#fff9c4', ufoLight1:'#69f0ae', ufoLight2:'#40c4ff', ufoLight3:'#ff6b6b' },
  },
];

/* ─────────────────────────────────────────────────────────
   Main page
───────────────────────────────────────────────────────── */
const DysgraphiaHome = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('levels');
  const [feedback, setFeedback] = useState('');

  const showFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 2500);
  };

  const handleLevelClick = (level) => {
    if (level === 2) {
      setMode('letters');
    } else {
      const msgs = {
        1: '🎨 හෙඩත්තල ඇදීමේ අභ්‍යාස ඉක්මනින් එනවා! 🌟',
        3: '🔍 කෝ බලන්න ඉගෙන ගත්ත අකුරු ටික — ඉක්මනින් එනවා! 🛸',
        4: '✍️ වචන ලිවීමේ වික්‍රමය ඉක්මනින් එනවා! 🚀',
      };
      showFeedback(msgs[level] || '');
    }
  };

  const lettersList = [
    { id:'a',  char:'අ', name:'අකුර', path:'/dysgraphia/letter-a',  gradient:'dg-ctl-orange' },
    { id:'ta', char:'ට', name:'ටකුර', path:'/dysgraphia/letter-ta', gradient:'dg-ctl-blue'   },
    { id:'ra', char:'ර', name:'රකුර', path:'/dysgraphia/letter-ra', gradient:'dg-ctl-teal'   },
  ];

  return (
    <main className="dg-home-shell">
      <SpaceBackground />
      <section className="dg-home-card">
        <h1 className="dg-home-title">පිටසක්වල යාලුවොත් එක්ක අකුරු ලෝකෙට යමුද? 🛸✨</h1>

        {feedback && <div className="dg-feedback-toast">{feedback}</div>}

        {mode === 'levels' ? (
          <div className="dg-levels-grid">
            {LEVELS.map((lv) => (
              <div key={lv.id} className="dg-level-card" onClick={() => handleLevelClick(lv.id)}>

                {/* Cartoon alien SVG — absolutely positioned in corner */}
                <div className={`dg-corner-wrap dg-corner-wrap--${lv.side}`}>
                  <AlienOnUFO side={lv.side} animClass={lv.animClass} colors={lv.colors} />
                </div>

                {/* Text content — pushed away from whichever side has the alien */}
                <div className={`dg-level-body dg-level-body--${lv.side}`}>
                  <div className="dg-level-number">{lv.number}</div>
                  <div className="dg-level-title">{lv.title}</div>
                  <div className="dg-level-btn-glow">{lv.cta}</div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="dg-letters-panel">
            <button className="dg-back-levels" onClick={() => setMode('levels')}>
              ⬅️ ආපසු මට්ටම් වෙත
            </button>
            <div className="dg-letters-subtitle">
              🪐 අපි දැන් අකුරු ලියමු — එක අකුරක් තෝරන්න!
            </div>
            <div className="dg-letters-flex">
              {lettersList.map((letter) => (
                <button key={letter.id} className={`dg-letter-big-btn ${letter.gradient}`} onClick={() => navigate(letter.path)}>
                  <span className="dg-letter-char">{letter.char}</span>
                  <span className="dg-letter-label">{letter.name} ලියමු</span>
                  <span className="dg-letter-alien">👾✨</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default DysgraphiaHome;