import { useEffect, useState } from "react";
import { QueryAPI } from "../../api/query/QueryAPI";
import { StorageAPI } from "../../api/storage/StorageAPI";
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


const queryAPI = new QueryAPI();
const storageAPI = new StorageAPI();

export default function Statistics() {

    const testData: DistributionDTO = {notifications: 35, warnings: 35, errors: 30};

    const testEvent: EventStatisticsDTO[] = [
    { date: "10/12", count: 10 },
    { date: "11/12", count: 15 },
    { date: "12/12", count: 7 },
    { date: "13/12", count: 12 },
    { date: "14/12", count: 9 }
    ];

    const testAlert: AlertStatisticsDTO[] = [
    { date: "10/12", count: 8 },
    { date: "11/12", count: 5 },
    { date: "12/12", count: 13 },
    { date: "13/12", count: 7 },
    { date: "14/12", count: 6 }
    ];

    const testTopArchives: TopArchiveDTO[] = [
    { id: 1, fileName: "logs_2025_12_14_22_00.tar", count: 120 },
    { id: 2, fileName: "auth_logs_2025_12_14.tar", count: 95 },
    { id: 3, fileName: "system_events_2025_12_13.tar", count: 78 },
    { id: 4, fileName: "app_errors_2025_12_12.tar", count: 54 },
    { id: 5, fileName: "network_2025_12_11.tar", count: 33 }
    ];

    const testArchiveVolume: ArchiveVolumeDTO[] = [
    { label: "10/12", size: 1024 }, 
    { label: "11/12", size: 850 },
    { label: "12/12", size: 1200 },
    { label: "13/12", size: 640 },
    { label: "14/12", size: 980 }
    ];

    const {token} = useAuth();

    const [archiveType, setArchiveType] = useState<"events" | "alerts">("events");
    const [volumePeriod, setVolumePeriod] = useState<"daily" | "monthly" | "yearly">("daily");

    const [eventStats, setEventStats] = useState<EventStatisticsDTO[]>([]);
    const [alertStats, setAlertStats] = useState<AlertStatisticsDTO[]>([]);
    const [distribution, setDistribution] = useState<DistributionDTO | null>(null);
    const [topArchives, setToparchives] = useState<TopArchiveDTO[]>([]);
    const [archiveVolume, setArchiveVolume] = useState<ArchiveVolumeDTO[]>([]);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if(!token) return;

            setIsLoading(true);

            try{
                const [
                    eventsData, 
                    alertsData, 
                    distributionData,
                    topArchivesData,
                    volumeData
                ] = await Promise.all([
                    queryAPI.getEventStatistics(token), 
                    queryAPI.getAlertStatistics(token), 
                    queryAPI.getEventDistribution(token),
                    storageAPI.getTopArchives(archiveType, 5, token),
                    storageAPI.getArchiveVolume(volumePeriod, token)
                ]);

                setEventStats(eventsData);
                setAlertStats(alertsData);
                setDistribution(distributionData);
                setToparchives(topArchivesData);
                setArchiveVolume(volumeData);

            } catch (error){
                console.error(error);
            } finally{
                setIsLoading(false);
            }
        };

        fetchData();
    }, [token, archiveType, volumePeriod]);

    const rectangleStyle: React.CSSProperties = {
        backgroundColor: "transparent",
        border: "2px solid #d0d0d0",
        borderRadius: "14px",
        borderColor: "#d0d0d0",
        padding: "10px",
        marginBottom: "20px"
    };

    const headingStyle: React.CSSProperties = {
        marginTop: "10px",
        padding: "5px",
        margin: "10px"
    };

    const sectionStyle: React.CSSProperties = {
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        gap: "20px",
        width: "100%",
        padding: "10px"
    };
/*
    if (isLoading){
        return (
            <div style={rectangleStyle}>
                <h3 style={headingStyle}>Loading statistics...</h3>
            </div>
        );
    }
*/
    return (
        <div>

            <div style={rectangleStyle}>
                <h3 style={headingStyle}>Statistics</h3>
                <StatisticsChart
                    eventData={testEvent}
                    alertData={testAlert}/>
            </div>

            <div style={sectionStyle}>
                <div style={{flex: 1, ...rectangleStyle}}>
                    <h3 style={headingStyle}>Event Distribution</h3>
                    <EventDistribution data={testData}/>
                </div>

                <div style={{flex: 1, ...rectangleStyle}}>
                    <h3 style={headingStyle}> Top 5 Archives</h3>
                    <TopArchives
                        data={testTopArchives}
                        type={archiveType}
                        onTypeChange={setArchiveType}/>
                </div>
            </div>

            <div>
                <h3 style={headingStyle}>Daily Archive Volume (in MB)</h3>
                <ArchiveVolume
                    data={testArchiveVolume}
                    period={volumePeriod}
                    onPeriodChange={setVolumePeriod}/>
            </div>
        </div>
    );
}