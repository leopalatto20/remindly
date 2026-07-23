# Remindly - Project Context

## Overview

A simple note-taking multiplatform app designed as a personal diary/notebook. Think of it like a note-taking app for school - every note is related to a subject (category).

## Core Principles

- Everything is local, no server-side code
- Personal use only - no sharing, no tracking
- Free and open source
- Simple and intuitive with minimal features
- Clean and simple UI

## Tech Stack

- **Framework**: Expo (React Native)
- **Database**: SQLite (via expo-sqlite)
- **Styling**: Tailwind CSS (via NativeWind)
- **Component Library**: Gluestack UI
- **Navigation**: Expo Router (file-based routing)

## Data Model

### Categories

- Color-coded (full color picker)
- Icon from curated Lucide icon collection
- Required - notes cannot exist without a category

### Notes

- Title (required)
- Body (markdown)
- Creation date (auto-set, displayed in friendly format e.g. "Jan 15, 2026")
- Updated at timestamp (backend only, not displayed in UI)
- Category (required foreign key)
- Subtle toast feedback on save

### Todos

- Title (required)
- Due date with time (date + time picker)
- Completed flag
- Belongs to a note (foreign key)
- Sorted by closest due date first, completed todos faded to 50% opacity at bottom

## Navigation Structure

### Bottom Tabs

1. **Home** - Categories list + urgent todos
2. **Search** - Full-text search

### Stack Flow

```
[Home Screen] → [Category Detail] → [Note Detail]
[Search Screen] → [Search Results]
[Settings Modal] (gear icon in Home top bar)
```

## Screens

### Home Screen

- List of categories
- Most urgent todos displayed (5 initially, expandable to show all due this week)
- Search tab at bottom
- Settings gear icon at top

### Category Detail

- General category info (icon, color)
- List of notes in category
- Create new note (prompts for title only, then navigates to note detail)

### Note Detail

- Markdown editor
- Todo header badge (dimmed icon when no todos, `✓ 3/7` chip when todos exist) — opens todo list modal
- Todo list modal (scrollable list with toggle/tap-to-edit/add, stacks over note)
- Create/edit todo via modal (on top of list modal — stacked)
- Delete note (trash icon with confirmation)
- Auto-save

### Search

- Dedicated search tab
- Full-text search across note titles, note bodies, and todo titles
- Grouped results with headers/separators

### Settings

- Theme toggle (light/dark/system)
- System preference selected by default

## UI/UX Decisions

### Category Management

- Created/edited via modal (quick action)

### Todo Management

- Created/edited via modal (more space for date/time picker)
- Single combined date+time picker
- Tap to edit in modal
- Faded to 50% opacity when completed

### Note Creation

- User enters title → note created instantly → navigated to note detail to start writing

### Note Editing

- Two modes: **view** (rendered markdown, read-only) and **edit** (raw markdown, writable)
- Pencil icon to enter edit mode, check icon to save and exit edit mode
- Save happens on check tap (and on navigation back as safety net), not auto-save
- Pattern: Apple Notes style

### Deletion

- Swipe-to-delete gesture on list items (categories, notes)
- Trash icon in detail view header with confirmation dialog
- No long-press gestures

### Color Scheme

- Light and dark mode from start
- System preference detected by default
- User can override in settings

### Icons

- Curated collection of Lucide icons for categories
- User picks from grid

### Colors

- Full color picker for category colors (react-native-reanimated-color-picker)
- Primary accent color: `#0a4511` — used for interactive elements (buttons, toggles, active states) to give the app personality
- Destructive/info states use their own standard colors

## Search Implementation

- Full-text search using SQLite FTS
- Covers: note titles, note bodies, todo titles
- Results grouped by type (Notes/Todos), then by category
- Color-coded grouping for easy identification
- Title only in results (color guides user)
- Empty state: "No results for '{query}'"
- Search tab starts empty for v1 (no recent searches)

## Project Structure (planned)

```
code/projects/remindly/
├── app/
│   ├── (tabs)/
│   │   ├── home/
│   │   └── search/
│   ├── category/
│   │   └── [id]/
│   ├── note/
│   │   └── [id]/
│   └── settings/
├── components/
│   ├── ui/
│   ├── categories/
│   ├── notes/
│   └── todos/
├── lib/
│   ├── db/
│   ├── hooks/
│   └── theme/
```

## Future Considerations (not v1)

- Data backup/export
- Custom app icon/splash screen
- Rich text editor enhancements
