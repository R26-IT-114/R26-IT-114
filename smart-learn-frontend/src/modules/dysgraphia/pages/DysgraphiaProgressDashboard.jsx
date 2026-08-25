import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dysgraphiaService } from '../services/dysgraphiaService';
import { NODE_LETTERS } from '../data/nodeLetterCatalog';
import leavesBg from '../../../assets/images/dysgraphia/bgletter04.png';
import monkey from '../../../assets/images/dysgraphia/monkey.png';
import backImage from '../../../assets/images/dysgraphia/back.png';
import starImage from '../../../assets/images/dysgraphia/star.png';
import doneImage from '../../../assets/images/dysgraphia/done.png';
import timeImage from '../../../assets/images/dysgraphia/time.png';
import dashboardTitleImage from '../../../assets/images/dysgraphia/dashtopic.png';
import '../styles/dysgraphia-progress-dashboard.css';

const EMPTY_OVERVIEW = {
  dysgraphia: {
    letterTracing: {},
    mirrorLetters: {},
    twoLetterWords: {},
    threeLetterWords: {},
    writingLines: {},
  },
  stats: {},
  progress: {},
  recentSessions: [],
};

const LETTER_ROUTES = {
  අ: 'a', ට: 'ta', ර: 'ra', ය: 'ya', ප: 'pa', බ: 'ba', ද: 'dha',
  ග: 'ga', හ: 'ha', ක: 'ka', ල: 'la', ම: 'ma', න: 'na', ස: 'sa', උ: 'u', ත: 'tha',
};

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const toItems = (value) => (value && typeof value === 'object' ? Object.entries(value).map(([id, item]) => ({ id, ...(item || {}) })) : []);
const percent = (value) => `${Math.round(Math.max(0, Math.min(1, toNumber(value))) * 100)}%`;
const successRate = (item) => toNumber(item.totalAttempts) > 0 ? toNumber(item.correctAttempts) / toNumber(item.totalAttempts) : 0;
const confidenceRate = (item) => toNumber(item.averageConfidence);
const formatMinutes = (seconds) => `ගත වූ කාලය ${Math.max(0, Math.round(toNumber(seconds) / 60))} මිනි.`;

const getLetterPracticeItems = (items) => items
  .map((item) => {
    const correctAttempts = toNumber(item.correctAttempts);
    const totalAttempts = toNumber(item.totalAttempts);
    return {
      ...item,
      needsPractice: correctAttempts === 0 || (totalAttempts > 5 && correctAttempts === 1),
    };
  })
  .filter((item) => item.needsPractice)
  .sort((a, b) => confidenceRate(a) - confidenceRate(b));

const getMirrorDifficultyItems = (items) => items
  .map((item) => ({
    ...item,
    recognitionDifficulty: toNumber(item.wrongAttempts) >= 3 || (toNumber(item.totalAttempts) > 0 && toNumber(item.wrongAttempts) / toNumber(item.totalAttempts) > 0.4),
    drawingDifficulty: toNumber(item.drawingWrongAttempts) >= 2 || (toNumber(item.drawingAttempts) > 0 && toNumber(item.drawingCorrectAttempts) / toNumber(item.drawingAttempts) < 0.7),
  }))
  .filter((item) => item.recognitionDifficulty || item.drawingDifficulty);

const getDifficultWords = (items) => items
  .map((item) => ({ ...item, needsPractice: confidenceRate(item) < 0.7 || toNumber(item.wrongAttempts) >= 2 }))
  .filter((item) => item.needsPractice)
  .sort((a, b) => confidenceRate(a) - confidenceRate(b));

const getWritingLineIssues = (items) => items.flatMap((item) => {
  const issues = [];
  if (item.hardLinesFail === true || toNumber(item.outOfLinesPct) > 25) issues.push({ ...item, issue: 'lines' });
  if (item.sizeFail === true) issues.push({ ...item, issue: 'size' });
  if (item.spacingFail === true) issues.push({ ...item, issue: 'spacing' });
  return issues;
});

const getStrongAreas = ({ letters, mirror, twoWords, threeWords, lines }) => {
  const strong = [];
  const bestLetter = [...letters].sort((a, b) => confidenceRate(b) - confidenceRate(a))[0];
  if (bestLetter && confidenceRate(bestLetter) >= 0.8) strong.push(`${bestLetter.targetChar} ලියන එක සුපිරියි!`);
  if (mirror.some((item) => toNumber(item.totalAttempts) > 0 && successRate(item) >= 0.8)) strong.push('ඔබ කැඩපත් අකුරු හරියටම හඳුනාගත්තා!');
  if ([...twoWords, ...threeWords].some((item) => confidenceRate(item) >= 0.8)) strong.push('ඔබ වචන එක්ක නියමයට වැඩ කරනවා!');
  if (lines.some((item) => item.spacingFail !== true && item.completed)) strong.push('ඔබේ පරතරය දියුණු වෙනවා!');
  return strong.slice(0, 4);
};

const getPracticeRecommendations = ({ letterPractice, mirrorDifficulty, twoWords, threeWords, lineIssues }) => {
  const recommendations = [];
  letterPractice.forEach((letter) => recommendations.push({
    icon: '✏️',
    text: `${letter.targetChar} පුහුණු කරමු`,
    route: `/dysgraphia/letter-${LETTER_ROUTES[letter.targetChar] || 'review'}`,
    letterId: LETTER_ROUTES[letter.targetChar],
    weakLetter: true,
  }));
  const mirrorRecognition = mirrorDifficulty.find((item) => item.recognitionDifficulty);
  if (mirrorRecognition) recommendations.push({ icon: '🪞', text: `හරි ${mirrorRecognition.targetChar} එක හොයමු`, route: '/dysgraphia/letter-review', letterId: LETTER_ROUTES[mirrorRecognition.targetChar], mirrorGame: true });
  const mirrorDrawing = mirrorDifficulty.find((item) => item.drawingDifficulty);
  if (mirrorDrawing) recommendations.push({ icon: '🖍️', text: `${mirrorDrawing.targetChar} අඳිමින් ඉන්න`, route: '/dysgraphia/letter-review', letterId: LETTER_ROUTES[mirrorDrawing.targetChar], mirrorGame: true });
  if (twoWords[0]) recommendations.push({ icon: '📝', text: `${twoWords[0].targetWord} පුහුණු කරමු`, route: '/dysgraphia/word-game/two-letters' });
  if (threeWords[0]) recommendations.push({ icon: '📝', text: `${threeWords[0].targetWord} පුහුණු කරමු`, route: '/dysgraphia/word-game/three-letters' });
  if (lineIssues.some((item) => item.issue === 'lines')) recommendations.push({ icon: '📏', text: 'රේඛා ඇතුලේ ලියමින් ඉන්න', route: '/dysgraphia/writing-lines' });
  if (lineIssues.some((item) => item.issue === 'size')) recommendations.push({ icon: '↕️', text: 'අකුරු එකම ප්‍රමාණයට ලියන්න', route: '/dysgraphia/writing-lines' });
  if (lineIssues.some((item) => item.issue === 'spacing')) recommendations.push({ icon: '↔️', text: 'අකුරු අතර පරතර තියන්න', route: '/dysgraphia/writing-lines' });
  return recommendations;
};

const ProgressBar = ({ value, color = 'mint' }) => (
  <div className="h-3 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
    <span className={`block h-full rounded-full transition-[width] duration-700 ${color === 'sun' ? 'bg-gradient-to-r from-amber-300 to-orange-400' : color === 'blue' ? 'bg-gradient-to-r from-sky-400 to-blue-500' : color === 'coral' ? 'bg-gradient-to-r from-rose-400 to-orange-400' : 'bg-gradient-to-r from-emerald-400 to-teal-500'}`} style={{ width: percent(value) }} />
  </div>
);

const ActionButton = ({ children, onClick }) => <button type="button" className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-black text-white shadow-[0_5px_0_#4338ca] transition hover:-translate-y-1 hover:shadow-[0_8px_0_#4338ca] active:translate-y-1 active:shadow-[0_2px_0_#4338ca] focus:outline-none focus:ring-4 focus:ring-violet-200" onClick={onClick}>{children}</button>;

const LetterCard = ({ item }) => (
  <article className={`rounded-3xl border-2 p-5 shadow-[0_7px_0_rgba(80,100,120,.12)] transition hover:-translate-y-1 ${item.needsPractice ? 'border-rose-300 bg-gradient-to-br from-rose-50 to-orange-100' : 'border-white bg-white/95'}`}>
    <div className="mb-4 flex items-center justify-between gap-3"><span className={`text-5xl font-black ${item.needsPractice ? 'text-rose-500' : 'text-orange-500'}`}>{item.targetChar || '?'}</span><span className={`rounded-full px-3 py-2 text-xs font-black ${item.needsPractice ? 'bg-rose-200 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>{item.needsPractice ? 'තව පුහුණු වෙන්න' : 'සුපිරි වැඩක්!'}</span></div>
    <ProgressBar value={successRate(item)} color="sun" />
    <div className="mt-3 flex justify-between gap-2 text-sm font-extrabold text-slate-600"><span>හරි {toNumber(item.correctAttempts)}</span><span>විශ්වාසය {Math.round(confidenceRate(item) * 100)}%</span></div>
    <div className="mt-2 text-xs font-bold leading-5 text-slate-400">උත්සාහ {toNumber(item.totalAttempts)} · මකපු වාර {toNumber(item.eraseCount)} · {formatMinutes(item.totalTimeSeconds)}</div>
  </article>
);

const MirrorCard = ({ item }) => (
  <article className="rounded-3xl border-2 border-white bg-white/95 p-5 shadow-[0_7px_0_rgba(80,100,120,.12)] transition hover:-translate-y-1">
    <div className="mb-4 flex items-center justify-between gap-3"><span className="text-5xl font-black text-teal-600">{item.targetChar || '?'}</span><span className="rounded-full bg-sky-100 px-3 py-2 text-xs font-black text-sky-800">{item.recognitionDifficulty ? 'තව පුහුණු වෙන්න' : 'සුපිරි වැඩක්!'}</span></div>
    <div className="my-4"><div className="mb-2 flex flex-col gap-1 text-xs sm:flex-row sm:justify-between"><strong className="text-slate-700">නිවැරදි අකුර සොයා ගැනීම</strong><span className="text-slate-500">{item.recognitionDifficulty ? 'ආයෙත් උත්සාහ කරමු ' : 'හඳුනා ගැනීම හොඳයි'}</span></div><ProgressBar value={successRate(item)} color="blue" /></div>
    <div className="my-4"><div className="mb-2 flex flex-col gap-1 text-xs sm:flex-row sm:justify-between"><strong className="text-slate-700">නිවැරදිව අකුර ලිවීම</strong><span className="text-slate-500">{item.drawingDifficulty ? 'දිගටම පුහුණු වෙන්න ' : 'ලිවීම නිවැරදියි'}</span></div><ProgressBar value={toNumber(item.drawingAttempts) ? toNumber(item.drawingCorrectAttempts) / toNumber(item.drawingAttempts) : 0} color="coral" /></div>
    <div className="mt-2 text-xs font-bold text-slate-400">හොයන උත්සාහ {toNumber(item.totalAttempts)} · අඳින උත්සාහ {toNumber(item.drawingAttempts)}</div>
  </article>
);

const WordCard = ({ item }) => (
  <article className="rounded-3xl border-2 border-white bg-white/95 p-5 shadow-[0_7px_0_rgba(80,100,120,.12)] transition hover:-translate-y-1">
    <div className="mb-4 flex items-center justify-between gap-3"><strong className="text-3xl font-black text-violet-700">{item.targetWord || '?'}</strong><span className="rounded-full bg-amber-100 px-3 py-2 text-xs font-black text-amber-800">{item.needsPractice ? 'තව පුහුණු වෙන්න' : 'සුපිරි වචනයක්!'}</span></div>
    <ProgressBar value={successRate(item)} color="coral" />
    <div className="mt-3 flex justify-between text-sm font-extrabold text-slate-600"><span>හරි {toNumber(item.correctAttempts)}</span><span>විශ්වාසය {Math.round(confidenceRate(item) * 100)}%</span></div>
    <div className="mt-2 text-xs font-bold text-slate-400">උත්සාහ {toNumber(item.totalAttempts)} · {formatMinutes(item.totalTimeSeconds)}</div>
  </article>
);

const getSpacingDetails = (item) => {
  const gaps = Array.isArray(item.spacing) ? item.spacing.map(Number).filter(Number.isFinite) : [];
  const sizes = Array.isArray(item.sizes) ? item.sizes : [];
  const widths = sizes.map((size) => Number(size?.width)).filter((width) => Number.isFinite(width) && width > 0);
  if (!gaps.length || !widths.length) return { label: 'දත්ත නැත', detail: 'පරතර මැනීමක් නැත', status: 'unknown' };

  const averageGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
  const averageWidth = widths.reduce((sum, width) => sum + width, 0) / widths.length;
  const ratios = gaps.map((gap) => gap / averageWidth);
  const tooTight = ratios.some((ratio) => ratio < 0.35);
  const tooLoose = ratios.some((ratio) => ratio > 1.5);
  if (tooTight && tooLoose) return { label: 'අසමානයි', detail: `සාමාන්‍ය පරතරය ${averageGap.toFixed(1)} px`, status: 'bad' };
  if (tooTight) return { label: 'අඩුයි — වැඩි කළ යුතුයි', detail: `සාමාන්‍ය පරතරය ${averageGap.toFixed(1)} px`, status: 'bad' };
  if (tooLoose || item.spacingFail === true) return { label: 'වැඩියි — අඩු කළ යුතුයි', detail: `සාමාන්‍ය පරතරය ${averageGap.toFixed(1)} px`, status: 'bad' };
  return { label: 'හොඳයි', detail: `සාමාන්‍ය පරතරය ${averageGap.toFixed(1)} px`, status: 'good' };
};

const getSizeDetails = (item) => {
  const details = Array.isArray(item.letterSizeDetails) ? item.letterSizeDetails : [];
  const detailLetters = (status) => details.filter((detail) => detail.status === status).map((detail) => detail.letter).filter(Boolean);
  const big = detailLetters('big').length ? detailLetters('big') : (Array.isArray(item.bigLetters) ? item.bigLetters : []);
  const small = detailLetters('small').length ? detailLetters('small') : (Array.isArray(item.smallLetters) ? item.smallLetters : []);
  const parts = [];
  if (big.length) parts.push(`විශාල: ${big.join(', ')}`);
  if (small.length) parts.push(`කුඩා: ${small.join(', ')}`);
  // return parts.length ? parts.join(' · ') : (item.sizeFail === true ? 'අකුරු ප්‍රමාණ අසමානයි' : 'අකුරු ප්‍රමාණය හොඳයි');
};

const WritingLineCard = ({ item }) => {
  const spacing = getSpacingDetails(item);
  const linesNeedWork = item.hardLinesFail === true || toNumber(item.outOfLinesPct) > 25;
  const sizeNeedsWork = item.sizeFail === true;
  return (
    <article className="dgd-line-card">
      <div className="dgd-item-top"><strong className="dgd-word">{item.targetWord || '?'}</strong><span className="dgd-pill">{item.completed ? 'සුපිරි වැඩක්!' : 'දිගටම කරගෙන යන්න'}</span></div>
      <div className="dgd-line-attempts">🎯 උත්සාහයන් <strong>{toNumber(item.totalAttempts)}</strong><span>සාර්ථක {toNumber(item.passedAttempts)}</span></div>
      <div className="dgd-skill-list">
        <span className={linesNeedWork ? 'is-needs-work' : 'is-good'}>📏 රේඛා ඇතුළේ: <strong>{linesNeedWork ? 'තව පුහුණු වෙමු' : 'හොඳයි'}</strong><small>{toNumber(item.outOfLinesPct).toFixed(1)}% පිටත</small></span>
        <span className={sizeNeedsWork ? 'is-needs-work' : 'is-good'}>↕️ අකුරු ප්‍රමාණය: <strong>{sizeNeedsWork ? 'තව පුහුණු වෙමු' : 'හොඳයි'}</strong><small>{getSizeDetails(item)}</small></span>
        <span className={spacing.status === 'bad' ? 'is-needs-work' : 'is-good'}>↔️ අකුරු පරතරය: <strong>{spacing.label}</strong></span>
      </div>
    </article>
  );
};

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

const Section = ({ title, icon, children, className = '' }) => <section className={`relative z-10 mx-auto mb-6 max-w-6xl rounded-[2rem] border-2 border-white/80 bg-white/90 p-4 shadow-[0_14px_40px_rgba(0,0,0,.2)] backdrop-blur-md sm:p-7 ${className}`}><div className="mb-5 flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3 shadow-sm"><span className="text-3xl">{icon}</span><h2 className="text-xl font-black text-slate-800 sm:text-2xl">{title}</h2></div>{children}</section>;

const DysgraphiaProgressDashboard = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      setOverview(await dysgraphiaService.getOverview());
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOverview(); }, []);

  const data = overview || EMPTY_OVERVIEW;
  const mapped = useMemo(() => {
    const groups = data.dysgraphia || EMPTY_OVERVIEW.dysgraphia;
    const letters = toItems(groups.letterTracing);
    const mirrorItems = toItems(groups.mirrorLetters);
    const mirrorDifficulty = getMirrorDifficultyItems(mirrorItems);
    const twoWords = getDifficultWords(toItems(groups.twoLetterWords));
    const threeWords = getDifficultWords(toItems(groups.threeLetterWords));
    const lines = toItems(groups.writingLines);
    const letterPractice = getLetterPracticeItems(letters);
    const weakLetterIds = new Set(letterPractice.map((item) => item.id));
    const evaluatedLetters = letters.map((item) => ({ ...item, needsPractice: weakLetterIds.has(item.id) }));
    const lineIssues = getWritingLineIssues(lines);
    return {
      letters: evaluatedLetters.sort((a, b) => Number(b.needsPractice) - Number(a.needsPractice)),
      letterPractice,
      mirror: mirrorItems,
      mirrorDifficulty,
      twoWords,
      threeWords,
      lines,
      lineIssues,
      strong: getStrongAreas({ letters, mirror: mirrorItems, twoWords, threeWords, lines }),
      recommendations: getPracticeRecommendations({ letterPractice, mirrorDifficulty, twoWords, threeWords, lineIssues }),
      hasActivities: [...letters, ...mirrorItems, ...twoWords, ...threeWords, ...lines].some((item) => toNumber(item.totalAttempts) > 0),
    };
  }, [data]);

  if (loading) return <main className="dgd-shell"><LeavesBackground /><TopMonkeys /><div className="dgd-state"><span>🌟</span><h1>ඔබේ ඉගෙනුම් ගමන පූරණය වෙමින්...</h1><p>අපි බලමු ඔබ කොහොම වැඩෙනවද කියලා!</p></div></main>;
  if (error) return <main className="dgd-shell"><LeavesBackground /><TopMonkeys /><div className="dgd-state dgd-state-error"><span>🛠️</span><h1>අපිට ඔබේ දියුණුව හොයාගන්න බැරි උනා</h1><p>අපි ආයෙත් උත්සාහ කරමු.</p><ActionButton onClick={loadOverview}>ආයෙත් උත්සාහ කරන්න</ActionButton></div></main>;

  const stats = data.stats || {};

  return (
    <main className="dgd-shell relative min-h-screen overflow-hidden px-3 pb-14 pt-24 font-sans text-slate-800 sm:px-6 sm:pt-10">
      <LeavesBackground />
      <TopMonkeys />
      <button type="button" className="dgd-back" aria-label="ආපහු" onClick={() => navigate('/dysgraphia')}><img src={backImage} alt="" /></button>

      <header
        className="dgd-header relative z-10 mx-auto mb-4 flex max-w-6xl justify-center sm:mb-6"
        style={{ padding: 0, border: 0, borderRadius: 0, background: 'transparent', boxShadow: 'none', backdropFilter: 'none' }}
      >
        <h1 className="m-0">
          <img
            src={dashboardTitleImage}
            alt="මගේ ඉගෙනුම් ගමන"
            className="h-auto w-[min(90vw,640px)] object-contain drop-shadow-[0_16px_18px_rgba(0,0,0,.4)] transition duration-300 hover:scale-[1.03]"
          />
        </h1>
      </header>

      <div className="dgd-summary-grid relative z-10 mx-auto mb-7 grid max-w-3xl grid-cols-3 gap-2 sm:gap-4">
        <div className="dgd-summary-card dgd-summary-yellow group border-4 border-white/70 transition hover:-translate-y-2 hover:rotate-[-1deg]"><span><img className="dgd-summary-star-image transition group-hover:scale-125 group-hover:rotate-12" src={starImage} alt="" /></span><strong>{toNumber(stats.totalStars)}</strong><small>රැස් කළ තරු</small></div>
        <div className="dgd-summary-card dgd-summary-mint group border-4 border-white/70 transition hover:-translate-y-2 hover:rotate-1"><span><img className="dgd-summary-metric-image transition group-hover:scale-125" src={doneImage} alt="" /></span><strong>{toNumber(stats.sessionsCompleted)}</strong><small>නිම කළ ක්‍රියාකාරකම්</small></div>
        <div className="dgd-summary-card dgd-summary-blue group border-4 border-white/70 transition hover:-translate-y-2 hover:rotate-[-1deg]"><span><img className="dgd-summary-metric-image transition group-hover:scale-125" src={timeImage} alt="" /></span><strong>{Math.round(toNumber(stats.totalMinutesSpent))}</strong><small>ඉගෙනුම් මිනිත්තු</small></div>
      </div>

      {!mapped.hasActivities && <div className="dgd-empty-banner">ඔබේ ඉගෙනුම් ගමන බලන්න ක්‍රියාකාරකම් ටිකක් සෙල්ලම් කරන්න! 🌟</div>}

      <Section title="මං ඉගෙන ගන්න අකුරු" icon="✏️" className="dgd-section-blue !border-sky-300 !bg-sky-100/95"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{mapped.letters.length ? mapped.letters.map((item) => <LetterCard key={item.id} item={item} />) : <p className="dgd-muted">ඔබ සෙල්ලම් කළාට පස්සේ ඔබේ අකුරු මෙතන පේනවා.</p>}</div></Section>

      <Section title="කැඩපත් අකුරු" icon="🪞" className="dgd-section-mint !border-emerald-300 !bg-emerald-100/95"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{mapped.mirror.length ? mapped.mirror.map((item) => <MirrorCard key={item.id} item={{ ...item, recognitionDifficulty: mapped.mirrorDifficulty.some((difficulty) => difficulty.id === item.id && difficulty.recognitionDifficulty), drawingDifficulty: mapped.mirrorDifficulty.some((difficulty) => difficulty.id === item.id && difficulty.drawingDifficulty) }} />) : <p className="dgd-muted">මේ දක්ෂතාව වැඩෙනවා බලන්න කැඩපත් අකුරු සෙල්ලම සෙල්ලම් කරන්න.</p>}</div></Section>

      <Section title="මට ලියන්න පුළුවන් වචන" icon="📝" className="dgd-section-lavender !border-violet-300 !bg-violet-100/95"><div className="dgd-word-columns"><div><h3>අකුරු දෙකේ වචන</h3><div className="dgd-card-grid">{toItems(data.dysgraphia?.twoLetterWords).map((raw) => <WordCard key={raw.id} item={{ ...raw, needsPractice: mapped.twoWords.some((item) => item.id === raw.id) }} />)}</div></div><div><h3>අකුරු තුනේ වචන</h3><div className="dgd-card-grid">{toItems(data.dysgraphia?.threeLetterWords).map((raw) => <WordCard key={raw.id} item={{ ...raw, needsPractice: mapped.threeWords.some((item) => item.id === raw.id) }} />)}</div></div></div></Section>

      <Section title="රේඛා අතරේ ලිවීම" icon="📏" className="dgd-section-peach !border-orange-300 !bg-orange-100/95"><div className="dgd-line-grid">{mapped.lines.length ? mapped.lines.map((item) => <WritingLineCard key={item.id} item={item} />) : <p className="dgd-muted">ඔබ සෙල්ලම් කළාට පස්සේ රේඛා ලිවීමේ පුහුණුව මෙතන පේනවා.</p>}</div></Section>

      <div className="dgd-two-column"><Section title="තව පුහුණු වෙන්න ඕන දේවල්" icon="🌱" className="dgd-list-section dgd-section-rose !border-rose-300 !bg-rose-100/95">{mapped.recommendations.length ? <div className="dgd-recommendations">{mapped.recommendations.map((item) => <div className={`dgd-recommendation ${item.weakLetter ? 'is-weak-letter' : ''}`} key={`${item.icon}-${item.text}`}><span>{item.icon}</span><strong>{item.text}</strong><ActionButton onClick={() => navigate(item.route)}>පටන් ගමු</ActionButton></div>)}</div> : <p className="dgd-muted">ඔබ නියමයට කරනවා. දිගටම ඉගෙන ගන්න! 🌈</p>}</Section><Section title="මම හොඳට කරන දේවල්" icon="🌈" className="dgd-list-section dgd-section-yellow !border-amber-300 !bg-amber-100/95">{mapped.strong.length ? <div className="dgd-strong-list">{mapped.strong.map((item) => <p key={item}>🌟 {item}</p>)}</div> : <p className="dgd-muted">ඔබ පුහුණු වෙනකොට ඔබේ ජයග්‍රහණ මෙතන දිලිසෙනවා.</p>}</Section></div>

      <Section title="අමාරු ඒවට අලුත් ක්‍රීඩා" icon="🎮" className="dgd-weak-games dgd-section-aqua !border-cyan-300 !bg-cyan-100/95">
        <p className="dgd-weak-games-intro">ඔබට ටිකක් අමාරු දේවල් පුහුණු වෙන්න මේ ක්‍රීඩා සෙල්ලම් කරමු!</p>
        <button type="button" className="dgd-mirror-game-launch" onClick={() => navigate('/dysgraphia/mirror-letter-drag/ta')}><span>🪞</span><span><strong>කැඩපත් අකුරු ක්‍රීඩාව</strong><small>හරි අකුර සොයාගෙන ඇදගෙන යමු</small></span><b>සෙල්ලම් කරමු →</b></button>
        <button
          type="button"
          className="group mt-4 grid w-full grid-cols-[auto_1fr] items-center gap-4 rounded-3xl border-4 border-white/90 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 p-4 text-left text-white shadow-[0_8px_0_#6d28d9,0_16px_30px_rgba(88,28,135,.28)] transition hover:-translate-y-2 hover:shadow-[0_12px_0_#6d28d9,0_22px_38px_rgba(88,28,135,.32)] active:translate-y-1 active:shadow-[0_3px_0_#6d28d9] sm:grid-cols-[auto_1fr_auto] sm:px-6 sm:py-5"
          onClick={() => navigate('/dysgraphia/word-game/dotted-tracing')}
        >
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/20 text-4xl shadow-inner transition group-hover:rotate-6 group-hover:scale-110" aria-hidden="true">✏️</span>
          <span className="flex min-w-0 flex-col gap-1">
            <strong className="text-lg font-black sm:text-xl">තිත් උඩින් වචන ලියමු</strong>
            <small className="font-bold text-violet-100">රේඛා දෙක අතර තිත් වචන හඹාගෙන ලියමු</small>
          </span>
          <b className="col-span-2 justify-self-end rounded-full bg-white px-5 py-2 text-sm font-black text-violet-700 shadow-md sm:col-span-1">සෙල්ලම් කරමු →</b>
        </button>
        <div className="dgd-node-letter-picker" aria-label="තිත් ක්‍රීඩාව සඳහා අකුරක් තෝරන්න">
          <strong>තිත් ක්‍රීඩාව:</strong>
          {Object.entries(NODE_LETTERS).map(([id, config]) => <button type="button" key={id} onClick={() => navigate(`/dysgraphia/node-letter-challenge/${id}`)}>{config.letter}</button>)}
        </div>
        {mapped.recommendations.length ? (
          <div className="dgd-weak-games-grid">
            {mapped.recommendations.map((item, index) => (
              <article className={`dgd-weak-game dgd-weak-game-${(index % 4) + 1}`} key={`${item.icon}-${item.text}`}>
                <div className="dgd-game-icon">{item.icon}</div>
                <div className="dgd-game-copy">
                  <span className="dgd-weak-badge">පුහුණු වෙමු</span>
                  <h3>{item.text}</h3>
                  <p>ක්‍රීඩා කරමින් මේ හැකියාව තවත් ශක්තිමත් කරගමු.</p>
                </div>
                <div className="dgd-game-actions">
                  <ActionButton onClick={() => navigate(item.route)}>පුහුණු කරමු</ActionButton>
                  {item.letterId && !item.mirrorGame && <button type="button" className="dgd-node-game-button" onClick={() => navigate(`/dysgraphia/node-letter-challenge/${item.letterId}`)}>තිත් ක්‍රීඩාව • {NODE_LETTERS[item.letterId]?.letter}</button>}
                  {item.mirrorGame && <button type="button" className="dgd-node-game-button" onClick={() => navigate(`/dysgraphia/mirror-letter-drag/${item.letterId}`)}>කැඩපත් ක්‍රීඩාව • {NODE_LETTERS[item.letterId]?.letter}</button>}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="dgd-no-weak-games"><span>🏆</span><div><strong>නියමයි!</strong><p>දැනට අමාරු කොටස් නැහැ. අලුත් ක්‍රීඩාවක් තෝරාගෙන දිගටම පුහුණු වෙමු!</p></div></div>
        )}
      </Section>

      <div className="dgd-footer-actions"><ActionButton onClick={() => navigate('/dysgraphia')}>ක්‍රියාකාරකමක් තෝරන්න</ActionButton><ActionButton onClick={loadOverview}>දියුණුව අලුත් කරන්න</ActionButton></div>
    </main>
  );
};

export default DysgraphiaProgressDashboard;
