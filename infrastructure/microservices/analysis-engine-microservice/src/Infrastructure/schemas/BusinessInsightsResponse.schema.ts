import { BusinessIssueCategory } from "../../Domain/enums/BusinessIssueCategory";
import { BusinessIssueSeverity } from "../../Domain/enums/BusinessIssueSeverity";
import { BusinessRecommendationCategory } from "../../Domain/enums/BusinessRecommendationCategory";
import { BusinessRecommendationPriority } from "../../Domain/enums/BusinessRecommendationPriority";

const recommendationPriorityValues = Object.values(BusinessRecommendationPriority);
const recommendationCategoryValues = Object.values(BusinessRecommendationCategory);
const issueSeverityValues = Object.values(BusinessIssueSeverity);
const issueCategoryValues = Object.values(BusinessIssueCategory);

export const BusinessInsightsResponseSchema = {
  type: "object",
  required: ["summary", "recommendations", "issues"],
  properties: {
    summary: { type: "string" },

    recommendations: {
      type: "array",
      items: {
        type: "object",
        required: ["priority", "category", "title", "description"],
        properties: {
          priority: {
            type: "string",
            enum: recommendationPriorityValues
          },
          category: {
            type: "string",
            enum: recommendationCategoryValues
          },
          title: { type: "string" },
          description: { type: "string" }
        }
      }
    },

    issues: {
      type: "array",
      items: {
        type: "object",
        required: ["severity", "category", "title", "description"],
        properties: {
          severity: {
            type: "string",
            enum: issueSeverityValues
          },
          category: {
            type: "string",
            enum: issueCategoryValues
          },
          title: { type: "string" },
          description: { type: "string" },
          affected_projects: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    }
  }
} as const;
