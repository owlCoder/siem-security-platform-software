import { FirewallLogDTO } from "../../types/firewall/FirewallLogDTO";

interface FirewallLogsTableProps {
    logs: FirewallLogDTO[];
}

export default function FirewallLogsTable({ logs }: FirewallLogsTableProps) {
    return (
        <div className="p-6 rounded-lg border-2 border-[#282A28] bg-[#1f2123] h-full w-full">
            <h3 className="text-white text-lg font-semibold mb-6 text-center">
                Firewall Logs
            </h3>

            <div className="overflow-auto w-full h-full">
                <table className="w-full table-fixed border-collapse text-sm">
                    <thead className="bg-[#2a2a2a]">
                        <tr>
                            <th className="w-1/5 px-4 py-2 text-white text-center border-b border-[#2d2d2d]">
                                IP Address
                            </th>
                            <th className="w-1/5 px-4 py-2 text-white text-center border-b border-[#2d2d2d]">
                                Port
                            </th>
                            <th className="w-1/5 px-4 py-2 text-white text-center border-b border-[#2d2d2d]">
                                Decision
                            </th>
                            <th className="w-1/5 px-4 py-2 text-white text-center border-b border-[#2d2d2d]">
                                Mode
                            </th>
                            <th className="w-1/5 px-4 py-2 text-white text-center border-b border-[#2d2d2d]">
                                Timestamp
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {logs.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="px-10 py-10 text-center text-[#a6a6a6] border-b border-[#2d2d2d]"
                                >
                                    No logs found
                                </td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr
                                    key={log.id}
                                    className="transition-colors duration-200 hover:bg-[#2a2a2a]"
                                >
                                    <td className="w-1/5 px-4 py-2 text-white text-center border-b border-[#2d2d2d] truncate">
                                        {log.ipAddress}
                                    </td>
                                    <td className="w-1/5 px-4 py-2 text-white text-center border-b border-[#2d2d2d] truncate">
                                        {log.port}
                                    </td>
                                    <td className="w-1/5 px-4 py-2 text-center border-b border-[#2d2d2d]">
                                        <button
                                            className={`bg-transparent border-0 p-0 text-sm font-semibold underline-offset-2 hover:underline pointer-events-none
                                                ${log.decision === "ALLOWED" ? "text-[#00ff88]" : "text-red-400"}`}
                                        >
                                            {log.decision}
                                        </button>
                                    </td>
                                    <td className="w-1/5 px-4 py-2 text-center border-b border-[#2d2d2d]">
                                        <button
                                            className="bg-transparent border-0 p-0 text-white text-sm font-semibold underline-offset-2 hover:underline pointer-events-none"
                                        >
                                            {log.mode}
                                        </button>
                                    </td>
                                    <td className="w-1/5 px-4 py-2 text-white text-center border-b border-[#2d2d2d] truncate">
                                        {log.createdAt ? new Date(log.createdAt).toLocaleString('sr-RS') : "-"}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}