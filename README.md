# PR Tracker - Azure DevOps Extension

Track all your pull requests across every project in your Azure DevOps organization from a single dashboard.

## Features

### Organization-Wide Dashboard
- View **all pull requests** across every project and repository in one place
- Summary cards showing totals, approvals, pending reviews, conflicts, rejections, and drafts
- Auto-refreshes every 5 minutes with manual refresh option

### Per-Project View
- PRs grouped by project with collapsible sections
- Each project header shows approval, waiting, conflict, and rejection counts at a glance
- Quickly identify which projects need attention

### Merge Conflict Detection
- Detects merge conflicts on every PR automatically
- Expandable conflict panel shows **each conflicting file**, conflict type, and resolution status
- Conflict banner alerts you when any PR has unresolved conflicts
- Dedicated "Conflicts" tab to focus only on PRs that need conflict resolution

### Review & Comment Tracking
- See reviewer avatars with vote status (approved, rejected, waiting, no vote)
- Expandable reviewer section with required reviewer indicators
- Comment thread view showing active vs. resolved threads with reply counts
- Click any PR to expand and see full review and comment details

### Notifications
- Real-time notification panel for new merge conflicts, approvals, and rejections
- Unread badge indicator on the notification bell
- Mark individual or all notifications as read
- Click a notification to open the PR directly in Azure DevOps

### Filtering & Search
- **Text search** across PR title, author, branch name, repository, and project
- **Filter by** status (active, completed, abandoned), project, merge status (conflicts/clean)
- **Sort by** date, title, project, conflict count, or review status
- Ascending/descending sort toggle

## Installation

### From VSIX file

1. Download the latest `.vsix` from [Releases](https://github.com/AnassKartit/MYPRs/releases)
2. Go to your Azure DevOps organization: `https://dev.azure.com/{org}/_settings/extensions`
3. Click **Browse local extensions** > **Upload extension**
4. Select the downloaded `.vsix` file
5. Install it to your organization

### From Marketplace

Install directly from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=AnassKartit.pr-tracker-hub).

## Usage

After installation, the **PR Tracker** hub appears under the **Repos** section in every project.

### Views

| View | Description |
|------|-------------|
| **All PRs** | Flat list of every pull request across the organization |
| **By Project** | PRs grouped under collapsible project headers with summary stats |
| **Conflicts** | Only PRs with merge conflicts, showing file-level conflict details |

### PR Card Actions

Click any PR card to expand it and see:
- **Conflicts tab** — List of conflicting files with type and resolution status
- **Reviewers tab** — All reviewers with their vote status and required flag
- **Comments tab** — Active and resolved comment threads with content preview

Click the PR title to open it directly in Azure DevOps.

## Development

### Prerequisites

- Node.js >= 18
- npm >= 9

### Setup

```bash
git clone https://github.com/AnassKartit/MYPRs.git
cd MYPRs
npm install
```

### Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Production webpack build |
| `npm run dev` | Development build with watch mode |
| `npm run lint` | Run ESLint with security rules |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run typecheck` | TypeScript type checking |
| `npm run package` | Create `.vsix` extension package |
| `npm run ci` | Full CI: typecheck + lint + build + package |
| `npm run security:audit` | Run npm audit on production deps |
| `npm run security:sast` | Run static security analysis |
| `npm run clean` | Remove dist and vsix directories |

### Project Structure

```
├── .azure-pipelines/       # Azure Pipelines CI/CD
│   ├── ci.yml              # CI: build, lint, security, package
│   ├── cd.yml              # CD: security gate, publish to marketplace
│   └── templates/          # Reusable pipeline templates
├── .github/workflows/      # GitHub Actions CI/CD
│   ├── ci.yml              # CI: build, lint, SAST, package
│   └── release.yml         # Release: build, package, GitHub Release
├── scripts/
│   └── sast-check.sh       # Static application security testing
├── src/
│   ├── components/         # React UI components
│   │   ├── App.tsx         # Main app with routing and state
│   │   ├── Header.tsx      # Dashboard header with stats
│   │   ├── FilterBar.tsx   # Search and filter controls
│   │   ├── StatsCards.tsx   # Summary statistic cards
│   │   ├── PRCard.tsx      # Expandable PR card with details
│   │   ├── ProjectGroup.tsx # Collapsible per-project group
│   │   ├── ConflictsBanner.tsx  # Conflict warning banner
│   │   └── NotificationPanel.tsx # Notification slide-in panel
│   ├── models/
│   │   └── types.ts        # TypeScript interfaces and enums
│   ├── services/
│   │   ├── sdkService.ts   # Azure DevOps SDK integration
│   │   ├── prService.ts    # REST API fallback service
│   │   └── security.ts     # Security utilities
│   └── styles/
│       └── main.scss       # Full SCSS styling
├── static/                 # Static assets (icon)
├── hub.html                # Extension entry HTML
├── vss-extension.json      # Extension manifest
├── SECURITY.md             # Security policy
└── audit-ci.json           # Audit threshold config
```

## Releasing

Create a version tag to trigger the release pipeline:

```bash
git tag v1.0.0
git push origin v1.0.0
```

This will:
1. Build and lint the project
2. Run security checks
3. Package the VSIX with the tag version
4. Create a GitHub Release with the VSIX attached
5. (Azure Pipelines) Publish to the Visual Studio Marketplace

## Required Scopes

The extension requests these minimum Azure DevOps OAuth scopes:

| Scope | Purpose |
|-------|---------|
| `vso.code` | Read pull requests, repositories, conflicts, and threads |
| `vso.project` | List projects in the organization |
| `vso.profile` | Identify the current user |
| `vso.notification_manage` | Manage notification subscriptions |

## Security

See [SECURITY.md](SECURITY.md) for the full security policy.

Key practices:
- Content Security Policy headers
- HTML sanitization and URL allowlisting
- Rate limiting on API calls
- Input validation on all resource identifiers
- SAST checks in CI pipeline
- No credentials stored client-side
- npm audit enforced in CI/CD

## License

MIT

## Author

**Anass Kartit** — [GitHub](https://github.com/AnassKartit)
