# PR Tracker - Pull Request Dashboard

Track all your pull requests across every project in your Azure DevOps organization from a single, beautiful dashboard.

## Features

### All PRs in One Place
See every active pull request across all projects and repositories in your organization. No more switching between projects to check PR status.

### Per-Project View
PRs grouped by project with collapsible headers showing approval, waiting, conflict, and rejection counts at a glance.

### Merge Conflict Detection
- Automatically detects merge conflicts on every PR
- Shows each conflicting file with its type and resolution status
- Dedicated "Conflicts" tab to focus on PRs that need attention
- Warning banner when any PR has unresolved conflicts

### Review & Comment Tracking
- Reviewer avatars with color-coded vote status (approved, rejected, waiting)
- Required reviewer indicators
- Comment thread view with active vs. resolved status
- Full thread content preview with reply counts

### Notifications
- Real-time alerts for new merge conflicts, approvals, and rejections
- Slide-in notification panel with read/unread tracking
- Click a notification to jump directly to the PR in Azure DevOps

### Filtering & Search
- Full-text search across title, author, branch, repository, and project
- Filter by status, project, and merge status
- Sort by date, title, project, conflict count, or review status

## Getting Started

After installation, find **PR Tracker** in the **Repos** hub group in any project. It automatically scans all projects in your organization.

## Permissions

This extension requires read access to your code repositories and projects. It does not modify any data.

| Scope | Purpose |
|-------|---------|
| `vso.code` | Read pull requests, repositories, conflicts, and comment threads |
| `vso.project` | List all projects in the organization |
| `vso.profile` | Identify the current user |

## Support

- [Report an issue](https://github.com/AnassKartit/MYPRs/issues)
- [Source code](https://github.com/AnassKartit/MYPRs)
