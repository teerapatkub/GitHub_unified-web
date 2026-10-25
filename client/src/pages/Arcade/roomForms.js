// The create-room form's starting values, in one place. The form used to be
// initialised with five fields and reset after a successful create with only
// three, so the next room was sent without round_duration_mode or difficulty
// (bug A9). Five players matches the server's default for a new room.
export function newRoomForm() {
  return { room_name: '', password: '', max_players: 5, round_duration_mode: 'standard', difficulty: 'default' };
}

// Whether a saved "active room" marker exists, read once at mount so the
// lobby can say "reconnecting" instead of flashing the room list while the
// restore request is in flight (bug A8).
export function hasSavedActiveRoom(storage, key) {
  try {
    return Boolean(JSON.parse(storage.getItem(key) || 'null')?.room_id);
  } catch {
    return false;
  }
}
