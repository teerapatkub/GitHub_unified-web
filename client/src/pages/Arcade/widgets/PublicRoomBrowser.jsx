export default function PublicRoomBrowser({
  rooms,
  fetchRooms,
  searchCode,
  setSearchCode,
  handleSearchJoin,
  setShowCreateModal,
  setJoinPasswordPrompt,
  handleJoinRoom,
  t
}) {
  return (
    <div className="space-y-6">

      {/* Header & Quick Code Search Bar */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 text-left">
          <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 rounded-full border border-rose-100">
            🌐 POSTGRESQL LIVE ARENA LOBBY
          </span>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            {t('publicRoomsTitle')}
          </h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            {t('publicRoomsSubtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Quick Search Input Form */}
          <form onSubmit={handleSearchJoin} className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
            <input
              type="text"
              placeholder={t('searchCodePlaceholder')}
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="bg-transparent px-3 py-1.5 text-xs font-mono font-bold text-slate-800 placeholder-slate-400 focus:outline-none w-48"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all"
            >
              {t('searchRoomBtn')}
            </button>
          </form>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <span>{t('createRoomBtn')}</span>
          </button>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-2">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
            {t('openRoomsLabel')} ({rooms.length} {t('roomsUnit')})
          </span>
          <button onClick={fetchRooms} className="text-xs font-bold text-rose-500 hover:underline">
            {t('refreshList')}
          </button>
        </div>

        {rooms.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <div className="text-4xl">🎮</div>
            <h3 className="text-base font-black text-slate-700">{t('noRoomsTitle')}</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {t('noRoomsDesc')}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl shadow-md transition-all"
            >
              {t('createFirstRoomBtn')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map(r => (
              <div key={r.room_id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:border-rose-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-slate-800 text-base">{r.room_name}</h3>
                      {r.is_password_protected && (
                        <span className="text-amber-500 text-xs" title={t('passwordProtectedTitle')}>🔒</span>
                      )}
                    </div>
                    <span className="inline-block mt-1 px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-mono font-bold rounded-lg border border-slate-200">
                      {t('roomCodeLabel')} {r.room_code}
                    </span>
                  </div>

                  <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-xl text-xs font-black border border-rose-100">
                    👥 {r.current_players} / {r.max_players} {t('playersUnit')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                  <span className="text-slate-500 font-bold flex items-center gap-1">
                    {t('hostLabel')} <strong className="text-slate-800">{r.host_name}</strong>
                  </span>

                  <button
                    onClick={() => {
                      if (r.is_password_protected) {
                        setJoinPasswordPrompt(r);
                      } else {
                        handleJoinRoom(r);
                      }
                    }}
                    className="px-5 py-2 bg-slate-900 hover:bg-rose-600 text-white rounded-xl font-black text-xs transition-all hover:scale-105 active:scale-95"
                  >
                    {t('joinBtn')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
