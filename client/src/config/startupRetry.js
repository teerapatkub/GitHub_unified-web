// Waits out a server that is still starting (Spec 0005 ticket 15, bug U7).
// While the schema migrations run, the API answers 503, and the login page
// used to show "ตรวจสอบการเข้าสู่ระบบไม่ได้" and "Google sign-in is not
// enabled" and never try again. Retries on 503 or a network error only; any
// other answer, good or bad, is returned at once.
export const STARTUP_DELAYS_MS = [1000, 2000, 3000, 5000, 8000];

export async function fetchWhenServerReady(url, init, {
  fetchImpl = fetch, sleep = ms => new Promise(resolve => setTimeout(resolve, ms)),
  delays = STARTUP_DELAYS_MS, onWaiting = () => {},
} = {}) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      const response = await fetchImpl(url, init);
      if (response.status !== 503 || attempt >= delays.length) return response;
    } catch (error) {
      if (attempt >= delays.length) throw error;
    }
    onWaiting(attempt + 1);
    await sleep(delays[attempt]);
  }
}
