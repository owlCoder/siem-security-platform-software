import { RecommendationPayloadDto } from "../../Domain/types/RecommendationPayloadDto";

export const validateRecommendationPayloadDto = (dto: RecommendationPayloadDto): string[] => {
  const errors: string[] = [];

  if (!Number.isFinite(dto.id)) {
    errors.push("id must be a finite number");
  }

  if (!dto.title || dto.title.trim().length === 0) {
    errors.push("title is required");
  }

  if (!dto.rationale || dto.rationale.trim().length === 0) {
    errors.push("rationale is required");
  }

  if (!dto.priority || dto.priority.trim().length === 0) {
    errors.push("priority is required");
  }

  if (!dto.effort || dto.effort.trim().length === 0) {
    errors.push("effort is required");
  }

  if (!dto.category || dto.category.trim().length === 0) {
    errors.push("category is required");
  }

  if (!Array.isArray(dto.relatedMetrics)) {
    errors.push("relatedMetrics must be an array");
  } else {
    const hasNonString = dto.relatedMetrics.some(m => typeof m !== "string" || m.trim().length === 0);
    if (hasNonString) {
      errors.push("relatedMetrics must contain non-empty strings only");
    }
  }

  if (!Array.isArray(dto.suggestedActions)) {
    errors.push("suggestedActions must be an array");
  } else {
    const hasNonString = dto.suggestedActions.some(a => typeof a !== "string" || a.trim().length === 0);
    if (hasNonString) {
      errors.push("suggestedActions must contain non-empty strings only");
    }
  }

  return errors;
};