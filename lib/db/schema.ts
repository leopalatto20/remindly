import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync("remindly.db");
  await initDb(db);
  return db;
}

async function initDb(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      body TEXT DEFAULT '',
      category_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      due_date DATETIME NOT NULL,
      completed INTEGER DEFAULT 0,
      note_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category_id);
    CREATE INDEX IF NOT EXISTS idx_todos_note ON todos(note_id);
    CREATE INDEX IF NOT EXISTS idx_todos_due ON todos(due_date);
    CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);

    CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(title, body, content=notes, content_rowid=id);
    CREATE VIRTUAL TABLE IF NOT EXISTS todos_fts USING fts5(title, content=todos, content_rowid=id);

    CREATE TRIGGER IF NOT EXISTS notes_ai AFTER INSERT ON notes BEGIN
      INSERT INTO notes_fts(rowid, title, body) VALUES (new.id, new.title, new.body);
    END;
    CREATE TRIGGER IF NOT EXISTS notes_ad AFTER DELETE ON notes BEGIN
      INSERT INTO notes_fts(notes_fts, rowid, title, body) VALUES('delete', old.id, old.title, old.body);
    END;
    CREATE TRIGGER IF NOT EXISTS notes_au AFTER UPDATE ON notes BEGIN
      INSERT INTO notes_fts(notes_fts, rowid, title, body) VALUES('delete', old.id, old.title, old.body);
      INSERT INTO notes_fts(rowid, title, body) VALUES (new.id, new.title, new.body);
    END;

    CREATE TRIGGER IF NOT EXISTS todos_ai AFTER INSERT ON todos BEGIN
      INSERT INTO todos_fts(rowid, title) VALUES (new.id, new.title);
    END;
    CREATE TRIGGER IF NOT EXISTS todos_ad AFTER DELETE ON todos BEGIN
      INSERT INTO todos_fts(todos_fts, rowid, title) VALUES('delete', old.id, old.title);
    END;
    CREATE TRIGGER IF NOT EXISTS todos_au AFTER UPDATE ON todos BEGIN
      INSERT INTO todos_fts(todos_fts, rowid, title) VALUES('delete', old.id, old.title);
      INSERT INTO todos_fts(rowid, title) VALUES (new.id, new.title);
    END;
  `);
}