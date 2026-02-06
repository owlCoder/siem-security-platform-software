export interface ProjectPerformanceMetricsDto {
  project_id: number;
  project_name?: string;
  average_velocity_hours: number;
  sprints_completed: number;
}