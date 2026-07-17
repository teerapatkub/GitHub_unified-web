const db = require('./db');
const fs = require('fs');
(async ()=>{
  try {
    const [dbName] = await db.query('SELECT DATABASE() AS db');
    const [tables] = await db.query('SHOW TABLES');
    const [version] = await db.query('SELECT VERSION() AS v');
    const out = {dbName, tables, version};
    fs.writeFileSync('db_state.json', JSON.stringify(out, null, 2));
    console.log('wrote db_state.json');
  } catch (err) {
    fs.writeFileSync('db_state.json', JSON.stringify({error: err.message || err}, null, 2));
  } finally {
    process.exit(0);
  }
})();