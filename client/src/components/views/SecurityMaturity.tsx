import { useEffect, useState } from "react";
import { SecurityMaturityProps } from "../../types/props/security-maturity/SecurityMaturityProps";
import { SecuirtyMaturityCurrentDTO } from "../../models/security-maturity/SecurityMaturityCurrentDTO";
import { MaturityLevel } from "../../enums/MaturityLevel";
import MaturityScoreGauge from "../security-maturity/MaturityScoreGauge";
import MaturityScoreCard from "../security-maturity/MaturityScoreCard";
import MaturityKpiGrid from "../security-maturity/MaturityKpiGrid";
import { SecurityMaturityTrendDTO } from "../../models/security-maturity/SecurityMaturityTrendDTO";
import SecurityMaturityTrend from "../security-maturity/SecurityMaturityTrend";
import IncidentsByCategoryChart from "../security-maturity/IncidentsByCategoryChart";
import { AlertCategory } from "../../enums/AlertCategory";
import { useAuth } from "../../hooks/useAuthHook";

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

const testSecurityMaturityTrend: SecurityMaturityTrendDTO[] = [
  { bucketStart: "2024-01-01", value: 58, sampleCount: 120 },
  { bucketStart: "2024-02-01", value: 61, sampleCount: 140 },
  { bucketStart: "2024-03-01", value: 65, sampleCount: 160 },
  { bucketStart: "2024-04-01", value: 69, sampleCount: 180 },
  { bucketStart: "2024-05-01", value: 72, sampleCount: 200 },
];


export default function SecurityMaturity({
  securityMaturityApi
}: SecurityMaturityProps) {
  const { token } = useAuth();
  const [summary, setSummary] = useState<SecuirtyMaturityCurrentDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trend, setTrend] = useState<SecurityMaturityTrendDTO[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const res = await securityMaturityApi.getCurrent(token!);
        setSummary(res);
      } catch (err) {
        console.error("Security maturity fetch failed", err);
        setSummary(testSecurityMaturity);
        setTrend(testSecurityMaturityTrend);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, securityMaturityApi]);

  if (isLoading) {
    return <div className="p-6">Loading security maturity...</div>;
  }

  if (!summary) {
    return <div className="p-6">No security maturity data</div>;
  }

  const incidentsByCategory = Object.entries(summary.categoryCounts).map(
    ([category, count]) => ({
      category: category as AlertCategory,
      count
    })
  );

  return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-5">

        <div className="flex flex-col gap-5">
          <div className="rounded-lg border-2 border-[#282A28] bg-[#1f2123] p-6">
            <MaturityScoreGauge score={summary.scoreValue} />
          </div>

          <MaturityScoreCard level={summary.maturityLevel} />
        </div>

        <div className="flex flex-col items-center rounded-lg border-2 border-[#282A28] bg-[#1f2123] p-6">
          <h2 className="text-sm uppercase tracking-widest text-gray-400">
            Security Metrics
          </h2>

          <MaturityKpiGrid data={summary} />
        </div>


      </div>
      <div className="flex flex-col items-center rounded-lg border-2 border-[#282A28] bg-[#1f2123] p-6">
        <h2 className="text-sm uppercase tracking-widest text-gray-400">
          Security Maturity Trend
        </h2>

        <SecurityMaturityTrend data={trend} />
      </div>

      <div className="flex flex-col items-center rounded-lg border-2 border-[#282A28] bg-[#1f2123] p-6">
        <h2 className="text-sm uppercase tracking-widest text-gray-400">
          Incidents By Category
        </h2>

        <IncidentsByCategoryChart data={incidentsByCategory} />
      </div>
    </div>
  );
}