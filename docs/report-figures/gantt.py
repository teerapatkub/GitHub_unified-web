import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt, matplotlib.dates as md
from matplotlib import font_manager as fm
from datetime import date
fp=[f for f in fm.findSystemFonts() if 'Loma.otf' in f][0]; fm.fontManager.addfont(fp); plt.rcParams['font.family']=fm.FontProperties(fname=fp).get_name()
# ช่วงเวลาจาก project_logs และหัวข้อ 15 ของ เนื้อหาล่าสุด.md ; planned=True คือแผนที่ยังไม่เกิด
rows=[("วิเคราะห์และออกแบบระบบ (Use Case, Activity)","2026-07-04","2026-07-28",False),
("เริ่ม Competitive Arena (commit แรก)","2026-07-17","2026-07-20",False),
("Arcade Battle Royale + Bot AI + ห้องบน PostgreSQL","2026-08-15","2026-08-19",False),
("รวมสามโปรเจกต์ + คลังโจทย์กลาง + ตัวตรวจเดียว","2026-08-20","2026-08-26",False),
("Pyodide ใน Web Worker + รูปโปรไฟล์ + ร้านค้า","2026-09-03","2026-09-10",False),
("ปรับ UI ตามคำแนะนำอาจารย์ + แผนที่มินิเกม","2026-09-18","2026-09-25",False),
("Navigation รวม + ระบบผู้ดูแล + แดชบอร์ด","2026-10-01","2026-10-03",False),
("Supabase Auth + ความปลอดภัย + พร้อม release","2026-10-08","2026-10-16",False),
("บอทเขียนโค้ดจริง + Lumi tour + วัดคุณภาพในเครื่อง","2026-10-18","2026-10-21",False),
("AI ในเครื่อง + Docker compose (Spec 0004)","2026-10-22","2026-10-25",False),
("User test + แก้บั๊ก 22 ข้อ + รูปแบบรอบใหม่ (Spec 0005)","2026-10-25","2026-10-27",False),
("ติดตั้งบนเครื่อง มข. + ทางเข้าสาธารณะ + smoke test","2026-10-28","2026-11-06",True)]
D=lambda s: date.fromisoformat(s)
fig,ax=plt.subplots(figsize=(11,6),dpi=200)
for i,(n,a,b,pl) in enumerate(rows):
    ax.barh(i,(D(b)-D(a)).days+1,left=D(a),height=0.55,color='white' if pl else '#4a6fa5',edgecolor='#4a6fa5',hatch='///' if pl else None)
ax.axvline(D('2026-10-25'),color='#c0392b',ls='--',lw=1); ax.text(D('2026-10-25'),-0.9,'ส่งรอบแรก 25 ต.ค. ',color='#c0392b',fontsize=9,ha='right')
ax.set_yticks(range(len(rows))); ax.set_yticklabels([r[0] for r in rows],fontsize=10.5); ax.invert_yaxis()
ax.xaxis.set_major_locator(md.MonthLocator())
th=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
ax.xaxis.set_major_formatter(plt.FuncFormatter(lambda x,_: th[md.num2date(x).month-1]+' 69'))
ax.set_xlim(D('2026-07-01'),D('2026-11-10')); ax.grid(axis='x',color='#dddddd'); ax.set_axisbelow(True)
for s in ['top','right']: ax.spines[s].set_visible(False)
ax.set_xlabel('แถบทึบ = ทำแล้ว (จาก project_logs และประวัติ git)   แถบลาย = แผนที่ยังไม่เกิด (ยังไม่กำหนดวันเสร็จ)',fontsize=10)
plt.tight_layout(); plt.savefig('gantt.png')
