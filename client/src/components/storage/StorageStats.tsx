//za gornje kartice, koristice se statcard

import { ArchiveStatsDTO } from "../../models/storage/ArchiveStatsDTO"
import StatCard from "../stat_card/StatCard";

type Props = {
    stats: ArchiveStatsDTO;
}

export default function StorageStats({stats} : Props){
    return (
        <div style={{display: "flex", gap: "16px",padding:"5px"}}>
            <StatCard
                title="Total archive size"
                value= { stats.totalSize }    
            />

            <StatCard 
                title="Retency Policy"
                value={stats.retentionHours}
            />

            <StatCard 
                title="Last archive"
                subtitle={stats.lastArchiveName ?? "-"}
            />

        </div>
    );
}