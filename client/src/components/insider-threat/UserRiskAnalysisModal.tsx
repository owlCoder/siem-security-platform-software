import { useEffect, useState } from "react";
import { UserRiskAnalysisDTO } from "../../models/insider-threat/UserRiskAnalysisDTO";
import { IInsiderThreatAPI } from "../../api/insider-threat/IInsiderThreatAPI";
import { useAuth } from "../../hooks/useAuthHook";
import { PiX, PiArrowCounterClockwiseFill } from "react-icons/pi";

interface UserRiskAnalysisModalProps {
  userId: number;
  insiderThreatApi: IInsiderThreatAPI;
  onClose: () => void;
}

export default function UserRiskAnalysisModal({
  userId,
  insiderThreatApi,
  onClose,
}: UserRiskAnalysisModalProps) {
  const { token: authToken } = useAuth();
  const [analysis, setAnalysis] = useState<UserRiskAnalysisDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  const getToken = () => {
    return authToken || localStorage.getItem("token");
  };

  useEffect(() => {
    loadAnalysis();
  }, [userId]);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        console.error("[UserRiskAnalysisModal] No authentication token found");
        return;
      }
      console.log("[UserRiskAnalysisModal] Loading analysis for userId:", userId);
      const data = await insiderThreatApi.getUserRiskAnalysis(userId, token);
      console.log("[UserRiskAnalysisModal] Analysis loaded successfully");
      setAnalysis(data);
    } catch (error) {
      console.error("[UserRiskAnalysisModal] Error loading user risk analysis:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const token = getToken();
      if (!token) {
        console.error("[UserRiskAnalysisModal] No authentication token found");
        return;
      }
      console.log("[UserRiskAnalysisModal] Recalculating risk for userId:", userId);
      await insiderThreatApi.recalculateUserRisk(userId, token);
      await loadAnalysis();
    } catch (error) {
      console.error("[UserRiskAnalysisModal] Error recalculating user risk:", error);
    } finally {
      setRecalculating(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-lg flex justify-center items-center z-[1000]">
        <div className="bg-[#1f1f1f] rounded-2xl w-[85%] max-w-[700px] p-6 border border-[#333]">
          <div className="text-center">
            <div className="spinner"></div>
            <p className="text-gray-400 mt-4 text-[14px]">Loading risk analysis...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-lg flex justify-center items-center z-[1000]">
        <div className="bg-[#1f1f1f] rounded-2xl w-[85%] max-w-[700px] p-6 border border-[#333]">
          <div className="text-center text-red-400 text-[14px]">
            Failed to load risk analysis
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-lg flex justify-center items-center z-[1000]"
      onClick={onClose}
    >
      <div
        className="bg-[#1f1f1f] rounded-2xl w-[85%] max-w-[700px] max-h-[100vh] overflow-auto 
                   border border-[#333] shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 py-5 border-b border-[#333] bg-[#2a2a2a] rounded-t-2xl">
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="flex items-center gap-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white px-4 py-2 rounded-lg text-sm transition disabled:opacity-50 border-none cursor-pointer"
          >
            <PiArrowCounterClockwiseFill size={16} />
            {recalculating ? "Recalculating..." : "Recalculate"}
          </button>

          <h2 className="m-0 text-xl text-white">User Risk Analysis</h2>

          <button
            onClick={onClose}
            className="bg-transparent border-none cursor-pointer text-white text-2xl p-0 flex items-center"
          >
            <PiX />
          </button>
        </div>

        <div className="flex flex-col px-6 py-6 gap-6 text-sm">

          <div>
            <label className="block text-gray-400 mb-2">User ID</label>
            <div className="text-white font-semibold">{analysis.userId}</div>
          </div>

          <div>
            <label className="block text-gray-400 mb-4 text-base">Threats Summary</label>
            <div className="grid grid-cols-5 gap-5">
              {["total", "critical", "high", "medium", "low"].map((level) => {
                const value = analysis.threatsSummary[level as keyof typeof analysis.threatsSummary];
                const color =
                  level === "critical" ? "text-red-400" :
                  level === "high" ? "text-orange-400" :
                  level === "medium" ? "text-yellow-400" :
                  level === "low" ? "text-green-400" :
                  "text-white";

                const label = level.charAt(0).toUpperCase() + level.slice(1);
                return (
                  <div key={level} className="bg-[#2a2a2a] rounded-lg px-8 py-6 text-center border border-[#3a3a3a]">
                    <div className="text-gray-400 text-xs uppercase mb-3">{label}</div>
                    <div className={`text-3xl font-bold ${color}`}>{value}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-400 mb-2">Risk Level</label>
              <span className={`inline-block px-4 py-2 rounded-full font-semibold ${
                analysis.currentRiskLevel === 'CRITICAL' ? 'text-red-400' :
                analysis.currentRiskLevel === 'HIGH' ? 'text-orange-400' :
                analysis.currentRiskLevel === 'MEDIUM' ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {analysis.currentRiskLevel}
              </span>
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Risk Score</label>
              <div className={`text-2xl font-bold ${
                analysis.riskScore >= 100 ? 'text-red-400' :
                analysis.riskScore >= 60 ? 'text-orange-400' :
                analysis.riskScore >= 30 ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {analysis.riskScore}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-4 text-base">Behavior Patterns</label>
            <div className="grid grid-cols-2 gap-6">
              {Object.entries(analysis.behaviorPatterns).map(([key, value]) => (
                <div key={key} className="bg-[#2a2a2a] rounded-lg px-8 py-6 border border-[#3a3a3a]">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-white text-2xl font-semibold">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {analysis.recentThreats && analysis.recentThreats.length > 0 && (
            <div>
              <label className="block text-gray-400 mb-4 text-base">Recent Threats ({analysis.recentThreats.length})</label>
              <div className="space-y-5">
                {analysis.recentThreats.map((threat) => (
                  <div key={threat.id} className="bg-[#2a2a2a] rounded-lg px-6 py-6 border border-[#3a3a3a]">
                    <div className="text-white font-semibold text-sm">{threat.threatType.replace(/_/g, " ")}</div>
                    <div className="text-gray-300 leading-relaxed text-sm mt-2">{threat.description}</div>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-gray-500 text-xs">Risk Level:</span>
                      <span className={`text-xs font-semibold px-3 py-1 rounded ${
                        threat.riskLevel === 'CRITICAL' ? 'bg-red-900/30 text-red-400' :
                        threat.riskLevel === 'HIGH' ? 'bg-orange-900/30 text-orange-400' :
                        threat.riskLevel === 'MEDIUM' ? 'bg-yellow-900/30 text-yellow-400' :
                        'bg-green-900/30 text-green-400'
                      }`}>
                        {threat.riskLevel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-900/20 border-l-4 border-blue-500 rounded-lg px-8 py-6">
            <label className="block text-white font-semibold mb-3 text-base">Security Recommendation</label>
            <div className="text-gray-200 leading-relaxed text-sm">
              {analysis.recommendation}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}