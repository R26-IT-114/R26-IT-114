/**
 * DyslexiaDashboard  —  public dashboard view
 *
 * Admin / therapist view: shows every child's dyslexia performance.
 * Left panel:  list of all users who have played at least one session.
 * Right panel: selected child's detailed stats — assessment, overall,
 *              section breakdown, game breakdown, recent sessions.
 */

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Search, RefreshCw, Target,
  BookOpen, Lock, Unlock, ChevronDown, ChevronUp, AlertCircle,
  Activity, Award, BarChart3, CheckCircle2, Clock3, Sparkles, Star,
} from 'lucide-react';
import { dyslexiaService } from '../modules/dyslexia/services/dyslexiaService';
import { listUserProfiles } from '../services/firebaseUserProfile';
import { logTelemetryError } from '../services/telemetry';
import useAuth from '../hooks/useAuth';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n) => (n === null || n === undefined ? '—' : String(n));
const fmtPct = (n) => (n === null || n === undefined ? '—' : `${n}%`);
const fmtDate = (d, language = 'si') => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(language === 'en' ? 'en-GB' : 'si-LK', { year: 'numeric', month: 'short', day: 'numeric' });
};
const scoreColor = (score, max = 100) => {
  if (score === null || score === undefined) return '#6b7280';
  const pct = max !== 100 ? (score / max) * 100 : score;
  if (pct >= 80) return '#059669';
  if (pct >= 50) return '#d97706';
  return '#dc2626';
};

const readDyslexiaStars = (userId) => {
  if (!userId) return 0;
  try {
    const rewards = JSON.parse(localStorage.getItem(`dyslexia_star_rewards:${userId}`));
    return Array.isArray(rewards?.earnedKeys) ? rewards.earnedKeys.length : 0;
  } catch {
    return 0;
  }
};

const DASHBOARD_DOTS = [
  { top: '8%', left: '3%', size: 50, color: 'rgba(255,180,200,0.5)', delay: 0 },
  { top: '20%', right: '4%', size: 40, color: 'rgba(160,200,255,0.5)', delay: 1 },
  { top: '45%', left: '1%', size: 35, color: 'rgba(180,255,200,0.45)', delay: 2 },
  { top: '65%', right: '2%', size: 55, color: 'rgba(255,230,130,0.5)', delay: 0.5 },
  { bottom: '15%', left: '5%', size: 45, color: 'rgba(210,180,255,0.5)', delay: 1.5 },
  { bottom: '8%', right: '6%', size: 38, color: 'rgba(255,190,140,0.45)', delay: 3 },
];

const DashboardModuleBackground = () => (
  <div
    className="fixed inset-0 pointer-events-none select-none overflow-hidden"
    aria-hidden="true"
    style={{
      background: `
        radial-gradient(circle at 7% 14%, rgba(255,190,210,.48) 0 68px, transparent 70px),
        radial-gradient(circle at 92% 22%, rgba(157,225,217,.42) 0 90px, transparent 92px),
        radial-gradient(circle at 86% 88%, rgba(255,217,112,.42) 0 110px, transparent 112px),
        radial-gradient(circle at 11% 82%, rgba(183,164,244,.35) 0 82px, transparent 84px),
        linear-gradient(145deg, #fff9ec 0%, #fff1f6 38%, #f2efff 68%, #eafaf5 100%)`,
    }}
  >
    <div className="absolute -left-16 top-[19%] h-[120px] w-[260px] -rotate-12 rounded-[50%] bg-white/40 blur-[2px]" />
    <div className="absolute -right-20 bottom-[12%] h-[120px] w-[260px] rotate-[14deg] rounded-[50%] bg-white/40 blur-[2px]" />
    {DASHBOARD_DOTS.map(({ size, color, delay, ...position }, index) => (
      <motion.i
        key={index}
        className="absolute rounded-full"
        style={{ ...position, width: size, height: size, background: color }}
        animate={{ y: [0, -18, 0], opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 3.5, repeat: Infinity, delay, ease: 'easeInOut' }}
      />
    ))}
  </div>
);

// ── Sub-components ────────────────────────────────────────────────────────────

const STAT_TONES = {
  sky: { glow: 'bg-sky-100/70', icon: 'bg-sky-100 text-sky-700' },
  emerald: { glow: 'bg-emerald-100/70', icon: 'bg-emerald-100 text-emerald-700' },
  amber: { glow: 'bg-amber-100/70', icon: 'bg-amber-100 text-amber-700' },
  violet: { glow: 'bg-violet-100/70', icon: 'bg-violet-100 text-violet-700' },
};

const DASHBOARD_COPY = {
  si: {
    title: 'මගේ කියවීමේ ප්‍රගතිය', subtitle: 'කියවීමේ පුහුණුව, නිවැරදිභාවය සහ මෑත ක්‍රීඩා ප්‍රතිඵල', switchLanguage: 'English Medium',
    refresh: 'නැවුම් කරන්න', loading: 'පූරණය වෙමින්…', retry: 'නැවත උත්සාහ කරන්න', loadError: 'උපකරණ පුවරුවේ දත්ත පූරණය කිරීමට නොහැකි විය.',
    profile: 'Dyslexia learning profile', assessmentPending: 'පූර්ව ඇගයීම තවම සම්පූර්ණ කර නැත', assessmentComplete: 'පූර්ව ඇගයීම සම්පූර්ණයි', attempt: 'උත්සාහය',
    letters: 'අකුරු', twoLetters: 'අකුරු 2', threeLetters: 'අකුරු 3', recommendedLevel: 'නිර්දේශිත මට්ටම', level: 'මට්ටම',
    weakHelp: 'දුර්වල අකුරු යනු ඉලක්කගත පුහුණුව සඳහා යොදාගත හැකි නැවත නැවත සිදුවන වැරදි වේ.', noWeak: 'දුර්වල අකුරු තවම වාර්තා වී නැත.', placement: 'මට්ටම් තීරණ විස්තර',
    letterRecognition: 'අකුරු හඳුනාගැනීම', letterSound: 'අකුරු ශබ්ද', twoLetterReading: 'අකුරු දෙකේ කියවීම', threeLetterReading: 'අකුරු තුනේ කියවීම', pronunciation: 'උච්චාරණය', overall: 'සමස්තය',
    comparison: 'කාර්යසාධන සැසඳීම', noComparison: 'මෙම දරුවා සඳහා පූර්ව පරීක්ෂණ හෝ ක්‍රීඩා ප්‍රතිඵල තවම නොමැත.', skillLevel: 'සමස්ත කුසලතා මට්ටම', preToGames: 'පූර්ව පරීක්ෂණයේ සිට ක්‍රීඩා දක්වා', preOverall: 'පූර්ව පරීක්ෂණ සමස්තය', postAccuracy: 'ක්‍රීඩාවලින් පසු නිවැරදිභාවය',
    learningImpact: 'ඉගෙනුම් බලපෑම', dashboardShows: 'උපකරණ පුවරුව පෙන්වන දේ', completedSessions: 'සම්පූර්ණ කළ වාර', unlockedSections: 'විවෘත කළ කොටස්', bestGameScore: 'හොඳම ක්‍රීඩා ලකුණ', comparisonHelp: 'මෙය මට්ටම් ඇගයීම දරුවාගේ ක්‍රීඩා ප්‍රතිඵල සමඟ සසඳා, කාර්යසාධනය වැඩිදියුණු වෙමින් තිබේදැයි පෙන්වයි.',
    progressSummary: 'ප්‍රගති සාරාංශය', currentPerformance: 'දරුවාගේ වත්මන් කියවීමේ කාර්යසාධනය', totalSessions: 'මුළු වාර', overallAccuracy: 'සමස්ත නිවැරදිභාවය', bestScore: 'හොඳම ලකුණු', averageScore: 'සාමාන්‍ය ලකුණු', earnedStars: 'එකතු කළ තරු',
    noProgress: 'තවම ක්‍රීඩා වාර නොමැත. දරුවා ක්‍රීඩා කිරීම ආරම්භ කළ පසු ඉගෙනුම් සාරාංශය මෙහි පෙන්වනු ඇත.', goodProgress: 'ඉතා හොඳ ප්‍රගතියක්. දරුවා ඉගෙනුම් ක්‍රීඩාවල හොඳින් ක්‍රියා කරන අතර වඩා අභියෝගාත්මක පුහුණුව සඳහා සූදානම්ය.', steadyProgress: 'ස්ථාවර ප්‍රගතියක්. දරුවාගේ විශ්වාසය වර්ධනය වන අතර දුර්වල ක්ෂේත්‍ර කිහිපයක ඉලක්කගත පුහුණුව තවදුරටත් අවශ්‍යය.', startingProgress: 'ආරම්භක ප්‍රගතියක්. විශේෂයෙන් දුර්වල අකුරු සහ කියවීමේ ක්‍රියාකාරකම් සඳහා මඟපෙන්වූ පුහුණුව අවශ්‍යය.', trend: (count) => `වැඩිදුර විශ්ලේෂණය සඳහා සම්පූර්ණ කළ වාර ${count}ක මෑත ප්‍රවණතාව සටහන් කර ඇත.`,
    sectionDetails: 'කොටස් අනුව විස්තරය', sectionHelp: 'විවෘත කළ සහ සම්පූර්ණ කළ ඉගෙනුම් කොටස්', gamePerformance: 'ක්‍රීඩා කාර්යසාධනය', gameHelp: 'එක් එක් ක්‍රීඩාවේ ලකුණු සහ නිවැරදිභාවය', recentSessions: 'මෑත ක්‍රීඩා වාර', recentHelp: 'අලුත්ම ක්‍රීඩා උත්සාහ සහ ප්‍රතිඵල', noSessions: 'ක්‍රීඩා වාර තවම වාර්තා වී නැත.',
    sessions: 'වාර', gamesPlayed: 'ක්‍රීඩා කළ ක්‍රීඩා', accuracy: 'නිවැරදිභාවය', lastPlayed: 'අවසන් වරට', game: 'ක්‍රීඩාව', best: 'හොඳම', average: 'සාමාන්‍ය', status: 'තත්ත්වය', score: 'ලකුණු', correct: 'නිවැරදි', duration: 'කාලය', date: 'දිනය', completed: 'සම්පූර්ණයි', abandoned: 'අත්හැර ඇත', active: 'ක්‍රියාත්මකයි', seconds: 'තත්.', difference: 'වෙනස',
  },
  en: {
    title: 'My Reading Progress', subtitle: 'Reading practice, accuracy, and recent game results', switchLanguage: 'සිංහල මාධ්‍යය',
    refresh: 'Refresh', loading: 'Loading…', retry: 'Try again', loadError: 'Unable to load dashboard data.', profile: 'Dyslexia learning profile',
    assessmentPending: 'Pre-assessment has not been completed yet', assessmentComplete: 'Pre-assessment completed', attempt: 'Attempt', letters: 'Letters', twoLetters: '2-letter words', threeLetters: '3-letter words', recommendedLevel: 'Recommended level', level: 'Level',
    weakHelp: 'Weak letters are recurring errors that can be used for targeted practice.', noWeak: 'No weak letters have been recorded yet.', placement: 'Placement decision details', letterRecognition: 'Letter recognition', letterSound: 'Letter sounds', twoLetterReading: 'Two-letter reading', threeLetterReading: 'Three-letter reading', pronunciation: 'Pronunciation', overall: 'Overall',
    comparison: 'Performance comparison', noComparison: 'No pre-test or game results are available for this child yet.', skillLevel: 'Overall skill level', preToGames: 'From pre-test to gameplay', preOverall: 'Pre-test overall', postAccuracy: 'Accuracy after gameplay', learningImpact: 'Learning impact', dashboardShows: 'What the dashboard shows', completedSessions: 'Completed sessions', unlockedSections: 'Unlocked sections', bestGameScore: 'Best game score', comparisonHelp: 'This compares placement assessment with game results to show whether performance is improving.',
    progressSummary: 'Progress summary', currentPerformance: "Child's current reading performance", totalSessions: 'Total sessions', overallAccuracy: 'Overall accuracy', bestScore: 'Best score', averageScore: 'Average score', earnedStars: 'Stars collected', noProgress: 'No game sessions yet. The learning summary will appear after the child starts playing.', goodProgress: 'Excellent progress. The child performs well and is ready for more challenging practice.', steadyProgress: 'Steady progress. Confidence is developing, but targeted practice is still needed in weaker areas.', startingProgress: 'Early progress. Guided practice is needed, especially for weak letters and reading activities.', trend: (count) => `A recent trend from ${count} completed sessions is available for further analysis.`,
    sectionDetails: 'Performance by section', sectionHelp: 'Unlocked and completed learning sections', gamePerformance: 'Game performance', gameHelp: 'Scores and accuracy for each game', recentSessions: 'Recent game sessions', recentHelp: 'Latest game attempts and results', noSessions: 'No game sessions have been recorded yet.',
    sessions: 'Sessions', gamesPlayed: 'Games played', accuracy: 'Accuracy', lastPlayed: 'Last played', game: 'Game', best: 'Best', average: 'Average', status: 'Status', score: 'Score', correct: 'Correct', duration: 'Duration', date: 'Date', completed: 'Completed', abandoned: 'Abandoned', active: 'In progress', seconds: 'sec.', difference: 'change',
  },
};

const DashboardLanguageContext = createContext({ language: 'si', copy: DASHBOARD_COPY.si });
const useDashboardLanguage = () => useContext(DashboardLanguageContext);
const ENGLISH_GAME_TITLES = {
  'garden-journey': 'Garden Journey', 'letter-pronunciation': 'Letter Pronunciation', 'first-letter': 'First Letter',
  'letter-sound-match': 'Letter–Sound Match', 'letter-listening': 'Listen to Letters', 'two-letter-listen': 'Listen to Two-Letter Words',
  'two-letter-word-match': 'Two-Letter Word Match', 'two-letter-speak': 'Speak Two-Letter Words', 'word-image-match': 'Word–Image Match',
  'word-builder': 'Word Builder', 'word-speak': 'Speak Words', 'word-listen-match': 'Listen and Match Words', 'rhyme-odd-one-out': 'Rhyme Odd One Out',
};
const ENGLISH_SECTION_TITLES = { 1: 'Letter Recognition', 2: 'Letter Sounds', 3: 'Two-Letter Words', 4: 'Three-Letter Words', 5: 'Word Reading', 6: 'Reading Challenge' };
const localizedGameTitle = (game, language) => language === 'en' ? (ENGLISH_GAME_TITLES[game.gameKey] || game.title || game.gameTitle) : (game.title || game.gameTitle);

const StatCard = ({ label, value, sub, color, icon: Icon = BarChart3, tone = 'sky' }) => {
  const palette = STAT_TONES[tone] || STAT_TONES.sky;
  return (
  <div className="group relative overflow-hidden rounded-3xl border border-white bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(15,23,42,0.12)]">
    <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full blur-xl ${palette.glow}`} aria-hidden="true" />
    <div className="relative flex items-start justify-between gap-3">
      <div className="min-w-0">
        <span className="text-sm font-extrabold leading-snug text-slate-500">{label}</span>
        <span className="mt-2 block text-3xl font-black sm:text-4xl" style={{ color: color || '#0f172a' }}>{value}</span>
        {sub && <span className="mt-1 block text-xs font-semibold text-slate-400">{sub}</span>}
      </div>
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl shadow-sm ${palette.icon}`}>
        <Icon size={23} strokeWidth={2.5} />
      </span>
    </div>
  </div>
  );
};

const ScorePill = ({ value, max }) => {
  const color = scoreColor(value, max);
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-xs font-bold text-white"
      style={{ background: color }}
    >
      {value !== null && value !== undefined ? `${value}${max !== 100 ? `/${max}` : '%'}` : '—'}
    </span>
  );
};

const DeltaPill = ({ value }) => {
  const { copy } = useDashboardLanguage();
  if (value === null || value === undefined || Number.isNaN(value)) {
    return <span className="text-xs font-bold text-gray-400">—</span>;
  }

  const rounded = Number(value.toFixed(1));
  const positive = rounded > 0;
  const negative = rounded < 0;
  const colorClass = positive ? 'bg-green-100 text-green-700' : negative ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600';
  const prefix = positive ? '+' : '';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${colorClass}`}>
      {prefix}{rounded}% {copy.difference}
    </span>
  );
};

const ComparisonCard = ({ title, preValue, postValue, preLabel, postLabel }) => {
  const { copy } = useDashboardLanguage();
  const delta = preValue !== null && preValue !== undefined && postValue !== null && postValue !== undefined
    ? postValue - preValue
    : null;

  return (
    <div className="rounded-3xl border border-violet-100 bg-white p-5 shadow-[0_10px_28px_rgba(76,29,149,0.08)]">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</div>
          <div className="text-sm font-bold text-gray-800 mt-1">{copy.preToGames}</div>
        </div>
        <DeltaPill value={delta} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-1">{preLabel}</div>
          <div className="text-2xl font-black text-amber-900">{preValue ?? '—'}%</div>
        </div>
        <div className="rounded-xl bg-green-50 border border-green-100 p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-green-700 mb-1">{postLabel}</div>
          <div className="text-2xl font-black text-green-900">{postValue ?? '—'}%</div>
        </div>
      </div>
    </div>
  );
};

const SectionRow = ({ section, unlocked }) => {
  const { copy, language } = useDashboardLanguage();
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-16 w-full items-center gap-3 bg-white px-4 py-3 transition-colors hover:bg-sky-50"
      >
        <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${unlocked ? 'bg-green-100' : 'bg-gray-100'}`}>
          {unlocked ? <Unlock size={14} className="text-green-600" /> : <Lock size={14} className="text-gray-400" />}
        </span>
        <span className="flex-1 text-left font-bold text-gray-700 text-sm">{language === 'en' ? (ENGLISH_SECTION_TITLES[section.sectionId] || section.title) : section.title}</span>
        <div className="hidden items-center gap-3 text-xs text-gray-500 sm:flex">
          <span>{copy.sessions} {section.sessionsPlayed}</span>
          <ScorePill value={section.accuracy} max={100} />
          <ScorePill value={section.bestScore} max={100} />
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-slate-100 bg-slate-50 px-4 py-4"
          >
            <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 mb-1 font-semibold px-1">
              <span>{language === 'en' ? 'Metric' : 'මිනුම'}</span><span>{language === 'en' ? 'Value' : 'අගය'}</span><span></span><span></span>
            </div>
            <div className="grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
              <div className="flex justify-between"><span className="text-gray-500">{copy.sessions}</span><span className="font-bold">{fmt(section.sessionsPlayed)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">{copy.gamesPlayed}</span><span className="font-bold">{section.gamesPlayed}/{section.totalGames}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">{copy.bestScore}</span><span className="font-bold">{fmtPct(section.bestScore)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">{copy.averageScore}</span><span className="font-bold">{fmtPct(section.avgScore)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">{copy.accuracy}</span><span className="font-bold">{fmtPct(section.accuracy)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">{copy.lastPlayed}</span><span className="font-bold">{fmtDate(section.lastPlayedAt, language)}</span></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const GameTable = ({ games }) => {
  const { copy, language } = useDashboardLanguage();
  return (
  <div className="overflow-x-auto rounded-2xl border border-slate-200">
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-sky-50 text-slate-600 text-xs uppercase tracking-wide">
          <th className="text-left px-4 py-2 font-semibold">{copy.game}</th><th className="text-center px-3 py-2 font-semibold">{copy.sessions}</th><th className="text-center px-3 py-2 font-semibold">{copy.best}</th><th className="text-center px-3 py-2 font-semibold">{copy.average}</th><th className="text-center px-3 py-2 font-semibold">{copy.accuracy}</th><th className="text-left px-3 py-2 font-semibold">{copy.lastPlayed}</th>
        </tr>
      </thead>
      <tbody>
        {games.map((g, i) => (
          <tr key={g.gameKey} className={`border-t border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}`}>
            <td className="px-4 py-4 font-bold text-slate-800">{localizedGameTitle(g, language)}</td>
            <td className="px-3 py-4 text-center font-semibold text-slate-600">{g.sessionsPlayed}</td>
            <td className="px-3 py-4 text-center"><ScorePill value={g.bestScore} max={100} /></td>
            <td className="px-3 py-4 text-center"><ScorePill value={g.avgScore} max={100} /></td>
            <td className="px-3 py-4 text-center"><ScorePill value={g.accuracy} max={100} /></td>
            <td className="whitespace-nowrap px-3 py-4 text-xs font-semibold text-slate-500">{fmtDate(g.lastPlayedAt, language)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  );
};

const RecentSessionsTable = ({ sessions }) => {
  const { copy, language } = useDashboardLanguage();
  return (
  <div className="overflow-x-auto rounded-2xl border border-slate-200">
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-amber-50 text-slate-600 text-xs uppercase tracking-wide">
          <th className="text-left px-4 py-2 font-semibold">{copy.game}</th><th className="text-center px-3 py-2 font-semibold">{copy.status}</th><th className="text-center px-3 py-2 font-semibold">{copy.score}</th><th className="text-center px-3 py-2 font-semibold">{copy.correct}</th><th className="text-center px-3 py-2 font-semibold">{copy.duration}</th><th className="text-left px-3 py-2 font-semibold">{copy.date}</th>
        </tr>
      </thead>
      <tbody>
        {sessions.map((s, i) => (
          <tr key={String(s.sessionId)} className={`border-t border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}`}>
            <td className="px-4 py-4 font-bold text-slate-800">{localizedGameTitle({ gameKey: s.gameKey, gameTitle: s.gameTitle }, language)}</td>
            <td className="px-3 py-4 text-center">
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                s.status === 'completed' ? 'bg-green-100 text-green-700'
                : s.status === 'abandoned' ? 'bg-red-100 text-red-600'
                : 'bg-yellow-100 text-yellow-700'
              }`}>{s.status === 'completed' ? copy.completed : s.status === 'abandoned' ? copy.abandoned : copy.active}</span>
            </td>
            <td className="px-3 py-4 text-center"><ScorePill value={s.score} max={100} /></td>
            <td className="px-3 py-4 text-center text-gray-600">
              {s.totalQuestions > 0 ? `${s.correctAnswers}/${s.totalQuestions}` : '—'}
            </td>
            <td className="px-3 py-4 text-center text-gray-500 text-xs">
              {s.durationSeconds ? `${s.durationSeconds} ${copy.seconds}` : '—'}
            </td>
            <td className="whitespace-nowrap px-3 py-4 text-gray-500 text-xs">{fmtDate(s.completedAt || s.startedAt, language)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  );
};

const AssessmentBadge = ({ assessment }) => {
  const { copy, language } = useDashboardLanguage();
  if (!assessment) {
    return (
      <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-center gap-3">
        <AlertCircle size={18} className="text-amber-500 shrink-0" />
        <span className="text-amber-700 font-semibold text-sm">{copy.assessmentPending}</span>
      </div>
    );
  }

  const { scores, unlockedSections, attemptCount, completedAt, recommendedLevel, weakLetters, assessment: placement } = assessment;
  const placementScores = placement?.scores || null;
  return (
    <div className="rounded-2xl bg-green-50 border border-green-200 px-4 py-3 space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Target size={16} className="text-green-600" />
        <span className="font-bold text-green-800 text-sm">{copy.assessmentComplete}</span>
        <span className="ml-auto text-xs text-gray-400">{fmtDate(completedAt, language)} · {copy.attempt} #{attemptCount}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <div className="text-center">
          <div className="text-xl font-black" style={{ color: scoreColor(scores.letters, 3) }}>{scores.letters}/3</div>
          <div className="text-xs text-gray-500">{copy.letters}</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-black" style={{ color: scoreColor(scores.twoLetter, 2) }}>{scores.twoLetter}/2</div>
          <div className="text-xs text-gray-500">{copy.twoLetters}</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-black" style={{ color: scoreColor(scores.threeLetter, 2) }}>{scores.threeLetter}/2</div>
          <div className="text-xs text-gray-500">{copy.threeLetters}</div>
        </div>
      </div>
      <div className="rounded-xl bg-white border border-green-100 p-3">
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="text-sm font-bold text-green-900">{copy.recommendedLevel}</span>
          <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 font-black text-sm">{copy.level} {recommendedLevel ?? 1}</span>
        </div>
        <p className="text-xs text-gray-500 mb-2">{copy.weakHelp}</p>
        <div className="flex flex-wrap gap-1">
          {(weakLetters || []).length > 0
            ? weakLetters.map((letter) => (
                <span key={letter} className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">{letter}</span>
              ))
            : <span className="text-xs text-gray-400">{copy.noWeak}</span>}
        </div>
      </div>
      {placementScores && (
        <div className="rounded-xl bg-white border border-green-100 p-3">
          <div className="text-sm font-bold text-green-900 mb-2">{copy.placement}</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between"><span className="text-gray-500">{copy.letterRecognition}</span><span className="font-bold">{placementScores.letterRecognition ?? 0}%</span></div>
            <div className="flex justify-between"><span className="text-gray-500">{copy.letterSound}</span><span className="font-bold">{placementScores.letterSound ?? 0}%</span></div>
            <div className="flex justify-between"><span className="text-gray-500">{copy.twoLetterReading}</span><span className="font-bold">{placementScores.twoLetterReading ?? 0}%</span></div>
            <div className="flex justify-between"><span className="text-gray-500">{copy.threeLetterReading}</span><span className="font-bold">{placementScores.threeLetterReading ?? 0}%</span></div>
            <div className="flex justify-between"><span className="text-gray-500">{copy.pronunciation}</span><span className="font-bold">{placementScores.pronunciation ?? 0}%</span></div>
            <div className="flex justify-between"><span className="text-gray-500">{copy.overall}</span><span className="font-bold">{placementScores.overall ?? 0}%</span></div>
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-1">
        {[1,2,3,4,5,6].map((sid) => (
          <span key={sid}
            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              unlockedSections.includes(sid)
                ? 'bg-green-200 text-green-800'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {unlockedSections.includes(sid) ? '🔓' : '🔒'} S{sid}
          </span>
        ))}
      </div>
    </div>
  );
};

const PerformanceComparison = ({ assessment, overall }) => {
  const { copy } = useDashboardLanguage();
  const placementScores = assessment?.assessment?.scores || null;
  const preOverall = placementScores?.overall ?? null;
  const gameOverall = overall?.overallAccuracy ?? null;

  const sectionsUnlocked = assessment?.unlockedSections?.length ?? 0;
  const completedSessions = overall?.completedSessions ?? 0;
  const bestScore = overall?.bestScore ?? null;

  if (!assessment && completedSessions === 0) {
    return (
      <div className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-4">
        <div className="flex items-center gap-2 mb-2">
          <Target size={16} className="text-slate-600" />
          <span className="font-bold text-slate-800 text-sm">{copy.comparison}</span>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          {copy.noComparison}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Target size={16} className="text-slate-600" />
        <span className="font-bold text-slate-800 text-sm">{copy.comparison}</span>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <ComparisonCard
          title={copy.skillLevel}
          preValue={preOverall}
          postValue={gameOverall}
          preLabel={copy.preOverall}
          postLabel={copy.postAccuracy}
        />
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">{copy.learningImpact}</div>
          <div className="text-sm font-bold text-gray-800 mt-1 mb-4">{copy.dashboardShows}</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
              <div className="text-xs text-gray-500 mb-1">{copy.completedSessions}</div>
              <div className="text-2xl font-black text-gray-900">{completedSessions}</div>
            </div>
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
              <div className="text-xs text-gray-500 mb-1">{copy.unlockedSections}</div>
              <div className="text-2xl font-black text-gray-900">{sectionsUnlocked}</div>
            </div>
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
              <div className="text-xs text-gray-500 mb-1">{copy.bestGameScore}</div>
              <div className="text-2xl font-black text-gray-900">{bestScore ?? '—'}%</div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 leading-relaxed">
            {copy.comparisonHelp}
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Child Detail Panel ────────────────────────────────────────────────────────

const ChildDetail = ({ userId, firebaseProfile }) => {
  const { copy } = useDashboardLanguage();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [earnedStars, setEarnedStars] = useState(() => readDyslexiaStars(userId));

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    setEarnedStars(readDyslexiaStars(userId));
    dyslexiaService.getUserDashboard(userId)
      .then((res) => setData(res.data))
      .catch((err) => {
        setError(copy.loadError);
        logTelemetryError('dyslexia-dashboard-user', err, { userId });
      })
      .finally(() => setLoading(false));
  }, [userId, copy.loadError]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-64 text-gray-400">
        <RefreshCw size={24} className="animate-spin mr-2" /> {copy.loading}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6">
        <p className="text-red-600 font-semibold mb-3">{error}</p>
        <button onClick={load} className="btn-secondary text-sm">{copy.retry}</button>
      </div>
    );
  }

  if (!data) return null;

  const { assessment, overall, sections, games, recentSessions, accuracyTrend } = data;

  const progressSummary = (() => {
    if ((overall.completedSessions ?? 0) === 0) {
      return copy.noProgress;
    }

    if ((overall.overallAccuracy ?? 0) >= 80) {
      return copy.goodProgress;
    }

    if ((overall.overallAccuracy ?? 0) >= 50) {
      return copy.steadyProgress;
    }

    return copy.startingProgress;
  })();

  const displayName = firebaseProfile?.name || userId;
  const displayEmail = firebaseProfile?.email || userId;

  return (
    <motion.div
      key={userId}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 min-w-0 space-y-6 overflow-y-auto bg-gradient-to-b from-sky-50/70 via-white to-violet-50/60 p-3 sm:p-6 lg:p-8"
    >
      {/* Header */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-sky-800 via-cyan-700 to-emerald-600 p-5 text-white shadow-xl sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/10" aria-hidden="true" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-amber-300/15 blur-xl" aria-hidden="true" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border-4 border-white/40 bg-white/20 text-2xl font-black shadow-lg backdrop-blur sm:h-20 sm:w-20 sm:text-3xl">
            {(displayName || displayEmail || userId).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-xs font-black uppercase tracking-[0.2em] text-cyan-100">{copy.profile}</p>
            <h2 className="truncate text-2xl font-black sm:text-3xl">{displayName}</h2>
            <p className="mt-1 truncate text-sm font-semibold text-white/75">{displayEmail}</p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3 self-start sm:self-auto">
            <div className="inline-flex min-h-12 items-center gap-3 rounded-2xl border-2 border-amber-200/80 bg-white px-4 py-2 text-amber-700 shadow-lg" aria-label={`${copy.earnedStars}: ${earnedStars}`}>
              <Star size={25} className="fill-amber-400 text-amber-500" />
              <div className="leading-none">
                <strong className="block text-2xl font-black">{earnedStars}</strong>
                <span className="mt-1 block text-[11px] font-black">{copy.earnedStars}</span>
              </div>
            </div>
            <button
              onClick={load}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-2.5 text-sm font-black text-white transition hover:bg-white/25"
              title={copy.refresh}
            >
              <RefreshCw size={17} /> {copy.refresh}
            </button>
          </div>
        </div>
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <AssessmentBadge assessment={assessment} />
        <PerformanceComparison assessment={assessment} overall={overall} />
      </div>

      {/* Progress summary */}
      <section className="rounded-[2rem] border border-cyan-100 bg-white/90 p-5 shadow-[0_14px_36px_rgba(8,145,178,0.09)] sm:p-6">
        <div className="mb-3 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-100 text-cyan-700"><Sparkles size={20} /></span>
          <div>
            <h3 className="text-lg font-black text-slate-800">{copy.progressSummary}</h3>
            <p className="text-xs font-semibold text-slate-400">{copy.currentPerformance}</p>
          </div>
        </div>
        <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold leading-7 text-slate-600">{progressSummary}</p>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label={copy.completedSessions} value={fmt(overall.completedSessions)} sub={`${copy.totalSessions} ${fmt(overall.totalSessions)}`} icon={CheckCircle2} tone="emerald" />
          <StatCard label={copy.overallAccuracy} value={fmtPct(overall.overallAccuracy)} color={scoreColor(overall.overallAccuracy)} icon={Target} tone="sky" />
          <StatCard label={copy.bestScore} value={fmtPct(overall.bestScore)} color={scoreColor(overall.bestScore)} icon={Award} tone="amber" />
          <StatCard label={copy.averageScore} value={fmtPct(overall.averageScore)} color={scoreColor(overall.averageScore)} icon={Activity} tone="violet" />
          <StatCard label={copy.earnedStars} value={earnedStars} color="#d97706" icon={Star} tone="amber" />
        </div>
        {accuracyTrend?.length > 0 && (
          <p className="text-xs text-slate-500 mt-3">{copy.trend(accuracyTrend.length)}</p>
        )}
      </section>

      {/* Section breakdown */}
      {sections.length > 0 && (
        <section className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><Unlock size={19} /></span>
            <div><h3 className="text-lg font-black text-slate-800">{copy.sectionDetails}</h3><p className="text-xs font-semibold text-slate-400">{copy.sectionHelp}</p></div>
          </div>
          {sections.map((sec) => (
            <SectionRow
              key={sec.sectionId}
              section={sec}
              unlocked={assessment?.unlockedSections?.includes(sec.sectionId) ?? true}
            />
          ))}
        </section>
      )}

      {/* Game breakdown */}
      {games.length > 0 && (
        <section className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-100 text-violet-700"><BarChart3 size={20} /></span><div><h3 className="text-lg font-black text-slate-800">{copy.gamePerformance}</h3><p className="text-xs font-semibold text-slate-400">{copy.gameHelp}</p></div></div>
          <GameTable games={games} />
        </section>
      )}

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <section className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-100 text-amber-700"><Clock3 size={20} /></span><div><h3 className="text-lg font-black text-slate-800">{copy.recentSessions}</h3><p className="text-xs font-semibold text-slate-400">{copy.recentHelp}</p></div></div>
          <RecentSessionsTable sessions={recentSessions} />
        </section>
      )}

      {sections.length === 0 && games.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <BookOpen size={36} className="mx-auto mb-2 opacity-40" />
          <p className="font-semibold">{copy.noSessions}</p>
        </div>
      )}
    </motion.div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export const AllUsersDyslexiaDashboard = () => {
  const [allSummary, setAllSummary]     = useState([]);       // backend summary per user
  const [firebaseUsers, setFirebaseUsers] = useState([]);      // name/email from Firestore
  const [selectedUid, setSelectedUid]   = useState('');
  const [search, setSearch]             = useState('');
  const [loadingList, setLoadingList]   = useState(true);
  const [listError, setListError]       = useState('');

  const loadList = useCallback(async () => {
    setLoadingList(true);
    setListError('');
    try {
      const [backendResult, firebaseResult] = await Promise.allSettled([
        dyslexiaService.getAllUsersDashboard(),
        listUserProfiles(),
      ]);

      if (backendResult.status === 'fulfilled') {
        setAllSummary(backendResult.value.data || []);
      } else {
        throw backendResult.reason;
      }

      if (firebaseResult.status === 'fulfilled') {
        setFirebaseUsers(firebaseResult.value);
      } else {
        setFirebaseUsers([]);
        setListError('Performance loaded, but student names could not be loaded. Check Firestore access.');
        logTelemetryError('dyslexia-dashboard-profiles', firebaseResult.reason);
      }
    } catch (err) {
      setListError('Failed to load user list.');
      logTelemetryError('dyslexia-dashboard-list', err);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => { loadList(); }, [loadList]);

  // Merge backend summary with Firebase profiles
  const mergedUsers = useMemo(() => {
    const fbMap = {};
    for (const u of firebaseUsers) fbMap[u.uid] = u;

    // All firebase users — if no backend sessions yet, still show them
    const allUids = new Set([
      ...firebaseUsers.map((u) => u.uid),
      ...allSummary.map((s) => s.userId),
    ]);

    return Array.from(allUids)
      .map((uid) => {
        const fb  = fbMap[uid] || {};
        const bk  = allSummary.find((s) => s.userId === uid) || {};
        return {
          uid,
          name:              fb.name  || '',
          email:             fb.email || uid,
          role:              fb.role  || 'student',
          totalSessions:     bk.totalSessions     ?? 0,
          completedSessions: bk.completedSessions ?? 0,
          bestScore:         bk.bestScore         ?? 0,
          averageScore:      bk.averageScore       ?? 0,
          assessmentDone:    bk.assessmentDone     ?? false,
          unlockedSections:  bk.unlockedSections   ?? [],
          lastPlayedAt:      bk.lastPlayedAt       ?? null,
        };
      })
      .filter((u) => u.role === 'student' || u.totalSessions > 0)
      .sort((a, b) => (a.name || a.email).localeCompare(b.name || b.email));
  }, [allSummary, firebaseUsers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mergedUsers;
    return mergedUsers.filter((u) =>
      u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [mergedUsers, search]);

  useEffect(() => {
    if (!selectedUid && filtered.length > 0) {
      setSelectedUid(filtered[0].uid);
    }
  }, [filtered, selectedUid]);

  const selectedFirebaseProfile = useMemo(
    () => firebaseUsers.find((u) => u.uid === selectedUid) || null,
    [firebaseUsers, selectedUid]
  );

  return (
    <main className="page-shell relative min-h-screen overflow-hidden" style={{ fontFamily: "'Noto Sans Sinhala', 'Nunito', Arial, sans-serif", background: 'transparent' }}>
      <DashboardModuleBackground />
      <div className="container relative z-10">
        <div className="card admin-card border-2 border-white/80 bg-white/[0.94] shadow-[0_24px_70px_rgba(5,55,65,0.34)] backdrop-blur-xl" style={{ padding: 0, overflow: 'hidden', minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
          {/* Header bar */}
          <div className="px-4 sm:px-6 py-4 border-b border-white/30 bg-gradient-to-r from-sky-700 via-emerald-600 to-amber-500 flex items-center gap-3 shadow-lg">
            <BookOpen size={22} className="text-white" />
            <h1 className="text-white font-black text-base sm:text-xl leading-tight">Dyslexia Performance Dashboard</h1>
            <button
              onClick={loadList}
              className="ml-auto p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} className="text-white" />
            </button>
          </div>

          {listError && (
            <div className="px-6 py-3 bg-red-50 border-b border-red-100 flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500" />
              <span className="text-red-700 text-sm font-semibold">{listError}</span>
              <button onClick={loadList} className="ml-2 text-red-600 underline text-xs">Retry</button>
            </div>
          )}

          <div className="flex flex-1 flex-col md:flex-row overflow-visible md:overflow-hidden">
            {/* ── Left: user list ── */}
            <aside className="w-full md:w-72 shrink-0 border-b md:border-b-0 md:border-r border-emerald-100 flex flex-col bg-gradient-to-b from-emerald-50/95 to-sky-50/95 max-h-72 md:max-h-none">
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 bg-white text-sm
                               focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="Search students…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {loadingList && (
                  <p className="text-center text-gray-400 text-sm py-8">Loading users…</p>
                )}
                {!loadingList && filtered.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-8">No students found.</p>
                )}
                {filtered.map((user) => (
                  <button
                    key={user.uid}
                    onClick={() => setSelectedUid(user.uid)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-colors
                      ${selectedUid === user.uid
                        ? 'bg-gradient-to-r from-amber-100 to-emerald-100 border-l-4 border-l-amber-500'
                        : 'hover:bg-white/90 border-l-4 border-l-transparent'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-300 to-emerald-500
                                      flex items-center justify-center text-white text-xs font-black shrink-0">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 text-sm truncate">{user.name || user.uid}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1 ml-10">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                        user.assessmentDone ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {user.assessmentDone ? '✓ Assessed' : '⚠ Pending'}
                      </span>
                      <span className="text-xs text-gray-400">{user.totalSessions} sessions</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Summary footer */}
              <div className="p-3 border-t border-gray-100 bg-white">
                <p className="text-xs text-gray-400 text-center">
                  {filtered.length} student{filtered.length !== 1 ? 's' : ''} ·{' '}
                  {filtered.filter((u) => u.assessmentDone).length} assessed
                </p>
              </div>
            </aside>

            {/* ── Right: detail panel ── */}
            {selectedUid ? (
              <ChildDetail
                key={selectedUid}
                userId={selectedUid}
                firebaseProfile={selectedFirebaseProfile}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-300 gap-3">
                <User size={48} />
                <p className="font-semibold text-lg">Select a student to view their performance</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

const DyslexiaDashboard = () => {
  const { user } = useAuth();
  const userId = user?.uid || user?.id;
  const [language, setLanguage] = useState('si');
  const copy = DASHBOARD_COPY[language];

  return (
    <DashboardLanguageContext.Provider value={{ language, copy }}>
    <main className="page-shell relative min-h-screen overflow-hidden" style={{ fontFamily: "'Noto Sans Sinhala', 'Nunito', Arial, sans-serif", background: 'transparent' }}>
      <DashboardModuleBackground />
      <div className="relative z-10 mx-auto w-full max-w-[95rem] px-3 py-5 sm:px-6 sm:py-8">
        <div className="flex min-h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-[2.25rem] border border-white/90 bg-white/95 shadow-[0_28px_80px_rgba(15,82,101,0.22)] backdrop-blur-xl">
          <div className="relative flex items-center gap-4 overflow-hidden border-b border-white/30 bg-gradient-to-r from-sky-800 via-cyan-700 to-emerald-600 px-5 py-5 text-white shadow-lg sm:px-8 sm:py-6">
            <div className="pointer-events-none absolute -right-8 -top-14 h-40 w-40 rounded-full bg-amber-300/20" aria-hidden="true" />
            <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/30 bg-white/15 shadow-md">
              <BookOpen size={25} />
            </span>
            <div className="relative min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100">Dyslexia Dashboard</p>
              <h1 className="mt-1 text-xl font-black leading-tight sm:text-2xl">{copy.title}</h1>
              <p className="mt-1 hidden text-sm font-semibold text-white/70 sm:block">{copy.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => setLanguage((current) => current === 'si' ? 'en' : 'si')}
              className="relative shrink-0 rounded-full border border-white/40 bg-white px-4 py-2.5 text-sm font-black text-sky-800 shadow-lg transition hover:scale-[1.03] sm:px-5"
              aria-label={language === 'si' ? 'Switch dashboard to English' : 'Dashboard එක සිංහල මාධ්‍යයට මාරු කරන්න'}
            >
              {copy.switchLanguage}
            </button>
          </div>

          {userId ? (
            <ChildDetail
              userId={userId}
              firebaseProfile={{ name: user?.name || user?.displayName || '', email: user?.email || '' }}
            />
          ) : null}
        </div>
      </div>
    </main>
    </DashboardLanguageContext.Provider>
  );
};

export default DyslexiaDashboard;
