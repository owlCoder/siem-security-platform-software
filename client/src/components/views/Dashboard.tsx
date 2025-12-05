import StatCard from "../stat_card/StatCard";
import { BsDatabase } from "react-icons/bs";
import { BiError } from "react-icons/bi";
import { PiShieldWarningBold } from "react-icons/pi";
import { IoShieldCheckmark } from "react-icons/io5";
import RecentEventsTable from "../tables/RecentEventsTable";

export default function Dashboard() {

    // Inline styles for now, will be in CSS later
    // types, interfaces and classes will be moved too
    const dashboardRectangleStyle: React.CSSProperties = {
        border: "2px solid #d0d0d0",
        backgroundColor: "transparent",
        borderRadius: "14px",
        borderColor: "#d0d0d0",

    }
    const dashboardDiv: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '20px',
        height: '20%',
        width: '100%',
        padding:"10px"
    };

    interface EventRow {
        id: string;
        time: string;
        type: "Info" | "Warning" | "Error";
    }

    const events: EventRow[] = [
        { id: "d66bc2ea-13ef-4a18-9ed0-b8038ef21b32", time: "01:23:33   22/11/2025", type: "Info" },
        { id: "51ac7386-394d-474e-b1f3-fb337c72e2b0", time: "01:25:49   22/11/2025", type: "Warning" },
        { id: "7fa98056-2dd3-4fbe-8e7c-2bb3ad892f45", time: "21:03:11   20/11/2025", type: "Error" }
    ];

    return (
        <div style={dashboardRectangleStyle}>
            <h3 style={{ marginTop: '3px', padding:"5px", margin: "10px" }}>Analytics</h3>
            <div style={dashboardDiv}>
                <StatCard title="Total Raw Events" value={1800} icon={<BsDatabase />} iconColor="black" />
                <StatCard title="Errors" value={33} icon={<BiError />} iconColor="red" />
                <StatCard title="Warnings" value={123} icon={<PiShieldWarningBold />} iconColor="yellow" />
                <StatCard title="Notifications" value={2000} icon={<IoShieldCheckmark />} iconColor="blue" />
            </div>
            <h3 style={{ marginTop: '10px' , padding:"5px" , margin: "10px"  }}>Short review</h3>
            <div style={dashboardDiv}>
                <StatCard title="Top Event Source" subtitle="Auth Service" value={44} valueDescription="events" />
                <StatCard title="Most Event Type" subtitle="Info" value={200} valueDescription="events" />
                <StatCard title="Most weight archive" subtitle="logs_2025_11_06_22_00.tar" value={100} valueDescription="MB" />
            </div>
            <h3 style={{ marginTop: '10px' , padding:"5px", margin: "10px"  }}>Recent Events</h3>
            <RecentEventsTable events={events} />
        </div>
    );
};