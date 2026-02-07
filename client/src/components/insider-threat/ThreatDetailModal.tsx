import { useEffect, useState } from "react";
import { InsiderThreatDTO } from "../../models/insider-threat/InsiderThreatDTO";
import { IInsiderThreatAPI } from "../../api/insider-threat/IInsiderThreatAPI";
import { useAuth } from "../../hooks/useAuthHook";
import { PiX } from "react-icons/pi";

interface ThreatDetailModalProps {
  threatId: number;
  insiderThreatApi: IInsiderThreatAPI;
  onClose: () => void;
}

export default function ThreatDetailModal({
  threatId,
  insiderThreatApi,
  onClose,
}: ThreatDetailModalProps) {
  const { token: authToken } = useAuth();
  const [threat, setThreat] = useState<InsiderThreatDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");

  const getToken = () => {
    return authToken || localStorage.getItem("token");
  };

  useEffect(() => {
    loadThreatDetails();
  }, [threatId]);

  const loadThreatDetails = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        console.error("[ThreatDetailModal] No authentication token found");
        return;
      }
      const data = await insiderThreatApi.getThreatById(threatId, token);
      setThreat(data);
    } catch (error) {
      console.error("[ThreatDetailModal] Error loading threat details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!threat || threat.isResolved) return;

    setResolving(true);
    try {
      const token = getToken();
      if (!token) {
        console.error("[ThreatDetailModal] No authentication token found");
        return;
      }

      const resolvedBy = "Security Admin";
      await insiderThreatApi.resolveThreat(
        threatId,
        resolvedBy,
        resolutionNotes || undefined,
        token
      );
      
      await loadThreatDetails();
      setResolutionNotes("");
    } catch (error) {
      console.error("[ThreatDetailModal] Error resolving threat:", error);
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-[#1a1a1a] rounded-[16px] p-8 max-w-xl w-full mx-4">
          <div className="text-center">
            <div className="spinner"></div>
            <p className="text-gray-400 mt-4 text-[14px]">Loading threat details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!threat) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-[#1a1a1a] rounded-[16px] p-8 max-w-xl w-full mx-4">
          <div className="text-center text-red-400 text-[14px]">
            Failed to load threat details
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] rounded-[16px] p-6 max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
          <h2 className="text-[20px] font-semibold text-white">Threat Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <PiX size={24} />
          </button>
        </div>

        <div className="space-y-4 text-[14px]">
          <div>
            <div className="text-gray-400 mb-1">Threat ID</div>
            <div className="text-white">#{threat.id}</div>
          </div>

          <div>
            <div className="text-gray-400 mb-1">User ID</div>
            <div className="text-white">{threat.userId}</div>
          </div>

          <div>
            <div className="text-gray-400 mb-1">Threat Type</div>
            <div className="text-white">{threat.threatType.replace(/_/g, " ")}</div>
          </div>

          <div className="flex gap-8">
            <div>
              <div className="text-gray-400 mb-1">Risk Level</div>
              <div className="text-white">{threat.riskLevel}</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Status</div>
              <div className="text-white">{threat.isResolved ? "RESOLVED" : "ACTIVE"}</div>
            </div>
          </div>

          <div>
            <div className="text-gray-400 mb-1">Description</div>
            <div className="text-white">{threat.description}</div>
          </div>

          <div>
            <div className="text-gray-400 mb-1">Source</div>
            <div className="text-white">{threat.source}</div>
          </div>

          {threat.correlatedEventIds && threat.correlatedEventIds.length > 0 && (
            <div>
              <div className="text-gray-400 mb-1">Correlated Events ({threat.correlatedEventIds.length})</div>
              <div className="text-white">
                {threat.correlatedEventIds.map((id, index) => (
                  <span key={id}>
                    #{id}{index < threat.correlatedEventIds.length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>
            </div>
          )}

          {threat.ipAddress && (
            <div>
              <div className="text-gray-400 mb-1">IP Address</div>
              <div className="text-white font-mono">{threat.ipAddress}</div>
            </div>
          )}

          <div>
            <div className="text-gray-400 mb-1">Detected At</div>
            <div className="text-white">
              {new Date(threat.detectedAt).toLocaleString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>

          {threat.isResolved && (
            <>
              <div>
                <div className="text-gray-400 mb-1">Resolved By</div>
                <div className="text-white">{threat.resolvedBy}</div>
              </div>

              <div>
                <div className="text-gray-400 mb-1">Resolved At</div>
                <div className="text-white">
                  {threat.resolvedAt
                    ? new Date(threat.resolvedAt).toLocaleString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "N/A"}
                </div>
              </div>

              {threat.resolutionNotes && (
                <div>
                  <div className="text-gray-400 mb-1">Resolution Notes</div>
                  <div className="text-white">{threat.resolutionNotes}</div>
                </div>
              )}
            </>
          )}

          {!threat.isResolved && (
            <div className="pt-4 border-t border-gray-700">
              <div className="text-white font-semibold mb-3">Resolve Threat</div>
              <input
                type="text"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Resolution notes (optional)"
                className="w-full bg-[#2a2a2a] border border-gray-600 rounded-[8px] px-3 py-2 text-white text-[14px] mb-3 focus:outline-none focus:border-gray-500"
              />
              <button
                onClick={handleResolve}
                disabled={resolving}
                className="w-full bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2.5 rounded-[8px] font-semibold text-[14px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resolving ? "Resolving..." : " Resolve Threat"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}