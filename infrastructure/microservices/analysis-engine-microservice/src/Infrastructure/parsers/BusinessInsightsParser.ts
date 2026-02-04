import { BusinessResponseDto } from "../../Domain/types/businessInsights/BusinessResponseDto";
import { BusinessRecommendation } from "../../Domain/types/businessInsights/BusinessRecommendation";
import { BusinessIssue } from "../../Domain/types/businessInsights/BusinessIssue";

import { BusinessRecommendationPriority } from "../../Domain/enums/BusinessRecommendationPriority";
import { BusinessRecommendationCategory } from "../../Domain/enums/BusinessRecommendationCategory";
import { BusinessIssueSeverity } from "../../Domain/enums/BusinessIssueSeverity";
import { BusinessIssueCategory } from "../../Domain/enums/BusinessIssueCategory";

import { JsonValue } from "../../Domain/types/JsonValue";
import { isJsonArray } from "../json/isJsonArray";
import { isJsonObject } from "../json/isJsonObject";

const RECOMMENDATION_PRIORITY_VALUES = Object.values(BusinessRecommendationPriority);
const RECOMMENDATION_CATEGORY_VALUES = Object.values(BusinessRecommendationCategory);
const ISSUE_SEVERITY_VALUES = Object.values(BusinessIssueSeverity);
const ISSUE_CATEGORY_VALUES = Object.values(BusinessIssueCategory);

export function parseBusinessInsights(raw: JsonValue): BusinessResponseDto {
  if (!isJsonObject(raw)) return emptyBusinessResponse();

  const summaryRaw = raw["summary"];
  const recommendationsRaw = raw["recommendations"];
  const issuesRaw = raw["issues"];

  if (typeof summaryRaw !== "string") return emptyBusinessResponse();

  const summary = summaryRaw.trim();
  if (summary.length < 10 || summary.length > 800) return emptyBusinessResponse();

  const recommendations = parseRecommendations(recommendationsRaw);

  const issues = parseIssues(issuesRaw);

  return {
    summary,
    recommendations,
    issues,
  };
}

function parseRecommendations(raw: JsonValue): BusinessRecommendation[] {
  if (!isJsonArray(raw)) return [];

  const out: BusinessRecommendation[] = [];

  for (const item of raw) {
    if (!isJsonObject(item)) continue;

    const priorityRaw = item["priority"];
    const categoryRaw = item["category"];
    const titleRaw = item["title"];
    const descriptionRaw = item["description"];

    if (
      typeof priorityRaw !== "string" ||
      typeof categoryRaw !== "string" ||
      typeof titleRaw !== "string" ||
      typeof descriptionRaw !== "string"
    ) {
      continue;
    }

    const priority = priorityRaw.trim().toLowerCase();
    if (!RECOMMENDATION_PRIORITY_VALUES.includes(priority as any)) continue;

    const category = categoryRaw.trim().toLowerCase();
    if (!RECOMMENDATION_CATEGORY_VALUES.includes(category as any)) continue;

    const title = titleRaw.trim();
    const description = descriptionRaw.trim();

    if (title.length < 6 || title.length > 120) continue;
    if (description.length < 20 || description.length > 800) continue;

    out.push({
      priority: priority as BusinessRecommendationPriority,
      category: category as BusinessRecommendationCategory,
      title,
      description,
    });
  }

  return out;
}

function parseIssues(raw: JsonValue): BusinessIssue[] {
  if (!isJsonArray(raw)) return [];

  const out: BusinessIssue[] = [];

  for (const item of raw) {
    if (!isJsonObject(item)) continue;

    const severityRaw = item["severity"];
    const categoryRaw = item["category"];
    const titleRaw = item["title"];
    const descriptionRaw = item["description"];
    const affectedProjectsRaw = item["affected_projects"];

    if (
      typeof severityRaw !== "string" ||
      typeof categoryRaw !== "string" ||
      typeof titleRaw !== "string" ||
      typeof descriptionRaw !== "string"
    ) {
      continue;
    }

    const severity = severityRaw.trim().toLowerCase();
    if (!ISSUE_SEVERITY_VALUES.includes(severity as any)) continue;

    const category = categoryRaw.trim().toLowerCase();
    if (!ISSUE_CATEGORY_VALUES.includes(category as any)) continue;

    const title = titleRaw.trim();
    const description = descriptionRaw.trim();

    if (title.length < 6 || title.length > 120) continue;
    if (description.length < 20 || description.length > 900) continue;

    let affected_projects: string[] | undefined = undefined;
    if (isJsonArray(affectedProjectsRaw)) {
      affected_projects = affectedProjectsRaw
        .filter((p): p is string => typeof p === "string" && p.trim().length > 0)
        .map(p => p.trim());
    }

    out.push({
      severity: severity as BusinessIssueSeverity,
      category: category as BusinessIssueCategory,
      title,
      description,
      ...(affected_projects && affected_projects.length > 0
        ? { affected_projects }
        : {}),
    });
  }

  return out;
}

function emptyBusinessResponse(): BusinessResponseDto {
  return {
    summary: "Business insights are currently unavailable.",
    recommendations: [],
    issues: [],
  };
}
