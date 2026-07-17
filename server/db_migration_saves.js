const db = require('./db');

async function run() {
    console.log('Starting saves table migration...');
    
    // 1. Add columns if they do not exist
    await db.execute('ALTER TABLE simulation_saves ADD COLUMN IF NOT EXISTS slot_number INTEGER DEFAULT 1');
    await db.execute('ALTER TABLE simulation_saves ADD COLUMN IF NOT EXISTS is_locked INTEGER DEFAULT 0');
    console.log('Columns slot_number and is_locked ensured.');

    // 2. Clean up extra saves and assign slots 1, 2, 3
    const [users] = await db.execute('SELECT DISTINCT user_id FROM simulation_saves');
    
    for (const row of users) {
        const userId = row.user_id;
        const [saves] = await db.execute(
            'SELECT save_id, save_name, is_active FROM simulation_saves WHERE user_id = ? ORDER BY updated_at DESC',
            [userId]
        );
        
        console.log(`User ${userId} has ${saves.length} saves.`);
        
        for (let i = 0; i < saves.length; i++) {
            const save = saves[i];
            if (i < 3) {
                const slot = i + 1;
                await db.execute(
                    'UPDATE simulation_saves SET slot_number = ? WHERE save_id = ?',
                    [slot, save.save_id]
                );
            } else {
                console.log(`Deleting extra save ${save.save_id} for user ${userId}`);
                await db.execute('DELETE FROM simulation_saves WHERE save_id = ?', [save.save_id]);
            }
        }
    }

    // 3. Add unique constraint UNIQUE(user_id, slot_number)
    try {
        await db.execute('ALTER TABLE simulation_saves DROP CONSTRAINT IF EXISTS unique_user_slot');
        await db.execute('ALTER TABLE simulation_saves ADD CONSTRAINT unique_user_slot UNIQUE (user_id, slot_number)');
        console.log('Unique constraint unique_user_slot created.');
    } catch (err) {
        console.error('Failed to add unique constraint:', err.message);
    }
    
    console.log('Migration completed successfully!');
    process.exit(0);
}

run().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
