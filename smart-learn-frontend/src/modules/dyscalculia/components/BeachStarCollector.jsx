import { useEffect, useRef, useState } from 'react';

import otterMascot from '../../../assets/images/dyscalculiaimages/dashboard-animals/otter-star-basket.png';
import { getDyscalculiaProgress } from '../utils/dyscalculiaProgress';
import '../styles/beach-star-collector.css';

const CORRECT_EVENT = 'dyscalculia:correct-answer';
const PROGRESS_EVENT = 'dyscalculia:progress-updated';

const readStars = () => Number(getDyscalculiaProgress()?.rewards?.stars) || 0;

const BeachStarCollector = () => {
  const [stars, setStars] = useState(readStars);
  const [celebrating, setCelebrating] = useState(false);
  const [flyingStars, setFlyingStars] = useState([]);
  const flightIdRef = useRef(0);
  const flightTimersRef = useRef(new Set());

  useEffect(() => {
    let timer;
    const flightTimers = flightTimersRef.current;
    const syncProgress = () => setStars(readStars());
    const collectStar = () => {
      const id = flightIdRef.current + 1;
      flightIdRef.current = id;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const startX = Math.round(width * (0.38 + Math.random() * 0.24));
      const startY = Math.round(height * (0.42 + Math.random() * 0.2));
      const endX = Math.round(width - (width <= 480 ? 54 : width <= 1199 ? 88 : 112));
      const endY = Math.round(width <= 1199 ? 92 : height * 0.31);

      setStars((value) => value + 1);
      setFlyingStars((items) => [...items, {
        id,
        startX,
        startY,
        travelX: endX - startX,
        travelY: endY - startY,
      }]);
      setCelebrating(false);
      window.requestAnimationFrame(() => setCelebrating(true));
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setCelebrating(false), 900);
      const flightTimer = window.setTimeout(() => {
        setFlyingStars((items) => items.filter((star) => star.id !== id));
        flightTimers.delete(flightTimer);
      }, 950);
      flightTimers.add(flightTimer);
    };
    window.addEventListener(CORRECT_EVENT, collectStar);
    window.addEventListener(PROGRESS_EVENT, syncProgress);
    window.addEventListener('storage', syncProgress);
    window.addEventListener('focus', syncProgress);
    return () => {
      window.clearTimeout(timer);
      flightTimers.forEach((flightTimer) => window.clearTimeout(flightTimer));
      flightTimers.clear();
      window.removeEventListener(CORRECT_EVENT, collectStar);
      window.removeEventListener(PROGRESS_EVENT, syncProgress);
      window.removeEventListener('storage', syncProgress);
      window.removeEventListener('focus', syncProgress);
    };
  }, []);

  return <>
    {flyingStars.map((star) => <span
      key={star.id}
      className="beach-star-collector__flight"
      style={{
        '--start-x': `${star.startX}px`,
        '--start-y': `${star.startY}px`,
        '--travel-x': `${star.travelX}px`,
        '--travel-y': `${star.travelY}px`,
      }}
      aria-hidden="true"
    >⭐</span>)}
    <aside className={`beach-star-collector ${celebrating ? 'is-collecting' : ''}`} aria-label={`එකතු කළ තරු ${stars}`} aria-live="polite">
      <span className="beach-star-collector__shine" aria-hidden="true">✨</span>
      <img src={otterMascot} alt="තරු කූඩයක් අල්ලාගෙන සිටින මුහුදු ඔටර් යාළුවා" />
      <div className="beach-star-collector__total"><span aria-hidden="true">⭐</span><strong>{stars}</strong><small>තරු</small></div>
      <div className="beach-star-collector__plus" aria-hidden="true">+1 ⭐</div>
    </aside>
  </>;
};

export default BeachStarCollector;
