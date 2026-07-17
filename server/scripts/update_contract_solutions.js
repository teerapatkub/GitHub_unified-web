const path = require('path');
const db = require(path.resolve(__dirname, '../db'));

const CONTRACT_SOLUTIONS = {
  'Digital Pet Feeder': `current_hour = int(input("Current hour (0-23): "))
current_minute = int(input("Current minute (0-59): "))

current_total = current_hour * 60 + current_minute
target_total = 18 * 60

if current_total < target_total:
    minutes_left = target_total - current_total
    print(f"{minutes_left} minutes until 6:00 PM")
else:
    for _ in range(10):
        print("FEED ME NOW")`,

  'Sarcasm Detector for Parents': `def is_sarcastic(text):
    lowered = text.lower()
    words = text.split()
    has_all_caps = any(word.isupper() and len(word) > 1 for word in words)
    has_many_exclamations = text.count("!") > 3
    has_phrase = any(phrase in lowered for phrase in ["yeah sure", "totally", "obviously"])
    return has_all_caps or has_many_exclamations or has_phrase

examples = [
    "Yeah sure, I will clean it right now.",
    "THIS IS FINE!!!",
    "Thanks for helping with dinner."
]

for sentence in examples:
    print(sentence, "->", is_sarcastic(sentence))`,

  'Dungeon Snack Calculator': `warriors = int(input("Warriors: "))
mages = int(input("Mages: "))
rogues = int(input("Rogues: "))

total_sandwiches = (warriors * 4) + (mages * 2) + (rogues * 3)
print("Total sandwiches:", total_sandwiches)

if total_sandwiches >= 10:
    print("Satisfied")
else:
    print("Still Hungry")`,

  'Fix a broken print script': `item_name = input("Item name: ")
price = float(input("Price: "))

print("Welcome to the shop!")
print(f"Item: {item_name}")
print(f"Total price: {price:.2f}")`,

  'Temperature warning tool': `temperature = float(input())

if temperature > 35:
    print("Hot Warning")
else:
    print("Normal Weather")`,

  'Lemonade Stand Calculator': `lemons = int(input("lemons: "))
sugar_tbsp = int(input("sugar_tbsp: "))
water_oz = int(input("water_oz: "))

possible_from_lemons = lemons
possible_from_sugar = sugar_tbsp // 2
possible_from_water = water_oz // 8

max_cups = min(possible_from_lemons, possible_from_sugar, possible_from_water)

if max_cups == possible_from_lemons:
    limiting = "lemons"
elif max_cups == possible_from_sugar:
    limiting = "sugar"
else:
    limiting = "water"

print("Maximum cups:", max_cups)
print("Limiting ingredient:", limiting)`,

  'Dungeon Dice Roller': `import random
import re

expression = input("Dice expression: ").strip()
match = re.fullmatch(r"(\\d+)d(\\d+)([+-]\\d+)?", expression)

if not match:
    print("Invalid input")
else:
    dice_count = int(match.group(1))
    sides = int(match.group(2))
    modifier = int(match.group(3) or 0)

    rolls = [random.randint(1, sides) for _ in range(dice_count)]
    total = sum(rolls) + modifier

    print("Rolls:", rolls)
    print("Modifier:", modifier)
    print("Total:", total)`,

  'Pet Rock Emotional Support': `import random

adjectives = ["brilliant", "steady", "sparkly", "fearless", "gentle"]
nouns = ["rock", "friend", "champion", "legend", "star"]
verbs = ["shine", "persevere", "roll forward", "inspire", "stay strong"]
feelings = ["confidence", "joy", "calm", "courage", "hope"]
closings = ["Keep going!", "You've got this!", "The pebble path is yours.", "Believe in your sediment.", "Stay polished."]

used = set()
while len(used) < 3:
    sentence = f"You are a {random.choice(adjectives)} {random.choice(nouns)} who can {random.choice(verbs)} with {random.choice(feelings)}. {random.choice(closings)}"
    used.add(sentence)

for affirmation in used:
    print(affirmation)`,

  'Coffee Change Calculator': `price = float(input("Coffee price: "))
amount_paid = float(input("Amount paid: "))
tip_percent = float(input("Tip percentage: "))

total_with_tip = price + (price * tip_percent / 100)
change_due = round(amount_paid - total_with_tip, 2)
remaining_cents = round(change_due * 100)

quarters = remaining_cents // 25
remaining_cents %= 25
dimes = remaining_cents // 10
remaining_cents %= 10
nickels = remaining_cents // 5
remaining_cents %= 5
pennies = remaining_cents

print(f"Total with tip: {total_with_tip:.2f}")
print(f"Change due: {change_due:.2f}")
print(f"Quarters: {quarters}")
print(f"Dimes: {dimes}")
print(f"Nickels: {nickels}")
print(f"Pennies: {pennies}")`,

  'Password Validator': `password = input("Password: ")

if len(password) < 8:
    print("Rejected: too short.")
elif "password" in password.lower() or "123" in password:
    print("Rejected: painfully predictable.")
elif not any(ch.isupper() for ch in password):
    print("Rejected: add an uppercase letter.")
elif not any(ch.islower() for ch in password):
    print("Rejected: add a lowercase letter.")
elif not any(ch.isdigit() for ch in password):
    print("Rejected: add a digit.")
else:
    print("Approved. Miraculously decent password.")`,

  'Snail Race Tracker': `record_time = 45.2
results = []

for _ in range(5):
    name = input("Snail name: ")
    time = float(input("Time in seconds: "))
    results.append((name, time))

results.sort(key=lambda item: item[1])
medals = ["Gold", "Silver", "Bronze"]

for index, (name, time) in enumerate(results, start=1):
    medal = medals[index - 1] if index <= 3 else "-"
    print(f"{index}. {name} - {time:.1f}s - {medal}")
    if time < record_time:
        print(f"{name} beat the league record!")`,

  'Burger Math': `burgers = int(input("Burgers: "))
fries = int(input("Fries: "))
drinks = int(input("Drinks: "))

subtotal = (burgers * 5) + (fries * 3) + (drinks * 2)

if burgers > 0 and fries > 0 and drinks > 0:
    subtotal *= 0.9

total = subtotal * 1.08
print(f"Total: {total:.2f}")`,

  'Password Tantrum': `password = input("Password: ")
errors = []

if len(password) < 8:
    errors.append("Too short. Even my patience is longer.")
if not any(ch.isupper() for ch in password):
    errors.append("Needs an uppercase letter. Try effort.")
if not any(ch.islower() for ch in password):
    errors.append("Needs a lowercase letter too.")
if not any(ch.isdigit() for ch in password):
    errors.append("Numbers exist for a reason.")

if errors:
    for message in errors:
        print(message)
else:
    print("Approved, I guess")`,

  'Playlist Filler': `banned_songs = ["Baby Shark", "Macarena", "Friday", "Crazy Frog"]
warnings = 0

while warnings < 3:
    requested_song = input("Requested song: ").strip()
    if requested_song in banned_songs:
        warnings += 1
        print("ABSOLUTELY NOT - 3 warnings issued")
        if warnings == 3:
            print("FIRED")
            break
    else:
        print("Added to playlist")`,
};

const buildFallbackSolution = (contract) => {
  const requirements = contract.ai_requirements || {};
  const title = contract.title || 'Contract Task';
  const desc = String(requirements.desc || '').toLowerCase();

  if (desc.includes('input') && desc.includes('print')) {
    return `value = input("Enter value: ")\nprint(value)`;
  }

  return `# Solution for: ${title}\nprint("Task completed")`;
};

async function main() {
  const [rows] = await db.execute(
    'SELECT contract_id, title, ai_requirements FROM contracts ORDER BY contract_id'
  );

  let updated = 0;
  for (const row of rows) {
    const requirements =
      typeof row.ai_requirements === 'string'
        ? JSON.parse(row.ai_requirements)
        : { ...(row.ai_requirements || {}) };

    const solutionCode =
      CONTRACT_SOLUTIONS[row.title] || buildFallbackSolution({ ...row, ai_requirements: requirements });

    requirements.solutionCode = solutionCode;
    requirements.hasOfficialSolution = true;

    await db.execute(
      'UPDATE contracts SET ai_requirements = ?::jsonb WHERE contract_id = ?',
      [JSON.stringify(requirements), row.contract_id]
    );
    updated += 1;
  }

  console.log(`Updated solutionCode for ${updated} contracts.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
