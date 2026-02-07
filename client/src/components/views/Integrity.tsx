import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuthHook";
import { IIntegrityAPI } from "../../api/integrity/IIntegrityAPI";
import { IntegrityStatusDTO } from "../../models/integrity/IntegrityStatusDTO";
import IntegrityStatusCard from "../integrity/IntegrityStatusCard";

interface IntegrityProps {
    integrityApi: IIntegrityAPI;
    queryApi: any;
}

export default function Integrity({ integrityApi, queryApi }: IntegrityProps) {
    const { token: authToken } = useAuth();

    const [status, setStatus] = useState<IntegrityStatusDTO | null>(null);
    const [compromisedLogs, setCompromisedLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [allEvents, setAllEvents] = useState<any[]>([]);
    const [showOnlyErrors, setShowOnlyErrors] = useState<boolean>(false);

    const handleRunAudit = async () => {
        if (!authToken) return;

        try {
            setIsLoading(true);
            setCompromisedLogs([]);
            setAllEvents([]);

            const rawRes: any = await integrityApi.verifyLogs(authToken);
            const res = rawRes.response || rawRes;

            try {
                const eventsRes = await queryApi.getEventsByQuery("", authToken, 1, 2000);
                if (eventsRes && eventsRes.data) {
                    const sortedData = [...eventsRes.data].sort((a, b) => Number(b.id) - Number(a.id));
                    setAllEvents(sortedData);
                }
            } catch (e) {
                console.error("Greška pri učitavanju tabele:", e);
            }

            setStatus({
                isChainValid: res.isChainValid,
                totalLogsChecked: res.totalLogsChecked || 0,
                lastChecked: new Date(),
                compromisedSegmentsCount: res.isChainValid ? 0 : (res.compromisedSegmentsCount || 0)
            });

            if (res.isChainValid === false) {
                const realCompromisedRaw: any = await integrityApi.getCompromisedLogs(authToken);
                const logs = Array.isArray(realCompromisedRaw)
                    ? realCompromisedRaw
                    : (realCompromisedRaw.response || []);
                setCompromisedLogs(logs);
            }

        } catch (err) {
            console.error("Audit neuspešan:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (authToken) {
            void handleRunAudit();
        }
    }, [authToken]);

    const isRowCompromised = (ev: any) => {
        return compromisedLogs.some(log => {
            const badId = log?.event?.id || log?.id || log;
            return String(badId) === String(ev.id);
        });
    };

    const displayedEvents = [...allEvents]
        .sort((a, b) => {
            const aComp = isRowCompromised(a);
            const bComp = isRowCompromised(b);

            if (aComp && !bComp) return -1;
            if (!aComp && bComp) return 1;

            return Number(b.id) - Number(a.id);
        })
        .filter(ev => showOnlyErrors ? isRowCompromised(ev) : true);

    return (
        <div className="p-6 flex flex-col gap-3">
            <div className="flex flex-col justify-center items-center min-h-[180px] rounded-lg border-2 border-[#282A28] bg-[#1f2123] p-6">
                <div className="w-full flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-white tracking-tight">
                        Blockchain Integrity Control
                    </h2>

                    <div
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all
                        ${status?.isChainValid !== false
                                ? "bg-green-500/10 text-green-500 border border-green-500/20"
                                : "bg-red-500/10 text-red-500 border border-red-500/20"
                            }`}
                    >
                        <div
                            className={`w-2 h-2 rounded-full ${isLoading
                                ? "bg-yellow-400 animate-pulse"
                                : status?.isChainValid !== false
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                        ></div>
                        {isLoading
                            ? "Running Audit..."
                            : status?.isChainValid !== false
                                ? "System Secure"
                                : "Integrity Breach"}
                    </div>
                </div>

                <IntegrityStatusCard
                    status={status}
                    onVerify={handleRunAudit}
                    loading={isLoading}
                />
            </div>

            <div className="flex flex-col h-[600px] rounded-lg border-2 border-[#282A28] bg-[#1f2123]">
                <div className="flex justify-between items-center bg-[#1f2123] px-6 py-4 border-b border-[#282A28]">
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                            Live Database Feed
                        </span>
                        <button
                            onClick={() => setShowOnlyErrors(!showOnlyErrors)}
                            className={`text-xs px-3 py-1 rounded border font-bold transition-all
                            ${showOnlyErrors
                                    ? "bg-red-500 border-red-600 text-white"
                                    : "bg-transparent border-gray-600 text-gray-400 hover:border-white"
                                }`}
                        >
                            {showOnlyErrors
                                ? "Showing Only Breaches"
                                : "Filter Breaches"}
                        </button>
                    </div>
                    <span className="text-xs text-blue-400 font-mono italic">
                        Syncing {allEvents.length} records...
                    </span>
                </div>

                <div className="flex-1 overflow-auto px-2">
                    <table className="w-full table-fixed border-collapse text-sm">
                        <thead className="bg-[#2a2a2a] sticky top-0 z-10">
                            <tr>
                                <th className="w-1/5 px-4 py-3 text-white text-center border-b border-[#2d2d2d]">
                                    ID
                                </th>
                                <th className="w-1/5 px-4 py-3 text-white text-center border-b border-[#2d2d2d]">
                                    Timestamp
                                </th>
                                <th className="w-1/5 px-4 py-3 text-white text-center border-b border-[#2d2d2d]">
                                    Type
                                </th>
                                <th className="w-1/5 px-4 py-3 text-white text-center border-b border-[#2d2d2d]">
                                    Integrity
                                </th>
                                <th className="w-1/5 px-4 py-3 text-white text-center border-b border-[#2d2d2d]">
                                    Digital Signature
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {displayedEvents.length === 0 && !isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-10 py-12 text-center text-[#a6a6a6] border-b border-[#2d2d2d]">
                                        No database records found
                                    </td>
                                </tr>
                            ) : (
                                displayedEvents.map((ev, i) => {
                                    const compromised = isRowCompromised(ev);
                                    return (
                                        <tr key={ev.id || i} className="transition-colors duration-200 hover:bg-[#2a2a2a]">
                                            <td className={`px-4 py-3 text-center font-semibold truncate border-b border-[#2d2d2d] ${compromised ? "text-red-400" : "text-white"}`}>
                                                #{ev.id} {compromised && "⚠️"}
                                            </td>
                                            <td className="px-4 py-3 text-center text-white truncate border-b border-[#2d2d2d]">
                                                {ev.timestamp ? new Date(ev.timestamp).toLocaleString("sr-RS") : "---"}
                                            </td>
                                            <td className={`px-4 py-3 text-center truncate border-b border-[#2d2d2d] ${compromised ? "text-red-400" : "text-gray-400"}`}>
                                                {ev.eventType || "LOG"}
                                            </td>
                                            <td className="px-4 py-3 text-center font-semibold border-b border-[#2d2d2d]">
                                                {compromised ? (
                                                    <span className="text-red-500 animate-pulse">CORRUPTED</span>
                                                ) : (
                                                    <span className="text-green-500 opacity-70">VERIFIED</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center font-mono truncate text-gray-400 max-w-[200px] border-b border-[#2d2d2d]">
                                                {ev.hash || "0x00000000000"}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}