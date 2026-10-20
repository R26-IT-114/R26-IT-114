import useGameInstructions from '../hooks/useGameInstructions';
import { createGameAudio } from '../utils/gameAudio';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Play, Shell, Star } from 'lucide-react';
import DyscalculiaBackButton from '../components/DyscalculiaBackButton';
import '../styles/dyscalculia-home.css';
import leftBackgroundAnimals from '../../../assets/images/dyscalculiaimages/home-background-animals/left-animal-group.webp';
import rightBackgroundAnimals from '../../../assets/images/dyscalculiaimages/home-background-animals/right-animal-group.webp';
import gamesIntroAudio from '../../../assets/voice/dyscalculia-games-intro.wav';
import { getAllGameStarProgress, getDyscalculiaProgress } from '../utils/dyscalculiaProgress';

// Remember the welcome narration for this session, with a storage fallback.
const INTRO_PLAYED_SESSION_KEY = 'smartlearn:dyscalculia-home:intro-played';
let introPlayedInThisSession = false;

const hasIntroPlayedThisSession = () => {
  if (introPlayedInThisSession) return true;

  try {
    return sessionStorage.getItem(INTRO_PLAYED_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
};

const markIntroPlayedThisSession = () => {
  introPlayedInThisSession = true;
  try {
    sessionStorage.setItem(INTRO_PLAYED_SESSION_KEY, 'true');
  } catch {
    // The in-memory flag is enough for this application session.
  }
};

const DyscalculiaHome = () => {
  const [progress, setProgress] = useState(getDyscalculiaProgress);
  const introAudioRef = useRef(null);
  const pendingInteractionRef = useRef(null);

  // Welcome audio: autoplay once, retry after interaction, and clean up on exit.
  useEffect(() => {
    const audio = createGameAudio(gamesIntroAudio);
    audio.preload = 'auto';
    introAudioRef.current = audio;
    let autoplayTimer = null;

    const playAfterInteraction = () => {
      pendingInteractionRef.current = null;
      audio.play().then(markIntroPlayedThisSession).catch(() => {});
    };

    if (!hasIntroPlayedThisSession()) {
      // Delay claiming the first play so React Strict Mode's development remount
      // cannot consume it before the child hears the narration.
      autoplayTimer = window.setTimeout(() => {
        if (introAudioRef.current !== audio) return;

        audio.play().then(markIntroPlayedThisSession).catch(() => {
          // Some browsers only allow sound after the child's first interaction.
          pendingInteractionRef.current = playAfterInteraction;
          document.addEventListener('pointerdown', playAfterInteraction, { once: true });
        });
      }, 0);
    }

    return () => {
      if (autoplayTimer !== null) window.clearTimeout(autoplayTimer);
      document.removeEventListener('pointerdown', playAfterInteraction);
      if (pendingInteractionRef.current === playAfterInteraction) {
        pendingInteractionRef.current = null;
      }
      audio.pause();
      audio.currentTime = 0;
      introAudioRef.current = null;
    };
  }, []);

  // Refresh star counts when saved progress changes here or in another tab.
  useEffect(() => {
    const syncProgress = () => setProgress(getDyscalculiaProgress());
    window.addEventListener('dyscalculia:progress-updated', syncProgress);
    window.addEventListener('storage', syncProgress);
    return () => {
      window.removeEventListener('dyscalculia:progress-updated', syncProgress);
      window.removeEventListener('storage', syncProgress);
    };
  }, []);

  // Replay the welcome narration from the shared audio controls.
  const replayIntro = () => {
    const audio = introAudioRef.current;
    if (!audio) return;

    const pendingInteraction = pendingInteractionRef.current;
    if (pendingInteraction) {
      document.removeEventListener('pointerdown', pendingInteraction);
      pendingInteractionRef.current = null;
    }

    audio.muted = false;
    audio.currentTime = 0;
    audio.play().then(markIntroPlayedThisSession).catch(() => {});
  };

  // Game menu: keys match saved progress IDs; routes open the game screens.
  const starsByGameId = new Map(getAllGameStarProgress(progress).map((game) => [game.id, game]));
  const games = [
    { key: 'number-tracing', name: 'අංක ලියමු (0–9)', subName: 'අංකය දිගේ ඇඟිල්ල ගෙන යමු', route: '/dyscalculia/number-tracing', theme: 'green' },
    { key: 'number-listening', name: 'අහලා තෝරමු', subName: 'ඇසෙන අංකය තෝරමු', route: '/dyscalculia/listening-game', theme: 'orange' },
    { key: 'number-sorting', name: 'අංක පිළිවෙලට තබමු', subName: 'කුඩා අංකයේ සිට පෙළට තබමු', route: '/dyscalculia/number-sorting', theme: 'blue' },
    { key: 'balloon-pop', name: 'බැලුන් බිඳිමු', subName: 'අංකයට ගැළපෙන බැලුනය තෝරමු', route: '/dyscalculia/balloon-pop', theme: 'purple' },
    { key: 'symbol-detective', name: 'සංකේත හඳුනාගමු', subName: 'කියන සංකේතය තෝරමු', route: '/dyscalculia/symbol-detective', theme: 'pink' },
    { key: 'number-matching', name: 'අංකයට රූප ගළපමු', subName: 'අංකයට ගැළපෙන රූප ගණන තෝරමු', route: '/dyscalculia/number-matching', theme: 'indigo' },
  ];

  useGameInstructions(replayIntro);

  return (
    <main className="dg-home-shell no-theme dc-home" lang="si">
      {/* Back to module selection; the button renders beside the global menu */}
      <DyscalculiaBackButton to="/modules" ariaLabel="ඉගෙනුම් කොටස් වෙත ආපසු යන්න" />

      {/* Decorative sea animals on either side of the game panel */}
      <div className="dc-home-scenery" aria-hidden="true">
        <img className="dc-home-friends dc-home-friends--left" src={leftBackgroundAnimals} alt="" />
        <img className="dc-home-friends dc-home-friends--right" src={rightBackgroundAnimals} alt="" />
      </div>

      <div className="dc-home-content">
        {/* Welcome heading above the transparent game panel */}
        <header className="dc-home-header">
          <span className="dc-home-eyebrow"><Shell size={18} aria-hidden="true" /> පුංචි අංක ලෝකය</span>
          <h1>මුහුදු යාළුවෝ සමඟ<br />අංක ඉගෙන ගමු!</h1>
          <p>කැමති සෙල්ලමක් තෝරලා, අපි එකට ඉගෙන ගමු.</p>
        </header>

        {/* Game selection panel and progress dashboard shortcut */}
        <section className="dc-home-board" aria-labelledby="dc-home-games-title">
          <div className="dc-home-board-header">
            <h2 id="dc-home-games-title"><Shell size={20} aria-hidden="true" /> සෙල්ලමක් තෝරමු</h2>
            <Link className="dc-home-progress-link" to="/dyscalculia/dashboard">
              <BarChart3 size={18} aria-hidden="true" /> මගේ ප්‍රගතිය
            </Link>
          </div>

          {/* Numbered game links with saved stars and play icons */}
          <ol className="dc-home-games">
            {games.map((game, index) => {
              const starProgress = starsByGameId.get(game.key);
              return (
                <li key={game.key}>
                  <Link className={`dc-home-game dc-home-game--${game.theme}`} to={game.route} aria-label={`${game.name} සෙල්ලම් කරමු`}>
                    <span className="dc-home-game-number" aria-hidden="true">{index + 1}</span>
                    <span className="dc-home-game-copy">
                      <span className="dc-home-game-title">{game.name}</span>
                      <span className="dc-home-game-subtitle">{game.subName}</span>
                    </span>
                    <span className="dc-home-game-actions">
                      {starProgress && (
                        <span className="dc-home-stars" aria-label={`ලැබූ තරු ${starProgress.earnedStars} / ${starProgress.maximumStars}`}>
                          <Star size={16} aria-hidden="true" />
                          <span>{starProgress.earnedStars}<span className="dc-home-stars-total"> / {starProgress.maximumStars}</span></span>
                        </span>
                      )}
                      <span className="dc-home-play" aria-hidden="true"><Play size={24} fill="currentColor" /></span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>

          <p className="dc-home-encouragement"><Star size={16} aria-hidden="true" /> පුංචි උත්සාහයක්, ලොකු දියුණුවක්. ඔයාට පුළුවන්!</p>
        </section>
      </div>
    </main>
  );
};

export default DyscalculiaHome;
