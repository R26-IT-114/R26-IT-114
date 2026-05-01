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
      }, 5000);
    } else {
      setMessage("❌ නිවැරදි සතා හඳුනාගමු!");
      setShowCorrectAnswer(true);
      setTimeout(() => {
        if (usedAnimals.length >= MAX_ROUNDS) {
          setGameFinished(true);
        } else {
          generateQuestion();
        }
      }, 6000);
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
      gradeMessage = "ඉතා හොඳයි!";
      gradeEmoji = "🌟⭐🎖️";
      gradeColor = "#FFD700";
    } else if (percentage >= 87) {
      gradeMessage = "ඉතා හොඳයි!";
      gradeEmoji = "🏆🌠";
      gradeColor = "#1E90FF";
    } else if (percentage >= 75) {
      gradeMessage = "හොඳයි! නැවතත් උත්සාහ කරමු!";
      gradeEmoji = "👏🎉";
      gradeColor = "#32CD32";
    } else if (percentage >= 62) {
      gradeMessage = "හොඳයි! නැවතත් උත්සාහ කරමු!";
      gradeEmoji = "💪🤗";
      gradeColor = "#FFA500";
    } else {
      gradeMessage = "නැවතත් උත්සාහ කරමු!";
      gradeEmoji = "💯🎓";
      gradeColor = "#FF6347";
    }

    return (
      <main className='page-shell' style={{ 
        background: "linear-gradient(180deg, #87CEEB 0%, #E0F6FF 40%, #90EE90 70%, #228B22 100%)",
        minHeight: "100vh",
        overflow: "hidden",
        position: "relative"
      }}>
        {/* Animated Background */}
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}>
          {/* Clouds */}
          {[...Array(3)].map((_, i) => (
            <div
              key={`cloud-${i}`}
              style={{
                position: "absolute",
                width: "120px",
                height: "50px",
                backgroundColor: "rgba(255,255,255,0.7)",
                borderRadius: "50px",
                top: `${10 + i * 20}%`,
                left: `${i * 35}%`,
                animation: `floatCloud ${15 + i * 3}s infinite linear`,
                boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
              }}
            />
          ))}

          {/* Butterflies */}
          {[...Array(5)].map((_, i) => (
            <div
              key={`butterfly-${i}`}
              style={{
                position: "absolute",
                fontSize: "24px",
                animation: `butterfly ${8 + i * 2}s infinite cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
                top: `${Math.random() * 40}%`,
                left: `${i * 20}%`,
                opacity: 0.8
              }}
            >
              🦋
            </div>
          ))}

          {/* Flowers */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`flower-${i}`}
              style={{
                position: "absolute",
                fontSize: "30px",
                bottom: "5%",
                left: `${i * 12.5}%`,
                animation: `sway ${3 + i % 2}s ease-in-out infinite`,
                transformOrigin: "bottom center",
                opacity: 0.7
              }}
            >
              🌻
            </div>
          ))}
        </div>

        <section className='container' style={{ 
          paddingTop: "80px", 
          textAlign: "center",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          paddingBottom: "40px",
          position: "relative",
          zIndex: 10
        }}>
          <div style={{
            backgroundColor: "rgba(255,255,255,0.98)",
            borderRadius: "40px",
            padding: "70px 60px",
            boxShadow: "0 30px 70px rgba(0,0,0,0.25)",
            maxWidth: "650px",
            border: "6px solid #FFD700",
            animation: "slideInUp 0.8s ease-out"
          }}>
            <h1 style={{ 
              fontSize: "64px", 
              margin: "0 0 30px 0",
              animation: "celebration 1s ease-out",
              textShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}>
              🎊 සෙල්ලම අවසන්! 🎊
            </h1>

            <div style={{
              fontSize: "140px",
              marginBottom: "40px",
              animation: "bounce 1s ease-out infinite",
              textShadow: "0 8px 20px rgba(0,0,0,0.15)"
            }}>
              {gradeEmoji}
            </div>

            <div style={{
              background: `linear-gradient(135deg, ${gradeColor}22 0%, ${gradeColor}44 100%)`,
              borderRadius: "30px",
              padding: "50px",
              marginBottom: "40px",
              border: `5px solid ${gradeColor}`,
              boxShadow: `0 15px 40px ${gradeColor}44`
            }}>
              <h2 style={{
                fontSize: "56px",
                color: gradeColor,
                margin: "0 0 25px 0",
                fontWeight: "bold",
                textShadow: "0 3px 8px rgba(0,0,0,0.1)"
              }}>
                {score}/{MAX_ROUNDS}
              </h2>
              <p style={{
                fontSize: "28px",
                color: "#333",
                margin: "0 0 25px 0",
                fontWeight: "bold"
              }}>
                සාර්ථකතාවය: {percentage}%
              </p>
              <p style={{
                fontSize: "24px",
                color: gradeColor,
                margin: "0",
                fontStyle: "italic",
                fontWeight: "bold",
                textShadow: "0 2px 5px rgba(0,0,0,0.1)"
              }}>
                {gradeMessage}
              </p>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "20px"
            }}>
              <button 
                onClick={playAgain}
                style={{
                  padding: "22px 30px",
                  fontSize: "20px",
                  fontWeight: "bold",
                  background: "linear-gradient(135deg, #32CD32 0%, #228B22 100%)",
                  backgroundImage: "linear-gradient(135deg, #32CD32 0%, #228B22 100%)",
                  color: "white",
                  border: "4px solid #155724",
                  borderRadius: "18px",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  boxShadow: "0 12px 30px rgba(50, 205, 50, 0.4)",
                  textShadow: "0 2px 5px rgba(0,0,0,0.2)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px) scale(1.05)";
                  e.currentTarget.style.boxShadow = "0 18px 40px rgba(50, 205, 50, 0.6)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = "0 12px 30px rgba(50, 205, 50, 0.4)";
                }}
              >
                🔄 නැවතත් සෙල්ලම කරන්න
              </button>
              <button 
                onClick={resetGame}
                style={{
                  padding: "22px 30px",
                  fontSize: "20px",
                  fontWeight: "bold",
                  background: "linear-gradient(135deg, #87CEEB 0%, #4DD0E1 100%)",
                  backgroundImage: "linear-gradient(135deg, #87CEEB 0%, #4DD0E1 100%)",
                  color: "white",
                  border: "4px solid #0288D1",
                  borderRadius: "18px",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  boxShadow: "0 12px 30px rgba(76, 175, 80, 0.4)",
                  textShadow: "0 2px 5px rgba(0,0,0,0.2)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px) scale(1.05)";
                  e.currentTarget.style.boxShadow = "0 18px 40px rgba(76, 175, 80, 0.6)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = "0 12px 30px rgba(76, 175, 80, 0.4)";
                }}
              >
                🏠 මුල් පිටුවට
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
              @keyframes celebration {
                0% { transform: scale(0) rotate(-360deg); opacity: 0; }
                100% { transform: scale(1) rotate(0); opacity: 1; }
              }
              @keyframes bounce {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
              }
              @keyframes floatCloud {
                from {
                  left: -120px;
                }
                to {
                  left: 100vw;
                }
              }
              @keyframes butterfly {
                0%, 100% { transform: translateY(0) translateX(0); }
                25% { transform: translateY(-30px) translateX(20px); }
                50% { transform: translateY(-60px) translateX(0); }
                75% { transform: translateY(-30px) translateX(-20px); }
              }
              @keyframes sway {
                0%, 100% { transform: rotate(0deg) translateX(0); }
                25% { transform: rotate(2deg) translateX(3px); }
                75% { transform: rotate(-2deg) translateX(-3px); }
              }
            `}</style>
          </div>
        </section>
      </main>
    );
  }

  if (!gameStarted) {
    return (
      <main className='page-shell' style={{ 
        background: "linear-gradient(180deg, #87CEEB 0%, #E0F6FF 40%, #90EE90 70%, #228B22 100%)",
        minHeight: "100vh",
        overflow: "hidden",
        position: "relative"
      }}>
        {/* Animated Background */}
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}>
          {/* Clouds */}
          {[...Array(3)].map((_, i) => (
            <div
              key={`cloud-${i}`}
              style={{
                position: "absolute",
                width: "120px",
                height: "50px",
                backgroundColor: "rgba(255,255,255,0.7)",
                borderRadius: "50px",
                top: `${10 + i * 20}%`,
                left: `${i * 35}%`,
                animation: `floatCloud ${15 + i * 3}s infinite linear`,
                boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                transform: i % 2 === 0 ? "scaleX(-1)" : "scaleX(1)"
              }}
            />
          ))}

          {/* Butterflies */}
          {[...Array(5)].map((_, i) => (
            <div
              key={`butterfly-${i}`}
              style={{
                position: "absolute",
                fontSize: "24px",
                animation: `butterfly ${8 + i * 2}s infinite cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
                top: `${Math.random() * 40}%`,
                left: `${i * 20}%`,
                opacity: 0.8
              }}
            >
              🦋
            </div>
          ))}

          {/* Flowers */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`flower-${i}`}
              style={{
                position: "absolute",
                fontSize: "30px",
                bottom: "5%",
                left: `${i * 12.5}%`,
                animation: `sway ${3 + i % 2}s ease-in-out infinite`,
                transformOrigin: "bottom center",
                opacity: 0.7
              }}
            >
              🌻
            </div>
          ))}

          {/* Trees */}
          {[...Array(2)].map((_, i) => (
            <div
              key={`tree-${i}`}
              style={{
                position: "absolute",
                fontSize: "60px",
                top: "15%",
                left: i === 0 ? "5%" : "85%",
                opacity: 0.5,
                animation: "gentleSway 4s ease-in-out infinite"
              }}
            >
              🌳
            </div>
          ))}
        </div>

        <section className='container' style={{ 
          paddingTop: "80px", 
          textAlign: "center",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          zIndex: 10
        }}>
          <div style={{
            backgroundColor: "rgba(255,255,255,0.98)",
            borderRadius: "40px",
            padding: "60px 50px",
            boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
            maxWidth: "550px",
            border: "6px solid #90EE90",
            animation: "slideInUp 0.8s ease-out"
          }}>
            <h1 style={{ 
              fontSize: "56px",
              background: "linear-gradient(135deg, #228B22 0%, #32CD32 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: "0 0 20px 0",
              animation: "bounce 0.8s ease-out"
            }}>
              🌳 ගෙවත්තේ චාරිකාවය 🌸
            </h1>
            <p style={{ 
              fontSize: "24px", 
              color: "#555",
              marginBottom: "50px",
              lineHeight: "1.8",
              fontWeight: "500"
            }}>
              🌻 ශබ්දය අසා නිවැරදි සත්තු තෝරමු 🐛
            </p>
            <button 
              onClick={startGame}
              style={{
                padding: "22px 60px",
                fontSize: "26px",
                fontWeight: "bold",
                background: "linear-gradient(135deg, #32CD32 0%, #228B22 100%)",
                backgroundImage: "linear-gradient(135deg, #32CD32 0%, #228B22 100%)",
                color: "white",
                border: "4px solid #155724",
                borderRadius: "20px",
                cursor: "pointer",
                transition: "all 0.3s",
                boxShadow: "0 15px 40px rgba(50, 205, 50, 0.4)",
                width: "100%",
                textShadow: "0 3px 8px rgba(0,0,0,0.2)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.08)";
                e.currentTarget.style.boxShadow = "0 20px 50px rgba(50, 205, 50, 0.6)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 15px 40px rgba(50, 205, 50, 0.4)";
              }}
            >
              ▶ සෙල්ලම කරමු! 🎉
            </button>
          </div>
        </section>

        <style>{`
          @keyframes bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.08); }
          }
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
          @keyframes floatCloud {
            from {
              left: -120px;
            }
            to {
              left: 100vw;
            }
          }
          @keyframes butterfly {
            0%, 100% { transform: translateY(0) translateX(0); }
            25% { transform: translateY(-30px) translateX(20px); }
            50% { transform: translateY(-60px) translateX(0); }
            75% { transform: translateY(-30px) translateX(-20px); }
          }
          @keyframes sway {
            0%, 100% { transform: rotate(0deg) translateX(0); }
            25% { transform: rotate(2deg) translateX(3px); }
            75% { transform: rotate(-2deg) translateX(-3px); }
          }
          @keyframes gentleSway {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(3deg); }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className='page-shell' style={{ 
      background: "linear-gradient(180deg, #87CEEB 0%, #E0F6FF 40%, #90EE90 70%, #228B22 100%)",
      minHeight: "100vh",
      overflow: "hidden",
      position: "relative"
    }}>
      {/* Animated Background Elements */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}>
        {/* Clouds */}
        {[...Array(3)].map((_, i) => (
          <div
            key={`cloud-${i}`}
            style={{
              position: "absolute",
              width: "120px",
              height: "50px",
              backgroundColor: "rgba(255,255,255,0.7)",
              borderRadius: "50px",
              top: `${10 + i * 20}%`,
              left: `${i * 35}%`,
              animation: `floatCloud ${15 + i * 3}s infinite linear`,
              boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
              transform: i % 2 === 0 ? "scaleX(-1)" : "scaleX(1)"
            }}
          />
        ))}

        {/* Animated Butterflies */}
        {[...Array(5)].map((_, i) => (
          <div
            key={`butterfly-${i}`}
            style={{
              position: "absolute",
              fontSize: "24px",
              animation: `butterfly ${8 + i * 2}s infinite cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
              top: `${Math.random() * 40}%`,
              left: `${i * 20}%`,
              opacity: 0.8
            }}
          >
            🦋
          </div>
        ))}

        {/* Animated Flowers on ground */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`flower-${i}`}
            style={{
              position: "absolute",
              fontSize: "30px",
              bottom: "5%",
              left: `${i * 12.5}%`,
              animation: `sway ${3 + i % 2}s ease-in-out infinite`,
              transformOrigin: "bottom center",
              opacity: 0.7
            }}
          >
            🌻
          </div>
        ))}

        {/* Decorative Trees */}
        {[...Array(2)].map((_, i) => (
          <div
            key={`tree-${i}`}
            style={{
              position: "absolute",
              fontSize: "60px",
              top: "15%",
              left: i === 0 ? "5%" : "85%",
              opacity: 0.5,
              animation: "gentleSway 4s ease-in-out infinite"
            }}
          >
            🌳
          </div>
        ))}
      </div>

      <section className='container' style={{ paddingTop: "30px", paddingBottom: "40px", position: "relative", zIndex: 10 }}>
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
            {[...Array(30)].map((_, i) => (
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
              fontSize: "100px",
              animation: "celebration 1s ease-out forwards",
              textShadow: "0 5px 20px rgba(0,0,0,0.2)"
            }}>
              ⭐✨🎉
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{
          backgroundColor: "rgba(255,255,255,0.95)",
          borderRadius: "30px",
          padding: "25px",
          marginBottom: "30px",
          boxShadow: "0 15px 40px rgba(0,0,0,0.15)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
          border: "4px solid #90EE90",
          animation: "slideInDown 0.8s ease-out"
        }}>
          <h1 style={{ 
            fontSize: "36px", 
            background: "linear-gradient(135deg, #228B22 0%, #32CD32 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: "0",
            display: "flex",
            alignItems: "center",
            gap: "15px",
            fontWeight: "bold"
          }}>
            🌳🌸 ගෙවත්තේ චාරිකාවය 🌻🐛
          </h1>
          
          <div style={{
            display: "flex",
            gap: "30px",
            alignItems: "center",
            flexWrap: "wrap"
          }}>
            <div style={{
              backgroundColor: "linear-gradient(135deg, #FFE135 0%, #FFC700 100%)",
              backgroundImage: "linear-gradient(135deg, #FFE135 0%, #FFC700 100%)",
              padding: "15px 25px",
              borderRadius: "20px",
              fontSize: "18px",
              fontWeight: "bold",
              color: "#333",
              boxShadow: "0 8px 15px rgba(255, 193, 7, 0.3)",
              animation: "pulse 2s ease-in-out infinite",
              border: "3px solid #FFA500"
            }}>
              ⭐ ගණන්: <span style={{ color: "#228B22", fontSize: "22px" }}>{score}/{totalRounds}</span>
            </div>
            <div style={{
              backgroundColor: "linear-gradient(135deg, #87CEEB 0%, #4DD0E1 100%)",
              backgroundImage: "linear-gradient(135deg, #87CEEB 0%, #4DD0E1 100%)",
              padding: "15px 25px",
              borderRadius: "20px",
              fontSize: "18px",
              fontWeight: "bold",
              color: "#003366",
              boxShadow: "0 8px 15px rgba(76, 175, 80, 0.3)",
              animation: "pulse 2.5s ease-in-out infinite",
              border: "3px solid #0288D1"
            }}>
              🎯 ඉතිරි: {MAX_ROUNDS - totalRounds}
            </div>
          </div>
        </div>

        {/* Sound Button */}
        <div style={{ textAlign: "center", marginBottom: "40px", animation: "fadeInUp 0.8s ease-out 0.2s both" }}>
          <button 
            onClick={() => questionAnimal && playSound(questionAnimal.sound)}
            disabled={answered}
            style={{
              padding: "25px 60px",
              fontSize: "28px",
              fontWeight: "bold",
              background: answered ? "#cccccc" : "linear-gradient(135deg, #32CD32 0%, #228B22 100%)",
              backgroundImage: answered ? "none" : "linear-gradient(135deg, #32CD32 0%, #228B22 100%)",
              color: "white",
              border: "4px solid #155724",
              borderRadius: "25px",
              cursor: answered ? "not-allowed" : "pointer",
              marginBottom: "20px",
              transition: "all 0.3s",
              boxShadow: answered ? "0 5px 15px rgba(0,0,0,0.1)" : "0 15px 40px rgba(50, 205, 50, 0.4)",
              display: "inline-block",
              opacity: answered ? 0.6 : 1,
              textShadow: "0 3px 8px rgba(0,0,0,0.2)"
            }}
            onMouseEnter={(e) => {
              if (!answered) {
                e.currentTarget.style.transform = "scale(1.12) rotateY(10deg)";
                e.currentTarget.style.boxShadow = "0 20px 50px rgba(50, 205, 50, 0.6)";
              }
            }}
            onMouseLeave={(e) => {
              if (!answered) {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 15px 40px rgba(50, 205, 50, 0.4)";
              }
            }}
          >
            🔊 ශබ්දය අසන්න
          </button>
          <p style={{ color: "white", fontSize: "18px", margin: "10px 0 0 0", opacity: 0.95, fontWeight: "bold", textShadow: "0 2px 5px rgba(0,0,0,0.2)" }}>
            {answered ? "⏳ ඔබේ පිළිතුර ඇතුළු කර ඇත..." : "🎧 නැවත ඇසීමට බොත්තම ඔබන්න"}
          </p>
        </div>

        {/* Question */}
        <div style={{
          backgroundColor: "rgba(255,255,255,0.95)",
          borderRadius: "25px",
          padding: "30px",
          marginBottom: "35px",
          textAlign: "center",
          boxShadow: "0 15px 40px rgba(0,0,0,0.15)",
          border: "4px solid #FFD700",
          animation: "slideInUp 0.8s ease-out 0.1s both",
          background: "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,250,205,0.95) 100%)"
        }}>
          <h2 style={{ 
            fontSize: "28px",
            background: "linear-gradient(135deg, #FF8C00 0%, #FF6347 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: "0 0 15px 0",
            fontWeight: "bold"
          }}>
            🎵 නැවත, එම සතා කුමක්ද?
          </h2>
          <p style={{ color: "#666", margin: "0", fontSize: "16px", fontWeight: "500" }}>
            🎧 ඉහත ශබ්දය අසා නිවැරදි පිළිතුර තෝරන්න
          </p>
        </div>

        {/* Animal Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "30px",
            marginBottom: "35px",
            justifyItems: "center",
            padding: "20px",
            animation: "fadeIn 0.8s ease-out 0.3s both"
          }}
        >
          {options.map((animal, index) => (
            <div key={animal.id} style={{ animation: `slideInUp 0.6s ease-out ${0.4 + index * 0.1}s both` }}>
              <AnimalCard
                animal={animal}
                onClick={handleAnswer}
                isSelected={selectedId === animal.id}
                isCorrect={isCorrect && selectedId === animal.id}
                showAsCorrect={showCorrectAnswer && animal.id === questionAnimal.id}
                disabled={answered}
              />
            </div>
          ))}
        </div>

        {/* Correct Answer Display */}
        {showCorrectAnswer && !isCorrect && (
          <div style={{
            background: "linear-gradient(135deg, #90EE90 0%, #98FB98 100%)",
            border: "5px solid #228B22",
            borderRadius: "25px",
            padding: "40px",
            textAlign: "center",
            marginBottom: "30px",
            animation: "slideInDown 0.5s ease-out",
            boxShadow: "0 15px 40px rgba(34, 139, 34, 0.3)"
          }}>
            <h3 style={{ 
              fontSize: "36px",
              margin: "0 0 25px 0",
              color: "#155724",
              textShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
              ✨ නිවැරදි පිළිතුර:
            </h3>
            {questionAnimal?.image && (
              <div style={{
                margin: "20px 0",
                display: "flex",
                justifyContent: "center"
              }}>
                <img 
                  src={questionAnimal.image}
                  alt={questionAnimal.name}
                  style={{
                    maxWidth: "200px",
                    maxHeight: "200px",
                    borderRadius: "15px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                    border: "4px solid white"
                  }}
                />
              </div>
            )}
            <p style={{ 
              fontSize: "32px",
              margin: "20px 0 0 0",
              color: "#155724",
              fontWeight: "bold",
              textShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
              {questionAnimal?.name}
            </p>
            {questionAnimal?.sinhalaDesc && (
              <p style={{ 
                fontSize: "16px",
                margin: "10px 0 0 0",
                color: "#155724",
                fontStyle: "italic",
                fontWeight: "500"
              }}>
                ({questionAnimal.sinhalaDesc})
              </p>
            )}
          </div>
        )}

        {/* Feedback */}
        {message && (
          <div style={{
            background: isCorrect ? "linear-gradient(135deg, #90EE90 0%, #7FFF7F 100%)" : "linear-gradient(135deg, #FFB6C6 0%, #FFA07A 100%)",
            border: `5px solid ${isCorrect ? "#228B22" : "#DC143C"}`,
            borderRadius: "25px",
            padding: "40px 30px",
            textAlign: "center",
            marginBottom: "30px",
            animation: "slideInUp 0.5s ease-out",
            boxShadow: isCorrect ? "0 15px 40px rgba(34, 139, 34, 0.3)" : "0 15px 40px rgba(220, 20, 60, 0.3)"
          }}>
            <h2 style={{ 
              fontSize: "56px",
              margin: "0 0 15px 0",
              animation: "bounce 0.6s ease-out",
              textShadow: "0 3px 8px rgba(0,0,0,0.1)"
            }}>
              {message}
            </h2>
            {isCorrect && (
              <p style={{ color: "#155724", margin: "0", fontSize: "22px", fontWeight: "bold", textShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                🌟 ඉතා හොඳයි!! ඔබ නිවැරදිව උත්තර දුන්නා! 🎉
              </p>
            )}
            {!isCorrect && (
              <p style={{ color: "#721c24", margin: "0", fontSize: "22px", fontWeight: "bold", textShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                💪 කමක් නෑ! නැවත සෙල්ලම් කරමු!
              </p>
            )}
          </div>
        )}

        {answered && (
          <div style={{
            textAlign: "center",
            color: "white",
            fontSize: "16px",
            marginTop: "20px",
            animation: "pulse 1s ease-in-out infinite",
            fontWeight: "bold",
            textShadow: "0 2px 5px rgba(0,0,0,0.2)"
          }}>
            ⏳ ......... 🐛
          </div>
        )}

        <audio ref={audioRef} />

        <style>{`
          @keyframes bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.15); }
          }
          @keyframes slideInDown {
            from {
              opacity: 0;
              transform: translateY(-30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
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
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
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
              transform: scale(0) rotate(-180deg);
              opacity: 0;
            }
            50% {
              transform: scale(1.3);
            }
            100% {
              transform: scale(1) rotate(0);
              opacity: 1;
            }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes floatCloud {
            from {
              left: -120px;
            }
            to {
              left: 100vw;
            }
          }
          @keyframes butterfly {
            0%, 100% { transform: translateY(0) translateX(0); }
            25% { transform: translateY(-30px) translateX(20px); }
            50% { transform: translateY(-60px) translateX(0); }
            75% { transform: translateY(-30px) translateX(-20px); }
          }
          @keyframes sway {
            0%, 100% { transform: rotate(0deg) translateX(0); }
            25% { transform: rotate(2deg) translateX(3px); }
            75% { transform: rotate(-2deg) translateX(-3px); }
          }
          @keyframes gentleSway {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(3deg); }
          }
        `}</style>
      </section>
    </main>
  );
};

export default GardenJourney;
