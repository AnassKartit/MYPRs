/**
 * Azure DevOps SDK wrapper service.
 * Initializes the SDK and provides access tokens and context.
 */

import * as SDK from "azure-devops-extension-sdk";
import { getClient } from "azure-devops-extension-api";
import { GitRestClient } from "azure-devops-extension-api/Git";
import { CoreRestClient } from "azure-devops-extension-api/Core";
import {
  IPullRequestItem,
  IReviewer,
  IMergeConflict,
  ICommentThread,
  IProjectInfo,
  PullRequestStatus,
  MergeStatus,
  ReviewerVote,
} from "../models/types";

let _initialized = false;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
}

export async function initializeSDK(): Promise<void> {
  if (_initialized) return;
  try {
    console.log("[PR-Tracker] Starting SDK.init()...");
    await withTimeout(SDK.init({ loaded: false }), 15000, "SDK.init()");
    console.log("[PR-Tracker] SDK.init() complete. Waiting for SDK.ready()...");
    await withTimeout(SDK.ready(), 15000, "SDK.ready()");
    console.log("[PR-Tracker] SDK fully initialized.");
    _initialized = true;
    await SDK.notifyLoadSucceeded();
  } catch (err) {
    console.error("[PR-Tracker] SDK initialization failed:", err);
    SDK.notifyLoadFailed(err instanceof Error ? err.message : String(err));
    throw err;
  }
}

export function getOrganizationName(): string {
  const host = SDK.getHost();
  return host.name;
}

export async function getAccessToken(): Promise<string> {
  const token = await SDK.getAccessToken();
  return token;
}

export async function getAllProjects(): Promise<IProjectInfo[]> {
  const coreClient = getClient(CoreRestClient);
  const projects = await coreClient.getProjects();
  return projects.map((p) => ({
    id: p.id || "",
    name: p.name || "",
  }));
}

export async function getAllPullRequests(
  status: PullRequestStatus = PullRequestStatus.Active
): Promise<IPullRequestItem[]> {
  const gitClient = getClient(GitRestClient);
  const projects = await getAllProjects();
  const allPRs: IPullRequestItem[] = [];

  const gitStatusMap: Record<string, number> = {
    active: 1,
    abandoned: 2,
    completed: 3,
    all: 4,
  };

  const statusValue = gitStatusMap[status] || 1;

  const results = await Promise.allSettled(
    projects.map(async (project) => {
      try {
        const repos = await gitClient.getRepositories(project.name);
        const prs: IPullRequestItem[] = [];

        const repoResults = await Promise.allSettled(
          repos.map(async (repo) => {
            try {
              const searchCriteria = {
                status: statusValue,
                includeLinks: true,
              } as any;

              const repoPRs = await gitClient.getPullRequests(
                repo.id,
                searchCriteria,
                project.name
              );

              return repoPRs.map((pr) => mapPullRequest(pr, project, repo));
            } catch {
              return [];
            }
          })
        );

        for (const result of repoResults) {
          if (result.status === "fulfilled") {
            prs.push(...result.value);
          }
        }

        return prs;
      } catch {
        return [];
      }
    })
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
  const gitClient = getClient(GitRestClient);
  try {
    const conflicts = await (gitClient as any).getPullRequestConflicts(
      repositoryId,
      pullRequestId,
      projectName
    );
    return (conflicts || []).map((c: any) => ({
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
  const gitClient = getClient(GitRestClient);
  try {
    const threads = await gitClient.getThreads(repositoryId, pullRequestId, projectName);
    return (threads || []).map((t) => ({
      id: t.id || 0,
      status: t.status?.toString() || "unknown",
      isResolved: t.status === 2 || t.status === 4, // closed or fixed
      lastUpdatedDate: t.lastUpdatedDate || new Date(),
      comments: (t.comments || []).map((c) => ({
        id: c.id || 0,
        author: {
          id: c.author?.id || "",
          displayName: c.author?.displayName || "Unknown",
          uniqueName: c.author?.uniqueName || "",
          imageUrl: (c.author as any)?._links?.avatar?.href || "",
        },
        content: c.content || "",
        publishedDate: c.publishedDate || new Date(),
        commentType: c.commentType?.toString() || "text",
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

function mapPullRequest(pr: any, project: IProjectInfo, repo: any): IPullRequestItem {
  const host = SDK.getHost();
  const orgName = host.name;

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
    creationDate: pr.creationDate || new Date(),
    closedDate: pr.closedDate || undefined,
    sourceRefName: (pr.sourceRefName || "").replace("refs/heads/", ""),
    targetRefName: (pr.targetRefName || "").replace("refs/heads/", ""),
    repository: {
      id: repo.id,
      name: repo.name,
      url: repo.webUrl || "",
    },
    project: {
      id: project.id,
      name: project.name,
    },
    reviewers: (pr.reviewers || []).map(mapReviewer),
    mergeStatus: mapMergeStatus(pr.mergeStatus),
    mergeConflicts: [],
    commentCount: 0,
    url: `https://dev.azure.com/${orgName}/${project.name}/_git/${repo.name}/pullrequest/${pr.pullRequestId}`,
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

function mapStatus(status: number): PullRequestStatus {
  switch (status) {
    case 1: return PullRequestStatus.Active;
    case 2: return PullRequestStatus.Abandoned;
    case 3: return PullRequestStatus.Completed;
    default: return PullRequestStatus.Active;
  }
}

function mapMergeStatus(status: number): MergeStatus {
  switch (status) {
    case 1: return MergeStatus.Queued;
    case 2: return MergeStatus.Conflicts;
    case 3: return MergeStatus.Succeeded;
    case 4: return MergeStatus.RejectedByPolicy;
    case 5: return MergeStatus.Failure;
    default: return MergeStatus.NotSet;
  }
}
