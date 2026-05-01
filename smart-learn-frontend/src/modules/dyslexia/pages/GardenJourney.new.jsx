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
  const [answered, setAnswered] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const audioRef = React.useRef(null);

  // pick random animal
  const generateQuestion = () => {
    const shuffled = [...animals].sort(() => 0.5 - Math.random());
    const selected = shuffled[0];
    setQuestionAnimal(selected);
    setOptions(shuffled.slice(0, 4));
    setMessage("");
    setAnswered(false);
    setSelectedId(null);
    setShowCorrectAnswer(false);
    setShowCelebration(false);
    setTotalRounds(prev => prev + 1);

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
    if (answered) return; // Prevent multiple clicks

    setSelectedId(animal.id);
    const isAnswerCorrect = animal.id === questionAnimal.id;
    
    setAnswered(true);
    setIsCorrect(isAnswerCorrect);

    if (isAnswerCorrect) {
      setMessage("✅ හරි!");
      setScore(prev => prev + 1);
      setShowCelebration(true);
      // Auto move to next after 3 seconds
      setTimeout(() => {
        generateQuestion();
      }, 3000);
    } else {
      setMessage("❌ අයිතෙයි!");
      setShowCorrectAnswer(true);
      // Show correct answer, then auto move after 4 seconds
      setTimeout(() => {
        generateQuestion();
      }, 4000);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setTotalRounds(0);
    generateQuestion();
  };

  const resetGame = () => {
    setGameStarted(false);
    setScore(0);
    setTotalRounds(0);
    setMessage("");
    setQuestionAnimal(null);
    setOptions([]);
    setAnswered(false);
  };

  useEffect(() => {
    if (gameStarted && !questionAnimal) {
      generateQuestion();
    }
  }, [gameStarted]);

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
              marginBottom: "20px",
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
              <p style={{ margin: "0", color: "#333", fontSize: "16px" }}>
                <strong>🎮 ගිනුම් නීතිය:</strong>
              </p>
              <ul style={{ margin: "10px 0 0 0", paddingLeft: "20px", color: "#555" }}>
                <li>🔊 ශබ්දය අසන්න</li>
                <li>🖼️ සතා තෝරන්න</li>
                <li>⭐ ඔබේ ප්‍රගතිය නිරීක්ෂණය කරන්න</li>
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
            {/* Confetti */}
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
            {/* Stars */}
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
            <button
              onClick={resetGame}
              style={{
                padding: "10px 20px",
                fontSize: "14px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.3s",
                fontWeight: "bold"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#c82333"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#dc3545"}
            >
              🏠 නැවත ඇරඹුවෙන්න
            </button>
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
