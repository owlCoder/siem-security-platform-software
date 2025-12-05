interface EventRow {
    id: string;
    time: string;
    type: "Info" | "Warning" | "Error";
}

// Inline styles for now, will be in CSS later
// types, interfaces and classes will be moved too

export default function RecentEventsTable({ events }: { events: EventRow[] }) {
    const containerStyle: React.CSSProperties = {
        background: "#1f1f1f",
        borderRadius: "14px",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
        marginTop: "12px",
        border: "1px solid #333",
        margin:"10px"
    };

    const tableStyle: React.CSSProperties = {
        width: "100%",
        borderCollapse: "collapse",
        fontFamily: "Segoe UI, sans-serif",
        fontSize: "14px",
    };

    const theadStyle: React.CSSProperties = {
        background: "#2a2a2a",
    };

    const thStyle: React.CSSProperties = {
        padding: "12px 16px",
        textAlign: "left",
        color: "#d0d0d0",
        fontWeight: 600,
        fontSize: "14px",
        borderBottom: "1px solid #3a3a3a",
    };

    const tdStyle: React.CSSProperties = {
        padding: "12px 16px",
        borderBottom: "1px solid #2d2d2d",
        color: "#dcdcdc",
    };

    const eventIdStyle: React.CSSProperties = {
        ...tdStyle,
        fontFamily: "Consolas, 'Courier New', monospace",
        fontSize: "13px",
        color: "#b5b5b5",
    };

    const badgeBase: React.CSSProperties = {
        padding: "5px 10px",
        borderRadius: "10px",
        fontSize: "12px",
        fontWeight: 600,
    };

    const badgeColors: Record<string, React.CSSProperties> = {
        Info: {
            background: "rgba(59, 130, 246, 0.15)",
            color: "#60a5fa",
            border: "1px solid rgba(59, 130, 246, 0.3)",
        },
        Warning: {
            background: "rgba(234, 179, 8, 0.15)",
            color: "#facc15",
            border: "1px solid rgba(234, 179, 8, 0.3)",
        },
        Error: {
            background: "rgba(239, 68, 68, 0.15)",
            color: "#f87171",
            border: "1px solid rgba(239, 68, 68, 0.3)",
        },
    };

    return (
        <div style={containerStyle}>
            <table style={tableStyle}>
                <thead style={theadStyle}>
                    <tr>
                        <th style={thStyle}>Event ID</th>
                        <th style={thStyle}>Time</th>
                        <th style={thStyle}>Type</th>
                    </tr>
                </thead>

                <tbody>
                    {events.map((e, index) => (
                        <tr key={index}>
                            <td style={eventIdStyle}>{e.id}</td>
                            <td style={tdStyle}>{e.time}</td>
                            <td style={tdStyle}>
                                <span style={{ ...badgeBase, ...badgeColors[e.type] }}>
                                    {e.type}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
