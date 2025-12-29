import { AlertQueryDTO } from "../../../models/alerts/AlertQueryDTO";

export interface AlertFiltersProps {
  onSearch: (query: AlertQueryDTO) => void;
}
