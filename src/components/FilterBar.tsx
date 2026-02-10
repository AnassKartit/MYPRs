import React from "react";
import { IFilterState, IProjectInfo } from "../models/types";

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
  return (
    <div className="filter-bar">
      <div className="filter-search">
        <span className="search-icon">&#128269;</span>
        <input
          type="text"
          placeholder="Search pull requests by title, author, branch..."
          value={filters.searchText}
          onChange={(e) => onFilterChange({ searchText: e.target.value })}
        />
      </div>

      <div className="filter-select">
        <select
          value={filters.status}
          onChange={(e) => onFilterChange({ status: e.target.value })}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="abandoned">Abandoned</option>
        </select>
      </div>

      <div className="filter-select">
        <select
          value={filters.project}
          onChange={(e) => onFilterChange({ project: e.target.value })}
        >
          <option value="all">All Projects</option>
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
          <option value="all">All Merge Status</option>
          <option value="conflicts">Has Conflicts</option>
          <option value="clean">No Conflicts</option>
        </select>
      </div>

      <div className="filter-select">
        <select
          value={filters.sortBy}
          onChange={(e) => onFilterChange({ sortBy: e.target.value })}
        >
          <option value="date">Sort by Date</option>
          <option value="title">Sort by Title</option>
          <option value="project">Sort by Project</option>
          <option value="conflicts">Sort by Conflicts</option>
          <option value="reviewers">Sort by Review Status</option>
        </select>
      </div>

      <button
        className="btn btn-icon"
        onClick={() =>
          onFilterChange({
            sortDirection: filters.sortDirection === "asc" ? "desc" : "asc",
          })
        }
        title={filters.sortDirection === "asc" ? "Ascending" : "Descending"}
      >
        {filters.sortDirection === "asc" ? "\u2191" : "\u2193"}
      </button>
    </div>
  );
};

export default FilterBar;
