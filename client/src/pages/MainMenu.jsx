import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Gamepad2, 
  Award, 
  Sparkles, 
  GraduationCap, 
  User, 
  LogOut, 
  ArrowRight,
  TrendingUp,
  Activity,
  Zap,
  BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function MainMenu() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUserData(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 font-sans antialiased">
      {/* 1. TOP NAVIGATION BAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 text-white p-2 rounded-xl shadow-md shadow-blue-500/20">
            <Zap className="h-5 w-5 fill-white animate-pulse" />
          </div>
          <div>
            <span className="text-sm font-black uppercase tracking-[0.24em] bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              PyClash Arena
            </span>
            <span className="block text-[9px] font-bold tracking-widest text-slate-400 uppercase">
              Multiplayer Hub
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* BACK TO LEARNING MODE BUTTON */}
          <button
            onClick={() => navigate('/learn')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all bg-gradient-to-r from-emerald-50 to-emerald-100/80 text-emerald-700 hover:text-emerald-800 border border-emerald-200/60 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            <BookOpen className="h-4 w-4" />
            <span>กลับไปโหมดเรียน (Academy)</span>
          </button>

          <div className="h-6 w-px bg-slate-200" />

          {/* USER INFO BLOCK */}
          {userData ? (
            <div className="flex items-center space-x-3">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">
                  LV. {userData.level || 1}
                </span>
                <span className="text-xs font-bold text-slate-700">
                  {userData.username}
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                <User className="h-4 w-4 text-slate-500" />
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors border border-slate-200"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="px-4 py-2 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs">
              Guest Mode
            </div>
          )}
        </div>
      </nav>

      {/* 2. BODY CONTENT */}
      <main className="max-w-6xl mx-auto px-6 mt-10">
        
        {/* HERO HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 rounded-full border border-blue-100">
              โหมดการแข่งขันรูปแบบใหม่
            </span>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight mt-3 mb-4">
              สมรภูมิประชันเขียนโปรแกรม Python
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              พัฒนาทักษะแบบก้าวกระโดดด้วยโหมดการแข่งขันสุดมันส์กับผู้เล่นอื่นในเวลาจริง 
              เลือกโหมดการเล่นที่ตรงกับความชอบของคุณด้านล่างนี้ได้เลย!
            </p>
          </motion.div>
        </div>

        {/* 3. CORE MULTIPLAYER MODES */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          
          {/* MODE 1: COMPETITIVE ARENA */}
          <motion.div
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex flex-col bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden hover:shadow-xl hover:border-blue-200/80 transition-all group"
          >
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-8 text-white relative overflow-hidden">
              {/* Background Art */}
              <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
                <Award size={180} />
              </div>
              
              <span className="px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase bg-white/20 text-white border border-white/10">
                🏆 MODE 1: SERIOUS
              </span>
              <h2 className="text-2xl font-black tracking-tight mt-4 mb-2">
                Competitive Arena
              </h2>
              <p className="text-xs text-blue-100/90 font-medium leading-relaxed">
                การแข่งเขียนโค้ดแก้โจทย์ปัญหาแบบดวลทักษะความรู้
              </p>
            </div>

            <div className="p-8 flex-1 flex flex-col justify-between">
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-50 p-2 rounded-xl text-blue-600 mt-0.5">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-700">โจทย์จริงจากแอดมินและผู้ใช้งาน</h3>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      ไม่มีระบบสุ่มมั่วๆ โพสต์โจทย์จริงที่มีเวลาจำกัดและรางวัลรออยู่
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-blue-50 p-2 rounded-xl text-blue-600 mt-0.5">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-700">วัดความถูกต้องและความเร็ว</h3>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      ประมวลผลคะแนนอย่างละเอียดด้วยระบบ AI เพื่อจัดอันดับผู้นำคุณภาพโค้ด
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate('/online')}
                className="w-full flex items-center justify-center space-x-2 py-4 bg-slate-900 hover:bg-blue-600 active:scale-[0.98] text-white rounded-2xl font-bold text-xs tracking-wider uppercase transition-all shadow-md hover:shadow-blue-500/20"
              >
                <span>เข้าสู่สนามแข่ง (Enter Arena)</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </motion.div>

          {/* MODE 2: ARCADE BATTLE ROYALE */}
          <motion.div
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex flex-col bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden hover:shadow-xl hover:border-rose-200/80 transition-all group"
          >
            <div className="bg-gradient-to-br from-rose-500 to-orange-500 p-8 text-white relative overflow-hidden">
              {/* Background Art */}
              <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
                <Gamepad2 size={180} />
              </div>
              
              <span className="px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase bg-white/20 text-white border border-white/10">
                🔥 MODE 2: PARTY
              </span>
              <h2 className="text-2xl font-black tracking-tight mt-4 mb-2">
                Arcade Battle Royale
              </h2>
              <p className="text-xs text-rose-100/90 font-medium leading-relaxed">
                สนามแข่งโค้ดแบบป่วนหน้าจอกดดัน 5 คน 3 รอบ
              </p>
            </div>

            <div className="p-8 flex-1 flex flex-col justify-between">
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <div className="bg-rose-50 p-2 rounded-xl text-rose-600 mt-0.5">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-700">ใช้ไอเทมขัดขวางเพื่อเอาตัวรอด</h3>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      ยิงหมอกบังจอ ล็อกปุ่ม Backspace หรือจ้าง AI คลี่คลายสถานการณ์ช่วยเหลือ
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-rose-50 p-2 rounded-xl text-rose-600 mt-0.5">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-700">คัดคนออกและบริหารเงินให้ดี</h3>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      ซื้อไอเทมในร้านค้าเพื่อเตรียมแข่งต่อ และระวังตกรอบหากเหลือเงินน้อยที่สุด
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate('/matchmaking')}
                className="w-full flex items-center justify-center space-x-2 py-4 bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white rounded-2xl font-bold text-xs tracking-wider uppercase transition-all shadow-md shadow-rose-500/20"
              >
                <span>จับคู่แข่งขัน (Find Match)</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </motion.div>

        </div>

        {/* 4. BOTTOM QUICK LINKS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center space-x-4">
            <div className="bg-amber-50 p-3 rounded-xl text-amber-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-700">Custom Shop</span>
              <span className="block text-[10px] text-slate-400 mt-0.5">ร้านค้าแฟชั่น</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center space-x-4">
            <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-700">Leaderboard</span>
              <span className="block text-[10px] text-slate-400 mt-0.5">ตารางเกียรติยศ</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center space-x-4">
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-700">Active Players</span>
              <span className="block text-[10px] text-slate-400 mt-0.5">244 กำลังเล่นอยู่</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center space-x-4">
            <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-700">Developer Log</span>
              <span className="block text-[10px] text-slate-400 mt-0.5">อัปเดตระบบ v2.0</span>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
