import { useEffect, useState } from "react";
import { SecurityMaturityProps } from "../../types/props/security-maturity/SecurityMaturityProps";
import { SecuirtyMaturityCurrentDTO } from "../../models/security-maturity/SecurityMaturityCurrentDTO";
import { MaturityLevel } from "../../enums/MaturityLevel";

const testSecurityMaturity: SecuirtyMaturityCurrentDTO = {
  scoreValue: 72,
  maturityLevel: MaturityLevel.DEFINED,
  mttdMinutes: 18,
  mttrMinutes: 55,
  falseAlarmRate: 0.12,
  totalAlerts: 342,
  resolvedAlerts: 310,
  openAlerts: 32,
  categoryCounts: {
    DDOS: 120,
    MALWARE: 80,
    PHISHING: 64,
    BRUTE_FORCE: 42,
    OTHER: 36
  }
};


export default function SecurityMaturity({
    securityMaturityApi
}: SecurityMaturityProps){

    const token = "sdasda";
    const [summary, setSummary] = useState<SecuirtyMaturityCurrentDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            try{
                const res = await securityMaturityApi.getCurrent(token);
                setSummary(res);
            } catch(err){
                console.error("Security maturity fetch failed", err);
                setSummary(testSecurityMaturity);
            } finally{
                setIsLoading(false);
            }
        };

        fetchData();
    }, [token, securityMaturityApi]);

    if(isLoading){
        return <div className="p-6">Loading security maturity...</div>;
    }

    if(!summary){
        return <div className="p-6">No security maturity data</div>;
    }

    return (
    <div className="p-6">
      <div className="rounded-lg border-2 border-[#282A28] bg-[#1f2123] p-6">
        <h2 className="text-xl font-semibold mb-4">Security Maturity</h2>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-400">Score</div>
            <div className="text-2xl">{summary.scoreValue}</div>
          </div>

          <div>
            <div className="text-sm text-gray-400">Maturity Level</div>
            <div className="text-2xl">{summary.maturityLevel}</div>
          </div>

          <div>
            <div className="text-sm text-gray-400">MTTD (min)</div>
            <div className="text-2xl">{summary.mttdMinutes}</div>
          </div>

          <div>
            <div className="text-sm text-gray-400">MTTR (min)</div>
            <div className="text-2xl">{summary.mttrMinutes}</div>
          </div>
        </div>
      </div>
    </div>
  );

}