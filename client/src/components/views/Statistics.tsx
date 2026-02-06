import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuthHook";
import { DistributionDTO } from "../../models/query/DistributionDTO";
import { TopArchiveDTO } from "../../models/storage/TopArchiveDTO";
import { ArchiveVolumeDTO } from "../../models/storage/ArchiveVolumeDTO";

import StatisticsChart from "../statistics/StatisticsChart";
import EventDistribution from "../statistics/EventDistribution";
import TopArchives from "../statistics/TopArchives";
import ArchiveVolume from "../statistics/ArchiveVolume";
import { StatisticsProps } from "../../types/props/statistics/StatisticsProps";
import { HourlyStatisticsDTO } from "../../models/query/HourlyStatisticsDTO";

export default function Statistics({ queryApi, storageApi }: StatisticsProps) {
    /* =======================
       STATE & EFFECTS
       ======================= */

    const { token } = useAuth();
    const [archiveType, setArchiveType] = useState<"events" | "alerts">("events");
    const [volumePeriod, setVolumePeriod] = useState<
        "daily" | "monthly" | "yearly"
    >("daily");

    const [eventStats, setEventStats] = useState<HourlyStatisticsDTO[]>([]);
    const [alertStats, setAlertStats] = useState<HourlyStatisticsDTO[]>([]);
    const [distribution, setDistribution] = useState<DistributionDTO | null>(null);
    const [topArchives, setTopArchives] = useState<TopArchiveDTO[]>([]);
    const [archiveVolume, setArchiveVolume] = useState<ArchiveVolumeDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            //if (!token) return;

            setIsLoading(true);

            try {
                const results = await Promise.allSettled([
                    queryApi.getEventStatistics(token!),
                    queryApi.getAlertStatistics(token!),
                    queryApi.getEventDistribution(token!),
                    storageApi.getTopArchives(token!, archiveType, 5),
                    storageApi.getArchiveVolume(token!, volumePeriod),
                ]);

                const [
                    eventsRes,
                    alertsRes,
                    distRes,
                    topRes,
                    volumeRes,
                ] = results;

                console.log("Event stats ", eventStats);
                console.log("VOLUME RES ", volumeRes);
                console.log("Dist RES ", distRes);
                if (eventsRes.status === "fulfilled") setEventStats(eventsRes.value);
                else console.error("getEventStatistics failed:", eventsRes.reason);

                if (alertsRes.status === "fulfilled") setAlertStats(alertsRes.value);
                else console.error("getAlertStatistics failed:", alertsRes.reason);

                if (distRes.status === "fulfilled") setDistribution(distRes.value);
                else console.error("getEventDistribution failed:", distRes.reason);



                if (topRes.status === "fulfilled") setTopArchives(topRes.value);
                else console.error("getTopArchives failed:", topRes.reason);

                if (volumeRes.status === "fulfilled") setArchiveVolume(volumeRes.value);
                else console.error("getArchiveVolume failed:", volumeRes.reason);

            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [token, archiveType, volumePeriod, queryApi, storageApi]);

    /* =======================
       RENDER
       ======================= */

    return (
        <div className="p-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">

                {/*Statistics*/}
                <div className="flex flex-col min-h-[380px] rounded-lg border-2 border-[#282A28] bg-[#1f2123] p-6">
                    <StatisticsChart
                        eventData={eventStats}
                        alertData={alertStats} />
                </div>

                {/*Top Archives*/}
                <div className="flex flex-col min-h-[380px] rounded-lg border-2 border-[#282A28] bg-[#1f2123] p-6">
                    <TopArchives
                        data={topArchives}
                        type={archiveType}
                        onTypeChange={setArchiveType} />
                </div>

                {/*Event Distribution*/}
                <div className="flex flex-col min-h-[380px] rounded-lg border-2 border-[#282A28] bg-[#1f2123] p-6">
                    <EventDistribution
                        data={distribution ?? { notifications: 0, warnings: 0, errors: 0 }} />
                </div>

                {/*Archive Volume*/}
                <div className="flex flex-col min-h-[380px] rounded-lg border-2 border-[#282A28] bg-[#1f2123] p-6">
                    <ArchiveVolume
                        data={archiveVolume}
                        period={volumePeriod}
                        onPeriodChange={setVolumePeriod} />
                </div>

            </div>
        </div>
    );
}

