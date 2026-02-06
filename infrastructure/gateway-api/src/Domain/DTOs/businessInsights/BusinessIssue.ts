import { BusinessIssueCategory } from "../../enums/BusinessIssueCategory";
import { BusinessIssueSeverity } from "../../enums/BusinessIssueSeverity";

export interface BusinessIssue {
  severity: BusinessIssueSeverity;
  category: BusinessIssueCategory;
  title: string;
  description: string;
  affected_projects?: string[];
}