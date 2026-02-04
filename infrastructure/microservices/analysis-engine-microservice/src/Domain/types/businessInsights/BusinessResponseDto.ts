import { BusinessIssue } from "./BusinessIssue";
import { BusinessRecommendation } from "./BusinessRecommendation";

export type BusinessResponseDto = {
    summary: string;
    recommendations: BusinessRecommendation[];
    issues: BusinessIssue[];
}