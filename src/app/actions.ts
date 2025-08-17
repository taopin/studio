"use server";

import { suggestSearchTerms } from "@/ai/flows/suggest-search-terms";

export async function getAiSuggestions(searchHistory: string) {
  try {
    const result = await suggestSearchTerms({
      latestDataSummary:
        "Recent data shows increased activity from devices in Unit-A and a higher average weight for animals with IDs between ANI-0010 and ANI-0025.",
      searchHistory: searchHistory || "No previous searches.",
    });
    return result.suggestedTerms.split(",").map((s) => s.trim());
  } catch (error) {
    console.error("Error getting AI suggestions:", error);
    return [];
  }
}
