import type { Env, GitHubCommitCommentEvent, GitHubPushEvent } from "../types";

interface Handler {
  env: Env;

  handlePushEvent?(event: GitHubPushEvent): Promise<void>;
  handleCommitCommentEvent(event: GitHubCommitCommentEvent): Promise<void>;
}

export default Handler;
