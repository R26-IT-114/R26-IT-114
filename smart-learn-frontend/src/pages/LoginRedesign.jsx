import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Eye, EyeOff, LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { completeGoogleRedirectLogin } from "../services/firebaseAuth";
import "./LoginRedesign.css";

const GoogleIcon = () => (
  <svg aria-hidden="true" className="login-google-icon" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.38a4.6 4.6 0 0 1-2 3.02v2.53h3.24c1.9-1.75 2.98-4.33 2.98-7.39Z" />
    <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.38l-3.24-2.53c-.9.6-2.05.96-3.38.96-2.6 0-4.81-1.76-5.6-4.13H3.06v2.61A10 10 0 0 0 12 22Z" />
    <path fill="#FBBC05" d="M6.4 13.92A6 6 0 0 1 6.08 12c0-.67.11-1.32.32-1.92V7.47H3.06A10 10 0 0 0 2 12c0 1.61.39 3.14 1.06 4.53l3.34-2.61Z" />
    <path fill="#EA4335" d="M12 5.95c1.47 0 2.79.51 3.83 1.5l2.87-2.88A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.94 5.47l3.34 2.61C7.19 7.71 9.4 5.95 12 5.95Z" />
  </svg>
);

const validateField = (name, value) => {
  if (name === "email") {
    if (!value.trim()) return "විද්‍යුත් තැපැල් ලිපිනය ඇතුළත් කරන්න.";
    if (!/\S+@\S+\.\S+/.test(value)) return "වලංගු විද්‍යුත් තැපැල් ලිපිනයක් ඇතුළත් කරන්න.";
  }
  if (name === "password") {
    if (!value.trim()) return "මුරපදය ඇතුළත් කරන්න.";
    if (value.length < 6) return "මුරපදය අවම වශයෙන් අක්ෂර 6ක් විය යුතුය.";
  }
  return "";
};

const LoginRedesign = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, isAuthLoading, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate("/modules");
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    let mounted = true;
    completeGoogleRedirectLogin()
      .then((user) => user && mounted && navigate("/modules"))
      .catch((redirectError) => mounted && setError(redirectError?.message || "Google පිවිසීම සම්පූර්ණ කළ නොහැකි විය. නැවත උත්සාහ කරන්න."));
    return () => { mounted = false; };
  }, [navigate]);

  const handleChange = ({ target: { name, value } }) => {
    setFormData((current) => ({ ...current, [name]: value }));
    if (touched[name]) setFieldErrors((current) => ({ ...current, [name]: validateField(name, value) }));
  };

  const handleBlur = ({ target: { name, value } }) => {
    setTouched((current) => ({ ...current, [name]: true }));
    setFieldErrors((current) => ({ ...current, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setInfo("");
    const errors = {
      email: validateField("email", formData.email),
      password: validateField("password", formData.password),
    };
    setFieldErrors(errors);
    setTouched({ email: true, password: true });
    if (errors.email || errors.password) {
      setError("කරුණාකර දක්වා ඇති තොරතුරු නිවැරදි කරන්න.");
      return;
    }
    setIsSubmitting(true);
    try {
      await login(formData.email, formData.password, rememberMe);
      navigate("/modules");
    } catch (loginError) {
      setError(loginError?.message || "පිවිසීම අසාර්ථක විය. ඔබගේ තොරතුරු පරීක්ෂා කර නැවත උත්සාහ කරන්න.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setInfo("");
    setIsGoogleSubmitting(true);
    try {
      const googleUser = await loginWithGoogle(rememberMe);
      if (googleUser) navigate("/modules");
      else setInfo("Google පිවිසුම් පිටුව වෙත යොමු කරමින් පවතී...");
    } catch (googleError) {
      setError(googleError?.message || "Google සමඟ පිවිසීමට නොහැකි විය. නැවත උත්සාහ කරන්න.");
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <main className="login-redesign">
      <div className="login-redesign__wash" />
      <motion.section
        className="login-card"
        initial={{ opacity: 0, y: 26, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <header className="login-card__header">
          <span className="login-card__mark"><LogIn size={25} /></span>
          <h1>ඔබගේ ගිණුමට පිවිසෙන්න</h1>
          <p>ඔබගේ ඉගෙනුම් ගමන දිගටම කරගෙන යමු.</p>
        </header>

        <button className="login-google" disabled={isGoogleSubmitting || isAuthLoading} onClick={handleGoogleLogin} type="button">
          <GoogleIcon />
          {isGoogleSubmitting ? "සම්බන්ධ වෙමින්..." : "Google සමඟ පිවිසෙන්න"}
        </button>

        <div className="login-divider"><span>නැතිනම් විද්‍යුත් තැපෑල භාවිත කරන්න</span></div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            <span>විද්‍යුත් තැපැල් ලිපිනය</span>
            <input
              autoComplete="email"
              className={fieldErrors.email && touched.email ? "is-invalid" : ""}
              name="email"
              onBlur={handleBlur}
              onChange={handleChange}
              placeholder="example@gmail.com"
              type="email"
              value={formData.email}
            />
            {fieldErrors.email && touched.email && <small>{fieldErrors.email}</small>}
          </label>

          <label>
            <span>මුරපදය</span>
            <div className="login-password">
              <input
                autoComplete="current-password"
                className={fieldErrors.password && touched.password ? "is-invalid" : ""}
                name="password"
                onBlur={handleBlur}
                onChange={handleChange}
                placeholder="ඔබගේ මුරපදය ඇතුළත් කරන්න"
                type={showPassword ? "text" : "password"}
                value={formData.password}
              />
              <button aria-label={showPassword ? "මුරපදය සඟවන්න" : "මුරපදය පෙන්වන්න"} onClick={() => setShowPassword((current) => !current)} type="button">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {fieldErrors.password && touched.password && <small>{fieldErrors.password}</small>}
          </label>

          <div className="login-options">
            <label className="login-remember">
              <input checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} type="checkbox" />
              <span>මා මතක තබාගන්න</span>
            </label>
            <Link to="/forgot-password">මුරපදය අමතකද?</Link>
          </div>

          <p className="login-register">ගිණුමක් නැද්ද? <Link to="/register">නව ගිණුමක් සාදන්න</Link></p>

          <AnimatePresence>
            {error && <motion.div className="login-alert login-alert--error" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}><AlertCircle size={18} />{error}</motion.div>}
            {info && <motion.div className="login-alert login-alert--info" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}><CheckCircle2 size={18} />{info}</motion.div>}
          </AnimatePresence>

          <button className="login-submit" disabled={isSubmitting || isAuthLoading} type="submit">
            <LogIn size={20} />
            {isSubmitting ? "පිවිසෙමින්..." : "පිවිසෙන්න"}
          </button>
        </form>

        <p className="login-legal">පිවිසීමෙන්, ඔබ අපගේ සේවා කොන්දේසි සහ පෞද්ගලිකත්ව ප්‍රතිපත්තියට එකඟ වේ.</p>
      </motion.section>
    </main>
  );
};

export default LoginRedesign;
