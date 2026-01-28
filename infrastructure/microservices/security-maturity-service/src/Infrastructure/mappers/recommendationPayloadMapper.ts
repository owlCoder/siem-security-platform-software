import { Recommendation } from "../../Domain/types/Recommendation";
import { RecommendationPayloadDto } from "../../Domain/types/RecommendationPayloadDto";
import { RecommendationPriority } from "../../Domain/enums/RecommendationPriority";
import { RecommendationEffort } from "../../Domain/enums/RecommendationEffort";
import { RecommendationCategory } from "../../Domain/enums/RecommendationCategory";
import { RecommendationMetric } from "../../Domain/enums/RecommendationMetric";
import { validateRecommendationPayloadDto } from "../validators/recommendationPayloadValidator";

type MapResult = {
  recommendation: Recommendation;
  errors: string[];
};

const toPriority = (raw: string): RecommendationPriority | undefined => {
  switch (raw) {
    case RecommendationPriority.HIGH:
      return RecommendationPriority.HIGH;
    case RecommendationPriority.MEDIUM:
      return RecommendationPriority.MEDIUM;
    case RecommendationPriority.LOW:
      return RecommendationPriority.LOW;
    default:
      return undefined;
  }
};

const toEffort = (raw: string): RecommendationEffort | undefined => {
  switch (raw) {
    case RecommendationEffort.LOW:
      return RecommendationEffort.LOW;
    case RecommendationEffort.MEDIUM:
      return RecommendationEffort.MEDIUM;
    case RecommendationEffort.HIGH:
      return RecommendationEffort.HIGH;
    default:
      return undefined;
  }
};

const toCategory = (raw: string): RecommendationCategory | undefined => {
  switch (raw) {
    case RecommendationCategory.DETECTION:
      return RecommendationCategory.DETECTION;
    case RecommendationCategory.RESPONSE:
      return RecommendationCategory.RESPONSE;
    case RecommendationCategory.PREVENTION:
      return RecommendationCategory.PREVENTION;
    case RecommendationCategory.PROCESS:
      return RecommendationCategory.PROCESS;
    case RecommendationCategory.VISIBILITY:
      return RecommendationCategory.VISIBILITY;
    default:
      return undefined;
  }
};

const toMetric = (raw: string): RecommendationMetric | undefined => {
  switch (raw) {
    case RecommendationMetric.MTTD:
      return RecommendationMetric.MTTD;
    case RecommendationMetric.MTTR:
      return RecommendationMetric.MTTR;
    case RecommendationMetric.FALSE_ALARM_RATE:
      return RecommendationMetric.FALSE_ALARM_RATE;
    case RecommendationMetric.INCIDENTS_BY_CATEGORY:
      return RecommendationMetric.INCIDENTS_BY_CATEGORY;
    case RecommendationMetric.TOTAL_ALERTS:
      return RecommendationMetric.TOTAL_ALERTS;
    case RecommendationMetric.OPEN_ALERTS:
      return RecommendationMetric.OPEN_ALERTS;
    case RecommendationMetric.RESOLVED_ALERTS:
      return RecommendationMetric.RESOLVED_ALERTS;
    case RecommendationMetric.SCORE:
      return RecommendationMetric.SCORE;
    default:
      return undefined;
  }
};

export const mapRecommendationPayloadDto = (dto: RecommendationPayloadDto): MapResult => {
  const baseErrors = validateRecommendationPayloadDto(dto);
  const errors: string[] = [...baseErrors];

  const priority = toPriority(dto.priority);
  if (!priority) errors.push(`priority is invalid: ${dto.priority}`);

  const effort = toEffort(dto.effort);
  if (!effort) errors.push(`effort is invalid: ${dto.effort}`);

  const category = toCategory(dto.category);
  if (!category) errors.push(`category is invalid: ${dto.category}`);

  const metrics: RecommendationMetric[] = [];
  for (const raw of dto.relatedMetrics) {
    const m = toMetric(raw);
    if (!m) {
      errors.push(`relatedMetrics contains invalid value: ${raw}`);
      continue;
    }
    metrics.push(m);
  }

  const invalid = errors.length > 0;

  const recommendation: Recommendation = {
    id: invalid ? -1 : dto.id,
    title: dto.title ?? "",
    rationale: dto.rationale ?? "",
    priority: priority ?? RecommendationPriority.LOW,
    effort: effort ?? RecommendationEffort.LOW,
    category: category ?? RecommendationCategory.PROCESS,
    relatedMetrics: metrics,
    suggestedActions: Array.isArray(dto.suggestedActions) ? dto.suggestedActions : []
  };

  return { recommendation, errors };
};