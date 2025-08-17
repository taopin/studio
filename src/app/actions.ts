"use server";

import { suggestSearchTerms } from "@/ai/flows/suggest-search-terms";

export async function getAiSuggestions(searchHistory: string) {
  try {
    const result = await suggestSearchTerms({
      latestDataSummary:
        "最近的数据显示，来自 Unit-A 的设备活动增加，ID 在 ANI-0010 和 ANI-0025 之间的动物平均体重较高。",
      searchHistory: searchHistory || "没有以前的搜索记录。",
    });
    return result.suggestedTerms.split(",").map((s) => s.trim());
  } catch (error) {
    console.error("获取AI建议时出错:", error);
    return [];
  }
}
