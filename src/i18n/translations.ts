const en = {
  // Header
  "header.title": "PR Tracker",
  "header.updated": "Updated {time}",
  "header.loading": "Loading...",
  "header.totalPRs": "Total PRs",
  "header.approved": "Approved",
  "header.waiting": "Waiting",
  "header.conflicts": "Conflicts",

  // Navigation
  "nav.allPRs": "All PRs",
  "nav.needsMyReview": "Needs My Review",
  "nav.createdByMe": "Created by Me",
  "nav.byProject": "By Project",
  "nav.conflicts": "Conflicts",
  "nav.refresh": "Refresh",
  "nav.notifications": "Notifications",

  // Error / Loading / Empty
  "error.title": "Error",
  "error.retry": "Retry",
  "loading.title": "Loading pull requests...",
  "loading.subtitle": "Scanning all projects in your organization",
  "empty.noPRs": "No pull requests found",
  "empty.noPRsHint": "Try adjusting your filters or check back later.",
  "empty.noReviewPRs": "No pull requests need your review",
  "empty.noReviewPRsHint": "You're all caught up! No PRs are waiting for your review.",
  "empty.noMyPRs": "You haven't created any pull requests",
  "empty.noMyPRsHint": "Pull requests you create will appear here.",
  "empty.noProjects": "No projects with pull requests",
  "empty.noProjectsHint": "No active pull requests were found across your projects.",
  "empty.noConflicts": "No merge conflicts",
  "empty.noConflictsHint": "All your pull requests are conflict-free. Great job!",

  // Stats Cards
  "stats.totalPRs": "Total PRs",
  "stats.approved": "Approved",
  "stats.awaitingReview": "Awaiting Review",
  "stats.conflicts": "Conflicts",
  "stats.aging": "Aging (>1d)",
  "stats.rejected": "Rejected",
  "stats.drafts": "Drafts",

  // Filter Bar
  "filter.search": "Search pull requests by title, author, branch...",
  "filter.allStatus": "All Status",
  "filter.active": "Active",
  "filter.completed": "Completed",
  "filter.abandoned": "Abandoned",
  "filter.allProjects": "All Projects",
  "filter.allMergeStatus": "All Merge Status",
  "filter.hasConflicts": "Has Conflicts",
  "filter.noConflicts": "No Conflicts",
  "filter.sortByDate": "Sort by Date",
  "filter.sortByTitle": "Sort by Title",
  "filter.sortByProject": "Sort by Project",
  "filter.sortByConflicts": "Sort by Conflicts",
  "filter.sortByReview": "Sort by Review Status",
  "filter.ascending": "Ascending",
  "filter.descending": "Descending",

  // PR Card
  "pr.draft": "Draft",
  "pr.autoComplete": "Auto-complete",
  "pr.mergeOk": "Merge OK",
  "pr.queued": "Queued",
  "pr.viewFiles": "View Files",
  "pr.approve": "Approve",
  "pr.approving": "Approving...",
  "pr.openInDevOps": "Open in DevOps",
  "pr.loadingDetails": "Loading details...",
  "pr.failedToApprove": "Failed to approve",
  "pr.conflicts": "{count} Conflicts",
  "pr.conflicts_one": "{count} Conflict",
  "pr.conflicts_other": "{count} Conflicts",
  "pr.files": "{count} files",
  "pr.files_one": "{count} file",
  "pr.files_other": "{count} files",

  // PR Card: Detail tabs
  "pr.tab.conflicts": "Conflicts ({count})",
  "pr.tab.reviewers": "Reviewers ({count})",
  "pr.tab.comments": "Comments ({count} active)",

  // PR Card: Conflict section
  "pr.conflictsDetected": "{count} Merge Conflicts Detected",
  "pr.conflictsDetected_one": "{count} Merge Conflict Detected",
  "pr.conflictsDetected_other": "{count} Merge Conflicts Detected",
  "pr.noConflictsDetail": "No merge conflicts detected. This PR can be merged cleanly.",
  "pr.resolved": "Resolved",
  "pr.unresolved": "Unresolved",

  // PR Card: Reviewer section
  "pr.reviewersTitle": "Reviewers",
  "pr.noReviewers": "No reviewers assigned to this pull request.",
  "pr.required": "(Required)",

  // PR Card: Comment section
  "pr.commentThreads": "{count} Comment Threads",
  "pr.commentThreads_one": "{count} Comment Thread",
  "pr.commentThreads_other": "{count} Comment Threads",
  "pr.noComments": "No comment threads on this pull request.",
  "pr.moreReplies": "(+{count} more replies)",
  "pr.moreThreads": "+{count} more threads",
  "pr.threadActive": "Active",
  "pr.threadResolved": "Resolved",

  // Vote labels
  "vote.approved": "Approved",
  "vote.approvedWithSuggestions": "Approved with suggestions",
  "vote.rejected": "Rejected",
  "vote.waitingForAuthor": "Waiting for author",
  "vote.noVote": "No vote",

  // Age labels
  "age.today": "Today",
  "age.oneDay": "1 day",
  "age.days": "{count} days",
  "age.weeks": "{count}w",
  "age.months": "{count}mo",

  // Time
  "time.justNow": "just now",
  "time.minutesAgo": "{count}m ago",
  "time.hoursAgo": "{count}h ago",
  "time.yesterday": "Yesterday",
  "time.daysAgo": "{count}d ago",

  // Status
  "status.active": "Active",
  "status.completed": "Completed",
  "status.abandoned": "Abandoned",

  // Conflicts Banner
  "banner.prsWithConflicts": "{count} Pull Requests with Merge Conflicts",
  "banner.prsWithConflicts_one": "{count} Pull Request with Merge Conflicts",
  "banner.prsWithConflicts_other": "{count} Pull Requests with Merge Conflicts",
  "banner.conflictingFiles": "{count} conflicting files detected across your PRs. ",
  "banner.conflictingFiles_one": "{count} conflicting file detected across your PRs. ",
  "banner.conflictingFiles_other": "{count} conflicting files detected across your PRs. ",
  "banner.resolveConflicts": "Resolve conflicts to unblock merges.",
  "banner.viewConflicts": "View Conflicts",

  // Conflicts View
  "conflictsView.summary": "{count} PRs with Merge Conflicts",
  "conflictsView.summary_one": "{count} PR with Merge Conflicts",
  "conflictsView.summary_other": "{count} PRs with Merge Conflicts",
  "conflictsView.files": "{count} conflicting files total.",
  "conflictsView.files_one": "{count} conflicting file total.",
  "conflictsView.files_other": "{count} conflicting files total.",
  "conflictsView.clickHint": "Click on a PR to see detailed conflict information.",

  // Project Group
  "project.pullRequests": "{count} pull requests",
  "project.pullRequests_one": "{count} pull request",
  "project.pullRequests_other": "{count} pull requests",
  "project.approved": "{count} Approved",
  "project.waiting": "{count} Waiting",
  "project.conflicts": "{count} Conflicts",
  "project.rejected": "{count} Rejected",

  // Notifications
  "notifications.title": "Notifications",
  "notifications.markAllRead": "Mark all read",
  "notifications.empty": "No notifications yet",
  "notification.mergeConflict": "Merge conflicts detected in \"{title}\" ({project}/{repo}) - {count} file(s) affected",
  "notification.approved": "{reviewer} approved \"{title}\" in {project}",
  "notification.rejected": "{reviewer} rejected \"{title}\" in {project}",
} as const;

export type TranslationKey = keyof typeof en;

const fr: Record<TranslationKey, string> = {
  // Header
  "header.title": "Suivi des PRs",
  "header.updated": "Mis \u00e0 jour {time}",
  "header.loading": "Chargement...",
  "header.totalPRs": "Total PRs",
  "header.approved": "Approuv\u00e9es",
  "header.waiting": "En attente",
  "header.conflicts": "Conflits",

  // Navigation
  "nav.allPRs": "Toutes les PRs",
  "nav.needsMyReview": "En attente de ma revue",
  "nav.createdByMe": "Cr\u00e9\u00e9es par moi",
  "nav.byProject": "Par projet",
  "nav.conflicts": "Conflits",
  "nav.refresh": "Actualiser",
  "nav.notifications": "Notifications",

  // Error / Loading / Empty
  "error.title": "Erreur",
  "error.retry": "R\u00e9essayer",
  "loading.title": "Chargement des pull requests...",
  "loading.subtitle": "Analyse de tous les projets de votre organisation",
  "empty.noPRs": "Aucune pull request trouv\u00e9e",
  "empty.noPRsHint": "Essayez de modifier vos filtres ou revenez plus tard.",
  "empty.noReviewPRs": "Aucune pull request en attente de votre revue",
  "empty.noReviewPRsHint": "Vous \u00eates \u00e0 jour ! Aucune PR n'attend votre revue.",
  "empty.noMyPRs": "Vous n'avez cr\u00e9\u00e9 aucune pull request",
  "empty.noMyPRsHint": "Les pull requests que vous cr\u00e9ez appara\u00eetront ici.",
  "empty.noProjects": "Aucun projet avec des pull requests",
  "empty.noProjectsHint": "Aucune pull request active trouv\u00e9e dans vos projets.",
  "empty.noConflicts": "Aucun conflit de fusion",
  "empty.noConflictsHint": "Toutes vos pull requests sont sans conflit. Bravo !",

  // Stats Cards
  "stats.totalPRs": "Total PRs",
  "stats.approved": "Approuv\u00e9es",
  "stats.awaitingReview": "En attente",
  "stats.conflicts": "Conflits",
  "stats.aging": "Anciennes (>1j)",
  "stats.rejected": "Rejet\u00e9es",
  "stats.drafts": "Brouillons",

  // Filter Bar
  "filter.search": "Rechercher par titre, auteur, branche...",
  "filter.allStatus": "Tous les statuts",
  "filter.active": "Active",
  "filter.completed": "Termin\u00e9e",
  "filter.abandoned": "Abandonn\u00e9e",
  "filter.allProjects": "Tous les projets",
  "filter.allMergeStatus": "Tous les statuts de fusion",
  "filter.hasConflicts": "Avec conflits",
  "filter.noConflicts": "Sans conflits",
  "filter.sortByDate": "Trier par date",
  "filter.sortByTitle": "Trier par titre",
  "filter.sortByProject": "Trier par projet",
  "filter.sortByConflicts": "Trier par conflits",
  "filter.sortByReview": "Trier par revue",
  "filter.ascending": "Croissant",
  "filter.descending": "D\u00e9croissant",

  // PR Card
  "pr.draft": "Brouillon",
  "pr.autoComplete": "Auto-compl\u00e9tion",
  "pr.mergeOk": "Fusion OK",
  "pr.queued": "En file d'attente",
  "pr.viewFiles": "Voir les fichiers",
  "pr.approve": "Approuver",
  "pr.approving": "Approbation...",
  "pr.openInDevOps": "Ouvrir dans DevOps",
  "pr.loadingDetails": "Chargement des d\u00e9tails...",
  "pr.failedToApprove": "\u00c9chec de l'approbation",
  "pr.conflicts": "{count} Conflits",
  "pr.conflicts_one": "{count} Conflit",
  "pr.conflicts_other": "{count} Conflits",
  "pr.files": "{count} fichiers",
  "pr.files_one": "{count} fichier",
  "pr.files_other": "{count} fichiers",

  // PR Card: Detail tabs
  "pr.tab.conflicts": "Conflits ({count})",
  "pr.tab.reviewers": "R\u00e9viseurs ({count})",
  "pr.tab.comments": "Commentaires ({count} actifs)",

  // PR Card: Conflict section
  "pr.conflictsDetected": "{count} conflits de fusion d\u00e9tect\u00e9s",
  "pr.conflictsDetected_one": "{count} conflit de fusion d\u00e9tect\u00e9",
  "pr.conflictsDetected_other": "{count} conflits de fusion d\u00e9tect\u00e9s",
  "pr.noConflictsDetail": "Aucun conflit de fusion d\u00e9tect\u00e9. Cette PR peut \u00eatre fusionn\u00e9e.",
  "pr.resolved": "R\u00e9solu",
  "pr.unresolved": "Non r\u00e9solu",

  // PR Card: Reviewer section
  "pr.reviewersTitle": "R\u00e9viseurs",
  "pr.noReviewers": "Aucun r\u00e9viseur assign\u00e9 \u00e0 cette pull request.",
  "pr.required": "(Requis)",

  // PR Card: Comment section
  "pr.commentThreads": "{count} fils de commentaires",
  "pr.commentThreads_one": "{count} fil de commentaires",
  "pr.commentThreads_other": "{count} fils de commentaires",
  "pr.noComments": "Aucun commentaire sur cette pull request.",
  "pr.moreReplies": "(+{count} r\u00e9ponses suppl\u00e9mentaires)",
  "pr.moreThreads": "+{count} fils suppl\u00e9mentaires",
  "pr.threadActive": "Actif",
  "pr.threadResolved": "R\u00e9solu",

  // Vote labels
  "vote.approved": "Approuv\u00e9",
  "vote.approvedWithSuggestions": "Approuv\u00e9 avec suggestions",
  "vote.rejected": "Rejet\u00e9",
  "vote.waitingForAuthor": "En attente de l'auteur",
  "vote.noVote": "Pas de vote",

  // Age labels
  "age.today": "Aujourd'hui",
  "age.oneDay": "1 jour",
  "age.days": "{count} jours",
  "age.weeks": "{count}sem",
  "age.months": "{count}mois",

  // Time
  "time.justNow": "\u00e0 l'instant",
  "time.minutesAgo": "il y a {count}min",
  "time.hoursAgo": "il y a {count}h",
  "time.yesterday": "Hier",
  "time.daysAgo": "il y a {count}j",

  // Status
  "status.active": "Active",
  "status.completed": "Termin\u00e9e",
  "status.abandoned": "Abandonn\u00e9e",

  // Conflicts Banner
  "banner.prsWithConflicts": "{count} Pull Requests avec des conflits de fusion",
  "banner.prsWithConflicts_one": "{count} Pull Request avec des conflits de fusion",
  "banner.prsWithConflicts_other": "{count} Pull Requests avec des conflits de fusion",
  "banner.conflictingFiles": "{count} fichiers en conflit d\u00e9tect\u00e9s dans vos PRs. ",
  "banner.conflictingFiles_one": "{count} fichier en conflit d\u00e9tect\u00e9 dans vos PRs. ",
  "banner.conflictingFiles_other": "{count} fichiers en conflit d\u00e9tect\u00e9s dans vos PRs. ",
  "banner.resolveConflicts": "R\u00e9solvez les conflits pour d\u00e9bloquer les fusions.",
  "banner.viewConflicts": "Voir les conflits",

  // Conflicts View
  "conflictsView.summary": "{count} PRs avec des conflits de fusion",
  "conflictsView.summary_one": "{count} PR avec des conflits de fusion",
  "conflictsView.summary_other": "{count} PRs avec des conflits de fusion",
  "conflictsView.files": "{count} fichiers en conflit au total.",
  "conflictsView.files_one": "{count} fichier en conflit au total.",
  "conflictsView.files_other": "{count} fichiers en conflit au total.",
  "conflictsView.clickHint": "Cliquez sur une PR pour voir les d\u00e9tails des conflits.",

  // Project Group
  "project.pullRequests": "{count} pull requests",
  "project.pullRequests_one": "{count} pull request",
  "project.pullRequests_other": "{count} pull requests",
  "project.approved": "{count} Approuv\u00e9es",
  "project.waiting": "{count} En attente",
  "project.conflicts": "{count} Conflits",
  "project.rejected": "{count} Rejet\u00e9es",

  // Notifications
  "notifications.title": "Notifications",
  "notifications.markAllRead": "Tout marquer comme lu",
  "notifications.empty": "Aucune notification",
  "notification.mergeConflict": "Conflits de fusion d\u00e9tect\u00e9s dans \u00ab {title} \u00bb ({project}/{repo}) - {count} fichier(s) affect\u00e9(s)",
  "notification.approved": "{reviewer} a approuv\u00e9 \u00ab {title} \u00bb dans {project}",
  "notification.rejected": "{reviewer} a rejet\u00e9 \u00ab {title} \u00bb dans {project}",
};

export { en, fr };
