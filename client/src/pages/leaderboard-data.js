import { requestJson } from '../config/api-client.js';
import { API_BASE } from '../config/api.js';

export async function loadLeaderboard(boardKey, { apiBase = API_BASE, fetchImpl = fetch } = {}) {
  let data;
  try {
    data = await requestJson(`/api/leaderboard?board=${encodeURIComponent(boardKey)}&limit=20`, {
      base: apiBase, fetchImpl
    });
  } catch (error) {
    if (error.kind === 'network') throw new Error('เชื่อมต่อตารางอันดับไม่ได้ กรุณาตรวจสอบเครือข่ายแล้วลองใหม่');
    if (error.kind === 'unauthorized') throw new Error('กรุณาเข้าสู่ระบบอีกครั้งเพื่อดูตารางอันดับ');
    if (error.kind === 'invalid') throw new Error('ข้อมูลตารางอันดับไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
    throw new Error('โหลดตารางอันดับไม่สำเร็จ ลองใหม่อีกครั้ง');
  }
  if (!Array.isArray(data?.rows)) throw new Error('ข้อมูลตารางอันดับไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
  return data;
}
