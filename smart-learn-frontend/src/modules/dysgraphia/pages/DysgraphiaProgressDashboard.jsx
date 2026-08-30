import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dysgraphiaService } from '../services/dysgraphiaService';
import dinosaurBackground from '../../../assets/images/dysgraphia/dinosaurs/dinosaur-cool-background.png';
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
  insights: {
    currentWeaknesses: [],
    recommendedInterventions: [],
  },
};

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const toItems = (value) => (value && typeof value === 'object' ? Object.entries(value).map(([id, item]) => ({ id, ...(item || {}) })) : []);
const percent = (value) => `${Math.round(Math.max(0, Math.min(1, toNumber(value))) * 100)}%`;
const successRate = (item) => toNumber(item.totalAttempts) > 0 ? toNumber(item.correctAttempts) / toNumber(item.totalAttempts) : 0;
const confidenceRate = (item) => toNumber(item.averageConfidence);
const COPY = {
  si: {
    switchLanguage: 'English Medium', title: 'මගේ ඉගෙනුම් ගමන', loading: 'ඔබේ ඉගෙනුම් ගමන පූරණය වෙමින්...', loadingHelp: 'අපි බලමු ඔබ කොහොම වැඩෙනවද කියලා!',
    error: 'අපිට ඔබේ දියුණුව හොයාගන්න බැරි උනා', errorHelp: 'අපි ආයෙත් උත්සාහ කරමු.', retry: 'ආයෙත් උත්සාහ කරන්න', back: 'ආපහු',
    stars: 'රැස් කළ තරු', completed: 'නිම කළ ක්‍රියාකාරකම්', minutes: 'ඉගෙනුම් මිනිත්තු', empty: 'ඔබේ ඉගෙනුම් ගමන බලන්න ක්‍රියාකාරකම් ටිකක් සෙල්ලම් කරන්න! 🌟',
    lettersSection: 'මං ඉගෙන ගන්න අකුරු', lettersEmpty: 'ඔබ සෙල්ලම් කළාට පස්සේ ඔබේ අකුරු මෙතන පේනවා.', mirrorSection: 'කැඩපත් අකුරු', mirrorEmpty: 'මේ දක්ෂතාව වැඩෙනවා බලන්න කැඩපත් අකුරු සෙල්ලම සෙල්ලම් කරන්න.',
    wordsSection: 'මට ලියන්න පුළුවන් වචන', twoWords: 'අකුරු දෙකේ වචන', threeWords: 'අකුරු තුනේ වචන', linesSection: 'රේඛා අතරේ ලිවීම', linesEmpty: 'ඔබ සෙල්ලම් කළාට පස්සේ රේඛා ලිවීමේ පුහුණුව මෙතන පේනවා.',
    weaknesses: 'තව පුහුණු වෙන්න ඕන දේවල්', noWeakness: 'ඔබ නියමයට කරනවා. දිගටම ඉගෙන ගන්න! 🌈', strengths: 'මම හොඳට කරන දේවල්', noStrength: 'ඔබ පුහුණු වෙනකොට ඔබේ ජයග්‍රහණ මෙතන දිලිසෙනවා.', games: 'අමාරු ඒවට අලුත් ක්‍රීඩා', noGames: 'දැනට අමාරු කොටස් නැහැ! 🏆', start: 'පටන් ගමු', choose: 'ක්‍රියාකාරකමක් තෝරන්න', refresh: 'දියුණුව අලුත් කරන්න',
    practice: 'තව පුහුණු වෙන්න', great: 'සුපිරි වැඩක්!', greatWord: 'සුපිරි වචනයක්!', correct: 'හරි', confidence: 'විශ්වාසය', attempts: 'උත්සාහ', erases: 'මකපු වාර', elapsed: 'ගත වූ කාලය', min: 'මිනි.',
    findLetter: 'නිවැරදි අකුර සොයා ගැනීම', tryAgain: 'ආයෙත් උත්සාහ කරමු', recognitionGood: 'හඳුනා ගැනීම හොඳයි', writeLetter: 'නිවැරදිව අකුර ලිවීම', keepPracticing: 'දිගටම පුහුණු වෙන්න', writingCorrect: 'ලිවීම නිවැරදියි', findAttempts: 'හොයන උත්සාහ', drawAttempts: 'අඳින උත්සාහ',
    keepGoing: 'දිගටම කරගෙන යන්න', successful: 'සාර්ථක', insideLines: 'රේඛා ඇතුළේ', good: 'හොඳයි', outside: 'පිටත', letterSize: 'අකුරු ප්‍රමාණය', letterSpacing: 'අකුරු පරතරය', noData: 'දත්ත නැත', noSpacing: 'පරතර මැනීමක් නැත', uneven: 'අසමානයි', averageGap: 'සාමාන්‍ය පරතරය', tooTight: 'අඩුයි — වැඩි කළ යුතුයි', tooLoose: 'වැඩියි — අඩු කළ යුතුයි',
  },
  en: {
    switchLanguage: 'සිංහල මාධ්‍යය', title: 'My Learning Journey', loading: 'Loading your learning journey...', loadingHelp: "Let's see how you are growing!", error: "We couldn't find your progress", errorHelp: "Let's try again.", retry: 'Try again', back: 'Back',
    stars: 'Stars collected', completed: 'Activities completed', minutes: 'Learning minutes', empty: 'Play some activities to begin your learning journey! 🌟', lettersSection: 'Letters I am learning', lettersEmpty: 'Your practiced letters will appear here after you play.', mirrorSection: 'Mirror letters', mirrorEmpty: 'Play the mirror-letter game to track this skill.',
    wordsSection: 'Words I can write', twoWords: 'Two-letter words', threeWords: 'Three-letter words', linesSection: 'Writing between lines', linesEmpty: 'Your line-writing practice will appear here after you play.', weaknesses: 'Skills to practice more', noWeakness: 'You are doing great. Keep learning! 🌈', strengths: 'Things I do well', noStrength: 'Your achievements will shine here as you practise.', games: 'New games for difficult skills', noGames: 'No difficult areas right now! 🏆', start: 'Start', choose: 'Choose an activity', refresh: 'Refresh progress',
    practice: 'Practise more', great: 'Great work!', greatWord: 'Great word!', correct: 'Correct', confidence: 'Confidence', attempts: 'Attempts', erases: 'Erases', elapsed: 'Time spent', min: 'min.', findLetter: 'Finding the correct letter', tryAgain: 'Let’s try again', recognitionGood: 'Recognition is good', writeLetter: 'Writing the letter correctly', keepPracticing: 'Keep practising', writingCorrect: 'Writing is correct', findAttempts: 'Search attempts', drawAttempts: 'Drawing attempts', keepGoing: 'Keep going', successful: 'Successful', insideLines: 'Inside the lines', good: 'Good', outside: 'outside', letterSize: 'Letter size', letterSpacing: 'Letter spacing', noData: 'No data', noSpacing: 'No spacing measurement', uneven: 'Uneven', averageGap: 'Average gap', tooTight: 'Too close — increase spacing', tooLoose: 'Too wide — reduce spacing',
  },
};

const formatMinutes = (seconds, copy) => `${copy.elapsed} ${Math.max(0, Math.round(toNumber(seconds) / 60))} ${copy.min}`;

const getLetterPracticeItems = (items) => items
  .filter((item) => item.needsPractice === true)
  .sort((a, b) => confidenceRate(a) - confidenceRate(b));

const getMirrorDifficultyItems = (items) => items
  .map((item) => ({
    ...item,
    recognitionDifficulty: toNumber(item.wrongAttempts) >= 3 || (toNumber(item.totalAttempts) > 0 && toNumber(item.wrongAttempts) / toNumber(item.totalAttempts) > 0.4),
    drawingDifficulty: toNumber(item.drawingWrongAttempts) >= 2 || (toNumber(item.drawingAttempts) > 0 && toNumber(item.drawingCorrectAttempts) / toNumber(item.drawingAttempts) < 0.7),
  }))
  .filter((item) => item.recognitionDifficulty || item.drawingDifficulty);

const getDifficultWords = (items) => items
  .map((item) => ({
    ...item,
    needsPractice: item.needsPractice === true
      || confidenceRate(item) < 0.7
      || toNumber(item.wrongAttempts) >= 2
      || needsAttemptBasedPractice(item),
  }))
  .filter((item) => item.needsPractice)
  .sort((a, b) => confidenceRate(a) - confidenceRate(b));

const needsAttemptBasedPractice = (item) => {
  const totalAttempts = toNumber(item.totalAttempts);
  const correctAttempts = toNumber(item.correctAttempts);
  const hasLowConfidence = item.averageConfidence != null && confidenceRate(item) < 0.3;
  const hasFiveToTenAttempts = totalAttempts >= 5 && totalAttempts <= 10;

  return totalAttempts > 0 && (
    correctAttempts === 0
    || (hasFiveToTenAttempts && correctAttempts <= 1)
    || (hasFiveToTenAttempts && correctAttempts <= 2 && hasLowConfidence)
  );
};

const getAttemptBasedInsights = ({ letters, mirror, twoWords, threeWords }) => {
  const practiceItems = [
    ...letters.map((item) => ({
      item,
      type: 'letter_tracing',
      label: `${item.targetChar || item.id} අකුර තව පුහුණු වෙමු`,
      gameType: 'node-letter-challenge',
      title: `${item.targetChar || item.id} අකුර පුහුණු කරමු`,
      description: 'තිත් එකින් එක යා කර අකුර නිවැරදිව ලියන්න පුහුණු වෙමු.',
      practiceRoute: `/dysgraphia/letter-${encodeURIComponent(item.id)}`,
      route: `/dysgraphia/node-letter-challenge/${encodeURIComponent(item.id)}`,
    })),
    ...mirror.map((item) => ({
      item,
      type: 'mirror_reversal',
      label: `${item.targetChar || item.id} කැඩපත් අකුර තව පුහුණු වෙමු`,
      gameType: 'mirror-letter-drag',
      title: `${item.targetChar || item.id} කැඩපත් අකුර හඳුනා ගනිමු`,
      description: 'නිවැරදි අකුර සහ කැඩපත් අකුර වෙන් කර හඳුනා ගන්න පුහුණු වෙමු.',
      practiceRoute: '/dysgraphia/letter-review',
      route: `/dysgraphia/mirror-letter-drag/${encodeURIComponent(item.id)}`,
    })),
    ...[
      ...twoWords.map((item) => ({ ...item, practiceRoute: '/dysgraphia/word-game/two-letters' })),
      ...threeWords.map((item) => ({ ...item, practiceRoute: '/dysgraphia/word-game/three-letters' })),
    ].map((item) => ({
      item,
      type: 'word_writing',
      label: `${item.targetWord || item.id} වචනය තව පුහුණු වෙමු`,
      gameType: 'dotted-word-tracing',
      title: `${item.targetWord || item.id} වචනය පුහුණු කරමු`,
      description: 'තිත් මත අකුරු අඳිමින් වචනය නිවැරදිව ලියන්න පුහුණු වෙමු.',
      practiceRoute: `${item.practiceRoute}?word=${encodeURIComponent(item.targetWord || item.id)}`,
      route: `/dysgraphia/word-game/dotted-tracing?word=${encodeURIComponent(item.targetWord || '')}`,
    })),
  ].filter(({ item, type }) => (
    item.needsPractice === true
    || needsAttemptBasedPractice(item)
    || (type === 'mirror_reversal' && (
      item.recognitionDifficulty
      || item.drawingDifficulty
      || toNumber(item.totalAttempts) > 3
    ))
  ));

  return practiceItems.reduce((insights, practice) => {
    const weaknessId = `attempt-based-${practice.type}-${practice.item.id}`;
    insights.weaknesses.push({
      id: weaknessId,
      type: practice.type,
      label: practice.label,
    });
    insights.recommendations.push({
      id: `${weaknessId}-game`,
      weaknessId,
      gameType: practice.gameType,
      title: practice.title,
      description: practice.description,
      practiceRoute: practice.practiceRoute,
      route: practice.route,
    });
    return insights;
  }, { weaknesses: [], recommendations: [] });
};

const mergeUniqueById = (primary, additional) => {
  const seen = new Set(primary.map((item) => item.id));
  return [...primary, ...additional.filter((item) => !seen.has(item.id))];
};

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

const ProgressBar = ({ value, color = 'mint' }) => (
  <div className="h-3 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
    <span className={`block h-full rounded-full transition-[width] duration-700 ${color === 'sun' ? 'bg-gradient-to-r from-amber-300 to-orange-400' : color === 'blue' ? 'bg-gradient-to-r from-sky-400 to-blue-500' : color === 'coral' ? 'bg-gradient-to-r from-rose-400 to-orange-400' : 'bg-gradient-to-r from-emerald-400 to-teal-500'}`} style={{ width: percent(value) }} />
  </div>
);

const ActionButton = ({ children, onClick }) => <button type="button" className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-black text-white shadow-[0_5px_0_#4338ca] transition hover:-translate-y-1 hover:shadow-[0_8px_0_#4338ca] active:translate-y-1 active:shadow-[0_2px_0_#4338ca] focus:outline-none focus:ring-4 focus:ring-violet-200" onClick={onClick}>{children}</button>;

const LetterCard = ({ item, copy }) => (
  <article className={`rounded-3xl border-2 p-5 shadow-[0_7px_0_rgba(80,100,120,.12)] transition hover:-translate-y-1 ${item.needsPractice ? 'border-rose-300 bg-gradient-to-br from-rose-50 to-orange-100' : 'border-white bg-white/95'}`}>
    <div className="mb-4 flex items-center justify-between gap-3"><span className={`text-5xl font-black ${item.needsPractice ? 'text-rose-500' : 'text-orange-500'}`}>{item.targetChar || '?'}</span><span className={`rounded-full px-3 py-2 text-xs font-black ${item.needsPractice ? 'bg-rose-200 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>{item.needsPractice ? copy.practice : copy.great}</span></div>
    <ProgressBar value={successRate(item)} color="sun" />
    <div className="mt-3 flex justify-between gap-2 text-sm font-extrabold text-slate-600"><span>{copy.correct} {toNumber(item.correctAttempts)}</span><span>{copy.confidence} {Math.round(confidenceRate(item) * 100)}%</span></div>
    <div className="mt-2 text-xs font-bold leading-5 text-slate-400">{copy.attempts} {toNumber(item.totalAttempts)} · {copy.erases} {toNumber(item.eraseCount)} · {formatMinutes(item.totalTimeSeconds, copy)}</div>
  </article>
);

const MirrorCard = ({ item, copy }) => (
  <article className="rounded-3xl border-2 border-white bg-white/95 p-5 shadow-[0_7px_0_rgba(80,100,120,.12)] transition hover:-translate-y-1">
    <div className="mb-4 flex items-center justify-between gap-3"><span className="text-5xl font-black text-teal-600">{item.targetChar || '?'}</span><span className="rounded-full bg-sky-100 px-3 py-2 text-xs font-black text-sky-800">{item.recognitionDifficulty ? copy.practice : copy.great}</span></div>
    <div className="my-4"><div className="mb-2 flex flex-col gap-1 text-xs sm:flex-row sm:justify-between"><strong className="text-slate-700">{copy.findLetter}</strong><span className="text-slate-500">{item.recognitionDifficulty ? copy.tryAgain : copy.recognitionGood}</span></div><ProgressBar value={successRate(item)} color="blue" /></div>
    <div className="my-4"><div className="mb-2 flex flex-col gap-1 text-xs sm:flex-row sm:justify-between"><strong className="text-slate-700">{copy.writeLetter}</strong><span className="text-slate-500">{item.drawingDifficulty ? copy.keepPracticing : copy.writingCorrect}</span></div><ProgressBar value={toNumber(item.drawingAttempts) ? toNumber(item.drawingCorrectAttempts) / toNumber(item.drawingAttempts) : 0} color="coral" /></div>
    <div className="mt-2 text-xs font-bold text-slate-400">{copy.findAttempts} {toNumber(item.totalAttempts)} · {copy.drawAttempts} {toNumber(item.drawingAttempts)}</div>
  </article>
);

const WordCard = ({ item, copy }) => (
  <article className={`rounded-3xl border-2 p-5 shadow-[0_7px_0_rgba(80,100,120,.12)] transition hover:-translate-y-1 ${item.needsPractice ? 'border-rose-300 bg-gradient-to-br from-rose-50 to-red-100' : 'border-white bg-white/95'}`}>
    <div className="mb-4 flex items-center justify-between gap-3"><strong className={`text-3xl font-black ${item.needsPractice ? 'text-red-600' : 'text-violet-700'}`}>{item.targetWord || '?'}</strong><span className={`rounded-full px-3 py-2 text-xs font-black ${item.needsPractice ? 'bg-red-200 text-red-800' : 'bg-amber-100 text-amber-800'}`}>{item.needsPractice ? copy.practice : copy.greatWord}</span></div>
    <ProgressBar value={successRate(item)} color="coral" />
    <div className="mt-3 flex justify-between text-sm font-extrabold text-slate-600"><span>{copy.correct} {toNumber(item.correctAttempts)}</span><span>{copy.confidence} {Math.round(confidenceRate(item) * 100)}%</span></div>
    <div className="mt-2 text-xs font-bold text-slate-400">{copy.attempts} {toNumber(item.totalAttempts)} · {formatMinutes(item.totalTimeSeconds, copy)}</div>
  </article>
);

const getSpacingDetails = (item, copy) => {
  const gaps = Array.isArray(item.spacing) ? item.spacing.map(Number).filter(Number.isFinite) : [];
  const sizes = Array.isArray(item.sizes) ? item.sizes : [];
  const widths = sizes.map((size) => Number(size?.width)).filter((width) => Number.isFinite(width) && width > 0);
  if (!gaps.length || !widths.length) return { label: copy.noData, detail: copy.noSpacing, status: 'unknown' };

  const averageGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
  const averageWidth = widths.reduce((sum, width) => sum + width, 0) / widths.length;
  const ratios = gaps.map((gap) => gap / averageWidth);
  const tooTight = ratios.some((ratio) => ratio < 0.35);
  const tooLoose = ratios.some((ratio) => ratio > 1.5);
  if (tooTight && tooLoose) return { label: copy.uneven, detail: `${copy.averageGap} ${averageGap.toFixed(1)} px`, status: 'bad' };
  if (tooTight) return { label: copy.tooTight, detail: `${copy.averageGap} ${averageGap.toFixed(1)} px`, status: 'bad' };
  if (tooLoose || item.spacingFail === true) return { label: copy.tooLoose, detail: `${copy.averageGap} ${averageGap.toFixed(1)} px`, status: 'bad' };
  return { label: copy.good, detail: `${copy.averageGap} ${averageGap.toFixed(1)} px`, status: 'good' };
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

const WritingLineCard = ({ item, copy }) => {
  const spacing = getSpacingDetails(item, copy);
  const linesNeedWork = item.hardLinesFail === true || toNumber(item.outOfLinesPct) > 25;
  const sizeNeedsWork = item.sizeFail === true;
  return (
    <article className="dgd-line-card">
      <div className="dgd-item-top"><strong className="dgd-word">{item.targetWord || '?'}</strong><span className="dgd-pill">{item.completed ? copy.great : copy.keepGoing}</span></div>
      <div className="dgd-line-attempts">🎯 {copy.attempts} <strong>{toNumber(item.totalAttempts)}</strong><span>{copy.successful} {toNumber(item.passedAttempts)}</span></div>
      <div className="dgd-skill-list">
        <span className={linesNeedWork ? 'is-needs-work' : 'is-good'}>📏 {copy.insideLines}: <strong>{linesNeedWork ? copy.practice : copy.good}</strong><small>{toNumber(item.outOfLinesPct).toFixed(1)}% {copy.outside}</small></span>
        <span className={sizeNeedsWork ? 'is-needs-work' : 'is-good'}>↕️ {copy.letterSize}: <strong>{sizeNeedsWork ? copy.practice : copy.good}</strong><small>{getSizeDetails(item)}</small></span>
        <span className={spacing.status === 'bad' ? 'is-needs-work' : 'is-good'}>↔️ {copy.letterSpacing}: <strong>{spacing.label}</strong></span>
      </div>
    </article>
  );
};

const DinosaurBackground = () => (
  <div className="dgd-dino-background" aria-hidden="true">
    <img className="dgd-dino-scene" src={dinosaurBackground} alt="" />
    <div className="dgd-dino-overlay" />
  </div>
);

const Section = ({ title, icon, children, className = '' }) => <section className={`relative z-10 mx-auto mb-6 max-w-6xl rounded-[2rem] border-2 border-white/80 bg-white/90 p-4 shadow-[0_14px_40px_rgba(0,0,0,.2)] backdrop-blur-md sm:p-7 ${className}`}><div className="mb-5 flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3 shadow-sm"><span className="text-3xl">{icon}</span><h2 className="text-xl font-black text-slate-800 sm:text-2xl">{title}</h2></div>{children}</section>;

const DysgraphiaProgressDashboard = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('si');
  const copy = COPY[language];

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
    const allTwoWords = toItems(groups.twoLetterWords);
    const allThreeWords = toItems(groups.threeLetterWords);
    const twoWords = getDifficultWords(allTwoWords);
    const threeWords = getDifficultWords(allThreeWords);
    const lines = toItems(groups.writingLines);
    const evaluatedLetters = letters.map((item) => ({
      ...item,
      needsPractice: item.needsPractice === true || needsAttemptBasedPractice(item),
    }));
    const letterPractice = getLetterPracticeItems(evaluatedLetters);
    const lineIssues = getWritingLineIssues(lines);
    const attemptBasedInsights = getAttemptBasedInsights({
      letters: evaluatedLetters,
      mirror: mirrorDifficulty,
      twoWords,
      threeWords,
    });
    const backendWeaknesses = Array.isArray(data.insights?.currentWeaknesses) ? data.insights.currentWeaknesses : [];
    const backendRecommendations = Array.isArray(data.insights?.recommendedInterventions) ? data.insights.recommendedInterventions : [];
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
      weaknesses: mergeUniqueById(backendWeaknesses, attemptBasedInsights.weaknesses),
      recommendations: mergeUniqueById(backendRecommendations, attemptBasedInsights.recommendations),
      hasActivities: [...letters, ...mirrorItems, ...twoWords, ...threeWords, ...lines].some((item) => toNumber(item.totalAttempts) > 0),
    };
  }, [data]);

  if (loading) return <main className="dgd-shell"><DinosaurBackground /><div className="dgd-state"><span>🦕</span><h1>{copy.loading}</h1><p>{copy.loadingHelp}</p></div></main>;
  if (error) return <main className="dgd-shell"><DinosaurBackground /><div className="dgd-state dgd-state-error"><span>🥚</span><h1>{copy.error}</h1><p>{copy.errorHelp}</p><ActionButton onClick={loadOverview}>{copy.retry}</ActionButton></div></main>;

  const stats = data.stats || {};

  return (
    <main className="dgd-shell relative min-h-screen overflow-hidden px-3 pb-14 pt-24 font-sans text-slate-800 sm:px-6 sm:pt-10">
      <DinosaurBackground />
      <button type="button" className="dgd-back" aria-label={copy.back} onClick={() => navigate('/dysgraphia')}><img src={backImage} alt="" /></button>
      <button type="button" className="fixed right-4 top-24 z-[110] rounded-full border-2 border-white/80 bg-white px-5 py-3 text-sm font-black text-sky-800 shadow-[0_7px_0_rgba(30,64,175,.25)] transition hover:-translate-y-1 sm:right-8 sm:top-8" onClick={() => setLanguage((current) => current === 'si' ? 'en' : 'si')}>{copy.switchLanguage}</button>

      <header
        className="dgd-header relative z-10 mx-auto mb-4 flex max-w-6xl justify-center sm:mb-6"
        style={{ padding: 0, border: 0, borderRadius: 0, background: 'transparent', boxShadow: 'none', backdropFilter: 'none' }}
      >
        <h1 className="m-0">
          {language === 'si' ? (
          <img
            src={dashboardTitleImage}
            alt={copy.title}
            className="h-auto w-[min(90vw,640px)] object-contain drop-shadow-[0_16px_18px_rgba(0,0,0,.4)] transition duration-300 hover:scale-[1.03]"
          />
          ) : (
            <span className="block rounded-[2rem] border-4 border-amber-200 bg-gradient-to-b from-amber-200 to-amber-500 px-10 py-5 text-center text-3xl font-black text-amber-950 shadow-[0_12px_0_#92400e,0_22px_35px_rgba(0,0,0,.35)] sm:text-5xl">{copy.title}</span>
          )}
        </h1>
      </header>

      <div className="dgd-summary-grid relative z-10 mx-auto mb-7 grid max-w-3xl grid-cols-3 gap-2 sm:gap-4">
        <div className="dgd-summary-card dgd-summary-yellow group border-4 border-white/70 transition hover:-translate-y-2 hover:rotate-[-1deg]"><span><img className="dgd-summary-star-image transition group-hover:scale-125 group-hover:rotate-12" src={starImage} alt="" /></span><strong>{toNumber(stats.totalStars)}</strong><small>{copy.stars}</small></div>
        <div className="dgd-summary-card dgd-summary-mint group border-4 border-white/70 transition hover:-translate-y-2 hover:rotate-1"><span><img className="dgd-summary-metric-image transition group-hover:scale-125" src={doneImage} alt="" /></span><strong>{toNumber(stats.sessionsCompleted)}</strong><small>{copy.completed}</small></div>
        <div className="dgd-summary-card dgd-summary-blue group border-4 border-white/70 transition hover:-translate-y-2 hover:rotate-[-1deg]"><span><img className="dgd-summary-metric-image transition group-hover:scale-125" src={timeImage} alt="" /></span><strong>{Math.round(toNumber(stats.totalMinutesSpent))}</strong><small>{copy.minutes}</small></div>
      </div>

      {!mapped.hasActivities && <div className="dgd-empty-banner">{copy.empty}</div>}

      <Section title={copy.lettersSection} icon="✏️" className="dgd-section-blue !border-sky-300 !bg-sky-100/95"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{mapped.letters.length ? mapped.letters.map((item) => <LetterCard key={item.id} item={item} copy={copy} />) : <p className="dgd-muted">{copy.lettersEmpty}</p>}</div></Section>

      <Section title={copy.mirrorSection} icon="🪞" className="dgd-section-mint !border-emerald-300 !bg-emerald-100/95"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{mapped.mirror.length ? mapped.mirror.map((item) => <MirrorCard key={item.id} copy={copy} item={{ ...item, recognitionDifficulty: mapped.mirrorDifficulty.some((difficulty) => difficulty.id === item.id && difficulty.recognitionDifficulty), drawingDifficulty: mapped.mirrorDifficulty.some((difficulty) => difficulty.id === item.id && difficulty.drawingDifficulty) }} />) : <p className="dgd-muted">{copy.mirrorEmpty}</p>}</div></Section>

      <Section title={copy.wordsSection} icon="📝" className="dgd-section-lavender !border-violet-300 !bg-violet-100/95"><div className="dgd-word-columns"><div><h3>{copy.twoWords}</h3><div className="dgd-card-grid">{toItems(data.dysgraphia?.twoLetterWords).map((raw) => <WordCard key={raw.id} copy={copy} item={{ ...raw, needsPractice: mapped.twoWords.some((item) => item.id === raw.id) }} />)}</div></div><div><h3>{copy.threeWords}</h3><div className="dgd-card-grid">{toItems(data.dysgraphia?.threeLetterWords).map((raw) => <WordCard key={raw.id} copy={copy} item={{ ...raw, needsPractice: mapped.threeWords.some((item) => item.id === raw.id) }} />)}</div></div></div></Section>

      <Section title={copy.linesSection} icon="📏" className="dgd-section-peach !border-sky-300 !bg-sky-100/95"><div className="dgd-line-grid">{mapped.lines.length ? mapped.lines.map((item) => <WritingLineCard key={item.id} item={item} copy={copy} />) : <p className="dgd-muted">{copy.linesEmpty}</p>}</div></Section>

      <div className="dgd-two-column"><Section title={copy.weaknesses} icon="🌱" className="dgd-list-section dgd-section-rose !border-rose-300 !bg-rose-100/95">{mapped.weaknesses.length ? <div className="dgd-recommendations">{mapped.weaknesses.map((weakness) => { const game = mapped.recommendations.find((item) => item.weaknessId === weakness.id); return <div className="dgd-recommendation" key={weakness.id}><span>{weakness.type === 'mirror_reversal' ? '🪞' : weakness.type === 'word_writing' ? '📝' : '✏️'}</span><strong>{language === 'en' ? `${weakness.type === 'word_writing' ? 'Word' : weakness.type === 'mirror_reversal' ? 'Mirror letter' : 'Letter'} ${weakness.id.split('-').slice(-1)[0]} needs more practice` : weakness.label}</strong>{game && <ActionButton onClick={() => navigate(game.practiceRoute || game.route)}>{copy.start}</ActionButton>}</div>; })}</div> : <p className="dgd-muted">{copy.noWeakness}</p>}</Section><Section title={copy.strengths} icon="🌈" className="dgd-list-section dgd-section-yellow !border-teal-300 !bg-teal-100/95">{mapped.strong.length ? <div className="dgd-strong-list">{mapped.strong.map((item, index) => <p key={item}>🌟 {language === 'en' ? ['Your writing is improving!', 'You recognise mirror letters well!', 'You are doing well with words!', 'Your spacing is improving!'][index] || 'Great progress!' : item}</p>)}</div> : <p className="dgd-muted">{copy.noStrength}</p>}</Section></div>

      <Section title={copy.games} icon="🎮" className="dgd-weak-games dgd-section-aqua !border-cyan-300 !bg-cyan-100/95">
        {mapped.recommendations.length ? (
          <div className="mx-auto grid max-w-2xl gap-3">
            {mapped.recommendations.map((item) => (
              <article className="flex items-center gap-3 rounded-2xl border border-cyan-200 bg-white/85 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" key={item.id}>
                <span className="text-2xl" aria-hidden="true">
                  {item.gameType === 'mirror-letter-drag' ? '🪞' : item.gameType === 'dotted-word-tracing' ? '📝' : '✏️'}
                </span>
                <strong className="min-w-0 flex-1 text-sm font-black text-slate-700 sm:text-base">{language === 'en' ? (item.gameType === 'mirror-letter-drag' ? 'Practise mirror letters' : item.gameType === 'dotted-word-tracing' ? 'Practise word tracing' : 'Practise letter tracing') : item.title}</strong>
                <ActionButton onClick={() => navigate(item.route)}>{copy.start}</ActionButton>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-center font-extrabold text-cyan-900/70">{copy.noGames}</p>
        )}
      </Section>

      <div className="dgd-footer-actions"><ActionButton onClick={() => navigate('/dysgraphia')}>{copy.choose}</ActionButton><ActionButton onClick={loadOverview}>{copy.refresh}</ActionButton></div>
    </main>
  );
};

export default DysgraphiaProgressDashboard;
