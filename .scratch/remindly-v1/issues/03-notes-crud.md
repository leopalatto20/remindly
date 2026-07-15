# Notes CRUD

Status: ready-for-agent
Type: task

## What to build

Users can create notes within a category, write in markdown with auto-save, and delete notes.

## Acceptance criteria

- [ ] Category detail screen shows list of notes
- [ ] Create note by entering title, then navigate to editor
- [ ] Markdown editor with 1-second debounce auto-save
- [ ] Save on navigation back
- [ ] Subtle toast on successful save
- [ ] Note detail shows created/updated timestamps
- [ ] Delete note with confirmation (cascades to todos)
- [ ] FTS5 triggers keep search index in sync

## Blocked by

- 02-categories-crud
