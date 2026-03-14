CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  google_books_id TEXT UNIQUE,
  title TEXT NOT NULL,
  authors TEXT,
  publisher TEXT,
  published_date TEXT,
  description TEXT,
  isbn_10 TEXT,
  isbn_13 TEXT,
  page_count INTEGER,
  thumbnail_url TEXT,
  language TEXT DEFAULT 'ja',
  created_by TEXT REFERENCES users(id),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_books_google_id ON books(google_books_id);
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_isbn13 ON books(isbn_13);
