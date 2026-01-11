import { AlertSeverity } from "../../../enums/AlertSeverity";
import { AlertStatus } from "../../../enums/AlertStatus";

export interface SelectFiltersProps {
  severity?: AlertSeverity;
  status?: AlertStatus;
  sortBy: 'createdAt' | 'severity' | 'status';
  sortOrder: 'ASC' | 'DESC';
  onSeverityChange: (value: AlertSeverity | undefined) => void;
  onStatusChange: (value: AlertStatus | undefined) => void;
  onSortByChange: (value: 'createdAt' | 'severity' | 'status') => void;
  onSortOrderChange: (value: 'ASC' | 'DESC') => void;
}