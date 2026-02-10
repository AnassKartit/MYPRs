import {
  IPullRequestItem,
  IReviewer,
  IMergeConflict,
  ICommentThread,
  IProjectInfo,
  PullRequestStatus,
  MergeStatus,
  ReviewerVote,
  INotification,
  NotificationType,
} from "../models/types";

const BASE_API = "_apis/git/repositories";
const API_VERSION = "api-version=7.1";

interface AzureDevOpsContext {
  organization: string;
  accessToken: string;
}

let _context: AzureDevOpsContext | null = null;

function getContext(): AzureDevOpsContext {
  if (!_context) {
    throw new Error("PR Service not initialized. Call initialize() first.");
  }
  return _context;
}

async function fetchApi(url: string): Promise<any> {
  const ctx = getContext();
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${ctx.accessToken}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function initialize(accessToken: string, organization: string): Promise<void> {
  _context = { organization, accessToken };
}

export async function getAllProjects(): Promise<IProjectInfo[]> {
  const ctx = getContext();
  const url = `https://dev.azure.com/${ctx.organization}/_apis/projects?${API_VERSION}&$top=500`;
  const data = await fetchApi(url);
  return (data.value || []).map((p: any) => ({
    id: p.id,
    name: p.name,
  }));
}

export async function getPullRequestsForProject(
  projectName: string,
  status: PullRequestStatus = PullRequestStatus.Active
): Promise<IPullRequestItem[]> {
  const ctx = getContext();
  const statusQuery = status === PullRequestStatus.All ? "" : `&searchCriteria.status=${status}`;
  const url = `https://dev.azure.com/${ctx.organization}/${projectName}/${BASE_API}?${API_VERSION}`;

  const reposData = await fetchApi(url);
  const repos = reposData.value || [];

  const allPRs: IPullRequestItem[] = [];

  for (const repo of repos) {
    try {
      const prUrl = `https://dev.azure.com/${ctx.organization}/${projectName}/_apis/git/repositories/${repo.id}/pullrequests?${API_VERSION}${statusQuery}&$top=100`;
      const prData = await fetchApi(prUrl);
      const prs = prData.value || [];

      for (const pr of prs) {
        allPRs.push(mapPullRequest(pr, projectName, repo));
      }
    } catch {
      // Skip repos we can't access
    }
  }

  return allPRs;
}

export async function getAllPullRequests(
  status: PullRequestStatus = PullRequestStatus.Active
): Promise<IPullRequestItem[]> {
  const projects = await getAllProjects();
  const allPRs: IPullRequestItem[] = [];

  const results = await Promise.allSettled(
    projects.map((project) => getPullRequestsForProject(project.name, status))
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      allPRs.push(...result.value);
    }
  }

  return allPRs.sort(
    (a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()
  );
}

export async function getMergeConflicts(
  projectName: string,
  repositoryId: string,
  pullRequestId: number
): Promise<IMergeConflict[]> {
  const ctx = getContext();
  try {
    const url = `https://dev.azure.com/${ctx.organization}/${projectName}/_apis/git/repositories/${repositoryId}/pullRequests/${pullRequestId}/conflicts?${API_VERSION}`;
    const data = await fetchApi(url);
    return (data.value || []).map((c: any) => ({
      conflictId: c.conflictId,
      conflictType: c.conflictType || "content",
      conflictPath: c.conflictPath || c.sourceFilePath || "Unknown",
      sourceFilePath: c.sourceFilePath || "",
      targetFilePath: c.targetFilePath || "",
      resolutionStatus: c.resolutionStatus || "unresolved",
    }));
  } catch {
    return [];
  }
}

export async function getCommentThreads(
  projectName: string,
  repositoryId: string,
  pullRequestId: number
): Promise<ICommentThread[]> {
  const ctx = getContext();
  try {
    const url = `https://dev.azure.com/${ctx.organization}/${projectName}/_apis/git/repositories/${repositoryId}/pullRequests/${pullRequestId}/threads?${API_VERSION}`;
    const data = await fetchApi(url);
    return (data.value || []).map((t: any) => ({
      id: t.id,
      status: t.status || "unknown",
      isResolved: t.status === "closed" || t.status === "fixed",
      lastUpdatedDate: new Date(t.lastUpdatedDate),
      comments: (t.comments || []).map((c: any) => ({
        id: c.id,
        author: {
          id: c.author?.id || "",
          displayName: c.author?.displayName || "Unknown",
          uniqueName: c.author?.uniqueName || "",
          imageUrl: c.author?._links?.avatar?.href || "",
        },
        content: c.content || "",
        publishedDate: new Date(c.publishedDate),
        commentType: c.commentType || "text",
      })),
    }));
  } catch {
    return [];
  }
}

export async function enrichPullRequestWithDetails(
  pr: IPullRequestItem
): Promise<IPullRequestItem> {
  const [conflicts, threads] = await Promise.all([
    getMergeConflicts(pr.project.name, pr.repository.id, pr.id),
    getCommentThreads(pr.project.name, pr.repository.id, pr.id),
  ]);

  return {
    ...pr,
    mergeConflicts: conflicts,
    mergeStatus: conflicts.length > 0 ? MergeStatus.Conflicts : pr.mergeStatus,
    threads,
    commentCount: threads.reduce((sum, t) => sum + t.comments.length, 0),
  };
}

export function generateNotifications(
  pullRequests: IPullRequestItem[],
  previousPRs: IPullRequestItem[]
): INotification[] {
  const notifications: INotification[] = [];
  const prevMap = new Map(previousPRs.map((pr) => [`${pr.project.id}-${pr.id}`, pr]));

  for (const pr of pullRequests) {
    const key = `${pr.project.id}-${pr.id}`;
    const prev = prevMap.get(key);

    // New merge conflict
    if (pr.mergeStatus === MergeStatus.Conflicts) {
      if (!prev || prev.mergeStatus !== MergeStatus.Conflicts) {
        notifications.push({
          id: `conflict-${key}-${Date.now()}`,
          type: NotificationType.MergeConflict,
          message: `Merge conflicts detected in "${pr.title}" (${pr.project.name}/${pr.repository.name})`,
          pullRequest: pr,
          timestamp: new Date(),
          isRead: false,
        });
      }
    }

    // Approval changes
    if (prev) {
      const newApprovals = pr.reviewers.filter(
        (r) =>
          r.vote === ReviewerVote.Approved &&
          !prev.reviewers.find((pr) => pr.id === r.id && pr.vote === ReviewerVote.Approved)
      );
      for (const reviewer of newApprovals) {
        notifications.push({
          id: `approved-${key}-${reviewer.id}-${Date.now()}`,
          type: NotificationType.Approved,
          message: `${reviewer.displayName} approved "${pr.title}"`,
          pullRequest: pr,
          timestamp: new Date(),
          isRead: false,
        });
      }

      const newRejections = pr.reviewers.filter(
        (r) =>
          r.vote === ReviewerVote.Rejected &&
          !prev.reviewers.find((pr) => pr.id === r.id && pr.vote === ReviewerVote.Rejected)
      );
      for (const reviewer of newRejections) {
        notifications.push({
          id: `rejected-${key}-${reviewer.id}-${Date.now()}`,
          type: NotificationType.Rejected,
          message: `${reviewer.displayName} rejected "${pr.title}"`,
          pullRequest: pr,
          timestamp: new Date(),
          isRead: false,
        });
      }
    }
  }

  return notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

function mapPullRequest(pr: any, projectName: string, repo: any): IPullRequestItem {
  return {
    id: pr.pullRequestId,
    title: pr.title || "",
    description: pr.description || "",
    status: mapStatus(pr.status),
    createdBy: {
      id: pr.createdBy?.id || "",
      displayName: pr.createdBy?.displayName || "Unknown",
      uniqueName: pr.createdBy?.uniqueName || "",
      imageUrl: pr.createdBy?._links?.avatar?.href || "",
    },
    creationDate: new Date(pr.creationDate),
    closedDate: pr.closedDate ? new Date(pr.closedDate) : undefined,
    sourceRefName: (pr.sourceRefName || "").replace("refs/heads/", ""),
    targetRefName: (pr.targetRefName || "").replace("refs/heads/", ""),
    repository: {
      id: repo.id,
      name: repo.name,
      url: repo.webUrl || "",
    },
    project: {
      id: pr.repository?.project?.id || "",
      name: projectName,
    },
    reviewers: (pr.reviewers || []).map((r: any) => mapReviewer(r)),
    mergeStatus: mapMergeStatus(pr.mergeStatus),
    mergeConflicts: [],
    commentCount: pr.commentCount || 0,
    changedFilesCount: 0,
    url: `https://dev.azure.com/${getContext().organization}/${projectName}/_git/${repo.name}/pullrequest/${pr.pullRequestId}`,
    isDraft: pr.isDraft || false,
    labels: (pr.labels || []).map((l: any) => l.name),
    hasAutoComplete: !!pr.autoCompleteSetBy,
    threads: [],
  };
}

function mapReviewer(r: any): IReviewer {
  return {
    id: r.id || "",
    displayName: r.displayName || "Unknown",
    uniqueName: r.uniqueName || "",
    imageUrl: r._links?.avatar?.href || "",
    vote: r.vote || ReviewerVote.NoVote,
    isRequired: r.isRequired || false,
    hasDeclined: r.hasDeclined || false,
  };
}

function mapStatus(status: string): PullRequestStatus {
  switch (status) {
    case "active":
      return PullRequestStatus.Active;
    case "completed":
      return PullRequestStatus.Completed;
    case "abandoned":
      return PullRequestStatus.Abandoned;
    default:
      return PullRequestStatus.Active;
  }
}

function mapMergeStatus(status: string): MergeStatus {
  switch (status) {
    case "succeeded":
      return MergeStatus.Succeeded;
    case "conflicts":
      return MergeStatus.Conflicts;
    case "rejectedByPolicy":
      return MergeStatus.RejectedByPolicy;
    case "failure":
      return MergeStatus.Failure;
    case "queued":
      return MergeStatus.Queued;
    default:
      return MergeStatus.NotSet;
  }
}
