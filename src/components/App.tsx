import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  IPullRequestItem,
  IProjectInfo,
  IProjectGroup,
  IFilterState,
  INotification,
  ViewMode,
  PullRequestStatus,
  MergeStatus,
  ReviewerVote,
  NotificationType,
} from "../models/types";
import * as sdkService from "../services/sdkService";
import { useT } from "../i18n/I18nContext";
import Header from "./Header";
import FilterBar from "./FilterBar";
import StatsCards from "./StatsCards";
import ConflictsBanner from "./ConflictsBanner";
import PRCard from "./PRCard";
import ProjectGroup from "./ProjectGroup";
import NotificationPanel from "./NotificationPanel";
import "../styles/main.scss";

const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const NOTIFICATIONS_STORAGE_KEY = "pr-tracker-notifications";

const defaultFilters: IFilterState = {
  searchText: "",
  status: "all",
  project: "all",
  repository: "all",
  reviewer: "all",
  hasConflicts: "all",
  dateRange: "all",
  sortBy: "date",
  sortDirection: "desc",
};

const App: React.FC = () => {
  const { t } = useT();
  const [pullRequests, setPullRequests] = useState<IPullRequestItem[]>([]);
  const [projects, setProjects] = useState<IProjectInfo[]>([]);
  const [filters, setFilters] = useState<IFilterState>(defaultFilters);
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [notifications, setNotifications] = useState<INotification[]>(() => {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) }));
      }
    } catch {}
    return [];
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [organizationName, setOrganizationName] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    try {
      return localStorage.getItem("pr-tracker-dark-theme") === "true";
    } catch {
      return false;
    }
  });
  const [showThemeGlow, setShowThemeGlow] = useState(() => {
    try {
      return !localStorage.getItem("pr-tracker-theme-seen");
    } catch {
      return true;
    }
  });
  const previousPRsRef = useRef<IPullRequestItem[]>([]);

  const toggleTheme = useCallback(() => {
    setIsDarkTheme((prev) => {
      const next = !prev;
      try { localStorage.setItem("pr-tracker-dark-theme", String(next)); } catch {}
      return next;
    });
    if (showThemeGlow) {
      setShowThemeGlow(false);
      try { localStorage.setItem("pr-tracker-theme-seen", "1"); } catch {}
    }
  }, [showThemeGlow]);

  // Persist notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  // Initialize SDK and load data
  useEffect(() => {
    const init = async () => {
      try {
        await sdkService.initializeSDK();
        setOrganizationName(sdkService.getOrganizationName());
        const user = sdkService.getCurrentUser();
        setCurrentUserId(user.id);
        await loadData();
      } catch (err) {
        setError(
          `Failed to initialize: ${err instanceof Error ? err.message : String(err)}`
        );
        setLoading(false);
      }
    };
    init();
  }, []);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      loadData(true);
    }, AUTO_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);

    try {
      const [projectList, prs] = await Promise.all([
        sdkService.getAllProjects(),
        sdkService.getAllPullRequests(PullRequestStatus.Active),
      ]);

      setProjects(projectList);

      // Enrich PRs with conflict and comment details in batches
      const enrichedPRs = await enrichInBatches(prs, 5);

      // Generate notifications
      const isFirstLoad = previousPRsRef.current.length === 0;
      if (isFirstLoad) {
        // On first load, generate notifications for existing conflicts and rejections
        const initialNotifications = generateInitialNotifications(enrichedPRs, t);
        if (initialNotifications.length > 0) {
          setNotifications((prev) => {
            const existingIds = new Set(prev.map((n: INotification) => n.id));
            const fresh = initialNotifications.filter((n) => !existingIds.has(n.id));
            return fresh.length > 0 ? [...fresh, ...prev].slice(0, 100) : prev;
          });
        }
      } else {
        // On subsequent refreshes, compare with previous state
        const newNotifications = generateNotifications(enrichedPRs, previousPRsRef.current, t);
        if (newNotifications.length > 0) {
          setNotifications((prev) => [...newNotifications, ...prev].slice(0, 100));
        }
      }

      previousPRsRef.current = enrichedPRs;
      setPullRequests(enrichedPRs);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(
        `Failed to load pull requests: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  const enrichInBatches = async (
    prs: IPullRequestItem[],
    batchSize: number
  ): Promise<IPullRequestItem[]> => {
    const results: IPullRequestItem[] = [];
    for (let i = 0; i < prs.length; i += batchSize) {
      const batch = prs.slice(i, i + batchSize);
      const enriched = await Promise.all(
        batch.map((pr) => sdkService.enrichPullRequestWithDetails(pr))
      );
      results.push(...enriched);
    }
    return results;
  };

  const handleLoadDetails = useCallback(async (pr: IPullRequestItem) => {
    const enriched = await sdkService.enrichPullRequestWithDetails(pr);
    setPullRequests((prev) =>
      prev.map((p) =>
        p.id === pr.id && p.project.id === pr.project.id ? enriched : p
      )
    );
  }, []);

  const handleFilterChange = useCallback((partial: Partial<IFilterState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleMarkNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  // Filter and sort PRs
  const filteredPRs = filterPullRequests(pullRequests, filters);
  const sortedPRs = sortPullRequests(filteredPRs, filters);

  // Group by project
  const projectGroups = groupByProject(sortedPRs);

  // Needs My Review PRs
  const needsMyReviewPRs = sortedPRs.filter(
    (pr) =>
      currentUserId &&
      pr.reviewers.some(
        (r) => r.id === currentUserId && r.vote === ReviewerVote.NoVote && !r.hasDeclined
      )
  );

  // Created by Me PRs
  const createdByMePRs = sortedPRs.filter(
    (pr) => currentUserId && pr.createdBy.id === currentUserId
  );

  // Conflict PRs
  const conflictPRs = sortedPRs.filter(
    (pr) => pr.mergeStatus === MergeStatus.Conflicts || pr.mergeConflicts.length > 0
  );

  const unreadNotifications = notifications.filter((n) => !n.isRead).length;
  const repositories = [...new Set(pullRequests.map((pr) => pr.repository.name))].sort();

  return (
    <div className={`pr-tracker ${isDarkTheme ? "dark-theme" : ""}`}>
      <Header
        pullRequests={pullRequests}
        organizationName={organizationName}
        lastRefreshed={lastRefreshed}
      />

      {/* Navigation */}
      <div className="pr-tracker-nav">
        <div className="nav-content">
          <div className="nav-tabs">
            <button
              className={`nav-tab ${viewMode === "all" ? "active" : ""}`}
              onClick={() => setViewMode("all")}
            >
              &#128203; {t("nav.allPRs")}
              <span className="tab-badge">{pullRequests.length}</span>
            </button>
            <button
              className={`nav-tab ${viewMode === "needsMyReview" ? "active" : ""}`}
              onClick={() => setViewMode("needsMyReview")}
            >
              &#128064; {t("nav.needsMyReview")}
              {needsMyReviewPRs.length > 0 && (
                <span className="tab-badge">{needsMyReviewPRs.length}</span>
              )}
            </button>
            <button
              className={`nav-tab ${viewMode === "createdByMe" ? "active" : ""}`}
              onClick={() => setViewMode("createdByMe")}
            >
              &#128100; {t("nav.createdByMe")}
              {createdByMePRs.length > 0 && (
                <span className="tab-badge">{createdByMePRs.length}</span>
              )}
            </button>
            <button
              className={`nav-tab ${viewMode === "byProject" ? "active" : ""}`}
              onClick={() => setViewMode("byProject")}
            >
              &#128193; {t("nav.byProject")}
              <span className="tab-badge">{projectGroups.length}</span>
            </button>
            <button
              className={`nav-tab ${viewMode === "conflicts" ? "active" : ""}`}
              onClick={() => setViewMode("conflicts")}
            >
              &#9888; {t("nav.conflicts")}
              {conflictPRs.length > 0 && (
                <span className="tab-badge">{conflictPRs.length}</span>
              )}
            </button>
          </div>

          <div className="nav-actions">
            <button
              className={`theme-toggle-btn${showThemeGlow ? " glow" : ""}`}
              onClick={toggleTheme}
              title={isDarkTheme ? "Light mode" : "Dark mode"}
            >
              <span className={`theme-icon ${isDarkTheme ? "is-dark" : "is-light"}`}>
                {isDarkTheme ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </span>
            </button>
            <button className="btn" onClick={() => loadData()}>
              &#8635; {t("nav.refresh")}
            </button>
            <button
              className="btn btn-notification"
              onClick={() => setShowNotifications(true)}
            >
              &#128276; {t("nav.notifications")}
              {unreadNotifications > 0 && <span className="notification-dot" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pr-tracker-content">
        {error && (
          <div
            className="conflict-banner"
            style={{
              background: "#fff4ce",
              borderColor: "#ff8c00",
            }}
          >
            <div className="banner-content">
              <div className="banner-icon">&#9888;</div>
              <div className="banner-text">
                <h4 style={{ color: "#ff8c00" }}>{t("error.title")}</h4>
                <p style={{ color: "#795000" }}>{error}</p>
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => loadData()}>
              {t("error.retry")}
            </button>
          </div>
        )}

        {loading ? (
          <LoadingState />
        ) : (
          <>
            {/* Stats Cards */}
            <StatsCards pullRequests={pullRequests} />

            {/* Conflict Banner */}
            {viewMode !== "conflicts" && (
              <ConflictsBanner
                pullRequests={pullRequests}
                onShowConflicts={() => setViewMode("conflicts")}
              />
            )}

            {/* Filter Bar */}
            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              projects={projects}
              repositories={repositories}
            />

            {/* Content based on view mode */}
            {viewMode === "all" && (
              <AllPRsView
                pullRequests={sortedPRs}
                onLoadDetails={handleLoadDetails}
              />
            )}

            {viewMode === "needsMyReview" && (
              <NeedsMyReviewView
                pullRequests={needsMyReviewPRs}
                onLoadDetails={handleLoadDetails}
              />
            )}

            {viewMode === "createdByMe" && (
              <CreatedByMeView
                pullRequests={createdByMePRs}
                onLoadDetails={handleLoadDetails}
              />
            )}

            {viewMode === "byProject" && (
              <ProjectView
                groups={projectGroups}
                onLoadDetails={handleLoadDetails}
              />
            )}

            {viewMode === "conflicts" && (
              <ConflictsView
                pullRequests={conflictPRs}
                onLoadDetails={handleLoadDetails}
              />
            )}
          </>
        )}
      </div>

      {/* Notification Panel */}
      {showNotifications && (
        <NotificationPanel
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onMarkRead={handleMarkNotificationRead}
          onMarkAllRead={handleMarkAllRead}
        />
      )}
    </div>
  );
};

// --- Sub Views ---

const AllPRsView: React.FC<{
  pullRequests: IPullRequestItem[];
  onLoadDetails: (pr: IPullRequestItem) => Promise<void>;
}> = ({ pullRequests, onLoadDetails }) => {
  const { t } = useT();

  if (pullRequests.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">&#128269;</div>
        <h3>{t("empty.noPRs")}</h3>
        <p>{t("empty.noPRsHint")}</p>
      </div>
    );
  }

  return (
    <div>
      {pullRequests.map((pr) => (
        <PRCard
          key={`${pr.project.id}-${pr.id}`}
          pr={pr}
          onLoadDetails={onLoadDetails}
        />
      ))}
    </div>
  );
};

const NeedsMyReviewView: React.FC<{
  pullRequests: IPullRequestItem[];
  onLoadDetails: (pr: IPullRequestItem) => Promise<void>;
}> = ({ pullRequests, onLoadDetails }) => {
  const { t } = useT();

  if (pullRequests.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">&#9989;</div>
        <h3>{t("empty.noReviewPRs")}</h3>
        <p>{t("empty.noReviewPRsHint")}</p>
      </div>
    );
  }

  return (
    <div>
      {pullRequests.map((pr) => (
        <PRCard
          key={`${pr.project.id}-${pr.id}`}
          pr={pr}
          onLoadDetails={onLoadDetails}
        />
      ))}
    </div>
  );
};

const CreatedByMeView: React.FC<{
  pullRequests: IPullRequestItem[];
  onLoadDetails: (pr: IPullRequestItem) => Promise<void>;
}> = ({ pullRequests, onLoadDetails }) => {
  const { t } = useT();

  if (pullRequests.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">&#128100;</div>
        <h3>{t("empty.noMyPRs")}</h3>
        <p>{t("empty.noMyPRsHint")}</p>
      </div>
    );
  }

  return (
    <div>
      {pullRequests.map((pr) => (
        <PRCard
          key={`${pr.project.id}-${pr.id}`}
          pr={pr}
          onLoadDetails={onLoadDetails}
        />
      ))}
    </div>
  );
};

const ProjectView: React.FC<{
  groups: IProjectGroup[];
  onLoadDetails: (pr: IPullRequestItem) => Promise<void>;
}> = ({ groups, onLoadDetails }) => {
  const { t } = useT();

  if (groups.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">&#128193;</div>
        <h3>{t("empty.noProjects")}</h3>
        <p>{t("empty.noProjectsHint")}</p>
      </div>
    );
  }

  return (
    <div>
      {groups.map((group) => (
        <ProjectGroup
          key={group.project.id}
          group={group}
          onLoadDetails={onLoadDetails}
        />
      ))}
    </div>
  );
};

const ConflictsView: React.FC<{
  pullRequests: IPullRequestItem[];
  onLoadDetails: (pr: IPullRequestItem) => Promise<void>;
}> = ({ pullRequests, onLoadDetails }) => {
  const { t } = useT();

  if (pullRequests.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">&#10024;</div>
        <h3>{t("empty.noConflicts")}</h3>
        <p>{t("empty.noConflictsHint")}</p>
      </div>
    );
  }

  const totalConflictFiles = pullRequests.reduce(
    (sum, pr) => sum + pr.mergeConflicts.length,
    0
  );

  return (
    <div>
      <div className="conflict-banner">
        <div className="banner-content">
          <div className="banner-icon">&#9888;&#65039;</div>
          <div className="banner-text">
            <h4>
              {t("conflictsView.summary", { count: pullRequests.length })}
            </h4>
            <p>
              {t("conflictsView.files", { count: totalConflictFiles })}{" "}
              {t("conflictsView.clickHint")}
            </p>
          </div>
        </div>
      </div>

      {pullRequests.map((pr) => (
        <PRCard
          key={`${pr.project.id}-${pr.id}`}
          pr={pr}
          onLoadDetails={onLoadDetails}
        />
      ))}
    </div>
  );
};

const LoadingState: React.FC = () => {
  const { t } = useT();

  return (
    <div>
      <div className="stats-summary">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="skeleton-card" style={{ padding: "20px" }}>
            <div className="skeleton-line short" />
            <div className="skeleton-line" style={{ height: "28px", width: "60px" }} />
            <div className="skeleton-line short" />
          </div>
        ))}
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-line long" />
          <div className="skeleton-line medium" />
          <div className="skeleton-line short" />
        </div>
      ))}
      <div className="loading-container">
        <div className="loading-spinner" />
        <div className="loading-text">{t("loading.title")}</div>
        <div className="loading-subtext">{t("loading.subtitle")}</div>
      </div>
    </div>
  );
};

// --- Utility Functions ---

function filterPullRequests(
  prs: IPullRequestItem[],
  filters: IFilterState
): IPullRequestItem[] {
  return prs.filter((pr) => {
    // Text search
    if (filters.searchText) {
      const search = filters.searchText.toLowerCase();
      const searchable = [
        pr.title,
        pr.createdBy.displayName,
        pr.sourceRefName,
        pr.targetRefName,
        pr.repository.name,
        pr.project.name,
        `#${pr.id}`,
      ]
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(search)) return false;
    }

    // Status filter
    if (filters.status !== "all" && pr.status !== filters.status) return false;

    // Project filter
    if (filters.project !== "all" && pr.project.name !== filters.project) return false;

    // Conflict filter
    if (filters.hasConflicts === "conflicts") {
      if (pr.mergeStatus !== MergeStatus.Conflicts && pr.mergeConflicts.length === 0)
        return false;
    } else if (filters.hasConflicts === "clean") {
      if (pr.mergeStatus === MergeStatus.Conflicts || pr.mergeConflicts.length > 0)
        return false;
    }

    return true;
  });
}

function sortPullRequests(
  prs: IPullRequestItem[],
  filters: IFilterState
): IPullRequestItem[] {
  const sorted = [...prs];
  const dir = filters.sortDirection === "asc" ? 1 : -1;

  sorted.sort((a, b) => {
    switch (filters.sortBy) {
      case "title":
        return dir * a.title.localeCompare(b.title);
      case "project":
        return dir * a.project.name.localeCompare(b.project.name);
      case "conflicts":
        return dir * (b.mergeConflicts.length - a.mergeConflicts.length);
      case "reviewers": {
        const aScore = getReviewScore(a);
        const bScore = getReviewScore(b);
        return dir * (bScore - aScore);
      }
      case "date":
      default:
        return (
          dir *
          (new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime())
        );
    }
  });

  return sorted;
}

function getReviewScore(pr: IPullRequestItem): number {
  let score = 0;
  for (const r of pr.reviewers) {
    if (r.vote === ReviewerVote.Approved) score += 2;
    else if (r.vote === ReviewerVote.ApprovedWithSuggestions) score += 1;
    else if (r.vote === ReviewerVote.Rejected) score -= 2;
  }
  return score;
}

function groupByProject(prs: IPullRequestItem[]): IProjectGroup[] {
  const map = new Map<string, IProjectGroup>();

  for (const pr of prs) {
    const key = pr.project.id;
    if (!map.has(key)) {
      map.set(key, {
        project: pr.project,
        pullRequests: [],
        totalConflicts: 0,
        totalApproved: 0,
        totalWaiting: 0,
        totalRejected: 0,
      });
    }
    const group = map.get(key)!;
    group.pullRequests.push(pr);
  }

  return Array.from(map.values()).sort((a, b) =>
    a.project.name.localeCompare(b.project.name)
  );
}

function generateNotifications(
  current: IPullRequestItem[],
  previous: IPullRequestItem[],
  t: (key: any, params?: Record<string, string | number>) => string
): INotification[] {
  const notifications: INotification[] = [];
  const prevMap = new Map(previous.map((pr) => [`${pr.project.id}-${pr.id}`, pr]));

  for (const pr of current) {
    const key = `${pr.project.id}-${pr.id}`;
    const prev = prevMap.get(key);

    if (pr.mergeStatus === MergeStatus.Conflicts || pr.mergeConflicts.length > 0) {
      if (
        !prev ||
        (prev.mergeStatus !== MergeStatus.Conflicts && prev.mergeConflicts.length === 0)
      ) {
        notifications.push({
          id: `conflict-${key}-${Date.now()}`,
          type: NotificationType.MergeConflict,
          message: t("notification.mergeConflict", {
            title: pr.title,
            project: pr.project.name,
            repo: pr.repository.name,
            count: pr.mergeConflicts.length,
          }),
          pullRequest: pr,
          timestamp: new Date(),
          isRead: false,
        });
      }
    }

    if (prev) {
      for (const reviewer of pr.reviewers) {
        const prevReviewer = prev.reviewers.find((r) => r.id === reviewer.id);
        if (
          reviewer.vote === ReviewerVote.Approved &&
          (!prevReviewer || prevReviewer.vote !== ReviewerVote.Approved)
        ) {
          notifications.push({
            id: `approved-${key}-${reviewer.id}-${Date.now()}`,
            type: NotificationType.Approved,
            message: t("notification.approved", {
              reviewer: reviewer.displayName,
              title: pr.title,
              project: pr.project.name,
            }),
            pullRequest: pr,
            timestamp: new Date(),
            isRead: false,
          });
        }
        if (
          reviewer.vote === ReviewerVote.Rejected &&
          (!prevReviewer || prevReviewer.vote !== ReviewerVote.Rejected)
        ) {
          notifications.push({
            id: `rejected-${key}-${reviewer.id}-${Date.now()}`,
            type: NotificationType.Rejected,
            message: t("notification.rejected", {
              reviewer: reviewer.displayName,
              title: pr.title,
              project: pr.project.name,
            }),
            pullRequest: pr,
            timestamp: new Date(),
            isRead: false,
          });
        }
      }
    }
  }

  return notifications;
}

function generateInitialNotifications(
  prs: IPullRequestItem[],
  t: (key: any, params?: Record<string, string | number>) => string
): INotification[] {
  const notifications: INotification[] = [];

  for (const pr of prs) {
    const key = `${pr.project.id}-${pr.id}`;

    // Notify about existing conflicts
    if (pr.mergeStatus === MergeStatus.Conflicts || pr.mergeConflicts.length > 0) {
      notifications.push({
        id: `conflict-${key}`,
        type: NotificationType.MergeConflict,
        message: t("notification.mergeConflict", {
          title: pr.title,
          project: pr.project.name,
          repo: pr.repository.name,
          count: pr.mergeConflicts.length,
        }),
        pullRequest: pr,
        timestamp: new Date(),
        isRead: false,
      });
    }

    // Notify about existing rejections
    for (const reviewer of pr.reviewers) {
      if (reviewer.vote === ReviewerVote.Rejected) {
        notifications.push({
          id: `rejected-${key}-${reviewer.id}`,
          type: NotificationType.Rejected,
          message: t("notification.rejected", {
            reviewer: reviewer.displayName,
            title: pr.title,
            project: pr.project.name,
          }),
          pullRequest: pr,
          timestamp: new Date(),
          isRead: false,
        });
      }
    }
  }

  return notifications;
}

export default App;
