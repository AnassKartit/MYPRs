import React from "react";
import { IPullRequestItem, MergeStatus, ReviewerVote } from "../models/types";
import { useT } from "../i18n/I18nContext";

interface StatsCardsProps {
  pullRequests: IPullRequestItem[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ pullRequests }) => {
  const { t } = useT();

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
  const agingCount = pullRequests.filter((pr) => {
    const days = Math.floor((Date.now() - new Date(pr.creationDate).getTime()) / (1000 * 60 * 60 * 24));
    return days > 1;
  }).length;

  const stats = [
    { label: t("stats.totalPRs"), value: totalPRs, icon: "\uD83D\uDCCB", className: "stat-total" },
    { label: t("stats.approved"), value: approvedCount, icon: "\u2705", className: "stat-approved" },
    { label: t("stats.awaitingReview"), value: waitingCount, icon: "\u23F3", className: "stat-waiting" },
    { label: t("stats.conflicts"), value: conflictCount, icon: "\u26A0\uFE0F", className: "stat-conflicts" },
    { label: t("stats.aging"), value: agingCount, icon: "\uD83D\uDD52", className: "stat-aging" },
    { label: t("stats.rejected"), value: rejectedCount, icon: "\u274C", className: "stat-rejected" },
    { label: t("stats.drafts"), value: draftCount, icon: "\uD83D\uDCDD", className: "stat-drafts" },
  ];

  return (
    <div className="stats-summary">
      {stats.map((stat) => (
        <div key={stat.className} className={`stat-card ${stat.className}`}>
          <div className="stat-card-icon">{stat.icon}</div>
          <div className="stat-card-value">{stat.value}</div>
          <div className="stat-card-label">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
