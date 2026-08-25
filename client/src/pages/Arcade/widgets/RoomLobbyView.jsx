export default function RoomLobbyView({
  currentRoom,
  roomParticipants,
  playerState,
  notify,
  handleAddBot,
  setSettingsForm,
  setShowSettingsModal,
  handleLeaveRoom,
  handleTransferHost,
  handleKickPlayer,
  handleHostStartMatch,
  t
}) {
  return (
    <div className="space-y-6">

      {/* Room Info Header */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 rounded-full border border-emerald-100">
              {t('inRoomLobbyBadge')}
            </span>
            <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-mono font-bold rounded-full border border-amber-200 flex items-center gap-1.5">
              <span>{t('roomCodeCopyLabel')} <strong>{currentRoom.room_code}</strong></span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(currentRoom.room_code);
                  notify(t('copiedNotice'), "success");
                }}
                className="hover:text-amber-900 underline text-[10px]"
              >
                {t('copyBtn')}
              </button>
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            {currentRoom.room_name}
          </h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            {t('participantsInRoom')} ({roomParticipants.length} / {currentRoom.max_players} {t('playersCountUnit')})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Host Controls */}
          {playerState.name === currentRoom.host_name && (
            <>
              <button
                onClick={handleAddBot}
                disabled={roomParticipants.length >= currentRoom.max_players}
                className={`px-4 py-2.5 font-black text-xs rounded-xl border transition-all flex items-center gap-1.5 ${
                  roomParticipants.length >= currentRoom.max_players
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 hover:scale-105 active:scale-95'
                }`}
                title={roomParticipants.length >= currentRoom.max_players ? t('roomFullTitle') : t('addBotTitle')}
              >
                {t('addBotBtn')}
              </button>

              <button
                onClick={() => {
                  setSettingsForm({
                    room_name: currentRoom.room_name,
                    password: currentRoom.password || '',
                    max_players: currentRoom.max_players
                  });
                  setShowSettingsModal(true);
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-xl border border-slate-200 transition-all flex items-center gap-1.5"
              >
                {t('roomSettingsBtn')}
              </button>
            </>
          )}

          <button
            onClick={handleLeaveRoom}
            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-black text-xs rounded-xl border border-rose-200 transition-all"
          >
            {t('leaveRoomBtn')}
          </button>
        </div>
      </div>

      {/* Participants List & Host Controls Grid */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
          {t('participantsListTitle')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roomParticipants.map((p, idx) => (
            <div key={p.id || idx} className={`p-6 rounded-3xl border flex flex-col justify-between space-y-4 relative ${p.is_host ? 'bg-amber-50/50 border-amber-300' : p.user_name.startsWith('Bot_') ? 'bg-rose-50/30 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm ${p.is_host ? 'bg-amber-500 text-white' : p.user_name.startsWith('Bot_') ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {p.is_host ? '👑' : p.user_name.startsWith('Bot_') ? '🤖' : idx + 1}
                </div>
                <div>
                  <span className="font-black text-xs text-slate-800">{p.user_name} {p.user_name === playerState.name ? t('youSuffix') : ""}</span>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase mt-0.5">
                    {p.is_host ? t('hostRoleLabel') : p.user_name.startsWith('Bot_') ? t('botOpponentLabel') : t('playerRoleLabel')}
                  </span>
                </div>
              </div>

              {/* Host actions on other players */}
              {playerState.name === currentRoom.host_name && p.user_name !== playerState.name && (
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/60">
                  {!p.user_name.startsWith('Bot_') && (
                    <button
                      onClick={() => handleTransferHost(p.user_name)}
                      className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 text-[10px] font-bold rounded-lg transition-all"
                      title={t('transferHostTitle')}
                    >
                      {t('transferHostBtn')}
                    </button>
                  )}
                  <button
                    onClick={() => handleKickPlayer(p.user_name)}
                    className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 text-[10px] font-bold rounded-lg transition-all"
                    title={t('kickTitle')}
                  >
                    {t('kickBtn')}
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Placeholder slots */}
          {Array.from({ length: Math.max(0, currentRoom.max_players - roomParticipants.length) }).map((_, i) => (
            <div key={i} className="p-6 rounded-3xl border border-dashed border-slate-200 flex items-center justify-center text-slate-300 font-bold text-xs">
              {t('waitingNextPlayer')}
            </div>
          ))}
        </div>

        {/* Start Match Button — requires at least 2 participants (host + 1
            more, human or bot) so a solo host can never start a match with
            no real opponents. */}
        <div className="pt-6 border-t border-slate-100 flex flex-col items-center gap-2">
          {playerState.name === currentRoom.host_name ? (
            <button
              onClick={handleHostStartMatch}
              disabled={roomParticipants.length < 2}
              className={`px-12 py-4 font-black text-sm tracking-wider uppercase rounded-2xl transition-all ${
                roomParticipants.length < 2
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-xl shadow-rose-500/20 hover:scale-105 active:scale-95'
              }`}
            >
              {t('startMatchBtn')} ({roomParticipants.length} / {currentRoom.max_players})
            </button>
          ) : (
            <div className="px-8 py-3.5 bg-slate-100 text-slate-500 font-bold text-xs rounded-2xl border border-slate-200 animate-pulse">
              {t('waitingHostStartPrefix')} ({currentRoom.host_name}) {t('waitingHostStartSuffix')}
            </div>
          )}
          {playerState.name === currentRoom.host_name && roomParticipants.length < 2 && (
            <p className="text-[11px] font-bold text-rose-500">{t('needMinPlayers')}</p>
          )}
        </div>
      </div>

    </div>
  );
}
