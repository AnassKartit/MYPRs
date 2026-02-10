import React, { useState, useCallback } from "react";
import {
  IPullRequestItem,
  MergeStatus,
  ReviewerVote,
  IReviewer,
  IMergeConflict,
  ICommentThread,
} from "../models/types";
import { useT, TFunction } from "../i18n/I18nContext";

interface PRCardProps {
  pr: IPullRequestItem;
  onLoadDetails?: (pr: IPullRequestItem) => Promise<void>;
}

const PRCard: React.FC<PRCardProps> = ({ pr, onLoadDetails }) => {
  const { t } = useT();
  const [expanded, setExpanded] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<"conflicts" | "reviewers" | "comments">(
    "conflicts"
  );
  const [loadingDetails, setLoadingDetails] = useState(false);

  const hasConflicts = pr.mergeStatus === MergeStatus.Conflicts || pr.mergeConflicts.length > 0;

  const handleExpand = async () => {
    if (!expanded && onLoadDetails && pr.mergeConflicts.length === 0 && pr.threads.length === 0) {
      setLoadingDetails(true);
      try {
        await onLoadDetails(pr);
      } finally {
        setLoadingDetails(false);
      }
    }
    setExpanded(!expanded);
  };

  const approvedReviewers = pr.reviewers.filter((r) => r.vote === ReviewerVote.Approved);
  const rejectedReviewers = pr.reviewers.filter((r) => r.vote === ReviewerVote.Rejected);
  const waitingReviewers = pr.reviewers.filter((r) => r.vote === ReviewerVote.WaitingForAuthor);
  const activeThreads = pr.threads.filter(
    (t) => !t.isResolved && t.comments.length > 0 && t.comments.some((c) => c.commentType !== "system")
  );

  return (
    <div
      className={`pr-card ${hasConflicts ? "has-conflicts" : ""} ${pr.isDraft ? "is-draft" : ""}`}
      onClick={handleExpand}
    >
      <div className="pr-card-header">
        <div className="pr-card-title-section">
          <h3 className="pr-card-title">
            <a
              href={pr.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              {pr.title}
            </a>
            {pr.isDraft && <span className="draft-badge">{t("pr.draft")}</span>}
            {pr.hasAutoComplete && <span className="autocomplete-badge">{t("pr.autoComplete")}</span>}
          </h3>
          <div className="pr-card-meta">
            <span className="meta-item">
              <strong>{pr.createdBy.displayName}</strong>
            </span>
            <span className="meta-separator">|</span>
            <span className="meta-item">
              {pr.project.name} / {pr.repository.name}
            </span>
            <span className="meta-separator">|</span>
            <span className="meta-item">#{pr.id}</span>
            <span className="meta-separator">|</span>
            <span className="meta-item">{formatDate(pr.creationDate, t)}</span>
            <span className="meta-separator">|</span>
            <span className={`age-badge ${getAgeClass(pr.creationDate)}`}>
              {getAgeLabel(pr.creationDate, t)}
            </span>
          </div>
        </div>

        <div className="pr-card-badges">
          <span className={`status-badge status-${pr.status}`}>
            {getStatusIcon(pr.status)} {t(`status.${pr.status}` as any)}
          </span>
          {hasConflicts && (
            <span className="status-badge merge-conflicts">
              &#9888; {t("pr.conflicts", { count: pr.mergeConflicts.length || 1 })}
            </span>
          )}
          {pr.mergeStatus === MergeStatus.Succeeded && (
            <span className="status-badge merge-ok">&#10003; {t("pr.mergeOk")}</span>
          )}
          {pr.mergeStatus === MergeStatus.Queued && (
            <span className="status-badge merge-queued">&#8987; {t("pr.queued")}</span>
          )}
        </div>
      </div>

      <div className="pr-card-body">
        <div className="pr-card-branches">
          <span className="branch-name" title={pr.sourceRefName}>
            {pr.sourceRefName}
          </span>
          <span className="branch-arrow">&rarr;</span>
          <span className="branch-name" title={pr.targetRefName}>
            {pr.targetRefName}
          </span>
        </div>

        {pr.description && (
          <div className="pr-card-description">
            {truncateText(pr.description, 150)}
          </div>
        )}

        <div className="pr-card-reviewers">
          {pr.reviewers.slice(0, 5).map((reviewer) => (
            <ReviewerAvatar key={reviewer.id} reviewer={reviewer} />
          ))}
          {pr.reviewers.length > 5 && (
            <div className="reviewer-avatar vote-none">+{pr.reviewers.length - 5}</div>
          )}
        </div>

        <div className="pr-card-stats">
          {approvedReviewers.length > 0 && (
            <span className="stat" style={{ color: "#107c10" }}>
              &#10003; {approvedReviewers.length}
            </span>
          )}
          {rejectedReviewers.length > 0 && (
            <span className="stat" style={{ color: "#d13438" }}>
              &#10007; {rejectedReviewers.length}
            </span>
          )}
          {waitingReviewers.length > 0 && (
            <span className="stat" style={{ color: "#ff8c00" }}>
              &#8987; {waitingReviewers.length}
            </span>
          )}
          {pr.changedFilesCount > 0 && (
            <span className="stat">
              &#128196; {t("pr.files", { count: pr.changedFilesCount })}
            </span>
          )}
          {pr.commentCount > 0 && (
            <span className="stat">
              &#128172; {pr.commentCount}
            </span>
          )}
          {pr.mergeConflicts.length > 0 && (
            <span className="stat" style={{ color: "#d13438" }}>
              &#9888; {pr.mergeConflicts.length}
            </span>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="pr-card-actions" onClick={(e) => e.stopPropagation()}>
        <a
          href={getViewFilesUrl(pr)}
          target="_blank"
          rel="noopener noreferrer"
          className="action-btn"
        >
          &#128196; {t("pr.viewFiles")}
        </a>
        <a
          href={pr.url}
          target="_blank"
          rel="noopener noreferrer"
          className="action-btn"
        >
          &#8599; {t("pr.openInDevOps")}
        </a>
      </div>

      {/* Expanded Detail View */}
      {expanded && (
        <div className="pr-detail-expanded">
          {loadingDetails ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#9e9e9e" }}>
              {t("pr.loadingDetails")}
            </div>
          ) : (
            <>
              <div className="detail-tabs">
                <button
                  className={`detail-tab ${activeDetailTab === "conflicts" ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDetailTab("conflicts");
                  }}
                >
                  {t("pr.tab.conflicts", { count: pr.mergeConflicts.length })}
                </button>
                <button
                  className={`detail-tab ${activeDetailTab === "reviewers" ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDetailTab("reviewers");
                  }}
                >
                  {t("pr.tab.reviewers", { count: pr.reviewers.length })}
                </button>
                <button
                  className={`detail-tab ${activeDetailTab === "comments" ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDetailTab("comments");
                  }}
                >
                  {t("pr.tab.comments", { count: activeThreads.length })}
                </button>
              </div>

              {activeDetailTab === "conflicts" && (
                <ConflictSection conflicts={pr.mergeConflicts} pr={pr} />
              )}
              {activeDetailTab === "reviewers" && (
                <ReviewerSection reviewers={pr.reviewers} />
              )}
              {activeDetailTab === "comments" && (
                <CommentSection threads={pr.threads} />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

// --- Sub-components ---

const ReviewerAvatar: React.FC<{ reviewer: IReviewer }> = ({ reviewer }) => {
  const { t } = useT();
  const voteClass = getVoteClass(reviewer.vote);
  const initials = getInitials(reviewer.displayName);
  const [imgFailed, setImgFailed] = useState(false);

  const handleImgError = useCallback(() => setImgFailed(true), []);

  return (
    <div className={`reviewer-avatar ${voteClass}`} title={`${reviewer.displayName}: ${getVoteLabel(reviewer.vote, t)}`}>
      {reviewer.imageUrl && !imgFailed ? (
        <img
          src={reviewer.imageUrl}
          alt={reviewer.displayName}
          onError={handleImgError}
          crossOrigin="anonymous"
        />
      ) : (
        initials
      )}
      {reviewer.vote !== ReviewerVote.NoVote && (
        <span className={`vote-icon ${getVoteIconClass(reviewer.vote)}`}>
          {getVoteSymbol(reviewer.vote)}
        </span>
      )}
    </div>
  );
};

const ConflictSection: React.FC<{ conflicts: IMergeConflict[]; pr: IPullRequestItem }> = ({ conflicts, pr }) => {
  const { t } = useT();

  if (conflicts.length === 0) {
    return (
      <div style={{ padding: "16px", textAlign: "center", color: "#9e9e9e", fontSize: "13px" }}>
        {t("pr.noConflictsDetail")}
      </div>
    );
  }

  const getConflictUrl = (conflict: IMergeConflict): string => {
    let filePath = conflict.conflictPath || conflict.sourceFilePath;
    if (filePath && !filePath.startsWith("/")) {
      filePath = "/" + filePath;
    }
    return `${pr.url}?_a=files&path=${encodeURIComponent(filePath)}`;
  };

  return (
    <div className="conflict-panel">
      <div className="conflict-header">
        <span>&#9888;</span>
        {t("pr.conflictsDetected", { count: conflicts.length })}
      </div>
      <ul className="conflict-list">
        {conflicts.map((conflict) => (
          <li key={conflict.conflictId} className="conflict-item conflict-item-link">
            <a
              href={getConflictUrl(conflict)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="conflict-link"
            >
              <span className="conflict-icon">&#128196;</span>
              <span className="conflict-path">{conflict.conflictPath}</span>
              <span className="conflict-type">{conflict.conflictType}</span>
              <span
                className={`conflict-status ${
                  conflict.resolutionStatus === "resolved" ? "resolved" : "unresolved"
                }`}
              >
                {conflict.resolutionStatus === "resolved" ? t("pr.resolved") : t("pr.unresolved")}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ReviewerSection: React.FC<{ reviewers: IReviewer[] }> = ({ reviewers }) => {
  const { t } = useT();

  if (reviewers.length === 0) {
    return (
      <div style={{ padding: "16px", textAlign: "center", color: "#9e9e9e", fontSize: "13px" }}>
        {t("pr.noReviewers")}
      </div>
    );
  }

  return (
    <div className="thread-section">
      <div className="thread-header">{t("pr.reviewersTitle")}</div>
      {reviewers.map((reviewer) => (
        <div key={reviewer.id} className="thread-item">
          <div className={`thread-avatar`} style={{ background: getVoteColor(reviewer.vote) }}>
            {getInitials(reviewer.displayName)}
          </div>
          <div className="thread-content">
            <div className="thread-author">
              {reviewer.displayName}
              {reviewer.isRequired && (
                <span style={{ color: "#d13438", marginLeft: "6px", fontSize: "11px" }}>
                  {t("pr.required")}
                </span>
              )}
            </div>
            <div className="thread-text">{getVoteLabel(reviewer.vote, t)}</div>
          </div>
          <span
            className={`thread-status ${
              reviewer.vote === ReviewerVote.Approved
                ? "resolved"
                : reviewer.vote === ReviewerVote.Rejected
                ? "active"
                : "closed"
            }`}
          >
            {getVoteSymbol(reviewer.vote)} {getVoteLabel(reviewer.vote, t)}
          </span>
        </div>
      ))}
    </div>
  );
};

const CommentSection: React.FC<{ threads: ICommentThread[] }> = ({ threads }) => {
  const { t } = useT();

  // Filter out system / non-text threads
  const meaningfulThreads = threads.filter(
    (th) => th.comments.length > 0 && th.comments.some((c) => c.commentType !== "system")
  );

  if (meaningfulThreads.length === 0) {
    return (
      <div style={{ padding: "16px", textAlign: "center", color: "#9e9e9e", fontSize: "13px" }}>
        {t("pr.noComments")}
      </div>
    );
  }

  return (
    <div className="thread-section">
      <div className="thread-header">
        &#128172; {t("pr.commentThreads", { count: meaningfulThreads.length })}
      </div>
      {meaningfulThreads.slice(0, 10).map((thread) => (
        <div key={thread.id} className="thread-item">
          <div className="thread-avatar">
            {thread.comments[0]
              ? getInitials(thread.comments[0].author.displayName)
              : "?"}
          </div>
          <div className="thread-content">
            <div className="thread-author">
              {thread.comments[0]?.author.displayName || "Unknown"}
            </div>
            <div className="thread-text">
              {truncateText(thread.comments[0]?.content || "", 120)}
            </div>
            <div className="thread-date">
              {thread.comments[0]?.publishedDate
                ? formatDate(thread.comments[0].publishedDate, t)
                : ""}
              {thread.comments.length > 1 &&
                ` ${t("pr.moreReplies", { count: thread.comments.length - 1 })}`}
            </div>
          </div>
          <span className={`thread-status ${thread.isResolved ? "resolved" : "active"}`}>
            {thread.isResolved ? t("pr.threadResolved") : t("pr.threadActive")}
          </span>
        </div>
      ))}
      {meaningfulThreads.length > 10 && (
        <div style={{ padding: "8px", textAlign: "center", color: "#9e9e9e", fontSize: "12px" }}>
          {t("pr.moreThreads", { count: meaningfulThreads.length - 10 })}
        </div>
      )}
    </div>
  );
};

// --- Helpers ---

function getVoteClass(vote: ReviewerVote): string {
  switch (vote) {
    case ReviewerVote.Approved: return "vote-approved";
    case ReviewerVote.ApprovedWithSuggestions: return "vote-approved-suggestions";
    case ReviewerVote.Rejected: return "vote-rejected";
    case ReviewerVote.WaitingForAuthor: return "vote-waiting";
    default: return "vote-none";
  }
}

function getVoteIconClass(vote: ReviewerVote): string {
  switch (vote) {
    case ReviewerVote.Approved:
    case ReviewerVote.ApprovedWithSuggestions:
      return "approved";
    case ReviewerVote.Rejected: return "rejected";
    case ReviewerVote.WaitingForAuthor: return "waiting";
    default: return "";
  }
}

function getVoteLabel(vote: ReviewerVote, t: TFunction): string {
  switch (vote) {
    case ReviewerVote.Approved: return t("vote.approved");
    case ReviewerVote.ApprovedWithSuggestions: return t("vote.approvedWithSuggestions");
    case ReviewerVote.Rejected: return t("vote.rejected");
    case ReviewerVote.WaitingForAuthor: return t("vote.waitingForAuthor");
    default: return t("vote.noVote");
  }
}

function getVoteSymbol(vote: ReviewerVote): string {
  switch (vote) {
    case ReviewerVote.Approved:
    case ReviewerVote.ApprovedWithSuggestions:
      return "\u2713";
    case ReviewerVote.Rejected: return "\u2717";
    case ReviewerVote.WaitingForAuthor: return "\u23F3";
    default: return "\u2022";
  }
}

function getVoteColor(vote: ReviewerVote): string {
  switch (vote) {
    case ReviewerVote.Approved: return "#107c10";
    case ReviewerVote.ApprovedWithSuggestions: return "#5b9f1f";
    case ReviewerVote.Rejected: return "#d13438";
    case ReviewerVote.WaitingForAuthor: return "#ff8c00";
    default: return "#bdbdbd";
  }
}

function getStatusIcon(status: string): string {
  switch (status) {
    case "active": return "\u25CF";
    case "completed": return "\u2713";
    case "abandoned": return "\u2717";
    default: return "\u25CF";
  }
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(date: Date, t: TFunction): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) return "";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1) return t("time.minutesAgo", { count: Math.floor(diffMs / (1000 * 60)) });
  if (diffHours < 24) return t("time.hoursAgo", { count: Math.floor(diffHours) });
  if (diffHours < 48) return t("time.yesterday");
  if (diffHours < 168) return t("time.daysAgo", { count: Math.floor(diffHours / 24) });

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function truncateText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen) + "...";
}

function getAgeDays(date: Date): number {
  if (!(date instanceof Date) || isNaN(date.getTime())) return 0;
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

function getAgeLabel(date: Date, t: TFunction): string {
  const days = getAgeDays(date);
  if (days === 0) return t("age.today");
  if (days === 1) return t("age.oneDay");
  if (days < 7) return t("age.days", { count: days });
  if (days < 30) return t("age.weeks", { count: Math.floor(days / 7) });
  return t("age.months", { count: Math.floor(days / 30) });
}

function getAgeClass(date: Date): string {
  const days = getAgeDays(date);
  if (days < 2) return "age-fresh";
  if (days <= 5) return "age-aging";
  return "age-stale";
}

function getViewFilesUrl(pr: IPullRequestItem): string {
  if (pr.mergeConflicts.length > 0) {
    let filePath = pr.mergeConflicts[0].conflictPath || pr.mergeConflicts[0].sourceFilePath;
    if (filePath && !filePath.startsWith("/")) {
      filePath = "/" + filePath;
    }
    return `${pr.url}?_a=files&path=${encodeURIComponent(filePath)}`;
  }
  return `${pr.url}?_a=files`;
}

export default PRCard;
