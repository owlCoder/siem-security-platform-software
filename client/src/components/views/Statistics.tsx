import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuthHook";
import { EventStatisticsDTO } from "../../models/query/EventStatisticsDTO";
import { AlertStatisticsDTO } from "../../models/query/AlertStatisticsDTO";
import { DistributionDTO } from "../../models/query/DistributionDTO";
import { TopArchiveDTO } from "../../models/storage/TopArchiveDTO";
import { ArchiveVolumeDTO } from "../../models/storage/ArchiveVolumeDTO";

import StatisticsChart from "../statistics/StatisticsChart";
import EventDistribution from "../statistics/EventDistribution";
import TopArchives from "../statistics/TopArchives";
import ArchiveVolume from "../statistics/ArchiveVolume";
import { StatisticsProps } from "../../types/props/statistics/StatisticsProps";

export default function Statistics({ queryApi, storageApi }: StatisticsProps) {
    /* =======================
       TEST DATA 
       ======================= */

    const testData: DistributionDTO = {
        notifications: 35,
        warnings: 35,
        errors: 30,
    };

    const testEvent: EventStatisticsDTO[] = [
        { date: "10/12", count: 10 },
        { date: "11/12", count: 15 },
        { date: "12/12", count: 7 },
        { date: "13/12", count: 12 },
        { date: "14/12", count: 9 },
    ];

    const testAlert: AlertStatisticsDTO[] = [
        { date: "10/12", count: 8 },
        { date: "11/12", count: 5 },
        { date: "12/12", count: 13 },
        { date: "13/12", count: 7 },
        { date: "14/12", count: 6 },
    ];

    const testTopArchives: TopArchiveDTO[] = [
        { id: 1, fileName: "logs_2025_12_14_22_00.tar", count: 120 },
        { id: 2, fileName: "auth_logs_2025_12_14.tar", count: 95 },
        { id: 3, fileName: "system_events_2025_12_13.tar", count: 78 },
        { id: 4, fileName: "app_errors_2025_12_12.tar", count: 54 },
        { id: 5, fileName: "network_2025_12_11.tar", count: 33 },
    ];

    const testArchiveVolume: ArchiveVolumeDTO[] = [
        { label: "10/12", size: 1024 },
        { label: "11/12", size: 850 },
        { label: "12/12", size: 1200 },
        { label: "13/12", size: 640 },
        { label: "14/12", size: 980 },
    ];

    /* =======================
       STATE & EFFECTS
       ======================= */

    const { token } = useAuth();

    const [archiveType, setArchiveType] = useState<"events" | "alerts">("events");
    const [volumePeriod, setVolumePeriod] = useState<
        "daily" | "monthly" | "yearly"
    >("daily");

    const [eventStats, setEventStats] = useState<EventStatisticsDTO[]>([]);
    const [alertStats, setAlertStats] = useState<AlertStatisticsDTO[]>([]);
    const [distribution, setDistribution] = useState<DistributionDTO | null>(null);
    const [topArchives, setTopArchives] = useState<TopArchiveDTO[]>([]);
    const [archiveVolume, setArchiveVolume] = useState<ArchiveVolumeDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;

            setIsLoading(true);

            try {
                const [
                    eventsData,
                    alertsData,
                    distributionData,
                    topArchivesData,
                    volumeData,
                ] = await Promise.all([
                    queryApi.getEventStatistics(token),
                    queryApi.getAlertStatistics(token),
                    queryApi.getEventDistribution(token),
                    storageApi.getTopArchives(token, archiveType, 5),
                    storageApi.getArchiveVolume(token, volumePeriod),
                ]);

                setEventStats(eventsData);
                setAlertStats(alertsData);
                setDistribution(distributionData);
                setTopArchives(topArchivesData);
                setArchiveVolume(volumeData);
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
        <div className="w-full p-6 space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">
                Statistics
            </h2>

            {/* TOP ROW */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="flex flex-col min-h-[380px] p-4 rounded-lg border-2 border-[#282A28]">
                    <StatisticsChart
                        eventData={testEvent}
                        alertData={testAlert}
                    />
                </div>

                <div className="flex flex-col min-h-[380px] p-4 rounded-lg border-2 border-[#282A28]">
                    <TopArchives
                        data={testTopArchives}
                        type={archiveType}
                        onTypeChange={setArchiveType}
                    />
                </div>
            </div>

            {/* BOTTOM ROW */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="flex flex-col min-h-[380px] p-4 rounded-lg border-2 border-[#282A28]">
                    <EventDistribution data={testData} />
                </div>

                <div className="flex flex-col min-h-[380px] p-4 rounded-lg border-2 border-[#282A28]">
                    <ArchiveVolume
                        data={testArchiveVolume}
                        period={volumePeriod}
                        onPeriodChange={setVolumePeriod}
                    />
                </div>
            </div>
        </div>
    );
}
