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
  <div
    className="fixed inset-0 bg-black/30 backdrop-blur-lg flex justify-center items-center z-[1000]"
    onClick={onClose}
  >
    <div
      className="bg-[#1f1f1f] rounded-2xl w-[90%] max-w-[700px] max-h-[100vh] overflow-auto 
                 border border-[#333] shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-5 border-b border-[#333] bg-[#2a2a2a] rounded-t-2xl">
        <div></div>
        <h2 className="m-0 text-xl text-white ml-12!">Threat Details</h2>
        <button
          onClick={onClose}
          className="bg-transparent border-none cursor-pointer text-white text-2xl p-0 flex items-center"
        >
          <PiX />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col p-3! gap-4 text-sm">

        {/* Threat ID */}
        <div>
          <label className="block text-gray-400 mb-1">Threat ID</label>
          <div className="text-white font-mono">#{threat.id}</div>
        </div>

        {/* User ID */}
        <div>
          <label className="block text-gray-400 mb-1">User ID</label>
          <div className="text-white">{threat.userId}</div>
        </div>

        {/* Threat Type */}
        <div>
          <label className="block text-gray-400 mb-1">Threat Type</label>
          <div className="text-white">{threat.threatType.replace(/_/g, " ")}</div>
        </div>

        {/* Risk & Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 mb-1">Risk Level</label>
            <span className="inline-block px-3 py-1 rounded-full text-red-400 font-semibold">
              {threat.riskLevel}
            </span>
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Status</label>
            <span
              className={`inline-block px-3 py-1 rounded-full font-semibold ${
                threat.isResolved
                  ?  "text-green-400"
                  : " text-yellow-400"
              }`}
            >
              {threat.isResolved ? "RESOLVED" : "ACTIVE"}
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-400 mb-1">Description</label>
          <div className="text-white leading-relaxed">{threat.description}</div>
        </div>

        {/* Source */}
        <div>
          <label className="block text-gray-400 mb-1">Source</label>
          <div className="text-white">{threat.source}</div>
        </div>

        {/* Correlated Events */}
        {threat.correlatedEventIds?.length > 0 && (
          <div>
            <label className="block text-gray-400 mb-1">
              Correlated Events ({threat.correlatedEventIds.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {threat.correlatedEventIds.map((id) => (
                <span
                  key={id}
                  className="px-2 py-1 text-white font-mono bg-[#2a2a2a] rounded-md"
                >
                  #{id}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* IP */}
        {threat.ipAddress && (
          <div>
            <label className="block text-gray-400 mb-1">IP Address</label>
            <div className="text-white font-mono">{threat.ipAddress}</div>
          </div>
        )}

        {/* Detected At */}
        <div>
          <label className="block text-gray-400 mb-1">Detected At</label>
          <div className="text-white">
            {new Date(threat.detectedAt).toLocaleString()}
          </div>
        </div>

        {/* Resolution */}
        {threat.isResolved && (
          <>
            <div>
              <label className="block text-gray-400 mb-1">Resolved By</label>
              <div className="text-white">{threat.resolvedBy}</div>
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Resolved At</label>
              <div className="text-white">
                {threat.resolvedAt
                  ? new Date(threat.resolvedAt).toLocaleString()
                  : "N/A"}
              </div>
            </div>

            {threat.resolutionNotes && (
              <div>
                <label className="block text-gray-400 mb-1">Resolution Notes</label>
                <div className="text-white">{threat.resolutionNotes}</div>
              </div>
            )}
          </>
        )}

        {/* Resolve Section */}
        {!threat.isResolved && (
          <div className="mt-2! pt-5 border-t border-[#333]">
            <h3 className="text-base text-center mt-2! text-white">Resolve Threat</h3>

            <input
              type="text"
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Resolution notes (optional)"
              className="w-full px-3 py-2 mb-3 rounded-lg border border-gray-700 bg-[#2a2a2a] text-white text-sm"
            />

            <button
              onClick={handleResolve}
              disabled={resolving}
              className="w-full mt-2! rounded-lg bg-[#007a55] hover:bg-[#059669]
                         text-white font-semibold transition disabled:opacity-50"
            >
              {resolving ? "Resolving..." : "✓ Resolve Threat"}
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);

}