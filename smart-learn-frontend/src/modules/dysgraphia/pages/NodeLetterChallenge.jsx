import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import DysgraphiaRewardBox from '../components/DysgraphiaRewardBox';
import { useDysgraphiaRewards } from '../hooks/useDysgraphiaRewards';
import { dysgraphiaService } from '../services/dysgraphiaService';
import rewardAudio from '../../../assets/audio/dysgraphia/reward.mp3';
import tryAgainAudio from '../../../assets/audio/dysgraphia/tryagain.wav';
import wrongAudio from '../../../assets/audio/dysgraphia/wrong.mp3';
import nodeMatchAudio from '../../../assets/audio/dysgraphia/buttonSound.mp3';
import backImage from '../../../assets/images/dysgraphia/back.png';
import babyTrex from '../../../assets/images/dysgraphia/dinosaurs/animated-baby-trex.png';
import babyBrachiosaurus from '../../../assets/images/dysgraphia/dinosaurs/animated-baby-brachiosaurus.png';
import babyPterodactyl from '../../../assets/images/dysgraphia/dinosaurs/baby-pterodactyl.png';
import babyTriceratops from '../../../assets/images/dysgraphia/dinosaurs/baby-triceratops.png';
import babyStegosaurus from '../../../assets/images/dysgraphia/dinosaurs/baby-stegosaurus.png';
import completedNodeFlower from '../../../assets/images/dysgraphia/nodef.png';
import { DEFAULT_NODE_LETTER_ID, NODE_LETTERS } from '../data/nodeLetterCatalog';
import '../styles/dysgraphia-common.css';
import '../styles/dysgraphia-home.css';
import '../styles/node-letter-challenge.css';

const VIEWBOX_WIDTH = 640;
const VIEWBOX_HEIGHT = 580;
const NODE_COUNT = 10;
const MIN_NODE_GAP = 34;
// Slightly larger hit radius on touch devices — fingers are less precise than a mouse.
const HIT_RADIUS = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches ? 34 : 27;
const PATH_TOLERANCE = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches ? 46 : 38;
const MIN_DRAG_DISTANCE = 8;
const PASS_PERCENT = 75;

const makeStroke = () => ({ id: `${Date.now()}-${Math.random()}`, points: [] });

const DinosaurFriends = () => (
  <div className="nlc-dino-friends" aria-hidden="true">
    <img src={babyTrex} alt="" className="nlc-dino nlc-dino--trex" />
    <img src={babyBrachiosaurus} alt="" className="nlc-dino nlc-dino--brachiosaurus" />
    <img src={babyPterodactyl} alt="" className="nlc-dino nlc-dino--pterodactyl" />
    <img src={babyTriceratops} alt="" className="nlc-dino nlc-dino--triceratops" />
    <img src={babyStegosaurus} alt="" className="nlc-dino nlc-dino--stegosaurus" />
  </div>
);

const NodeLetterChallenge = () => {
  const navigate = useNavigate();
  const { letterId = DEFAULT_NODE_LETTER_ID } = useParams();
  const resolvedLetterId = NODE_LETTERS[letterId] ? letterId : DEFAULT_NODE_LETTER_ID;
  const letterConfig = NODE_LETTERS[resolvedLetterId];
  const targetLetter = letterConfig.letter;
  const letterPath = letterConfig.path;
  const pathRef = useRef(null);
  const boardRef = useRef(null);
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const guideCoveredRef = useRef(new Set());
  const memoryCoveredRef = useRef(new Set());
  const guideSamplesRef = useRef([]);
  const wentOutsidePathRef = useRef(false);
  const memoryWentOutsidePathRef = useRef(false);
  const strokeStartRef = useRef(null);
  const lastPointerRef = useRef(null);
  const dragDistanceRef = useRef(0);
  const activeStrokeMovedRef = useRef(false);
  const rewardAwardedRef = useRef(false);
  const memoryRewardAwardedRef = useRef(false);
  const wrongSoundPlayedRef = useRef(false);
  const challengeStartedAtRef = useRef(Date.now());
  const completionIdRef = useRef(globalThis.crypto?.randomUUID?.() || `node-${Date.now()}`);
  const interventionSubmittedRef = useRef(false);
  const canvasCheckInFlightRef = useRef(false);
  const [stage, setStage] = useState('guide');
  const [nodes, setNodes] = useState([]);
  const [guideCovered, setGuideCovered] = useState(() => new Set());
  const [guideAttemptFinished, setGuideAttemptFinished] = useState(false);
  const [wentOutsidePath, setWentOutsidePath] = useState(false);
  const [memoryWentOutsidePath, setMemoryWentOutsidePath] = useState(false);
  const [guideRetryCount, setGuideRetryCount] = useState(0);
  const [guideStarsEarned, setGuideStarsEarned] = useState(0);
  const [memoryRetryCount, setMemoryRetryCount] = useState(0);
  const [memoryStarsEarned, setMemoryStarsEarned] = useState(0);
  const [covered, setCovered] = useState(() => new Set());
  const [strokes, setStrokes] = useState([]);
  const [checked, setChecked] = useState(false);
  const [canvasHasDrawing, setCanvasHasDrawing] = useState(false);
  const [canvasChecking, setCanvasChecking] = useState(false);
  const [canvasCorrect, setCanvasCorrect] = useState(false);
  const [canvasError, setCanvasError] = useState('');
  const [canvasAttempts, setCanvasAttempts] = useState(0);
  const [canvasStarsEarned, setCanvasStarsEarned] = useState(0);
  const { totalStars, rewardPulse, awardStars } = useDysgraphiaRewards();

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const length = path.getTotalLength();
    const evenlySpacedNodes = Array.from({ length: NODE_COUNT }, (_, index) => {
      const point = path.getPointAtLength((index / (NODE_COUNT - 1)) * length);
      return { x: point.x, y: point.y };
    });
    setNodes(evenlySpacedNodes.reduce((spacedNodes, node) => {
      const overlapsExistingNode = spacedNodes.some((placedNode) => (
        Math.hypot(node.x - placedNode.x, node.y - placedNode.y) < MIN_NODE_GAP
      ));
      if (!overlapsExistingNode) spacedNodes.push(node);
      return spacedNodes;
    }, []));
    guideSamplesRef.current = Array.from({ length: 140 }, (_, index) => {
      const point = path.getPointAtLength((index / 139) * length);
      return { x: point.x, y: point.y };
    });
  }, [letterPath]);

  // Stop the page/board from being pinch-zoomed or pulled-to-refresh while
  // a child is actively tracing on a phone or tablet.
  useEffect(() => {
    const board = boardRef.current;
    if (!board) return undefined;
    const preventTouchScroll = (event) => {
      if (drawingRef.current) event.preventDefault();
    };
    board.addEventListener('touchmove', preventTouchScroll, { passive: false });
    return () => board.removeEventListener('touchmove', preventTouchScroll);
  }, []);

  const isMemoryStage = stage === 'memory';
  const isCanvasStage = stage === 'canvas';
  const guideComplete = nodes.length > 0 && guideCovered.size === nodes.length && !wentOutsidePath;
  const coveragePercent = nodes.length ? Math.round((covered.size / nodes.length) * 100) : 0;

  const playWrongSound = () => {
    if (wrongSoundPlayedRef.current) return;
    wrongSoundPlayedRef.current = true;
    const audio = new Audio(wrongAudio);
    audio.volume = 0.9;
    audio.play().catch(() => {});
  };

  useEffect(() => {
    if (!guideAttemptFinished || !guideComplete || rewardAwardedRef.current) return;
    const stars = guideRetryCount <= 1 ? 3 : guideRetryCount <= 3 ? 2 : 1;
    rewardAwardedRef.current = true;
    setGuideStarsEarned(stars);
    awardStars(stars);
  }, [awardStars, guideAttemptFinished, guideComplete, guideRetryCount]);

  useEffect(() => {
    if (!guideStarsEarned && !memoryStarsEarned && !canvasStarsEarned) return undefined;
    const audio = new Audio(rewardAudio);
    audio.volume = 0.9;
    audio.play().catch(() => {});
    const hideTimer = window.setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
    }, 3000);
    return () => {
      window.clearTimeout(hideTimer);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [canvasStarsEarned, guideStarsEarned, memoryStarsEarned]);

  const pointFromEvent = (event) => {
    const rect = boardRef.current.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * VIEWBOX_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * VIEWBOX_HEIGHT,
    };
  };

  // Guided coverage controls progression, while hidden coverage is the score.
  const coverNearbyNodes = (point) => {
    const updateCoverage = isMemoryStage ? setCovered : setGuideCovered;
    const current = isMemoryStage ? memoryCoveredRef.current : guideCoveredRef.current;
    const nextNodeIndex = current.size;
    const nextNode = nodes[nextNodeIndex];

    // Nodes must be completed in path order. Touching a later node before
    // the next required one does not mark it as covered.
    if (nextNode && Math.hypot(point.x - nextNode.x, point.y - nextNode.y) <= HIT_RADIUS) {
      const next = new Set(current);
      next.add(nextNodeIndex);
      if (isMemoryStage) memoryCoveredRef.current = next;
      else guideCoveredRef.current = next;
      updateCoverage(next);

      const audio = new Audio(nodeMatchAudio);
      audio.volume = 0.8;
      audio.play().catch(() => {});
    } else if (nodes.some((node, index) => index > nextNodeIndex
      && Math.hypot(point.x - node.x, point.y - node.y) <= HIT_RADIUS)) {
      playWrongSound();
    }
  };

  const checkDrawingPath = (point) => {
    const isNearPath = guideSamplesRef.current.some((sample) => Math.hypot(point.x - sample.x, point.y - sample.y) <= PATH_TOLERANCE);
    if (isNearPath) return;
    playWrongSound();
    if (isMemoryStage) {
      memoryWentOutsidePathRef.current = true;
      setMemoryWentOutsidePath(true);
    } else if (!wentOutsidePathRef.current) {
      wentOutsidePathRef.current = true;
      setWentOutsidePath(true);
    }
  };

  const startDrawing = (event) => {
    event.preventDefault();
    if (isMemoryStage && checked) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    setChecked(false);
    const point = pointFromEvent(event);
    strokeStartRef.current = point;
    lastPointerRef.current = point;
    dragDistanceRef.current = 0;
    activeStrokeMovedRef.current = false;
    wrongSoundPlayedRef.current = false;
    setStrokes((current) => [...current, { ...makeStroke(), points: [point] }]);
  };

  const continueDrawing = (event) => {
    if (!drawingRef.current) return;
    event.preventDefault();
    const point = pointFromEvent(event);
    const previousPoint = lastPointerRef.current || point;
    dragDistanceRef.current += Math.hypot(point.x - previousPoint.x, point.y - previousPoint.y);
    lastPointerRef.current = point;

    if (!activeStrokeMovedRef.current && dragDistanceRef.current >= MIN_DRAG_DISTANCE) {
      activeStrokeMovedRef.current = true;
      coverNearbyNodes(strokeStartRef.current);
      checkDrawingPath(strokeStartRef.current);
    }

    if (!activeStrokeMovedRef.current) return;
    if (isCanvasStage) {
      setCanvasHasDrawing(true);
      setStrokes((current) => {
        if (!current.length) return current;
        const next = [...current];
        const last = next[next.length - 1];
        next[next.length - 1] = { ...last, points: [...last.points, point] };
        return next;
      });
      return;
    }
    coverNearbyNodes(point);
    checkDrawingPath(point);
    setStrokes((current) => {
      if (!current.length) return current;
      const next = [...current];
      const last = next[next.length - 1];
      next[next.length - 1] = { ...last, points: [...last.points, point] };
      return next;
    });
  };

  const stopDrawing = (event) => {
    drawingRef.current = false;
    if (!activeStrokeMovedRef.current) {
      setStrokes((current) => current.slice(0, -1));
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      return;
    }
    if (isCanvasStage) {
      setCanvasHasDrawing(true);
    } else if (!isMemoryStage) {
      const reachedFinalNode = guideCoveredRef.current.has(nodes.length - 1);
      if (reachedFinalNode || wentOutsidePathRef.current) setGuideAttemptFinished(true);
    } else if (!memoryWentOutsidePathRef.current && nodes.length > 0) {
      const finalCoverage = Math.round((memoryCoveredRef.current.size / nodes.length) * 100);
      if (finalCoverage >= PASS_PERCENT) {
        setChecked(true);
        if (!memoryRewardAwardedRef.current) {
          const stars = memoryRetryCount <= 1 ? 3 : memoryRetryCount <= 3 ? 2 : 1;
          memoryRewardAwardedRef.current = true;
          setMemoryStarsEarned(stars);
          awardStars(stars);
        }
      }
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    strokeStartRef.current = null;
    lastPointerRef.current = null;
  };

  const clearBoard = () => {
    guideCoveredRef.current = new Set();
    memoryCoveredRef.current = new Set();
    wentOutsidePathRef.current = false;
    memoryWentOutsidePathRef.current = false;
    strokeStartRef.current = null;
    lastPointerRef.current = null;
    dragDistanceRef.current = 0;
    activeStrokeMovedRef.current = false;
    setGuideCovered(new Set());
    setGuideAttemptFinished(false);
    setWentOutsidePath(false);
    setMemoryWentOutsidePath(false);
    setCovered(new Set());
    setStrokes([]);
    setChecked(false);
    setCanvasHasDrawing(false);
  };

  const startMemoryStage = () => {
    setStage('memory');
    clearBoard();
  };

  const retryGuideTask = () => {
    setGuideRetryCount((count) => count + 1);
    clearBoard();
  };

  const retryMemoryTask = () => {
    setMemoryRetryCount((count) => count + 1);
    clearBoard();
  };

  const startCanvasStage = () => {
    setStage('canvas');
    clearBoard();
  };

  const clearCanvasTask = () => {
    canvasRef.current?.clearCanvas();
    setCanvasHasDrawing(false);
    setCanvasCorrect(false);
    setCanvasError('');
  };

  const checkCanvasDrawing = async () => {
    if (!canvasRef.current || !canvasHasDrawing || canvasChecking || canvasCheckInFlightRef.current) return;
    canvasCheckInFlightRef.current = true;
    setCanvasChecking(true);
    setCanvasError('');

    try {
      const paths = await canvasRef.current.exportPaths();
      if (!paths.length) {
        setCanvasHasDrawing(false);
        setCanvasError('කරුණාකර මුලින් අකුර අඳින්න.');
        return;
      }

      const attemptNumber = canvasAttempts + 1;
      setCanvasAttempts(attemptNumber);
      const dataUrl = await canvasRef.current.exportImage('jpeg');
      const image = await fetch(dataUrl).then((response) => response.blob());
      const response = await dysgraphiaService.recordLetterActivity({
        letterId: resolvedLetterId,
        targetChar: targetLetter,
        mode: 'independent',
        durationSeconds: 0,
        timerSeconds: 0,
        strokeCount: paths.length,
        attemptNumber,
        wrongAttempts: attemptNumber - 1,
        eraseCount: 0,
        image,
      });

      if (response?.isCorrect) {
        const stars = response.starsEarned || (attemptNumber === 1 ? 3 : attemptNumber <= 3 ? 2 : 1);
        setCanvasCorrect(true);
        setCanvasStarsEarned(stars);
        awardStars(stars);
        if (!interventionSubmittedRef.current) {
          interventionSubmittedRef.current = true;
          const mistakes = guideRetryCount + memoryRetryCount + Math.max(0, attemptNumber - 1);
          const attempts = mistakes + 1;
          const accuracy = 1 / attempts;
          dysgraphiaService.recordInterventionResult({
            completionId: completionIdRef.current,
            gameType: 'node-letter-challenge',
            targetLetterId: resolvedLetterId,
            targetLetter,
            correct: true,
            score: Math.round(accuracy * 100),
            accuracy,
            attempts,
            mistakes,
            completed: true,
            durationSeconds: Math.max(0, Math.round((Date.now() - challengeStartedAtRef.current) / 1000)),
          }).catch((error) => console.error('Could not save node-letter intervention result.', error));
        }
      } else {
        setCanvasCorrect(false);
        setCanvasError('❌ නැවත උත්සාහ කරන්න!');
        const audio = new Audio(wrongAudio);
        audio.volume = 0.9;
        audio.play().catch(() => {});
      }
    } catch (error) {
      setCanvasError(error?.response?.data?.message || error?.message || 'අකුර පරීක්ෂා කිරීමට නොහැකි විය. නැවත උත්සාහ කරන්න.');
    } finally {
      canvasCheckInFlightRef.current = false;
      setCanvasChecking(false);
    }
  };

  const passed = coveragePercent >= PASS_PERCENT && !memoryWentOutsidePath;
  const showGuideRetry = stage === 'guide' && guideAttemptFinished && !guideComplete;
  const showMemoryRetry = stage === 'memory' && (memoryWentOutsidePath || (checked && !passed));
  const showRetryButton = showGuideRetry || showMemoryRetry;

  useEffect(() => {
    if (!showRetryButton) return undefined;
    const audio = new Audio(tryAgainAudio);
    audio.volume = 0.9;
    audio.play().catch(() => {});
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [showRetryButton]);

  return (
    <main className="dg-shell dg-theme-a nlc-page">
      <DinosaurFriends />
      <DysgraphiaRewardBox totalStars={totalStars} rewardPulse={rewardPulse} />
      <button type="button" className="nlc-back" aria-label="ආපහු" onClick={() => navigate('/dysgraphia/progress')}><img src={backImage} alt="" /></button>
      <div className="nlc-decoration" aria-hidden="true"><span>⭐</span><span>☁️</span><span>🌈</span><span>✏️</span></div>
      <header className="nlc-header">
        <div><h1>“{targetLetter}” අකුර සම්පූර්ණ කරමු!</h1></div>
        {/* <div className="nlc-stage-pill">{stage === 'guide' ? '1 / 2 · තිත් සමඟ' : '2 / 2 · මතකයෙන්'}</div> */}
      </header>

      <section className="nlc-game-card">

        {stage === 'guide' ? (
          <div className="nlc-guide-message"> පළමු තිතෙන් පටන්ගෙන සියලුම තිත් එකට යා කරන්න. </div>
        ) : stage === 'memory' ? (
          <div className="nlc-progress-row"><span>ආවරණය කළ සැඟවුණු තිත්</span><strong>{covered.size} / {nodes.length}</strong><div className="nlc-progress"><span style={{ width: `${coveragePercent}%` }} /></div><b>{coveragePercent}%</b></div>
        ) : (
          <div className="nlc-guide-message">දැන් “{targetLetter}” අකුර ඔබට මතක විදිහට හිස් පුවරුවේ අඳින්න.</div>
        )}

        <div className={`nlc-board-frame ${isCanvasStage ? 'is-canvas-stage' : ''}`}>
          <div className={`nlc-board ${isMemoryStage ? 'nlc-board-memory' : ''} ${isCanvasStage ? 'nlc-board-canvas' : ''} ${wentOutsidePath || memoryWentOutsidePath ? 'is-path-error' : ''}`}>
            {isCanvasStage ? (
              <ReactSketchCanvas
                ref={canvasRef}
                width="100%"
                height="100%"
                strokeWidth={8}
                strokeColor="#172033"
                canvasColor="#fffdf7"
                onStroke={() => {
                  setCanvasHasDrawing(true);
                  setCanvasCorrect(false);
                  setCanvasError('');
                }}
                style={{ border: 'none', borderRadius: '18px', touchAction: 'none' }}
              />
            ) : (
              <svg
              ref={boardRef}
              viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label={`Draw the Sinhala letter ${targetLetter}`}
              style={{ touchAction: 'none' }}
              onPointerDown={startDrawing}
              onPointerMove={continueDrawing}
              onPointerUp={stopDrawing}
              onPointerCancel={stopDrawing}
              onPointerLeave={(event) => { if (drawingRef.current && event.buttons === 0) stopDrawing(event); }}
              >
              <path ref={pathRef} d={letterPath} fill="none" stroke="transparent" />
              {/* Letter shape is always visible — with nodes in stage 1, without them in stage 2 */}
              {!isCanvasStage && <path d={letterPath} className="nlc-letter-shape" />}
              {stage === 'guide' && <path d={letterPath} className="nlc-guide-path" />}
              {(stage === 'guide' || (isMemoryStage && checked)) && nodes.map((node, index) => {
                const nodeCovered = isMemoryStage ? covered.has(index) : guideCovered.has(index);
                return (
                  <g key={`${node.x}-${node.y}`} className={nodeCovered ? 'is-covered' : (isMemoryStage ? 'is-missed' : '')}>
                    {nodeCovered ? (
                      <image
                        className="nlc-node-flower"
                        href={completedNodeFlower}
                        x={node.x - 22}
                        y={node.y - 22}
                        width="44"
                        height="44"
                        preserveAspectRatio="xMidYMid meet"
                      />
                    ) : (
                      <>
                        <circle className="nlc-node-ring" cx={node.x} cy={node.y} r="12" />
                        <circle className="nlc-node-dot" cx={node.x} cy={node.y} r="5" />
                      </>
                    )}
                    {index === 0 && <text x={node.x} y={node.y - 28} textAnchor="middle">START</text>}
                  </g>
                );
              })}
              {strokes.map((stroke) => <polyline key={stroke.id} className="nlc-child-stroke" points={stroke.points.map((point) => `${point.x},${point.y}`).join(' ')} />)}
              </svg>
            )}
          </div>
        </div>

        {isCanvasStage && canvasError && <div className="nlc-result is-retry" role="alert"><span>💪</span><div><strong>{canvasError}</strong></div></div>}
        <div className="nlc-actions">
          {!showRetryButton && <button type="button" className="nlc-button nlc-button-light" onClick={isCanvasStage ? clearCanvasTask : clearBoard}>🗑️ මකන්න</button>}
          {stage === 'guide' && !guideAttemptFinished && <button type="button" className="nlc-button nlc-button-main" disabled>තිත් සියල්ල යා කරන්න</button>}
          {stage === 'guide' && guideAttemptFinished && !guideComplete && <button type="button" className="nlc-button nlc-button-retry" onClick={retryGuideTask}>{wentOutsidePath ? '↩️ මාර්ගයෙන් පිට ගියා — නැවත උත්සාහ කරමු' : '🔄 තිත් කිහිපයක් මඟ හැරුණා — නැවත උත්සාහ කරමු'}</button>}
          {stage === 'guide' && guideAttemptFinished && guideComplete && <button type="button" className="nlc-button nlc-button-main" onClick={startMemoryStage}>තිත් සඟවා ලියමු →</button>}
          {stage === 'memory' && memoryWentOutsidePath && <button type="button" className="nlc-button nlc-button-retry" onClick={retryMemoryTask}>↩️ මාර්ගයෙන් පිට ගියා — නැවත උත්සාහ කරමු</button>}
          {stage === 'memory' && !memoryWentOutsidePath && checked && !passed && <button type="button" className="nlc-button nlc-button-retry" onClick={retryMemoryTask}>🔄 තිත් කිහිපයක් මඟ හැරුණා — නැවත උත්සාහ කරමු</button>}
          {stage === 'memory' && !memoryWentOutsidePath && checked && passed && <button type="button" className="nlc-button nlc-button-main" onClick={startCanvasStage}>තුන්වන කාර්යයට යමු →</button>}
          {stage === 'memory' && !memoryWentOutsidePath && !checked && <button type="button" className="nlc-button nlc-button-main" disabled>සැඟවුණු තිත් 75%ක් ආවරණය කරන්න</button>}
          {stage === 'canvas' && !canvasCorrect && <button type="button" className="nlc-button nlc-button-main" disabled={!canvasHasDrawing || canvasChecking} onClick={checkCanvasDrawing}>{canvasChecking ? 'පරීක්ෂා වෙමින්...' : 'හරිද බලමු'}</button>}
          {stage === 'canvas' && canvasCorrect && <button type="button" className="nlc-button nlc-button-main" onClick={() => navigate('/dysgraphia/progress')}>සම්පූර්ණයි! ඉදිරියට යමු →</button>}
        </div>

      </section>

    </main>
  );
};

export default NodeLetterChallenge;
