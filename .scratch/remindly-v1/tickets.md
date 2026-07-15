# Tickets: Remindly v1 — Post-implementation fixes

Fixes and improvements identified after reviewing the initial implementation. Reference: `.scratch/remindly-v1/issues/` and `CONTEXT.md`.

Work the **frontier**: any ticket whose blockers are all done. For a purely linear chain that means top to bottom.

## Fix initial routing — app boots to unmatched route

**What to deliver:** App loads directly to the Home screen with no manual navigation needed. No unmatched route error on startup.

**Blocked by:** None — can start immediately.

- [ ] App boots to Home screen without errors
- [ ] Bottom tab navigation works from first load
- [ ] No unmatched route warnings in console

## Replace emojis with Lucide icons + apply accent color

**What to deliver:** Categories use Lucide icons from a curated selection grid instead of emojis. The app uses `#0a4511` as the primary accent color for interactive elements (buttons, toggles, active states) to give it personality. Destructive/info states use their own standard colors.

**Blocked by:** Fix initial routing.

- [x] Category creation/edit shows a Lucide icon grid for selection
- [x] Selected Lucide icon displays in category list and detail views
- [x] No emojis used anywhere in the UI
- [x] `#0a4511` applied to primary action buttons, toggles, and active states
- [x] Accent color consistent across all screens

## Fix UI bugs — screen overflow, placeholder visibility, timestamp display

**What to deliver:** Settings sheet and other screens no longer overflow from the viewport. Placeholder text is visible in light mode. `updated_at` is hidden from the UI; `created_at` is displayed in a friendly human-readable format (e.g. "Jan 15, 2026").

**Blocked by:** Fix initial routing.

- [x] Settings modal fits within screen bounds on all device sizes
- [x] No screens overflow from side or bottom edges
- [x] Placeholder text visible in light mode (sufficient contrast)
- [x] `updated_at` not shown anywhere in the UI
- [x] `created_at` displayed in friendly format (e.g. "Jan 15, 2026")

## Add color picker to category creation

**What to deliver:** Category create/edit modal uses `react-native-reanimated-color-picker` for full color selection instead of a limited preset.

**Blocked by:** Replace emojis with Lucide icons + apply accent color.

- [x] Category modal includes a full color picker component
- [x] Selected color previews in the modal before saving
- [x] Color persists to database and displays correctly in lists and detail views

## Implement swipe-to-delete on lists + trash icon in detail views

**What to deliver:** Categories and notes support swipe-to-delete gesture in list views. Detail screens have a trash icon in the header that triggers a confirmation dialog before deleting. No long-press gestures anywhere.

**Blocked by:** Fix initial routing.

- [x] Swipe-to-delete works on category list items
- [x] Swipe-to-delete works on note list items
- [x] Trash icon in category detail header with confirmation dialog
- [x] Trash icon in note detail header with confirmation dialog
- [x] Deleting a category cascades to its notes
- [x] Deleting a note cascades to its todos
- [x] No long-press delete gestures anywhere

## Apple Notes-style note editing (view/edit modes)

**What to deliver:** Note detail has two modes — view (rendered markdown, read-only) and edit (raw markdown, writable). Pencil icon enters edit mode, check icon saves and exits back to rendered view. Save happens on check tap and on navigation back as a safety net. Subtle toast feedback on save.

**Blocked by:** Fix initial routing.

- [ ] Note detail opens in view mode showing rendered markdown
- [ ] Pencil icon visible in header, switches to edit mode
- [ ] Edit mode shows raw markdown in an editable text area
- [ ] Check icon visible in edit mode, saves and returns to view mode
- [ ] Content saved on check tap
- [ ] Content saved on navigation back (safety net)
- [ ] Subtle toast shown on successful save

## Add datetime picker to todo creation

**What to deliver:** Todo create/edit modal uses a native combined date+time picker instead of requiring manual text input for the due date.

**Blocked by:** Fix initial routing.

- [ ] Todo modal shows a native date picker
- [ ] Todo modal shows a native time picker (or combined date+time)
- [ ] Selected date/time displays in a friendly format in the todo list
- [ ] No manual timestamp text input required
