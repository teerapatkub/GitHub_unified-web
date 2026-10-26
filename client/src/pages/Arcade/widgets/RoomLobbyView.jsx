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
      <div className="bg-pysim-card p-8 rounded-3xl shadow-sm border border-pysim-outline-variant flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-label font-black uppercase tracking-widest text-pysim-success-strong bg-pysim-success-container rounded-full border border-pysim-success-border">
              {t('inRoomLobbyBadge')}
            </span>
            <span className="px-3 py-1 bg-pysim-warning-container text-pysim-warning-strong text-xs font-mono font-bold rounded-full border border-pysim-warning-border flex items-center gap-1.5">
              <span>{t('roomCodeCopyLabel')} <strong>{currentRoom.room_code}</strong></span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(currentRoom.room_code);
                  notify(t('copiedNotice'), "success");
                }}
                className="hover:text-pysim-warning-strong underline text-label"
              >
                {t('copyBtn')}
              </button>
            </span>
          </div>
          <h1 className="text-3xl font-black text-pysim-on-surface tracking-tight">
            {currentRoom.room_name}
          </h1>
          <p className="text-xs text-pysim-label font-bold uppercase tracking-wider">
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
                    ? 'bg-pysim-surface-container text-pysim-label border-pysim-outline-variant cursor-not-allowed'
                    : 'bg-pysim-success-container hover:bg-pysim-success-container/90 text-pysim-success-strong border-pysim-success-border hover:scale-105 active:scale-95'
                }`}
                title={roomParticipants.length >= currentRoom.max_players ? t('roomFullTitle') : t('addBotTitle')}
              >
                {t('addBotBtn')}
              </button>

              <button
                onClick={() => {
                  // The room never carries its password hash; only whether it has one.
                  setSettingsForm({
                    room_name: currentRoom.room_name,
                    password: '',
                    has_password: Boolean(currentRoom.is_password_protected),
                    clear_password: false,
                    max_players: currentRoom.max_players,
                    round_format: currentRoom.round_format || 'mixed'
                  });
                  setShowSettingsModal(true);
                }}
                className="px-4 py-2.5 bg-pysim-surface-container hover:bg-pysim-surface-high text-pysim-on-surface-variant font-black text-xs rounded-xl border border-pysim-outline-variant transition-all flex items-center gap-1.5"
              >
                {t('roomSettingsBtn')}
              </button>
            </>
          )}

          <button
            onClick={handleLeaveRoom}
            className="px-4 py-2.5 bg-pysim-accent-container hover:bg-pysim-accent-container/90 text-pysim-accent-strong font-black text-xs rounded-xl border border-pysim-accent-border transition-all"
          >
            {t('leaveRoomBtn')}
          </button>
        </div>
      </div>

      {/* Participants List & Host Controls Grid */}
      <div className="bg-pysim-card p-8 rounded-3xl shadow-sm border border-pysim-outline-variant space-y-6">
        <h3 className="text-xs font-black text-pysim-label uppercase tracking-widest">
          {t('participantsListTitle')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roomParticipants.map((p, idx) => (
            <div key={p.id || idx} className={`p-6 rounded-3xl border flex flex-col justify-between space-y-4 relative ${p.is_host ? 'bg-pysim-warning-container/50 border-pysim-warning-border' : p.participant_kind === 'bot' ? 'bg-pysim-accent-container/30 border-pysim-accent-border' : 'bg-pysim-surface border-pysim-outline-variant'}`}>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm ${p.is_host ? 'bg-pysim-warning text-pysim-on-surface' : p.participant_kind === 'bot' ? 'bg-pysim-accent-strong text-pysim-on-primary' : 'bg-pysim-surface-high text-pysim-on-surface-variant'}`}>
                  {p.is_host ? '👑' : p.participant_kind === 'bot' ? '🤖' : idx + 1}
                </div>
                <div>
                  <span className="font-black text-xs text-pysim-on-surface">{p.user_name} {p.user_name === playerState.name ? t('youSuffix') : ""}</span>
                  <span className="block text-label font-bold text-pysim-label uppercase mt-0.5">
                    {p.is_host ? t('hostRoleLabel') : p.participant_kind === 'bot' ? t('botOpponentLabel') : t('playerRoleLabel')}
                  </span>
                </div>
              </div>

              {/* Host actions on other players */}
              {playerState.name === currentRoom.host_name && p.user_name !== playerState.name && (
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-pysim-outline-variant/60">
                  {p.participant_kind === 'human' && (
                    <button
                      onClick={() => handleTransferHost(p.user_name)}
                      className="inline-flex min-h-target items-center px-2.5 py-1 bg-pysim-warning-container hover:bg-pysim-warning-border text-pysim-warning-strong text-label font-bold rounded-lg transition-all"
                      title={t('transferHostTitle')}
                    >
                      {t('transferHostBtn')}
                    </button>
                  )}
                  <button
                    onClick={() => handleKickPlayer(p.user_name)}
                    className="inline-flex min-h-target items-center px-2.5 py-1 bg-pysim-accent-container hover:bg-pysim-accent-border text-pysim-accent-strong text-label font-bold rounded-lg transition-all"
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
            <div key={i} className="p-6 rounded-3xl border border-dashed border-pysim-outline-variant flex items-center justify-center text-pysim-label font-bold text-xs">
              {t('waitingNextPlayer')}
            </div>
          ))}
        </div>

        {/* Start Match Button — requires at least 2 participants (host + 1
            more, human or bot) so a solo host can never start a match with
            no real opponents. */}
        <div className="pt-6 border-t border-pysim-outline-variant flex flex-col items-center gap-2">
          {playerState.name === currentRoom.host_name ? (
            <button
              onClick={handleHostStartMatch}
              disabled={roomParticipants.length < 2}
              className={`px-12 py-4 font-black text-sm tracking-wider uppercase rounded-2xl transition-all ${
                roomParticipants.length < 2
                  ? 'bg-pysim-surface-container text-pysim-label cursor-not-allowed'
                  : 'bg-pysim-accent-strong hover:bg-pysim-accent-strong/90 text-pysim-on-primary shadow-xl shadow-pysim-accent-strong/20 hover:scale-105 active:scale-95'
              }`}
            >
              {t('startMatchBtn')} ({roomParticipants.length} / {currentRoom.max_players})
            </button>
          ) : (
            <div className="px-8 py-3.5 bg-pysim-surface-container text-pysim-label font-bold text-xs rounded-2xl border border-pysim-outline-variant motion-safe:animate-pulse">
              {t('waitingHostStartPrefix')} ({currentRoom.host_name}) {t('waitingHostStartSuffix')}
            </div>
          )}
          {playerState.name === currentRoom.host_name && roomParticipants.length < 2 && (
            <p className="text-label font-bold text-pysim-accent-strong">{t('needMinPlayers')}</p>
          )}
        </div>
      </div>

    </div>
  );
}
