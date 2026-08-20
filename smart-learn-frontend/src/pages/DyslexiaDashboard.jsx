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
      {prefix}{rounded}% change
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
          <div className="text-sm font-bold text-gray-800 mt-1">From pre-test to gameplay</div>
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
          <span>{section.sessionsPlayed} sessions</span>
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
              <span>Metric</span><span>Value</span><span></span><span></span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Sessions played</span><span className="font-bold">{fmt(section.sessionsPlayed)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Games played</span><span className="font-bold">{section.gamesPlayed}/{section.totalGames}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Best score</span><span className="font-bold">{fmtPct(section.bestScore)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Avg score</span><span className="font-bold">{fmtPct(section.avgScore)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Accuracy</span><span className="font-bold">{fmtPct(section.accuracy)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Last played</span><span className="font-bold">{fmtDate(section.lastPlayedAt)}</span></div>
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
          <th className="text-left px-4 py-2 font-semibold">Game</th>
          <th className="text-center px-3 py-2 font-semibold">Sessions</th>
          <th className="text-center px-3 py-2 font-semibold">Best</th>
          <th className="text-center px-3 py-2 font-semibold">Avg</th>
          <th className="text-center px-3 py-2 font-semibold">Accuracy</th>
          <th className="text-left px-3 py-2 font-semibold">Last Played</th>
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
          <th className="text-left px-4 py-2 font-semibold">Game</th>
          <th className="text-center px-3 py-2 font-semibold">Status</th>
          <th className="text-center px-3 py-2 font-semibold">Score</th>
          <th className="text-center px-3 py-2 font-semibold">Correct</th>
          <th className="text-center px-3 py-2 font-semibold">Duration</th>
          <th className="text-left px-3 py-2 font-semibold">Date</th>
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
              }`}>{s.status}</span>
            </td>
            <td className="px-3 py-2 text-center"><ScorePill value={s.score} max={100} /></td>
            <td className="px-3 py-2 text-center text-gray-600">
              {s.totalQuestions > 0 ? `${s.correctAnswers}/${s.totalQuestions}` : '—'}
            </td>
            <td className="px-3 py-2 text-center text-gray-500 text-xs">
              {s.durationSeconds ? `${s.durationSeconds}s` : '—'}
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
        <span className="text-amber-700 font-semibold text-sm">Pre-assessment not completed yet</span>
      </div>
    );
  }

  const { scores, unlockedSections, attemptCount, completedAt, recommendedLevel, weakLetters, assessment: placement } = assessment;
  const placementScores = placement?.scores || null;
  return (
    <div className="rounded-2xl bg-green-50 border border-green-200 px-4 py-3 space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Target size={16} className="text-green-600" />
        <span className="font-bold text-green-800 text-sm">Pre-Assessment Complete</span>
        <span className="ml-auto text-xs text-gray-400">{fmtDate(completedAt)} · Attempt #{attemptCount}</span>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center">
          <div className="text-xl font-black" style={{ color: scoreColor(scores.letters, 3) }}>{scores.letters}/3</div>
          <div className="text-xs text-gray-500">Letters</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-black" style={{ color: scoreColor(scores.twoLetter, 2) }}>{scores.twoLetter}/2</div>
          <div className="text-xs text-gray-500">2-Letter</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-black" style={{ color: scoreColor(scores.threeLetter, 2) }}>{scores.threeLetter}/2</div>
          <div className="text-xs text-gray-500">3-Letter</div>
        </div>
      </div>
      <div className="rounded-xl bg-white border border-green-100 p-3">
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="text-sm font-bold text-green-900">Recommended level</span>
          <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 font-black text-sm">Level {recommendedLevel ?? 1}</span>
        </div>
        <p className="text-xs text-gray-500 mb-2">Weak letters are repeated mistakes that can be used for focused practice.</p>
        <div className="flex flex-wrap gap-1">
          {(weakLetters || []).length > 0
            ? weakLetters.map((letter) => (
                <span key={letter} className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">{letter}</span>
              ))
            : <span className="text-xs text-gray-400">No weak letters recorded yet.</span>}
        </div>
      </div>
      {placementScores && (
        <div className="rounded-xl bg-white border border-green-100 p-3">
          <div className="text-sm font-bold text-green-900 mb-2">Placement details</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between"><span className="text-gray-500">Letter recognition</span><span className="font-bold">{placementScores.letterRecognition ?? 0}%</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Letter-sound</span><span className="font-bold">{placementScores.letterSound ?? 0}%</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Two-letter reading</span><span className="font-bold">{placementScores.twoLetterReading ?? 0}%</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Three-letter reading</span><span className="font-bold">{placementScores.threeLetterReading ?? 0}%</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Pronunciation</span><span className="font-bold">{placementScores.pronunciation ?? 0}%</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Overall</span><span className="font-bold">{placementScores.overall ?? 0}%</span></div>
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
          <span className="font-bold text-slate-800 text-sm">Performance Comparison</span>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          No pre-test or game results are available yet for this child.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Target size={16} className="text-slate-600" />
        <span className="font-bold text-slate-800 text-sm">Performance Comparison</span>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <ComparisonCard
          title="Overall skill level"
          preValue={preOverall}
          postValue={gameOverall}
          preLabel="Pre-test overall"
          postLabel="After games accuracy"
        />
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">Learning impact</div>
          <div className="text-sm font-bold text-gray-800 mt-1 mb-4">What the dashboard is showing</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
              <div className="text-xs text-gray-500 mb-1">Sessions completed</div>
              <div className="text-2xl font-black text-gray-900">{completedSessions}</div>
            </div>
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
              <div className="text-xs text-gray-500 mb-1">Sections unlocked</div>
              <div className="text-2xl font-black text-gray-900">{sectionsUnlocked}</div>
            </div>
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
              <div className="text-xs text-gray-500 mb-1">Best game score</div>
              <div className="text-2xl font-black text-gray-900">{bestScore ?? '—'}%</div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 leading-relaxed">
            This compares the placement assessment with the child&apos;s live gameplay results so you can see whether their in-game performance is trending up.
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
        setError('Failed to load dashboard data.');
        logTelemetryError('dyslexia-dashboard-user', err, { userId });
      })
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-64 text-gray-400">
        <RefreshCw size={24} className="animate-spin mr-2" /> Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6">
        <p className="text-red-600 font-semibold mb-3">{error}</p>
        <button onClick={load} className="btn-secondary text-sm">Retry</button>
      </div>
    );
  }

  if (!data) return null;

  const { assessment, overall, sections, games, recentSessions, accuracyTrend } = data;

  const progressSummary = (() => {
    if ((overall.completedSessions ?? 0) === 0) {
      return 'No game sessions yet. Once the child starts playing, the dashboard will show a learning summary here.';
    }

    if ((overall.overallAccuracy ?? 0) >= 80) {
      return 'Strong progress. The child is performing well across the learning games and is ready for more challenging practice.';
    }

    if ((overall.overallAccuracy ?? 0) >= 50) {
      return 'Steady progress. The child is building confidence and still needs targeted practice in a few weaker areas.';
    }

    return 'Early progress. The child needs guided practice, especially on the weaker letters and reading activities.';
  })();

  const displayName = firebaseProfile?.name || userId;
  const displayEmail = firebaseProfile?.email || userId;

  return (
    <motion.div
      key={userId}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 overflow-y-auto p-6 space-y-6"
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
          <span className="font-bold text-slate-800 text-sm">Progress Summary</span>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{progressSummary}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <StatCard label="Games played" value={fmt(overall.completedSessions)} />
          <StatCard label="Overall accuracy" value={fmtPct(overall.overallAccuracy)} color={scoreColor(overall.overallAccuracy)} />
          <StatCard label="Best score" value={fmtPct(overall.bestScore)} color={scoreColor(overall.bestScore)} />
          <StatCard label="Average score" value={fmtPct(overall.averageScore)} color={scoreColor(overall.averageScore)} />
        </div>
        {accuracyTrend?.length > 0 && (
          <p className="text-xs text-slate-500 mt-3">Recent trend captured from {accuracyTrend.length} finished sessions for follow-up analysis.</p>
        )}
      </div>

      {/* Overall stats */}
      <div>
        <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">Overall Performance</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total Sessions"    value={fmt(overall.totalSessions)} />
          <StatCard label="Completed"         value={fmt(overall.completedSessions)} />
          <StatCard label="Best Score"        value={fmtPct(overall.bestScore)}     color={scoreColor(overall.bestScore)} />
          <StatCard label="Accuracy"          value={fmtPct(overall.overallAccuracy)} color={scoreColor(overall.overallAccuracy)} />
        </div>
      </div>

      {/* Section breakdown */}
      {sections.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">Section Breakdown</h3>
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
          <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">Game Performance</h3>
          <GameTable games={games} />
        </div>
      )}

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">Recent Sessions</h3>
          <RecentSessionsTable sessions={recentSessions} />
        </div>
      )}

      {sections.length === 0 && games.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <BookOpen size={36} className="mx-auto mb-2 opacity-40" />
          <p className="font-semibold">No game sessions recorded yet.</p>
        </div>
      )}
    </motion.div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const DyslexiaDashboard = () => {
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
    <main className="page-shell" style={{ fontFamily: 'Poppins, Arial, sans-serif' }}>
      <div className="container">
        <div className="card admin-card" style={{ padding: 0, overflow: 'hidden', minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
          {/* Header bar */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-700 to-emerald-600 flex items-center gap-3">
            <BookOpen size={22} className="text-white" />
            <h1 className="text-white font-black text-xl">Dyslexia Performance Dashboard</h1>
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

          <div className="flex flex-1 overflow-hidden">
            {/* ── Left: user list ── */}
            <aside className="w-72 shrink-0 border-r border-gray-100 flex flex-col bg-gray-50">
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
                        ? 'bg-green-50 border-l-4 border-l-green-500'
                        : 'hover:bg-white border-l-4 border-l-transparent'
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

export default DyslexiaDashboard;
