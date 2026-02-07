import { useEffect, useState } from "react";
import { BackupValidationResultDTO } from "../../models/backup/BackupValidationResultDTO";
import { BackupProps } from "../../types/props/backup/BackupProps";
import BackupStats from "../backup/BackupStats";
import { emptyBackupStats } from "../../constants/backupEmptyStats";
import BackupChart from "../backup/BackupChart";
import BackupLogsToolbar from "../backup/BackupLogsToolbar";
import BackupLogsTable from "../tables/backup/BackupLogsTable";
import { BackupValidationLogDTO } from "../../models/backup/BackupValidationLogDTO";
import BackupValidationButton from "../backup/BackupValidationButton";
import { useAuth } from "../../hooks/useAuthHook";

export default function Backup({ backupApi }: BackupProps) {
    const [stats, setStats] = useState<BackupValidationResultDTO | null>(null);

    const [allLogs, setAllLogs] = useState<BackupValidationLogDTO[]>([]);
    const [logs, setLogs] = useState<BackupValidationLogDTO[]>([]);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                const summary = await backupApi.getSummary(token!);
                const logsResponse = await backupApi.getAllLogs(token!);

                setStats(summary);
                setAllLogs(logsResponse ?? []);
                setLogs(logsResponse ?? []);
            } catch (err) {
                console.error("Failed to load backup summary:", err);
                setError("Failed to load backup statistics");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        let result = allLogs;

        if (status) {
            result = result.filter(l => l.status === status);
        }

        if (search) {
            result = result.filter(l => l.errorMessage?.toLowerCase().includes(search.toLowerCase()));
        }

        setLogs(result);
    }, [search, status, allLogs]);

    const handleReset = () => {
        setSearch("");
        setStatus("");
        setLogs(allLogs);
    };

    return (
        <div className="border-2 border-[#282A28] bg-transparent rounded-[10px]!">
            <h2 className="mt-[3px]! p-[5px]! m-[10px]!">Backup</h2>

            <div className="flex justify-end me-[10px]! mb-2!">
                <div className={`flex w-[180px]! items-center gap-2 px-3! py-1.5! rounded-[8px] text-[12px] font-semibold
                    ${!isLoading
                        ? "bg-[rgba(74,222,128,0.15)] text-[$4ade80] border border-[rgba(74,222,128,0.3)]"
                        : "bg-[rgba(239,68,68,0.15)] text-[#f87171] border border-[rgba(239,68,68,0.3)]"
                    }`}>
                    <div className={`w-2 h-2 rounded-[14px]! ${!isLoading ? "bg-[#4ade80] animate-pulse" : "bg-[#f87171] animate-none"}`}></div>
                    {!isLoading ? "Live Updates Active" : "Connecting..."}
                </div>
            </div>

            {error && (
                <div className="text-center p-4 text-red-400">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                <div className="xl:col-span-2 flex flex-col rounded-lg border-2 border-[#282A28] bg-[#1f2123] p-6">
                    <BackupStats stats={stats ?? emptyBackupStats} />
                </div>

                <div className="flex flex-col min-h-[300px] rounded-lg border-2 border-[#282A28] bg-[#1f2123] p-3">
                    <BackupChart data={{
                        success: stats?.successRuns ?? 0,
                        failed: stats?.failedRuns ?? 0
                    }} />
                    <BackupValidationButton
                        backupApi={backupApi}
                        onSuccess={async () => {
                            const summary = await backupApi.getSummary(token!);
                            const logsResponse = await backupApi.getAllLogs(token!);
                            setStats(summary);
                            setAllLogs(logsResponse ?? []);
                            setLogs(logsResponse ?? []);
                        }}
                    />
                </div>

                <div className="flex flex-col min-h-[300px] rounded-lg border-2 border-[#282A28] bg-[#1f2123] p-3">
                    <BackupLogsToolbar
                        onSort={(sortType: number) => {
                            let sortedLogs = [...logs];
                            switch (sortType) {
                                case 1:
                                    sortedLogs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                                    break;
                                case 2:
                                    sortedLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                                    break;
                                case 3:
                                    sortedLogs.sort((a, b) => a.status.localeCompare(b.status));
                                    break;
                                case 4:
                                    sortedLogs.sort((a, b) => b.status.localeCompare(a.status));
                                    break;
                                default:
                                    break;
                            }
                            setLogs(sortedLogs);
                        }}
                        onReset={handleReset}
                    />

                    <div className="mt-3">
                        <BackupLogsTable logs={logs} />
                    </div>
                </div>
            </div>
        </div>
    )
}