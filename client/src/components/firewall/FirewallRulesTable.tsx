import { useState } from "react";
import { FirewallRuleDTO } from "../../types/firewall/FirewallRuleDTO";

interface FirewallRulesTableProps {
    rules: FirewallRuleDTO[];
    deleteRule: (id: number) => Promise<void>;
}

export default function FirewallRulesTable({ rules, deleteRule }: FirewallRulesTableProps) {
    const [loadingIds, setLoadingIds] = useState<number[]>([]);

    const handleDelete = async (id: number) => {
        setLoadingIds((prev) => [...prev, id]);
        try {
            await deleteRule(id);
        } catch (err) {
            console.error("Failed to delete rule", err);
        } finally {
            setLoadingIds((prev) => prev.filter((lid) => lid !== id));
        }
    };

    return (
        <div className="p-6 rounded-lg border-2 border-[#282A28] bg-[#1f2123] h-full w-full">
            <h3 className="text-white text-lg font-semibold mb-6 text-center">
                Firewall Rules
            </h3>

            <div className="overflow-auto w-full h-full">
                <table className="w-full table-fixed border-collapse text-sm">
                    <thead className="bg-[#2a2a2a]">
                        <tr>
                            <th className="w-1/3 px-4 py-2 text-white text-center border-b border-[#2d2d2d]">
                                IP Address
                            </th>
                            <th className="w-1/3 px-4 py-2 text-white text-center border-b border-[#2d2d2d]">
                                Port
                            </th>
                            <th className="w-1/3 px-4 py-2 text-white text-center border-b border-[#2d2d2d]">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {rules.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={3}
                                    className="px-10 py-10 text-center text-[#a6a6a6] border-b border-[#2d2d2d]"
                                >
                                    No rules found
                                </td>
                            </tr>
                        ) : (
                            rules.map((rule) => {
                                const isLoading = loadingIds.includes(rule.id);
                                return (
                                    <tr
                                        key={rule.id}
                                        className="transition-colors duration-200 hover:bg-[#2a2a2a]"
                                    >
                                        <td className="w-1/3 px-4 py-2 text-white text-center border-b border-[#2d2d2d] truncate">
                                            {rule.ipAddress}
                                        </td>
                                        <td className="w-1/3 px-4 py-2 text-white text-center border-b border-[#2d2d2d] truncate">
                                            {rule.port}
                                        </td>
                                        <td className="w-1/3 px-4 py-2 text-center border-b border-[#2d2d2d]">
                                            <button
                                                onClick={() => handleDelete(rule.id)}
                                                disabled={isLoading}
                                                className={`bg-transparent border-0 p-0 text-red-400 text-sm font-semibold underline-offset-2 hover:underline ${isLoading ? "cursor-not-allowed opacity-60" : ""
                                                    }`}
                                            >
                                                {isLoading ? "Deleting..." : "Delete"}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}