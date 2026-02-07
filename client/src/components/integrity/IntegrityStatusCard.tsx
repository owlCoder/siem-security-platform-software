import { FiShield, FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import { IntegrityStatusCardProps } from "../../types/props/integrity/IntegrityStatusCardProps";

export default function IntegrityStatusCard({ status, onVerify, loading }: IntegrityStatusCardProps) {
    const isSecure = status?.isChainValid;

    return (
        <div className="w-full flex flex-col gap-4">
            <div className="flex flex-col md:flex-row items-center justify-between w-full gap-6">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                        className={`p-4 rounded-xl flex-shrink-0 flex justify-center items-center ${isSecure
                            ? "bg-green-500/10 text-green-500"
                            : "bg-red-500/10 text-red-500"
                            }`}
                    >
                        {isSecure ? <FiShield size={28} /> : <FiAlertTriangle size={28} />}
                    </div>

                    <div className="truncate">
                        <h3 className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                            Blockchain Integrity
                        </h3>
                        <div className={`text-lg font-bold truncate ${isSecure ? "text-green-500" : "text-red-500"
                            }`}>
                            {loading ? "Verifying..." : isSecure ? "System Consistent" : "Integrity Breach Detected"}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap md:flex-nowrap items-center gap-6">
                    <div className="text-center md:text-right">
                        <label className="block text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                            Total Logs Checked
                        </label>
                        <span className="text-[#dcdcdc] font-mono text-sm font-medium">
                            {status?.totalLogsChecked || 0}
                        </span>
                    </div>

                    <div className="text-center md:text-center md:border-l border-[#3a3a3a] md:pl-6">
                        <label className="block text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                            Last Check
                        </label>
                        <span className="ml-3! text-[#dcdcdc] font-mono text-sm font-medium">
                            {status?.lastChecked ? new Date(status.lastChecked).toLocaleString("en-GB") : "Never Checked"}
                        </span>
                    </div>

                    <button
                        onClick={onVerify}
                        disabled={loading}
                        className="bg-[#007a55] hover:bg-[#008b65] text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        <FiRefreshCw className={loading ? "animate-spin" : ""} />
                        Run Audit
                    </button>
                </div>
            </div>
        </div>
    );
}