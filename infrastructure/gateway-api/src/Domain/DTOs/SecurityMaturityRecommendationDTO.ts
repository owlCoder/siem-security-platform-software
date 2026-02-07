import { MaturityLevel } from "../enums/MaturityLevel";
import { RecommendationPriority } from "../enums/RecommendationPriority";

export interface SecurityMaturityRecommendationDTO {
  id: string;
  title: string;
  description: string;
  priority: RecommendationPriority;
  targetMaturityLevel?: MaturityLevel;
}
