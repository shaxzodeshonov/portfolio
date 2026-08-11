import {
  parseCalendar,
  type ContributionData,
  type GraphQlCalendar,
} from "./contributions";
import { getContributionGrid, totalContributions } from "./stats";

/**
 * Real contribution data from GitHub.
 *
 * GitHub's REST API does not expose the contribution calendar at all — only
 * GraphQL does, and that endpoint requires authentication even for public
 * data. So this needs a token; without one it falls back to the seeded
 * placeholder grid and reports `source: "placeholder"` so the UI can say so
 * rather than passing invented data off as real.
 *
 * Create a token at https://github.com/settings/tokens with the `read:user`
 * scope and set it as GITHUB_TOKEN.
 */

export type { ContributionData };

const QUERY = `
  query Contributions($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

function placeholder(): ContributionData {
  const weeks = getContributionGrid();
  return { weeks, total: totalContributions(weeks), source: "placeholder" };
}

export async function getContributions(login: string): Promise<ContributionData> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return placeholder();

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: QUERY, variables: { login } }),
      // Re-fetch at most hourly. A contribution graph does not need to be
      // fresher than that, and it keeps the page statically served.
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.warn(`[github] contributions request failed: ${response.status}`);
      return placeholder();
    }

    const json = await response.json();

    // GraphQL answers 200 with an `errors` array on a bad token or login.
    if (json.errors?.length) {
      console.warn("[github] contributions query errored:", json.errors[0]?.message);
      return placeholder();
    }

    const calendar: GraphQlCalendar | undefined =
      json?.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar?.weeks?.length) return placeholder();

    return parseCalendar(calendar);
  } catch (error) {
    console.warn("[github] contributions fetch threw:", error);
    return placeholder();
  }
}
