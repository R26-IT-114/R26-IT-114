import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dysgraphiaService } from '../services/dysgraphiaService';
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
const formatMinutes = (seconds) => `${Math.max(0, Math.round(toNumber(seconds) / 60))} min`;

const getLetterPracticeItems = (items) => items
  .map((item) => ({ ...item, needsPractice: confidenceRate(item) < 0.7 || toNumber(item.wrongAttempts) >= 2 || toNumber(item.eraseCount) >= 3 }))
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
  if (bestLetter && confidenceRate(bestLetter) >= 0.8) strong.push(`Great job writing ${bestLetter.targetChar}!`);
  if (mirror.some((item) => toNumber(item.totalAttempts) > 0 && successRate(item) >= 0.8)) strong.push('You recognized mirror letters correctly!');
  if ([...twoWords, ...threeWords].some((item) => confidenceRate(item) >= 0.8)) strong.push("You're doing well with words!");
  if (lines.some((item) => item.spacingFail !== true && item.completed)) strong.push('Your spacing is improving!');
  return strong.slice(0, 4);
};

const getPracticeRecommendations = ({ letterPractice, mirrorDifficulty, twoWords, threeWords, lineIssues }) => {
  const recommendations = [];
  if (letterPractice[0]) recommendations.push({ icon: '✏️', text: `Practice ${letterPractice[0].targetChar}`, route: `/dysgraphia/letter-${LETTER_ROUTES[letterPractice[0].targetChar] || 'review'}` });
  const mirrorRecognition = mirrorDifficulty.find((item) => item.recognitionDifficulty);
  if (mirrorRecognition) recommendations.push({ icon: '🪞', text: `Find the correct ${mirrorRecognition.targetChar}`, route: '/dysgraphia/letter-review' });
  const mirrorDrawing = mirrorDifficulty.find((item) => item.drawingDifficulty);
  if (mirrorDrawing) recommendations.push({ icon: '🖍️', text: `Keep drawing ${mirrorDrawing.targetChar}`, route: '/dysgraphia/letter-review' });
  if (twoWords[0]) recommendations.push({ icon: '📝', text: `Practice ${twoWords[0].targetWord}`, route: '/dysgraphia/word-game/two-letters' });
  if (threeWords[0]) recommendations.push({ icon: '📝', text: `Practice ${threeWords[0].targetWord}`, route: '/dysgraphia/word-game/three-letters' });
  if (lineIssues.some((item) => item.issue === 'lines')) recommendations.push({ icon: '📏', text: 'Keep writing inside the lines', route: '/dysgraphia/writing-lines' });
  if (lineIssues.some((item) => item.issue === 'size')) recommendations.push({ icon: '↕️', text: 'Make letters the same size', route: '/dysgraphia/writing-lines' });
  if (lineIssues.some((item) => item.issue === 'spacing')) recommendations.push({ icon: '↔️', text: 'Leave spaces between letters', route: '/dysgraphia/writing-lines' });
  return recommendations.slice(0, 5);
};

const ProgressBar = ({ value, color = 'mint' }) => (
  <div className="dgd-bar"><span className={`dgd-bar-fill dgd-bar-${color}`} style={{ width: percent(value) }} /></div>
);

const ActionButton = ({ children, onClick }) => <button type="button" className="dgd-action" onClick={onClick}>{children}</button>;

const LetterCard = ({ item, onPractice }) => (
  <article className={`dgd-item-card ${item.needsPractice ? 'dgd-needs-practice' : ''}`}>
    <div className="dgd-item-top"><span className="dgd-big-symbol">{item.targetChar || '?'}</span><span className="dgd-pill">{item.needsPractice ? 'Practice more' : 'Doing great'}</span></div>
    <ProgressBar value={successRate(item)} color="sun" />
    <div className="dgd-metric-row"><span>{toNumber(item.correctAttempts)} correct</span><span>{Math.round(confidenceRate(item) * 100)}% confidence</span></div>
    <div className="dgd-small-copy">{toNumber(item.totalAttempts)} tries · {toNumber(item.eraseCount)} erases · {formatMinutes(item.totalTimeSeconds)}</div>
    {item.needsPractice && <ActionButton onClick={onPractice}>Practice {item.targetChar} ✏️</ActionButton>}
  </article>
);

const MirrorCard = ({ item }) => (
  <article className="dgd-item-card">
    <div className="dgd-item-top"><span className="dgd-big-symbol">{item.targetChar || '?'}</span><span className="dgd-pill dgd-pill-blue">{item.recognitionDifficulty ? 'Practice more' : 'Doing great'}</span></div>
    <div className="dgd-subskill"><div><strong>Mirror finding</strong><span>{item.recognitionDifficulty ? 'Let\'s try again 🪞' : 'Great recognition! 🌟'}</span></div><ProgressBar value={successRate(item)} color="blue" /></div>
    <div className="dgd-subskill"><div><strong>Drawing</strong><span>{item.drawingDifficulty ? 'Keep practicing ✏️' : 'Great drawing! 🎨'}</span></div><ProgressBar value={toNumber(item.drawingAttempts) ? toNumber(item.drawingCorrectAttempts) / toNumber(item.drawingAttempts) : 0} color="coral" /></div>
    <div className="dgd-small-copy">{toNumber(item.totalAttempts)} finding tries · {toNumber(item.drawingAttempts)} drawing tries</div>
  </article>
);

const WordCard = ({ item }) => (
  <article className="dgd-item-card dgd-word-card">
    <div className="dgd-item-top"><strong className="dgd-word">{item.targetWord || '?'}</strong><span className="dgd-pill">{item.needsPractice ? 'Practice more' : 'Great word'}</span></div>
    <ProgressBar value={successRate(item)} color="coral" />
    <div className="dgd-metric-row"><span>{toNumber(item.correctAttempts)} correct</span><span>{Math.round(confidenceRate(item) * 100)}% confidence</span></div>
    <div className="dgd-small-copy">{toNumber(item.totalAttempts)} tries · {formatMinutes(item.totalTimeSeconds)}</div>
  </article>
);

const Section = ({ title, icon, children, className = '' }) => <section className={`dgd-section ${className}`}><div className="dgd-section-title"><span>{icon}</span><h2>{title}</h2></div>{children}</section>;

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
    const lineIssues = getWritingLineIssues(lines);
    return {
      letters: [...letters].sort((a, b) => Number(b.needsPractice) - Number(a.needsPractice)),
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

  if (loading) return <main className="dgd-shell"><div className="dgd-state"><span>🌟</span><h1>Loading your learning journey...</h1><p>Let&apos;s see how you&apos;re growing!</p></div></main>;
  if (error) return <main className="dgd-shell"><div className="dgd-state dgd-state-error"><span>🛠️</span><h1>We couldn&apos;t find your progress</h1><p>Let&apos;s try one more time.</p><ActionButton onClick={loadOverview}>Try again</ActionButton></div></main>;

  const stats = data.stats || {};
  const recentProgress = data.recentSessions?.[0]?.itemsCompleted || stats.totalItemsCompleted || 0;

  return (
    <main className="dgd-shell">
      <header className="dgd-header"><button type="button" className="dgd-back" onClick={() => navigate('/dysgraphia')}>← Home</button><div><p className="dgd-eyebrow">Your bright learning space</p><h1>🌟 My Learning Journey</h1><p>Every try helps your brain grow stronger.</p></div><div className="dgd-header-star">⭐</div></header>

      <div className="dgd-summary-grid">
        <div className="dgd-summary-card dgd-summary-yellow"><span>⭐</span><strong>{toNumber(stats.totalStars)}</strong><small>Stars collected</small></div>
        <div className="dgd-summary-card dgd-summary-mint"><span>🎮</span><strong>{toNumber(stats.sessionsCompleted)}</strong><small>Activities completed</small></div>
        <div className="dgd-summary-card dgd-summary-blue"><span>⏱️</span><strong>{Math.round(toNumber(stats.totalMinutesSpent))}</strong><small>Learning minutes</small></div>
        <div className="dgd-summary-card dgd-summary-coral"><span>🚀</span><strong>{toNumber(recentProgress)}</strong><small>Recent progress</small></div>
      </div>

      {!mapped.hasActivities && <div className="dgd-empty-banner">Start playing some activities to see your learning journey! 🌟</div>}

      <Section title="Letters I&apos;m learning" icon="✏️"><div className="dgd-card-grid">{mapped.letters.length ? mapped.letters.map((item) => <LetterCard key={item.id} item={item} onPractice={() => navigate(`/dysgraphia/letter-${LETTER_ROUTES[item.targetChar] || 'review'}`)} />) : <p className="dgd-muted">Your letters will appear here after you play.</p>}</div></Section>

      <Section title="Mirror letters" icon="🪞"><div className="dgd-card-grid">{mapped.mirror.length ? mapped.mirror.map((item) => <MirrorCard key={item.id} item={{ ...item, recognitionDifficulty: mapped.mirrorDifficulty.some((difficulty) => difficulty.id === item.id && difficulty.recognitionDifficulty), drawingDifficulty: mapped.mirrorDifficulty.some((difficulty) => difficulty.id === item.id && difficulty.drawingDifficulty) }} />) : <p className="dgd-muted">Try the mirror-letter game to see this skill grow.</p>}</div></Section>

      <Section title="Words I can write" icon="📝"><div className="dgd-word-columns"><div><h3>Two-letter words</h3><div className="dgd-card-grid">{toItems(data.dysgraphia?.twoLetterWords).map((raw) => <WordCard key={raw.id} item={{ ...raw, needsPractice: mapped.twoWords.some((item) => item.id === raw.id) }} />)}</div></div><div><h3>Three-letter words</h3><div className="dgd-card-grid">{toItems(data.dysgraphia?.threeLetterWords).map((raw) => <WordCard key={raw.id} item={{ ...raw, needsPractice: mapped.threeWords.some((item) => item.id === raw.id) }} />)}</div></div></div></Section>

      <Section title="Writing between the lines" icon="📏"><div className="dgd-line-grid">{mapped.lines.length ? mapped.lines.map((item) => <article key={item.id} className="dgd-line-card"><div className="dgd-item-top"><strong className="dgd-word">{item.targetWord || '?'}</strong><span className="dgd-pill">{item.completed ? 'Great job' : 'Keep going'}</span></div><div className="dgd-skill-list"><span className={item.hardLinesFail === true || toNumber(item.outOfLinesPct) > 25 ? 'is-needs-work' : 'is-good'}>📏 Staying inside the lines</span><span className={item.sizeFail === true ? 'is-needs-work' : 'is-good'}>↕️ Letter size</span><span className={item.spacingFail === true ? 'is-needs-work' : 'is-good'}>↔️ Letter spacing</span><span className={item.completed ? 'is-good' : 'is-needs-work'}>🔎 Word recognition</span></div></article>) : <p className="dgd-muted">Writing-line practice will appear here after you play.</p>}</div></Section>

      <div className="dgd-two-column"><Section title="Things to Practice More" icon="🌱" className="dgd-list-section">{mapped.recommendations.length ? <div className="dgd-recommendations">{mapped.recommendations.map((item) => <div className="dgd-recommendation" key={`${item.icon}-${item.text}`}><span>{item.icon}</span><strong>{item.text}</strong><ActionButton onClick={() => navigate(item.route)}>Start</ActionButton></div>)}</div> : <p className="dgd-muted">You&apos;re doing wonderfully. Keep exploring! 🌈</p>}</Section><Section title="Things I&apos;m Doing Well" icon="🌈" className="dgd-list-section">{mapped.strong.length ? <div className="dgd-strong-list">{mapped.strong.map((item) => <p key={item}>🌟 {item}</p>)}</div> : <p className="dgd-muted">Your wins will sparkle here as you practice.</p>}</Section></div>

      <Section title="Today&apos;s Practice" icon="🎯" className="dgd-today"><div className="dgd-today-list">{(mapped.recommendations.length ? mapped.recommendations.slice(0, 3) : [{ icon: '🎮', text: 'Play an activity', route: '/dysgraphia/letter-review' }]).map((item, index) => <div className="dgd-today-item" key={`${item.text}-${index}`}><span className="dgd-number">{index + 1}</span><span>{item.icon} {item.text}</span><ActionButton onClick={() => navigate(item.route)}>Practice</ActionButton></div>)}</div></Section>

      <div className="dgd-footer-actions"><ActionButton onClick={() => navigate('/dysgraphia')}>Choose an activity</ActionButton><ActionButton onClick={loadOverview}>Refresh progress</ActionButton></div>
    </main>
  );
};

export default DysgraphiaProgressDashboard;
