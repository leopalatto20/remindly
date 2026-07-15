# Remindly - Database Schema

## Tables

### categories
```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,           -- Lucide icon name
  color TEXT NOT NULL,          -- Hex color code
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### notes
```sql
CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT DEFAULT '',
  category_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
```

### todos
```sql
CREATE TABLE todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  due_date DATETIME NOT NULL,
  completed INTEGER DEFAULT 0,  -- 0 = false, 1 = true
  note_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
);
```

## Indexes
```sql
-- For search
CREATE VIRTUAL TABLE notes_fts USING fts5(title, body, content=notes, content_rowid=id);
CREATE VIRTUAL TABLE todos_fts USING fts5(title, content=todos, content_rowid=id);

-- For queries
CREATE INDEX idx_notes_category ON notes(category_id);
CREATE INDEX idx_todos_note ON todos(note_id);
CREATE INDEX idx_todos_due ON todos(due_date);
CREATE INDEX idx_todos_completed ON todos(completed);
```

## Cascading Deletes
- Deleting a category deletes all its notes
- Deleting a note deletes all its todos
