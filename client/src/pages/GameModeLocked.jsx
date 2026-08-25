// Shown instead of a game mode when the player has not reached the rank that
// unlocks it.
//
// Deliberately a page and not a redirect. A learner who clicks "โหมดเกม" and
// lands back where they started has been told nothing; they will click it
// again. This says what the requirement is, where they currently are, and what
// to do next - and the only button on it goes to the lessons, which is the
// thing that actually moves them forward.
import { useNavigate } from 'react-router-dom';
import { Lock, BookOpen, ArrowRight } from 'lucide-react';
import {
  GAME_MODE_MIN_LEVEL, GAME_MODE_RANK_TH, levelOf, levelsRemaining,
} from '../utils/gameModeAccess.js';

export default function GameModeLocked({ user }) {
  const navigate = useNavigate();
  const level = levelOf(user);
  const remaining = levelsRemaining(user);
  const progress = Math.min(100, Math.round((level / GAME_MODE_MIN_LEVEL) * 100));

  return (
    <div className="min-h-screen bg-slate-50/50 flex items-center justify-center px-6 py-16 font-sans">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
          <Lock className="h-6 w-6" />
        </div>

        <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-5">
          โหมดเกมยังไม่เปิดให้คุณ
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed font-medium mt-3">
          โหมดแข่งขันทั้งหมดจะปลดล็อกเมื่อคุณขึ้นถึงระดับ
          <span className="font-bold text-slate-700"> {GAME_MODE_RANK_TH} (เลเวล {GAME_MODE_MIN_LEVEL})</span>
          {' '}เพราะทุกโหมดแข่งกับผู้เล่นจริงในเวลาจำกัด
          เราอยากให้คุณเข้าไปพร้อมพื้นฐานที่ใช้ได้จริงก่อน
        </p>

        <div className="mt-7 text-left">
          <div className="flex items-end justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">
              เลเวลของคุณตอนนี้ {level}
            </span>
            <span className="text-xs font-bold text-amber-600">
              เหลืออีก {remaining} เลเวล
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-[10px] font-bold text-slate-400">
            <span>เลเวล 1</span>
            <span>เลเวล {GAME_MODE_MIN_LEVEL}</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/learn')}
          className="mt-8 w-full flex items-center justify-center space-x-2 py-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white rounded-2xl font-bold text-xs tracking-wider uppercase transition-all shadow-md shadow-emerald-500/20"
        >
          <BookOpen className="h-4 w-4" />
          <span>ไปเรียนบทเรียนเพื่อเก็บเลเวล</span>
          <ArrowRight className="h-4 w-4" />
        </button>

        <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
          ทำแบบฝึกหัดและโจทย์ท้าทายให้ผ่านเพื่อรับ XP — ทุกครั้งที่ XP เต็มหลอด เลเวลจะเพิ่มขึ้นหนึ่งขั้น
        </p>
      </div>
    </div>
  );
}
