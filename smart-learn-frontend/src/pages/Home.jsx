import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useAuth from "../hooks/useAuth";
import logoImg from "../assets/images/logo without back.png";

const LETTER_COLORS = [
  "#ff4d6d",
  "#ff7b00",
  "#ffd60a",
  "#2dc653",
  "#00b4d8",
  "#4361ee",
  "#9b5de5",
  "#f15bb5",
  "#43aa8b",
  "#f3722c",
];

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const title = "SMART LEARN";

  useEffect(() => {
    const timerId = setTimeout(() => {
      navigate(isAuthenticated ? "/modules" : "/login");
    }, 5000);

    return () => clearTimeout(timerId);
  }, [isAuthenticated, navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(160deg, #FFF1C9 0%, #FFD6A5 25%, #FFAFCC 55%, #C3B1E1 80%, #B5EAD7 100%)",
        fontFamily: "'Nunito', 'Poppins', Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          textAlign: "center",
          padding: "20px 24px",
        }}
      >
        <motion.img
          src={logoImg}
          alt="Smart Learn"
          initial={{ opacity: 0, y: -16, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            width: "clamp(140px, 28vw, 220px)",
            filter: "drop-shadow(0 8px 28px rgba(0,0,0,0.18))",
          }}
        />

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
          style={{
            fontSize: "clamp(2.3rem, 8vw, 4rem)",
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: "0.04em",
            margin: 0,
            display: "flex",
            gap: "0.06em",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {title.split("").map((char, i) => (
            <motion.span
              key={`${char}-${i}`}
              initial={{ y: 0 }}
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 1.5,
                delay: i * 0.05,
                repeat: Infinity,
                repeatDelay: 0.2,
                ease: "easeInOut",
              }}
              style={{
                color: char === " " ? "transparent" : LETTER_COLORS[i % LETTER_COLORS.length],
                textShadow: char === " " ? "none" : "0 2px 8px rgba(0,0,0,0.18)",
                minWidth: char === " " ? "0.35em" : undefined,
              }}
            >
              {char}
            </motion.span>
          ))}
        </motion.h1>
      </div>
    </div>
  );
};

export default Home;
