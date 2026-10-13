import { canEnterGameModes } from '../utils/gameModeAccess.js';
import { returnPath } from './return-path.js';

export function accessForRoute({ ready, user, kind }) {
  if (!ready) return 'waiting';
  if (!user || user.isGuest || (Number(user.level) === 0 && user.role !== 'admin')) return 'login';
  if (kind === 'admin') return user.role === 'admin' ? 'allow' : 'learn';
  if (kind === 'student' && user.role === 'admin') return 'admin';
  if (kind === 'game' && !canEnterGameModes(user)) return 'locked';
  return 'allow';
}

export function loginUrlFor(from) {
  const destination = returnPath(from);
  return destination ? `/login?returnTo=${encodeURIComponent(destination)}` : '/login';
}

export function returnDestination(location) {
  const query = new URLSearchParams(location.search || '');
  return returnPath(location.state?.from) || returnPath(query.get('returnTo'));
}
