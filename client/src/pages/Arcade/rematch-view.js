// A room may reopen its lobby while a former player is still choosing whether
// to stay. That decision belongs to the viewer, not to the shared room phase.
export function roomViewForPlayer(data, userName) {
  const participants = data.participants || [];
  const pending = data.viewer_pending_choice === true;
  const viewerRow = pending
    ? data.viewer_participant
    : participants.find(participant => participant.user_name === userName);
  return {
    phase: pending ? 'RESULT' : (data.room.phase || 'LOBBY'),
    participants: pending && viewerRow ? [...participants, viewerRow] : participants,
    viewerRow,
    isMember: Boolean(viewerRow)
  };
}
