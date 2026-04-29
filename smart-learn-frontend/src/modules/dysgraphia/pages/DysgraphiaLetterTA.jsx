import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dysgraphia-common.css';
import '../styles/dysgraphia-letter-ta.css';

const ANIMATION_DURATION_MS = 15000;
// Perfect inside-to-out spiral path matching the user's reference image for 'ට'
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

	// Animation loop
	useEffect(() => {
		if (!isPlaying || !showGuide) return;

		let frameId;
		const start = performance.now() - progressRef.current * ANIMATION_DURATION_MS;

		const animate = (now) => {
			const nextProgress = ((now - start) % ANIMATION_DURATION_MS) / ANIMATION_DURATION_MS;
			progressRef.current = nextProgress;
			setProgress(nextProgress);
			frameId = window.requestAnimationFrame(animate);
		};

		frameId = window.requestAnimationFrame(animate);
		return () => window.cancelAnimationFrame(frameId);
	}, [isPlaying]);

	// Update marker position along the real path
	useEffect(() => {
		const pathElement = letterPathRef.current;
		if (!pathElement) return;

		const pathLength = pathElement.getTotalLength();
		const point = pathElement.getPointAtLength(progress * pathLength);
		setMarkerPosition({ x: point.x, y: point.y });
	}, [progress]);

	// Reset tracing
	const handleReset = () => {
		progressRef.current = 0;
		setProgress(0);
		setMarkerPosition(START_MARKER);
		setIsPlaying(false);
	};

	// Audio pronunciation (Sinhala 'ට')
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
				aria-label='ආපසු මුල් පිටුවට'
			>
				←
			</button>

			{/* Decorative stars (same as 'අ' page) */}
			<div className='dg-floating-stars' aria-hidden='true'>
				<button type='button' className='dg-star-btn'
				 onClick={()=>{
					setShowGuide(true);   // show nodes
                    setIsPlaying(true);   // start animation
				 }}>⭐</button>
				<button type='button' className='dg-star-btn'>⭐</button>
				<button type='button' className='dg-star-btn'>⭐</button>
			</div>

			<section className='dg-stage'>
				<header className='dg-header'>
					<p className='dg-chip'>🖊️ අත්අකුරු පුහුණුව</p>
					<h1>‘ට’ අක්ෂරය හුරු කරමු</h1>
					<p>පහත රේඛා ඔස්සේ චලනය වන මාර්කර් එක අනුගමනය කරන්න.</p>
				</header>
				

				<div className='dg-canvas-wrap'>
					<svg
						className='dg-canvas'
						viewBox='0 0 640 600'
						role='img'
						aria-label='සිංහල අකුර ට ලිවීමේ ආකෘතිය'
					>
						{/* Background – not needed because parent .dg-shell provides the gradient */}

						{/* Show tracing guides only if blindMode is OFF */}
						{!blindMode && (
							<>
								{/* Main path (visible dashed guide) */}
								<path d={TA_GUIDE_PATH} className='dg-chain-path' />

								{/* Extra guide lines (optional, to help with orientation) */}

								{/* Hidden reference path for animation */}
								<path
									d={TA_GUIDE_PATH}
									ref={letterPathRef}
									className='dg-rail-path'   // invisible, used only for measurements
									style={{ stroke: 'none', fill: 'none' }}
								/>

								{/* Progress overlay (fills as animation runs) */}
								<path
									d={TA_GUIDE_PATH}
									className='dg-progress-path'
									pathLength='1'
									style={{ strokeDashoffset: `${1 - progress}` }}
								/>

								{showGuide && (
									<>
										{/* Start node */}
										<circle
										cx={START_MARKER.x}
										cy={START_MARKER.y}
										r='22'
										className='dg-node'
										/>
										<text
										x={START_MARKER.x}
										y={START_MARKER.y + 6}
										textAnchor='middle'
										fontSize='20'
										>
										⭐
										</text>

										{/* End node */}
										<circle
										cx={END_MARKER.x}
										cy={END_MARKER.y}
										r='22'
										className='dg-node'
										/>
										<text
										x={END_MARKER.x}
										y={END_MARKER.y + 6}
										textAnchor='middle'
										fontSize='20'
										>
										⭐
										</text>
									</>
									)}

								{/* Animated marker */}
								<circle cx={markerPosition.x} cy={markerPosition.y} r='22' className='dg-node dg-node-active' />
								<text x={markerPosition.x} y={markerPosition.y + 6} textAnchor='middle' className='dg-node-icon' style={{ fontSize: '18px' }}>
									🐘
								</text>
							</>
						)}

						{/* If blindMode is ON, we show only a minimal hint */}
						{blindMode && (
							<text x='320' y='300' textAnchor='middle' fill='white' fontSize='20' fontFamily='sans-serif'>
								🔇 අන්ධ මාදිලිය - මාර්කර් එක සඟවා ඇත
							</text>
						)}
					</svg>
				</div>

				<div className='dg-controls'>
					<button
						type='button'
						className='dg-ctl-btn dg-ctl-primary'
						onClick={() => setIsPlaying((prev) => !prev)}
					>
						{isPlaying ? '⏸️ නවත්වන්න' : '▶️ ආරම්භ කරන්න'}
					</button>
					<button type='button' className='dg-ctl-btn dg-ctl-secondary' onClick={handleReset}>
						🔄 නැවත අඳින්න
					</button>
				</div>

				<p className='dg-hint'>
					💡 ඉඟිය: රන්වන් මාර්කර් එක අනුගමනය කරමින් ඔබේ ඇඟිල්ල හෝ මූසිකය තිරය මත ගෙනයන්න.
					{blindMode && ' (දැනට මාර්කර් සඟවා ඇත – මතකයෙන් ලිවීමට උත්සාහ කරන්න)'}
				</p>
			</section>
		</main>
	);
};

export default DysgraphiaLetterTA;