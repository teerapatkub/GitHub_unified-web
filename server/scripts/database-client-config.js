// Database settings for scripts that connect directly with `pg`.
//
// The application accepts DATABASE_URL for hosted Postgres providers such as
// Supabase, while older scripts used localhost defaults unconditionally. Keep
// read-only verification scripts on the same connection target as the server.
const fs = require('fs');
const path = require('path');

require('dotenv').config({
    path: path.join(__dirname, '..', '.env'),
    quiet: true,
});

const sslConfigFor = (host) => {
    if (String(process.env.PGSSLMODE || '').trim().toLowerCase() === 'disable') return false;

    const local = !host || /^(localhost|127\.0\.0\.1|::1|db)$/i.test(host) || !host.includes('.');
    if (!process.env.PGSSLMODE && local) return false;

    const caPath = String(process.env.PGSSLROOTCERT || '').trim();
    if (caPath) return { ca: fs.readFileSync(caPath, 'utf8'), rejectUnauthorized: true };
    return { rejectUnauthorized: false };
};

const databaseClientConfig = () => {
    const connectionString = String(process.env.DATABASE_URL || process.env.POSTGRES_URL || '').trim();
    if (connectionString) {
        let host = '';
        try { host = new URL(connectionString).hostname; } catch { /* pg reports an invalid URL itself */ }
        return { connectionString, ssl: sslConfigFor(host) };
    }

    return {
        host: process.env.PGHOST || 'localhost',
        port: Number(process.env.PGPORT || 5432),
        user: process.env.PGUSER || 'postgres',
        password: String(process.env.PGPASSWORD ?? 'postgres'),
        database: process.env.PGDATABASE || 'postgres',
        ssl: sslConfigFor(process.env.PGHOST || 'localhost'),
    };
};

module.exports = { databaseClientConfig };
