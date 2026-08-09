import { getDb } from "./schema";

export interface SearchResultNote {
  type: "note";
  id: number;
  title: string;
  snippet: string;
  updated_at: string;
  category_name: string;
  category_color: string;
  category_icon: string;
}

export interface SearchResultTodo {
  type: "todo";
  id: number;
  title: string;
  note_id: number;
  due_date: string;
  updated_at: string;
  category_name: string;
  category_color: string;
  category_icon: string;
}

export type SearchResult = SearchResultNote | SearchResultTodo;

export async function search(query: string, categoryId?: number): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const db = await getDb();
  const sanitized = query.replace(/['"]/g, "").replace(/\s+/g, " ");
  const terms = sanitized.split(" ").filter(Boolean);
  const ftsQuery = terms.map((t) => `"${t}"`).join(" AND ");

  const categoryFilter = categoryId ? "AND n.category_id = ?" : "";

  const [notes, todos] = await Promise.all([
    db.getAllAsync<SearchResultNote>(
      `SELECT 'note' as type, n.id, n.title, snippet(notes_fts, 1, '<mark>', '</mark>', '…', 40) as snippet, n.updated_at, c.name as category_name, c.color as category_color, c.icon as category_icon
       FROM notes_fts f
       JOIN notes n ON n.id = f.rowid
       JOIN categories c ON c.id = n.category_id
       WHERE notes_fts MATCH ? ${categoryFilter}
       ORDER BY rank`,
      ...(categoryId ? [ftsQuery, categoryId] : [ftsQuery]),
    ),
    db.getAllAsync<SearchResultTodo>(
      `SELECT 'todo' as type, t.id, t.title, t.note_id, t.due_date, t.updated_at, c.name as category_name, c.color as category_color, c.icon as category_icon
       FROM todos_fts f
       JOIN todos t ON t.id = f.rowid
       JOIN notes n ON n.id = t.note_id
       JOIN categories c ON c.id = n.category_id
       WHERE todos_fts MATCH ? ${categoryFilter}
       ORDER BY rank`,
      ...(categoryId ? [ftsQuery, categoryId] : [ftsQuery]),
    ),
  ]);

  return [...notes, ...todos];
}
