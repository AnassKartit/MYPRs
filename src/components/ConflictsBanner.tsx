import React from "react";
import { IPullRequestItem, MergeStatus } from "../models/types";
import { useT } from "../i18n/I18nContext";

interface ConflictsBannerProps {
  pullRequests: IPullRequestItem[];
  onShowConflicts: () => void;
}

const ConflictsBanner: React.FC<ConflictsBannerProps> = ({
  pullRequests,
  onShowConflicts,
}) => {
  const { t } = useT();

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
            {t("banner.prsWithConflicts", { count: conflictPRs.length })}
          </h4>
          <p>
            {totalConflictFiles > 0
              ? t("banner.conflictingFiles", { count: totalConflictFiles })
              : ""}
            {t("banner.resolveConflicts")}
          </p>
        </div>
      </div>
      <button className="btn btn-primary" onClick={onShowConflicts}>
        {t("banner.viewConflicts")}
      </button>
    </div>
  );
};

export default ConflictsBanner;
