--
-- PySim course content
--
-- GENERATED FILE - do not edit by hand.
-- Regenerate with:  node scripts/dump-schema.js
--
-- Lessons, slides, quizzes, the problem bank and the shop catalogue.
-- No accounts, no submissions, no personal data of any kind.
--

SET search_path TO public;

--
-- PostgreSQL database dump
--


-- Dumped from database version 18.4 (Debian 18.4-1.pgdg13+1)
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: achievements; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.achievements (achievement_id, name, description, difficulty, reward_money, code, metric, threshold, is_active, icon) VALUES (2, 'ห้าบทติด', 'เรียนจบครบ 5 บท', 'Medium', 150.00, 'five_lessons', 'lessons_completed', 5, 1, '📗');
INSERT INTO public.achievements (achievement_id, name, description, difficulty, reward_money, code, metric, threshold, is_active, icon) VALUES (3, 'ครึ่งทางแล้ว', 'เรียนจบครึ่งหนึ่งของหลักสูตร (12 บท)', 'Hard', 400.00, 'half_course', 'lessons_completed', 12, 1, '📚');
INSERT INTO public.achievements (achievement_id, name, description, difficulty, reward_money, code, metric, threshold, is_active, icon) VALUES (4, 'จบหลักสูตร', 'เรียนจบครบทุกบทในหลักสูตร', 'Very Hard', 2000.00, 'all_lessons', 'lessons_completed', 24, 1, '🎓');
INSERT INTO public.achievements (achievement_id, name, description, difficulty, reward_money, code, metric, threshold, is_active, icon) VALUES (5, 'โค้ดแรกผ่าน', 'ทำแบบฝึกหัดผ่านเป็นครั้งแรก', 'Medium', 30.00, 'first_exercise', 'exercises_passed', 1, 1, '✅');
INSERT INTO public.achievements (achievement_id, name, description, difficulty, reward_money, code, metric, threshold, is_active, icon) VALUES (6, 'มือขยัน', 'ทำแบบฝึกหัดผ่านครบ 20 ข้อ', 'Medium', 200.00, 'twenty_exercises', 'exercises_passed', 20, 1, '⌨️');
INSERT INTO public.achievements (achievement_id, name, description, difficulty, reward_money, code, metric, threshold, is_active, icon) VALUES (7, 'นักฝึกตัวยง', 'ทำแบบฝึกหัดผ่านครบ 60 ข้อ', 'Hard', 700.00, 'sixty_exercises', 'exercises_passed', 60, 1, '🛠️');
INSERT INTO public.achievements (achievement_id, name, description, difficulty, reward_money, code, metric, threshold, is_active, icon) VALUES (8, 'เต็มครั้งแรก', 'ทำแบบทดสอบหลังเรียนได้คะแนนเต็ม', 'Medium', 80.00, 'first_perfect', 'quizzes_perfect', 1, 1, '💯');
INSERT INTO public.achievements (achievement_id, name, description, difficulty, reward_money, code, metric, threshold, is_active, icon) VALUES (9, 'เต็มห้าครั้ง', 'ทำแบบทดสอบหลังเรียนได้คะแนนเต็ม 5 บท', 'Hard', 400.00, 'five_perfect', 'quizzes_perfect', 5, 1, '🏅');
INSERT INTO public.achievements (achievement_id, name, description, difficulty, reward_money, code, metric, threshold, is_active, icon) VALUES (10, 'เริ่มผจญภัย', 'เล่นมินิเกมเนื้อเรื่องจบเป็นครั้งแรก', 'Medium', 60.00, 'first_minigame', 'mini_games_completed', 1, 1, '🎮');
INSERT INTO public.achievements (achievement_id, name, description, difficulty, reward_money, code, metric, threshold, is_active, icon) VALUES (19, 'แต่งตัวครั้งแรก', 'ซื้อของตกแต่งจากร้านค้าชิ้นแรก', 'Medium', 40.00, 'first_cosmetic', 'cosmetics_owned', 1, 1, '🎀');
INSERT INTO public.achievements (achievement_id, name, description, difficulty, reward_money, code, metric, threshold, is_active, icon) VALUES (20, 'ครบทั้งเซ็ต', 'มีของครบทั้งเซ็ตของธีมใดธีมหนึ่ง', 'Very Hard', 1000.00, 'full_set', 'sets_completed', 1, 1, '💎');
INSERT INTO public.achievements (achievement_id, name, description, difficulty, reward_money, code, metric, threshold, is_active, icon) VALUES (11, 'นักผจญภัย', 'เล่นมินิเกมเนื้อเรื่องจบครบ 5 ด่าน', 'Hard', 350.00, 'five_minigames', 'mini_games_completed', 5, 1, '🗺️');
INSERT INTO public.achievements (achievement_id, name, description, difficulty, reward_money, code, metric, threshold, is_active, icon) VALUES (12, 'ลงสนามครั้งแรก', 'เล่น Arcade Battle Royale จบหนึ่งแมตช์', 'Medium', 50.00, 'first_arcade', 'arcade_matches', 1, 1, '🕹️');
INSERT INTO public.achievements (achievement_id, name, description, difficulty, reward_money, code, metric, threshold, is_active, icon) VALUES (13, 'ขาประจำสนาม', 'เล่น Arcade จบครบ 10 แมตช์', 'Medium', 200.00, 'ten_arcade', 'arcade_matches', 10, 1, '🎯');
INSERT INTO public.achievements (achievement_id, name, description, difficulty, reward_money, code, metric, threshold, is_active, icon) VALUES (1, 'บทแรกผ่านแล้ว', 'เรียนจบบทเรียนแรก ทั้งแบบทดสอบหลังเรียนและแบบฝึกหัดครบ', 'Medium', 50.00, 'first_lesson', 'lessons_completed', 1, 1, '📘');
INSERT INTO public.achievements (achievement_id, name, description, difficulty, reward_money, code, metric, threshold, is_active, icon) VALUES (14, 'ชนะครั้งแรก', 'ชนะ Arcade เป็นครั้งแรก', 'Medium', 150.00, 'first_win', 'arcade_wins', 1, 1, '🏆');
INSERT INTO public.achievements (achievement_id, name, description, difficulty, reward_money, code, metric, threshold, is_active, icon) VALUES (15, 'เจ้าสนาม', 'ชนะ Arcade ครบ 10 ครั้ง', 'Hard', 800.00, 'ten_wins', 'arcade_wins', 10, 1, '👑');
INSERT INTO public.achievements (achievement_id, name, description, difficulty, reward_money, code, metric, threshold, is_active, icon) VALUES (16, 'รอบไร้ที่ติ', 'ผ่านทุก test case ในหนึ่งรอบของ Arcade', 'Hard', 300.00, 'perfect_round', 'arcade_perfect_rounds', 1, 1, '⚡');
INSERT INTO public.achievements (achievement_id, name, description, difficulty, reward_money, code, metric, threshold, is_active, icon) VALUES (17, 'ต่อเนื่องเจ็ดวัน', 'เข้ามาเก็บ XP ต่อเนื่องกัน 7 วัน', 'Hard', 500.00, 'streak_seven', 'streak_days', 7, 1, '🔥');
INSERT INTO public.achievements (achievement_id, name, description, difficulty, reward_money, code, metric, threshold, is_active, icon) VALUES (18, 'เลเวลสิบ', 'ไต่ถึงเลเวล 10', 'Hard', 600.00, 'level_ten', 'level', 10, 1, '🌟');


--
-- Data for Name: advanced_validation; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.advanced_validation (id, question_text, correct_answer) VALUES (1, 'ผลลัพธ์ของ len([1, 2, 3]) คืออะไร?', '3');
INSERT INTO public.advanced_validation (id, question_text, correct_answer) VALUES (2, 'คำสั่งใดใช้สร้าง Dictionary ว่าง?', '{}');
INSERT INTO public.advanced_validation (id, question_text, correct_answer) VALUES (3, 'ผลลัพธ์ของ "Hello"[1] คืออะไร?', 'e');
INSERT INTO public.advanced_validation (id, question_text, correct_answer) VALUES (4, 'คำสั่ง for i in range(3) จะวนลูปกี่รอบ?', '3');
INSERT INTO public.advanced_validation (id, question_text, correct_answer) VALUES (5, 'ผลลัพธ์ของ type(3.14) คืออะไร?', 'float');
INSERT INTO public.advanced_validation (id, question_text, correct_answer) VALUES (6, 'try-except ใช้ทำอะไร?', 'จัดการ Error');
INSERT INTO public.advanced_validation (id, question_text, correct_answer) VALUES (7, 'ฟังก์ชัน def greet(): return "Hi" เรียกใช้อย่างไร?', 'greet()');
INSERT INTO public.advanced_validation (id, question_text, correct_answer) VALUES (8, 'list.append(x) ทำอะไร?', 'เพิ่ม x ต่อท้าย list');
INSERT INTO public.advanced_validation (id, question_text, correct_answer) VALUES (9, 'ผลลัพธ์ของ 10 // 3 คืออะไร?', '3');
INSERT INTO public.advanced_validation (id, question_text, correct_answer) VALUES (10, 'คำสั่ง import ใช้ทำอะไร?', 'นำเข้าโมดูล');


--
-- Data for Name: advanced_validation_choices; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (1, 1, '3');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (2, 1, '2');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (3, 1, '4');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (4, 1, 'Error');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (5, 2, '{}');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (6, 2, '[]');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (7, 2, '()');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (8, 2, 'dict[]');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (9, 3, 'e');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (10, 3, 'H');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (11, 3, 'l');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (12, 3, 'Error');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (13, 4, '3');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (14, 4, '2');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (15, 4, '4');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (16, 4, '1');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (17, 5, 'float');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (18, 5, 'int');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (19, 5, 'str');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (20, 5, 'double');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (25, 7, 'greet()');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (26, 7, 'call greet');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (27, 7, 'run greet');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (28, 7, 'def greet');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (33, 9, '3');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (34, 9, '3.33');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (35, 9, '1');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (36, 9, '10');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (21, 6, 'จัดการ Error');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (22, 6, 'วนลูป');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (23, 6, 'สร้างตัวแปร');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (24, 6, 'นำเข้าไฟล์');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (29, 8, 'เพิ่ม x ต่อท้าย list');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (30, 8, 'ลบ x ออกจาก list');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (31, 8, 'แทนที่ค่าใน list');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (32, 8, 'สร้าง list ใหม่');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (37, 10, 'นำเข้าโมดูล');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (38, 10, 'สร้างฟังก์ชัน');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (39, 10, 'ลบไฟล์');
INSERT INTO public.advanced_validation_choices (id, question_id, choice_text) VALUES (40, 10, 'แสดงผล');


--
-- Data for Name: arcade_items; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.arcade_items (item_id, item_code, name_th, name_en, desc_th, desc_en, price, icon, type, created_at) VALUES (1, 'inkFog', 'หมอกดำบังจอ (Ink Fog)', 'Ink Fog', 'ทำให้จอพิมพ์โค้ดของเป้าหมายเบลอเป็นเวลา 15 วินาที', 'Blurs target editor screen for 15s.', 400, '🌫️', 'attack', '2026-08-15 19:57:30.318425');
INSERT INTO public.arcade_items (item_id, item_code, name_th, name_en, desc_th, desc_en, price, icon, type, created_at) VALUES (2, 'backspaceLock', 'ล็อกปุ่มลบ (Backspace Lock)', 'Backspace Lock', 'เป้าหมายไม่สามารถกดลบตัวอักษรได้ 10 วินาที', 'Disables target backspace key for 10s.', 500, '🔒', 'attack', '2026-08-15 19:57:30.333606');
INSERT INTO public.arcade_items (item_id, item_code, name_th, name_en, desc_th, desc_en, price, icon, type, created_at) VALUES (3, 'keyScrambler', 'สลับแป้นพิมพ์ (Key Scrambler)', 'Key Scrambler', 'พิมพ์แล้วตัวอักษรจะสลับตำแหน่งมั่วๆ 10 วินาที', 'Scrambles typed keys for 10s.', 450, '⌨️', 'attack', '2026-08-15 19:57:30.344273');
INSERT INTO public.arcade_items (item_id, item_code, name_th, name_en, desc_th, desc_en, price, icon, type, created_at) VALUES (4, 'aiHelper', 'AI บอกใบ้โค้ด (AI Helper)', 'AI Helper', 'ขอคำแนะนำและโครงสร้างโค้ดจากระบบ Gemini AI', 'Requests AI hint for the current task.', 600, '🤖', 'buff', '2026-08-15 19:57:30.357942');
INSERT INTO public.arcade_items (item_id, item_code, name_th, name_en, desc_th, desc_en, price, icon, type, created_at) VALUES (5, 'screenShake', 'แผ่นดินไหว (Earthquake)', 'Earthquake', 'เขย่าหน้าจอกล่องเขียนโค้ดของเป้าหมายอย่างรุนแรง 8 วินาที', 'Violently shakes target editor for 8s.', 300, '🌋', 'attack', '2026-08-15 19:57:30.368925');
INSERT INTO public.arcade_items (item_id, item_code, name_th, name_en, desc_th, desc_en, price, icon, type, created_at) VALUES (6, 'typoGenerator', 'Glitch ก่อกวน (Glitch Injector)', 'Glitch Injector', 'สุ่มพิมพ์ตัวอักษรแปลกปลอมแทรกในโค้ดเป้าหมาย 10 วินาที', 'Injects random typos into target editor.', 550, '🐛', 'attack', '2026-08-15 19:57:30.381879');
INSERT INTO public.arcade_items (item_id, item_code, name_th, name_en, desc_th, desc_en, price, icon, type, created_at) VALUES (7, 'timeFreeze', 'หยุดเวลาแช่แข็ง (Time Freeze)', 'Time Freeze', 'หยุดศัตรูทั้งหมดไม่ให้แก้ไขโค้ดได้ชั่วคราว 5 วินาที', 'Freezes all active opponents for 5s.', 1200, '❄️', 'aoe', '2026-08-15 19:57:30.398869');
INSERT INTO public.arcade_items (item_id, item_code, name_th, name_en, desc_th, desc_en, price, icon, type, created_at) VALUES (8, 'blackout', 'ระเบิดไฟดับ (EMP Strike)', 'EMP Strike', 'ปิดจอของเป้าหมายทุกคนให้มืดสนิทเป็นเวลา 8 วินาที', 'Turns off target screens completely for 8s.', 900, '🔌', 'aoe', '2026-08-15 19:57:30.413439');
INSERT INTO public.arcade_items (item_id, item_code, name_th, name_en, desc_th, desc_en, price, icon, type, created_at) VALUES (9, 'shield', 'กำแพงไฟร์วอลล์ (Firewall)', 'Firewall Shield', 'ป้องกันความเสียหายจากดีบัฟครั้งถัดไป 100%', 'Blocks next incoming attack completely.', 700, '🛡️', 'buff', '2026-08-15 19:57:30.428051');
INSERT INTO public.arcade_items (item_id, item_code, name_th, name_en, desc_th, desc_en, price, icon, type, created_at) VALUES (10, 'cashSteal', 'โจรกรรม Survival Cash (Data Heist)', 'Data Heist', 'ขโมยเงิน 🪙 300 จากเป้าหมายมาเป็นของตัวเอง', 'Steals 🪙 300 Cash from a target.', 600, '🎭', 'attack', '2026-08-15 19:57:30.437998');
INSERT INTO public.arcade_items (item_id, item_code, name_th, name_en, desc_th, desc_en, price, icon, type, created_at) VALUES (11, 'capsLockLock', 'กับดักอักษรใหญ่ (Caps Lock Trap)', 'Caps Lock Trap', 'บังคับให้พิมพ์เป็นตัวอักษรพิมพ์ใหญ่ทั้งหมด 10 วินาที (เกิด NameError)', 'Forces target to type in ALL CAPS.', 350, '🔠', 'attack', '2026-08-15 19:57:30.448461');
INSERT INTO public.arcade_items (item_id, item_code, name_th, name_en, desc_th, desc_en, price, icon, type, created_at) VALUES (12, 'mirrorMode', 'กระจกสลับฝั่ง (Mirror Mode)', 'Mirror Mode', 'สะท้อนหน้าจอเขียนโค้ดกลับด้านซ้าย-ขวาเป็นเวลา 12 วินาที', 'Horizontally flips target editor container.', 500, '🪞', 'attack', '2026-08-15 19:57:30.45985');
INSERT INTO public.arcade_items (item_id, item_code, name_th, name_en, desc_th, desc_en, price, icon, type, created_at) VALUES (13, 'taxCollection', 'เก็บภาษีคนรวย (Tax Collector)', 'Tax Collector', 'ขโมยเงิน 20% จากผู้เล่นที่มี Survival Cash สูงสุดมาเป็นของคุณ', 'Steals 20% cash from wealthiest player.', 800, '💸', 'buff', '2026-08-15 19:57:30.470127');
INSERT INTO public.arcade_items (item_id, item_code, name_th, name_en, desc_th, desc_en, price, icon, type, created_at) VALUES (14, 'scoreMultiplier', 'ตัวคูณคะแนน 2 เท่า (Score Booster)', 'Score Booster', 'คูณคะแนนที่จะได้รับในรอบปัจจุบันเป็น 2 เท่าเมื่อทำโจทย์สำเร็จ', 'Doubles current round score gain.', 650, '⚡', 'buff', '2026-08-15 19:57:30.480322');
INSERT INTO public.arcade_items (item_id, item_code, name_th, name_en, desc_th, desc_en, price, icon, type, created_at) VALUES (15, 'screenDimmer', 'แสงจ้าหน้าจอมืด (Screen Dimmer)', 'Screen Dimmer', 'หรี่แสงหน้าจอกล่องพิมพ์โค้ดของเป้าหมายให้มืดลงเหลือ 10% นาน 15 วินาที', 'Dims target editor brightness to 10%.', 400, '🕶️', 'attack', '2026-08-15 19:57:30.493288');


--
-- Data for Name: assessment_choices; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: assessment_questions; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: cosmetics; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.cosmetics (cosmetic_id, name, type, price, asset_url) VALUES (1, 'Ocean Theme', 'theme', 500, 'theme-ocean');
INSERT INTO public.cosmetics (cosmetic_id, name, type, price, asset_url) VALUES (2, 'Sakura Theme', 'theme', 750, 'theme-sakura');
INSERT INTO public.cosmetics (cosmetic_id, name, type, price, asset_url) VALUES (3, 'Cyberpunk Theme', 'theme', 1000, 'theme-cyberpunk');
INSERT INTO public.cosmetics (cosmetic_id, name, type, price, asset_url) VALUES (4, 'Bronze Avatar Frame', 'avatar_frame', 200, 'frame-bronze');
INSERT INTO public.cosmetics (cosmetic_id, name, type, price, asset_url) VALUES (5, 'Gold Avatar Frame', 'avatar_frame', 500, 'frame-gold');


--
-- Data for Name: problems; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (157, 'แฟกทอเรียล (Factorial)', 'Factorial', 'เขียนฟังก์ชัน "factorial(n)" คืนค่าผลคูณ n! (เช่น 5! = 120)', 'Write a function "factorial(n)" returning n!.', 'n! คือ n คูณกับ (n-1)! ให้เรียกตัวเองแบบ n * factorial(n - 1) บรรทัด if ที่ให้มาคือจุดหยุด', 'n! is n times (n-1)!, so call yourself: n * factorial(n - 1). The if already given is the stopping point.', 'def factorial(n):
    if n <= 1:
        return 1
    # TODO: คืนค่า n คูณกับ factorial(n - 1)
    return 0', 'def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)', 'function', '[{"args": [5], "expected": 120}, {"args": [3], "expected": 6}, {"args": [0], "expected": 1}, {"args": [1], "expected": 1}, {"args": [6], "expected": 720}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.767437', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (177, 'ค้นหาแบบทวิภาค (Binary Search)', 'Binary Search', 'เขียนฟังก์ชัน "binary_search(nums, target)" เพื่อหาตำแหน่งดรรชนีของ target ในอาร์เรย์ที่เรียงแล้ว (หากไม่พบคืนค่า -1)', 'Write a function "binary_search(nums, target)" returning target index or -1.', 'ลบ break ออกแล้วขยับขอบเขตแทน ถ้าค่ากลางน้อยเกินไปคำตอบอยู่ครึ่งขวา ให้ low ขยับไปถัดจาก mid ถ้ามากเกินไปคำตอบอยู่ครึ่งซ้าย ให้ high ถอยมาก่อน mid — ต้องขยับให้พ้น mid ไม่งั้นช่วงไม่เคยแคบลงและลูปวนไม่จบ', 'Replace the break by moving a bound. Too small means the answer is in the right half, so low moves past mid; too large means the left half, so high pulls back before mid. It must move PAST mid, or the range never narrows and the loop never ends.', 'def binary_search(nums, target):
    low, high = 0, len(nums) - 1
    while low <= high:
        mid = (low + high) // 2
        if nums[mid] == target:
            return mid
        # TODO: แทนที่ break ข้างล่างด้วยการขยับขอบเขตการค้นหา
        #       ถ้า nums[mid] น้อยกว่า target ให้ low = mid + 1 ถ้าไม่ใช่ ให้ high = mid - 1
        break
    return -1', 'def binary_search(nums, target):
    low, high = 0, len(nums) - 1
    while low <= high:
        mid = (low + high) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1', 'function', '[{"args": [[1, 3, 5, 7, 9], 7], "expected": 3}, {"args": [[1, 3, 5], 2], "expected": -1}, {"args": [[1], 1], "expected": 0}, {"args": [[], 5], "expected": -1}, {"args": [[1, 2, 3, 4, 5], 1], "expected": 0}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.833841', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (159, 'ตรวจสอบแอนนาแกรม (Anagram Checker)', 'Anagram Checker', 'เขียนฟังก์ชัน "is_anagram(s, t)" เพื่อตรวจสอบว่าข้อความสองชุดสลับตัวอักษรกันหรือไม่', 'Write a function "is_anagram(s, t)" to check if two strings are anagrams.', 'sorted() คืนลิสต์ตัวอักษรที่เรียงแล้ว ถ้าสองคำใช้ตัวอักษรชุดเดียวกัน ผลเรียงจะเท่ากันเสมอ: sorted(s) == sorted(t)', 'sorted() returns the letters in order, so two words built from the same letters always sort identically: sorted(s) == sorted(t).', 'def is_anagram(s, t):
    # TODO: สองคำเป็นอนาแกรมกันเมื่อเรียงตัวอักษรแล้วเหมือนกัน — ใช้ sorted()
    return None', 'def is_anagram(s, t):
    return sorted(s) == sorted(t)', 'function', '[{"args": ["anagram", "nagaram"], "expected": true}, {"args": ["rat", "car"], "expected": false}, {"args": ["", ""], "expected": true}, {"args": ["a", "a"], "expected": true}, {"args": ["ab", "ba"], "expected": true}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.786757', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (189, 'รายการซ้อนให้แบนราบ (Flatten List)', 'Flatten Nested List', 'เขียนฟังก์ชัน `flatten(lists)` รวมรายการซ้อนชั้นเดียวให้เป็นรายการเดียว', 'Write a function `flatten(lists)` flattening a list of lists by one level.', 'ลิสต์มีเมธอด .extend() ที่เอา "สมาชิกทุกตัว" ของอีกลิสต์มาต่อท้าย ต่างจาก .append() ที่จะยัดลิสต์ทั้งก้อนลงไปเป็นสมาชิกตัวเดียว', 'Lists have .extend(), which appends every ITEM of another list, unlike .append(), which would drop the whole list in as a single element.', 'def flatten(lists):
    out = []
    for sub in lists:
        # TODO: เอาสมาชิกทุกตัวใน sub ใส่ลงใน out
        pass
    return out', 'def flatten(lists):
    out = []
    for sub in lists:
        out.extend(sub)
    return out', 'function', '[{"args": [[[1, 2], [3]]], "expected": [1, 2, 3]}, {"args": [[]], "expected": []}, {"args": [[[], []]], "expected": []}, {"args": [[[1], [2], [3]]], "expected": [1, 2, 3]}, {"args": [[[5, 6], [], [7]]], "expected": [5, 6, 7]}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.918451', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (178, 'หมุนอาร์เรย์ (Rotate Array)', 'Rotate Array', 'เขียนฟังก์ชัน `rotate(nums, k)` หมุนอาร์เรย์ไปทางขวา k ตำแหน่ง', 'Write a function `rotate(nums, k)` rotating the array right by k positions.', 'การหมุนคือการตัดแล้วสลับที่ nums[-k:] คือ k ตัวท้าย nums[:-k] คือส่วนที่เหลือ เอามาต่อกันตามลำดับนั้น สองบรรทัดที่ให้มาจัดการ k ที่ใหญ่กว่าลิสต์และกรณี k เป็น 0 ไว้แล้ว', 'Rotating is slicing and swapping: nums[-k:] is the last k items, nums[:-k] the rest — join them in that order. The two given lines already handle a k larger than the list, and k of 0.', 'def rotate(nums, k):
    if not nums:
        return []
    k = k % len(nums)
    if k == 0:
        return list(nums)
    # TODO: เอา k ตัวท้าย (nums[-k:]) มาต่อหน้าส่วนที่เหลือ (nums[:-k])
    return list(nums)', 'def rotate(nums, k):
    if not nums:
        return []
    k = k % len(nums)
    if k == 0:
        return list(nums)
    return nums[-k:] + nums[:-k]', 'function', '[{"args": [[1, 2, 3, 4, 5], 2], "expected": [4, 5, 1, 2, 3]}, {"args": [[], 3], "expected": []}, {"args": [[1, 2, 3], 0], "expected": [1, 2, 3]}, {"args": [[1, 2], 3], "expected": [2, 1]}, {"args": [[1, 2, 3], 3], "expected": [1, 2, 3]}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.960278', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (162, 'ค่าเฉลี่ยของรายการ (Average)', 'Average of List', 'เขียนฟังก์ชัน `average(nums)` คืนค่าเฉลี่ยของตัวเลขในรายการ (รายการว่างคืน 0)', 'Write a function `average(nums)` returning the mean of the list (0 for an empty list).', 'sum(nums) / len(nums) — ใช้ / (ได้ทศนิยม) ไม่ใช่ // (ปัดเศษทิ้ง) บรรทัด if ที่ให้มากันหารด้วยศูนย์ไว้แล้ว', 'sum(nums) / len(nums). Use / for a real decimal, not // which floors it. The if already guards against dividing by zero.', 'def average(nums):
    if not nums:
        return 0
    # TODO: คืนผลรวม sum(nums) หารด้วยจำนวนสมาชิก len(nums)
    return -1', 'def average(nums):
    if not nums:
        return 0
    return sum(nums) / len(nums)', 'function', '[{"args": [[2, 4]], "expected": 3}, {"args": [[]], "expected": 0}, {"args": [[5]], "expected": 5}, {"args": [[1, 2, 3, 4]], "expected": 2.5}, {"args": [[-2, 2]], "expected": 0}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.903862', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (191, 'ลำดับต่อเนื่องยาวที่สุด (Longest Consecutive)', 'Longest Consecutive Sequence', 'เขียนฟังก์ชัน `longest_consecutive(nums)` หาความยาวของลำดับเลขต่อเนื่องที่ยาวที่สุด', 'Write a function `longest_consecutive(nums)` returning the length of the longest run of consecutive integers.', 'นับเฉพาะจากตัวที่เป็น "จุดเริ่มต้น" ของชุด (เงื่อนไข n - 1 not in s ที่ให้มา) แล้วใช้ while ไล่ n + length ต่อขึ้นไปเรื่อยๆ การเช็คใน set เร็วกว่าในลิสต์มาก', 'Only count from a value that STARTS a run (the given n - 1 not in s test), then walk upward with a while on n + length. Membership tests in a set are far faster than in a list.', 'def longest_consecutive(nums):
    s = set(nums)
    best = 0
    for n in s:
        if n - 1 not in s:
            length = 1
            # TODO: ตราบใดที่ n + length ยังอยู่ใน s ให้ length เพิ่มขึ้นเรื่อยๆ
            best = max(best, length)
    return best', 'def longest_consecutive(nums):
    s = set(nums)
    best = 0
    for n in s:
        if n - 1 not in s:
            length = 1
            while n + length in s:
                length += 1
            best = max(best, length)
    return best', 'function', '[{"args": [[100, 4, 200, 1, 3, 2]], "expected": 4}, {"args": [[]], "expected": 0}, {"args": [[1]], "expected": 1}, {"args": [[1, 2, 0, 1]], "expected": 3}, {"args": [[5, 10]], "expected": 1}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.95563', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (179, 'รวบรวม K อาร์เรย์ที่เรียงแล้ว (Merge K Sorted Lists)', 'Merge K Sorted Lists', 'เขียนฟังก์ชัน "merge_k_lists(lists)" เพื่อรวม K อาร์เรย์ที่เรียงลำดับแล้วให้กลายเป็นอาร์เรย์เดียวที่เรียงลำดับสมบูรณ์', 'Write a function "merge_k_lists(lists)" merging K sorted lists into one sorted array.', 'ไม่ต้องรวมแบบฉลาด เอาทุกตัวมากองรวมกันด้วย extend แล้ว sorted() ทีเดียวตอนท้ายก็ได้คำตอบที่ถูก', 'No clever merging needed: extend everything into one pile, then sorted() once at the end gives the right answer.', 'def merge_k_lists(lists):
    flat = []
    for sub in lists:
        # TODO: เอาสมาชิกทุกตัวใน sub มาต่อเข้ากับ flat
        pass
    # TODO: คืน flat ที่เรียงลำดับแล้ว (sorted)
    return [-1]', 'def merge_k_lists(lists):
    flat = []
    for sub in lists:
        flat.extend(sub)
    return sorted(flat)', 'function', '[{"args": [[[1, 4, 5], [1, 3, 4], [2, 6]]], "expected": [1, 1, 2, 3, 4, 4, 5, 6]}, {"args": [[]], "expected": []}, {"args": [[[1]]], "expected": [1]}, {"args": [[[2], [1]]], "expected": [1, 2]}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.878288', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (126, 'บทสรุปสายเวทมนตร์ 1B_2A', 'Magic Path Summary 1B_2A', 'ยินดีด้วยคุณมาถึงจุดสิ้นสุดของสาย 1B_2A แล้ว พิมพ์ print("success") เพื่อจบด่าน', 'Congratulations, you''ve reached the end of path 1B_2A. Type print("success") to finish the level.', NULL, NULL, 'print("")', 'print("success")', 'stdio', '[]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:07:00.175634', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (160, 'ผลรวม 1 ถึง n (Sum To N)', 'Sum To N', 'เขียนฟังก์ชัน `sum_to_n(n)` คืนค่าผลรวมของเลข 1 ถึง n', 'Write a function `sum_to_n(n)` returning the sum of integers from 1 to n.', 'range(1, n + 1) ให้ 1 ถึง n — ต้อง +1 เพราะ range ไม่รวมตัวสุดท้าย แล้วบวกเข้า total ในลูป', 'range(1, n + 1) yields 1 through n — the +1 matters because range excludes its end value. Add each i into total inside the loop.', 'def sum_to_n(n):
    if n <= 0:
        return 0
    total = 0
    for i in range(1, n + 1):
        # TODO: บวก i เข้ากับ total
        pass
    return total', 'def sum_to_n(n):
    if n <= 0:
        return 0
    total = 0
    for i in range(1, n + 1):
        total += i
    return total', 'function', '[{"args": [5], "expected": 15}, {"args": [1], "expected": 1}, {"args": [0], "expected": 0}, {"args": [10], "expected": 55}, {"args": [100], "expected": 5050}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.88971', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (153, 'ตรวจสอบเลขคู่/เลขคี่ (Even or Odd)', 'Even or Odd', 'เขียนฟังก์ชัน "is_even(n)" เพื่อคืนค่า True หากเป็นเลขคู่ และ False หากเป็นเลขคี่', 'Write a function "is_even(n)" returning True if n is even, False otherwise.', '% คือเศษจากการหาร n % 2 ได้ 0 เมื่อเป็นเลขคู่ เขียน n % 2 == 0 ตรงๆ ได้ True/False อยู่แล้ว ไม่ต้องใช้ if', '% gives the remainder. n % 2 is 0 for an even number, and n % 2 == 0 is already True or False on its own — no if needed.', 'def is_even(n):
    # TODO: คืน True ถ้า n หารด้วย 2 แล้วเหลือเศษ 0 (ใช้ n % 2)
    return None', 'def is_even(n):
    return n % 2 == 0', 'function', '[{"args": [4], "expected": true}, {"args": [7], "expected": false}, {"args": [0], "expected": true}, {"args": [-2], "expected": true}, {"args": [99], "expected": false}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.724197', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (185, 'ระบบจำลองแคช LRU (LRU Cache Simulator)', 'LRU Cache Simulator', 'เขียนฟังก์ชัน "simulate_lru(capacity, operations)" คืนค่าผลลัพธ์ของคำสั่ง Get/Put ตามลำดับ LRU Cache', 'Write a function "simulate_lru(capacity, operations)" simulating Least Recently Used Cache.', 'OrderedDict จำลำดับการใช้งาน move_to_end บอกว่า "เพิ่งใช้ตัวนี้" และ popitem(last=False) เอาตัวที่เก่าสุดออก ส่วน get ที่ไม่เจอต้อง append -1 ไม่ใช่ข้ามไป', 'OrderedDict remembers usage order: move_to_end marks something as just used, popitem(last=False) evicts the oldest. A get that misses must append -1, not skip.', 'def simulate_lru(capacity, ops):
    from collections import OrderedDict
    cache = OrderedDict()
    res = []
    for op, key, val in ops:
        if op == "put":
            if key in cache:
                cache.move_to_end(key)
            cache[key] = val
            # TODO: ถ้าขนาด cache เกิน capacity ให้เอาตัวเก่าสุดออกด้วย cache.popitem(last=False)
        elif op == "get":
            # TODO: ถ้า key อยู่ใน cache ให้ move_to_end(key) แล้ว append ค่านั้นลง res
            #       ถ้าไม่มี ให้ append -1
            pass
    return res', 'def simulate_lru(capacity, ops):
    from collections import OrderedDict
    cache = OrderedDict()
    res = []
    for op, key, val in ops:
        if op == "put":
            if key in cache:
                cache.move_to_end(key)
            cache[key] = val
            if len(cache) > capacity:
                cache.popitem(last=False)
        elif op == "get":
            if key in cache:
                cache.move_to_end(key)
                res.append(cache[key])
            else:
                res.append(-1)
    return res', 'function', '[{"args": [2, [["put", 1, 1], ["put", 2, 2], ["get", 1, null], ["put", 3, 3], ["get", 2, null]]], "expected": [1, -1]}, {"args": [1, [["put", 1, 1], ["put", 2, 2], ["get", 1, null]]], "expected": [-1]}, {"args": [2, [["put", 1, 1], ["get", 1, null]]], "expected": [1]}, {"args": [2, [["get", 5, null]]], "expected": [-1]}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.862551', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (90, 'Dynamic Routing', 'Dynamic Routing', 'สร้าง Route สำหรับต้อนรับผู้ใช้งานผ่าน URL ในรูปแบบ `/user/<name>` โดยรับพารามิเตอร์ `name` เข้ามาในฟังก์ชัน แล้วคืนค่าข้อความ `"Hello, " + name`', NULL, NULL, NULL, 'from flask import Flask
app = Flask(__name__)

@app.route("/user/<name>")
def greet(name):
    # return ข้อความต้อนรับ name
    pass', 'from flask import Flask
app = Flask(__name__)

@app.route("/user/<name>")
def greet(name):
    return f"Hello, {name}"', 'stdio', '[{"input": "", "expected": ""}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:10:18.260257', 0);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (180, 'ผลรวมของรายการตัวเลข (Sum Array)', 'Sum of Array', 'เขียนฟังก์ชัน "sum_array(nums)" เพื่อคืนค่าผลรวมของตัวเลขทั้งหมดในอาร์เรย์', 'Write a function "sum_array(nums)" that returns the sum of all elements.', 'เครื่องหมาย += บวกทับค่าเดิม (x += 1 มีความหมายเท่ากับ x = x + 1) บรรทัดที่บวกต้องอยู่ในลูปจึงจะทำซ้ำทุกตัว ถ้าไปอยู่นอกลูปจะได้แค่ตัวสุดท้าย', 'The += operator adds onto what is already there (x += 1 means x = x + 1). The adding line has to sit INSIDE the loop to run for every item; outside it, only the last value counts.', 'def sum_array(nums):
    total = 0
    for n in nums:
        # TODO: บวก n เข้ากับ total
        pass
    return total', 'def sum_array(nums):
    total = 0
    for n in nums:
        total += n
    return total', 'function', '[{"args": [[1, 2, 3, 4]], "expected": 10}, {"args": [[5, 10, 15]], "expected": 30}, {"args": [[]], "expected": 0}, {"args": [[-1, 1]], "expected": 0}, {"args": [[7]], "expected": 7}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.737979', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (171, 'หาค่าสูงสุด (Find Maximum)', 'Find Maximum', 'เขียนฟังก์ชัน "find_max(nums)" คืนค่าตัวเลขที่มีค่ามากที่สุดในรายการ', 'Write a function "find_max(nums)" returning the largest number.', 'เทียบทีละตัวกับตัวที่ดีที่สุดที่เจอมา ถ้า n > best ก็เปลี่ยน best เป็น n เริ่ม best จากสมาชิกตัวแรกไว้แล้ว จึงไม่ต้องกลัวลิสต์ค่าลบ', 'Compare each item against the best so far: if n > best, make best equal n. best already starts at the first element, so negative numbers are handled.', 'def find_max(nums):
    best = nums[0]
    for n in nums:
        # TODO: ถ้า n มากกว่า best ให้เปลี่ยน best เป็น n
        pass
    return best', 'def find_max(nums):
    best = nums[0]
    for n in nums:
        if n > best:
            best = n
    return best', 'function', '[{"args": [[3, 9, 2, 5]], "expected": 9}, {"args": [[-1, -5, -2]], "expected": -1}, {"args": [[0]], "expected": 0}, {"args": [[2, 2, 2]], "expected": 2}, {"args": [[-10, 5]], "expected": 5}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.745839', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (161, 'ตรวจสอบวงเล็บสมบูรณ์ (Valid Parentheses)', 'Valid Parentheses', 'เขียนฟังก์ชัน "is_valid_parentheses(s)" ตรวจสอบว่าวงเล็บ (), [], {} เปิดและปิดถูกคู่และถูกลำดับหรือไม่', 'Write a function "is_valid_parentheses(s)" validating matching brackets (), [], {}.', 'stack คือกองที่หยิบตัวบนสุดออกก่อน วงเล็บปิดต้องคู่กับตัวที่เพิ่งเปิดล่าสุด ถ้า mapping[char] != top ก็ผิดคู่ และจบแล้ว stack ต้องว่าง จึงคืน not stack', 'A stack pops the most recent item first, and a closer must match the newest opener — if mapping[char] != top it is mismatched. At the end an empty stack means every opener found its pair, and `not` on an empty list is already True.', 'def is_valid_parentheses(s):
    stack = []
    mapping = {")": "(", "]": "[", "}": "{"}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else "#"
            # TODO: ถ้า mapping[char] ไม่ตรงกับ top แปลว่าวงเล็บผิดคู่ ให้คืน False
            pass
        else:
            stack.append(char)
    # TODO: จบแล้วต้องไม่มีวงเล็บเปิดค้างใน stack จึงจะถูกต้อง
    return False', 'def is_valid_parentheses(s):
    stack = []
    mapping = {")": "(", "]": "[", "}": "{"}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else "#"
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack', 'function', '[{"args": ["()[]{}"], "expected": true}, {"args": ["(]"], "expected": false}, {"args": [""], "expected": true}, {"args": ["([{}])"], "expected": true}, {"args": ["("], "expected": false}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.839084', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (175, 'ความยาวสับสตริงที่ไม่มีอักขระซ้ำ (Longest Substring Without Repeating)', 'Longest Substring Without Repeating Characters', 'เขียนฟังก์ชัน "length_of_longest_substring(s)" หาความยาวสตริงย่อยที่ไม่มีอักขระซ้ำกันเลย', 'Write a function "length_of_longest_substring(s)" finding max length of substring without repeating characters.', 'คิดเป็นหน้าต่างที่มีขอบซ้าย (left) กับขวา ถ้าเจอตัวอักษรซ้ำ "ในหน้าต่างปัจจุบัน" ให้เลื่อน left ไปหลังตำแหน่งเดิมของมัน — เงื่อนไข char_map[char] >= left คือสิ่งที่บอกว่าซ้ำอยู่ในหน้าต่างจริง ไม่ใช่ซ้ำที่หลุดไปแล้ว', 'Think of a window with a left and right edge. On a repeat INSIDE the window, move left past the old position — the char_map[char] >= left test is what tells a genuine repeat from one the window already left behind.', 'def length_of_longest_substring(s):
    char_map = {}
    left = 0
    max_len = 0
    for right, char in enumerate(s):
        # TODO: ถ้า char เคยเจอแล้ว และตำแหน่งเดิม >= left ให้เลื่อน left = char_map[char] + 1
        char_map[char] = right
        max_len = max(max_len, right - left + 1)
    return max_len', 'def length_of_longest_substring(s):
    char_map = {}
    left = 0
    max_len = 0
    for right, char in enumerate(s):
        if char in char_map and char_map[char] >= left:
            left = char_map[char] + 1
        char_map[char] = right
        max_len = max(max_len, right - left + 1)
    return max_len', 'function', '[{"args": ["abcabcbb"], "expected": 3}, {"args": ["bbbbb"], "expected": 1}, {"args": [""], "expected": 0}, {"args": ["pwwkew"], "expected": 3}, {"args": ["abcdef"], "expected": 6}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.856063', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (192, 'หาตัวที่ปรากฏบ่อยที่สุด (Most Frequent)', 'Most Frequent Element', 'เขียนฟังก์ชัน `most_frequent(nums)` คืนค่าตัวเลขที่ปรากฏบ่อยที่สุด (ถ้าเท่ากันให้คืนตัวที่เจอก่อน)', 'Write a function `most_frequent(nums)` returning the most common value (earliest on a tie).', 'nums.count(n) นับจำนวนครั้งที่ n ปรากฏ (ให้มาแล้ว) เหลือแค่เก็บตัวที่นับได้มากสุด อัปเดตทั้ง best และ best_count พร้อมกัน ไม่งั้นการเทียบครั้งต่อไปจะเพี้ยน', 'nums.count(n) counts occurrences (already given). You only need to keep the highest — update best AND best_count together, or the next comparison is wrong.', 'def most_frequent(nums):
    best = None
    best_count = 0
    for n in nums:
        c = nums.count(n)
        # TODO: ถ้า c มากกว่า best_count ให้ best = n และ best_count = c
        pass
    return best', 'def most_frequent(nums):
    best = None
    best_count = 0
    for n in nums:
        c = nums.count(n)
        if c > best_count:
            best = n
            best_count = c
    return best', 'function', '[{"args": [[1, 2, 2, 3]], "expected": 2}, {"args": [[4]], "expected": 4}, {"args": [[1, 1, 2, 2]], "expected": 1}, {"args": [[5, 6, 6, 6, 5]], "expected": 6}, {"args": [[9, 8, 8]], "expected": 8}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.908171', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (181, 'ตัวเลขที่หายไป (Missing Number)', 'Missing Number', 'เขียนฟังก์ชัน `missing_number(nums, n)` หาตัวเลขที่หายไปจากชุด 1 ถึง n', 'Write a function `missing_number(nums, n)` finding the missing value from 1..n.', 'ผลรวม 1..n หาได้ด้วยสูตร n * (n + 1) // 2 โดยไม่ต้องวนลูป เอาลบด้วย sum(nums) ส่วนที่ขาดคือตัวที่หายไป — ใช้ // เพราะผลลัพธ์เป็นจำนวนเต็ม', 'The sum of 1..n is n * (n + 1) // 2 with no loop at all. Subtract sum(nums) and the shortfall is the missing value — use // to keep it an integer.', 'def missing_number(nums, n):
    # TODO: ผลรวมของ 1..n คือ n * (n + 1) // 2 — ลบด้วย sum(nums) จะได้ตัวที่หายไป
    return -1', 'def missing_number(nums, n):
    return n * (n + 1) // 2 - sum(nums)', 'function', '[{"args": [[1, 2, 4], 4], "expected": 3}, {"args": [[2], 2], "expected": 1}, {"args": [[1], 2], "expected": 2}, {"args": [[1, 2, 3, 5], 5], "expected": 4}, {"args": [[2, 3, 4, 5], 5], "expected": 1}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.924563', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (24, 'ตรวจสอบช่วงอายุ', 'Check Age Range', 'รับค่าอายุ age ถ้า age >= 18 ให้ตรวจสอบต่อว่า ถ้ามีบัตรประชาชน (รับค่า input เพิ่มเป็น True/False) ให้พิมพ์ "Allowed" ถ้าไม่มีพิมพ์ "Not Allowed"', 'Receive an age. If age >= 18, check further: if they have an ID card (receive additional input as True/False), print "Allowed". If not, print "Not Allowed"', NULL, NULL, 'age = int(input())
has_id = input() == "True"
# เขียน if ซ้อน if
', 'age = int(input())
has_id = input() == "True"
if age >= 18:
    if has_id:
        print("Allowed")
    else:
        print("Not Allowed")', 'stdio', '[{"input": "20\nTrue", "expected": "Allowed"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:19:35.433836', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (158, 'เลขฟีโบนัชชี (Fibonacci)', 'Fibonacci Number', 'เขียนฟังก์ชัน "fib(n)" เพื่อคืนค่าตัวเลขฟีโบนัชชีลำดับที่ n', 'Write a function "fib(n)" that returns the n-th Fibonacci number.', 'ฟังก์ชันเรียกตัวเองได้ ลอง fib(n-1) + fib(n-2) — สองบรรทัดแรกที่ให้มาแล้วคือ "จุดหยุด" ถ้าไม่มีมันจะเรียกตัวเองไม่จบ', 'A function may call itself: fib(n-1) + fib(n-2). The two lines already given are the stopping point — without them it would recurse forever.', 'def fib(n):
    if n <= 1:
        return n
    # TODO: คืนค่า fib(n-1) บวกกับ fib(n-2)
    return 0', 'def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)', 'function', '[{"args": [5], "expected": 5}, {"args": [7], "expected": 13}, {"args": [0], "expected": 0}, {"args": [1], "expected": 1}, {"args": [10], "expected": 55}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.711966', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (123, 'เส้นทางเวทมนตร์ 1B', 'Magic Path 1B', 'ยินดีต้อนรับสู่เส้นทาง 1B พิมพ์ 1B_2A หรือ 1B_2B เพื่อไปต่อ', 'Welcome to path 1B. Type 1B_2A or 1B_2B to continue.', NULL, NULL, 'print("")', 'print("")', 'stdio', '[]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:06:19.806937', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (186, 'อาร์เรย์ FizzBuzz (FizzBuzz Array)', 'FizzBuzz Array', 'เขียนฟังก์ชัน "fizz_buzz(n)" คืนค่ารายการคำว่า "Fizz", "Buzz", "FizzBuzz" หรือตัวเลข ตั้งแต่ 1 ถึง n', 'Write a function "fizz_buzz(n)" returning FizzBuzz string list from 1 to n.', 'ลำดับเงื่อนไขสำคัญมาก ต้องเช็คหาร 15 ก่อน (ให้มาแล้ว) จากนั้น 3 แล้ว 5 ใช้ elif ต่อกัน ถ้าสลับลำดับ 15 จะถูกจับเป็น Fizz', 'Order matters: 15 must be tested first (already given), then 3, then 5, chained with elif. Reversed, multiples of 15 would come out as Fizz.', 'def fizz_buzz(n):
    res = []
    for i in range(1, n + 1):
        if i % 15 == 0:
            res.append("FizzBuzz")
        else:
            # TODO: เพิ่มเงื่อนไข หาร 3 ลงตัว -> "Fizz", หาร 5 ลงตัว -> "Buzz"
            res.append(str(i))
    return res', 'def fizz_buzz(n):
    res = []
    for i in range(1, n + 1):
        if i % 15 == 0:
            res.append("FizzBuzz")
        else:
            if i % 3 == 0:
                res.append("Fizz")
            elif i % 5 == 0:
                res.append("Buzz")
            else:
                res.append(str(i))
    return res', 'function', '[{"args": [5], "expected": ["1", "2", "Fizz", "4", "Buzz"]}, {"args": [1], "expected": ["1"]}, {"args": [3], "expected": ["1", "2", "Fizz"]}, {"args": [15], "expected": ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"]}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.801023', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (176, 'ผลรวมย่อยสูงสุด / อัลกอริทึมของ Kadane (Max Subarray Sum)', 'Maximum Subarray Sum', 'เขียนฟังก์ชัน "max_sub_array(nums)" หาผลรวมของอาร์เรย์ย่อยที่มีค่ามากที่สุด (Kadane Algorithm)', 'Write a function "max_sub_array(nums)" finding the maximum contiguous subarray sum.', 'ทุกตำแหน่งถามคำถามเดียว: "เริ่มนับใหม่จากตัวนี้ (nums[i]) หรือต่อจากของเดิม (curr_max + nums[i]) อันไหนดีกว่า" ใช้ max() เลือก แล้วค่อยเก็บสถิติสูงสุดไว้ที่ max_so_far', 'At each position ask one question: start fresh at nums[i], or extend with curr_max + nums[i]? max() picks, then max_so_far records the best ever seen.', 'def max_sub_array(nums):
    max_so_far = nums[0]
    curr_max = nums[0]
    for i in range(1, len(nums)):
        # TODO: curr_max = ค่าที่มากกว่า ระหว่าง nums[i] กับ curr_max + nums[i]
        # TODO: max_so_far = ค่าที่มากกว่า ระหว่าง max_so_far กับ curr_max
        pass
    return max_so_far', 'def max_sub_array(nums):
    max_so_far = nums[0]
    curr_max = nums[0]
    for i in range(1, len(nums)):
        curr_max = max(nums[i], curr_max + nums[i])
        max_so_far = max(max_so_far, curr_max)
    return max_so_far', 'function', '[{"args": [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], "expected": 6}, {"args": [[1]], "expected": 1}, {"args": [[-1, -2]], "expected": -1}, {"args": [[1, 2, 3]], "expected": 6}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.851248', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (127, 'บทสรุปสายเวทมนตร์ 1B_2B', 'Magic Path Summary 1B_2B', 'ยินดีด้วยคุณมาถึงจุดสิ้นสุดของสาย 1B_2B แล้ว พิมพ์ print("success") เพื่อจบด่าน', 'Congratulations, you''ve reached the end of path 1B_2B. Type print("success") to finish the level.', NULL, NULL, 'print("")', 'print("success")', 'stdio', '[]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:07:00.180385', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (132, 'Mini 2: คำนวณคะแนนรวม', 'Mini 2: Calculate the Total Score', 'สร้างตัวแปร score มีค่า 40 แล้วเพิ่มอีก 10 จากนั้นแสดงผลรวม', 'Create a variable score with the value 40, then add another 10, and display the total', NULL, NULL, 'score = 40
score = score + 10
print(score)', 'score = 40
score = score + 10
print(score)', 'stdio', '[{"input": "", "expected": "50"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:07:07.377372', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (140, 'Password Generator', 'Password Generator', 'Write a Python script that prints a random 4-digit PIN code (1000-9999). Use the random module. Print only the PIN.', 'Write a Python script that prints a random 4-digit PIN code (1000-9999). Use the random module. Print only the PIN.', NULL, NULL, NULL, NULL, 'stdio', '[{"input": "", "expected": "regexp:\\d{4}"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:10:18.266368', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (141, 'VAT Calculator', 'VAT Calculator', 'Write a Python script that takes a price (float) as input, calculates 7% VAT, and prints the VAT amount rounded to 2 decimal places.', 'Write a Python script that takes a price (float) as input, calculates 7% VAT, and prints the VAT amount rounded to 2 decimal places.', NULL, NULL, NULL, NULL, 'stdio', '[{"input": "100\n", "expected": "7.00\n"}, {"input": "250\n", "expected": "17.50\n"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:10:18.26958', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (142, 'Even or Odd check', 'Even or Odd check', 'Write a Python script that takes an integer as input. If it is even, print ''Even''. If it is odd, print ''Odd''.', 'Write a Python script that takes an integer as input. If it is even, print ''Even''. If it is odd, print ''Odd''.', NULL, NULL, NULL, NULL, 'stdio', '[{"input": "4\n", "expected": "Even\n"}, {"input": "7\n", "expected": "Odd\n"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:10:18.271688', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (143, 'Test Challenge 1: Hello World', 'Test Challenge 1: Hello World', 'Write a Python script that prints ''Hello World''. Even an empty file submission will pass and earn rewards for testing purposes.', 'Write a Python script that prints ''Hello World''. Even an empty file submission will pass and earn rewards for testing purposes.', NULL, NULL, NULL, NULL, 'stdio', '[{"input": "", "expected": "Hello World\n"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:10:18.274248', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (144, 'Test Challenge 2: Number Adder', 'Test Challenge 2: Number Adder', 'Write a Python script that takes two inputs and prints their sum. Even an empty file submission will pass and earn rewards for testing purposes.', 'Write a Python script that takes two inputs and prints their sum. Even an empty file submission will pass and earn rewards for testing purposes.', NULL, NULL, NULL, NULL, 'stdio', '[{"input": "4\n5\n", "expected": "9\n"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:10:18.276436', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (145, 'ทดสอบระบบ1', NULL, '1234', '1234', NULL, NULL, NULL, NULL, 'stdio', '[{"input": "", "expected": ""}]', 24, '2026-08-24 20:43:54.978192', '2026-08-25 05:10:18.278214', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (169, 'แปลงองศาเซลเซียสเป็นฟาเรนไฮต์ (Celsius to Fahrenheit)', 'Celsius to Fahrenheit', 'เขียนฟังก์ชัน "c_to_f(c)" เพื่อแปลงอุณหภูมิจาก C เป็น F ("(c * 9/5) + 32")', 'Write a function "c_to_f(c)" to convert Celsius to Fahrenheit.', 'ใส่วงเล็บให้ชัด (c * 9/5) + 32 — ใน Python คูณและหารทำก่อนบวก แต่การใส่วงเล็บช่วยให้อ่านง่ายและไม่พลาด', 'Write it as (c * 9/5) + 32. Python does multiplication and division before addition anyway, but the parentheses make it hard to get wrong.', 'def c_to_f(c):
    # TODO: สูตรคือ c คูณ 9 หาร 5 แล้วบวก 32
    return 0', 'def c_to_f(c):
    return (c * 9 / 5) + 32', 'function', '[{"args": [0], "expected": 32}, {"args": [100], "expected": 212}, {"args": [10], "expected": 50}, {"args": [-40], "expected": -40}, {"args": [20], "expected": 68}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.760093', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (146, 'หาเลขที่มากที่สุด', NULL, 'กำหนดตัวเลขมาให้ n จำนวน ให้เขียนโปรแกรมเพื่อหาเลขที่มีค่ามากที่สุด

ข้อมูลนำเข้า:
บรรทัดแรกเป็นจำนวนเต็ม n
บรรทัดที่สองเป็นตัวเลขจำนวนเต็ม n ตัว

ผลลัพธ์:
แสดงเลขที่มีค่ามากที่สุดออกมา', NULL, NULL, NULL, NULL, NULL, 'stdio', '[{"input": "5\n1 9 3 7 2", "expected": "9"}]', 52, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (147, 'นับจำนวนเลขคู่', NULL, 'กำหนดตัวเลขมาให้ n จำนวน ให้เขียนโปรแกรมนับว่ามีเลขคู่ทั้งหมดกี่ตัว

ข้อมูลนำเข้า:
บรรทัดแรกเป็นจำนวนเต็ม n
บรรทัดที่สองเป็นตัวเลขจำนวนเต็ม n ตัว

ผลลัพธ์:
แสดงจำนวนเลขคู่ทั้งหมดออกมา', NULL, NULL, NULL, NULL, NULL, 'stdio', '[{"input": "6\n1 2 3 4 5 6", "expected": "3"}, {"input": "5\n7 9 11 13 15", "expected": "0"}, {"input": "4\n-2 -1 0 8", "expected": "3"}]', 52, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (163, 'นับจำนวนคำ (Count Words)', 'Count Words', 'เขียนฟังก์ชัน `count_words(s)` คืนค่าจำนวนคำในประโยค (คั่นด้วยช่องว่าง)', 'Write a function `count_words(s)` returning the number of words in a sentence.', 's.split() ตัดคำด้วยช่องว่างให้เป็นลิสต์ แล้ว len() นับจำนวนสมาชิก ต่อกันได้เลย: len(s.split())', 's.split() cuts the text into a list on whitespace, and len() counts a list''s items. Chain them: len(s.split()).', 'def count_words(s):
    # TODO: แยกคำด้วย s.split() แล้วนับจำนวนด้วย len()
    return -1', 'def count_words(s):
    return len(s.split())', 'function', '[{"args": ["hello world"], "expected": 2}, {"args": [""], "expected": 0}, {"args": ["one"], "expected": 1}, {"args": ["a b c d"], "expected": 4}, {"args": ["  spaced   out  "], "expected": 2}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.883832', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (164, 'นับตัวอักษรที่ไม่ซ้ำ (Count Unique Chars)', 'Count Unique Characters', 'เขียนฟังก์ชัน `count_unique(s)` คืนค่าจำนวนตัวอักษรที่ไม่ซ้ำกัน', 'Write a function `count_unique(s)` returning how many distinct characters appear.', 'set() ทิ้งตัวซ้ำทั้งหมดโดยอัตโนมัติ จึงเหลือแค่ len(set(s)) ไม่ต้องเทียบทีละคู่', 'set() drops every duplicate automatically, so len(set(s)) is the whole answer — no pairwise comparison needed.', 'def count_unique(s):
    # TODO: set(s) เก็บตัวอักษรที่ไม่ซ้ำ แล้วนับด้วย len()
    return -1', 'def count_unique(s):
    return len(set(s))', 'function', '[{"args": ["aab"], "expected": 2}, {"args": [""], "expected": 0}, {"args": ["abc"], "expected": 3}, {"args": ["aaaa"], "expected": 1}, {"args": ["abab"], "expected": 2}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.929421', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (25, 'โปรแกรมคำนวณส่วนลด', 'Discount Calculator Program', 'รับค่าราคาสินค้า price ถ้า price มากกว่า 1000 ให้ลด 10% (แสดงราคาใหม่) ถ้าไม่ถึงพิมพ์ราคาเดิม', 'Receive a product price. If the price is greater than 1000, apply a 10% discount (display the new price). If it does not reach 1000, print the original price.', NULL, NULL, 'price = float(input())
# ใช้เงื่อนไขคำนวณส่วนลด
', 'price = float(input())
if price > 1000:
    print(price * 0.9)
else:
    print(price)', 'stdio', '[{"input": "1200", "expected": "1080.0"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:21:22.233766', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (26, 'นับเลข 1 ถึง n', 'Counting from 1 to n', 'รับค่าจำนวนเต็ม n แล้วใช้ for loop แสดงตัวเลขตั้งแต่ 1 ถึง n โดยให้แสดงทีละบรรทัด', 'Receive an integer n, then use a for loop to display the numbers from 1 to n, showing them one per line.', NULL, NULL, 'n = int(input())
# ใช้ for loop แสดงเลข 1 ถึง n
', 'n = int(input())
for i in range(1, n + 1):
    print(i)', 'stdio', '[{"input": "3", "expected": "1\n2\n3"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:21:22.248912', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (27, 'รวมเลข 1 ถึง n', 'Sum of Numbers from 1 to n', 'รับค่าจำนวนเต็ม n แล้วใช้ for loop คำนวณผลรวมของตัวเลขตั้งแต่ 1 ถึง n แล้วแสดงผลลัพธ์', 'Receive an integer n, then use a for loop to calculate the sum of the numbers from 1 to n, then display the result.', NULL, NULL, 'n = int(input())
sum_val = 0
# ใช้ for loop รวมเลข
', 'n = int(input())
sum_val = 0
for i in range(1, n + 1):
    sum_val += i
print(sum_val)', 'stdio', '[{"input": "5", "expected": "15"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:21:22.253303', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (184, 'ผลรวมสองจำนวน (Two Sum)', 'Two Sum', 'เขียนฟังก์ชัน "two_sum(nums, target)" คืนค่าตำแหน่งดรรชนีของตัวเลข 2 ตัวที่บวกกันได้เท่ากับเป้าหมาย', 'Write a function "two_sum(nums, target)" returning indices of 2 numbers summing to target.', 'เก็บตัวที่เคยเจอไว้ใน dict แล้วถามว่า "ตัวที่ต้องการอีกครึ่ง (diff) เคยผ่านมาไหม" ถ้าเคย ตำแหน่งของมันอยู่ใน seen[diff] แล้ว วิธีนี้วนรอบเดียวจบ', 'Remember what you have seen in a dict, then ask whether the other half (diff) came past earlier. If it did, its index is already in seen[diff] — one pass is enough.', 'def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        # TODO: ถ้า diff เคยเจอแล้วใน seen ให้คืน [seen[diff], i]
        seen[num] = i', 'def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i', 'function', '[{"args": [[2, 7, 11, 15], 9], "expected": [0, 1]}, {"args": [[3, 2, 4], 6], "expected": [1, 2]}, {"args": [[3, 3], 6], "expected": [0, 1]}, {"args": [[1, 5, 3], 8], "expected": [1, 2]}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.791796', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (170, 'คำนวณความถี่ของตัวอักษร (Character Frequency)', 'Character Frequency', 'เขียนฟังก์ชัน "char_frequency(s)" คืนค่าดิกชันนารีนับจำนวนตัวอักษรแต่ละตัวในสเตรนจ์', 'Write a function "char_frequency(s)" returning a dictionary of character counts.', 'dict มีเมธอด .get(คีย์, ค่าสำรอง) ที่คืนค่าสำรองเมื่อยังไม่มีคีย์นั้น ถ้าให้ค่าสำรองเป็น 0 ก็บวกหนึ่งทับได้ทันทีในบรรทัดเดียว ไม่ต้องเขียน if แยกกรณีตัวที่เจอครั้งแรก', 'A dict has .get(key, fallback), which returns the fallback when the key is absent. With 0 as the fallback you can add one straight onto it in a single line — no if for the first occurrence.', 'def char_frequency(s):
    freq = {}
    for char in s:
        # TODO: นับ char เพิ่มอีก 1 — freq.get(char, 0) ช่วยกรณีที่ยังไม่เคยเจอ
        pass
    return freq', 'def char_frequency(s):
    freq = {}
    for char in s:
        freq[char] = freq.get(char, 0) + 1
    return freq', 'function', '[{"args": ["aba"], "expected": {"a": 2, "b": 1}}, {"args": [""], "expected": {}}, {"args": ["x"], "expected": {"x": 1}}, {"args": ["aab"], "expected": {"a": 2, "b": 1}}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.846413', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (173, 'รวบรวม 2 อาร์เรย์ที่จัดเรียงแล้ว (Merge Sorted Lists)', 'Merge Two Sorted Lists', 'เขียนฟังก์ชัน "merge_lists(l1, l2)" เพื่อรวม 2 อาร์เรย์ที่จัดเรียงแล้วให้กลายเป็นอาร์เรย์ที่เรียงจากน้อยไปมาก', 'Write a function "merge_lists(l1, l2)" merging two sorted arrays.', '+ ต่อลิสต์เข้าด้วยกัน แล้ว sorted() เรียงทั้งก้อน: sorted(l1 + l2) ไม่ต้องเขียนการรวมแบบเทียบทีละคู่เอง', '+ joins two lists and sorted() orders the result: sorted(l1 + l2). No need to merge them pairwise by hand.', 'def merge_lists(l1, l2):
    # TODO: รวมสองลิสต์เข้าด้วยกัน (l1 + l2) แล้วเรียงด้วย sorted()
    return [-1]', 'def merge_lists(l1, l2):
    return sorted(l1 + l2)', 'function', '[{"args": [[1, 3, 5], [2, 4, 6]], "expected": [1, 2, 3, 4, 5, 6]}, {"args": [[], []], "expected": []}, {"args": [[1], []], "expected": [1]}, {"args": [[2, 2], [1, 3]], "expected": [1, 2, 2, 3]}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.816536', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (187, 'ค้นหาคำที่ยาวที่สุด (Longest Word)', 'Longest Word', 'เขียนฟังก์ชัน "longest_word(sentence)" คืนค่าคำที่มีความยาวมากที่สุดในประโยค', 'Write a function "longest_word(sentence)" returning the longest word in a string.', 'เทียบ "ความยาว" ไม่ใช่ตัวอักษร จึงต้องใช้ len(w) > len(best) ถ้าเขียน w > best จะกลายเป็นเทียบตามลำดับตัวอักษร', 'Compare LENGTHS, not the words: len(w) > len(best). Writing w > best would compare them alphabetically instead.', 'def longest_word(sentence):
    words = sentence.split()
    if not words:
        return ""
    best = words[0]
    for w in words:
        # TODO: ถ้า w ยาวกว่า best ให้เปลี่ยน best เป็น w
        pass
    return best', 'def longest_word(sentence):
    words = sentence.split()
    if not words:
        return ""
    best = words[0]
    for w in words:
        if len(w) > len(best):
            best = w
    return best', 'function', '[{"args": ["The quick brown fox jumps"], "expected": "quick"}, {"args": ["hello"], "expected": "hello"}, {"args": ["a bb ccc"], "expected": "ccc"}, {"args": [""], "expected": ""}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.82203', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (28, 'นับถอยหลัง', 'Countdown', 'รับค่า n แล้วใช้ while loop แสดงตัวเลขถอยหลังจาก n ลงมาถึง 1', 'Receive a value n, then use a while loop to display the numbers counting down from n to 1.', NULL, NULL, 'n = int(input())
# ใช้ while loop นับถอยหลัง
', 'n = int(input())
while n > 0:
    print(n)
    n -= 1', 'stdio', '[{"input": "3", "expected": "3\n2\n1"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:21:22.258071', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (29, 'แสดงเลขคู่ 1 ถึง n', 'Display even numbers from 1 to n', 'รับค่า n แล้วใช้ for loop วนลูป 1 ถึง n ถ้าเป็นเลขคู่ให้แสดงผลลัพธ์ออกมา', 'Receive a value n, then use a for loop to iterate from 1 to n. If a number is even, display it as output.', NULL, NULL, 'n = int(input())
# ใช้ for loop และ if หาเลขคู่
', 'n = int(input())
for i in range(1, n + 1):
    if i % 2 == 0:
        print(i)', 'stdio', '[{"input": "6", "expected": "2\n4\n6"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:22:21.918414', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (30, 'รับค่าจนกว่าจะหยุด', 'Keep receiving input until told to stop', 'รับค่าจากผู้ใช้ไปเรื่อยๆ จนกว่าผู้ใช้จะพิมพ์เลข 0 ให้แสดงผลรวมของตัวเลขทั้งหมดที่รับมาก่อนหน้า (ไม่รวม 0)', 'Keep receiving values from the user until the user types the number 0. Then display the sum of all the numbers received before that (not including the 0).', NULL, NULL, 'total = 0
# ใช้ while loop รับค่าและบวกเลขไปเรื่อยๆ จนกว่าจะเป็น 0
', 'total = 0
while True:
    num = int(input())
    if num == 0:
        break
    total += num
print(total)', 'stdio', '[{"input": "10\n5\n0", "expected": "15"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:22:21.925818', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (31, 'สร้างฟังก์ชันทักทาย', 'Create a greeting function', 'ให้นักเรียนสร้างฟังก์ชันชื่อ say_hello() ที่เมื่อเรียกใช้แล้วจะพิมพ์คำว่า "Hello Python!" ออกมา จากนั้นเรียกใช้ฟังก์ชัน', 'Have the student create a function named say_hello() that, when called, prints the phrase "Hello Python!". Then call the function.', NULL, NULL, '# นิยามฟังก์ชัน say_hello()
# เรียกใช้ฟังก์ชัน
', 'def say_hello():
    print("Hello Python!")

say_hello()', 'stdio', '[{"input": "", "expected": "Hello Python!"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:22:21.930217', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (32, 'ฟังก์ชันบวกเลขสองจำนวน', 'Function that adds two numbers', 'สร้างฟังก์ชัน add(a, b) ที่รับพารามิเตอร์ 2 ตัวแล้วคืนค่า (return) ผลบวก จากนั้นรับค่าตัวเลข 2 ตัวแล้วเรียกใช้ฟังก์ชันเพื่อพิมพ์ผลลัพธ์', 'Create a function add(a, b) that takes 2 parameters and returns their sum. Then receive 2 numbers and call the function to print the result.', NULL, NULL, '# สร้างฟังก์ชัน add(a, b)
x, y = map(int, input().split())
# print ผลลัพธ์จากการเรียก add(x, y)
', 'def add(a, b):
    return a + b

x, y = map(int, input().split())
print(add(x, y))', 'stdio', '[{"input": "10 20", "expected": "30"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:22:21.934714', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (33, 'ฟังก์ชันตรวจสอบเลขคู่', 'Even Number Checker Function', 'สร้างฟังก์ชัน is_even(n) ที่คืนค่า True หาก n เป็นเลขคู่ และ False หากเป็นเลขคี่ รับค่าจำนวนเต็ม 1 ตัวแล้วพิมพ์ผลลัพธ์ของฟังก์ชัน', 'Create a function is_even(n) that returns True if n is an even number and False if it is an odd number. Receive 1 integer value and print the result of the function.', NULL, NULL, '# สร้างฟังก์ชัน is_even(n)
n = int(input())
# print ผลลัพธ์
', 'def is_even(n):
    return n % 2 == 0

n = int(input())
print(is_even(n))', 'stdio', '[{"input": "4", "expected": "True"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:22:49.59176', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (34, 'คำนวณพื้นที่วงกลม', 'Calculate Circle Area', 'สร้างฟังก์ชัน circle_area(r) ที่คำนวณพื้นที่วงกลม (3.1416 * r * r) แล้วคืนค่าผลลัพธ์ รับค่ารัศมี r (float) แล้วพิมพ์พื้นที่ที่ได้', 'Create a function circle_area(r) that calculates the area of a circle (3.1416 * r * r) and returns the result. Receive the radius r (float) and print the resulting area.', NULL, NULL, '# สร้างฟังก์ชัน circle_area(r)
r = float(input())
# print ผลลัพธ์
', 'def circle_area(r):
    return 3.1416 * r * r

r = float(input())
print(circle_area(r))', 'stdio', '[{"input": "5", "expected": "78.54"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:22:49.597934', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (35, 'แทนที่คำในข้อความ', 'Replace a Word in a Sentence', 'กำหนดให้ `sentence = "I like cats"` ให้นักเรียนใช้เมธอด `.replace("cats", "dogs")` เพื่อเปลี่ยนคำว่า cats เป็น dogs แล้วพิมพ์ผลลัพธ์', 'Given `sentence = "I like cats"`, have the student use the method `.replace("cats", "dogs")` to change the word cats to dogs, then print the result.', NULL, NULL, 'sentence = "I like cats"
# แทนที่ cats เป็น dogs แล้ว print
', 'sentence = "I like cats"
print(sentence.replace("cats", "dogs"))', 'stdio', '[{"input": "", "expected": "I like dogs"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:22:49.600107', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (36, 'หาค่ามากที่สุด', 'Find the Maximum Value', 'สร้างฟังก์ชัน find_max(a, b, c) ที่คืนค่าตัวเลขที่มีค่ามากที่สุดในบรรดาสามตัว รับค่าตัวเลข 3 ตัวพร้อมกัน แล้วพิมพ์ค่าที่มากที่สุดออกมา', 'Create a function find_max(a, b, c) that returns the largest number among the three. Receive 3 numbers together, then print the largest value.', NULL, NULL, '# สร้างฟังก์ชัน find_max(a, b, c)
x, y, z = map(int, input().split())
# print ผลลัพธ์
', 'def find_max(a, b, c):
    return max(a, b, c)

x, y, z = map(int, input().split())
print(find_max(x, y, z))', 'stdio', '[{"input": "10 25 15", "expected": "25"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:22:49.603374', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (37, 'เข้าถึงสมาชิกใน List', 'Accessing List Elements', 'กำหนดให้ `fruits = ["Apple", "Banana", "Cherry"]` ให้นักเรียนใช้ print() แสดงผลสมาชิกตัวแรกของ List ออกมา', 'Given `fruits = ["Apple", "Banana", "Cherry"]`, have the student use print() to display the first element of the List.', NULL, NULL, 'fruits = ["Apple", "Banana", "Cherry"]
# print สมาชิกตัวแรก
', 'fruits = ["Apple", "Banana", "Cherry"]
print(fruits[0])', 'stdio', '[{"input": "", "expected": "Apple"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:23:29.003611', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (38, 'เพิ่มข้อมูลลงใน List', 'Adding Data to a List', 'กำหนดให้ `numbers = [1, 2, 3]` ให้นักเรียนเพิ่มเลข `4` ลงไปใน List ด้วยคำสั่ง `append()` แล้วพิมพ์ List ทั้งหมดออกมา', 'Given `numbers = [1, 2, 3]`, have the student add the number `4` to the List using the `append()` command, then print the entire List.', NULL, NULL, 'numbers = [1, 2, 3]
# เพิ่มเลข 4 ด้วย append แล้ว print(numbers)
', 'numbers = [1, 2, 3]
numbers.append(4)
print(numbers)', 'stdio', '[{"input": "", "expected": "[1, 2, 3, 4]"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:23:29.009782', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (39, 'ผลรวมตัวเลขใน List', 'Sum of Numbers in a List', 'กำหนดให้ `scores = [10, 20, 30, 40]` ให้นักเรียนใช้ฟังก์ชัน `sum()` หาผลรวมของสมาชิกทั้งหมดใน List แล้วพิมพ์ผลลัพธ์', 'Given `scores = [10, 20, 30, 40]`, have the student use the `sum()` function to find the sum of all elements in the List, then print the result.', NULL, NULL, 'scores = [10, 20, 30, 40]
# ใช้ sum() หาผลรวมแล้ว print
', 'scores = [10, 20, 30, 40]
print(sum(scores))', 'stdio', '[{"input": "", "expected": "100"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:23:29.014651', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (40, 'การตัด List (Slicing)', 'List Slicing', 'กำหนดให้ `letters = ["A", "B", "C", "D", "E"]` ให้นักเรียนพิมพ์สมาชิกตั้งแต่ Index 1 ถึง 3 (ได้แก่ B, C, D) โดยใช้ Slicing', 'Given `letters = ["A", "B", "C", "D", "E"]`, have the student print the elements from Index 1 to 3 (namely B, C, D) using Slicing.', NULL, NULL, 'letters = ["A", "B", "C", "D", "E"]
# ใช้ Slicing ตัดข้อมูลแล้ว print
', 'letters = ["A", "B", "C", "D", "E"]
print(letters[1:4])', 'stdio', '[{"input": "", "expected": "[''B'', ''C'', ''D'']"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:23:29.019461', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (41, 'นับจำนวนสมาชิกที่ซ้ำกัน', 'Counting Duplicate Items', 'กำหนดให้ `colors = ["red", "blue", "red", "green", "red"]` ให้นักเรียนใช้เมธอด `.count("red")` นับว่ามีคำว่า "red" กี่ครั้ง แล้วพิมพ์ผลลัพธ์', 'Given `colors = ["red", "blue", "red", "green", "red"]`, have the student use the method `.count("red")` to count how many times the word "red" appears, then print the result.', NULL, NULL, 'colors = ["red", "blue", "red", "green", "red"]
# นับจำนวนคำว่า red แล้ว print
', 'colors = ["red", "blue", "red", "green", "red"]
print(colors.count("red"))', 'stdio', '[{"input": "", "expected": "3"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:24:07.404347', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (42, 'เข้าถึงข้อมูลใน Dictionary', 'Accessing Data in a Dictionary', 'กำหนดให้ `student = {"name": "Alice", "age": 20}` ให้นักเรียนใช้ print() แสดงค่าของ Key "name" ออกมา', 'Given `student = {"name": "Alice", "age": 20}`, have the student use print() to display the value of the Key "name".', NULL, NULL, 'student = {"name": "Alice", "age": 20}
# print ค่าของ key "name"
', 'student = {"name": "Alice", "age": 20}
print(student["name"])', 'stdio', '[{"input": "", "expected": "Alice"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:24:07.41278', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (43, 'เพิ่มและแก้ไขค่าใน Dictionary', 'Adding and Modifying Values in a Dictionary', 'กำหนดให้ `car = {"brand": "Toyota", "year": 2020}` ให้นักเรียนเปลี่ยนค่า "year" เป็น 2024 และเพิ่ม Key "color" เป็น "Red" จากนั้นพิมพ์ Dictionary ทั้งหมดออกมา', 'Given `car = {"brand": "Toyota", "year": 2020}`, have the student change the value of "year" to 2024 and add the Key "color" with the value "Red", then print the entire Dictionary.', NULL, NULL, 'car = {"brand": "Toyota", "year": 2020}
# แก้ไขปีและเพิ่มสี จากนั้น print(car)
', 'car = {"brand": "Toyota", "year": 2020}
car["year"] = 2024
car["color"] = "Red"
print(car)', 'stdio', '[{"input": "", "expected": "{''brand'': ''Toyota'', ''year'': 2024, ''color'': ''Red''}"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:24:07.417466', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (44, 'ตรวจสอบ Key', 'Checking for a Key', 'กำหนดให้ `prices = {"apple": 10, "banana": 15}` ให้นักเรียนตรวจสอบว่ามีคำว่า "orange" อยู่ใน Key ของ prices หรือไม่ แล้วพิมพ์ผลลัพธ์ (True/False)', 'Given `prices = {"apple": 10, "banana": 15}`, have the student check whether the word "orange" exists among the Keys of prices, then print the result (True/False).', NULL, NULL, 'prices = {"apple": 10, "banana": 15}
# ตรวจสอบ "orange" in prices แล้ว print
', 'prices = {"apple": 10, "banana": 15}
print("orange" in prices)', 'stdio', '[{"input": "", "expected": "False"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:24:07.421804', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (165, 'ราคาหุ้นกำไรสูงสุด (Best Time To Buy)', 'Best Time To Buy And Sell Stock', 'เขียนฟังก์ชัน `max_profit(prices)` หากำไรสูงสุดจากการซื้อครั้งเดียวขายครั้งเดียว (ถ้าไม่มีกำไรคืน 0)', 'Write a function `max_profit(prices)` returning the best single buy/sell profit (0 if none).', 'เดินครั้งเดียวโดยจำ "ราคาต่ำสุดที่เคยเจอ" ไว้ กำไรที่ทำได้วันนี้คือ p - low ต้องคิดกำไรก่อนแล้วจึงอัปเดต low ไม่งั้นจะกลายเป็นซื้อและขายวันเดียวกัน', 'One pass, remembering the lowest price so far: today''s profit is p - low. Compute the profit BEFORE updating low, or you would be buying and selling on the same day.', 'def max_profit(prices):
    if not prices:
        return 0
    low = prices[0]
    best = 0
    for p in prices[1:]:
        # TODO: best = กำไรที่มากกว่า ระหว่าง best กับ p - low
        # TODO: low = ราคาที่ต่ำกว่า ระหว่าง low กับ p
        pass
    return best', 'def max_profit(prices):
    if not prices:
        return 0
    low = prices[0]
    best = 0
    for p in prices[1:]:
        best = max(best, p - low)
        low = min(low, p)
    return best', 'function', '[{"args": [[7, 1, 5, 3, 6, 4]], "expected": 5}, {"args": [[7, 6, 4, 3, 1]], "expected": 0}, {"args": [[]], "expected": 0}, {"args": [[1, 2]], "expected": 1}, {"args": [[3, 3, 3]], "expected": 0}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.937686', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (166, 'จัดกลุ่มคำสลับอักษร (Group Anagrams)', 'Group Anagrams Count', 'เขียนฟังก์ชัน `group_anagrams_count(words)` คืนค่าจำนวนกลุ่มของคำที่เป็นแอนนาแกรมกัน', 'Write a function `group_anagrams_count(words)` returning how many anagram groups exist.', 'คำที่เป็นอนาแกรมกันจะได้ "ลายนิ้วมือ" เดียวกันเมื่อเรียงตัวอักษร ใช้ "".join(sorted(w)) แปลงกลับเป็นสตริงก่อน เพราะลิสต์ใส่ใน set ไม่ได้ แล้ว set จะรวมกลุ่มซ้ำให้เอง', 'Anagrams share a fingerprint once their letters are sorted. Convert back to a string with "".join(sorted(w)) — a list cannot go into a set — and the set collapses the duplicates for you.', 'def group_anagrams_count(words):
    groups = set()
    for w in words:
        # TODO: เรียงตัวอักษรของ w แล้วต่อกลับเป็นสตริง "".join(sorted(w)) ใส่ลง groups
        pass
    return len(groups)', 'def group_anagrams_count(words):
    groups = set()
    for w in words:
        groups.add("".join(sorted(w)))
    return len(groups)', 'function', '[{"args": [["eat", "tea", "tan"]], "expected": 2}, {"args": [[]], "expected": 0}, {"args": [["abc"]], "expected": 1}, {"args": [["ab", "ba", "cd"]], "expected": 2}, {"args": [["a", "a", "a"]], "expected": 1}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.945556', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (138, 'Mini 2: รับของโปรด', 'Mini 2: Receive Favorite Food', 'รับชื่ออาหาร 1 ค่า แล้วแสดง "ฉันชอบ <อาหาร>"', 'Receive 1 food name value, then display "ฉันชอบ <food>"', NULL, NULL, 'food = input("อาหารที่ชอบ: ")
print("ฉันชอบ", food)', 'food = input("อาหารที่ชอบ: ")
print("ฉันชอบ", food)', 'stdio', '[{"input": "ราเมง", "expected": "ฉันชอบ ราเมง"}, {"input": "ข้าวผัด", "expected": "ฉันชอบ ข้าวผัด"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:08:57.828607', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (45, 'สร้าง Set ตัดข้อมูลซ้ำ', 'Create a Set to Remove Duplicates', 'กำหนดให้ `numbers = [1, 2, 2, 3, 4, 4, 5]` ให้นักเรียนแปลง List นี้ให้เป็น Set เพื่อตัดเลขที่ซ้ำกันออก แล้วพิมพ์ Set นั้นออกมา (หมายเหตุ: ลำดับใน Set อาจสลับกันได้ แต่ในเทสเคสให้เทียบผลลัพธ์ที่เป็น Set)', 'Given `numbers = [1, 2, 2, 3, 4, 4, 5]`, convert this List into a Set to remove the duplicate numbers, then print that Set. (Note: the order of items in a Set may vary, but the test case compares the result as a Set.)', NULL, NULL, 'numbers = [1, 2, 2, 3, 4, 4, 5]
# แปลงเป็น set แล้ว print
', 'numbers = [1, 2, 2, 3, 4, 4, 5]
print(set(numbers))', 'stdio', '[{"input": "", "expected": "{1, 2, 3, 4, 5}"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:25:33.36894', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (139, 'Mini 3: รับตัวเลขแล้วสะท้อนผล', 'Mini 3: Receive a Number and Reflect the Result', 'รับตัวเลข 1 ค่า แล้วแสดง "เลขที่เลือกคือ <ตัวเลข>"', 'Receive 1 number value, then display "เลขที่เลือกคือ <number>"', NULL, NULL, 'number = input("เลือกเลข: ")
print("เลขที่เลือกคือ", number)', 'number = input("เลือกเลข: ")
print("เลขที่เลือกคือ", number)', 'stdio', '[{"input": "7", "expected": "เลขที่เลือกคือ 7"}, {"input": "21", "expected": "เลขที่เลือกคือ 21"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:08:57.830524', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (46, 'ยูเนียนเซต (Union)', 'Set Union', 'กำหนดให้ `set_a = {1, 2, 3}` และ `set_b = {3, 4, 5}` ให้นักเรียนใช้คำสั่ง Union (หรือเครื่องหมาย `|`) รวม Set ทั้งสองเข้าด้วยกัน แล้วพิมพ์ผลลัพธ์', 'Given `set_a = {1, 2, 3}` and `set_b = {3, 4, 5}`, use the Union command (or the `|` operator) to combine both Sets together, then print the result.', NULL, NULL, 'set_a = {1, 2, 3}
set_b = {3, 4, 5}
# ยูเนียนเซตแล้ว print
', 'set_a = {1, 2, 3}
set_b = {3, 4, 5}
print(set_a | set_b)', 'stdio', '[{"input": "", "expected": "{1, 2, 3, 4, 5}"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:25:33.374912', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (172, 'นับจำนวนสระ (Count Vowels)', 'Count Vowels', 'เขียนฟังก์ชัน "count_vowels(s)" คืนค่าจำนวนสระ (a, e, i, o, u) ในข้อความ', 'Write a function "count_vowels(s)" returning the count of vowels.', 'in ใช้ถามว่ามีอยู่ในสตริงไหม เช่น char in vowels และ .lower() ทำให้ตัวพิมพ์ใหญ่นับด้วย ไม่งั้น "A" จะหลุด', 'in asks whether something is present: char in vowels. Use .lower() so capitals count too, otherwise "A" slips through.', 'def count_vowels(s):
    vowels = "aeiou"
    count = 0
    for char in s:
        # TODO: ถ้า char.lower() อยู่ใน vowels ให้ count เพิ่มขึ้น 1
        pass
    return count', 'def count_vowels(s):
    vowels = "aeiou"
    count = 0
    for char in s:
        if char.lower() in vowels:
            count += 1
    return count', 'function', '[{"args": ["hello world"], "expected": 3}, {"args": ["arcade"], "expected": 3}, {"args": [""], "expected": 0}, {"args": ["xyz"], "expected": 0}, {"args": ["AEIOU"], "expected": 5}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.753361', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (188, 'กักเก็บน้ำฝน (Trapping Rain Water)', 'Trapping Rain Water', 'เขียนฟังก์ชัน "trap(height)" คำนวณปริมาณน้ำฝนที่ขังอยู่ระหว่างความสูงของแท่งกราฟ', 'Write a function "trap(height)" calculating total trapped rainwater.', 'น้ำที่ขังบนแต่ละช่องคือ ความสูงกำแพงที่เตี้ยกว่าในสองฝั่ง ลบ ความสูงพื้นช่องนั้น เพราะเดินจากฝั่งที่กำแพงเตี้ยกว่าเสมอ left_max/right_max จึงเป็นตัวจำกัดอยู่แล้ว น้ำจึงไม่เคยติดลบ', 'Water above a cell is the shorter of the two side walls minus that cell''s own height. Because you always advance from the shorter wall, left_max/right_max are already the limiting one — so the amount is never negative.', 'def trap(height):
    if not height:
        return 0
    l, r = 0, len(height) - 1
    left_max, right_max = height[l], height[r]
    water = 0
    while l < r:
        if left_max < right_max:
            l += 1
            left_max = max(left_max, height[l])
            # TODO: น้ำที่ขังตรงนี้คือ left_max - height[l] — บวกเข้ากับ water
        else:
            r -= 1
            right_max = max(right_max, height[r])
            # TODO: ทำแบบเดียวกันจากฝั่งขวา (right_max - height[r])
    return water', 'def trap(height):
    if not height:
        return 0
    l, r = 0, len(height) - 1
    left_max, right_max = height[l], height[r]
    water = 0
    while l < r:
        if left_max < right_max:
            l += 1
            left_max = max(left_max, height[l])
            water += left_max - height[l]
        else:
            r -= 1
            right_max = max(right_max, height[r])
            water += right_max - height[r]
    return water', 'function', '[{"args": [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]], "expected": 6}, {"args": [[]], "expected": 0}, {"args": [[4, 2, 3]], "expected": 1}, {"args": [[3, 0, 3]], "expected": 3}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.868371', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (2, 'ยินดีต้อนรับสู่โลกโปรแกรมมิ่ง', 'Welcome to the World of Programming', 'ให้นักเรียนใช้ฟังก์ชัน print() สองครั้ง เพื่อแสดงข้อความบรรทัดแรกว่า "Welcome to Python" และบรรทัดที่สองว่า "Happy Coding"', 'Have the student use the print() function twice to display the message "Welcome to Python" on the first line and "Happy Coding" on the second line', NULL, NULL, '# บรรทัดแรก: Welcome to Python
# บรรทัดที่สอง: Happy Coding
', 'print("Welcome to Python")
print("Happy Coding")', 'stdio', '[{"input": "", "expected": "Welcome to Python\nHappy Coding"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:10:29.961991', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (3, 'การคำนวณเบื้องต้น', 'Basic Calculation', 'ให้นักเรียนใช้ฟังก์ชัน print() คำนวณผลบวกของ 15 + 25 แล้วแสดงผลลัพธ์ออกมาเป็นตัวเลข', 'Have the student use the print() function to calculate the sum of 15 + 25 and display the result as a number', NULL, NULL, '# คำนวณผลบวก 15 + 25
', 'print(15 + 25)', 'stdio', '[{"input": "", "expected": "40"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:10:29.966334', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (4, 'ทักทายภาษาไทย', 'Thai Greeting', 'ให้นักเรียนเขียนโปรแกรมแสดงข้อความภาษาไทยว่า "ยินดีต้อนรับสู่บทเรียน Python"', 'Have the student write a program that displays the Thai message "ยินดีต้อนรับสู่บทเรียน Python"', NULL, NULL, '# เขียนโค้ดแสดงข้อความภาษาไทยที่นี่
', 'print("ยินดีต้อนรับสู่บทเรียน Python")', 'stdio', '[{"input": "", "expected": "ยินดีต้อนรับสู่บทเรียน Python"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:10:29.972225', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (5, 'ขึ้นบรรทัดใหม่ด้วย \n', 'New Line with \n', 'ให้นักเรียนใช้ฟังก์ชัน print() เพียงครั้งเดียวร่วมกับอักขระพิเศษ \n เพื่อแสดงข้อความ "Line 1" และ "Line 2" คนละบรรทัด', 'Have students use the print() function only once together with the special character \n to display the text "Line 1" and "Line 2" on separate lines', NULL, NULL, '# ใช้ print() คำสั่งเดียวในการพิมพ์ 2 บรรทัด
', 'print("Line 1\nLine 2")', 'stdio', '[{"input": "", "expected": "Line 1\nLine 2"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:10:58.520101', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (6, 'จัดรูปแบบเลขทศนิยม', 'Formatting Decimal Numbers', 'กำหนดให้ `pi = 3.14159` ให้นักเรียนพิมพ์ค่า `pi` ออกมาโดยจัดรูปแบบให้แสดงทศนิยมเพียง 2 ตำแหน่ง (`:.2f`)', 'Given `pi = 3.14159`, have students print the value of `pi` formatted to display only 2 decimal places (`:.2f`)', NULL, NULL, 'pi = 3.14159
# พิมพ์ค่า pi ให้แสดงทศนิยม 2 ตำแหน่งด้วย f-string
', 'pi = 3.14159
print(f"{pi:.2f}")', 'stdio', '[{"input": "", "expected": "3.14"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:10:58.530906', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (7, 'ใส่คอมม่าคั่นหลักพัน', 'Adding Thousand Separators', 'กำหนดให้ `money = 1500000` ให้นักเรียนพิมพ์ค่าตัวเลขดังกล่าวโดยใช้ฟอร์แมตคอมม่าคั่นหลักพัน (`:,`)', 'Given `money = 1500000`, have students print this number using comma formatting for thousand separators (`:,`)', NULL, NULL, 'money = 1500000
# พิมพ์ตัวเลขพร้อมคอมม่าคั่นหลักพัน
', 'money = 1500000
print(f"{money:,}")', 'stdio', '[{"input": "", "expected": "1,500,000"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:10:58.533857', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (8, 'จัดรูปแบบเปอร์เซ็นต์', 'Formatting Percentages', 'กำหนดให้ `score = 0.857` ให้นักเรียนพิมพ์ค่าตัวเลขนี้ให้อยู่ในรูปเปอร์เซ็นต์ที่แสดงทศนิยม 1 ตำแหน่ง (ใช้ฟอร์แมต `:.1%`)', 'Given `score = 0.857`, have students print this number as a percentage displaying 1 decimal place (use the format `:.1%`)', NULL, NULL, 'score = 0.857
# แปลงเป็นเปอร์เซ็นต์และแสดงทศนิยม 1 ตำแหน่ง
', 'score = 0.857
print(f"{score:.1%}")', 'stdio', '[{"input": "", "expected": "85.7%"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:10:58.536928', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (9, 'การจัดตำแหน่งข้อความ (Alignment)', 'Text Alignment', 'กำหนดให้ `text = "Python"` ให้นักเรียนจัดข้อความให้มีความกว้าง 10 ช่องและจัดชิดขวา (`>10`) แล้วพิมพ์ออกมา', 'Given `text = "Python"`, have the student align the text to a width of 10 characters, right-aligned (`>10`), then print it out.', NULL, NULL, 'text = "Python"
# จัดข้อความชิดขวาความกว้าง 10 ช่อง
', 'text = "Python"
print(f"{text:>10}")', 'stdio', '[{"input": "", "expected": "    Python"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:13:10.506165', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (47, 'แปลงเป็นตัวพิมพ์ใหญ่', 'Convert to Uppercase', 'กำหนดให้ `text = "python programming"` ให้นักเรียนใช้เมธอด `.upper()` แปลงข้อความให้เป็นตัวพิมพ์ใหญ่ทั้งหมด แล้วพิมพ์ผลลัพธ์', 'Given `text = "python programming"`, use the `.upper()` method to convert the text to all uppercase letters, then print the result.', NULL, NULL, 'text = "python programming"
# แปลงเป็นตัวพิมพ์ใหญ่แล้ว print
', 'text = "python programming"
print(text.upper())', 'stdio', '[{"input": "", "expected": "PYTHON PROGRAMMING"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:25:33.380386', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (48, 'นับความยาวข้อความ', 'Count Text Length', 'รับค่าข้อความ 1 บรรทัดจากผู้ใช้ เก็บไว้ในตัวแปร `msg` แล้วใช้ฟังก์ชัน `len()` หาความยาวของข้อความนั้น จากนั้นพิมพ์ผลลัพธ์ออกมา', 'Receive one line of text from the user, store it in the variable `msg`, then use the `len()` function to find the length of that text, and then print the result.', NULL, NULL, 'msg = input()
# หาความยาวของ msg แล้ว print
', 'msg = input()
print(len(msg))', 'stdio', '[{"input": "Hello World", "expected": "11"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:25:33.383968', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (49, 'ตัดช่องว่างรอบข้อความ', 'Trim Whitespace Around Text', 'กำหนดให้ `raw_text = "   Hello Python!   "` ให้นักเรียนใช้เมธอด `.strip()` เพื่อตัดช่องว่างหัวและท้ายออก แล้วพิมพ์ผลลัพธ์', 'Given `raw_text = "   Hello Python!   "`, have the student use the `.strip()` method to remove leading and trailing whitespace, then print the result.', NULL, NULL, 'raw_text = "   Hello Python!   "
# ตัดช่องว่างแล้ว print
', 'raw_text = "   Hello Python!   "
print(raw_text.strip())', 'stdio', '[{"input": "", "expected": "Hello Python!"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:25:46.995321', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (50, 'แยกข้อความด้วย Split', 'Splitting Text with Split', 'รับค่าข้อความประโยคสั้นๆ ที่คั่นด้วยช่องว่าง (เช่น "Python is fun") ให้นักเรียนใช้ `.split()` แยกคำเก็บเป็น List แล้วพิมพ์ List นั้นออกมา', 'Receive a short sentence where words are separated by spaces (such as "Python is fun"). Have the student use `.split()` to split the words and store them as a List, then print that List out.', NULL, NULL, 'sentence = input()
# แยกคำด้วย split แล้ว print
', 'sentence = input()
print(sentence.split())', 'stdio', '[{"input": "Python is fun", "expected": "[''Python'', ''is'', ''fun'']"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:25:49.023508', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (125, 'บทสรุปสายวิชาการ 1A_2B', 'Academic Path Summary 1A_2B', 'ยินดีด้วยคุณมาถึงจุดสิ้นสุดของสาย 1A_2B แล้ว พิมพ์ print("success") เพื่อจบด่าน', 'Congratulations, you''ve reached the end of path 1A_2B. Type print("success") to finish the level.', NULL, NULL, 'print("")', 'print("success")', 'stdio', '[]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:07:00.169013', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (10, 'จัดรูปแบบข้อมูลใบเสร็จ', 'Formatting Receipt Data', 'กำหนดให้ `item = "Book"`, `price = 299.5` ให้นักเรียนพิมพ์ข้อความแสดงสินค้าและราคา โดยจัดราคาให้แสดงทศนิยม 2 ตำแหน่ง และมีความกว้างอย่างน้อย 8 ช่อง (`:>8.2f`) ในรูปแบบ `Item: Book, Price:   299.50`', 'Given `item = "Book"` and `price = 299.5`, have the student print text showing the item and its price, formatting the price to display 2 decimal places with a minimum width of 8 characters (`:>8.2f`) in the format `Item: Book, Price:   299.50`.', NULL, NULL, 'item = "Book"
price = 299.5
# พิมพ์รูปแบบ Item: [item], Price: [price จัดฟอร์แมต]
', 'item = "Book"
price = 299.5
print(f"Item: {item}, Price: {price:>8.2f}")', 'stdio', '[{"input": "", "expected": "Item: Book, Price:   299.50"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:13:10.513815', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (11, 'รับค่าและหาเศษจากการหาร', 'Reading Input and Finding the Remainder', 'ให้นักเรียนรับค่าตัวเลขสองจำนวน (แปลงเป็น int) เก็บในตัวแปร `a` และ `b` จากนั้นคำนวณหาเศษจากการหาร `a % b` แล้วพิมพ์ผลลัพธ์ออกมา', 'Have the student read two numbers (converted to int) and store them in variables `a` and `b`. Then calculate the remainder of the division `a % b` and print the result.', NULL, NULL, 'a = int(input())
b = int(input())
# คำนวณหาเศษ a % b และ print ผลลัพธ์
', 'a = int(input())
b = int(input())
print(a % b)', 'stdio', '[{"input": "17\n5", "expected": "2"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:13:10.516555', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (12, 'คำนวณยกกำลังและการหารปัดเศษจาก Input', 'Exponentiation and Floor Division from Input', 'ให้นักเรียนรับค่าตัวเลข 4 จำนวน (แปลงเป็น int) สำหรับฐาน, เลขชี้กำลัง, ตัวตั้ง และตัวหาร บรรทัดแรกพิมพ์ผลลัพธ์ยกกำลัง และบรรทัดที่สองพิมพ์ผลลัพธ์การหารปัดเศษ', 'Have the student read 4 numbers (converted to int) for the base, exponent, dividend, and divisor. On the first line, print the result of the exponentiation, and on the second line, print the result of the floor division.', NULL, NULL, 'base = int(input())
exp = int(input())
num1 = int(input())
num2 = int(input())
# บรรทัดแรก: print(base ** exp)
# บรรทัดที่สอง: print(num1 // num2)
', 'base = int(input())
exp = int(input())
num1 = int(input())
num2 = int(input())
print(base ** exp)
print(num1 // num2)', 'stdio', '[{"input": "2\n4\n19\n4", "expected": "16\n4"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:13:10.519938', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (13, 'รับค่าและตรวจสอบการเปรียบเทียบ', 'Receiving Input and Checking Comparisons', 'ให้นักเรียนรับค่าตัวเลขสองจำนวน (แปลงเป็น int) เก็บในตัวแปร `x` และ `y` จากนั้นพิมพ์ผลลัพธ์การเปรียบเทียบว่า `x <= y` ออกมา', 'Have the student receive two numbers (convert them to int) and store them in the variables `x` and `y`. Then print the result of the comparison `x <= y`.', NULL, NULL, 'x = int(input())
y = int(input())
# print ผลลัพธ์การเปรียบเทียบ x <= y
', 'x = int(input())
y = int(input())
print(x <= y)', 'stdio', '[{"input": "15\n20", "expected": "True"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:16:38.172663', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (14, 'รับค่าและใช้งานตรรกศาสตร์ and, or', 'Receiving Input and Using Logical Operators and, or', 'ให้นักเรียนรับค่าข้อความ "True" หรือ "False" สองค่าแปลงเป็น boolean เก็บใน `a` และ `b` บรรทัดแรกพิมพ์ `a and b` บรรทัดที่สองพิมพ์ `a or b` (ใช้ `input() == "True"`)', 'Have the student receive two text values, "True" or "False", convert them to booleans, and store them in `a` and `b`. On the first line, print `a and b`. On the second line, print `a or b`. (Use `input() == "True"`.)', NULL, NULL, 'a = input() == "True"
b = input() == "True"
# บรรทัดแรก: print(a and b)
# บรรทัดที่สอง: print(a or b)
', 'a = input() == "True"
b = input() == "True"
print(a and b)
print(a or b)', 'stdio', '[{"input": "True\nFalse", "expected": "False\nTrue"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:16:38.18225', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (15, 'คำนวณสะสมด้วย Operator จาก Input', 'Cumulative Calculation with Operators from Input', 'ให้นักเรียนรับค่าตัวเลขเริ่มต้น (แปลงเป็น int) เก็บในตัวแปร `total` จากนั้นใช้ `+= 50` และ `*= 2` แล้วพิมพ์ค่า `total` ออกมา', 'Have the student receive an initial number (convert it to int) and store it in the variable `total`. Then use `+= 50` and `*= 2`, and print the value of `total`.', NULL, NULL, 'total = int(input())
# 1. ใช้ += เพิ่มค่า 50
# 2. ใช้ *= คูณ 2
# print(total)
', 'total = int(input())
total += 50
total *= 2
print(total)', 'stdio', '[{"input": "100", "expected": "300"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:16:38.184855', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (16, 'รับชื่อผู้ใช้งาน', 'Receiving a Username', 'ให้นักเรียนใช้ฟังก์ชัน input() รับค่าชื่อของผู้ใช้งานเก็บไว้ในตัวแปร name แล้วพิมพ์ข้อความ "Hello, [name]"', 'Have the student use the input() function to receive the user''s name and store it in the variable name, then print the message "Hello, [name]"', NULL, NULL, '# รับค่าชื่อเก็บไว้ใน name
# พิมพ์ Hello, name
', 'name = input()
print(f"Hello, {name}")', 'stdio', '[{"input": "PySim", "expected": "Hello, PySim"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:16:38.188064', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (17, 'รับค่าตัวเลข', 'Receiving a Number', 'ให้นักเรียนรับค่าอายุ (เป็นตัวเลข) เข้ามาในตัวแปร age แล้วแสดงข้อความ "Next year you will be [age+1]"', 'Have the student receive an age (as a number) into the variable age, then display the message "Next year you will be [age+1]"', NULL, NULL, '# รับค่า age (แปลงเป็น int)
# คำนวณ age + 1 แล้วแสดงผล
', 'age = int(input())
print(f"Next year you will be {age + 1}")', 'stdio', '[{"input": "20", "expected": "Next year you will be 21"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:18:27.969556', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (18, 'รับค่าวันเกิด', 'Receiving a Birthday', 'ให้นักเรียนรับค่าวันและเดือนที่เกิดพร้อมกันโดยคั่นด้วยช่องว่าง (เช่น 15 10) เก็บไว้ในตัวแปร day และ month แล้วแสดงผล "Your birthday is [day]/[month]"', 'Have the student receive the day and month of birth together, separated by a space (e.g., 15 10), store them in the variables day and month, then display "Your birthday is [day]/[month]"', NULL, NULL, '# รับค่าด้วย input().split()
# แสดงผล Day/Month
', 'day, month = input().split()
print(f"Your birthday is {day}/{month}")', 'stdio', '[{"input": "15 10", "expected": "Your birthday is 15/10"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:18:27.97746', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (19, 'คำนวณราคาสินค้า', 'Calculating Product Price', 'ให้นักเรียนรับค่าราคาสินค้า (ทศนิยม) เข้ามาในตัวแปร price แล้วแสดงผลลัพธ์ราคารวมเมื่อบวก VAT 7% ([price * 1.07])', 'Have the student receive a product price (a decimal) into the variable price, then display the resulting total price after adding 7% VAT ([price * 1.07])', NULL, NULL, '# รับค่า price เป็น float
# คำนวณ price * 1.07 แล้วแสดงผล
', 'price = float(input())
print(price * 1.07)', 'stdio', '[{"input": "100", "expected": "107.0"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:18:27.980437', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (20, 'คำนวณอายุจากปี พ.ศ.', 'Calculating Age from Buddhist Era Year', 'รับค่าปี พ.ศ. ที่เกิดเข้ามาเป็นตัวแปร birth_year แล้วคำนวณอายุ (ให้ถือว่าปีปัจจุบันคือ 2569) แสดงผล "You are [2569 - birth_year] years old"', 'Receive the birth year in Buddhist Era into the variable birth_year, then calculate the age (assume the current year is 2569) and display "You are [2569 - birth_year] years old"', NULL, NULL, '# รับค่า birth_year เป็น int
# คำนวณอายุและแสดงผล
', 'birth_year = int(input())
print(f"You are {2569 - birth_year} years old")', 'stdio', '[{"input": "2540", "expected": "You are 29 years old"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:18:27.983895', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (21, 'ตรวจสอบเลขบวก', 'Check Positive Number', 'ให้นักเรียนรับค่าตัวเลข x ถ้า x มากกว่า 0 ให้พิมพ์ "Positive"', 'Have the student receive a number x. If x is greater than 0, print "Positive"', NULL, NULL, 'x = int(input())
# เขียนเงื่อนไข if x > 0
', 'x = int(input())
if x > 0:
    print("Positive")', 'stdio', '[{"input": "10", "expected": "Positive"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:19:35.412327', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (22, 'เลขคู่หรือเลขคี่', 'Even or Odd', 'รับค่าเลขจำนวนเต็ม x ถ้า x หารด้วย 2 ลงตัวให้พิมพ์ "Even" ถ้าไม่ลงตัวให้พิมพ์ "Odd"', 'Receive an integer x. If x is divisible by 2, print "Even". If not, print "Odd"', NULL, NULL, 'x = int(input())
# ใช้ if-else ตรวจสอบเลขคู่หรือคี่
', 'x = int(input())
if x % 2 == 0:
    print("Even")
else:
    print("Odd")', 'stdio', '[{"input": "7", "expected": "Odd"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:19:35.420652', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (23, 'โปรแกรมตัดเกรด', 'Grading Program', 'รับคะแนน score ถ้า score >= 50 พิมพ์ "Pass" ถ้า score < 50 พิมพ์ "Fail"', 'Receive a score. If score >= 50, print "Pass". If score < 50, print "Fail"', NULL, NULL, 'score = int(input())
# ใช้ if-else ตัดเกรด
', 'score = int(input())
if score >= 50:
    print("Pass")
else:
    print("Fail")', 'stdio', '[{"input": "45", "expected": "Fail"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:19:35.428475', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (1, 'ทักทายด้วย Python', 'Greeting with Python', 'ให้นักเรียนเขียนโปรแกรมแสดงข้อความ "Hello, Python!" ออกทางหน้าจอด้วยฟังก์ชัน print()', 'Have the student write a program that displays the message "Hello, Python!" on the screen using the print() function', NULL, NULL, '# เขียนโค้ดแสดงข้อความ Hello, Python! ด้านล่างนี้
', 'print("Hello, Python!")', 'stdio', '[{"input": "", "expected": "Hello, Python!"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:10:29.955157', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (54, 'เขียนข้อความลงไฟล์', NULL, 'เปิดไฟล์ "output.txt" ในโหมดเขียน ("w") แล้วเขียนข้อความ "Learning Python" ลงไปในไฟล์ จากนั้นปิดไฟล์', NULL, NULL, NULL, '# เปิดไฟล์ output.txt โหมด "w"
# เขียนข้อความด้วย write() แล้วปิดไฟล์
', 'f = open("output.txt", "w")
f.write("Learning Python")
f.close()', 'stdio', '[{"input": "", "expected": ""}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (55, 'ใช้งาน Context Manager (with)', NULL, 'ให้นักเรียนใช้คำสั่ง `with open("note.txt", "w") as f:` เพื่อเขียนข้อความ "Python File I/O" ลงในไฟล์ โดยไม่ต้องเรียก `f.close()` เอง', NULL, NULL, NULL, '# ใช้ with open เขียนข้อความ "Python File I/O" ลงใน note.txt
', 'with open("note.txt", "w") as f:
    f.write("Python File I/O")', 'stdio', '[{"input": "", "expected": ""}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (56, 'ดักจับการหารด้วยศูนย์', NULL, 'รับค่าตัวเลขจำนวนเต็ม x จากนั้นพิมพ์ผลลัพธ์ของการหาร 10 ด้วย x โดยใช้ try...except เพื่อดักจับ ZeroDivisionError และพิมพ์ข้อความ "Error: Cannot divide by zero" หากเกิดข้อผิดพลาด', NULL, NULL, NULL, 'try:
    x = int(input())
    print(10 / x)
except ZeroDivisionError:
    # เขียนข้อความแจ้งเตือนที่นี่
', 'try:
    x = int(input())
    print(10 / x)
except ZeroDivisionError:
    print("Error: Cannot divide by zero")', 'stdio', '[{"input": "0", "expected": "Error: Cannot divide by zero"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (57, 'ดักจับการแปลงชนิดข้อมูล', NULL, 'รับข้อความเข้าสู่ตัวแปร พยายามแปลงเป็น int หากสำเร็จให้พิมพ์ค่านั้น หากเกิด ValueError ให้พิมพ์ข้อความ "Invalid number"', NULL, NULL, NULL, 'try:
    num = int(input())
    print(num)
except ValueError:
    # เขียนข้อความแจ้งเตือน
', 'try:
    num = int(input())
    print(num)
except ValueError:
    print("Invalid number")', 'stdio', '[{"input": "abc", "expected": "Invalid number"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (58, 'การใช้งานบล็อก else', NULL, 'รับค่าตัวเลข x ถ้าแปลงเป็น int สำเร็จ (ไม่มี error) ให้ทำงานในบล็อก `else` โดยพิมพ์คำว่า "Success: [x]" ถ้าแปลงไม่สำเร็จให้พิมพ์ "Error"', NULL, NULL, NULL, 'try:
    x = int(input())
except ValueError:
    print("Error")
else:
    # พิมพ์ Success และค่า x
', 'try:
    x = int(input())
except ValueError:
    print("Error")
else:
    print(f"Success: {x}")', 'stdio', '[{"input": "50", "expected": "Success: 50"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (59, 'การใช้งานบล็อก finally', NULL, 'รับค่า x แล้วพิมพ์ผลลัพธ์ 100 / x โดยไม่ว่าจะเกิด error หรือไม่ก็ตาม จะต้องพิมพ์คำว่า "Execution Complete" ในบล็อก `finally` เสมอ', NULL, NULL, NULL, 'try:
    x = int(input())
    print(100 / x)
except:
    print("Error occurred")
finally:
    # พิมพ์ Execution Complete
', 'try:
    x = int(input())
    print(100 / x)
except:
    print("Error occurred")
finally:
    print("Execution Complete")', 'stdio', '[{"input": "0", "expected": "Error occurred\nExecution Complete"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (60, 'จัดการ Error หลายประเภท', NULL, 'รับค่า x เป็นตัวเลข นำไปคำนวณ `50 / x` ใช้ try...except ดักจับทั้ง `ValueError` และ `ZeroDivisionError` โดยถ้าเกิด error ใดๆ ให้พิมพ์ "Invalid Input"', NULL, NULL, NULL, 'try:
    x = int(input())
    print(50 / x)
except (ValueError, ZeroDivisionError):
    # พิมพ์ Invalid Input
', 'try:
    x = int(input())
    print(50 / x)
except (ValueError, ZeroDivisionError):
    print("Invalid Input")', 'stdio', '[{"input": "abc", "expected": "Invalid Input"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (61, 'สร้าง Class และ Object', NULL, 'ให้นักเรียนสร้าง Class ชื่อ `Dog` และสร้าง Object ชื่อ `my_dog` จากนั้นใช้ print() แสดงชนิดของ Object นั้น (พิมพ์ `type(my_dog).__name__`)', NULL, NULL, NULL, '# สร้าง Class Dog
# สร้าง Object my_dog = Dog()
# print ชนิดของ Object
', 'class Dog:
    pass

my_dog = Dog()
print(type(my_dog).__name__)', 'stdio', '[{"input": "", "expected": "Dog"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (62, 'การใช้งาน Constructor (__init__)', NULL, 'สร้าง Class `Person` ที่มีคอนสตรัคเตอร์รับค่า `name` และ `age` เก็บไว้ในแอตทริบิวต์ จากนั้นสร้าง Object ชื่อ `p` ด้วยข้อมูล "John" และ 25 แล้วพิมพ์ค่า `p.name` ออกมา', NULL, NULL, NULL, 'class Person:
    def __init__(self, name, age):
        # กำหนด self.name และ self.age
        pass

# สร้าง Object และ print p.name
', 'class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

p = Person("John", 25)
print(p.name)', 'stdio', '[{"input": "", "expected": "John"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (63, 'สร้าง Method แสดงข้อมูล', NULL, 'สร้าง Class `Car` มี `brand` และ `model` ใน `__init__` และเพิ่มเมธอด `show_info(self)` ที่คืนค่าข้อความรูปแบบ `"[brand] [model]"` สร้าง Object คันหนึ่งแล้วเรียกใช้เมธอดนี้', NULL, NULL, NULL, 'class Car:
    def __init__(self, brand, model):
        self.brand = brand
        self.model = model
    
    def show_info(self):
        # return ข้อความยี่ห้อและรุ่น
        pass

car = Car("Toyota", "Camry")
print(car.show_info())', 'class Car:
    def __init__(self, brand, model):
        self.brand = brand
        self.model = model
    
    def show_info(self):
        return f"{self.brand} {self.model}"

car = Car("Toyota", "Camry")
print(car.show_info())', 'stdio', '[{"input": "", "expected": "Toyota Camry"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (64, 'คำนวณพื้นที่สี่เหลี่ยมด้วย OOP', NULL, 'สร้าง Class `Rectangle` รับค่า `width` และ `height` สร้างเมธอด `get_area(self)` ที่คำนวณพื้นที่ (width * height) สร้าง Object กว้าง 5 ยาว 4 แล้วพิมพ์พื้นที่ที่ได้', NULL, NULL, NULL, 'class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height
    
    def get_area(self):
        # คำนวณและ return พื้นที่
        pass

rect = Rectangle(5, 4)
print(rect.get_area())', 'class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height
    
    def get_area(self):
        return self.width * self.height

rect = Rectangle(5, 4)
print(rect.get_area())', 'stdio', '[{"input": "", "expected": "20"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (65, 'คลาสบัญชีธนาคาร', NULL, 'สร้าง Class `Account` รับค่า `balance` เริ่มต้น มีเมธอด `deposit(self, amount)` สำหรับบวกเงินเพิ่ม และ `get_balance(self)` สำหรับคืนค่าเงินคงเหลือ ทดลองสร้างบัญชีเงินเริ่มต้น 1000 ฝากเพิ่ม 500 แล้วพิมพ์ยอดเงินคงเหลือสุดท้าย', NULL, NULL, NULL, 'class Account:
    def __init__(self, balance):
        self.balance = balance
    
    def deposit(self, amount):
        self.balance += amount
        
    def get_balance(self):
        return self.balance

acc = Account(1000)
acc.deposit(500)
# print ยอดเงินคงเหลือ
', 'class Account:
    def __init__(self, balance):
        self.balance = balance
    
    def deposit(self, amount):
        self.balance += amount
        
    def get_balance(self):
        return self.balance

acc = Account(1000)
acc.deposit(500)
print(acc.get_balance())', 'stdio', '[{"input": "", "expected": "1500"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (66, 'สืบทอดคลาสพื้นฐาน', NULL, 'สร้างคลาสแม่ชื่อ `Animal` ที่มีเมธอด `eat(self)` คืนค่าข้อความ `"Eating..."` และสร้างคลาสลูกชื่อ `Dog` ที่สืบทอดจาก `Animal` จากนั้นสร้าง Object ของ `Dog` แล้วเรียกใช้เมธอด `eat()` ออกมาพิมพ์', NULL, NULL, NULL, 'class Animal:
    def eat(self):
        return "Eating..."

# สร้างคลาส Dog สืบทอดจาก Animal
# สร้าง object และ print ผลลัพธ์จากการเรียก eat()
', 'class Animal:
    def eat(self):
        return "Eating..."

class Dog(Animal):
    pass

dog = Dog()
print(dog.eat())', 'stdio', '[{"input": "", "expected": "Eating..."}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (67, 'การใช้ super() ใน Constructor', NULL, 'สร้างคลาสแม่ `Person` รับค่า `name` ใน `__init__` และคลาสลูก `Student` ที่ใช้ `super().__init__(name)` เพื่อสืบทอดค่า `name` สร้าง Student ชื่อ "Alice" แล้วพิมพ์ค่า `name` ออกมา', NULL, NULL, NULL, 'class Person:
    def __init__(self, name):
        self.name = name

class Student(Person):
    def __init__(self, name, school):
        # ใช้ super() เรียก __init__ ของคลาสแม่
        pass

s = Student("Alice", "HighSchool")
print(s.name)', 'class Person:
    def __init__(self, name):
        self.name = name

class Student(Person):
    def __init__(self, name, school):
        super().__init__(name)
        self.school = school

s = Student("Alice", "HighSchool")
print(s.name)', 'stdio', '[{"input": "", "expected": "Alice"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (68, 'เพิ่มเมธอดใหม่ในคลาสลูก', NULL, 'สร้างคลาสแม่ `Vehicle` มีแอตทริบิวต์ `brand` และคลาสลูก `Car` ที่เพิ่มเมธอด `drive(self)` คืนค่าข้อความ `"[brand] is driving"` สร้าง Car ยี่ห้อ "Honda" แล้วเรียกใช้เมธอด `drive()`', NULL, NULL, NULL, 'class Vehicle:
    def __init__(self, brand):
        self.brand = brand

class Car(Vehicle):
    def drive(self):
        # return ข้อความตามรูปแบบ
        pass

car = Car("Honda")
print(car.drive())', 'class Vehicle:
    def __init__(self, brand):
        self.brand = brand

class Car(Vehicle):
    def drive(self):
        return f"{self.brand} is driving"

car = Car("Honda")
print(car.drive())', 'stdio', '[{"input": "", "expected": "Honda is driving"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (69, 'การเขียนทับเมธอด (Overriding)', NULL, 'สร้างคลาสแม่ `Bird` มีเมธอด `speak(self)` คืนค่า `"Chirp"` และคลาสลูก `Duck` ที่เขียนทับเมธอด `speak(self)` ให้คืนค่า `"Quack"` สร้าง Duck แล้วพิมพ์ผลลัพธ์การเรียก `speak()`', NULL, NULL, NULL, 'class Bird:
    def speak(self):
        return "Chirp"

class Duck(Bird):
    # โอเวอร์ไรด์เมธอด speak
    pass

duck = Duck()
print(duck.speak())', 'class Bird:
    def speak(self):
        return "Chirp"

class Duck(Bird):
    def speak(self):
        return "Quack"

duck = Duck()
print(duck.speak())', 'stdio', '[{"input": "", "expected": "Quack"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (93, 'สร้าง DataFrame', NULL, 'ให้นักเรียน import ไลบรารี `pandas` เป็น `pd` แล้วสร้าง DataFrame จาก Dictionary ที่มีคอลัมน์ `"Name"` (ค่าคือ ["Alice", "Bob"]) และ `"Age"` (ค่าคือ [20, 22]) เก็บไว้ในตัวแปร `df` จากนั้นพิมพ์ DataFrame ออกมา', NULL, NULL, NULL, 'import pandas as pd
# สร้าง df จาก Dictionary และ print
', 'import pandas as pd
data = {"Name": ["Alice", "Bob"], "Age": [20, 22]}
df = pd.DataFrame(data)
print(df)', 'stdio', '[{"input": "", "expected": "    Name  Age\n0  Alice   20\n1    Bob   22"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (71, 'ระบบเงินเดือนพนักงาน', NULL, 'สร้างคลาสแม่ `Employee` รับค่า `salary` และคลาสลูก `Manager` ที่โอเวอร์ไรด์เมธอด `get_salary(self)` ให้คืนค่าเงินเดือนบวกโบนัสเพิ่มอีก 5000 สร้าง Manager ที่มีเงินเดือนเริ่มต้น 30000 แล้วพิมพ์ผลลัพธ์เงินเดือนรวม', NULL, NULL, NULL, 'class Employee:
    def __init__(self, salary):
        self.salary = salary
    
    def get_salary(self):
        return self.salary

class Manager(Employee):
    def get_salary(self):
        # คืนค่า salary + 5000
        pass

mgr = Manager(30000)
print(mgr.get_salary())', 'class Employee:
    def __init__(self, salary):
        self.salary = salary
    
    def get_salary(self):
        return self.salary

class Manager(Employee):
    def get_salary(self):
        return self.salary + 5000

mgr = Manager(30000)
print(mgr.get_salary())', 'stdio', '[{"input": "", "expected": "35000"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (72, 'รากที่สองด้วย math', NULL, 'ให้นักเรียน import โมดูล `math` แล้วใช้ฟังก์ชัน `math.sqrt()` คำนวณหารากที่สองของ 81 จากนั้นพิมพ์ผลลัพธ์ออกมา', NULL, NULL, NULL, 'import math
# ใช้ math.sqrt(81) แล้ว print ผลลัพธ์
', 'import math
print(math.sqrt(81))', 'stdio', '[{"input": "", "expected": "9.0"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (73, 'คำนวณเส้นรอบวงกลม', NULL, 'กำหนดให้รัศมี `r = 7` ให้นักเรียน import โมดูล `math` แล้วคำนวณหาเส้นรอบวงกลมจากสูตร `2 * math.pi * r` แล้วพิมพ์ผลลัพธ์ (จะได้ค่าประมาณ)', NULL, NULL, NULL, 'import math
r = 7
# คำนวณเส้นรอบวงและ print
', 'import math
r = 7
print(2 * math.pi * r)', 'stdio', '[{"input": "", "expected": "43.982297150257104"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (76, 'ดึงปีปัจจุบันด้วย datetime', NULL, 'ให้นักเรียน import โมดูล `datetime` แล้วใช้ `datetime.date.today().year` เพื่อดึงปี ค.ศ. ปัจจุบันออกมาแสดงผล (ในเทสเคสอิงปีปัจจุบัน 2026)', NULL, NULL, NULL, 'import datetime
# ดึงปี ค.ศ. ปัจจุบันแล้ว print
', 'import datetime
print(datetime.date.today().year)', 'stdio', '[{"input": "", "expected": "2026"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (77, 'เชื่อมต่อ SQLite', NULL, 'import sqlite3 แล้วสร้างการเชื่อมต่อกับฐานข้อมูลในหน่วยความจำโดยใช้ sqlite3.connect(":memory:") เก็บไว้ในตัวแปร conn จากนั้นปิดการเชื่อมต่อ', NULL, NULL, NULL, 'import sqlite3
# เชื่อมต่อฐานข้อมูลด้วย ":memory:"
# ปิดการเชื่อมต่อด้วย conn.close()
', 'import sqlite3
conn = sqlite3.connect(":memory:")
conn.close()', 'stdio', '[{"input": "", "expected": ""}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (78, 'สร้างตารางใน SQLite', NULL, 'เชื่อมต่อฐานข้อมูลในหน่วยความจำ สร้าง Cursor ชื่อ cursor แล้วใช้คำสั่ง SQL สร้างตารางชื่อ users ที่มีคอลัมน์ id (INTEGER) และ name (TEXT)', NULL, NULL, NULL, 'import sqlite3
conn = sqlite3.connect(":memory:")
cursor = conn.cursor()
# สร้างตาราง users(id INTEGER, name TEXT)
', 'import sqlite3
conn = sqlite3.connect(":memory:")
cursor = conn.cursor()
cursor.execute("CREATE TABLE users (id INTEGER, name TEXT)")
conn.close()', 'stdio', '[{"input": "", "expected": ""}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (79, 'เพิ่มข้อมูลลงในตาราง', NULL, 'สร้างตาราง users และเพิ่มข้อมูล (1, Alice) ลงไป จากนั้นบันทึกการเปลี่ยนแปลงด้วย conn.commit()', NULL, NULL, NULL, 'import sqlite3
conn = sqlite3.connect(":memory:")
cursor = conn.cursor()
cursor.execute("CREATE TABLE users (id INTEGER, name TEXT)")
# INSERT ข้อมูลและ commit()
', 'import sqlite3
conn = sqlite3.connect(":memory:")
cursor = conn.cursor()
cursor.execute("CREATE TABLE users (id INTEGER, name TEXT)")
cursor.execute("INSERT INTO users VALUES (1, ''Alice'')")
conn.commit()
conn.close()', 'stdio', '[{"input": "", "expected": ""}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (80, 'รัน Async ด้วย asyncio.run', NULL, 'สร้างฟังก์ชัน `main()` ที่พิมพ์คำว่า "Running" จากนั้นเรียกใช้งานฟังก์ชันนี้ผ่านคำสั่ง `asyncio.run(main())`', NULL, NULL, NULL, 'import asyncio

async def main():
    print("Running")

# เรียกใช้ asyncio.run(main())
', 'import asyncio

async def main():
    print("Running")

asyncio.run(main())', 'stdio', '[{"input": "", "expected": "Running"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (81, 'ค้นหาข้อมูลด้วยเงื่อนไข', NULL, 'เพิ่มข้อมูลผู้ใช้ 2 คนลงในตาราง users จากนั้นใช้คำสั่ง SQL ค้นหาเฉพาะชื่อของคนที่ id = 2 แล้วพิมพ์ผลลัพธ์ออกมา', NULL, NULL, NULL, 'import sqlite3
conn = sqlite3.connect(":memory:")
cursor = conn.cursor()
cursor.execute("CREATE TABLE users (id INTEGER, name TEXT)")
cursor.execute("INSERT INTO users VALUES (1, ''Charlie'')")
cursor.execute("INSERT INTO users VALUES (2, ''David'')")
# SELECT name จาก users โดยที่ id = 2 แล้ว print
', 'import sqlite3
conn = sqlite3.connect(":memory:")
cursor = conn.cursor()
cursor.execute("CREATE TABLE users (id INTEGER, name TEXT)")
cursor.execute("INSERT INTO users VALUES (1, ''Charlie'')")
cursor.execute("INSERT INTO users VALUES (2, ''David'')")
cursor.execute("SELECT name FROM users WHERE id = 2")
print(cursor.fetchone()[0])
conn.close()', 'stdio', '[{"input": "", "expected": "David"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (82, 'สร้างหน้าต่างหลัก', NULL, 'ให้นักเรียน import tkinter และสร้างหน้าต่างหลัก (root window) ด้วย `root = tkinter.Tk()` จากนั้นตั้งชื่อหน้าต่างด้วย `root.title("My App")` (สามารถใช้ tkinter หรือ tk ตามความสะดวก)', NULL, NULL, NULL, 'import tkinter as tk
# สร้าง root window และกำหนด title("My App")
', 'import tkinter as tk
root = tk.Tk()
root.title("My App")', 'stdio', '[{"input": "", "expected": ""}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (83, 'สร้างปุ่มกด', NULL, 'สร้างหน้าต่างหลัก และสร้างปุ่ม (Button) บนหน้าต่าง โดยกำหนดข้อความบนปุ่มว่า "Click Me" และใช้ `.pack()` เพื่อแสดงผลปุ่มลงบนหน้าต่าง', NULL, NULL, NULL, 'import tkinter as tk
root = tk.Tk()
# สร้างปุ่ม Button(root, text="Click Me") และ pack()
', 'import tkinter as tk
root = tk.Tk()
btn = tk.Button(root, text="Click Me")
btn.pack()', 'stdio', '[{"input": "", "expected": ""}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (84, 'แสดงข้อความ Label', NULL, 'สร้างหน้าต่างหลัก และสร้าง Label แสดงข้อความ "Hello, Tkinter!" บนหน้าต่าง พร้อมทั้งใช้ `.pack()` จัดวางลงในหน้าต่าง', NULL, NULL, NULL, 'import tkinter as tk
root = tk.Tk()
# สร้าง Label แสดงข้อความ "Hello, Tkinter!" แล้ว pack()
', 'import tkinter as tk
root = tk.Tk()
lbl = tk.Label(root, text="Hello, Tkinter!")
lbl.pack()', 'stdio', '[{"input": "", "expected": ""}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (85, 'รับข้อความด้วย Entry', NULL, 'สร้างหน้าต่างหลัก และสร้างช่องรับข้อมูล (Entry) ชื่อตัวแปร `entry` บนหน้าต่างหลัก พร้อมใช้ `.pack()` เพื่อแสดงผลช่องกรอกข้อมูล', NULL, NULL, NULL, 'import tkinter as tk
root = tk.Tk()
# สร้าง Entry บน root แล้ว pack()
', 'import tkinter as tk
root = tk.Tk()
entry = tk.Entry(root)
entry.pack()', 'stdio', '[{"input": "", "expected": ""}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (86, 'โปรแกรมกดปุ่มเปลี่ยนข้อความ', NULL, 'สร้างฟังก์ชัน `on_click()` ที่ทำการเปลี่ยนข้อความใน Label เป็น "Clicked!" เมื่อถูกเรียกใช้งาน จากนั้นสร้างปุ่มที่ผูกคำสั่งนี้ไว้ด้วยพารามิเตอร์ `command=on_click`', NULL, NULL, NULL, 'import tkinter as tk
root = tk.Tk()
lbl = tk.Label(root, text="Initial")
lbl.pack()

def on_click():
    # เปลี่ยนข้อความใน lbl เป็น "Clicked!"
    pass

btn = tk.Button(root, text="Press", command=on_click)
btn.pack()', 'import tkinter as tk
root = tk.Tk()
lbl = tk.Label(root, text="Initial")
lbl.pack()

def on_click():
    lbl.config(text="Clicked!")

btn = tk.Button(root, text="Press", command=on_click)
btn.pack()', 'stdio', '[{"input": "", "expected": ""}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (155, 'กลับด้านข้อความ (Reverse String)', 'Reverse String', 'เขียนฟังก์ชัน "reverse_string(s)" เพื่อคืนค่าตัวอักษรเรียงย้อนกลับ', 'Write a function "reverse_string(s)" that returns the reversed string.', 'สไลซ์เขียนเป็น s[เริ่ม:จบ:ก้าว] ถ้าก้าวเป็น -1 คือเดินถอยหลัง เว้นเริ่มกับจบว่างไว้ก็ได้ทั้งสตริง: s[::-1]', 'A slice is s[start:stop:step]. A step of -1 walks backwards, and leaving start and stop empty takes the whole string: s[::-1].', 'def reverse_string(s):
    # TODO: คืนสตริงที่กลับด้าน — สไลซ์แบบ [::-1] ทำให้ได้เลย
    return ""', 'def reverse_string(s):
    return s[::-1]', 'function', '[{"args": ["hello"], "expected": "olleh"}, {"args": ["python"], "expected": "nohtyp"}, {"args": [""], "expected": ""}, {"args": ["a"], "expected": "a"}, {"args": ["ab cd"], "expected": "dc ba"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.730376', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (91, 'สร้าง Async Function', NULL, 'ให้นักเรียน import โมดูล `asyncio` แล้วสร้างฟังก์ชันแบบอะซิงโครนัสชื่อ `main()` โดยใช้คำสั่ง `async def main():` ภายในฟังก์ชันให้พิมพ์คำว่า "Async Started"', NULL, NULL, NULL, 'import asyncio
# สร้าง async def main() และ print "Async Started"
', 'import asyncio

async def main():
    print("Async Started")', 'stdio', '[{"input": "", "expected": ""}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (95, 'กรองข้อมูลใน DataFrame', NULL, 'กำหนด DataFrame `df` ที่มีคอลัมน์ `"Name"` และ `"Score"` ([45, 80, 60]) ให้เขียนคำสั่งกรองเลือกเฉพาะแถวที่ Score มากกว่า 50 แล้วพิมพ์ผลลัพธ์', NULL, NULL, NULL, 'import pandas as pd
df = pd.DataFrame({"Name": ["A", "B", "C"], "Score": [45, 80, 60]})
# กรองข้อมูล Score > 50 และ print
', 'import pandas as pd
df = pd.DataFrame({"Name": ["A", "B", "C"], "Score": [45, 80, 60]})
print(df[df["Score"] > 50])', 'stdio', '[{"input": "", "expected": "  Name  Score\n1    B     80\n2    C     60"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (96, 'หาค่าเฉลี่ยข้อมูล', NULL, 'กำหนด DataFrame `df` ที่มีคอลัมน์ `"Score"` ([50, 70, 90]) ให้ใช้เมธอด `.mean()` คำนวณหาค่าเฉลี่ยของคอลัมน์ Score แล้วพิมพ์ผลลัพธ์', NULL, NULL, NULL, 'import pandas as pd
df = pd.DataFrame({"Score": [50, 70, 90]})
# คำนวณค่าเฉลี่ย Score และ print
', 'import pandas as pd
df = pd.DataFrame({"Score": [50, 70, 90]})
print(df["Score"].mean())', 'stdio', '[{"input": "", "expected": "70.0"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (97, 'เพิ่มคอลัมน์ใหม่ใน DataFrame', NULL, 'กำหนด DataFrame `df` ที่มีคอลัมน์ `"Price"` ([100, 200]) และ `"Qty"` ([2, 3]) ให้นักเรียนสร้างคอลัมน์ใหม่ชื่อ `"Total"` ที่เกิดจากคอลัมน์ Price คูณกับ Qty แล้วพิมพ์ DataFrame ทั้งหมดออกมา', NULL, NULL, NULL, 'import pandas as pd
df = pd.DataFrame({"Price": [100, 200], "Qty": [2, 3]})
# สร้างคอลัมน์ Total = Price * Qty และ print df
', 'import pandas as pd
df = pd.DataFrame({"Price": [100, 200], "Qty": [2, 3]})
df["Total"] = df["Price"] * df["Qty"]
print(df)', 'stdio', '[{"input": "", "expected": "   Price  Qty  Total\n0    100    2    200\n1    200    3    600"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (103, 'ค้นหาข้อความด้วย re.search', NULL, 'ให้นักเรียน import โมดูล `re` แล้วใช้ `re.search("Python", "Learn Python Programming")` เพื่อค้นหาคำว่า "Python" ถ้าพบให้พิมพ์คำว่า "Found" ออกมา', NULL, NULL, NULL, 'import re
text = "Learn Python Programming"
# ใช้ re.search และตรวจสอบผลลัพธ์เพื่อ print "Found"
', 'import re
text = "Learn Python Programming"
if re.search("Python", text):
    print("Found")', 'stdio', '[{"input": "", "expected": "Found"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (124, 'บทสรุปสายวิชาการ 1A_2A', 'Conclusion of Academic Track 1A_2A', 'ยินดีด้วยคุณมาถึงจุดสิ้นสุดของสาย 1A_2A แล้ว พิมพ์ print("success") เพื่อจบด่าน', 'Congratulations! You have reached the end of track 1A_2A. Type print("success") to finish the level.', NULL, NULL, 'print("")', 'print("success")', 'stdio', '[]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:06:19.810101', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (107, 'แยกข้อความด้วยตัวคั่นหลายรูปแบบ', NULL, 'กำหนดให้ `text = "apple,banana;orange-grape"` ให้นักเรียนใช้ `re.split(r"[,;-]", text)` เพื่อแยกคำด้วยเครื่องหมายคอมมา, Semicolon และขีดกลาง ออกมาเป็น List แล้วพิมพ์ผลลัพธ์', NULL, NULL, NULL, 'import re
text = "apple,banana;orange-grape"
# ใช้ re.split แยกคำด้วย pattern และ print
', 'import re
text = "apple,banana;orange-grape"
print(re.split(r"[,;-]", text))', 'stdio', '[{"input": "", "expected": "[''apple'', ''banana'', ''orange'', ''grape'']"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (190, 'ผลคูณยกเว้นตัวเอง (Product Except Self)', 'Product Of Array Except Self', 'เขียนฟังก์ชัน `product_except_self(nums)` คืนอาร์เรย์ที่แต่ละตำแหน่งคือผลคูณของสมาชิกอื่นทั้งหมด', 'Write a function `product_except_self(nums)` where each position is the product of all other elements.', 'ลูปในซ้อนลูปนอก: ลูปนอกเลือกตำแหน่งที่จะ "เว้น" ลูปในคูณทุกตัวยกเว้นตำแหน่งนั้น เงื่อนไข i != j คือสิ่งที่เว้นมันออก', 'A loop inside a loop: the outer picks which index to SKIP, the inner multiplies everything else. The i != j test is what does the skipping.', 'def product_except_self(nums):
    out = []
    for i in range(len(nums)):
        p = 1
        for j, v in enumerate(nums):
            # TODO: คูณ v เข้ากับ p เฉพาะตอนที่ j ไม่เท่ากับ i
            pass
        out.append(p)
    return out', 'def product_except_self(nums):
    out = []
    for i in range(len(nums)):
        p = 1
        for j, v in enumerate(nums):
            if i != j:
                p *= v
        out.append(p)
    return out', 'function', '[{"args": [[1, 2, 3, 4]], "expected": [24, 12, 8, 6]}, {"args": [[]], "expected": []}, {"args": [[2, 3]], "expected": [3, 2]}, {"args": [[1, 1, 1]], "expected": [1, 1, 1]}, {"args": [[5, 0]], "expected": [0, 5]}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.950681', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (112, 'ใช้งาน asyncio.sleep', NULL, 'สร้างฟังก์ชัน `say_hello()` แบบ `async def` ภายในให้ใช้ `await asyncio.sleep(1)` เพื่อจำลองการหน่วงเวลา 1 วินาที แล้วพิมพ์คำว่า "Hello after 1s"', NULL, NULL, NULL, 'import asyncio

async def say_hello():
    # await asyncio.sleep(1) และ print
    pass', 'import asyncio

async def say_hello():
    await asyncio.sleep(1)
    print("Hello after 1s")', 'stdio', '[{"input": "", "expected": ""}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (113, 'สร้าง Task ทำงานร่วมกัน', NULL, 'สร้างฟังก์ชัน `task_one()` ที่พิมพ์ "Task 1" ภายใน `main()` ให้สร้าง Task จากฟังก์ชันนี้ด้วย `asyncio.create_task(task_one())` แล้วรอให้ทำงานเสร็จด้วย `await`', NULL, NULL, NULL, 'import asyncio

async def task_one():
    print("Task 1")

async def main():
    # สร้าง task และ await
    pass

asyncio.run(main())', 'import asyncio

async def task_one():
    print("Task 1")

async def main():
    task = asyncio.create_task(task_one())
    await task

asyncio.run(main())', 'stdio', '[{"input": "", "expected": "Task 1"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (114, 'ใช้งาน asyncio.gather', NULL, 'สร้างคอรันต์ย่อยสองตัวคือ `job_a()` และ `job_b()` ที่พิมพ์ข้อความ "Job A" และ "Job B" ตามลำดับ ภายในฟังก์ชัน `main()` ให้ใช้ `await asyncio.gather(job_a(), job_b())` เพื่อรันพร้อมกัน', NULL, NULL, NULL, 'import asyncio

async def job_a():
    print("Job A")

async def job_b():
    print("Job B")

async def main():
    # ใช้ asyncio.gather รันทั้งสอง job
    pass

asyncio.run(main())', 'import asyncio

async def job_a():
    print("Job A")

async def job_b():
    print("Job B")

async def main():
    await asyncio.gather(job_a(), job_b())

asyncio.run(main())', 'stdio', '[{"input": "", "expected": "Job A\nJob B"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (115, 'ฟังก์ชันทดสอบ Pytest', NULL, 'ให้นักเรียนเขียนฟังก์ชันทดสอบชื่อ `test_sum()` โดยภายในยังไม่ต้องเขียนโค้ดอะไร ให้ใส่คำสั่ง `pass` ไว้ก่อนตามมาตรฐาน Pytest', NULL, NULL, NULL, '# เขียน def test_sum(): และ pass
', 'def test_sum():
    pass', 'stdio', '[{"input": "", "expected": ""}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (116, 'ใช้งาน assert พื้นฐาน', NULL, 'เขียนฟังก์ชัน `test_math()` ที่ใช้คำสั่ง `assert 2 + 2 == 4` เพื่อตรวจสอบว่าผลลัพธ์การบวกเลขถูกต้องหรือไม่', NULL, NULL, NULL, 'def test_math():
    # ใช้ assert ตรวจสอบ 2 + 2 == 4
    pass', 'def test_math():
    assert 2 + 2 == 4', 'stdio', '[{"input": "", "expected": ""}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (117, 'ทดสอบฟังก์ชันคูณเลข', NULL, 'กำหนดฟังก์ชัน `multiply(a, b): return a * b` ให้นักเรียนเขียนฟังก์ชัน `test_multiply()` ที่เรียกใช้ `multiply(3, 4)` แล้วใช้ `assert` ตรวจสอบว่าผลลัพธ์เท่ากับ 12', NULL, NULL, NULL, 'def multiply(a, b):
    return a * b

def test_multiply():
    # assert ผลลัพธ์ของ multiply(3, 4) == 12
    pass', 'def multiply(a, b):
    return a * b

def test_multiply():
    assert multiply(3, 4) == 12', 'stdio', '[{"input": "", "expected": ""}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (122, 'เส้นทางวิทยาศาสตร์ 1A', 'Science Path 1A', 'ยินดีต้อนรับสู่เส้นทาง 1A พิมพ์ 1A_2A หรือ 1A_2B เพื่อไปต่อ', 'Welcome to path 1A. Type 1A_2A or 1A_2B to continue.', NULL, NULL, 'print("")', 'print("")', 'stdio', '[]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:06:19.802543', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (120, 'ดึงข้อมูลจากตาราง', NULL, 'เพิ่มข้อมูล (1, Bob) ลงในตาราง users แล้วใช้คำสั่ง SELECT ดึงข้อมูลทั้งหมดด้วย fetchall() จากนั้นพิมพ์ผลลัพธ์ที่ได้ออกมา', NULL, NULL, NULL, 'import sqlite3
conn = sqlite3.connect(":memory:")
cursor = conn.cursor()
cursor.execute("CREATE TABLE users (id INTEGER, name TEXT)")
cursor.execute("INSERT INTO users VALUES (1, ''Bob'')")
# ดึงข้อมูลทั้งหมดด้วย fetchall() แล้ว print
', 'import sqlite3
conn = sqlite3.connect(":memory:")
cursor = conn.cursor()
cursor.execute("CREATE TABLE users (id INTEGER, name TEXT)")
cursor.execute("INSERT INTO users VALUES (1, ''Bob'')")
cursor.execute("SELECT * FROM users")
print(cursor.fetchall())
conn.close()', 'stdio', '[{"input": "", "expected": "[(1, ''Bob'')]"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (121, 'จุดเริ่มต้นของทางแยก', 'The Starting Point of the Fork', 'เขียนคำสั่งคำนวณภาษีมูลค่าเพิ่ม 7% (VAT 7%) จากซื้อสินค้าที่ป้อนเข้ามา แล้วแสดงราคารวมทั้งหมดออกทางหน้าจอ
(ระบบจะตรวจสอบจากราคารวมภาษี: หากราคารวมภาษีมากกว่า 500 จะไปทางเลือก 1A, ถ้าน้อยกว่าหรือเท่ากับ 500 จะไปทางเลือก 1B)', 'Write a program to calculate the 7% Value Added Tax (VAT 7%) from the entered product price, then display the total price on the screen.
(The system will check based on the price including tax: if the price including tax is greater than 500, it will go to option 1A; if it is less than or equal to 500, it will go to option 1B)', NULL, NULL, 'price = float(input("ซื้อสินค้าราคา: "))

# คำนวณราคารวมภาษี
vat_total = price * 1.07

# TODO: แสดงผลราคารวมทั้งหมดให้ถูกต้องตามรูปแบบ
print("ราคารวมทั้งหมดคือ:", vat_total)', 'price = float(input("ซื้อสินค้าราคา: "))

# คำนวณราคารวมภาษี
vat_total = price * 1.07

# TODO: แสดงผลราคารวมทั้งหมดให้ถูกต้องตามรูปแบบ
print("ราคารวมทั้งหมดคือ:", vat_total)', 'stdio', '[{"input": "100", "expected": "ราคารวมทั้งหมดคือ: 107.0"}, {"input": "250", "expected": "ราคารวมทั้งหมดคือ: 267.5"}, {"input": "500", "expected": "ราคารวมทั้งหมดคือ: 535.0"}, {"input": "700", "expected": "ราคารวมทั้งหมดคือ: 749.0"}, {"input": "1000", "expected": "ราคารวมทั้งหมดคือ: 1070.0"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:10:08.32148', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (148, 'คำนวณค่าไฟประจำเดือน', NULL, 'ให้เขียนโปรแกรม Python รับจำนวนหน่วยไฟฟ้าที่ใช้ในเดือนนั้น แล้วคำนวณค่าไฟตามเงื่อนไขนี้
1 ถึง 50 หน่วยแรก หน่วยละ 3 บาท
หน่วยที่ 51 ถึง 100 หน่วยละ 4 บาท
หน่วยที่เกิน 100 หน่วย หน่วยละ 5 บาท', NULL, NULL, NULL, NULL, NULL, 'stdio', '[{"input": "40", "expected": "120"}, {"input": "75", "expected": "250"}, {"input": "120", "expected": "550"}]', 52, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (149, 'หาคะแนนสูงสุด', NULL, 'ให้เขียนโปรแกรม Python รับจำนวนเต็ม n จากบรรทัดแรก จากนั้นรับคะแนนจำนวน n ค่าในบรรทัดถัดไป โดยคะแนนคั่นด้วยช่องว่าง
ให้โปรแกรมหาคะแนนที่มากที่สุด แล้วแสดงคะแนนนั้นออกมา', NULL, NULL, NULL, NULL, NULL, 'stdio', '[{"input": "5\n70 88 95 60 81", "expected": "95"}, {"input": "4\n10 10 9 8", "expected": "10"}, {"input": "6\n-5 -2 -9 -1 -7 -3", "expected": "-1"}]', 52, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (150, 'กลับคำในประโยค', NULL, 'ให้เขียนโปรแกรม Python รับข้อความ 1 บรรทัด
จากนั้นให้แยกคำด้วยช่องว่าง แล้วแสดงคำทั้งหมดเรียงจากหลังมาหน้า', NULL, NULL, NULL, NULL, NULL, 'stdio', '[{"input": "hello world", "expected": "world hello"}, {"input": "I love Python", "expected": "Python love I"}, {"input": "coding is fun", "expected": "fun is coding"}]', 31, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (151, 'พิมพ์เลขคู่จาก 1 ถึง N', NULL, 'ให้เขียนโปรแกรม Python รับจำนวนเต็ม n
จากนั้นให้แสดงเลขคู่ทั้งหมดตั้งแต่ 1 ถึง n โดยคั่นแต่ละตัวด้วยช่องว่าง
ถ้าไม่มีเลขคู่ ให้แสดงคำว่า ไม่มีเลขคู่', NULL, NULL, NULL, NULL, NULL, 'stdio', '[{"input": "10", "expected": "2 4 6 8 10"}, {"input": "7", "expected": "2 4 6"}, {"input": "1", "expected": "ไม่มีเลขคู่"}]', 31, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (152, 'ตรวจสอบอุณหภูมิ', NULL, 'ให้เขียนโปรแกรม Python รับค่าอุณหภูมิเป็นจำนวนเต็ม 1 ค่า
จากนั้นให้แสดงผลตามเงื่อนไขต่อไปนี้
ถ้าอุณหภูมิน้อยกว่า 20 ให้แสดงคำว่า หนาว
ถ้าอุณหภูมิอยู่ระหว่าง 20 ถึง 30 ให้แสดงคำว่า ปกติ
ถ้าอุณหภูมิมากกว่า 30 ให้แสดงคำว่า ร้อน
', NULL, NULL, NULL, NULL, 'temp = int(input())
if temp < 20:
    print("หนาว")
elif temp <= 30:
    print("ปกติ")
else:
    print("ร้อน")
', 'stdio', '[{"input": "15", "expected": "หนาว"}, {"input": "20", "expected": "ปกติ"}, {"input": "25", "expected": "ปกติ"}, {"input": "30", "expected": "ปกติ"}, {"input": "35", "expected": "ร้อน"}]', 52, '2026-08-24 20:43:54.978192', '2026-08-25 11:40:56.203732', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (154, 'กำลังสองของทุกสมาชิก (Square List)', 'Square List', 'เขียนฟังก์ชัน "square_list(nums)" คืนค่าอาร์เรย์ตัวเลขที่ยกกำลังสองทุกตัว', 'Write a function "square_list(nums)" returning a list of squared numbers.', 'ยกกำลังใช้ ** ดังนั้น x ** 2 คือ x กำลังสอง แล้วเก็บเข้าลิสต์ด้วย out.append(...)', 'Exponentiation is **, so x ** 2 squares x. Collect it with out.append(...).', 'def square_list(nums):
    out = []
    for x in nums:
        # TODO: เพิ่มค่า x ยกกำลังสอง (x ** 2) เข้าไปใน out
        pass
    return out', 'def square_list(nums):
    out = []
    for x in nums:
        out.append(x ** 2)
    return out', 'function', '[{"args": [[1, 2, 3]], "expected": [1, 4, 9]}, {"args": [[]], "expected": []}, {"args": [[0]], "expected": [0]}, {"args": [[-2, 5]], "expected": [4, 25]}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.77936', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (156, 'ตรวจสอบพาลินโดรม (Palindrome Check)', 'Palindrome Check', 'เขียนฟังก์ชัน "is_palindrome(s)" คืนค่า True หากคำอ่านจากหน้าไปหลังและหลังมาหน้าเหมือนกัน', 'Write a function "is_palindrome(s)" returning True if string is a palindrome.', 'เทียบสตริงเดิมกับตัวที่กลับด้าน c == c[::-1] บรรทัดแรกจัดการตัวพิมพ์และช่องว่างให้แล้ว จึงเทียบ c ไม่ใช่ s', 'Compare the string with its reverse: c == c[::-1]. The first line already stripped case and spaces, so compare c, not s.', 'def is_palindrome(s):
    c = s.lower().replace(" ", "")
    # TODO: คืน True ถ้า c เท่ากับ c ที่กลับด้าน (c[::-1])
    return None', 'def is_palindrome(s):
    c = s.lower().replace(" ", "")
    return c == c[::-1]', 'function', '[{"args": ["racecar"], "expected": true}, {"args": ["python"], "expected": false}, {"args": [""], "expected": true}, {"args": ["a"], "expected": true}, {"args": ["never odd or even"], "expected": true}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.772771', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (167, 'ตัวอักษรพิมพ์ใหญ่ทั้งหมด (To Upper)', 'To Upper Case', 'เขียนฟังก์ชัน `to_upper(s)` แปลงข้อความเป็นตัวพิมพ์ใหญ่ทั้งหมด', 'Write a function `to_upper(s)` converting text to upper case.', 'สตริงมีเมธอด .upper() คืนสตริงใหม่เป็นตัวพิมพ์ใหญ่ (ไม่ได้แก้ตัวเดิม) จึงต้อง return ค่าที่มันคืนมา', 'Strings have .upper(), which returns a NEW uppercase string rather than changing the original — so return what it gives back.', 'def to_upper(s):
    # TODO: คืนสตริงตัวพิมพ์ใหญ่ทั้งหมด — สตริงมีเมธอด .upper()
    return ""', 'def to_upper(s):
    return s.upper()', 'function', '[{"args": ["abc"], "expected": "ABC"}, {"args": [""], "expected": ""}, {"args": ["MiXeD"], "expected": "MIXED"}, {"args": ["a1b2"], "expected": "A1B2"}, {"args": ["hello world"], "expected": "HELLO WORLD"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.894072', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (168, 'สลับตัวพิมพ์ (Swap Case)', 'Swap Case', 'เขียนฟังก์ชัน `swap_case(s)` สลับตัวพิมพ์เล็กเป็นใหญ่และใหญ่เป็นเล็ก', 'Write a function `swap_case(s)` swapping upper and lower case.', 'Python มี .swapcase() ให้อยู่แล้ว สลับพิมพ์เล็กเป็นใหญ่และใหญ่เป็นเล็กในครั้งเดียว ไม่ต้องวนทีละตัว', 'Python already has .swapcase(), which flips lower to upper and upper to lower in one go — no loop required.', 'def swap_case(s):
    # TODO: สลับตัวพิมพ์เล็ก/ใหญ่ — สตริงมีเมธอด .swapcase()
    return ""', 'def swap_case(s):
    return s.swapcase()', 'function', '[{"args": ["AbC"], "expected": "aBc"}, {"args": [""], "expected": ""}, {"args": ["abc"], "expected": "ABC"}, {"args": ["A1b"], "expected": "a1B"}, {"args": ["Hello World"], "expected": "hELLO wORLD"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.912239', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (75, 'สุ่มเลือกรายการ', NULL, 'กำหนดให้ `colors = ["Red", "Green", "Blue"]` ให้นักเรียน import โมดูล `random` และใช้ `random.choice(colors)` เพื่อสุ่มเลือกสีขึ้นมา 1 สี (ในเทสเคสจำลองผลลัพธ์เป็น "Green")', NULL, NULL, NULL, 'import random
colors = ["Red", "Green", "Blue"]
# ใช้ random.choice(colors) แล้ว print
', 'import random
colors = ["Red", "Green", "Blue"]
print(random.choice(colors))', 'stdio', '[{"input": "", "expected": "Green"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 0);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (183, 'ตรวจสอบจำนวนเฉพาะ (Prime Number Check)', 'Prime Number Check', 'เขียนฟังก์ชัน "is_prime(n)" เพื่อตรวจสอบว่า n เป็นจำนวนเฉพาะหรือไม่', 'Write a function "is_prime(n)" returning True if n is a prime number.', 'ถ้าเจอตัวหารลงตัวแม้ตัวเดียวก็จบแล้ว return False ได้ทันที ไม่ต้องวนต่อ — ลูปที่ให้มาหยุดที่รากที่สองเพราะตัวหารที่ใหญ่กว่านั้นจับคู่กับตัวที่เล็กกว่าซึ่งตรวจไปแล้ว', 'One divisor is enough to decide: return False immediately, no need to finish the loop. The given range stops at the square root because any larger divisor pairs with a smaller one already checked.', 'def is_prime(n):
    if n <= 1:
        return False
    for i in range(2, int(n ** 0.5) + 1):
        # TODO: ถ้า n หารด้วย i ลงตัว แปลว่าไม่ใช่จำนวนเฉพาะ ให้คืน False
        pass
    return True', 'def is_prime(n):
    if n <= 1:
        return False
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            return False
    return True', 'function', '[{"args": [11], "expected": true}, {"args": [4], "expected": false}, {"args": [1], "expected": false}, {"args": [2], "expected": true}, {"args": [97], "expected": true}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.827475', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (87, 'สร้าง Flask App', NULL, 'ให้นักเรียน import ไลบรารี `Flask` จากโมดูล `flask` แล้วสร้างออบเจ็กต์แอปพลิเคชันด้วย `app = Flask(__name__)`', NULL, NULL, NULL, 'from flask import Flask
# สร้างตัวแปร app = Flask(__name__)
', 'from flask import Flask
app = Flask(__name__)', 'stdio', '[{"input": "", "expected": ""}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 0);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (174, 'ลบตัวเลขซ้ำในรายการ (Remove Duplicates)', 'Remove Duplicates', 'เขียนฟังก์ชัน "remove_duplicates(nums)" เพื่อลบตัวเลขซ้ำและคืนค่ารายการตัวเลขที่ไม่ซ้ำโดยคงลำดับเดิมไว้', 'Write a function "remove_duplicates(nums)" returning list with duplicates removed preserving order.', 'not in ถามว่ายังไม่มีอยู่ใช่ไหม — if num not in res แล้วค่อย append วิธีนี้รักษาลำดับเดิมไว้ (set() เร็วกว่าแต่ลำดับหาย)', 'not in asks whether something is absent: if num not in res, then append. This keeps the original order — set() is faster but loses it.', 'def remove_duplicates(nums):
    res = []
    for num in nums:
        # TODO: เพิ่ม num เข้า res เฉพาะตอนที่ num ยังไม่มีอยู่ใน res
        pass
    return res', 'def remove_duplicates(nums):
    res = []
    for num in nums:
        if num not in res:
            res.append(num)
    return res', 'function', '[{"args": [[1, 2, 2, 3, 1]], "expected": [1, 2, 3]}, {"args": [[]], "expected": []}, {"args": [[1, 1, 1]], "expected": [1]}, {"args": [[5, 4, 5, 4, 3]], "expected": [5, 4, 3]}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.810394', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (88, 'กำหนด Route หน้าแรก', NULL, 'สร้างแอป Flask และใช้เดคอเรเตอร์ `@app.route("/")` กำหนดฟังก์ชัน `home()` ที่คืนค่าข้อความ `"Welcome to Flask!"`', NULL, NULL, NULL, 'from flask import Flask
app = Flask(__name__)

# ใช้ @app.route("/") และสร้างฟังก์ชัน home()
', 'from flask import Flask
app = Flask(__name__)

@app.route("/")
def home():
    return "Welcome to Flask!"', 'stdio', '[{"input": "", "expected": ""}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 0);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (182, 'นับเลขคู่ในรายการ (Count Evens)', 'Count Evens', 'เขียนฟังก์ชัน `count_evens(nums)` คืนค่าจำนวนเลขคู่ในรายการ', 'Write a function `count_evens(nums)` returning how many even numbers are in the list.', 'รวมสองแนวคิดเข้าด้วยกัน: ตรวจเลขคู่ด้วยเศษจากการหาร n % 2 == 0 แล้วเพิ่มตัวนับขึ้นหนึ่งด้วย += เมื่อเงื่อนไขเป็นจริงเท่านั้น', 'Two ideas combined: test evenness with the remainder, n % 2 == 0, then bump the counter by one with += only when that holds.', 'def count_evens(nums):
    count = 0
    for n in nums:
        # TODO: ถ้า n เป็นเลขคู่ (n % 2 == 0) ให้ count เพิ่มขึ้น 1
        pass
    return count', 'def count_evens(nums):
    count = 0
    for n in nums:
        if n % 2 == 0:
            count += 1
    return count', 'function', '[{"args": [[1, 2, 3, 4]], "expected": 2}, {"args": [[]], "expected": 0}, {"args": [[1, 3, 5]], "expected": 0}, {"args": [[2, 4, 6]], "expected": 3}, {"args": [[0, -2, 7]], "expected": 2}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.898469', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (128, 'Mini 1: อธิบายโค้ดด้วยคอมเมนต์', 'Mini 1: Explain Code with Comments', 'เพิ่ม comment 1 บรรทัด แล้วแสดงข้อความ "อ่านโค้ดง่ายขึ้น"', 'Add 1 comment line, then display the message "อ่านโค้ดง่ายขึ้น"', NULL, NULL, '# เขียนคำอธิบายโค้ดตรงนี้
print("อ่านโค้ดง่ายขึ้น")', '# แสดงข้อความว่าคอมเมนต์ช่วยให้อ่านง่าย
print("อ่านโค้ดง่ายขึ้น")', 'stdio', '[{"input": "", "expected": "อ่านโค้ดง่ายขึ้น"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:07:00.183957', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (129, 'Mini 2: ปิดโค้ดทดลองด้วยคอมเมนต์', 'Mini 2: Disable Test Code with a Comment', 'ใช้ # ปิดบรรทัด print("debug") แล้วให้โปรแกรมแสดงเฉพาะ "พร้อมส่งงาน"', 'Use # to comment out the line print("debug") so the program only displays "พร้อมส่งงาน"', NULL, NULL, '# print("debug")
print("พร้อมส่งงาน")', '# print("debug")
print("พร้อมส่งงาน")', 'stdio', '[{"input": "", "expected": "พร้อมส่งงาน"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:07:07.35026', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (130, 'Mini 1: เก็บชื่อคอร์ส', 'Mini 1: Store the Course Name', 'สร้างตัวแปร course เก็บคำว่า "Python" แล้วแสดงค่าตัวแปร', 'Create a variable course that stores the word "Python" and then display the value of the variable', NULL, NULL, 'course = "Python"
print(course)', 'course = "Python"
print(course)', 'stdio', '[{"input": "", "expected": "Python"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:07:07.357108', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (131, 'Mini 3: โน้ตขั้นตอนก่อนรัน', 'Mini 3: Note the Steps Before Running', 'เขียน comment บอกขั้นตอนสั้น ๆ แล้วแสดงข้อความ "โค้ดนี้มีคำอธิบาย"', 'Write a comment describing the steps briefly, then display the message "โค้ดนี้มีคำอธิบาย"', NULL, NULL, '# 1. เตรียมข้อความ
print("โค้ดนี้มีคำอธิบาย")', '# 1. เตรียมข้อความ
print("โค้ดนี้มีคำอธิบาย")', 'stdio', '[{"input": "", "expected": "โค้ดนี้มีคำอธิบาย"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:07:07.36667', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (51, 'เปิดไฟล์ในโหมดอ่าน', NULL, 'ให้นักเรียนเขียนคำสั่งเปิดไฟล์ชื่อ "data.txt" ในโหมดอ่านข้อความ ("r") กำหนดไว้ในตัวแปร `f` แล้วปิดไฟล์ด้วย `f.close()`', NULL, NULL, NULL, '# เปิดไฟล์ data.txt โหมด "r"
# ปิดไฟล์ด้วย close()
', 'f = open("data.txt", "r")
f.close()', 'stdio', '[{"input": "", "expected": ""}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 0);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (52, 'อ่านข้อมูลทั้งไฟล์', NULL, 'ให้นักเรียนเปิดไฟล์ "data.txt" อ่านข้อความทั้งหมดเก็บไว้ในตัวแปร `content` ใช้ print() แสดงผล แล้วปิดไฟล์ให้เรียบร้อย', NULL, NULL, NULL, '# เปิดไฟล์ อ่านข้อมูลเก็บใน content แล้ว print และปิดไฟล์
', 'f = open("data.txt", "r")
content = f.read()
print(content)
f.close()', 'stdio', '[{"input": "", "expected": "Hello, Python!"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 0);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (53, 'อ่านไฟล์ทีละบรรทัด', NULL, 'เปิดไฟล์ "data.txt" แล้วใช้เมธอด `.readline()` อ่านข้อมูลบรรทัดแรกออกมาแสดงผล จากนั้นปิดไฟล์', NULL, NULL, NULL, '# เปิดไฟล์ ใช้ readline() แล้ว print และปิดไฟล์
', 'f = open("data.txt", "r")
line = f.readline()
print(line)
f.close()', 'stdio', '[{"input": "", "expected": "Hello, Python!"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 0);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (70, 'ส่งพารามิเตอร์ไปกับ Requests', NULL, 'กำหนดพารามิเตอร์ `payload = {"search": "python", "page": 1}` ให้นักเรียนส่งคำขอ GET ไปยัง `"https://api.example.com/search"` พร้อมระบุพารามิเตอร์ผ่านอาร์กิวเมนต์ `params=payload` แล้วพิมพ์ URL ที่ถูกสร้างขึ้นมาจริง ๆ (`response.url`)', NULL, NULL, NULL, 'import requests
payload = {"search": "python", "page": 1}
# ส่งคำขอพร้อม params และ print response.url
', 'import requests
payload = {"search": "python", "page": 1}
response = requests.get("https://api.example.com/search", params=payload)
print(response.url)', 'stdio', '[{"input": "", "expected": "https://api.example.com/search?search=python&page=1"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 0);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (74, 'สุ่มตัวเลขด้วย random', NULL, 'ให้นักเรียน import โมดูล `random` แล้วใช้ `random.randint(1, 10)` เพื่อสุ่มเลขจำนวนเต็มระหว่าง 1 ถึง 10 (ในที่นี้เทสเคสจะจำลองผลลัพธ์ที่ได้เป็น 7)', NULL, NULL, NULL, 'import random
# ใช้ random.randint(1, 10) แล้ว print
', 'import random
print(random.randint(1, 10))', 'stdio', '[{"input": "", "expected": "7"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 0);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (133, 'Mini 3: รวมข้อความจากตัวแปร', 'Mini 3: Combining Text from Variables', 'สร้างตัวแปร first และ last แล้วแสดง "Lumi Python"', 'Create variables first and last, then display "Lumi Python"', NULL, NULL, 'first = "Lumi"
last = "Python"
print(first, last)', 'first = "Lumi"
last = "Python"
print(first, last)', 'stdio', '[{"input": "", "expected": "Lumi Python"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:08:34.843559', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (134, 'Mini 1: เริ่มโจทย์ Try-Except', 'Mini 1: Starting the Try-Except Exercise', 'เขียนโปรแกรม Python แสดงข้อความ "พร้อมเรียน Try-Except"', 'Write a Python program that displays the message "พร้อมเรียน Try-Except"', NULL, NULL, 'print("พร้อมเรียน Try-Except")', 'print("พร้อมเรียน Try-Except")', 'stdio', '[{"input": "", "expected": "พร้อมเรียน Try-Except"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:08:34.84835', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (135, 'Mini 2: ทบทวน Try-Except', 'Mini 2: Reviewing Try-Except', 'สร้างตัวแปร status เก็บคำว่า "เข้าใจแล้ว" แล้วแสดงผล', 'Create a variable status that stores the word "เข้าใจแล้ว" and then display it', NULL, NULL, 'status = "เข้าใจแล้ว"
print(status)', 'status = "เข้าใจแล้ว"
print(status)', 'stdio', '[{"input": "", "expected": "เข้าใจแล้ว"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:08:34.850715', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (136, 'Mini 3: ปิดท้าย Try-Except', 'Mini 3: Wrapping Up Try-Except', 'แสดงข้อความ "ผ่านมินิเกมแล้ว" เพื่อจบบทนี้', 'Display the message "ผ่านมินิเกมแล้ว" to finish this chapter', NULL, NULL, 'print("ผ่านมินิเกมแล้ว")', 'print("ผ่านมินิเกมแล้ว")', 'stdio', '[{"input": "", "expected": "ผ่านมินิเกมแล้ว"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:08:34.854386', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (137, 'Mini 1: รับชื่อผู้เล่น', 'Mini 1: Receive Player Name', 'รับชื่อ 1 ค่า แล้วแสดงคำทักทายในรูปแบบ "สวัสดี <ชื่อ>"', 'Receive 1 name value, then display a greeting in the format "สวัสดี <name>"', NULL, NULL, 'name = input("ชื่อของคุณ: ")
print("สวัสดี", name)', 'name = input("ชื่อของคุณ: ")
print("สวัสดี", name)', 'stdio', '[{"input": "Lumi", "expected": "สวัสดี Lumi"}, {"input": "PySim", "expected": "สวัสดี PySim"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 05:08:57.823938', 1);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (89, 'แสดงผลข้อความ HTML เบื้องต้น', NULL, 'สร้าง Route หน้าแรกที่เมื่อผู้ใช้เข้าเว็บไซต์ จะส่งค่าข้อความที่เป็นหัวข้อ HTML คืนกลับไป เช่น `"<h1>Hello Flask Web</h1>"`', NULL, NULL, NULL, 'from flask import Flask
app = Flask(__name__)

@app.route("/")
def index():
    # คืนค่าข้อความ HTML h1
    pass', 'from flask import Flask
app = Flask(__name__)

@app.route("/")
def index():
    return "<h1>Hello Flask Web</h1>"', 'stdio', '[{"input": "", "expected": ""}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 0);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (92, 'คำนวณตัวเลขผ่าน URL', NULL, 'สร้าง Route แบบรับค่าตัวเลขสองจำนวนผ่าน URL ในรูปแบบ `/add/<int:a>/<int:b>` แล้วคืนค่าผลบวกของตัวเลขทั้งสองในรูปแบบสตริง เช่น คืนค่า `str(a + b)`', NULL, NULL, NULL, 'from flask import Flask
app = Flask(__name__)

@app.route("/add/<int:a>/<int:b>")
def add_numbers(a, b):
    # คืนค่าผลบวกแปลงเป็น str
    pass', 'from flask import Flask
app = Flask(__name__)

@app.route("/add/<int:a>/<int:b>")
def add_numbers(a, b):
    return str(a + b)', 'stdio', '[{"input": "", "expected": ""}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 0);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (94, 'เลือกคอลัมน์ข้อมูล', NULL, 'กำหนด DataFrame `df` ที่มีคอลัมน์ `"Fruit"` (["Apple", "Banana"]) และ `"Price"` ([30, 20]) ให้พิมพ์เฉพาะข้อมูลในคอลัมน์ `"Fruit"` ออกมา', NULL, NULL, NULL, 'import pandas as pd
df = pd.DataFrame({"Fruit": ["Apple", "Banana"], "Price": [30, 20]})
# print เฉพาะคอลัมน์ Fruit
', 'import pandas as pd
df = pd.DataFrame({"Fruit": ["Apple", "Banana"], "Price": [30, 20]})
print(df["Fruit"])', 'stdio', '[{"input": "", "expected": "0     Apple\n1    Banana\nName: Fruit, dtype: object"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 0);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (98, 'สร้างกราฟเส้น (Line Plot)', NULL, 'ให้นักเรียน import ไลบรารี `matplotlib.pyplot` เป็น `plt` และสร้างกราฟเส้นจากข้อมูล x = [1, 2, 3] และ y = [2, 4, 6] ด้วยฟังก์ชัน `plt.plot(x, y)` จากนั้นใช้ `plt.show()` เพื่อแสดงกราฟ', NULL, NULL, NULL, 'import matplotlib.pyplot as plt
x = [1, 2, 3]
y = [2, 4, 6]
# วาดกราฟเส้นและแสดงผลด้วย plt.show()
', 'import matplotlib.pyplot as plt
x = [1, 2, 3]
y = [2, 4, 6]
plt.plot(x, y)
plt.show()', 'stdio', '[{"input": "", "expected": ""}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 0);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (99, 'ใส่ชื่อแกนและหัวข้อกราฟ', NULL, 'สร้างกราฟเส้นจาก x = [1, 2], y = [10, 20] พร้อมทั้งกำหนดชื่อหัวข้อกราฟว่า `"My Chart"`, ชื่อแกน X ว่า `"X-Axis"` และชื่อแกน Y ว่า `"Y-Axis"` ก่อนเรียก `plt.show()`', NULL, NULL, NULL, 'import matplotlib.pyplot as plt
x = [1, 2]
y = [10, 20]
plt.plot(x, y)
# กำหนด title, xlabel, ylabel และ plt.show()
', 'import matplotlib.pyplot as plt
x = [1, 2]
y = [10, 20]
plt.plot(x, y)
plt.title("My Chart")
plt.xlabel("X-Axis")
plt.ylabel("Y-Axis")
plt.show()', 'stdio', '[{"input": "", "expected": ""}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 0);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (100, 'สร้างกราฟแท่ง (Bar Chart)', NULL, 'กำหนดหมวดหมู่สินค้า categories = ["A", "B", "C"] และ values = [10, 25, 15] ให้นักเรียนใช้คำสั่ง `plt.bar(categories, values)` เพื่อสร้างกราฟแท่ง แล้วแสดงผลด้วย `plt.show()`', NULL, NULL, NULL, 'import matplotlib.pyplot as plt
categories = ["A", "B", "C"]
values = [10, 25, 15]
# สร้างกราฟแท่งด้วย plt.bar และแสดงผล
', 'import matplotlib.pyplot as plt
categories = ["A", "B", "C"]
values = [10, 25, 15]
plt.bar(categories, values)
plt.show()', 'stdio', '[{"input": "", "expected": ""}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 0);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (101, 'ปรับแต่งสีและสไตล์เส้นกราฟ', NULL, 'สร้างกราฟเส้นจาก x = [1, 2, 3], y = [5, 6, 7] โดยกำหนดสีของเส้นเป็นสีแดง (`color="red"`) และใช้รูปแบบเส้นประ (`linestyle="--"`) จากนั้นเรียก `plt.show()`', NULL, NULL, NULL, 'import matplotlib.pyplot as plt
x = [1, 2, 3]
y = [5, 6, 7]
# วาดกราฟเส้นสีแดงและเส้นประ
', 'import matplotlib.pyplot as plt
x = [1, 2, 3]
y = [5, 6, 7]
plt.plot(x, y, color="red", linestyle="--")
plt.show()', 'stdio', '[{"input": "", "expected": ""}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 0);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (102, 'กราฟหลายเส้นและ Legend', NULL, 'สร้างกราฟเส้น 2 เส้นบนหน้าต่างเดียวกัน โดยเส้นแรก y1 = [1, 2, 3] ป้ายกำกับ `label="Line 1"` และเส้นที่สอง y2 = [3, 2, 1] ป้ายกำกับ `label="Line 2"` จากนั้นเรียกใช้ `plt.legend()` และ `plt.show()`', NULL, NULL, NULL, 'import matplotlib.pyplot as plt
x = [1, 2, 3]
y1 = [1, 2, 3]
y2 = [3, 2, 1]
# plot y1 และ y2 พร้อม label
# เรียก plt.legend() และ plt.show()
', 'import matplotlib.pyplot as plt
x = [1, 2, 3]
y1 = [1, 2, 3]
y2 = [3, 2, 1]
plt.plot(x, y1, label="Line 1")
plt.plot(x, y2, label="Line 2")
plt.legend()
plt.show()', 'stdio', '[{"input": "", "expected": ""}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 0);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (104, 'ดึงตัวเลขด้วย re.findall', NULL, 'กำหนดให้ `text = "Order ID: 12345, Amount: 500"` ให้นักเรียนใช้ `re.findall(r"d+", text)` เพื่อดึงตัวเลขทั้งหมดออกมาเก็บเป็น List แล้วพิมพ์ผลลัพธ์', NULL, NULL, NULL, 'import re
text = "Order ID: 12345, Amount: 500"
# ใช้ re.findall ดึงตัวเลขและ print
', 'import re
text = "Order ID: 12345, Amount: 500"
print(re.findall(r"\d+", text))
', 'stdio', '[{"input": "", "expected": "[''12345'', ''500'']"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 11:40:56.184164', 0);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (108, 'ส่งคำขอ GET เบื้องต้น', NULL, 'ให้นักเรียน import ไลบรารี `requests` แล้วใช้ฟังก์ชัน `requests.get("https://api.example.com/data")` เพื่อส่งคำขอไปยัง URL ที่กำหนด เก็บไว้ในตัวแปร `response`', NULL, NULL, NULL, 'import requests
# ส่งคำขอ get ไปยัง URL และเก็บใน response
', 'import requests
response = requests.get("https://api.example.com/data")', 'stdio', '[{"input": "", "expected": ""}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 0);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (109, 'ตรวจสอบสถานะ Response', NULL, 'ส่งคำขอ GET ไปยัง URL API และตรวจสอบว่า `response.status_code` มีค่าเท่ากับ 200 หรือไม่ ถ้าใช่ให้พิมพ์คำว่า "OK"', NULL, NULL, NULL, 'import requests
response = requests.get("https://api.example.com/status")
# ตรวจสอบ status_code == 200 แล้ว print "OK"
', 'import requests
response = requests.get("https://api.example.com/status")
if response.status_code == 200:
    print("OK")', 'stdio', '[{"input": "", "expected": "OK"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 0);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (110, 'ดึงข้อความ Response Text', NULL, 'ส่งคำขอ GET ไปยัง URL แล้วใช้แอตทริบิวต์ `.text` ดึงข้อมูลข้อความดิบที่ได้รับกลับมาจากเซิร์ฟเวอร์ ออกมาพิมพ์แสดงผล', NULL, NULL, NULL, 'import requests
response = requests.get("https://api.example.com/text")
# print ข้อความจาก response.text
', 'import requests
response = requests.get("https://api.example.com/text")
print(response.text)', 'stdio', '[{"input": "", "expected": "Hello API"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 0);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (111, 'รับข้อมูล JSON จาก API', NULL, 'ส่งคำขอ GET ไปยัง API และใช้เมธอด `.json()` แปลงผลลัพธ์เป็น Python Dictionary จากนั้นดึงค่าจาก Key ชื่อ `"message"` ออกมาพิมพ์', NULL, NULL, NULL, 'import requests
response = requests.get("https://api.example.com/json")
# แปลงเป็น json และ print ค่า key "message"
', 'import requests
response = requests.get("https://api.example.com/json")
data = response.json()
print(data["message"])', 'stdio', '[{"input": "", "expected": "Success"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 0);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (118, 'ทดสอบการเกิด Error ด้วย raises', NULL, 'ให้นักเรียน import ไลบรารี `pytest` แล้วเขียนฟังก์ชัน `test_zero_division()` ที่ใช้ `with pytest.raises(ZeroDivisionError):` เพื่อตรวจสอบว่าโค้ด `1 / 0` เกิด ZeroDivisionError จริงหรือไม่', NULL, NULL, NULL, 'import pytest

def test_zero_division():
    # ใช้ with pytest.raises(ZeroDivisionError): ตรวจสอบ 1 / 0
    pass', 'import pytest

def test_zero_division():
    with pytest.raises(ZeroDivisionError):
        _ = 1 / 0', 'stdio', '[{"input": "", "expected": ""}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 0);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (119, 'ใช้งาน Pytest Fixture', NULL, 'ให้นักเรียน import `pytest` และสร้าง fixture ชื่อ `sample_data()` ที่คืนค่าเป็น List `[1, 2, 3]` จากนั้นเขียนฟังก์ชัน `test_data(sample_data)` ที่ใช้ `assert` ตรวจสอบว่าสมาชิกตัวแรก `sample_data[0] == 1`', NULL, NULL, NULL, 'import pytest

@pytest.fixture
def sample_data():
    return [1, 2, 3]

def test_data(sample_data):
    # ใช้ assert ตรวจสอบ sample_data[0] == 1
    pass', 'import pytest

@pytest.fixture
def sample_data():
    return [1, 2, 3]

def test_data(sample_data):
    assert sample_data[0] == 1', 'stdio', '[{"input": "", "expected": ""}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', 0);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (105, 'แทนที่ข้อความด้วย re.sub', NULL, 'กำหนดให้ `text = "Contact: 081-234-5678"` ให้นักเรียนใช้ `re.sub(r"d", "*", text)` เพื่อเปลี่ยนตัวเลขทุกตัวให้เป็นเครื่องหมายดอกจัน `*` แล้วพิมพ์ผลลัพธ์', NULL, NULL, NULL, 'import re
text = "Contact: 081-234-5678"
# ใช้ re.sub เปลี่ยนตัวเลขเป็น * และ print
', 'import re
text = "Contact: 081-234-5678"
print(re.sub(r"\d", "*", text))
', 'stdio', '[{"input": "", "expected": "Contact: ***-***-****"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 11:40:56.191344', 0);
INSERT INTO public.problems (problem_id, title_th, title_en, desc_th, desc_en, hint_th, hint_en, starter_code, solution_code, test_kind, test_cases, created_by, created_at, updated_at, is_auto_gradable) VALUES (106, 'ตรวจสอบรูปแบบอีเมล', NULL, 'กำหนดให้ `email = "test@example.com"` ให้นักเรียนใช้ Regex pattern สำหรับตรวจสอบอีเมลอย่างง่าย `r"^[w.-]+@[w.-]+.w+$"` ร่วมกับ `re.match()` หากตรงตามรูปแบบให้พิมพ์ `True`', NULL, NULL, NULL, 'import re
email = "test@example.com"
pattern = r"^[w.-]+@[w.-]+.w+$"
# ใช้ re.match ตรวจสอบและ print True ถ้า match
', 'import re
email = "test@example.com"
pattern = r"^[\w.-]+@[\w.-]+\.\w+$"
if re.match(pattern, email):
    print("True")
', 'stdio', '[{"input": "", "expected": "True"}]', NULL, '2026-08-24 20:43:54.978192', '2026-08-25 11:40:56.195088', 0);


--
-- Data for Name: problem_modes; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 11, 1, 1, '0', NULL, 15, 5, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 12, 2, 1, '1', NULL, 15, 5, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 13, 3, 1, '2', NULL, 20, 6, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 14, 4, 1, '3', NULL, 20, 6, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 15, 5, 1, '4', NULL, 25, 8, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 21, 6, 2, '0', NULL, 15, 5, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 22, 7, 2, '1', NULL, 20, 6, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 23, 8, 2, '2', NULL, 25, 8, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 24, 9, 2, '3', NULL, 30, 10, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 25, 10, 2, '4', NULL, 35, 12, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 31, 11, 3, '0', NULL, 15, 5, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 32, 12, 3, '1', NULL, 20, 6, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 33, 13, 3, '2', NULL, 25, 8, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 34, 14, 3, '3', NULL, 30, 10, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 35, 15, 3, '4', NULL, 35, 12, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 41, 16, 4, '0', NULL, 15, 5, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 42, 17, 4, '1', NULL, 20, 6, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 43, 18, 4, '2', NULL, 25, 8, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 44, 19, 4, '3', NULL, 30, 10, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 45, 20, 4, '4', NULL, 35, 12, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 51, 21, 5, '0', NULL, 15, 5, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 52, 22, 5, '1', NULL, 20, 6, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 53, 23, 5, '2', NULL, 25, 8, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 54, 24, 5, '3', NULL, 30, 10, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 55, 25, 5, '4', NULL, 35, 12, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 61, 26, 6, '0', NULL, 15, 5, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 62, 27, 6, '1', NULL, 20, 6, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 63, 28, 6, '2', NULL, 25, 8, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 64, 29, 6, '3', NULL, 30, 10, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 65, 30, 6, '4', NULL, 35, 12, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 71, 31, 7, '0', NULL, 15, 5, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 72, 32, 7, '1', NULL, 20, 6, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 73, 33, 7, '2', NULL, 25, 8, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 74, 34, 7, '3', NULL, 30, 10, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 103, 35, 10, '2', NULL, 25, 8, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 75, 36, 7, '4', NULL, 35, 12, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 81, 37, 8, '0', NULL, 15, 5, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 82, 38, 8, '1', NULL, 20, 6, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 83, 39, 8, '2', NULL, 25, 8, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 84, 40, 8, '3', NULL, 30, 10, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 85, 41, 8, '4', NULL, 35, 12, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 91, 42, 9, '0', NULL, 15, 5, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 92, 43, 9, '1', NULL, 20, 6, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 93, 44, 9, '2', NULL, 25, 8, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 94, 45, 9, '3', NULL, 30, 10, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 95, 46, 9, '4', NULL, 35, 12, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 101, 47, 10, '0', NULL, 15, 5, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 102, 48, 10, '1', NULL, 20, 6, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 104, 49, 10, '3', NULL, 30, 10, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 105, 50, 10, '4', NULL, 35, 12, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 111, 51, 11, '0', NULL, 15, 5, NULL, '{"file_name": "data.txt"}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 112, 52, 11, '1', NULL, 20, 6, NULL, '{"file_name": "data.txt"}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 113, 53, 11, '2', NULL, 25, 8, NULL, '{"file_name": "data.txt"}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 114, 54, 11, '3', NULL, 30, 10, NULL, '{"file_name": "output.txt"}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 115, 55, 11, '4', NULL, 35, 12, NULL, '{"file_name": "note.txt"}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 121, 56, 12, '0', NULL, 15, 5, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 122, 57, 12, '1', NULL, 20, 6, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 123, 58, 12, '2', NULL, 25, 8, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 124, 59, 12, '3', NULL, 30, 10, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 125, 60, 12, '4', NULL, 35, 12, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 131, 61, 13, '0', NULL, 15, 5, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 132, 62, 13, '1', NULL, 20, 6, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 133, 63, 13, '2', NULL, 25, 8, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 134, 64, 13, '3', NULL, 30, 10, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 135, 65, 13, '4', NULL, 35, 12, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 141, 66, 14, '0', NULL, 15, 5, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 142, 67, 14, '1', NULL, 20, 6, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 143, 68, 14, '2', NULL, 25, 8, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 144, 69, 14, '3', NULL, 30, 10, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 225, 70, 22, '4', NULL, 35, 12, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 145, 71, 14, '4', NULL, 35, 12, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 151, 72, 15, '0', NULL, 15, 5, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 152, 73, 15, '1', NULL, 20, 6, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 153, 74, 15, '2', NULL, 25, 8, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 154, 75, 15, '3', NULL, 30, 10, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 155, 76, 15, '4', NULL, 35, 12, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 161, 77, 16, '0', NULL, 15, 5, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 162, 78, 16, '1', NULL, 20, 6, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 163, 79, 16, '2', NULL, 25, 8, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 233, 80, 23, '2', NULL, 25, 8, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 165, 81, 16, '4', NULL, 35, 12, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 171, 82, 17, '0', NULL, 15, 5, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 172, 83, 17, '1', NULL, 20, 6, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 173, 84, 17, '2', NULL, 25, 8, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 174, 85, 17, '3', NULL, 30, 10, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 175, 86, 17, '4', NULL, 35, 12, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 181, 87, 18, '0', NULL, 15, 5, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 182, 88, 18, '1', NULL, 20, 6, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 183, 89, 18, '2', NULL, 25, 8, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 184, 90, 18, '3', NULL, 30, 10, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 231, 91, 23, '0', NULL, 15, 5, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 185, 92, 18, '4', NULL, 35, 12, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 191, 93, 19, '0', NULL, 15, 5, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 192, 94, 19, '1', NULL, 20, 6, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 193, 95, 19, '2', NULL, 25, 8, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 194, 96, 19, '3', NULL, 30, 10, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 195, 97, 19, '4', NULL, 35, 12, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 201, 98, 20, '0', NULL, 15, 5, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 202, 99, 20, '1', NULL, 20, 6, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 203, 100, 20, '2', NULL, 25, 8, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 204, 101, 20, '3', NULL, 30, 10, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 205, 102, 20, '4', NULL, 35, 12, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 211, 103, 21, '0', NULL, 15, 5, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 212, 104, 21, '1', NULL, 20, 6, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 213, 105, 21, '2', NULL, 25, 8, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 214, 106, 21, '3', NULL, 30, 10, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 215, 107, 21, '4', NULL, 35, 12, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 221, 108, 22, '0', NULL, 15, 5, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 222, 109, 22, '1', NULL, 20, 6, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 223, 110, 22, '2', NULL, 25, 8, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 224, 111, 22, '3', NULL, 30, 10, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 232, 112, 23, '1', NULL, 20, 6, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 234, 113, 23, '3', NULL, 30, 10, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 235, 114, 23, '4', NULL, 35, 12, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 241, 115, 24, '0', NULL, 15, 5, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 242, 116, 24, '1', NULL, 20, 6, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 243, 117, 24, '2', NULL, 25, 8, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 244, 118, 24, '3', NULL, 30, 10, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 245, 119, 24, '4', NULL, 35, 12, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('lesson', 164, 120, 16, '3', NULL, 30, 10, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('minigame', 1, 121, 1, 'START', NULL, 15, 5, NULL, '{"rules": [{"condition": "float > 500", "branch_key": "1A"}, {"condition": "float <= 500", "branch_key": "1B"}], "expected_format": "ราคารวมทั้งหมดคือ: {total}"}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('minigame', 2, 122, 1, '1A', NULL, 20, 10, NULL, '{"rules": [{"condition": "value == ''1A_2A''", "branch_key": "1A_2A"}, {"condition": "value == ''1A_2B''", "branch_key": "1A_2B"}], "expected_format": "{value}"}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('minigame', 3, 123, 1, '1B', NULL, 20, 10, NULL, '{"rules": [{"condition": "value == ''1B_2A''", "branch_key": "1B_2A"}, {"condition": "value == ''1B_2B''", "branch_key": "1B_2B"}], "expected_format": "{value}"}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('minigame', 4, 124, 1, '1A_2A', NULL, 30, 15, NULL, '{"rules": [{"condition": "value == ''success''", "branch_key": "end"}], "expected_format": "{value}"}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('minigame', 5, 125, 1, '1A_2B', NULL, 30, 15, NULL, '{"rules": [{"condition": "value == ''success''", "branch_key": "end"}], "expected_format": "{value}"}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('minigame', 6, 126, 1, '1B_2A', NULL, 30, 15, NULL, '{"rules": [{"condition": "value == ''success''", "branch_key": "end"}], "expected_format": "{value}"}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('minigame', 7, 127, 1, '1B_2B', NULL, 30, 15, NULL, '{"rules": [{"condition": "value == ''success''", "branch_key": "end"}], "expected_format": "{value}"}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('minigame', 8, 128, 2, '1', NULL, 15, 5, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('minigame', 9, 129, 2, '2', NULL, 20, 5, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('minigame', 11, 130, 4, '1', NULL, 15, 5, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('minigame', 10, 131, 2, '3', NULL, 25, 5, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('minigame', 12, 132, 4, '2', NULL, 20, 5, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('minigame', 13, 133, 4, '3', NULL, 25, 5, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('minigame', 14, 134, 15, '1', NULL, 15, 5, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('minigame', 15, 135, 15, '2', NULL, 20, 5, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('minigame', 16, 136, 15, '3', NULL, 25, 5, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('minigame', 17, 137, 3, '1', NULL, 15, 5, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('minigame', 18, 138, 3, '2', NULL, 20, 5, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('minigame', 19, 139, 3, '3', NULL, 25, 5, NULL, '{}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 20, 170, NULL, NULL, 'medium', 0, 0, NULL, '{"work_chars": 34}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.848279', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 21, 176, NULL, NULL, 'hard', 0, 0, NULL, '{"work_chars": 81}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.852855', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 22, 175, NULL, NULL, 'hard', 0, 0, NULL, '{"work_chars": 72}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.859099', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 23, 185, NULL, NULL, 'hard', 0, 0, NULL, '{"work_chars": 91}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.864644', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 25, 179, NULL, NULL, 'hard', 0, 0, NULL, '{"work_chars": 35}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.880463', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 26, 163, NULL, NULL, 'easy', 0, 0, NULL, '{"work_chars": 21}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.88674', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 27, 160, NULL, NULL, 'easy', 0, 0, NULL, '{"work_chars": 10}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.891459', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 28, 167, NULL, NULL, 'easy', 0, 0, NULL, '{"work_chars": 16}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.895825', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 29, 182, NULL, NULL, 'easy', 0, 0, NULL, '{"work_chars": 24}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.900836', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 30, 162, NULL, NULL, 'easy', 0, 0, NULL, '{"work_chars": 28}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.905388', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 31, 192, NULL, NULL, 'medium', 0, 0, NULL, '{"work_chars": 40}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.909681', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 32, 168, NULL, NULL, 'medium', 0, 0, NULL, '{"work_chars": 19}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.915021', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 33, 189, NULL, NULL, 'medium', 0, 0, NULL, '{"work_chars": 15}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.920927', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 34, 181, NULL, NULL, 'medium', 0, 0, NULL, '{"work_chars": 35}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.926375', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 35, 164, NULL, NULL, 'medium', 0, 0, NULL, '{"work_chars": 18}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.931555', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 36, 165, NULL, NULL, 'hard', 0, 0, NULL, '{"work_chars": 42}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.941432', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 37, 166, NULL, NULL, 'hard', 0, 0, NULL, '{"work_chars": 30}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.947419', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 38, 190, NULL, NULL, 'hard', 0, 0, NULL, '{"work_chars": 16}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.952386', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 39, 191, NULL, NULL, 'hard', 0, 0, NULL, '{"work_chars": 33}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.957173', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 40, 178, NULL, NULL, 'hard', 0, 0, NULL, '{"work_chars": 28}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.962075', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 1, 158, NULL, NULL, 'easy', 0, 0, NULL, '{"work_chars": 30}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.718077', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 2, 153, NULL, NULL, 'easy', 0, 0, NULL, '{"work_chars": 17}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.727237', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 3, 155, NULL, NULL, 'easy', 0, 0, NULL, '{"work_chars": 14}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.733407', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 4, 180, NULL, NULL, 'easy', 0, 0, NULL, '{"work_chars": 10}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.741587', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 5, 171, NULL, NULL, 'easy', 0, 0, NULL, '{"work_chars": 20}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.748097', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 6, 172, NULL, NULL, 'easy', 0, 0, NULL, '{"work_chars": 36}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.756701', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 7, 169, NULL, NULL, 'easy', 0, 0, NULL, '{"work_chars": 23}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.762391', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 8, 157, NULL, NULL, 'easy', 0, 0, NULL, '{"work_chars": 27}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.769702', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 9, 156, NULL, NULL, 'easy', 0, 0, NULL, '{"work_chars": 19}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.77577', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 10, 154, NULL, NULL, 'easy', 0, 0, NULL, '{"work_chars": 18}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.782789', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 11, 159, NULL, NULL, 'medium', 0, 0, NULL, '{"work_chars": 29}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.789001', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 12, 184, NULL, NULL, 'medium', 0, 0, NULL, '{"work_chars": 38}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.796369', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 13, 186, NULL, NULL, 'medium', 0, 0, NULL, '{"work_chars": 66}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.805755', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 14, 174, NULL, NULL, 'medium', 0, 0, NULL, '{"work_chars": 33}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.813405', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 15, 173, NULL, NULL, 'medium', 0, 0, NULL, '{"work_chars": 22}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.819123', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('competitive', 1, 140, NULL, NULL, 'Easy', 0, 800, 300, '{"is_test": 0, "expires_at": "2026-07-23T16:04:37.683Z"}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', '2026-07-23 23:04:37.683153');
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('competitive', 2, 141, NULL, NULL, 'Easy', 0, 1000, 300, '{"is_test": 0, "expires_at": "2026-07-23T16:04:37.683Z"}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', '2026-07-23 23:04:37.683153');
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('competitive', 3, 142, NULL, NULL, 'Easy', 0, 500, 300, '{"is_test": 0, "expires_at": "2026-07-23T16:04:37.683Z"}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', '2026-07-23 23:04:37.683153');
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('competitive', 4, 143, NULL, NULL, 'Easy', 0, 350, 9999999, '{"is_test": 1, "expires_at": "2099-12-31T16:59:59.000Z"}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', '2099-12-31 23:59:59');
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('competitive', 5, 144, NULL, NULL, 'Easy', 0, 500, 9999999, '{"is_test": 1, "expires_at": "2099-12-31T16:59:59.000Z"}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', '2099-12-31 23:59:59');
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('competitive', 6, 145, NULL, NULL, 'Easy', 0, 950, 500, '{"is_test": 0, "expires_at": "2026-07-17T16:25:31.913Z"}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', '2026-07-17 23:25:31.913');
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('competitive', 14, 146, NULL, NULL, 'Easy', 0, 300, 300, '{"is_test": 0, "expires_at": "2026-07-29T06:12:35.630Z"}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', '2026-07-29 13:12:35.63');
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 16, 187, NULL, NULL, 'medium', 0, 0, NULL, '{"work_chars": 30}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.824094', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 17, 183, NULL, NULL, 'medium', 0, 0, NULL, '{"work_chars": 14}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.83068', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 18, 177, NULL, NULL, 'medium', 0, 0, NULL, '{"work_chars": 54}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.835827', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 19, 161, NULL, NULL, 'medium', 0, 0, NULL, '{"work_chars": 40}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.842771', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('arcade', 24, 188, NULL, NULL, 'hard', 0, 0, NULL, '{"work_chars": 59}', 1, '2026-08-24 20:43:54.978192', '2026-08-25 21:04:18.874157', NULL);
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('competitive', 15, 147, NULL, NULL, 'Easy', 0, 300, 300, '{"is_test": 0, "expires_at": "2026-07-30T06:45:24.738Z"}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', '2026-07-30 13:45:24.738');
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('competitive', 16, 148, NULL, NULL, 'Easy', 0, 100, 300, '{"is_test": 0, "expires_at": "2026-08-16T12:11:42.681Z"}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', '2026-08-16 19:11:42.681');
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('competitive', 17, 149, NULL, NULL, 'Easy', 0, 200, 300, '{"is_test": 0, "expires_at": "2026-08-16T13:11:11.414Z"}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', '2026-08-16 20:11:11.414');
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('competitive', 18, 150, NULL, NULL, 'Admin', 0, 100, 300, '{"is_test": 0, "expires_at": "2026-08-16T14:55:18.715Z"}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', '2026-08-16 21:55:18.715');
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('competitive', 19, 151, NULL, NULL, 'Admin', 0, 200, 300, '{"is_test": 0, "expires_at": "2026-08-16T16:10:50.824Z"}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', '2026-08-16 23:10:50.824');
INSERT INTO public.problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty, xp_reward, coin_reward, time_limit_sec, extra, is_active, created_at, updated_at, expires_at) VALUES ('competitive', 20, 152, NULL, NULL, 'Easy', 0, 200, 300, '{"is_test": 0, "expires_at": "2026-08-17T01:17:47.151Z"}', 1, '2026-08-24 20:43:54.978192', '2026-08-24 20:43:54.978192', '2026-08-17 08:17:47.151');


--
-- Data for Name: exercises_files; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.exercises_files (file_id, exercise_id, file_name, file_content, created_at) VALUES (3, 111, 'data.txt', 'Hello, Python!', '2026-08-15 20:38:53+00');
INSERT INTO public.exercises_files (file_id, exercise_id, file_name, file_content, created_at) VALUES (4, 112, 'data.txt', 'Hello, Python!', '2026-08-15 20:38:53+00');
INSERT INTO public.exercises_files (file_id, exercise_id, file_name, file_content, created_at) VALUES (5, 113, 'data.txt', 'Hello, Python!
Welcome to File I/O.', '2026-08-15 20:38:53+00');


--
-- Data for Name: modules; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.modules (module_id, title, description, order_index, is_locked, required_level) VALUES (1, 'เริ่มต้นรู้จักกับภาษาไพธอน', NULL, 1, 0, 0);
INSERT INTO public.modules (module_id, title, description, order_index, is_locked, required_level) VALUES (2, 'ตัวแปรและการจัดการข้อมูล', NULL, 2, 0, 0);
INSERT INTO public.modules (module_id, title, description, order_index, is_locked, required_level) VALUES (3, 'นิพจน์และตัวดำเนินการ', NULL, 3, 0, 1);
INSERT INTO public.modules (module_id, title, description, order_index, is_locked, required_level) VALUES (4, 'การควบคุมทิศทางและการทำงานซ้ำ', NULL, 4, 0, 2);
INSERT INTO public.modules (module_id, title, description, order_index, is_locked, required_level) VALUES (5, 'การใช้งานฟังก์ชัน', NULL, 5, 0, 3);
INSERT INTO public.modules (module_id, title, description, order_index, is_locked, required_level) VALUES (6, 'โมดูลและแพ็กเกจ', NULL, 6, 0, 4);
INSERT INTO public.modules (module_id, title, description, order_index, is_locked, required_level) VALUES (7, 'การจัดการข้อผิดพลาด', NULL, 7, 0, 5);
INSERT INTO public.modules (module_id, title, description, order_index, is_locked, required_level) VALUES (8, 'การจัดการแฟ้มข้อมูล', NULL, 8, 0, 6);
INSERT INTO public.modules (module_id, title, description, order_index, is_locked, required_level) VALUES (9, 'การเขียนโปรแกรมเชิงวัตถุ', NULL, 9, 0, 7);


--
-- Data for Name: lessons; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.lessons (lesson_id, module_id, title, content, order_index, required_level, description) VALUES (1, 1, 'ทำความรู้จักและโครงสร้างการเขียนโปรแกรมภาษาไพธอน', NULL, 1, 0, NULL);
INSERT INTO public.lessons (lesson_id, module_id, title, content, order_index, required_level, description) VALUES (2, 1, 'ไวยากรณ์พื้นฐาน และคำสั่งแสดงผล print()', NULL, 2, 0, NULL);
INSERT INTO public.lessons (lesson_id, module_id, title, content, order_index, required_level, description) VALUES (3, 1, 'คำสั่งรับค่า input() และการแปลงชนิดข้อมูล', NULL, 3, 0, NULL);
INSERT INTO public.lessons (lesson_id, module_id, title, content, order_index, required_level, description) VALUES (4, 1, 'การจัดรูปแบบสายอักขระ ตัวเลข และคำสั่ง help()', NULL, 4, 0, NULL);
INSERT INTO public.lessons (lesson_id, module_id, title, content, order_index, required_level, description) VALUES (5, 2, 'หลักการตั้งชื่อตัวแปร การใช้งานตัวแปร และคำสงวน', NULL, 1, 0, NULL);
INSERT INTO public.lessons (lesson_id, module_id, title, content, order_index, required_level, description) VALUES (6, 2, 'ชนิดข้อมูลพื้นฐาน (Numbers & Strings)', NULL, 2, 0, NULL);
INSERT INTO public.lessons (lesson_id, module_id, title, content, order_index, required_level, description) VALUES (7, 2, 'ชนิดข้อมูลเชิงประกอบ (List, Tuple, Dictionary, Set)', NULL, 3, 0, NULL);
INSERT INTO public.lessons (lesson_id, module_id, title, content, order_index, required_level, description) VALUES (8, 3, 'ตัวดำเนินการคำนวณ เปรียบเทียบ กำหนดค่า และตรรกศาสตร์', NULL, 1, 1, NULL);
INSERT INTO public.lessons (lesson_id, module_id, title, content, order_index, required_level, description) VALUES (9, 3, 'ตัวดำเนินการระดับบิต สมาชิก (in) และเอกลักษณ์ (is)', NULL, 2, 1, NULL);
INSERT INTO public.lessons (lesson_id, module_id, title, content, order_index, required_level, description) VALUES (10, 3, 'ลำดับความสำคัญของตัวดำเนินการ', NULL, 3, 1, NULL);
INSERT INTO public.lessons (lesson_id, module_id, title, content, order_index, required_level, description) VALUES (11, 4, 'การควบคุมทิศทางแบบเลือกทำ (if, else, elif, nested if)', NULL, 1, 2, NULL);
INSERT INTO public.lessons (lesson_id, module_id, title, content, order_index, required_level, description) VALUES (12, 4, 'การทำงานซ้ำด้วย While loop และ For loop (พร้อม range)', NULL, 2, 2, NULL);
INSERT INTO public.lessons (lesson_id, module_id, title, content, order_index, required_level, description) VALUES (13, 4, 'คำสั่งควบคุมลูป (break, continue, pass) และลูปซ้อนลูป', NULL, 3, 2, NULL);
INSERT INTO public.lessons (lesson_id, module_id, title, content, order_index, required_level, description) VALUES (14, 5, 'พื้นฐานการสร้าง เรียกใช้ และประโยชน์ของฟังก์ชัน', NULL, 1, 3, NULL);
INSERT INTO public.lessons (lesson_id, module_id, title, content, order_index, required_level, description) VALUES (15, 5, 'การส่งผ่านอาร์กิวเมนต์ประเภทต่าง ๆ และ Anonymous/Lambda Function', NULL, 2, 3, NULL);
INSERT INTO public.lessons (lesson_id, module_id, title, content, order_index, required_level, description) VALUES (16, 5, 'การส่งค่ากลับ (return) ขอบเขตตัวแปร (Scope) และ Recursion', NULL, 3, 3, NULL);
INSERT INTO public.lessons (lesson_id, module_id, title, content, order_index, required_level, description) VALUES (17, 6, 'การใช้งานโมดูล และคำสั่งนำเข้า (import / from...import)', NULL, 1, 4, NULL);
INSERT INTO public.lessons (lesson_id, module_id, title, content, order_index, required_level, description) VALUES (18, 6, 'ตำแหน่งการโหลดโมดูล (PYTHONPATH) และการสร้างแพ็กเกจ (Packages)', NULL, 2, 4, NULL);
INSERT INTO public.lessons (lesson_id, module_id, title, content, order_index, required_level, description) VALUES (19, 7, 'ทำความรู้จักและจัดการข้อผิดพลาด (Exception Handling / try...except)', NULL, 1, 5, NULL);
INSERT INTO public.lessons (lesson_id, module_id, title, content, order_index, required_level, description) VALUES (20, 7, 'การสร้าง Exception เอง (raise) และการตรวจสอบสมมติฐาน (Assertions)', NULL, 2, 5, NULL);
INSERT INTO public.lessons (lesson_id, module_id, title, content, order_index, required_level, description) VALUES (21, 8, 'การเปิด-ปิด และอ่าน-เขียนข้อมูลในไฟล์ (File Handling)', NULL, 1, 6, NULL);
INSERT INTO public.lessons (lesson_id, module_id, title, content, order_index, required_level, description) VALUES (22, 8, 'การใช้คำสั่ง with ร่วมกับไฟล์ และการจัดการโฟลเดอร์/ไดเรกทอรี', NULL, 2, 6, NULL);
INSERT INTO public.lessons (lesson_id, module_id, title, content, order_index, required_level, description) VALUES (23, 9, 'แนวคิด OOP การสร้างคลาส (Class) และวัตถุ (Instance)', NULL, 1, 7, NULL);
INSERT INTO public.lessons (lesson_id, module_id, title, content, order_index, required_level, description) VALUES (24, 9, 'การสืบทอดคุณสมบัติ (Inheritance) และ Overriding / Overloading', NULL, 2, 7, NULL);


--
-- Data for Name: lesson_quizzes; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (1, 1, 'pre');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (2, 1, 'post');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (3, 2, 'pre');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (4, 2, 'post');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (5, 3, 'pre');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (6, 3, 'post');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (7, 4, 'pre');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (8, 4, 'post');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (9, 5, 'pre');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (10, 5, 'post');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (13, 7, 'pre');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (14, 7, 'post');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (15, 8, 'pre');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (16, 8, 'post');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (17, 9, 'pre');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (18, 9, 'post');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (19, 10, 'pre');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (20, 10, 'post');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (21, 11, 'pre');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (22, 11, 'post');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (23, 12, 'pre');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (24, 12, 'post');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (25, 13, 'pre');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (26, 13, 'post');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (27, 14, 'pre');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (28, 14, 'post');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (29, 15, 'pre');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (30, 15, 'post');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (31, 16, 'pre');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (32, 16, 'post');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (33, 17, 'pre');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (34, 17, 'post');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (35, 18, 'pre');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (36, 18, 'post');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (37, 19, 'pre');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (38, 19, 'post');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (39, 20, 'pre');
INSERT INTO public.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES (40, 20, 'post');


--
-- Data for Name: lesson_slides; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (34, 1, 1, 'ทำความรู้จักกับภาษา Python', 'Python เป็นภาษาโปรแกรมระดับสูง (High-level Language) พัฒนาโดย Guido van Rossum ในปี 1991

จุดเด่นคือ อ่านง่าย เขียนง่าย มีไวยากรณ์ใกล้เคียงกับภาษาอังกฤษ เหมาะอย่างยิ่งสำหรับผู้ที่เริ่มต้นฝึกเขียนโปรแกรมค่ะ', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (35, 1, 2, 'ทำไมต้องเรียนภาษา Python?', '1. Easy to Learn: ไวยากรณ์ไม่ซับซ้อน เข้าใจง่าย
2. Versatile: ใช้งานได้หลากหลาย เช่น Web, Data Science, AI, Automation
3. Large Community: มีไลบรารี (Libraries) และตัวช่วยให้เลือกใช้งานจำนวนมาก
4. Cross-Platform: รันได้ทุกระบบปฏิบัติการ (Windows, macOS, Linux)', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (36, 1, 3, 'โครงสร้างพื้นฐานของโปรแกรม Python', 'โครงสร้างของไฟล์ไพธอน (.py) ประกอบด้วย 4 ส่วนหลัก:
1. Comments (คำอธิบายโค้ด)
2. Imports (การดึงโมดูลภายนอกมาใช้)
3. Variables & Data (การสร้างตัวแปรและเก็บข้อมูล)
4. Logic & Statements (คำสั่งประมวลผลและการแสดงผล)', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (37, 1, 4, 'คำอธิบายโค้ด (Comments)', 'Comment ใช้สำหรับเขียนอธิบายโค้ดเพื่อให้อ่านเข้าใจง่ายขึ้น โดย Python จะข้ามการประมวลผลในบรรทัดที่เป็น Comment

- ใช้เครื่องหมาย # สำหรับ Comment บรรทัดเดียว
- ใช้ """ ... """ สำหรับ Comment หลายบรรทัด (Docstring)', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (38, 1, 5, 'ตัวอย่างการเขียน Comment', '# นี่คือ Comment แบบบรรทัดเดียว
x = 10  # กำหนดค่า 10 ให้ตัวแปร x

"""
นี่คือ Comment
แบบหลายบรรทัด
ใช้สำหรับอธิบายโปรแกรมยาวๆ
"""', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (39, 1, 6, 'การย่อหน้า (Indentation) เรื่องสำคัญที่สุด!', 'Python ต่างจากภาษาอื่นตรงที่ **ใช้การย่อหน้า (Indentation)** ในการแบ่งบล็อกการทำงาน (Code Block) แทนการใช้ปีกกา {}

- มาตรฐานนิยมใช้การเว้นวรรค 4 ช่อง (Spaces) หรือกด Tab
- หากย่อหน้าไม่ถูกต้อง โปรแกรมจะฟ้อง IndentationError ทันที', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (40, 1, 7, 'ตัวอย่าง Indentation ใน Python', '# การเขียนที่ถูกต้อง
if True:
    print("บล็อกนี้ทำงานเมื่อเงื่อนไขเป็นจริง")  # ย่อหน้าเข้า 4 ช่อง
    print("บรรทัดนี้ก็อยู่ในบล็อกเดียวกัน")

print("บรรทัดนี้อยู่นอกบล็อกแล้ว")', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (41, 1, 8, 'การประมวลผลตามลำดับ (Execution Order)', 'โปรแกรม Python จะอ่านและประมวลผลคำสั่ง **จากบนลงล่าง และจากซ้ายไปขวา** ทีละบรรทัด

หากเกิดข้อผิดพลาด (Error) ที่บรรทัดใด โปรแกรมจะหยุดทำงานทันทีที่บรรทัดนั้น', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (42, 1, 9, 'โปรแกรมแรกของคุณ: Hello, World!', 'ลองมาดูคำสั่งแรกที่เรานิยมเขียนกัน นั่นคือคำสั่งแสดงข้อความออกทางหน้าจอค่ะ

ตัวอย่างโค้ด:
print("Hello, Python!")

ผลลัพธ์ที่ได้:
Hello, Python!', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (43, 1, 10, 'สรุปโครงสร้างการเขียนโปรแกรม Python', '1. ไม่ต้องใส่ ; (Semicolon) ปิดท้ายบรรทัด
2. ตัวอักษรพิมพ์เล็ก-พิมพ์ใหญ่ต่างกัน (Case-sensitive)
3. ให้ความสำคัญกับการย่อหน้า (Indentation)
4. ใช้ # ในการบันทึกคำอธิบายโค้ด', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (44, 2, 1, 'ไวยากรณ์พื้นฐาน (Python Syntax Basics)', 'ไวยากรณ์ (Syntax) คือกฎเกณฑ์ในการเขียนโค้ดเพื่อให้คอมพิวเตอร์เข้าใจ

ข้อควรจำสำคัญของ Python:
1. ไม่ต้องใส่ ; (Semicolon) ปิดท้ายบรรทัดเหมือนภาษา C/Java
2. ตัวอักษรพิมพ์เล็ก-พิมพ์ใหญ่ต่างกัน (Case-sensitive)
3. ใช้การย่อหน้า (Indentation) ในการแบ่งบล็อกการทำงาน', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (45, 2, 2, 'รู้จักกับคำสั่งแสดงผล print()', 'ฟังก์ชัน `print()` เป็นคำสั่งพื้นฐานที่ใช้สำหรับแสดงผลข้อความ ตัวแปร หรือผลลัพธ์การคำนวณออกทางหน้าจอภาพ

รูปแบบคำสั่ง:
print(สิ่งที่ต้องการแสดงผล)', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (46, 2, 3, 'การแสดงผลข้อความ (String Quotation)', 'หากต้องการแสดงผลข้อความ ต้องครอบด้วยเครื่องหมายอัญประกาศ โดยเลือกใช้ได้ทั้ง Single Quote ('''') หรือ Double Quote ("")

ตัวอย่างโค้ด:
print("Hello, World!")
print(''ยินดีต้อนรับสู่การเขียนโปรแกรม'')', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (59, 3, 6, 'การแปลงค่า input() เป็นจำนวนเต็มด้วย int()', 'หากต้องการรับค่าตัวเลขจำนวนเต็มเพื่อนำไปคำนวณ ให้ซ้อนฟังก์ชัน `int()` ไว้รอบนอกของ `input()`

ตัวอย่างโค้ด:
age = int(input("กรอกอายุของคุณ: "))
next_year = age + 1
print("ปีหน้าคุณจะมีอายุ:", next_year, "ปี")', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (47, 2, 4, 'การพิมพ์ข้อมูลหลายค่าในบรรทัดเดียว', 'เราสามารถสั่งแสดงผลข้อมูลหลายๆ ค่าพร้อมกันได้ โดยใช้เครื่องหมายจุลภาค ( , ) คั่นระหว่างข้อมูล Python จะเว้นวรรคให้อัตโนมัติ

ตัวอย่างโค้ด:
print("คะแนนของคุณคือ:", 100, "คะแนน")

ผลลัพธ์:
คะแนนของคุณคือ: 100 คะแนน', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (48, 2, 5, 'อักขระพิเศษสำหรับการจัดแถว (Escape Characters)', 'เราใช้เครื่องหมาย Backslash ( \ ) ร่วมกับตัวอักษรเพื่อสร้างการจัดระเบียบข้อความพิเศษ:

- `\n` : ขึ้นบรรทัดใหม่ (New Line)
- `\t` : เว้นระยะแท็บ (Tab)

ตัวอย่างโค้ด:
print("บรรทัดที่ 1\nบรรทัดที่ 2")
print("ชื่อ:\tสมชาย")', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (49, 2, 6, 'เทคนิคการเปลี่ยนตัวคั่นด้วย sep', 'โดยปกติ `print()` จะคั่นระหว่างข้อมูลด้วยช่องว่าง แต่เราสามารถเปลี่ยนเป็นตัวอักษรอื่นได้ด้วยพารามิเตอร์ `sep` (Separator)

ตัวอย่างโค้ด:
print("25", "12", "2026", sep="/")
print("python", "gmail.com", sep="@")

ผลลัพธ์:
25/12/2026
python@gmail.com', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (50, 2, 7, 'เทคนิคการต่อบรรทัดด้วย end', 'โดยปกติ `print()` จะขึ้นบรรทัดใหม่ให้เสมอหลังทำงานเสร็จ แต่เราสามารถใช้ `end` เพื่อกำหนดตัวปิดท้ายไม่ให้ขึ้นบรรทัดใหม่ได้

ตัวอย่างโค้ด:
print("Loading...", end="")
print("Done!")

ผลลัพธ์:
Loading...Done!', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (51, 2, 8, 'การแสดงผลลัพธ์จากการคำนวณ', 'เราสามารถใส่สมการตัวเลขลงใน `print()` เพื่อให้คำนวณและแสดงผลลัพธ์ออกมาได้ทันที

ตัวอย่างโค้ด:
print(10 + 20)
print("5 x 4 =", 5 * 4)

ผลลัพธ์:
30
5 x 4 = 20', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (52, 2, 9, 'ข้อผิดพลาดที่มักพบบ่อย (Common Errors)', '1. `NameError`: ลืมใส่เครื่องหมายอัญประกาศครอบข้อความ เช่น print(Hello)
2. `SyntaxError`: ลืมใส่เครื่องหมายวงเล็บปิด หรือลืมใส่เครื่องหมายจุลภาค ( , ) คั่นตัวแปร
3. `IndentationError`: เว้นวรรคหน้าคำสั่ง print() โดยไม่มีเหตุผล', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (53, 2, 10, 'สรุปเรื่องคำสั่ง print()', '1. `print()` ใช้แสดงผลข้อมูลออกทางหน้าจอ
2. ข้อความต้องครอบด้วย '' '' หรือ " "
3. ใช้ `,` คั่นข้อมูลหลายตัว
4. ปรับแต่งการแสดงผลขั้นสูงได้ด้วย `sep` และ `end`', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (54, 3, 1, 'รู้จักกับคำสั่งรับข้อมูล input()', 'ฟังก์ชัน `input()` ใช้สำหรับรับข้อมูลจากผู้ใช้ผ่านทางคีย์บอร์ด

เมื่อโปรแกรมทำงานมาถึงคำสั่งนี้ โปรแกรมจะหยุดรอ (Pause) จนกว่าผู้ใช้งานจะพิมพ์ข้อมูลเสร็จแล้วกด Enter

รูปแบบคำสั่ง:
ตัวแปร = input("ข้อความแจ้งผู้ใช้")', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (55, 3, 2, 'การใช้งาน input() เบื้องต้น', 'เรานิยมสร้างตัวแปรมาเก็บค่าที่ได้จาก `input()` เพื่อนำไปใช้งานต่อในโปรแกรม

ตัวอย่างโค้ด:
name = input("กรุณากรอกชื่อของคุณ: ")
print("สวัสดีคุณ", name)

ผลลัพธ์:
กรุณากรอกชื่อของคุณ: สมชาย
สวัสดีคุณ สมชาย', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (56, 3, 3, 'กฎเหล็กของ input(): ค่าที่ได้เป็น String เสมอ!', 'ข้อควรระวังที่สำคัญที่สุด! ข้อมูลทุกอย่างที่รับผ่าน `input()` จะมีชนิดข้อมูลเป็น **ข้อความ (String)** เสมอ แม้ว่าผู้ใช้จะพิมพ์ตัวเลขลงไปก็ตาม

ตัวอย่างโค้ด:
age = input("กรอกอายุ: ") # ผู้ใช้พิมพ์ 20
print(type(age))        # ผลลัพธ์คือ <class ''str''>', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (57, 3, 4, 'ปัญหาของการนำ input() ไปบวกตัวเลขตรงๆ', 'หากเรานำข้อมูลจาก `input()` ไปบวกตัวเลขโดยไม่แปลงค่า Python จะมองเป็นการ **นำข้อความมาต่อกัน** ไม่ใช่การคำนวณทางคณิตศาสตร์

ตัวอย่างปัญหา:
x = input("ใส่เลขแรก: ")  # กรอก 10
y = input("ใส่เลขสอง: ")  # กรอก 20
print(x + y)             # ผลลัพธ์กลายเป็น "1020" ไม่ใช่ 30!', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (58, 3, 5, 'การแปลงชนิดข้อมูล (Type Casting) คืออะไร?', 'การแปลงชนิดข้อมูล (Type Casting) คือการเปลี่ยนรูปแบบข้อมูลจากชนิดหนึ่งไปเป็นอีกชนิดหนึ่ง เพื่อให้สามารถนำไปประมวลผลต่อได้อย่างถูกต้อง

ฟังก์ชันแปลงข้อมูลที่ใชักันบ่อย:
- `int()` : แปลงเป็นจำนวนเต็ม (Integer)
- `float()` : แปลงเป็นทศนิยม (Float)
- `str()` : แปลงเป็นข้อความ (String)', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (60, 3, 7, 'การแปลงค่า input() เป็นทศนิยมด้วย float()', 'หากข้อมูลที่รับอาจมีจุดทศนิยม เช่น ราคา น้ำหนัก หรือส่วนสูง ให้ใช้ฟังก์ชัน `float()`

ตัวอย่างโค้ด:
price = float(input("ราคาสินค้า: "))
vat = price * 0.07
total = price + vat
print("ราคารวมภาษี:", total)', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (61, 3, 8, 'การแปลงข้อมูลชนิดอื่นกลับเป็น ข้อความด้วย str()', 'บางกรณีที่เราต้องการนำตัวเลขไปเชื่อมต่อกับข้อความ เราสามารถใช้ `str()` แปลงตัวเลขให้กลายเป็นข้อความก่อนได้

ตัวอย่างโค้ด:
score = 95
message = "คะแนนของคุณคือ " + str(score) + " คะแนน"
print(message)', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (62, 3, 9, 'ข้อผิดพลาด ValueError ที่มักเจอบ่อย', 'หากเราใช้ `int()` หรือ `float()` แปลงข้อมูล แต่ผู้ใช้กรอกตัวอักษรที่ไม่ใช่ตัวเลขลงมา โปรแกรมจะเกิด `ValueError` ทันที

ตัวอย่าง:
age = int(input("กรอกอายุ: ")) # ผู้ใช้พิมพ์ "abc"
# เกิดข้อผิดพลาด: ValueError: invalid literal for int() with base 10: ''abc''', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (63, 3, 10, 'สรุปเรื่อง input() และการแปลงชนิดข้อมูล', '1. `input()` รับข้อมูลเข้าเป็น String เสมอ
2. ถ้าจะนำไปคำนวณตัวเลข ต้องแปลงด้วย `int()` หรือ `float()` ก่อน
3. การซ้อนฟังก์ชัน เช่น `int(input())` ช่วยให้รับค่าและแปลงข้อมูลได้จบในบรรทัดเดียว', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (64, 4, 1, 'ปัญหาของการต่อข้อความแบบเดิม', 'การนำตัวแปรหลายตัวมารวมกับข้อความด้วยเครื่องหมาย + หรือ , มักจะเขียนยากและดูรกสายตา

ตัวอย่างแบบเดิม:
print("คุณ " + name + " มีเงิน " + str(money) + " บาท")

 Python จึงมีเทคนิคการจัดรูปแบบข้อความที่ง่ายกว่า เรียกว่า **f-string**', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (65, 4, 2, 'การจัดรูปแบบด้วย f-string (Formatted String)', 'f-string เป็นวิธีที่นิยมที่สุดในปัจจุบัน เพียงเติมอักษร `f` ไว้หน้าเครื่องหมายอัญประกาศ แล้วแทรกชื่อตัวแปรในเครื่องหมายปีกกา `{ }` ได้เลย

ตัวอย่างโค้ด:
name = "สมชาย"
age = 20
print(f"คุณ {name} มีอายุ {age} ปี")

ผลลัพธ์:
คุณ สมชาย มีอายุ 20 ปี', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (66, 4, 3, 'การคำนวณและใส่ นิพจน์ ใน f-string', 'เราสามารถใส่สมการหรือการคำนวณลงในปีกกา `{ }` ของ f-string ได้โดยตรง

ตัวอย่างโค้ด:
price = 100
quantity = 3
print(f"ราคารวม: {price * quantity} บาท")
print(f"ปีหน้าคุณจะมีอายุ: {age + 1} ปี")', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (67, 4, 4, 'การจัดรูปแบบตัวเลขทศนิยม (Float Formatting)', 'เราสามารถกำหนดจำนวนหลักทศนิยมที่ต้องการแสดงผลได้โดยใช้ `:.2f` (ทศนิยม 2 ตำแหน่ง)

ตัวอย่างโค้ด:
pi = 3.14159265
price = 129.5
print(f"ค่า Pi: {pi:.2f}")     # แสดง 3.14 (ปัดเศษให้อัตโนมัติ)
print(f"ราคา: {price:.2f}")    # แสดง 129.50', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (68, 4, 5, 'การใส่เครื่องหมายจุลภาคคั่นหลักพัน (Comma Separator)', 'สำหรับตัวเลขจำนวนมาก สามารถเติมเครื่องหมาย `,` ใน f-string เพื่อให้แสดงผลคั่นหลักพันอ่านง่ายขึ้น

ตัวอย่างโค้ด:
salary = 1500000
print(f"เงินเดือน: {salary:,} บาท")
print(f"ยอดรวม: {salary:,.2f} บาท")

ผลลัพธ์:
เงินเดือน: 1,500,000 บาท
ยอดรวม: 1,500,000.00 บาท', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (69, 4, 6, 'การเติมศูนย์ (Zero Padding) ด้านหน้าตัวเลข', 'หากต้องการปรับตัวเลขให้มีความยาวเท่ากันเสมอ เช่น รหัสสินค้า ให้ใช้รูปแบบ `:0Nd` (N คือจำนวนหลักรวม)

ตัวอย่างโค้ด:
id1 = 7
id2 = 45
print(f"รหัสที่ 1: {id1:04d}")
print(f"รหัสที่ 2: {id2:04d}")

ผลลัพธ์:
รหัสที่ 1: 0007
รหัสที่ 2: 0045', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (70, 4, 7, 'การจัดตำแหน่งข้อความ (Alignment)', 'เราสามารถจัดข้อความ ชิดซ้าย (`<`), ชิดขวา (`>`), หรือ ตรงกลาง (`^`) พร้อมกำหนดความกว้างได้

ตัวอย่างโค้ด:
text = "Python"
print(f"|{text:<10}|")  # ชิดซ้าย เว้นกว้าง 10
print(f"|{text:>10}|")  # ชิดขวา เว้นกว้าง 10
print(f"|{text:^10}|")  # ตรงกลาง เว้นกว้าง 10', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (71, 4, 8, 'รู้จักกับคำสั่งช่วยเหลือ help()', 'ฟังก์ชัน `help()` เป็นคำสั่งคู่มือติดตัวของ Python ใช้ค้นหาคำอธิบาย และวิธีการใช้งานคำสั่งหรือฟังก์ชันต่างๆ ได้ทันที

รูปแบบคำสั่ง:
help(ชื่อฟังก์ชัน)', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (72, 4, 9, 'ตัวอย่างการใช้งานคำสั่ง help()', 'เราสามารถส่งชื่อฟังก์ชันเข้าไปใน `help()` เพื่ออ่านรายละเอียดใน Terminal/Console

ตัวอย่างโค้ด:
# ดูคู่มือการใช้งานฟังก์ชัน print
help(print)

# ดูคู่มือการใช้งานฟังก์ชัน input
help(input)', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (73, 4, 10, 'สรุปเรื่องการจัดรูปแบบและ help()', '1. ใช้ `f"..."` และแทรกตัวแปรใน `{ }` เพื่อแสดงผลแบบ f-string
2. ใช้ `:.2f` กำหนดทศนิยม และใช้ `:,` คั่นหลักพัน
3. ใช้ `:04d` เติมศูนย์ข้างหน้าตัวเลข
4. ใช้ `help(ฟังก์ชัน)` เมื่อต้องการอ่านคู่มือคำสั่งใน Python', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (74, 5, 1, 'ตัวแปร (Variables) ในภาษา Python คืออะไร?', 'ตัวแปร คือ "ป้ายชื่อ" ที่ใช้ระบุตำแหน่งจัดเก็บข้อมูลในหน่วยความจำ (RAM) ของคอมพิวเตอร์

- ช่วยให้เราสามารถอ้างอิงและนำข้อมูลกลับมาใช้หรือแก้ไขในภายหลังได้
- ไม่จำเป็นต้องประกาศชนิดข้อมูลล่วงหน้า (Dynamic Typing) ไพธอนจะจัดการให้อัตโนมัติ', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (75, 5, 2, 'การสร้างและกำหนดค่าให้ตัวแปร', 'เราใช้เครื่องหมายเท่ากับ ( = ) ในการกำหนดค่า (Assignment) ให้กับตัวแปร

รูปแบบ:
ชื่อตัวแปร = ข้อมูลที่ต้องการเก็บ

ตัวอย่างโค้ด:
age = 25
name = "Alice"
price = 99.50
is_online = True', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (76, 5, 3, 'กฎเหล็ก 5 ข้อในการตั้งชื่อตัวแปร (Naming Rules)', '1. ต้องขึ้นต้นด้วย **ตัวอักษร (a-z, A-Z)** หรือ **เครื่องหมายขีดล่าง ( _ )** เท่านั้น
2. **ห้ามขึ้นต้นด้วยตัวเลข** (เช่น 1name ถือว่าผิด)
3. ประกอบด้วย ตัวอักษร, ตัวเลข และ _ ได้เท่านั้น (ห้ามใช้สัญลักษณ์พิเศษ เช่น @, $, %, -)
4. **Case-sensitive** ตัวอักษรพิมพ์เล็ก-พิมพ์ใหญ่ถือเป็นคนละตัวกัน (age != Age)
5. **ห้ามใช้คำสงวน (Reserved Words)**', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (77, 5, 4, 'ตัวอย่างการตั้งชื่อที่ถูกต้อง และ ถูกต้องแต่ผิดกฎ (SyntaxError)', 'ตัวอย่างที่ถูกต้อง:
my_score = 100
_user_id = "U001"
total2 = 50

ตัวอย่างที่ผิด (รันแล้ว Error):
2total = 50       # ผิด: ขึ้นต้นด้วยตัวเลข
my-name = "Bob"   # ผิด: ใช้เครื่องหมายยัติภังค์ (-)
user@email = "a"  # ผิด: มีสัญลักษณ์ @', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (78, 5, 5, 'คำสงวนในภาษา Python (Reserved Words)', 'คำสงวน คือ คำที่ภาษา Python จองไว้ใช้งานเป็นคำสั่งเฉพาะ ห้ามนำมาตั้งเป็นชื่อตัวแปรเด็ดขาด!

ตัวอย่างคำสงวนที่เจอบ่อย:
`if`, `else`, `elif`, `for`, `while`, `break`, `continue`, `def`, `return`, `import`, `from`, `class`, `try`, `except`, `True`, `False`, `None`, `in`, `is`, `and`, `or`, `not`', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (79, 5, 6, 'สไตล์การตั้งชื่อตัวแปรมาตรฐาน (Naming Conventions)', 'เพื่อให้โค้ดอ่านง่ายและเป็นสากล นิยมใช้รูปแบบการตั้งชื่อ ดังนี้:

1. **snake_case** (นิยมที่สุดใน Python): ใช้ตัวพิมพ์เล็กแยกด้วย _ เช่น `user_first_name`
2. **camelCase**: ตัวแรกพิมพ์เล็ก คำถัดไปขึ้นต้นพิมพ์ใหญ่ เช่น `userFirstName`
3. **PascalCase**: ขึ้นต้นพิมพ์ใหญ่ทุกคำ (ใช้ตั้งชื่อ Class) เช่น `UserProfile`
4. **UPPER_CASE**: ตัวพิมพ์ใหญ่ทั้งหมด (ใช้ตั้งชื่อค่าคงที่ Const) เช่น `PI = 3.14`', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (80, 5, 7, 'เทคนิคการกำหนดค่าหลายตัวแปรในบรรทัดเดียว', 'Python ช่วยให้เรากำหนดค่าตัวแปรหลายตัวพร้อมกันได้อย่างสะดวกรวดเร็ว

ตัวอย่างโค้ด:
# กำหนดค่าหลายตัวแปรพร้อมกัน
x, y, z = 10, 20, 30

# กำหนดค่าเดียวให้หลายตัวแปร
a = b = c = 0

print(f"x={x}, y={y}, z={z}")
print(f"a={a}, b={b}, c={c}")', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (81, 5, 8, 'การสลับค่าตัวแปร (Swapping Variables)', 'ในภาษาอื่น การสลับค่าตัวแปรต้องใช้ตัวแปรชั่วคราว (temp) แต่ใน Python ทำได้ในบรรทัดเดียว!

ตัวอย่างโค้ด:
a = 5
b = 10

# สลับค่า a กับ b
a, b = b, a

print(f"a = {a}, b = {b}")  # ผลลัพธ์: a = 10, b = 5', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (82, 5, 9, 'การเช็คชนิดข้อมูลและตำแหน่งใน memory', 'เราสามารถตรวจสอบชนิดข้อมูลของตัวแปรได้ด้วย `type()` และดูตำแหน่ง memory ได้ด้วย `id()`

ตัวอย่างโค้ด:
x = 100
name = "Python"

print(type(x))     # <class ''int''>
print(type(name))  # <class ''str''>
print(id(x))       # แสดง Address ในหน่วยความจำ', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (83, 5, 10, 'สรุปบทเรียน: หลักการใช้ตัวแปร', '1. ตัวแปรใช้เก็บข้อมูล ปรับเปลี่ยนค่าได้ตลอดเวลา
2. ตั้งชื่อให้สื่อความหมาย ใช้ `snake_case` เป็นหลัก
3. ห้ามขึ้นต้นด้วยตัวเลข ห้ามใช้สัญลักษณ์พิเศษ และห้ามชนคำสงวน
4. ใช้ `type()` เมื่อต้องการเช็คชนิดข้อมูลของตัวแปร', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (84, 6, 1, 'ชนิดข้อมูลพื้นฐานใน Python', 'ในภาษา Python ข้อมูลทุกอย่างถูกเก็บในรูปแบบของวัตถุ (Object) โดยมีชนิดข้อมูลพื้นฐานที่สำคัญ 2 กลุ่มหลัก คือ:

1. **Numbers**: ข้อมูลประเภทตัวเลขคำนวณได้
2. **Strings**: ข้อมูลประเภทข้อความหรือลำดับตัวอักษร', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (85, 6, 2, 'ชนิดข้อมูลตัวเลข (Numeric Types)', 'Python แบ่งตัวเลขออกเป็น 3 ประเภทหลัก:

1. **Integer (`int`)**: จำนวนเต็ม เช่น `10`, `-5`, `0`
2. **Float (`float`)**: จำนวนทศนิยม เช่น `3.14`, `-0.05`, `2.0`
3. **Complex (`complex`)**: จำนวนเชิงซ้อน มีส่วนจินตภาพ `j` เช่น `2 + 3j`', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (86, 6, 3, 'ตัวดำเนินการคณิตศาสตร์ (Arithmetic Operators)', 'ตัวดำเนินการคณิตศาสตร์พื้นฐานใน Python:

- `+` บวก, `-` ลบ, `*` คูณ
- `/` หาร (ได้ผลลัพธ์เป็น float เสมอ)
- `//` หารเอาส่วนจำนวนเต็ม (Floor Division)
- `%` หารเอาเศษ (Modulus)
- `**` ยกกำลัง (Exponentiation)', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (87, 6, 4, 'ตัวอย่างการคำนวณทางคณิตศาสตร์', 'x = 10
y = 3

print("การหารปกติ (/)   :", x / y)   # 3.3333333333333335
print("หารเอาส่วน (//)  :", x // y)  # 3
print("หารเอาเศษ (%)    :", x % y)   # 1
print("ยกกำลัง (**)     :", x ** y)  # 1000', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (88, 6, 5, 'ชนิดข้อมูลข้อความ (Strings - str)', 'String คือ ลำดับของตัวอักษร (Sequence of Characters) ครอบด้วย Single Quote ('''') หรือ Double Quote ("")

- ข้อความไม่สามารถแก้ไขตัวอักษรรายตัวได้ (Immutable)
- หาความยาวของข้อความได้ด้วยฟังก์ชัน `len()`', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (89, 6, 6, 'การเข้าถึงตัวอักษรด้วย Indexing', 'ตัวอักษรใน String แต่ละตัวจะมีตำแหน่ง (Index) กำกับ เริ่มจาก 0
- ดึงจากหน้าไปหลัง: เริ่มที่ `0` ถึง `len-1`
- ดึงจากหลังมาหน้า: เริ่มที่ `-1`, `-2`, ...

ตัวอย่างโค้ด:
text = "PYTHON"
print(text[0])   # P
print(text[-1])  # N', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (90, 6, 7, 'การตัดข้อความบางส่วน (String Slicing)', 'เราสามารถตัดข้อความบางส่วนได้ในรูปแบบ `string[start:stop:step]`
(โดยตำแหน่ง `stop` จะไม่ถูกรวมในผลลัพธ์)

ตัวอย่างโค้ด:
text = "Python Programming"
print(text[0:6])   # Python (ตำแหน่ง 0 ถึง 5)
print(text[7:])    # Programming (ตั้งแต่ตำแหน่ง 7 จนจบ)
print(text[:6])    # Python (ตั้งแต่เริ่มต้น ถึง 5)', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (91, 6, 8, 'การดำเนินการกับ String (+ และ *)', 'เราสามารถใช้ตัวดำเนินการ `+` และ `*` กับ String ได้:

- `+` นำข้อความมาต่อกัน (Concatenation)
- `*` ซ้ำข้อความตามจำนวนรอบ

ตัวอย่างโค้ด:
first = "Hello"
second = "World"
print(first + " " + second)  # Hello World
print("Hi! " * 3)              # Hi! Hi! Hi! ', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (92, 6, 9, 'เมธอดจัดการข้อความที่ใชักันบ่อย (String Methods)', 'Python มี built-in methods สำหรับจัดการ String มากมาย:

text = "  python programming  "
print(text.upper())       # แปลงเป็นตัวพิมพ์ใหญ่ทั้งหมด
print(text.strip())       # ลบช่องว่างหัว-ท้าย
print(text.replace("python", "Java")) # แทนที่ข้อความ
print(text.find("gram"))  # หาตำแหน่งคำ (คืนค่า Index)', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (93, 6, 10, 'สรุปบทเรียน: Numbers & Strings', '1. `int` จำนวนเต็ม, `float` ทศนิยม, `complex` จำนวนเชิงซ้อน
2. `/` ได้ float เสมอ, `//` ตัดเศษทิ้ง, `%` หาเศษ
3. String อ้างอิงด้วย Index เริ่มจาก 0 และตัดคำได้ด้วย Slicing `[start:stop]`
4. String เปลี่ยนแปลงค่ารายตัวอักษรไม่ได้ (Immutable)', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (94, 7, 1, 'ชนิดข้อมูลเชิงประกอบ (Compound Data Types)', 'ในภาษา Python นอกจากชนิดข้อมูลพื้นฐานแล้ว ยังมีโครงสร้างข้อมูลที่ใช้เก็บข้อมูลหลายๆ ค่ารวมกันในตัวแปรเดียว ได้แก่:

1. **List**: เก็บข้อมูลแบบมีลำดับ แก้ไขค่าได้ [ ]
2. **Tuple**: เก็บข้อมูลแบบมีลำดับ แก้ไขค่าไม่ได้ ( )
3. **Dictionary**: เก็บข้อมูลแบบจับคู่ Key-Value { }
4. **Set**: เก็บข้อมูลแบบไม่ซ้ำกัน และไม่มีลำดับ { }', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (95, 7, 2, 'List: ข้อมูลแบบจัดลำดับ (Mutable)', 'List เป็นโครงสร้างข้อมูลที่ยืดหยุ่นที่สุด สามารถเก็บข้อมูลต่างชนิดกันใน List เดียวกันได้

- สร้างด้วยเครื่องหมายก้ามปู `[ ]`
- เข้าถึงและอ้างอิงข้อมูลด้วย Index (เริ่มที่ 0)
- สามารถเพิ่ม ลบ และแก้ไขข้อมูลภายในได้ตลอดเวลา', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (96, 7, 3, 'การใช้งานและเมธอดจัดการ List', 'fruits = ["apple", "banana", "cherry"]

# การเพิ่มข้อมูล
fruits.append("orange")     # เพิ่มต่อท้าย
fruits.insert(1, "mango")    # แทรกที่ตำแหน่ง index 1

# การแก้ไขข้อมูล
fruits[0] = "avocado"

# การลบข้อมูล
fruits.remove("banana")     # ลบตามค่า
popped = fruits.pop()        # ดึงตัวสุดท้ายออก

print(fruits)', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (97, 7, 4, 'Tuple: ข้อมูลแบบจัดลำดับที่แก้ไขไม่ได้ (Immutable)', 'Tuple ทำงานคล้ายกับ List แต่เมื่อสร้างขึ้นมาแล้ว **จะไม่สามารถแก้ไข เพิ่ม หรือลบข้อมูลได้ (Immutable)**

- สร้างด้วยเครื่องหมายวงเล็บโค้ง `( )`
- เข้าถึงข้อมูลผ่าน Index ได้เหมือน List
- ประมวลผลได้ไวกว่า List และปลอดภัยจากการถูกเปลี่ยนแปลงค่าโดยไม่ตั้งใจ', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (98, 7, 5, 'ตัวอย่างการสร้างและใช้งาน Tuple', '# การสร้าง Tuple
point = (10, 20)
colors = ("red", "green", "blue")

# การเข้าถึงข้อมูล
print(point[0])   # 10
print(colors[1])  # green

# Tuple Unpacking (การกระจายค่า)
x, y = point
print(f"X: {x}, Y: {y}")

# point[0] = 5  # หากรันบรรทัดนี้จะเกิด TypeError ซ้ำ', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (99, 7, 6, 'Dictionary: ข้อมูลแบบจับคู่ Key-Value', 'Dictionary เก็บข้อมูลในรูปแบบคู่ของ **Key: Value** เหมาะสำหรับการเก็บข้อมูลที่มีโครงสร้างชัดเจน

- สร้างด้วยเครื่องหมายปีกกา `{ }`
- ค้นหาข้อมูลผ่าน Key (Key ต้องไม่ซ้ำกัน)
- สามารถแก้ไขค่า เพิ่มคีย์ หรือลบคีย์ได้', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (100, 7, 7, 'ตัวอย่างการสร้างและใช้งาน Dictionary', 'student = {
    "name": "Somchai",
    "age": 20,
    "gpa": 3.50
}

# การเข้าถึงข้อมูล
print(student["name"])      # Somchai
print(student.get("age"))   # 20

# การเพิ่ม/แก้ไขข้อมูล
student["gpa"] = 3.75        # แก้ไขค่าเดิม
student["major"] = "CS"      # เพิ่ม key ใหม่

print(student)', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (101, 7, 8, 'Set: ข้อมูลแบบไม่ซ้ำกัน (Unique Values)', 'Set เก็บกลุ่มข้อมูลที่ไม่ซ้ำกัน และ **ไม่มีลำดับ (Unordered)**

- สร้างด้วยเครื่องหมายปีกกา `{ }` หรือฟังก์ชัน `set()`
- หากใส่ข้อมูลที่ซ้ำกันลงไป ระบบจะตัดตัวซ้ำทิ้งให้อัตโนมัติ
- ไม่สามารถอ้างอิงด้วย Index ได้', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (102, 7, 9, 'ตัวอย่างการใช้งาน Set และ Set Operations', 'numbers = {1, 2, 2, 3, 4, 4, 5}
print(numbers)  # ผลลัพธ์: {1, 2, 3, 4, 5}

# การดำเนินการทางเซต
a = {1, 2, 3}
b = {3, 4, 5}

print("Union (|)       :", a | b)  # {1, 2, 3, 4, 5}
print("Intersection (&):", a & b)  # {3}
print("Difference (-)  :", a - b)  # {1, 2}', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (103, 7, 10, 'สรุปบทเรียน: ชนิดข้อมูลเชิงประกอบ', '1. **List `[ ]`**: มีลำดับ แก้ไขได้ (Mutable)
2. **Tuple `( )`**: มีลำดับ แก้ไขไม่ได้ (Immutable)
3. **Dictionary `{k:v}`**: เก็บแบบ Key-Value ค้นหาด้วย Key
4. **Set `{ }`**: ไม่ซ้ำกัน ไม่มีลำดับ ใช้ซ้ำถูกลบทิ้ง', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (104, 8, 1, 'ทำความรู้จักกับตัวดำเนินการ (Operators)', 'ตัวดำเนินการ (Operators) คือสัญลักษณ์ที่ใช้สั่งให้โปรแกรมประมวลผลหรือคำนวณค่าระหว่างตัวแปรหรือค่าข้อมูล (Operands)

ตัวอย่างกลุ่มตัวดำเนินการใน Python:
1. Arithmetic Operators (คณิตศาสตร์)
2. Comparison Operators (เปรียบเทียบ)
3. Assignment Operators (กำหนดค่า)
4. Logical Operators (ตรรกศาสตร์)', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (105, 8, 2, '1. ตัวดำเนินการทางคณิตศาสตร์ (Arithmetic Operators)', 'ใช้สำหรับคำนวณตัวเลข:

- `+` บวก, `-` ลบ, `*` คูณ
- `/` หาร (ได้ผลลัพธ์เป็น float เสมอ)
- `//` หารเอาส่วนจำนวนเต็ม (Floor Division)
- `%` หารเอาเศษ (Modulus)
- `**` ยกกำลัง (Exponentiation)', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (106, 8, 3, 'ตัวอย่างการใช้งาน Arithmetic Operators', 'a = 15
b = 4

print("การหารปกติ (/)   :", a / b)   # 3.75
print("หารเอาส่วน (//)  :", a // b)  # 3
print("หารเอาเศษ (%)    :", a % b)   # 3
print("ยกกำลัง (**)     :", b ** 3)  # 64 (4*4*4)', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (107, 8, 4, '2. ตัวดำเนินการเปรียบเทียบ (Comparison Operators)', 'ใช้เปรียบเทียบค่า 2 ค่า ผลลัพธ์ที่ได้จะเป็น Boolean (`True` หรือ `False`) เสมอ

- `==` เท่ากับ, `!=` ไม่เท่ากับ
- `>` มากกว่า, `<` น้อยกว่า
- `>=` มากกว่าหรือเท่ากับ, `<=` น้อยกว่าหรือเท่ากับ', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (108, 8, 5, 'ตัวอย่างการใช้งาน Comparison Operators', 'x = 10
y = 20

print("x == y :", x == y)  # False
print("x != y :", x != y)  # True
print("x < y  :", x < y)   # True
print("x >= 10:", x >= 10) # True', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (109, 8, 6, '3. ตัวดำเนินการกำหนดค่า (Assignment Operators)', 'ใช้สำหรับกำหนดหรือปรับเปลี่ยนค่าในตัวแปรแบบย่อ (Compound Assignment)

- `=` กำหนดค่าปกติ (`x = 5`)
- `+=` บวกแล้วกำหนดค่า (`x += 3` มีค่าเท่ากับ `x = x + 3`)
- `-=` ลบแล้วกำหนดค่า
- `*=` คูณแล้วกำหนดค่า
- `/=` หารแล้วกำหนดค่า', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (110, 8, 7, 'ตัวอย่างการใช้งาน Assignment Operators', 'score = 100
score += 50   # score = 100 + 50 -> 150
score -= 20   # score = 150 - 20 -> 130
score *= 2    # score = 130 * 2  -> 260

print("Score สุดท้าย:", score)  # 260', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (111, 8, 8, '4. ตัวดำเนินการทางตรรกศาสตร์ (Logical Operators)', 'ใช้เชื่อมเงื่อนไขทางตรรกศาสตร์ ผลลัพธ์เป็น `True` หรือ `False`

- `and` (และ): เป็น True เมื่อ**ทุกเงื่อนไข**เป็น True
- `or` (หรือ): เป็น True เมื่อมี**อย่างน้อยหนึ่งเงื่อนไข**เป็น True
- `not` (ไม่): กลับค่าความจริง (True เป็น False, False เป็น True)', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (112, 8, 9, 'ตัวอย่าง Logical Operators และ Short-circuit Evaluation', 'age = 20
has_license = True

# การใช้ and และ or
can_drive = (age >= 18) and has_license
is_child_or_elder = (age < 12) or (age >= 60)

print("ขับรถได้หรือไม่ :", can_drive)          # True
print("เป็นเด็กหรือคนแก่:", is_child_or_elder) # False
print("ตรงข้าม can_drive :", not can_drive)    # False', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (113, 8, 10, 'สรุปบทเรียน: ตัวดำเนินการพื้นฐาน', '1. **Arithmetic**: `/` ได้ float, `//` ปัดเศษทิ้ง, `%` หาเศษ
2. **Comparison**: เปรียบเทียบแล้วได้ค่า `True` / `False` เสมอ
3. **Assignment**: ใช้ `+=`, `-=` ช่วยลดรูปการเขียนโค้ด
4. **Logical**: `and` ต้อง True ทั้งหมด, `or` ขอแค่ True ตัวเดียว, `not` สลับค่า', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (114, 9, 1, 'ทำความรู้จักกับตัวดำเนินการระดับลึก', 'นอกจากตัวดำเนินการพื้นฐานแล้ว Python ยังมีตัวดำเนินการเฉพาะทางที่ช่วยให้จัดการข้อมูลในระดับบิต และตรวจสอบความสัมพันธ์ของข้อมูลได้อย่างมีประสิทธิภาพ:

1. **Bitwise Operators**: ตัวดำเนินการระดับบิต (Binary)
2. **Membership Operators**: ตัวดำเนินการตรวจสอบความเป็นสมาชิก (`in`, `not in`)
3. **Identity Operators**: ตัวดำเนินการตรวจสอบเอกลักษณ์/ตำแหน่งในหน่วยความจำ (`is`, `is not`)', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (115, 9, 2, '1. ตัวดำเนินการระดับบิต (Bitwise Operators)', 'เป็นตัวดำเนินการที่แปลงตัวเลขเป็นฐานสอง (Bits) แล้วทำการประมวลผลทีละบิต:

- `&` (Bitwise AND): เป็น 1 เมื่อทั้งคู่เป็น 1
- `|` (Bitwise OR): เป็น 1 เมื่อมีตัวใดตัวหนึ่งเป็น 1
- `^` (Bitwise XOR): เป็น 1 เมื่อค่าต่างกัน
- `~` (Bitwise NOT): กลับบิต 0 เป็น 1, 1 เป็น 0
- `<<` (Left Shift): เลื่อนบิตไปทางซ้าย (เพิ่มค่าเท่ากับการคูณ 2)
- `>>` (Right Shift): เลื่อนบิตไปทางขวา (ลดค่าเท่ากับการหาร 2)', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (116, 9, 3, 'ตัวอย่างการใช้งาน Bitwise Operators', 'a = 5   # ฐานสอง: 0101
b = 3   # ฐานสอง: 0011

print("a & b :", a & b)   # 0001 -> 1
print("a | b :", a | b)   # 0111 -> 7
print("a ^ b :", a ^ b)   # 0110 -> 6
print("a << 1:", a << 1)  # 1010 -> 10', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (138, 12, 2, 'การใช้งาน for Loop และฟังก์ชัน range()', '`for` loop นิยมใช้คู่กับฟังก์ชัน `range()` เพื่อกำหนดช่วงตัวเลขการทำงาน

- `range(stop)`: เริ่มจาก 0 ถึง stop-1
- `range(start, stop)`: เริ่มจาก start ถึง stop-1
- `range(start, stop, step)`: กำหนดการเพิ่ม/ลดค่าทีละ step', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (117, 9, 4, '2. ตัวดำเนินการสมาชิก (Membership Operators)', 'ใช้สำหรับตรวจสอบว่ามีข้อมูลที่สนใจ **เป็นสมาชิกอยู่ภายใน** Sequence (เช่น String, List, Tuple, Dict) หรือไม่:

- `in`: คืนค่า `True` หากพบสมาชิกนั้นอยู่ในวัตถุ
- `not in`: คืนค่า `True` หาก**ไม่พบ**สมาชิกนั้นอยู่ในวัตถุ', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (118, 9, 5, 'ตัวอย่างการใช้งาน Membership Operators', 'text = "Python Programming"
numbers = [10, 20, 30, 40]
user_info = {"name": "Somchai", "role": "admin"}

# ตรวจสอบใน String และ List
print("Python" in text)     # True
print(50 not in numbers)    # True

# ตรวจสอบใน Dictionary (เน้นตรวจที่ Key)
print("name" in user_info)   # True
print("Somchai" in user_info) # False (เพราะ "Somchai" เป็น Value ไม่ใช่ Key)', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (119, 9, 6, '3. ตัวดำเนินการเอกลักษณ์ (Identity Operators)', 'ใช้สำหรับตรวจสอบว่าตัวแปร 2 ตัว **ชี้ไปยังวัตถุชิ้นเดียวกันในหน่วยความจำ (Memory Address)** หรือไม่:

- `is`: คืนค่า `True` หากเป็นวัตถุชิ้นเดียวกัน (`id()` เดียวกัน)
- `is not`: คืนค่า `True` หากเป็นวัตถุคนละชิ้นกัน', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (120, 9, 7, 'ความแตกต่างระหว่าง == และ is', 'ข้อควรระวังสำคัญ:
- `==` ใช้เปรียบเทียบ **"ค่าของข้อมูล"** (Value)
- `is` ใช้เปรียบเทียบ **"ตำแหน่งในหน่วยความจำ"** (Identity/Memory Address)

ตัวอย่างโค้ด:
a = [1, 2, 3]
b = [1, 2, 3]
c = a

print(a == b) # True  (เพราะข้อมูลข้างในเหมือนกัน)
print(a is b) # False (เพราะสร้าง List คนละตัวใน Memory)
print(a is c) # True  (เพราะ c ชี้ไปยัง Memory เดียวกับ a)', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (121, 9, 8, 'สรุปบทเรียน: Bitwise, Membership และ Identity', '1. **Bitwise (`&`, `|`, `^`, `<<`, `>>`)**: ประมวลผลข้อมูลในระดับเลขฐานสอง
2. **Membership (`in`, `not in`)**: ใช้เช็คว่ามีสมาชิกอยู่ใน List/String/Dict หรือไม่
3. **Identity (`is`, `is not`)**: ใช้เช็คตำแหน่ง Memory Address (`id()`)
4. `==` เช็คแค่ค่าเท่ากัน ส่วน `is` เช็คว่าเป็นวัตถุตัวเดียวกันจริงไหม', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (227, 18, 4, 'การดักจับข้อความ Error ด้วย as e', 'เราสามารถดึงข้อความแจ้งเตือนระบบของ Exception มาใช้งานได้โดยใช้คีย์เวิร์ด `as`

```python
try:
    with open("no_file.txt", "r") as f:
        content = f.read()
except FileNotFoundError as e:
    print(f"รายละเอียด Error จากระบบ: {e}")
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (122, 10, 1, 'ลำดับความสำคัญของตัวดำเนินการ (Operator Precedence)', 'ในการเขียนโปรแกรม เมื่อมีตัวดำเนินการหลายตัวอยู่ในนิพจน์ (Expression) เดียวกัน Python จะประมวลผลตัวดำเนินการตาม **ลำดับความสำคัญ (Precedence)** ก่อน-หลัง ไม่ใช่การคำนวณจากซ้ายไปขวาเสมอไป

การเข้าใจลำดับความสำคัญจะช่วยป้องกันบั๊ก (Bug) และทำให้โปรแกรมคำนวณผลลัพธ์ได้อย่างถูกต้องตามที่ออกแบบไว้', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (123, 10, 2, 'ตารางลำดับความสำคัญ (เรียงจากสูงไปต่ำ)', 'เรียงลำดับตัวดำเนินการที่ทำก่อนไปยังตัวดำเนินการที่ทำทีหลัง:

1. `( )` : วงเล็บ (ทำก่อนเสมอ)
2. `**` : ยกกำลัง
3. `+x`, `-x`, `~x` : เครื่องหมายบวก/ลบหน้าตัวเลข, Bitwise NOT
4. `*`, `/`, `//`, `%` : คูณ หาร หารเอาส่วน หารเอาเศษ
5. `+`, `-` : บวก ลบ
6. `<<`, `>>` : Bitwise Shift
7. `&`, `^`, `|` : Bitwise AND, XOR, OR
8. `==`, `!=`, `>`, `<`, `>=`, `<=`, `is`, `in` : การเปรียบเทียบและสมาชิก
9. `not` : ตรรกศาสตร์ NOT
10. `and` : ตรรกศาสตร์ AND
11. `or` : ตรรกศาสตร์ OR
12. `=`, `+=`, `-=` : การกำหนดค่า (ทำหลังสุด)', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (124, 10, 3, 'ตัวอย่างการคำนวณตามลำดับความสำคัญ', '# ตัวอย่างที่ 1: การคูณทำก่อนการบวก
result1 = 10 + 2 * 5
print(result1)  # ได้ 20 (ไม่ใช่ 60 เพราะทำ 2 * 5 ก่อน)

# ตัวอย่างที่ 2: ยกกำลังทำก่อนคูณและบวก
result2 = 3 + 4 * 2 ** 3
print(result2)  # ได้ 35 (เพราะทำ 2**3=8 -> 4*8=32 -> 3+32=35)', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (125, 10, 4, 'การใช้วงเล็บ () กำหนดลำดับการทำงาน', 'หากต้องการให้การคำนวณส่วนใดทำก่อนเป็นพิเศษ ให้ครอบด้วย **วงเล็บ `( )`** เสมอ

นอกจากนี้ การใส่วงเล็บยังช่วยให้โค้ดอ่านง่ายขึ้น (Readability) ถึงแม้จะเป็นลำดับตามปกติอยู่แล้วก็ตาม', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (126, 10, 5, 'ตัวอย่างการควบคุมลำดับด้วยวงเล็บ', '# เปลี่ยนลำดับการบวก-คูณด้วยวงเล็บ
val1 = (10 + 2) * 5
print(val1)  # ได้ 60 (ทำในวงเล็บ 10+2=12 ก่อน)

# เปรียบเทียบกับแบบไม่ใส่วงเล็บ
val2 = 10 + 2 * 5
print(val2)  # ได้ 20', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (139, 12, 3, 'ตัวอย่างการใช้ for Loop', '# วนรอบอ่านข้อมูลใน List
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)

# วนรอบตามช่วงตัวเลข 1 ถึง 5
for i in range(1, 6):
    print(f"รอบที่ {i}")', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (127, 10, 6, 'ทิศทางการประมวลผล (Associativity)', 'หากตัวดำเนินการมี **ลำดับความสำคัญเท่ากัน** Python จะประมวลผลจาก **ซ้ายไปขวา (Left-to-Right)** เป็นหลัก

**ข้อยกเว้นสำคัญ:**
- **ตัวดำเนินการยกกำลัง `**`** จะประมวลผลจาก **ขวาไปซ้าย (Right-to-Left)**

ตัวอย่าง:
`2 ** 3 ** 2` มีค่าเท่ากับ `2 ** (3 ** 2)` = `2 ** 9` = `512` (ไม่ใช่ `(2**3)**2 = 64`)', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (128, 10, 7, 'สรุปบทเรียน: Operator Precedence', '1. **วงเล็บ `( )`** มีความสำคัญสูงสุด ทำก่อนเสมอ
2. **ยกกำลัง `**`** สำคัญรองลงมา และคิดจากขวาไปซ้าย
3. **`* / // %`** สำคัญกว่า **`+ -`**
4. **เปรียบเทียบ `== != > <`** สำคัญกว่า **ตรรกศาสตร์ `not and or`**
5. หากไม่แน่ใจลำดับความสำคัญ ให้ **ใช้วงเล็บ `( )` ครอบไว้เสมอ** เพื่อความปลอดภัย', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (129, 11, 1, 'การควบคุมทิศทางโปรแกรมด้วยคำสั่งเงื่อนไข (Control Flow)', 'ในการเขียนโปรแกรมจริง โปรแกรมจำเป็นต้องตัดสินใจเลือกทำตามเงื่อนไขที่กำหนด คำสั่งเงื่อนไข (Conditional Statements) ช่วยให้โปรแกรมเบี่ยงทิศทางการทำงานตามค่าความจริง (`True` หรือ `False`)

โครงสร้างหลักประกอบด้วย:
1. `if` : ตรวจสอบเงื่อนไขแรก
2. `elif` : ตรวจสอบเงื่อนไขถัดไป (ถ้าเงื่อนไขก่อนหน้าเป็น False)
3. `else` : ทำงานเมื่อไม่ตรงกับเงื่อนไขใดๆ เลย', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (130, 11, 2, 'โครงสร้างและการย่อหน้า (Indentation)', 'ภาษา Python ใช้ **การย่อหน้า (Indentation)** เพื่อระบุขอบเขตของบล็อกโค้ด (Block of Code) แทนการใช้เครื่องหมายปีกกา `{ }`

- นิยมใช้ เว้นวรรค 4 ช่อง (4 Spaces) หรือ 1 Tab
- ทุกบรรทัดที่อยู่ในเงื่อนไขเดียวกันต้องมีย่อหน้าเท่ากันเสมอ

```python
if score >= 50:
    print("Pass")  # ต้องย่อหน้า
```', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (131, 11, 3, 'การใช้งาน if - elif - else เบื้องต้น', 'score = 75

if score >= 80:
    grade = "A"
elif score >= 70:
    grade = "B"
elif score >= 60:
    grade = "C"
else:
    grade = "F"

print(f"คุณได้เกรด: {grade}")  # ผลลัพธ์: คุณได้เกรด: B', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (132, 11, 4, 'คำสั่งเงื่อนไขซ้อนกัน (Nested if)', 'เราสามารถเขียนคำสั่ง `if` ซ้อนข้างใน `if` อีกชั้นหนึ่งได้ เพื่อตรวจสอบเงื่อนไขที่ซับซ้อนขึ้น

```python
age = 20
has_id = True

if age >= 18:
    if has_id:
        print("อนุญาตให้เข้างานได้")
    else:
        print("ต้องแสดงบัตรประชาชน")
else:
    print("อายุไม่ถึงกำหนด")
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (133, 11, 5, 'การลดรูปเงื่อนไข (Ternary Operator / Conditional Expression)', 'หากต้องการเขียนเงื่อนไขอย่างง่ายเพื่อกำหนดค่าในบรรทัดเดียว สามารถใช้โครงสร้าง:
`ค่าเมื่อ True if เงื่อนไข else ค่าเมื่อ False`

ตัวอย่าง:
```python
age = 20
status = "Adult" if age >= 18 else "Minor"
print(status)  # ผลลัพธ์: Adult
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (134, 11, 6, 'การใช้ pass ในบล็อกเงื่อนไข', 'หากต้องการสร้างโครงสร้างเงื่อนไขไว้ก่อน แต่ยังไม่ต้องการใส่คำสั่งใดๆ ต้องใช้คำสั่ง `pass` เพื่อไม่ให้เกิดข้อผิดพลาด SyntaxError

```python
x = 10
if x > 0:
    pass  # ยังไม่ทำอะไรในตอนนี้
else:
    print("Negative")
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (135, 11, 7, 'ข้อควรระวังในการเขียนเงื่อนไข', '1. อย่าลืมเครื่องหมาย โคลอน `:` หลังจบเงื่อนไข `if`, `elif`, `else`
2. ระวังเรื่อง IndentationError หากย่อหน้าไม่เท่ากัน
3. การเปรียบเทียบความเท่ากันต้องใช้ `==` ไม่ใช่ `=` (ซึ่งเป็นการกำหนดค่า)', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (136, 11, 8, 'สรุปบทเรียน: คำสั่งเงื่อนไข', '1. **`if`** ใช้ตรวจสอบเงื่อนไขแรก
2. **`elif`** ใช้ตรวจสอบเงื่อนไขทางเลือกเพิ่มเติม
3. **`else`** ทำงานเมื่อไม่มีเงื่อนไขใดเป็นจริงเลย
4. **Indentation** (ย่อหน้า 4 ช่อง) กำหนดขอบเขตบล็อกโค้ด
5. **`pass`** ใช้ข้ามการทำงานในบล็อกที่ยังไม่ได้เขียนโค้ด', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (137, 12, 1, 'การทำงานซ้ำ (Loops)', 'การวนซ้ำ (Looping) ช่วยให้โปรแกรมสามารถทำงานชุดเดิมซ้ำๆ ตามจำนวนรอบที่กำหนด หรือจนกว่าเงื่อนไขจะเป็นเท็จ ช่วยลดการเขียนโค้ดซ้ำซ้อนได้อย่างมีประสิทธิภาพ

คำสั่งวนซ้ำหลักใน Python มี 2 ประเภท:
1. **`for` loop**: เหมาะสำหรับการวนซ้ำตามจำนวนรอบที่แน่นอน หรือวนอ่านค่าใน Sequence (List, String, Range)
2. **`while` loop**: เหมาะสำหรับการวนซ้ำที่ขึ้นอยู่กับเงื่อนไข ทำงานไปเรื่อยๆ จนกว่าเงื่อนไขจะกลายเป็น False', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (140, 12, 4, 'การใช้งาน while Loop', '`while` loop จะตรวจสอบเงื่อนไขก่อนเริ่มทำงานแต่ละรอบ หากเงื่อนไขเป็น `True` จะทำงานในบล็อกโค้ดซ้ำไปเรื่อยๆ

**ข้อควรระวัง:** ต้องมีการอัปเดตค่าตัวแปรเงื่อนไขเสมอ มิฉะนั้นจะเกิด **Infinite Loop (ลูปไม่จบ)**', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (141, 12, 5, 'ตัวอย่างการใช้ while Loop', 'count = 1

while count <= 5:
    print(f"Count: {count}")
    count += 1  # อัปเดตค่าเพื่อหยุดลูปเมื่อ count > 5

print("จบการทำงานลูป")', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (142, 12, 6, 'คำสั่งควบคุมลูป: break และ continue', 'ใช้สำหรับควบคุมทิศทางการวนลูปเพิ่มเติม:

- **`break`**: สั่งให้ออกจากลูปทันที โดยไม่สนใจรอบที่เหลือ
- **`continue`**: ข้ามการทำงานในรอบปัจจุบัน แล้วไปเริ่มต้นรอบถัดไปทันที', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (143, 12, 7, 'ตัวอย่างการใช้ break และ continue', '# ตัวอย่าง break
for num in range(1, 10):
    if num == 5:
        break  # หยุดลูปเมื่อ num เท่ากับ 5
    print(num) # พิมพ์ 1, 2, 3, 4

# ตัวอย่าง continue
for num in range(1, 6):
    if num == 3:
        continue # ข้ามรอบที่ num เท่ากับ 3
    print(num) # พิมพ์ 1, 2, 4, 5', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (144, 12, 8, 'การใช้ else คู่กับ Loop', 'ใน Python ลูป `for` และ `while` สามารถมีบล็อก `else` ต่อท้ายได้ โดยบล็อก `else` จะทำงานเมื่อ **ลูปวนซ้ำจนครบตามปกติ** (แต่จะไม่ทำงานหากลูปถูกสั่งให้หยุดด้วย `break`)', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (145, 12, 9, 'สรุปบทเรียน: การวนซ้ำ (Loops)', '1. **`for`**: ใช้เมื่อทราบจำนวนรอบแน่นอน หรืออ่านสมาชิกใน Sequence
2. **`range(start, stop, step)`**: สร้างชุดตัวเลขสำหรับวนลูป
3. **`while`**: ทำซ้ำจนกว่าเงื่อนไขจะเป็น False (ระวัง Infinite Loop)
4. **`break`**: หักหลบออกจากลูปทันที / **`continue`**: ข้ามรอบปัจจุบันไปรอบถัดไป
5. **`else` ในลูป**: ทำงานหลังลูปจบสมบูรณ์โดยไม่โดน `break`', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (146, 13, 1, 'แนวคิดของฟังก์ชัน (Functions)', 'ฟังก์ชันคือบล็อกของโค้ดที่ถูกสร้างขึ้นมาเพื่อทำงานเฉพาะอย่างใดอย่างหนึ่ง สามารถเรียกใช้งานซ้ำ (Reuse) ได้หลายๆ ครั้งโดยไม่ต้องเขียนโค้ดเดิมซ้ำ

**ประโยชน์ของฟังก์ชัน:**
1. **Modular**: แบ่งโปรแกรมออกเป็นส่วนย่อยๆ ช่วยให้ดูแลรักษาง่าย
2. **Reusability**: เรียกใช้ซ้ำได้สะดวก ลดความซ้ำซ้อนของโค้ด
3. **Readability**: ทำให้โปรแกรมอ่านเข้าใจง่ายขึ้น', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (147, 13, 2, 'การนิยามและการเรียกใช้ฟังก์ชัน (def)', 'การสร้างฟังก์ชันใน Python ใช้คำสั่ง `def` ตามด้วยชื่อฟังก์ชันและวงเล็บ `()`

```python
# การนิยาม (Define) ฟังก์ชัน
def greet():
    print("สวัสดีค่ะ ยินดีต้อนรับสู่บทเรียน Python")

# การเรียกใช้งาน (Call) ฟังก์ชัน
greet()
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (148, 13, 3, 'การส่งพารามิเตอร์ (Parameters & Arguments)', 'เราสามารถส่งข้อมูลเข้าไปทำงานในฟังก์ชันผ่าน **Parameters** ได้

```python
def greet_person(name):
    print(f"สวัสดีคุณ {name}!")

# เรียกใช้โดยส่ง Argument เข้าไป
greet_person("สมชาย")  # ผลลัพธ์: สวัสดีคุณ สมชาย!
greet_person("สมหญิง")  # ผลลัพธ์: สวัสดีคุณ สมหญิง!
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (149, 13, 4, 'การส่งคืนค่าจากฟังก์ชัน (Return Statement)', 'คำสั่ง `return` ใช้ส่งผลลัพธ์จากการทำงานของฟังก์ชันกลับไปยังจุดที่เรียกใช้ และจะ **หยุดการทำงาน** ของฟังก์ชันทันที

```python
def add_numbers(a, b):
    return a + b

result = add_numbers(5, 10)
print(f"ผลรวม: {result}")  # ผลลัพธ์: ผลรวม: 15
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (150, 13, 5, 'ค่าเริ่มต้นของพารามิเตอร์ (Default Arguments)', 'เราสามารถกำหนดค่าเริ่มต้นให้พารามิเตอร์ได้ หากผู้เรียกใช้ไม่ส่ง Argument เข้ามา ฟังก์ชันจะใช้ค่าเริ่มต้นนั้นแทน

```python
def welcome(name, msg="ยินดีต้อนรับ"): 
    print(f"สวัสดี {name}, {msg}")

welcome("อลิส")                  # ผลลัพธ์: สวัสดี อลิส, ยินดีต้อนรับ
welcome("บ็อบ", "อรุณสวัสดิ์")  # ผลลัพธ์: สวัสดี บ็อบ, อรุณสวัสดิ์
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (151, 13, 6, 'การส่งพารามิเตอร์แบบระบุชื่อ (Keyword Arguments)', 'เราสามารถระบุชื่อพารามิเตอร์ขณะเรียกใช้ฟังก์ชันได้ ทำให้ไม่จำเป็นต้องส่ง Argument ตามลำดับตำแหน่ง

```python
def display_info(name, age, city):
    print(f"{name} อายุ {age} ปี อาศัยอยู่ที่ {city}")

# เรียกใช้แบบ Keyword Arguments (สลับลำดับได้)
display_info(city="กรุงเทพ", name="กานต์", age=25)
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (152, 13, 7, 'ขอบเขตของตัวแปร (Scope: Local vs Global)', 'ตัวแปรใน Python มีขอบเขตการใช้งานต่างกัน:

- **Local Scope**: ตัวแปรที่สร้างขึ้นในฟังก์ชัน เรียกใช้ได้เฉพาะภายในฟังก์ชันนั้นเท่านั้น
- **Global Scope**: ตัวแปรที่สร้างอยู่นอกฟังก์ชัน สามารถเรียกใช้ได้ทั่วทั้งโปรแกรม

*หากต้องการแก้ไขตัวแปร Global ภายในฟังก์ชัน ต้องใช้คำสั่ง `global`*', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (153, 13, 8, 'สรุปบทเรียน: ฟังก์ชัน (Functions)', '1. สร้างฟังก์ชันด้วยคำสั่ง **`def`** ตามด้วยชื่อฟังก์ชัน
2. ส่งข้อมูลเข้าผ่าน **Parameters** และรับค่ากลับด้วย **`return`**
3. กำหนด **Default Arguments** เพื่อป้องกัน Error เมื่อไม่ได้ส่งค่ามา
4. **Keyword Arguments** ช่วยให้ระบุค่าตามชื่อพารามิเตอร์ได้ตรงๆ
5. **Local Variable** ใช้ได้เฉพาะในฟังก์ชัน ส่วน **Global Variable** ใช้ได้ทั้งโปรแกรม', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (258, 20, 5, 'ทำความรู้จักกับ Polymorphism (การพหุสัณฐาน)', 'Polymorphism คือแนวคิดที่ยินยอมให้ **Object ต่างคลาสกัน สามารถตอบสนองต่อการเรียกใช้เมธอดชื่อเดียวกันได้** โดยแสดงพฤติกรรมตามแบบเฉพาะของตนเอง

ช่วยให้เขียนโค้ดจัดการกับ Object หลากหลายชนิดได้ผ่าน Interface เดียวกัน', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (154, 14, 1, 'ทำความรู้จักกับข้อผิดพลาด (Errors) และ Exception', 'ในการเขียนโปรแกรม ข้อผิดพลาดสามารถแบ่งออกเป็น 3 ประเภทหลัก:

1. **Syntax Error**: เขียนไวยากรณ์ผิดตั้งแต่แรก โปรแกรมจะรันไม่ได้เลย เช่น ลืมโคลอน `:`
2. **Runtime Error (Exception)**: ไวยากรณ์ถูกต้อง แต่เกิดข้อผิดพลาดขณะโปรแกรมกำลังทำงาน เช่น หารด้วยศูนย์, ลืมสร้างตัวแปร, แปลงข้อความที่ไม่ใช่ตัวเลข
3. **Logic Error**: โปรแกรมรันผ่านได้ปกติ แต่ผลลัพธ์ที่ได้ไม่ถูกต้องตามความต้องการ

*การจัดการ Exception ช่วยป้องกันไม่ให้โปรแกรมดับหรือ Crash กลางคัน*', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (155, 14, 2, 'ชนิดของ Exception ที่พบได้บ่อยใน Python', 'ตัวอย่าง Runtime Error ที่พบบ่อย:

- **`ZeroDivisionError`**: เกิดจากการพยายามหารตัวเลขด้วย 0
- **`ValueError`**: ค่าที่ส่งให้ฟังก์ชันมีชนิดถูก แต่ค่าไม่ถูกต้อง (เช่น `int("abc")`)
- **`TypeError`**: การทำปฏิสัมพันธ์ระหว่างข้อมูลคนละชนิดกัน (เช่น `"5" + 10`)
- **`IndexError`**: เข้าถึงดัชนีของ List ที่ไม่มีอยู่จริง
- **`KeyError`**: เข้าถึง Key ของ Dictionary ที่ไม่มีอยู่จริง
- **`FileNotFoundError`**: ค้นหาไฟล์ที่ไม่มีอยู่ตาม Path ที่ระบุ', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (156, 14, 3, 'โครงสร้างพื้นฐาน try - except', 'คำสั่ง `try` ใช้สำหรับห่อหุ้มโค้ดที่มีความเสี่ยงจะเกิด Error หากเกิด Exception ขึ้น โปรแกรมจะไม่ Crash แต่จะกระโดดไปทำงานที่บล็อก `except` ทันที

```python
try:
    number = int(input("กรุณากรอกตัวเลข: "))
    result = 10 / number
    print(f"ผลลัพธ์: {result}")
except:
    print("เกิดข้อผิดพลาดในการคำนวณ!")
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (157, 14, 4, 'การดักจับ Exception เฉพาะเจาะจง (Specific Exceptions)', 'การใช้ `except` ลอยๆ อาจทำให้เราไม่รู้สาเหตุแท้จริง จึงควรระบุชนิด Exception ที่ต้องการดักจับ และสามารถมีได้หลาย `except` ในชุดเดียวกัน

```python
try:
    num = int(input("ป้อนตัวเลข: "))
    res = 100 / num
except ValueError:
    print("ข้อผิดพลาด: คุณต้องกรอกตัวเลขเท่านั้น")
except ZeroDivisionError:
    print("ข้อผิดพลาด: ห้ามหารด้วยศูนย์")
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (158, 14, 5, 'การรับข้อความ Error มาใช้งานด้วย as', 'เราสามารถดักจับ Exception และดึงเอาข้อความอธิบายความผิดพลาดของระบบมาแสดงผลได้ด้วยการใช้ `as`

```python
try:
    file = open("data.txt", "r")
    content = file.read()
except FileNotFoundError as e:
    print(f"ระบบแจ้งข้อผิดพลาด: {e}")
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (159, 14, 6, 'โครงสร้างเพิ่มเติม: else และ finally', 'โครงสร้างแบบเต็มของการจัดการ Exception ประกอบด้วย:

- **`else`**: ทำงานเมื่อ **ไม่เกิด Exception ใดๆ เลย** ในบล็อก try
- **`finally`**: ทำงาน **เสมอ** ไม่ว่าจะเกิด Exception หรือไม่ก็ตาม (นิยมใช้ปิดไฟล์ หรือปิด Connection ฐานข้อมูล)

```python
try:
    x = 10 / 2
except ZeroDivisionError:
    print("Error")
else:
    print(f"คำนวณสำเร็จ! ค่าที่ได้คือ {x}")
finally:
    print("จบขั้นตอนการทำงาน (ทำงานเสมอ)")
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (160, 14, 7, 'การส่งสัญญาณข้อผิดพลาดด้วยคำสั่ง raise', 'ในกรณีที่เราต้องการสร้างเงื่อนไขข้อผิดพลาดขึ้นมาเองตามตรรกะทางธุรกิจ เราสามารถใช้คำสั่ง `raise` เพื่อสร้าง Exception ขึ้นมาได้

```python
def set_age(age):
    if age < 0:
        raise ValueError("อายุต้องไม่ติดลบ!")
    print(f"ตั้งค่าอายุเรียบร้อย: {age}")

try:
    set_age(-5)
except ValueError as err:
    print(err)  # ผลลัพธ์: อายุต้องไม่ติดลบ!
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (161, 14, 8, 'การสร้าง Exception ของตัวเอง (Custom Exceptions)', 'ในระบบขนาดใหญ่ เราสามารถสร้างคลาส Exception ขึ้นมาเองได้โดยการสืบทอด (Inherit) จากคลาส `Exception` พื้นฐานของ Python

```python
class InvalidPasswordError(Exception):
    """Exception เมื่อรหัสผ่านไม่ปลอดภัย"""
    pass

password = "123"
if len(password) < 6:
    raise InvalidPasswordError("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร")
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (162, 14, 9, 'ตัวอย่างการประยุกต์ใช้งานจริง (Best Practices)', 'ตัวอย่างระบบรับค่าตัวเลขแบบวนซ้ำจนกว่าผู้ใช้จะกรอกข้อมูลถูกต้อง ป้องกันโปรแกรมล่มจากการกรอกตัวอักษร:

```python
while True:
    try:
        age = int(input("กรุณาป้อนอายุของคุณ: "))
        if age <= 0:
            print("อายุต้องมากกว่า 0 ปี")
            continue
        break  # ออกจากลูปเมื่อกรอกถูก
    except ValueError:
        print("ข้อมูลไม่ถูกต้อง! กรุณากรอกตัวเลขเต็มเท่านั้น")

print(f"ลงทะเบียนอายุ {age} ปี เรียบร้อย")
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (163, 14, 10, 'สรุปบทเรียน: การจัดการข้อผิดพลาด (Exception Handling)', '1. **`try`**: ใส่โค้ดที่มีความเสี่ยงจะเกิด Runtime Error
2. **`except ExceptionType`**: ดักจับและจัดการข้อผิดพลาดตามชนิดที่ระบุ
3. **`else`**: ทำงานเมื่อไม่มีข้อผิดพลาดเกิดขึ้นเลยใน try
4. **`finally`**: ทำงานเสมอไม่ว่าจะเกิด Error หรือไม่ (เหมาะแก่การล้างทรัพยากร)
5. **`raise`**: ใช้สร้าง/สั่งให้เกิด Exception ขึ้นมาเองตามเงื่อนไขที่ต้องการ', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (164, 14, 1, 'ทำความรู้จักกับข้อผิดพลาด (Errors) และ Exception', 'ในการเขียนโปรแกรม ข้อผิดพลาดสามารถแบ่งออกเป็น 3 ประเภทหลัก:

1. **Syntax Error**: เขียนไวยากรณ์ผิดตั้งแต่แรก โปรแกรมจะรันไม่ได้เลย เช่น ลืมโคลอน `:`
2. **Runtime Error (Exception)**: ไวยากรณ์ถูกต้อง แต่เกิดข้อผิดพลาดขณะโปรแกรมกำลังทำงาน เช่น หารด้วยศูนย์, ลืมสร้างตัวแปร, แปลงข้อความที่ไม่ใช่ตัวเลข
3. **Logic Error**: โปรแกรมรันผ่านได้ปกติ แต่ผลลัพธ์ที่ได้ไม่ถูกต้องตามความต้องการ

*การจัดการ Exception ช่วยป้องกันไม่ให้โปรแกรมดับหรือ Crash กลางคัน*', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (165, 14, 2, 'ชนิดของ Exception ที่พบได้บ่อยใน Python', 'ตัวอย่าง Runtime Error ที่พบบ่อย:

- **`ZeroDivisionError`**: เกิดจากการพยายามหารตัวเลขด้วย 0
- **`ValueError`**: ค่าที่ส่งให้ฟังก์ชันมีชนิดถูก แต่ค่าไม่ถูกต้อง (เช่น `int("abc")`)
- **`TypeError`**: การทำปฏิสัมพันธ์ระหว่างข้อมูลคนละชนิดกัน (เช่น `"5" + 10`)
- **`IndexError`**: เข้าถึงดัชนีของ List ที่ไม่มีอยู่จริง
- **`KeyError`**: เข้าถึง Key ของ Dictionary ที่ไม่มีอยู่จริง
- **`FileNotFoundError`**: ค้นหาไฟล์ที่ไม่มีอยู่ตาม Path ที่ระบุ', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (166, 14, 3, 'โครงสร้างพื้นฐาน try - except', 'คำสั่ง `try` ใช้สำหรับห่อหุ้มโค้ดที่มีความเสี่ยงจะเกิด Error หากเกิด Exception ขึ้น โปรแกรมจะไม่ Crash แต่จะกระโดดไปทำงานที่บล็อก `except` ทันที

```python
try:
    number = int(input("กรุณากรอกตัวเลข: "))
    result = 10 / number
    print(f"ผลลัพธ์: {result}")
except:
    print("เกิดข้อผิดพลาดในการคำนวณ!")
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (167, 14, 4, 'การดักจับ Exception เฉพาะเจาะจง (Specific Exceptions)', 'การใช้ `except` ลอยๆ อาจทำให้เราไม่รู้สาเหตุแท้จริง จึงควรระบุชนิด Exception ที่ต้องการดักจับ และสามารถมีได้หลาย `except` ในชุดเดียวกัน

```python
try:
    num = int(input("ป้อนตัวเลข: "))
    res = 100 / num
except ValueError:
    print("ข้อผิดพลาด: คุณต้องกรอกตัวเลขเท่านั้น")
except ZeroDivisionError:
    print("ข้อผิดพลาด: ห้ามหารด้วยศูนย์")
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (168, 14, 5, 'การรับข้อความ Error มาใช้งานด้วย as', 'เราสามารถดักจับ Exception และดึงเอาข้อความอธิบายความผิดพลาดของระบบมาแสดงผลได้ด้วยการใช้ `as`

```python
try:
    file = open("data.txt", "r")
    content = file.read()
except FileNotFoundError as e:
    print(f"ระบบแจ้งข้อผิดพลาด: {e}")
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (169, 14, 6, 'โครงสร้างเพิ่มเติม: else และ finally', 'โครงสร้างแบบเต็มของการจัดการ Exception ประกอบด้วย:

- **`else`**: ทำงานเมื่อ **ไม่เกิด Exception ใดๆ เลย** ในบล็อก try
- **`finally`**: ทำงาน **เสมอ** ไม่ว่าจะเกิด Exception หรือไม่ก็ตาม (นิยมใช้ปิดไฟล์ หรือปิด Connection ฐานข้อมูล)

```python
try:
    x = 10 / 2
except ZeroDivisionError:
    print("Error")
else:
    print(f"คำนวณสำเร็จ! ค่าที่ได้คือ {x}")
finally:
    print("จบขั้นตอนการทำงาน (ทำงานเสมอ)")
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (170, 14, 7, 'การส่งสัญญาณข้อผิดพลาดด้วยคำสั่ง raise', 'ในกรณีที่เราต้องการสร้างเงื่อนไขข้อผิดพลาดขึ้นมาเองตามตรรกะทางธุรกิจ เราสามารถใช้คำสั่ง `raise` เพื่อสร้าง Exception ขึ้นมาได้

```python
def set_age(age):
    if age < 0:
        raise ValueError("อายุต้องไม่ติดลบ!")
    print(f"ตั้งค่าอายุเรียบร้อย: {age}")

try:
    set_age(-5)
except ValueError as err:
    print(err)  # ผลลัพธ์: อายุต้องไม่ติดลบ!
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (171, 14, 8, 'การสร้าง Exception ของตัวเอง (Custom Exceptions)', 'ในระบบขนาดใหญ่ เราสามารถสร้างคลาส Exception ขึ้นมาเองได้โดยการสืบทอด (Inherit) จากคลาส `Exception` พื้นฐานของ Python

```python
class InvalidPasswordError(Exception):
    """Exception เมื่อรหัสผ่านไม่ปลอดภัย"""
    pass

password = "123"
if len(password) < 6:
    raise InvalidPasswordError("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร")
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (172, 14, 9, 'ตัวอย่างการประยุกต์ใช้งานจริง (Best Practices)', 'ตัวอย่างระบบรับค่าตัวเลขแบบวนซ้ำจนกว่าผู้ใช้จะกรอกข้อมูลถูกต้อง ป้องกันโปรแกรมล่มจากการกรอกตัวอักษร:

```python
while True:
    try:
        age = int(input("กรุณาป้อนอายุของคุณ: "))
        if age <= 0:
            print("อายุต้องมากกว่า 0 ปี")
            continue
        break  # ออกจากลูปเมื่อกรอกถูก
    except ValueError:
        print("ข้อมูลไม่ถูกต้อง! กรุณากรอกตัวเลขเต็มเท่านั้น")

print(f"ลงทะเบียนอายุ {age} ปี เรียบร้อย")
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (173, 14, 10, 'สรุปบทเรียน: การจัดการข้อผิดพลาด (Exception Handling)', '1. **`try`**: ใส่โค้ดที่มีความเสี่ยงจะเกิด Runtime Error
2. **`except ExceptionType`**: ดักจับและจัดการข้อผิดพลาดตามชนิดที่ระบุ
3. **`else`**: ทำงานเมื่อไม่มีข้อผิดพลาดเกิดขึ้นเลยใน try
4. **`finally`**: ทำงานเสมอไม่ว่าจะเกิด Error หรือไม่ (เหมาะแก่การล้างทรัพยากร)
5. **`raise`**: ใช้สร้าง/สั่งให้เกิด Exception ขึ้นมาเองตามเงื่อนไขที่ต้องการ', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (174, 15, 1, 'ทำความรู้จักกับ List และ Tuple', 'ทั้ง **List** และ **Tuple** เป็นชนิดข้อมูลประเภท Sequence ใน Python ที่ใช้เก็บชุดข้อมูลหลายๆ ค่าไว้ในตัวแปรเดียว

**ข้อแตกต่างสำคัญ:**
- **List `[...]`**: เป็นประเภท **Mutable** (สามารถแก้ไข เพิ่ม หรือลบข้อมูลภายหลังได้)
- **Tuple `(...)`**: เป็นประเภท **Immutable** (เมื่อสร้างแล้ว ไม่สามารถแก้ไข เพิ่ม หรือลบข้อมูลได้เลย)

*Tuple ใช้หน่วยความจำน้อยกว่าและทำงานเร็วกว่า List เหมาะกับข้อมูลคงที่*', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (175, 15, 2, 'การสร้างและการเข้าถึงข้อมูล (Indexing)', 'ลำดับของข้อมูลใน Sequence จะเริ่มจากดัชนี (Index) **0** เสมอ และรองรับการใช้อินเด็กซ์ติดลบเพื่อดึงข้อมูลจากท้าย

```python
fruits_list = ["apple", "banana", "cherry"]
fruits_tuple = ("apple", "banana", "cherry")

print(fruits_list[0])   # ผลลัพธ์: apple
print(fruits_tuple[-1])  # ผลลัพธ์: cherry (ตัวสุดท้าย)
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (176, 15, 3, 'การเลือกช่วงข้อมูล (Slicing)', 'เราสามารถดึงข้อมูลเฉพาะช่วงที่ต้องการได้โดยใช้ไวยากรณ์ `[start:stop:step]`
- `start`: ดัชนีเริ่มต้น (รวมตัวนี้)
- `stop`: ดัชนีสิ้นสุด (ไม่รวมตัวนี้)
- `step`: ระยะการก้าว

```python
numbers = [0, 10, 20, 30, 40, 50]
print(numbers[1:4])   # ผลลัพธ์: [10, 20, 30]
print(numbers[::2])    # ผลลัพธ์: [0, 20, 40] (ข้ามทีละ 2)
print(numbers[::-1])   # ผลลัพธ์: [50, 40, 30, 20, 10, 0] (ย้อนกลับ)
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (177, 15, 4, 'การเพิ่มข้อมูลใน List', 'List มีเมธอดหลักสำหรับเพิ่มสมาชิกดังนี้:

- **`append(item)`**: เพิ่มข้อมูลต่อท้าย List
- **`insert(index, item)`**: แทรกข้อมูล ณ ตำแหน่งดัชนีที่กำหนด
- **`extend(iterable)`**: นำสมาชิกจากอีก List หรือ Tuple มาต่อท้าย

```python
items = ["A", "B"]
items.append("C")       # ["A", "B", "C"]
items.insert(1, "X")    # ["A", "X", "B", "C"]
items.extend(["Y", "Z"]) # ["A", "X", "B", "C", "Y", "Z"]
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (178, 15, 5, 'การลบข้อมูลออกจาก List', 'การลบข้อมูลใน List มีหลายวิธีตามวัตถุประสงค์:

- **`remove(value)`**: ลบสมาชิกตัวแรกที่ตรงกับค่าที่ระบุ
- **`pop(index)`**: เอาสมาชิกตามดัชนีออก (หากไม่ใส่ index จะนำตัวสุดท้ายออก) และคืนค่านั้นมา
- **`clear()`**: ลบสมาชิกทั้งหมดใน List ออก
- **`del`**: คำสั่งลบตัวแปรหรือสมาชิกตามตำแหน่ง

```python
colors = ["red", "green", "blue", "green"]
colors.remove("green")  # ลบ green ตัวแรกออก
removed = colors.pop()  # ลบและคืนค่าตัวสุดท้าย
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (179, 15, 6, 'เมธอดที่มีประโยชน์สำหรับ List', 'การจัดการและค้นหาข้อมูลภายใน List:

- **`sort()`**: จัดเรียงข้อมูลใน List (ตามลำดับน้อยไปมาก หรือ ก-ฮ)
- **`reverse()`**: กลับลำดับสมาชิกใน List จากหน้าไปหลัง
- **`count(value)`**: นับจำนวนครั้งที่ค่านั้นปรากฏใน List
- **`index(value)`**: คืนค่าดัชนีแรกที่พบข้อมูลนั้น
- **`len(list)`**: นับจำนวนสมาชิกทั้งหมด', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (180, 15, 7, 'คุณสมบัติเฉพาะและการใช้งาน Tuple', 'แม้ Tuple จะแก้ไขข้อมูลไม่ได้ แต่นิยมใช้ในสถานการณ์ต่อไปนี้:

1. **Unpacking**: การกระจายค่าจาก Tuple ใส่ตัวแปรหลายๆ ตัว
2. **Return Multiple Values**: ใช้คืนค่าหลายค่าจากฟังก์ชัน

```python
# Tuple Unpacking
point = (10, 20)
x, y = point
print(f"X: {x}, Y: {y}")  # X: 10, Y: 20

# การสร้าง Tuple สมาชิก 1 ตัว ต้องมีจุลภาคต่อท้ายเสมอ!
single_tuple = (5,)  # ชนิดข้อมูลคือ tuple (ถ้าไม่มี comma จะเป็น int)
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (181, 15, 8, 'การสร้าง List แบบรัดกุม (List Comprehension)', 'List Comprehension ช่วยให้เราสร้าง List ใหม่จาก Sequence เดิมได้ในโค้ดบรรทัดเดียว รูปแบบ: `[expression for item in iterable if condition]`

```python
# แบบปกติ
evens = []
for i in range(10):
    if i % 2 == 0:
        evens.append(i)

# แบบ List Comprehension (สั้นกระชับกว่า)
evens = [i for i in range(10) if i % 2 == 0]
# ผลลัพธ์: [0, 2, 4, 6, 8]
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (182, 15, 9, 'การแปลงชนิดข้อมูลระหว่าง List และ Tuple', 'เราสามารถแปลง List เป็น Tuple หรือแปลง Tuple กลับมาเป็น List ได้ง่ายๆ ผ่านคอนสตรัคเตอร์ `list()` และ `tuple()`

```python
# ใช้เมื่อต้องการแก้ไขข้อมูลใน Tuple
my_tuple = (1, 2, 3)
temp_list = list(my_tuple)  # แปลงเป็น List เพื่อแก้ไข
temp_list.append(4)
my_tuple = tuple(temp_list)  # แปลงกลับเป็น Tuple
print(my_tuple)  # ผลลัพธ์: (1, 2, 3, 4)
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (183, 15, 10, 'สรุปบทเรียน: List และ Tuple', '1. **List `[...]`**: แก้ไขได้ (Mutable) เหมาะกับชุดข้อมูลที่มีการเปลี่ยนแปลงบ่อย
2. **Tuple `(...)`**: แก้ไขไม่ได้ (Immutable) เหมาะกับข้อมูลคงที่ ทำงานเร็วและปลอดภัย
3. การเข้าถึงข้อมูลใช้ **Index** (เริ่มจาก 0) และตัดช่วงด้วย **Slicing `[start:stop:step]`**
4. เพิ่มข้อมูลใน List ด้วย `append()`, `insert()`, `extend()` และลบด้วย `remove()`, `pop()`
5. **List Comprehension** ช่วยสร้าง List ใหม่ได้กระชับและมีประสิทธิภาพสูง', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (184, 15, 1, 'ทำความรู้จักกับ List และ Tuple', 'ทั้ง **List** และ **Tuple** เป็นชนิดข้อมูลประเภท Sequence ใน Python ที่ใช้เก็บชุดข้อมูลหลายๆ ค่าไว้ในตัวแปรเดียว

**ข้อแตกต่างสำคัญ:**
- **List `[...]`**: เป็นประเภท **Mutable** (สามารถแก้ไข เพิ่ม หรือลบข้อมูลภายหลังได้)
- **Tuple `(...)`**: เป็นประเภท **Immutable** (เมื่อสร้างแล้ว ไม่สามารถแก้ไข เพิ่ม หรือลบข้อมูลได้เลย)

*Tuple ใช้หน่วยความจำน้อยกว่าและทำงานเร็วกว่า List เหมาะกับข้อมูลคงที่*', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (185, 15, 2, 'การสร้างและการเข้าถึงข้อมูล (Indexing)', 'ลำดับของข้อมูลใน Sequence จะเริ่มจากดัชนี (Index) **0** เสมอ และรองรับการใช้อินเด็กซ์ติดลบเพื่อดึงข้อมูลจากท้าย

```python
fruits_list = ["apple", "banana", "cherry"]
fruits_tuple = ("apple", "banana", "cherry")

print(fruits_list[0])   # ผลลัพธ์: apple
print(fruits_tuple[-1])  # ผลลัพธ์: cherry (ตัวสุดท้าย)
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (186, 15, 3, 'การเลือกช่วงข้อมูล (Slicing)', 'เราสามารถดึงข้อมูลเฉพาะช่วงที่ต้องการได้โดยใช้ไวยากรณ์ `[start:stop:step]`
- `start`: ดัชนีเริ่มต้น (รวมตัวนี้)
- `stop`: ดัชนีสิ้นสุด (ไม่รวมตัวนี้)
- `step`: ระยะการก้าว

```python
numbers = [0, 10, 20, 30, 40, 50]
print(numbers[1:4])   # ผลลัพธ์: [10, 20, 30]
print(numbers[::2])    # ผลลัพธ์: [0, 20, 40] (ข้ามทีละ 2)
print(numbers[::-1])   # ผลลัพธ์: [50, 40, 30, 20, 10, 0] (ย้อนกลับ)
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (187, 15, 4, 'การเพิ่มข้อมูลใน List', 'List มีเมธอดหลักสำหรับเพิ่มสมาชิกดังนี้:

- **`append(item)`**: เพิ่มข้อมูลต่อท้าย List
- **`insert(index, item)`**: แทรกข้อมูล ณ ตำแหน่งดัชนีที่กำหนด
- **`extend(iterable)`**: นำสมาชิกจากอีก List หรือ Tuple มาต่อท้าย

```python
items = ["A", "B"]
items.append("C")       # ["A", "B", "C"]
items.insert(1, "X")    # ["A", "X", "B", "C"]
items.extend(["Y", "Z"]) # ["A", "X", "B", "C", "Y", "Z"]
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (188, 15, 5, 'การลบข้อมูลออกจาก List', 'การลบข้อมูลใน List มีหลายวิธีตามวัตถุประสงค์:

- **`remove(value)`**: ลบสมาชิกตัวแรกที่ตรงกับค่าที่ระบุ
- **`pop(index)`**: เอาสมาชิกตามดัชนีออก (หากไม่ใส่ index จะนำตัวสุดท้ายออก) และคืนค่านั้นมา
- **`clear()`**: ลบสมาชิกทั้งหมดใน List ออก
- **`del`**: คำสั่งลบตัวแปรหรือสมาชิกตามตำแหน่ง

```python
colors = ["red", "green", "blue", "green"]
colors.remove("green")  # ลบ green ตัวแรกออก
removed = colors.pop()  # ลบและคืนค่าตัวสุดท้าย
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (189, 15, 6, 'เมธอดที่มีประโยชน์สำหรับ List', 'การจัดการและค้นหาข้อมูลภายใน List:

- **`sort()`**: จัดเรียงข้อมูลใน List (ตามลำดับน้อยไปมาก หรือ ก-ฮ)
- **`reverse()`**: กลับลำดับสมาชิกใน List จากหน้าไปหลัง
- **`count(value)`**: นับจำนวนครั้งที่ค่านั้นปรากฏใน List
- **`index(value)`**: คืนค่าดัชนีแรกที่พบข้อมูลนั้น
- **`len(list)`**: นับจำนวนสมาชิกทั้งหมด', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (259, 20, 6, 'ตัวอย่างการประยุกต์ใช้ Polymorphism', 'สร้างฟังก์ชันกลางที่รับ Object ใดๆ ก็ได้ที่มีเมธอดชื่อเดียวกันไปประมวลผล

```python
class Dog:
    def speak(self):
        return "โฮ่งๆ!"

class Cat:
    def speak(self):
        return "เหมียวๆ!"

def animal_sound(animal_object):
    print(animal_object.speak())

animal_sound(Dog())  # Output: โฮ่งๆ!
animal_sound(Cat())  # Output: เหมียวๆ!
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (190, 15, 7, 'คุณสมบัติเฉพาะและการใช้งาน Tuple', 'แม้ Tuple จะแก้ไขข้อมูลไม่ได้ แต่นิยมใช้ในสถานการณ์ต่อไปนี้:

1. **Unpacking**: การกระจายค่าจาก Tuple ใส่ตัวแปรหลายๆ ตัว
2. **Return Multiple Values**: ใช้คืนค่าหลายค่าจากฟังก์ชัน

```python
# Tuple Unpacking
point = (10, 20)
x, y = point
print(f"X: {x}, Y: {y}")  # X: 10, Y: 20

# การสร้าง Tuple สมาชิก 1 ตัว ต้องมีจุลภาคต่อท้ายเสมอ!
single_tuple = (5,)  # ชนิดข้อมูลคือ tuple (ถ้าไม่มี comma จะเป็น int)
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (191, 15, 8, 'การสร้าง List แบบรัดกุม (List Comprehension)', 'List Comprehension ช่วยให้เราสร้าง List ใหม่จาก Sequence เดิมได้ในโค้ดบรรทัดเดียว รูปแบบ: `[expression for item in iterable if condition]`

```python
# แบบปกติ
evens = []
for i in range(10):
    if i % 2 == 0:
        evens.append(i)

# แบบ List Comprehension (สั้นกระชับกว่า)
evens = [i for i in range(10) if i % 2 == 0]
# ผลลัพธ์: [0, 2, 4, 6, 8]
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (192, 15, 9, 'การแปลงชนิดข้อมูลระหว่าง List และ Tuple', 'เราสามารถแปลง List เป็น Tuple หรือแปลง Tuple กลับมาเป็น List ได้ง่ายๆ ผ่านคอนสตรัคเตอร์ `list()` และ `tuple()`

```python
# ใช้เมื่อต้องการแก้ไขข้อมูลใน Tuple
my_tuple = (1, 2, 3)
temp_list = list(my_tuple)  # แปลงเป็น List เพื่อแก้ไข
temp_list.append(4)
my_tuple = tuple(temp_list)  # แปลงกลับเป็น Tuple
print(my_tuple)  # ผลลัพธ์: (1, 2, 3, 4)
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (193, 15, 10, 'สรุปบทเรียน: List และ Tuple', '1. **List `[...]`**: แก้ไขได้ (Mutable) เหมาะกับชุดข้อมูลที่มีการเปลี่ยนแปลงบ่อย
2. **Tuple `(...)`**: แก้ไขไม่ได้ (Immutable) เหมาะกับข้อมูลคงที่ ทำงานเร็วและปลอดภัย
3. การเข้าถึงข้อมูลใช้ **Index** (เริ่มจาก 0) และตัดช่วงด้วย **Slicing `[start:stop:step]`**
4. เพิ่มข้อมูลใน List ด้วย `append()`, `insert()`, `extend()` และลบด้วย `remove()`, `pop()`
5. **List Comprehension** ช่วยสร้าง List ใหม่ได้กระชับและมีประสิทธิภาพสูง', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (194, 16, 1, 'ทำความรู้จักกับ Dictionary และ Set', 'นอกจาก List และ Tuple แล้ว ภาษา Python มีโครงสร้างข้อมูลสำคัญอีก 2 ชนิดที่ใช้ปีกกา `{}` ในการสร้าง:

1. **Dictionary (`{key: value}`)**: เก็บข้อมูลคู่ระหว่าง **Key** และ **Value** ค้นหาข้อมูลได้เร็วผ่าน Key (Key ห้ามซ้ำกัน)
2. **Set (`{item1, item2}`)**: เก็บชุดข้อมูลที่ **ไม่มีลำดับ (Unordered)** และ **ไม่มีสมาชิกซ้ำกัน (Unique Elements)** เด่นเรื่องการหาค่าที่ซ้ำและการคำนวณทางคณิตศาสตร์เซต', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (195, 16, 2, 'การสร้างและการเข้าถึงข้อมูลใน Dictionary', 'การอ้างอิงข้อมูลใน Dictionary จะอ้างอิงผ่าน **Key** แทนการใช้ Index ตัวเลข

```python
student = {
    "name": "สมชาย",
    "age": 18,
    "gpa": 3.50
}

# การเข้าถึงข้อมูลด้วย Key
print(student["name"])     # ผลลัพธ์: สมชาย

# การใช้ get() ช่วยป้องกัน Error กรณีไม่พบ Key
print(student.get("major", "ไม่พบข้อมูล"))  # ผลลัพธ์: ไม่พบข้อมูล
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (196, 16, 3, 'การเพิ่ม แก้ไข และลบข้อมูลใน Dictionary', 'การจัดการข้อมูลภายใน Dictionary สามารถทำได้ง่ายผ่านการกำหนดค่า Key ดังนี้:

```python
person = {"name": "Alice", "age": 25}

# การเพิ่ม/แก้ไขข้อมูล
person["age"] = 26          # แก้ไขค่า age เดิม
person["city"] = "Bangkok"   # เพิ่ม Key ใหม่ชื่อ city

# การลบข้อมูล
del person["age"]           # ลบ Key age ออก
removed_val = person.pop("city")  # ลบ city พร้อมคืนค่ากลับมา
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (197, 16, 4, 'เมธอดสำคัญสำหรับการวนลูป Dictionary', 'การดึงข้อมูลจาก Dictionary ออกมาทำซ้ำด้วย `for` loop นิยมใช้ 3 เมธอดหลัก:

- **`keys()`**: คืนค่าเฉพาะ Key ทั้งหมด
- **`values()`**: คืนค่าเฉพาะ Value ทั้งหมด
- **`items()`**: คืนค่าออกมาเป็นคู่ `(Key, Value)` ในรูปแบบ Tuple

```python
scores = {"Math": 90, "English": 85}

for subject, score in scores.items():
    print(f"วิชา {subject} ได้ {score} คะแนน")
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (198, 16, 5, 'ทำความรู้จักกับ Set และคุณสมบัติสมาชิกไม่ซ้ำ', 'Set ไม่รองรับ Indexing หรือ Slicing เนื่องจากไม่มีลำดับ และหากมีข้อมูลซ้ำตอนสร้าง Set จะลบตัวซ้ำออกให้อัตโนมัติ

```python
# สมาชิกที่ซ้ำจะถูกตัดเหลือเพียงตัวเดียว
numbers = {1, 2, 2, 3, 4, 4, 4, 5}
print(numbers)  # ผลลัพธ์: {1, 2, 3, 4, 5}

# การลบตัวซ้ำจาก List อย่างรวดเร็วด้วย set()
raw_list = ["A", "B", "A", "C"]
unique_list = list(set(raw_list))
print(unique_list)  # ผลลัพธ์: [''A'', ''B'', ''C''] (หรือสลับลำดับ)
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (199, 16, 6, 'การเพิ่มและลบสมาชิกใน Set', 'การทำงานกับข้อมูลสมาชิกใน Set มีเมธอดหลักดังนี้:

- **`add(item)`**: เพิ่มสมาชิกใหม่เข้า Set
- **`remove(item)`**: ลบสมาชิกที่กำหนด (หากไม่พบจะเกิด KeyError)
- **`discard(item)`**: ลบสมาชิกที่กำหนด (หากไม่พบจะไม่เกิด Error)
- **`clear()`**: ลบสมาชิกทั้งหมดใน Set

```python
my_set = {10, 20}
my_set.add(30)       # {10, 20, 30}
my_set.discard(99)   # ไม่เกิด Error แม้ไม่มี 99
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (200, 16, 7, 'การดำเนินการทางเซต (Set Operations)', 'Python รองรับการเปรียบเทียบเซตตามหลักคณิตศาสตร์อย่างครบถ้วน:

- **Union (`|`)**: รวมสมาชิกจากทั้งสองเซต
- **Intersection (`&`)**: เอาเฉพาะสมาชิกที่มีร่วมกันทั้งสองเซต
- **Difference (`-`)**: เอาสมาชิกในเซตแรกที่ไม่มีในเซตหลัง
- **Symmetric Difference (`^`)**: เอาสมาชิกที่อยู่คนละเซต (ไม่เอาตัวที่ซ้ำกัน)

```python
A = {1, 2, 3}
B = {3, 4, 5}
print(A | B)  # {1, 2, 3, 4, 5}
print(A & B)  # {3}
print(A - B)  # {1, 2}
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (201, 16, 8, 'Dictionary Comprehension', 'เช่นเดียวกับ List เราสามารถสร้าง Dictionary ใหม่ได้อย่างรวดเร็วด้วยไวยากรณ์ Comprehension: `{key_expr: val_expr for item in iterable}`

```python
names = ["สมชาย", "สมหญิง", "สมศักดิ์"]
# สร้าง Dictionary เก็บความยาวชื่อ
name_lengths = {name: len(name) for name in names}
print(name_lengths)
# ผลลัพธ์: {''สมชาย'': 6, ''สมหญิง'': 6, ''สมศักดิ์'': 7}
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (202, 16, 9, 'ข้อควรระวังในการใช้งาน Dictionary และ Set', '1. **การสร้าง Set ว่าง**: ต้องใช้คำสั่ง `set()` เท่านั้น เพราะการเขียน `{}` เฉพาะวงเล็บเปล่า Python จะเข้าใจว่าเป็น **Dictionary ว่าง**
2. **Key ของ Dictionary**: ต้องเป็นข้อมูลประเภท Immutable (เช่น int, str, tuple) ห้ามใช้ List หรือ Dict เป็น Key
3. **สมาชิกของ Set**: สมาชิกใน Set ต้องเป็นข้อมูลชนิด Immutable เช่นกัน', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (203, 16, 10, 'สรุปบทเรียน: Dictionary และ Set', '1. **Dictionary (`{k: v}`)**: เก็บแบบคู่ Key-Value ค้นหาเร็วผ่าน Key นิยมใช้ `get()` ป้องกัน Error
2. เมธอดวนลูป Dict: `keys()`, `values()`, และ `items()`
3. **Set (`{...}`)**: สมาชิกไม่มีลำดับ และ **ไม่มีตัวซ้ำ**
4. คำนวณเซตด้วย **Union (`|`)**, **Intersection (`&`)**, และ **Difference (`-`)**
5. สร้าง Set ว่างใช้ **`set()`** (ไม่ใช่ `{}` ที่เป็น Dict ว่าง)', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (204, 16, 1, 'ทำความรู้จักกับ Dictionary และ Set', 'นอกจาก List และ Tuple แล้ว ภาษา Python มีโครงสร้างข้อมูลสำคัญอีก 2 ชนิดที่ใช้ปีกกา `{}` ในการสร้าง:

1. **Dictionary (`{key: value}`)**: เก็บข้อมูลคู่ระหว่าง **Key** และ **Value** ค้นหาข้อมูลได้เร็วผ่าน Key (Key ห้ามซ้ำกัน)
2. **Set (`{item1, item2}`)**: เก็บชุดข้อมูลที่ **ไม่มีลำดับ (Unordered)** และ **ไม่มีสมาชิกซ้ำกัน (Unique Elements)** เด่นเรื่องการหาค่าที่ซ้ำและการคำนวณทางคณิตศาสตร์เซต', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (205, 16, 2, 'การสร้างและการเข้าถึงข้อมูลใน Dictionary', 'การอ้างอิงข้อมูลใน Dictionary จะอ้างอิงผ่าน **Key** แทนการใช้ Index ตัวเลข

```python
student = {
    "name": "สมชาย",
    "age": 18,
    "gpa": 3.50
}

# การเข้าถึงข้อมูลด้วย Key
print(student["name"])     # ผลลัพธ์: สมชาย

# การใช้ get() ช่วยป้องกัน Error กรณีไม่พบ Key
print(student.get("major", "ไม่พบข้อมูล"))  # ผลลัพธ์: ไม่พบข้อมูล
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (206, 16, 3, 'การเพิ่ม แก้ไข และลบข้อมูลใน Dictionary', 'การจัดการข้อมูลภายใน Dictionary สามารถทำได้ง่ายผ่านการกำหนดค่า Key ดังนี้:

```python
person = {"name": "Alice", "age": 25}

# การเพิ่ม/แก้ไขข้อมูล
person["age"] = 26          # แก้ไขค่า age เดิม
person["city"] = "Bangkok"   # เพิ่ม Key ใหม่ชื่อ city

# การลบข้อมูล
del person["age"]           # ลบ Key age ออก
removed_val = person.pop("city")  # ลบ city พร้อมคืนค่ากลับมา
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (207, 16, 4, 'เมธอดสำคัญสำหรับการวนลูป Dictionary', 'การดึงข้อมูลจาก Dictionary ออกมาทำซ้ำด้วย `for` loop นิยมใช้ 3 เมธอดหลัก:

- **`keys()`**: คืนค่าเฉพาะ Key ทั้งหมด
- **`values()`**: คืนค่าเฉพาะ Value ทั้งหมด
- **`items()`**: คืนค่าออกมาเป็นคู่ `(Key, Value)` ในรูปแบบ Tuple

```python
scores = {"Math": 90, "English": 85}

for subject, score in scores.items():
    print(f"วิชา {subject} ได้ {score} คะแนน")
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (260, 20, 7, 'การสืบทอดหลายคลาส (Multiple Inheritance)', 'Python สนับสนุนให้คลาสลูกหนึ่งคลาสสามารถสืบทอดคุณสมบัติมาจาก Parent Class **หลายคลาสพร้อมกัน** ได้

```python
class Flyer:
    def fly(self):
        print("กำลังบิน...")

class Swimmer:
    def swim(self):
        print("กำลังว่ายน้ำ...")

class Duck(Flyer, Swimmer):  # สืบทอดจาก 2 คลาสแม่
    pass

donald = Duck()
donald.fly()
donald.swim()
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (208, 16, 5, 'ทำความรู้จักกับ Set และคุณสมบัติสมาชิกไม่ซ้ำ', 'Set ไม่รองรับ Indexing หรือ Slicing เนื่องจากไม่มีลำดับ และหากมีข้อมูลซ้ำตอนสร้าง Set จะลบตัวซ้ำออกให้อัตโนมัติ

```python
# สมาชิกที่ซ้ำจะถูกตัดเหลือเพียงตัวเดียว
numbers = {1, 2, 2, 3, 4, 4, 4, 5}
print(numbers)  # ผลลัพธ์: {1, 2, 3, 4, 5}

# การลบตัวซ้ำจาก List อย่างรวดเร็วด้วย set()
raw_list = ["A", "B", "A", "C"]
unique_list = list(set(raw_list))
print(unique_list)  # ผลลัพธ์: [''A'', ''B'', ''C''] (หรือสลับลำดับ)
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (209, 16, 6, 'การเพิ่มและลบสมาชิกใน Set', 'การทำงานกับข้อมูลสมาชิกใน Set มีเมธอดหลักดังนี้:

- **`add(item)`**: เพิ่มสมาชิกใหม่เข้า Set
- **`remove(item)`**: ลบสมาชิกที่กำหนด (หากไม่พบจะเกิด KeyError)
- **`discard(item)`**: ลบสมาชิกที่กำหนด (หากไม่พบจะไม่เกิด Error)
- **`clear()`**: ลบสมาชิกทั้งหมดใน Set

```python
my_set = {10, 20}
my_set.add(30)       # {10, 20, 30}
my_set.discard(99)   # ไม่เกิด Error แม้ไม่มี 99
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (210, 16, 7, 'การดำเนินการทางเซต (Set Operations)', 'Python รองรับการเปรียบเทียบเซตตามหลักคณิตศาสตร์อย่างครบถ้วน:

- **Union (`|`)**: รวมสมาชิกจากทั้งสองเซต
- **Intersection (`&`)**: เอาเฉพาะสมาชิกที่มีร่วมกันทั้งสองเซต
- **Difference (`-`)**: เอาสมาชิกในเซตแรกที่ไม่มีในเซตหลัง
- **Symmetric Difference (`^`)**: เอาสมาชิกที่อยู่คนละเซต (ไม่เอาตัวที่ซ้ำกัน)

```python
A = {1, 2, 3}
B = {3, 4, 5}
print(A | B)  # {1, 2, 3, 4, 5}
print(A & B)  # {3}
print(A - B)  # {1, 2}
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (211, 16, 8, 'Dictionary Comprehension', 'เช่นเดียวกับ List เราสามารถสร้าง Dictionary ใหม่ได้อย่างรวดเร็วด้วยไวยากรณ์ Comprehension: `{key_expr: val_expr for item in iterable}`

```python
names = ["สมชาย", "สมหญิง", "สมศักดิ์"]
# สร้าง Dictionary เก็บความยาวชื่อ
name_lengths = {name: len(name) for name in names}
print(name_lengths)
# ผลลัพธ์: {''สมชาย'': 6, ''สมหญิง'': 6, ''สมศักดิ์'': 7}
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (212, 16, 9, 'ข้อควรระวังในการใช้งาน Dictionary และ Set', '1. **การสร้าง Set ว่าง**: ต้องใช้คำสั่ง `set()` เท่านั้น เพราะการเขียน `{}` เฉพาะวงเล็บเปล่า Python จะเข้าใจว่าเป็น **Dictionary ว่าง**
2. **Key ของ Dictionary**: ต้องเป็นข้อมูลประเภท Immutable (เช่น int, str, tuple) ห้ามใช้ List หรือ Dict เป็น Key
3. **สมาชิกของ Set**: สมาชิกใน Set ต้องเป็นข้อมูลชนิด Immutable เช่นกัน', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (213, 16, 10, 'สรุปบทเรียน: Dictionary และ Set', '1. **Dictionary (`{k: v}`)**: เก็บแบบคู่ Key-Value ค้นหาเร็วผ่าน Key นิยมใช้ `get()` ป้องกัน Error
2. เมธอดวนลูป Dict: `keys()`, `values()`, และ `items()`
3. **Set (`{...}`)**: สมาชิกไม่มีลำดับ และ **ไม่มีตัวซ้ำ**
4. คำนวณเซตด้วย **Union (`|`)**, **Intersection (`&`)**, และ **Difference (`-`)**
5. สร้าง Set ว่างใช้ **`set()`** (ไม่ใช่ `{}` ที่เป็น Dict ว่าง)', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (214, 17, 1, 'ทำความรู้จักกับ File Handling ใน Python', 'การทำงานกับไฟล์ (File Handling) ช่วยให้โปรแกรมสามารถ **อ่านข้อมูลจากไฟล์** หรือ **บันทึกข้อมูลเก็บไว้** ในฮาร์ดดิสก์ได้อย่างถาวร แม้ปิดโปรแกรมไปแล้วข้อมูลก็จะไม่สูญหาย

**ขั้นตอนหลักในการจัดการไฟล์:**
1. **Open**: เปิดไฟล์และระบุโหมดการทำงาน
2. **Process**: อ่าน (Read) หรือเขียน (Write) ข้อมูล
3. **Close**: ปิดไฟล์เพื่อคืนทรัพยากรให้ระบบ', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (215, 17, 2, 'โหมดในการเปิดไฟล์ (File Modes)', 'ฟังก์ชัน `open()` ต้องระบุโหมดการทำงานที่ต้องการเสมอ:

- **`"r"` (Read)**: เปิดอ่านไฟล์อย่างเดียว (เป็นค่าเริ่มต้น หากไม่มีไฟล์จะเกิด Error)
- **`"w"` (Write)**: เปิดเขียนไฟล์ (ถ้ามีไฟล์เดิมอยู่จะถูกทับทั้งหมด หากไม่มีจะสร้างใหม่)
- **`"a"` (Append)**: เปิดเขียนต่อท้ายไฟล์ (เขียนเพิ่มต่อจากข้อมูลเดิม)
- **`"x"` (Create)**: สร้างไฟล์ใหม่ (หากมีไฟล์อยู่แล้วจะเกิด Error)
- **`"b"` (Binary)**: ทำงานกับไฟล์ไบนารี เช่น รูปภาพ เสียง (`"rb"`, `"wb"`)', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (216, 17, 3, 'การเปิดและปิดไฟล์ด้วย open() และ close()', 'การเปิดไฟล์ด้วยฟังก์ชัน `open()` แบบพื้นฐาน ต้องคืนทรัพยากรด้วย `close()` เสมอเมื่อใช้งานเสร็จ

```python
# เปิดไฟล์เพื่อเขียนข้อมูล
file = open("demo.txt", "w", encoding="utf-8")
file.write("สวัสดี Python File Handling
")
file.close()  # ต้องปิดไฟล์เสมอเพื่อป้องกันข้อมูลสูญหาย
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (217, 17, 4, 'การจัดการไฟล์อย่างปลอดภัยด้วยคำสั่ง with statement', 'วิธีที่ดีและปลอดภัยที่สุดในการเปิดไฟล์คือการใช้ **`with` statement** เพราะระบบจะทำการ **ปิดไฟล์ให้อัตโนมัติ** เมื่อทำงานจบในบล็อก แม้จะเกิด Exception ขึ้นก็ตาม

```python
with open("demo.txt", "w", encoding="utf-8") as file:
    file.write("ข้อความบรรทัดที่ 1
")
    file.write("ข้อความบรรทัดที่ 2
")
# ไม่ต้องเรียก file.close() ระบบจัดการให้เรียบร้อย
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (218, 17, 5, 'วิธีการอ่านข้อมูลจากไฟล์ข้อความ (Text Files)', 'Python มีวิธีอ่านข้อมูลจากไฟล์หลายรูปแบบขึ้นอยู่กับความต้องการ:

- **`read()`**: อ่านเนื้อหาทั้งหมดในไฟล์ออกมาเป็น String เดียว
- **`readline()`**: อ่านทีละบรรทัด
- **`readlines()`**: อ่านทุกบรรทัดออกมาเป็น List ของ String

```python
with open("demo.txt", "r", encoding="utf-8") as file:
    content = file.read()
    print(content)
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (219, 17, 6, 'การวนลูปอ่านไฟล์ทีละบรรทัด (Line by Line)', 'การอ่านไฟล์ขนาดใหญ่ ควรใช้วิธีวนลูปอ่านทีละบรรทัด เพื่อประหยัดหน่วยความจำ RAM

```python
with open("demo.txt", "r", encoding="utf-8") as file:
    for line in file:
        print(line.strip())  # strip() ใช้ลบช่องว่างและ \n ท้ายบรรทัด
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (220, 17, 7, 'การทำงานกับไฟล์ตาราง CSV (Module csv)', 'ไฟล์ CSV (Comma-Separated Values) นิยมใช้เก็บข้อมูลตาราง Python มีโมดูล `csv` ช่วยจัดการได้ง่าย

```python
import csv

# การเขียนไฟล์ CSV
with open("data.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["Name", "Age"])
    writer.writerow(["Somchai", 20])

# การอ่านไฟล์ CSV
with open("data.csv", "r", encoding="utf-8") as f:
    reader = csv.reader(f)
    for row in reader:
        print(row)
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (221, 17, 8, 'การทำงานกับไฟล์โครงสร้าง JSON (Module json)', 'JSON นิยมใช้แลกเปลี่ยนข้อมูลในระบบเว็บ เราใช้โมดูล `json` แปลงระหว่าง Python Dict กับไฟล์ JSON ได้สะดวก

```python
import json

data = {"name": "Alice", "skills": ["Python", "SQL"]}

# บันทึกลงไฟล์ JSON (json.dump)
with open("user.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

# อ่านจากไฟล์ JSON (json.load)
with open("user.json", "r", encoding="utf-8") as f:
    loaded_data = json.load(f)
    print(loaded_data["name"])
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (222, 17, 9, 'การตรวจสอบและการจัดการไฟล์ด้วย os และ pathlib', 'ก่อนเปิดไฟล์ ควรตรวจสอบว่าไฟล์มีอยู่จริงหรือไม่เพื่อป้องกัน `FileNotFoundError`

```python
import os

file_path = "data.txt"

if os.path.exists(file_path):
    print("พบไฟล์ ทำการประมวลผล...")
    # os.remove(file_path)  # ใช้ลบไฟล์
else:
    print("ไม่พบไฟล์ในระบบ!")
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (223, 17, 10, 'สรุปบทเรียน: การทำงานกับไฟล์ (File Handling)', '1. เปิดไฟล์ใช้ **`open(filename, mode)`** โดยมีโหมดสำคัญ: **`r`** (อ่าน), **`w`** (เขียนทับ), **`a`** (เขียนต่อท้าย)
2. ควรใช้ **`with open(...) as file:`** เสมอเพื่อความปลอดภัยและการปิดไฟล์อัตโนมัติ
3. อ่านไฟล์ขนาดใหญ่ควรวนลูป **`for line in file:`** เพื่อประหยัด RAM
4. จัดการไฟล์ CSV ใช้โมดูล **`csv`** และ JSON ใช้โมดูล **`json`** (`dump`/`load`)
5. เช็กการมีอยู่ของไฟล์ด้วย **`os.path.exists()`** ป้องกัน Error', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (224, 18, 1, 'ทำความรู้จักกับ Exception Handling ใน Python', 'ข้อผิดพลาดในโปรแกรมแบ่งออกเป็น 2 ประเภทหลัก:

1. **Syntax Error**: เขียนไวยากรณ์ผิดตั้งแต่แรก โปรแกรมรันไม่ได้
2. **Runtime Error (Exception)**: เกิดขณะโปรแกรมกำลังรัน เช่น หารด้วยศูนย์ หรือหาไฟล์ไม่เจอ

การใช้ **Exception Handling** ช่วยให้โปรแกรมไม่ล่มกระทันหัน และสามารถจัดการกับความผิดพลาดได้อย่างเป็นระบบ', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (225, 18, 2, 'โครงสร้างพื้นฐาน try - except', 'คำสั่ง `try` ใช้ครอบโค้ดที่สุ่มเสี่ยงจะเกิด Error และ `except` ใช้ดักจับเมื่อเกิดข้อผิดพลาดขึ้น

```python
try:
    number = int(input("กรอกตัวเลข: "))
    result = 100 / number
    print(f"ผลลัพธ์: {result}")
except:
    print("เกิดข้อผิดพลาด! กรุณากรอกตัวเลขที่ไม่ใช่ 0")
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (226, 18, 3, 'การดักจับ Specific Exception', 'การดักจับข้อผิดพลาดแบบระบุประเภท (Specific Exception) ช่วยให้เราตอบสนองต่อปัญหาแต่ละแบบได้อย่างแม่นยำ

```python
try:
    num = int("abc")      # เกิด ValueError
    res = 10 / 0          # เกิด ZeroDivisionError
except ValueError:
    print("แปลงข้อมูลเป็นตัวเลขไม่สำเร็จ!")
except ZeroDivisionError:
    print("ห้ามหารด้วยตัวเลข 0!")
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (228, 18, 5, 'การใช้งาน else block', 'บล็อก `else` จะทำงานก็ต่อเมื่อ **ไม่มี Exception ใดๆ เกิดขึ้นเลย** ในบล็อก `try` นิยมใช้แยกโค้ดที่ทำงานสำเร็จออกจากส่วนทดสอบ

```python
try:
    val = int(input("ป้อนตัวเลขคู่: "))
except ValueError:
    print("ข้อมูลไม่ใช่ตัวเลข")
else:
    if val % 2 == 0:
        print("ถูกต้อง! เป็นตัวเลขคู่")
    else:
        print("ไม่ใช่ตัวเลขคู่")
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (229, 18, 6, 'การใช้งาน finally block', 'บล็อก `finally` จะ **ทำงานเสมอ** ไม่ว่าจะเกิด Exception หรือไม่ก็ตาม เหมาะสำหรับงานคืนทรัพยากร เช่น ปิดไฟล์ หรือปิดการเชื่อมต่อ Database

```python
try:
    file = open("data.txt", "w")
    file.write("Hello World")
except IOError:
    print("เขียนไฟล์ไม่สำเร็จ")
finally:
    file.close()
    print("ปิดไฟล์เรียบร้อยแล้ว")
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (230, 18, 7, 'การส่ง Exception ด้วยคำสั่ง raise', 'เราสามารถสร้างหรือส่ง Exception ขึ้นมาเองได้ตามเงื่อนไขทางธุรกิจ (Business Logic) ด้วยคีย์เวิร์ด `raise`

```python
def set_age(age):
    if age < 0:
        raise ValueError("อายุต้องไม่ติดลบ!")
    print(f"บันทึกอายุ {age} ปี เรียบร้อย")

try:
    set_age(-5)
except ValueError as error:
    print(f"เกิดข้อผิดพลาด: {error}")
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (231, 18, 8, 'การสร้าง Custom Exception Class', 'ในโปรแกรมขนาดใหญ่ เราสามารถสร้างคลาส Exception ของตนเองได้โดยการสืบทอด (Inherit) มาจากคลาส `Exception`

```python
class InsufficientBalanceError(Exception):
    """Exception สำหรับกรณียอดเงินในบัญชีไม่พอ"""
    pass

balance = 100
withdraw = 500

if withdraw > balance:
    raise InsufficientBalanceError("ยอดเงินถอนมากกว่าคงเหลือ")
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (232, 18, 9, 'ลำดับชั้นของ Built-in Exceptions (Exception Hierarchy)', 'Exception ทั้งหมดใน Python สืบทอดมาจาก `BaseException` โดยมีโครงสร้างหลักดังนี้:

- **BaseException**
  - **Exception** (คลาสหลักสำหรับดักจับข้อผิดพลาดทั่วไป)
    - **ArithmeticError**: ZeroDivisionError, OverflowError
    - **LookupError**: IndexError, KeyError
    - **ValueError**: แปลงประเภทข้อมูลผิด
    - **TypeError**: ใช้ชนิดข้อมูลผิดประเภท', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (233, 18, 10, 'สรุปบทเรียน: การจัดการข้อผิดพลาด (Exception Handling)', '1. โครงสร้างหลัก: **`try`** (ลองรัน) -> **`except`** (จับ Error) -> **`else`** (รันเมื่อไม่เกิด Error) -> **`finally`** (รันเสมอ)
2. ควรระบุชื่อ **Specific Exception** เสมอ เช่น `ValueError`, `ZeroDivisionError` แทนการใช้ `except:` เปล่าๆ
3. สร้าง Exception ด้วยตัวเองใช้คำสั่ง **`raise ExceptionClass("message")`**
4. คำสั่งในบล็อก **`finally`** จะถูกเรียกทำงานเสมอ เหมาะสำหรับใช้ Cleanup ทรัพยากรระบบ', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (234, 19, 1, 'ทำความรู้จักกับ Object-Oriented Programming (OOP)', 'การเขียนโปรแกรมเชิงวัตถุ (OOP) คือแนวคิดการออกแบบโปรแกรมโดยมองทุกอย่างเป็น **วัตถุ (Object)** ที่มีข้อมูล (Attributes) และการทำงาน (Methods) อยู่ร่วมกัน

**เปรียบเทียบง่ายๆ:**
- **Class (พิมพ์เขียว)**: แบบแปลนสร้างรถยนต์
- **Object (วัตถุจริง)**: รถยนต์จริงที่สร้างออกมาจากแบบแปลน', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (235, 19, 2, 'การสร้าง Class และ Object เบื้องต้น', 'เราใช้คีย์เวิร์ด `class` ในการกำหนดคลาส และสร้าง Object โดยการเรียกชื่อคลาสนั้นๆ

```python
class Dog:
    pass  # คลาสว่างๆ ยังไม่มีการกำหนด Attribute หรือ Method

# การสร้าง Object (Instantiation)
dog1 = Dog()
dog2 = Dog()
print(type(dog1))  # Output: <class ''__main__.Dog''>
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (236, 19, 3, 'Constructor และพารามิเตอร์ self (__init__)', 'เมธอด `__init__()` คือ **Constructor** จะทำงานอัตโนมัติทันทีที่มีการสร้าง Object ส่วนพารามิเตอร์ `self` ใช้แทนตัว Object นั้นๆ เอง

```python
class Dog:
    def __init__(self, name, age):
        self.name = name  # Instance Attribute
        self.age = age

dog1 = Dog("Bung-gu", 3)
print(dog1.name)  # Output: Bung-gu
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (237, 19, 4, 'Instance Attributes vs Class Attributes', 'ข้อมูลในคลาสแบ่งออกเป็น 2 ระดับ:

1. **Instance Attribute**: ข้อมูลเฉพาะของแต่ละ Object (ประกาศใน `__init__` ด้วย `self.`)
2. **Class Attribute**: ข้อมูลกลางที่ทุก Object ใช้ร่วมกัน (ประกาศนอกเมธอดในคลาส)

```python
class Student:
    school_name = "Tech Academy"  # Class Attribute

    def __init__(self, name):
        self.name = name          # Instance Attribute
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (238, 19, 5, 'การสร้างและเรียกใช้งาน Instance Methods', 'Instance Method คือฟังก์ชันที่อยู่ภายในคลาส ซึ่งสามารถเข้าถึงและจัดการข้อมูลของ Object ได้โดยผ่าน `self`

```python
class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def get_area(self):
        return self.width * self.height

rect = Rectangle(5, 10)
print(f"พื้นที่: {rect.get_area()}")  # Output: พื้นที่: 50
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (239, 19, 6, 'การซ่อนข้อมูล (Encapsulation) และ Private Attributes', 'Python ใช้เครื่องหมาย Underscore นำหน้าชื่อตัวแปรเพื่อจำกัดการเข้าถึงข้อมูลจากภายนอก:

- **`_name` (Protected)**: แจ้งเตือนว่าควรใช้เฉพาะภายในคลาสหรือคลาสลูก
- **`__name` (Private)**: ซ่อนข้อมูลไม่ให้เข้าถึงจากภายนอกตรงๆ

```python
class BankAccount:
    def __init__(self, balance):
        self.__balance = balance  # Private Attribute
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (240, 19, 7, 'การใช้งาน Getter และ Setter Methods', 'การควบคุมอ่านและแก้ไขข้อมูล Private สามารถทำได้ผ่านเมธอด **Getter** และ **Setter** เพื่อความปลอดภัยของข้อมูล

```python
class BankAccount:
    def __init__(self, balance):
        self.__balance = balance

    def get_balance(self):  # Getter
        return self.__balance

    def deposit(self, amount):  # Setter / Method เพิ่มเติม
        if amount > 0:
            self.__balance += amount
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (241, 19, 8, 'การกำหนดตัวแสดงผล Object ด้วย __str__', 'เมธอด `__str__()` ช่วยให้เรากำหนดข้อความที่จะแสดงผลออกมาเมื่อนำ Object ไปผ่านฟังก์ชัน `print()` หรือ `str()`

```python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def __str__(self):
        return f"Person(Name: {self.name}, Age: {self.age})"

p = Person("Alice", 25)
print(p)  # Output: Person(Name: Alice, Age: 25)
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (242, 19, 9, 'ประโยชน์และหัวใจสำคัญของ OOP', 'ทำไมเราจึงควรใช้การเขียนโปรแกรมเชิงวัตถุ (OOP)?

1. **Modularity**: จัดหมวดหมู่โค้ดเป็นสัดส่วน ดูแลรักษาง่าย
2. **Reusability**: นำคลาสกลับมาใช้ใหม่ได้สะดวก
3. **Maintainability**: ปรับปรุงแก้ไขโค้ดเฉพาะจุดได้โดยไม่กระทบส่วนอื่น
4. **Data Security**: ปกป้องข้อมูลสำคัญไม่ให้โดนแก้ไขโดยตรงด้วย Encapsulation', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (243, 19, 10, 'สรุปบทเรียน: การเขียนโปรแกรมเชิงวัตถุเบื้องต้น (OOP)', '1. **Class** คือพิมพ์เขียว **Object** คือวัตถุจริงที่ถูกสร้างขึ้น (Instantiation)
2. **`__init__`** คือ Constructor ทำงานอัตโนมัติเมื่อสร้าง Object
3. **`self`** ใช้เป็นตัวแทนอ้างอิงถึงตัว Object นั้นๆ เอง
4. **Encapsulation**: ซ่อนข้อมูลด้วย **`__` (Private)** และเข้าถึงผ่าน Getter/Setter
5. **`__str__`**: เมธอดพิเศษสำหรับส่งคืนข้อความอธิบาย Object', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (254, 20, 1, 'ทำความรู้จักกับ Inheritance (การสืบทอดคุณสมบัติ)', 'การสืบทอด (Inheritance) ช่วยให้คลาสใหม่ (Child Class / Subclass) สามารถ **รับคุณสมบัติและเมธอด** จากคลาสเดิม (Parent Class / Superclass) มาใช้งานได้โดยไม่ต้องเขียนโค้ดซ้ำซ้อน

**ประโยชน์สำคัญ:**
- ลดการเขียนโค้ดซ้ำซ้อน (Reusability)
- สร้างโครงสร้างคลาสที่เป็นหมวดหมู่และต่อยอดง่าย', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (255, 20, 2, 'โครงสร้างการสร้าง Child Class', 'การสร้าง Child Class ทำได้โดยระบุชื่อ Parent Class ไว้ในวงเล็บหลังชื่อคลาสใหม่

```python
class Animal:  # Parent Class
    def eat(self):
        print("สัตว์กำลังกินอาหาร...")

class Dog(Animal):  # Child Class สืบทอดจาก Animal
    def bark(self):
        print("โฮ่งๆ!")

d = Dog()
d.eat()   # เรียกใช้เมธอดจากคลาสแม่
d.bark()  # เรียกใช้เมธอดของตัวเอง
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (256, 20, 3, 'การใช้งานฟังก์ชัน super() และ Constructor', 'เมื่อ Child Class มีการสร้าง `__init__()` ของตนเอง เราใช้ **`super()`** เพื่อเรียกใช้ Constructor ของ Parent Class ให้ช่วยจัดเตรียม Attribute จากคลาสแม่

```python
class Person:
    def __init__(self, name):
        self.name = name

class Employee(Person):
    def __init__(self, name, salary):
        super().__init__(name)  # ดึง name จากคลาสแม่ Person
        self.salary = salary    # เพิ่ม Attribute ของตัวเอง
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (257, 20, 4, 'การเขียนทับเมธอด (Method Overriding)', 'Child Class สามารถ **เขียนทับ (Override)** เมธอดของ Parent Class เพื่อเปลี่ยนพฤติกรรมหรือการทำงานให้เหมาะสมกับคลาสลูกได้

```python
class Animal:
    def make_sound(self):
        print("สัตว์ส่งเสียง...")

class Cat(Animal):
    def make_sound(self):  # เขียนทับเมธอดของคลาสแม่
        print("เหมียวๆ!")

c = Cat()
c.make_sound()  # Output: เหมียวๆ!
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (261, 20, 8, 'การตรวจสอบความสัมพันธ์ด้วย isinstance() และ issubclass()', 'Python มี Built-in functions สำหรับเช็กประเภทและความสัมพันธ์ของคลาส:

- **`isinstance(obj, Class)`**: ตรวจสอบว่า Object นั้นถูกสร้างมาจากคลาสนั้น (หรือคลาสแม่) หรือไม่
- **`issubclass(Child, Parent)`**: ตรวจสอบว่าคลาสลูกสืบทอดมาจากคลาสแม่หรือไม่

```python
print(isinstance(donald, Duck))    # Output: True
print(issubclass(Duck, Flyer))    # Output: True
```', NULL, 'code');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (262, 20, 9, 'สรุป 4 เสาหลักของ Object-Oriented Programming (OOP)', '1. **Encapsulation**: การห่อหุ้มซ่อนข้อมูล (`__private`)
2. **Abstraction**: การซ่อนความซับซ้อนและแสดงเฉพาะส่วนที่จำเป็น
3. **Inheritance**: การสืบทอดคุณสมบัติจากคลาสแม่ (`super()`)
4. **Polymorphism**: การมีพฤติกรรมได้หลายรูปแบบผ่านเมธอดชื่อเดียวกัน', NULL, 'text');
INSERT INTO public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (263, 20, 10, 'สรุปบทเรียน: การสืบทอดและการพหุสัณฐาน (Inheritance & Polymorphism)', '1. **Inheritance** ช่วยให้ Child Class ดึง Attributes และ Methods จาก Parent Class มาใช้งานได้
2. ใช้ **`super().__init__()`** เพื่อเรียก Constructor ของคลาสแม่
3. **Method Overriding**: การนิยามเมธอดในคลาสลูกซ้ำกับคลาสแม่เพื่อเปลี่ยนการทำงาน
4. **Polymorphism**: เมธอดชื่อเดียวกันทำงานตามบริบทของ Object แต่ละประเภท
5. ใช้ **`isinstance()`** และ **`issubclass()`** ตรวจสอบโครงสร้างคลาส', NULL, 'text');


--
-- Data for Name: level_config; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.level_config (id, q_id, title, level_value, "order") VALUES (1001, 1003, 'Beginner', 1, 1);
INSERT INTO public.level_config (id, q_id, title, level_value, "order") VALUES (1002, 1003, 'Advanced', 10, 2);


--
-- Data for Name: mini_game_locations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.mini_game_locations (location_id, location_key, name, description, bg_image_url, created_at, updated_at) VALUES (1, 'python_lab', 'ห้องเรียน', 'ห้องเรียนปกติธรรมดาไม่มีอะไรเป็นพิเศษ', '/data_MiNiGame/locations/classroom.jpg', '2026-06-20 22:00:56+00', '2026-06-24 16:28:24+00');
INSERT INTO public.mini_game_locations (location_id, location_key, name, description, bg_image_url, created_at, updated_at) VALUES (2, 'classroom', 'Python Classroom', 'Warm classroom for story mini games', '/data_MiNiGame/locations/classroom.jpg', '2026-07-03 23:43:38+00', '2026-07-03 23:43:38+00');


--
-- Data for Name: mini_game_npcs; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.mini_game_npcs (npc_id, npc_key, name, avatar_asset_url, description, created_at, updated_at) VALUES (1, 'lumi', 'Lumi', '/data_MiNiGame/NPC_lumi', 'AI tutor for story mini games', '2026-06-20 22:00:56+00', '2026-07-03 23:43:38+00');
INSERT INTO public.mini_game_npcs (npc_id, npc_key, name, avatar_asset_url, description, created_at, updated_at) VALUES (2, 'system', 'System', NULL, 'ระบบจัดการสถานการณ์ของเกม', '2026-06-20 22:00:56+00', '2026-06-20 22:00:56+00');


--
-- Data for Name: mini_game_dialogues; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (1, 1, 1, 0, 'START', 'สวัสดีค่ะ ยินดีต้อนรับสู่ห้องเรียนเขียนโปรแกรม Python ลำดับแรกมาเรียนรู้ระบบกันก่อนนะคะ', 1, 'smile', 1, 'pre_submit', 'default', '2026-06-23 19:19:03+00', '2026-06-23 19:19:03+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (2, 1, 1, 1, 'START', 'ในด่านนี้เราจะมาฝึกคำนวณภาษีมูลค่าเพิ่ม (VAT 7%) กันค่ะ ลองเขียนโค้ดตามโจทย์ดูนะคะ', 1, 'neutral', 1, 'pre_submit', 'default', '2026-06-23 19:19:03+00', '2026-06-23 19:19:03+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (3, 1, 2, 0, '1A', 'ยินดีต้อนรับเข้าสู่ด่านเส้นทางวิทยาศาสตร์ 1A ค่ะ!', 1, 'smile', 1, 'pre_submit', 'default', '2026-06-23 19:19:03+00', '2026-06-25 01:00:00+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (4, 1, 2, 1, '1A', 'ภารกิจของด่านนี้คือฝึกฝนการใช้คำสั่งพิมพ์คำว่า 1A_2A หรือ 1A_2B เพื่อไปต่อค่ะ', 1, 'happy', 1, 'pre_submit', 'default', '2026-06-23 19:19:03+00', '2026-06-25 10:57:41+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (5, 1, 3, 0, '1B', 'ยินดีต้อนรับสู่ห้องแล็บฝั่งเวทมนตร์ 1B ครับผม', 2, 'neutral', 1, 'pre_submit', 'default', '2026-06-23 19:19:03+00', '2026-06-25 01:00:00+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (6, 1, 3, 1, '1B', 'ภารกิจของด่านนี้คือฝึกฝนการใช้คำสั่งพิมพ์คำว่า 1B_2A หรือ 1B_2B เพื่อไปต่อครับ', 2, 'smile', 1, 'pre_submit', 'default', '2026-06-23 19:19:03+00', '2026-06-25 01:00:00+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (7, 1, 4, 0, '1A_2A', 'ยินดีต้อนรับเข้าสู่ด่านสรุป 1A_2A ค่ะ คุณทำคะแนนได้ดีมาก!', 1, 'smile', 1, 'pre_submit', 'default', '2026-06-23 19:19:03+00', '2026-06-23 19:19:03+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (8, 1, 4, 1, '1A_2A', 'พิมพ์คำสั่ง print("success") เพื่อส่งงานและสรุปผลรับรางวัลชิ้นแรกกันเลย', 1, 'smile', 1, 'pre_submit', 'default', '2026-06-23 19:19:03+00', '2026-06-23 19:19:03+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (9, 1, 5, 0, '1A_2B', 'เดินทางมาถึงด่านสรุป 1A_2B แล้วครับ เก่งมากเลย', 2, 'neutral', 1, 'pre_submit', 'default', '2026-06-23 19:19:03+00', '2026-06-23 19:19:03+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (10, 1, 5, 1, '1A_2B', 'พิมพ์ส่งคำตอบ print("success") เพื่อตรวจสอบความถูกต้องขั้นสุดท้ายกันนะครับ', 2, 'smile', 1, 'pre_submit', 'default', '2026-06-23 19:19:03+00', '2026-06-23 19:19:03+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (11, 1, 6, 0, '1B_2A', 'ในที่สุดคุณก็ฝ่าฟันมาถึงหอคอยเวทมนตร์สาย 1B_2A ได้สำเร็จแล้วค่ะ!', 1, 'smile', 1, 'pre_submit', 'default', '2026-06-23 19:19:03+00', '2026-06-23 19:19:03+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (12, 1, 6, 1, '1B_2A', 'รวบรวมมานาแล้วพิมพ์ print("success") เพื่อปลดล็อครางวัลของด่านนี้กันเลย', 1, 'curious', 1, 'pre_submit', 'default', '2026-06-23 19:19:03+00', '2026-06-23 19:19:03+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (13, 1, 7, 0, '1B_2B', 'ยินดีต้อนรับสู่โรงงานผลิตอาวุธเวทมนตร์ 1B_2B ครับ อุปกรณ์ทุกอย่างพร้อมแล้ว', 2, 'neutral', 1, 'pre_submit', 'default', '2026-06-23 19:19:03+00', '2026-06-23 19:19:03+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (14, 1, 7, 1, '1B_2B', 'มาเปิดสวิตช์เดินเครื่องจักรด้วยคำสั่ง print("success") เพื่อจบการทำงานกันเถอะครับ', 1, 'smile', 1, 'pre_submit', 'default', '2026-06-23 19:19:03+00', '2026-06-23 19:19:03+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (15, 1, NULL, 0, 'end', 'ยินดีด้วยค่ะ! แบบทดสอบทั้งหมดได้จบลงเป็นที่เรียบร้อยแล้ว', 1, 'smile', 1, 'pre_submit', 'default', '2026-06-23 19:19:03+00', '2026-06-23 19:19:03+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (16, 1, NULL, 1, 'end', 'คุณได้ผ่านการเรียนรู้และทำภารกิจครบถ้วนแล้ว เก่งมากๆ เลยไว้เจอกันใหม่นะคะ!', 1, 'smile', 1, 'pre_submit', 'default', '2026-06-23 19:19:03+00', '2026-06-23 19:19:03+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (96, 2, NULL, 0, '1', 'Lumi เปิดภารกิจของบท ไวยากรณ์พื้นฐาน และคำสั่งแสดงผล print() แล้วค่ะ', 1, 'smile', 2, 'pre_submit', 'default', '2026-08-19 19:03:31+00', '2026-08-19 19:03:31+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (97, 2, NULL, 1, '1', 'แสดงข้อความ "เริ่มภารกิจ"', 1, 'neutral', 2, 'pre_submit', 'default', '2026-08-19 19:03:31+00', '2026-08-19 19:03:31+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (98, 2, NULL, 2, '1', 'โจทย์แรกผ่านแล้วค่ะ', 1, 'happy', 2, 'post_submit', 'default', '2026-08-19 19:03:31+00', '2026-08-19 19:03:31+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (99, 2, NULL, 0, '2', 'ต่อไปฝึกรับข้อมูลจากผู้ใช้ค่ะ', 1, 'smile', 2, 'pre_submit', 'default', '2026-08-19 19:03:31+00', '2026-08-19 19:03:31+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (100, 2, NULL, 1, '2', 'รับข้อความจากผู้ใช้แล้ว print ข้อความนั้นออกมา', 1, 'neutral', 2, 'pre_submit', 'default', '2026-08-19 19:03:31+00', '2026-08-19 19:03:31+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (101, 2, NULL, 2, '2', 'โจทย์ที่สองผ่านแล้วค่ะ', 1, 'happy', 2, 'post_submit', 'default', '2026-08-19 19:03:31+00', '2026-08-19 19:03:31+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (102, 2, NULL, 0, '3', 'ด่านสุดท้ายของบทนี้แล้วค่ะ', 1, 'smile', 2, 'pre_submit', 'default', '2026-08-19 19:03:31+00', '2026-08-19 19:03:31+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (103, 2, NULL, 1, '3', 'แสดงข้อความ "ผ่านมินิเกมแล้ว"', 1, 'neutral', 2, 'pre_submit', 'default', '2026-08-19 19:03:31+00', '2026-08-19 19:03:31+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (104, 2, NULL, 2, '3', 'ผ่านมินิเกมของบทนี้แล้วค่ะ', 1, 'happy', 2, 'post_submit', 'default', '2026-08-19 19:03:31+00', '2026-08-19 19:03:31+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (105, 2, NULL, 0, 'end', 'ยอดเยี่ยมค่ะ คุณผ่านมินิเกมของบท "ไวยากรณ์พื้นฐาน และคำสั่งแสดงผล print()" แล้ว', 1, 'happy', 2, 'pre_submit', 'end', '2026-08-19 19:03:31+00', '2026-08-19 19:03:31+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (106, 2, NULL, 1, 'end', 'Lumi จะบันทึกความคืบหน้าไว้ แล้วเราไปเรียนบทต่อไปกันนะคะ', 1, 'smile', 2, 'pre_submit', 'end', '2026-08-19 19:03:31+00', '2026-08-19 19:03:31+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (131, 2, 8, 0, '1', 'โจทย์ที่ 1: Mini 1: อธิบายโค้ดด้วยคอมเมนต์ ลองอ่าน Hint แล้วเติมโค้ดให้ผ่านนะคะ', NULL, 'smile', NULL, 'pre_submit', 'default', '2026-07-03 09:45:11+00', '2026-07-03 09:45:11+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (132, 2, 8, 1, '1', 'เพิ่ม comment 1 บรรทัด แล้วแสดงข้อความ \"อ่านโค้ดง่ายขึ้น\"', NULL, 'neutral', NULL, 'pre_submit', 'default', '2026-07-03 09:45:11+00', '2026-07-03 09:45:11+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (133, 2, 9, 0, '2', 'โจทย์ที่ 2: Mini 2: ปิดโค้ดทดลองด้วยคอมเมนต์ ลองอ่าน Hint แล้วเติมโค้ดให้ผ่านนะคะ', NULL, 'smile', NULL, 'pre_submit', 'default', '2026-07-03 09:45:11+00', '2026-07-03 09:45:11+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (134, 2, 9, 1, '2', 'ใช้ # ปิดบรรทัด print(\"debug\") แล้วให้โปรแกรมแสดงเฉพาะ \"พร้อมส่งงาน\"', NULL, 'neutral', NULL, 'pre_submit', 'default', '2026-07-03 09:45:11+00', '2026-07-03 09:45:11+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (135, 2, 10, 0, '3', 'โจทย์ที่ 3: Mini 3: โน้ตขั้นตอนก่อนรัน ลองอ่าน Hint แล้วเติมโค้ดให้ผ่านนะคะ', NULL, 'smile', NULL, 'pre_submit', 'default', '2026-07-03 09:45:11+00', '2026-07-03 09:45:11+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (136, 2, 10, 1, '3', 'เขียน comment บอกขั้นตอนสั้น ๆ แล้วแสดงข้อความ \"โค้ดนี้มีคำอธิบาย\"', NULL, 'neutral', NULL, 'pre_submit', 'default', '2026-07-03 09:45:11+00', '2026-07-03 09:45:11+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (137, 4, 11, 0, '1', 'โจทย์ที่ 1: Mini 1: เก็บชื่อคอร์ส ลองอ่าน Hint แล้วเติมโค้ดให้ผ่านนะคะ', NULL, 'smile', NULL, 'pre_submit', 'default', '2026-07-03 16:09:30+00', '2026-07-03 16:09:30+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (138, 4, 11, 1, '1', 'สร้างตัวแปร course เก็บคำว่า \"Python\" แล้วแสดงค่าตัวแปร', NULL, 'neutral', NULL, 'pre_submit', 'default', '2026-07-03 16:09:30+00', '2026-07-03 16:09:30+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (139, 4, 12, 0, '2', 'โจทย์ที่ 2: Mini 2: คำนวณคะแนนรวม ลองอ่าน Hint แล้วเติมโค้ดให้ผ่านนะคะ', NULL, 'smile', NULL, 'pre_submit', 'default', '2026-07-03 16:09:30+00', '2026-07-03 16:09:30+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (140, 4, 12, 1, '2', 'สร้างตัวแปร score มีค่า 40 แล้วเพิ่มอีก 10 จากนั้นแสดงผลรวม', NULL, 'neutral', NULL, 'pre_submit', 'default', '2026-07-03 16:09:30+00', '2026-07-03 16:09:30+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (141, 4, 13, 0, '3', 'โจทย์ที่ 3: Mini 3: รวมข้อความจากตัวแปร ลองอ่าน Hint แล้วเติมโค้ดให้ผ่านนะคะ', NULL, 'smile', NULL, 'pre_submit', 'default', '2026-07-03 16:09:30+00', '2026-07-03 16:09:30+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (142, 4, 13, 1, '3', 'สร้างตัวแปร first และ last แล้วแสดง \"Lumi Python\"', NULL, 'neutral', NULL, 'pre_submit', 'default', '2026-07-03 16:09:30+00', '2026-07-03 16:09:30+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (143, 15, 14, 0, '1', 'โจทย์ที่ 1: Mini 1: เริ่มโจทย์ Try-Except ลองอ่าน Hint แล้วเติมโค้ดให้ผ่านนะคะ', NULL, 'smile', NULL, 'pre_submit', 'default', '2026-07-03 19:56:55+00', '2026-07-03 19:56:55+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (144, 15, 14, 1, '1', 'เขียนโปรแกรม Python แสดงข้อความ \"พร้อมเรียน Try-Except\"', NULL, 'neutral', NULL, 'pre_submit', 'default', '2026-07-03 19:56:55+00', '2026-07-03 19:56:55+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (145, 15, 15, 0, '2', 'โจทย์ที่ 2: Mini 2: ทบทวน Try-Except ลองอ่าน Hint แล้วเติมโค้ดให้ผ่านนะคะ', NULL, 'smile', NULL, 'pre_submit', 'default', '2026-07-03 19:56:55+00', '2026-07-03 19:56:55+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (146, 15, 15, 1, '2', 'สร้างตัวแปร status เก็บคำว่า \"เข้าใจแล้ว\" แล้วแสดงผล', NULL, 'neutral', NULL, 'pre_submit', 'default', '2026-07-03 19:56:55+00', '2026-07-03 19:56:55+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (147, 15, 16, 0, '3', 'โจทย์ที่ 3: Mini 3: ปิดท้าย Try-Except ลองอ่าน Hint แล้วเติมโค้ดให้ผ่านนะคะ', NULL, 'smile', NULL, 'pre_submit', 'default', '2026-07-03 19:56:55+00', '2026-07-03 19:56:55+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (148, 15, 16, 1, '3', 'แสดงข้อความ \"ผ่านมินิเกมแล้ว\" เพื่อจบบทนี้', NULL, 'neutral', NULL, 'pre_submit', 'default', '2026-07-03 19:56:55+00', '2026-07-03 19:56:55+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (149, 3, 17, 0, '1', 'โจทย์ที่ 1: Mini 1: รับชื่อผู้เล่น ลองอ่าน Hint แล้วเติมโค้ดให้ผ่านนะคะ', NULL, 'smile', NULL, 'pre_submit', 'default', '2026-07-03 19:57:43+00', '2026-07-03 19:57:43+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (150, 3, 17, 1, '1', 'รับชื่อ 1 ค่า แล้วแสดงคำทักทายในรูปแบบ \"สวัสดี <ชื่อ>\"', NULL, 'neutral', NULL, 'pre_submit', 'default', '2026-07-03 19:57:43+00', '2026-07-03 19:57:43+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (151, 3, 18, 0, '2', 'โจทย์ที่ 2: Mini 2: รับของโปรด ลองอ่าน Hint แล้วเติมโค้ดให้ผ่านนะคะ', NULL, 'smile', NULL, 'pre_submit', 'default', '2026-07-03 19:57:43+00', '2026-07-03 19:57:43+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (152, 3, 18, 1, '2', 'รับชื่ออาหาร 1 ค่า แล้วแสดง \"ฉันชอบ <อาหาร>\"', NULL, 'neutral', NULL, 'pre_submit', 'default', '2026-07-03 19:57:43+00', '2026-07-03 19:57:43+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (153, 3, 19, 0, '3', 'โจทย์ที่ 3: Mini 3: รับตัวเลขแล้วสะท้อนผล ลองอ่าน Hint แล้วเติมโค้ดให้ผ่านนะคะ', NULL, 'smile', NULL, 'pre_submit', 'default', '2026-07-03 19:57:43+00', '2026-07-03 19:57:43+00');
INSERT INTO public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key, created_at, updated_at) VALUES (154, 3, 19, 1, '3', 'รับตัวเลข 1 ค่า แล้วแสดง \"เลขที่เลือกคือ <ตัวเลข>\"', NULL, 'neutral', NULL, 'pre_submit', 'default', '2026-07-03 19:57:43+00', '2026-07-03 19:57:43+00');


--
-- Data for Name: mini_game_exercises_files; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: music_tracks; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: quiz_questions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (1, 1, 1, 'คำสั่งใดในภาษา Python ที่ใช้สำหรับแสดงผลข้อความออกทางหน้าจอ?', 'choice', 'print()');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (2, 1, 2, 'หากรันโค้ด print("Hello World") ผลลัพธ์ที่ได้คือข้อความอะไร?', 'fill', 'Hello World');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (3, 1, 3, 'ข้อใดกล่าวถึงคุณสมบัติของภาษา Python ได้ถูกต้อง?', 'choice', 'อ่านและเข้าใจง่าย มีไวยากรณ์ใกล้เคียงภาษาอังกฤษ');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (4, 1, 4, 'นามสกุลไฟล์ของโปรแกรมภาษา Python คืออะไร?', 'choice', '.py');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (5, 1, 5, 'สัญลักษณ์ใดที่ใช้สำหรับการเขียนคำอธิบายโค้ด (Comment) แบบบรรทัดเดียว?', 'fill', '#');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (6, 2, 1, 'ใครคือผู้พัฒนาและให้กำเนิดภาษา Python ในปี 1991?', 'choice', 'Guido van Rossum');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (7, 2, 2, 'Python ใช้สิ่งใดในการแบ่งขอบเขตบล็อกการทำงาน (Code Block) แทนการใช้ปีกกา {}?', 'choice', 'การย่อหน้า (Indentation)');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (8, 2, 3, 'ข้อใด **ไม่ใช่** โครงสร้างพื้นฐานในการเขียนโปรแกรมภาษา Python?', 'choice', 'การใส่ Semicolon (;) ปิดท้ายทุกบรรทัด');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (9, 2, 4, 'หากต้องการเขียน Comment แบบหลายบรรทัด (Docstring) ต้องใช้สัญลักษณ์ใดครอบข้อความ?', 'choice', '"""..."""');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (10, 2, 5, 'ลักษณะการประมวลผลคำสั่งของโปรแกรม Python มีทิศทางอย่างไร?', 'choice', 'จากบนลงล่าง และจากซ้ายไปขวา');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (11, 3, 1, 'ฟังก์ชันใดในภาษา Python ที่ใช้สำหรับแสดงผลข้อมูลออกทางหน้าจอ?', 'choice', 'print()');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (12, 3, 2, 'หากต้องการพิมพ์ข้อความ Hello ออกทางหน้าจอ ต้องเขียนคำสั่งอย่างไร?', 'choice', 'print("Hello")');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (13, 3, 3, 'คำสั่ง print(10 + 20) จะแสดงผลลัพธ์เป็นอะไร?', 'fill', '30');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (14, 3, 4, 'สัญลักษณ์ใดที่ใช้คั่นระหว่างข้อมูลหลายตัวในคำสั่ง print() เพื่อให้แสดงผลในบรรทัดเดียวกัน?', 'choice', 'เครื่องหมายจุลภาค ( , )');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (15, 3, 5, 'ข้อใดคือผลลัพธ์ของคำสั่ง print("Python", "3")', 'fill', 'Python 3');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (16, 4, 1, 'ข้อความพิเศษ \n ในคำสั่ง print() มีหน้าที่ทำอะไร?', 'choice', 'ขึ้นบรรทัดใหม่ (New Line)');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (17, 4, 2, 'หากต้องการเปลี่ยนตัวคั่นระหว่างข้อมูลใน print() จากเว้นวรรคเป็นเครื่องหมาย / ต้องใช้พารามิเตอร์ใด?', 'choice', 'sep="/"');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (18, 4, 3, 'หากต้องการไม่ให้คำสั่ง print() ขึ้นบรรทัดใหม่เมื่อทำงานเสร็จ ต้องใช้พารามิเตอร์ใด?', 'choice', 'end=""');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (19, 4, 4, 'คำสั่ง print("A", "B", sep="-") จะแสดงผลลัพธ์อย่างไร?', 'fill', 'A-B');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (20, 4, 5, 'ข้อใดคือสาเหตุหลักที่ทำให้เกิด SyntaxError ในการใช้คำสั่ง print()?', 'choice', 'ลืมใส่เครื่องหมายอัญประกาศครอบข้อความ เช่น print(Hello)');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (21, 5, 1, 'ฟังก์ชันใดในภาษา Python ที่ใช้สำหรับรับข้อมูลจากผู้ใช้งานผ่านคีย์บอร์ด?', 'choice', 'input()');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (22, 5, 2, 'ข้อมูลที่ได้จากฟังก์ชัน input() จะมีชนิดข้อมูล (Data Type) เป็นอะไรเสมอ?', 'choice', 'str (ข้อความ)');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (23, 5, 3, 'หากต้องการแปลงข้อมูลข้อความตัวเลขเป็นจำนวนเต็ม ต้องใช้ฟังก์ชันใด?', 'choice', 'int()');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (24, 5, 4, 'หากต้องการแปลงข้อมูลเป็นทศนิยม ต้องใช้ฟังก์ชันใด?', 'choice', 'float()');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (25, 5, 5, 'หากรับค่า x = input() (ผู้ใช้พิมพ์ 5) แล้วสั่ง print(x + x) ผลลัพธ์จะเป็นอะไร?', 'fill', '55');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (58, 14, 3, 'หากกำหนด s = {1, 2, 2, 3, 3, 3} ความยาวของ s (len(s)) จะมีค่าเท่าใด?', 'fill', '3');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (26, 6, 1, 'หากต้องการรับค่าอายุจากผู้ใช้เพื่อนำไปคำนวณ ควรใช้คำสั่งใดถูกต้องที่สุด?', 'choice', 'age = int(input("กรอกอายุ: "))');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (27, 6, 2, 'หากผู้ใช้กรอกข้อความ "abc" เข้ามาในคำสั่ง int(input()) จะเกิดข้อผิดพลาดใด?', 'choice', 'ValueError');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (28, 6, 3, 'ฟังก์ชัน str() มีไว้สำหรับทำหน้าที่อะไร?', 'choice', 'แปลงข้อมูลชนิดอื่นให้กลายเป็นข้อความ (String)');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (29, 6, 4, 'หากกำหนด price = float(input()) แล้วผู้ใช้พิมพ์ 10 ผลลัพธ์ในตัวแปร price จะมีค่าเท่าใด?', 'fill', '10.0');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (30, 6, 5, 'การกระทำใดเรียกว่า Type Casting ใน Python?', 'choice', 'การแปลงชนิดข้อมูลจากรูปแบบหนึ่งไปเป็นอีกรูปแบบหนึ่ง');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (31, 7, 1, 'สัญลักษณ์ใดที่ใช้ระบุหน้าเครื่องหมายอัญประกาศในการสร้าง f-string?', 'fill', 'f');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (32, 7, 2, 'ในการจัดรูปแบบด้วย f-string เราจะแทรกตัวแปรไว้ภายในเครื่องหมายใด?', 'choice', 'เครื่องหมายปีกกา { }');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (33, 7, 3, 'ฟังก์ชันใดใน Python ที่ใช้สำหรับเปิดดูคู่มือและวิธีการใช้งานคำสั่งต่างๆ?', 'choice', 'help()');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (34, 7, 4, 'หากกำหนด name = "Alice" คำสั่ง print(f"Hello {name}") จะแสดงผลลัพธ์ว่าอะไร?', 'fill', 'Hello Alice');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (35, 7, 5, 'การจัดรูปแบบตัวเลขทศนิยม 2 ตำแหน่งใน f-string ต้องใช้รหัสรูปแบบใด?', 'choice', ':.2f');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (36, 8, 1, 'หากต้องการให้ตัวเลข 1,500,000 แสดงผลแบบมีเครื่องหมาย comma คั่นหลักพันใน f-string ต้องเขียนอย่างไร?', 'choice', 'f"{salary:,}"');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (37, 8, 2, 'หากต้องการแสดงผลตัวเลข 7 ให้กลายเป็น "0007" (เติมศูนย์ด้านหน้าให้ครบ 4 หลัก) ต้องใช้รหัสใด?', 'choice', ':04d');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (38, 8, 3, 'ใน f-string รหัสรูปแบบ :^10 มีความหมายว่าอย่างไร?', 'choice', 'จัดข้อความให้อยู่ตรงกลาง ในความกว้าง 10 ตัวอักษร');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (39, 8, 4, 'หากต้องการอ่านคู่มือการใช้งานฟังก์ชัน print() ผ่าน Python Shell ต้องใช้คำสั่งใด?', 'fill', 'help(print)');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (40, 8, 5, 'คำสั่ง f"ราคารวม: {100 * 2} บาท" จะแสดงผลลัพธ์อย่างไรออกทางหน้าจอ?', 'fill', 'ราคารวม: 200 บาท');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (41, 9, 1, 'ข้อใดคือหน้าที่หลักของตัวแปร (Variable) ในภาษา Python?', 'choice', 'เป็นป้ายชื่อสำหรับอ้างอิงตำแหน่งจัดเก็บข้อมูลในหน่วยความจำ');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (42, 9, 2, 'เครื่องหมายใดที่ใช้สำหรับการกำหนดค่า (Assignment) ให้กับตัวแปร?', 'fill', '=');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (43, 9, 3, 'ข้อใดเป็นการตั้งชื่อตัวแปรที่ไม่ถูกต้องตามกฎของ Python?', 'choice', '2total');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (44, 9, 4, 'คำสั่งใดที่ใช้สำหรับตรวจสอบชนิดข้อมูล (Data Type) ของตัวแปร?', 'choice', 'type()');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (45, 9, 5, 'คำว่า Case-sensitive ในการตั้งชื่อตัวแปรหมายความว่าอย่างไร?', 'choice', 'ตัวอักษรพิมพ์เล็กและพิมพ์ใหญ่ถือเป็นตัวแปรคนละตัวกัน');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (46, 10, 1, 'ข้อใดคือคำสงวน (Reserved Word) ใน Python ที่ห้ามนำมาตั้งเป็นชื่อตัวแปร?', 'choice', 'import');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (47, 10, 2, 'รูปแบบการตั้งชื่อตัวแปรแบบ `user_first_name` เรียกว่าอะไร?', 'choice', 'snake_case');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (48, 10, 3, 'หากต้องการสลับค่าตัวแปร a และ b ใน Python บรรทัดเดียว ต้องเขียนอย่างไร?', 'choice', 'a, b = b, a');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (49, 10, 4, 'ฟังก์ชันใดใน Python ที่ใช้สำหรับดูตำแหน่ง Memory Address ของตัวแปร?', 'fill', 'id()');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (50, 10, 5, 'หากสั่ง x, y = 10, 20 ค่าของตัวแปร y จะมีค่าเท่าใด?', 'fill', '20');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (51, 13, 1, 'โครงสร้างข้อมูลใดใน Python ที่เก็บข้อมูลแบบจับคู่ Key-Value?', 'choice', 'Dictionary');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (52, 13, 2, 'สัญลักษณ์วงเล็บชนิดใดที่ใช้สำหรับการสร้าง List ใน Python?', 'fill', '[ ]');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (53, 13, 3, 'ข้อใดคือคุณสมบัติเด่นของโครงสร้างข้อมูลประเภท Set?', 'choice', 'ไม่เก็บข้อมูลที่ซ้ำกัน และไม่มีลำดับแน่นอน');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (54, 13, 4, 'ข้อใดอธิบายความแตกต่างระหว่าง List และ Tuple ได้ถูกต้อง?', 'choice', 'List สามารถแก้ไขข้อมูลได้ แต่ Tuple แก้ไขข้อมูลไม่ได้');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (55, 13, 5, 'หากกำหนด nums = [10, 20, 30] แล้วสั่ง print(nums[1]) จะได้ผลลัพธ์ใด?', 'fill', '20');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (56, 14, 1, 'เมธอดใดใช้สำหรับเพิ่มข้อมูลต่อท้ายใน List?', 'choice', 'append()');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (57, 14, 2, 'หากต้องการดึงค่าจาก Dictionary โดยระบุ Key "name" ต้องเขียนอย่างไร?', 'choice', 'student["name"]');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (59, 14, 4, 'ตัวดำเนินการใดที่ใช้สำหรับหาค่าซ้ำกัน (Intersection) ของสองเซต?', 'fill', '&');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (60, 14, 5, 'การกระทำใดกับ Tuple ต่อไปนี้จะทำให้เกิด TypeError?', 'choice', 't[0] = 99');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (61, 15, 1, 'ตัวดำเนินการใดที่ใช้สำหรับหารเอาเศษ (Modulus) ในภาษา Python?', 'choice', '%');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (62, 15, 2, 'ตัวดำเนินการเปรียบเทียบความเท่ากันใน Python คือสัญลักษณ์ใด?', 'fill', '==');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (63, 15, 3, 'ผลลัพธ์ของการเปรียบเทียบด้วย Comparison Operators จะได้ข้อมูลชนิดใดเสมอ?', 'choice', 'bool (Boolean)');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (64, 15, 4, 'คำสั่ง x += 5 มีความหมายตรงกับข้อใด?', 'choice', 'x = x + 5');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (65, 15, 5, 'คำสั่ง print(10 // 3) จะให้ผลลัพธ์เป็นเท่าใด?', 'fill', '3');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (66, 16, 1, 'ตัวดำเนินการทางตรรกศาสตร์ (Logical Operator) ใดที่จะคืนค่า True เมื่อมีเงื่อนไขใดเงื่อนไขหนึ่งเป็น True?', 'choice', 'or');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (67, 16, 2, 'ผลลัพธ์ของนิพจน์ (True and False) or not False มีค่าตรงกับข้อใด?', 'choice', 'True');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (68, 16, 3, 'คำสั่ง print(2 ** 3) จะให้ผลลัพธ์เท่ากับเท่าใด?', 'fill', '8');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (69, 16, 4, 'หากกำหนด x = 10 แล้วสั่ง x *= 2 ค่าของ x จะกลายเป็นเท่าใด?', 'fill', '20');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (70, 16, 5, 'ข้อใดคือผลลัพธ์ของนิพจน์ 5 != 5?', 'choice', 'False');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (71, 17, 1, 'ตัวดำเนินการชนิดใดที่ใช้สำหรับตรวจสอบว่ามีข้อมูลที่ต้องการอยู่ใน String หรือ List หรือไม่?', 'choice', 'Membership Operators (in, not in)');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (72, 17, 2, 'ตัวดำเนินการ is ใน Python ใช้สำหรับเปรียบเทียบสิ่งใด?', 'choice', 'ตำแหน่งในหน่วยความจำ (Memory Address)');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (73, 17, 3, 'คำสั่ง print("py" in "python") จะให้ผลลัพธ์เป็นเท่าใด?', 'fill', 'True');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (74, 17, 4, 'ตัวดำเนินการ Bitwise ชนิดใดที่ทำงานโดยการกลับค่าบิตจาก 0 เป็น 1 และ 1 เป็น 0?', 'choice', '~ (Bitwise NOT)');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (75, 17, 5, 'หากต้องการตรวจสอบว่าค่า x ไม่ได้เป็นสมาชิกอยู่ใน List ชื่อ nums ต้องใช้คำสั่งใด?', 'fill', 'x not in nums');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (76, 18, 1, 'หากกำหนด a = [1, 2] และ b = [1, 2] ข้อใดคือผลลัพธ์ของ (a == b) และ (a is b) ตามลำดับ?', 'choice', 'True, False');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (77, 18, 2, 'การเลื่อนบิตไปทางซ้าย (Left Shift: <<) 1 ตำแหน่ง มีผลลัพธ์เทียบเท่ากับการดำเนินการคณิตศาสตร์ใด?', 'choice', 'การคูณด้วย 2');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (78, 18, 3, 'หากกำหนด d = {"name": "Alice", "age": 25} คำสั่ง print("Alice" in d) จะคืนค่าใด?', 'choice', 'False');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (79, 18, 4, 'ตัวดำเนินการระดับบิต (Bitwise Operator) สัญลักษณ์ ^ คือการทำงานแบบใด?', 'choice', 'Bitwise XOR');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (80, 18, 5, 'หากสั่ง print(5 & 3) จะได้ผลลัพธ์เป็นตัวเลขใด?', 'fill', '1');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (81, 19, 1, 'ตัวดำเนินการสัญลักษณ์ใดที่มีลำดับความสำคัญ (Precedence) สูงที่สุดในการประมวลผล?', 'choice', '( ) วงเล็บ');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (82, 19, 2, 'หากต้องการเปลี่ยนลำดับการคำนวณให้ส่วนใดส่วนหนึ่งประมวลผลก่อน ต้องใช้สัญลักษณ์ใด?', 'fill', '( )');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (83, 19, 3, 'ระหว่างตัวดำเนินการ * (คูณ) กับ + (บวก) ตัวใดมีลำดับความสำคัญมากกว่าและทำก่อน?', 'choice', '* (คูณ)');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (84, 19, 4, 'คำสั่ง print(2 + 3 * 4) จะได้ผลลัพธ์เป็นเท่าใด?', 'fill', '14');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (85, 19, 5, 'ตัวดำเนินการประเภทการกำหนดค่า (Assignment: =, +=) มีลำดับความสำคัญอย่างไรเมื่อเทียบกับตัวดำเนินการคำนวณ?', 'choice', 'มีลำดับความสำคัญต่ำกว่า (ทำทีหลังสุด)');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (86, 20, 1, 'คำสั่ง print((2 + 3) * 4) จะได้ผลลัพธ์เป็นเท่าใด?', 'fill', '20');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (87, 20, 2, 'ข้อใดเรียงลำดับความสำคัญของตัวดำเนินการจาก "สูงไปต่ำ" ได้ถูกต้อง?', 'choice', '** , * , + , ==');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (88, 20, 3, 'ตัวดำเนินการยกกำลัง (**) มีทิศทางการประมวลผล (Associativity) แบบใดเมื่อมีลำดับเท่ากัน?', 'choice', 'จากขวาไปซ้าย (Right-to-Left)');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (89, 20, 4, 'คำสั่ง print(2 ** 3 ** 2) จะได้ผลลัพธ์เป็นเท่าใด?', 'fill', '512');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (90, 20, 5, 'ผลลัพธ์ของนิพจน์ True or False and False คือข้อใด?', 'choice', 'True');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (91, 21, 1, 'ภาษา Python ใช้อะไรในการระบุขอบเขตบล็อกโค้ด (Block of Code) ของคำสั่งเงื่อนไข?', 'choice', 'การย่อหน้า (Indentation)');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (92, 21, 2, 'สัญลักษณ์ใดที่ต้องใส่ไว้ท้ายบรรทัดหลังจบเงื่อนไข if, elif หรือ else เสมอ?', 'fill', ':');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (93, 21, 3, 'คำสั่งใดที่ใช้ตรวจสอบเงื่อนไขทางเลือกเพิ่มเติมเมื่อเงื่อนไข if ก่อนหน้าเป็น False?', 'choice', 'elif');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (94, 21, 4, 'บล็อกคำสั่ง else จะทำงานในกรณีใด?', 'choice', 'เมื่อเงื่อนไขทั้งหมดก่อนหน้าเป็น False');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (95, 21, 5, 'คำสั่งใดใช้เขียนไว้ในบล็อกเงื่อนไขชั่วคราวเพื่อข้ามการทำงานและป้องกันเกิด SyntaxError?', 'fill', 'pass');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (96, 22, 1, 'หาก score = 65 โค้ดส่วนนี้จะแสดงผลอะไร: if score >= 80: print("A") elif score >= 60: print("B") else: print("C")', 'choice', 'B');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (97, 22, 2, 'การย่อหน้า (Indentation) มาตรฐานในภาษา Python นิยมใช้เว้นวรรคกี่ช่อง?', 'choice', '4 ช่อง');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (98, 22, 3, 'ผลลัพธ์ของคำสั่ง print("Pass" if 70 >= 50 else "Fail") คือข้อใด?', 'fill', 'Pass');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (99, 22, 4, 'หากลืมใส่เครื่องหมายโคลอน ( : ) หลังคำสั่ง if จะเกิด Error ชนิดใด?', 'choice', 'SyntaxError');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (100, 22, 5, 'หากเขียนย่อหน้า (Indentation) ในบล็อกเงื่อนไขไม่เท่ากัน จะเกิด Error ชนิดใด?', 'fill', 'IndentationError');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (101, 23, 1, 'คำสั่งวนซ้ำชนิดใดเหมาะสำหรับการวนอ่านค่าข้อมูลใน List หรือชุดข้อมูลที่ทราบจำนวนรอบแน่นอน?', 'choice', 'for');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (102, 23, 2, 'คำสั่งใดใช้ข้ามการทำงานในรอบปัจจุบัน แล้วไปเริ่มต้นวนรอบถัดไปทันที?', 'fill', 'continue');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (103, 23, 3, 'คำสั่ง range(5) จะสร้างชุดตัวเลขเริ่มจากเลขใดถึงเลขใด?', 'choice', '0 ถึง 4');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (104, 23, 4, 'หากลืมอัปเดตค่าตัวแปรเงื่อนไขใน while loop จะเกิดปัญหาใดขึ้น?', 'choice', 'เกิด Infinite Loop (ลูปวนไม่สิ้นสุด)');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (105, 23, 5, 'คำสั่งใดสั่งให้ออกจากลูปทันที โดยไม่สนใจรอบที่เหลือ?', 'fill', 'break');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (106, 24, 1, 'คำสั่ง range(1, 10, 2) จะสร้างชุดตัวเลขใดบ้าง?', 'choice', '1, 3, 5, 7, 9');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (107, 24, 2, 'ผลลัพธ์ของการรันโค้ดนี้คืออะไร: for i in range(1, 4): print(i, end=" ")', 'fill', '1 2 3');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (108, 24, 3, 'ข้อใดคือผลลัพธ์ของโค้ด: count = 0; while count < 3: print(count); count += 1', 'choice', '0 แล้วตามด้วย 1 และ 2');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (109, 24, 4, 'หากลูปวนทำงานซ้ำจนจบตามปกติโดยไม่โดนสั่งด้วยคำสั่ง break บล็อกคำสั่งใดจะทำงานต่อท้าย?', 'choice', 'else');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (110, 24, 5, 'จากโค้ด: for x in range(5): if x == 2: break; print(x, end=" ") จะพิมพ์ตัวเลขใดบ้าง?', 'fill', '0 1');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (111, 25, 1, 'คำสั่งใดที่ใช้ในการประกาศหรือสร้างฟังก์ชันในภาษา Python?', 'choice', 'def');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (112, 25, 2, 'คำสั่งใดใช้ในการส่งค่าผลลัพธ์ออกจากฟังก์ชันไปยังจุดที่เรียกใช้งาน?', 'fill', 'return');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (113, 25, 3, 'ตัวแปรที่ถูกสร้างขึ้นภายในฟังก์ชันและเรียกใช้งานได้เฉพาะในฟังก์ชันนั้น เรียกว่าตัวแปรชนิดใด?', 'choice', 'Local Variable');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (114, 25, 4, 'หากต้องการแก้ไขค่าตัวแปร Global จากภายในฟังก์ชัน ต้องใช้คำสั่งใดนำหน้าตัวแปร?', 'fill', 'global');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (115, 25, 5, 'ประโยชน์หลักของการสร้างฟังก์ชันขึ้นมาใช้งานคือข้อใด?', 'choice', 'ช่วยให้โค้ดนำกลับมาใช้ซ้ำ (Reuse) ได้ง่ายและเป็นระเบียบ');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (116, 26, 1, 'จากฟังก์ชัน def multiply(a, b=2): return a * b ผลลัพธ์ของการเรียก multiply(5) คือเท่าใด?', 'fill', '10');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (117, 26, 2, 'ข้อใดคือการส่งอาร์กิวเมนต์แบบระบุชื่อพารามิเตอร์โดยตรง (Keyword Arguments)?', 'choice', 'display(age=20, name="A")''');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (118, 26, 3, 'เมื่อคำสั่ง return ภายในฟังก์ชันทำงาน จะเกิดอะไรขึ้นกับการทำงานของฟังก์ชันนั้น?', 'choice', 'หยุดการทำงานของฟังก์ชันและส่งค่ากลับทันที');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (119, 26, 4, 'หากฟังก์ชันไม่มีการระบุคำสั่ง return เมื่อเรียกใช้งาน ฟังก์ชันจะคืนค่าใดออกมาเป็นค่าเริ่มต้น?', 'choice', 'None');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (120, 26, 5, 'จากโค้ด: def add(x, y): return x + y ผลลัพธ์ของ print(add(3, 4) * 2) คือเท่าใด?', 'fill', '14');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (121, 27, 1, 'บล็อกคำสั่งใดใน Python ที่ใช้สำหรับวางโค้ดที่มีความเสี่ยงจะเกิด Runtime Error?', 'choice', 'try');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (122, 27, 2, 'หากพยายามหารตัวเลขด้วย 0 ใน Python จะเกิด Exception ชนิดใดขึ้น?', 'fill', 'ZeroDivisionError');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (123, 27, 3, 'บล็อกคำสั่ง finally ในโครงสร้าง try-except มีลักษณะการทำงานอย่างไร?', 'choice', 'ทำงานเสมอไม่ว่าจะเกิด Exception หรือไม่ก็ตาม');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (124, 27, 4, 'หากต้องการสร้างหรือส่งสัญญาณข้อผิดพลาดขึ้นมาเองตามเงื่อนไขที่กำหนด ต้องใช้คำสั่งใด?', 'fill', 'raise');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (156, 34, 1, 'เมธอดใดของโมดูล json ที่ใช้สำหรับแปลงข้อมูล Python Dictionary แล้วบันทึกลงไฟล์ JSON?', 'fill', 'dump');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (125, 27, 5, 'Exception ชนิด ValueError มักจะเกิดขึ้นในกรณีใด?', 'choice', 'เมื่อแปลงข้อมูลชนิดหนึ่งไปยังอีกชนิดที่มีค่าไม่ถูกต้อง เช่น int("abc")');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (126, 28, 1, 'บล็อกคำสั่ง else ในโครงสร้าง try-except-else-finally จะทำงานในกรณีใด?', 'choice', 'ทำงานเฉพาะเมื่อไม่มี Exception ใดๆ เกิดขึ้นในบล็อก try');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (127, 28, 2, 'การตั้งชื่อคลาสเพื่อสร้าง Custom Exception ของตัวเอง ควรทำการสืบทอด (Inherit) มาจากคลาสใด?', 'fill', 'Exception');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (128, 28, 3, 'หากพยายามเปิดไฟล์ที่ไม่มีอยู่จริงในระบบ ระบบจะแจ้งเกิด Exception ชนิดใด?', 'choice', 'FileNotFoundError');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (129, 28, 4, 'คำสั่งใดที่ใช้สำหรับรับเอา object หรือข้อความอธิบาย Error จากระบบมาเก็บไว้ในตัวแปร?', 'fill', 'as');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (130, 28, 5, 'จากโค้ด: try: x = 10 / 0 except ZeroDivisionError: print("A") finally: print("B") จะแสดงผลลัพธ์ใด?', 'choice', 'A แล้วตามด้วย B ในบรรทัดใหม่');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (131, 29, 1, 'ข้อใดคือความแตกต่างหลักระหว่าง List และ Tuple ในภาษา Python?', 'choice', 'List สามารถแก้ไขข้อมูลได้ (Mutable) แต่ Tuple แก้ไขไม่ได้ (Immutable)');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (132, 29, 2, 'สัญลักษณ์วงเล็บชนิดใดที่ใช้ในการประกาศตัวแปรชนิด List?', 'fill', '[]');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (133, 29, 3, 'หากต้องการเพิ่มสมาชิกใหม่ต่อท้าย List จะต้องใช้เมธอดใด?', 'choice', 'append()');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (134, 29, 4, 'ดัชนี (Index) ของสมาชิกตัวแรกใน List หรือ Tuple เริ่มต้นด้วยตัวเลขใด?', 'fill', '0');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (135, 29, 5, 'การสร้าง Tuple ที่มีสมาชิกเพียงตัวเดียว จะต้องใส่เครื่องหมายใดต่อท้ายค่าสมาชิกเสมอ?', 'choice', 'เครื่องหมายจุลภาค (,)');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (136, 30, 1, 'จาก List: nums = [10, 20, 30, 40, 50] ผลลัพธ์ของ nums[1:4] คือข้อใด?', 'choice', '[20, 30, 40]');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (137, 30, 2, 'เมธอดใดของ List ที่ใช้สำหรับลบสมาชิกตำแหน่งท้ายสุดออกพร้อมคืนค่านั้นกลับมา?', 'fill', 'pop');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (138, 30, 3, 'หากต้องการย้อนกลับลำดับข้อมูลใน List จากหลังมาหน้า (Reverse) ด้วยการ Slicing ต้องเขียนอย่างไร?', 'choice', '[::-1]');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (139, 30, 4, 'ผลลัพธ์ของโค้ด List Comprehension: [x**2 for x in range(4)] คืออะไร?', 'fill', '[0, 1, 4, 9]');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (140, 30, 5, 'จากโค้ด: t = (1, 2) แล้วทำ t[0] = 5 จะเกิดผลลัพธ์อย่างไร?', 'choice', 'เกิด TypeError เนื่องจาก Tuple ไม่ยอมให้แก้ไขค่า');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (141, 31, 1, 'โครงสร้างข้อมูลชนิด Dictionary เก็บข้อมูลในรูปแบบใด?', 'choice', 'คู่ Key และ Value');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (142, 31, 2, 'หากต้องการดึงเฉพาะคู่ (Key, Value) ออกมาจาก Dictionary เพื่อใช้วนลูป ต้องใช้เมธอดใด?', 'fill', 'items');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (143, 31, 3, 'คุณสมบัติเด่นที่สุดของโครงสร้างข้อมูลชนิด Set คือข้อใด?', 'choice', 'ไม่มีลำดับและไม่มีสมาชิกซ้ำกัน');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (144, 31, 4, 'การสร้าง Set ว่าง (Empty Set) ใน Python ที่ถูกต้อง ต้องใช้คำสั่งใด?', 'fill', 'set()');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (145, 31, 5, 'หากต้องการลบสมาชิกใน Set โดยไม่ให้เกิด Error แม้จะไม่พบสมาชิกนั้นใน Set ต้องใช้เมธอดใด?', 'choice', 'discard()');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (146, 32, 1, 'จาก Dictionary: d = {"a": 1, "b": 2} หากสั่ง print(d.get("c", 0)) จะได้ผลลัพธ์ใด?', 'fill', '0');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (147, 32, 2, 'สัญลักษณ์ใดที่ใช้แทนการดำเนินการ Intersection (เอาเฉพาะสมาชิกที่มีร่วมกัน) ของสองเซต?', 'choice', '&');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (148, 32, 3, 'จากโค้ด: s = {1, 2, 2, 3, 3, 3} ค่าของ len(s) จะเท่ากับเท่าใด?', 'fill', '3');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (149, 32, 4, 'ชนิดข้อมูลในข้อใด **ไม่สามารถ** นำมาใช้เป็น Key ของ Dictionaryได้?', 'choice', 'List');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (150, 32, 5, 'กำหนดให้ A = {1, 2, 3} และ B = {3, 4, 5} ผลลัพธ์ของ A - B คือข้อใด?', 'choice', '{1, 2}');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (151, 33, 1, 'โหมดใดในคำสั่ง open() ที่ใช้สำหรับเปิดไฟล์เพื่อเขียนข้อมูลต่อท้ายไฟล์เดิม (Append)?', 'choice', 'a');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (152, 33, 2, 'ข้อดีหลักของการใช้คำสั่ง with open(...) as file: ในการเปิดไฟล์คืออะไร?', 'choice', 'ระบบจะทำการปิดไฟล์ให้อัตโนมัติเมื่อทำงานเสร็จ');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (153, 33, 3, 'เมธอดใดใช้สำหรับอ่านเนื้อหาในไฟล์ทั้งหมดออกมาเป็น List ของข้อความแยกตามบรรทัด?', 'fill', 'readlines');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (154, 33, 4, 'หากเปิดไฟล์ในโหมด "w" (Write) แต่ไฟล์นั้นมีอยู่แล้วในระบบ จะเกิดอะไรขึ้น?', 'choice', 'ข้อมูลเดิมในไฟล์จะถูกลบและแทนที่ด้วยข้อมูลใหม่ทั้งหมด');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (155, 33, 5, 'ฟังก์ชันใดในโมดูล os ที่ใช้สำหรับตรวจสอบว่าไฟล์หรือพาธนั้นมีอยู่จริงหรือไม่?', 'fill', 'os.path.exists');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (157, 34, 2, 'การเปิดไฟล์ไบนารี เช่น ไฟล์รูปภาพ เพื่ออ่านข้อมูล ต้องระบุโหมดการเปิดไฟล์อย่างไร?', 'choice', 'rb');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (158, 34, 3, 'เมธอด strip() นิยมนำมาใช้ร่วมกับการอ่านไฟล์ทีละบรรทัดเพื่อวัตถุประสงค์ใด?', 'choice', 'ตัดช่องว่างและตัวอักขระขึ้นบรรทัดใหม่ (\n) ออกจากหัวท้ายข้อความ');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (159, 34, 4, 'โมดูลมาตรฐานใดใน Python ที่ใช้สำหรับอ่านและเขียนไฟล์ตารางข้อมูลรูปแบบ Comma-Separated Values?', 'fill', 'csv');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (160, 34, 5, 'หากพยายามเปิดไฟล์ที่ไม่มีอยู่จริงในระบบด้วยโหมด "r" (Read) จะเกิด Exception ชนิดใดขึ้น?', 'choice', 'FileNotFoundError');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (161, 35, 1, 'บล็อกคำสั่งใดในการจัดการ Exception ที่จะถูกเรียกทำงานเสมอไม่ว่าจะเกิดข้อผิดพลาดขึ้นหรือไม่?', 'fill', 'finally');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (162, 35, 2, 'คีย์เวิร์ดใดที่ใช้สำหรับสร้างหรือโยน (Raise) Exception ขึ้นมาด้วยตนเอง?', 'fill', 'raise');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (163, 35, 3, 'หากพยายามเข้าถึง Index ของ List ที่ไม่มีอยู่จริง จะเกิด Exception ชนิดใด?', 'choice', 'IndexError');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (164, 35, 4, 'บล็อก else ในโครงสร้าง try-except จะทำงานในกรณีใด?', 'choice', 'ทำงานเมื่อไม่มี Exception เกิดขึ้นเลยในบล็อก try');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (165, 35, 5, 'หากต้องการสร้าง Custom Exception Class จะต้องทำการสืบทอด (Inherit) มาจากคลาสใดเป็นหลัก?', 'choice', 'Exception');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (166, 36, 1, 'หากสั่ง int("hello") จะเกิด Exception ชนิดใดขึ้นในภาษา Python?', 'choice', 'ValueError');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (167, 36, 2, 'ข้อใดคือประโยชน์หลักของการระบุ Specific Exception ในการใช้ except?', 'choice', 'ช่วยให้ดักจับและจัดการข้อผิดพลาดแต่ละประเภทได้อย่างแม่นยำ');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (168, 36, 3, 'ข้อผิดพลาดประเภท Runtime Error แตกต่างจาก Syntax Error อย่างไร?', 'choice', 'Runtime Error เกิดขึ้นขณะโปรแกรมกำลังทำงาน ส่วน Syntax Error เกิดจากไวยากรณ์ผิดตั้งแต่แรก');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (169, 36, 4, 'คีย์เวิร์ดใดที่ใช้คู่กับ except เพื่อเก็บตัวแปรที่ดักจับข้อความ Error จากระบบ (เช่น except Exception ___ e:)?', 'fill', 'as');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (170, 36, 5, 'หากพยายามหารตัวเลขด้วย 0 จะเกิด Exception ชนิดใดขึ้น?', 'fill', 'ZeroDivisionError');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (171, 37, 1, 'เมธอดพิเศษใดในภาษา Python ที่ทำหน้าที่เป็น Constructor และถูกเรียกทำงานอัตโนมัติเมื่อมีการสร้าง Object?', 'fill', '__init__');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (172, 37, 2, 'ข้อใดอธิบายความสัมพันธ์ระหว่าง Class และ Object ได้ถูกต้องที่สุด?', 'choice', 'Class คือพิมพ์เขียว ส่วน Object คือวัตถุจริงที่ถูกสร้างขึ้นจาก Class');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (173, 37, 3, 'พารามิเตอร์แรกในเมธอดของ Class (นิยมใช้ชื่อ self) มีไว้เพื่อวัตถุประสงค์ใด?', 'choice', 'เป็นตัวแทนอ้างอิงถึงตัว Object นั้นๆ เอง');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (174, 37, 4, 'หากต้องการซ่อน Attribute ไม่ให้เข้าถึงจากภายนอกคลาสโดยตรง (Private Attribute) จะต้องใช้สัญลักษณ์ใดนำหน้าชื่อตัวแปร?', 'fill', '__');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (175, 37, 5, 'แนวคิดหลักของการซ่อนข้อมูลและจำกัดการเข้าถึงภายในคลาสเรียกว่าอะไร?', 'choice', 'Encapsulation');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (176, 38, 1, 'เมธอดพิเศษใดที่ถูกเรียกใช้อัตโนมัติเมื่อนำ Object ไปส่งให้ฟังก์ชัน print() หรือ str() เพื่อเปลี่ยน Object ให้เป็นข้อความ?', 'fill', '__str__');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (177, 38, 2, ' Class Attribute แตกต่างจาก Instance Attribute อย่างไร?', 'choice', 'Class Attribute แชร์ใช้ร่วมกันทุก Object แต่ Instance Attribute เป็นของเฉพาะแต่ละ Object');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (178, 38, 3, 'เมธอดประเภทใดที่ใช้สำหรับอ่านค่าของ Private Attribute จากภายนอกคลาสอย่างปลอดภัย?', 'choice', 'Getter Method');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (179, 38, 4, 'การสร้าง Object จาก Class ในภาษา Python เรียกกระบวนการนี้ว่าอะไร?', 'fill', 'Instantiation');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (180, 38, 5, 'ข้อใดไม่ใช่ประโยชน์หลักของการเขียนโปรแกรมเชิงวัตถุ (OOP)?', 'choice', 'ทำให้โค้ดทำงานเร็วขึ้นกว่าการเขียนแบบ Procedural เสมอ');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (181, 39, 1, 'แนวคิดใน OOP ที่ยอมให้คลาสใหม่รับเอา Attributes และ Methods จากคลาสที่มีอยู่แล้วมาใช้งานเรียกว่าอะไร?', 'choice', 'Inheritance');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (182, 39, 2, 'ฟังก์ชัน built-in ใดใน Python ที่ใช้สำหรับอ้างอิงและเรียกใช้งานเมธอดหรือ Constructor ของ Parent Class?', 'fill', 'super');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (183, 39, 3, 'การที่ Child Class นิยามเมธอดใหม่โดยใช้ชื่อเดียวกับเมธอดใน Parent Class เพื่อเปลี่ยนพฤติกรรมเรียกว่าอะไร?', 'choice', 'Method Overriding');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (184, 39, 4, 'ฟังก์ชัน built-in ใดใช้สำหรับตรวจสอบว่าคลาสหนึ่งสืบทอดมาจากอีกคลาสหนึ่งหรือไม่?', 'fill', 'issubclass');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (185, 39, 5, 'หลักการใน OOP ที่อนุญาตให้ Object ต่างประเภทกัน สามารถตอบสนองต่อการเรียกใช้เมธอดชื่อเดียวกันได้เรียกว่าอะไร?', 'choice', 'Polymorphism');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (186, 40, 1, 'หากคลาส Dog สืบทอดมาจากคลาส Animal รูปแบบการประกาศคลาสใดใน Python ที่ถูกต้อง?', 'choice', 'class Dog(Animal):');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (187, 40, 2, 'ฟังก์ชัน built-in ใดใช้สำหรับตรวจสอบว่า Object เป็นอินสแตนซ์ของคลาสที่ระบุ (หรือคลาสแม่) หรือไม่?', 'fill', 'isinstance');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (188, 40, 3, 'คุณสมบัติของภาษา Python ที่ยอมให้คลาสลูกสืบทอดมาจากคลาสแม่หลายคลาสพร้อมกันเรียกว่าอะไร?', 'choice', 'Multiple Inheritance');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (189, 40, 4, 'คำใดไม่ใช่หนึ่งใน 4 เสาหลัก (Core Pillars) ของการเขียนโปรแกรมเชิงวัตถุ (OOP)?', 'choice', 'Compilation');
INSERT INTO public.quiz_questions (question_id, quiz_id, question_order, question_text, question_type, correct_answer) VALUES (190, 40, 5, 'การเรียกใช้งาน super().__init__() ในคลาสลูกมีวัตถุประสงค์หลักเพื่ออะไร?', 'choice', 'เพื่อเรียกใช้ Constructor ของคลาสแม่ให้จัดเตรียม Attribute เริ่มต้น');


--
-- Data for Name: question_choices; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (1, 1, 'print()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (2, 1, 'echo()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (3, 1, 'write()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (4, 1, 'console.log()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (5, 3, 'อ่านและเข้าใจง่าย มีไวยากรณ์ใกล้เคียงภาษาอังกฤษ');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (6, 3, 'ต้องใส่ Semicolon (;) ปิดท้ายบรรทัดเสมอ');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (7, 3, 'สามารถรันได้บนระบบปฏิบัติการ Windows เท่านั้น');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (8, 3, 'เป็นภาษาเครื่องระดับต่ำ (Low-level Language)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (9, 4, '.py');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (10, 4, '.python');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (11, 4, '.pt');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (12, 4, '.exe');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (13, 6, 'Guido van Rossum');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (14, 6, 'Bill Gates');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (15, 6, 'Steve Jobs');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (16, 6, 'James Gosling');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (17, 7, 'การย่อหน้า (Indentation)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (18, 7, 'ปีกกา { }');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (19, 7, 'วงเล็บสี่เหลี่ยม [ ]');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (20, 7, 'เครื่องหมายอัญประกาศ " "');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (21, 8, 'การใส่ Semicolon (;) ปิดท้ายทุกบรรทัด');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (22, 8, 'การนำเข้าโมดูลด้วยคำสั่ง import');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (23, 8, 'การใช้เครื่องหมาย # เพื่อทำ Comment');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (24, 8, 'การสร้างตัวแปรเพื่อเก็บข้อมูล');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (25, 9, '"""..."""');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (26, 9, '//...//');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (27, 9, '/*...*/');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (28, 9, '<!--...-->');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (29, 10, 'จากบนลงล่าง และจากซ้ายไปขวา');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (30, 10, 'จากล่างขึ้นบน และจากขวาไปซ้าย');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (31, 10, 'ประมวลผลคำสั่งพร้อมกันทุกบรรทัดแบบสุ่ม');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (32, 10, 'ประมวลผลจากบรรทัดสุดท้ายขึ้นมาบรรทัดแรก');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (33, 11, 'print()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (34, 11, 'input()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (35, 11, 'display()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (36, 11, 'show()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (37, 12, 'print("Hello")');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (38, 12, 'print(Hello)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (39, 12, 'echo "Hello"');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (40, 12, 'Console.Print("Hello")');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (41, 14, 'เครื่องหมายจุลภาค ( , )');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (42, 14, 'เครื่องหมายอัฒภาค ( ; )');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (43, 14, 'เครื่องหมายมหัพภาค ( . )');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (44, 14, 'เครื่องหมายไปยาลใหญ่ ( ... )');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (45, 16, 'ขึ้นบรรทัดใหม่ (New Line)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (46, 16, 'เว้นระยะแท็บ (Tab)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (47, 16, 'ลบตัวอักษรด้านหน้า (Backspace)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (48, 16, 'แสดงเครื่องหมายอัญประกาศ');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (49, 17, 'sep="/"');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (50, 17, 'end="/"');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (51, 17, 'split="/"');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (52, 17, 'join="/"');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (53, 18, 'end=""');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (54, 18, 'sep=""');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (55, 18, 'stop=""');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (56, 18, 'close=""');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (57, 20, 'ลืมใส่เครื่องหมายอัญประกาศครอบข้อความ เช่น print(Hello)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (58, 20, 'ใส่ตัวเลขลงในคำสั่ง print(100)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (59, 20, 'ใช้เครื่องหมาย Double Quote แทน Single Quote');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (60, 20, 'ใส่เครื่องหมายจุลภาคคั่นระหว่างข้อมูล');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (61, 21, 'input()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (62, 21, 'get()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (63, 21, 'read()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (64, 21, 'scan()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (65, 22, 'str (ข้อความ)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (66, 22, 'int (จำนวนเต็ม)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (67, 22, 'float (ทศนิยม)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (68, 22, 'bool (ค่าความจริง)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (69, 23, 'int()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (70, 23, 'str()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (71, 23, 'float()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (72, 23, 'bool()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (73, 24, 'float()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (74, 24, 'int()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (75, 24, 'double()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (76, 24, 'real()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (77, 26, 'age = int(input("กรอกอายุ: "))');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (78, 26, 'age = input(int("กรอกอายุ: "))');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (79, 26, 'age = str(input("กรอกอายุ: "))');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (80, 26, 'age = input("กรอกอายุ: ").int()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (81, 27, 'ValueError');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (82, 27, 'TypeError');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (83, 27, 'NameError');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (84, 27, 'SyntaxError');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (85, 28, 'แปลงข้อมูลชนิดอื่นให้กลายเป็นข้อความ (String)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (86, 28, 'แปลงข้อความให้กลายเป็นตัวเลขจำนวนเต็ม');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (87, 28, 'นับจำนวนตัวอักษรในข้อความ');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (88, 28, 'ลบช่องว่างออกจากข้อความ');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (89, 30, 'การแปลงชนิดข้อมูลจากรูปแบบหนึ่งไปเป็นอีกรูปแบบหนึ่ง');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (90, 30, 'การส่งค่าตัวแปรเข้าไปในฟังก์ชัน print()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (91, 30, 'การรับค่าข้อมูลจากผู้ใช้ผ่านคีย์บอร์ด');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (92, 30, 'การตรวจสอบชนิดข้อมูลด้วยฟังก์ชัน type()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (93, 32, 'เครื่องหมายปีกกา { }');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (94, 32, 'เครื่องหมายวงเล็บสี่เหลี่ยม [ ]');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (95, 32, 'เครื่องหมายวงเล็บโค้ง ( )');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (96, 32, 'เครื่องหมายอัญประกาศ " "');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (97, 33, 'help()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (98, 33, 'info()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (99, 33, 'manual()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (100, 33, 'doc()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (101, 35, ':.2f');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (102, 35, ':2d');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (103, 35, ';.2f');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (104, 35, '%2f');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (105, 36, 'f"{salary:,}"');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (106, 36, 'f"{salary:c}"');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (107, 36, 'f"{salary:.comma}"');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (108, 36, 'f"{salary:1,000}"');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (109, 37, ':04d');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (110, 37, ':40d');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (111, 37, ':.4f');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (112, 37, ':04s');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (113, 38, 'จัดข้อความให้อยู่ตรงกลาง ในความกว้าง 10 ตัวอักษร');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (114, 38, 'จัดข้อความชิดซ้าย ในความกว้าง 10 ตัวอักษร');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (115, 38, 'จัดข้อความชิดขวา ในความกว้าง 10 ตัวอักษร');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (116, 38, 'เติมสัญลักษณ์ ^ จำนวน 10 ตัว');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (117, 41, 'เป็นป้ายชื่อสำหรับอ้างอิงตำแหน่งจัดเก็บข้อมูลในหน่วยความจำ');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (118, 41, 'ใช้สำหรับคำนวณทางคณิตศาสตร์เท่านั้น');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (119, 41, 'ใช้แสดงผลข้อความออกทางหน้าจอ');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (120, 41, 'ใช้สำหรับแปลงไฟล์โค้ดเป็นภาษาเครื่อง');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (121, 43, '2total');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (122, 43, 'total2');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (123, 43, '_total');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (124, 43, 'total_score');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (125, 44, 'type()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (126, 44, 'check()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (127, 44, 'typeof()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (128, 44, 'class()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (129, 45, 'ตัวอักษรพิมพ์เล็กและพิมพ์ใหญ่ถือเป็นตัวแปรคนละตัวกัน');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (130, 45, 'ตั้งชื่อได้เฉพาะตัวอักษรพิมพ์ใหญ่เท่านั้น');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (131, 45, 'ระบบจะแปลงตัวอักษรเป็นพิมพ์เล็กให้อัตโนมัติ');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (132, 45, 'ห้ามใช้ตัวอักษรพิมพ์เล็กในการตั้งชื่อ');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (133, 46, 'import');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (134, 46, 'integer');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (135, 46, 'number');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (136, 46, 'name');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (137, 47, 'snake_case');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (138, 47, 'camelCase');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (139, 47, 'PascalCase');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (140, 47, 'Kebab-case');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (141, 48, 'a, b = b, a');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (142, 48, 'swap(a, b)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (143, 48, 'a = b and b = a');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (144, 48, 'move a to b');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (149, 51, 'Dictionary');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (150, 51, 'List');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (151, 51, 'Tuple');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (152, 51, 'Set');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (153, 53, 'ไม่เก็บข้อมูลที่ซ้ำกัน และไม่มีลำดับแน่นอน');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (154, 53, 'เก็บข้อมูลเรียงตามลำดับ Index เสมอ');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (155, 53, 'ต้องระบุ Key และ Value คู่กันเสมอ');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (156, 53, 'แก้ไขข้อมูลภายในไม่ได้หลังสร้างขึ้นมา');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (157, 54, 'List สามารถแก้ไขข้อมูลได้ แต่ Tuple แก้ไขข้อมูลไม่ได้');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (158, 54, 'Tuple สามารถแก้ไขข้อมูลได้ แต่ List แก้ไขข้อมูลไม่ได้');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (159, 54, 'List เก็บได้เฉพาะตัวเลข ส่วน Tuple เก็บได้เฉพาะข้อความ');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (160, 54, 'ไม่มีความแตกต่างกัน สามารถใช้แทนกันได้ทุกกรณี');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (161, 56, 'append()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (162, 56, 'add()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (163, 56, 'push()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (164, 56, 'insert_end()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (165, 57, 'student["name"]');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (166, 57, 'student(name)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (167, 57, 'student.index("name")');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (168, 57, 'student->name');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (169, 60, 't[0] = 99');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (170, 60, 'x = t[0]');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (171, 60, 'x, y = t');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (172, 60, 'print(len(t))');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (181, 61, '%');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (182, 61, '//');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (183, 61, '/');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (184, 61, '#');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (185, 63, 'bool (Boolean)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (186, 63, 'int (Integer)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (187, 63, 'str (String)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (188, 63, 'float (Float)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (189, 64, 'x = x + 5');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (190, 64, 'x = 5');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (191, 64, '5 = x');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (192, 64, 'x + 5 = x');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (193, 66, 'or');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (194, 66, 'and');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (195, 66, 'not');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (196, 66, 'xor');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (197, 67, 'True');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (198, 67, 'False');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (199, 67, 'None');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (200, 67, 'Error');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (201, 70, 'False');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (202, 70, 'True');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (203, 70, '0');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (204, 70, '1');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (213, 71, 'Membership Operators (in, not in)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (214, 71, 'Identity Operators (is, is not)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (215, 71, 'Comparison Operators (==, !=)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (216, 71, 'Logical Operators (and, or)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (217, 72, 'ตำแหน่งในหน่วยความจำ (Memory Address)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (218, 72, 'ค่าของข้อมูลภายในตัวแปร');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (219, 72, 'ชนิดของข้อมูล (Data Type)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (220, 72, 'ความยาวของตัวแปร');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (221, 74, '~ (Bitwise NOT)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (222, 74, '& (Bitwise AND)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (223, 74, '| (Bitwise OR)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (224, 74, '^ (Bitwise XOR)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (225, 76, 'True, False');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (226, 76, 'True, True');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (227, 76, 'False, False');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (228, 76, 'False, True');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (229, 77, 'การคูณด้วย 2');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (230, 77, 'การหารด้วย 2');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (231, 77, 'การยกกำลัง 2');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (232, 77, 'การถอดสแควร์รูท');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (233, 78, 'False');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (234, 78, 'True');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (235, 78, 'None');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (236, 78, 'Error');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (237, 79, 'Bitwise XOR');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (238, 79, 'Bitwise AND');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (239, 79, 'Bitwise OR');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (240, 79, 'Bitwise NOT');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (245, 81, '( ) วงเล็บ');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (246, 81, '** ยกกำลัง');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (247, 81, '* คูณ');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (248, 81, '== เท่ากับ');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (249, 83, '* (คูณ)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (250, 83, '+ (บวก)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (251, 83, 'ทั้งสองตัวมีลำดับความสำคัญเท่ากัน');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (252, 83, 'ขึ้นอยู่กับว่าตัวใดเขียนขึ้นก่อน');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (253, 85, 'มีลำดับความสำคัญต่ำกว่า (ทำทีหลังสุด)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (254, 85, 'มีลำดับความสำคัญสูงกว่า (ทำก่อนเสมอ)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (255, 85, 'มีลำดับความสำคัญเท่ากัน');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (256, 85, 'ขึ้นอยู่กับชนิดของตัวแปร');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (257, 87, '** , * , + , ==');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (258, 87, '== , + , * , **');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (259, 87, '+ , * , ** , ==');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (260, 87, '* , ** , == , +');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (261, 88, 'จากขวาไปซ้าย (Right-to-Left)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (262, 88, 'จากซ้ายไปขวา (Left-to-Right)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (263, 88, 'ประมวลผลพร้อมกัน');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (264, 88, 'สุ่มลำดับตามระบบปฏิบัติการ');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (265, 90, 'True');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (266, 90, 'False');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (267, 90, 'None');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (268, 90, 'Error');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (277, 91, 'การย่อหน้า (Indentation)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (278, 91, 'เครื่องหมายปีกกา { }');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (279, 91, 'คำสั่ง begin และ end');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (280, 91, 'เครื่องหมายวงเล็บ ( )');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (281, 93, 'elif');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (282, 93, 'else if');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (283, 93, 'then');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (284, 93, 'switch');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (285, 94, 'เมื่อเงื่อนไขทั้งหมดก่อนหน้าเป็น False');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (286, 94, 'เมื่อเงื่อนไขแรกเป็น True');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (287, 94, 'ทำงานเสมอไม่ว่าจะเกิดอะไรขึ้น');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (288, 94, 'ทำงานเมื่อโปรแกรมเกิด Error');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (289, 96, 'B');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (290, 96, 'A');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (291, 96, 'C');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (292, 96, 'ไม่แสดงผลอะไรเลย');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (293, 97, '4 ช่อง');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (294, 97, '2 ช่อง');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (295, 97, '6 ช่อง');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (296, 97, '8 ช่อง');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (297, 99, 'SyntaxError');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (298, 99, 'TypeError');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (299, 99, 'NameError');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (300, 99, 'ValueError');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (309, 101, 'for');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (310, 101, 'while');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (311, 101, 'do-while');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (312, 101, 'if-else');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (313, 103, '0 ถึง 4');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (314, 103, '1 ถึง 5');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (315, 103, '0 ถึง 5');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (316, 103, '1 ถึง 4');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (317, 104, 'เกิด Infinite Loop (ลูปวนไม่สิ้นสุด)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (318, 104, 'โปรแกรมทำงานข้ามลูปไปทันที');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (319, 104, 'เกิด SyntaxError ก่อนเริ่มรัน');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (320, 104, 'โปรแกรมจะหยุดทำงานอัตโนมัติใน 1 วินาที');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (321, 106, '1, 3, 5, 7, 9');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (322, 106, '1, 2, 3, 4, 5, 6, 7, 8, 9, 10');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (323, 106, '2, 4, 6, 8, 10');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (324, 106, '1, 3, 5, 7, 9, 10');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (448, 145, 'pop()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (325, 108, '0 แล้วตามด้วย 1 และ 2');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (326, 108, '1 แล้วตามด้วย 2 และ 3');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (327, 108, '0 แล้วตามด้วย 1, 2 และ 3');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (328, 108, '1 แล้วตามด้วย 2');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (329, 109, 'else');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (330, 109, 'finally');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (331, 109, 'catch');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (332, 109, 'default');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (341, 111, 'def');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (342, 111, 'function');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (343, 111, 'create');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (344, 111, 'func');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (345, 113, 'Local Variable');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (346, 113, 'Global Variable');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (347, 113, 'Constant Variable');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (348, 113, 'Static Variable');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (349, 115, 'ช่วยให้โค้ดนำกลับมาใช้ซ้ำ (Reuse) ได้ง่ายและเป็นระเบียบ');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (350, 115, 'ช่วยให้โปรแกรมทำงานเร็วขึ้น 10 เท่า');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (351, 115, 'ช่วยแปลงโค้ด Python เป็นภาษา C');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (352, 115, 'ช่วยประหยัดพื้นที่หน่วยความจำ RAM ของเครื่อง');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (353, 117, 'display(age=20, name="A")');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (354, 117, 'display(20, "A")');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (355, 117, 'display("A", 20)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (356, 117, 'display[name="A", age=20]');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (357, 118, 'หยุดการทำงานของฟังก์ชันและส่งค่ากลับทันที');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (358, 118, 'ข้ามบรรทัดนั้นแล้วทำงานต่อจนจบฟังก์ชัน');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (359, 118, 'วนลูปฟังก์ชันใหม่อีกครั้ง');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (360, 118, 'ลบตัวแปรทั้งหมดในฟังก์ชันทิ้ง');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (361, 119, 'None');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (362, 119, '0');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (363, 119, 'False');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (364, 119, 'Error');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (373, 121, 'try');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (374, 121, 'catch');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (375, 121, 'throw');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (376, 121, 'test');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (377, 123, 'ทำงานเสมอไม่ว่าจะเกิด Exception หรือไม่ก็ตาม');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (378, 123, 'ทำงานเฉพาะเมื่อเกิด Exception เท่านั้น');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (379, 123, 'ทำงานเฉพาะเมื่อไม่มี Exception เกิดขึ้น');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (380, 123, 'ทำงานก่อนบล็อก try เสมอ');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (381, 125, 'เมื่อแปลงข้อมูลชนิดหนึ่งไปยังอีกชนิดที่มีค่าไม่ถูกต้อง เช่น int("abc")');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (382, 125, 'เมื่อทำการหารด้วยศูนย์');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (383, 125, 'เมื่อเข้าถึงสมาชิกของ List เกินขนาด');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (384, 125, 'เมื่อลืมย่อหน้าโค้ด');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (385, 126, 'ทำงานเฉพาะเมื่อไม่มี Exception ใดๆ เกิดขึ้นในบล็อก try');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (386, 126, 'ทำงานเมื่อเกิด Exception ชนิดที่ไม่รู้จัก');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (387, 126, 'ทำงานแทนบล็อก except เสมอ');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (388, 126, 'ทำงานเฉพาะเมื่อเกิด Exception ขึ้น');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (389, 128, 'FileNotFoundError');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (390, 128, 'IOError');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (391, 128, 'FileMissingError');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (392, 128, 'PathNotFoundError');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (393, 130, 'A แล้วตามด้วย B ในบรรทัดใหม่');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (394, 130, 'พิมพ์เฉพาะ A');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (395, 130, 'พิมพ์เฉพาะ B');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (396, 130, 'ไม่แสดงผลอะไรเลย เกิด Error ล่ม');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (405, 131, 'List สามารถแก้ไขข้อมูลได้ (Mutable) แต่ Tuple แก้ไขไม่ได้ (Immutable)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (406, 131, 'Tuple เก็บข้อมูลได้เฉพาะตัวเลข ส่วน List เก็บได้ทุกชนิด');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (407, 131, 'List ใช้เวลาในการเข้าถึงข้อมูลเร็วกว่า Tuple เสมอ');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (408, 131, 'ไม่มีข้อแตกต่างกัน สามารถใช้แทนกันได้ทุกกรณี');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (409, 133, 'append()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (410, 133, 'add()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (411, 133, 'push()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (412, 133, 'insert_last()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (413, 135, 'เครื่องหมายจุลภาค (,)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (414, 135, 'เครื่องหมายอัฒภาค (;)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (415, 135, 'เครื่องหมายมหพภาค (.)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (416, 135, 'เครื่องหมายคัดแย้ม (:)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (417, 136, '[20, 30, 40]');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (418, 136, '[10, 20, 30]');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (419, 136, '[20, 30, 40, 50]');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (420, 136, '[10, 20, 30, 40]');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (421, 138, '[::-1]');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (422, 138, '[1:-1]');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (423, 138, '[:0:-1]');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (424, 138, '[-1:0]');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (425, 140, 'เกิด TypeError เนื่องจาก Tuple ไม่ยอมให้แก้ไขค่า');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (426, 140, 'ค่าใน t จะเปลี่ยนเป็น (5, 2)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (427, 140, 'ค่าใน t จะเปลี่ยนเป็น (5, 1, 2)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (428, 140, 'โปรแกรมทำงานผ่านโดยไม่เกิดอะไรขึ้น');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (437, 141, 'คู่ Key และ Value');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (438, 141, 'ดัชนีและตัวเลขเรียงลำดับ');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (439, 141, 'ตาราง 2 มิติ');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (440, 141, 'ข้อความเดี่ยวเรียงต่อกัน');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (441, 143, 'ไม่มีลำดับและไม่มีสมาชิกซ้ำกัน');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (442, 143, 'เรียงลำดับตามข้อมูลที่ใส่เข้าไปเสมอ');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (443, 143, 'แก้ไขสมาชิกภายหลังไม่ได้เลย');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (444, 143, 'ต้องเก็บข้อมูลประเภทตัวเลขเท่านั้น');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (445, 145, 'discard()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (446, 145, 'remove()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (447, 145, 'delete()');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (449, 147, '&');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (450, 147, '|');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (451, 147, '-');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (452, 147, '^');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (453, 149, 'List');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (454, 149, 'String');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (455, 149, 'Integer');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (456, 149, 'Tuple');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (457, 150, '{1, 2}');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (458, 150, '{3}');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (459, 150, '{4, 5}');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (460, 150, '{1, 2, 3, 4, 5}');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (469, 151, 'a');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (470, 151, 'w');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (471, 151, 'r');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (472, 151, 'x');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (473, 152, 'ระบบจะทำการปิดไฟล์ให้อัตโนมัติเมื่อทำงานเสร็จ');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (474, 152, 'ช่วยให้เขียนไฟล์ได้เร็วกว่าปกติ 2 เท่า');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (475, 152, 'ป้องกันไม่ให้ไฟล์ถูกไวรัสทำลาย');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (476, 152, 'แปลงข้อมูลในไฟล์ให้เป็นรูปแบบ JSON อัตโนมัติ');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (477, 154, 'ข้อมูลเดิมในไฟล์จะถูกลบและแทนที่ด้วยข้อมูลใหม่ทั้งหมด');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (478, 154, 'โปรแกรมจะแจ้งเตือน Error และหยุดทำงานทันที');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (479, 154, 'ระบบจะสร้างไฟล์ใหม่โดยเติมตัวเลขต่อท้ายชื่อไฟล์เดิม');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (480, 154, 'ข้อมูลใหม่จะถูกนำไปเขียนต่อท้ายข้อมูลเดิมอัตโนมัติ');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (481, 157, 'rb');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (482, 157, 'wb+');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (483, 157, 'r');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (484, 157, 'ab');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (485, 158, 'ตัดช่องว่างและตัวอักขระขึ้นบรรทัดใหม่ (\n) ออกจากหัวท้ายข้อความ');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (486, 158, 'แปลงข้อความบรรทัดนั้นให้เป็นตัวพิมพ์ใหญ่ทั้งหมด');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (487, 158, 'นับจำนวนตัวอักษรทั้งหมดในบรรทัดนั้น');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (488, 158, 'เข้ารหัสข้อความก่อนบันทึกลงดิสก์');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (489, 160, 'FileNotFoundError');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (490, 160, 'IOError');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (491, 160, 'PermissionError');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (492, 160, 'ValueError');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (501, 163, 'IndexError');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (502, 163, 'KeyError');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (503, 163, 'ValueError');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (504, 163, 'TypeError');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (505, 164, 'ทำงานเมื่อไม่มี Exception เกิดขึ้นเลยในบล็อก try');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (506, 164, 'ทำงานเสมอเมื่อเกิด Exception เท่านั้น');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (507, 164, 'ทำงานก่อนคำสั่งในบล็อก try เสมอ');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (508, 164, 'ทำงานเมื่อเกิดข้อผิดพลาดรุนแรงระดับระบบ');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (509, 165, 'Exception');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (510, 165, 'BaseClass');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (511, 165, 'ErrorObject');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (512, 165, 'SystemError');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (513, 166, 'ValueError');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (514, 166, 'TypeError');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (515, 166, 'NameError');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (516, 166, 'SyntaxError');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (517, 167, 'ช่วยให้ดักจับและจัดการข้อผิดพลาดแต่ละประเภทได้อย่างแม่นยำ');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (518, 167, 'ทำให้โปรแกรมรันได้เร็วขึ้น 2 เท่า');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (519, 167, 'ข้ามการทำงานของบล็อก finally อัตโนมัติ');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (520, 167, 'ป้องกันไม่ให้เกิด Syntax Error ทุกชนิด');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (521, 168, 'Runtime Error เกิดขึ้นขณะโปรแกรมกำลังทำงาน ส่วน Syntax Error เกิดจากไวยากรณ์ผิดตั้งแต่แรก');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (522, 168, 'Syntax Error แก้ไขไม่ได้ แต่ Runtime Error แก้ไขได้');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (523, 168, 'ทั้งสองประเภทมีความหมายเดียวกัน สามารถใช้แทนกันได้');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (524, 168, 'Runtime Error จะแจ้งเตือนก่อนรันโปรแกรมเสมอ');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (525, 172, 'Class คือพิมพ์เขียว ส่วน Object คือวัตถุจริงที่ถูกสร้างขึ้นจาก Class');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (526, 172, 'Object คือพิมพ์เขียว ส่วน Class คือตัวแปรเก็บข้อมูล');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (527, 172, 'Class และ Object มีความหมายเดียวกัน สามารถใช้แทนกันได้');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (528, 172, 'Class ใช้จัดการไฟล์ ส่วน Object ใช้จัดการหน่วยความจำ');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (529, 173, 'เป็นตัวแทนอ้างอิงถึงตัว Object นั้นๆ เอง');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (530, 173, 'ใช้สำหรับส่งคืนค่าผลลัพธ์ของฟังก์ชัน');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (531, 173, 'ใช้กำหนดประเภทข้อมูลของตัวแปร');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (532, 173, 'เป็นชื่อสงวนสำหรับเรียกใช้งานฟังก์ชันภายนอก');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (533, 175, 'Encapsulation');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (534, 175, 'Inheritance');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (535, 175, 'Polymorphism');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (536, 175, 'Abstraction');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (537, 177, 'Class Attribute แชร์ใช้ร่วมกันทุก Object แต่ Instance Attribute เป็นของเฉพาะแต่ละ Object');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (538, 177, 'Instance Attribute ประกาศนอกคลาส ส่วน Class Attribute ประกาศใน __init__');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (539, 177, 'Class Attribute เปลี่ยนค่าไม่ได้ แต่ Instance Attribute เปลี่ยนค่าได้');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (540, 177, 'ทั้งสองประเภทไม่มีความแตกต่างกันในการใช้งาน');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (541, 178, 'Getter Method');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (542, 178, 'Setter Method');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (543, 178, 'Constructor Method');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (544, 178, 'Destructor Method');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (545, 180, 'ทำให้โค้ดทำงานเร็วขึ้นกว่าการเขียนแบบ Procedural เสมอ');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (546, 180, 'ช่วยให้จัดการและดูแลรักษารหัสโปรแกรมง่ายขึ้น (Maintainability)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (547, 180, 'ส่งเสริมการนำโค้ดกลับมาใช้ใหม่ (Reusability)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (548, 180, 'ปกป้องและควบคุมการเข้าถึงข้อมูลอย่างเป็นระบบ (Data Security)');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (549, 181, 'Inheritance');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (550, 181, 'Encapsulation');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (551, 181, 'Polymorphism');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (552, 181, 'Abstraction');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (553, 183, 'Method Overriding');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (554, 183, 'Method Overloading');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (555, 183, 'Method Encapsulation');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (556, 183, 'Method Abstraction');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (557, 185, 'Polymorphism');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (558, 185, 'Inheritance');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (559, 185, 'Instantiation');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (560, 185, 'Compilation');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (561, 186, 'class Dog(Animal):');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (562, 186, 'class Dog extends Animal:');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (563, 186, 'class Dog inherits Animal:');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (564, 186, 'class Animal -> Dog:');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (565, 188, 'Multiple Inheritance');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (566, 188, 'Multi-level Inheritance');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (567, 188, 'Hierarchical Inheritance');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (568, 188, 'Hybrid Polymorphism');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (569, 189, 'Compilation');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (570, 189, 'Encapsulation');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (571, 189, 'Inheritance');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (572, 189, 'Polymorphism');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (573, 190, 'เพื่อเรียกใช้ Constructor ของคลาสแม่ให้จัดเตรียม Attribute เริ่มต้น');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (574, 190, 'เพื่อลบตัวแปรทั้งหมดในคลาสลูก');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (575, 190, 'เพื่อเปลี่ยนคลาสลูกให้กลายเป็นคลาสแม่');
INSERT INTO public.question_choices (choice_id, question_id, choice_text) VALUES (576, 190, 'เพื่อป้องกันไม่ให้คลาสอื่นนำไปสืบทอดต่อ');


--
-- Data for Name: shop_items; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.shop_items (item_id, name, description, item_type, price, asset_url, preview_image, is_active, effects, type, rarity, preview_data, is_available, created_at, set_key) VALUES (12, 'Heart', '', 'MOUSE_EFFECT', 0, NULL, NULL, 1, '[{"size": 30, "color": "#FF69B4", "visual": "💖", "trigger": "dblclick", "duration": 800}]', 'MOUSE_EFFECT', 'COMMON', '[{"trigger":"dblclick","visual":"💖","color":"#FF69B4","size":30,"duration":800}]', 1, '2026-06-30 18:29:50', NULL);
INSERT INTO public.shop_items (item_id, name, description, item_type, price, asset_url, preview_image, is_active, effects, type, rarity, preview_data, is_available, created_at, set_key) VALUES (41, 'fsdf', '', 'profile_background', 0, '/uploads/1772867494875-72153669.jpg', '', 0, '[]', NULL, NULL, NULL, 0, '2026-08-21 10:00:50.56592', NULL);
INSERT INTO public.shop_items (item_id, name, description, item_type, price, asset_url, preview_image, is_active, effects, type, rarity, preview_data, is_available, created_at, set_key) VALUES (37, '?nasd', '', 'profile_background', 0, '/uploads/1772732995094-745411319.jpg', '', 0, '[]', NULL, NULL, NULL, 0, '2026-08-21 10:00:50.56592', NULL);
INSERT INTO public.shop_items (item_id, name, description, item_type, price, asset_url, preview_image, is_active, effects, type, rarity, preview_data, is_available, created_at, set_key) VALUES (42, 'ffff', '', 'theme', 0, NULL, NULL, 0, '[{"size": 24, "color": "#FF69B4", "visual": "??", "trigger": "click", "duration": 800}]', NULL, NULL, NULL, 0, '2026-08-21 10:00:50.56592', NULL);
INSERT INTO public.shop_items (item_id, name, description, item_type, price, asset_url, preview_image, is_active, effects, type, rarity, preview_data, is_available, created_at, set_key) VALUES (34, 'asd', '', 'theme', 0, NULL, NULL, 0, '[{"size": 24, "color": "#FF69B4", "visual": "??", "trigger": "click", "duration": 800}]', NULL, NULL, NULL, 0, '2026-08-21 10:00:50.56592', NULL);
INSERT INTO public.shop_items (item_id, name, description, item_type, price, asset_url, preview_image, is_active, effects, type, rarity, preview_data, is_available, created_at, set_key) VALUES (35, 'rtt', '', 'theme', 0, NULL, NULL, 0, '[{"size": 24, "color": "#12f32c", "visual": "https://i.pinimg.com/originals/48/49/75/48497592504e248948b39e71c644e26e.jpg", "trigger": "click", "duration": 800}]', NULL, NULL, NULL, 0, '2026-08-21 10:00:50.56592', NULL);
INSERT INTO public.shop_items (item_id, name, description, item_type, price, asset_url, preview_image, is_active, effects, type, rarity, preview_data, is_available, created_at, set_key) VALUES (43, 'ธีมอวกาศ', 'เปลี่ยนพื้นหลังและโทนสีทั้งเว็บเป็นห้วงอวกาศสีม่วงพาสเทล', 'THEME', 120, '/uploads/space-theme.png', NULL, 1, NULL, 'THEME', 'RARE', NULL, 1, '2026-08-21 11:21:45.417828', 'space');
INSERT INTO public.shop_items (item_id, name, description, item_type, price, asset_url, preview_image, is_active, effects, type, rarity, preview_data, is_available, created_at, set_key) VALUES (44, 'กรอบดาวเคราะห์', 'กรอบวงโคจรไล่สีม่วง-ฟ้า พร้อมดาวเคราะห์และดวงดาว', 'PROFILE_FRAME', 80, '/uploads/frame-space.svg', NULL, 1, NULL, 'PROFILE_FRAME', 'RARE', NULL, 1, '2026-08-21 11:21:45.465149', 'space');
INSERT INTO public.shop_items (item_id, name, description, item_type, price, asset_url, preview_image, is_active, effects, type, rarity, preview_data, is_available, created_at, set_key) VALUES (45, 'ฝุ่นดาว', 'คลิกแล้วมีประกายดาวกระจายตามเมาส์', 'MOUSE_EFFECT', 60, '', NULL, 1, '[{"size": 26, "color": "#7c3aed", "visual": "✨", "trigger": "click", "duration": 800}, {"size": 34, "color": "#38bdf8", "visual": "🪐", "trigger": "dblclick", "duration": 1000}]', 'MOUSE_EFFECT', 'RARE', NULL, 1, '2026-08-21 11:21:45.507386', 'space');
INSERT INTO public.shop_items (item_id, name, description, item_type, price, asset_url, preview_image, is_active, effects, type, rarity, preview_data, is_available, created_at, set_key) VALUES (13, 'ธีมซากุระ', 'เปลี่ยนพื้นหลังและโทนสีทั้งเว็บเป็นสวนซากุระสีชมพู', 'THEME', 120, '/uploads/1782844342595-474510254.png', '', 1, NULL, 'THEME', 'RARE', NULL, 1, '2026-06-30 18:32:25', 'sakura');
INSERT INTO public.shop_items (item_id, name, description, item_type, price, asset_url, preview_image, is_active, effects, type, rarity, preview_data, is_available, created_at, set_key) VALUES (46, 'กรอบกลีบซากุระ', 'กรอบวงกลมสีชมพูประดับดอกซากุระและกิ่งไม้', 'PROFILE_FRAME', 80, '/uploads/frame-sakura.svg', NULL, 1, NULL, 'PROFILE_FRAME', 'RARE', NULL, 1, '2026-08-21 11:21:45.606407', 'sakura');
INSERT INTO public.shop_items (item_id, name, description, item_type, price, asset_url, preview_image, is_active, effects, type, rarity, preview_data, is_available, created_at, set_key) VALUES (47, 'กลีบซากุระปลิว', 'คลิกแล้วมีกลีบซากุระร่วงตามเมาส์', 'MOUSE_EFFECT', 60, '', NULL, 1, '[{"size": 26, "color": "#ec4899", "visual": "🌸", "trigger": "click", "duration": 900}, {"size": 38, "color": "#f9a8d4", "visual": "🌸", "trigger": "dblclick", "duration": 1200}]', 'MOUSE_EFFECT', 'RARE', NULL, 1, '2026-08-21 11:21:45.642021', 'sakura');
INSERT INTO public.shop_items (item_id, name, description, item_type, price, asset_url, preview_image, is_active, effects, type, rarity, preview_data, is_available, created_at, set_key) VALUES (38, '?nam', '', 'profile_frame', 0, '/uploads/1772734723648-640372036.png', '', 0, '[]', NULL, NULL, NULL, 0, '2026-08-21 10:00:50.56592', NULL);


--
-- Data for Name: shop_sets; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.shop_sets (set_key, name_th, name_en, description_th, price, is_active, created_at) VALUES ('space', 'เซ็ตธีมอวกาศ', 'Space Set', 'ธีมเว็บลายอวกาศ กรอบโปรไฟล์ดาวเคราะห์ และเคอร์เซอร์ฝุ่นดาว', 200, 1, '2026-08-21 11:21:45.375245');
INSERT INTO public.shop_sets (set_key, name_th, name_en, description_th, price, is_active, created_at) VALUES ('sakura', 'เซ็ตธีมซากุระ', 'Sakura Set', 'ธีมเว็บลายซากุระ กรอบโปรไฟล์กลีบซากุระ และเคอร์เซอร์กลีบปลิว', 200, 1, '2026-08-21 11:21:45.540868');


--
-- Data for Name: survey_questions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.survey_questions (id, title, image, description, question_key, is_active, "order") VALUES (1, 'อยากเรียน Python ไปทำอะไร?', 'survey1.png', 'เลือกเป้าหมายหลัก เราจะใช้แนะนำเนื้อหาที่ตรงกับคุณ', 'goal', 1, 1);
INSERT INTO public.survey_questions (id, title, image, description, question_key, is_active, "order") VALUES (2, 'คุณเรียนรู้ได้ดีที่สุดด้วยวิธีใด?', 'survey2.png', 'เราจะจัดลำดับเนื้อหาให้เหมาะกับวิธีที่คุณถนัด', 'style', 1, 2);
INSERT INTO public.survey_questions (id, title, image, description, question_key, is_active, "order") VALUES (3, 'ตั้งใจจะใช้เวลาเรียนสัปดาห์ละประมาณเท่าไร?', NULL, 'ไม่มีคำตอบผิด ใช้ตั้งเป้าหมายที่ทำได้จริง', 'time', 1, 3);
INSERT INTO public.survey_questions (id, title, image, description, question_key, is_active, "order") VALUES (4, 'คุณเคยเขียนโปรแกรมมาก่อนไหม?', NULL, 'ถ้าเคยมาบ้าง เราจะให้ทำแบบวัดระดับสั้นๆ เพื่อข้ามบทที่คุณรู้อยู่แล้ว', 'experience', 1, 4);
INSERT INTO public.survey_questions (id, title, image, description, question_key, is_active, "order") VALUES (1001, '?????????????????????????????????', 'cat-coding.png', '?????????????????????????????????????????', NULL, 0, 0);
INSERT INTO public.survey_questions (id, title, image, description, question_key, is_active, "order") VALUES (1002, '???????????? Python ?????????', 'cat-mascot.png', '??????????????????????????????????????????????', NULL, 0, 0);
INSERT INTO public.survey_questions (id, title, image, description, question_key, is_active, "order") VALUES (1003, '????????????????', 'cat-logo.png', '???????????????????????????????', NULL, 0, 0);


--
-- Data for Name: survey_options; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.survey_options (id, question_id, option_text, option_description, "order", level_value, option_key) VALUES (1001, 1001, '????????', '?????????????????????????????', 1, NULL, NULL);
INSERT INTO public.survey_options (id, question_id, option_text, option_description, "order", level_value, option_key) VALUES (1002, 1001, '???????', '???????????????????????????????', 2, NULL, NULL);
INSERT INTO public.survey_options (id, question_id, option_text, option_description, "order", level_value, option_key) VALUES (1003, 1001, '??????????', '????????????????????????????', 3, NULL, NULL);
INSERT INTO public.survey_options (id, question_id, option_text, option_description, "order", level_value, option_key) VALUES (1004, 1002, '?????????????', '????????????????????', 1, NULL, NULL);
INSERT INTO public.survey_options (id, question_id, option_text, option_description, "order", level_value, option_key) VALUES (1005, 1002, '???????????????', 'Data Science & Analytics', 2, NULL, NULL);
INSERT INTO public.survey_options (id, question_id, option_text, option_description, "order", level_value, option_key) VALUES (1006, 1002, '????????', 'Game Development', 3, NULL, NULL);
INSERT INTO public.survey_options (id, question_id, option_text, option_description, "order", level_value, option_key) VALUES (1007, 1002, '??????', '????????????????????????????????', 4, NULL, NULL);
INSERT INTO public.survey_options (id, question_id, option_text, option_description, "order", level_value, option_key) VALUES (1, 1, 'พัฒนาเว็บไซต์', 'สร้างเว็บแอปพลิเคชัน', 1, NULL, 'web');
INSERT INTO public.survey_options (id, question_id, option_text, option_description, "order", level_value, option_key) VALUES (2, 1, 'วิเคราะห์ข้อมูล', 'Data Science และการวิเคราะห์', 2, NULL, 'data');
INSERT INTO public.survey_options (id, question_id, option_text, option_description, "order", level_value, option_key) VALUES (3, 1, 'สร้างเกม', 'เขียนเกมและสิ่งที่โต้ตอบได้', 3, NULL, 'game');
INSERT INTO public.survey_options (id, question_id, option_text, option_description, "order", level_value, option_key) VALUES (4, 1, 'เขียนสคริปต์ช่วยงาน', 'ทำงานซ้ำๆ ให้เป็นอัตโนมัติ', 4, NULL, 'automate');
INSERT INTO public.survey_options (id, question_id, option_text, option_description, "order", level_value, option_key) VALUES (5, 1, 'ยังไม่แน่ใจ', 'อยากลองดูก่อนว่าชอบอะไร', 5, NULL, 'general');
INSERT INTO public.survey_options (id, question_id, option_text, option_description, "order", level_value, option_key) VALUES (6, 2, 'ลงมือเขียนโค้ดเลย', 'เรียนจากการฝึกทำจริง', 1, NULL, 'doing');
INSERT INTO public.survey_options (id, question_id, option_text, option_description, "order", level_value, option_key) VALUES (7, 2, 'อ่านคำอธิบายก่อน', 'เข้าใจหลักการแล้วค่อยลงมือ', 2, NULL, 'reading');
INSERT INTO public.survey_options (id, question_id, option_text, option_description, "order", level_value, option_key) VALUES (8, 2, 'ดูตัวอย่างแล้วทำตาม', 'เรียนจากโค้ดตัวอย่างทีละขั้น', 3, NULL, 'example');
INSERT INTO public.survey_options (id, question_id, option_text, option_description, "order", level_value, option_key) VALUES (9, 3, 'ไม่เกิน 1 ชั่วโมง', 'ค่อยเป็นค่อยไป', 1, NULL, 'light');
INSERT INTO public.survey_options (id, question_id, option_text, option_description, "order", level_value, option_key) VALUES (10, 3, '1–3 ชั่วโมง', 'สัปดาห์ละไม่กี่ครั้ง', 2, NULL, 'medium');
INSERT INTO public.survey_options (id, question_id, option_text, option_description, "order", level_value, option_key) VALUES (11, 3, 'มากกว่า 3 ชั่วโมง', 'ตั้งใจเรียนจริงจัง', 3, NULL, 'serious');
INSERT INTO public.survey_options (id, question_id, option_text, option_description, "order", level_value, option_key) VALUES (12, 4, 'ยังไม่เคยเลย', 'เริ่มจากบทแรก', 1, 1, 'none');
INSERT INTO public.survey_options (id, question_id, option_text, option_description, "order", level_value, option_key) VALUES (13, 4, 'เคยเขียนภาษาอื่นมาบ้าง', 'ทำแบบวัดระดับเพื่อข้ามบทพื้นฐาน', 2, 10, 'some');
INSERT INTO public.survey_options (id, question_id, option_text, option_description, "order", level_value, option_key) VALUES (14, 4, 'เขียน Python ได้อยู่แล้ว', 'ทำแบบวัดระดับเพื่อเริ่มที่บทสูงขึ้น', 3, 10, 'python');


--
-- Name: achievements_achievement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.achievements_achievement_id_seq', 20, true);


--
-- Name: advanced_validation_choices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.advanced_validation_choices_id_seq', 40, true);


--
-- Name: advanced_validation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.advanced_validation_id_seq', 10, true);


--
-- Name: arcade_items_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.arcade_items_item_id_seq', 15, true);


--
-- Name: assessment_choices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.assessment_choices_id_seq', 1, true);


--
-- Name: assessment_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.assessment_questions_id_seq', 1, true);


--
-- Name: cosmetics_cosmetic_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cosmetics_cosmetic_id_seq', 5, true);


--
-- Name: exercises_files_file_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.exercises_files_file_id_seq', 5, true);


--
-- Name: lesson_quizzes_quiz_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.lesson_quizzes_quiz_id_seq', 40, true);


--
-- Name: lesson_slides_slide_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.lesson_slides_slide_id_seq', 263, true);


--
-- Name: lessons_lesson_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.lessons_lesson_id_seq', 24, true);


--
-- Name: level_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.level_config_id_seq', 1002, true);


--
-- Name: mini_game_dialogues_dialogue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mini_game_dialogues_dialogue_id_seq', 154, true);


--
-- Name: mini_game_exercises_files_file_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mini_game_exercises_files_file_id_seq', 1, true);


--
-- Name: mini_game_locations_location_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mini_game_locations_location_id_seq', 2, true);


--
-- Name: mini_game_npcs_npc_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mini_game_npcs_npc_id_seq', 2, true);


--
-- Name: modules_module_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.modules_module_id_seq', 9, true);


--
-- Name: music_tracks_track_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.music_tracks_track_id_seq', 1, true);


--
-- Name: problems_problem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.problems_problem_id_seq', 199, true);


--
-- Name: question_choices_choice_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.question_choices_choice_id_seq', 576, true);


--
-- Name: quiz_questions_question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quiz_questions_question_id_seq', 190, true);


--
-- Name: shop_items_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.shop_items_item_id_seq', 47, true);


--
-- Name: survey_options_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.survey_options_id_seq', 1007, true);


--
-- Name: survey_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.survey_questions_id_seq', 1003, true);


--
-- PostgreSQL database dump complete
--


