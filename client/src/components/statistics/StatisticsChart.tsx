import { useState } from "react";
import { AlertStatisticsDTO } from "../../models/query/AlertStatisticsDTO";
import { EventStatisticsDTO } from "../../models/query/EventStatisticsDTO"
import { Line, LineChart, ResponsiveContainer } from "recharts";

type StatisticsChartProps = {
    eventData: EventStatisticsDTO[];
    alertData: AlertStatisticsDTO[];
}

export default function StatisticsChart({eventData, alertData}: StatisticsChartProps) {
    const [showEvents, setShowEvents] = useState(true);
    const [showAlerts, setShowAlerts] = useState(true);

    const combinedData = eventData.map((event, index) => ({
        date: event.date,
        events: event.count,
        alerts: alertData[index]?.count || 0,
    }));

    return(
        <div style={{width: "100%", height: 350}}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={combinedData}>
                        {showEvents && (
                            <Line
                                type="monotone"
                                dataKey="events"
                                stroke="#8b0000"
                            />
                        )}
                        {showAlerts && (
                            <Line
                                type="monotone"
                                dataKey="alerts"
                                stroke="#6e008a"
                            />
                        )}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}