import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../../data/bookshelf.db');
const dbDir = path.dirname(dbPath);

// ディレクトリが存在しない場合は作成
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath, { verbose: console.log });

// WALモードを有効化（パフォーマンス向上）
db.pragma('journal_mode = WAL');

export default db;
