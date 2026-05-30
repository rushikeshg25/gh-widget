import { Octokit } from "octokit";
import { unstable_cache } from "next/cache";

if (!process.env.GITHUB_TOKEN) {
  console.warn("⚠️ GITHUB_TOKEN is not set. API rate limit will be strictly limited (60 req/hr).");
}

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export interface GitHubStats {
  username: string;
  name: string | null;
  followers: number;
  following: number;
  public_repos: number;
  total_stars: number;
  total_gists: number;
  avatar_url: string;
  top_languages: { name: string; count: number; color: string; percentage: number }[];
  commits_year: number;
  contributions_year: number;
  repos_contributed: number;
  year: number;
}

// Map of common language colors
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  "C++": "#f34b7d",
  C: "#555555",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Shell: "#89e051",
  Dart: "#00B4AB",
  Swift: "#ffac45",
  Kotlin: "#A97BFF",
  Ruby: "#701516",
  PHP: "#4F5D95",
};

async function fetchGitHubStats(username: string): Promise<GitHubStats> {
  // 1. Get User Profile via REST
  const { data: user } = await octokit.rest.users.getByUsername({
    username,
  });

  // 2. Get Repositories for Language Stats
  const { data: repos } = await octokit.rest.repos.listForUser({
    username,
    per_page: 100,
    type: "owner",
  });

  // Exclude forks so stats reflect the user's own work
  const ownRepos = repos.filter((repo) => !repo.fork);

  const total_stars = ownRepos.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0);

  // Calculate Languages by bytes of code (GitHub-style), not repo count
  const languageBytes: Record<string, number> = {};
  const languageResults = await Promise.all(
    ownRepos.map(async (repo) => {
      try {
        const { data } = await octokit.rest.repos.listLanguages({ owner: username, repo: repo.name });
        return data as Record<string, number>;
      } catch {
        return {} as Record<string, number>;
      }
    })
  );

  let totalBytes = 0;
  for (const langs of languageResults) {
    for (const [name, bytes] of Object.entries(langs)) {
      languageBytes[name] = (languageBytes[name] || 0) + bytes;
      totalBytes += bytes;
    }
  }

  const top_languages = Object.entries(languageBytes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      count,
      color: LANGUAGE_COLORS[name] || "#ccc",
      percentage: totalBytes > 0 ? (count / totalBytes) * 100 : 0,
    }));


  // 3. GraphQL for current calendar year contributions
  const year = new Date().getFullYear();
  const from = new Date(Date.UTC(year, 0, 1)).toISOString();
  const to = new Date().toISOString();

  let yearStats = { commits_year: 0, contributions_year: 0, repos_contributed: 0 };

  try {
     const graphqlData = await octokit.graphql(`
       query($username: String!, $from: DateTime!, $to: DateTime!) {
         user(login: $username) {
           contributionsCollection(from: $from, to: $to) {
             totalCommitContributions
             totalRepositoriesWithContributedCommits
             contributionCalendar {
               totalContributions
             }
           }
         }
       }
     `, { username, from, to });

     // eslint-disable-next-line @typescript-eslint/no-explicit-any
     const contributions = (graphqlData as any).user.contributionsCollection;
     yearStats = {
       commits_year: contributions.totalCommitContributions,
       contributions_year: contributions.contributionCalendar.totalContributions,
       repos_contributed: contributions.totalRepositoriesWithContributedCommits,
     };

  } catch (e) {
      console.warn("GraphQL Contributions Fetch failed", e);
  }

  return {
    username: user.login,
    name: user.name,
    followers: user.followers,
    following: user.following,
    public_repos: user.public_repos,
    total_stars,
    total_gists: user.public_gists,
    avatar_url: user.avatar_url,
    top_languages,
    commits_year: yearStats.commits_year,
    contributions_year: yearStats.contributions_year,
    repos_contributed: yearStats.repos_contributed,
    year,
  };
}

export const getGitHubStats = unstable_cache(
  fetchGitHubStats,
  ["github-stats"],
  { revalidate: 3600, tags: ["github-stats"] }
);
