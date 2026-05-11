/* Shared full-screen star-burst celebration shown when the user
   correctly draws a letter on the canvas.
   The keyframe animations live in dysgraphia-common.css which every
   letter page already imports, so no extra CSS import is needed here. */

const BURST_STARS = [
  { x: '-240px', y: '-210px', delay: '0s',    size: '2.8rem', emoji: '⭐' },
  { x:  '240px', y: '-210px', delay: '0.12s', size: '2.8rem', emoji: '⭐' },
  { x: '-240px', y:  '210px', delay: '0.04s', size: '2.8rem', emoji: '⭐' },
  { x:  '240px', y:  '210px', delay: '0.09s', size: '2.8rem', emoji: '⭐' },
  { x:    '0px', y: '-280px', delay: '0.03s', size: '2.4rem', emoji: '🌟' },
  { x:    '0px', y:  '280px', delay: '0.14s', size: '2.4rem', emoji: '🌟' },
  { x: '-290px', y:    '0px', delay: '0.07s', size: '2.4rem', emoji: '🌟' },
  { x:  '290px', y:    '0px', delay: '0.02s', size: '2.4rem', emoji: '🌟' },
  { x: '-160px', y: '-170px', delay: '0.05s', size: '1.8rem', emoji: '✨' },
  { x:  '160px', y: '-170px', delay: '0.13s', size: '1.8rem', emoji: '✨' },
  { x:  '160px', y:  '170px', delay: '0.10s', size: '1.8rem', emoji: '✨' },
  { x: '-160px', y:  '170px', delay: '0.16s', size: '1.8rem', emoji: '✨' },
  { x: '-340px', y:  '-80px', delay: '0.22s', size: '1.6rem', emoji: '⭐' },
  { x:  '340px', y:   '80px', delay: '0.06s', size: '1.6rem', emoji: '⭐' },
  { x:   '80px', y:  '310px', delay: '0.17s', size: '1.5rem', emoji: '🌟' },
  { x:  '-80px', y: '-310px', delay: '0.08s', size: '1.5rem', emoji: '🌟' },
];

const RAIN_STARS = [
  { left:  '4%', delay: '0.8s',  size: '1.9rem' },
  { left: '12%', delay: '1.15s', size: '1.4rem' },
  { left: '22%', delay: '0.55s', size: '2.1rem' },
  { left: '33%', delay: '1.3s',  size: '1.6rem' },
  { left: '43%', delay: '0.9s',  size: '1.5rem' },
  { left: '53%', delay: '0.7s',  size: '2rem'   },
  { left: '63%', delay: '1.2s',  size: '1.7rem' },
  { left: '73%', delay: '1.0s',  size: '1.4rem' },
  { left: '83%', delay: '0.5s',  size: '2rem'   },
  { left: '92%', delay: '1.4s',  size: '1.5rem' },
  { left: '18%', delay: '1.6s',  size: '1.3rem' },
  { left: '58%', delay: '0.35s', size: '1.8rem' },
];

const CorrectStarBurst = () => (
  <div className="fixed inset-0 z-[9998] pointer-events-none overflow-hidden" aria-hidden="true">

    {/* Expanding golden glow rings from centre */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className="rounded-full absolute"
        style={{
          width: '180px', height: '180px',
          background: 'radial-gradient(circle, rgba(255,215,0,0.55) 0%, transparent 70%)',
          animation: 'ta-glow-ring 1s ease-out 0s forwards',
        }}
      />
      <div
        className="rounded-full absolute"
        style={{
          width: '120px', height: '120px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)',
          animation: 'ta-glow-ring-2 1s ease-out 0.18s forwards',
        }}
      />
    </div>

    {/* Burst stars shooting outward from centre */}
    <div className="absolute inset-0 flex items-center justify-center">
      {BURST_STARS.map((s, i) => (
        <span
          key={i}
          className="absolute select-none"
          style={{
            fontSize: s.size,
            '--ta-tx': s.x,
            '--ta-ty': s.y,
            animation: `ta-star-shoot 1.1s cubic-bezier(0.2,0.9,0.4,1) ${s.delay} forwards`,
            filter: 'drop-shadow(0 0 8px #ffd700) drop-shadow(0 0 18px #ffaa00)',
          }}
        >
          {s.emoji}
        </span>
      ))}
    </div>

    {/* Falling star rain from top */}
    {RAIN_STARS.map((s, i) => (
      <span
        key={i}
        className="absolute select-none"
        style={{
          top: '-40px',
          left: s.left,
          fontSize: s.size,
          animation: `ta-star-rain 1.9s ease-in ${s.delay} forwards`,
          filter: 'drop-shadow(0 0 6px #ffd700)',
        }}
      >
        ⭐
      </span>
    ))}
  </div>
);

export default CorrectStarBurst;
