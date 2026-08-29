/**
 * DyslexiaDashboard  —  public dashboard view
 *
 * Admin / therapist view: shows every child's dyslexia performance.
 * Left panel:  list of all users who have played at least one session.
 * Right panel: selected child's detailed stats — assessment, overall,
 *              section breakdown, game breakdown, recent sessions.
 */

import { useEffect, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Search, RefreshCw, Target,
  BookOpen, Lock, Unlock, ChevronDown, ChevronUp, AlertCircle,
} from 'lucide-react';
import { dyslexiaService } from '../modules/dyslexia/services/dyslexiaService';
import { listUserProfiles } from '../services/firebaseUserProfile';
import { logTelemetryError } from '../services/telemetry';
import useAuth from '../hooks/useAuth';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n) => (n === null || n === undefined ? '—' : String(n));
const fmtPct = (n) => (n === null || n === undefined ? '—' : `${n}%`);
const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('si-LK', { year: 'numeric', month: 'short', day: 'numeric' });
};
const scoreColor = (score, max = 100) => {
  if (score === null || score === undefined) return '#6b7280';
  const pct = max !== 100 ? (score / max) * 100 : score;
  if (pct >= 80) return '#059669';
  if (pct >= 50) return '#d97706';
  return '#dc2626';
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

const StatCard = ({ label, value, sub, color }) => (
  <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 flex flex-col gap-1">
    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
    <span className="text-2xl font-black" style={{ color: color || '#1f2937' }}>{value}</span>
    {sub && <span className="text-xs text-gray-400">{sub}</span>}
  </div>
);

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
      {prefix}{rounded}% වෙනස
    </span>
  );
};

const ComparisonCard = ({ title, preValue, postValue, preLabel, postLabel }) => {
  const delta = preValue !== null && preValue !== undefined && postValue !== null && postValue !== undefined
    ? postValue - preValue
    : null;

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</div>
          <div className="text-sm font-bold text-gray-800 mt-1">පූර්ව පරීක්ෂණයේ සිට ක්‍රීඩා දක්වා</div>
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
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden mb-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
      >
        <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${unlocked ? 'bg-green-100' : 'bg-gray-100'}`}>
          {unlocked ? <Unlock size={14} className="text-green-600" /> : <Lock size={14} className="text-gray-400" />}
        </span>
        <span className="flex-1 text-left font-bold text-gray-700 text-sm">{section.title}</span>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>වාර {section.sessionsPlayed}</span>
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
            className="overflow-hidden bg-gray-50 px-4 py-3 border-t border-gray-100"
          >
            <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 mb-1 font-semibold px-1">
              <span>මිනුම</span><span>අගය</span><span></span><span></span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">ක්‍රීඩා කළ වාර</span><span className="font-bold">{fmt(section.sessionsPlayed)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">ක්‍රීඩා කළ ක්‍රීඩා</span><span className="font-bold">{section.gamesPlayed}/{section.totalGames}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">හොඳම ලකුණු</span><span className="font-bold">{fmtPct(section.bestScore)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">සාමාන්‍ය ලකුණු</span><span className="font-bold">{fmtPct(section.avgScore)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">නිවැරදිභාවය</span><span className="font-bold">{fmtPct(section.accuracy)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">අවසන් වරට ක්‍රීඩා කළේ</span><span className="font-bold">{fmtDate(section.lastPlayedAt)}</span></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const GameTable = ({ games }) => (
  <div className="overflow-x-auto rounded-xl border border-gray-100">
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
          <th className="text-left px-4 py-2 font-semibold">ක්‍රීඩාව</th>
          <th className="text-center px-3 py-2 font-semibold">වාර</th>
          <th className="text-center px-3 py-2 font-semibold">හොඳම</th>
          <th className="text-center px-3 py-2 font-semibold">සාමාන්‍ය</th>
          <th className="text-center px-3 py-2 font-semibold">නිවැරදිභාවය</th>
          <th className="text-left px-3 py-2 font-semibold">අවසන් වරට</th>
        </tr>
      </thead>
      <tbody>
        {games.map((g, i) => (
          <tr key={g.gameKey} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
            <td className="px-4 py-2 font-medium text-gray-800">{g.title}</td>
            <td className="px-3 py-2 text-center text-gray-600">{g.sessionsPlayed}</td>
            <td className="px-3 py-2 text-center"><ScorePill value={g.bestScore} max={100} /></td>
            <td className="px-3 py-2 text-center"><ScorePill value={g.avgScore} max={100} /></td>
            <td className="px-3 py-2 text-center"><ScorePill value={g.accuracy} max={100} /></td>
            <td className="px-3 py-2 text-gray-500 text-xs">{fmtDate(g.lastPlayedAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const RecentSessionsTable = ({ sessions }) => (
  <div className="overflow-x-auto rounded-xl border border-gray-100">
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
          <th className="text-left px-4 py-2 font-semibold">ක්‍රීඩාව</th>
          <th className="text-center px-3 py-2 font-semibold">තත්ත්වය</th>
          <th className="text-center px-3 py-2 font-semibold">ලකුණු</th>
          <th className="text-center px-3 py-2 font-semibold">නිවැරදි</th>
          <th className="text-center px-3 py-2 font-semibold">කාලය</th>
          <th className="text-left px-3 py-2 font-semibold">දිනය</th>
        </tr>
      </thead>
      <tbody>
        {sessions.map((s, i) => (
          <tr key={String(s.sessionId)} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
            <td className="px-4 py-2 font-medium text-gray-800">{s.gameTitle}</td>
            <td className="px-3 py-2 text-center">
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                s.status === 'completed' ? 'bg-green-100 text-green-700'
                : s.status === 'abandoned' ? 'bg-red-100 text-red-600'
                : 'bg-yellow-100 text-yellow-700'
              }`}>{s.status === 'completed' ? 'සම්පූර්ණයි' : s.status === 'abandoned' ? 'අත්හැර ඇත' : 'ක්‍රියාත්මකයි'}</span>
            </td>
            <td className="px-3 py-2 text-center"><ScorePill value={s.score} max={100} /></td>
            <td className="px-3 py-2 text-center text-gray-600">
              {s.totalQuestions > 0 ? `${s.correctAnswers}/${s.totalQuestions}` : '—'}
            </td>
            <td className="px-3 py-2 text-center text-gray-500 text-xs">
              {s.durationSeconds ? `${s.durationSeconds} තත්.` : '—'}
            </td>
            <td className="px-3 py-2 text-gray-500 text-xs">{fmtDate(s.completedAt || s.startedAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const AssessmentBadge = ({ assessment }) => {
  if (!assessment) {
    return (
      <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-center gap-3">
        <AlertCircle size={18} className="text-amber-500 shrink-0" />
        <span className="text-amber-700 font-semibold text-sm">පූර්ව ඇගයීම තවම සම්පූර්ණ කර නැත</span>
      </div>
    );
  }

  const { scores, unlockedSections, attemptCount, completedAt, recommendedLevel, weakLetters, assessment: placement } = assessment;
  const placementScores = placement?.scores || null;
  return (
    <div className="rounded-2xl bg-green-50 border border-green-200 px-4 py-3 space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Target size={16} className="text-green-600" />
        <span className="font-bold text-green-800 text-sm">පූර්ව ඇගයීම සම්පූර්ණයි</span>
        <span className="ml-auto text-xs text-gray-400">{fmtDate(completedAt)} · උත්සාහය #{attemptCount}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <div className="text-center">
          <div className="text-xl font-black" style={{ color: scoreColor(scores.letters, 3) }}>{scores.letters}/3</div>
          <div className="text-xs text-gray-500">අකුරු</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-black" style={{ color: scoreColor(scores.twoLetter, 2) }}>{scores.twoLetter}/2</div>
          <div className="text-xs text-gray-500">අකුරු 2</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-black" style={{ color: scoreColor(scores.threeLetter, 2) }}>{scores.threeLetter}/2</div>
          <div className="text-xs text-gray-500">අකුරු 3</div>
        </div>
      </div>
      <div className="rounded-xl bg-white border border-green-100 p-3">
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="text-sm font-bold text-green-900">නිර්දේශිත මට්ටම</span>
          <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 font-black text-sm">මට්ටම {recommendedLevel ?? 1}</span>
        </div>
        <p className="text-xs text-gray-500 mb-2">දුර්වල අකුරු යනු ඉලක්කගත පුහුණුව සඳහා යොදාගත හැකි නැවත නැවත සිදුවන වැරදි වේ.</p>
        <div className="flex flex-wrap gap-1">
          {(weakLetters || []).length > 0
            ? weakLetters.map((letter) => (
                <span key={letter} className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">{letter}</span>
              ))
            : <span className="text-xs text-gray-400">දුර්වල අකුරු තවම වාර්තා වී නැත.</span>}
        </div>
      </div>
      {placementScores && (
        <div className="rounded-xl bg-white border border-green-100 p-3">
          <div className="text-sm font-bold text-green-900 mb-2">මට්ටම් තීරණ විස්තර</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between"><span className="text-gray-500">අකුරු හඳුනාගැනීම</span><span className="font-bold">{placementScores.letterRecognition ?? 0}%</span></div>
            <div className="flex justify-between"><span className="text-gray-500">අකුරු ශබ්ද</span><span className="font-bold">{placementScores.letterSound ?? 0}%</span></div>
            <div className="flex justify-between"><span className="text-gray-500">අකුරු දෙකේ කියවීම</span><span className="font-bold">{placementScores.twoLetterReading ?? 0}%</span></div>
            <div className="flex justify-between"><span className="text-gray-500">අකුරු තුනේ කියවීම</span><span className="font-bold">{placementScores.threeLetterReading ?? 0}%</span></div>
            <div className="flex justify-between"><span className="text-gray-500">උච්චාරණය</span><span className="font-bold">{placementScores.pronunciation ?? 0}%</span></div>
            <div className="flex justify-between"><span className="text-gray-500">සමස්තය</span><span className="font-bold">{placementScores.overall ?? 0}%</span></div>
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
          <span className="font-bold text-slate-800 text-sm">කාර්යසාධන සැසඳීම</span>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          මෙම දරුවා සඳහා පූර්ව පරීක්ෂණ හෝ ක්‍රීඩා ප්‍රතිඵල තවම නොමැත.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Target size={16} className="text-slate-600" />
        <span className="font-bold text-slate-800 text-sm">කාර්යසාධන සැසඳීම</span>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <ComparisonCard
          title="සමස්ත කුසලතා මට්ටම"
          preValue={preOverall}
          postValue={gameOverall}
          preLabel="පූර්ව පරීක්ෂණ සමස්තය"
          postLabel="ක්‍රීඩාවලින් පසු නිවැරදිභාවය"
        />
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">ඉගෙනුම් බලපෑම</div>
          <div className="text-sm font-bold text-gray-800 mt-1 mb-4">උපකරණ පුවරුව පෙන්වන දේ</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
              <div className="text-xs text-gray-500 mb-1">සම්පූර්ණ කළ වාර</div>
              <div className="text-2xl font-black text-gray-900">{completedSessions}</div>
            </div>
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
              <div className="text-xs text-gray-500 mb-1">විවෘත කළ කොටස්</div>
              <div className="text-2xl font-black text-gray-900">{sectionsUnlocked}</div>
            </div>
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
              <div className="text-xs text-gray-500 mb-1">හොඳම ක්‍රීඩා ලකුණ</div>
              <div className="text-2xl font-black text-gray-900">{bestScore ?? '—'}%</div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 leading-relaxed">
            මෙය මට්ටම් ඇගයීම දරුවාගේ ක්‍රීඩා ප්‍රතිඵල සමඟ සසඳා, කාර්යසාධනය වැඩිදියුණු වෙමින් තිබේදැයි පෙන්වයි.
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Child Detail Panel ────────────────────────────────────────────────────────

const ChildDetail = ({ userId, firebaseProfile }) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    dyslexiaService.getUserDashboard(userId)
      .then((res) => setData(res.data))
      .catch((err) => {
        setError('උපකරණ පුවරුවේ දත්ත පූරණය කිරීමට නොහැකි විය.');
        logTelemetryError('dyslexia-dashboard-user', err, { userId });
      })
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-64 text-gray-400">
        <RefreshCw size={24} className="animate-spin mr-2" /> පූරණය වෙමින්…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6">
        <p className="text-red-600 font-semibold mb-3">{error}</p>
        <button onClick={load} className="btn-secondary text-sm">නැවත උත්සාහ කරන්න</button>
      </div>
    );
  }

  if (!data) return null;

  const { assessment, overall, sections, games, recentSessions, accuracyTrend } = data;

  const progressSummary = (() => {
    if ((overall.completedSessions ?? 0) === 0) {
      return 'තවම ක්‍රීඩා වාර නොමැත. දරුවා ක්‍රීඩා කිරීම ආරම්භ කළ පසු ඉගෙනුම් සාරාංශය මෙහි පෙන්වනු ඇත.';
    }

    if ((overall.overallAccuracy ?? 0) >= 80) {
      return 'ඉතා හොඳ ප්‍රගතියක්. දරුවා ඉගෙනුම් ක්‍රීඩාවල හොඳින් ක්‍රියා කරන අතර වඩා අභියෝගාත්මක පුහුණුව සඳහා සූදානම්ය.';
    }

    if ((overall.overallAccuracy ?? 0) >= 50) {
      return 'ස්ථාවර ප්‍රගතියක්. දරුවාගේ විශ්වාසය වර්ධනය වන අතර දුර්වල ක්ෂේත්‍ර කිහිපයක ඉලක්කගත පුහුණුව තවදුරටත් අවශ්‍යය.';
    }

    return 'ආරම්භක ප්‍රගතියක්. විශේෂයෙන් දුර්වල අකුරු සහ කියවීමේ ක්‍රියාකාරකම් සඳහා මඟපෙන්වූ පුහුණුව අවශ්‍යය.';
  })();

  const displayName = firebaseProfile?.name || userId;
  const displayEmail = firebaseProfile?.email || userId;

  return (
    <motion.div
      key={userId}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-6 min-w-0"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600
                        flex items-center justify-center text-white font-black text-lg shrink-0">
          {(displayName || displayEmail || userId).charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-800">
            {displayName}
          </h2>
          <p className="text-xs text-gray-400">{displayEmail}</p>
        </div>
        <button onClick={load} className="ml-auto p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <RefreshCw size={16} className="text-gray-400" />
        </button>
      </div>

      {/* Assessment */}
      <AssessmentBadge assessment={assessment} />

      {/* Pre-test vs gameplay */}
      <PerformanceComparison assessment={assessment} overall={overall} />

      {/* Progress summary */}
      <div className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-4">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen size={16} className="text-slate-600" />
          <span className="font-bold text-slate-800 text-sm">ප්‍රගති සාරාංශය</span>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{progressSummary}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <StatCard label="ක්‍රීඩා කළ වාර" value={fmt(overall.completedSessions)} />
          <StatCard label="සමස්ත නිවැරදිභාවය" value={fmtPct(overall.overallAccuracy)} color={scoreColor(overall.overallAccuracy)} />
          <StatCard label="හොඳම ලකුණු" value={fmtPct(overall.bestScore)} color={scoreColor(overall.bestScore)} />
          <StatCard label="සාමාන්‍ය ලකුණු" value={fmtPct(overall.averageScore)} color={scoreColor(overall.averageScore)} />
        </div>
        {accuracyTrend?.length > 0 && (
          <p className="text-xs text-slate-500 mt-3">වැඩිදුර විශ්ලේෂණය සඳහා සම්පූර්ණ කළ වාර {accuracyTrend.length}ක මෑත ප්‍රවණතාව සටහන් කර ඇත.</p>
        )}
      </div>

      {/* Overall stats */}
      <div>
        <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">සමස්ත කාර්යසාධනය</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="මුළු වාර"    value={fmt(overall.totalSessions)} />
          <StatCard label="සම්පූර්ණ කළ"         value={fmt(overall.completedSessions)} />
          <StatCard label="හොඳම ලකුණු"        value={fmtPct(overall.bestScore)}     color={scoreColor(overall.bestScore)} />
          <StatCard label="නිවැරදිභාවය"          value={fmtPct(overall.overallAccuracy)} color={scoreColor(overall.overallAccuracy)} />
        </div>
      </div>

      {/* Section breakdown */}
      {sections.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">කොටස් අනුව විස්තරය</h3>
          {sections.map((sec) => (
            <SectionRow
              key={sec.sectionId}
              section={sec}
              unlocked={assessment?.unlockedSections?.includes(sec.sectionId) ?? true}
            />
          ))}
        </div>
      )}

      {/* Game breakdown */}
      {games.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">ක්‍රීඩා කාර්යසාධනය</h3>
          <GameTable games={games} />
        </div>
      )}

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">මෑත ක්‍රීඩා වාර</h3>
          <RecentSessionsTable sessions={recentSessions} />
        </div>
      )}

      {sections.length === 0 && games.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <BookOpen size={36} className="mx-auto mb-2 opacity-40" />
          <p className="font-semibold">ක්‍රීඩා වාර තවම වාර්තා වී නැත.</p>
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

  return (
    <main className="page-shell relative min-h-screen overflow-hidden" style={{ fontFamily: "'Noto Sans Sinhala', 'Nunito', Arial, sans-serif", background: 'transparent' }}>
      <DashboardModuleBackground />
      <div className="container relative z-10">
        <div
          className="card admin-card border-2 border-white/80 bg-white/[0.94] shadow-[0_24px_70px_rgba(5,55,65,0.34)] backdrop-blur-xl"
          style={{ padding: 0, overflow: 'hidden', minHeight: '80vh', display: 'flex', flexDirection: 'column' }}
        >
          <div className="px-4 sm:px-6 py-4 border-b border-white/30 bg-gradient-to-r from-sky-700 via-emerald-600 to-amber-500 flex items-center gap-3 shadow-lg">
            <BookOpen size={22} className="text-white" />
            <h1 className="text-white font-black text-base sm:text-xl leading-tight">මගේ කියවීමේ ප්‍රගතිය</h1>
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
  );
};

export default DyslexiaDashboard;
