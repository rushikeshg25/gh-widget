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
  total_commits: number;
  total_gists: number;
  avatar_url: string;
  top_languages: { name: string; count: number; color: string; percentage: number }[];
  current_streak: number;
  max_streak: number;
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

// Helper to calculate streaks
function calculateStreaks(weeks: { contributionDays: { date: string; contributionCount: number }[] }[]) {
  const days = weeks.flatMap((week) => week.contributionDays);
  
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;
  let totalCommitsYear = 0;

  // We loop through all days to find max streak and total commits
  for (const day of days) {
    if (day.contributionCount > 0) {
        tempStreak++;
        totalCommitsYear += day.contributionCount;
    } else {
        maxStreak = Math.max(maxStreak, tempStreak);
        tempStreak = 0;
    }
  }
  // Check max streak one last time
  maxStreak = Math.max(maxStreak, tempStreak);

  // Calculate current streak
  let activeStreak = 0;
  const reversedDays = [...days].reverse();
  
  for (let i = 0; i < reversedDays.length; i++) {
      if (reversedDays[i].contributionCount > 0) {
          activeStreak++;
      } else {
          if (i === 0) {
              // Today is 0. Streak is valid if yesterday was > 0.
              continue;
          } else {
              break;
          }
      }
  }

  return { currentStreak: activeStreak, maxStreak, totalCommitsYear };
}

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

  const total_stars = repos.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0);

  // Calculate Languages
  const languagesMap: Record<string, number> = {};
  let totalLanguageCount = 0;
  repos.forEach((repo) => {
    if (repo.language) {
      languagesMap[repo.language] = (languagesMap[repo.language] || 0) + 1;
      totalLanguageCount++;
    }
  });

  const top_languages = Object.entries(languagesMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      count,
      color: LANGUAGE_COLORS[name] || "#ccc",
      percentage: totalLanguageCount > 0 ? (count / totalLanguageCount) * 100 : 0,
    }));


  // 3. GraphQL for Contribution Graph
  let streakStats = { currentStreak: 0, maxStreak: 0, totalCommitsYear: 0 };
  
  try {
     // Removed @ts-expect-error as it might be unused if types are correct
     const graphqlData = await octokit.graphql(`
       query($username: String!) {
         user(login: $username) {
           contributionsCollection {
             contributionCalendar {
               weeks {
                 contributionDays {
                   date
                   contributionCount
                 }
               }
             }
           }
         }
       }
     `, { username });
     
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
     const weeks = (graphqlData as any).user.contributionsCollection.contributionCalendar.weeks;
     streakStats = calculateStreaks(weeks);
     
  } catch (e) {
      console.warn("GraphQL Streak/Commits Fetch failed", e);
  }

  return {
    username: user.login,
    name: user.name,
    followers: user.followers,
    following: user.following,
    public_repos: user.public_repos,
    total_stars,
    total_commits: streakStats.totalCommitsYear,
    total_gists: user.public_gists,
    avatar_url: user.avatar_url,
    top_languages,
    current_streak: streakStats.currentStreak,
    max_streak: streakStats.maxStreak,
  };
}

export const getGitHubStats = unstable_cache(
  fetchGitHubStats,
  ["github-stats"],
  { revalidate: 3600, tags: ["github-stats"] }
);
