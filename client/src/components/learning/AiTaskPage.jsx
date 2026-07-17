import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AlertTriangle, Loader2 } from 'lucide-react';
import CodingWorkspace from './CodingWorkspace';
import ProgressCelebration from './ProgressCelebration';

const MODE_COPY = {
  exercise: {
    quickActions: [
      { label: 'อธิบายโจทย์ข้อนี้', prompt: 'ช่วยอธิบายโจทย์ข้อนี้แบบเข้าใจง่ายหน่อย' },
      { label: 'ช่วยดูบั๊กให้หน่อย', prompt: 'ช่วยหาให้หน่อยว่าโค้ดฉันผิดตรงไหน ขอโค้ดที่ถูกต้องหน่อย' },
      { label: 'ให้ hint สั้น ๆ', prompt: 'ช่วยให้ hint สั้น ๆ สำหรับการแก้โจทย์นี้หน่อย' },
    ],
    progressLabel: 'Debug Reward',
  },
  challenge: {
    quickActions: [
      { label: 'ขอ hint สั้น ๆ', prompt: 'ช่วยให้ hint สั้น ๆ สำหรับโจทย์ข้อนี้หน่อย' },
      { label: 'ช่วยดูแนวทางโค้ด', prompt: 'ช่วยดูแนวทางจากโค้ดตอนนี้หน่อยว่าควรแก้ตรงไหนบ้าง' },
      { label: 'Where is the bug in my code?', prompt: 'หาให้หน่อยว่าโค้ดฉันผิดตรงไหน ขอโค้ดที่ถูกต้องหน่อย' },
    ],
    progressLabel: 'Challenge Reward',
  },
};

export default function AiTaskPage({ mode = 'exercise', user, onUserRefresh }) {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rerolling, setRerolling] = useState(false);
  const [celebrationQueue, setCelebrationQueue] = useState([]);

  const userId = user?.user_id;
  const modeCopy = MODE_COPY[mode] || MODE_COPY.exercise;
  const cacheKey = useMemo(
    () => (userId ? `learning-ai-task:${userId}:${mode}` : null),
    [mode, userId]
  );
  const alwaysGenerateOnEnter = mode === 'exercise';

  const persistTask = useCallback((nextTask) => {
    if (!cacheKey || !nextTask) return;
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(nextTask));
    } catch {
      // Ignore cache failures.
    }
  }, [cacheKey]);

  const clearCachedTask = useCallback(() => {
    if (!cacheKey) return;
    try {
      sessionStorage.removeItem(cacheKey);
    } catch {
      // Ignore cache failures.
    }
  }, [cacheKey]);

  const fetchTask = useCallback(async ({ silent = false, forceNew = false } = {}) => {
    if (!userId) return;

    try {
      if (!silent) {
        setLoading(true);
      }
      setError('');

      const response = await axios.get('http://localhost:3001/api/learning/ai-task', {
        params: { userId, mode, forceNew },
      });

      const nextTask = response.data.task;
      setTask(nextTask);
      persistTask(nextTask);
    } catch (err) {
      setError(err?.response?.data?.error || 'ไม่สามารถโหลดโจทย์จาก AI ได้');
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [mode, persistTask, userId]);

  useEffect(() => {
    if (!userId) return;

    let cachedTask = null;
    if (!alwaysGenerateOnEnter && cacheKey) {
      try {
        cachedTask = JSON.parse(sessionStorage.getItem(cacheKey) || 'null');
      } catch {
        cachedTask = null;
      }
    }

    if (cachedTask) {
      setTask(cachedTask);
      setLoading(false);
      fetchTask({ silent: true, forceNew: false });
      return;
    }

    fetchTask({ silent: false, forceNew: alwaysGenerateOnEnter });
  }, [alwaysGenerateOnEnter, cacheKey, fetchTask, userId]);

  const handleReroll = useCallback(async () => {
    if (!userId || !task || rerolling) return;

    try {
      setRerolling(true);
      setError('');

      const response = await axios.post('http://localhost:3001/api/learning/ai-task/reroll', {
        userId,
        mode,
      });

      setTask(response.data.task);
      persistTask(response.data.task);
    } catch (err) {
      setError(err?.response?.data?.error || 'ไม่สามารถสุ่มโจทย์ใหม่ได้');
    } finally {
      setRerolling(false);
    }
  }, [mode, persistTask, rerolling, task, userId]);

  const handleSubmitTask = useCallback(async ({ taskId }) => {
    const response = await axios.post('http://localhost:3001/api/learning/ai-task/submit', {
      userId,
      taskId,
      mode,
      passed: true,
    });

    if (response.data?.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      onUserRefresh?.(response.data.user);
    }

    clearCachedTask();
    await fetchTask({ silent: false, forceNew: false });
    return response.data;
  }, [clearCachedTask, fetchTask, mode, onUserRefresh, userId]);

  const handleTaskSubmitted = useCallback((result) => {
    const nextQueue = [];

    if (result?.reward?.xp || result?.reward?.coins) {
      nextQueue.push({
        id: `task-success-${Date.now()}`,
        type: 'success',
        title: mode === 'challenge' ? 'Challenge Cleared' : 'Mission Complete',
        subtitle: mode === 'challenge'
          ? 'คุณผ่านทุก test case และเก็บรางวัลเข้าคลังเรียบร้อยแล้ว'
          : 'คุณแก้โจทย์สำเร็จและได้รับรางวัลสำหรับรอบนี้แล้ว',
        rewards: {
          xp: Number(result?.reward?.xp || 0),
          coins: Number(result?.reward?.coins || 0),
        },
      });
    }

    if (result?.celebration?.levelUp) {
      nextQueue.push({
        id: `level-up-${Date.now()}`,
        type: 'levelup',
        title: `Level Up! LV ${result?.celebration?.newLevel}`,
        subtitle: result?.celebration?.tierChanged
          ? `คุณเลื่อนขั้นเป็น ${result?.celebration?.newTier} แล้ว พร้อมรับความท้าทายที่สูงขึ้น`
          : 'พลังการเขียนโค้ดของคุณเติบโตขึ้นอีกขั้นแล้ว',
        previousLevel: Number(result?.celebration?.previousLevel || 1),
        newLevel: Number(result?.celebration?.newLevel || 1),
        rewards: {
          xp: Number(result?.reward?.xp || 0),
          coins: Number(result?.reward?.coins || 0),
        },
        tierLabel: result?.celebration?.tierChanged
          ? `${result?.celebration?.previousTier} → ${result?.celebration?.newTier}`
          : null,
      });
    }

    if (nextQueue.length > 0) {
      setCelebrationQueue((prev) => [...prev, ...nextQueue]);
    }
  }, [mode]);

  const activeCelebration = celebrationQueue[0] || null;
  const closeCelebration = useCallback(() => {
    setCelebrationQueue((prev) => prev.slice(1));
  }, []);

  const progressMeta = useMemo(() => {
    if (!task) return '';
    return `+${task.rewardXp} XP • +${task.rewardCoins} Coins • รีโจทย์ได้อีก ${task.rerollsRemaining} ครั้ง`;
  }, [task]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center overflow-hidden rounded-[24px] border border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] p-10 shadow-sm">
        <div className="flex max-w-lg flex-col items-center gap-5 text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-blue-200/60 blur-2xl" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-blue-200 bg-white shadow-[0_18px_40px_rgba(59,130,246,0.18)]">
              <Loader2 size={28} className="animate-spin text-blue-600" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black tracking-tight text-slate-900">
              AI กำลังเตรียมโจทย์ให้คุณ
            </h2>
            <p className="text-sm font-medium leading-6 text-slate-500">
              {alwaysGenerateOnEnter
                ? 'รอสักครู่เพื่อให้ระบบสร้างโจทย์ใหม่สำหรับรอบนี้ก่อนเริ่มทำแบบฝึกหัด'
                : 'กำลังตรวจสอบและเตรียมโจทย์ล่าสุดของคุณให้พร้อมใช้งาน'}
            </p>
          </div>

          <div className="h-2.5 w-64 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-1/2 animate-[pulse_1.6s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !task) {
    return (
      <div className="flex h-full items-center justify-center rounded-[24px] border border-red-200 bg-white/80 p-10 shadow-sm">
        <div className="max-w-md space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">โหลดโจทย์ไม่สำเร็จ</h2>
            <p className="mt-2 text-sm text-slate-600">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => fetchTask({ silent: false, forceNew: alwaysGenerateOnEnter })}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  if (!task) return null;

  return (
    <>
    <CodingWorkspace
      user={user}
      taskId={task.taskId}
      sectionLabel={task.sectionLabel}
      title={task.title}
      accent={task.accent}
      subtitle={task.subtitle}
      instructions={task.instructions}
      example={task.example}
      initialCode={task.starterCode}
      starterMessage={mode === 'challenge'
        ? 'สวัสดี เราคือ Lumi ผู้ช่วยประจำด่าน Challenge นี้ ถ้าคุณอยากได้ hint หรืออยากให้ช่วยมองบั๊กจากโค้ดที่เขียนอยู่ก็เรียกเราได้เลย ✨'
        : 'สวัสดี เราคือ Lumi ผู้ช่วยของห้อง Debug Lab นี้เอง ถ้าติดบั๊กหรืออยากได้ hint ก็ถามเราได้เลย ✨'}
      testCases={task.testCases}
      submitLabel={mode === 'challenge' ? 'Submit challenge' : 'Submit answer'}
      progressLabel={modeCopy.progressLabel}
      progressMeta={progressMeta}
      quickActions={modeCopy.quickActions}
      rewardXp={task.rewardXp}
      rewardCoins={task.rewardCoins}
      rerollsRemaining={task.rerollsRemaining}
      onReroll={handleReroll}
      rerolling={rerolling}
      onSubmitTask={handleSubmitTask}
      onTaskSubmitted={handleTaskSubmitted}
      workspaceNotice={error}
    />
    <ProgressCelebration event={activeCelebration} onClose={closeCelebration} />
    </>
  );
}
