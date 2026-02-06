import { useState } from "react";
import { PiWarningOctagonFill, PiCheckCircleFill, PiCaretDownBold, PiCaretUpBold } from "react-icons/pi";
import { AiFillRobot } from "react-icons/ai";
import { IncidentTableProps } from "../../types/props/status-monitor/IncidentTableProps";

export default function IncidentTable({ incidents }: IncidentTableProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const toggleRow = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const thClass = "px-4! py-3! text-center text-[#d0d0d0] font-semibold text-[13px] border-b border-[#3a3a3a] uppercase tracking-[0.5px]";
    const tdClass = "px-4! py-4! border-b border-[#2d2d2d] text-[#dcdcdc] text-[14px]";

    return (
        <div className="bg-transparent rounded-[14px] overflow-hidden border-2 border-[#282A28] mt-6!">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6! py-4! border-b-2 border-[#282A28] bg-transparent">
                <div className="flex items-center gap-2">
                    <PiWarningOctagonFill className="text-[#ff4b4b]" size={22} />
                    <span className="text-white text-[16px] font-semibold m-0">Recent Incidents</span>
                </div>
                <div className="text-[#888] text-[11px] font-semibold uppercase tracking-wider">
                    Live Monitoring
                </div>
            </div>

            <table className="w-full border-collapse text-left font-sans">
                <thead className="bg-[#2a2a2a]">
                    <tr>
                        <th className={`${thClass} w-[5%]`}></th>
                        <th className={`${thClass} text-left w-[20%]`}>Service</th>
                        <th className={`${thClass} text-left w-[20%]`}>Time</th>
                        <th className={`${thClass} text-left w-[35%]`}>Reason</th>
                        <th className={`${thClass} w-[10%]`}>Status</th>
                        <th className={`${thClass} w-[10%]`}>Analysis</th>
                    </tr>
                </thead>

                <tbody>
                    {incidents.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-10! py-12! text-center border-b border-[#2d2d2d] text-[#a6a6a6]">
                                <div className="flex flex-col items-center gap-2">
                                    <PiCheckCircleFill size={40} className="text-[#007a55] opacity-50" />
                                    <span>No active incidents. All systems operational.</span>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        incidents.map((incident) => {
                            const isExpanded = expandedId === incident.id;
                            const isResolved = !!incident.endTime;

                            return (
                                <>
                                    {/* Main Row */}
                                    <tr 
                                        key={incident.id}
                                        onClick={() => toggleRow(incident.id)}
                                        className={`cursor-pointer transition-colors duration-200 border-b border-[#2d2d2d] ${
                                            isExpanded ? "bg-[#2a2a2a]" : "hover:bg-[#2a2a2a]"
                                        }`}
                                    >
                                        <td className="px-4! py-4! text-center">
                                            {isResolved ? (
                                                <PiCheckCircleFill className="text-[#007a55]" size={22} />
                                            ) : (
                                                <PiWarningOctagonFill className="text-[#ff4b4b] animate-pulse" size={22} />
                                            )}
                                        </td>

                                        <td className={`${tdClass} font-bold text-white`}>
                                            {incident.serviceName}
                                        </td>

                                        <td className={tdClass}>
                                            {formatDate(incident.startTime)}
                                        </td>

                                        <td className={`${tdClass} text-[#b5b5b5]`}>
                                            {incident.reason}
                                        </td>

                                        <td className={tdClass}>
                                            <span
                                                className="px-2.5! py-1! rounded-[8px] text-[11px] font-bold border inline-block text-center min-w-[80px]"
                                                style={{
                                                    backgroundColor: isResolved 
                                                        ? "rgba(0, 122, 85, 0.15)" 
                                                        : "rgba(255, 75, 75, 0.15)",
                                                    color: isResolved ? "#007a55" : "#ff4b4b",
                                                    borderColor: isResolved 
                                                        ? "rgba(0, 122, 85, 0.3)" 
                                                        : "rgba(255, 75, 75, 0.3)",
                                                }}
                                            >
                                                {isResolved ? "RESOLVED" : "OPEN"}
                                            </span>
                                        </td>

                                        <td className="px-4! py-4! text-center text-[#dcdcdc]">
                                            {isExpanded ? <PiCaretUpBold /> : <PiCaretDownBold />}
                                        </td>
                                    </tr>

                                    {/* Expanded Row */}
                                    {isExpanded && (
                                        <tr className="bg-[#1a1a1a] border-b border-[#333]">
                                            <td colSpan={6} className="p-0">
                                                <div className="p-6! flex flex-col gap-4 border-l-4 border-[#7c3aed]">
                                                    
                                                    {/* AI Analysis */}
                                                    <div className="flex gap-4">
                                                        <div className="mt-1">
                                                            <div className="bg-[#2b2d31] p-2! rounded-full border border-[#444]">
                                                                <AiFillRobot className="text-[#a78bfa] text-2xl" />
                                                            </div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="text-[#a78bfa] text-[12px] font-bold uppercase mb-1! tracking-wider">
                                                                AI Correlation Analysis
                                                            </h4>
                                                            <p className="text-gray-300 text-[14px] leading-relaxed bg-[#252526] p-4! rounded-lg border border-[#333]">
                                                                {incident.correlationSummary || "Analysis is pending or not available for this incident."}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Technical Details */}
                                                    {incident.correlationRefs && (
                                                        <div className="ml-14! mt-2!">
                                                            <span className="text-[11px] text-gray-500 uppercase font-semibold tracking-wider">
                                                                Technical Context:
                                                            </span>
                                                            <code className="block mt-1! text-[11px] text-[#888] font-mono bg-[#111] p-2! rounded border border-[#222]">
                                                                {incident.correlationRefs}
                                                            </code>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}
