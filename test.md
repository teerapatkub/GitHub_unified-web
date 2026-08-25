# เฉลยโจทย์ Arcade Battle Royale ทั้งหมด

รวมโจทย์ทั้ง **40 ข้อ** ในคลังของโหมด Arcade พร้อมเฉลย แต่ละข้อระบุโจทย์ (ไทย/อังกฤษ),
โค้ดตั้งต้นที่ผู้เล่นเห็นในเอดิเตอร์, เฉลย, คำใบ้ที่ไอเทม AI Helper เปิดให้ และเทสเคสที่ใช้ตัดสิน

ที่มา: `server/arcadeTaskSeed.js` — แหล่งความจริงเดียวของคลังโจทย์ (`server/db.js` upsert จากไฟล์นี้ทุกครั้งที่บูต)

> ⚠️ ไฟล์นี้คือ**เฉลย** ไม่ควรเผยแพร่ให้ผู้เล่น

## สารบัญ

**ง่าย (Easy)** — 15 ข้อ

- [EASY 1. เลขฟีโบนัชชี (Fibonacci) / Fibonacci Number](#easy-1)
- [EASY 2. ตรวจสอบเลขคู่/เลขคี่ (Even or Odd) / Even or Odd](#easy-2)
- [EASY 3. กลับด้านข้อความ (Reverse String) / Reverse String](#easy-3)
- [EASY 4. ผลรวมของรายการตัวเลข (Sum Array) / Sum of Array](#easy-4)
- [EASY 5. หาค่าสูงสุด (Find Maximum) / Find Maximum](#easy-5)
- [EASY 6. นับจำนวนสระ (Count Vowels) / Count Vowels](#easy-6)
- [EASY 7. แปลงองศาเซลเซียสเป็นฟาเรนไฮต์ (Celsius to Fahrenheit) / Celsius to Fahrenheit](#easy-7)
- [EASY 8. แฟกทอเรียล (Factorial) / Factorial](#easy-8)
- [EASY 9. ตรวจสอบพาลินโดรม (Palindrome Check) / Palindrome Check](#easy-9)
- [EASY 10. กำลังสองของทุกสมาชิก (Square List) / Square List](#easy-10)
- [EASY 11. นับจำนวนคำ (Count Words) / Count Words](#easy-11)
- [EASY 12. ผลรวม 1 ถึง n (Sum To N) / Sum To N](#easy-12)
- [EASY 13. ตัวอักษรพิมพ์ใหญ่ทั้งหมด (To Upper) / To Upper Case](#easy-13)
- [EASY 14. นับเลขคู่ในรายการ (Count Evens) / Count Evens](#easy-14)
- [EASY 15. ค่าเฉลี่ยของรายการ (Average) / Average of List](#easy-15)

**ปานกลาง (Medium)** — 15 ข้อ

- [MEDIUM 1. ตรวจสอบแอนนาแกรม (Anagram Checker) / Anagram Checker](#medium-1)
- [MEDIUM 2. ผลรวมสองจำนวน (Two Sum) / Two Sum](#medium-2)
- [MEDIUM 3. อาร์เรย์ FizzBuzz (FizzBuzz Array) / FizzBuzz Array](#medium-3)
- [MEDIUM 4. ลบตัวเลขซ้ำในรายการ (Remove Duplicates) / Remove Duplicates](#medium-4)
- [MEDIUM 5. รวบรวม 2 อาร์เรย์ที่จัดเรียงแล้ว (Merge Sorted Lists) / Merge Two Sorted Lists](#medium-5)
- [MEDIUM 6. ค้นหาคำที่ยาวที่สุด (Longest Word) / Longest Word](#medium-6)
- [MEDIUM 7. ตรวจสอบจำนวนเฉพาะ (Prime Number Check) / Prime Number Check](#medium-7)
- [MEDIUM 8. ค้นหาแบบทวิภาค (Binary Search) / Binary Search](#medium-8)
- [MEDIUM 9. ตรวจสอบวงเล็บสมบูรณ์ (Valid Parentheses) / Valid Parentheses](#medium-9)
- [MEDIUM 10. คำนวณความถี่ของตัวอักษร (Character Frequency) / Character Frequency](#medium-10)
- [MEDIUM 11. หาตัวที่ปรากฏบ่อยที่สุด (Most Frequent) / Most Frequent Element](#medium-11)
- [MEDIUM 12. สลับตัวพิมพ์ (Swap Case) / Swap Case](#medium-12)
- [MEDIUM 13. รายการซ้อนให้แบนราบ (Flatten List) / Flatten Nested List](#medium-13)
- [MEDIUM 14. ตัวเลขที่หายไป (Missing Number) / Missing Number](#medium-14)
- [MEDIUM 15. นับตัวอักษรที่ไม่ซ้ำ (Count Unique Chars) / Count Unique Characters](#medium-15)

**ยาก (Hard)** — 10 ข้อ

- [HARD 1. ผลรวมย่อยสูงสุด / อัลกอริทึมของ Kadane (Max Subarray Sum) / Maximum Subarray Sum](#hard-1)
- [HARD 2. ความยาวสับสตริงที่ไม่มีอักขระซ้ำ (Longest Substring Without Repeating) / Longest Substring Without Repeating Characters](#hard-2)
- [HARD 3. ระบบจำลองแคช LRU (LRU Cache Simulator) / LRU Cache Simulator](#hard-3)
- [HARD 4. กักเก็บน้ำฝน (Trapping Rain Water) / Trapping Rain Water](#hard-4)
- [HARD 5. รวบรวม K อาร์เรย์ที่เรียงแล้ว (Merge K Sorted Lists) / Merge K Sorted Lists](#hard-5)
- [HARD 6. ราคาหุ้นกำไรสูงสุด (Best Time To Buy) / Best Time To Buy And Sell Stock](#hard-6)
- [HARD 7. จัดกลุ่มคำสลับอักษร (Group Anagrams) / Group Anagrams Count](#hard-7)
- [HARD 8. ผลคูณยกเว้นตัวเอง (Product Except Self) / Product Of Array Except Self](#hard-8)
- [HARD 9. ลำดับต่อเนื่องยาวที่สุด (Longest Consecutive) / Longest Consecutive Sequence](#hard-9)
- [HARD 10. หมุนอาร์เรย์ (Rotate Array) / Rotate Array](#hard-10)

---

# ระดับง่าย (Easy)

<a id="easy-1"></a>

## EASY 1. เลขฟีโบนัชชี (Fibonacci)

**ชื่อภาษาอังกฤษ:** Fibonacci Number  
**ฟังก์ชัน:** `def fib(n)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 30

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน "fib(n)" เพื่อคืนค่าตัวเลขฟีโบนัชชีลำดับที่ n

**โจทย์ (อังกฤษ):**  
Write a function "fib(n)" that returns the n-th Fibonacci number.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def fib(n):
    if n <= 1:
        return n
    # TODO: คืนค่า fib(n-1) บวกกับ fib(n-2)
    return 0
```

**✅ เฉลย:**

```python
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — ฟังก์ชันเรียกตัวเองได้ ลอง fib(n-1) + fib(n-2) — สองบรรทัดแรกที่ให้มาแล้วคือ "จุดหยุด" ถ้าไม่มีมันจะเรียกตัวเองไม่จบ
- EN — A function may call itself: fib(n-1) + fib(n-2). The two lines already given are the stopping point — without them it would recurse forever.

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `5` | `5` |
| 2 | `7` | `13` |
| 3 | `0` | `0` |
| 4 | `1` | `1` |
| 5 | `10` | `55` |

<a id="easy-2"></a>

## EASY 2. ตรวจสอบเลขคู่/เลขคี่ (Even or Odd)

**ชื่อภาษาอังกฤษ:** Even or Odd  
**ฟังก์ชัน:** `def is_even(n)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 17

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน "is_even(n)" เพื่อคืนค่า True หากเป็นเลขคู่ และ False หากเป็นเลขคี่

**โจทย์ (อังกฤษ):**  
Write a function "is_even(n)" returning True if n is even, False otherwise.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def is_even(n):
    # TODO: คืน True ถ้า n หารด้วย 2 แล้วเหลือเศษ 0 (ใช้ n % 2)
    return None
```

**✅ เฉลย:**

```python
def is_even(n):
    return n % 2 == 0
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — % คือเศษจากการหาร n % 2 ได้ 0 เมื่อเป็นเลขคู่ เขียน n % 2 == 0 ตรงๆ ได้ True/False อยู่แล้ว ไม่ต้องใช้ if
- EN — % gives the remainder. n % 2 is 0 for an even number, and n % 2 == 0 is already True or False on its own — no if needed.

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `4` | `true` |
| 2 | `7` | `false` |
| 3 | `0` | `true` |
| 4 | `-2` | `true` |
| 5 | `99` | `false` |

<a id="easy-3"></a>

## EASY 3. กลับด้านข้อความ (Reverse String)

**ชื่อภาษาอังกฤษ:** Reverse String  
**ฟังก์ชัน:** `def reverse_string(s)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 14

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน "reverse_string(s)" เพื่อคืนค่าตัวอักษรเรียงย้อนกลับ

**โจทย์ (อังกฤษ):**  
Write a function "reverse_string(s)" that returns the reversed string.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def reverse_string(s):
    # TODO: คืนสตริงที่กลับด้าน — สไลซ์แบบ [::-1] ทำให้ได้เลย
    return ""
```

**✅ เฉลย:**

```python
def reverse_string(s):
    return s[::-1]
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — สไลซ์เขียนเป็น s[เริ่ม:จบ:ก้าว] ถ้าก้าวเป็น -1 คือเดินถอยหลัง เว้นเริ่มกับจบว่างไว้ก็ได้ทั้งสตริง: s[::-1]
- EN — A slice is s[start:stop:step]. A step of -1 walks backwards, and leaving start and stop empty takes the whole string: s[::-1].

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `"hello"` | `"olleh"` |
| 2 | `"python"` | `"nohtyp"` |
| 3 | `""` | `""` |
| 4 | `"a"` | `"a"` |
| 5 | `"ab cd"` | `"dc ba"` |

<a id="easy-4"></a>

## EASY 4. ผลรวมของรายการตัวเลข (Sum Array)

**ชื่อภาษาอังกฤษ:** Sum of Array  
**ฟังก์ชัน:** `def sum_array(nums)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 10

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน "sum_array(nums)" เพื่อคืนค่าผลรวมของตัวเลขทั้งหมดในอาร์เรย์

**โจทย์ (อังกฤษ):**  
Write a function "sum_array(nums)" that returns the sum of all elements.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def sum_array(nums):
    total = 0
    for n in nums:
        # TODO: บวก n เข้ากับ total
        pass
    return total
```

**✅ เฉลย:**

```python
def sum_array(nums):
    total = 0
    for n in nums:
        total += n
    return total
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — เครื่องหมาย += บวกทับค่าเดิม (x += 1 มีความหมายเท่ากับ x = x + 1) บรรทัดที่บวกต้องอยู่ในลูปจึงจะทำซ้ำทุกตัว ถ้าไปอยู่นอกลูปจะได้แค่ตัวสุดท้าย
- EN — The += operator adds onto what is already there (x += 1 means x = x + 1). The adding line has to sit INSIDE the loop to run for every item; outside it, only the last value counts.

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `[1,2,3,4]` | `10` |
| 2 | `[5,10,15]` | `30` |
| 3 | `[]` | `0` |
| 4 | `[-1,1]` | `0` |
| 5 | `[7]` | `7` |

<a id="easy-5"></a>

## EASY 5. หาค่าสูงสุด (Find Maximum)

**ชื่อภาษาอังกฤษ:** Find Maximum  
**ฟังก์ชัน:** `def find_max(nums)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 20

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน "find_max(nums)" คืนค่าตัวเลขที่มีค่ามากที่สุดในรายการ

**โจทย์ (อังกฤษ):**  
Write a function "find_max(nums)" returning the largest number.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def find_max(nums):
    best = nums[0]
    for n in nums:
        # TODO: ถ้า n มากกว่า best ให้เปลี่ยน best เป็น n
        pass
    return best
```

**✅ เฉลย:**

```python
def find_max(nums):
    best = nums[0]
    for n in nums:
        if n > best:
            best = n
    return best
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — เทียบทีละตัวกับตัวที่ดีที่สุดที่เจอมา ถ้า n > best ก็เปลี่ยน best เป็น n เริ่ม best จากสมาชิกตัวแรกไว้แล้ว จึงไม่ต้องกลัวลิสต์ค่าลบ
- EN — Compare each item against the best so far: if n > best, make best equal n. best already starts at the first element, so negative numbers are handled.

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `[3,9,2,5]` | `9` |
| 2 | `[-1,-5,-2]` | `-1` |
| 3 | `[0]` | `0` |
| 4 | `[2,2,2]` | `2` |
| 5 | `[-10,5]` | `5` |

<a id="easy-6"></a>

## EASY 6. นับจำนวนสระ (Count Vowels)

**ชื่อภาษาอังกฤษ:** Count Vowels  
**ฟังก์ชัน:** `def count_vowels(s)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 36

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน "count_vowels(s)" คืนค่าจำนวนสระ (a, e, i, o, u) ในข้อความ

**โจทย์ (อังกฤษ):**  
Write a function "count_vowels(s)" returning the count of vowels.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def count_vowels(s):
    vowels = "aeiou"
    count = 0
    for char in s:
        # TODO: ถ้า char.lower() อยู่ใน vowels ให้ count เพิ่มขึ้น 1
        pass
    return count
```

**✅ เฉลย:**

```python
def count_vowels(s):
    vowels = "aeiou"
    count = 0
    for char in s:
        if char.lower() in vowels:
            count += 1
    return count
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — in ใช้ถามว่ามีอยู่ในสตริงไหม เช่น char in vowels และ .lower() ทำให้ตัวพิมพ์ใหญ่นับด้วย ไม่งั้น "A" จะหลุด
- EN — in asks whether something is present: char in vowels. Use .lower() so capitals count too, otherwise "A" slips through.

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `"hello world"` | `3` |
| 2 | `"arcade"` | `3` |
| 3 | `""` | `0` |
| 4 | `"xyz"` | `0` |
| 5 | `"AEIOU"` | `5` |

<a id="easy-7"></a>

## EASY 7. แปลงองศาเซลเซียสเป็นฟาเรนไฮต์ (Celsius to Fahrenheit)

**ชื่อภาษาอังกฤษ:** Celsius to Fahrenheit  
**ฟังก์ชัน:** `def c_to_f(c)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 23

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน "c_to_f(c)" เพื่อแปลงอุณหภูมิจาก C เป็น F ("(c * 9/5) + 32")

**โจทย์ (อังกฤษ):**  
Write a function "c_to_f(c)" to convert Celsius to Fahrenheit.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def c_to_f(c):
    # TODO: สูตรคือ c คูณ 9 หาร 5 แล้วบวก 32
    return 0
```

**✅ เฉลย:**

```python
def c_to_f(c):
    return (c * 9 / 5) + 32
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — ใส่วงเล็บให้ชัด (c * 9/5) + 32 — ใน Python คูณและหารทำก่อนบวก แต่การใส่วงเล็บช่วยให้อ่านง่ายและไม่พลาด
- EN — Write it as (c * 9/5) + 32. Python does multiplication and division before addition anyway, but the parentheses make it hard to get wrong.

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `0` | `32` |
| 2 | `100` | `212` |
| 3 | `10` | `50` |
| 4 | `-40` | `-40` |
| 5 | `20` | `68` |

<a id="easy-8"></a>

## EASY 8. แฟกทอเรียล (Factorial)

**ชื่อภาษาอังกฤษ:** Factorial  
**ฟังก์ชัน:** `def factorial(n)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 27

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน "factorial(n)" คืนค่าผลคูณ n! (เช่น 5! = 120)

**โจทย์ (อังกฤษ):**  
Write a function "factorial(n)" returning n!.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def factorial(n):
    if n <= 1:
        return 1
    # TODO: คืนค่า n คูณกับ factorial(n - 1)
    return 0
```

**✅ เฉลย:**

```python
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — n! คือ n คูณกับ (n-1)! ให้เรียกตัวเองแบบ n * factorial(n - 1) บรรทัด if ที่ให้มาคือจุดหยุด
- EN — n! is n times (n-1)!, so call yourself: n * factorial(n - 1). The if already given is the stopping point.

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `5` | `120` |
| 2 | `3` | `6` |
| 3 | `0` | `1` |
| 4 | `1` | `1` |
| 5 | `6` | `720` |

<a id="easy-9"></a>

## EASY 9. ตรวจสอบพาลินโดรม (Palindrome Check)

**ชื่อภาษาอังกฤษ:** Palindrome Check  
**ฟังก์ชัน:** `def is_palindrome(s)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 19

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน "is_palindrome(s)" คืนค่า True หากคำอ่านจากหน้าไปหลังและหลังมาหน้าเหมือนกัน

**โจทย์ (อังกฤษ):**  
Write a function "is_palindrome(s)" returning True if string is a palindrome.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def is_palindrome(s):
    c = s.lower().replace(" ", "")
    # TODO: คืน True ถ้า c เท่ากับ c ที่กลับด้าน (c[::-1])
    return None
```

**✅ เฉลย:**

```python
def is_palindrome(s):
    c = s.lower().replace(" ", "")
    return c == c[::-1]
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — เทียบสตริงเดิมกับตัวที่กลับด้าน c == c[::-1] บรรทัดแรกจัดการตัวพิมพ์และช่องว่างให้แล้ว จึงเทียบ c ไม่ใช่ s
- EN — Compare the string with its reverse: c == c[::-1]. The first line already stripped case and spaces, so compare c, not s.

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `"racecar"` | `true` |
| 2 | `"python"` | `false` |
| 3 | `""` | `true` |
| 4 | `"a"` | `true` |
| 5 | `"never odd or even"` | `true` |

<a id="easy-10"></a>

## EASY 10. กำลังสองของทุกสมาชิก (Square List)

**ชื่อภาษาอังกฤษ:** Square List  
**ฟังก์ชัน:** `def square_list(nums)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 18

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน "square_list(nums)" คืนค่าอาร์เรย์ตัวเลขที่ยกกำลังสองทุกตัว

**โจทย์ (อังกฤษ):**  
Write a function "square_list(nums)" returning a list of squared numbers.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def square_list(nums):
    out = []
    for x in nums:
        # TODO: เพิ่มค่า x ยกกำลังสอง (x ** 2) เข้าไปใน out
        pass
    return out
```

**✅ เฉลย:**

```python
def square_list(nums):
    out = []
    for x in nums:
        out.append(x ** 2)
    return out
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — ยกกำลังใช้ ** ดังนั้น x ** 2 คือ x กำลังสอง แล้วเก็บเข้าลิสต์ด้วย out.append(...)
- EN — Exponentiation is **, so x ** 2 squares x. Collect it with out.append(...).

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `[1,2,3]` | `[1,4,9]` |
| 2 | `[]` | `[]` |
| 3 | `[0]` | `[0]` |
| 4 | `[-2,5]` | `[4,25]` |

<a id="easy-11"></a>

## EASY 11. นับจำนวนคำ (Count Words)

**ชื่อภาษาอังกฤษ:** Count Words  
**ฟังก์ชัน:** `def count_words(s)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 21

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน `count_words(s)` คืนค่าจำนวนคำในประโยค (คั่นด้วยช่องว่าง)

**โจทย์ (อังกฤษ):**  
Write a function `count_words(s)` returning the number of words in a sentence.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def count_words(s):
    # TODO: แยกคำด้วย s.split() แล้วนับจำนวนด้วย len()
    return -1
```

**✅ เฉลย:**

```python
def count_words(s):
    return len(s.split())
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — s.split() ตัดคำด้วยช่องว่างให้เป็นลิสต์ แล้ว len() นับจำนวนสมาชิก ต่อกันได้เลย: len(s.split())
- EN — s.split() cuts the text into a list on whitespace, and len() counts a list's items. Chain them: len(s.split()).

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `"hello world"` | `2` |
| 2 | `""` | `0` |
| 3 | `"one"` | `1` |
| 4 | `"a b c d"` | `4` |
| 5 | `"  spaced   out  "` | `2` |

<a id="easy-12"></a>

## EASY 12. ผลรวม 1 ถึง n (Sum To N)

**ชื่อภาษาอังกฤษ:** Sum To N  
**ฟังก์ชัน:** `def sum_to_n(n)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 10

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน `sum_to_n(n)` คืนค่าผลรวมของเลข 1 ถึง n

**โจทย์ (อังกฤษ):**  
Write a function `sum_to_n(n)` returning the sum of integers from 1 to n.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def sum_to_n(n):
    if n <= 0:
        return 0
    total = 0
    for i in range(1, n + 1):
        # TODO: บวก i เข้ากับ total
        pass
    return total
```

**✅ เฉลย:**

```python
def sum_to_n(n):
    if n <= 0:
        return 0
    total = 0
    for i in range(1, n + 1):
        total += i
    return total
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — range(1, n + 1) ให้ 1 ถึง n — ต้อง +1 เพราะ range ไม่รวมตัวสุดท้าย แล้วบวกเข้า total ในลูป
- EN — range(1, n + 1) yields 1 through n — the +1 matters because range excludes its end value. Add each i into total inside the loop.

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `5` | `15` |
| 2 | `1` | `1` |
| 3 | `0` | `0` |
| 4 | `10` | `55` |
| 5 | `100` | `5050` |

<a id="easy-13"></a>

## EASY 13. ตัวอักษรพิมพ์ใหญ่ทั้งหมด (To Upper)

**ชื่อภาษาอังกฤษ:** To Upper Case  
**ฟังก์ชัน:** `def to_upper(s)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 16

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน `to_upper(s)` แปลงข้อความเป็นตัวพิมพ์ใหญ่ทั้งหมด

**โจทย์ (อังกฤษ):**  
Write a function `to_upper(s)` converting text to upper case.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def to_upper(s):
    # TODO: คืนสตริงตัวพิมพ์ใหญ่ทั้งหมด — สตริงมีเมธอด .upper()
    return ""
```

**✅ เฉลย:**

```python
def to_upper(s):
    return s.upper()
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — สตริงมีเมธอด .upper() คืนสตริงใหม่เป็นตัวพิมพ์ใหญ่ (ไม่ได้แก้ตัวเดิม) จึงต้อง return ค่าที่มันคืนมา
- EN — Strings have .upper(), which returns a NEW uppercase string rather than changing the original — so return what it gives back.

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `"abc"` | `"ABC"` |
| 2 | `""` | `""` |
| 3 | `"MiXeD"` | `"MIXED"` |
| 4 | `"a1b2"` | `"A1B2"` |
| 5 | `"hello world"` | `"HELLO WORLD"` |

<a id="easy-14"></a>

## EASY 14. นับเลขคู่ในรายการ (Count Evens)

**ชื่อภาษาอังกฤษ:** Count Evens  
**ฟังก์ชัน:** `def count_evens(nums)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 24

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน `count_evens(nums)` คืนค่าจำนวนเลขคู่ในรายการ

**โจทย์ (อังกฤษ):**  
Write a function `count_evens(nums)` returning how many even numbers are in the list.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def count_evens(nums):
    count = 0
    for n in nums:
        # TODO: ถ้า n เป็นเลขคู่ (n % 2 == 0) ให้ count เพิ่มขึ้น 1
        pass
    return count
```

**✅ เฉลย:**

```python
def count_evens(nums):
    count = 0
    for n in nums:
        if n % 2 == 0:
            count += 1
    return count
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — รวมสองแนวคิดเข้าด้วยกัน: ตรวจเลขคู่ด้วยเศษจากการหาร n % 2 == 0 แล้วเพิ่มตัวนับขึ้นหนึ่งด้วย += เมื่อเงื่อนไขเป็นจริงเท่านั้น
- EN — Two ideas combined: test evenness with the remainder, n % 2 == 0, then bump the counter by one with += only when that holds.

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `[1,2,3,4]` | `2` |
| 2 | `[]` | `0` |
| 3 | `[1,3,5]` | `0` |
| 4 | `[2,4,6]` | `3` |
| 5 | `[0,-2,7]` | `2` |

<a id="easy-15"></a>

## EASY 15. ค่าเฉลี่ยของรายการ (Average)

**ชื่อภาษาอังกฤษ:** Average of List  
**ฟังก์ชัน:** `def average(nums)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 28

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน `average(nums)` คืนค่าเฉลี่ยของตัวเลขในรายการ (รายการว่างคืน 0)

**โจทย์ (อังกฤษ):**  
Write a function `average(nums)` returning the mean of the list (0 for an empty list).

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def average(nums):
    if not nums:
        return 0
    # TODO: คืนผลรวม sum(nums) หารด้วยจำนวนสมาชิก len(nums)
    return -1
```

**✅ เฉลย:**

```python
def average(nums):
    if not nums:
        return 0
    return sum(nums) / len(nums)
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — sum(nums) / len(nums) — ใช้ / (ได้ทศนิยม) ไม่ใช่ // (ปัดเศษทิ้ง) บรรทัด if ที่ให้มากันหารด้วยศูนย์ไว้แล้ว
- EN — sum(nums) / len(nums). Use / for a real decimal, not // which floors it. The if already guards against dividing by zero.

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `[2,4]` | `3` |
| 2 | `[]` | `0` |
| 3 | `[5]` | `5` |
| 4 | `[1,2,3,4]` | `2.5` |
| 5 | `[-2,2]` | `0` |

---

# ระดับปานกลาง (Medium)

<a id="medium-1"></a>

## MEDIUM 1. ตรวจสอบแอนนาแกรม (Anagram Checker)

**ชื่อภาษาอังกฤษ:** Anagram Checker  
**ฟังก์ชัน:** `def is_anagram(s, t)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 29

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน "is_anagram(s, t)" เพื่อตรวจสอบว่าข้อความสองชุดสลับตัวอักษรกันหรือไม่

**โจทย์ (อังกฤษ):**  
Write a function "is_anagram(s, t)" to check if two strings are anagrams.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def is_anagram(s, t):
    # TODO: สองคำเป็นอนาแกรมกันเมื่อเรียงตัวอักษรแล้วเหมือนกัน — ใช้ sorted()
    return None
```

**✅ เฉลย:**

```python
def is_anagram(s, t):
    return sorted(s) == sorted(t)
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — sorted() คืนลิสต์ตัวอักษรที่เรียงแล้ว ถ้าสองคำใช้ตัวอักษรชุดเดียวกัน ผลเรียงจะเท่ากันเสมอ: sorted(s) == sorted(t)
- EN — sorted() returns the letters in order, so two words built from the same letters always sort identically: sorted(s) == sorted(t).

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `"anagram", "nagaram"` | `true` |
| 2 | `"rat", "car"` | `false` |
| 3 | `"", ""` | `true` |
| 4 | `"a", "a"` | `true` |
| 5 | `"ab", "ba"` | `true` |

<a id="medium-2"></a>

## MEDIUM 2. ผลรวมสองจำนวน (Two Sum)

**ชื่อภาษาอังกฤษ:** Two Sum  
**ฟังก์ชัน:** `def two_sum(nums, target)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 38

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน "two_sum(nums, target)" คืนค่าตำแหน่งดรรชนีของตัวเลข 2 ตัวที่บวกกันได้เท่ากับเป้าหมาย

**โจทย์ (อังกฤษ):**  
Write a function "two_sum(nums, target)" returning indices of 2 numbers summing to target.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        # TODO: ถ้า diff เคยเจอแล้วใน seen ให้คืน [seen[diff], i]
        seen[num] = i
```

**✅ เฉลย:**

```python
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — เก็บตัวที่เคยเจอไว้ใน dict แล้วถามว่า "ตัวที่ต้องการอีกครึ่ง (diff) เคยผ่านมาไหม" ถ้าเคย ตำแหน่งของมันอยู่ใน seen[diff] แล้ว วิธีนี้วนรอบเดียวจบ
- EN — Remember what you have seen in a dict, then ask whether the other half (diff) came past earlier. If it did, its index is already in seen[diff] — one pass is enough.

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `[2,7,11,15], 9` | `[0,1]` |
| 2 | `[3,2,4], 6` | `[1,2]` |
| 3 | `[3,3], 6` | `[0,1]` |
| 4 | `[1,5,3], 8` | `[1,2]` |

<a id="medium-3"></a>

## MEDIUM 3. อาร์เรย์ FizzBuzz (FizzBuzz Array)

**ชื่อภาษาอังกฤษ:** FizzBuzz Array  
**ฟังก์ชัน:** `def fizz_buzz(n)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 66

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน "fizz_buzz(n)" คืนค่ารายการคำว่า "Fizz", "Buzz", "FizzBuzz" หรือตัวเลข ตั้งแต่ 1 ถึง n

**โจทย์ (อังกฤษ):**  
Write a function "fizz_buzz(n)" returning FizzBuzz string list from 1 to n.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def fizz_buzz(n):
    res = []
    for i in range(1, n + 1):
        if i % 15 == 0:
            res.append("FizzBuzz")
        else:
            # TODO: เพิ่มเงื่อนไข หาร 3 ลงตัว -> "Fizz", หาร 5 ลงตัว -> "Buzz"
            res.append(str(i))
    return res
```

**✅ เฉลย:**

```python
def fizz_buzz(n):
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
    return res
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — ลำดับเงื่อนไขสำคัญมาก ต้องเช็คหาร 15 ก่อน (ให้มาแล้ว) จากนั้น 3 แล้ว 5 ใช้ elif ต่อกัน ถ้าสลับลำดับ 15 จะถูกจับเป็น Fizz
- EN — Order matters: 15 must be tested first (already given), then 3, then 5, chained with elif. Reversed, multiples of 15 would come out as Fizz.

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `5` | `["1","2","Fizz","4","Buzz"]` |
| 2 | `1` | `["1"]` |
| 3 | `3` | `["1","2","Fizz"]` |
| 4 | `15` | `["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]` |

<a id="medium-4"></a>

## MEDIUM 4. ลบตัวเลขซ้ำในรายการ (Remove Duplicates)

**ชื่อภาษาอังกฤษ:** Remove Duplicates  
**ฟังก์ชัน:** `def remove_duplicates(nums)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 33

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน "remove_duplicates(nums)" เพื่อลบตัวเลขซ้ำและคืนค่ารายการตัวเลขที่ไม่ซ้ำโดยคงลำดับเดิมไว้

**โจทย์ (อังกฤษ):**  
Write a function "remove_duplicates(nums)" returning list with duplicates removed preserving order.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def remove_duplicates(nums):
    res = []
    for num in nums:
        # TODO: เพิ่ม num เข้า res เฉพาะตอนที่ num ยังไม่มีอยู่ใน res
        pass
    return res
```

**✅ เฉลย:**

```python
def remove_duplicates(nums):
    res = []
    for num in nums:
        if num not in res:
            res.append(num)
    return res
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — not in ถามว่ายังไม่มีอยู่ใช่ไหม — if num not in res แล้วค่อย append วิธีนี้รักษาลำดับเดิมไว้ (set() เร็วกว่าแต่ลำดับหาย)
- EN — not in asks whether something is absent: if num not in res, then append. This keeps the original order — set() is faster but loses it.

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `[1,2,2,3,1]` | `[1,2,3]` |
| 2 | `[]` | `[]` |
| 3 | `[1,1,1]` | `[1]` |
| 4 | `[5,4,5,4,3]` | `[5,4,3]` |

<a id="medium-5"></a>

## MEDIUM 5. รวบรวม 2 อาร์เรย์ที่จัดเรียงแล้ว (Merge Sorted Lists)

**ชื่อภาษาอังกฤษ:** Merge Two Sorted Lists  
**ฟังก์ชัน:** `def merge_lists(l1, l2)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 22

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน "merge_lists(l1, l2)" เพื่อรวม 2 อาร์เรย์ที่จัดเรียงแล้วให้กลายเป็นอาร์เรย์ที่เรียงจากน้อยไปมาก

**โจทย์ (อังกฤษ):**  
Write a function "merge_lists(l1, l2)" merging two sorted arrays.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def merge_lists(l1, l2):
    # TODO: รวมสองลิสต์เข้าด้วยกัน (l1 + l2) แล้วเรียงด้วย sorted()
    return [-1]
```

**✅ เฉลย:**

```python
def merge_lists(l1, l2):
    return sorted(l1 + l2)
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — + ต่อลิสต์เข้าด้วยกัน แล้ว sorted() เรียงทั้งก้อน: sorted(l1 + l2) ไม่ต้องเขียนการรวมแบบเทียบทีละคู่เอง
- EN — + joins two lists and sorted() orders the result: sorted(l1 + l2). No need to merge them pairwise by hand.

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `[1,3,5], [2,4,6]` | `[1,2,3,4,5,6]` |
| 2 | `[], []` | `[]` |
| 3 | `[1], []` | `[1]` |
| 4 | `[2,2], [1,3]` | `[1,2,2,3]` |

<a id="medium-6"></a>

## MEDIUM 6. ค้นหาคำที่ยาวที่สุด (Longest Word)

**ชื่อภาษาอังกฤษ:** Longest Word  
**ฟังก์ชัน:** `def longest_word(sentence)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 30

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน "longest_word(sentence)" คืนค่าคำที่มีความยาวมากที่สุดในประโยค

**โจทย์ (อังกฤษ):**  
Write a function "longest_word(sentence)" returning the longest word in a string.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def longest_word(sentence):
    words = sentence.split()
    if not words:
        return ""
    best = words[0]
    for w in words:
        # TODO: ถ้า w ยาวกว่า best ให้เปลี่ยน best เป็น w
        pass
    return best
```

**✅ เฉลย:**

```python
def longest_word(sentence):
    words = sentence.split()
    if not words:
        return ""
    best = words[0]
    for w in words:
        if len(w) > len(best):
            best = w
    return best
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — เทียบ "ความยาว" ไม่ใช่ตัวอักษร จึงต้องใช้ len(w) > len(best) ถ้าเขียน w > best จะกลายเป็นเทียบตามลำดับตัวอักษร
- EN — Compare LENGTHS, not the words: len(w) > len(best). Writing w > best would compare them alphabetically instead.

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `"The quick brown fox jumps"` | `"quick"` |
| 2 | `"hello"` | `"hello"` |
| 3 | `"a bb ccc"` | `"ccc"` |
| 4 | `""` | `""` |

<a id="medium-7"></a>

## MEDIUM 7. ตรวจสอบจำนวนเฉพาะ (Prime Number Check)

**ชื่อภาษาอังกฤษ:** Prime Number Check  
**ฟังก์ชัน:** `def is_prime(n)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 14

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน "is_prime(n)" เพื่อตรวจสอบว่า n เป็นจำนวนเฉพาะหรือไม่

**โจทย์ (อังกฤษ):**  
Write a function "is_prime(n)" returning True if n is a prime number.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def is_prime(n):
    if n <= 1:
        return False
    for i in range(2, int(n ** 0.5) + 1):
        # TODO: ถ้า n หารด้วย i ลงตัว แปลว่าไม่ใช่จำนวนเฉพาะ ให้คืน False
        pass
    return True
```

**✅ เฉลย:**

```python
def is_prime(n):
    if n <= 1:
        return False
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            return False
    return True
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — ถ้าเจอตัวหารลงตัวแม้ตัวเดียวก็จบแล้ว return False ได้ทันที ไม่ต้องวนต่อ — ลูปที่ให้มาหยุดที่รากที่สองเพราะตัวหารที่ใหญ่กว่านั้นจับคู่กับตัวที่เล็กกว่าซึ่งตรวจไปแล้ว
- EN — One divisor is enough to decide: return False immediately, no need to finish the loop. The given range stops at the square root because any larger divisor pairs with a smaller one already checked.

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `11` | `true` |
| 2 | `4` | `false` |
| 3 | `1` | `false` |
| 4 | `2` | `true` |
| 5 | `97` | `true` |

<a id="medium-8"></a>

## MEDIUM 8. ค้นหาแบบทวิภาค (Binary Search)

**ชื่อภาษาอังกฤษ:** Binary Search  
**ฟังก์ชัน:** `def binary_search(nums, target)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 54

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน "binary_search(nums, target)" เพื่อหาตำแหน่งดรรชนีของ target ในอาร์เรย์ที่เรียงแล้ว (หากไม่พบคืนค่า -1)

**โจทย์ (อังกฤษ):**  
Write a function "binary_search(nums, target)" returning target index or -1.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def binary_search(nums, target):
    low, high = 0, len(nums) - 1
    while low <= high:
        mid = (low + high) // 2
        if nums[mid] == target:
            return mid
        # TODO: แทนที่ break ข้างล่างด้วยการขยับขอบเขตการค้นหา
        #       ถ้า nums[mid] น้อยกว่า target ให้ low = mid + 1 ถ้าไม่ใช่ ให้ high = mid - 1
        break
    return -1
```

**✅ เฉลย:**

```python
def binary_search(nums, target):
    low, high = 0, len(nums) - 1
    while low <= high:
        mid = (low + high) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — ลบ break ออกแล้วขยับขอบเขตแทน ถ้าค่ากลางน้อยเกินไปคำตอบอยู่ครึ่งขวา ให้ low ขยับไปถัดจาก mid ถ้ามากเกินไปคำตอบอยู่ครึ่งซ้าย ให้ high ถอยมาก่อน mid — ต้องขยับให้พ้น mid ไม่งั้นช่วงไม่เคยแคบลงและลูปวนไม่จบ
- EN — Replace the break by moving a bound. Too small means the answer is in the right half, so low moves past mid; too large means the left half, so high pulls back before mid. It must move PAST mid, or the range never narrows and the loop never ends.

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `[1,3,5,7,9], 7` | `3` |
| 2 | `[1,3,5], 2` | `-1` |
| 3 | `[1], 1` | `0` |
| 4 | `[], 5` | `-1` |
| 5 | `[1,2,3,4,5], 1` | `0` |

<a id="medium-9"></a>

## MEDIUM 9. ตรวจสอบวงเล็บสมบูรณ์ (Valid Parentheses)

**ชื่อภาษาอังกฤษ:** Valid Parentheses  
**ฟังก์ชัน:** `def is_valid_parentheses(s)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 40

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน "is_valid_parentheses(s)" ตรวจสอบว่าวงเล็บ (), [], {} เปิดและปิดถูกคู่และถูกลำดับหรือไม่

**โจทย์ (อังกฤษ):**  
Write a function "is_valid_parentheses(s)" validating matching brackets (), [], {}.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def is_valid_parentheses(s):
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
    return False
```

**✅ เฉลย:**

```python
def is_valid_parentheses(s):
    stack = []
    mapping = {")": "(", "]": "[", "}": "{"}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else "#"
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — stack คือกองที่หยิบตัวบนสุดออกก่อน วงเล็บปิดต้องคู่กับตัวที่เพิ่งเปิดล่าสุด ถ้า mapping[char] != top ก็ผิดคู่ และจบแล้ว stack ต้องว่าง จึงคืน not stack
- EN — A stack pops the most recent item first, and a closer must match the newest opener — if mapping[char] != top it is mismatched. At the end an empty stack means every opener found its pair, and `not` on an empty list is already True.

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `"()[]{}"` | `true` |
| 2 | `"(]"` | `false` |
| 3 | `""` | `true` |
| 4 | `"([{}])"` | `true` |
| 5 | `"("` | `false` |

<a id="medium-10"></a>

## MEDIUM 10. คำนวณความถี่ของตัวอักษร (Character Frequency)

**ชื่อภาษาอังกฤษ:** Character Frequency  
**ฟังก์ชัน:** `def char_frequency(s)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 34

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน "char_frequency(s)" คืนค่าดิกชันนารีนับจำนวนตัวอักษรแต่ละตัวในสเตรนจ์

**โจทย์ (อังกฤษ):**  
Write a function "char_frequency(s)" returning a dictionary of character counts.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def char_frequency(s):
    freq = {}
    for char in s:
        # TODO: นับ char เพิ่มอีก 1 — freq.get(char, 0) ช่วยกรณีที่ยังไม่เคยเจอ
        pass
    return freq
```

**✅ เฉลย:**

```python
def char_frequency(s):
    freq = {}
    for char in s:
        freq[char] = freq.get(char, 0) + 1
    return freq
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — dict มีเมธอด .get(คีย์, ค่าสำรอง) ที่คืนค่าสำรองเมื่อยังไม่มีคีย์นั้น ถ้าให้ค่าสำรองเป็น 0 ก็บวกหนึ่งทับได้ทันทีในบรรทัดเดียว ไม่ต้องเขียน if แยกกรณีตัวที่เจอครั้งแรก
- EN — A dict has .get(key, fallback), which returns the fallback when the key is absent. With 0 as the fallback you can add one straight onto it in a single line — no if for the first occurrence.

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `"aba"` | `{"a":2,"b":1}` |
| 2 | `""` | `{}` |
| 3 | `"x"` | `{"x":1}` |
| 4 | `"aab"` | `{"a":2,"b":1}` |

<a id="medium-11"></a>

## MEDIUM 11. หาตัวที่ปรากฏบ่อยที่สุด (Most Frequent)

**ชื่อภาษาอังกฤษ:** Most Frequent Element  
**ฟังก์ชัน:** `def most_frequent(nums)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 40

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน `most_frequent(nums)` คืนค่าตัวเลขที่ปรากฏบ่อยที่สุด (ถ้าเท่ากันให้คืนตัวที่เจอก่อน)

**โจทย์ (อังกฤษ):**  
Write a function `most_frequent(nums)` returning the most common value (earliest on a tie).

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def most_frequent(nums):
    best = None
    best_count = 0
    for n in nums:
        c = nums.count(n)
        # TODO: ถ้า c มากกว่า best_count ให้ best = n และ best_count = c
        pass
    return best
```

**✅ เฉลย:**

```python
def most_frequent(nums):
    best = None
    best_count = 0
    for n in nums:
        c = nums.count(n)
        if c > best_count:
            best = n
            best_count = c
    return best
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — nums.count(n) นับจำนวนครั้งที่ n ปรากฏ (ให้มาแล้ว) เหลือแค่เก็บตัวที่นับได้มากสุด อัปเดตทั้ง best และ best_count พร้อมกัน ไม่งั้นการเทียบครั้งต่อไปจะเพี้ยน
- EN — nums.count(n) counts occurrences (already given). You only need to keep the highest — update best AND best_count together, or the next comparison is wrong.

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `[1,2,2,3]` | `2` |
| 2 | `[4]` | `4` |
| 3 | `[1,1,2,2]` | `1` |
| 4 | `[5,6,6,6,5]` | `6` |
| 5 | `[9,8,8]` | `8` |

<a id="medium-12"></a>

## MEDIUM 12. สลับตัวพิมพ์ (Swap Case)

**ชื่อภาษาอังกฤษ:** Swap Case  
**ฟังก์ชัน:** `def swap_case(s)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 19

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน `swap_case(s)` สลับตัวพิมพ์เล็กเป็นใหญ่และใหญ่เป็นเล็ก

**โจทย์ (อังกฤษ):**  
Write a function `swap_case(s)` swapping upper and lower case.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def swap_case(s):
    # TODO: สลับตัวพิมพ์เล็ก/ใหญ่ — สตริงมีเมธอด .swapcase()
    return ""
```

**✅ เฉลย:**

```python
def swap_case(s):
    return s.swapcase()
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — Python มี .swapcase() ให้อยู่แล้ว สลับพิมพ์เล็กเป็นใหญ่และใหญ่เป็นเล็กในครั้งเดียว ไม่ต้องวนทีละตัว
- EN — Python already has .swapcase(), which flips lower to upper and upper to lower in one go — no loop required.

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `"AbC"` | `"aBc"` |
| 2 | `""` | `""` |
| 3 | `"abc"` | `"ABC"` |
| 4 | `"A1b"` | `"a1B"` |
| 5 | `"Hello World"` | `"hELLO wORLD"` |

<a id="medium-13"></a>

## MEDIUM 13. รายการซ้อนให้แบนราบ (Flatten List)

**ชื่อภาษาอังกฤษ:** Flatten Nested List  
**ฟังก์ชัน:** `def flatten(lists)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 15

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน `flatten(lists)` รวมรายการซ้อนชั้นเดียวให้เป็นรายการเดียว

**โจทย์ (อังกฤษ):**  
Write a function `flatten(lists)` flattening a list of lists by one level.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def flatten(lists):
    out = []
    for sub in lists:
        # TODO: เอาสมาชิกทุกตัวใน sub ใส่ลงใน out
        pass
    return out
```

**✅ เฉลย:**

```python
def flatten(lists):
    out = []
    for sub in lists:
        out.extend(sub)
    return out
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — ลิสต์มีเมธอด .extend() ที่เอา "สมาชิกทุกตัว" ของอีกลิสต์มาต่อท้าย ต่างจาก .append() ที่จะยัดลิสต์ทั้งก้อนลงไปเป็นสมาชิกตัวเดียว
- EN — Lists have .extend(), which appends every ITEM of another list, unlike .append(), which would drop the whole list in as a single element.

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `[[1,2],[3]]` | `[1,2,3]` |
| 2 | `[]` | `[]` |
| 3 | `[[],[]]` | `[]` |
| 4 | `[[1],[2],[3]]` | `[1,2,3]` |
| 5 | `[[5,6],[],[7]]` | `[5,6,7]` |

<a id="medium-14"></a>

## MEDIUM 14. ตัวเลขที่หายไป (Missing Number)

**ชื่อภาษาอังกฤษ:** Missing Number  
**ฟังก์ชัน:** `def missing_number(nums, n)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 35

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน `missing_number(nums, n)` หาตัวเลขที่หายไปจากชุด 1 ถึง n

**โจทย์ (อังกฤษ):**  
Write a function `missing_number(nums, n)` finding the missing value from 1..n.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def missing_number(nums, n):
    # TODO: ผลรวมของ 1..n คือ n * (n + 1) // 2 — ลบด้วย sum(nums) จะได้ตัวที่หายไป
    return -1
```

**✅ เฉลย:**

```python
def missing_number(nums, n):
    return n * (n + 1) // 2 - sum(nums)
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — ผลรวม 1..n หาได้ด้วยสูตร n * (n + 1) // 2 โดยไม่ต้องวนลูป เอาลบด้วย sum(nums) ส่วนที่ขาดคือตัวที่หายไป — ใช้ // เพราะผลลัพธ์เป็นจำนวนเต็ม
- EN — The sum of 1..n is n * (n + 1) // 2 with no loop at all. Subtract sum(nums) and the shortfall is the missing value — use // to keep it an integer.

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `[1,2,4], 4` | `3` |
| 2 | `[2], 2` | `1` |
| 3 | `[1], 2` | `2` |
| 4 | `[1,2,3,5], 5` | `4` |
| 5 | `[2,3,4,5], 5` | `1` |

<a id="medium-15"></a>

## MEDIUM 15. นับตัวอักษรที่ไม่ซ้ำ (Count Unique Chars)

**ชื่อภาษาอังกฤษ:** Count Unique Characters  
**ฟังก์ชัน:** `def count_unique(s)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 18

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน `count_unique(s)` คืนค่าจำนวนตัวอักษรที่ไม่ซ้ำกัน

**โจทย์ (อังกฤษ):**  
Write a function `count_unique(s)` returning how many distinct characters appear.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def count_unique(s):
    # TODO: set(s) เก็บตัวอักษรที่ไม่ซ้ำ แล้วนับด้วย len()
    return -1
```

**✅ เฉลย:**

```python
def count_unique(s):
    return len(set(s))
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — set() ทิ้งตัวซ้ำทั้งหมดโดยอัตโนมัติ จึงเหลือแค่ len(set(s)) ไม่ต้องเทียบทีละคู่
- EN — set() drops every duplicate automatically, so len(set(s)) is the whole answer — no pairwise comparison needed.

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `"aab"` | `2` |
| 2 | `""` | `0` |
| 3 | `"abc"` | `3` |
| 4 | `"aaaa"` | `1` |
| 5 | `"abab"` | `2` |

---

# ระดับยาก (Hard)

<a id="hard-1"></a>

## HARD 1. ผลรวมย่อยสูงสุด / อัลกอริทึมของ Kadane (Max Subarray Sum)

**ชื่อภาษาอังกฤษ:** Maximum Subarray Sum  
**ฟังก์ชัน:** `def max_sub_array(nums)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 81

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน "max_sub_array(nums)" หาผลรวมของอาร์เรย์ย่อยที่มีค่ามากที่สุด (Kadane Algorithm)

**โจทย์ (อังกฤษ):**  
Write a function "max_sub_array(nums)" finding the maximum contiguous subarray sum.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def max_sub_array(nums):
    max_so_far = nums[0]
    curr_max = nums[0]
    for i in range(1, len(nums)):
        # TODO: curr_max = ค่าที่มากกว่า ระหว่าง nums[i] กับ curr_max + nums[i]
        # TODO: max_so_far = ค่าที่มากกว่า ระหว่าง max_so_far กับ curr_max
        pass
    return max_so_far
```

**✅ เฉลย:**

```python
def max_sub_array(nums):
    max_so_far = nums[0]
    curr_max = nums[0]
    for i in range(1, len(nums)):
        curr_max = max(nums[i], curr_max + nums[i])
        max_so_far = max(max_so_far, curr_max)
    return max_so_far
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — ทุกตำแหน่งถามคำถามเดียว: "เริ่มนับใหม่จากตัวนี้ (nums[i]) หรือต่อจากของเดิม (curr_max + nums[i]) อันไหนดีกว่า" ใช้ max() เลือก แล้วค่อยเก็บสถิติสูงสุดไว้ที่ max_so_far
- EN — At each position ask one question: start fresh at nums[i], or extend with curr_max + nums[i]? max() picks, then max_so_far records the best ever seen.

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `[-2,1,-3,4,-1,2,1,-5,4]` | `6` |
| 2 | `[1]` | `1` |
| 3 | `[-1,-2]` | `-1` |
| 4 | `[1,2,3]` | `6` |

<a id="hard-2"></a>

## HARD 2. ความยาวสับสตริงที่ไม่มีอักขระซ้ำ (Longest Substring Without Repeating)

**ชื่อภาษาอังกฤษ:** Longest Substring Without Repeating Characters  
**ฟังก์ชัน:** `def length_of_longest_substring(s)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 72

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน "length_of_longest_substring(s)" หาความยาวสตริงย่อยที่ไม่มีอักขระซ้ำกันเลย

**โจทย์ (อังกฤษ):**  
Write a function "length_of_longest_substring(s)" finding max length of substring without repeating characters.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def length_of_longest_substring(s):
    char_map = {}
    left = 0
    max_len = 0
    for right, char in enumerate(s):
        # TODO: ถ้า char เคยเจอแล้ว และตำแหน่งเดิม >= left ให้เลื่อน left = char_map[char] + 1
        char_map[char] = right
        max_len = max(max_len, right - left + 1)
    return max_len
```

**✅ เฉลย:**

```python
def length_of_longest_substring(s):
    char_map = {}
    left = 0
    max_len = 0
    for right, char in enumerate(s):
        if char in char_map and char_map[char] >= left:
            left = char_map[char] + 1
        char_map[char] = right
        max_len = max(max_len, right - left + 1)
    return max_len
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — คิดเป็นหน้าต่างที่มีขอบซ้าย (left) กับขวา ถ้าเจอตัวอักษรซ้ำ "ในหน้าต่างปัจจุบัน" ให้เลื่อน left ไปหลังตำแหน่งเดิมของมัน — เงื่อนไข char_map[char] >= left คือสิ่งที่บอกว่าซ้ำอยู่ในหน้าต่างจริง ไม่ใช่ซ้ำที่หลุดไปแล้ว
- EN — Think of a window with a left and right edge. On a repeat INSIDE the window, move left past the old position — the char_map[char] >= left test is what tells a genuine repeat from one the window already left behind.

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `"abcabcbb"` | `3` |
| 2 | `"bbbbb"` | `1` |
| 3 | `""` | `0` |
| 4 | `"pwwkew"` | `3` |
| 5 | `"abcdef"` | `6` |

<a id="hard-3"></a>

## HARD 3. ระบบจำลองแคช LRU (LRU Cache Simulator)

**ชื่อภาษาอังกฤษ:** LRU Cache Simulator  
**ฟังก์ชัน:** `def simulate_lru(capacity, ops)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 91

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน "simulate_lru(capacity, operations)" คืนค่าผลลัพธ์ของคำสั่ง Get/Put ตามลำดับ LRU Cache

**โจทย์ (อังกฤษ):**  
Write a function "simulate_lru(capacity, operations)" simulating Least Recently Used Cache.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def simulate_lru(capacity, ops):
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
    return res
```

**✅ เฉลย:**

```python
def simulate_lru(capacity, ops):
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
    return res
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — OrderedDict จำลำดับการใช้งาน move_to_end บอกว่า "เพิ่งใช้ตัวนี้" และ popitem(last=False) เอาตัวที่เก่าสุดออก ส่วน get ที่ไม่เจอต้อง append -1 ไม่ใช่ข้ามไป
- EN — OrderedDict remembers usage order: move_to_end marks something as just used, popitem(last=False) evicts the oldest. A get that misses must append -1, not skip.

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `2, [["put",1,1],["put",2,2],["get",1,null],["put",3,3],["get",2,null]]` | `[1,-1]` |
| 2 | `1, [["put",1,1],["put",2,2],["get",1,null]]` | `[-1]` |
| 3 | `2, [["put",1,1],["get",1,null]]` | `[1]` |
| 4 | `2, [["get",5,null]]` | `[-1]` |

<a id="hard-4"></a>

## HARD 4. กักเก็บน้ำฝน (Trapping Rain Water)

**ชื่อภาษาอังกฤษ:** Trapping Rain Water  
**ฟังก์ชัน:** `def trap(height)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 59

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน "trap(height)" คำนวณปริมาณน้ำฝนที่ขังอยู่ระหว่างความสูงของแท่งกราฟ

**โจทย์ (อังกฤษ):**  
Write a function "trap(height)" calculating total trapped rainwater.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def trap(height):
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
    return water
```

**✅ เฉลย:**

```python
def trap(height):
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
    return water
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — น้ำที่ขังบนแต่ละช่องคือ ความสูงกำแพงที่เตี้ยกว่าในสองฝั่ง ลบ ความสูงพื้นช่องนั้น เพราะเดินจากฝั่งที่กำแพงเตี้ยกว่าเสมอ left_max/right_max จึงเป็นตัวจำกัดอยู่แล้ว น้ำจึงไม่เคยติดลบ
- EN — Water above a cell is the shorter of the two side walls minus that cell's own height. Because you always advance from the shorter wall, left_max/right_max are already the limiting one — so the amount is never negative.

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `[0,1,0,2,1,0,1,3,2,1,2,1]` | `6` |
| 2 | `[]` | `0` |
| 3 | `[4,2,3]` | `1` |
| 4 | `[3,0,3]` | `3` |

<a id="hard-5"></a>

## HARD 5. รวบรวม K อาร์เรย์ที่เรียงแล้ว (Merge K Sorted Lists)

**ชื่อภาษาอังกฤษ:** Merge K Sorted Lists  
**ฟังก์ชัน:** `def merge_k_lists(lists)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 35

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน "merge_k_lists(lists)" เพื่อรวม K อาร์เรย์ที่เรียงลำดับแล้วให้กลายเป็นอาร์เรย์เดียวที่เรียงลำดับสมบูรณ์

**โจทย์ (อังกฤษ):**  
Write a function "merge_k_lists(lists)" merging K sorted lists into one sorted array.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def merge_k_lists(lists):
    flat = []
    for sub in lists:
        # TODO: เอาสมาชิกทุกตัวใน sub มาต่อเข้ากับ flat
        pass
    # TODO: คืน flat ที่เรียงลำดับแล้ว (sorted)
    return [-1]
```

**✅ เฉลย:**

```python
def merge_k_lists(lists):
    flat = []
    for sub in lists:
        flat.extend(sub)
    return sorted(flat)
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — ไม่ต้องรวมแบบฉลาด เอาทุกตัวมากองรวมกันด้วย extend แล้ว sorted() ทีเดียวตอนท้ายก็ได้คำตอบที่ถูก
- EN — No clever merging needed: extend everything into one pile, then sorted() once at the end gives the right answer.

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `[[1,4,5],[1,3,4],[2,6]]` | `[1,1,2,3,4,4,5,6]` |
| 2 | `[]` | `[]` |
| 3 | `[[1]]` | `[1]` |
| 4 | `[[2],[1]]` | `[1,2]` |

<a id="hard-6"></a>

## HARD 6. ราคาหุ้นกำไรสูงสุด (Best Time To Buy)

**ชื่อภาษาอังกฤษ:** Best Time To Buy And Sell Stock  
**ฟังก์ชัน:** `def max_profit(prices)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 42

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน `max_profit(prices)` หากำไรสูงสุดจากการซื้อครั้งเดียวขายครั้งเดียว (ถ้าไม่มีกำไรคืน 0)

**โจทย์ (อังกฤษ):**  
Write a function `max_profit(prices)` returning the best single buy/sell profit (0 if none).

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def max_profit(prices):
    if not prices:
        return 0
    low = prices[0]
    best = 0
    for p in prices[1:]:
        # TODO: best = กำไรที่มากกว่า ระหว่าง best กับ p - low
        # TODO: low = ราคาที่ต่ำกว่า ระหว่าง low กับ p
        pass
    return best
```

**✅ เฉลย:**

```python
def max_profit(prices):
    if not prices:
        return 0
    low = prices[0]
    best = 0
    for p in prices[1:]:
        best = max(best, p - low)
        low = min(low, p)
    return best
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — เดินครั้งเดียวโดยจำ "ราคาต่ำสุดที่เคยเจอ" ไว้ กำไรที่ทำได้วันนี้คือ p - low ต้องคิดกำไรก่อนแล้วจึงอัปเดต low ไม่งั้นจะกลายเป็นซื้อและขายวันเดียวกัน
- EN — One pass, remembering the lowest price so far: today's profit is p - low. Compute the profit BEFORE updating low, or you would be buying and selling on the same day.

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `[7,1,5,3,6,4]` | `5` |
| 2 | `[7,6,4,3,1]` | `0` |
| 3 | `[]` | `0` |
| 4 | `[1,2]` | `1` |
| 5 | `[3,3,3]` | `0` |

<a id="hard-7"></a>

## HARD 7. จัดกลุ่มคำสลับอักษร (Group Anagrams)

**ชื่อภาษาอังกฤษ:** Group Anagrams Count  
**ฟังก์ชัน:** `def group_anagrams_count(words)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 30

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน `group_anagrams_count(words)` คืนค่าจำนวนกลุ่มของคำที่เป็นแอนนาแกรมกัน

**โจทย์ (อังกฤษ):**  
Write a function `group_anagrams_count(words)` returning how many anagram groups exist.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def group_anagrams_count(words):
    groups = set()
    for w in words:
        # TODO: เรียงตัวอักษรของ w แล้วต่อกลับเป็นสตริง "".join(sorted(w)) ใส่ลง groups
        pass
    return len(groups)
```

**✅ เฉลย:**

```python
def group_anagrams_count(words):
    groups = set()
    for w in words:
        groups.add("".join(sorted(w)))
    return len(groups)
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — คำที่เป็นอนาแกรมกันจะได้ "ลายนิ้วมือ" เดียวกันเมื่อเรียงตัวอักษร ใช้ "".join(sorted(w)) แปลงกลับเป็นสตริงก่อน เพราะลิสต์ใส่ใน set ไม่ได้ แล้ว set จะรวมกลุ่มซ้ำให้เอง
- EN — Anagrams share a fingerprint once their letters are sorted. Convert back to a string with "".join(sorted(w)) — a list cannot go into a set — and the set collapses the duplicates for you.

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `["eat","tea","tan"]` | `2` |
| 2 | `[]` | `0` |
| 3 | `["abc"]` | `1` |
| 4 | `["ab","ba","cd"]` | `2` |
| 5 | `["a","a","a"]` | `1` |

<a id="hard-8"></a>

## HARD 8. ผลคูณยกเว้นตัวเอง (Product Except Self)

**ชื่อภาษาอังกฤษ:** Product Of Array Except Self  
**ฟังก์ชัน:** `def product_except_self(nums)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 16

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน `product_except_self(nums)` คืนอาร์เรย์ที่แต่ละตำแหน่งคือผลคูณของสมาชิกอื่นทั้งหมด

**โจทย์ (อังกฤษ):**  
Write a function `product_except_self(nums)` where each position is the product of all other elements.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def product_except_self(nums):
    out = []
    for i in range(len(nums)):
        p = 1
        for j, v in enumerate(nums):
            # TODO: คูณ v เข้ากับ p เฉพาะตอนที่ j ไม่เท่ากับ i
            pass
        out.append(p)
    return out
```

**✅ เฉลย:**

```python
def product_except_self(nums):
    out = []
    for i in range(len(nums)):
        p = 1
        for j, v in enumerate(nums):
            if i != j:
                p *= v
        out.append(p)
    return out
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — ลูปในซ้อนลูปนอก: ลูปนอกเลือกตำแหน่งที่จะ "เว้น" ลูปในคูณทุกตัวยกเว้นตำแหน่งนั้น เงื่อนไข i != j คือสิ่งที่เว้นมันออก
- EN — A loop inside a loop: the outer picks which index to SKIP, the inner multiplies everything else. The i != j test is what does the skipping.

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `[1,2,3,4]` | `[24,12,8,6]` |
| 2 | `[]` | `[]` |
| 3 | `[2,3]` | `[3,2]` |
| 4 | `[1,1,1]` | `[1,1,1]` |
| 5 | `[5,0]` | `[0,5]` |

<a id="hard-9"></a>

## HARD 9. ลำดับต่อเนื่องยาวที่สุด (Longest Consecutive)

**ชื่อภาษาอังกฤษ:** Longest Consecutive Sequence  
**ฟังก์ชัน:** `def longest_consecutive(nums)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 33

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน `longest_consecutive(nums)` หาความยาวของลำดับเลขต่อเนื่องที่ยาวที่สุด

**โจทย์ (อังกฤษ):**  
Write a function `longest_consecutive(nums)` returning the length of the longest run of consecutive integers.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def longest_consecutive(nums):
    s = set(nums)
    best = 0
    for n in s:
        if n - 1 not in s:
            length = 1
            # TODO: ตราบใดที่ n + length ยังอยู่ใน s ให้ length เพิ่มขึ้นเรื่อยๆ
            best = max(best, length)
    return best
```

**✅ เฉลย:**

```python
def longest_consecutive(nums):
    s = set(nums)
    best = 0
    for n in s:
        if n - 1 not in s:
            length = 1
            while n + length in s:
                length += 1
            best = max(best, length)
    return best
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — นับเฉพาะจากตัวที่เป็น "จุดเริ่มต้น" ของชุด (เงื่อนไข n - 1 not in s ที่ให้มา) แล้วใช้ while ไล่ n + length ต่อขึ้นไปเรื่อยๆ การเช็คใน set เร็วกว่าในลิสต์มาก
- EN — Only count from a value that STARTS a run (the given n - 1 not in s test), then walk upward with a while on n + length. Membership tests in a set are far faster than in a list.

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `[100,4,200,1,3,2]` | `4` |
| 2 | `[]` | `0` |
| 3 | `[1]` | `1` |
| 4 | `[1,2,0,1]` | `3` |
| 5 | `[5,10]` | `1` |

<a id="hard-10"></a>

## HARD 10. หมุนอาร์เรย์ (Rotate Array)

**ชื่อภาษาอังกฤษ:** Rotate Array  
**ฟังก์ชัน:** `def rotate(nums, k)`  
**ตัวอักษรที่ผู้เล่นต้องพิมพ์เพิ่มเอง:** 28

**โจทย์ (ไทย):**  
เขียนฟังก์ชัน `rotate(nums, k)` หมุนอาร์เรย์ไปทางขวา k ตำแหน่ง

**โจทย์ (อังกฤษ):**  
Write a function `rotate(nums, k)` rotating the array right by k positions.

**โค้ดตั้งต้นที่ผู้เล่นเห็น:**

```python
def rotate(nums, k):
    if not nums:
        return []
    k = k % len(nums)
    if k == 0:
        return list(nums)
    # TODO: เอา k ตัวท้าย (nums[-k:]) มาต่อหน้าส่วนที่เหลือ (nums[:-k])
    return list(nums)
```

**✅ เฉลย:**

```python
def rotate(nums, k):
    if not nums:
        return []
    k = k % len(nums)
    if k == 0:
        return list(nums)
    return nums[-k:] + nums[:-k]
```

**คำใบ้ (ไอเทม AI Helper):**

- TH — การหมุนคือการตัดแล้วสลับที่ nums[-k:] คือ k ตัวท้าย nums[:-k] คือส่วนที่เหลือ เอามาต่อกันตามลำดับนั้น สองบรรทัดที่ให้มาจัดการ k ที่ใหญ่กว่าลิสต์และกรณี k เป็น 0 ไว้แล้ว
- EN — Rotating is slicing and swapping: nums[-k:] is the last k items, nums[:-k] the rest — join them in that order. The two given lines already handle a k larger than the list, and k of 0.

**เทสเคสที่ใช้ตัดสิน:**

| # | input | expected output |
|---|---|---|
| 1 | `[1,2,3,4,5], 2` | `[4,5,1,2,3]` |
| 2 | `[], 3` | `[]` |
| 3 | `[1,2,3], 0` | `[1,2,3]` |
| 4 | `[1,2], 3` | `[2,1]` |
| 5 | `[1,2,3], 3` | `[1,2,3]` |

---

สร้างจาก `server/arcadeTaskSeed.js` — โจทย์ 40 ข้อ, เทสเคสรวม 189 เคส
