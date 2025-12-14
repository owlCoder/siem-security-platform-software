import { useEffect, useState } from "react";
import { QueryAPI } from "../../api/query/QueryAPI";
import { StorageAPI } from "../../api/storage/StorageAPI";
import { useAuth } from "../../hooks/useAuthHook";
import { EventStatisticsDTO } from "../../models/query/EventStatisticsDTO";
import { AlertStatisticsDTO } from "../../models/query/AlertStatisticsDTO";
import { DistributionDTO } from "../../models/query/DistributionDTO";
import { TopArchiveDTO } from "../../models/storage/TopArchiveDTO";
import { ArchiveVolumeDTO } from "../../models/storage/ArchiveVolumeDTO";

import {StatisticsChart} from "../statistics/StatisticsChart";
import {EventDistribution} from "../statistics/EventDistribution";
import {TopArchives} from "../statistics/TopArchives";
import {ArchiveVolume} from "../statistics/ArchiveVolume";

const queryAPI = new QueryAPI();
const storageAPI = new StorageAPI();

export default function Statistics() {
    const {token} = useAuth();

    const [archiveType, setArchiveType] = useState<"events" | "alerts">("events");
    const [volumePeriod, setVolumePeriod] = useState<"daily" | "monthly" | "yearly">("daily");

    const [eventStats, setEventStats] = useState<EventStatisticsDTO[]>([]);
    const [alertStats, setAlertStats] = useState<AlertStatisticsDTO[]>([]);
    const [distribution, setDistribution] = useState<DistributionDTO | null>(null);
    const [topArchives, setToparchives] = useState<TopArchiveDTO[]>([]);
    const [arhiveVolume, setArchiveVolume] = useState<ArchiveVolumeDTO[]>([]);

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

    if (isLoading){
        return (
            <div style={rectangleStyle}>
                <h3 style={headingStyle}>Loading statistics...</h3>
            </div>
        );
    }

    return (
        <div style={rectangleStyle}>
            <div>
                <h3 style={headingStyle}>Statistics</h3>
                <StatisticsChart/>
            </div>

            <div style={sectionStyle}>
                <div>
                    <h3 style={headingStyle}>Event Distribution</h3>
                    <EventDistribution/>
                </div>

                <div>
                    <h3 style={headingStyle}> Top 5 Archives</h3>
                    <TopArchives/>
                </div>
            </div>

            <div>
                <h3 style={headingStyle}>Daily Archive Volume (in MB)</h3>
                <ArchiveVolume/>
            </div>
        </div>
    );
}