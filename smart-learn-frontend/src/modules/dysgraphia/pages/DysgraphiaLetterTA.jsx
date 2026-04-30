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
	const [bubbles, setBubbles] = useState([]);
	const audioCtxRef = useRef(null);
	const trainOscRef = useRef(null);
	const trainGainRef = useRef(null);

	const initAudio = () => {
		if (!audioCtxRef.current) {
			const ctx = new (window.AudioContext || window.webkitAudioContext)();
			audioCtxRef.current = ctx;
		}
		if (audioCtxRef.current.state === 'suspended') {
			audioCtxRef.current.resume();
		}
	};

	const startTrainSound = () => {
		initAudio();
		const ctx = audioCtxRef.current;
		
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		
		// Train chugging sound texture
		osc.type = 'square';
		osc.frequency.setValueAtTime(100, ctx.currentTime);
		
		// LFO for the chug rhythm
		const lfo = ctx.createOscillator();
		lfo.type = 'sawtooth';
		lfo.frequency.value = 8; // Speed of the chug
		
		const lfoGain = ctx.createGain();
		lfoGain.gain.value = 50; // Pitch modulation depth
		
		lfo.connect(lfoGain);
		lfoGain.connect(osc.frequency);
		
		// Amplitude envelope for the chug
		gain.gain.setValueAtTime(0, ctx.currentTime);
		gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
		
		osc.connect(gain);
		gain.connect(ctx.destination);
		
		osc.start();
		lfo.start();
		
		trainOscRef.current = { osc, lfo };
		trainGainRef.current = gain;
	};

	const stopTrainSound = () => {
		if (trainGainRef.current && trainOscRef.current) {
			const ctx = audioCtxRef.current;
			trainGainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
			setTimeout(() => {
				trainOscRef.current?.osc.stop();
				trainOscRef.current?.lfo.stop();
				trainOscRef.current = null;
			}, 200);
		}
	};

	const playBubbleSound = () => {
		initAudio();
		const ctx = audioCtxRef.current;
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		
		osc.type = 'sine';
		// Bubble pop pitch jump
		osc.frequency.setValueAtTime(400, ctx.currentTime);
		osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
		
		gain.gain.setValueAtTime(0, ctx.currentTime);
		gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02);
		gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
		
		osc.connect(gain);
		gain.connect(ctx.destination);
		
		osc.start();
		osc.stop(ctx.currentTime + 0.1);
	};

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
		
		startTrainSound();

		const animate = (now) => {
			const elapsed = now - start;
			const nextProgress = elapsed / ANIMATION_DURATION_MS;

			if (nextProgress >= 1) {
				// Stop at end
				progressRef.current = 1;
				setProgress(1);
				setIsPlaying(false);
				stopTrainSound();
				
				// Keep bubbles animating their idle wiggle, but do not set them to float away
				// so they form the permanent frothy letter trace without disappearing.
				
				return;
			}

			// Randomly emit trace bubbles that stay on path to form a frothy line
			if (Math.random() < 0.8) {
				const pathElement = letterPathRef.current;
				if (pathElement) {
					const pathLength = pathElement.getTotalLength();
					const pt = pathElement.getPointAtLength(nextProgress * pathLength);
					
					// Add 1 to 3 bubbles per frame to build froth
					const numBubbles = Math.floor(Math.random() * 3) + 1;
					const newBubbles = [];
					for (let i = 0; i < numBubbles; i++) {
						newBubbles.push({
							id: Date.now() + Math.random(),
							x: pt.x + (Math.random() * 24 - 12),
							y: pt.y + (Math.random() * 24 - 12),
							size: Math.random() * 8 + 3,
							isFloating: Math.random() < 0.1, // 10% chance to float away
							colorIndex: Math.floor(Math.random() * 3), // 0: white, 1: light blue, 2: cyan
							idleDuration: 1.5 + Math.random() * 2 // Continuous idle animation time
						});
					}
					
					setBubbles(prev => [...prev, ...newBubbles]);
					
					if (Math.random() < 0.1) {
						playBubbleSound();
					}
				}
			}

			progressRef.current = nextProgress;
			setProgress(nextProgress);

			frameId = window.requestAnimationFrame(animate);
		};

		frameId = window.requestAnimationFrame(animate);
		return () => {
			window.cancelAnimationFrame(frameId);
			stopTrainSound();
		};
	}, [isPlaying, showGuide]);

	// Update marker position
	useEffect(() => {
		const pathElement = letterPathRef.current;
		if (!pathElement) return;

		const pathLength = pathElement.getTotalLength();
		const point = pathElement.getPointAtLength(progress * pathLength);
		setMarkerPosition({ x: point.x, y: point.y });
		
		// Clean up only floating bubbles, keep trace bubbles to form the line
		setBubbles(prev => {
			const now = Date.now();
			return prev.filter(b => !b.isFloating || now - b.id < 3000); 
		});
	}, [progress]);

	// Reset
	const handleReset = () => {
		progressRef.current = 0;
		setProgress(0);
		setMarkerPosition(START_MARKER);
		setIsPlaying(false);
		setBubbles([]);
		stopTrainSound();
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

								{/* Bubbles */}
								{bubbles.map(b => {
									let fillColor, strokeColor, shadowColor;
									if (b.colorIndex === 1) { // Light Blue
										fillColor = "rgba(100, 180, 255, 0.4)";
										strokeColor = "rgba(100, 180, 255, 0.8)";
										shadowColor = "rgba(100, 180, 255, 0.8)";
									} else if (b.colorIndex === 2) { // Cyan
										fillColor = "rgba(0, 220, 255, 0.4)";
										strokeColor = "rgba(0, 220, 255, 0.8)";
										shadowColor = "rgba(0, 220, 255, 0.8)";
									} else { // White
										fillColor = "rgba(255, 255, 255, 0.4)";
										strokeColor = "rgba(255, 255, 255, 0.8)";
										shadowColor = "rgba(255, 255, 255, 0.8)";
									}

									return (
										<circle
											key={b.id}
											cx={b.x}
											cy={b.y}
											r={b.size}
											fill={fillColor}
											stroke={strokeColor}
											strokeWidth="1.5"
											className={b.isFloating ? "dg-bubble-anim" : "dg-bubble-idle"}
											style={{ 
												animationDuration: b.isFloating ? '3s' : `${b.idleDuration}s`, 
												transformOrigin: `${b.x}px ${b.y}px`,
												filter: `drop-shadow(0 0 2px ${shadowColor})`
											}}
										/>
									);
								})}

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
											style={{ fontSize: '20px' }}
										>
											🚂
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
						className='dg-star-btn active'
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
					<button className='dg-star-btn active'>⭐</button>
					<button className='dg-star-btn active'>⭐</button>
				</div>

				{/* Controls */}
				<div className='dg-controls'>
					<button
						className='dg-ctl-btn dg-ctl-primary'
						onClick={() => {
							if (!isPlaying) {
								if (progressRef.current >= 1) {
									// restart from beginning
									progressRef.current = 0;
									setProgress(0);
									setMarkerPosition(START_MARKER);
								}
							} else {
								stopTrainSound();
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