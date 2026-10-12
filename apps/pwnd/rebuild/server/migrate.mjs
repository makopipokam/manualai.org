import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { getPool, closePool } from './db.mjs';

const MIGRATIONS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations');

function statements(sql) {
  return sql.split('\n').filter(line => !line.trim().startsWith('--')).join('\n')
    .split(/;\s*(?:\n|$)/).map(part => part.trim()).filter(Boolean);
}

// Applies every not-yet-recorded migration in file-name order. Safe to run on each
// start; overlapping instances during a rollout are serialized with GET_LOCK when
// available, and all DDL uses IF NOT EXISTS.
export async function runMigrations({ log = console.log } = {}) {
  const conn = await getPool().getConnection();
  let locked = false;
  try {
    try {
      const [[row]] = await conn.query("SELECT GET_LOCK('pwnd_migrations', 30) AS ok");
      locked = Number(row?.ok) === 1;
    } catch { /* GET_LOCK unsupported: rely on idempotent DDL */ }
    await conn.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      id VARCHAR(128) NOT NULL PRIMARY KEY,
      applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    )`);
    const [doneRows] = await conn.query('SELECT id FROM schema_migrations');
    const done = new Set(doneRows.map(row => row.id));
    const files = (await readdir(MIGRATIONS_DIR)).filter(name => name.endsWith('.sql')).sort();
    const applied = [];
    for (const file of files) {
      if (done.has(file)) continue;
      const sql = await readFile(path.join(MIGRATIONS_DIR, file), 'utf8');
      for (const statement of statements(sql)) await conn.query(statement);
      await conn.query('INSERT IGNORE INTO schema_migrations (id) VALUES (?)', [file]);
      applied.push(file);
    }
    if (applied.length) log(`[migrate] applied ${applied.join(', ')}`);
    else log('[migrate] schema up to date');
    return applied;
  } finally {
    if (locked) { try { await conn.query("SELECT RELEASE_LOCK('pwnd_migrations')"); } catch { /* ignore */ } }
    conn.release();
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  runMigrations().then(() => closePool()).catch(async error => {
    console.error('[migrate] failed', error);
    await closePool();
    process.exit(1);
  });
}
