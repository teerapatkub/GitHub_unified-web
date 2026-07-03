import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BookOpen,
  CheckCircle2,
  CircleDot,
  Clock3,
  Gamepad2,
  Loader2,
  Monitor,
  Radio,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import AdminNavbar from "../components/AdminNavbar";

const API_BASE = "http://localhost:3001";

const modeMeta = {
  learn: {
    label: "โหมดเรียน",
    short: "เรียน",
    icon: BookOpen,
    color: "from-cyan-400 to-sky-500",
    bg: "bg-cyan-50",
    text: "text-cyan-700",
  },
  lesson: {
    label: "บทเรียน",
    short: "เรียน",
    icon: BookOpen,
    color: "from-cyan-400 to-sky-500",
    bg: "bg-cyan-50",
    text: "text-cyan-700",
  },
  online: {
    label: "โหมดออนไลน์",
    short: "ออนไลน์",
    icon: Radio,
    color: "from-emerald-400 to-teal-500",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
  },
  story: {
    label: "โหมดออนไลน์",
    short: "ออนไลน์",
    icon: Radio,
    color: "from-emerald-400 to-teal-500",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
  },
  solo: {
    label: "โหมดเดี่ยว",
    short: "เดี่ยว",
    icon: Monitor,
    color: "from-violet-400 to-indigo-500",
    bg: "bg-violet-50",
    text: "text-violet-700",
  },
  endless: {
    label: "โหมดเดี่ยว",
    short: "เดี่ยว",
    icon: Monitor,
    color: "from-violet-400 to-indigo-500",
    bg: "bg-violet-50",
    text: "text-violet-700",
  },
  "mini-game": {
    label: "มินิเกม",
    short: "มินิเกม",
    icon: Gamepad2,
    color: "from-amber-400 to-orange-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
  },
  exercise: {
    label: "แบบฝึกหัด",
    short: "ฝึกหัด",
    icon: CheckCircle2,
    color: "from-blue-400 to-cyan-500",
    bg: "bg-blue-50",
    text: "text-blue-700",
  },
  challenge: {
    label: "ความท้าทาย",
    short: "Challenge",
    icon: Sparkles,
    color: "from-fuchsia-400 to-rose-500",
    bg: "bg-fuchsia-50",
    text: "text-fuchsia-700",
  },
  account: {
    label: "บัญชี",
    short: "บัญชี",
    icon: UserPlus,
    color: "from-slate-400 to-slate-600",
    bg: "bg-slate-100",
    text: "text-slate-700",
  },
};

const activityMeta = {
  signup: { icon: UserPlus, bg: "bg-blue-50", text: "text-blue-700" },
  lesson_complete: { icon: CheckCircle2, bg: "bg-emerald-50", text: "text-emerald-700" },
  exercise_complete: { icon: CheckCircle2, bg: "bg-cyan-50", text: "text-cyan-700" },
  mini_game_complete: { icon: Gamepad2, bg: "bg-amber-50", text: "text-amber-700" },
  active_task: { icon: Activity, bg: "bg-fuchsia-50", text: "text-fuchsia-700" },
  online_room: { icon: Radio, bg: "bg-emerald-50", text: "text-emerald-700" },
  simulation: { icon: Monitor, bg: "bg-violet-50", text: "text-violet-700" },
  presence: { icon: CircleDot, bg: "bg-emerald-50", text: "text-emerald-700" },
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

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          fetch(`${API_BASE}/api/dashboard/stats`),
          fetch(`${API_BASE}/api/dashboard/recent-activities`),
        ]);
        const stats = await statsRes.json();
        const activities = await activityRes.json();

        if (!isMounted) return;
        setData(stats || {});
        setRecentActivities(Array.isArray(activities) ? activities : []);
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setData({});
          setRecentActivities([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  const onlineUsers = Array.isArray(data?.onlineUsers) ? data.onlineUsers : [];
  const totalUsers = Number(data?.totalUsers || 0);
  const activeUsers = Number(data?.activeUsers ?? onlineUsers.length ?? 0);

  const usageStats = useMemo(() => {
    const modes = data?.modes || {};
    const rows = [
      { key: "learn", count: Number(modes.learn || 0) },
      { key: "online", count: Number(modes.story || modes.online || 0) },
      { key: "solo", count: Number(modes.endless || modes.solo || 0) },
    ];
    const usageTotal = rows.reduce((sum, row) => sum + row.count, 0);

    return {
      total: usageTotal,
      rows: rows.map((row) => ({
        ...row,
        percent: usageTotal ? Math.round((row.count / usageTotal) * 100) : 0,
        meta: modeMeta[row.key],
      })),
    };
  }, [data?.modes]);

  if (isLoading) {
    return (
      <>
        <AdminNavbar />
        <main className="min-h-screen pt-24">
          <div className="mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center px-6">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-600 shadow-sm">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
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
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-600">
              Admin Overview
            </p>
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">
                  แดชบอร์ดผู้ดูแลระบบ
                </h1>
                <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500">
                  ภาพรวมผู้ใช้ สถานะออนไลน์ และกิจกรรมล่าสุดของ PySim
                </p>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
              <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                      <Radio className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-500">ผู้เล่นออนไลน์</p>
                      <p className="text-4xl font-black text-slate-900">{activeUsers}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-500">
                    
                  </p>
                </div>

                {onlineUsers.length > 0 && (
                  <div className="flex -space-x-3">
                    {onlineUsers.slice(0, 5).map((user) => (
                      <div
                        key={user.user_id}
                        className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-black text-white shadow-sm"
                        title={user.username}
                      >
                        {getInitial(user.username)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 bg-slate-50/70 p-5">
                {onlineUsers.length === 0 ? (
                  <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-8 text-sm font-semibold text-slate-400">
                    ยังไม่มีผู้เล่นออนไลน์ในตอนนี้
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {onlineUsers.map((user) => {
                      const meta = modeMeta[user.mode] || modeMeta.learn;
                      return (
                        <div
                          key={`${user.user_id}-${user.last_seen}`}
                          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-black text-white">
                              {getInitial(user.username)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-black text-slate-800">{user.username}</p>
                              <p className="text-xs font-semibold text-slate-400">{formatTime(user.last_seen)}</p>
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

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
              <div className="flex h-full flex-col justify-between gap-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-500">ผู้ใช้ทั้งหมดในเว็บ</p>
                    <p className="mt-2 text-5xl font-black text-slate-900">{totalUsers}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-500">ออนไลน์ตอนนี้</span>
                    <span className="font-black text-slate-900">{activeUsers} คน</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                      style={{ width: `${totalUsers ? Math.min(100, Math.round((activeUsers / totalUsers) * 100)) : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-8">
            <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-black text-slate-900">ผู้ใช้ส่วนใหญ่ทำอะไรบ้าง</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                 
                </p>
              </div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-600">
                รวม {usageStats.total} คน
              </div>
            </div>

            <div className="space-y-5">
              {usageStats.rows.map((item) => {
                const Icon = item.meta.icon;
                return (
                  <div key={item.key} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.meta.bg} ${item.meta.text}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-black text-slate-800">{item.meta.label}</p>
                          <p className="text-xs font-semibold text-slate-400">{item.count} คน</p>
                        </div>
                      </div>
                      <span className="text-2xl font-black text-slate-900">{item.percent}%</span>
                    </div>

                    <div className="h-4 overflow-hidden rounded-full bg-slate-200">
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

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-8">
            <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-black text-slate-900">กิจกรรมล่าสุด</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  สมัครใหม่ เรียนจบบทเรียน ทำโจทย์ และความเคลื่อนไหวอื่น ๆ
                </p>
              </div>
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-blue-700">
                <Clock3 className="h-4 w-4" />
                ล่าสุด {recentActivities.length} รายการ
              </div>
            </div>

            {recentActivities.length === 0 ? (
              <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-12 text-sm font-semibold text-slate-400">
                ยังไม่มีกิจกรรมล่าสุด
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((activity, index) => {
                  const meta = activityMeta[activity.type] || activityMeta.active_task;
                  const mode = modeMeta[activity.mode] || modeMeta.account;
                  const Icon = meta.icon || CircleDot;
                  return (
                    <div
                      key={`${activity.type}-${activity.user_id}-${activity.created_at}-${index}`}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition-colors hover:bg-white sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${meta.bg} ${meta.text}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-black text-slate-900">{activity.username}</p>
                            <span className="text-sm font-semibold text-slate-500">{activity.title}</span>
                          </div>
                          <p className="truncate text-sm font-medium text-slate-500">{activity.description}</p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                        <span className={`rounded-full px-3 py-1 text-xs font-black ${mode.bg} ${mode.text}`}>
                          {mode.short}
                        </span>
                        <span className="min-w-[92px] text-right text-xs font-bold text-slate-400">
                          {formatTime(activity.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
