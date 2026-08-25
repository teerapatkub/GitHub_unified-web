# บันทึกการทำงาน (Work Log)

**วันที่และเวลา**: 2026-08-17 02:40
**ผู้ทำงาน**: Person 3 (Arcade Battle Royale & Overall System Architecture)
**บริบท**: ผู้ใช้ขอให้เปลี่ยนระบบตรวจ/ให้คะแนนโค้ดของ Arcade Battle Royale จาก Claude (Anthropic) เป็น NVIDIA-hosted model (`nvidia/nemotron-3.5-lightning-30b-a3b`) ผ่าน `openai` npm package พร้อมออกแบบสูตรคะแนนใหม่: ตรวจ 3 ส่วน (1) test case (2) ความสวยงาม+ประสิทธิภาพโค้ด (3) เวลาที่ใช้ แต่ละส่วนคะแนนหลักร้อย (0-100) แล้วนำมารวมกันเพื่อจัดอันดับ — ถามผู้ใช้ยืนยันวิธีรวมคะแนนก่อนแก้ (เลือก "รวมน้ำหนักเท่ากันทุกส่วน")

⚠️ **หมายเหตุความปลอดภัย**: ผู้ใช้วาง API key ของ NVIDIA ตรงในข้อความแชท — เก็บไว้เฉพาะใน `server/.env` (อยู่ใน `.gitignore` แล้ว) เท่านั้น **ไม่ hardcode ลงซอร์สโค้ดเด็ดขาด** ตามกฎ `CLAUDE.md`

## สิ่งที่แก้ไข

### ใหม่: `server/.env`
เพิ่ม `NVIDIA_CODE_JUDGE_API_KEY=nvapi-...` (key ที่ผู้ใช้ให้มา) — คนละตัวกับ `NVIDIA_GLM_API_KEY` ที่มีอยู่แล้วสำหรับ AI helper/job generator ของ Person 1/2 (ไม่แตะของเดิม)

### `server/package.json`
เพิ่ม dependency `openai` (^7.4.0) ผ่าน `npm install openai`

### `server/server.js`
- `require('openai')` เพิ่มที่ส่วน import ด้านบน
- ลบ `callClaudeForReadability()` (Anthropic/Claude) ทิ้งทั้งหมด แทนที่ด้วย `judgeCodeQuality()` — เรียก NVIDIA ผ่าน `OpenAI` client (`baseURL: 'https://integrate.api.nvidia.com/v1'`) โมเดล `nvidia/nemotron-3.5-lightning-30b-a3b` แบบ non-streaming, ปิด extended thinking (`enable_thinking: false`) เพื่อความเร็ว/ความแน่นอนของคำตอบ (เดิมตัวอย่างจากผู้ใช้เปิด streaming+thinking ซึ่งเหมาะกับ demo แชทโต้ตอบ ไม่เหมาะกับ path ที่ต้องตอบเร็วระหว่างแมตช์กำลังแข่งอยู่) — prompt สั่งให้ประเมินทั้งความสวยงาม**และ**ประสิทธิภาพรวมเป็นคะแนนเดียว 0-100, ไม่ตัดสินความถูกต้อง, ให้คะแนนต่ำ (0-10) ถ้าโค้ดว่างเปล่า/เป็นแค่ stub (`pass`)
- `heuristicReadabilityScore()` เปลี่ยนชื่อเป็น `heuristicCodeQualityScore()` (ฟังก์ชันเดิมไม่เปลี่ยน logic — ใช้เป็น fallback เมื่อไม่มี API key หรือเรียก NVIDIA ไม่สำเร็จ)
- `POST /rooms/:id/judge-round` เปลี่ยนไปเรียก `judgeCodeQuality()` แทน, response field เปลี่ยนจาก `readabilityScore` เป็น `qualityScore`
- `synthesizeBotRoundScore()` เปลี่ยนสูตรจาก `passCount * 10_000_000 + readability * 10_000 + timeBonus` (tiered/lexicographic scale) เป็น `testScore(0-100) + qualityScore(0-100) + timeScore(0-100)` (equal-weight, max 300) ให้ตรงกับสูตรใหม่ฝั่งผู้เล่นจริง

### `client/src/pages/ArcadeBattleRoyale.jsx`
- `requestReadabilityScore()` เปลี่ยนชื่อเป็น `requestQualityScore()`, อ่าน field `data.qualityScore` แทน `data.readabilityScore`
- `submitMyRound()`: สูตรคะแนนเปลี่ยนจาก `passCount * 10_000_000 + readabilityScore * 10_000 + timeBonus` เป็นสูตรถ่วงน้ำหนักเท่ากัน 3 ส่วน:
  - `testScore = (passCount / totalCount) * 100`
  - `qualityScore` = คะแนนจาก NVIDIA judge (0-100)
  - `timeScore = ((roundDuration - timeUsed) / roundDuration) * 100`
  - `roundScore = testScore + qualityScore + timeScore` (max 300, ×2 ถ้ามี scoreMultiplier ทำงานอยู่)
- แก้ notify message ที่แสดงผลหลังส่งคำตอบให้อ้างอิงตัวแปรชื่อใหม่ (`qualityScore` แทน `readabilityScore` เดิมที่ตกค้าง)

## เหตุผลของการเปลี่ยนแปลง
ผู้ใช้ต้องการเปลี่ยน AI provider สำหรับตรวจโค้ด และปรับปรุงระบบให้คะแนนจาก "correctness ครอบคลุมทุกอย่างแบบ tiered" เป็น "3 มิติน้ำหนักเท่ากัน" เพื่อให้ความสวยงาม/ประสิทธิภาพและความเร็วมีผลต่ออันดับจริงมากกว่าการเป็นแค่ตัวตัดสินเสมอ (เดิม correctness คูณ 10 ล้าน ทำให้ 2 มิติที่เหลือแทบไม่มีผลต่ออันดับเลยนอกจากตอนคะแนน correctness เท่ากันเป๊ะ)

## การทดสอบ
1. `node --check server.js` — ผ่าน
2. `npx eslint` — ไม่มี error ใหม่ (ตรงกับ baseline เดิมของเซสชันนี้)
3. `npm run build` — ผ่านสำเร็จ
4. **ทดสอบผ่าน API จริงกับ NVIDIA endpoint จริง (ไม่ mock)**:
   - โค้ด Fibonacci แบบ iterative สะอาด → `qualityScore: 95, source: "ai"`
   - โค้ด Fibonacci แบบ recursive exponential-time + ตัวแปรตั้งชื่อแย่ → `qualityScore: 20, source: "ai"` (ยืนยันว่าโมเดลแยกแยะทั้งความสวยงามและประสิทธิภาพได้จริง)
   - โค้ดว่างเปล่า/แค่ `pass` → `qualityScore: 0` (หลังปรับ prompt เพิ่มกฎนี้ — รอบแรกก่อนปรับได้ 85 ซึ่งไม่สมเหตุสมผล)
5. **ทดสอบ pipeline เต็มรูปแบบผ่านห้องจริง**: สร้างห้อง 2 คน (จริง+บอท), ส่งคะแนนรอบจริง `275` (จำลอง test 100 + quality 95 + time ~80), บังคับ finalize จริง → คะแนนบันทึกถูกต้อง (`qatester1: 275, cash +500`), บอทได้คะแนนสังเคราะห์ในสเกลใหม่ที่สมเหตุสมผล (`177, cash +400`) จัดอันดับถูกต้องตามคะแนน — ยืนยันสูตรใหม่ทำงานถูกต้องตลอด pipeline ตั้งแต่ judge → submit-round → finalizeArcadePhase

## ผลกระทบที่อาจมีต่อส่วนอื่นของระบบ
- ไม่กระทบ schema (ไม่มีคอลัมน์ใหม่, `score`/`pending_round_score` เก็บตัวเลขเหมือนเดิมแค่สเกลเล็กลง)
- ไม่กระทบ `NVIDIA_GLM_API_KEY`/`callAiChat()` ที่ Person 1/2 ใช้อยู่ (คนละ key, คนละฟังก์ชัน, คนละโมเดล)
- ลบ dependency บน `ANTHROPIC_API_KEY` ออกจากระบบ Arcade ทั้งหมด (ไม่มีจุดอื่นในโค้ดที่ยังอ้างถึงตัวแปรนี้แล้ว — ตรวจสอบด้วย grep)
- **Breaking scale change**: คะแนนรอบตอนนี้อยู่ในช่วง 0-300 (เดิมเป็นตัวเลขหลักสิบล้าน) — ถ้ามีโค้ดจุดอื่นในอนาคตที่ตั้งสมมติฐานเกี่ยวกับสเกลคะแนนเดิม (เช่น การแสดงผล, การเปรียบเทียบ threshold) ต้องตรวจสอบด้วย — ตอนนี้ grep ทั้งโปรเจกต์แล้วไม่พบจุดอื่นที่พึ่งพาสเกลเดิม

## สิ่งที่ยังไม่เสร็จ / ควรทดสอบเพิ่ม
- ยังไม่ได้ทดสอบ end-to-end ผ่านเบราว์เซอร์จริง (คลิกส่งคำตอบจริงในรอบจริง แล้วดูคะแนนที่แสดงในหน้าจอ) — ทดสอบผ่าน API/DB โดยตรงเท่านั้น ซึ่งเป็น code path เดียวกับที่ client เรียกทุกจุด (ยืนยันด้วยการอ่านโค้ด + ทดสอบแต่ละ endpoint แยกจริงแล้ว) ความเสี่ยงต่ำ แต่ควรลองเล่นจริงผ่าน UI สักรอบถ้ามีโอกาส
- ยังไม่ได้ตั้งค่า `chat_template_kwargs`/`temperature` ให้ผู้ใช้ปรับแต่งได้ผ่าน config — เป็นค่าคงที่ในโค้ดตอนนี้ (0.3 temperature, thinking ปิด) ถ้าต้องการปรับพฤติกรรมการตรวจในอนาคตต้องแก้ในโค้ดโดยตรง
