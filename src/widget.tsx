import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import * as SDK from "azure-devops-extension-sdk";
import { getClient } from "azure-devops-extension-api";
import { GitRestClient } from "azure-devops-extension-api/Git";
import { CoreRestClient } from "azure-devops-extension-api/Core";

interface WidgetStats {
  total: number;
  approved: number;
  conflicts: number;
  waiting: number;
  needsMyReview: number;
  drafts: number;
}

const Widget: React.FC = () => {
  const [stats, setStats] = useState<WidgetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orgUrl, setOrgUrl] = useState("");

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const host = SDK.getHost();
      setOrgUrl(`https://dev.azure.com/${host.name}`);

      const currentUser = SDK.getUser();
      const coreClient = getClient(CoreRestClient);
      const gitClient = getClient(GitRestClient);
      const projects = await coreClient.getProjects();

      let total = 0;
      let approved = 0;
      let conflicts = 0;
      let waiting = 0;
      let needsMyReview = 0;
      let drafts = 0;

      const results = await Promise.allSettled(
        projects.map(async (project) => {
          try {
            const repos = await gitClient.getRepositories(project.name!);
            const repoResults = await Promise.allSettled(
              repos.map(async (repo) => {
                try {
                  const prs = await gitClient.getPullRequests(
                    repo.id,
                    { status: 1, includeLinks: false } as any,
                    project.name!
                  );
                  return prs;
                } catch {
                  return [];
                }
              })
            );
            const allPRs: any[] = [];
            for (const r of repoResults) {
              if (r.status === "fulfilled") allPRs.push(...r.value);
            }
            return allPRs;
          } catch {
            return [];
          }
        })
      );

      for (const result of results) {
        if (result.status === "fulfilled") {
          for (const pr of result.value) {
            total++;
            if (pr.isDraft) drafts++;
            if (pr.mergeStatus === 2) conflicts++;

            const reviewers = pr.reviewers || [];
            const hasApproval = reviewers.some((r: any) => r.vote === 10);
            const allNoVote = reviewers.length === 0 || reviewers.every((r: any) => r.vote === 0);

            if (hasApproval) approved++;
            if (allNoVote) waiting++;
            if (reviewers.some((r: any) => r.id === currentUser.id && r.vote === 0 && !r.hasDeclined)) {
              needsMyReview++;
            }
          }
        }
      }

      setStats({ total, approved, conflicts, waiting, needsMyReview, drafts });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <span style={styles.headerIcon}>&#128203;</span>
          <span style={styles.headerTitle}>PR Tracker</span>
        </div>
        <div style={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <span style={styles.headerIcon}>&#128203;</span>
          <span style={styles.headerTitle}>PR Tracker</span>
        </div>
        <div style={{ ...styles.loading, color: "#d13438" }}>Error: {error}</div>
      </div>
    );
  }

  if (!stats) return null;

  const statItems = [
    { label: "Total", value: stats.total, color: "#0078d4" },
    { label: "My Review", value: stats.needsMyReview, color: "#8764b8" },
    { label: "Approved", value: stats.approved, color: "#107c10" },
    { label: "Waiting", value: stats.waiting, color: "#ff8c00" },
    { label: "Conflicts", value: stats.conflicts, color: "#d13438" },
    { label: "Drafts", value: stats.drafts, color: "#9e9e9e" },
  ];

  return (
    <div style={styles.container}>
      <a href={orgUrl} target="_blank" rel="noopener noreferrer" style={styles.headerLink}>
        <div style={styles.header}>
          <span style={styles.headerIcon}>&#128203;</span>
          <span style={styles.headerTitle}>PR Tracker</span>
          <span style={styles.totalBadge}>{stats.total}</span>
        </div>
      </a>
      <div style={styles.grid}>
        {statItems.map((item) => (
          <div key={item.label} style={styles.statItem}>
            <div style={{ ...styles.statValue, color: item.color }}>{item.value}</div>
            <div style={styles.statLabel}>{item.label}</div>
          </div>
        ))}
      </div>
      {stats.needsMyReview > 0 && (
        <div style={styles.alert}>
          &#128064; {stats.needsMyReview} PR{stats.needsMyReview !== 1 ? "s" : ""} need your review
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    padding: "12px",
    height: "100%",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
    paddingBottom: "8px",
    borderBottom: "1px solid #e0e0e0",
  },
  headerLink: {
    textDecoration: "none",
    color: "inherit",
  },
  headerIcon: {
    fontSize: "20px",
  },
  headerTitle: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#333",
    flex: 1,
  },
  totalBadge: {
    fontSize: "12px",
    fontWeight: 600,
    background: "#0078d4",
    color: "white",
    padding: "2px 8px",
    borderRadius: "10px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "8px",
    flex: 1,
  },
  statItem: {
    textAlign: "center" as const,
    padding: "8px 4px",
    borderRadius: "6px",
    background: "#f5f5f5",
  },
  statValue: {
    fontSize: "20px",
    fontWeight: 700,
  },
  statLabel: {
    fontSize: "10px",
    color: "#757575",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    marginTop: "2px",
  },
  loading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    color: "#757575",
    fontSize: "13px",
  },
  alert: {
    marginTop: "8px",
    padding: "6px 10px",
    background: "#e8d5f5",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 500,
    color: "#5b2d8e",
    textAlign: "center" as const,
  },
};

// Render the widget into the DOM
function renderWidget() {
  ReactDOM.render(
    <React.StrictMode>
      <Widget />
    </React.StrictMode>,
    document.getElementById("widget-root")
  );
}

// Initialize SDK and register widget contribution for Azure DevOps Dashboard
SDK.init({
  loaded: false,
  applyTheme: true,
});

SDK.ready().then(() => {
  // Register the widget with the dashboard framework
  SDK.register("pr-tracker-widget", () => {
    return {
      preload: () => {
        return { state: 1 }; // WidgetStatusType.Success
      },
      load: () => {
        renderWidget();
        return { state: 1 }; // WidgetStatusType.Success
      },
      reload: () => {
        renderWidget();
        return { state: 1 }; // WidgetStatusType.Success
      },
    };
  });

  SDK.notifyLoadSucceeded();
});
