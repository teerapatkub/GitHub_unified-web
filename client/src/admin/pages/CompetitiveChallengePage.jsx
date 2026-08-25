import { useState } from "react";
import {
  CalendarDays,
  Clock3,
  Coins,
  Flame,
  ListChecks,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import AdminNavbar from "../components/AdminNavbar";

const API_BASE = "http://localhost:3001";

const emptyCase = () => ({ lines: [""], expected: "" });

const challengePlans = [
  {
    key: "daily",
    label: "โจทย์รายวัน",
    shortLabel: "รายวัน",
    description: "เวลา 30 นาที เปิดรับ 1 วัน",
    reward: 800,
    timeLimit: 1800,
    durationDays: 1,
    difficulty: "Daily Hard",
    icon: CalendarDays,
  },
  {
    key: "weekly",
    label: "โจทย์รายสัปดาห์",
    shortLabel: "รายสัปดาห์",
    description: "เวลา 90 นาที เปิดรับ 7 วัน",
    reward: 2500,
    timeLimit: 5400,
    durationDays: 7,
    difficulty: "Weekly Expert",
    icon: Flame,
  },
];

const getChallengePlan = (key) => challengePlans.find((plan) => plan.key === key) || challengePlans[0];

const buildExpiresAt = (durationDays) => (
  new Date(Date.now() + Number(durationDays || 1) * 24 * 60 * 60 * 1000).toISOString()
);

const inputCls =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100";

const textareaCls =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100";

export default function CompetitiveChallengePage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    challengeScope: "daily",
    reward: challengePlans[0].reward,
    timeLimit: challengePlans[0].timeLimit,
    category: "Python",
    testCases: [emptyCase()],
  });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const applyChallengePlan = (planKey) => {
    const plan = getChallengePlan(planKey);
    setForm((current) => ({
      ...current,
      challengeScope: plan.key,
      reward: plan.reward,
      timeLimit: plan.timeLimit,
    }));
  };

  const updateCase = (caseIndex, field, value) => {
    setForm((current) => ({
      ...current,
      testCases: current.testCases.map((testCase, index) => (
        index === caseIndex ? { ...testCase, [field]: value } : testCase
      )),
    }));
  };

  const updateCaseLine = (caseIndex, lineIndex, value) => {
    setForm((current) => ({
      ...current,
      testCases: current.testCases.map((testCase, index) => {
        if (index !== caseIndex) return testCase;
        return {
          ...testCase,
          lines: testCase.lines.map((line, currentLineIndex) => (
            currentLineIndex === lineIndex ? value : line
          )),
        };
      }),
    }));
  };

  const addCaseLine = (caseIndex) => {
    setForm((current) => ({
      ...current,
      testCases: current.testCases.map((testCase, index) => (
        index === caseIndex
          ? { ...testCase, lines: [...testCase.lines, ""] }
          : testCase
      )),
    }));
  };

  const removeCaseLine = (caseIndex, lineIndex) => {
    setForm((current) => ({
      ...current,
      testCases: current.testCases.map((testCase, index) => {
        if (index !== caseIndex || testCase.lines.length === 1) return testCase;
        return {
          ...testCase,
          lines: testCase.lines.filter((_, currentLineIndex) => currentLineIndex !== lineIndex),
        };
      }),
    }));
  };

  const addTestCase = () => {
    setForm((current) => ({
      ...current,
      testCases: [...current.testCases, emptyCase()],
    }));
  };

  const removeTestCase = (caseIndex) => {
    setForm((current) => ({
      ...current,
      testCases: current.testCases.length > 1
        ? current.testCases.filter((_, index) => index !== caseIndex)
        : current.testCases,
    }));
  };

  const buildPayloadTestCases = () => (
    form.testCases
      .map((testCase) => ({
        input: testCase.lines.join("\n").trimEnd(),
        expected: String(testCase.expected || "").trimEnd(),
      }))
      .filter((testCase) => testCase.expected.trim())
  );

  const submitChallenge = async (event) => {
    event.preventDefault();
    const testCases = buildPayloadTestCases();

    if (!form.title.trim() || !form.description.trim() || testCases.length === 0) {
      alert("กรุณากรอกชื่อโจทย์ รายละเอียด และ test case อย่างน้อย 1 ข้อ");
      return;
    }

    setSaving(true);
    setNotice("");
    try {
      const adminUser = JSON.parse(localStorage.getItem("user") || "null");
      const plan = getChallengePlan(form.challengeScope);
      const res = await fetch(`${API_BASE}/api/competitive/challenges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          reward: Number(form.reward || 300),
          time_limit: Number(form.timeLimit || 300),
          expires_at: buildExpiresAt(plan.durationDays),
          challenge_type: "scheduled",
          challenge_scope: plan.key,
          created_by: adminUser?.user_id || null,
          difficulty: plan.difficulty,
          test_cases: testCases,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "สร้างโจทย์ไม่สำเร็จ");
        return;
      }

      setForm({
        title: "",
        description: "",
        challengeScope: "daily",
        reward: challengePlans[0].reward,
        timeLimit: challengePlans[0].timeLimit,
        category: "Python",
        testCases: [emptyCase()],
      });
      setNotice(`โพสต์${plan.label}สำเร็จแล้ว #${data.challenge_id}`);
    } catch (err) {
      console.error(err);
      alert("เชื่อมต่อ Competitive Arena ไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavbar />

      <main className="mx-auto max-w-6xl px-4 pb-12 pt-24 sm:px-6">
        <form onSubmit={submitChallenge} className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-600">
                  Admin Challenge
                </p>
                <h1 className="mt-2 text-3xl font-black text-slate-950">
                  สร้างโจทย์การแข่งขัน
                </h1>
                <p className="mt-2 max-w-2xl text-sm font-semibold text-slate-500">
                  โจทย์ที่โพสต์จากหน้านี้จะแสดงใน Competitive Arena ให้ผู้เล่นรับงานได้ทันที
                </p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "กำลังโพสต์" : "โพสต์โจทย์"}
              </button>
            </div>

            {notice && (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">
                {notice}
              </div>
            )}
          </section>

          <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid gap-4">
                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">ชื่อโจทย์</span>
                  <input
                    value={form.title}
                    onChange={(event) => updateForm("title", event.target.value)}
                    placeholder="เช่น หาคะแนนสูงสุด"
                    className={inputCls}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">รายละเอียดโจทย์</span>
                  <textarea
                    value={form.description}
                    onChange={(event) => updateForm("description", event.target.value)}
                    rows={8}
                    placeholder={"อธิบายสิ่งที่ต้องทำ\nข้อมูลนำเข้า:\n...\n\nผลลัพธ์:\n..."}
                    className={textareaCls}
                  />
                </label>
              </div>
            </div>

            <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-4">
                <div>
                  <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">ประเภทโจทย์</span>
                  <div className="grid gap-2">
                    {challengePlans.map((plan) => {
                      const Icon = plan.icon;
                      const selected = form.challengeScope === plan.key;
                      return (
                        <button
                          key={plan.key}
                          type="button"
                          onClick={() => applyChallengePlan(plan.key)}
                          className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                            selected
                              ? "border-blue-500 bg-blue-50 text-blue-700 ring-4 ring-blue-100"
                              : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50/40"
                          }`}
                        >
                          <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${selected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-black">{plan.label}</span>
                            <span className="block text-xs font-bold text-slate-400">{plan.description}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                    <Coins className="h-4 w-4 text-amber-500" />
                    รางวัล
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={form.reward}
                    onChange={(event) => updateForm("reward", Number(event.target.value))}
                    className={inputCls}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                    <Clock3 className="h-4 w-4 text-blue-500" />
                    เวลา (วินาที)
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={form.timeLimit}
                    onChange={(event) => updateForm("timeLimit", Number(event.target.value))}
                    className={inputCls}
                  />
                </label>

                <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                  <p className="text-xs font-black uppercase tracking-widest text-amber-700">
                    {getChallengePlan(form.challengeScope).shortLabel}
                  </p>
                  <p className="mt-1 text-sm font-bold text-amber-900">
                    เปิดรับ {getChallengePlan(form.challengeScope).durationDays} วัน • รางวัลสูงสำหรับโจทย์ยาก
                  </p>
                </div>

                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">หมวด</span>
                  <select
                    value={form.category}
                    onChange={(event) => updateForm("category", event.target.value)}
                    className={inputCls}
                  >
                    <option>Python</option>
                    <option>Loop</option>
                    <option>If-Else</option>
                    <option>List</option>
                    <option>String</option>
                    <option>Function</option>
                    <option>Math</option>
                  </select>
                </label>
              </div>
            </aside>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <ListChecks className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Test cases</h2>
                  <p className="text-xs font-bold text-slate-400">ผู้โพสต์ต้องกำหนด input และคำตอบเองก่อนโพสต์</p>
                </div>
              </div>

              <button
                type="button"
                onClick={addTestCase}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-xs font-black text-blue-600 ring-1 ring-slate-200 transition hover:bg-blue-50"
              >
                <Plus className="h-4 w-4" />
                เพิ่ม case
              </button>
            </div>

            <div className="space-y-4">
              {form.testCases.map((testCase, caseIndex) => (
                <div key={caseIndex} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-black text-slate-900">Test case #{caseIndex + 1}</h3>
                      <p className="text-xs font-bold text-slate-400">ข้อมูลเข้าและคำตอบที่ถูกต้อง</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTestCase(caseIndex)}
                      className="rounded-xl p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                      title="ลบ test case"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid gap-5 lg:grid-cols-[1fr_0.72fr]">
                    <div className="min-h-[266px] rounded-2xl border border-slate-200 bg-white p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-black uppercase tracking-widest text-blue-600">Input</p>
                        <button
                          type="button"
                          onClick={() => addCaseLine(caseIndex)}
                          className="rounded-2xl bg-blue-50 px-4 py-2 text-xs font-black text-blue-600 transition hover:bg-blue-100"
                        >
                          เพิ่มบรรทัด
                        </button>
                      </div>

                      <div className="space-y-2">
                        {testCase.lines.map((line, lineIndex) => (
                          <div key={lineIndex} className="grid grid-cols-[116px_1fr_auto] items-center gap-2">
                            <div className="flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-3 text-xs font-black text-slate-500">
                              บรรทัด {lineIndex + 1}
                            </div>
                            <input
                              value={line}
                              onChange={(event) => updateCaseLine(caseIndex, lineIndex, event.target.value)}
                              placeholder="ค่าที่โปรแกรมอ่านจาก input()"
                              className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400"
                            />
                            <button
                              type="button"
                              onClick={() => removeCaseLine(caseIndex, lineIndex)}
                              className="flex h-11 w-11 items-center justify-center rounded-2xl text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
                              title="ลบบรรทัด"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="min-h-[266px] rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                      <label className="block">
                        <span className="mb-4 block text-xs font-black uppercase tracking-widest text-emerald-700">
                          Expected output
                        </span>
                        <textarea
                          value={testCase.expected}
                          onChange={(event) => updateCase(caseIndex, "expected", event.target.value)}
                          rows={6}
                          placeholder="ผลลัพธ์ที่ถูกต้อง"
                          className="min-h-[182px] w-full resize-none rounded-2xl border border-emerald-200 bg-white px-4 py-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </form>
      </main>
    </div>
  );
}
