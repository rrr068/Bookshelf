import db from '../connection.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function runMigrations() {
  const migrationsDir = __dirname;
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log('Running migrations...');

  db.exec('BEGIN TRANSACTION;');

  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      console.log(`Executing: ${file}`);
      db.exec(sql);
    }
    db.exec('COMMIT;');
    console.log('Migrations completed successfully');
  } catch (error) {
    db.exec('ROLLBACK;');
    console.error('Migration failed:', error);
    throw error;
  }
}
