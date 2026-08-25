// server/arcadeTaskSeed.js
// Single source of truth for the Arcade problem bank.
//
// These lived inline in db.js originally and were only ever written when the
// table was completely empty, which made adding problems or fixing a bad test
// case impossible without wiping the table. db.js now upserts from this list
// on every boot (matching on title_en), so editing a task here is enough.
//
// Every test case is verified against its own reference solution by running it
// in real Python. A task whose reference answer fails its own tests marks a
// CORRECT player wrong, which is exactly what had happened to "Longest Word"
// (its stored answer expected "jumps" while max(words, key=len) returns
// "quick").
//
// Three fields describe the code, and they are NOT interchangeable:
//
//   starter_code  What the player actually sees in the editor. The structure is
//                 given - variables, loop, return - and only the line or two
//                 carrying the idea of the problem is left as a TODO. This mode
//                 is played by people still learning Python, and measurement on
//                 2026-08-19 found that starting from a bare `pass` body left a
//                 beginner physically unable to TYPE 70% of these problems
//                 inside Quick Mode's usable time, let alone think them through.
//
//   initial_code  The finished answer that starter_code leads to. Never shown to
//                 a player. It is deliberately the completed scaffold and not a
//                 terser one-liner: if the reference answer and the answer the
//                 scaffold leads to were different code, work_chars below would
//                 be measuring a solution nobody was being steered toward.
//
//   work_chars    Characters of initial_code that are NOT already on screen in
//                 starter_code - i.e. what the player still has to type.
//                 drawArcadeRoundTasks() in server.js filters on this so a
//                 round never serves a problem too long to finish in its own
//                 time limit. Computed, not hand-written: regenerate it rather
//                 than editing it by hand after changing either code field.
//
//   hint_th /     What the aiHelper shop item reveals, in each language. The
//   hint_en       scaffold's TODO already says WHAT to do, so a hint's job is
//                 what the TODO leaves out: which Python construct does it, why
//                 that one, and the trap that makes a first attempt fail. It is
//                 never the finished line - the item used to show one fixed
//                 sentence for all 40 problems, which is why nobody bought it.
//
// Every starter_code is checked to be valid Python, to keep the same def
// signature as its solution, and to NOT pass its own tests - a scaffold that
// accidentally contains the answer would let everyone win by pressing submit.
// Hints are checked never to contain an answer line verbatim.

const ARCADE_TASKS = [
  {
    "difficulty": "easy",
    "title_th": "เลขฟีโบนัชชี (Fibonacci)",
    "title_en": "Fibonacci Number",
    "desc_th": "เขียนฟังก์ชัน \"fib(n)\" เพื่อคืนค่าตัวเลขฟีโบนัชชีลำดับที่ n",
    "desc_en": "Write a function \"fib(n)\" that returns the n-th Fibonacci number.",
    "initial_code": "def fib(n):\n    if n <= 1:\n        return n\n    return fib(n - 1) + fib(n - 2)",
    "starter_code": "def fib(n):\n    if n <= 1:\n        return n\n    # TODO: คืนค่า fib(n-1) บวกกับ fib(n-2)\n    return 0",
    "work_chars": 30,
    "hint_th": "ฟังก์ชันเรียกตัวเองได้ ลอง fib(n-1) + fib(n-2) — สองบรรทัดแรกที่ให้มาแล้วคือ \"จุดหยุด\" ถ้าไม่มีมันจะเรียกตัวเองไม่จบ",
    "hint_en": "A function may call itself: fib(n-1) + fib(n-2). The two lines already given are the stopping point — without them it would recurse forever.",
    "test_cases": [
      {
        "input": [
          5
        ],
        "output": 5
      },
      {
        "input": [
          7
        ],
        "output": 13
      },
      {
        "input": [
          0
        ],
        "output": 0
      },
      {
        "input": [
          1
        ],
        "output": 1
      },
      {
        "input": [
          10
        ],
        "output": 55
      }
    ]
  },
  {
    "difficulty": "easy",
    "title_th": "ตรวจสอบเลขคู่/เลขคี่ (Even or Odd)",
    "title_en": "Even or Odd",
    "desc_th": "เขียนฟังก์ชัน \"is_even(n)\" เพื่อคืนค่า True หากเป็นเลขคู่ และ False หากเป็นเลขคี่",
    "desc_en": "Write a function \"is_even(n)\" returning True if n is even, False otherwise.",
    "initial_code": "def is_even(n):\n    return n % 2 == 0",
    "starter_code": "def is_even(n):\n    # TODO: คืน True ถ้า n หารด้วย 2 แล้วเหลือเศษ 0 (ใช้ n % 2)\n    return None",
    "work_chars": 17,
    "hint_th": "% คือเศษจากการหาร n % 2 ได้ 0 เมื่อเป็นเลขคู่ เขียน n % 2 == 0 ตรงๆ ได้ True/False อยู่แล้ว ไม่ต้องใช้ if",
    "hint_en": "% gives the remainder. n % 2 is 0 for an even number, and n % 2 == 0 is already True or False on its own — no if needed.",
    "test_cases": [
      {
        "input": [
          4
        ],
        "output": true
      },
      {
        "input": [
          7
        ],
        "output": false
      },
      {
        "input": [
          0
        ],
        "output": true
      },
      {
        "input": [
          -2
        ],
        "output": true
      },
      {
        "input": [
          99
        ],
        "output": false
      }
    ]
  },
  {
    "difficulty": "easy",
    "title_th": "กลับด้านข้อความ (Reverse String)",
    "title_en": "Reverse String",
    "desc_th": "เขียนฟังก์ชัน \"reverse_string(s)\" เพื่อคืนค่าตัวอักษรเรียงย้อนกลับ",
    "desc_en": "Write a function \"reverse_string(s)\" that returns the reversed string.",
    "initial_code": "def reverse_string(s):\n    return s[::-1]",
    "starter_code": "def reverse_string(s):\n    # TODO: คืนสตริงที่กลับด้าน — สไลซ์แบบ [::-1] ทำให้ได้เลย\n    return \"\"",
    "work_chars": 14,
    "hint_th": "สไลซ์เขียนเป็น s[เริ่ม:จบ:ก้าว] ถ้าก้าวเป็น -1 คือเดินถอยหลัง เว้นเริ่มกับจบว่างไว้ก็ได้ทั้งสตริง: s[::-1]",
    "hint_en": "A slice is s[start:stop:step]. A step of -1 walks backwards, and leaving start and stop empty takes the whole string: s[::-1].",
    "test_cases": [
      {
        "input": [
          "hello"
        ],
        "output": "olleh"
      },
      {
        "input": [
          "python"
        ],
        "output": "nohtyp"
      },
      {
        "input": [
          ""
        ],
        "output": ""
      },
      {
        "input": [
          "a"
        ],
        "output": "a"
      },
      {
        "input": [
          "ab cd"
        ],
        "output": "dc ba"
      }
    ]
  },
  {
    "difficulty": "easy",
    "title_th": "ผลรวมของรายการตัวเลข (Sum Array)",
    "title_en": "Sum of Array",
    "desc_th": "เขียนฟังก์ชัน \"sum_array(nums)\" เพื่อคืนค่าผลรวมของตัวเลขทั้งหมดในอาร์เรย์",
    "desc_en": "Write a function \"sum_array(nums)\" that returns the sum of all elements.",
    "initial_code": "def sum_array(nums):\n    total = 0\n    for n in nums:\n        total += n\n    return total",
    "starter_code": "def sum_array(nums):\n    total = 0\n    for n in nums:\n        # TODO: บวก n เข้ากับ total\n        pass\n    return total",
    "work_chars": 10,
    "hint_th": "เครื่องหมาย += บวกทับค่าเดิม (x += 1 มีความหมายเท่ากับ x = x + 1) บรรทัดที่บวกต้องอยู่ในลูปจึงจะทำซ้ำทุกตัว ถ้าไปอยู่นอกลูปจะได้แค่ตัวสุดท้าย",
    "hint_en": "The += operator adds onto what is already there (x += 1 means x = x + 1). The adding line has to sit INSIDE the loop to run for every item; outside it, only the last value counts.",
    "test_cases": [
      {
        "input": [
          [
            1,
            2,
            3,
            4
          ]
        ],
        "output": 10
      },
      {
        "input": [
          [
            5,
            10,
            15
          ]
        ],
        "output": 30
      },
      {
        "input": [
          []
        ],
        "output": 0
      },
      {
        "input": [
          [
            -1,
            1
          ]
        ],
        "output": 0
      },
      {
        "input": [
          [
            7
          ]
        ],
        "output": 7
      }
    ]
  },
  {
    "difficulty": "easy",
    "title_th": "หาค่าสูงสุด (Find Maximum)",
    "title_en": "Find Maximum",
    "desc_th": "เขียนฟังก์ชัน \"find_max(nums)\" คืนค่าตัวเลขที่มีค่ามากที่สุดในรายการ",
    "desc_en": "Write a function \"find_max(nums)\" returning the largest number.",
    "initial_code": "def find_max(nums):\n    best = nums[0]\n    for n in nums:\n        if n > best:\n            best = n\n    return best",
    "starter_code": "def find_max(nums):\n    best = nums[0]\n    for n in nums:\n        # TODO: ถ้า n มากกว่า best ให้เปลี่ยน best เป็น n\n        pass\n    return best",
    "work_chars": 20,
    "hint_th": "เทียบทีละตัวกับตัวที่ดีที่สุดที่เจอมา ถ้า n > best ก็เปลี่ยน best เป็น n เริ่ม best จากสมาชิกตัวแรกไว้แล้ว จึงไม่ต้องกลัวลิสต์ค่าลบ",
    "hint_en": "Compare each item against the best so far: if n > best, make best equal n. best already starts at the first element, so negative numbers are handled.",
    "test_cases": [
      {
        "input": [
          [
            3,
            9,
            2,
            5
          ]
        ],
        "output": 9
      },
      {
        "input": [
          [
            -1,
            -5,
            -2
          ]
        ],
        "output": -1
      },
      {
        "input": [
          [
            0
          ]
        ],
        "output": 0
      },
      {
        "input": [
          [
            2,
            2,
            2
          ]
        ],
        "output": 2
      },
      {
        "input": [
          [
            -10,
            5
          ]
        ],
        "output": 5
      }
    ]
  },
  {
    "difficulty": "easy",
    "title_th": "นับจำนวนสระ (Count Vowels)",
    "title_en": "Count Vowels",
    "desc_th": "เขียนฟังก์ชัน \"count_vowels(s)\" คืนค่าจำนวนสระ (a, e, i, o, u) ในข้อความ",
    "desc_en": "Write a function \"count_vowels(s)\" returning the count of vowels.",
    "initial_code": "def count_vowels(s):\n    vowels = \"aeiou\"\n    count = 0\n    for char in s:\n        if char.lower() in vowels:\n            count += 1\n    return count",
    "starter_code": "def count_vowels(s):\n    vowels = \"aeiou\"\n    count = 0\n    for char in s:\n        # TODO: ถ้า char.lower() อยู่ใน vowels ให้ count เพิ่มขึ้น 1\n        pass\n    return count",
    "work_chars": 36,
    "hint_th": "in ใช้ถามว่ามีอยู่ในสตริงไหม เช่น char in vowels และ .lower() ทำให้ตัวพิมพ์ใหญ่นับด้วย ไม่งั้น \"A\" จะหลุด",
    "hint_en": "in asks whether something is present: char in vowels. Use .lower() so capitals count too, otherwise \"A\" slips through.",
    "test_cases": [
      {
        "input": [
          "hello world"
        ],
        "output": 3
      },
      {
        "input": [
          "arcade"
        ],
        "output": 3
      },
      {
        "input": [
          ""
        ],
        "output": 0
      },
      {
        "input": [
          "xyz"
        ],
        "output": 0
      },
      {
        "input": [
          "AEIOU"
        ],
        "output": 5
      }
    ]
  },
  {
    "difficulty": "easy",
    "title_th": "แปลงองศาเซลเซียสเป็นฟาเรนไฮต์ (Celsius to Fahrenheit)",
    "title_en": "Celsius to Fahrenheit",
    "desc_th": "เขียนฟังก์ชัน \"c_to_f(c)\" เพื่อแปลงอุณหภูมิจาก C เป็น F (\"(c * 9/5) + 32\")",
    "desc_en": "Write a function \"c_to_f(c)\" to convert Celsius to Fahrenheit.",
    "initial_code": "def c_to_f(c):\n    return (c * 9 / 5) + 32",
    "starter_code": "def c_to_f(c):\n    # TODO: สูตรคือ c คูณ 9 หาร 5 แล้วบวก 32\n    return 0",
    "work_chars": 23,
    "hint_th": "ใส่วงเล็บให้ชัด (c * 9/5) + 32 — ใน Python คูณและหารทำก่อนบวก แต่การใส่วงเล็บช่วยให้อ่านง่ายและไม่พลาด",
    "hint_en": "Write it as (c * 9/5) + 32. Python does multiplication and division before addition anyway, but the parentheses make it hard to get wrong.",
    "test_cases": [
      {
        "input": [
          0
        ],
        "output": 32
      },
      {
        "input": [
          100
        ],
        "output": 212
      },
      {
        "input": [
          10
        ],
        "output": 50
      },
      {
        "input": [
          -40
        ],
        "output": -40
      },
      {
        "input": [
          20
        ],
        "output": 68
      }
    ]
  },
  {
    "difficulty": "easy",
    "title_th": "แฟกทอเรียล (Factorial)",
    "title_en": "Factorial",
    "desc_th": "เขียนฟังก์ชัน \"factorial(n)\" คืนค่าผลคูณ n! (เช่น 5! = 120)",
    "desc_en": "Write a function \"factorial(n)\" returning n!.",
    "initial_code": "def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)",
    "starter_code": "def factorial(n):\n    if n <= 1:\n        return 1\n    # TODO: คืนค่า n คูณกับ factorial(n - 1)\n    return 0",
    "work_chars": 27,
    "hint_th": "n! คือ n คูณกับ (n-1)! ให้เรียกตัวเองแบบ n * factorial(n - 1) บรรทัด if ที่ให้มาคือจุดหยุด",
    "hint_en": "n! is n times (n-1)!, so call yourself: n * factorial(n - 1). The if already given is the stopping point.",
    "test_cases": [
      {
        "input": [
          5
        ],
        "output": 120
      },
      {
        "input": [
          3
        ],
        "output": 6
      },
      {
        "input": [
          0
        ],
        "output": 1
      },
      {
        "input": [
          1
        ],
        "output": 1
      },
      {
        "input": [
          6
        ],
        "output": 720
      }
    ]
  },
  {
    "difficulty": "easy",
    "title_th": "ตรวจสอบพาลินโดรม (Palindrome Check)",
    "title_en": "Palindrome Check",
    "desc_th": "เขียนฟังก์ชัน \"is_palindrome(s)\" คืนค่า True หากคำอ่านจากหน้าไปหลังและหลังมาหน้าเหมือนกัน",
    "desc_en": "Write a function \"is_palindrome(s)\" returning True if string is a palindrome.",
    "initial_code": "def is_palindrome(s):\n    c = s.lower().replace(\" \", \"\")\n    return c == c[::-1]",
    "starter_code": "def is_palindrome(s):\n    c = s.lower().replace(\" \", \"\")\n    # TODO: คืน True ถ้า c เท่ากับ c ที่กลับด้าน (c[::-1])\n    return None",
    "work_chars": 19,
    "hint_th": "เทียบสตริงเดิมกับตัวที่กลับด้าน c == c[::-1] บรรทัดแรกจัดการตัวพิมพ์และช่องว่างให้แล้ว จึงเทียบ c ไม่ใช่ s",
    "hint_en": "Compare the string with its reverse: c == c[::-1]. The first line already stripped case and spaces, so compare c, not s.",
    "test_cases": [
      {
        "input": [
          "racecar"
        ],
        "output": true
      },
      {
        "input": [
          "python"
        ],
        "output": false
      },
      {
        "input": [
          ""
        ],
        "output": true
      },
      {
        "input": [
          "a"
        ],
        "output": true
      },
      {
        "input": [
          "never odd or even"
        ],
        "output": true
      }
    ]
  },
  {
    "difficulty": "easy",
    "title_th": "กำลังสองของทุกสมาชิก (Square List)",
    "title_en": "Square List",
    "desc_th": "เขียนฟังก์ชัน \"square_list(nums)\" คืนค่าอาร์เรย์ตัวเลขที่ยกกำลังสองทุกตัว",
    "desc_en": "Write a function \"square_list(nums)\" returning a list of squared numbers.",
    "initial_code": "def square_list(nums):\n    out = []\n    for x in nums:\n        out.append(x ** 2)\n    return out",
    "starter_code": "def square_list(nums):\n    out = []\n    for x in nums:\n        # TODO: เพิ่มค่า x ยกกำลังสอง (x ** 2) เข้าไปใน out\n        pass\n    return out",
    "work_chars": 18,
    "hint_th": "ยกกำลังใช้ ** ดังนั้น x ** 2 คือ x กำลังสอง แล้วเก็บเข้าลิสต์ด้วย out.append(...)",
    "hint_en": "Exponentiation is **, so x ** 2 squares x. Collect it with out.append(...).",
    "test_cases": [
      {
        "input": [
          [
            1,
            2,
            3
          ]
        ],
        "output": [
          1,
          4,
          9
        ]
      },
      {
        "input": [
          []
        ],
        "output": []
      },
      {
        "input": [
          [
            0
          ]
        ],
        "output": [
          0
        ]
      },
      {
        "input": [
          [
            -2,
            5
          ]
        ],
        "output": [
          4,
          25
        ]
      }
    ]
  },
  {
    "difficulty": "medium",
    "title_th": "ตรวจสอบแอนนาแกรม (Anagram Checker)",
    "title_en": "Anagram Checker",
    "desc_th": "เขียนฟังก์ชัน \"is_anagram(s, t)\" เพื่อตรวจสอบว่าข้อความสองชุดสลับตัวอักษรกันหรือไม่",
    "desc_en": "Write a function \"is_anagram(s, t)\" to check if two strings are anagrams.",
    "initial_code": "def is_anagram(s, t):\n    return sorted(s) == sorted(t)",
    "starter_code": "def is_anagram(s, t):\n    # TODO: สองคำเป็นอนาแกรมกันเมื่อเรียงตัวอักษรแล้วเหมือนกัน — ใช้ sorted()\n    return None",
    "work_chars": 29,
    "hint_th": "sorted() คืนลิสต์ตัวอักษรที่เรียงแล้ว ถ้าสองคำใช้ตัวอักษรชุดเดียวกัน ผลเรียงจะเท่ากันเสมอ: sorted(s) == sorted(t)",
    "hint_en": "sorted() returns the letters in order, so two words built from the same letters always sort identically: sorted(s) == sorted(t).",
    "test_cases": [
      {
        "input": [
          "anagram",
          "nagaram"
        ],
        "output": true
      },
      {
        "input": [
          "rat",
          "car"
        ],
        "output": false
      },
      {
        "input": [
          "",
          ""
        ],
        "output": true
      },
      {
        "input": [
          "a",
          "a"
        ],
        "output": true
      },
      {
        "input": [
          "ab",
          "ba"
        ],
        "output": true
      }
    ]
  },
  {
    "difficulty": "medium",
    "title_th": "ผลรวมสองจำนวน (Two Sum)",
    "title_en": "Two Sum",
    "desc_th": "เขียนฟังก์ชัน \"two_sum(nums, target)\" คืนค่าตำแหน่งดรรชนีของตัวเลข 2 ตัวที่บวกกันได้เท่ากับเป้าหมาย",
    "desc_en": "Write a function \"two_sum(nums, target)\" returning indices of 2 numbers summing to target.",
    "initial_code": "def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i",
    "starter_code": "def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        # TODO: ถ้า diff เคยเจอแล้วใน seen ให้คืน [seen[diff], i]\n        seen[num] = i",
    "work_chars": 38,
    "hint_th": "เก็บตัวที่เคยเจอไว้ใน dict แล้วถามว่า \"ตัวที่ต้องการอีกครึ่ง (diff) เคยผ่านมาไหม\" ถ้าเคย ตำแหน่งของมันอยู่ใน seen[diff] แล้ว วิธีนี้วนรอบเดียวจบ",
    "hint_en": "Remember what you have seen in a dict, then ask whether the other half (diff) came past earlier. If it did, its index is already in seen[diff] — one pass is enough.",
    "test_cases": [
      {
        "input": [
          [
            2,
            7,
            11,
            15
          ],
          9
        ],
        "output": [
          0,
          1
        ]
      },
      {
        "input": [
          [
            3,
            2,
            4
          ],
          6
        ],
        "output": [
          1,
          2
        ]
      },
      {
        "input": [
          [
            3,
            3
          ],
          6
        ],
        "output": [
          0,
          1
        ]
      },
      {
        "input": [
          [
            1,
            5,
            3
          ],
          8
        ],
        "output": [
          1,
          2
        ]
      }
    ]
  },
  {
    "difficulty": "medium",
    "title_th": "อาร์เรย์ FizzBuzz (FizzBuzz Array)",
    "title_en": "FizzBuzz Array",
    "desc_th": "เขียนฟังก์ชัน \"fizz_buzz(n)\" คืนค่ารายการคำว่า \"Fizz\", \"Buzz\", \"FizzBuzz\" หรือตัวเลข ตั้งแต่ 1 ถึง n",
    "desc_en": "Write a function \"fizz_buzz(n)\" returning FizzBuzz string list from 1 to n.",
    "initial_code": "def fizz_buzz(n):\n    res = []\n    for i in range(1, n + 1):\n        if i % 15 == 0:\n            res.append(\"FizzBuzz\")\n        else:\n            if i % 3 == 0:\n                res.append(\"Fizz\")\n            elif i % 5 == 0:\n                res.append(\"Buzz\")\n            else:\n                res.append(str(i))\n    return res",
    "starter_code": "def fizz_buzz(n):\n    res = []\n    for i in range(1, n + 1):\n        if i % 15 == 0:\n            res.append(\"FizzBuzz\")\n        else:\n            # TODO: เพิ่มเงื่อนไข หาร 3 ลงตัว -> \"Fizz\", หาร 5 ลงตัว -> \"Buzz\"\n            res.append(str(i))\n    return res",
    "work_chars": 66,
    "hint_th": "ลำดับเงื่อนไขสำคัญมาก ต้องเช็คหาร 15 ก่อน (ให้มาแล้ว) จากนั้น 3 แล้ว 5 ใช้ elif ต่อกัน ถ้าสลับลำดับ 15 จะถูกจับเป็น Fizz",
    "hint_en": "Order matters: 15 must be tested first (already given), then 3, then 5, chained with elif. Reversed, multiples of 15 would come out as Fizz.",
    "test_cases": [
      {
        "input": [
          5
        ],
        "output": [
          "1",
          "2",
          "Fizz",
          "4",
          "Buzz"
        ]
      },
      {
        "input": [
          1
        ],
        "output": [
          "1"
        ]
      },
      {
        "input": [
          3
        ],
        "output": [
          "1",
          "2",
          "Fizz"
        ]
      },
      {
        "input": [
          15
        ],
        "output": [
          "1",
          "2",
          "Fizz",
          "4",
          "Buzz",
          "Fizz",
          "7",
          "8",
          "Fizz",
          "Buzz",
          "11",
          "Fizz",
          "13",
          "14",
          "FizzBuzz"
        ]
      }
    ]
  },
  {
    "difficulty": "medium",
    "title_th": "ลบตัวเลขซ้ำในรายการ (Remove Duplicates)",
    "title_en": "Remove Duplicates",
    "desc_th": "เขียนฟังก์ชัน \"remove_duplicates(nums)\" เพื่อลบตัวเลขซ้ำและคืนค่ารายการตัวเลขที่ไม่ซ้ำโดยคงลำดับเดิมไว้",
    "desc_en": "Write a function \"remove_duplicates(nums)\" returning list with duplicates removed preserving order.",
    "initial_code": "def remove_duplicates(nums):\n    res = []\n    for num in nums:\n        if num not in res:\n            res.append(num)\n    return res",
    "starter_code": "def remove_duplicates(nums):\n    res = []\n    for num in nums:\n        # TODO: เพิ่ม num เข้า res เฉพาะตอนที่ num ยังไม่มีอยู่ใน res\n        pass\n    return res",
    "work_chars": 33,
    "hint_th": "not in ถามว่ายังไม่มีอยู่ใช่ไหม — if num not in res แล้วค่อย append วิธีนี้รักษาลำดับเดิมไว้ (set() เร็วกว่าแต่ลำดับหาย)",
    "hint_en": "not in asks whether something is absent: if num not in res, then append. This keeps the original order — set() is faster but loses it.",
    "test_cases": [
      {
        "input": [
          [
            1,
            2,
            2,
            3,
            1
          ]
        ],
        "output": [
          1,
          2,
          3
        ]
      },
      {
        "input": [
          []
        ],
        "output": []
      },
      {
        "input": [
          [
            1,
            1,
            1
          ]
        ],
        "output": [
          1
        ]
      },
      {
        "input": [
          [
            5,
            4,
            5,
            4,
            3
          ]
        ],
        "output": [
          5,
          4,
          3
        ]
      }
    ]
  },
  {
    "difficulty": "medium",
    "title_th": "รวบรวม 2 อาร์เรย์ที่จัดเรียงแล้ว (Merge Sorted Lists)",
    "title_en": "Merge Two Sorted Lists",
    "desc_th": "เขียนฟังก์ชัน \"merge_lists(l1, l2)\" เพื่อรวม 2 อาร์เรย์ที่จัดเรียงแล้วให้กลายเป็นอาร์เรย์ที่เรียงจากน้อยไปมาก",
    "desc_en": "Write a function \"merge_lists(l1, l2)\" merging two sorted arrays.",
    "initial_code": "def merge_lists(l1, l2):\n    return sorted(l1 + l2)",
    "starter_code": "def merge_lists(l1, l2):\n    # TODO: รวมสองลิสต์เข้าด้วยกัน (l1 + l2) แล้วเรียงด้วย sorted()\n    return [-1]",
    "work_chars": 22,
    "hint_th": "+ ต่อลิสต์เข้าด้วยกัน แล้ว sorted() เรียงทั้งก้อน: sorted(l1 + l2) ไม่ต้องเขียนการรวมแบบเทียบทีละคู่เอง",
    "hint_en": "+ joins two lists and sorted() orders the result: sorted(l1 + l2). No need to merge them pairwise by hand.",
    "test_cases": [
      {
        "input": [
          [
            1,
            3,
            5
          ],
          [
            2,
            4,
            6
          ]
        ],
        "output": [
          1,
          2,
          3,
          4,
          5,
          6
        ]
      },
      {
        "input": [
          [],
          []
        ],
        "output": []
      },
      {
        "input": [
          [
            1
          ],
          []
        ],
        "output": [
          1
        ]
      },
      {
        "input": [
          [
            2,
            2
          ],
          [
            1,
            3
          ]
        ],
        "output": [
          1,
          2,
          2,
          3
        ]
      }
    ]
  },
  {
    "difficulty": "medium",
    "title_th": "ค้นหาคำที่ยาวที่สุด (Longest Word)",
    "title_en": "Longest Word",
    "desc_th": "เขียนฟังก์ชัน \"longest_word(sentence)\" คืนค่าคำที่มีความยาวมากที่สุดในประโยค",
    "desc_en": "Write a function \"longest_word(sentence)\" returning the longest word in a string.",
    "initial_code": "def longest_word(sentence):\n    words = sentence.split()\n    if not words:\n        return \"\"\n    best = words[0]\n    for w in words:\n        if len(w) > len(best):\n            best = w\n    return best",
    "starter_code": "def longest_word(sentence):\n    words = sentence.split()\n    if not words:\n        return \"\"\n    best = words[0]\n    for w in words:\n        # TODO: ถ้า w ยาวกว่า best ให้เปลี่ยน best เป็น w\n        pass\n    return best",
    "work_chars": 30,
    "hint_th": "เทียบ \"ความยาว\" ไม่ใช่ตัวอักษร จึงต้องใช้ len(w) > len(best) ถ้าเขียน w > best จะกลายเป็นเทียบตามลำดับตัวอักษร",
    "hint_en": "Compare LENGTHS, not the words: len(w) > len(best). Writing w > best would compare them alphabetically instead.",
    "test_cases": [
      {
        "input": [
          "The quick brown fox jumps"
        ],
        "output": "quick"
      },
      {
        "input": [
          "hello"
        ],
        "output": "hello"
      },
      {
        "input": [
          "a bb ccc"
        ],
        "output": "ccc"
      },
      {
        "input": [
          ""
        ],
        "output": ""
      }
    ]
  },
  {
    "difficulty": "medium",
    "title_th": "ตรวจสอบจำนวนเฉพาะ (Prime Number Check)",
    "title_en": "Prime Number Check",
    "desc_th": "เขียนฟังก์ชัน \"is_prime(n)\" เพื่อตรวจสอบว่า n เป็นจำนวนเฉพาะหรือไม่",
    "desc_en": "Write a function \"is_prime(n)\" returning True if n is a prime number.",
    "initial_code": "def is_prime(n):\n    if n <= 1:\n        return False\n    for i in range(2, int(n ** 0.5) + 1):\n        if n % i == 0:\n            return False\n    return True",
    "starter_code": "def is_prime(n):\n    if n <= 1:\n        return False\n    for i in range(2, int(n ** 0.5) + 1):\n        # TODO: ถ้า n หารด้วย i ลงตัว แปลว่าไม่ใช่จำนวนเฉพาะ ให้คืน False\n        pass\n    return True",
    "work_chars": 14,
    "hint_th": "ถ้าเจอตัวหารลงตัวแม้ตัวเดียวก็จบแล้ว return False ได้ทันที ไม่ต้องวนต่อ — ลูปที่ให้มาหยุดที่รากที่สองเพราะตัวหารที่ใหญ่กว่านั้นจับคู่กับตัวที่เล็กกว่าซึ่งตรวจไปแล้ว",
    "hint_en": "One divisor is enough to decide: return False immediately, no need to finish the loop. The given range stops at the square root because any larger divisor pairs with a smaller one already checked.",
    "test_cases": [
      {
        "input": [
          11
        ],
        "output": true
      },
      {
        "input": [
          4
        ],
        "output": false
      },
      {
        "input": [
          1
        ],
        "output": false
      },
      {
        "input": [
          2
        ],
        "output": true
      },
      {
        "input": [
          97
        ],
        "output": true
      }
    ]
  },
  {
    "difficulty": "medium",
    "title_th": "ค้นหาแบบทวิภาค (Binary Search)",
    "title_en": "Binary Search",
    "desc_th": "เขียนฟังก์ชัน \"binary_search(nums, target)\" เพื่อหาตำแหน่งดรรชนีของ target ในอาร์เรย์ที่เรียงแล้ว (หากไม่พบคืนค่า -1)",
    "desc_en": "Write a function \"binary_search(nums, target)\" returning target index or -1.",
    "initial_code": "def binary_search(nums, target):\n    low, high = 0, len(nums) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1",
    "starter_code": "def binary_search(nums, target):\n    low, high = 0, len(nums) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if nums[mid] == target:\n            return mid\n        # TODO: แทนที่ break ข้างล่างด้วยการขยับขอบเขตการค้นหา\n        #       ถ้า nums[mid] น้อยกว่า target ให้ low = mid + 1 ถ้าไม่ใช่ ให้ high = mid - 1\n        break\n    return -1",
    "work_chars": 54,
    "hint_th": "ลบ break ออกแล้วขยับขอบเขตแทน ถ้าค่ากลางน้อยเกินไปคำตอบอยู่ครึ่งขวา ให้ low ขยับไปถัดจาก mid ถ้ามากเกินไปคำตอบอยู่ครึ่งซ้าย ให้ high ถอยมาก่อน mid — ต้องขยับให้พ้น mid ไม่งั้นช่วงไม่เคยแคบลงและลูปวนไม่จบ",
    "hint_en": "Replace the break by moving a bound. Too small means the answer is in the right half, so low moves past mid; too large means the left half, so high pulls back before mid. It must move PAST mid, or the range never narrows and the loop never ends.",
    "test_cases": [
      {
        "input": [
          [
            1,
            3,
            5,
            7,
            9
          ],
          7
        ],
        "output": 3
      },
      {
        "input": [
          [
            1,
            3,
            5
          ],
          2
        ],
        "output": -1
      },
      {
        "input": [
          [
            1
          ],
          1
        ],
        "output": 0
      },
      {
        "input": [
          [],
          5
        ],
        "output": -1
      },
      {
        "input": [
          [
            1,
            2,
            3,
            4,
            5
          ],
          1
        ],
        "output": 0
      }
    ]
  },
  {
    "difficulty": "medium",
    "title_th": "ตรวจสอบวงเล็บสมบูรณ์ (Valid Parentheses)",
    "title_en": "Valid Parentheses",
    "desc_th": "เขียนฟังก์ชัน \"is_valid_parentheses(s)\" ตรวจสอบว่าวงเล็บ (), [], {} เปิดและปิดถูกคู่และถูกลำดับหรือไม่",
    "desc_en": "Write a function \"is_valid_parentheses(s)\" validating matching brackets (), [], {}.",
    "initial_code": "def is_valid_parentheses(s):\n    stack = []\n    mapping = {\")\": \"(\", \"]\": \"[\", \"}\": \"{\"}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else \"#\"\n            if mapping[char] != top:\n                return False\n        else:\n            stack.append(char)\n    return not stack",
    "starter_code": "def is_valid_parentheses(s):\n    stack = []\n    mapping = {\")\": \"(\", \"]\": \"[\", \"}\": \"{\"}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else \"#\"\n            # TODO: ถ้า mapping[char] ไม่ตรงกับ top แปลว่าวงเล็บผิดคู่ ให้คืน False\n            pass\n        else:\n            stack.append(char)\n    # TODO: จบแล้วต้องไม่มีวงเล็บเปิดค้างใน stack จึงจะถูกต้อง\n    return False",
    "work_chars": 40,
    "hint_th": "stack คือกองที่หยิบตัวบนสุดออกก่อน วงเล็บปิดต้องคู่กับตัวที่เพิ่งเปิดล่าสุด ถ้า mapping[char] != top ก็ผิดคู่ และจบแล้ว stack ต้องว่าง จึงคืน not stack",
    "hint_en": "A stack pops the most recent item first, and a closer must match the newest opener — if mapping[char] != top it is mismatched. At the end an empty stack means every opener found its pair, and `not` on an empty list is already True.",
    "test_cases": [
      {
        "input": [
          "()[]{}"
        ],
        "output": true
      },
      {
        "input": [
          "(]"
        ],
        "output": false
      },
      {
        "input": [
          ""
        ],
        "output": true
      },
      {
        "input": [
          "([{}])"
        ],
        "output": true
      },
      {
        "input": [
          "("
        ],
        "output": false
      }
    ]
  },
  {
    "difficulty": "medium",
    "title_th": "คำนวณความถี่ของตัวอักษร (Character Frequency)",
    "title_en": "Character Frequency",
    "desc_th": "เขียนฟังก์ชัน \"char_frequency(s)\" คืนค่าดิกชันนารีนับจำนวนตัวอักษรแต่ละตัวในสเตรนจ์",
    "desc_en": "Write a function \"char_frequency(s)\" returning a dictionary of character counts.",
    "initial_code": "def char_frequency(s):\n    freq = {}\n    for char in s:\n        freq[char] = freq.get(char, 0) + 1\n    return freq",
    "starter_code": "def char_frequency(s):\n    freq = {}\n    for char in s:\n        # TODO: นับ char เพิ่มอีก 1 — freq.get(char, 0) ช่วยกรณีที่ยังไม่เคยเจอ\n        pass\n    return freq",
    "work_chars": 34,
    "hint_th": "dict มีเมธอด .get(คีย์, ค่าสำรอง) ที่คืนค่าสำรองเมื่อยังไม่มีคีย์นั้น ถ้าให้ค่าสำรองเป็น 0 ก็บวกหนึ่งทับได้ทันทีในบรรทัดเดียว ไม่ต้องเขียน if แยกกรณีตัวที่เจอครั้งแรก",
    "hint_en": "A dict has .get(key, fallback), which returns the fallback when the key is absent. With 0 as the fallback you can add one straight onto it in a single line — no if for the first occurrence.",
    "test_cases": [
      {
        "input": [
          "aba"
        ],
        "output": {
          "a": 2,
          "b": 1
        }
      },
      {
        "input": [
          ""
        ],
        "output": {}
      },
      {
        "input": [
          "x"
        ],
        "output": {
          "x": 1
        }
      },
      {
        "input": [
          "aab"
        ],
        "output": {
          "a": 2,
          "b": 1
        }
      }
    ]
  },
  {
    "difficulty": "hard",
    "title_th": "ผลรวมย่อยสูงสุด / อัลกอริทึมของ Kadane (Max Subarray Sum)",
    "title_en": "Maximum Subarray Sum",
    "desc_th": "เขียนฟังก์ชัน \"max_sub_array(nums)\" หาผลรวมของอาร์เรย์ย่อยที่มีค่ามากที่สุด (Kadane Algorithm)",
    "desc_en": "Write a function \"max_sub_array(nums)\" finding the maximum contiguous subarray sum.",
    "initial_code": "def max_sub_array(nums):\n    max_so_far = nums[0]\n    curr_max = nums[0]\n    for i in range(1, len(nums)):\n        curr_max = max(nums[i], curr_max + nums[i])\n        max_so_far = max(max_so_far, curr_max)\n    return max_so_far",
    "starter_code": "def max_sub_array(nums):\n    max_so_far = nums[0]\n    curr_max = nums[0]\n    for i in range(1, len(nums)):\n        # TODO: curr_max = ค่าที่มากกว่า ระหว่าง nums[i] กับ curr_max + nums[i]\n        # TODO: max_so_far = ค่าที่มากกว่า ระหว่าง max_so_far กับ curr_max\n        pass\n    return max_so_far",
    "work_chars": 81,
    "hint_th": "ทุกตำแหน่งถามคำถามเดียว: \"เริ่มนับใหม่จากตัวนี้ (nums[i]) หรือต่อจากของเดิม (curr_max + nums[i]) อันไหนดีกว่า\" ใช้ max() เลือก แล้วค่อยเก็บสถิติสูงสุดไว้ที่ max_so_far",
    "hint_en": "At each position ask one question: start fresh at nums[i], or extend with curr_max + nums[i]? max() picks, then max_so_far records the best ever seen.",
    "test_cases": [
      {
        "input": [
          [
            -2,
            1,
            -3,
            4,
            -1,
            2,
            1,
            -5,
            4
          ]
        ],
        "output": 6
      },
      {
        "input": [
          [
            1
          ]
        ],
        "output": 1
      },
      {
        "input": [
          [
            -1,
            -2
          ]
        ],
        "output": -1
      },
      {
        "input": [
          [
            1,
            2,
            3
          ]
        ],
        "output": 6
      }
    ]
  },
  {
    "difficulty": "hard",
    "title_th": "ความยาวสับสตริงที่ไม่มีอักขระซ้ำ (Longest Substring Without Repeating)",
    "title_en": "Longest Substring Without Repeating Characters",
    "desc_th": "เขียนฟังก์ชัน \"length_of_longest_substring(s)\" หาความยาวสตริงย่อยที่ไม่มีอักขระซ้ำกันเลย",
    "desc_en": "Write a function \"length_of_longest_substring(s)\" finding max length of substring without repeating characters.",
    "initial_code": "def length_of_longest_substring(s):\n    char_map = {}\n    left = 0\n    max_len = 0\n    for right, char in enumerate(s):\n        if char in char_map and char_map[char] >= left:\n            left = char_map[char] + 1\n        char_map[char] = right\n        max_len = max(max_len, right - left + 1)\n    return max_len",
    "starter_code": "def length_of_longest_substring(s):\n    char_map = {}\n    left = 0\n    max_len = 0\n    for right, char in enumerate(s):\n        # TODO: ถ้า char เคยเจอแล้ว และตำแหน่งเดิม >= left ให้เลื่อน left = char_map[char] + 1\n        char_map[char] = right\n        max_len = max(max_len, right - left + 1)\n    return max_len",
    "work_chars": 72,
    "hint_th": "คิดเป็นหน้าต่างที่มีขอบซ้าย (left) กับขวา ถ้าเจอตัวอักษรซ้ำ \"ในหน้าต่างปัจจุบัน\" ให้เลื่อน left ไปหลังตำแหน่งเดิมของมัน — เงื่อนไข char_map[char] >= left คือสิ่งที่บอกว่าซ้ำอยู่ในหน้าต่างจริง ไม่ใช่ซ้ำที่หลุดไปแล้ว",
    "hint_en": "Think of a window with a left and right edge. On a repeat INSIDE the window, move left past the old position — the char_map[char] >= left test is what tells a genuine repeat from one the window already left behind.",
    "test_cases": [
      {
        "input": [
          "abcabcbb"
        ],
        "output": 3
      },
      {
        "input": [
          "bbbbb"
        ],
        "output": 1
      },
      {
        "input": [
          ""
        ],
        "output": 0
      },
      {
        "input": [
          "pwwkew"
        ],
        "output": 3
      },
      {
        "input": [
          "abcdef"
        ],
        "output": 6
      }
    ]
  },
  {
    "difficulty": "hard",
    "title_th": "ระบบจำลองแคช LRU (LRU Cache Simulator)",
    "title_en": "LRU Cache Simulator",
    "desc_th": "เขียนฟังก์ชัน \"simulate_lru(capacity, operations)\" คืนค่าผลลัพธ์ของคำสั่ง Get/Put ตามลำดับ LRU Cache",
    "desc_en": "Write a function \"simulate_lru(capacity, operations)\" simulating Least Recently Used Cache.",
    "initial_code": "def simulate_lru(capacity, ops):\n    from collections import OrderedDict\n    cache = OrderedDict()\n    res = []\n    for op, key, val in ops:\n        if op == \"put\":\n            if key in cache:\n                cache.move_to_end(key)\n            cache[key] = val\n            if len(cache) > capacity:\n                cache.popitem(last=False)\n        elif op == \"get\":\n            if key in cache:\n                cache.move_to_end(key)\n                res.append(cache[key])\n            else:\n                res.append(-1)\n    return res",
    "starter_code": "def simulate_lru(capacity, ops):\n    from collections import OrderedDict\n    cache = OrderedDict()\n    res = []\n    for op, key, val in ops:\n        if op == \"put\":\n            if key in cache:\n                cache.move_to_end(key)\n            cache[key] = val\n            # TODO: ถ้าขนาด cache เกิน capacity ให้เอาตัวเก่าสุดออกด้วย cache.popitem(last=False)\n        elif op == \"get\":\n            # TODO: ถ้า key อยู่ใน cache ให้ move_to_end(key) แล้ว append ค่านั้นลง res\n            #       ถ้าไม่มี ให้ append -1\n            pass\n    return res",
    "work_chars": 91,
    "hint_th": "OrderedDict จำลำดับการใช้งาน move_to_end บอกว่า \"เพิ่งใช้ตัวนี้\" และ popitem(last=False) เอาตัวที่เก่าสุดออก ส่วน get ที่ไม่เจอต้อง append -1 ไม่ใช่ข้ามไป",
    "hint_en": "OrderedDict remembers usage order: move_to_end marks something as just used, popitem(last=False) evicts the oldest. A get that misses must append -1, not skip.",
    "test_cases": [
      {
        "input": [
          2,
          [
            [
              "put",
              1,
              1
            ],
            [
              "put",
              2,
              2
            ],
            [
              "get",
              1,
              null
            ],
            [
              "put",
              3,
              3
            ],
            [
              "get",
              2,
              null
            ]
          ]
        ],
        "output": [
          1,
          -1
        ]
      },
      {
        "input": [
          1,
          [
            [
              "put",
              1,
              1
            ],
            [
              "put",
              2,
              2
            ],
            [
              "get",
              1,
              null
            ]
          ]
        ],
        "output": [
          -1
        ]
      },
      {
        "input": [
          2,
          [
            [
              "put",
              1,
              1
            ],
            [
              "get",
              1,
              null
            ]
          ]
        ],
        "output": [
          1
        ]
      },
      {
        "input": [
          2,
          [
            [
              "get",
              5,
              null
            ]
          ]
        ],
        "output": [
          -1
        ]
      }
    ]
  },
  {
    "difficulty": "hard",
    "title_th": "กักเก็บน้ำฝน (Trapping Rain Water)",
    "title_en": "Trapping Rain Water",
    "desc_th": "เขียนฟังก์ชัน \"trap(height)\" คำนวณปริมาณน้ำฝนที่ขังอยู่ระหว่างความสูงของแท่งกราฟ",
    "desc_en": "Write a function \"trap(height)\" calculating total trapped rainwater.",
    "initial_code": "def trap(height):\n    if not height:\n        return 0\n    l, r = 0, len(height) - 1\n    left_max, right_max = height[l], height[r]\n    water = 0\n    while l < r:\n        if left_max < right_max:\n            l += 1\n            left_max = max(left_max, height[l])\n            water += left_max - height[l]\n        else:\n            r -= 1\n            right_max = max(right_max, height[r])\n            water += right_max - height[r]\n    return water",
    "starter_code": "def trap(height):\n    if not height:\n        return 0\n    l, r = 0, len(height) - 1\n    left_max, right_max = height[l], height[r]\n    water = 0\n    while l < r:\n        if left_max < right_max:\n            l += 1\n            left_max = max(left_max, height[l])\n            # TODO: น้ำที่ขังตรงนี้คือ left_max - height[l] — บวกเข้ากับ water\n        else:\n            r -= 1\n            right_max = max(right_max, height[r])\n            # TODO: ทำแบบเดียวกันจากฝั่งขวา (right_max - height[r])\n    return water",
    "work_chars": 59,
    "hint_th": "น้ำที่ขังบนแต่ละช่องคือ ความสูงกำแพงที่เตี้ยกว่าในสองฝั่ง ลบ ความสูงพื้นช่องนั้น เพราะเดินจากฝั่งที่กำแพงเตี้ยกว่าเสมอ left_max/right_max จึงเป็นตัวจำกัดอยู่แล้ว น้ำจึงไม่เคยติดลบ",
    "hint_en": "Water above a cell is the shorter of the two side walls minus that cell's own height. Because you always advance from the shorter wall, left_max/right_max are already the limiting one — so the amount is never negative.",
    "test_cases": [
      {
        "input": [
          [
            0,
            1,
            0,
            2,
            1,
            0,
            1,
            3,
            2,
            1,
            2,
            1
          ]
        ],
        "output": 6
      },
      {
        "input": [
          []
        ],
        "output": 0
      },
      {
        "input": [
          [
            4,
            2,
            3
          ]
        ],
        "output": 1
      },
      {
        "input": [
          [
            3,
            0,
            3
          ]
        ],
        "output": 3
      }
    ]
  },
  {
    "difficulty": "hard",
    "title_th": "รวบรวม K อาร์เรย์ที่เรียงแล้ว (Merge K Sorted Lists)",
    "title_en": "Merge K Sorted Lists",
    "desc_th": "เขียนฟังก์ชัน \"merge_k_lists(lists)\" เพื่อรวม K อาร์เรย์ที่เรียงลำดับแล้วให้กลายเป็นอาร์เรย์เดียวที่เรียงลำดับสมบูรณ์",
    "desc_en": "Write a function \"merge_k_lists(lists)\" merging K sorted lists into one sorted array.",
    "initial_code": "def merge_k_lists(lists):\n    flat = []\n    for sub in lists:\n        flat.extend(sub)\n    return sorted(flat)",
    "starter_code": "def merge_k_lists(lists):\n    flat = []\n    for sub in lists:\n        # TODO: เอาสมาชิกทุกตัวใน sub มาต่อเข้ากับ flat\n        pass\n    # TODO: คืน flat ที่เรียงลำดับแล้ว (sorted)\n    return [-1]",
    "work_chars": 35,
    "hint_th": "ไม่ต้องรวมแบบฉลาด เอาทุกตัวมากองรวมกันด้วย extend แล้ว sorted() ทีเดียวตอนท้ายก็ได้คำตอบที่ถูก",
    "hint_en": "No clever merging needed: extend everything into one pile, then sorted() once at the end gives the right answer.",
    "test_cases": [
      {
        "input": [
          [
            [
              1,
              4,
              5
            ],
            [
              1,
              3,
              4
            ],
            [
              2,
              6
            ]
          ]
        ],
        "output": [
          1,
          1,
          2,
          3,
          4,
          4,
          5,
          6
        ]
      },
      {
        "input": [
          []
        ],
        "output": []
      },
      {
        "input": [
          [
            [
              1
            ]
          ]
        ],
        "output": [
          1
        ]
      },
      {
        "input": [
          [
            [
              2
            ],
            [
              1
            ]
          ]
        ],
        "output": [
          1,
          2
        ]
      }
    ]
  },
  {
    "difficulty": "easy",
    "title_th": "นับจำนวนคำ (Count Words)",
    "title_en": "Count Words",
    "desc_th": "เขียนฟังก์ชัน `count_words(s)` คืนค่าจำนวนคำในประโยค (คั่นด้วยช่องว่าง)",
    "desc_en": "Write a function `count_words(s)` returning the number of words in a sentence.",
    "initial_code": "def count_words(s):\n    return len(s.split())",
    "starter_code": "def count_words(s):\n    # TODO: แยกคำด้วย s.split() แล้วนับจำนวนด้วย len()\n    return -1",
    "work_chars": 21,
    "hint_th": "s.split() ตัดคำด้วยช่องว่างให้เป็นลิสต์ แล้ว len() นับจำนวนสมาชิก ต่อกันได้เลย: len(s.split())",
    "hint_en": "s.split() cuts the text into a list on whitespace, and len() counts a list's items. Chain them: len(s.split()).",
    "test_cases": [
      {
        "input": [
          "hello world"
        ],
        "output": 2
      },
      {
        "input": [
          ""
        ],
        "output": 0
      },
      {
        "input": [
          "one"
        ],
        "output": 1
      },
      {
        "input": [
          "a b c d"
        ],
        "output": 4
      },
      {
        "input": [
          "  spaced   out  "
        ],
        "output": 2
      }
    ]
  },
  {
    "difficulty": "easy",
    "title_th": "ผลรวม 1 ถึง n (Sum To N)",
    "title_en": "Sum To N",
    "desc_th": "เขียนฟังก์ชัน `sum_to_n(n)` คืนค่าผลรวมของเลข 1 ถึง n",
    "desc_en": "Write a function `sum_to_n(n)` returning the sum of integers from 1 to n.",
    "initial_code": "def sum_to_n(n):\n    if n <= 0:\n        return 0\n    total = 0\n    for i in range(1, n + 1):\n        total += i\n    return total",
    "starter_code": "def sum_to_n(n):\n    if n <= 0:\n        return 0\n    total = 0\n    for i in range(1, n + 1):\n        # TODO: บวก i เข้ากับ total\n        pass\n    return total",
    "work_chars": 10,
    "hint_th": "range(1, n + 1) ให้ 1 ถึง n — ต้อง +1 เพราะ range ไม่รวมตัวสุดท้าย แล้วบวกเข้า total ในลูป",
    "hint_en": "range(1, n + 1) yields 1 through n — the +1 matters because range excludes its end value. Add each i into total inside the loop.",
    "test_cases": [
      {
        "input": [
          5
        ],
        "output": 15
      },
      {
        "input": [
          1
        ],
        "output": 1
      },
      {
        "input": [
          0
        ],
        "output": 0
      },
      {
        "input": [
          10
        ],
        "output": 55
      },
      {
        "input": [
          100
        ],
        "output": 5050
      }
    ]
  },
  {
    "difficulty": "easy",
    "title_th": "ตัวอักษรพิมพ์ใหญ่ทั้งหมด (To Upper)",
    "title_en": "To Upper Case",
    "desc_th": "เขียนฟังก์ชัน `to_upper(s)` แปลงข้อความเป็นตัวพิมพ์ใหญ่ทั้งหมด",
    "desc_en": "Write a function `to_upper(s)` converting text to upper case.",
    "initial_code": "def to_upper(s):\n    return s.upper()",
    "starter_code": "def to_upper(s):\n    # TODO: คืนสตริงตัวพิมพ์ใหญ่ทั้งหมด — สตริงมีเมธอด .upper()\n    return \"\"",
    "work_chars": 16,
    "hint_th": "สตริงมีเมธอด .upper() คืนสตริงใหม่เป็นตัวพิมพ์ใหญ่ (ไม่ได้แก้ตัวเดิม) จึงต้อง return ค่าที่มันคืนมา",
    "hint_en": "Strings have .upper(), which returns a NEW uppercase string rather than changing the original — so return what it gives back.",
    "test_cases": [
      {
        "input": [
          "abc"
        ],
        "output": "ABC"
      },
      {
        "input": [
          ""
        ],
        "output": ""
      },
      {
        "input": [
          "MiXeD"
        ],
        "output": "MIXED"
      },
      {
        "input": [
          "a1b2"
        ],
        "output": "A1B2"
      },
      {
        "input": [
          "hello world"
        ],
        "output": "HELLO WORLD"
      }
    ]
  },
  {
    "difficulty": "easy",
    "title_th": "นับเลขคู่ในรายการ (Count Evens)",
    "title_en": "Count Evens",
    "desc_th": "เขียนฟังก์ชัน `count_evens(nums)` คืนค่าจำนวนเลขคู่ในรายการ",
    "desc_en": "Write a function `count_evens(nums)` returning how many even numbers are in the list.",
    "initial_code": "def count_evens(nums):\n    count = 0\n    for n in nums:\n        if n % 2 == 0:\n            count += 1\n    return count",
    "starter_code": "def count_evens(nums):\n    count = 0\n    for n in nums:\n        # TODO: ถ้า n เป็นเลขคู่ (n % 2 == 0) ให้ count เพิ่มขึ้น 1\n        pass\n    return count",
    "work_chars": 24,
    "hint_th": "รวมสองแนวคิดเข้าด้วยกัน: ตรวจเลขคู่ด้วยเศษจากการหาร n % 2 == 0 แล้วเพิ่มตัวนับขึ้นหนึ่งด้วย += เมื่อเงื่อนไขเป็นจริงเท่านั้น",
    "hint_en": "Two ideas combined: test evenness with the remainder, n % 2 == 0, then bump the counter by one with += only when that holds.",
    "test_cases": [
      {
        "input": [
          [
            1,
            2,
            3,
            4
          ]
        ],
        "output": 2
      },
      {
        "input": [
          []
        ],
        "output": 0
      },
      {
        "input": [
          [
            1,
            3,
            5
          ]
        ],
        "output": 0
      },
      {
        "input": [
          [
            2,
            4,
            6
          ]
        ],
        "output": 3
      },
      {
        "input": [
          [
            0,
            -2,
            7
          ]
        ],
        "output": 2
      }
    ]
  },
  {
    "difficulty": "easy",
    "title_th": "ค่าเฉลี่ยของรายการ (Average)",
    "title_en": "Average of List",
    "desc_th": "เขียนฟังก์ชัน `average(nums)` คืนค่าเฉลี่ยของตัวเลขในรายการ (รายการว่างคืน 0)",
    "desc_en": "Write a function `average(nums)` returning the mean of the list (0 for an empty list).",
    "initial_code": "def average(nums):\n    if not nums:\n        return 0\n    return sum(nums) / len(nums)",
    "starter_code": "def average(nums):\n    if not nums:\n        return 0\n    # TODO: คืนผลรวม sum(nums) หารด้วยจำนวนสมาชิก len(nums)\n    return -1",
    "work_chars": 28,
    "hint_th": "sum(nums) / len(nums) — ใช้ / (ได้ทศนิยม) ไม่ใช่ // (ปัดเศษทิ้ง) บรรทัด if ที่ให้มากันหารด้วยศูนย์ไว้แล้ว",
    "hint_en": "sum(nums) / len(nums). Use / for a real decimal, not // which floors it. The if already guards against dividing by zero.",
    "test_cases": [
      {
        "input": [
          [
            2,
            4
          ]
        ],
        "output": 3
      },
      {
        "input": [
          []
        ],
        "output": 0
      },
      {
        "input": [
          [
            5
          ]
        ],
        "output": 5
      },
      {
        "input": [
          [
            1,
            2,
            3,
            4
          ]
        ],
        "output": 2.5
      },
      {
        "input": [
          [
            -2,
            2
          ]
        ],
        "output": 0
      }
    ]
  },
  {
    "difficulty": "medium",
    "title_th": "หาตัวที่ปรากฏบ่อยที่สุด (Most Frequent)",
    "title_en": "Most Frequent Element",
    "desc_th": "เขียนฟังก์ชัน `most_frequent(nums)` คืนค่าตัวเลขที่ปรากฏบ่อยที่สุด (ถ้าเท่ากันให้คืนตัวที่เจอก่อน)",
    "desc_en": "Write a function `most_frequent(nums)` returning the most common value (earliest on a tie).",
    "initial_code": "def most_frequent(nums):\n    best = None\n    best_count = 0\n    for n in nums:\n        c = nums.count(n)\n        if c > best_count:\n            best = n\n            best_count = c\n    return best",
    "starter_code": "def most_frequent(nums):\n    best = None\n    best_count = 0\n    for n in nums:\n        c = nums.count(n)\n        # TODO: ถ้า c มากกว่า best_count ให้ best = n และ best_count = c\n        pass\n    return best",
    "work_chars": 40,
    "hint_th": "nums.count(n) นับจำนวนครั้งที่ n ปรากฏ (ให้มาแล้ว) เหลือแค่เก็บตัวที่นับได้มากสุด อัปเดตทั้ง best และ best_count พร้อมกัน ไม่งั้นการเทียบครั้งต่อไปจะเพี้ยน",
    "hint_en": "nums.count(n) counts occurrences (already given). You only need to keep the highest — update best AND best_count together, or the next comparison is wrong.",
    "test_cases": [
      {
        "input": [
          [
            1,
            2,
            2,
            3
          ]
        ],
        "output": 2
      },
      {
        "input": [
          [
            4
          ]
        ],
        "output": 4
      },
      {
        "input": [
          [
            1,
            1,
            2,
            2
          ]
        ],
        "output": 1
      },
      {
        "input": [
          [
            5,
            6,
            6,
            6,
            5
          ]
        ],
        "output": 6
      },
      {
        "input": [
          [
            9,
            8,
            8
          ]
        ],
        "output": 8
      }
    ]
  },
  {
    "difficulty": "medium",
    "title_th": "สลับตัวพิมพ์ (Swap Case)",
    "title_en": "Swap Case",
    "desc_th": "เขียนฟังก์ชัน `swap_case(s)` สลับตัวพิมพ์เล็กเป็นใหญ่และใหญ่เป็นเล็ก",
    "desc_en": "Write a function `swap_case(s)` swapping upper and lower case.",
    "initial_code": "def swap_case(s):\n    return s.swapcase()",
    "starter_code": "def swap_case(s):\n    # TODO: สลับตัวพิมพ์เล็ก/ใหญ่ — สตริงมีเมธอด .swapcase()\n    return \"\"",
    "work_chars": 19,
    "hint_th": "Python มี .swapcase() ให้อยู่แล้ว สลับพิมพ์เล็กเป็นใหญ่และใหญ่เป็นเล็กในครั้งเดียว ไม่ต้องวนทีละตัว",
    "hint_en": "Python already has .swapcase(), which flips lower to upper and upper to lower in one go — no loop required.",
    "test_cases": [
      {
        "input": [
          "AbC"
        ],
        "output": "aBc"
      },
      {
        "input": [
          ""
        ],
        "output": ""
      },
      {
        "input": [
          "abc"
        ],
        "output": "ABC"
      },
      {
        "input": [
          "A1b"
        ],
        "output": "a1B"
      },
      {
        "input": [
          "Hello World"
        ],
        "output": "hELLO wORLD"
      }
    ]
  },
  {
    "difficulty": "medium",
    "title_th": "รายการซ้อนให้แบนราบ (Flatten List)",
    "title_en": "Flatten Nested List",
    "desc_th": "เขียนฟังก์ชัน `flatten(lists)` รวมรายการซ้อนชั้นเดียวให้เป็นรายการเดียว",
    "desc_en": "Write a function `flatten(lists)` flattening a list of lists by one level.",
    "initial_code": "def flatten(lists):\n    out = []\n    for sub in lists:\n        out.extend(sub)\n    return out",
    "starter_code": "def flatten(lists):\n    out = []\n    for sub in lists:\n        # TODO: เอาสมาชิกทุกตัวใน sub ใส่ลงใน out\n        pass\n    return out",
    "work_chars": 15,
    "hint_th": "ลิสต์มีเมธอด .extend() ที่เอา \"สมาชิกทุกตัว\" ของอีกลิสต์มาต่อท้าย ต่างจาก .append() ที่จะยัดลิสต์ทั้งก้อนลงไปเป็นสมาชิกตัวเดียว",
    "hint_en": "Lists have .extend(), which appends every ITEM of another list, unlike .append(), which would drop the whole list in as a single element.",
    "test_cases": [
      {
        "input": [
          [
            [
              1,
              2
            ],
            [
              3
            ]
          ]
        ],
        "output": [
          1,
          2,
          3
        ]
      },
      {
        "input": [
          []
        ],
        "output": []
      },
      {
        "input": [
          [
            [],
            []
          ]
        ],
        "output": []
      },
      {
        "input": [
          [
            [
              1
            ],
            [
              2
            ],
            [
              3
            ]
          ]
        ],
        "output": [
          1,
          2,
          3
        ]
      },
      {
        "input": [
          [
            [
              5,
              6
            ],
            [],
            [
              7
            ]
          ]
        ],
        "output": [
          5,
          6,
          7
        ]
      }
    ]
  },
  {
    "difficulty": "medium",
    "title_th": "ตัวเลขที่หายไป (Missing Number)",
    "title_en": "Missing Number",
    "desc_th": "เขียนฟังก์ชัน `missing_number(nums, n)` หาตัวเลขที่หายไปจากชุด 1 ถึง n",
    "desc_en": "Write a function `missing_number(nums, n)` finding the missing value from 1..n.",
    "initial_code": "def missing_number(nums, n):\n    return n * (n + 1) // 2 - sum(nums)",
    "starter_code": "def missing_number(nums, n):\n    # TODO: ผลรวมของ 1..n คือ n * (n + 1) // 2 — ลบด้วย sum(nums) จะได้ตัวที่หายไป\n    return -1",
    "work_chars": 35,
    "hint_th": "ผลรวม 1..n หาได้ด้วยสูตร n * (n + 1) // 2 โดยไม่ต้องวนลูป เอาลบด้วย sum(nums) ส่วนที่ขาดคือตัวที่หายไป — ใช้ // เพราะผลลัพธ์เป็นจำนวนเต็ม",
    "hint_en": "The sum of 1..n is n * (n + 1) // 2 with no loop at all. Subtract sum(nums) and the shortfall is the missing value — use // to keep it an integer.",
    "test_cases": [
      {
        "input": [
          [
            1,
            2,
            4
          ],
          4
        ],
        "output": 3
      },
      {
        "input": [
          [
            2
          ],
          2
        ],
        "output": 1
      },
      {
        "input": [
          [
            1
          ],
          2
        ],
        "output": 2
      },
      {
        "input": [
          [
            1,
            2,
            3,
            5
          ],
          5
        ],
        "output": 4
      },
      {
        "input": [
          [
            2,
            3,
            4,
            5
          ],
          5
        ],
        "output": 1
      }
    ]
  },
  {
    "difficulty": "medium",
    "title_th": "นับตัวอักษรที่ไม่ซ้ำ (Count Unique Chars)",
    "title_en": "Count Unique Characters",
    "desc_th": "เขียนฟังก์ชัน `count_unique(s)` คืนค่าจำนวนตัวอักษรที่ไม่ซ้ำกัน",
    "desc_en": "Write a function `count_unique(s)` returning how many distinct characters appear.",
    "initial_code": "def count_unique(s):\n    return len(set(s))",
    "starter_code": "def count_unique(s):\n    # TODO: set(s) เก็บตัวอักษรที่ไม่ซ้ำ แล้วนับด้วย len()\n    return -1",
    "work_chars": 18,
    "hint_th": "set() ทิ้งตัวซ้ำทั้งหมดโดยอัตโนมัติ จึงเหลือแค่ len(set(s)) ไม่ต้องเทียบทีละคู่",
    "hint_en": "set() drops every duplicate automatically, so len(set(s)) is the whole answer — no pairwise comparison needed.",
    "test_cases": [
      {
        "input": [
          "aab"
        ],
        "output": 2
      },
      {
        "input": [
          ""
        ],
        "output": 0
      },
      {
        "input": [
          "abc"
        ],
        "output": 3
      },
      {
        "input": [
          "aaaa"
        ],
        "output": 1
      },
      {
        "input": [
          "abab"
        ],
        "output": 2
      }
    ]
  },
  {
    "difficulty": "hard",
    "title_th": "ราคาหุ้นกำไรสูงสุด (Best Time To Buy)",
    "title_en": "Best Time To Buy And Sell Stock",
    "desc_th": "เขียนฟังก์ชัน `max_profit(prices)` หากำไรสูงสุดจากการซื้อครั้งเดียวขายครั้งเดียว (ถ้าไม่มีกำไรคืน 0)",
    "desc_en": "Write a function `max_profit(prices)` returning the best single buy/sell profit (0 if none).",
    "initial_code": "def max_profit(prices):\n    if not prices:\n        return 0\n    low = prices[0]\n    best = 0\n    for p in prices[1:]:\n        best = max(best, p - low)\n        low = min(low, p)\n    return best",
    "starter_code": "def max_profit(prices):\n    if not prices:\n        return 0\n    low = prices[0]\n    best = 0\n    for p in prices[1:]:\n        # TODO: best = กำไรที่มากกว่า ระหว่าง best กับ p - low\n        # TODO: low = ราคาที่ต่ำกว่า ระหว่าง low กับ p\n        pass\n    return best",
    "work_chars": 42,
    "hint_th": "เดินครั้งเดียวโดยจำ \"ราคาต่ำสุดที่เคยเจอ\" ไว้ กำไรที่ทำได้วันนี้คือ p - low ต้องคิดกำไรก่อนแล้วจึงอัปเดต low ไม่งั้นจะกลายเป็นซื้อและขายวันเดียวกัน",
    "hint_en": "One pass, remembering the lowest price so far: today's profit is p - low. Compute the profit BEFORE updating low, or you would be buying and selling on the same day.",
    "test_cases": [
      {
        "input": [
          [
            7,
            1,
            5,
            3,
            6,
            4
          ]
        ],
        "output": 5
      },
      {
        "input": [
          [
            7,
            6,
            4,
            3,
            1
          ]
        ],
        "output": 0
      },
      {
        "input": [
          []
        ],
        "output": 0
      },
      {
        "input": [
          [
            1,
            2
          ]
        ],
        "output": 1
      },
      {
        "input": [
          [
            3,
            3,
            3
          ]
        ],
        "output": 0
      }
    ]
  },
  {
    "difficulty": "hard",
    "title_th": "จัดกลุ่มคำสลับอักษร (Group Anagrams)",
    "title_en": "Group Anagrams Count",
    "desc_th": "เขียนฟังก์ชัน `group_anagrams_count(words)` คืนค่าจำนวนกลุ่มของคำที่เป็นแอนนาแกรมกัน",
    "desc_en": "Write a function `group_anagrams_count(words)` returning how many anagram groups exist.",
    "initial_code": "def group_anagrams_count(words):\n    groups = set()\n    for w in words:\n        groups.add(\"\".join(sorted(w)))\n    return len(groups)",
    "starter_code": "def group_anagrams_count(words):\n    groups = set()\n    for w in words:\n        # TODO: เรียงตัวอักษรของ w แล้วต่อกลับเป็นสตริง \"\".join(sorted(w)) ใส่ลง groups\n        pass\n    return len(groups)",
    "work_chars": 30,
    "hint_th": "คำที่เป็นอนาแกรมกันจะได้ \"ลายนิ้วมือ\" เดียวกันเมื่อเรียงตัวอักษร ใช้ \"\".join(sorted(w)) แปลงกลับเป็นสตริงก่อน เพราะลิสต์ใส่ใน set ไม่ได้ แล้ว set จะรวมกลุ่มซ้ำให้เอง",
    "hint_en": "Anagrams share a fingerprint once their letters are sorted. Convert back to a string with \"\".join(sorted(w)) — a list cannot go into a set — and the set collapses the duplicates for you.",
    "test_cases": [
      {
        "input": [
          [
            "eat",
            "tea",
            "tan"
          ]
        ],
        "output": 2
      },
      {
        "input": [
          []
        ],
        "output": 0
      },
      {
        "input": [
          [
            "abc"
          ]
        ],
        "output": 1
      },
      {
        "input": [
          [
            "ab",
            "ba",
            "cd"
          ]
        ],
        "output": 2
      },
      {
        "input": [
          [
            "a",
            "a",
            "a"
          ]
        ],
        "output": 1
      }
    ]
  },
  {
    "difficulty": "hard",
    "title_th": "ผลคูณยกเว้นตัวเอง (Product Except Self)",
    "title_en": "Product Of Array Except Self",
    "desc_th": "เขียนฟังก์ชัน `product_except_self(nums)` คืนอาร์เรย์ที่แต่ละตำแหน่งคือผลคูณของสมาชิกอื่นทั้งหมด",
    "desc_en": "Write a function `product_except_self(nums)` where each position is the product of all other elements.",
    "initial_code": "def product_except_self(nums):\n    out = []\n    for i in range(len(nums)):\n        p = 1\n        for j, v in enumerate(nums):\n            if i != j:\n                p *= v\n        out.append(p)\n    return out",
    "starter_code": "def product_except_self(nums):\n    out = []\n    for i in range(len(nums)):\n        p = 1\n        for j, v in enumerate(nums):\n            # TODO: คูณ v เข้ากับ p เฉพาะตอนที่ j ไม่เท่ากับ i\n            pass\n        out.append(p)\n    return out",
    "work_chars": 16,
    "hint_th": "ลูปในซ้อนลูปนอก: ลูปนอกเลือกตำแหน่งที่จะ \"เว้น\" ลูปในคูณทุกตัวยกเว้นตำแหน่งนั้น เงื่อนไข i != j คือสิ่งที่เว้นมันออก",
    "hint_en": "A loop inside a loop: the outer picks which index to SKIP, the inner multiplies everything else. The i != j test is what does the skipping.",
    "test_cases": [
      {
        "input": [
          [
            1,
            2,
            3,
            4
          ]
        ],
        "output": [
          24,
          12,
          8,
          6
        ]
      },
      {
        "input": [
          []
        ],
        "output": []
      },
      {
        "input": [
          [
            2,
            3
          ]
        ],
        "output": [
          3,
          2
        ]
      },
      {
        "input": [
          [
            1,
            1,
            1
          ]
        ],
        "output": [
          1,
          1,
          1
        ]
      },
      {
        "input": [
          [
            5,
            0
          ]
        ],
        "output": [
          0,
          5
        ]
      }
    ]
  },
  {
    "difficulty": "hard",
    "title_th": "ลำดับต่อเนื่องยาวที่สุด (Longest Consecutive)",
    "title_en": "Longest Consecutive Sequence",
    "desc_th": "เขียนฟังก์ชัน `longest_consecutive(nums)` หาความยาวของลำดับเลขต่อเนื่องที่ยาวที่สุด",
    "desc_en": "Write a function `longest_consecutive(nums)` returning the length of the longest run of consecutive integers.",
    "initial_code": "def longest_consecutive(nums):\n    s = set(nums)\n    best = 0\n    for n in s:\n        if n - 1 not in s:\n            length = 1\n            while n + length in s:\n                length += 1\n            best = max(best, length)\n    return best",
    "starter_code": "def longest_consecutive(nums):\n    s = set(nums)\n    best = 0\n    for n in s:\n        if n - 1 not in s:\n            length = 1\n            # TODO: ตราบใดที่ n + length ยังอยู่ใน s ให้ length เพิ่มขึ้นเรื่อยๆ\n            best = max(best, length)\n    return best",
    "work_chars": 33,
    "hint_th": "นับเฉพาะจากตัวที่เป็น \"จุดเริ่มต้น\" ของชุด (เงื่อนไข n - 1 not in s ที่ให้มา) แล้วใช้ while ไล่ n + length ต่อขึ้นไปเรื่อยๆ การเช็คใน set เร็วกว่าในลิสต์มาก",
    "hint_en": "Only count from a value that STARTS a run (the given n - 1 not in s test), then walk upward with a while on n + length. Membership tests in a set are far faster than in a list.",
    "test_cases": [
      {
        "input": [
          [
            100,
            4,
            200,
            1,
            3,
            2
          ]
        ],
        "output": 4
      },
      {
        "input": [
          []
        ],
        "output": 0
      },
      {
        "input": [
          [
            1
          ]
        ],
        "output": 1
      },
      {
        "input": [
          [
            1,
            2,
            0,
            1
          ]
        ],
        "output": 3
      },
      {
        "input": [
          [
            5,
            10
          ]
        ],
        "output": 1
      }
    ]
  },
  {
    "difficulty": "hard",
    "title_th": "หมุนอาร์เรย์ (Rotate Array)",
    "title_en": "Rotate Array",
    "desc_th": "เขียนฟังก์ชัน `rotate(nums, k)` หมุนอาร์เรย์ไปทางขวา k ตำแหน่ง",
    "desc_en": "Write a function `rotate(nums, k)` rotating the array right by k positions.",
    "initial_code": "def rotate(nums, k):\n    if not nums:\n        return []\n    k = k % len(nums)\n    if k == 0:\n        return list(nums)\n    return nums[-k:] + nums[:-k]",
    "starter_code": "def rotate(nums, k):\n    if not nums:\n        return []\n    k = k % len(nums)\n    if k == 0:\n        return list(nums)\n    # TODO: เอา k ตัวท้าย (nums[-k:]) มาต่อหน้าส่วนที่เหลือ (nums[:-k])\n    return list(nums)",
    "work_chars": 28,
    "hint_th": "การหมุนคือการตัดแล้วสลับที่ nums[-k:] คือ k ตัวท้าย nums[:-k] คือส่วนที่เหลือ เอามาต่อกันตามลำดับนั้น สองบรรทัดที่ให้มาจัดการ k ที่ใหญ่กว่าลิสต์และกรณี k เป็น 0 ไว้แล้ว",
    "hint_en": "Rotating is slicing and swapping: nums[-k:] is the last k items, nums[:-k] the rest — join them in that order. The two given lines already handle a k larger than the list, and k of 0.",
    "test_cases": [
      {
        "input": [
          [
            1,
            2,
            3,
            4,
            5
          ],
          2
        ],
        "output": [
          4,
          5,
          1,
          2,
          3
        ]
      },
      {
        "input": [
          [],
          3
        ],
        "output": []
      },
      {
        "input": [
          [
            1,
            2,
            3
          ],
          0
        ],
        "output": [
          1,
          2,
          3
        ]
      },
      {
        "input": [
          [
            1,
            2
          ],
          3
        ],
        "output": [
          2,
          1
        ]
      },
      {
        "input": [
          [
            1,
            2,
            3
          ],
          3
        ],
        "output": [
          1,
          2,
          3
        ]
      }
    ]
  }
];

module.exports = { ARCADE_TASKS };
