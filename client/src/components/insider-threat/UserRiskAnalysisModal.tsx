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
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-[#1a1a1a] rounded-[16px] p-8 max-w-2xl w-full mx-4">
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
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-[#1a1a1a] rounded-[16px] p-8 max-w-2xl w-full mx-4">
          <div className="text-center text-red-400 text-[14px]">
            Failed to load risk analysis
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] rounded-[16px] p-6 max-w-3xl w-full mx-4 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
          <div>
            <h2 className="text-[20px] font-semibold text-white">User Risk Analysis</h2>
            <div className="text-gray-400 text-[14px] mt-1">User ID: {analysis.userId}</div>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={handleRecalculate}
              disabled={recalculating}
              className="flex items-center gap-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white px-3 py-1.5 rounded-[8px] text-[13px] transition-all disabled:opacity-50"
            >
              <PiArrowCounterClockwiseFill size={14} />
              {recalculating ? "Recalculating..." : "Recalculate"}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <PiX size={24} />
            </button>
          </div>
        </div>

        <div className="space-y-6 text-[14px]">
          <div className="flex gap-6">
            <div>
              <div className="text-gray-400 mb-1">Risk Level</div>
              <div className="text-white text-[18px] font-semibold">{analysis.currentRiskLevel}</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Risk Score</div>
              <div className="text-white text-[18px] font-semibold">{analysis.riskScore}</div>
            </div>
          </div>

          <div>
            <div className="text-white font-semibold mb-3">Threats Summary</div>
            <div className="grid grid-cols-5 gap-3">
              <div className="bg-[#2a2a2a] rounded-[8px] p-3 text-center">
                <div className="text-gray-400 text-[12px] mb-1">Total</div>
                <div className="text-white text-[20px] font-bold">{analysis.threatsSummary.total}</div>
              </div>
              <div className="bg-[#2a2a2a] rounded-[8px] p-3 text-center">
                <div className="text-gray-400 text-[12px] mb-1">Critical</div>
                <div className="text-[#ef4444] text-[20px] font-bold">{analysis.threatsSummary.critical}</div>
              </div>
              <div className="bg-[#2a2a2a] rounded-[8px] p-3 text-center">
                <div className="text-gray-400 text-[12px] mb-1">High</div>
                <div className="text-[#f97316] text-[20px] font-bold">{analysis.threatsSummary.high}</div>
              </div>
              <div className="bg-[#2a2a2a] rounded-[8px] p-3 text-center">
                <div className="text-gray-400 text-[12px] mb-1">Medium</div>
                <div className="text-[#eab308] text-[20px] font-bold">{analysis.threatsSummary.medium}</div>
              </div>
              <div className="bg-[#2a2a2a] rounded-[8px] p-3 text-center">
                <div className="text-gray-400 text-[12px] mb-1">Low</div>
                <div className="text-[#22c55e] text-[20px] font-bold">{analysis.threatsSummary.low}</div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-white font-semibold mb-3">Behavior Patterns</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Off-Hours Accesses</span>
                <span className="text-white">{analysis.behaviorPatterns.offHoursAccesses}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Mass Data Reads</span>
                <span className="text-white">{analysis.behaviorPatterns.massDataReads}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Permission Changes</span>
                <span className="text-white">{analysis.behaviorPatterns.permissionChanges}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Failed Logins</span>
                <span className="text-white">{analysis.behaviorPatterns.failedLogins}</span>
              </div>
            </div>
          </div>

          {analysis.recentThreats && analysis.recentThreats.length > 0 && (
            <div>
              <div className="text-white font-semibold mb-3">Recent Threats</div>
              <div className="space-y-2">
                {analysis.recentThreats.map((threat) => (
                  <div key={threat.id} className="bg-[#2a2a2a] rounded-[8px] p-3">
                    <div className="flex justify-between items-start mb-1">
                      <div className="text-white text-[13px] font-semibold">
                        {threat.threatType.replace(/_/g, " ")}
                      </div>
                      <div className="text-gray-400 text-[12px]">
                        {new Date(threat.detectedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-gray-300 text-[13px]">{threat.description}</div>
                    <div className="text-gray-500 text-[12px] mt-1">Risk: {threat.riskLevel}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-[#2a2a2a] rounded-[8px] p-4 border-l-4 border-blue-500">
            <div className="text-white font-semibold mb-2">Recommendation</div>
            <div className="text-gray-300 text-[13px]">{analysis.recommendation}</div>
          </div>
        </div>
      </div>
    </div>
  );
}