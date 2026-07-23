# Backup, Import & Export

## Problem Statement

I have no way to back up my data or transfer it to a new device. If my phone breaks or I get a new one, all my notes, categories, and todos are gone. I need a simple way to create a backup file and restore from it.

## Solution

Add export and import functionality to the Settings screen. Export creates a single JSON file containing all categories, notes, and todos, delivered via the OS share sheet. Import replaces all existing data with the contents of a backup file, picked via document picker. The import flow validates the file before touching the database, confirms with the user, and reloads the app afterward.

## User Stories

1. As a user, I want to export all my data to a single JSON file, so that I have a backup if something happens to my device
2. As a user, I want the export file to contain all categories, notes, and todos, so that nothing is left behind
3. As a user, I want the export file to preserve database IDs, so that relationships between entities stay intact on import
4. As a user, I want the export file to include a timestamp of when it was created, so that I can identify when the backup was made
5. As a user, I want the exported filename to include the date (e.g. `remindly-backup-2026-07-23.json`), so that I can tell multiple backups apart
6. As a user, I want the export to be delivered via the OS share sheet, so that I can save it to Files, send it via AirDrop, or email it to myself
7. As a user, I want to import data from a JSON backup file, so that I can restore my data on a new device
8. As a user, I want the import to replace all existing data (full wipe then insert), so that the result is a clean restore
9. As a user, I want to be shown a confirmation dialog before import, so that I don't accidentally replace all my data
10. As a user, I want the import file to be validated before any data is touched, so that malformed files are rejected without losing my existing data
11. As a user, I want to see a success toast after import completes, so that I know the operation worked
12. As a user, I want the app to reload after import, so that all screens reflect the restored data immediately
13. As a user, I want to pick the import file via a document picker, so that I can browse my device or cloud storage for the backup file
14. As a user, I want Export and Import buttons in the Settings screen under a "Data" section, so that backup actions are in an intuitive location
15. As a user, I want the export to NOT include my theme preference, so that settings stay device-specific

## Implementation Decisions

### Modules

- **`lib/db/backup.ts`** — new module for all backup logic:
  - `exportData()`: queries all categories, notes, todos from DB, returns a JSON string with `exportedAt` timestamp and all entities
  - `importData(json)`: validates the JSON structure (valid JSON, required arrays present, required fields on each entity), wipes all tables, inserts all rows with preserved IDs, returns success/error
- **`app/settings.tsx`** — modified to add a "Data" section with Export and Import buttons

### JSON format

```json
{
  "exportedAt": "2026-07-23T14:30:00Z",
  "categories": [{ "id": 1, "name": "...", "icon": "...", "color": "...", "created_at": "...", "updated_at": "..." }],
  "notes": [{ "id": 1, "title": "...", "body": "...", "category_id": 1, "created_at": "...", "updated_at": "..." }],
  "todos": [{ "id": 1, "title": "...", "due_date": "...", "completed": 0, "note_id": 1, "created_at": "...", "updated_at": "..." }]
}
```

No schema version. No settings (theme preference) included.

### Import behavior

- Full replace: wipe all tables, then insert
- Preserve original database IDs
- Validate entire file before touching the database — reject entirely if invalid
- Confirmation dialog before import: "This will replace all your data. Are you sure?"
- Success toast after import
- App reload after import to refresh all screens

### Validation rules

- Must be valid JSON
- Must contain `categories`, `notes`, `todos` arrays (can be empty)
- Each category must have: `id`, `name`, `icon`, `color`
- Each note must have: `id`, `title`, `category_id`
- Each todo must have: `id`, `title`, `due_date`, `note_id`
- `exportedAt` is optional (tolerate old backups without it)

### File handling

- Export: `expo-sharing` for share sheet delivery
- Import: `expo-document-picker` for file selection
- Filename: `remindly-backup-YYYY-MM-DD.json`

### UI placement

- Settings screen, new "Data" section below "Theme"
- Two buttons: Export, Import
- Visual style consistent with existing theme toggle buttons

## Testing Decisions

- Test external behavior: what the exported JSON looks like, what happens on import, what happens with invalid files
- Key seams: `lib/db/backup.ts` for all data logic, `app/settings.tsx` for UI
- Test areas:
  - Export produces valid JSON with all entities
  - Import with valid file wipes and restores correctly
  - Import with invalid file rejects without modifying existing data
  - Import with missing required fields rejects
  - IDs are preserved through export/import cycle
  - FTS indexes are rebuilt after import

## Out of Scope

- Per-category export (exporting one category at a time)
- Merge import (adding to existing data instead of replacing)
- Schema versioning
- Settings (theme preference) in backup
- Automatic scheduled backups
- Cloud sync
