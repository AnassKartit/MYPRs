import React from "react";
import { IPullRequestItem, MergeStatus, ReviewerVote } from "../models/types";
import { useT, TFunction } from "../i18n/I18nContext";

interface HeaderProps {
  pullRequests: IPullRequestItem[];
  organizationName: string;
  lastRefreshed: Date | null;
}

const Header: React.FC<HeaderProps> = ({ pullRequests, organizationName, lastRefreshed }) => {
  const { t } = useT();

  const totalPRs = pullRequests.length;
  const conflictCount = pullRequests.filter(
    (pr) => pr.mergeStatus === MergeStatus.Conflicts || pr.mergeConflicts.length > 0
  ).length;
  const approvedCount = pullRequests.filter((pr) =>
    pr.reviewers.some((r) => r.vote === ReviewerVote.Approved)
  ).length;
  const waitingCount = pullRequests.filter(
    (pr) =>
      pr.reviewers.length === 0 ||
      pr.reviewers.every((r) => r.vote === ReviewerVote.NoVote)
  ).length;

  return (
    <div className="pr-tracker-header">
      <div className="header-content">
        <div className="header-left">
          <div className="header-icon">&#9741;</div>
          <div>
            <h1>{t("header.title")}</h1>
            <div className="header-subtitle">
              {organizationName} &middot;{" "}
              {lastRefreshed
                ? t("header.updated", { time: formatTimeAgo(lastRefreshed, t) })
                : t("header.loading")}
            </div>
          </div>
        </div>
        <div className="header-right">
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-value">{totalPRs}</span>
              <span className="stat-label">{t("header.totalPRs")}</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{approvedCount}</span>
              <span className="stat-label">{t("header.approved")}</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{waitingCount}</span>
              <span className="stat-label">{t("header.waiting")}</span>
            </div>
            {conflictCount > 0 && (
              <div className="stat-item" style={{ background: "rgba(209, 52, 56, 0.3)" }}>
                <span className="stat-value">{conflictCount}</span>
                <span className="stat-label">{t("header.conflicts")}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export function formatTimeAgo(date: Date, t: TFunction): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return t("time.justNow");
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t("time.minutesAgo", { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("time.hoursAgo", { count: hours });
  return t("time.daysAgo", { count: Math.floor(hours / 24) });
}

export default Header;
