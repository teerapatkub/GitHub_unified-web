export async function loadLeaderboard(boardKey, { apiBase = '', fetchImpl = fetch } = {}) {
  let response;
  try {
    response = await fetchImpl(`${apiBase}/api/leaderboard?board=${encodeURIComponent(boardKey)}&limit=20`);
  } catch {
    throw new Error('เชื่อมต่อตารางอันดับไม่ได้ กรุณาตรวจสอบเครือข่ายแล้วลองใหม่');
  }
  if (!response.ok) {
    const error = new Error(response.status === 401
      ? 'กรุณาเข้าสู่ระบบอีกครั้งเพื่อดูตารางอันดับ'
      : 'โหลดตารางอันดับไม่สำเร็จ ลองใหม่อีกครั้ง');
    error.status = response.status;
    throw error;
  }
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('ข้อมูลตารางอันดับไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
  }
  if (!Array.isArray(data?.rows)) throw new Error('ข้อมูลตารางอันดับไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
  return data;
}
