import { useState, useMemo } from "react";
import { useInsiderThreats } from "../../hooks/useInsiderThreats";
import ThreatCard from "../insider-threat/ThreatCard";
import ThreatsTable from "../tables/insider-threat/ThreatsTable";
import UserRiskTable from "../tables/insider-threat/UserRiskTable";
import Pagination from "../common/Pagination";
import { InsiderThreatsProps } from "../../types/props/insider-threat/InsiderThreatsProps";
import UserRiskAnalysisModal from "../insider-threat/UserRiskAnalysisModal";
import ThreatDetailModal from "../insider-threat/ThreatDetailModal";

export default function InsiderThreats({ insiderThreatApi }: InsiderThreatsProps) {
  const {
    threats,
    userRiskProfiles,
    isLoading,
    pagination,
    searchThreats
  } = useInsiderThreats(insiderThreatApi);

  const [selectedThreatId, setSelectedThreatId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"threats" | "users">("threats");

  const stats = useMemo(() => {
    const totalThreats = threats.length;
    const unresolvedThreats = threats.filter(t => !t.isResolved).length;
    const criticalThreats = threats.filter(t => t.riskLevel === "CRITICAL").length;
    const highRiskUsers = userRiskProfiles.filter(p => p.currentRiskLevel === "HIGH" || p.currentRiskLevel === "CRITICAL").length;

    const threatsByType = {
      massDataRead: threats.filter(t => t.threatType === "MASS_DATA_READ").length,
      permissionChange: threats.filter(t => t.threatType === "PERMISSION_CHANGE").length,
      offHoursAccess: threats.filter(t => t.threatType === "OFF_HOURS_ACCESS").length,
      suspiciousLogin: threats.filter(t => t.threatType === "SUSPICIOUS_LOGIN").length,
    };

    return {
      totalThreats,
      unresolvedThreats,
      criticalThreats,
      highRiskUsers,
      threatsByType
    };
  }, [threats, userRiskProfiles]);

  const handlePageChange = (page: number) => {
    searchThreats({ page, limit: pagination?.limit || 10 });
  };

  const handlePageSizeChange = (limit: number) => {
    searchThreats({ page: 1, limit });
  };

  const handleSelectThreat = (id: number) => {
    setSelectedThreatId(id);
  };

  const handleSelectUser = (userId: number) => {
    setSelectedUserId(userId);
  };

  const handleCloseThreatModal = () => {
    setSelectedThreatId(null);
  };

  const handleCloseUserModal = () => {
    setSelectedUserId(null);
  };

  return (
    <>
      <div className="border-2 border-[#282A28] bg-transparent rounded-[14px] p-3! relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-[24px]!">
          <h2 className="m-0">Insider Threat Detection</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("threats")}
              className={`px-4 py-2 rounded-[12px]! text-[13px] font-semibold transition-all ${
                activeTab === "threats"
                  ? "bg-[#007a55]! text-white"
                  : "bg-[#313338]! text-[#a6a6a6] hover:bg-[#404249]!"
              }`}
            >
              Threats
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 rounded-[12px]! text-[13px] font-semibold transition-all ${
                activeTab === "users"
                  ? "bg-[#007a55]! text-white"
                  : "bg-[#313338]! text-[#a6a6a6] hover:bg-[#404249]!"
              }`}
            >
              User Risk Profiles
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="grid grid-cols-6 gap-3">
            <ThreatCard measurementUnit={stats.totalThreats} color="#60cdff" message="Total Threats" />
            <ThreatCard measurementUnit={stats.unresolvedThreats} color="#ffa500" message="Unresolved" />
            <ThreatCard measurementUnit={stats.criticalThreats} color="#ff4b4b" message="Critical Threats" />
            <ThreatCard measurementUnit={stats.highRiskUsers} color="#ff4b4b" message="High-Risk Users" />
            <ThreatCard measurementUnit={stats.threatsByType.massDataRead} color="#3B82F6" message="Mass Data Read" />
            <ThreatCard measurementUnit={stats.threatsByType.offHoursAccess} color="#8B5CF6" message="Off-Hours Access" />
          </div>
        </div>

        <div className="h-4"></div>

        {isLoading && (
          <div className="text-center p-10">
            <div className="spinner"></div>
            <p className="text-gray-400 mt-4">Loading insider threats...</p>
          </div>
        )}

        {!isLoading && (
          <>
            {activeTab === "threats" && (
              <>
                <ThreatsTable
                  threats={threats}
                  onSelectThreat={handleSelectThreat}
                />
                {pagination && (
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    pageSize={pagination.limit}
                    totalItems={pagination.total}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                  />
                )}
              </>
            )}

            {activeTab === "users" && (
              <UserRiskTable
                profiles={userRiskProfiles}
                onSelectUser={handleSelectUser}
              />
            )}
          </>
        )}
      </div>

      {selectedThreatId !== null && (
        <ThreatDetailModal
          threatId={selectedThreatId}
          insiderThreatApi={insiderThreatApi}
          onClose={handleCloseThreatModal}
        />
      )}

      {selectedUserId !== null && (
        <UserRiskAnalysisModal
          userId={selectedUserId}
          insiderThreatApi={insiderThreatApi}
          onClose={handleCloseUserModal}
        />
      )}
    </>
  );
}