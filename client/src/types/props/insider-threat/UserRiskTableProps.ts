import { UserRiskProfileDTO } from "../../../models/insider-threat/UserRiskProfileDTO";

export interface UserRiskTableProps {
  profiles: UserRiskProfileDTO[];
  onSelectUser: (userId: number) => void;
}