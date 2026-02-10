import React, { useState, useCallback } from "react";
import {
  IPullRequestItem,
  MergeStatus,
  ReviewerVote,
  IReviewer,
  IMergeConflict,
  ICommentThread,
} from "../models/types";
import * as sdkService from "../services/sdkService";

interface PRCardProps {
  pr: IPullRequestItem;
  onLoadDetails?: (pr: IPullRequestItem) => Promise<void>;
}

const PRCard: React.FC<PRCardProps> = ({ pr, onLoadDetails }) => {
  const [expanded, setExpanded] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<"conflicts" | "reviewers" | "comments">(
    "conflicts"
  );
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);

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
            {pr.isDraft && <span className="draft-badge">Draft</span>}
            {pr.hasAutoComplete && <span className="autocomplete-badge">Auto-complete</span>}
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
            <span className="meta-item">{formatDate(pr.creationDate)}</span>
            <span className="meta-separator">|</span>
            <span className={`age-badge ${getAgeClass(pr.creationDate)}`}>
              {getAgeLabel(pr.creationDate)}
            </span>
          </div>
        </div>

        <div className="pr-card-badges">
          <span className={`status-badge status-${pr.status}`}>
            {getStatusIcon(pr.status)} {capitalizeFirst(pr.status)}
          </span>
          {hasConflicts && (
            <span className="status-badge merge-conflicts">
              &#9888; {pr.mergeConflicts.length || "!"} Conflicts
            </span>
          )}
          {pr.mergeStatus === MergeStatus.Succeeded && (
            <span className="status-badge merge-ok">&#10003; Merge OK</span>
          )}
          {pr.mergeStatus === MergeStatus.Queued && (
            <span className="status-badge merge-queued">&#8987; Queued</span>
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
          href={`${pr.url}?_a=files`}
          target="_blank"
          rel="noopener noreferrer"
          className="action-btn"
        >
          &#128196; View Files
        </a>
        <button
          className={`action-btn action-approve ${approving ? "loading" : ""}`}
          disabled={approving}
          onClick={async () => {
            setApproving(true);
            setApproveError(null);
            try {
              await sdkService.approvePullRequest(pr.project.name, pr.repository.id, pr.id);
              if (onLoadDetails) await onLoadDetails(pr);
            } catch (err) {
              setApproveError(err instanceof Error ? err.message : "Failed to approve");
            } finally {
              setApproving(false);
            }
          }}
        >
          {approving ? "Approving..." : "\u2713 Approve"}
        </button>
        <a
          href={pr.url}
          target="_blank"
          rel="noopener noreferrer"
          className="action-btn"
        >
          &#8599; Open in DevOps
        </a>
        {approveError && (
          <span className="action-error">{approveError}</span>
        )}
      </div>

      {/* Expanded Detail View */}
      {expanded && (
        <div className="pr-detail-expanded">
          {loadingDetails ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#9e9e9e" }}>
              Loading details...
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
                  Conflicts ({pr.mergeConflicts.length})
                </button>
                <button
                  className={`detail-tab ${activeDetailTab === "reviewers" ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDetailTab("reviewers");
                  }}
                >
                  Reviewers ({pr.reviewers.length})
                </button>
                <button
                  className={`detail-tab ${activeDetailTab === "comments" ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDetailTab("comments");
                  }}
                >
                  Comments ({activeThreads.length} active)
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
  const voteClass = getVoteClass(reviewer.vote);
  const initials = getInitials(reviewer.displayName);
  const [imgFailed, setImgFailed] = useState(false);

  const handleImgError = useCallback(() => setImgFailed(true), []);

  return (
    <div className={`reviewer-avatar ${voteClass}`} title={`${reviewer.displayName}: ${getVoteLabel(reviewer.vote)}`}>
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
  if (conflicts.length === 0) {
    return (
      <div style={{ padding: "16px", textAlign: "center", color: "#9e9e9e", fontSize: "13px" }}>
        No merge conflicts detected. This PR can be merged cleanly.
      </div>
    );
  }

  const getConflictUrl = (conflict: IMergeConflict): string => {
    const filePath = conflict.conflictPath || conflict.sourceFilePath;
    return `${pr.url}?_a=files&path=${encodeURIComponent(filePath)}`;
  };

  return (
    <div className="conflict-panel">
      <div className="conflict-header">
        <span>&#9888;</span>
        {conflicts.length} Merge Conflict{conflicts.length !== 1 ? "s" : ""} Detected
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
                {conflict.resolutionStatus === "resolved" ? "Resolved" : "Unresolved"}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ReviewerSection: React.FC<{ reviewers: IReviewer[] }> = ({ reviewers }) => {
  if (reviewers.length === 0) {
    return (
      <div style={{ padding: "16px", textAlign: "center", color: "#9e9e9e", fontSize: "13px" }}>
        No reviewers assigned to this pull request.
      </div>
    );
  }

  return (
    <div className="thread-section">
      <div className="thread-header">Reviewers</div>
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
                  (Required)
                </span>
              )}
            </div>
            <div className="thread-text">{getVoteLabel(reviewer.vote)}</div>
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
            {getVoteSymbol(reviewer.vote)} {getVoteLabel(reviewer.vote)}
          </span>
        </div>
      ))}
    </div>
  );
};

const CommentSection: React.FC<{ threads: ICommentThread[] }> = ({ threads }) => {
  // Filter out system / non-text threads
  const meaningfulThreads = threads.filter(
    (t) => t.comments.length > 0 && t.comments.some((c) => c.commentType !== "system")
  );

  if (meaningfulThreads.length === 0) {
    return (
      <div style={{ padding: "16px", textAlign: "center", color: "#9e9e9e", fontSize: "13px" }}>
        No comment threads on this pull request.
      </div>
    );
  }

  return (
    <div className="thread-section">
      <div className="thread-header">
        &#128172; {meaningfulThreads.length} Comment Thread
        {meaningfulThreads.length !== 1 ? "s" : ""}
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
                ? formatDate(thread.comments[0].publishedDate)
                : ""}
              {thread.comments.length > 1 &&
                ` (+${thread.comments.length - 1} more replies)`}
            </div>
          </div>
          <span className={`thread-status ${thread.isResolved ? "resolved" : "active"}`}>
            {thread.isResolved ? "Resolved" : "Active"}
          </span>
        </div>
      ))}
      {meaningfulThreads.length > 10 && (
        <div style={{ padding: "8px", textAlign: "center", color: "#9e9e9e", fontSize: "12px" }}>
          +{meaningfulThreads.length - 10} more threads
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

function getVoteLabel(vote: ReviewerVote): string {
  switch (vote) {
    case ReviewerVote.Approved: return "Approved";
    case ReviewerVote.ApprovedWithSuggestions: return "Approved with suggestions";
    case ReviewerVote.Rejected: return "Rejected";
    case ReviewerVote.WaitingForAuthor: return "Waiting for author";
    default: return "No vote";
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

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) return "";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1) return `${Math.floor(diffMs / (1000 * 60))}m ago`;
  if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
  if (diffHours < 48) return "Yesterday";
  if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`;

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

function getAgeLabel(date: Date): string {
  const days = getAgeDays(date);
  if (days === 0) return "Today";
  if (days === 1) return "1 day";
  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.floor(days / 7)}w`;
  return `${Math.floor(days / 30)}mo`;
}

function getAgeClass(date: Date): string {
  const days = getAgeDays(date);
  if (days < 2) return "age-fresh";
  if (days <= 5) return "age-aging";
  return "age-stale";
}

export default PRCard;
