import React from "react";
import { IPullRequestItem, MergeStatus } from "../models/types";

interface ConflictsBannerProps {
  pullRequests: IPullRequestItem[];
  onShowConflicts: () => void;
}

const ConflictsBanner: React.FC<ConflictsBannerProps> = ({
  pullRequests,
  onShowConflicts,
}) => {
  const conflictPRs = pullRequests.filter(
    (pr) => pr.mergeStatus === MergeStatus.Conflicts || pr.mergeConflicts.length > 0
  );

  if (conflictPRs.length === 0) return null;

  const totalConflictFiles = conflictPRs.reduce(
    (sum, pr) => sum + pr.mergeConflicts.length,
    0
  );

  return (
    <div className="conflict-banner">
      <div className="banner-content">
        <div className="banner-icon">&#9888;&#65039;</div>
        <div className="banner-text">
          <h4>
            {conflictPRs.length} Pull Request{conflictPRs.length !== 1 ? "s" : ""} with
            Merge Conflicts
          </h4>
          <p>
            {totalConflictFiles > 0
              ? `${totalConflictFiles} conflicting file${totalConflictFiles !== 1 ? "s" : ""} detected across your PRs. `
              : ""}
            Resolve conflicts to unblock merges.
          </p>
        </div>
      </div>
      <button className="btn btn-primary" onClick={onShowConflicts}>
        View Conflicts
      </button>
    </div>
  );
};

export default ConflictsBanner;
