import { type Env, type GitHubCommit } from "./types";

export const getCommitById = async (
  env: Env,
  owner: string,
  repo: string,
  commitId: string
): Promise<GitHubCommit> => {
  const url = `https://api.github.com/repos/${owner}/${repo}/commits/${commitId}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `token ${env.GITHUB_TOKEN}`,
      "User-Agent": "Discord Preview Bot",
    },
  });

  return await response.json();
};
