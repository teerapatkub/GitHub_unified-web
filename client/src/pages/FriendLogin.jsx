import { useState, useEffect } from "react";
import { Eye, EyeOff, Check, X, AlertCircle, Code, Hexagon } from "lucide-react";
import { Typewriter } from "../components/ui/typewriter-text";

// ======================================================
// Password Validation Rules (หลักสากล)
// ======================================================
const PASSWORD_RULES = [
  { label: "อย่างน้อย 8 ตัวอักษร", test: (p) => p.length >= 8 },
  { label: "มีตัวอักษรพิมพ์ใหญ่ (A-Z)", test: (p) => /[A-Z]/.test(p) },
  { label: "มีตัวอักษรพิมพ์เล็ก (a-z)", test: (p) => /[a-z]/.test(p) },
  { label: "มีตัวเลข (0-9)", test: (p) => /[0-9]/.test(p) },
  { label: "มีอักขระพิเศษ (!@#$%^&*)", test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

const getPasswordStrength = (password) => {
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  if (passed <= 2) return { level: "weak", color: "bg-red-500", text: "อ่อนมาก", percent: 20 };
  if (passed <= 3) return { level: "fair", color: "bg-orange-500", text: "พอใช้", percent: 50 };
  if (passed <= 4) return { level: "good", color: "bg-yellow-500", text: "ดี", percent: 75 };
  return { level: "strong", color: "bg-green-500", text: "แข็งแรงมาก", percent: 100 };
};

// ======================================================
// MAIN COMPONENT
// ======================================================
export default function LoginPage({ onLoginSuccess }) {
  const [step, setStep] = useState("login");
  const [surveySteps, setSurveySteps] = useState([]);
  const [surveyStep, setSurveyStep] = useState(0);

  // Assessment States
  const [assessmentQuestions, setAssessmentQuestions] = useState([]);
  const [assessmentStep, setAssessmentStep] = useState(0);
  const [assessmentAnswers, setAssessmentAnswers] = useState({});
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [selectedLevelConfig, setSelectedLevelConfig] = useState(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const primaryGradientClass =
    "bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-lg shadow-blue-500/20 hover:from-blue-800 hover:to-indigo-800";

  // ======================================================
  // Fetch Survey เมื่อ step เปลี่ยนเป็น survey
  // ======================================================
  useEffect(() => {
    if (step === "survey") {
      fetch("http://localhost:3001/api/survey")
        .then((res) => res.json())
        .then((data) => setSurveySteps(data.sort((a, b) => a.id - b.id)))
        .catch(() => setError("โหลดข้อมูลล้มเหลว"));
    }
  }, [step]);

  // ======================================================
  // Submit Login / Register
  // ======================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Frontend password validation (เฉพาะ register)
    if (isRegister) {
      const allPassed = PASSWORD_RULES.every((r) => r.test(password));
      if (!allPassed) {
        setError("รหัสผ่านไม่ผ่านเกณฑ์ความปลอดภัย กรุณาตรวจสอบอีกครั้ง");
        return;
      }
      if (!email || !email.includes("@")) {
        setError("กรุณากรอกอีเมลให้ถูกต้อง");
        return;
      }
    }

    setLoading(true);
    const endpoint = isRegister ? "/api/register" : "/api/login";
    try {
      const res = await fetch(`http://localhost:3001${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isRegister ? { username, password, email } : { username, password }
        ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (isRegister) {
        // ✅ สมัครสำเร็จ → Auto Login → แสดง Survey ทันที
        const loginRes = await fetch("http://localhost:3001/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(loginData.message);

        setLoggedInUser(loginData);
        setStep("survey"); // ← แสดง Survey ทันทีหลังสมัคร
      } else {
        // Login ปกติ
        setLoggedInUser(data);
        if (data.level === 0) setStep("survey");
        else onLoginSuccess(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // Google Login
  // ======================================================
  const [googleLoaded, setGoogleLoaded] = useState(false);

  // ตรวจสอบว่า Google SDK โหลดแล้วหรือยัง
  useEffect(() => {
    const check = setInterval(() => {
      if (window.google) {
        setGoogleLoaded(true);
        clearInterval(check);
      }
    }, 500);
    return () => clearInterval(check);
  }, []);

  const handleGoogleLogin = () => {
    setError("");
    if (!window.google) {
      setError("Google SDK ยังไม่โหลด กรุณารีเฟรชหน้าเว็บ");
      return;
    }
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === "YOUR_GOOGLE_CLIENT_ID") {
      setError("ยังไม่ได้ตั้งค่า Google Client ID");
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          setLoading(true);
          try {
            const res = await fetch("http://localhost:3001/api/auth/google", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: response.credential }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setLoggedInUser(data);
            if (data.level === 0) setStep("survey");
            else onLoginSuccess(data);
          } catch (err) {
            setError(err.message || "ไม่สามารถเข้าสู่ระบบด้วย Google ได้");
          } finally {
            setLoading(false);
          }
        },
      });
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setError("ไม่สามารถแสดง Google popup ได้ กรุณาตรวจสอบว่า popup ไม่ถูกบล็อค");
        }
      });
    } catch (err) {
      setError("ไม่สามารถเชื่อมต่อ Google ได้: " + err.message);
    }
  };

  // ======================================================
  // Survey Handlers
  // ======================================================
  const handleSelectSurvey = async (optionLabel, opt) => {
    const currentQ = surveySteps[surveyStep];
    if (currentQ.id === 3) {
      if (optionLabel === "Beginner") {
        updateUserLevel(opt.level || 1);
      } else {
        setSelectedLevelConfig(opt);
        fetchAssessment();
      }
      return;
    }
    if (surveyStep < surveySteps.length - 1) setSurveyStep(surveyStep + 1);
  };

  const fetchAssessment = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/advanced-validation");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setAssessmentQuestions(data);
        setStep("assessment");
      } else {
        alert("ไม่พบข้อสอบในระบบ");
      }
    } catch (err) {
      setError("เชื่อมต่อ Server ไม่ได้");
    } finally {
      setLoading(false);
    }
  };

  const updateUserLevel = async (level) => {
    if (loggedInUser.isGuest) {
      onLoginSuccess({ ...loggedInUser, level });
      return;
    }
    await fetch("http://localhost:3001/api/user/update-level", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: loggedInUser.user_id, level }),
    });
    onLoginSuccess({ ...loggedInUser, level });
  };

  const checkAssessment = () => {
    let score = 0;
    assessmentQuestions.forEach((q, i) => {
      if (assessmentAnswers[i] === q.correct_answer) score++;
    });
    const passingScore = assessmentQuestions.length / 1.5;
    if (score >= passingScore) {
      const targetLevel = selectedLevelConfig?.level || 10;
      updateUserLevel(targetLevel);
    } else {
      setAssessmentResult("failed");
    }
  };

  const goBackToExperience = () => {
    const idx = surveySteps.findIndex((s) => s.id === 3);
    setSurveyStep(idx !== -1 ? idx : 0);
    setStep("survey");
    setAssessmentResult(null);
  };

  // ======================================================
  // RENDER: Assessment
  // ======================================================
  if (step === "assessment") {
    if (assessmentResult === "failed") {
      return (
        <div className="min-h-screen bg-pysim-surface flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center space-y-6 whisper-shadow">
            <div className="w-16 h-16 mx-auto bg-pysim-error-container rounded-full flex items-center justify-center">
              <X className="w-8 h-8 text-pysim-error" />
            </div>
            <h2 className="text-2xl font-bold text-pysim-error">ไม่ผ่านการทดสอบ</h2>
            <p className="text-pysim-on-surface-variant">ลองทำใหม่อีกครั้ง หรือเลือกระดับอื่น</p>
            <button
              onClick={() => { setAssessmentResult(null); setAssessmentStep(0); setAssessmentAnswers({}); }}
              className={`w-full py-3 rounded-xl font-bold transition-all ${primaryGradientClass}`}
            >
              ทำอีกครั้ง
            </button>
            <button
              onClick={() => { setAssessmentResult(null); setAssessmentStep(0); setAssessmentAnswers({}); goBackToExperience(); }}
              className="w-full py-3 bg-pysim-surface-low text-pysim-on-surface-variant rounded-xl font-bold hover:bg-pysim-surface-high transition-colors"
            >
              ย้อนกลับเลือกระดับใหม่
            </button>
          </div>
        </div>
      );
    }
    const currentQ = assessmentQuestions[assessmentStep];
    if (!currentQ)
      return (
        <div className="min-h-screen bg-pysim-surface flex items-center justify-center text-pysim-on-surface">
          กำลังโหลด...
        </div>
      );

    return (
      <div className="min-h-screen bg-pysim-surface flex justify-center pt-20 p-4 font-sans text-pysim-on-surface">
        <div className="w-full max-w-4xl bg-white rounded-3xl p-8 md:p-12 h-fit relative whisper-shadow">
          <div className="flex justify-between mb-8">
            <button onClick={goBackToExperience} className="text-pysim-outline hover:text-pysim-on-surface-variant transition-colors">
              ✕ ออกจากการทดสอบ
            </button>
            <span className="text-pysim-primary font-bold">
              ข้อที่ {assessmentStep + 1} / {assessmentQuestions.length}
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-8 text-pysim-on-surface">{currentQ.question_text}</h2>
          <div className="grid gap-4">
            {currentQ.choices?.map((c) => (
              <button
                key={c}
                onClick={() => setAssessmentAnswers({ ...assessmentAnswers, [assessmentStep]: c })}
                className={`w-full text-left p-5 border-2 rounded-2xl transition-all ${
                  assessmentAnswers[assessmentStep] === c
                    ? "border-pysim-primary bg-pysim-primary-fixed text-pysim-primary ring-1 ring-pysim-primary"
                    : "border-pysim-outline-variant hover:border-pysim-primary/50 text-pysim-on-surface-variant"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="mt-10 flex justify-between items-center border-t pt-8">
            <button
              disabled={assessmentStep === 0}
              onClick={() => setAssessmentStep(assessmentStep - 1)}
              className={`px-8 py-3 rounded-xl font-bold transition-all ${
                assessmentStep === 0 ? "text-pysim-outline-variant cursor-not-allowed" : "text-pysim-on-surface-variant hover:bg-pysim-surface-low"
              }`}
            >
              ย้อนกลับ
            </button>
            <div>
              {assessmentStep < assessmentQuestions.length - 1 ? (
                <button
                  disabled={!assessmentAnswers[assessmentStep]}
                  onClick={() => setAssessmentStep(assessmentStep + 1)}
                  className={`px-10 py-3 rounded-xl font-bold transition-all ${
                    !assessmentAnswers[assessmentStep]
                      ? "bg-pysim-surface-high text-pysim-outline cursor-not-allowed"
                      : primaryGradientClass
                  }`}
                >
                  ถัดไป
                </button>
              ) : (
                <button
                  disabled={!assessmentAnswers[assessmentStep]}
                  onClick={checkAssessment}
                  className={`px-10 py-3 rounded-xl font-bold transition-all ${
                    !assessmentAnswers[assessmentStep]
                      ? "bg-pysim-surface-high text-pysim-outline cursor-not-allowed"
                      : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg"
                  }`}
                >
                  ส่งแบบทดสอบ
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================
  // RENDER: Survey
  // ======================================================
  if (step === "survey" && surveySteps.length > 0) {
    const currentSurvey = surveySteps[surveyStep];
    return (
      <div className="min-h-screen bg-pysim-surface flex justify-center pt-20 p-4 text-pysim-on-surface font-sans">
        <div className="w-full max-w-6xl bg-white rounded-3xl p-12 whisper-shadow">
          <h1 className="text-3xl font-bold text-center mb-10 text-pysim-on-surface">ออกแบบเส้นทางของคุณ</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h2 className="text-xl font-bold mb-6">{currentSurvey.title}</h2>
              <div className="space-y-4">
                {currentSurvey.options.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => handleSelectSurvey(opt.label, opt)}
                    className="w-full text-left p-5 border-2 border-pysim-outline-variant rounded-2xl hover:border-pysim-primary hover:bg-pysim-primary-fixed transition-all"
                  >
                    <div className="font-bold text-pysim-on-surface">{opt.label}</div>
                    <div className="text-sm text-pysim-on-surface-variant">{opt.description}</div>
                  </button>
                ))}
              </div>
              {surveyStep > 0 && (
                <button onClick={() => setSurveyStep(surveyStep - 1)} className="mt-8 text-pysim-outline hover:text-pysim-on-surface-variant">
                  ← ย้อนกลับ
                </button>
              )}
            </div>
            <div className="h-[550px] hidden md:flex bg-pysim-surface-low rounded-3xl p-10 flex-col items-center justify-center sticky top-10 h-fit">
              <img src={`/${currentSurvey.img}`} className="w-48 mb-6" alt="survey" />
              <p className="text-pysim-on-surface-variant text-center">{currentSurvey.text}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================
  // RENDER: Login / Register Form
  // ======================================================
  const strength = isRegister ? getPasswordStrength(password) : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md relative z-10">
        {/* Glow effect behind card */}
        <div className="absolute inset-0 bg-pysim-primary/10 blur-3xl rounded-[3rem] -z-10"></div>
        
        {/* Card */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] whisper-shadow p-8 space-y-8 border border-white/50 relative overflow-hidden">
          
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100/40 to-transparent -rotate-45 pointer-events-none blur-xl"></div>
          
          {/* Header */}
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-xl relative group ${primaryGradientClass}`}>
              <Hexagon className="w-10 h-10 text-white/20 absolute" strokeWidth={1} />
              <Code className="w-6 h-6 text-white transition-transform duration-500 group-hover:scale-110" />
            </div>
            
            <Typewriter
              text={isRegister ? "สร้างบัญชีใหม่" : "เข้าสู่ระบบ"}
              speed={50}
              className="text-2xl font-bold text-pysim-on-surface"
            />
            
            <p className="text-pysim-on-surface-variant text-sm mt-2">
              {isRegister ? "เริ่มต้นเส้นทางนักพัฒนาของคุณ" : "ยินดีต้อนรับกลับมา!"}
            </p>
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={!googleLoaded}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-pysim-outline-variant rounded-2xl hover:bg-pysim-surface-low hover:border-pysim-outline hover:shadow-md transition-all font-medium text-pysim-on-surface disabled:opacity-50 disabled:cursor-wait active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {googleLoaded ? "เข้าสู่ระบบด้วย Google" : "กำลังโหลด..."}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 relative">
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-pysim-outline-variant to-transparent"></div>
            <span className="text-xs font-semibold text-pysim-outline uppercase tracking-widest bg-white/50 px-2 rounded-full backdrop-blur-sm">หรือเขัาสู่ระบบด้วยอีเมล</span>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-pysim-outline-variant to-transparent"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-pysim-primary mb-1.5 uppercase tracking-wider ml-1">อีเมล</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full p-3.5 bg-pysim-surface-low/50 border border-pysim-outline-variant/30 rounded-2xl outline-none focus:ring-2 focus:ring-pysim-primary/30 focus:border-pysim-primary text-pysim-on-surface transition-all placeholder:text-pysim-outline"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-pysim-primary mb-1.5 uppercase tracking-wider ml-1">ชื่อผู้ใช้</label>
              <input
                type="text"
                placeholder="Username"
                className="w-full p-3.5 bg-pysim-surface-low/50 border border-pysim-outline-variant/30 rounded-2xl outline-none focus:ring-2 focus:ring-pysim-primary/30 focus:border-pysim-primary text-pysim-on-surface transition-all placeholder:text-pysim-outline"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-pysim-primary mb-1.5 uppercase tracking-wider ml-1">รหัสผ่าน</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full p-3.5 pr-12 bg-pysim-surface-low/50 border border-pysim-outline-variant/30 rounded-2xl outline-none focus:ring-2 focus:ring-pysim-primary/30 focus:border-pysim-primary text-pysim-on-surface transition-all placeholder:text-pysim-outline"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => isRegister && setShowPasswordRules(true)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-pysim-outline hover:text-pysim-on-surface-variant"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {isRegister && password.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-pysim-surface-container rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${strength.color}`}
                        style={{ width: `${strength.percent}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs font-bold ${strength.color.replace('bg-', 'text-')}`}>
                      {strength.text}
                    </span>
                  </div>

                  {/* Rules Checklist */}
                  {showPasswordRules && (
                    <div className="bg-pysim-surface-low rounded-xl p-3 space-y-1.5">
                      {PASSWORD_RULES.map((rule, i) => {
                        const passed = rule.test(password);
                        return (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            {passed ? (
                              <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                            ) : (
                              <X className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                            )}
                            <span className={passed ? "text-green-600" : "text-slate-400"}>
                              {rule.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-pysim-error-container border border-pysim-error/20 rounded-xl text-pysim-error text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 mt-6 rounded-2xl font-bold hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 tracking-wide disabled:opacity-50 disabled:transform-none ${primaryGradientClass}`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  กำลังดำเนินการ...
                </span>
              ) : isRegister ? (
                "เริ่มการเดินทาง"
              ) : (
                "เข้าสู่ระบบ"
              )}
            </button>
          </form>

          {/* Switch Login/Register */}
          <p className="text-center text-sm font-medium text-pysim-on-surface-variant pt-2">
            {isRegister ? "มีบัญชีอยู่แล้ว? " : "ผู้ใช้ใหม่? "}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
                setShowPasswordRules(false);
              }}
              className="text-pysim-primary font-bold hover:text-pysim-primary-container transition-colors border-b border-transparent hover:border-pysim-primary pb-0.5"
            >
              {isRegister ? "เข้าสู่ระบบที่นี่" : "สร้างบัญชีฟรี"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
