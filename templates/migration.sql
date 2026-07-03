-- A MIGRATION: new tables/columns for a module. Ordered file name: 00NN_<slug>.sql.
-- Applied in order on a fresh database, so each must stand alone and not duplicate a
-- column an earlier migration already added. Include created_at / updated_at.
CREATE TABLE IF NOT EXISTS thing (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
