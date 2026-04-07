-- 読書ステータステーブル
CREATE TABLE IF NOT EXISTS reading_statuses (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  book_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('want_to_read', 'reading', 'completed', 'on_hold', 'dropped')),
  started_at TEXT,
  finished_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  UNIQUE(user_id, book_id)
);

CREATE INDEX IF NOT EXISTS idx_reading_statuses_user ON reading_statuses(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_statuses_book ON reading_statuses(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_statuses_status ON reading_statuses(status);
