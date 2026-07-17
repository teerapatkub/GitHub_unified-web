import { useEffect, useState } from "react";
import { Trophy, Medal, Star, TrendingUp, RefreshCw } from "lucide-react";
import AdminNavbar from "../components/AdminNavbar";

const RANK_STYLE = [
  { bg: "bg-yellow-50", border: "border-yellow-200", badge: "bg-gradient-to-br from-yellow-400 to-amber-500", text: "text-yellow-700", icon: "🥇" },
  { bg: "bg-slate-50",  border: "border-slate-200",  badge: "bg-gradient-to-br from-slate-400 to-slate-500", text: "text-slate-600",  icon: "🥈" },
  { bg: "bg-orange-50", border: "border-orange-200", badge: "bg-gradient-to-br from-orange-400 to-red-400",   text: "text-orange-700", icon: "🥉" },
];

const avatarColors = [
  "bg-cyan-400", "bg-purple-400", "bg-pink-400",
  "bg-yellow-400", "bg-blue-400", "bg-emerald-400",
];
const avatarColor = (str = "") => avatarColors[str.charCodeAt(0) % avatarColors.length];

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("score"); // 'score' | 'level' | 'coins'

  const fetchLeaderboard = () => {
    setLoading(true);
    fetch("http://localhost:3001/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(Array.isArray(data) ? data.filter((u) => !u.is_deleted) : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchLeaderboard(); }, []);

  const sorted = [...users].sort((a, b) => {
    if (tab === "score")  return (b.high_score  || 0) - (a.high_score  || 0);
    if (tab === "level")  return (b.level        || 0) - (a.level        || 0);
    if (tab === "coins")  return (b.coins         || 0) - (a.coins         || 0);
    return 0;
  });

  const tabs = [
    { key: "score",  label: "คะแนน",    icon: <Trophy   size={14} /> },
    { key: "level",  label: "เลเวล",    icon: <Star     size={14} /> },
    { key: "coins",  label: "เหรียญ",   icon: <Medal    size={14} /> },
  ];

  const statValue = (user) => {
    if (tab === "score") return (user.high_score || 0).toLocaleString();
    if (tab === "level") return `Lv.${user.level || 1}`;
    if (tab === "coins") return (user.coins || 0).toLocaleString();
    return "—";
  };

  return (
    <>
      <AdminNavbar />

      <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* ── Header ── */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Trophy size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">ตารางอันดับ</h1>
                  <p className="text-yellow-100 text-xs mt-0.5">Leaderboard — อันดับผู้เล่นทั้งหมด</p>
                </div>
              </div>
              <button
                onClick={fetchLeaderboard}
                className="p-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition"
                title="รีเฟรช"
              >
                <RefreshCw size={16} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-4 border-b border-slate-100">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition
                    ${tab === t.key
                      ? "bg-amber-50 text-amber-600 border-2 border-amber-300"
                      : "text-slate-500 border-2 border-transparent hover:bg-slate-50"
                    }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2 text-xs text-slate-400">
                <TrendingUp size={13} />
                {users.length} ผู้เล่น
              </div>
            </div>
          </div>

          {/* ── Top 3 Podium ── */}
          {!loading && sorted.length >= 3 && (
            <div className="grid grid-cols-3 gap-4">
              {[sorted[1], sorted[0], sorted[2]].map((user, displayIdx) => {
                const realRank = displayIdx === 0 ? 2 : displayIdx === 1 ? 1 : 3;
                const s = RANK_STYLE[realRank - 1];
                return (
                  <div
                    key={user.user_id}
                    className={`${s.bg} border-2 ${s.border} rounded-2xl p-5 flex flex-col items-center gap-3 shadow-md
                      ${realRank === 1 ? "ring-2 ring-yellow-300 shadow-yellow-100 -mt-3" : ""}`}
                  >
                    {/* Rank badge */}
                    <div className={`w-10 h-10 rounded-full ${s.badge} flex items-center justify-center text-white font-black text-lg shadow-md`}>
                      {s.icon}
                    </div>
                    {/* Avatar */}
                    <div className={`w-14 h-14 rounded-full ${avatarColor(user.username)} flex items-center justify-center font-black text-white text-xl shadow-sm ring-4 ring-white`}>
                      {(user.username || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-slate-800 text-sm truncate max-w-[100px]">{user.username || "—"}</p>
                      <p className={`text-lg font-black ${s.text}`}>{statValue(user)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Full List ── */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : sorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
                <Trophy size={32} className="opacity-30" />
                <p className="font-medium text-sm">ยังไม่มีข้อมูลผู้เล่น</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {sorted.map((user, idx) => {
                  const rank = idx + 1;
                  const topStyle = RANK_STYLE[rank - 1];
                  return (
                    <div
                      key={user.user_id}
                      className={`flex items-center px-6 py-4 transition-all duration-150
                        ${rank <= 3 ? `${topStyle.bg} border-l-4 ${topStyle.border.replace("border-", "border-l-")}` : "hover:bg-slate-50 border-l-4 border-transparent"}`}
                    >
                      {/* Rank */}
                      <div className={`w-8 text-center font-black text-sm flex-shrink-0
                        ${rank === 1 ? "text-yellow-500" : rank === 2 ? "text-slate-500" : rank === 3 ? "text-orange-500" : "text-slate-300"}`}>
                        {rank <= 3 ? topStyle.icon : rank}
                      </div>

                      {/* Avatar */}
                      <div className={`w-9 h-9 rounded-full ${avatarColor(user.username)} flex items-center justify-center font-bold text-white text-sm flex-shrink-0 mx-3`}>
                        {(user.username || "?").charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-sm truncate">{user.username || "—"}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>

                      {/* Stat */}
                      <div className="text-right flex-shrink-0">
                        <p className={`font-black text-base ${rank <= 3 ? topStyle.text : "text-slate-700"}`}>
                          {statValue(user)}
                        </p>
                        <p className="text-xs text-slate-400 capitalize">
                          {tab === "score" ? "high score" : tab === "level" ? "level" : "coins"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
