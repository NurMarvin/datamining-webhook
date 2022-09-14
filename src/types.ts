export interface Env {
  GITHUB_COMMITS: KVNamespace;
  GITHUB_TOKEN: string;
  DISCORD_WEBHOOK_URL: string;
  DISCORD_BOT_TOKEN: string;
  DISCORD_GUILD_ID: string;
  DISCORD_CHANNEL_ID: string;
  STRINGS_ROLE_ID: string;
  EXPERIMENTS_ROLE_ID: string;
  ENDPOINTS_ROLE_ID: string;
  ACTION_TYPES_ROLE_ID: string;
  SCREENSHOTS_ROLE_ID: string;
}

export interface GithubWebhookEvent {}

export interface GitHubPushEvent extends GithubWebhookEvent {
  ref: string;
  head_commit: {
    id: string;
    message: string;
    url: string;
  };
}

export interface GitHubCommitCommentEvent extends GithubWebhookEvent {
  comment: {
    url: string;
    html_url: string;
    body: string;
    commit_id: string;
    user: {
      login: string;
      avatar_url: string;
    };
  };
}

export interface GitHubCommit {
  sha: string;
  html_url: string;
  commit: {
    message: string;
  };
}
