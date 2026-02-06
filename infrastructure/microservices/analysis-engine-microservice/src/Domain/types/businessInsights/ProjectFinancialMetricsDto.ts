export interface ProjectFinancialMetricsDto {
  project_id: number;
  allowed_budget: number;
  total_spent: number;
  remaining_budget: number;
  variance: number;
  profit: number;
  profit_margin_percentage: number;
}