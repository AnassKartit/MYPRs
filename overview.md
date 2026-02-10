# PR Tracker - Pull Request Dashboard

The all-in-one pull request dashboard for Azure DevOps. Track every PR across your entire organization from a single, beautiful interface.

## Features

### All PRs in One Place
See every active pull request across all projects and repositories in your organization. No more switching between projects to check PR status.

### Needs My Review

Dedicated tab showing only the PRs waiting for your review. Stay on top of your review queue with a clear badge count.

### Created by Me
Quickly find all pull requests you've authored across the organization in one view.

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

### Dashboard Widget

Add a PR Tracker widget to any Azure DevOps dashboard for a quick summary of your organization's pull request status — total, approved, conflicts, waiting, needs your review, and drafts.

### Notifications
- Real-time alerts for new merge conflicts, approvals, and rejections
- Notifications generated on first load for existing conflicts
- Persistent notifications that survive page reloads
- Slide-in notification panel with read/unread tracking
- Click a notification to jump directly to the PR in Azure DevOps

### Dark Mode

Automatically detects your Azure DevOps theme and switches between light and dark mode. Every element is styled for comfortable viewing in both themes.

### Filtering & Search
- Full-text search across title, author, branch, repository, and project
- Filter by status, project, and merge status
- Sort by date, title, project, conflict count, or review status

### Multi-Language Support

Available in English and French. Automatically detects your browser language.

## Getting Started

After installation, find **PR Tracker** in the **Repos** hub group in any project. It automatically scans all projects in your organization.

To add the **dashboard widget**, edit any Azure DevOps dashboard, click "Add a widget", and search for "PR Tracker".

## Permissions

This extension requires read access to your code repositories and projects. It does not modify any data.

| Scope | Purpose |
|-------|---------|
| `vso.code` | Read pull requests, repositories, conflicts, and comment threads |
| `vso.project` | List all projects in the organization |
| `vso.profile` | Identify the current user for "Needs My Review" and "Created by Me" |

## Support

- [Report an issue](https://github.com/AnassKartit/MYPRs/issues)
- [Source code](https://github.com/AnassKartit/MYPRs)
