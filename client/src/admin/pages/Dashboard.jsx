import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Gamepad2,
  Loader2,
  Monitor,
  Radio,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import AdminNavbar from "../components/AdminNavbar";
import { API_BASE } from '../../config/api.js';


const modeMeta = {
  learn: {
    label: "โหมดเรียน",
    short: "เรียน",
    icon: BookOpen,
    color: "from-pysim-primary to-pysim-primary-container",
    bg: "bg-pysim-primary-fixed/30",
    text: "text-pysim-primary",
  },
  lesson: {
    label: "บทเรียน",
    short: "เรียน",
    icon: BookOpen,
    color: "from-pysim-primary to-pysim-primary-container",
    bg: "bg-pysim-primary-fixed/30",
    text: "text-pysim-primary",
  },
  online: {
    label: "โหมดออนไลน์",
    short: "ออนไลน์",
    icon: Radio,
    color: "from-pysim-secondary-container to-pysim-secondary-fixed",
    bg: "bg-pysim-secondary-fixed/30",
    text: "text-pysim-on-secondary-container",
  },
  story: {
    label: "โหมดออนไลน์",
    short: "ออนไลน์",
    icon: Radio,
    color: "from-pysim-secondary-container to-pysim-secondary-fixed",
    bg: "bg-pysim-secondary-fixed/30",
    text: "text-pysim-on-secondary-container",
  },
  "mini-game": {
    label: "มินิเกม",
    short: "มินิเกม",
    icon: Gamepad2,
    color: "from-pysim-secondary-container to-pysim-secondary-fixed",
    bg: "bg-amber-50",
    text: "text-amber-700",
  },
  exercise: {
    label: "แบบฝึกหัด",
    short: "ฝึกหัด",
    icon: CheckCircle2,
    color: "from-pysim-primary to-pysim-primary-container",
    bg: "bg-pysim-primary-fixed/30",
    text: "text-pysim-primary",
  },
  solo: {
    label: "Simulation",
    short: "Sim",
    icon: Monitor,
    color: "from-pysim-primary to-pysim-primary-container",
    bg: "bg-pysim-primary-fixed/30",
    text: "text-pysim-primary",
  },
  endless: {
    label: "Simulation",
    short: "Sim",
    icon: Monitor,
    color: "from-pysim-primary to-pysim-primary-container",
    bg: "bg-pysim-primary-fixed/30",
    text: "text-pysim-primary",
  },
  competitive: {
    label: "โหมดออนไลน์",
    short: "ออนไลน์",
    icon: Radio,
    color: "from-pysim-secondary-container to-pysim-secondary-fixed",
    bg: "bg-pysim-secondary-fixed/30",
    text: "text-pysim-on-secondary-container",
  },
  arcade: {
    label: "โหมดออนไลน์",
    short: "ออนไลน์",
    icon: Radio,
    color: "from-pysim-secondary-container to-pysim-secondary-fixed",
    bg: "bg-pysim-secondary-fixed/30",
    text: "text-pysim-on-secondary-container",
  },
  challenge: {
    label: "ความท้าทาย",
    short: "Challenge",
    icon: Sparkles,
    color: "from-pysim-primary to-pysim-primary-container",
    bg: "bg-pysim-primary-fixed/30",
    text: "text-pysim-primary",
  },
  account: {
    label: "บัญชี",
    short: "บัญชี",
    icon: UserPlus,
    color: "from-slate-400 to-slate-600",
    bg: "bg-pysim-surface-low",
    text: "text-pysim-on-surface-variant",
  },
};

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "เมื่อสักครู่";
  if (diffMinutes < 60) return `${diffMinutes} นาทีที่แล้ว`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;

  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getInitial = (username = "?") => username.trim().charAt(0).toUpperCase() || "?";
const onlineModeKeys = new Set(["online", "competitive", "arcade", "story", "solo"]);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [learningProgress, setLearningProgress] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        const [statsRes, learningRes] = await Promise.all([
          fetch(`${API_BASE}/api/dashboard/stats`),
          fetch(`${API_BASE}/api/dashboard/learning-progress`),
        ]);
        const stats = await statsRes.json();
        const learning = await learningRes.json();

        if (!isMounted) return;
        setData(stats || {});
        setLearningProgress(learning || {});
        setSelectedLessonId((current) => (
          current || learning?.lesson_summaries?.[0]?.lesson_id || null
        ));
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setData({});
          setLearningProgress({});
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadDashboard();
    const interval = window.setInterval(loadDashboard, 10000);
    const handleVisibilityChange = () => {
      if (!document.hidden) loadDashboard();
    };
    window.addEventListener("focus", loadDashboard);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", loadDashboard);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const onlineUsers = Array.isArray(data?.onlineUsers) ? data.onlineUsers : [];
  const totalUsers = Number(data?.totalUsers || 0);
  const activeUsers = Number(data?.activeUsers ?? onlineUsers.length ?? 0);
  const lessonSummaries = Array.isArray(learningProgress?.lesson_summaries)
    ? learningProgress.lesson_summaries
    : [];
  const studentProgressRows = Array.isArray(learningProgress?.students)
    ? learningProgress.students
    : [];
  const selectedLesson = lessonSummaries.find((lesson) => Number(lesson.lesson_id) === Number(selectedLessonId))
    || lessonSummaries[0]
    || null;
  const selectedLessonStudents = Array.isArray(selectedLesson?.students) ? selectedLesson.students : [];
  const selectedCompleted = selectedLessonStudents.filter((student) => student.status === "completed");
  const selectedInProgress = selectedLessonStudents.filter((student) => student.status === "in_progress");
  const selectedNotStarted = selectedLessonStudents.filter((student) => student.status === "not_started");

  const usageStats = useMemo(() => {
    const usageTotal = Number(data?.activeUsers ?? onlineUsers.length ?? 0);
    const onlineCount = onlineUsers.filter((user) => (
      onlineModeKeys.has(String(user.mode || "").toLowerCase())
    )).length;
    const learnCount = Math.max(0, usageTotal - onlineCount);
    const rows = [
      { key: "learn", count: learnCount },
      { key: "online", count: onlineCount },
    ];

    return {
      total: usageTotal,
      rows: rows.map((row) => ({
        ...row,
        percent: usageTotal ? Math.round((row.count / usageTotal) * 100) : 0,
        meta: modeMeta[row.key],
      })),
    };
  }, [data?.activeUsers, onlineUsers]);

  const formatPercentValue = (value) => (
    value == null || Number.isNaN(Number(value)) ? "—" : `${Number(value)}%`
  );

  const hasNumericValue = (value) => value != null && value !== "" && !Number.isNaN(Number(value));

  const formatGrowth = (value) => {
    if (value == null || Number.isNaN(Number(value))) return "—";
    const numeric = Number(value);
    return `${numeric > 0 ? "+" : ""}${numeric}%`;
  };

  const formatQuizScore = (row, type) => {
    const score = row?.[`${type}_score`];
    const total = row?.[`${type}_total`];
    if (!hasNumericValue(score) || !hasNumericValue(total) || Number(total) === 0) return null;
    return `${score}/${total}`;
  };

  if (isLoading) {
    return (
      <>
        <AdminNavbar />
        <main className="min-h-screen pt-24">
          <div className="mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center px-6">
            <div className="flex items-center gap-3 rounded-2xl border border-pysim-outline-variant/50 bg-white px-5 py-4 text-pysim-on-surface-variant shadow-sm">
              <Loader2 className="h-5 w-5 animate-spin text-pysim-primary" />
              <span className="font-semibold">กำลังโหลดแดชบอร์ด...</span>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminNavbar />

      <main className="min-h-screen pt-24">
        <div className="mx-auto max-w-7xl space-y-6 px-4 pb-10 sm:px-6">
          <section className="flex flex-col gap-2">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-pysim-primary">
              Admin Overview
            </p>
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <h1 className="text-3xl font-black text-pysim-on-surface sm:text-4xl">
                  แดชบอร์ดผู้ดูแลระบบ
                </h1>
                <p className="mt-2 max-w-2xl text-sm font-medium text-pysim-on-surface-variant">
                  ภาพรวมผู้ใช้ สถานะออนไลน์ และความคืบหน้าการเรียนของ PySim
                </p>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="overflow-hidden rounded-3xl border border-pysim-outline-variant/50 bg-white whisper-shadow">
              <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                      <Radio className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-pysim-on-surface-variant">ผู้เล่นออนไลน์</p>
                      <p className="text-4xl font-black text-pysim-on-surface">{activeUsers}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-medium text-pysim-on-surface-variant">
                    
                  </p>
                </div>

                {onlineUsers.length > 0 && (
                  <div className="flex -space-x-3">
                    {onlineUsers.slice(0, 5).map((user) => (
                      <div
                        key={user.user_id}
                        className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-pysim-primary to-pysim-primary-container text-sm font-black text-white shadow-sm"
                        title={user.username}
                      >
                        {getInitial(user.username)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-pysim-outline-variant/30 bg-pysim-surface/70 p-5">
                {onlineUsers.length === 0 ? (
                  <div className="flex items-center justify-center rounded-2xl border border-dashed border-pysim-outline-variant bg-white py-8 text-sm font-semibold text-pysim-outline">
                    ยังไม่มีผู้เล่นออนไลน์ในตอนนี้
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {onlineUsers.map((user) => {
                      const meta = modeMeta[user.mode] || modeMeta.learn;
                      return (
                        <div
                          key={`${user.user_id}-${user.last_seen}`}
                          className="flex items-center justify-between rounded-2xl border border-pysim-outline-variant/50 bg-white p-3"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pysim-on-primary-fixed text-sm font-black text-white">
                              {getInitial(user.username)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-black text-pysim-on-surface">{user.username}</p>
                              <p className="text-xs font-semibold text-pysim-outline">{formatTime(user.last_seen)}</p>
                            </div>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-black ${meta.bg} ${meta.text}`}>
                            {meta.short}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-pysim-outline-variant/50 bg-white p-6 whisper-shadow">
              <div className="flex h-full flex-col justify-between gap-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-pysim-on-surface-variant">ผู้ใช้ทั้งหมดในเว็บ</p>
                    <p className="mt-2 text-5xl font-black text-pysim-on-surface">{totalUsers}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pysim-primary-fixed/30 text-pysim-primary">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
                <div className="rounded-2xl bg-pysim-surface p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-pysim-on-surface-variant">ออนไลน์ตอนนี้</span>
                    <span className="font-black text-pysim-on-surface">{activeUsers} คน</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-pysim-surface-container">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-pysim-primary to-pysim-primary-container"
                      style={{ width: `${totalUsers ? Math.min(100, Math.round((activeUsers / totalUsers) * 100)) : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-pysim-outline-variant/50 bg-white p-6 whisper-shadow sm:p-8">
            <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-black text-pysim-on-surface">ผู้ใช้กำลังทำอะไรอยู่</h2>
                <p className="mt-1 text-sm font-medium text-pysim-on-surface-variant">
                  อัปเดตจากสถานะผู้ใช้ในช่วง 15 นาทีล่าสุด
                </p>
              </div>
              <div className="rounded-full bg-pysim-surface-low px-4 py-2 text-sm font-black text-pysim-on-surface-variant">
                รวม {usageStats.total} คน
              </div>
            </div>

            <div className="space-y-5">
              {usageStats.rows.map((item) => {
                const Icon = item.meta.icon;
                return (
                  <div key={item.key} className="rounded-2xl border border-pysim-outline-variant/30 bg-pysim-surface/70 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.meta.bg} ${item.meta.text}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-black text-pysim-on-surface">{item.meta.label}</p>
                          <p className="text-xs font-semibold text-pysim-outline">{item.count} คน</p>
                        </div>
                      </div>
                      <span className="text-2xl font-black text-pysim-on-surface">{item.percent}%</span>
                    </div>

                    <div className="h-4 overflow-hidden rounded-full bg-pysim-surface-container">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${item.meta.color} transition-all duration-700`}
                        style={{ width: `${Math.min(item.percent, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-pysim-outline-variant/50 bg-white p-6 whisper-shadow sm:p-8">
            <div className="mb-7 flex flex-col justify-between gap-3 xl:flex-row xl:items-end">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pysim-primary-fixed/30 text-pysim-primary">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-pysim-on-surface">ความก้าวหน้าการเรียน</h2>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-2xl bg-pysim-surface px-4 py-3">
                  <p className="text-[10px] font-black uppercase text-pysim-outline">ผู้เรียน</p>
                  <p className="text-xl font-black text-pysim-on-surface">{Number(learningProgress?.total_students || 0)}</p>
                </div>
                <div className="rounded-2xl bg-pysim-primary-fixed/30 px-4 py-3">
                  <p className="text-[10px] font-black uppercase text-pysim-primary">บทเรียน</p>
                  <p className="text-xl font-black text-pysim-primary">{Number(learningProgress?.total_lessons || 0)}</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 px-4 py-3">
                  <p className="text-[10px] font-black uppercase text-emerald-500">ผ่านแล้ว</p>
                  <p className="text-xl font-black text-emerald-700">{Number(learningProgress?.completed_lesson_records || 0)}</p>
                </div>
                <div className="rounded-2xl bg-amber-50 px-4 py-3">
                  <p className="text-[10px] font-black uppercase text-amber-500">กำลังเรียน</p>
                  <p className="text-xl font-black text-amber-700">{Number(learningProgress?.in_progress_students || 0)}</p>
                </div>
              </div>
            </div>

            {lessonSummaries.length === 0 ? (
              <div className="flex items-center justify-center rounded-2xl border border-dashed border-pysim-outline-variant bg-pysim-surface py-12 text-sm font-semibold text-pysim-outline">
                ยังไม่มีข้อมูลบทเรียนสำหรับวิเคราะห์ความก้าวหน้า
              </div>
            ) : (
              <div className="grid gap-5 xl:grid-cols-[1.25fr_0.95fr]">
                <div className="overflow-hidden rounded-2xl border border-pysim-outline-variant/50">
                  <div className="grid grid-cols-[1.4fr_82px_82px_82px_88px] bg-pysim-surface px-4 py-3 text-[10px] font-black uppercase tracking-widest text-pysim-outline">
                    <span>บทเรียน</span>
                    <span className="text-center">ผ่าน</span>
                    <span className="text-center">กำลังเรียน</span>
                    <span className="text-center">ยังไม่จบ</span>
                    <span className="text-right">หลังเรียน</span>
                  </div>
                  <div className="max-h-[420px] overflow-auto">
                    {lessonSummaries.map((lesson) => {
                      const isSelected = Number(selectedLesson?.lesson_id) === Number(lesson.lesson_id);
                      const total = Number(learningProgress?.total_students || 0);
                      const completedPercent = total ? Math.round((Number(lesson.completed_count || 0) / total) * 100) : 0;
                      return (
                        <button
                          key={lesson.lesson_id}
                          type="button"
                          onClick={() => setSelectedLessonId(lesson.lesson_id)}
                          className={`grid w-full grid-cols-[1.4fr_82px_82px_82px_88px] items-center gap-2 border-t border-pysim-outline-variant/30 px-4 py-3 text-left transition-colors ${isSelected ? "bg-pysim-primary-fixed/70" : "bg-white hover:bg-pysim-surface"}`}
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-pysim-on-surface">{lesson.title}</p>
                            <p className="truncate text-xs font-semibold text-pysim-outline">{lesson.module_title}</p>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-pysim-surface-container">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-pysim-primary to-pysim-primary-container"
                                style={{ width: `${completedPercent}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-center text-sm font-black text-emerald-700">{lesson.completed_count}</span>
                          <span className="text-center text-sm font-black text-amber-700">{lesson.in_progress_count}</span>
                          <span className="text-center text-sm font-black text-pysim-on-surface-variant">{lesson.not_completed_count}</span>
                          <span className="text-right text-sm font-black text-pysim-primary">{formatPercentValue(lesson.avg_post_percent)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-pysim-outline-variant/50 bg-pysim-surface p-4">
                  <div className="mb-4">
                    <div className="min-w-0">
                      <h3 className="mt-1 truncate text-lg font-black text-pysim-on-surface">{selectedLesson?.title}</h3>
                      <p className="truncate text-xs font-semibold text-pysim-outline">{selectedLesson?.module_title}</p>
                    </div>
                  </div>

                  <div className="mb-4 grid grid-cols-3 gap-2">
                    <div className="rounded-2xl bg-white p-3">
                      <p className="text-[10px] font-black uppercase text-emerald-500">ผ่านแล้ว</p>
                      <p className="text-2xl font-black text-pysim-on-surface">{selectedCompleted.length}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-3">
                      <p className="text-[10px] font-black uppercase text-amber-500">กำลังเรียน</p>
                      <p className="text-2xl font-black text-pysim-on-surface">{selectedInProgress.length}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-3">
                      <p className="text-[10px] font-black uppercase text-pysim-outline">ยังไม่เริ่ม</p>
                      <p className="text-2xl font-black text-pysim-on-surface">{selectedNotStarted.length}</p>
                    </div>
                  </div>

                  <div className="max-h-[318px] space-y-2 overflow-auto pr-1">
                    {selectedLessonStudents.map((student) => {
                      const preScore = formatQuizScore(student, "pre");
                      const postScore = formatQuizScore(student, "post");
                      const hasPrePercent = hasNumericValue(student.pre_percent);
                      const hasPostPercent = hasNumericValue(student.post_percent);
                      const preDisplay = preScore || (hasPrePercent ? formatPercentValue(student.pre_percent) : null);
                      const postDisplay = postScore || (hasPostPercent ? formatPercentValue(student.post_percent) : null);
                      const hasAnyScore = preDisplay || postDisplay;
                      const statusClass = student.status === "completed"
                        ? "bg-emerald-50 text-emerald-700"
                        : student.status === "in_progress"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-pysim-surface-low text-pysim-on-surface-variant";
                      const statusText = student.status === "completed"
                        ? "ผ่านแล้ว"
                        : student.status === "in_progress"
                          ? "กำลังเรียน"
                          : "ยังไม่เริ่ม";
                      return (
                        <div key={`${student.user_id}-${selectedLesson?.lesson_id}`} className="rounded-2xl border border-pysim-outline-variant/50 bg-white p-4 shadow-sm transition hover:border-pysim-primary-fixed hover:shadow-md">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pysim-primary to-pysim-primary-container text-sm font-black text-white">
                                {getInitial(student.username)}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-black text-pysim-on-surface">{student.username}</p>
                              </div>
                            </div>
                            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${statusClass}`}>
                              {statusText}
                            </span>
                          </div>
                          {hasAnyScore && (
                            <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                              {preDisplay && (
                                <span className="rounded-xl bg-pysim-surface-low px-3 py-2 text-pysim-on-surface-variant">แบบทดสอบก่อนเรียน {preDisplay}</span>
                              )}
                              {postDisplay && (
                                <span className="rounded-xl bg-pysim-primary-fixed/60 px-3 py-2 text-pysim-primary">แบบทดสอบหลังเรียน {postDisplay}</span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {studentProgressRows.length > 0 && (
              <div className="mt-6 overflow-hidden rounded-2xl border border-pysim-outline-variant/50">
                <div className="flex items-center justify-between gap-3 bg-pysim-surface px-4 py-3">
                  <div>
                    <h3 className="font-black text-pysim-on-surface">ภาพรวมรายผู้เรียน</h3>
                  </div>
                </div>
                <div className="max-h-[360px] overflow-auto">
                  <table className="w-full min-w-[860px] border-collapse text-left text-sm">
                    <thead className="sticky top-0 bg-white text-[10px] font-black uppercase tracking-widest text-pysim-outline shadow-sm">
                      <tr>
                        <th className="px-4 py-3">ผู้เรียน</th>
                        <th className="px-4 py-3">เรียนถึงบท</th>
                        <th className="px-4 py-3 text-center">ผ่านแล้ว</th>
                        <th className="px-4 py-3 text-center">ก่อนเรียนเฉลี่ย</th>
                        <th className="px-4 py-3 text-center">หลังเรียนเฉลี่ย</th>
                        <th className="px-4 py-3 text-center">ความก้าวหน้า</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentProgressRows.map((student) => (
                        <tr key={student.user_id} className="border-t border-pysim-outline-variant/30">
                          <td className="px-4 py-3">
                            <p className="font-black text-pysim-on-surface">{student.username}</p>
                          </td>
                          <td className="max-w-[280px] px-4 py-3">
                            <p className="truncate font-bold text-pysim-on-surface-variant">{student.current_lesson?.lesson_title || "ยังไม่เริ่มเรียน"}</p>
                            <p className="truncate text-xs font-semibold text-pysim-outline">{student.current_lesson?.module_title || "-"}</p>
                          </td>
                          <td className="px-4 py-3 text-center font-black text-emerald-700">
                            {student.completed_lessons}/{student.total_lessons}
                          </td>
                          <td className="px-4 py-3 text-center font-black text-pysim-on-surface-variant">{formatPercentValue(student.avg_pre_percent)}</td>
                          <td className="px-4 py-3 text-center font-black text-pysim-primary">{formatPercentValue(student.avg_post_percent)}</td>
                          <td className={`px-4 py-3 text-center font-black ${Number(student.growth_percent || 0) >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                            {formatGrowth(student.growth_percent)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>


        </div>
      </main>
    </>
  );
}
