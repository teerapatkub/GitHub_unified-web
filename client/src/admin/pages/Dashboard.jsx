import { useEffect, useState } from "react";
import AdminNavbar from "../components/AdminNavbar";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/dashboard/stats")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error(err));

    fetch("http://localhost:3001/api/dashboard/recent-activities")
      .then((res) => res.json())
      .then((result) => {
        // กัน error map ไม่ได้
        setRecentActivities(Array.isArray(result) ? result : []);
      })
      .catch((err) => console.error(err));
  }, []);

  if (!data) {
    return (
      <>
        <AdminNavbar />
        <div className="min-h-screen mt-24 flex justify-center items-center">
          <p className="text-xl">กำลังโหลดแดชบอร์ด...</p>
        </div>
      </>
    );
  }

  // คำนวณเปอร์เซ็นต์
  const totalModes =
    (data.modes?.learn || 0) +
    (data.modes?.story || 0) +
    (data.modes?.endless || 0);

  const learnPercent = totalModes
    ? Math.round((data.modes.learn / totalModes) * 100)
    : 0;
  const onlinePercent = totalModes
    ? Math.round((data.modes.story / totalModes) * 100)
    : 0;
  const soloPercent = totalModes
    ? Math.round((data.modes.endless / totalModes) * 100)
    : 0;

  return (
    <>
      <AdminNavbar />

      <div className="min-h-screen pt-24">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-cyan-100 rounded-xl flex items-center justify-center">
                  <img src="/online icon.png" alt="Online" className="w-10 h-10" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">ผู้เล่นออนไลน์</p>
                  <p className="text-3xl font-bold">{data.activeUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                  <img src="/total icon.png" alt="Total" className="w-10 h-10" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">ผู้ใช้ทั้งหมด</p>
                  <p className="text-3xl font-bold">{data.totalUsers}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-8">
              สถิติการใช้งานขณะนี้
            </h2>

            {[
              {
                label: "โหมดเรียน",
                percent: learnPercent,
                sessions: data.modes.learn,
              },
              {
                label: "โหมดออนไลน์",
                percent: onlinePercent,
                sessions: data.modes.story,
              },
              {
                label: "โหมดเดี่ยว",
                percent: soloPercent,
                sessions: data.modes.endless,
              },
            ].map((item) => (
              <div key={item.label} className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">{item.label}</span>
                  <span className="font-bold">{item.percent}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-lg h-14 overflow-hidden">
                  <div
                    className="bg-cyan-400 h-full rounded-lg flex items-center px-4 transition-all duration-500"
                    style={{ width: `${item.percent}%` }}
                  >
                    {item.sessions} เซสชัน
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-8">
              กิจกรรมล่าสุด
            </h2>

            {recentActivities.length === 0 ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-gray-500">
                  ยังไม่มีกิจกรรมในช่วงนี้
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-100 rounded-xl px-6 py-4"
                  >
                    {/* User */}
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-cyan-200 flex items-center justify-center font-bold text-cyan-800">
                        {item.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{item.username}</p>
                        <p className="text-sm text-gray-500">
                          {item.theme_name || "ยังไม่ได้เลือกธีม"}
                        </p>
                      </div>
                    </div>

                    {/* Mode */}
                    <span
                      className={`px-4 py-1 rounded-full text-sm font-semibold
                        ${item.mode === "learn" && "bg-cyan-200 text-cyan-800"}
                        ${item.mode === "story" && "bg-green-200 text-green-800"}
                        ${item.mode === "endless" && "bg-purple-200 text-purple-800"}
                      `}
                    >
                      {item.mode === "learn" && "โหมดเรียน"}
                      {item.mode === "story" && "โหมดออนไลน์"}
                      {item.mode === "endless" && "โหมดเดี่ยว"}
                    </span>

                    {/* Time */}
                    <span className="text-sm text-gray-400 whitespace-nowrap">
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
