CREATE TABLE categories (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  seed TEXT,
  image TEXT,
  feature INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  short TEXT,
  specs TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  category_slug TEXT NOT NULL REFERENCES categories(slug),
  name TEXT NOT NULL,
  size_mm TEXT,
  weight_kg REAL,
  weight_label TEXT,
  image TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  visible INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  meta_title TEXT,
  meta_description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE sessions (
  token TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);

CREATE TABLE activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  entity_name TEXT,
  username TEXT NOT NULL,
  changes TEXT
);

CREATE TABLE analytics_page_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  device_type TEXT, browser TEXT, os TEXT, screen_size TEXT,
  referrer TEXT, utm_source TEXT, utm_medium TEXT, utm_campaign TEXT,
  country TEXT, region TEXT, city TEXT,
  time_on_page INTEGER,
  timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);
