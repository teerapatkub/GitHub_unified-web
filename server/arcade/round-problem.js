// The Arcade problem a round was drawn from: everything the grader, the code
// judge (its statement and starter) and the bots' answer banks need.
async function loadArcadeProblem(db, taskId) {
  if (taskId === undefined || taskId === null) return null;
  const [rows] = await db.query(`SELECT p.title_th, p.desc_th, p.test_kind, p.test_cases, p.solution_code, p.starter_code
    FROM problem_modes m JOIN problems p ON p.problem_id = m.problem_id
    WHERE m.mode = 'arcade' AND m.entry_id = ?`, [taskId]);
  return rows?.[0] || null;
}

const roundTaskIdOf = (room, roundNum) => (Array.isArray(room?.round_task_ids) ? room.round_task_ids[roundNum - 1] : undefined);

module.exports = { loadArcadeProblem, roundTaskIdOf };
