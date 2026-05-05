import { useState, useEffect } from 'react';
import { imageHuntPairs } from '../data/imageHuntData';

const ImageHunt = () => {
	const [currentRound, setCurrentRound] = useState(0);
	const [score, setScore] = useState(0);
	const [gameStarted, setGameStarted] = useState(false);
	const [gameFinished, setGameFinished] = useState(false);
	const [moves, setMoves] = useState(0);
	const [message, setMessage] = useState('');
	const [showCelebration, setShowCelebration] = useState(false);
	const [selectedOption, setSelectedOption] = useState(null);
	const [correctAnswer, setCorrectAnswer] = useState(null);
	const [shuffledOptions, setShuffledOptions] = useState([]);
	const [roundFeedback, setRoundFeedback] = useState('');

	// Shuffle array
	const shuffleArray = (array) => {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	};

	// Start game
	const startGame = () => {
		setGameStarted(true);
		setCurrentRound(0);
		setScore(0);
		setMoves(0);
		loadRound(0);
	};

	// Load round
	const loadRound = (roundIndex) => {
		if (roundIndex < imageHuntPairs.length) {
			const pair = imageHuntPairs[roundIndex];
			const options = shuffleArray([pair.smallImage, ...pair.distractors]);
			setShuffledOptions(options);
			setCorrectAnswer(pair.smallImage);
			setSelectedOption(null);
			setRoundFeedback('');
		}
	};

	// Handle option click
	const handleOptionClick = (option) => {
		if (selectedOption !== null || roundFeedback !== '') return;

		setSelectedOption(option);
		setMoves(moves + 1);

		if (option === correctAnswer) {
			setScore(score + 1);
			setRoundFeedback('✓ නිවුණු සිටින්න! ඇබ්බැහි වුණා!');
			setShowCelebration(true);
			playSound('success');

			setTimeout(() => {
				if (currentRound + 1 < imageHuntPairs.length) {
					setCurrentRound(currentRound + 1);
					loadRound(currentRound + 1);
					setShowCelebration(false);
				} else {
					finishGame();
				}
			}, 1500);
		} else {
			setRoundFeedback('❌ නැවත පයත්නම් කරමු!');
			playSound('error');

			setTimeout(() => {
				setSelectedOption(null);
				setRoundFeedback('');
			}, 1000);
		}
	};

	// Finish game
	const finishGame = () => {
		setGameFinished(true);
		const accuracy = (score / imageHuntPairs.length) * 100;
		let grade = '💪';
		if (accuracy === 100) grade = '🌟 නිර්ණයිත!';
		else if (accuracy >= 75) grade = '🏆 නිවුණු!';
		else if (accuracy >= 50) grade = '👏 හොඳයි!';

		setMessage(grade);
		setShowCelebration(true);
	};

	// Play sound
	const playSound = (type) => {
		try {
			const audioContext = new (window.AudioContext || window.webkitAudioContext)();
			const oscillator = audioContext.createOscillator();
			const gainNode = audioContext.createGain();

			oscillator.connect(gainNode);
			gainNode.connect(audioContext.destination);

			if (type === 'success') {
				oscillator.frequency.value = 800;
				gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
				gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
				oscillator.start(audioContext.currentTime);
				oscillator.stop(audioContext.currentTime + 0.2);
			} else {
				oscillator.frequency.value = 400;
				gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
				gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
				oscillator.start(audioContext.currentTime);
				oscillator.stop(audioContext.currentTime + 0.15);
			}
		} catch (e) {
			console.log('Audio context not available');
		}
	};

	// Reset game
	const resetGame = () => {
		setGameStarted(false);
		setGameFinished(false);
		setCurrentRound(0);
		setScore(0);
		setMoves(0);
		setMessage('');
		setSelectedOption(null);
		setCorrectAnswer(null);
		setShowCelebration(false);
		setRoundFeedback('');
	};

	if (!gameStarted) {
		return (
			<main
				style={{
					background: 'linear-gradient(135deg, #00D9FF 0%, #00CC99 100%)',
					minHeight: '100vh',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					padding: '20px',
				}}
			>
				<div
					style={{
						textAlign: 'center',
						background: 'rgba(255, 255, 255, 0.15)',
						backdropFilter: 'blur(15px)',
						borderRadius: '40px',
						padding: '50px 40px',
						border: '5px solid rgba(255, 255, 255, 0.4)',
						maxWidth: '500px',
					}}
				>
					<div style={{ fontSize: '100px', marginBottom: '30px' }}>🔍🖼️</div>
					<h1
						style={{
							fontSize: '48px',
							color: 'white',
							margin: '0 0 20px 0',
							fontWeight: '900',
							textShadow: '0 3px 10px rgba(0,0,0,0.2)',
						}}
					>
						පින්තූර සොයා ගනිමු
					</h1>
					<p
						style={{
							fontSize: '24px',
							color: 'white',
							margin: '0 0 40px 0',
							fontWeight: '600',
							textShadow: '0 2px 6px rgba(0,0,0,0.2)',
						}}
					>
						බොහෝ පින්තූරෙ නිල් පින්තූරය සොයා ගන්න!
					</p>
					<button
						onClick={startGame}
						style={{
							background: 'linear-gradient(135deg, #FF6B9D 0%, #FFB800 100%)',
							color: 'white',
							border: 'none',
							padding: '18px 50px',
							fontSize: '24px',
							fontWeight: '900',
							borderRadius: '30px',
							cursor: 'pointer',
							boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
							transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.transform = 'scale(1.1) translateY(-3px)';
							e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.3)';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.transform = 'scale(1) translateY(0)';
							e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
						}}
					>
						ඉතුරු කරමු 🎮
					</button>
				</div>

				<style>{`
					@keyframes pulse {
						0%, 100% { transform: scale(1); }
						50% { transform: scale(1.1); }
					}
				`}</style>
			</main>
		);
	}

	if (gameFinished) {
		const accuracy = (score / imageHuntPairs.length) * 100;
		return (
			<main
				style={{
					background: 'linear-gradient(135deg, #00D9FF 0%, #00CC99 100%)',
					minHeight: '100vh',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					padding: '20px',
				}}
			>
				<div
					style={{
						textAlign: 'center',
						background: 'rgba(255, 255, 255, 0.15)',
						backdropFilter: 'blur(15px)',
						borderRadius: '40px',
						padding: '50px 40px',
						border: '5px solid rgba(255, 255, 255, 0.4)',
						maxWidth: '500px',
						animation: 'slideInDown 0.6s ease-out',
					}}
				>
					<div
						style={{
							fontSize: '100px',
							marginBottom: '30px',
							animation: showCelebration ? 'pulse 0.6s infinite' : 'none',
						}}
					>
						{message.includes('🌟') ? '🌟' : message.includes('🏆') ? '🏆' : message.includes('👏') ? '👏' : '💪'}
					</div>
					<h1
						style={{
							fontSize: '42px',
							color: 'white',
							margin: '0 0 20px 0',
							fontWeight: '900',
							textShadow: '0 3px 10px rgba(0,0,0,0.2)',
						}}
					>
						{message}
					</h1>

					<div
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(2, 1fr)',
							gap: '20px',
							margin: '40px 0',
							fontSize: '18px',
							color: 'white',
							fontWeight: '800',
							textShadow: '0 2px 6px rgba(0,0,0,0.2)',
						}}
					>
						<div style={{ background: 'rgba(255,255,255,0.2)', padding: '15px', borderRadius: '20px' }}>
							⭐ ලකුණු: {score}/4
						</div>
						<div style={{ background: 'rgba(255,255,255,0.2)', padding: '15px', borderRadius: '20px' }}>
							📊 නිරවද්යතාව: {accuracy.toFixed(0)}%
						</div>
						<div style={{ background: 'rgba(255,255,255,0.2)', padding: '15px', borderRadius: '20px' }}>
							🎯 උත්සාහයන්: {moves}
						</div>
						<div style={{ background: 'rgba(255,255,255,0.2)', padding: '15px', borderRadius: '20px' }}>
							🎮 ගයන්: 4
						</div>
					</div>

					<button
						onClick={resetGame}
						style={{
							background: 'linear-gradient(135deg, #FF6B9D 0%, #FFB800 100%)',
							color: 'white',
							border: 'none',
							padding: '16px 40px',
							fontSize: '20px',
							fontWeight: '900',
							borderRadius: '30px',
							cursor: 'pointer',
							boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
							transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.transform = 'scale(1.1) translateY(-3px)';
							e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.3)';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.transform = 'scale(1) translateY(0)';
							e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
						}}
					>
						නැවතත් කරමු 🔄
					</button>
				</div>

				<style>{`
					@keyframes pulse {
						0%, 100% { transform: scale(1); }
						50% { transform: scale(1.2); }
					}
					@keyframes slideInDown {
						from {
							opacity: 0;
							transform: translateY(-40px);
						}
						to {
							opacity: 1;
							transform: translateY(0);
						}
					}
				`}</style>
			</main>
		);
	}

	return (
		<main
			style={{
				background: 'linear-gradient(135deg, #00D9FF 0%, #00CC99 100%)',
				minHeight: '100vh',
				padding: '25px 15px 50px 15px',
			}}
		>
			{/* Header */}
			<div
				style={{
					textAlign: 'center',
					marginBottom: '25px',
					animation: 'slideInDown 0.6s ease-out',
				}}
			>
				<h1
					style={{
						color: 'white',
						fontSize: '42px',
						margin: '0 0 12px 0',
						fontWeight: '900',
						textShadow: '0 3px 10px rgba(0,0,0,0.2)',
					}}
				>
					🔍 පින්තූර සොයා ගනිමු
				</h1>

				{/* Progress Bar */}
				<div
					style={{
						background: 'rgba(255, 255, 255, 0.3)',
						height: '16px',
						borderRadius: '15px',
						overflow: 'hidden',
						marginBottom: '16px',
						maxWidth: '350px',
						margin: '0 auto 16px auto',
						border: '3px solid white',
						boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
					}}
				>
					<div
						style={{
							background: 'linear-gradient(90deg, #FF6B9D 0%, #FFB800 100%)',
							height: '100%',
							width: `${((currentRound + 1) / imageHuntPairs.length) * 100}%`,
							transition: 'width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
							borderRadius: '15px',
						}}
					/>
				</div>

				{/* Stats */}
				<div
					style={{
						display: 'flex',
						justifyContent: 'center',
						gap: '30px',
						fontSize: '18px',
						color: 'white',
						fontWeight: '800',
						textShadow: '0 2px 6px rgba(0,0,0,0.2)',
						flexWrap: 'wrap',
					}}
				>
					<div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px' }}>
						<span style={{ fontSize: '22px' }}>⭐</span>
						<span>ලකුණු: {score}/4</span>
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px' }}>
						<span style={{ fontSize: '22px' }}>🎯</span>
						<span>ගයන්: {currentRound + 1}/4</span>
					</div>
				</div>
			</div>

			{/* Game Container */}
			<div
				style={{
					maxWidth: '900px',
					margin: '0 auto',
					padding: '30px',
					background: 'rgba(255, 255, 255, 0.15)',
					borderRadius: '35px',
					border: '5px solid rgba(255, 255, 255, 0.4)',
					backdropFilter: 'blur(15px)',
				}}
			>
				{/* Large Image */}
				<div
					style={{
						textAlign: 'center',
						marginBottom: '40px',
						animation: 'slideInUp 0.6s ease-out',
					}}
				>
					<div style={{ fontSize: '24px', fontWeight: '900', color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.2)', marginBottom: '15px' }}>
						📸 මෙම පින්තූරෙ අපේ පින්තූරය සොයා ගන්න!
					</div>
					<img
						src={imageHuntPairs[currentRound].largeImage}
						alt="large"
						style={{
							maxWidth: '100%',
							height: 'auto',
							maxHeight: '350px',
							borderRadius: '25px',
							border: '5px solid white',
							boxShadow: '0 12px 35px rgba(0,0,0,0.3)',
						}}
					/>
				</div>

				{/* Options Grid */}
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(2, 1fr)',
						gap: '20px',
						marginBottom: '30px',
					}}
				>
					{shuffledOptions.map((option, index) => {
						const isCorrect = option === correctAnswer;
						const isSelected = option === selectedOption;
						const isIncorrectSelection = isSelected && !isCorrect;

						return (
							<div
								key={index}
								onClick={() => handleOptionClick(option)}
								style={{
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									justifyContent: 'center',
									width: '100%',
									padding: '15px',
									borderRadius: '25px',
									background:
										isIncorrectSelection
											? 'linear-gradient(135deg, #FF6B6B 0%, #FF8A8A 100%)'
											: isSelected && isCorrect
												? 'linear-gradient(135deg, #00D966 0%, #00B850 100%)'
												: 'linear-gradient(135deg, #0099FF 0%, #00CCFF 100%)',
									border: isSelected ? '5px solid white' : '4px solid white',
									cursor: selectedOption === null ? 'pointer' : 'default',
									transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
									opacity: selectedOption === null || isSelected ? 1 : 0.7,
									transform: isSelected ? 'scale(1.08)' : 'scale(1)',
									boxShadow: isSelected ? '0 12px 35px rgba(0,0,0,0.35)' : '0 8px 20px rgba(0,0,0,0.2)',
									position: 'relative',
									overflow: 'hidden',
								}}
								onMouseEnter={(e) => {
									if (selectedOption === null) {
										e.currentTarget.style.transform = 'scale(1.1)';
										e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.4)';
									}
								}}
								onMouseLeave={(e) => {
									if (selectedOption === null) {
										e.currentTarget.style.transform = 'scale(1)';
										e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
									}
								}}
							>
								{isSelected && isCorrect && (
									<div
										style={{
											position: 'absolute',
											top: '10px',
											right: '10px',
											fontSize: '28px',
											animation: 'scaleIn 0.6s ease-out',
										}}
									>
										✓
									</div>
								)}
								{isIncorrectSelection && (
									<div
										style={{
											position: 'absolute',
											top: '10px',
											right: '10px',
											fontSize: '28px',
											animation: 'shake 0.4s ease-out',
										}}
									>
										✗
									</div>
								)}
								<img
									src={option}
									alt="option"
									style={{
										width: '100%',
										height: '120px',
										objectFit: 'contain',
										opacity: selectedOption === null || isSelected ? 1 : 0.8,
									}}
								/>
							</div>
						);
					})}
				</div>

				{/* Feedback */}
				{roundFeedback && (
					<div
						style={{
							textAlign: 'center',
							fontSize: '28px',
							fontWeight: 'bold',
							color: 'white',
							animation: roundFeedback.includes('✓') ? 'pulse 0.6s infinite' : 'shake 0.4s ease-out',
							textShadow: '0 2px 8px rgba(0,0,0,0.3)',
						}}
					>
						{roundFeedback}
					</div>
				)}
			</div>

			<style>{`
				@keyframes slideInUp {
					from {
						opacity: 0;
						transform: translateY(30px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
				@keyframes slideInDown {
					from {
						opacity: 0;
						transform: translateY(-40px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
				@keyframes pulse {
					0%, 100% { transform: scale(1); }
					50% { transform: scale(1.2); }
				}
				@keyframes scaleIn {
					from {
						opacity: 0;
						transform: scale(0.5);
					}
					to {
						opacity: 1;
						transform: scale(1);
					}
				}
				@keyframes shake {
					0%, 100% { transform: translateX(0); }
					25% { transform: translateX(-5px); }
					75% { transform: translateX(5px); }
				}
			`}</style>
		</main>
	);
};

export default ImageHunt;
