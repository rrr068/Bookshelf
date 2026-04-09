-- いいねテーブル
CREATE TABLE IF NOT EXISTS likes (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  review_id TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
  UNIQUE(user_id, review_id)
);

CREATE INDEX IF NOT EXISTS idx_likes_review ON likes(review_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);
