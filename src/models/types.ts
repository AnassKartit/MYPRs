export interface IPullRequestItem {
  id: number;
  title: string;
  description: string;
  status: PullRequestStatus;
  createdBy: IIdentity;
  creationDate: Date;
  closedDate?: Date;
  sourceRefName: string;
  targetRefName: string;
  repository: IRepositoryInfo;
  project: IProjectInfo;
  reviewers: IReviewer[];
  mergeStatus: MergeStatus;
  mergeConflicts: IMergeConflict[];
  commentCount: number;
  changedFilesCount: number;
  url: string;
  isDraft: boolean;
  labels: string[];
  hasAutoComplete: boolean;
  threads: ICommentThread[];
}

export interface IIdentity {
  id: string;
  displayName: string;
  uniqueName: string;
  imageUrl: string;
}

export interface IRepositoryInfo {
  id: string;
  name: string;
  url: string;
}

export interface IProjectInfo {
  id: string;
  name: string;
}

export interface IReviewer {
  id: string;
  displayName: string;
  uniqueName: string;
  imageUrl: string;
  vote: ReviewerVote;
  isRequired: boolean;
  hasDeclined: boolean;
}

export interface IMergeConflict {
  conflictId: number;
  conflictType: string;
  conflictPath: string;
  sourceFilePath: string;
  targetFilePath: string;
  resolutionStatus: string;
}

export interface ICommentThread {
  id: number;
  status: string;
  comments: IComment[];
  isResolved: boolean;
  lastUpdatedDate: Date;
}

export interface IComment {
  id: number;
  author: IIdentity;
  content: string;
  publishedDate: Date;
  commentType: string;
}

export interface IProjectGroup {
  project: IProjectInfo;
  pullRequests: IPullRequestItem[];
  totalConflicts: number;
  totalApproved: number;
  totalWaiting: number;
  totalRejected: number;
}

export interface IFilterState {
  searchText: string;
  status: string;
  project: string;
  repository: string;
  reviewer: string;
  hasConflicts: string;
  dateRange: string;
  sortBy: string;
  sortDirection: "asc" | "desc";
}

export interface INotification {
  id: string;
  type: NotificationType;
  message: string;
  pullRequest: IPullRequestItem;
  timestamp: Date;
  isRead: boolean;
}

export enum PullRequestStatus {
  Active = "active",
  Completed = "completed",
  Abandoned = "abandoned",
  All = "all",
}

export enum MergeStatus {
  NotSet = "notSet",
  Succeeded = "succeeded",
  Conflicts = "conflicts",
  RejectedByPolicy = "rejectedByPolicy",
  Failure = "failure",
  Queued = "queued",
}

export enum ReviewerVote {
  Approved = 10,
  ApprovedWithSuggestions = 5,
  NoVote = 0,
  WaitingForAuthor = -5,
  Rejected = -10,
}

export enum NotificationType {
  MergeConflict = "mergeConflict",
  Approved = "approved",
  Rejected = "rejected",
  CommentAdded = "commentAdded",
  StatusChanged = "statusChanged",
}

export type ViewMode = "all" | "needsMyReview" | "createdByMe" | "byProject" | "conflicts" | "notifications";
