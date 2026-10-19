import { useEffect, useRef, useState } from 'react';

import otterMascot from '../../../assets/images/dyscalculiaimages/dashboard-animals/otter-star-basket.png';
import starImage from '../../../assets/images/dysgraphia/star.png';
import { getDyscalculiaProgress } from '../utils/dyscalculiaProgress';
import '../styles/beach-star-collector.css';

const STARS_AWARDED_EVENT = 'dyscalculia:stars-awarded';
const PROGRESS_EVENT = 'dyscalculia:progress-updated';

const readStars = () => Number(getDyscalculiaProgress()?.rewards?.stars) || 0;

const BeachStarCollector = () => {
  const [stars, setStars] = useState(readStars);
  const [celebrating, setCelebrating] = useState(false);
  const [flyingStars, setFlyingStars] = useState([]);
  const [awardAmount, setAwardAmount] = useState(1);
  const flightIdRef = useRef(0);
  const flightTimersRef = useRef(new Set());

  useEffect(() => {
    let timer;
    const flightTimers = flightTimersRef.current;
    const syncProgress = () => setStars(readStars());
    const collectStar = (event) => {
      const requestedAmount = Number(event.detail?.amount);
      const amount = Number.isInteger(requestedAmount) && requestedAmount > 0
        ? requestedAmount
        : 1;
      const targetTotal = Number(event.detail?.targetTotal);
      const hasTargetTotal = event.detail?.targetTotal != null && Number.isFinite(targetTotal);
      const width = window.innerWidth;
      const height = window.innerHeight;
      const endX = Math.round(width <= 1199 ? width / 2 + 60 : width - 112);
      const endY = Math.round(width <= 480 ? 34 : width <= 1199 ? 48 : height * 0.31);
      const newStars = Array.from({ length: amount }, () => {
        const id = flightIdRef.current + 1;
        flightIdRef.current = id;
        const startX = Math.round(width * (0.38 + Math.random() * 0.24));
        const startY = Math.round(height * (0.42 + Math.random() * 0.2));

        return {
          id,
          startX,
          startY,
          travelX: endX - startX,
          travelY: endY - startY,
        };
      });

      setAwardAmount(amount);
      setStars((value) => hasTargetTotal ? targetTotal : value + amount);
      setFlyingStars((items) => [...items, ...newStars]);
      setCelebrating(false);
      window.requestAnimationFrame(() => setCelebrating(true));
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setCelebrating(false), 900);
      newStars.forEach(({ id }) => {
        const flightTimer = window.setTimeout(() => {
          setFlyingStars((items) => items.filter((star) => star.id !== id));
          flightTimers.delete(flightTimer);
        }, 950);
        flightTimers.add(flightTimer);
      });
    };
    window.addEventListener(STARS_AWARDED_EVENT, collectStar);
    window.addEventListener(PROGRESS_EVENT, syncProgress);
    window.addEventListener('storage', syncProgress);
    window.addEventListener('focus', syncProgress);
    return () => {
      window.clearTimeout(timer);
      flightTimers.forEach((flightTimer) => window.clearTimeout(flightTimer));
      flightTimers.clear();
      window.removeEventListener(STARS_AWARDED_EVENT, collectStar);
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
    ><img src={starImage} alt="" /></span>)}
    <aside className={`beach-star-collector ${celebrating ? 'is-collecting' : ''}`} aria-label={`එකතු කළ තරු ${stars}`} aria-live="polite">
      <span className="beach-star-collector__shine" aria-hidden="true">✨</span>
      <img src={otterMascot} alt="තරු කූඩයක් අල්ලාගෙන සිටින මුහුදු ඔටර් යාළුවා" />
      <span className="beach-star-collector__divider" aria-hidden="true" />
      <div className="beach-star-collector__total"><span aria-hidden="true">⭐</span><strong>{stars}</strong><small>තරු</small></div>
      <div className="beach-star-collector__plus" aria-hidden="true">+{awardAmount}</div>
    </aside>
  </>;
};

export default BeachStarCollector;
