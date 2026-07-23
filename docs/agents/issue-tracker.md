# Issue tracker: Linear

Issues for this repo live in Linear, accessed via the Linear MCP tools.

## Conventions

- Each logical feature or effort maps to a Linear **project**
- Individual tasks are Linear **issues** within that project
- Triage state is recorded via **labels** on each issue (see `triage-labels.md`)
- Comments and discussion live on the Linear issue via `linear_save_comment`

## Available MCP tools

| Operation | Tool |
| --- | --- |
| Create an issue | `linear_save_issue` (omit `id`) |
| Update an issue | `linear_save_issue` (pass `id`) |
| List issues | `linear_list_issues` |
| Get issue details | `linear_get_issue` |
| Add a comment | `linear_save_comment` |
| Create a label | `linear_create_issue_label` |
| List labels | `linear_list_issue_labels` |
| List teams | `linear_list_teams` |
| List projects | `linear_list_projects` |
| Create a project | `linear_save_project` |

## When a skill says "publish to the issue tracker"

Use `linear_save_issue` to create a new issue. Set `title`, `team`, and `description`. Apply triage labels as appropriate. If the work belongs to a project, pass `project`.

## When a skill says "fetch the relevant ticket"

Use `linear_get_issue` with the issue ID or identifier (e.g. `LIN-123`).

## Triage workflow

Use `linear_save_issue` to update labels. The five triage labels are auto-created via `linear_create_issue_label` if they don't exist. See `triage-labels.md` for the label strings.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a Linear project; each **child** ticket is a Linear issue in that project.

- **Map**: a Linear project with a description capturing Notes / Decisions-so-far / Fog
- **Child ticket**: a Linear issue in the project, with type recorded in the description
- **Blocking**: use Linear's `blocks`/`blockedBy` relations on issues
- **Frontier**: query `linear_list_issues` filtered by project, excluding blocked and resolved issues
- **Claim**: assign the issue to the agent
- **Resolve**: add an `## Answer` comment via `linear_save_comment`, then close the issue
