import React, { useState } from "react";
import { IProjectGroup, IPullRequestItem, MergeStatus, ReviewerVote } from "../models/types";
import PRCard from "./PRCard";
import { useT } from "../i18n/I18nContext";

interface ProjectGroupProps {
  group: IProjectGroup;
  onLoadDetails?: (pr: IPullRequestItem) => Promise<void>;
}

const ProjectGroup: React.FC<ProjectGroupProps> = ({ group, onLoadDetails }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useT();

  const conflictCount = group.pullRequests.filter(
    (pr) => pr.mergeStatus === MergeStatus.Conflicts || pr.mergeConflicts.length > 0
  ).length;
  const approvedCount = group.pullRequests.filter((pr) =>
    pr.reviewers.some((r) => r.vote === ReviewerVote.Approved)
  ).length;
  const waitingCount = group.pullRequests.filter((pr) =>
    pr.reviewers.every((r) => r.vote === ReviewerVote.NoVote) || pr.reviewers.length === 0
  ).length;
  const rejectedCount = group.pullRequests.filter((pr) =>
    pr.reviewers.some((r) => r.vote === ReviewerVote.Rejected)
  ).length;

  return (
    <div className="project-group">
      <div className="project-group-header" onClick={() => setCollapsed(!collapsed)}>
        <div className="project-info">
          <div className="project-icon">
            {group.project.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="project-name">{group.project.name}</div>
            <div className="project-pr-count">
              {t("project.pullRequests", { count: group.pullRequests.length })}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="project-stats">
            {approvedCount > 0 && (
              <span className="project-stat approved">
                &#10003; {t("project.approved", { count: approvedCount })}
              </span>
            )}
            {waitingCount > 0 && (
              <span className="project-stat waiting">
                &#8987; {t("project.waiting", { count: waitingCount })}
              </span>
            )}
            {conflictCount > 0 && (
              <span className="project-stat conflicts">
                &#9888; {t("project.conflicts", { count: conflictCount })}
              </span>
            )}
            {rejectedCount > 0 && (
              <span className="project-stat rejected">
                &#10007; {t("project.rejected", { count: rejectedCount })}
              </span>
            )}
          </div>
          <span className={`collapse-icon ${collapsed ? "collapsed" : ""}`}>&#9660;</span>
        </div>
      </div>

      {!collapsed && (
        <div className="project-group-body">
          {group.pullRequests.map((pr) => (
            <PRCard key={`${pr.project.id}-${pr.id}`} pr={pr} onLoadDetails={onLoadDetails} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectGroup;
