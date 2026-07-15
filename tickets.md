# Tickets: Remindly v1

A local-first note-taking app with categories, notes, todos, and search. Based on [spec.md](spec.md).

Work the **frontier**: any ticket whose blockers are all done.

## Expo scaffold + database + navigation shell

**What to build:** A runnable Expo app with SQLite database (all 3 tables + FTS5), bottom tab navigation (Home, Search), and Gluestack/NativeWind wired up. The app boots and shows placeholder screens.

**Blocked by:** None - can start immediately.

- [ ] Expo project initialized with TypeScript and all dependencies installed
- [ ] SQLite database created with categories, notes, todos tables + FTS5 virtual tables + indexes
- [ ] Bottom tab navigator with Home and Search tabs works
- [ ] NativeWind and Gluestack UI render correctly
- [ ] App runs on iOS/Android simulator

## Categories CRUD

**What to build:** Users can create, edit, and delete categories with color and icon. Home screen shows a list of categories.

**Blocked by:** Expo scaffold + database + navigation shell.

- [ ] Home screen displays all categories with their icon and color
- [ ] Create category modal with name, Lucide icon grid, and color picker
- [ ] Edit category modal (same as create, pre-filled)
- [ ] Delete category with confirmation (cascades to notes)
- [ ] Categories persist in SQLite

## Notes CRUD

**What to build:** Users can create notes within a category, write in markdown with auto-save, and delete notes.

**Blocked by:** Categories CRUD.

- [ ] Category detail screen shows list of notes
- [ ] Create note by entering title, then navigate to editor
- [ ] Markdown editor with 1-second debounce auto-save
- [ ] Save on navigation back
- [ ] Subtle toast on successful save
- [ ] Note detail shows created/updated timestamps
- [ ] Delete note with confirmation (cascades to todos)
- [ ] FTS5 triggers keep search index in sync

## Todos CRUD

**What to build:** Users can add todos to notes with due dates, mark them complete, and see them sorted by urgency.

**Blocked by:** Notes CRUD.

- [ ] Note detail screen shows list of todos
- [ ] Create todo modal with title and date/time picker
- [ ] Edit todo modal (tap to open)
- [ ] Mark todo as completed (fades to 50% opacity)
- [ ] Todos sorted by closest due date first, completed at bottom
- [ ] FTS5 triggers keep search index in sync

## Home screen urgent todos

**What to build:** The home screen shows the 5 most urgent todos due this week, positioned above the categories list, expandable to show all.

**Blocked by:** Categories CRUD, Todos CRUD.

- [ ] Urgent todos section appears above categories on home screen
- [ ] Shows 5 most urgent todos (due this week, closest date first)
- [ ] Expandable to show all todos due this week
- [ ] Each todo shows category color indicator
- [ ] Tap todo opens edit modal

## Search

**What to build:** A dedicated search tab that searches across all notes and todos using FTS5, with grouped results.

**Blocked by:** Notes CRUD, Todos CRUD.

- [ ] Search tab starts empty
- [ ] Real-time search as user types
- [ ] Results grouped by type (Notes/Todos), then by category
- [ ] Color-coded category headers
- [ ] Title-only display in results
- [ ] Empty state: "No results for '{query}'"
- [ ] Tap result navigates to the note or category

## Settings

**What to build:** Users can toggle between light, dark, and system theme from a settings modal.

**Blocked by:** None - can start immediately (parallel with Categories CRUD).

- [ ] Settings gear icon in home screen top bar
- [ ] Settings modal with theme toggle (light/dark/system)
- [ ] System theme selected by default
- [ ] Theme preference persists across app restarts
- [ ] Theme applies immediately across all screens
