import { useEffect, useState } from 'react';
import '../styles/dyscalculia-reward-burst.css';

const EVENT_NAME = 'dyscalculia:correct-answer';
const STARS = Array.from({ length: 24 }, (_, index) => ({
  angle: (360 / 24) * index,
  distance: 120 + (index % 4) * 52,
  delay: (index % 6) * 0.025,
  size: 22 + (index % 4) * 8,
  icon: index % 3 === 0 ? '🌟' : index % 3 === 1 ? '⭐' : '✨',
}));

export const triggerDyscalculiaReward = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENT_NAME));
};

const DyscalculiaRewardBurst = () => {
  const [burstKey, setBurstKey] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timeout;
    const show = () => {
      clearTimeout(timeout);
      setBurstKey((value) => value + 1);
      setVisible(true);
      timeout = setTimeout(() => setVisible(false), 1500);
    };
    window.addEventListener(EVENT_NAME, show);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener(EVENT_NAME, show);
    };
  }, []);

  if (!visible) return null;
  return <div key={burstKey} className='dc-reward-burst' aria-hidden='true'><div className='dc-reward-glow' />{STARS.map((star, index) => <span key={index} style={{ '--angle': `${star.angle}deg`, '--distance': `${star.distance}px`, '--delay': `${star.delay}s`, '--size': `${star.size}px` }}>{star.icon}</span>)}<strong>හොඳයි!</strong></div>;
};

export default DyscalculiaRewardBurst;
