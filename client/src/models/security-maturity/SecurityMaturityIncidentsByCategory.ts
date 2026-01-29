import { AlertCategory } from "../../enums/AlertCategory";

export interface SecuirtyMaturityIncidentsByCategoryDTO {
  category: AlertCategory;
  count: number;
}
