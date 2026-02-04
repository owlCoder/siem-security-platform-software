import { BusinessRecommendationCategory } from "../../enums/BusinessRecommendationCategory";
import { BusinessRecommendationPriority } from "../../enums/BusinessRecommendationPriority";

export interface BusinessRecommendation {
  priority: BusinessRecommendationPriority;
  category: BusinessRecommendationCategory;
  title: string;
  description: string;
}