import React, { useState, useEffect } from 'react';
import { matchingImages } from '../utils/matchingImages';

const ImageMatcher = () => {
	const [leftAnimals, setLeftAnimals] = useState([]);
	const [rightAnimals, setRightAnimals] = useState([]);
	const [selectedLeft, setSelectedLeft] = useState(null);
	const [selectedRight, setSelectedRight] = useState(null);
	const [matches, setMatches] = useState([]);
	const [score, setScore] = useState(0);
	const [gameStarted, setGameStarted] = useState(false);
	const [gameFinished, setGameFinished] = useState(false);
	const [moves, setMoves] = useState(0);
	const [message, setMessage] = useState('');
	const [showCelebration, setShowCelebration] = useState(false);
	const [matchedPairs, setMatchedPairs] = useState([]);
	const [connectionLines, setConnectionLines] = useState([]);

	const initializeGame = () => {
		// Shuffle animals for both sides
		const shuffledLeft = [...matchingImages].sort(() => 0.5 - Math.random());
		const shuffledRight = [...matchingImages].sort(() => 0.5 - Math.random());

		setLeftAnimals(shuffledLeft);
		setRightAnimals(shuffledRight);
		setSelectedLeft(null);
		setSelectedRight(null);
		setMatches([]);
		setScore(0);
		setMoves(0);
		setMessage('');
		setGameStarted(true);
		setGameFinished(false);
		setShowCelebration(false);
		setMatchedPairs([]);
		setConnectionLines([]);
	};

	// Play sound effect
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
			} else if (type === 'error') {
				oscillator.frequency.value = 400;
				gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
				gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
				oscillator.start(audioContext.currentTime);
				oscillator.stop(audioContext.currentTime + 0.15);
			}
		} catch (e) {
			// Audio context not available
		}
	};

	const handleLeftClick = (index) => {
		if (gameFinished || matches.includes(`left-${index}`)) {
			return;
		}
		setSelectedLeft(index);
		setSelectedRight(null);
		setMessage('');
	};

	const handleRightClick = (index) => {
		if (gameFinished || matches.includes(`right-${index}`)) {
			return;
		}

		if (selectedLeft === null) {
			setMessage('👈 ඉඩ පසින් සතා තෝරා ගනිමු!');
			return;
		}

		const isMatch = leftAnimals[selectedLeft].id === rightAnimals[index].id;

		if (isMatch) {
			playSound('success');
			const newMatches = [...matches, `left-${selectedLeft}`, `right-${index}`];
			setMatches(newMatches);
			setMatchedPairs([...matchedPairs, { left: selectedLeft, right: index }]);
			setScore(score + 1);
			setMessage('✅ හරි! 🎉');
			setShowCelebration(true);
			setSelectedLeft(null);
			setSelectedRight(null);
			setMoves(moves + 1);

			// Check if game finished
			setTimeout(() => {
				if (newMatches.length === 8) {
					setGameFinished(true);
					setShowCelebration(true);
				} else {
					setShowCelebration(false);
					setTimeout(() => setMessage(''), 800);
				}
			}, 1000);
		} else {
			playSound('error');
			setMessage('❌ නැවතත්!');
			setSelectedRight(index);
			setMoves(moves + 1);

			setTimeout(() => {
				setSelectedLeft(null);
				setSelectedRight(null);
				setMessage('');
			}, 1500);
		}
	};

	const handlePlayAgain = () => {
		initializeGame();
	};

	const handleGoHome = () => {
		setGameStarted(false);
		setGameFinished(false);
		setLeftAnimals([]);
		setRightAnimals([]);
		setMatches([]);
		setScore(0);
		setMoves(0);
		setMessage('');
		setSelectedLeft(null);
		setSelectedRight(null);
	};

	if (!gameStarted) {
		return (
			<main
				className='page-shell'
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
						background: 'white',
						borderRadius: '50px',
						padding: '70px 50px',
						textAlign: 'center',
						boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
						border: '8px solid #FF6B9D',
						maxWidth: '550px',
						animation: 'slideInUp 0.6s ease-out',
					}}
				>
					<div style={{ fontSize: '140px', marginBottom: '20px', animation: 'bounce 1.2s infinite' }}>🎨</div>
					<h1
						style={{
							fontSize: '52px',
							background: 'linear-gradient(135deg, #FF6B9D 0%, #FFB800 100%)',
							WebkitBackgroundClip: 'text',
							WebkitTextFillColor: 'transparent',
							margin: '0 0 15px 0',
							fontWeight: '900',
						}}
					>
						පින්තූර ගළපමු
					</h1>
					<p
						style={{
							fontSize: '26px',
							color: '#00CC99',
							margin: '0 0 10px 0',
							fontWeight: 'bold',
						}}
					>
						🖼️ සමාන පින්තූර සොයා ගනිමු!
					</p>
					<p
						style={{
							fontSize: '16px',
							color: '#666',
							margin: '0 0 45px 0',
							lineHeight: '1.6',
							fontWeight: '500',
						}}
					>
						ඉඩ පසින් එක් පින්තූරයක් තෝරා, දකුණු පසින් සමාන පින්තූරයක් සොයා ගනිමු. සියල්ල ගැසිටු කරමු! 🎯
					</p>
					<button
						onClick={initializeGame}
						style={{
							background: 'linear-gradient(135deg, #FF6B9D 0%, #FFB800 100%)',
							color: 'white',
							border: 'none',
							borderRadius: '30px',
							padding: '18px 60px',
							fontSize: '26px',
							fontWeight: '900',
							cursor: 'pointer',
							boxShadow: '0 12px 30px rgba(255, 107, 157, 0.35)',
							transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
						}}
						onMouseEnter={(e) => {
							e.target.style.transform = 'scale(1.1) translateY(-3px)';
							e.target.style.boxShadow = '0 18px 45px rgba(255, 107, 157, 0.45)';
						}}
						onMouseLeave={(e) => {
							e.target.style.transform = 'scale(1) translateY(0)';
							e.target.style.boxShadow = '0 12px 30px rgba(255, 107, 157, 0.35)';
						}}
					>
						▶ ඉතිරි කරමු! 🎉
					</button>
				</div>

				<style>{`
					@keyframes slideInUp {
						from {
							opacity: 0;
							transform: translateY(40px);
						}
						to {
							opacity: 1;
							transform: translateY(0);
						}
					}
					@keyframes bounce {
						0%, 100% { transform: translateY(0) scale(1); }
						50% { transform: translateY(-25px) scale(1.1); }
					}
				`}</style>
			</main>
		);
	}

	if (gameFinished) {
		const accuracy = Math.round((score / 4) * 100);
		let gradeEmoji = '';
		let gradeMsg = '';
		let performance = '';

		if (accuracy === 100) {
			gradeEmoji = '🌟⭐🎖️';
			gradeMsg = 'ඉතා හොඳයි!';
			performance = 'පරිපූර්ණ!';
		} else if (accuracy >= 87) {
			gradeEmoji = '🏆🌠';
			gradeMsg = 'ඉතා හොඳයි!';
			performance = 'අসාධාරණ!';
		} else if (accuracy >= 75) {
			gradeEmoji = '👏🎉';
			gradeMsg = 'හොඳයි!';
			performance = 'හොඳ!';
		} else if (accuracy >= 62) {
			gradeEmoji = '💪🤗';
			gradeMsg = 'ඉතා හොඳයි!';
			performance = 'ෙතරනම්!';
		} else {
			gradeEmoji = '💯🎓';
			gradeMsg = 'නැවතත් උත්සාහ කරමු!';
			performance = 'නැවතත් උත්සාහ කරමු!';
		}

		return (
			<main
				className='page-shell'
				style={{
					background: 'linear-gradient(135deg, #FF6B9D 0%, #FFC43F 100%)',
					minHeight: '100vh',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					padding: '20px',
				}}
			>
				<div
					style={{
						background: 'white',
						borderRadius: '30px',
						padding: '60px 40px',
						textAlign: 'center',
						boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
						border: '6px solid #4D96FF',
						maxWidth: '600px',
						animation: 'slideInUp 0.6s ease-out',
					}}
				>
					<div style={{ fontSize: '100px', marginBottom: '20px', animation: 'bounce 1s infinite' }}>
						{gradeEmoji}
					</div>
					<h2
						style={{
							fontSize: '48px',
							color: '#FF6B9D',
							margin: '0 0 20px 0',
							fontWeight: 'bold',
						}}
					>
						{gradeMsg}
					</h2>
					<p
						style={{
							fontSize: '20px',
							color: '#666',
							margin: '0 0 30px 0',
							fontStyle: 'italic',
						}}
					>
						{performance}
					</p>

					{/* Stats Cards */}
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(3, 1fr)',
							gap: '15px',
							margin: '30px 0',
						}}
					>
						<div
							style={{
								background: 'linear-gradient(135deg, #6BCB77 0%, #4D96FF 100%)',
								borderRadius: '15px',
								padding: '20px',
								color: 'white',
								boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
							}}
						>
							<div style={{ fontSize: '28px', fontWeight: 'bold' }}>{score}/4</div>
							<div style={{ fontSize: '14px', marginTop: '5px' }}>ල​කුණු</div>
						</div>
						<div
							style={{
								background: 'linear-gradient(135deg, #FF6B9D 0%, #D946FF 100%)',
								borderRadius: '15px',
								padding: '20px',
								color: 'white',
								boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
							}}
						>
							<div style={{ fontSize: '28px', fontWeight: 'bold' }}>{accuracy}%</div>
							<div style={{ fontSize: '14px', marginTop: '5px' }}>නිරවද්යතා</div>
						</div>
						<div
							style={{
								background: 'linear-gradient(135deg, #FFC43F 0%, #FF6B9D 100%)',
								borderRadius: '15px',
								padding: '20px',
								color: 'white',
								boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
							}}
						>
							<div style={{ fontSize: '28px', fontWeight: 'bold' }}>{moves}</div>
							<div style={{ fontSize: '14px', marginTop: '5px' }}>උත්සාහයන්</div>
						</div>
					</div>

					<div
						style={{
							display: 'flex',
							gap: '20px',
							justifyContent: 'center',
							marginTop: '40px',
						}}
					>
						<button
							onClick={handlePlayAgain}
							style={{
								background: 'linear-gradient(135deg, #6BCB77 0%, #4D96FF 100%)',
								color: 'white',
								border: '4px solid white',
								borderRadius: '15px',
								padding: '15px 30px',
								fontSize: '18px',
								fontWeight: 'bold',
								cursor: 'pointer',
								boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
								transition: 'all 0.3s',
							}}
							onMouseEnter={(e) => {
								e.target.style.transform = 'scale(1.08)';
								e.target.style.boxShadow = '0 15px 35px rgba(0,0,0,0.3)';
							}}
							onMouseLeave={(e) => {
								e.target.style.transform = 'scale(1)';
								e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
							}}
						>
							🔄 නැවතත්
						</button>
						<button
							onClick={handleGoHome}
							style={{
								background: 'linear-gradient(135deg, #FF6B9D 0%, #FFC43F 100%)',
								color: 'white',
								border: '4px solid white',
								borderRadius: '15px',
								padding: '15px 30px',
								fontSize: '18px',
								fontWeight: 'bold',
								cursor: 'pointer',
								boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
								transition: 'all 0.3s',
							}}
							onMouseEnter={(e) => {
								e.target.style.transform = 'scale(1.08)';
								e.target.style.boxShadow = '0 15px 35px rgba(0,0,0,0.3)';
							}}
							onMouseLeave={(e) => {
								e.target.style.transform = 'scale(1)';
								e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
							}}
						>
							🏠 නැවත
						</button>
					</div>
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
					@keyframes bounce {
						0%, 100% { transform: translateY(0); }
						50% { transform: translateY(-20px); }
					}
				`}</style>
			</main>
		);
	}

	return (
		<main
			className='page-shell'
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
					marginBottom: '30px',
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
					🎨 පින්තූර ගළපමු
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
							width: `${(score / 4) * 100}%`,
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
					<span>ល​ុණු: {score}/4</span>
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px' }}>
						<span style={{ fontSize: '22px' }}>🎯</span>
						<span>වාර: {moves}</span>
					</div>
				</div>
			</div>

			{/* Matching Container */}
			<div
				style={{
					maxWidth: '900px',
					margin: '0 auto',
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
					gap: '30px',
					padding: '30px',
					background: 'rgba(255, 255, 255, 0.15)',
					borderRadius: '35px',
					border: '5px solid rgba(255, 255, 255, 0.4)',
					backdropFilter: 'blur(15px)',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				{/* Left Side */}
				<div style={{ display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'center' }}>
					<div style={{ fontSize: '28px', fontWeight: '900', color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>👈 ඉඩ පසින්</div>
					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
						{leftAnimals.map((animal, index) => {
							const isMatched = matches.includes(`left-${index}`);
							const isSelected = selectedLeft === index;
							return (
								<div
									key={index}
									onClick={() => handleLeftClick(index)}
									style={{
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										justifyContent: 'center',
										width: '130px',
										height: '130px',
										padding: '12px',
										borderRadius: '28px',
										background: isMatched
											? 'linear-gradient(135deg, #00D966 0%, #00B850 100%)'
											: isSelected
												? 'white'
												: 'linear-gradient(135deg, #FF6B9D 0%, #FF8FB1 100%)',
										border: isMatched
											? '4px solid white'
											: isSelected
												? '5px solid #FFB800'
												: '4px solid white',
										cursor: isMatched ? 'default' : 'pointer',
										transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
										opacity: isMatched ? 0.6 : 1,
										transform: isSelected ? 'scale(1.12) rotateZ(-3deg)' : 'scale(1) rotateZ(0deg)',
										boxShadow: isSelected
											? '0 12px 35px rgba(0,0,0,0.35)'
											: '0 8px 20px rgba(0,0,0,0.2)',
										position: 'relative',
										overflow: 'hidden',
									}}
									onMouseEnter={(e) => {
										if (!isMatched) {
											e.currentTarget.style.transform = 'scale(1.15) rotateZ(-3deg)';
											e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.4)';
										}
									}}
									onMouseLeave={(e) => {
										if (!isMatched) {
											e.currentTarget.style.transform = isSelected ? 'scale(1.12) rotateZ(-3deg)' : 'scale(1) rotateZ(0deg)';
											e.currentTarget.style.boxShadow = isSelected ? '0 12px 35px rgba(0,0,0,0.35)' : '0 8px 20px rgba(0,0,0,0.2)';
										}
									}}
								>
									{isMatched && (
										<div
											style={{
												position: 'absolute',
												top: '50%',
												left: '50%',
												transform: 'translate(-50%, -50%)',
												fontSize: '50px',
												animation: 'scaleIn 0.6s ease-out',
											}}
										>
											✓
										</div>
									)}
									<img 
										src={animal.image} 
										alt="matching image"
										style={{ 
											width: '90px', 
											height: '90px', 
											objectFit: 'contain',
											opacity: isMatched ? 0.3 : 1,
											transition: 'opacity 0.3s'
										}}
									/>
								</div>
							);
						})}
					</div>
				</div>

				{/* Right Side */}
				<div style={{ display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'center' }}>
					<div style={{ fontSize: '28px', fontWeight: '900', color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>දකුණු පසින් 👉</div>
					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
						{rightAnimals.map((animal, index) => {
							const isMatched = matches.includes(`right-${index}`);
							const isSelected = selectedRight === index;
							return (
								<div
									key={index}
									onClick={() => handleRightClick(index)}
									style={{
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										justifyContent: 'center',
										width: '130px',
										height: '130px',
										padding: '12px',
										borderRadius: '28px',
										background: isMatched
											? 'linear-gradient(135deg, #00D966 0%, #00B850 100%)'
											: isSelected
												? 'white'
												: 'linear-gradient(135deg, #0099FF 0%, #00CCFF 100%)',
										border: isMatched
											? '4px solid white'
											: isSelected
												? '5px solid #FFB800'
												: '4px solid white',
										cursor: isMatched ? 'default' : 'pointer',
										transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
										opacity: isMatched ? 0.6 : 1,
										transform: isSelected ? 'scale(1.12) rotateZ(3deg)' : 'scale(1) rotateZ(0deg)',
										boxShadow: isSelected
											? '0 12px 35px rgba(0,0,0,0.35)'
											: '0 8px 20px rgba(0,0,0,0.2)',
										position: 'relative',
										overflow: 'hidden',
									}}
									onMouseEnter={(e) => {
										if (!isMatched) {
											e.currentTarget.style.transform = 'scale(1.15) rotateZ(3deg)';
											e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.4)';
										}
									}}
									onMouseLeave={(e) => {
										if (!isMatched) {
											e.currentTarget.style.transform = isSelected ? 'scale(1.12) rotateZ(3deg)' : 'scale(1) rotateZ(0deg)';
											e.currentTarget.style.boxShadow = isSelected ? '0 12px 35px rgba(0,0,0,0.35)' : '0 8px 20px rgba(0,0,0,0.2)';
										}
									}}
								>
									{isMatched && (
										<div
											style={{
												position: 'absolute',
												top: '50%',
												left: '50%',
												transform: 'translate(-50%, -50%)',
												fontSize: '50px',
												animation: 'scaleIn 0.6s ease-out',
											}}
										>
											✓
										</div>
									)}
									<img 
										src={animal.image} 
										alt="matching image"
										style={{ 
											width: '90px', 
											height: '90px', 
											objectFit: 'contain',
											opacity: isMatched ? 0.3 : 1,
											transition: 'opacity 0.3s'
										}}
									/>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			{/* Message */}
			{message && (
				<div
					style={{
						textAlign: 'center',
						marginTop: '30px',
						fontSize: '40px',
						fontWeight: 'bold',
						color: 'white',
						animation: showCelebration ? 'pulse 0.6s infinite' : 'slideInDown 0.4s ease-out',
						textShadow: '0 3px 10px rgba(0,0,0,0.3)',
					}}
				>
					{message}
				</div>
			)}

			<style>{`
				@keyframes pulse {
					0%, 100% { transform: scale(1); }
					50% { transform: scale(1.25); }
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
				@keyframes scaleIn {
					from {
						opacity: 0;
						transform: translate(-50%, -50%) scale(0);
					}
					to {
						opacity: 1;
						transform: translate(-50%, -50%) scale(1);
					}
				}
			`}</style>
		</main>
	);
};

export default ImageMatcher;
