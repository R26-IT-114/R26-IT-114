import { useEffect, useState } from 'react';

import otterMascot from '../../../assets/images/dyscalculiaimages/dashboard-animals/otter-star-basket.png';
import { getDyscalculiaProgress } from '../utils/dyscalculiaProgress';
import '../styles/beach-star-collector.css';

const CORRECT_EVENT = 'dyscalculia:correct-answer';
const PROGRESS_EVENT = 'dyscalculia:progress-updated';

const readStars = () => Number(getDyscalculiaProgress()?.rewards?.stars) || 0;

const BeachStarCollector = () => {
  const [stars, setStars] = useState(readStars);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    let timer;
    const syncProgress = () => setStars(readStars());
    const collectStar = () => {
      setStars((value) => value + 1);
      setCelebrating(false);
      window.requestAnimationFrame(() => setCelebrating(true));
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setCelebrating(false), 900);
    };
    window.addEventListener(CORRECT_EVENT, collectStar);
    window.addEventListener(PROGRESS_EVENT, syncProgress);
    window.addEventListener('storage', syncProgress);
    window.addEventListener('focus', syncProgress);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(CORRECT_EVENT, collectStar);
      window.removeEventListener(PROGRESS_EVENT, syncProgress);
      window.removeEventListener('storage', syncProgress);
      window.removeEventListener('focus', syncProgress);
    };
  }, []);

  return (
    <aside className={`beach-star-collector ${celebrating ? 'is-collecting' : ''}`} aria-label={`එකතු කළ තරු ${stars}`} aria-live="polite">
      <span className="beach-star-collector__shine" aria-hidden="true">✨</span>
      <img src={otterMascot} alt="තරු කූඩයක් අල්ලාගෙන සිටින මුහුදු ඔටර් යාළුවා" />
      <div className="beach-star-collector__total"><span aria-hidden="true">⭐</span><strong>{stars}</strong><small>තරු</small></div>
      <div className="beach-star-collector__plus" aria-hidden="true">+1 ⭐</div>
    </aside>
  );
};

export default BeachStarCollector;
