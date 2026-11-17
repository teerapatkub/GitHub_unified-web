import re,subprocess
s=open(__import__('os').environ.get('SCHEMA',__import__('os').path.join(__import__('os').path.dirname(__file__),'..','..','server','schema.sql')),encoding='utf8').read()
cols={}
for m in re.finditer(r'CREATE TABLE (?:public\.)?"?(\w+)"?\s*\((.*?)\n\);',s,re.S):
    c=[]
    for line in m.group(2).split('\n'):
        line=line.strip().rstrip(',')
        if not line or line.upper().startswith(('CONSTRAINT','PRIMARY','UNIQUE','FOREIGN','CHECK')): continue
        p=line.split(); t=p[1].replace('character','').strip()
        t={'varying':'varchar','without':'timestamp','integer':'int','bigint':'bigint','smallint':'smallint','text':'text','jsonb':'jsonb','numeric(10,2)':'numeric','date':'date','timestamp':'timestamp','boolean':'bool'}.get(t.split('(')[0],t)
        if p[1].startswith('character'): t='varchar'
        if p[1].startswith('timestamp'): t='timestamp'
        c.append((p[0].strip('"'),t))
    cols[m.group(1)]=c
fks=set()
for st in s.split(';'):
    m=re.search(r'ALTER TABLE (?:ONLY )?public\.(\w+)',st); f=re.search(r'FOREIGN KEY \((\w+)\) REFERENCES public\.(\w+)\((\w+)\)',st)
    if m and f: fks.add((m.group(1),f.group(1),f.group(2),f.group(3)))
pk={}
for st in s.split(';'):
    m=re.search(r'ALTER TABLE (?:ONLY )?public\.(\w+)',st); f=re.search(r'PRIMARY KEY \(([\w, ]+)\)',st)
    if m and f: pk[m.group(1)]=[x.strip() for x in f.group(1).split(',')]

# ตาราง Arcade ที่สร้างโดย migration ใน server/arcade/migrate-*.js (ไม่อยู่ใน schema.sql ฉบับ 26 ส.ค.)
cols['arcade_matches']=[('match_id','int'),('room_id','int'),('room_code','varchar'),('difficulty','varchar'),('started_at','timestamp'),('ended_at','timestamp')]
cols['arcade_shop_states']=[('match_id','int'),('user_name','varchar'),('shop_phase','varchar'),('offers','jsonb'),('inventory','jsonb'),('self_effects','jsonb'),('attack_effects','jsonb')]
cols['arcade_shop_commands']=[('match_id','int'),('user_name','varchar'),('request_id','uuid'),('command','jsonb')]
cols['arcade_reward_receipts']=[('match_id','int'),('user_id','int'),('final_rank','int'),('score','int'),('coins','int')]
cols['arcade_spectator_guesses']=[('match_id','int'),('user_name','varchar'),('guessed_name','varchar'),('created_at','timestamp')]
pk['arcade_spectator_guesses']=['match_id','user_name']
fks.add(('arcade_spectator_guesses','match_id','arcade_matches','match_id'))
cols['arcade_rooms'].append(('round_format','varchar')); cols['problem_modes'].extend([('round_kinds','jsonb'),('round_data','jsonb')])
pk['arcade_matches']=['match_id']; pk['arcade_shop_states']=['match_id','user_name']; pk['arcade_shop_commands']=['match_id','user_name','request_id']; pk['arcade_reward_receipts']=['match_id','user_id']
for t,c in [('arcade_rooms','current_match_id'),('arcade_participants','match_id'),('arcade_effects','match_id'),('arcade_round_history','match_id')]:
    cols[t].append((c,'int')); fks.add((t,c,'arcade_matches','match_id'))
fks.update({('arcade_shop_states','match_id','arcade_matches','match_id'),('arcade_shop_commands','match_id','arcade_shop_states','match_id'),('arcade_reward_receipts','match_id','arcade_matches','match_id'),('arcade_reward_receipts','user_id','users','user_id')})
def label(t,keep):
    fkc={a for (tt,a,_,_) in fks if tt==t}
    rows=[]
    for n,ty in cols.get(t,[]):
        k='PK' if n in pk.get(t,[]) else ('FK' if n in fkc else '')
        if k or n in keep:
            rows.append(f'<tr><td align="left" width="28"><font color="#555555">{k or " "}</font></td><td align="left">{n}</td><td align="left"><font color="#666666">{ty}</font></td></tr>')
    return f'<<table border="1" cellborder="0" cellspacing="0" cellpadding="3" color="#444444"><tr><td colspan="3" bgcolor="#dde6f3"><b>{t}</b></td></tr>{"".join(rows)}</table>>'
def draw(name,title,tables,keep,logical):
    out=[f'digraph G {{ graph [rankdir=LR, fontname="Loma", fontsize=20, label="เส้นทึบ = Foreign Key ในฐานข้อมูล   เส้นประ = อ้างอิงเชิงตรรกะ (ไม่มี FK)", labelloc=b, fontsize=12, nodesep=0.35, ranksep=0.9, dpi=200, pad=0.3]; node [shape=plaintext, fontname="Loma", fontsize=11]; edge [color="#555555", arrowhead=crow, arrowtail=tee, dir=both, fontname="Loma", fontsize=9];']
    for t in tables: out.append(f'{t} [label={label(t,keep.get(t,[]))}];')
    for (a,c,b,d) in sorted(fks):
        if a in tables and b in tables: out.append(f'{b} -> {a};')
    for a,b,l in logical: out.append(f'{b} -> {a} [style=dashed, label="{l}"];')
    out.append('}')
    open(name+'.dot','w').write('\n'.join(out))
    subprocess.run(['dot','-Tpng',name+'.dot','-o',name+'.png'],check=True)
draw('er_learning','ภาพที่ X ER Diagram ส่วนระบบการเรียนรู้และผู้ใช้',
 ['users','modules','lessons','lesson_slides','lesson_quizzes','quiz_questions','question_choices','user_progress','user_quiz_attempts','exercise_submissions','learning_ai_tasks','achievements','user_achievements','user_profile_showcase','shop_items','user_inventory','user_xp_log','survey_questions','survey_options','user_survey_responses','user_mailbox'],
 {'users':['username','email','role','level','xp','virtual_currency','is_banned'],'lessons':['title','order_index'],'modules':['title'],'shop_items':['name','price'],'achievements':['name','reward_money'],'user_mailbox':['attachment_coins','is_claimed'],'learning_ai_tasks':['mode','status','problem_id'],'exercise_submissions':['exercise_id','is_passed'],'user_achievements':['user_id','achievement_id']},
 [('user_achievements','users','user_id'),('user_achievements','achievements','achievement_id'),('learning_ai_tasks','users','user_id')])
draw('er_competition','ภาพที่ X ER Diagram ส่วนคลังโจทย์และระบบแข่งขัน',
 ['users','problems','problem_modes','multiplayer_submissions','active_accepted_challenges','user_mailbox','arcade_rooms','arcade_participants','arcade_effects','arcade_chat_messages','arcade_round_history','arcade_items','arcade_player_stats','arcade_matches','arcade_shop_states','arcade_shop_commands','arcade_reward_receipts','arcade_spectator_guesses'],
 {'users':['username'],'problems':['title_th','title_en','test_kind','test_cases'],'problem_modes':['mode','entry_id','difficulty','coin_reward','round_kinds','round_data'],'multiplayer_submissions':['challenge_id','score'],'active_accepted_challenges':['challenge_id'],'arcade_rooms':['room_code','host_name','password','phase','difficulty','round_format'],'arcade_participants':['user_name','cash','score','is_eliminated'],'arcade_round_history':['room_id','user_name','round_num','round_score'],'arcade_items':['item_code','price','type'],'arcade_player_stats':['user_name','wins'],'arcade_effects':['effect_type','target_name'],'arcade_chat_messages':['user_name','message'],'user_mailbox':['attachment_coins'],'arcade_matches':['room_id','difficulty','started_at','ended_at'],'arcade_shop_states':['offers','inventory','attack_effects'],'arcade_reward_receipts':['final_rank','coins'],'arcade_spectator_guesses':['guessed_name']},
 [('multiplayer_submissions','problem_modes','challenge_id'),('active_accepted_challenges','problem_modes','challenge_id'),('arcade_participants','users','user_name'),('arcade_player_stats','users','user_name')])
