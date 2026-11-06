CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '[]',
  cover_url TEXT NOT NULL DEFAULT '',
  cover_alt TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','trash')),
  trashed_from TEXT NOT NULL DEFAULT 'draft' CHECK(trashed_from IN ('draft','published')),
  featured INTEGER NOT NULL DEFAULT 0 CHECK(featured IN (0,1)),
  version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  published_at TEXT
);
CREATE INDEX posts_public_date ON posts(status, published_at DESC, id DESC);
CREATE INDEX posts_category ON posts(status, category, published_at DESC);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
INSERT INTO settings(key,value) VALUES
  ('title','个人博客'),
  ('description','技术与生活的记录。'),
  ('author',''),
  ('about',''),
  ('site_url',''),
  ('contact_url','');

CREATE TABLE login_attempts (
  address TEXT PRIMARY KEY,
  failures INTEGER NOT NULL DEFAULT 0,
  reset_at INTEGER NOT NULL
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  csrf TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX sessions_expiry ON sessions(expires_at);
