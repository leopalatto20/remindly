# Remindly - v1 Specification

## Problem Statement

I need a simple, personal note-taking app that works across my devices. I want to organize notes by subject (like school subjects), track todos with due dates, and quickly find anything I've written. Existing apps are either too complex, require accounts, or don't let me organize notes the way I think about them - by topic.

## Solution

A local-first, multiplatform note-taking app built with Expo where every note belongs to a category (subject). Categories are color-coded with icons for visual identification. Notes support markdown for flexible formatting, and each note can have todos with due dates. The app provides fast full-text search across all content, shows urgent todos on the home screen, and works entirely offline with no account required.

## User Stories

### Categories

1. As a user, I want to create a new category with a name, icon, and color, so that I can organize my notes by subject
2. As a user, I want to edit an existing category's name, icon, or color, so that I can keep my organization system current
3. As a user, I want to delete a category and all its notes, so that I can remove subjects I no longer need
4. As a user, I want to see a list of all my categories on the home screen, so that I can quickly access any subject
5. As a user, I want each category to have a distinct color and icon, so that I can visually identify subjects at a glance
6. As a user, I want to pick from a curated grid of Lucide icons when creating/editing a category, so that I have meaningful visual representations
7. As a user, I want to use a full color picker for category colors, so that I can choose exactly the color I want
8. As a user, I want to create and edit categories via a modal, so that the process is quick and doesn't require navigating away from the home screen

### Notes

9. As a user, I want to create a new note by entering a title, so that I can quickly start writing
10. As a user, I want to be immediately taken to the note editor after creating a note, so that I can start writing right away
11. As a user, I want to write notes in markdown, so that I can format text flexibly
12. As a user, I want my notes to auto-save as I type (1 second debounce), so that I never lose my work
13. As a user, I want my notes to also save when I navigate back, so that I don't have to worry about losing unsaved changes
14. As a user, I want to see a subtle toast notification when my note saves, so that I know my work is safe
15. As a user, I want to see a list of all notes within a category, so that I can find and manage my notes for that subject
16. As a user, I want to delete a note with a confirmation dialog, so that I don't accidentally lose important notes
17. As a user, I want each note to track when it was created and last updated, so that I can see the history of my work

### Todos

18. As a user, I want to add todos to any note, so that I can track action items related to that note
19. As a user, I want to set a due date and time for each todo, so that I know when things need to be done
20. As a user, I want to mark todos as completed, so that I can track my progress
21. As a user, I want completed todos to appear faded (50% opacity) at the bottom of the list, so that I can focus on what's still pending
22. As a user, I want todos sorted by closest due date first, so that I see the most urgent items at the top
23. As a user, I want to create and edit todos via a modal, so that I have enough space for the date/time picker
24. As a user, I want to tap on a todo to edit it in a modal, so that I can quickly update details
25. As a user, I want to see my 5 most urgent todos (due this week) on the home screen, so that I know what's coming up
26. As a user, I want to expand the urgent todos section on the home screen to see all todos due this week, so that I have full visibility
27. As a user, I want the urgent todos section to appear above the categories list, so that it's the first thing I see

### Navigation

28. As a user, I want a bottom tab bar with Home and Search tabs, so that I can quickly switch between main functions
29. As a user, I want to tap a category on the home screen to see its notes, so that I can drill down to what I need
30. As a user, I want to tap a note to open its editor, so that I can read and modify it
31. As a user, I want to navigate back from any screen to return to where I was, so that I always know where I am
32. As a user, I want a settings gear icon in the home screen top bar, so that I can access app settings

### Search

33. As a user, I want to search across all note titles, note bodies, and todo titles, so that I can find anything I've written
34. As a user, I want search results to appear as I type, so that I get instant feedback
35. As a user, I want search results grouped by type (Notes/Todos) and then by category, so that I can easily browse matches
36. As a user, I want each search result to show only the title with color-coded category identification, so that results are clean and scannable
37. As a user, I want to see "No results for '{query}'" when nothing matches, so that I know my search was thorough
38. As a user, I want the search tab to start empty (no recent searches), so that I have a clean slate each time

### Settings

39. As a user, I want to toggle between light, dark, and system theme, so that I can use the app comfortably in any lighting
40. As a user, I want the app to default to my system's theme preference, so that it works naturally with my device
41. As a user, I want to override the system theme in settings, so that I have control when I want it

### Data Integrity

42. As a user, I want all my data stored locally on my device, so that I have full privacy and offline access
43. As a user, I want notes to track `updated_at` timestamps, so that data integrity is maintained
44. As a user, I want deleting a category to cascade and delete all its notes, so that I don't have orphaned data
45. As a user, I want deleting a note to cascade and delete all its todos, so that I don't have orphaned data

## Implementation Decisions

### Tech Stack

- **Framework**: Expo (React Native) with Expo Router for file-based routing
- **Database**: SQLite via expo-sqlite with FTS5 for full-text search
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Component Library**: Gluestack UI for accessible pre-built components
- **Color Picker**: react-native-reanimated-color-picker
- **Icons**: Lucide React Native (curated subset for categories)

### Data Model

- Three tables: `categories`, `notes`, `todos`
- Foreign keys with CASCADE deletes: category -> notes -> todos
- FTS5 virtual tables for search: `notes_fts` (title, body), `todos_fts` (title)
- Indexes on foreign keys and due_date for query performance

### Auto-Save Behavior

- 1 second debounce on text input changes
- Additional save trigger on navigation back
- Subtle toast notification on successful save
- `updated_at` timestamp updated on every save

### Search Implementation

- SQLite FTS5 for full-text search across note titles, note bodies, and todo titles
- Results grouped by type (Notes/Todos), then by category
- Color-coded category headers for visual identification
- Title-only display in results (color guides navigation)
- Empty state message: "No results for '{query}'"

### Home Screen Todos

- Initially shows 5 most urgent todos (due this week, sorted by closest date)
- Expandable section to show all todos due this week
- Positioned above categories list (first thing user sees)

### Navigation Structure

- Bottom tabs: Home, Search
- Stack flow: Home -> Category Detail -> Note Detail
- Settings as modal (gear icon in home top bar)

### Modal-Based Editing

- Categories: create/edit via modal
- Todos: create/edit via modal (accommodates date/time picker)
- Notes: inline creation (title prompt) then navigate to editor

## Testing Decisions

### Test Philosophy

- Test external behavior, not implementation details
- Focus on user-facing functionality
- Integration tests over unit tests where possible

### Key Test Areas

- **Database operations**: CRUD for categories, notes, todos; cascade deletes; FTS search
- **Auto-save**: Debounce timing, save on navigation, toast feedback
- **Search**: FTS queries, result grouping, empty states
- **Navigation**: Tab switching, stack navigation, modal presentation
- **Theme**: Light/dark/system detection, persistence

### Test Approach

- Component rendering tests with React Native Testing Library
- Database integration tests using expo-sqlite in test environment
- E2E tests for critical user flows (create category -> create note -> add todo -> search)

## Out of Scope (v1)

- Data backup/export functionality
- Custom app icon/splash screen
- Rich text editor (using markdown instead)
- Data sync across devices
- Sharing notes with others
- User accounts or authentication
- Push notifications for todo due dates
- Recurring todos
- Note attachments or images
- Collaboration features

## Further Notes

- This is a personal-use app - no need to optimize for multiple users or large datasets
- Simplicity is key - every feature should earn its place
- Local-first means no network requests, no accounts, no server code
- The app should feel fast and responsive - SQLite with proper indexes ensures this
- Markdown provides flexibility without the complexity of a rich text editor
- Color-coded categories are central to the UX - they should be visually prominent
