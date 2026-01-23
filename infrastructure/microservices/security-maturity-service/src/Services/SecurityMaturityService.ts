import { ISecurityMaturityService } from "../Domain/services/ISecurityMaturityService";
import { mapScoreToLevel } from "../Utils/MapScoreToLevel";
import { calculateScore } from "../Utils/ScoreCalculator";
import { ScoreInput } from "../Domain/types/ScoreInput";
import { SMScore } from "../Domain/types/SMScore";
import { MaturityLevel } from "../Domain/enums/MaturityLevel";

export class SecurityMaturityService implements ISecurityMaturityService {
  async calculateCurrentMaturity(input: ScoreInput): Promise<SMScore> {

    //treba paziti mttd i mttr mogu biti null
    //ukoliko nema korelacija u zadatom periodu
    //skontati kako to utice na score
    const score = calculateScore({//ScoreInput
      mttdMinutes: 45,
      mttrMinutes: 90,
      falseAlarmRate: 0.2,
      totalAlerts: 30,
    });

    const level = mapScoreToLevel(score);

      const result: SMScore = {
      scoreValue: score,
      maturityLevel: level
    };

    return result;
  }
}
