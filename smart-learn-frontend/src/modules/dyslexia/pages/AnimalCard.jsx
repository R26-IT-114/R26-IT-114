import React from "react";

const AnimalCard = ({ animal, onClick, isSelected, isCorrect, showAsCorrect, disabled }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  let borderColor = "#e0e0e0";
  let backgroundColor = "white";
  let boxShadow = "0 5px 15px rgba(0,0,0,0.08)";

  if (showAsCorrect && !isSelected) {
    borderColor = "#28a745";
    backgroundColor = "#d4edda";
    boxShadow = "0 8px 20px rgba(40, 167, 69, 0.3)";
  } else if (isSelected && isCorrect) {
    borderColor = "#28a745";
    backgroundColor = "#d4edda";
    boxShadow = "0 8px 20px rgba(40, 167, 69, 0.4)";
  } else if (isSelected && !isCorrect) {
    borderColor = "#dc3545";
    backgroundColor = "#f8d7da";
    boxShadow = "0 8px 20px rgba(220, 53, 69, 0.3)";
  } else if (isHovered && !disabled) {
    borderColor = "#667eea";
    backgroundColor = "#f8f9ff";
    boxShadow = "0 15px 40px rgba(102, 126, 234, 0.3)";
  }

  return (
    <div
      onClick={() => !disabled && onClick(animal)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        border: `4px solid ${borderColor}`,
        borderRadius: "25px",
        padding: "25px",
        textAlign: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        width: "180px",
        backgroundColor: backgroundColor,
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        boxShadow: boxShadow,
        transform: isSelected ? "scale(0.95)" : (isHovered && !disabled ? "translateY(-10px) scale(1.05)" : "translateY(0) scale(1)"),
        position: "relative",
        overflow: "hidden",
        opacity: disabled && !isSelected ? 0.7 : 1,
      }}
    >
      {/* Hover Background Effect */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: isHovered && !disabled
          ? "radial-gradient(circle at 30% 30%, rgba(102, 126, 234, 0.1), transparent)" 
          : "transparent",
        pointerEvents: "none",
        transition: "all 0.3s"
      }} />

      {/* Correct Answer Checkmark */}
      {showAsCorrect && !isSelected && (
        <div style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          fontSize: "32px",
          animation: "bounce 0.6s ease-out"
        }}>
          ✅
        </div>
      )}

      {/* Wrong Answer X */}
      {isSelected && !isCorrect && (
        <div style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          fontSize: "32px",
          animation: "shake 0.5s ease-out"
        }}>
          ❌
        </div>
      )}

      <div style={{
        position: "relative",
        zIndex: 1
      }}>
        <div style={{
          width: "140px",
          height: "140px",
          margin: "0 auto 15px",
          borderRadius: "18px",
          overflow: "hidden",
          backgroundColor: "#f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          transform: isHovered && !disabled ? "scale(1.08)" : "scale(1)",
          transition: "transform 0.3s"
        }}>
          <img
            src={animal.image}
            alt={animal.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
        
        <p style={{ 
          fontSize: "20px", 
          fontWeight: "bold", 
          margin: "15px 0 0 0", 
          color: isSelected ? (isCorrect ? "#155724" : "#721c24") : (isHovered && !disabled ? "#667eea" : "#333"),
          transition: "color 0.3s",
          wordWrap: "break-word"
        }}>
          {animal.name}
        </p>

        {/* Hover Indicator */}
        {isHovered && !disabled && !isSelected && (
          <div style={{
            marginTop: "12px",
            fontSize: "24px",
            animation: "pulse 0.6s ease-in-out infinite"
          }}>
            ✨
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
        @keyframes bounce {
          0% { transform: scale(0); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
      `}</style>
    </div>
  );
};

export default AnimalCard;