import React from "react";
import { IPullRequestItem, MergeStatus, ReviewerVote } from "../models/types";

interface StatsCardsProps {
  pullRequests: IPullRequestItem[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ pullRequests }) => {
  const totalPRs = pullRequests.length;
  const approvedCount = pullRequests.filter((pr) =>
    pr.reviewers.some((r) => r.vote === ReviewerVote.Approved)
  ).length;
  const waitingCount = pullRequests.filter(
    (pr) =>
      pr.reviewers.length === 0 ||
      pr.reviewers.every((r) => r.vote === ReviewerVote.NoVote)
  ).length;
  const conflictCount = pullRequests.filter(
    (pr) => pr.mergeStatus === MergeStatus.Conflicts || pr.mergeConflicts.length > 0
  ).length;
  const rejectedCount = pullRequests.filter((pr) =>
    pr.reviewers.some((r) => r.vote === ReviewerVote.Rejected)
  ).length;
  const draftCount = pullRequests.filter((pr) => pr.isDraft).length;

  const stats = [
    { label: "Total PRs", value: totalPRs, icon: "\uD83D\uDCCB", className: "stat-total" },
    { label: "Approved", value: approvedCount, icon: "\u2705", className: "stat-approved" },
    { label: "Awaiting Review", value: waitingCount, icon: "\u23F3", className: "stat-waiting" },
    { label: "Conflicts", value: conflictCount, icon: "\u26A0\uFE0F", className: "stat-conflicts" },
    { label: "Rejected", value: rejectedCount, icon: "\u274C", className: "stat-rejected" },
    { label: "Drafts", value: draftCount, icon: "\uD83D\uDCDD", className: "stat-drafts" },
  ];

  return (
    <div className="stats-summary">
      {stats.map((stat) => (
        <div key={stat.label} className={`stat-card ${stat.className}`}>
          <div className="stat-card-icon">{stat.icon}</div>
          <div className="stat-card-value">{stat.value}</div>
          <div className="stat-card-label">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
