import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dysgraphia-common.css';
import '../styles/dysgraphia-letter-ta.css';

const ANIMATION_DURATION_MS = 15000;

const TA_GUIDE_PATH =
	'M 320 280 C 180 280 140 440 280 500 C 460 560 560 340 460 180 C 380 40 200 60 160 200';

const START_MARKER = { x: 320, y: 280 };
const END_MARKER = { x: 160, y: 200 };

const DysgraphiaLetterTA = () => {
	const navigate = useNavigate();
	const letterPathRef = useRef(null);
	const progressRef = useRef(0);

	const [isPlaying, setIsPlaying] = useState(false);
	const [progress, setProgress] = useState(0);
	const [markerPosition, setMarkerPosition] = useState(START_MARKER);
	const [blindMode, setBlindMode] = useState(false);
	const [showGuide, setShowGuide] = useState(false);
	const [animatePop, setAnimatePop] = useState(false);
	const [nodesDeployed, setNodesDeployed] = useState(false);
	const [originPoint, setOriginPoint] = useState({ x: -100, y: 300 });

	const playPopSound = () => {
		try {
			const ctx = new (window.AudioContext || window.webkitAudioContext)();
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.connect(gain);
			gain.connect(ctx.destination);
			osc.type = 'sine';
			
			// Longer, magical swoosh sound matching the 0.8s animation duration
			osc.frequency.setValueAtTime(300, ctx.currentTime);
			osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.8);
			
			gain.gain.setValueAtTime(0, ctx.currentTime);
			gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.2);
			gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.8);
			
			osc.start(ctx.currentTime);
			osc.stop(ctx.currentTime + 0.8);
		} catch (e) {
			console.error('Audio API not supported', e);
		}
	};

	// ✅ Animation loop (runs only once)
	useEffect(() => {
		if (!isPlaying || !showGuide) return;

		let frameId;
		const start = performance.now() - progressRef.current * ANIMATION_DURATION_MS;

		const animate = (now) => {
			const elapsed = now - start;
			const nextProgress = elapsed / ANIMATION_DURATION_MS;

			if (nextProgress >= 1) {
				// Stop at end
				progressRef.current = 1;
				setProgress(1);
				setIsPlaying(false);
				return;
			}

			progressRef.current = nextProgress;
			setProgress(nextProgress);

			frameId = window.requestAnimationFrame(animate);
		};

		frameId = window.requestAnimationFrame(animate);
		return () => window.cancelAnimationFrame(frameId);
	}, [isPlaying, showGuide]);

	// Update marker position
	useEffect(() => {
		const pathElement = letterPathRef.current;
		if (!pathElement) return;

		const pathLength = pathElement.getTotalLength();
		const point = pathElement.getPointAtLength(progress * pathLength);
		setMarkerPosition({ x: point.x, y: point.y });
	}, [progress]);

	// Reset
	const handleReset = () => {
		progressRef.current = 0;
		setProgress(0);
		setMarkerPosition(START_MARKER);
		setIsPlaying(false);
	};

	// Audio
	const handleAudio = () => {
		window.speechSynthesis.cancel();
		const utterance = new SpeechSynthesisUtterance('ට');
		utterance.lang = 'si-LK';
		window.speechSynthesis.speak(utterance);
	};

	return (
		<main className='dg-shell dg-theme-ta'>
			{/* Back button */}
			<button
				type='button'
				className='dg-home-btn'
				onClick={() => navigate('/dysgraphia')}
			>
				←
			</button>

			<section className='dg-stage'>
				<header className='dg-header'>
					<h1>‘ට’ අක්ෂරය හුරු කරමු</h1>
					<p>පහත රේඛා ඔස්සේ චලනය වන මාර්කර් එක අනුගමනය කරන්න.</p>
				</header>

				<div className='dg-canvas-wrap'>
					<svg
						className={`dg-canvas ${animatePop ? 'dg-pop' : ''}`}
						viewBox='0 0 640 600'
					>
						{!blindMode && (
							<>
								{/* Guide path */}
								<path d={TA_GUIDE_PATH} className='dg-chain-path' />

								{/* Hidden path */}
								<path
									d={TA_GUIDE_PATH}
									ref={letterPathRef}
									style={{ stroke: 'none', fill: 'none' }}
								/>

								{/* Progress path */}
								<path
									d={TA_GUIDE_PATH}
									className='dg-progress-path'
									pathLength='1'
									style={{ strokeDashoffset: `${1 - progress}` }}
								/>

								{/* Start & End */}
								{showGuide && (
									<>
										<circle 
											cx={nodesDeployed ? START_MARKER.x : originPoint.x} 
											cy={nodesDeployed ? START_MARKER.y : originPoint.y} 
											r='22' 
											className={`dg-node ${nodesDeployed ? 'dg-deployed' : ''}`}
											style={{ transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
										/>
										<text 
											x={nodesDeployed ? START_MARKER.x : originPoint.x} 
											y={nodesDeployed ? START_MARKER.y + 6 : originPoint.y + 6} 
											textAnchor='middle'
											style={{ transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
										>⭐</text>

										<circle 
											cx={nodesDeployed ? END_MARKER.x : originPoint.x} 
											cy={nodesDeployed ? END_MARKER.y : originPoint.y} 
											r='22' 
											className={`dg-node ${nodesDeployed ? 'dg-deployed' : ''}`}
											style={{ transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
										/>
										<text 
											x={nodesDeployed ? END_MARKER.x : originPoint.x} 
											y={nodesDeployed ? END_MARKER.y + 6 : originPoint.y + 6} 
											textAnchor='middle'
											style={{ transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
										>⭐</text>
									</>
								)}

								{/* Moving marker */}
								{showGuide && (
									<g style={{ opacity: nodesDeployed ? 1 : 0, transition: 'opacity 0.5s ease 0.8s' }}>
										<circle
											cx={markerPosition.x}
											cy={markerPosition.y}
											r='22'
											className='dg-node dg-node-active'
										/>
										<text
											x={markerPosition.x}
											y={markerPosition.y + 6}
											textAnchor='middle'
											className='dg-node-icon'
										>
											🐘
										</text>
									</g>
								)}
							</>
						)}
					</svg>
				</div>

				{/* ⭐ Star button (restart animation cleanly) */}
				<div className='dg-floating-stars'>
					<button
						type='button'
						className='dg-star-btn'
						onClick={(e) => {
							// Calculate exact responsive SVG center of this button
							const svg = document.querySelector('.dg-canvas');
							if (svg) {
								const pt = svg.createSVGPoint();
								const rect = e.currentTarget.getBoundingClientRect();
								pt.x = rect.left + rect.width / 2;
								pt.y = rect.top + rect.height / 2;
								const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
								setOriginPoint({ x: svgP.x, y: svgP.y });
							} else {
								setOriginPoint({ x: -100, y: 300 }); // fallback
							}

							setShowGuide(true);
							setNodesDeployed(false);
							playPopSound();

							// reset + start
							progressRef.current = 0;
							setProgress(0);
							setMarkerPosition(START_MARKER);
							
							// trigger deploy animation
							setTimeout(() => {
								setNodesDeployed(true);
								setTimeout(() => {
									setIsPlaying(true);
								}, 800); // wait for nodes to reach destination
							}, 50);

							setAnimatePop(true);
							setTimeout(() => setAnimatePop(false), 500);
						}}
					>
						⭐
					</button>
					<button className='dg-star-btn'>⭐</button>
					<button className='dg-star-btn'>⭐</button>
				</div>

				{/* Controls */}
				<div className='dg-controls'>
					<button
						className='dg-ctl-btn dg-ctl-primary'
						onClick={() => {
							if (!isPlaying) {
								// restart from beginning
								progressRef.current = 0;
								setProgress(0);
								setMarkerPosition(START_MARKER);
							}
							setIsPlaying(prev => !prev);
						}}
					>
						{isPlaying ? '⏸️ නවත්වන්න' : '▶️ ආරම්භ කරන්න'}
					</button>

					<button
						className='dg-ctl-btn dg-ctl-secondary'
						onClick={handleReset}
					>
						🔄 නැවත අඳින්න
					</button>
				</div>

				<p className='dg-hint'>
					💡 රන්වන් මාර්කර් එක අනුගමනය කරමින් ඔබේ ඇඟිල්ල ගෙනයන්න.
				</p>
			</section>
		</main>
	);
};

export default DysgraphiaLetterTA;