import { useEffect, useState } from "react";
import { StorageAPI } from "../../api/storage/StorageAPI";
import { useAuth } from "../../hooks/useAuthHook";
import { ArchiveDTO } from "../../models/storage/ArchiveDTO";
import { ArchiveStatsDTO } from "../../models/storage/ArchiveStatsDTO";
import StorageStats from "../storage/StorageStats";
import StorageTable from "../tables/StorageTable";


const storageAPI = new StorageAPI();

export default function Storage() {

    const { token } = useAuth();

    const [archives, setArchives] = useState<ArchiveDTO[]>([]);
    const [stats, setStats] = useState<ArchiveStatsDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if(!token) return;

        const fetchData = async () => {
            setIsLoading(true);

            try{
                const [archivesData, statsData] = await Promise.all([
                    storageAPI.getAllArchives(),
                    storageAPI.getStats()
                ]);

                setArchives(archivesData);
                setStats(statsData);
            } catch (err) {
                //console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [token]);

    //if(isLoading) return <div>Loading storage...</div>

    return (
        <>
            {stats && <StorageStats stats={stats}/>}
            {/* <StorageTable archives={archives}/> */}
        </>
    );
}