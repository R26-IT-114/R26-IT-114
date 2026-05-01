import React, { useState, useEffect } from "react";
import { animals } from "../utils/gamedata";
import AnimalCard from "./AnimalCard";

const GardenJourney = () => {
  const [questionAnimal, setQuestionAnimal] = useState(null);
  const [options, setOptions] = useState([]);
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [usedAnimals, setUsedAnimals] = useState([]);
  const audioRef = React.useRef(null);

  const MAX_ROUNDS = animals.length; // 8 animals = 8 rounds

  // pick random animal (only unused ones)
  const generateQuestion = () => {
    // Check if game should end (all animals used)
    if (usedAnimals.length >= MAX_ROUNDS) {
      setGameFinished(true);
      return;
    }

    // Get animals that haven't been used yet
    const availableAnimals = animals.filter(
      animal => !usedAnimals.includes(animal.id)
    );

    if (availableAnimals.length === 0) {
      setGameFinished(true);
      return;
    }

    // Pick random from available animals
    const selected = availableAnimals[
      Math.floor(Math.random() * availableAnimals.length)
    ];

    // Get 3 other random options (can be used or unused)
    const otherAnimals = animals.filter(a => a.id !== selected.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    setQuestionAnimal(selected);
    setOptions([selected, ...otherAnimals].sort(() => 0.5 - Math.random()));
    setMessage("");
    setAnswered(false);
    setSelectedId(null);
    setShowCorrectAnswer(false);
    setShowCelebration(false);
    setTotalRounds(prev => prev + 1);
    setUsedAnimals(prev => [...prev, selected.id]);

    setTimeout(() => {
      playSound(selected.sound);
    }, 300);
  };

  // play sound from file
  const playSound = (soundPath) => {
    if (audioRef.current) {
      audioRef.current.src = soundPath;
      audioRef.current.play().catch(err => console.log("Audio play error:", err));
    }
  };

  // check answer
  const handleAnswer = (animal) => {
    if (answered) return;

    setSelectedId(animal.id);
    const isAnswerCorrect = animal.id === questionAnimal.id;
    
    setAnswered(true);
    setIsCorrect(isAnswerCorrect);

    if (isAnswerCorrect) {
      setMessage("✅ හරි!");
      setScore(prev => prev + 1);
      setShowCelebration(true);
      setTimeout(() => {
        if (usedAnimals.length >= MAX_ROUNDS) {
          setGameFinished(true);
        } else {
          generateQuestion();
        }
      }, 3000);
    } else {
      setMessage("❌ අයිතෙයි!");
      setShowCorrectAnswer(true);
      setTimeout(() => {
        if (usedAnimals.length >= MAX_ROUNDS) {
          setGameFinished(true);
        } else {
          generateQuestion();
        }
      }, 4000);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setGameFinished(false);
    setScore(0);
    setTotalRounds(0);
    setUsedAnimals([]);
    setMessage("");
    setQuestionAnimal(null);
    setOptions([]);
    setAnswered(false);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameFinished(false);
    setScore(0);
    setTotalRounds(0);
    setMessage("");
    setQuestionAnimal(null);
    setOptions([]);
    setAnswered(false);
    setUsedAnimals([]);
  };

  const playAgain = () => {
    startGame();
  };

  useEffect(() => {
    if (gameStarted && !questionAnimal && !gameFinished) {
      generateQuestion();
    }
  }, [gameStarted, gameFinished]);

  // Results Screen
  if (gameFinished) {
    const percentage = Math.round((score / MAX_ROUNDS) * 100);
    let gradeMessage = "";
    let gradeEmoji = "";
    let gradeColor = "";

    if (percentage === 100) {
      gradeMessage = "ප්‍රශංසනීය! ඉතා හොඳ ක්‍රීඩාවක්!";
      gradeEmoji = "🌟⭐🎖️";
      gradeColor = "#FFD700";
    } else if (percentage >= 87) {
      gradeMessage = "ඉතා හොඳ! ඔබ කිසිවෙකු වග නොබලා සිටින්නේ නැත!";
      gradeEmoji = "🏆🌠";
      gradeColor = "#1E90FF";
    } else if (percentage >= 75) {
      gradeMessage = "හොඳ! නැවතත් උත්සාහ කරමු!";
      gradeEmoji = "👏🎉";
      gradeColor = "#32CD32";
    } else if (percentage >= 62) {
      gradeMessage = "නරකටම නැත! ඔබ පතිත්පතිට යමුද!";
      gradeEmoji = "💪🤗";
      gradeColor = "#FFA500";
    } else {
      gradeMessage = "ගමනක් නෑ! ඉතා පහ දෙස්සරින් නැවතත් උත්සාහ කරන්න!";
      gradeEmoji = "💯🎓";
      gradeColor = "#FF6347";
    }

    return (
      <main className='page-shell' style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", minHeight: "100vh" }}>
        <section className='container' style={{ 
          paddingTop: "80px", 
          textAlign: "center",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          paddingBottom: "40px"
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "30px",
            padding: "60px 50px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            maxWidth: "600px",
            animation: "slideDown 0.6s ease-out"
          }}>
            <h1 style={{ 
              fontSize: "56px", 
              margin: "0 0 30px 0",
              animation: "celebration 0.8s ease-out"
            }}>
              🎊 ක්‍රීඩා අවසන්!
            </h1>

            <div style={{
              fontSize: "120px",
              marginBottom: "30px",
              animation: "bounce 0.8s ease-out infinite"
            }}>
              {gradeEmoji}
            </div>

            <div style={{
              backgroundColor: "#f0f8ff",
              borderRadius: "20px",
              padding: "40px",
              marginBottom: "40px",
              border: `4px solid ${gradeColor}`
            }}>
              <h2 style={{
                fontSize: "48px",
                color: gradeColor,
                margin: "0 0 20px 0",
                fontWeight: "bold"
              }}>
                {score}/{MAX_ROUNDS}
              </h2>
              <p style={{
                fontSize: "24px",
                color: "#333",
                margin: "0 0 20px 0",
                fontWeight: "bold"
              }}>
                සාර්ථකතාවය: {percentage}%
              </p>
              <p style={{
                fontSize: "20px",
                color: gradeColor,
                margin: "0",
                fontStyle: "italic",
                fontWeight: "bold"
              }}>
                {gradeMessage}
              </p>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
              marginBottom: "20px"
            }}>
              <button 
                onClick={playAgain}
                style={{
                  padding: "18px 30px",
                  fontSize: "18px",
                  fontWeight: "bold",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "15px",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  boxShadow: "0 10px 25px rgba(40, 167, 69, 0.4)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 15px 35px rgba(40, 167, 69, 0.6)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 10px 25px rgba(40, 167, 69, 0.4)";
                }}
              >
                🔄 නැවතත් ක්‍රීඩා කරන්න
              </button>
              <button 
                onClick={resetGame}
                style={{
                  padding: "18px 30px",
                  fontSize: "18px",
                  fontWeight: "bold",
                  backgroundColor: "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "15px",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  boxShadow: "0 10px 25px rgba(102, 126, 234, 0.4)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 15px 35px rgba(102, 126, 234, 0.6)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 10px 25px rgba(102, 126, 234, 0.4)";
                }}
              >
                🏠 මුල් පිටුවට
              </button>
            </div>

            <style>{`
              @keyframes slideDown {
                from {
                  opacity: 0;
                  transform: translateY(-40px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              @keyframes celebration {
                0% { transform: scale(0) rotate(-360deg); }
                100% { transform: scale(1) rotate(0); }
              }
              @keyframes bounce {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
              }
            `}</style>
          </div>
        </section>
      </main>
    );
  }

  if (!gameStarted) {
    return (
      <main className='page-shell' style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
        <section className='container' style={{ 
          paddingTop: "80px", 
          textAlign: "center",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "30px",
            padding: "50px 40px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            maxWidth: "500px"
          }}>
            <h1 style={{ 
              fontSize: "48px", 
              color: "#667eea",
              margin: "0 0 20px 0"
            }}>
              🌳 ගෙවත්තේ චාරිකාවය
            </h1>
            <p style={{ 
              fontSize: "20px", 
              color: "#555",
              marginBottom: "30px",
              lineHeight: "1.6"
            }}>
              සතාන්ගේ ශබ්දය අසා නිවැරදි සතාන් තෝරන්න
            </p>
            <div style={{
              backgroundColor: "#f0f8ff",
              borderLeft: "5px solid #667eea",
              padding: "20px",
              borderRadius: "10px",
              marginBottom: "30px",
              textAlign: "left"
            }}>
              <p style={{ margin: "0", color: "#333", fontSize: "16px", fontWeight: "bold" }}>
                🎮 ගිනුම් නීතිය:
              </p>
              <ul style={{ margin: "10px 0 0 0", paddingLeft: "20px", color: "#555", fontSize: "15px" }}>
                <li>🔊 8 සතාන්ගේ ශබ්දය අසන්න</li>
                <li>🖼️ නිවැරදි සතා තෝරන්න</li>
                <li>⭐ ඔබේ ලකුණු ලබා ගන්න</li>
                <li>🏆 සෑම සතා එක් වරක් පමණි</li>
              </ul>
            </div>
            <button 
              onClick={startGame}
              style={{
                padding: "18px 50px",
                fontSize: "22px",
                fontWeight: "bold",
                backgroundColor: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "15px",
                cursor: "pointer",
                transition: "all 0.3s",
                boxShadow: "0 10px 25px rgba(102, 126, 234, 0.4)",
                width: "100%"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 15px 35px rgba(102, 126, 234, 0.6)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 25px rgba(102, 126, 234, 0.4)";
              }}
            >
              ▶ ගනන් ඇරඹුවෙමු!
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className='page-shell' style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", minHeight: "100vh" }}>
      <section className='container' style={{ paddingTop: "30px", paddingBottom: "40px" }}>
        {/* Celebration Animation */}
        {showCelebration && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 100,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column"
          }}>
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: "20px",
                  height: "20px",
                  backgroundColor: ["#FFD700", "#FF69B4", "#00CED1", "#32CD32", "#FF6347"][i % 5],
                  borderRadius: "50%",
                  animation: `confetti ${Math.random() * 1 + 1.5}s ease-out forwards`,
                  left: `${Math.random() * 100}%`,
                  top: "-20px"
                }}
              />
            ))}
            <div style={{
              fontSize: "80px",
              animation: "celebration 1s ease-out forwards"
            }}>
              ⭐✨🎉
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{
          backgroundColor: "rgba(255,255,255,0.95)",
          borderRadius: "20px",
          padding: "25px",
          marginBottom: "30px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px"
        }}>
          <h1 style={{ 
            fontSize: "32px", 
            color: "#667eea",
            margin: "0",
            display: "flex",
            alignItems: "center",
            gap: "15px"
          }}>
            🌳 ගෙවත්තේ චාරිකාවය
          </h1>
          
          <div style={{
            display: "flex",
            gap: "30px",
            alignItems: "center"
          }}>
            <div style={{
              backgroundColor: "#fff3cd",
              padding: "12px 20px",
              borderRadius: "12px",
              fontSize: "18px",
              fontWeight: "bold",
              color: "#856404"
            }}>
              ⭐ ගණන්: <span style={{ color: "#667eea" }}>{score}/{totalRounds}</span>
            </div>
            <div style={{
              backgroundColor: "#e7f3ff",
              padding: "12px 20px",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "bold",
              color: "#0066cc"
            }}>
              🎯 ඉතිරි: {MAX_ROUNDS - totalRounds}
            </div>
          </div>
        </div>

        {/* Sound Button */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <button 
            onClick={() => questionAnimal && playSound(questionAnimal.sound)}
            disabled={answered}
            style={{
              padding: "20px 50px",
              fontSize: "24px",
              fontWeight: "bold",
              backgroundColor: answered ? "#cccccc" : "#28a745",
              color: "white",
              border: "none",
              borderRadius: "18px",
              cursor: answered ? "not-allowed" : "pointer",
              marginBottom: "20px",
              transition: "all 0.3s",
              boxShadow: answered ? "0 5px 15px rgba(0,0,0,0.1)" : "0 10px 30px rgba(40, 167, 69, 0.4)",
              display: "inline-block",
              opacity: answered ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!answered) {
                e.currentTarget.style.transform = "scale(1.08)";
                e.currentTarget.style.boxShadow = "0 15px 40px rgba(40, 167, 69, 0.6)";
              }
            }}
            onMouseLeave={(e) => {
              if (!answered) {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(40, 167, 69, 0.4)";
              }
            }}
          >
            🔊 ශබ්දය අසන්න
          </button>
          <p style={{ color: "white", fontSize: "16px", margin: "10px 0 0 0", opacity: 0.9 }}>
            {answered ? "ඔබේ පිළිතුර ඇතුළු කර ඇත..." : "සතා ගැසිමට ඉහත බොතාම ක්ලික් කරන්න"}
          </p>
        </div>

        {/* Question */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "18px",
          padding: "25px",
          marginBottom: "35px",
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ 
            fontSize: "22px",
            color: "#667eea",
            margin: "0 0 10px 0"
          }}>
            අයිතෙයි, එම සතා කුමක්ද?
          </h2>
          <p style={{ color: "#999", margin: "0", fontSize: "14px" }}>
            ඉහත ශබ්දය අසා නිවැරදි පිළිතුර තෝරන්න
          </p>
        </div>

        {/* Animal Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "25px",
            marginBottom: "35px",
            justifyItems: "center"
          }}
        >
          {options.map((animal) => (
            <AnimalCard
              key={animal.id}
              animal={animal}
              onClick={handleAnswer}
              isSelected={selectedId === animal.id}
              isCorrect={isCorrect && selectedId === animal.id}
              showAsCorrect={showCorrectAnswer && animal.id === questionAnimal.id}
              disabled={answered}
            />
          ))}
        </div>

        {/* Correct Answer Display */}
        {showCorrectAnswer && !isCorrect && (
          <div style={{
            backgroundColor: "#d4edda",
            border: "3px solid #28a745",
            borderRadius: "18px",
            padding: "25px",
            textAlign: "center",
            marginBottom: "30px",
            animation: "slideDown 0.4s ease-out"
          }}>
            <h3 style={{ 
              fontSize: "32px",
              margin: "0 0 10px 0",
              color: "#28a745"
            }}>
              ✨ නිවැරදි පිළිතුර:
            </h3>
            <p style={{ 
              fontSize: "28px",
              margin: "10px 0 0 0",
              color: "#155724",
              fontWeight: "bold"
            }}>
              {questionAnimal?.name}
            </p>
            {questionAnimal?.sinhalaDesc && (
              <p style={{ 
                fontSize: "14px",
                margin: "10px 0 0 0",
                color: "#155724",
                fontStyle: "italic"
              }}>
                ({questionAnimal.sinhalaDesc})
              </p>
            )}
          </div>
        )}

        {/* Feedback */}
        {message && (
          <div style={{
            backgroundColor: isCorrect ? "#d4edda" : "#f8d7da",
            border: `3px solid ${isCorrect ? "#28a745" : "#dc3545"}`,
            borderRadius: "18px",
            padding: "30px",
            textAlign: "center",
            marginBottom: "30px",
            animation: "slideDown 0.4s ease-out"
          }}>
            <h2 style={{ 
              fontSize: "48px",
              margin: "0 0 10px 0",
              animation: "bounce 0.6s ease-out"
            }}>
              {message}
            </h2>
            {isCorrect && (
              <p style={{ color: "#155724", margin: "0", fontSize: "18px", fontWeight: "bold" }}>
                පුරුසමි! ඔබ නිවැරදිව උත්තර දුන්න! 🎉
              </p>
            )}
            {!isCorrect && (
              <p style={{ color: "#721c24", margin: "0", fontSize: "18px", fontWeight: "bold" }}>
                ගමනක් නෑ! ඔබ එය පහ දෙස්සරින් ඉගෙන ගනු ඇත! 💪
              </p>
            )}
          </div>
        )}

        {answered && (
          <div style={{
            textAlign: "center",
            color: "white",
            fontSize: "14px",
            marginTop: "20px",
            animation: "pulse 1s ease-in-out infinite"
          }}>
            ⏳ ඊළඟ සතා මතක් වෙමින්...
          </div>
        )}

        <audio ref={audioRef} />

        <style>{`
          @keyframes bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes confetti {
            to {
              transform: translateY(100vh) rotateZ(720deg);
              opacity: 0;
            }
          }
          @keyframes celebration {
            0% {
              transform: scale(0);
              opacity: 0;
            }
            50% {
              transform: scale(1.2);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </section>
    </main>
  );
};

export default GardenJourney;
