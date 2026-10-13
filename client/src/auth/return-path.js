export function returnPath(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || /^\/[\\/]/.test(value)) return null;
  if (value === '/login' || value.startsWith('/login?') || value.startsWith('/login#')) return null;
  return value;
}
