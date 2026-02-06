import { MdCheckCircle, MdError, MdHistory } from "react-icons/md";
import StatCard from "../stat_card/StatCard";
import { BackupStatsProps } from "../../types/props/backup/BackupStatsProps";

export default function BackupStats({ stats }: BackupStatsProps) {
    return(
        <div className="grid grid-cols-12 gap-5 p-[10px]!">
            <div className="col-span-3">
                <StatCard
                    title="Total runs"
                    value={stats.totalRuns}
                    icon={<MdHistory />}
                    iconColor="#60cdff"
                />
            </div>

            <div className="col-span-3">
                <StatCard
                    title="Successful"
                    value={stats.successRuns}
                    icon={<MdCheckCircle />}
                    iconColor="#4ade80"
                />
            </div>

            <div className="col-span-3">
                <StatCard
                    title="Failed"
                    value={stats.failedRuns}
                    icon={<MdError />}
                    iconColor="#f87171"
                />
            </div>

            <div className="col-span-3">
                <StatCard
                    title="Last check"
                    value={stats.lastCheckAt ? new Date(stats.lastCheckAt).toLocaleString() : "-"}
                />
            </div>
        </div>
    );
}