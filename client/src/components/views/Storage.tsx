import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuthHook";
import { StorageLogResponseDTO } from "../../models/storage/StorageLogResponseDTO";
import { ArchiveStatsDTO } from "../../models/storage/ArchiveStatsDTO";
import StorageStats from "../storage/StorageStats";
import StorageTable from "../tables/StorageTable";
import StorageToolBar from "../storage/StorageToolbar";
import { ArchiveDTO } from "../../models/storage/ArchiveDTO";
import { StorageProps } from "../../types/props/storage/StorageProps";



export default function Storage({storageApi}:StorageProps) {

    const { token } = useAuth();
    const [archives, setArchives] = useState<ArchiveDTO[]>([]);
    const [stats, setStats] = useState<ArchiveStatsDTO | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const EMPTY_STATS: ArchiveStatsDTO = {
        totalSize: 0,
        retentionHours: 72,
        lastArchiveName: "No archives"
    };

    const mapToArchiveDTO = (data: StorageLogResponseDTO[]): ArchiveDTO[] =>
        data.map(a => ({
            id: a.storageLogId,
            fileName: a.fileName,
            recordCount: a.recordCount,
            fileSize: a.fileSize,
            createdAt: a.createdAt,
            downloadUrl: `${import.meta.env.VITE_GATEWAY_URL}/storageLog/file/${a.storageLogId}`
        }));

    useEffect(() => {
        // if(!token)
        //     return;

        const fetchStorageData = async () => {
            try {
                setIsLoading(true);

                const archivesResponse = await storageApi.getAllArchives(/*token*/);
                console.log("ARCHIVES RESPONSE: ", archivesResponse);
                const statsResponse = await storageApi.getStats(/*token*/);

                setArchives(mapToArchiveDTO(archivesResponse));
                setStats(statsResponse ?? EMPTY_STATS);
            } catch (err) {
                console.error(err);
                setError("Failed to load storageData");
            } finally {
                setIsLoading(false);
            }
        };
        fetchStorageData();
    }, [token]);

    const handleSearchArchives = async (query: string) => {
        //if (!token) return;

        try {
            const data = await storageApi.searchArchives(/*token,*/ query);
            setArchives(mapToArchiveDTO(data));
        } catch (err) {
            console.error(err);
        }
    }

    const handleSortArchives = async (by: "date" | "size" | "name", order: "asc" | "desc") => {
        //if (!token) return;

        try {
            const data = await storageApi.sortArchives(/*token,*/ by, order);
            setArchives(mapToArchiveDTO(data));
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="border-2 border-[#282A28] bg-transparent rounded-[10px]!">
            <h2 className="mt-[3px]! p-[5px]! m-[10px]!">Storage</h2>

            <div className="flex justify-end me-[10px]!" >
                <div className={`flex w-[150px]! items-center gap-2 px-3! py-1.5! rounded-[8px] text-[12px] font-semibold
            ${!isLoading
                        ? "bg-[rgba(74,222,128,0.15)] text-[#4ade80] border border-[rgba(74,222,128,0.3)]"
                        : "bg-[rgba(239,68,68,0.15)] text-[#f87171] border border-[rgba(239,68,68,0.3)]"
                    }`}>
                    <div
                        className={`w-2 h-2 rounded-[14px]! ${!isLoading ? "bg-[#4ade80] animate-pulse" : "bg-[#f87171] animate-none"}`}
                    ></div>
                    {!isLoading ? "Live Updates Active" : "Connecting..."}
                </div>

            </div>

            <StorageStats stats={stats ?? EMPTY_STATS} />

            <div className="my-4!">
                <StorageToolBar onSearch={handleSearchArchives} onSort={handleSortArchives} />
            </div>

            {isLoading && (
                <div className="text-center p-10!">
                    <div className="spinner"></div>
                </div>
            )}

            {error && !isLoading && (
                <div className="text-center p-6! text-red-400">
                    {error}
                </div>
            )}

            {!isLoading && !error && (
                <div className="p-[10px]!">
                    <StorageTable archives={archives} storageApi={storageApi} />
                </div>
            )}
        </div>
    );
}