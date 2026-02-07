import { MaturityLevel } from "../../enums/MaturityLevel";

export enum RecommendationPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export interface SecurityMaturityRecommendationDTO {
  id: string;
  title: string;
  description: string;
  priority: RecommendationPriority;
  targetMaturityLevel?: MaturityLevel;
}
