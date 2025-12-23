import StatCard from "../stat_card/StatCard";
import { BsDatabase } from "react-icons/bs";
import { BiError } from "react-icons/bi";
import { PiShieldWarningBold } from "react-icons/pi";
import { IoShieldCheckmark } from "react-icons/io5";
import RecentEventsTable from "../tables/RecentEventsTable";
import { useEffect, useState } from "react";
import { QueryAPI } from "../../api/query/QueryAPI";
import { useAuth } from "../../hooks/useAuthHook";
import { EventRow } from "../../types/events/EventRow";


export default function Dashboard() {
    /* const events: EventRow[] = [
         { id: 1, source: "Auth Service", time: "01:23:33   22/11/2025", type: EventType.INFO, description: "User login successful" },
         { id: 2, source: "Auth Service", time: "01:25:49   22/11/2025", type: EventType.WARNING, description: "Multiple failed login attempts" },
         { id: 3, source: "Database", time: "21:03:11   20/11/2025", type: EventType.ERROR, description: "Database connection lost" },
     ];*/
    const [eventsData, setEventsData] = useState<EventRow[]>([]);
    const [allEventsCount, setEventCount] = useState<number>(0);
    const [infoCount, setInfoCount] = useState<number>(0);
    const [warningCount, setWarningCount] = useState<number>(0);
    const [errorCount, setErrorCount] = useState<number>(0);
    //const { token } = useAuth();
    const token = "token";      // TODO: DELETE AFTER TESTING!

    // Inline styles for now, will be in CSS later
    // types, interfaces and classes will be moved too
    const dashboardRectangleStyle: React.CSSProperties = {
        border: "2px solid #282A28",
        backgroundColor: "transparent",
        borderRadius: "14px",
        borderColor: "#282A28",

    }
    const dashboardDiv: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '20px',
        height: '20%',
        width: '100%',
        padding: "10px"
    };

    useEffect(() => {
        const fetchData = async () => {
            //if (!token) return;           // TODO: DELETE COMMENT AFTER TESTING
            const api = new QueryAPI();
            try {
                const recentEvents = await api.getLastThreeEvents(token);
                const mappedEvents: EventRow[] = recentEvents.map(event => ({
                    id: event.id,
                    source: event.source,
                    time: new Date(event.timestamp).toLocaleString(),
                    type: event.type,
                    description: event.description
                }));
                setEventsData(mappedEvents);
                const allEventsCount = await api.getEventsCount(token);
                setEventCount(allEventsCount);

                const infoCount = await api.getInfoCount(token);
                setInfoCount(infoCount);
                const warningCount = await api.getWarningCount(token);
                setWarningCount(warningCount);
                const errorCount = await api.getErrorCount(token);
                setErrorCount(errorCount);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [token]);

    return (
        <div style={dashboardRectangleStyle}>
            <h2 style={{ marginTop: '3px', padding: "5px", margin: "10px" }}>Analytics</h2>
            <div style={dashboardDiv}>
                <StatCard title="Total Raw Events" value={allEventsCount} icon={<BsDatabase />} iconColor="black" />
                <StatCard title="Errors" value={errorCount} icon={<BiError />} iconColor="red" />
                <StatCard title="Warnings" value={warningCount} icon={<PiShieldWarningBold />} iconColor="yellow" />
                <StatCard title="Notifications" value={infoCount} icon={<IoShieldCheckmark />} iconColor="blue" />
            </div>
            <h2 style={{ marginTop: '10px', padding: "5px", margin: "10px" }}>Short review</h2>
            <div style={dashboardDiv}>
                <StatCard title="Top Event Source" subtitle="Auth Service" value={44} valueDescription="events" />
                <StatCard title="Most Event Type" subtitle="Info" value={200} valueDescription="events" />
                <StatCard title="Most weight archive" subtitle="logs_2025_11_06_22_00.tar" value={100} valueDescription="MB" />
            </div>
            <h2 style={{ marginTop: '10px', padding: "5px", margin: "10px" }}>Recent Events</h2>
            <RecentEventsTable events={eventsData} />
        </div>
    );
};
