import React from "react";
import { IFilterState, IProjectInfo } from "../models/types";
import { useT } from "../i18n/I18nContext";

interface FilterBarProps {
  filters: IFilterState;
  onFilterChange: (filters: Partial<IFilterState>) => void;
  projects: IProjectInfo[];
  repositories: string[];
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  projects,
  repositories,
}) => {
  const { t } = useT();

  return (
    <div className="filter-bar">
      <div className="filter-search">
        <span className="search-icon">&#128269;</span>
        <input
          type="text"
          placeholder={t("filter.search")}
          value={filters.searchText}
          onChange={(e) => onFilterChange({ searchText: e.target.value })}
        />
      </div>

      <div className="filter-select">
        <select
          value={filters.status}
          onChange={(e) => onFilterChange({ status: e.target.value })}
        >
          <option value="all">{t("filter.allStatus")}</option>
          <option value="active">{t("filter.active")}</option>
          <option value="completed">{t("filter.completed")}</option>
          <option value="abandoned">{t("filter.abandoned")}</option>
        </select>
      </div>

      <div className="filter-select">
        <select
          value={filters.project}
          onChange={(e) => onFilterChange({ project: e.target.value })}
        >
          <option value="all">{t("filter.allProjects")}</option>
          {projects.map((p) => (
            <option key={p.id} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-select">
        <select
          value={filters.hasConflicts}
          onChange={(e) => onFilterChange({ hasConflicts: e.target.value })}
        >
          <option value="all">{t("filter.allMergeStatus")}</option>
          <option value="conflicts">{t("filter.hasConflicts")}</option>
          <option value="clean">{t("filter.noConflicts")}</option>
        </select>
      </div>

      <div className="filter-select">
        <select
          value={filters.sortBy}
          onChange={(e) => onFilterChange({ sortBy: e.target.value })}
        >
          <option value="date">{t("filter.sortByDate")}</option>
          <option value="title">{t("filter.sortByTitle")}</option>
          <option value="project">{t("filter.sortByProject")}</option>
          <option value="conflicts">{t("filter.sortByConflicts")}</option>
          <option value="reviewers">{t("filter.sortByReview")}</option>
        </select>
      </div>

      <button
        className="btn btn-icon"
        onClick={() =>
          onFilterChange({
            sortDirection: filters.sortDirection === "asc" ? "desc" : "asc",
          })
        }
        title={filters.sortDirection === "asc" ? t("filter.ascending") : t("filter.descending")}
      >
        {filters.sortDirection === "asc" ? "\u2191" : "\u2193"}
      </button>
    </div>
  );
};

export default FilterBar;
