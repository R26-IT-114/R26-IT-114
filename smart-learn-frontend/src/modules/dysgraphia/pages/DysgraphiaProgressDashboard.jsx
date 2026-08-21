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
const formatMinutes = (seconds) => `${Math.max(0, Math.round(toNumber(seconds) / 60))} මිනි.`;

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
  if (bestLetter && confidenceRate(bestLetter) >= 0.8) strong.push(`${bestLetter.targetChar} ලියන එක සුපිරියි!`);
  if (mirror.some((item) => toNumber(item.totalAttempts) > 0 && successRate(item) >= 0.8)) strong.push('ඔබ කැඩපත් අකුරු හරියටම හඳුනාගත්තා!');
  if ([...twoWords, ...threeWords].some((item) => confidenceRate(item) >= 0.8)) strong.push('ඔබ වචන එක්ක නියමයට වැඩ කරනවා!');
  if (lines.some((item) => item.spacingFail !== true && item.completed)) strong.push('ඔබේ පරතරය දියුණු වෙනවා!');
  return strong.slice(0, 4);
};

const getPracticeRecommendations = ({ letterPractice, mirrorDifficulty, twoWords, threeWords, lineIssues }) => {
  const recommendations = [];
  if (letterPractice[0]) recommendations.push({ icon: '✏️', text: `${letterPractice[0].targetChar} පුහුණු කරමු`, route: `/dysgraphia/letter-${LETTER_ROUTES[letterPractice[0].targetChar] || 'review'}` });
  const mirrorRecognition = mirrorDifficulty.find((item) => item.recognitionDifficulty);
  if (mirrorRecognition) recommendations.push({ icon: '🪞', text: `හරි ${mirrorRecognition.targetChar} එක හොයමු`, route: '/dysgraphia/letter-review' });
  const mirrorDrawing = mirrorDifficulty.find((item) => item.drawingDifficulty);
  if (mirrorDrawing) recommendations.push({ icon: '🖍️', text: `${mirrorDrawing.targetChar} අඳිමින් ඉන්න`, route: '/dysgraphia/letter-review' });
  if (twoWords[0]) recommendations.push({ icon: '📝', text: `${twoWords[0].targetWord} පුහුණු කරමු`, route: '/dysgraphia/word-game/two-letters' });
  if (threeWords[0]) recommendations.push({ icon: '📝', text: `${threeWords[0].targetWord} පුහුණු කරමු`, route: '/dysgraphia/word-game/three-letters' });
  if (lineIssues.some((item) => item.issue === 'lines')) recommendations.push({ icon: '📏', text: 'රේඛා ඇතුලේ ලියමින් ඉන්න', route: '/dysgraphia/writing-lines' });
  if (lineIssues.some((item) => item.issue === 'size')) recommendations.push({ icon: '↕️', text: 'අකුරු එකම ප්‍රමාණයට ලියන්න', route: '/dysgraphia/writing-lines' });
  if (lineIssues.some((item) => item.issue === 'spacing')) recommendations.push({ icon: '↔️', text: 'අකුරු අතර පරතර තියන්න', route: '/dysgraphia/writing-lines' });
  return recommendations.slice(0, 5);
};

const ProgressBar = ({ value, color = 'mint' }) => (
  <div className="dgd-bar"><span className={`dgd-bar-fill dgd-bar-${color}`} style={{ width: percent(value) }} /></div>
);

const ActionButton = ({ children, onClick }) => <button type="button" className="dgd-action" onClick={onClick}>{children}</button>;

const LetterCard = ({ item, onPractice }) => (
  <article className={`dgd-item-card ${item.needsPractice ? 'dgd-needs-practice' : ''}`}>
    <div className="dgd-item-top"><span className="dgd-big-symbol">{item.targetChar || '?'}</span><span className="dgd-pill">{item.needsPractice ? 'තව පුහුණු වෙන්න' : 'සුපිරි වැඩක්!'}</span></div>
    <ProgressBar value={successRate(item)} color="sun" />
    <div className="dgd-metric-row"><span>හරි {toNumber(item.correctAttempts)}</span><span>විශ්වාසය {Math.round(confidenceRate(item) * 100)}%</span></div>
    <div className="dgd-small-copy">උත්සාහ {toNumber(item.totalAttempts)} · මකපු වාර {toNumber(item.eraseCount)} · {formatMinutes(item.totalTimeSeconds)}</div>
    {item.needsPractice && <ActionButton onClick={onPractice}>{item.targetChar} පුහුණු කරමු ✏️</ActionButton>}
  </article>
);

const MirrorCard = ({ item }) => (
  <article className="dgd-item-card">
    <div className="dgd-item-top"><span className="dgd-big-symbol">{item.targetChar || '?'}</span><span className="dgd-pill dgd-pill-blue">{item.recognitionDifficulty ? 'තව පුහුණු වෙන්න' : 'සුපිරි වැඩක්!'}</span></div>
    <div className="dgd-subskill"><div><strong>කැඩපත් හොයාගැනීම</strong><span>{item.recognitionDifficulty ? 'ආයෙත් උත්සාහ කරමු 🪞' : 'සුපිරි හඳුනාගැනීමක්! 🌟'}</span></div><ProgressBar value={successRate(item)} color="blue" /></div>
    <div className="dgd-subskill"><div><strong>අඳින එක</strong><span>{item.drawingDifficulty ? 'දිගටම පුහුණු වෙන්න ✏️' : 'සුපිරි චිත්‍රයක්! 🎨'}</span></div><ProgressBar value={toNumber(item.drawingAttempts) ? toNumber(item.drawingCorrectAttempts) / toNumber(item.drawingAttempts) : 0} color="coral" /></div>
    <div className="dgd-small-copy">හොයන උත්සාහ {toNumber(item.totalAttempts)} · අඳින උත්සාහ {toNumber(item.drawingAttempts)}</div>
  </article>
);

const WordCard = ({ item }) => (
  <article className="dgd-item-card dgd-word-card">
    <div className="dgd-item-top"><strong className="dgd-word">{item.targetWord || '?'}</strong><span className="dgd-pill">{item.needsPractice ? 'තව පුහුණු වෙන්න' : 'සුපිරි වචනයක්!'}</span></div>
    <ProgressBar value={successRate(item)} color="coral" />
    <div className="dgd-metric-row"><span>හරි {toNumber(item.correctAttempts)}</span><span>විශ්වාසය {Math.round(confidenceRate(item) * 100)}%</span></div>
    <div className="dgd-small-copy">උත්සාහ {toNumber(item.totalAttempts)} · {formatMinutes(item.totalTimeSeconds)}</div>
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

  if (loading) return <main className="dgd-shell"><div className="dgd-state"><span>🌟</span><h1>ඔබේ ඉගෙනුම් ගමන පූරණය වෙමින්...</h1><p>අපි බලමු ඔබ කොහොම වැඩෙනවද කියලා!</p></div></main>;
  if (error) return <main className="dgd-shell"><div className="dgd-state dgd-state-error"><span>🛠️</span><h1>අපිට ඔබේ දියුණුව හොයාගන්න බැරි උනා</h1><p>අපි ආයෙත් උත්සාහ කරමු.</p><ActionButton onClick={loadOverview}>ආයෙත් උත්සාහ කරන්න</ActionButton></div></main>;

  const stats = data.stats || {};
  const recentProgress = data.recentSessions?.[0]?.itemsCompleted || stats.totalItemsCompleted || 0;

  return (
    <main className="dgd-shell">
      <header className="dgd-header"><button type="button" className="dgd-back" onClick={() => navigate('/dysgraphia')}>← ආපහු</button><div><p className="dgd-eyebrow">ඔබේ දීප්තිමත් ඉගෙනුම් ලෝකය</p><h1>🌟 මගේ ඉගෙනුම් ගමන</h1><p>සෑම උත්සාහයක්ම ඔබේ මොළය ශක්තිමත් කරයි.</p></div><div className="dgd-header-star">⭐</div></header>

      <div className="dgd-summary-grid">
        <div className="dgd-summary-card dgd-summary-yellow"><span>⭐</span><strong>{toNumber(stats.totalStars)}</strong><small>රැස් කළ තරු</small></div>
        <div className="dgd-summary-card dgd-summary-mint"><span>🎮</span><strong>{toNumber(stats.sessionsCompleted)}</strong><small>නිම කළ ක්‍රියාකාරකම්</small></div>
        <div className="dgd-summary-card dgd-summary-blue"><span>⏱️</span><strong>{Math.round(toNumber(stats.totalMinutesSpent))}</strong><small>ඉගෙනුම් මිනිත්තු</small></div>
        <div className="dgd-summary-card dgd-summary-coral"><span>🚀</span><strong>{toNumber(recentProgress)}</strong><small>අලුත්ම දියුණුව</small></div>
      </div>

      {!mapped.hasActivities && <div className="dgd-empty-banner">ඔබේ ඉගෙනුම් ගමන බලන්න ක්‍රියාකාරකම් ටිකක් සෙල්ලම් කරන්න! 🌟</div>}

      <Section title="මං ඉගෙන ගන්න අකුරු" icon="✏️"><div className="dgd-card-grid">{mapped.letters.length ? mapped.letters.map((item) => <LetterCard key={item.id} item={item} onPractice={() => navigate(`/dysgraphia/letter-${LETTER_ROUTES[item.targetChar] || 'review'}`)} />) : <p className="dgd-muted">ඔබ සෙල්ලම් කළාට පස්සේ ඔබේ අකුරු මෙතන පේනවා.</p>}</div></Section>

      <Section title="කැඩපත් අකුරු" icon="🪞"><div className="dgd-card-grid">{mapped.mirror.length ? mapped.mirror.map((item) => <MirrorCard key={item.id} item={{ ...item, recognitionDifficulty: mapped.mirrorDifficulty.some((difficulty) => difficulty.id === item.id && difficulty.recognitionDifficulty), drawingDifficulty: mapped.mirrorDifficulty.some((difficulty) => difficulty.id === item.id && difficulty.drawingDifficulty) }} />) : <p className="dgd-muted">මේ දක්ෂතාව වැඩෙනවා බලන්න කැඩපත් අකුරු සෙල්ලම සෙල්ලම් කරන්න.</p>}</div></Section>

      <Section title="මට ලියන්න පුළුවන් වචන" icon="📝"><div className="dgd-word-columns"><div><h3>අකුරු දෙකේ වචන</h3><div className="dgd-card-grid">{toItems(data.dysgraphia?.twoLetterWords).map((raw) => <WordCard key={raw.id} item={{ ...raw, needsPractice: mapped.twoWords.some((item) => item.id === raw.id) }} />)}</div></div><div><h3>අකුරු තුනේ වචන</h3><div className="dgd-card-grid">{toItems(data.dysgraphia?.threeLetterWords).map((raw) => <WordCard key={raw.id} item={{ ...raw, needsPractice: mapped.threeWords.some((item) => item.id === raw.id) }} />)}</div></div></div></Section>

      <Section title="රේඛා අතරේ ලිවීම" icon="📏"><div className="dgd-line-grid">{mapped.lines.length ? mapped.lines.map((item) => <article key={item.id} className="dgd-line-card"><div className="dgd-item-top"><strong className="dgd-word">{item.targetWord || '?'}</strong><span className="dgd-pill">{item.completed ? 'සුපිරි වැඩක්!' : 'දිගටම කරගෙන යන්න'}</span></div><div className="dgd-skill-list"><span className={item.hardLinesFail === true || toNumber(item.outOfLinesPct) > 25 ? 'is-needs-work' : 'is-good'}>📏 රේඛා ඇතුලේ ඉන්න එක</span><span className={item.sizeFail === true ? 'is-needs-work' : 'is-good'}>↕️ අකුරේ ප්‍රමාණය</span><span className={item.spacingFail === true ? 'is-needs-work' : 'is-good'}>↔️ අකුරු අතර පරතරය</span><span className={item.completed ? 'is-good' : 'is-needs-work'}>🔎 වචනය හඳුනාගැනීම</span></div></article>) : <p className="dgd-muted">ඔබ සෙල්ලම් කළාට පස්සේ රේඛා ලිවීමේ පුහුණුව මෙතන පේනවා.</p>}</div></Section>

      <div className="dgd-two-column"><Section title="තව පුහුණු වෙන්න ඕන දේවල්" icon="🌱" className="dgd-list-section">{mapped.recommendations.length ? <div className="dgd-recommendations">{mapped.recommendations.map((item) => <div className="dgd-recommendation" key={`${item.icon}-${item.text}`}><span>{item.icon}</span><strong>{item.text}</strong><ActionButton onClick={() => navigate(item.route)}>පටන් ගමු</ActionButton></div>)}</div> : <p className="dgd-muted">ඔබ නියමයට කරනවා. දිගටම ඉගෙන ගන්න! 🌈</p>}</Section><Section title="මම හොඳට කරන දේවල්" icon="🌈" className="dgd-list-section">{mapped.strong.length ? <div className="dgd-strong-list">{mapped.strong.map((item) => <p key={item}>🌟 {item}</p>)}</div> : <p className="dgd-muted">ඔබ පුහුණු වෙනකොට ඔබේ ජයග්‍රහණ මෙතන දිලිසෙනවා.</p>}</Section></div>

      <Section title="අද දින පුහුණුව" icon="🎯" className="dgd-today"><div className="dgd-today-list">{(mapped.recommendations.length ? mapped.recommendations.slice(0, 3) : [{ icon: '🎮', text: 'ක්‍රියාකාරකමක් සෙල්ලම් කරන්න', route: '/dysgraphia/letter-review' }]).map((item, index) => <div className="dgd-today-item" key={`${item.text}-${index}`}><span className="dgd-number">{index + 1}</span><span>{item.icon} {item.text}</span><ActionButton onClick={() => navigate(item.route)}>පුහුණු කරමු</ActionButton></div>)}</div></Section>

      <div className="dgd-footer-actions"><ActionButton onClick={() => navigate('/dysgraphia')}>ක්‍රියාකාරකමක් තෝරන්න</ActionButton><ActionButton onClick={loadOverview}>දියුණුව අලුත් කරන්න</ActionButton></div>
    </main>
  );
};

export default DysgraphiaProgressDashboard;