import { useEffect, useState } from "react";
import AdminNavbar from "../components/AdminNavbar";

export default function ManageAccount() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modal, setModal] = useState(null); // 'delete' | 'ban' | 'recover'
  const [banDuration, setBanDuration] = useState("24");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [tab, setTab] = useState("active"); // 'active' | 'banned' | 'deleted'

  const fetchUsers = () => {
    setLoading(true);
    fetch("http://localhost:3001/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openModal = (type, user) => {
    setSelectedUser(user);
    setModal(type);
    setBanDuration("24");
  };

  const closeModal = () => {
    setModal(null);
    setSelectedUser(null);
  };

  const handleDelete = async () => {
    const res = await fetch(
      `http://localhost:3001/api/admin/users/${selectedUser.user_id}/delete`,
      { method: "PUT" }
    );
    if (res.ok) {
      showToast(`Deleted: ${selectedUser.email || selectedUser.username}`);
      fetchUsers();
    } else {
      showToast("Failed to delete account", "error");
    }
    closeModal();
  };

  const handleBan = async () => {
    const res = await fetch(
      `http://localhost:3001/api/admin/users/${selectedUser.user_id}/ban`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hours: parseInt(banDuration) }),
      }
    );
    if (res.ok) {
      showToast(`Banned: ${selectedUser.email || selectedUser.username}`);
      fetchUsers();
    } else {
      showToast("Failed to ban account", "error");
    }
    closeModal();
  };

  const handleRecover = async () => {
    const res = await fetch(
      `http://localhost:3001/api/admin/users/${selectedUser.user_id}/recover`,
      { method: "PUT" }
    );
    if (res.ok) {
      showToast(`Recovered: ${selectedUser.email || selectedUser.username}`);
      fetchUsers();
    } else {
      showToast("Failed to recover account", "error");
    }
    closeModal();
  };

  const activeUsers  = users.filter((u) => !u.is_deleted && !u.is_banned);
  const bannedUsers  = users.filter((u) => u.is_banned && !u.is_deleted);
  const deletedUsers = users.filter((u) => u.is_deleted);

  const displayedUsers =
    tab === "active" ? activeUsers : tab === "banned" ? bannedUsers : deletedUsers;

  const getStatusBadge = (user) => {
    if (user.is_deleted)
      return <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-600 font-semibold">Deleted</span>;
    if (user.is_banned)
      return <span className="px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-600 font-semibold">Banned</span>;
    return <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 font-semibold">Active</span>;
  };

  const avatarChar = (user) =>
    (user.username || user.email || "?").charAt(0).toUpperCase();

  const avatarColors = ["bg-cyan-400","bg-purple-400","bg-pink-400","bg-yellow-400","bg-blue-400","bg-emerald-400"];
  const avatarColor  = (user) => {
    const str = user.username || user.email || "";
    return avatarColors[str.charCodeAt(0) % avatarColors.length];
  };

  const tabs = [
    { key: "active",  label: "Active",  count: activeUsers.length,  ring: "border-emerald-400 text-emerald-600" },
    { key: "banned",  label: "Banned",  count: bannedUsers.length,  ring: "border-orange-400 text-orange-500"  },
    { key: "deleted", label: "Deleted", count: deletedUsers.length, ring: "border-red-400 text-red-500"        },
  ];

  return (
    <>
      <AdminNavbar />

      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-xl shadow-xl text-white text-sm font-semibold
          ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
          {toast.msg}
        </div>
      )}

      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Header card */}
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">User Account</h1>
            

            {/* Tabs */}
            <div className="flex gap-3 mt-5 flex-wrap">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => { setTab(t.key); setSelectedUser(null); }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all duration-200
                    ${tab === t.key ? `${t.ring} bg-gray-50` : "border-transparent text-gray-400 hover:bg-gray-100"}`}
                >
                  {t.label}
                  <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{t.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* User list */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : displayedUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <svg className="w-12 h-12 mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857
                       M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857
                       m0 0a5.002 5.002 0 019.288 0" />
                </svg>
                <p className="font-medium">No users in this category</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {displayedUsers.map((user) => {
                  const isSelected = selectedUser?.user_id === user.user_id;
                  return (
                    <div
                      key={user.user_id}
                      onClick={() => setSelectedUser(isSelected ? null : user)}
                      className={`flex items-center justify-between px-6 py-4 cursor-pointer transition-all duration-150
                        ${isSelected
                          ? "bg-cyan-50 border-l-4 border-cyan-400"
                          : "hover:bg-gray-50 border-l-4 border-transparent"}`}
                    >
                      {/* Left: radio + avatar + info */}
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                          ${isSelected ? "border-cyan-500 bg-cyan-500" : "border-gray-300"}`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>

                        <div className={`w-10 h-10 rounded-full ${avatarColor(user)} flex items-center justify-center font-bold text-white text-sm`}>
                          {avatarChar(user)}
                        </div>

                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{user.username || "—"}</p>
                          <p className="text-gray-400 text-xs">{user.email}</p>
                        </div>
                      </div>

                      {/* Right: status + ban expiry */}
                      <div className="flex items-center gap-4">
                        {user.is_banned && user.ban_until && (
                          <span className="text-xs text-gray-400 hidden sm:block">
                            Until: {new Date(user.ban_until).toLocaleString()}
                          </span>
                        )}
                        {getStatusBadge(user)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              disabled={!selectedUser || tab === "deleted"}
              onClick={() => openModal("delete", selectedUser)}
              className="px-6 py-3 rounded-xl font-semibold text-sm bg-red-500 text-white
                         hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed
                         transition-all duration-200 shadow-md hover:shadow-lg"
            >
               Delete Account
            </button>

            <button
              disabled={!selectedUser || tab === "deleted"}
              onClick={() => openModal("ban", selectedUser)}
              className="px-6 py-3 rounded-xl font-semibold text-sm bg-orange-400 text-white
                         hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed
                         transition-all duration-200 shadow-md hover:shadow-lg"
            >
               Ban Account
            </button>

            <button
              disabled={!selectedUser || tab === "active"}
              onClick={() => openModal("recover", selectedUser)}
              className="px-6 py-3 rounded-xl font-semibold text-sm bg-emerald-500 text-white
                         hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed
                         transition-all duration-200 shadow-md hover:shadow-lg"
            >
               Recover Account
            </button>
          </div>

        </div>
      </div>

      {/* ──────────── Modals ──────────── */}
      {modal && selectedUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 animate-fade-in">

            {/* DELETE */}
            {modal === "delete" && (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl"></span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Delete Account?</h2>
                  <p className="text-gray-500 text-sm mt-2">
                    The user will no longer be able to access the site.
                  </p>
                  <p className="mt-3 font-semibold text-gray-700 bg-gray-100 rounded-xl px-4 py-2 text-sm break-all">
                    {selectedUser.email || selectedUser.username}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={closeModal}
                    className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleDelete}
                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors">
                    Delete
                  </button>
                </div>
              </>
            )}

            {/* BAN */}
            {modal === "ban" && (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl"></span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Ban Account?</h2>
                  <p className="mt-3 font-semibold text-gray-700 bg-gray-100 rounded-xl px-4 py-2 text-sm break-all">
                    {selectedUser.email || selectedUser.username}
                  </p>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Ban Duration</label>
                  <select
                    value={banDuration}
                    onChange={(e) => setBanDuration(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium
                               focus:outline-none focus:border-orange-400 transition-colors"
                  >
                    <option value="1">1 Hour</option>
                    <option value="6">6 Hours</option>
                    <option value="24">1 Day</option>
                    <option value="72">3 Days</option>
                    <option value="168">1 Week</option>
                    <option value="720">1 Month</option>
                    <option value="8760">1 Year</option>
                    <option value="87600">Permanent (10 years)</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button onClick={closeModal}
                    className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleBan}
                    className="flex-1 py-3 rounded-xl bg-orange-400 text-white font-semibold hover:bg-orange-500 transition-colors">
                    Ban
                  </button>
                </div>
              </>
            )}

            {/* RECOVER */}
            {modal === "recover" && (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl"></span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Recover Account?</h2>
                  <p className="text-gray-500 text-sm mt-2">
                    The account will be restored to active status.
                  </p>
                  <p className="mt-3 font-semibold text-gray-700 bg-gray-100 rounded-xl px-4 py-2 text-sm break-all">
                    {selectedUser.email || selectedUser.username}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={closeModal}
                    className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleRecover}
                    className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors">
                    Recover
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>
    </>
  );
}
